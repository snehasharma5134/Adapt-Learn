from typing import Optional, List
from pydantic import BaseModel, Field

class ConceptMapGenerateRequest(BaseModel):
    subject: str
    topic: str
    educational_level: Optional[str] = None
    document_id: Optional[str] = None

class ConceptNode(BaseModel):
    id: str
    label: str
    description: str
    category: str = "core"  # core, subtopic, application, prerequisite
    source_page: Optional[int] = None
    importance: float = 1.0  # 1.0 to 3.0 scale for node sizing

class ConceptEdge(BaseModel):
    id: str
    source: str
    target: str
    relationship: str  # e.g., "leads to", "requires", "part of", "example of"
    is_prerequisite: bool = False

class ConceptMapResponse(BaseModel):
    topic: str
    subject: str
    educational_level: str
    nodes: List[ConceptNode]
    edges: List[ConceptEdge]
    summary: str
    document_title: Optional[str] = None
