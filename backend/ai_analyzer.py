import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

def _get_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set in .env")
    return genai.Client(api_key=api_key)


def analyze_with_ai(resume_text: str, job_description: str, missing_skills: list) -> dict:
    try:
        client = _get_client()
    except ValueError as e:
        return {"error": str(e)}

    missing_str = ", ".join(missing_skills) if missing_skills else "none"
    prompt = f"""
You are an expert resume coach and technical recruiter.
Analyze the resume against the job description and provide structured feedback.

RESUME:
{resume_text[:3000]}

JOB DESCRIPTION:
{job_description[:2000]}

MISSING SKILLS: {missing_str}

Respond in this exact JSON format (no markdown, pure JSON):
{{
  "overall_fit": "Strong or Moderate or Weak",
  "fit_summary": "2-3 sentence summary",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvement_suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "resume_tips": ["tip 1", "tip 2", "tip 3"],
  "red_flags": [],
  "recommended_roles": ["role 1", "role 2"]
}}
"""
    try:
        response = client.models.generate_content(model="gemini-1.5-flash", contents=prompt)
        raw = response.text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw.strip())
    except Exception as e:
        # AI failed but don't crash the whole request
        return {"error": f"AI analysis unavailable: {str(e)[:100]}"}


def generate_cover_letter(resume_text: str, job_description: str) -> str:
    try:
        client = _get_client()
        prompt = f"""
Write a professional, concise cover letter (3 paragraphs) tailored to this job description.
Use details from the resume. Use "I" perspective, no placeholders.

RESUME:
{resume_text[:2000]}

JOB DESCRIPTION:
{job_description[:1500]}

Output only the cover letter text.
"""
        response = client.models.generate_content(model="gemini-1.5-flash", contents=prompt)
        return response.text.strip()
    except Exception as e:
        return f"Cover letter generation failed: {str(e)[:100]}"
