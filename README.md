# AI Learning Companion
> **Learn Smarter. Understand Better. Grow Together.**  
> Aligned with United Nations Sustainable Development Goal 4: **Quality Education**

---

## 🌟 Executive Overview

**AI Learning Companion** is an advanced, full-stack, AI/ML-powered personalized educational ecosystem. Engineered to remove the barriers of static curriculums and generic explanations, the platform adapts dynamically to any learner across any educational stage—from primary school to doctoral research, competitive examinations, and vocational skill-building.

Learners can **upload lecture notes or PDFs** to chat with grounded RAG-driven AI that cites exact source pages, or converse directly with an **AI Tutor** fluent in multiple Indian languages (Hindi, Tamil, Telugu, Bengali, Marathi, etc.) with customizable depth controls (simplified analogies, step-by-step proofs, or university-level deep dives). Behind the scenes, an integrated **Bayesian Knowledge Tracing (BKT)** engine computes dynamic topic mastery after every quiz attempt, driving a **Hybrid Recommendation Engine**, an **Adaptive Multi-Day Study Planner**, and an **SM-2 Spaced Repetition Flashcard System**.

---

## 🎯 Key Modules & Features

| # | Module | Core Functionality |
|---|---|---|
| **1** | **Smart Notes Studio** | PyMuPDF page-preserving extraction, chunking, semantic RAG Q&A with exact 1-indexed page citations and confidence scoring. |
| **2** | **Multilingual AI Tutor** | Level-aware conversational tutor supporting English and Indian languages with prompt adaptation (simpler, step-by-step, deep-dive, practice). |
| **3** | **Smart Quiz Arena** | MCQ generation from uploaded notes or general topics, SHA-256 duplicate question prevention, automated grading, and detailed explanations. |
| **4** | **Knowledge Gap Detector** | Real-time Bayesian Knowledge Tracing updating $P(L)$ mastery probability, transition $P(T)$, guess $P(G)$, and slip $P(S)$ parameters. |
| **5** | **Hybrid Recommendation Engine** | Algorithmic prioritization ranker categorizing recommendations: weak topic remediation, spaced revision due, advanced challenges, and cold-start diagnostics. |
| **6** | **Concept Map Studio** | Interactive SVG graph visualizing core theories, prerequisite chains, and practical applications extracted from topics or notes. |
| **7** | **Adaptive Study Planner** | Workload synthesis balancing daily study minutes between new concept acquisition, weak area practice, and scheduled review. |
| **8** | **Flashcards & Spaced Revision** | SuperMemo SM-2 algorithm updating interval, repetition count, and ease factor based on active recall ratings (0–5). |
| **9** | **Learning Streaks & Gamification** | Server-side validated XP rewards, daily streak tracking, and unlockable achievement milestones (Early Bird, Streak Master, Scholar). |
| **10** | **Collective Learning Intelligence** | Strictly isolated Personal Learning Memory with full user inspection/purge controls, coupled with a curated Shared Knowledge moderation pipeline. |
| **11** | **Learning Analytics** | Interactive Recharts dashboard visualizing mastery distribution, quiz performance trajectories, and topic-level strengths/weaknesses. |
| **12** | **Flexible Profile & Onboarding** | Adaptive learner profiling supporting school boards, undergraduate degrees, postgraduate specializations, and independent self-learners. |

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript & Vite
- **Styling:** Tailwind CSS with custom design system and Lucide icons
- **Data Visualization:** Recharts for mastery distribution and score progression
- **Academic Rendering:** KaTeX for LaTeX mathematical formulas and Markdown parser
- **State & Routing:** React Router v6 and React Context API

### Backend
- **Framework:** Python 3.13 + FastAPI (Asynchronous REST API)
- **Database ORM:** SQLAlchemy with Alembic migration compatibility
- **Document Processing:** PyMuPDF (fitz) for page-preserving PDF extraction
- **AI/ML Layer:** Dual-mode AI Architecture:
  - Cloud LLM adapter (Gemini 1.5 Pro / OpenAI GPT-4o)
  - Deterministic pedagogical simulation fallback with verifiable citations & reasoning
  - Bayesian Knowledge Tracing (BKT) & Deep Knowledge Tracing (DKT) benchmark evaluator
  - Scikit-learn TF-IDF semantic vector similarity ranking
  - SuperMemo SM-2 spaced repetition calculation

### Database & Storage
- **Local Dev:** SQLite (`sqlite:///./learning_companion.db`) for zero-friction local execution
- **Production:** PostgreSQL 16 with `pgvector` extension for persistent relational & vector data
- **File Storage:** Local secure file system with strict mime-type validation

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js:** v18+ or v20+
- **Python:** v3.10+ (tested on Python 3.13)
- **Docker & Docker Compose** *(Optional, for containerized run)*

---

### Method 1: Local Development (Recommended for Fast Testing)

