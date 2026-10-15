from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User, UserProfile, UserConsent
from app.models.learning import LearningStreak
from app.schemas.auth import Token, UserRegister, UserLogin, UserResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # Create User
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create Flexible Learner Profile
    profile = UserProfile(
        user_id=user.id,
        display_name=user_in.display_name,
        educational_category=user_in.educational_category,
        current_level=user_in.current_level,
        institution_or_board=user_in.institution_or_board,
        stream=user_in.stream,
        subjects_of_interest=user_in.subjects_of_interest or ["Science", "Mathematics"],
        preferred_language=user_in.preferred_language,
        preferred_style=user_in.preferred_style,
        learning_goals=user_in.learning_goals,
        daily_study_minutes=user_in.daily_study_minutes
    )
    db.add(profile)

    # Create Consent
    consent = UserConsent(
        user_id=user.id,
        age_group="adult" if "school" not in user_in.educational_category.lower() else "13_to_17",
        telemetry_allowed=True,
        shared_contribution_allowed=False
    )
    db.add(consent)

    # Create Streak
    streak = LearningStreak(
        user_id=user.id,
        current_streak=1,
        longest_streak=1,
        total_xp=50
    )
    db.add(streak)

    db.commit()

    token = create_access_token(subject=user.id)
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        display_name=profile.display_name,
        educational_level=profile.current_level,
        preferred_language=profile.preferred_language
    )

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is deactivated.")

    token = create_access_token(subject=user.id)
    profile = user.profile
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        display_name=profile.display_name if profile else "Learner",
        educational_level=profile.current_level if profile else "Undergraduate",
        preferred_language=profile.preferred_language if profile else "English"
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user
