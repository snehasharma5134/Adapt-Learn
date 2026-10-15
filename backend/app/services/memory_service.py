from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.models.memory import PersonalMemory
import logging

logger = logging.getLogger(__name__)

class MemoryService:
    @staticmethod
    def get_memories(db: Session, user_id: str) -> List[PersonalMemory]:
        return db.query(PersonalMemory).filter(
            PersonalMemory.user_id == user_id
        ).order_by(PersonalMemory.created_at.desc()).all()

    @staticmethod
    def create_memory(db: Session, user_id: str, category: str, memory_text: str, confidence: float = 0.9) -> PersonalMemory:
        mem = PersonalMemory(
            user_id=user_id,
            category=category.upper(),
            memory_text=memory_text.strip(),
            confidence=confidence
        )
        db.add(mem)
        db.commit()
        db.refresh(mem)
        return mem

    @staticmethod
    def update_memory(db: Session, user_id: str, memory_id: str, memory_text: Optional[str] = None, category: Optional[str] = None) -> PersonalMemory:
        mem = db.query(PersonalMemory).filter(
            PersonalMemory.id == memory_id,
            PersonalMemory.user_id == user_id
        ).first()
        if not mem:
            raise ValueError("Personal memory not found or unauthorized.")

        if memory_text:
            mem.memory_text = memory_text.strip()
        if category:
            mem.category = category.upper()
        mem.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(mem)
        return mem

    @staticmethod
    def delete_memory(db: Session, user_id: str, memory_id: str) -> bool:
        mem = db.query(PersonalMemory).filter(
            PersonalMemory.id == memory_id,
            PersonalMemory.user_id == user_id
        ).first()
        if not mem:
            raise ValueError("Personal memory not found or unauthorized.")

        db.delete(mem)
        db.commit()
        return True

    @staticmethod
    def clear_all_memories(db: Session, user_id: str) -> int:
        count = db.query(PersonalMemory).filter(PersonalMemory.user_id == user_id).delete()
        db.commit()
        return count

memory_service = MemoryService()
