from sentence_transformers import SentenceTransformer, util
import spacy
import re

_embed_model = None
_nlp = None

def get_embed_model():
    global _embed_model
    if _embed_model is None:
        _embed_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _embed_model

def get_nlp():
    global _nlp
    if _nlp is None:
        try:
            _nlp = spacy.load("en_core_web_sm")
        except OSError:
            raise RuntimeError("Run: python -m spacy download en_core_web_sm")
    return _nlp


def semantic_similarity(text1: str, text2: str) -> float:
    """Encode truncated versions of both texts — fast and accurate enough."""
    model = get_embed_model()
    # Truncate to first 512 chars — model max is 256 tokens anyway
    emb1 = model.encode(text1[:512], convert_to_tensor=True)
    emb2 = model.encode(text2[:512], convert_to_tensor=True)
    return round(util.cos_sim(emb1, emb2).item() * 100, 2)


def extract_skills_spacy(text: str) -> list:
    """Extract skill candidates — limit input size to keep it fast."""
    nlp = get_nlp()
    # spaCy nlp() on huge text is slow — cap at 2000 chars
    doc = nlp(text[:2000].lower())
    candidates = set()
    for chunk in doc.noun_chunks:
        token = chunk.text.strip()
        if 2 <= len(token) <= 30:
            candidates.add(token)
    for token in doc:
        if token.pos_ in ("NOUN", "PROPN") and not token.is_stop and len(token.text) > 2:
            candidates.add(token.text.strip())
    # Cap at 60 skills max to avoid slow encoding later
    return sorted(candidates)[:60]


def compute_skill_overlap(resume_skills: list, job_skills: list) -> dict:
    """Batch encode all skills at once — single encode call each side."""
    if not job_skills:
        return {"score": 0, "matched": [], "missing": []}

    matched, missing = [], []

    # First pass: fast string matching (no model needed)
    remaining_job = []
    for jskill in job_skills:
        if any(jskill in rs or rs in jskill for rs in resume_skills):
            matched.append(jskill)
        else:
            remaining_job.append(jskill)

    # Second pass: semantic matching only for unmatched skills
    if remaining_job and resume_skills:
        model = get_embed_model()
        # Encode all at once — much faster than per-skill encoding
        j_embs = model.encode(remaining_job, convert_to_tensor=True, batch_size=32)
        r_embs = model.encode(resume_skills, convert_to_tensor=True, batch_size=32)
        scores = util.cos_sim(j_embs, r_embs)  # shape: [len(remaining_job), len(resume_skills)]

        for i, jskill in enumerate(remaining_job):
            if scores[i].max().item() > 0.75:
                matched.append(jskill)
            else:
                missing.append(jskill)
    else:
        missing.extend(remaining_job)

    score = round((len(matched) / len(job_skills)) * 100, 2)
    return {"score": score, "matched": matched, "missing": missing}


def compute_experience_years(text: str) -> int:
    matches = re.findall(r"(\d+)\+?\s*years?", text.lower())
    return max((int(m) for m in matches), default=0)
