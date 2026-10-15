from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    display_name: str
    educational_level: str
    preferred_language: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    display_name: str = Field(..., min_length=2)
    educational_category: str = "undergraduate"  # school, undergraduate, postgraduate, competitive, vocational, independent
    current_level: str = "Undergraduate Degree"
    institution_or_board: Optional[str] = None
    stream: Optional[str] = None
    subjects_of_interest: List[str] = Field(default_factory=list)
    preferred_language: str = "English"
    preferred_style: str = "intuitive_analogy"
    learning_goals: Optional[str] = None
    daily_study_minutes: int = 45

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileSchema(BaseModel):
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

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    is_active: bool
    created_at: datetime
    profile: Optional[UserProfileSchema] = None

    class Config:
        from_attributes = True
