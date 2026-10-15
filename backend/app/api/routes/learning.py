from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.learning import LearnerTopicMastery, LearningStreak
from app.schemas.learning import MasteryResponse, StreakResponse
from app.services.knowledge_tracing_service import knowledge_tracing_service

router = APIRouter()

@router.get("/mastery", response_model=List[MasteryResponse])
def get_topic_masteries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(LearnerTopicMastery).filter(
        LearnerTopicMastery.user_id == current_user.id
    ).order_by(LearnerTopicMastery.mastery_score.asc()).all()

@router.get("/streaks", response_model=StreakResponse)
def get_streak(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    streak = db.query(LearningStreak).filter(
        LearningStreak.user_id == current_user.id
    ).first()
    if not streak:
        raise HTTPException(status_code=404, detail="Streak record not initialized.")
    return streak

@router.get("/dkt-benchmark")
def get_dkt_benchmark():
    """
    Evaluates Bayesian Knowledge Tracing (BKT) on sequential benchmark data.
    Reports ROC-AUC, Accuracy, and RMSE.
    """
    return knowledge_tracing_service.evaluate_models_benchmark([])
