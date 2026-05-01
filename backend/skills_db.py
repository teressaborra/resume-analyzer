# Curated tech skills taxonomy — replaces noisy spaCy extraction
TECH_SKILLS = {
    # Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "c", "go", "golang",
    "rust", "kotlin", "swift", "ruby", "php", "scala", "r", "matlab", "perl",
    "bash", "shell", "powershell", "dart", "elixir", "haskell", "lua",

    # Frontend
    "react", "react.js", "next.js", "vue", "vue.js", "angular", "svelte",
    "html", "css", "sass", "scss", "tailwind", "tailwindcss", "bootstrap",
    "webpack", "vite", "redux", "zustand", "graphql", "rest api",

    # Backend
    "node.js", "node", "express", "express.js", "fastapi", "django", "flask",
    "spring", "spring boot", "laravel", "rails", "ruby on rails", "asp.net",
    "nestjs", "fastify", "hapi",

    # Databases
    "sql", "mysql", "postgresql", "postgres", "mongodb", "redis", "sqlite",
    "oracle", "cassandra", "dynamodb", "firebase", "supabase", "elasticsearch",
    "neo4j", "influxdb",

    # Cloud & DevOps
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
    "terraform", "ansible", "jenkins", "github actions", "ci/cd", "linux",
    "nginx", "apache", "heroku", "vercel", "netlify", "cloudflare",

    # AI / ML / Data
    "machine learning", "deep learning", "nlp", "computer vision", "tensorflow",
    "pytorch", "keras", "scikit-learn", "pandas", "numpy", "matplotlib",
    "hugging face", "langchain", "openai", "llm", "transformers", "opencv",
    "spark", "hadoop", "airflow", "dbt", "tableau", "power bi", "data analysis",
    "data science", "statistics", "a/b testing",

    # Mobile
    "android", "ios", "react native", "flutter", "xamarin", "swift ui",

    # Tools & Practices
    "git", "github", "gitlab", "bitbucket", "jira", "agile", "scrum",
    "microservices", "api design", "system design", "tdd", "unit testing",
    "selenium", "jest", "pytest", "postman", "figma", "linux",

    # Security
    "cybersecurity", "penetration testing", "oauth", "jwt", "ssl", "tls",
    "encryption", "network security",

    # Soft skills (relevant for JD matching)
    "communication", "leadership", "teamwork", "problem solving",
    "project management", "time management",
}


def extract_skills_from_text(text: str) -> list:
    """Match text against curated skills taxonomy. Fast and accurate."""
    text_lower = text.lower()
    found = set()
    for skill in TECH_SKILLS:
        # Word boundary check to avoid partial matches
        import re
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found.add(skill)
    return sorted(found)


def compute_ats_score(resume_text: str, job_description: str) -> dict:
    """
    ATS simulation — checks keyword density and formatting signals.
    Returns a score and list of matched/missing keywords.
    """
    import re
    resume_lower = resume_text.lower()
    job_lower = job_description.lower()

    # Extract all meaningful words from JD (3+ chars, not stopwords)
    stopwords = {"the", "and", "for", "with", "that", "this", "are", "you",
                 "will", "have", "from", "they", "been", "has", "our", "your",
                 "their", "about", "into", "more", "also", "can", "all", "any"}

    jd_words = set(re.findall(r'\b[a-z][a-z+#.]{2,}\b', job_lower)) - stopwords
    resume_words = set(re.findall(r'\b[a-z][a-z+#.]{2,}\b', resume_lower)) - stopwords

    matched_keywords = sorted(jd_words & resume_words)
    missing_keywords = sorted(jd_words - resume_words)

    # ATS score = keyword coverage
    ats_score = round((len(matched_keywords) / len(jd_words)) * 100, 2) if jd_words else 0

    # Formatting signals
    has_email = bool(re.search(r'[\w\.-]+@[\w\.-]+\.\w+', resume_text))
    has_phone = bool(re.search(r'\+?\d[\d\s\-\(\)]{7,}\d', resume_text))
    has_sections = any(kw in resume_lower for kw in ["experience", "education", "skills", "projects"])
    word_count = len(resume_text.split())

    formatting_notes = []
    if not has_email:
        formatting_notes.append("No email address detected")
    if not has_phone:
        formatting_notes.append("No phone number detected")
    if not has_sections:
        formatting_notes.append("Standard sections (Experience, Education, Skills) not clearly labeled")
    if word_count < 200:
        formatting_notes.append("Resume seems too short — aim for 400-600 words")
    if word_count > 1000:
        formatting_notes.append("Resume may be too long — keep it concise")

    return {
        "ats_score": ats_score,
        "matched_keywords": matched_keywords[:30],
        "missing_keywords": missing_keywords[:20],
        "word_count": word_count,
        "formatting_notes": formatting_notes,
    }
