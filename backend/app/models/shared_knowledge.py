import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Text, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class SharedKnowledgeEntry(Base):
    __tablename__ = "shared_knowledge_entries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    contributor_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    subject = Column(String(100), nullable=False)
    topic = Column(String(150), nullable=False, index=True)
    educational_level = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    source_reference = Column(String(255), nullable=True)
    verification_status = Column(String(50), default="PENDING")  # PENDING, APPROVED, REJECTED
    reviewed_by = Column(String(100), nullable=True)
    review_notes = Column(Text, nullable=True)
    upvotes = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    verified_at = Column(DateTime, nullable=True)

class UserFeedback(Base):
    __tablename__ = "user_feedback"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    feedback_type = Column(String(50), nullable=False)  # ANSWER_QUALITY, RECOMMENDATION, GENERAL
    reference_id = Column(String(36), nullable=True)  # Message ID or Recommendation ID
    rating = Column(Integer, default=5)  # 1 to 5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
