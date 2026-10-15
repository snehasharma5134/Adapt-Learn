from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class DocumentPageResponse(BaseModel):
    page_number: int
    char_count: int
    text_content: Optional[str] = None

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: str
    user_id: str
    title: str
    original_filename: str
    file_size_bytes: int
    page_count: int
    status: str
    error_message: Optional[str] = None
    subject: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DocumentDetailResponse(DocumentResponse):
    summary: Optional[str] = None
    pages: List[DocumentPageResponse] = []

class DocumentSummaryResponse(BaseModel):
    document_id: str
    title: str
    summary: str
    page_range: Optional[str] = None
    key_concepts: List[str] = []
    important_definitions: List[dict] = []
