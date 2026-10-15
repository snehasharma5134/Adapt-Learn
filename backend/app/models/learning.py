import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Date, JSON, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class LearnerTopicMastery(Base):
    __tablename__ = "learner_topic_mastery"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject = Column(String(100), nullable=False)
    topic = Column(String(150), nullable=False, index=True)
    mastery_score = Column(Float, default=0.1)  # 0.0 to 1.0 (estimated probability of knowledge mastery)
    confidence_level = Column(String(20), default="insufficient_data")  # strong, improving, needs_practice, insufficient_data
    attempts_count = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    # Bayesian Knowledge Tracing (BKT) parameter states
    p_transit = Column(Float, default=0.2)   # Transition probability from unlearned to learned
    p_guess = Column(Float, default=0.25)    # Probability of guessing correctly when not learned
    p_slip = Column(Float, default=0.10)     # Probability of slipping (answering incorrectly when learned)
    last_practiced_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="masteries")

class LearningStreak(Base):
    __tablename__ = "learning_streaks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    current_streak = Column(Integer, default=1)
    longest_streak = Column(Integer, default=1)
    last_activity_date = Column(Date, default=lambda: date.today())
    total_xp = Column(Integer, default=50)

    user = relationship("User", back_populates="streak")

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    badge_icon = Column(String(50), default="award")
    xp_value = Column(Integer, default=50)

class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    achievement_code = Column(String(50), ForeignKey("achievements.code", ondelete="CASCADE"), nullable=False)
    earned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="achievements")

class LearningEvent(Base):
    __tablename__ = "learning_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)  # QUIZ_COMPLETED, FLASHCARD_REVIEWED, TUTOR_QUESTION, DOCUMENT_STUDIED
    details = Column(JSON, default=dict)
    xp_awarded = Column(Integer, default=10)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
