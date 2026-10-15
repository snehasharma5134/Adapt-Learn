from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class PersonalMemoryCreate(BaseModel):
    category: str = "PREFERENCE"  # GOAL, PREFERENCE, HABIT, WEAKNESS, STRENGTH, LEARNING_STYLE
    memory_text: str = Field(..., min_length=3)
    confidence: float = 0.9

class PersonalMemoryUpdate(BaseModel):
    memory_text: Optional[str] = None
    category: Optional[str] = None

class PersonalMemoryResponse(BaseModel):
    id: str
    user_id: str
    category: str
    memory_text: str
    confidence: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
