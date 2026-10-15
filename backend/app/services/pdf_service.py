import pymupdf as fitz
import logging
from typing import List, Dict, Any, Tuple
import os

logger = logging.getLogger(__name__)

class PDFService:
    @staticmethod
    def extract_document(file_path: str) -> Tuple[List[Dict[str, Any]], bool, str]:
        """
        Extracts text from a PDF file page-by-page preserving 1-indexed page numbers.
        Returns: (pages_data, is_scanned, message)
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        pages_data = []
        total_chars = 0
        doc = fitz.open(file_path)

        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text").strip()
            char_count = len(text)
            total_chars += char_count

            pages_data.append({
                "page_number": page_num + 1,  # 1-indexed
                "text_content": text,
                "char_count": char_count
            })

        doc.close()

        # Check for scanned or image-only PDF
        is_scanned = False
        message = "Text extraction successful."
        if len(pages_data) > 0 and (total_chars / len(pages_data)) < 30:
            is_scanned = True
            message = "Notice: This document appears to be a scanned image or contains minimal extractable text. OCR is recommended for complete indexing."

        return pages_data, is_scanned, message

    @staticmethod
    def chunk_document(document_id: str, pages_data: List[Dict[str, Any]], chunk_size: int = 500, overlap: int = 100) -> List[Dict[str, Any]]:
        """
        Divides extracted page text into overlapping chunks,
        strictly associating every chunk with its original page number and document ID.
        """
        chunks = []
        global_chunk_idx = 0

        for page in pages_data:
            page_num = page["page_number"]
            text = page["text_content"]

            if not text:
                continue

            # Split into overlapping windows
            start = 0
            while start < len(text):
                end = min(start + chunk_size, len(text))
                chunk_text = text[start:end].strip()

                if len(chunk_text) > 20:  # Skip trivial fragments
                    chunks.append({
                        "document_id": document_id,
                        "page_number": page_num,
                        "chunk_index": global_chunk_idx,
                        "chunk_text": chunk_text,
                        "metadata_json": {
                            "document_id": document_id,
                            "page_number": page_num,
                            "char_start": start,
                            "char_end": end
                        }
                    })
                    global_chunk_idx += 1

                if end == len(text):
                    break
                start += (chunk_size - overlap)

        return chunks

pdf_service = PDFService()
