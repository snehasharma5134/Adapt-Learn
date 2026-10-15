from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.recommendation import Recommendation
from app.schemas.recommendation import RecommendationResponse, RecommendationFeedbackRequest
from app.services.recommendation_service import recommendation_service

router = APIRouter()

@router.get("", response_model=List[RecommendationResponse])
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    recs = recommendation_service.generate_recommendations(db=db, user_id=current_user.id)
    return recs

@router.post("/feedback")
def submit_feedback(
    fb_in: RecommendationFeedbackRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rec = db.query(Recommendation).filter(
        Recommendation.id == fb_in.recommendation_id,
        Recommendation.user_id == current_user.id
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found.")

    if fb_in.dismiss:
        rec.is_dismissed = True
    db.commit()
    return {"message": "Recommendation feedback recorded."}

@router.get("/evaluation")
def get_recommendation_evaluation():
    """
    Returns comparative evaluation metrics of baseline, rule-based,
    and hybrid BKT recommendation models.
    """
    return recommendation_service.evaluate_recommendation_models()
