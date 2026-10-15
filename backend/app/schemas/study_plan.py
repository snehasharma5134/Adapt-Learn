from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel, Field

class StudyPlanGenerateRequest(BaseModel):
    goal: str
    target_date: Optional[date] = None
    daily_study_minutes: int = Field(default=60, ge=15, le=480)
    subjects: List[str] = Field(default_factory=list)
    focus_on_weak_topics: bool = True

class StudyPlanTaskResponse(BaseModel):
    id: str
    plan_id: str
    title: str
    description: Optional[str] = None
    subject: str
    topic: str
    estimated_minutes: int
    task_type: str  # NEW_CONCEPT, PRACTICE, REVISION, MOCK_TEST
    scheduled_date: date
    is_completed: bool
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class StudyPlanResponse(BaseModel):
    id: str
    user_id: str
    title: str
    goal: str
    target_date: Optional[date] = None
    daily_study_minutes: int
    subjects: List[str] = []
    is_active: bool
    created_at: datetime
    tasks: List[StudyPlanTaskResponse] = []

    class Config:
        from_attributes = True

class TaskUpdateStatusRequest(BaseModel):
    is_completed: bool
