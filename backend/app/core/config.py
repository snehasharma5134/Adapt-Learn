import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Learning Companion"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Security
    SECRET_KEY: str = "super-secret-educational-platform-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = "sqlite:///./learning_companion.db"
    
    # Storage
    UPLOAD_STORAGE_PATH: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")

    # LLM Settings
    LLM_PROVIDER: str = "gemini"  # gemini, openai, groq, ollama, fallback
    LLM_API_KEY: Optional[str] = None
    LLM_MODEL: str = "gemini-3.8-flash"
    
    # Embedding Settings
    EMBEDDING_PROVIDER: str = "heuristic_tfidf"  # heuristic_tfidf, openai, gemini
    EMBEDDING_MODEL: str = "text-embedding-3-small"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    class Config:
        env_file = (
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"),
            ".env"
        )
        extra = "ignore"

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_STORAGE_PATH, exist_ok=True)
