import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Boolean, JSON, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recommendation_type = Column(String(50), nullable=False)  # WEAK_TOPIC, PREREQUISITE, ADVANCED_PRACTICE, REVISION_DUE, NEXT_CHAPTER
    title = Column(String(255), nullable=False)
    reason = Column(Text, nullable=False)
    priority_score = Column(Float, default=0.5)  # Higher is higher priority
    subject = Column(String(100), nullable=True)
    topic = Column(String(150), nullable=True)
    action_type = Column(String(50), default="QUIZ")  # QUIZ, FLASHCARD, TUTOR, STUDY_PLAN
    action_payload = Column(JSON, default=dict)
    is_completed = Column(Boolean, default=False)
    is_dismissed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="recommendations")