#### 1. Clone & Set Up Backend
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
# Windows:
python -m venv ../backend_venv
..\backend_venv\Scripts\activate
# Linux/macOS:
python3 -m venv ../backend_venv
source ../backend_venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server (runs on http://localhost:8000)
uvicorn app.main:app --reload --port 8000
```
*Note: SQLite database `learning_companion.db` is initialized automatically on startup.*

#### 2. Set Up Frontend
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

#### 3. Access the Application
Open your browser and navigate to **`http://localhost:5173`**.  
- Click **"Explore Platform"** or **"Sign Up"** to create an account.
- Complete the onboarding questionnaire selecting your education stage (School, Undergraduate, Postgraduate, etc.).

---

### Method 2: Docker Compose (Production Environment)

Run the entire stack with PostgreSQL and pgvector in a single command:

```bash
docker-compose up --build
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Interactive Swagger Docs:** http://localhost:8000/docs
- **PostgreSQL Database:** `localhost:5432`

---

## 🧪 Testing & Verification

The backend includes a comprehensive automated test suite covering all modules:

```bash
# Run backend pytest suite with verbose output
pytest backend/tests/ -v
```

**Test Coverage Summary:**
- `test_auth.py` (Registration, JWT token issuing, profile onboarding)
- `test_pdf_service.py` (PyMuPDF page extraction, chunking, scanned document detection)
- `test_rag.py` (Semantic retrieval, 1-indexed page citations, confidence scoring)
- `test_tutor.py` (Multilingual prompt adaptation, depth modes, conversational context)
- `test_quizzes.py` (MCQ generation, SHA-256 deduplication, grading accuracy)
- `test_knowledge_tracing.py` (Bayesian Knowledge Tracing formula verification, DKT benchmark)
- `test_recommendations.py` (Priority rule ordering, mastery gap remediation)
- `test_concept_maps.py` (Node/edge extraction, category tagging)
- `test_study_planner.py` (Daily time budget allocation, multi-day task scheduling)
- `test_flashcards.py` (SuperMemo SM-2 interval expansion, ease factor calculation)
- `test_streaks_rewards.py` (XP verification, daily streak increment, milestone badges)
- `test_memory_shared.py` (User memory isolation, shared knowledge curation pipeline)

**Result:** **12/12 Test Suites Passed (100% Success)**

Frontend compilation test:
```bash
cd frontend
npm run build
```
**Result:** Verified with `tsc && vite build` (0 errors).

---

## 🏛️ Project Directory Structure

```
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/          # 14 modular REST API route controllers
│   │   │   └── deps.py          # JWT authentication & DB session dependency injection
│   │   ├── core/                # Configuration, security, database session setup
│   │   ├── models/              # SQLAlchemy relational models (User, Doc, Quiz, BKT, etc.)
│   │   ├── schemas/             # Typed Pydantic request/response schemas
│   │   ├── services/            # Core business logic (BKT, RAG, SM-2, Planner, Analytics)
│   │   ├── integrations/        # LLM adapter (Gemini/OpenAI) + Pedagogical Engine
│   │   └── main.py              # FastAPI application entrypoint with CORS & routes
│   ├── tests/                   # 12 pytest verification suites
│   ├── Dockerfile               # Backend container configuration
│   └── requirements.txt         # Pinned Python package dependencies
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components (Sidebar, Header, Card, Modal, etc.)
│   │   ├── contexts/            # React AuthContext with persistent JWT session
│   │   ├── pages/               # 16 complete functional views (Tutor, Quiz, Notes, etc.)
│   │   ├── services/            # Axios API client connecting all backend endpoints
│   │   └── types/               # Comprehensive TypeScript interface definitions
│   ├── Dockerfile               # Multi-stage production container
│   ├── nginx.conf               # High-performance reverse proxy configuration
│   └── package.json             # Frontend dependencies
├── docker-compose.yml           # Unified orchestration file
├── .env.example                 # Environment configuration template
├── ARCHITECTURE.md              # Detailed architectural design specification
├── DATABASE_SCHEMA.md           # Database entity relationship and indexing guide
├── AI_ML_DESIGN.md              # Mathematical and algorithmic ML documentation
├── API_DOCUMENTATION.md         # Exhaustive REST API specification
├── SECURITY_AND_PRIVACY.md      # Data governance and security architecture
├── TESTING.md                   # QA test strategies and execution logs
└── DEPLOYMENT.md                # Production infrastructure and deployment guidelines
```

---

## 📜 Documentation Index
For in-depth technical details, refer to:
- [Architecture Guide](file:///c:/Users/ASUS/OneDrive/Desktop/IBM%20project/ARCHITECTURE.md)
- [Database Schema & ERD](file:///c:/Users/ASUS/OneDrive/Desktop/IBM%20project/DATABASE_SCHEMA.md)
- [AI & ML Design](file:///c:/Users/ASUS/OneDrive/Desktop/IBM%20project/AI_ML_DESIGN.md)
- [API Reference](file:///c:/Users/ASUS/OneDrive/Desktop/IBM%20project/API_DOCUMENTATION.md)
- [Security & Privacy](file:///c:/Users/ASUS/OneDrive/Desktop/IBM%20project/SECURITY_AND_PRIVACY.md)
- [Testing Report](file:///c:/Users/ASUS/OneDrive/Desktop/IBM%20project/TESTING.md)
- [Deployment Guide](file:///c:/Users/ASUS/OneDrive/Desktop/IBM%20project/DEPLOYMENT.md)

---

## 📄 License
This project is open-source under the MIT License, created to advance accessible, high-quality personalized education worldwide.
