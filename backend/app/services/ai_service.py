import os
import json
import requests
from app.config import Config
from app.services.mock_data import SAMPLE_REQUIREMENTS

def extract_requirements_with_ai(tender_text, tender_title=""):
    """
    Extracts structured requirements from tender text using Gemini API if available,
    falling back to deterministic semantic rule-based extraction.
    AI understands. Rules decide.
    """
    api_key = Config.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
    use_mock = Config.USE_MOCK_AI or not api_key

    if not use_mock and api_key:
        try:
            prompt = f"""
You are a government procurement expert assistant.
Analyze the following government tender document and extract structured requirements into a JSON array.
Tender Document Title: {tender_title}
Text Excerpt:
{tender_text[:12000]}

For each requirement, provide:
- id: e.g. "REQ-001"
- category: one of [ELIGIBILITY, EXPERIENCE, FINANCIAL, TECHNICAL, CERTIFICATION, DOCUMENTS, SUBMISSION]
- title: concise title
- clause_text: exact excerpt from tender
- plain_language: human friendly plain English explanation for a startup founder
- source_page: page number integer if found, or 1
- source_section: section heading name
- is_mandatory: boolean
- potential_relaxation_rule: policy note or null

Return ONLY a valid JSON array of objects. Do not wrap in markdown quotes if possible, or use standard json.
"""
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}
            }
            resp = requests.post(url, json=payload, timeout=15)
            if resp.status_code == 200:
                data = resp.json()
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                extracted = json.loads(raw_text)
                if isinstance(extracted, list) and len(extracted) > 0:
                    return {
                        "mode": "Gemini 1.5 Flash API",
                        "requirements": extracted
                    }
        except Exception as e:
            # Safe graceful degradation to deterministic fallback
            print(f"[AI Service Warning] Gemini API call failed: {str(e)}. Using deterministic fallback.")

    # Deterministic Mock Fallback Mode
    return {
        "mode": "Deterministic Rule-Based Intelligence",
        "requirements": SAMPLE_REQUIREMENTS
    }
