from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.learning import LearningStatsResponse
from app.services.analytics_service import analytics_service

router = APIRouter()

@router.get("/dashboard", response_model=LearningStatsResponse)
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return analytics_service.get_dashboard_analytics(db=db, user_id=current_user.id)
