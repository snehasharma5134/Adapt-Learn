from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, UserProfile, UserConsent
from app.schemas.profile import ProfileUpdate, ProfileResponse, ConsentUpdate, ConsentResponse

router = APIRouter()

@router.get("/profile", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    if not current_user.profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return current_user.profile

@router.patch("/profile", response_model=ProfileResponse)
def update_profile(
    profile_in: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = current_user.profile
    if not profile:
        profile = UserProfile(user_id=current_user.id, display_name="Learner")
        db.add(profile)

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    profile.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/consent", response_model=ConsentResponse)
def get_consent(current_user: User = Depends(get_current_user)):
    if not current_user.consent:
        raise HTTPException(status_code=404, detail="Consent settings not found.")
    return current_user.consent

@router.patch("/consent", response_model=ConsentResponse)
def update_consent(
    consent_in: ConsentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    consent = current_user.consent
    if not consent:
        consent = UserConsent(user_id=current_user.id)
        db.add(consent)

    update_data = consent_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(consent, field, value)

    consent.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(consent)
    return consent
