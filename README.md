# AI Resume Analyzer

A full-stack AI-powered resume analyzer that matches your resume against a job description and gives you scores, skill gap analysis, and AI-generated feedback.

---

## Tech Stack

### Backend

| Tool                                   | Purpose                                                 |
| -------------------------------------- | ------------------------------------------------------- |
| **Python 3.10+**                       | Core language                                           |
| **FastAPI**                            | REST API framework                                      |
| **PyPDF2**                             | Extract text from PDF resumes                           |
| **sentence-transformers**              | Semantic similarity using `all-MiniLM-L6-v2` embeddings |
| **spaCy**                              | NLP-based skill extraction from text                    |
| **scikit-learn**                       | Supporting ML utilities                                 |
| **Google Gemini API** (`google-genai`) | AI feedback, strengths, tips, cover letter generation   |
| **Motor + PyMongo**                    | Async MongoDB driver for storing analysis history       |
| **python-dotenv**                      | Load environment variables from `.env`                  |
| **Uvicorn**                            | ASGI server to run FastAPI                              |

### Frontend

| Tool                           | Purpose                            |
| ------------------------------ | ---------------------------------- |
| **React 19**                   | UI framework                       |
| **Vite**                       | Frontend build tool and dev server |
| **Axios**                      | HTTP requests to the backend API   |
| **react-circular-progressbar** | Score gauge visualizations         |
| **CSS Modules**                | Scoped component styling           |

### Database

| Tool                | Purpose                            |
| ------------------- | ---------------------------------- |
| **MongoDB** (local) | Stores all past resume analyses    |
| **MongoDB Compass** | GUI to view stored data (optional) |

---

## Project Structure

```
resume_analyzer/
├── backend/
│   ├── main.py            # FastAPI app, all API routes
│   ├── resume_parser.py   # PDF text extraction + section parsing
│   ├── matcher.py         # Semantic similarity + skill matching
│   ├── ai_analyzer.py     # Gemini AI feedback + cover letter
│   ├── database.py        # MongoDB connection + queries
│   ├── requirements.txt   # Python dependencies
│   └── .env               # Secrets (not committed — see setup below)
└── frontend/
    ├── src/
    │   ├── App.jsx              # Main app, routing between tabs
    │   ├── api.js               # Axios API calls
    │   └── components/
    │       ├── UploadForm.jsx   # PDF upload + job description input
    │       ├── ResultCard.jsx   # Full analysis result display
    │       ├── ScoreGauge.jsx   # Circular score indicators
    │       ├── SkillTags.jsx    # Matched/missing skill tags
    │       └── History.jsx      # Past analyses list
    ├── package.json
    └── index.html
```

---

## Setup Instructions

### Prerequisites

Make sure you have these installed:

- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) — install and let it run as a Windows service
- A [Gemini API key](https://aistudio.google.com/app/apikey) (free)

---

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd resume_analyzer
```

---

### 2. Backend setup

```bash
cd backend
```

**Install Python dependencies:**

```bash
pip install -r requirements.txt
```

**Download the spaCy language model:**

```bash
python -m spacy download en_core_web_sm
```

**Create your `.env` file** — create a file called `.env` inside the `backend/` folder:

```
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb://localhost:27017
DB_NAME=resume_analyzer
```

Get your free Gemini API key from: https://aistudio.google.com/app/apikey

**Start the backend server:**

```bash
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

---

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
```

**Install Node dependencies:**

```bash
npm install
```

**Start the frontend dev server:**

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

### 4. Make sure MongoDB is running

On Windows, MongoDB runs as a service automatically after installation.
To check:

```bash
Get-Service -Name MongoDB
```

Should show `Running`. If not:

```bash
Start-Service -Name MongoDB
```

---

## API Endpoints

| Method | Endpoint        | Description                                            |
| ------ | --------------- | ------------------------------------------------------ |
| `POST` | `/analyze`      | Upload resume PDF + job description, get full analysis |
| `POST` | `/cover-letter` | Generate a tailored cover letter                       |
| `GET`  | `/history`      | Get all past analyses                                  |
| `GET`  | `/history/{id}` | Get a specific analysis by ID                          |
| `GET`  | `/health`       | Health check                                           |

---

## How It Works

1. You upload a resume PDF and paste a job description
2. **PyPDF2** extracts text from the PDF
3. **spaCy** extracts skills from both the resume and job description
4. **sentence-transformers** computes semantic similarity between the two texts
5. Skill overlap is calculated with both string matching and semantic similarity
6. **Gemini AI** analyzes the full context and returns structured feedback
7. Results are saved to **MongoDB** and displayed in the UI

---

## Notes

- The first request after starting the server will be slow (~30s) because sentence-transformers loads the model into memory. Subsequent requests are fast.
- Gemini AI features require internet access to Google's API. If you're on a restricted network, scores and skill analysis will still work but AI feedback will show an error.
- Never commit your `.env` file — it contains your API key and MongoDB URI.
