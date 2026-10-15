import re
import logging
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session

from app.models.document import Document, DocumentChunk, DocumentPage
from app.services.embedding_service import embedding_service
from app.integrations.llm_provider import llm_provider

logger = logging.getLogger(__name__)

class RAGService:
    @staticmethod
    async def answer_document_query(
        db: Session,
        document_id: str,
        query: str,
        target_language: str = "English",
        educational_level: str = "Undergraduate"
    ) -> Dict[str, Any]:
        """
        Retrieves document content and leverages Generative AI (Gemini / configured LLM)
        to answer any question about the uploaded document with exact page citations.
        """
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise ValueError("Document not found.")

        pages_db = db.query(DocumentPage).filter(
            DocumentPage.document_id == document_id
        ).order_by(DocumentPage.page_number.asc()).all()

        chunks_db = db.query(DocumentChunk).filter(
            DocumentChunk.document_id == document_id
        ).order_by(DocumentChunk.chunk_index.asc()).all()

        if not pages_db and not chunks_db:
            return {
                "answer": f"The document '{document.title}' does not contain any processed text. Please check if the uploaded PDF is a scanned image or empty.",
                "citations": [],
                "grounding_type": "insufficient_evidence"
            }

        # Calculate total text length across pages
        total_chars = sum(len(p.text_content or "") for p in pages_db)

        # Check if user query mentions a specific page (e.g. "page 2", "page 5")
        page_match = re.search(r'\bpage\s*(\d+)\b', query.lower())
        target_page_num = int(page_match.group(1)) if page_match else None

        context_parts = []
        citations = []
        seen_pages = set()

        # Strategy 1: If document is small/medium (<= 30,000 characters or <= 12 pages), feed full document context
        if total_chars <= 30000 or len(pages_db) <= 12:
            for p in pages_db:
                if p.text_content and p.text_content.strip():
                    context_parts.append(f"--- [Page {p.page_number}] ---\n{p.text_content.strip()}")
                    if p.page_number not in seen_pages:
                        seen_pages.add(p.page_number)
                        excerpt = p.text_content.strip()[:180] + ("..." if len(p.text_content.strip()) > 180 else "")
                        citations.append({
                            "document_id": document.id,
                            "document_title": document.title,
                            "page_number": p.page_number,
                            "excerpt": excerpt
                        })
        else:
            # Strategy 2: Hybrid RAG retrieval for large documents
            chunk_dicts = [
                {
                    "id": c.id,
                    "chunk_text": c.chunk_text,
                    "page_number": c.page_number,
                    "chunk_index": c.chunk_index
                }
                for c in chunks_db
            ]

            # Rank chunks using semantic/TF-IDF similarity
            ranked_chunks = embedding_service.rank_chunks(query, chunk_dicts, top_k=8)
            selected_chunks = [c for c, _ in ranked_chunks]

            # If user explicitly asked for a specific page, ensure its chunks are included
            if target_page_num:
                page_chunks = [c for c in chunk_dicts if c["page_number"] == target_page_num]
                for pc in page_chunks:
                    if pc not in selected_chunks:
                        selected_chunks.insert(0, pc)

            # Always ensure first 2 chunks (intro/overview) are included for global context
            for early_chunk in chunk_dicts[:2]:
                if early_chunk not in selected_chunks:
                    selected_chunks.append(early_chunk)

            # Sort selected chunks by page number & index for coherence
            selected_chunks.sort(key=lambda x: (x["page_number"], x.get("chunk_index", 0)))

            for chunk in selected_chunks:
                p_num = chunk["page_number"]
                context_parts.append(f"--- [Page {p_num}] ---\n{chunk['chunk_text']}")
                if p_num not in seen_pages:
                    seen_pages.add(p_num)
                    excerpt = chunk["chunk_text"][:180] + ("..." if len(chunk["chunk_text"]) > 180 else "")
                    citations.append({
                        "document_id": document.id,
                        "document_title": document.title,
                        "page_number": p_num,
                        "excerpt": excerpt
                    })

        context_text = "\n\n".join(context_parts)

        # Generative AI Prompt
        prompt = (
            f"You are the Generative AI Educational Tutor analyzing the student's uploaded document '{document.title}'.\n"
            f"The student has uploaded this study material and is asking a question about it.\n\n"
            f"Target Learner Level: {educational_level}\n"
            f"Preferred Language: {target_language}\n\n"
            f"--- EXTRACTED DOCUMENT TEXT WITH PAGE MARKERS ---\n{context_text}\n\n"
            f"--- STUDENT'S QUESTION ---\n{query}\n\n"
            f"INSTRUCTIONS FOR YOUR RESPONSE:\n"
            f"1. Provide a comprehensive, accurate, and deeply educational response based on the document.\n"
            f"2. CITE SPECIFIC SOURCE PAGES: Whenever referring to concepts, formulas, or facts from the text, cite the page using '[Page X]' (e.g. 'According to [Page 1]...').\n"
            f"3. MULTILINGUAL & HINGLISH SUPPORT: If the student asks in Hindi, Hinglish, or another Indian language, respond naturally and fluently in friendly Hindi/Hinglish with clear English technical terms.\n"
            f"4. RICH FORMATTING: Use Markdown headings, bullet points, and KaTeX math formatting ($...$ for inline, $$...$$ for display equations).\n"
            f"5. INTUITIVE PEDAGOGY: If the student asks for examples, advantages, summaries, or analogies, provide clear, intuitive explanations to make the concept easy to understand, while keeping it grounded in the document.\n"
            f"6. If the student asks a general question or summary of the PDF, synthesize all main points covered across the provided pages."
        )

        system_prompt = (
            "You are an advanced Generative AI tutor specializing in document analysis, STEM, humanities, and exam prep. "
            "You explain complex topics clearly, intuitively, and factually, citing specific source pages using [Page X] markers."
        )

        answer = await llm_provider.generate_text(prompt, system_prompt=system_prompt)

        # Filter citations to only those actually cited in the answer or relevant
        cited_in_text = set(int(m) for m in re.findall(r'\[Page\s*(\d+)\]', answer))
        final_citations = []
        for c in citations:
            if not cited_in_text or c["page_number"] in cited_in_text:
                final_citations.append(c)

        # If model didn't use the exact bracket format, provide the top 3 relevant page citations
        if not final_citations:
            final_citations = citations[:3]

        return {
            "answer": answer,
            "citations": final_citations,
            "grounding_type": "document_grounded"
        }

    @staticmethod
    async def summarize_document(db: Session, document_id: str, page_range: str = "all") -> Dict[str, Any]:
        """Generates an executive summary, key concepts, and definitions from document pages."""
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise ValueError("Document not found.")

        pages = db.query(DocumentPage).filter(
            DocumentPage.document_id == document_id
        ).order_by(DocumentPage.page_number.asc()).all()

        if not pages:
            return {
                "document_id": document_id,
                "title": document.title,
                "summary": "No readable text available to summarize.",
                "page_range": page_range,
                "key_concepts": [],
                "important_definitions": []
            }

        # Build comprehensive sample text from pages
        sample_parts = []
        for p in pages[:10]:
            if p.text_content:
                sample_parts.append(f"[Page {p.page_number}]: {p.text_content[:800]}")
        sample_text = "\n\n".join(sample_parts)

        prompt = (
            f"You are an expert educational summarizer. Analyze the study document '{document.title}'.\n\n"
            f"Document Excerpts:\n{sample_text}\n\n"
            f"Please generate a complete, high-yield revision summary with:\n"
            f"1. ## Executive Summary\n"
            f"A cohesive 2-3 paragraph breakdown of the main themes, objectives, and conclusions.\n\n"
            f"2. ## Key Concepts Covered\n"
            f"Bulleted core principles, theorems, and mechanisms.\n\n"
            f"3. ## Essential Definitions & Formulas\n"
            f"Important terminology and equations formatted with KaTeX ($...$ or $$...$$).\n\n"
            f"4. ## Recommended Self-Test Questions\n"
            f"3-4 high-yield practice questions to test understanding."
        )

        summary_text = await llm_provider.generate_text(prompt)

        # Extract bulleted key concepts from text
        concepts = []
        for line in summary_text.split("\n"):
            line = line.strip()
            if (line.startswith("- ") or line.startswith("* ") or line.startswith("1.") or line.startswith("2.")) and len(line) > 5 and len(line) < 100:
                clean_concept = re.sub(r'^[-*\d\.]+\s*', '', line).strip()
                if clean_concept and clean_concept not in concepts:
                    concepts.append(clean_concept)
            if len(concepts) >= 6:
                break

        if not concepts:
            concepts = ["Core Fundamentals", "Applied Principles", "Problem-Solving Frameworks"]

        return {
            "document_id": document_id,
            "title": document.title,
            "summary": summary_text,
            "page_range": f"Pages 1 to {len(pages)}",
            "key_concepts": concepts,
            "important_definitions": []
        }

rag_service = RAGService()

