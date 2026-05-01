from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import traceback

from resume_parser import extract_text_from_pdf, extract_sections, extract_contact_info
from matcher import semantic_similarity, extract_skills_spacy, compute_skill_overlap, compute_experience_years
from ai_analyzer import analyze_with_ai, generate_cover_letter
from database import save_analysis, get_all_analyses, get_analysis_by_id

app = FastAPI(title="AI Resume Analyzer", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/analyze")
async def analyze(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    try:
        pdf_bytes = await resume.read()
        resume_text = extract_text_from_pdf(pdf_bytes)
        if not resume_text:
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")

        sections = extract_sections(resume_text)
        contact = extract_contact_info(resume_text)
        similarity_score = semantic_similarity(resume_text, job_description)

        resume_skills = extract_skills_spacy(sections["skills"] or resume_text)
        job_skills = extract_skills_spacy(job_description)
        skill_result = compute_skill_overlap(resume_skills, job_skills)

        years_exp = compute_experience_years(resume_text)
        overall_score = round((similarity_score * 0.4) + (skill_result["score"] * 0.6), 2)
        ai_feedback = analyze_with_ai(resume_text, job_description, skill_result["missing"])

        result = {
            "overall_score": overall_score,
            "semantic_similarity": similarity_score,
            "skill_match": skill_result,
            "years_of_experience": years_exp,
            "contact_info": contact,
            "sections_detected": {k: bool(v) for k, v in sections.items() if k != "full"},
            "ai_feedback": ai_feedback
        }

        record_id = await save_analysis(resume.filename, job_description, result)
        result["record_id"] = record_id
        return result

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/cover-letter")
async def cover_letter(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    try:
        pdf_bytes = await resume.read()
        resume_text = extract_text_from_pdf(pdf_bytes)
        letter = generate_cover_letter(resume_text, job_description)
        return {"cover_letter": letter}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/history")
async def history():
    return await get_all_analyses()


@app.get("/history/{analysis_id}")
async def history_detail(analysis_id: str):
    record = await get_analysis_by_id(analysis_id)
    if not record:
        raise HTTPException(status_code=404, detail="Not found")
    return record


@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0"}
