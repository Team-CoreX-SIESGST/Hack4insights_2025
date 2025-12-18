

## 📂 File Structure & Responsibilities

| File | Responsibility |
| --- | --- |
| **`main.py`** | The entry point. Initializes FastAPI, manages CORS, and aggregates routers. |
| **`architect_endpoints.py`** | Handles the logic for generating AI recommendations using Gemini. |
| **`execution_endpoints.py`** | The endpoint that receives cleaning instructions and saves cleaned files to disk. |
| **`executioner.py`** | Contains the `DataExecutioner` class; the "engine" that modifies DataFrames. |
| **`gemini_service.py`** | Manages communication with Google Gemini, including model fallback and error handling. |
| **`.env`** | (Local Only) Stores your `GEMINI_API_KEY`. |

---

### 1. Install Dependencies

Ensure you have Python installed, then run:

```bash
pip install fastapi uvicorn pandas openpyxl python-dotenv google-generativeai

```

### 2. Configure Environment

Create a `.env` file in the root directory:

```text
GEMINI_API_KEY=your_actual_key_here

```

### 3. Start the Server

Run the following command in your terminal from the `backend` folder:

```bash
uvicorn main:app --reload

```

The server will start at `http://127.0.0.1:8000`.

---

## 🧪 Postman API Testing

### 1. Get AI Recommendations

Analyzes your files and returns a "cleaning map" of suggestions.

* **Method:** `POST`
* **URL:** `http://127.0.0.1:8000/get-architect-recommendations`
* **Body (form-data):**
* `files`: Upload your CSV or Excel file(s).
* `gemini_key`: (Optional) Provide a key here if not set in `.env`.



### 2. Apply Cleaning

Executes the approved cleaning actions and saves files to the `CleanedData/` folder.

* **Method:** `POST`
* **URL:** `http://127.0.0.1:8000/apply-cleaning`
* **Body (form-data):**
* `files`: Upload the same original files.
* `approved_map`: (Text) Paste the JSON instructions.



**Example `approved_map` JSON:**

```json
{
  "orders": {
    "user_id": {
      "action": "fill_constant",
      "replacement_value": 0
    },
    "price_usd": {
      "action": "impute_mean"
    }
  }
}

```

---

## 🛠 Troubleshooting

* **Missing Files:** If you don't see the `CleanedData` folder after a successful "Apply Cleaning" call, ensure the Python script has write permissions in your directory.
* **Authentication:** If pushing to GitHub fails, remember to use your **Personal Access Token (PAT)** as the password.

---
