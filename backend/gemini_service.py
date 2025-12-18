import json
import os
import asyncio
import time
from typing import Dict, Any, Optional

try:
    import google.generativeai as genai
except Exception:
    genai = None

class GeminiArchitectService:
    def __init__(self, api_key: Optional[str] = None):
        if genai is None:
            raise RuntimeError("google-generativeai is not installed. Run: pip install google-generativeai")

        key = api_key or os.environ.get('GEMINI_API_KEY')
        if not key:
            raise RuntimeError("No Gemini API key provided.")

        genai.configure(api_key=key)
        
        # We define a list of models to try. If the first fails with quota 0, we move to the next.
        self.candidate_models = [
    'gemini-3-flash-preview', # The newest high-performance model
    'gemini-2.5-flash',       # The current stable workhorse
    'gemini-2.0-flash'        # If 2.5 is not available in your region
]
        self.current_model_idx = 0
        self._setup_model()

    def _setup_model(self):
        """Initializes the model based on the current candidate index."""
        model_name = self.candidate_models[self.current_model_idx]
        self.model = genai.GenerativeModel(model_name)
        self.model_name = model_name

    async def get_cleaning_recommendations(self, prompt: str, retries: int = 2) -> Dict[str, Any]:
        """
        Sends prompt to Gemini with automatic fallback if 'limit 0' or quota errors occur.
        """
        for attempt in range(retries + 1):
            try:
                # Attempt to call Gemini

                def sync_call():
                    # Enforce JSON output for structured cleaning maps
                    return self.model.generate_content(
                        prompt,
                        generation_config={"response_mime_type": "application/json"}
                    )

                response = await asyncio.to_thread(sync_call)
                text = response.text
                # raw response text available in `text`
                return json.loads(text)

            except Exception as e:
                error_msg = str(e)
                # Check for the specific "Limit: 0" or "Quota exceeded" error
                if "429" in error_msg or "quota" in error_msg.lower():
                    # If we have another model to try (e.g., fallback from 2.0 to 1.5)
                    if self.current_model_idx < len(self.candidate_models) - 1:
                        self.current_model_idx += 1
                        self._setup_model()
                        continue # Retry immediately with the new model
                    # If we are already on the last model, wait briefly before final retry
                    if attempt < retries:
                        wait_time = (attempt + 1) * 2
                        await asyncio.sleep(wait_time)
                        continue

                # Return structured error for caller to handle
                return {"status": "error", "message": f"Gemini API Error: {error_msg}"}