from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel, Field

class FlashcardCreateRequest(BaseModel):
    front_prompt: str
    back_answer: str
    subject: str
    topic: str
    document_id: Optional[str] = None
    source_page: Optional[int] = None

class FlashcardResponse(BaseModel):
    id: str
    front_prompt: str
    back_answer: str
    subject: str
    topic: str
    document_id: Optional[str] = None
    source_page: Optional[int] = None
    repetition_count: int
    interval_days: int
    ease_factor: float
    next_review_date: date
    last_reviewed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class FlashcardReviewRequest(BaseModel):
    flashcard_id: str
    rating: int = Field(..., ge=1, le=4)  # 1: Again, 2: Hard, 3: Good, 4: Easy

class FlashcardReviewResponse(BaseModel):
    flashcard_id: str
    new_interval_days: int
    new_ease_factor: float
    next_review_date: date
    xp_earned: int
