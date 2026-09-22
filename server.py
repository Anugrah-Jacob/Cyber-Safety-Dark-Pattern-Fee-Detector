import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY or API_KEY == "YOUR_ACTUAL_GEMINI_API_KEY":
    print("WARNING: GEMINI_API_KEY is missing or unconfigured in .env!")

# Initialize Google GenAI Client
client = genai.Client(api_key=API_KEY)

app = FastAPI(title="Dark Pattern Backend Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "OPTIONS", "GET"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    url: str
    dom_text: str

@app.get("/")
def home():
    return {"status": "Dark Pattern Engine Live"}

@app.post("/api/v1/scan")
async def scan_dark_pattern(payload: ScanRequest):
    try:
        prompt = f"""
        You are an expert cybersecurity auditor analyzing a webpage for Deceptive UI / Dark Patterns.
        Analyze the provided URL and DOM text snippet for:
        1. Pre-checked checkboxes adding recurring fees or insurance.
        2. Confirmshaming text on opt-out buttons (e.g. "No thanks, I hate saving").
        3. Hidden fees or recurring subscriptions.

        URL: {payload.url}
        DOM Text Snippet: {payload.dom_text[:1200]}

        Respond ONLY in raw JSON format (no markdown formatting or code blocks):
        {{
            "is_dark_pattern": true,
            "category": "Sneak into Basket / Confirmshaming / Hidden Fees",
            "explanation": "Short clear summary of the trap",
            "severity": "HIGH"
        }}
        """

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )

        raw_text = response.text.replace("```json", "").replace("```", "").strip()
        parsed_result = json.loads(raw_text)

        return {"status": "success", "data": parsed_result}

    except Exception as e:
        print(f"Error during AI analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
