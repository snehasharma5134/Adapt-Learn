from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.models import *  # Ensure all models are registered with Base
from app.services.streak_rewards_service import streak_rewards_service

# Import API routes
from app.api.routes import (
    auth, users, documents, tutor, quizzes,
    learning, recommendations, concept_maps,
    study_plans, flashcards, memory,
    shared_knowledge, analytics, system
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create database tables
    Base.metadata.create_all(bind=engine)
    # Ensure standard achievement milestones exist
    db = SessionLocal()
    try:
        streak_rewards_service.ensure_default_achievements(db)
    finally:
        db.close()
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Multilevel AI/ML-Powered Education Platform supporting UN SDG Goal 4 (Quality Education).",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users & Profiles"])
app.include_router(documents.router, prefix="/api/documents", tags=["Smart Notes Studio & RAG"])
app.include_router(tutor.router, prefix="/api/tutor", tags=["General AI Tutor"])
app.include_router(quizzes.router, prefix="/api/quizzes", tags=["Smart Quiz Arena"])
app.include_router(learning.router, prefix="/api/learning", tags=["Knowledge Gap Detector & Tracing"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Personalized Recommendation Engine"])
app.include_router(concept_maps.router, prefix="/api/concept-maps", tags=["Concept Map Studio"])
app.include_router(study_plans.router, prefix="/api/study-plans", tags=["Adaptive Study Planner"])
app.include_router(flashcards.router, prefix="/api/flashcards", tags=["Flashcards & Spaced Revision"])
app.include_router(memory.router, prefix="/api/memory", tags=["Personal Memory"])
app.include_router(shared_knowledge.router, prefix="/api/shared-knowledge", tags=["Shared Verified Knowledge Base"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Learning Analytics"])
app.include_router(system.router, prefix="/api/system", tags=["System & AI Status"])

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "sdg_goal": "UN SDG 4: Quality Education",
        "tagline": "Learn Smarter. Understand Better. Grow Together.",
        "docs_url": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
