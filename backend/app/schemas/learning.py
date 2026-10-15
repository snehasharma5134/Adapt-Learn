from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel

class MasteryResponse(BaseModel):
    id: str
    subject: str
    topic: str
    mastery_score: float  # 0.0 to 1.0
    confidence_level: str  # strong, improving, needs_practice, insufficient_data
    attempts_count: int
    correct_count: int
    p_transit: float
    p_guess: float
    p_slip: float
    last_practiced_at: datetime

    class Config:
        from_attributes = True

class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    last_activity_date: date
    total_xp: int

    class Config:
        from_attributes = True

class AchievementItem(BaseModel):
    code: str
    title: str
    description: str
    badge_icon: str
    xp_value: int
    is_earned: bool
    earned_at: Optional[datetime] = None

class LearningStatsResponse(BaseModel):
    total_study_minutes: int = 0
    total_quizzes_taken: int = 0
    average_quiz_score: float = 0.0
    documents_uploaded: int = 0
    flashcards_mastered: int = 0
    flashcards_count: int = 0
    streak: Optional[StreakResponse] = None
    topic_masteries: List[MasteryResponse] = []
    achievements: List[AchievementItem] = []
    timeline: List[dict] = []
