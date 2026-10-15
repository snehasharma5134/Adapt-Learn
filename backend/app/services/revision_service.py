from datetime import date, datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.flashcard import Flashcard, FlashcardReview
from app.services.streak_rewards_service import streak_rewards_service
import logging

logger = logging.getLogger(__name__)

class RevisionService:
    @staticmethod
    def process_review_sm2(
        db: Session,
        user_id: str,
        flashcard_id: str,
        rating: int  # 1: Again, 2: Hard, 3: Good, 4: Easy
    ) -> Dict[str, Any]:
        """
        Executes SuperMemo SM-2 algorithm update on flashcard.
        """
        card = db.query(Flashcard).filter(
            Flashcard.id == flashcard_id,
            Flashcard.user_id == user_id
        ).first()

        if not card:
            raise ValueError("Flashcard not found.")

        # Map rating to SM-2 scale (1->1, 2->2, 3->4, 4->5)
        sm2_q = {1: 1, 2: 2, 3: 4, 4: 5}.get(rating, 3)

        # Update Ease Factor
        ef = card.ease_factor
        new_ef = ef + (0.1 - (5 - sm2_q) * (0.08 + (5 - sm2_q) * 0.02))
        new_ef = max(1.3, round(new_ef, 3))  # SM-2 minimum floor 1.3

        if sm2_q < 3:
            # Failed / hard recall
            new_reps = 0
            new_interval = 1
        else:
            # Successful recall
            if card.repetition_count == 0:
                new_interval = 1
            elif card.repetition_count == 1:
                new_interval = 6
            else:
                new_interval = max(1, int(round(card.interval_days * new_ef)))
            new_reps = card.repetition_count + 1

        today = date.today()
        card.ease_factor = new_ef
        card.interval_days = new_interval
        card.repetition_count = new_reps
        card.next_review_date = today + timedelta(days=new_interval)
        card.last_reviewed_at = datetime.now(timezone.utc)

        # Record review event
        rev = FlashcardReview(
            flashcard_id=card.id,
            user_id=user_id,
            rating=rating
        )
        db.add(rev)

        # Reward XP
        xp_res = streak_rewards_service.record_activity_and_award_xp(
            db=db,
            user_id=user_id,
            event_type="FLASHCARD_REVIEWED",
            base_xp=15,
            details={"flashcard_id": card.id, "rating": rating}
        )

        db.commit()
        db.refresh(card)

        return {
            "flashcard_id": card.id,
            "new_interval_days": card.interval_days,
            "new_ease_factor": card.ease_factor,
            "next_review_date": card.next_review_date,
            "xp_earned": xp_res["xp_awarded"]
        }

    @staticmethod
    def get_due_flashcards(db: Session, user_id: str) -> List[Flashcard]:
        today = date.today()
        return db.query(Flashcard).filter(
            Flashcard.user_id == user_id,
            Flashcard.next_review_date <= today
        ).all()

revision_service = RevisionService()
