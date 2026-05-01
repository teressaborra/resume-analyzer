from sentence_transformers import SentenceTransformer, util
import re

_embed_model = None

def get_embed_model():
    global _embed_model
    if _embed_model is None:
        _embed_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _embed_model


def semantic_similarity(text1: str, text2: str) -> float:
    model = get_embed_model()
    emb1 = model.encode(text1[:512], convert_to_tensor=True)
    emb2 = model.encode(text2[:512], convert_to_tensor=True)
    return round(util.cos_sim(emb1, emb2).item() * 100, 2)


def compute_skill_overlap(resume_skills: list, job_skills: list) -> dict:
    """Fast string-based skill matching using curated taxonomy."""
    if not job_skills:
        return {"score": 0, "matched": [], "missing": []}

    matched, missing = [], []
    for jskill in job_skills:
        if any(jskill in rs or rs in jskill for rs in resume_skills):
            matched.append(jskill)
        else:
            missing.append(jskill)

    score = round((len(matched) / len(job_skills)) * 100, 2)
    return {"score": score, "matched": matched, "missing": missing}


def compute_experience_years(text: str) -> int:
    matches = re.findall(r"(\d+)\+?\s*years?", text.lower())
    return max((int(m) for m in matches), default=0)
