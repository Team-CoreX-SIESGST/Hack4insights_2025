from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Dict, Any, Optional
import pandas as pd
import io

router = APIRouter()

@router.post("/get-architect-recommendations")
async def get_recommendations(
    files: List[UploadFile] = File(...),
    gemini_key: Optional[str] = Form(None)
):
    """
    Profiles the uploaded files, generates the System Architect prompt,
    and calls Gemini to obtain a JSON cleaning map.
    """
    data_frames: Dict[str, pd.DataFrame] = {}

    for file in files:
        contents = await file.read()
        try:
            if file.filename.endswith('.csv'):
                df = pd.read_csv(io.BytesIO(contents))
            elif file.filename.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(io.BytesIO(contents))
            else:
                continue

            table_name = file.filename.rsplit('.', 1)[0]
            data_frames[table_name] = df
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing {file.filename}: {str(e)}")

    if not data_frames:
        raise HTTPException(status_code=400, detail="No valid data files uploaded.")

    # Local imports to avoid circular dependencies with main.py
    from main import MavenDataProfiler, LLMPromptGenerator
    from gemini_service import GeminiArchitectService

    profiler = MavenDataProfiler(data_frames)
    health_report = profiler.generate_health_report()

    prompt_gen = LLMPromptGenerator()
    architect_prompt = prompt_gen.generate_architect_prompt(health_report)

    gemini_service = GeminiArchitectService(api_key=gemini_key)
    recommendations = await gemini_service.get_cleaning_recommendations(architect_prompt)

    def normalize(recs, hr):
        """Standardizes LLM output into frontend-friendly objects."""
        if isinstance(recs, list):
            return recs

        normalized = []
        if isinstance(recs, dict):
            null_lookup = {}
            for table in hr.get('details', []):
                tname = table.get('table_name')
                cols = table.get('columns', {})
                for col, info in cols.items():
                    # Extract numeric percentage for the frontend
                    null_lookup[f"{tname}.{col}"] = float(info.get('null_percentage', '0').strip('%') or 0)

            for table_name, cols in recs.items():
                if not isinstance(cols, dict): continue
                for col_name, info in cols.items():
                    rid = f"{table_name}.{col_name}"
                    # Support both 'action' and 'cleaning_action' keys from LLM
                    rec_type = info.get('action') or info.get('cleaning_action') or 'fill_constant'
                    replacement = info.get('replacement_value') or info.get('value')
                    
                    normalized.append({
                        'id': rid,
                        'table_name': table_name,
                        'column_name': col_name,
                        'null_percentage': null_lookup.get(rid, 0.0),
                        'recommendation_type': rec_type,
                        'replacement_value': replacement,
                        'reasoning': info.get('reasoning') or info.get('explanation') or ''
                    })
        return normalized

    return {
        "status": "success",
        "health_summary": health_report,
        "cleaning_map": normalize(recommendations, health_report)
    }