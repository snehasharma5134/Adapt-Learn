import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Boolean, JSON, Date, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    goal = Column(Text, nullable=False)
    target_date = Column(Date, nullable=True)
    daily_study_minutes = Column(Integer, default=60)
    subjects = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="study_plans")
    tasks = relationship("StudyPlanTask", back_populates="plan", cascade="all, delete-orphan", order_by="StudyPlanTask.scheduled_date")

class StudyPlanTask(Base):
    __tablename__ = "study_plan_tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    plan_id = Column(String(36), ForeignKey("study_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String(100), nullable=False)
    topic = Column(String(150), nullable=False)
    estimated_minutes = Column(Integer, default=30)
    task_type = Column(String(50), default="NEW_CONCEPT")  # NEW_CONCEPT, PRACTICE, REVISION, MOCK_TEST
    scheduled_date = Column(Date, nullable=False, index=True)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)

    plan = relationship("StudyPlan", back_populates="tasks")
