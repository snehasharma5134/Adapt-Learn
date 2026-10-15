# RESTful API Specification
**Project:** AI Learning Companion  
**Base URL:** `http://localhost:8000/api`  
**Authentication:** HTTP Bearer Token (JSON Web Token) via Header: `Authorization: Bearer <token>`

---

## 1. Authentication & Learner Profile

### `POST /api/auth/register`
Creates a new user account with initial educational profile.

**Request:**
```json
{
  "email": "learner@example.edu",
  "password": "StrongPassword123!",
  "display_name": "Priya Sharma",
  "educational_category": "UNDERGRADUATE",
  "grade_or_year": "2nd Year",
  "institution_or_board": "Delhi Technological University",
  "stream_or_domain": "Computer Science & Engineering",
  "subjects_of_interest": ["Data Structures", "Operating Systems", "Discrete Math"],
  "preferred_language": "English",
  "preferred_depth": "STEP_BY_STEP",
  "daily_study_minutes": 60,
  "current_objective": "Master dynamic programming algorithms"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "e4b50c62-124b-4b2a-9cb8-63a239b980aa",
    "email": "learner@example.edu",
    "role": "STUDENT",
    "created_at": "2026-10-12T10:00:00Z"
  },
  "token": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 86400
  }
}
```

### `POST /api/auth/login`
Authenticates existing user with email and password.

---

## 2. Smart Notes & RAG Q&A

### `POST /api/documents/upload`
Uploads and indexes an educational PDF note or textbook. Content-Type: `multipart/form-data`.

**Form Fields:**
- `file`: Binary PDF file (Max 25 MB)
- `title`: "Electromagnetism Chapter 3"
- `subject`: "Physics"

**Response (200 OK):**
```json
{
  "id": "67049b4c-9f64-42b7-8ce6-905bb20d6f22",
  "title": "Electromagnetism Chapter 3",
  "subject": "Physics",
  "page_count": 14,
  "chunk_count": 48,
  "is_scanned": false,
  "processing_status": "INDEXED",
  "created_at": "2026-10-12T10:15:00Z"
}
```

### `POST /api/documents/{id}/qa`
Asks a question grounded strictly in the uploaded document.

**Request:**
```json
{
  "question": "State Gauss's Law and explain the surface integral term."
}
```

**Response (200 OK):**
```json
{
  "answer": "Gauss's Law states that the net electric flux through any closed Gaussian surface is equal to the total net charge enclosed divided by $\\varepsilon_0$:\n\n$$\\oint \\mathbf{E} \\cdot d\\mathbf{A} = \\frac{Q_{\\text{enc}}}{\\varepsilon_0}$$\n\nThe closed surface integral $\\oint$ denotes integration over the entire closed 2D boundary.",
  "citations": [
    {
      "page_number": 4,
      "snippet": "Gauss's Law relates electric flux through a closed surface to enclosed charge...",
      "relevance_score": 0.94
    }
  ],
  "confidence_score": 0.95
}
```

---

## 3. Multilingual AI Tutor

### `POST /api/tutor/chat`
Conducts a conversational tutoring turn with depth control and language selection.

**Request:**
```json
{
  "message": "Explain recursion with a real-life analogy.",
  "conversation_id": null,
  "subject": "Computer Science",
  "language": "Hindi",
  "explanation_depth": "SIMPLER"
}
```

**Response (200 OK):**
```json
{
  "conversation_id": "8b51d8b2-58cf-4824-8b63-12e022f47c3e",
  "reply": "रिकर्सन (Recursion) को रूसी गुड़िया (Russian Matryoshka Doll) की तरह समझें...",
  "language": "Hindi",
  "explanation_depth": "SIMPLER",
  "timestamp": "2026-10-12T10:20:00Z"
}
```

---

## 4. Smart Quiz Arena

### `POST /api/quizzes/generate`
Generates non-duplicate MCQs from uploaded notes or a chosen syllabus topic.

**Request:**
```json
{
  "subject": "Computer Science",
  "topic": "Binary Search Trees",
  "question_count": 5,
  "difficulty": "MEDIUM",
  "document_id": null
}
```

### `POST /api/quizzes/{id}/attempt`
Submits student answers for deterministic grading, triggering Bayesian Knowledge Tracing updates.

**Request:**
```json
{
  "answers": [
    { "question_id": "q1", "selected_option_index": 2 },
    { "question_id": "q2", "selected_option_index": 0 }
  ]
}
```

**Response (200 OK):**
```json
{
  "attempt_id": "att-1029",
  "score": 5,
  "total_questions": 5,
  "percentage": 100.0,
  "xp_earned": 50,
  "bkt_updated": true,
  "new_mastery_probability": 0.88
}
```

---

## 5. Bayesian Knowledge Tracing & Analytics

### `GET /api/learning/progress`
Retrieves probabilistic topic mastery states for the authenticated learner.

**Response:**
```json
[
  {
    "subject": "Computer Science",
    "topic": "Binary Search Trees",
    "mastery_probability": 0.88,
    "total_attempts": 10,
    "correct_attempts": 9,
    "last_practiced_at": "2026-10-12T10:30:00Z"
  }
]
```

### `GET /api/analytics/dashboard`
Returns comprehensive aggregated analytics including mastery distribution, weak topic alerts, and streak metrics.

---

## 6. Flashcards & Spaced Repetition (SuperMemo SM-2)

### `POST /api/flashcards/{id}/review`
Submits active recall performance score $q \in [0, 5]$.

**Request:**
```json
{
  "quality_rating": 4
}
```

**Response:**
```json
{
  "flashcard_id": "fc-9102",
  "quality_rating": 4,
  "new_ease_factor": 2.50,
  "new_interval_days": 6,
  "repetitions": 2,
  "next_review_due": "2026-10-18T10:35:00Z"
}
```

---

## 7. Adaptive Study Planner & Recommendations

### `POST /api/study-plans/generate`
Generates a multi-day balanced study schedule based on user time availability and mastery gaps.

### `GET /api/recommendations/`
Fetches algorithmic recommendation queue prioritized by remediation urgency.

---

## 8. System Status & Diagnostics

### `GET /api/system/status`
Exposes system diagnostics, active LLM provider, and database health.

**Response:**
```json
{
  "status": "healthy",
  "provider": "gemini (or pedagogical simulation fallback)",
  "active_model": "gemini-1.5-pro-latest",
  "database": "connected",
  "version": "1.0.0"
}
```
