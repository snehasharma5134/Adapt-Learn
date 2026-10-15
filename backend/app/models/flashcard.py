import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Date, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    front_prompt = Column(Text, nullable=False)
    back_answer = Column(Text, nullable=False)
    subject = Column(String(100), nullable=False)
    topic = Column(String(150), nullable=False)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    source_page = Column(Integer, nullable=True)
    
    # SuperMemo SM-2 parameters
    repetition_count = Column(Integer, default=0)
    interval_days = Column(Integer, default=1)
    ease_factor = Column(Float, default=2.5)  # Default SM-2 ease factor
    next_review_date = Column(Date, default=lambda: date.today(), index=True)
    last_reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="flashcards")
    reviews = relationship("FlashcardReview", back_populates="flashcard", cascade="all, delete-orphan")

class FlashcardReview(Base):
    __tablename__ = "flashcard_reviews"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    flashcard_id = Column(String(36), ForeignKey("flashcards.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)  # 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
    reviewed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    flashcard = relationship("Flashcard", back_populates="reviews")
