from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.study_plan import StudyPlan, StudyPlanTask
from app.schemas.study_plan import StudyPlanGenerateRequest, StudyPlanResponse, StudyPlanTaskResponse, TaskUpdateStatusRequest
from app.services.study_planner_service import study_planner_service

router = APIRouter()

@router.post("/generate", response_model=StudyPlanResponse)
def generate_study_plan(
    plan_in: StudyPlanGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = study_planner_service.generate_plan(
        db=db,
        user_id=current_user.id,
        goal=plan_in.goal,
        target_date=plan_in.target_date,
        daily_study_minutes=plan_in.daily_study_minutes,
        subjects=plan_in.subjects,
        focus_on_weak_topics=plan_in.focus_on_weak_topics
    )
    return plan

@router.get("/active", response_model=Optional[StudyPlanResponse])
def get_active_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = db.query(StudyPlan).filter(
        StudyPlan.user_id == current_user.id,
        StudyPlan.is_active == True
    ).first()
    return plan

@router.patch("/tasks/{task_id}", response_model=StudyPlanTaskResponse)
def update_task_status(
    task_id: str,
    status_in: TaskUpdateStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(StudyPlanTask).join(StudyPlan).filter(
        StudyPlanTask.id == task_id,
        StudyPlan.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found or unauthorized.")

    return study_planner_service.update_task_status(db=db, task_id=task.id, is_completed=status_in.is_completed)
