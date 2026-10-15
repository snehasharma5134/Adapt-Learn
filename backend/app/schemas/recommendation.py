from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel

class RecommendationResponse(BaseModel):
    id: str
    recommendation_type: str  # WEAK_TOPIC, PREREQUISITE, ADVANCED_PRACTICE, REVISION_DUE, NEXT_CHAPTER
    title: str
    reason: str
    priority_score: float
    subject: Optional[str] = None
    topic: Optional[str] = None
    action_type: str  # QUIZ, FLASHCARD, TUTOR, STUDY_PLAN
    action_payload: Dict[str, Any] = {}
    is_completed: bool
    is_dismissed: bool
    created_at: datetime

    class Config:
        from_attributes = True

class RecommendationFeedbackRequest(BaseModel):
    recommendation_id: str
    is_helpful: bool
    dismiss: Optional[bool] = False
    comment: Optional[str] = None
