import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import pandas as pd
import io
import json
from typing import List
from executioner import DataExecutioner

router = APIRouter()

# Define where you want the cleaned files to be stored
OUTPUT_DIR = "./cleaned_data"
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

@router.post("/apply-cleaning")
async def apply_cleaning_endpoint(
    files: List[UploadFile] = File(...),
    approved_map: str = Form(...) 
):
    try:
        cleaning_instructions = json.loads(approved_map)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON in approved_map")

    data_frames = {}
    for file in files:
        contents = await file.read()
        table_name = file.filename.rsplit('.', 1)[0]
        if file.filename.endswith('.csv'):
            data_frames[table_name] = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith(('.xlsx', '.xls')):
            data_frames[table_name] = pd.read_excel(io.BytesIO(contents))

    # Apply the cleaning logic
    cleaned_dfs = DataExecutioner.apply_approved_cleaning(data_frames, cleaning_instructions)

    # NEW: Write the cleaned DataFrames to the directory
    saved_files = []
    for table_name, df in cleaned_dfs.items():
        file_path = os.path.join(OUTPUT_DIR, f"{table_name}_cleaned.csv")
        df.to_csv(file_path, index=False)
        saved_files.append(file_path)

    return {
        "status": "success", 
        "message": f"Successfully processed {len(cleaned_dfs)} tables.",
        "saved_to": saved_files  # Inform the user where the files are
    }