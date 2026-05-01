import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

def _get_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set in .env")
    return genai.Client(api_key=api_key, http_options=types.HttpOptions(timeout=60000))


def analyze_with_ai(resume_text: str, job_description: str, missing_skills: list) -> dict:
    try:
        client = _get_client()
    except ValueError as e:
        return {"error": str(e)}

    missing_str = ", ".join(missing_skills[:10]) if missing_skills else "none"
    prompt = f"""
You are a senior technical recruiter and resume coach with 10+ years of experience.
Analyze this resume against the job description and give highly specific, actionable feedback.

RESUME:
{resume_text[:3000]}

JOB DESCRIPTION:
{job_description[:2000]}

MISSING SKILLS: {missing_str}

Respond in this exact JSON format (no markdown, pure JSON):
{{
  "overall_fit": "Strong or Moderate or Weak",
  "fit_summary": "2-3 sentences on how well this candidate fits this specific role",
  "strengths": [
    "Specific strength from the resume relevant to this job",
    "Another specific strength",
    "Third strength"
  ],
  "improvement_suggestions": [
    "Specific actionable improvement — e.g. 'Add quantified metrics to your internship bullet points'",
    "Another specific suggestion",
    "Third suggestion"
  ],
  "bullet_rewrites": [
    {{
      "original": "exact bullet point from resume that could be improved",
      "improved": "rewritten version with stronger action verb, metrics, and impact"
    }},
    {{
      "original": "another weak bullet point",
      "improved": "stronger rewrite"
    }}
  ],
  "resume_tips": [
    "Specific formatting or content tip for this resume",
    "Another tip",
    "Third tip"
  ],
  "red_flags": [],
  "recommended_roles": ["Role title 1", "Role title 2", "Role title 3"]
}}
"""
    try:
        response = client.models.generate_content(model="gemini-2.0-flash-lite", contents=prompt)
        raw = response.text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw.strip())
    except Exception as e:
        return {"error": f"AI analysis unavailable: {str(e)[:120]}"}


def generate_cover_letter(resume_text: str, job_description: str) -> str:
    try:
        client = _get_client()
        prompt = f"""
Write a professional, tailored cover letter (3 paragraphs) for this job.
- Paragraph 1: Strong opening, mention the specific role and your top relevant qualification
- Paragraph 2: 2-3 specific achievements from the resume that match the job requirements
- Paragraph 3: Closing with enthusiasm and call to action
Use "I" perspective. No placeholders. Be specific, not generic.

RESUME:
{resume_text[:2000]}

JOB DESCRIPTION:
{job_description[:1500]}

Output only the cover letter text, no subject line or headers.
"""
        response = client.models.generate_content(model="gemini-2.0-flash-lite", contents=prompt)
        return response.text.strip()
    except Exception as e:
        return f"Cover letter generation failed: {str(e)[:120]}"
