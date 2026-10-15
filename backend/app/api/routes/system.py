from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel
from app.integrations.llm_provider import llm_provider
from app.core.config import settings

router = APIRouter()

class AIConfigPayload(BaseModel):
    api_key: str
    provider: str = "gemini"
    model: Optional[str] = None

@router.get("/status")
def get_system_status():
    ai_status = llm_provider.get_status()
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ai_engine": ai_status,
        "database": {
            "type": "sqlite" if settings.DATABASE_URL.startswith("sqlite") else "postgresql",
            "status": "connected"
        },
        "supported_languages": [
            {"code": "en", "name": "English"},
            {"code": "hi", "name": "Hindi (हिन्दी)"},
            {"code": "bn", "name": "Bengali (বাংলা)"},
            {"code": "mr", "name": "Marathi (मराठी)"},
            {"code": "te", "name": "Telugu (తెలుగు)"},
            {"code": "ta", "name": "Tamil (தமிழ்)"},
            {"code": "gu", "name": "Gujarati (ગુજરાતી)"},
            {"code": "kn", "name": "Kannada (ಕನ್ನಡ)"},
            {"code": "ml", "name": "Malayalam (മലയാളം)"},
            {"code": "pa", "name": "Punjabi (ਪੰਜਾਬੀ)"},
            {"code": "or", "name": "Odia (ଓଡ଼ିଆ)"}
        ]
    }

@router.post("/configure-ai")
def configure_ai(payload: AIConfigPayload):
    """Dynamically set external LLM API key at runtime."""
    llm_provider.set_api_key(
        api_key=payload.api_key,
        provider=payload.provider,
        model=payload.model
    )
    return {
        "status": "success",
        "message": "AI configuration updated successfully.",
        "ai_engine": llm_provider.get_status()
    }
