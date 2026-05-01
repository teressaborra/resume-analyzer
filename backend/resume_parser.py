import PyPDF2
import re
import io

def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text.strip()


def extract_sections(text: str) -> dict:
    sections = {"skills": "", "experience": "", "education": "", "summary": "", "full": text}
    patterns = {
        "summary":    r"(summary|objective|profile|about me)",
        "skills":     r"(skills|technical skills|core competencies|technologies)",
        "experience": r"(experience|work experience|employment|work history)",
        "education":  r"(education|academic|qualifications|degrees)",
    }
    lines = text.split("\n")
    current_section = None
    for line in lines:
        line_lower = line.strip().lower()
        matched = False
        for section, pattern in patterns.items():
            if re.search(pattern, line_lower) and len(line_lower) < 50:
                current_section = section
                matched = True
                break
        if not matched and current_section:
            sections[current_section] += line + "\n"
    return sections


def extract_contact_info(text: str) -> dict:
    email = re.findall(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    phone = re.findall(r"(\+?\d[\d\s\-\(\)]{7,}\d)", text)
    return {
        "email": email[0] if email else None,
        "phone": phone[0].strip() if phone else None,
    }
