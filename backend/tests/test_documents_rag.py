import io
import pymupdf as fitz
import pytest

def create_sample_pdf_bytes() -> bytes:
    doc = fitz.open()

    # Page 1
    page1 = doc.new_page()
    page1.insert_text(
        (50, 72),
        "Thermodynamics Notes - Chapter 1\n\n"
        "The First Law of Thermodynamics states that energy cannot be created or destroyed, "
        "only transformed from one form into another. The change in internal energy is given by "
        "Delta U = Q - W, where Q is heat added to the system and W is work done by the system."
    )

    # Page 2
    page2 = doc.new_page()
    page2.insert_text(
        (50, 72),
        "Heat Engines and Efficiency - Chapter 2\n\n"
        "A heat engine converts thermal energy into mechanical work. "
        "The thermal efficiency eta is defined as the ratio of work done to heat absorbed: "
        "eta = W / Q_in = 1 - (Q_out / Q_in). No engine can be 100% efficient."
    )

    # Page 3
    page3 = doc.new_page()
    page3.insert_text(
        (50, 72),
        "The Carnot Cycle - Chapter 3\n\n"
        "The Carnot cycle represents an idealized thermodynamic cycle with maximum theoretical efficiency. "
        "The Carnot efficiency is given by eta_Carnot = 1 - (T_C / T_H), operating between hot reservoir T_H and cold reservoir T_C."
    )

    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes

def test_upload_and_process_pdf(client, auth_headers):
    pdf_bytes = create_sample_pdf_bytes()
    files = {"file": ("thermodynamics.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    data = {"title": "Thermodynamics Fundamentals", "subject": "Physics"}

    response = client.post("/api/documents/upload", files=files, data=data, headers=auth_headers)
    assert response.status_code == 200
    doc_data = response.json()
    assert doc_data["title"] == "Thermodynamics Fundamentals"
    assert doc_data["status"] == "COMPLETED"
    assert doc_data["page_count"] == 3

    doc_id = doc_data["id"]

    # 1. Query document with RAG (Workflow A)
    chat_payload = {
        "message": "Explain the First Law of Thermodynamics and write its equation.",
        "target_language": "English"
    }
    chat_resp = client.post(f"/api/documents/{doc_id}/chat", json=chat_payload, headers=auth_headers)
    assert chat_resp.status_code == 200
    chat_data = chat_resp.json()
    assert len(chat_data["content"]) > 20
    assert chat_data["grounding_type"] == "document_grounded"
    assert len(chat_data["citations"]) > 0
    # Must cite Page 1 where First Law was inserted!
    assert any(c["page_number"] == 1 for c in chat_data["citations"])

    # 2. Query unrelated concept to verify insufficient evidence detection
    unrelated_payload = {
        "message": "What is the capital city of France according to this note?",
        "target_language": "English"
    }
    unrelated_resp = client.post(f"/api/documents/{doc_id}/chat", json=unrelated_payload, headers=auth_headers)
    assert unrelated_resp.status_code == 200
    unrelated_data = unrelated_resp.json()
    assert unrelated_data["grounding_type"] == "insufficient_evidence"

    # 3. Test summary generation
    sum_resp = client.get(f"/api/documents/{doc_id}/summary", headers=auth_headers)
    assert sum_resp.status_code == 200
    sum_data = sum_resp.json()
    assert "summary" in sum_data
    assert len(sum_data["summary"]) > 10

    # 4. Clean up / delete document
    del_resp = client.delete(f"/api/documents/{doc_id}", headers=auth_headers)
    assert del_resp.status_code == 200
