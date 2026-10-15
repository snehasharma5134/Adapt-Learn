from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.quiz import Quiz, QuizAttempt
from app.schemas.quiz import (
    QuizGenerateRequest, QuizResponseSchema,
    QuizSubmitRequest, QuizSubmitResponse, QuizAttemptHistoryItem
)
from app.services.quiz_service import quiz_service

router = APIRouter()

@router.post("/generate", response_model=QuizResponseSchema)
async def generate_quiz(
    gen_in: QuizGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    level = gen_in.educational_level or (current_user.profile.current_level if current_user.profile else "Undergraduate")
    quiz = await quiz_service.generate_quiz(
        db=db,
        user_id=current_user.id,
        subject=gen_in.subject,
        topic=gen_in.topic,
        educational_level=level,
        difficulty=gen_in.difficulty,
        question_count=gen_in.question_count,
        mode=gen_in.mode,
        time_limit_seconds=gen_in.time_limit_seconds or 300,
        document_id=gen_in.document_id,
        target_pages=gen_in.target_pages
    )
    return quiz

@router.get("/{quiz_id}", response_model=QuizResponseSchema)
def get_quiz(
    quiz_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.user_id == current_user.id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found.")
    return quiz

@router.post("/{quiz_id}/submit", response_model=QuizSubmitResponse)
def submit_quiz(
    quiz_id: str,
    submit_in: QuizSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res_dicts = [r.model_dump() for r in submit_in.responses]
    result = quiz_service.submit_quiz_attempt(
        db=db,
        user_id=current_user.id,
        quiz_id=quiz_id,
        responses=res_dicts,
        time_taken_seconds=submit_in.total_time_taken_seconds
    )
    return result

@router.get("/history/all", response_model=List[QuizAttemptHistoryItem])
def get_quiz_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id
    ).order_by(QuizAttempt.completed_at.desc()).all()

    items = []
    for a in attempts:
        quiz = a.quiz
        items.append({
            "id": a.id,
            "quiz_id": a.quiz_id,
            "quiz_title": quiz.title if quiz else "Quiz Attempt",
            "subject": quiz.subject if quiz else "General",
            "topic": quiz.topic if quiz else "General",
            "score": a.score,
            "total_questions": a.total_questions,
            "percentage": a.percentage,
            "time_taken_seconds": a.time_taken_seconds,
            "completed_at": a.completed_at
        })
    return items
