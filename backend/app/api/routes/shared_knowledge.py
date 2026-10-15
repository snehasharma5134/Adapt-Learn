from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.shared_knowledge import SharedKnowledgeEntry
from app.schemas.shared_knowledge import (
    SharedKnowledgeCreate, SharedKnowledgeReviewRequest,
    SharedKnowledgeResponse, FeedbackCreate, FeedbackResponse
)
from app.services.shared_knowledge_service import shared_knowledge_service

router = APIRouter()

@router.get("", response_model=List[SharedKnowledgeResponse])
def get_verified_knowledge(
    subject: Optional[str] = None,
    topic: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return shared_knowledge_service.get_verified_entries(db=db, subject=subject, topic=topic)

@router.post("", response_model=SharedKnowledgeResponse)
def submit_knowledge(
    entry_in: SharedKnowledgeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return shared_knowledge_service.submit_entry(
        db=db,
        contributor_id=current_user.id,
        subject=entry_in.subject,
        topic=entry_in.topic,
        educational_level=entry_in.educational_level,
        title=entry_in.title,
        content=entry_in.content,
        source_reference=entry_in.source_reference
    )

@router.post("/{entry_id}/upvote", response_model=SharedKnowledgeResponse)
def upvote_knowledge(
    entry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return shared_knowledge_service.upvote_entry(db=db, entry_id=entry_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{entry_id}/review", response_model=SharedKnowledgeResponse)
def review_knowledge(
    entry_id: str,
    review_in: SharedKnowledgeReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reviewer_name = current_user.profile.display_name if current_user.profile else "Academic Moderator"
    try:
        return shared_knowledge_service.review_entry(
            db=db,
            entry_id=entry_id,
            reviewer_name=reviewer_name,
            status=review_in.status,
            review_notes=review_in.review_notes
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/feedback", response_model=FeedbackResponse)
def submit_user_feedback(
    fb_in: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return shared_knowledge_service.submit_feedback(
        db=db,
        user_id=current_user.id,
        feedback_type=fb_in.feedback_type,
        rating=fb_in.rating,
        reference_id=fb_in.reference_id,
        comment=fb_in.comment
    )
