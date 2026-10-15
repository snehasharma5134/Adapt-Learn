from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    educational_category: Optional[str] = None
    current_level: Optional[str] = None
    institution_or_board: Optional[str] = None
    stream: Optional[str] = None
    subjects_of_interest: Optional[List[str]] = None
    preferred_language: Optional[str] = None
    preferred_style: Optional[str] = None
    learning_goals: Optional[str] = None
    daily_study_minutes: Optional[int] = None
    target_exam_date: Optional[datetime] = None

class ProfileResponse(BaseModel):
    id: str
    user_id: str
    display_name: str
    educational_category: str
    current_level: str
    institution_or_board: Optional[str] = None
    stream: Optional[str] = None
    subjects_of_interest: List[str] = []
    preferred_language: str
    preferred_style: str
    learning_goals: Optional[str] = None
    daily_study_minutes: int
    target_exam_date: Optional[datetime] = None

    class Config:
        from_attributes = True

class ConsentUpdate(BaseModel):
    age_group: Optional[str] = None
    telemetry_allowed: Optional[bool] = None
    shared_contribution_allowed: Optional[bool] = None

class ConsentResponse(BaseModel):
    id: str
    user_id: str
    age_group: str
    telemetry_allowed: bool
    shared_contribution_allowed: bool

    class Config:
        from_attributes = True
