from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class SharedKnowledgeCreate(BaseModel):
    subject: str
    topic: str
    educational_level: str
    title: str = Field(..., min_length=5)
    content: str = Field(..., min_length=20)
    source_reference: Optional[str] = None

class SharedKnowledgeReviewRequest(BaseModel):
    status: str  # APPROVED, REJECTED
    review_notes: Optional[str] = None

class SharedKnowledgeResponse(BaseModel):
    id: str
    contributor_id: Optional[str] = None
    subject: str
    topic: str
    educational_level: str
    title: str
    content: str
    source_reference: Optional[str] = None
    verification_status: str  # PENDING, APPROVED, REJECTED
    reviewed_by: Optional[str] = None
    review_notes: Optional[str] = None
    upvotes: int
    created_at: datetime
    verified_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class FeedbackCreate(BaseModel):
    feedback_type: str = "ANSWER_QUALITY"  # ANSWER_QUALITY, RECOMMENDATION, GENERAL
    reference_id: Optional[str] = None
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: str
    user_id: str
    feedback_type: str
    reference_id: Optional[str] = None
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
