from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class CitationItem(BaseModel):
    document_id: str
    document_title: str
    page_number: int
    excerpt: str

class TutorChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    conversation_id: Optional[str] = None
    document_id: Optional[str] = None
    explanation_depth: Optional[str] = "standard"  # simpler, standard, detailed, step_by_step, analogy, practice_question
    target_language: Optional[str] = None  # None uses user's preferred language
    educational_level: Optional[str] = None

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender: str
    content: str
    citations: List[CitationItem] = []
    created_at: datetime

    class Config:
        from_attributes = True

class TutorChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    content: str
    citations: List[CitationItem] = []
    grounding_type: str = "general_knowledge"  # document_grounded, general_knowledge, insufficient_evidence
    follow_up_suggestions: List[str] = []
    created_at: datetime

class ConversationResponse(BaseModel):
    id: str
    title: str
    conversation_type: str
    document_id: Optional[str] = None
    language: str
    educational_level: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True
