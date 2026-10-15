import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.core.config import settings
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.document import Document, DocumentPage, DocumentChunk
from app.schemas.document import DocumentResponse, DocumentDetailResponse, DocumentSummaryResponse
from app.schemas.tutor import TutorChatRequest, TutorChatResponse
from app.services.pdf_service import pdf_service
from app.services.rag_service import rag_service
from app.services.streak_rewards_service import streak_rewards_service

router = APIRouter()

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    subject: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate file format
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are currently supported.")

    # Save to disk
    safe_filename = f"{current_user.id}_{int(datetime.now().timestamp())}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_STORAGE_PATH, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)

    doc = Document(
        user_id=current_user.id,
        title=title or file.filename.replace(".pdf", "").replace("_", " ").title(),
        original_filename=file.filename,
        file_path=file_path,
        file_size_bytes=file_size,
        page_count=0,
        status="PENDING",
        subject=subject or "General"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Immediately process the document synchronously for responsive UX
    try:
        pages_data, is_scanned, msg = pdf_service.extract_document(file_path)
        doc.page_count = len(pages_data)

        for p in pages_data:
            dp = DocumentPage(
                document_id=doc.id,
                page_number=p["page_number"],
                text_content=p["text_content"],
                char_count=p["char_count"]
            )
            db.add(dp)

        chunks_data = pdf_service.chunk_document(doc.id, pages_data)
        for c in chunks_data:
            dc = DocumentChunk(
                document_id=doc.id,
                page_number=c["page_number"],
                chunk_index=c["chunk_index"],
                chunk_text=c["chunk_text"],
                metadata_json=c["metadata_json"]
            )
            db.add(dc)

        doc.status = "COMPLETED"
        if is_scanned:
            doc.error_message = msg

        # Award RAG Scholar XP
        streak_rewards_service.record_activity_and_award_xp(
            db=db,
            user_id=current_user.id,
            event_type="DOCUMENT_STUDIED",
            base_xp=25,
            details={"document_id": doc.id, "title": doc.title}
        )

        db.commit()
        db.refresh(doc)
    except Exception as e:
        doc.status = "FAILED"
        doc.error_message = str(e)
        db.commit()
        db.refresh(doc)

    return doc

@router.get("", response_model=List[DocumentResponse])
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Document).filter(
        Document.user_id == current_user.id
    ).order_by(Document.created_at.desc()).all()

@router.get("/{document_id}", response_model=DocumentDetailResponse)
def get_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or unauthorized.")
    return doc

@router.get("/{document_id}/file")
def get_document_file(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    if not doc or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="Document file not found.")
    return FileResponse(
        doc.file_path,
        media_type="application/pdf",
        filename=doc.original_filename
    )

@router.post("/{document_id}/chat", response_model=TutorChatResponse)
async def chat_with_document(
    document_id: str,
    chat_in: TutorChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify user ownership
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or unauthorized.")

    level = chat_in.educational_level or (current_user.profile.current_level if current_user.profile else "Undergraduate")
    lang = chat_in.target_language or (current_user.profile.preferred_language if current_user.profile else "English")

    result = await rag_service.answer_document_query(
        db=db,
        document_id=doc.id,
        query=chat_in.message,
        target_language=lang,
        educational_level=level
    )

    return TutorChatResponse(
        conversation_id=chat_in.conversation_id or "doc_chat",
        message_id=doc.id,
        content=result["answer"],
        citations=result["citations"],
        grounding_type=result["grounding_type"],
        follow_up_suggestions=[
            f"Summarize the key formulas related to this topic.",
            f"Where else in '{doc.title}' is this discussed?",
            f"Generate a 3-question quiz from these pages."
        ],
        created_at=datetime.now(timezone.utc)
    )

@router.get("/{document_id}/summary", response_model=DocumentSummaryResponse)
async def summarize_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or unauthorized.")

    return await rag_service.summarize_document(db=db, document_id=doc.id)

@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or unauthorized.")

    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    return {"message": "Document successfully deleted."}
