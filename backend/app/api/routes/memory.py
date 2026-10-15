from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.memory import PersonalMemoryCreate, PersonalMemoryUpdate, PersonalMemoryResponse
from app.services.memory_service import memory_service

router = APIRouter()

@router.get("", response_model=List[PersonalMemoryResponse])
def get_memories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return memory_service.get_memories(db=db, user_id=current_user.id)

@router.post("", response_model=PersonalMemoryResponse)
def create_memory(
    mem_in: PersonalMemoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return memory_service.create_memory(
        db=db,
        user_id=current_user.id,
        category=mem_in.category,
        memory_text=mem_in.memory_text,
        confidence=mem_in.confidence
    )

@router.patch("/{memory_id}", response_model=PersonalMemoryResponse)
def update_memory(
    memory_id: str,
    mem_in: PersonalMemoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return memory_service.update_memory(
            db=db,
            user_id=current_user.id,
            memory_id=memory_id,
            memory_text=mem_in.memory_text,
            category=mem_in.category
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{memory_id}")
def delete_memory(
    memory_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        memory_service.delete_memory(db=db, user_id=current_user.id, memory_id=memory_id)
        return {"message": "Memory entry deleted."}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/clear/all")
def clear_all_memories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = memory_service.clear_all_memories(db=db, user_id=current_user.id)
    return {"message": f"Successfully cleared {count} personal memories."}
