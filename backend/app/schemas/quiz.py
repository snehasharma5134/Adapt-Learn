from typing import Optional, List, Dict
from datetime import datetime
from pydantic import BaseModel, Field

class QuizGenerateRequest(BaseModel):
    subject: str
    topic: str
    educational_level: Optional[str] = None
    difficulty: str = "medium"  # easy, medium, hard
    question_count: int = Field(default=5, ge=1, le=20)
    mode: str = "PRACTICE"  # PRACTICE, TIMED
    time_limit_seconds: Optional[int] = 300
    document_id: Optional[str] = None
    target_pages: Optional[List[int]] = None

class QuizQuestionSchema(BaseModel):
    id: str
    question_order: int
    question_text: str
    options: Dict[str, str]  # {"A": "...", "B": "...", "C": "...", "D": "..."}
    source_page: Optional[int] = None

    class Config:
        from_attributes = True

class QuizResponseSchema(BaseModel):
    id: str
    title: str
    subject: str
    topic: str
    educational_level: str
    difficulty: str
    question_count: int
    mode: str
    time_limit_seconds: int
    document_id: Optional[str] = None
    created_at: datetime
    questions: List[QuizQuestionSchema] = []

    class Config:
        from_attributes = True

class QuizAnswerSubmission(BaseModel):
    question_id: str
    selected_option: str  # "A", "B", "C", "D"
    time_spent_seconds: Optional[int] = 0

class QuizSubmitRequest(BaseModel):
    quiz_id: str
    responses: List[QuizAnswerSubmission]
    total_time_taken_seconds: int = 0

class QuestionResultItem(BaseModel):
    question_id: str
    question_text: str
    options: Dict[str, str]
    user_answer: str
    correct_answer: str
    is_correct: bool
    explanation: str
    source_page: Optional[int] = None

class QuizSubmitResponse(BaseModel):
    attempt_id: str
    quiz_id: str
    score: int
    total_questions: int
    percentage: float
    xp_earned: int
    streak_days: int
    new_mastery_score: float
    mastery_status: str
    question_results: List[QuestionResultItem] = []
    recommended_next_step: str

class QuizAttemptHistoryItem(BaseModel):
    id: str
    quiz_id: str
    quiz_title: str
    subject: str
    topic: str
    score: int
    total_questions: int
    percentage: float
    time_taken_seconds: int
    completed_at: datetime

    class Config:
        from_attributes = True
