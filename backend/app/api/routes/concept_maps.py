from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.concept_map import ConceptMapGenerateRequest, ConceptMapResponse
from app.services.concept_map_service import concept_map_service

router = APIRouter()

@router.post("/generate", response_model=ConceptMapResponse)
async def generate_concept_map(
    map_in: ConceptMapGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    level = map_in.educational_level or (current_user.profile.current_level if current_user.profile else "Undergraduate")
    res = await concept_map_service.generate_map(
        db=db,
        subject=map_in.subject,
        topic=map_in.topic,
        educational_level=level,
        document_id=map_in.document_id
    )
    return res
