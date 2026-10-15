import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, JSON, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    consent = relationship("UserConsent", back_populates="user", uselist=False, cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="user", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")
    masteries = relationship("LearnerTopicMastery", back_populates="user", cascade="all, delete-orphan")
    streak = relationship("LearningStreak", back_populates="user", uselist=False, cascade="all, delete-orphan")
    achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    study_plans = relationship("StudyPlan", back_populates="user", cascade="all, delete-orphan")
    flashcards = relationship("Flashcard", back_populates="user", cascade="all, delete-orphan")
    memories = relationship("PersonalMemory", back_populates="user", cascade="all, delete-orphan")

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    display_name = Column(String(100), nullable=False)
    educational_category = Column(String(50), default="undergraduate")  # school, undergraduate, postgraduate, competitive, vocational, independent
    current_level = Column(String(100), default="Undergraduate Degree")  # e.g., "Class 10", "B.Tech 2nd Year", "UPSC Aspirant"
    institution_or_board = Column(String(150), nullable=True)  # CBSE, ICSE, University Name, etc.
    stream = Column(String(100), nullable=True)  # Science, Commerce, Computer Science, etc.
    subjects_of_interest = Column(JSON, default=list)  # ["Physics", "Mathematics"]
    preferred_language = Column(String(50), default="English")  # English, Hindi, Bengali, etc.
    preferred_style = Column(String(50), default="intuitive_analogy")  # intuitive_analogy, academic_rigorous, step_by_step, visual_conceptual
    learning_goals = Column(Text, nullable=True)
    daily_study_minutes = Column(Integer, default=45)
    target_exam_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="profile")

class UserConsent(Base):
    __tablename__ = "user_consents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    age_group = Column(String(20), default="adult")  # under_13, 13_to_17, adult
    telemetry_allowed = Column(Boolean, default=True)
    shared_contribution_allowed = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="consent")
