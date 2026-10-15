from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.flashcard import Flashcard
from app.schemas.flashcard import (
    FlashcardCreateRequest, FlashcardResponse,
    FlashcardReviewRequest, FlashcardReviewResponse
)
from app.services.revision_service import revision_service

router = APIRouter()

@router.post("", response_model=FlashcardResponse)
def create_flashcard(
    card_in: FlashcardCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    card = Flashcard(
        user_id=current_user.id,
        front_prompt=card_in.front_prompt.strip(),
        back_answer=card_in.back_answer.strip(),
        subject=card_in.subject,
        topic=card_in.topic,
        document_id=card_in.document_id,
        source_page=card_in.source_page
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card

@router.get("", response_model=List[FlashcardResponse])
def get_flashcards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Flashcard).filter(
        Flashcard.user_id == current_user.id
    ).order_by(Flashcard.created_at.desc()).all()

@router.get("/due", response_model=List[FlashcardResponse])
def get_due_flashcards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return revision_service.get_due_flashcards(db=db, user_id=current_user.id)

@router.post("/review", response_model=FlashcardReviewResponse)
def review_flashcard(
    rev_in: FlashcardReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return revision_service.process_review_sm2(
        db=db,
        user_id=current_user.id,
        flashcard_id=rev_in.flashcard_id,
        rating=rev_in.rating
    )
