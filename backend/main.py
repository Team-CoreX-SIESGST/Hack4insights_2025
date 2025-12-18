import pandas as pd
import os
import io
from fastapi import FastAPI, UploadFile, File, HTTPException
from typing import List, Dict, Any
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Maven Data Profiler API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
from architect_endpoints import router as architect_router
from execution_endpoints import router as execution_router
app.include_router(architect_router)
app.include_router(execution_router)

class MavenDataProfiler:
    def __init__(self, data_frames: Dict[str, pd.DataFrame]):
        self.data_frames = data_frames

    def generate_health_report(self) -> Dict[str, Any]:
        report = {
            "project": "ProjectX",
            "summary": {"total_tables": len(self.data_frames)},
            "details": []
        }
        for table_name, df in self.data_frames.items():
            report["details"].append(self._analyze_table(table_name, df))
        return report

    def _analyze_table(self, name: str, df: pd.DataFrame) -> Dict[str, Any]:
        total_rows = len(df)
        column_health = {}
        for col in df.columns:
            null_val = int(df[col].isnull().sum())
            null_percent = round((null_val / total_rows) * 100, 2) if total_rows > 0 else 0
            column_health[col] = {
                "inferred_intent": self._get_intent(col),
                "data_type": str(df[col].dtype),
                "null_count": null_val,
                "null_percentage": f"{null_percent}%",
                "sample_data": df[col].dropna().unique()[:3].tolist()
            }
        return {"table_name": name, "total_records": total_rows, "columns": column_health}

    def _get_intent(self, column_name: str) -> str:
        """Contextual mapping for the LLM."""
        intent_map = {
            "website_session_id": "Primary Relational Key: Links pageviews and sessions.",
            "utm_source": "Marketing Source: Traffic origin. Nulls usually mean 'Direct'.",
            "price_usd": "Financial Metric: Selling price. Must be non-null for orders.",
            "created_at": "Temporal: Event timestamp."
        }
        return intent_map.get(column_name.lower(), "General Attribute")

class LLMPromptGenerator:
    @staticmethod
    def generate_architect_prompt(health_report: Dict[str, Any]) -> str:
        """Constructs the system architect prompt for Gemini."""
        prompt = "### ROLE: Senior Data Engineer\n### OBJECTIVE: Recommend data cleaning strategies.\n"
        for table in health_report['details']:
            prompt += f"\nTABLE: {table['table_name']}\n"
            for col, info in table['columns'].items():
                if info['null_count'] > 0:
                    prompt += f" - {col}: {info['null_percentage']} nulls | Intent: {info['inferred_intent']}\n"
        
        prompt += ("\n### OUTPUT FORMAT (JSON ONLY):\n"
                   "Return a JSON object where keys are table names. Each value is a dict of columns "
                   "mapping to {'cleaning_action': '...', 'replacement_value': '...', 'reasoning': '...'}")
        return prompt