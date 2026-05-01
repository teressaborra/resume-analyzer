import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

_client = None
_db = None

def get_db():
    global _client, _db
    if _db is None:
        uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        db_name = os.getenv("DB_NAME", "resume_analyzer")
        # Use local MongoDB — Atlas DNS is blocked on this network
        _client = AsyncIOMotorClient("mongodb://localhost:27017", serverSelectionTimeoutMS=3000)
        _db = _client[db_name]
    return _db


async def save_analysis(filename: str, job_description: str, result: dict) -> str:
    try:
        db = get_db()
        doc = {
            "filename": filename,
            "job_description": job_description,
            "overall_score": result.get("overall_score"),
            "semantic_similarity": result.get("semantic_similarity"),
            "skill_match": result.get("skill_match", {}),
            "years_of_experience": result.get("years_of_experience"),
            "contact_info": result.get("contact_info", {}),
            "sections_detected": result.get("sections_detected", {}),
            "ai_feedback": result.get("ai_feedback", {}),
            "created_at": datetime.utcnow().isoformat()
        }
        res = await db.analyses.insert_one(doc)
        return str(res.inserted_id)
    except Exception as e:
        print(f"[DB] save failed: {e}")
        return "no-id"


async def get_all_analyses() -> list:
    db = get_db()
    cursor = db.analyses.find({}, {"_id": 1, "filename": 1, "overall_score": 1,
                                    "job_description": 1, "created_at": 1})
    results = []
    async for doc in cursor.sort("created_at", -1):
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results


async def get_analysis_by_id(analysis_id: str) -> dict | None:
    from bson import ObjectId
    db = get_db()
    try:
        doc = await db.analyses.find_one({"_id": ObjectId(analysis_id)})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc
    except Exception:
        return None
