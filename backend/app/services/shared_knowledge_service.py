from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.models.shared_knowledge import SharedKnowledgeEntry, UserFeedback
import logging

logger = logging.getLogger(__name__)

class SharedKnowledgeService:
    @staticmethod
    def submit_entry(
        db: Session,
        contributor_id: str,
        subject: str,
        topic: str,
        educational_level: str,
        title: str,
        content: str,
        source_reference: Optional[str] = None
    ) -> SharedKnowledgeEntry:
        """
        Submits educational knowledge to the moderation pipeline.
        Sanitizes and flags as PENDING review.
        """
        entry = SharedKnowledgeEntry(
            contributor_id=contributor_id,
            subject=subject,
            topic=topic,
            educational_level=educational_level,
            title=title.strip(),
            content=content.strip(),
            source_reference=source_reference.strip() if source_reference else None,
            verification_status="PENDING",
            review_notes="Pending academic review and verification"
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry

    @staticmethod
    def review_entry(
        db: Session,
        entry_id: str,
        reviewer_name: str,
        status: str,  # APPROVED, REJECTED
        review_notes: Optional[str] = None
    ) -> SharedKnowledgeEntry:
        entry = db.query(SharedKnowledgeEntry).filter(SharedKnowledgeEntry.id == entry_id).first()
        if not entry:
            raise ValueError("Knowledge entry not found.")

        entry.verification_status = status.upper()
        entry.reviewed_by = reviewer_name
        entry.review_notes = review_notes
        if status.upper() == "APPROVED":
            entry.verified_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(entry)
        return entry

    @staticmethod
    def get_verified_entries(
        db: Session,
        subject: Optional[str] = None,
        topic: Optional[str] = None
    ) -> List[SharedKnowledgeEntry]:
        query = db.query(SharedKnowledgeEntry).filter(
            SharedKnowledgeEntry.verification_status == "APPROVED"
        )
        if subject:
            query = query.filter(SharedKnowledgeEntry.subject.ilike(f"%{subject}%"))
        if topic:
            query = query.filter(SharedKnowledgeEntry.topic.ilike(f"%{topic}%"))
        return query.order_by(SharedKnowledgeEntry.upvotes.desc()).all()

    @staticmethod
    def upvote_entry(db: Session, entry_id: str) -> SharedKnowledgeEntry:
        entry = db.query(SharedKnowledgeEntry).filter(SharedKnowledgeEntry.id == entry_id).first()
        if not entry:
            raise ValueError("Knowledge entry not found.")
        entry.upvotes += 1
        db.commit()
        db.refresh(entry)
        return entry

    @staticmethod
    def submit_feedback(
        db: Session,
        user_id: str,
        feedback_type: str,
        rating: int,
        reference_id: Optional[str] = None,
        comment: Optional[str] = None
    ) -> UserFeedback:
        fb = UserFeedback(
            user_id=user_id,
            feedback_type=feedback_type,
            reference_id=reference_id,
            rating=rating,
            comment=comment
        )
        db.add(fb)
        db.commit()
        db.refresh(fb)
        return fb

shared_knowledge_service = SharedKnowledgeService()
