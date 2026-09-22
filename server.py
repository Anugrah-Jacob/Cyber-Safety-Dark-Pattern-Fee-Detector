import os
import json
import urllib.parse
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY) if API_KEY else None

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
        domain = urllib.parse.urlparse(payload.url).netloc.replace("www.", "")

        # Mock/Lookups for Web Trust Rating & Safety Breach history
        # (In production, replace with Google Safe Browsing / HaveIBeenPwned APIs)
        breach_database = {
            "adobe.com": {"breached": True, "details": "Historical data breach reported (2013)."},
            "canva.com": {"breached": True, "details": "Data breach reported in 2019."},
            "test-breached-store.com": {"breached": True, "details": "Multiple user reports of compromised credentials."}
        }

        breach_info = breach_database.get(domain, {"breached": False, "details": "No known major public breaches detected for this domain."})

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
            "severity": "HIGH",
            "trust_rating": 85
        }}
        """

        parsed_result = {"is_dark_pattern": False, "category": "None", "explanation": "Clean page.", "severity": "LOW", "trust_rating": 95}

        if client:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
            )
            raw_text = response.text.replace("```json", "").replace("```", "").strip()
            parsed_result = json.loads(raw_text)

        parsed_result["breach_status"] = breach_info
        parsed_result["domain"] = domain

        return {"status": "success", "data": parsed_result}

    except Exception as e:
        print(f"Error during AI analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)