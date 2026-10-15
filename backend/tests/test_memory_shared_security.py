def test_personal_memory_crud_and_isolation(client, auth_headers, auth_headers_user_2):
    # User 1 creates memory
    mem_payload = {
        "category": "PREFERENCE",
        "memory_text": "I learn best when calculus equations are accompanied by physical motion graphs.",
        "confidence": 0.95
    }
    create_resp = client.post("/api/memory", json=mem_payload, headers=auth_headers)
    assert create_resp.status_code == 200
    mem_data = create_resp.json()
    mem_id = mem_data["id"]

    # User 1 can fetch their memory
    get_resp = client.get("/api/memory", headers=auth_headers)
    assert get_resp.status_code == 200
    assert any(m["id"] == mem_id for m in get_resp.json())

    # User 2 CANNOT see User 1's memory (Privacy isolation!)
    u2_get = client.get("/api/memory", headers=auth_headers_user_2)
    assert u2_get.status_code == 200
    assert not any(m["id"] == mem_id for m in u2_get.json())

    # User 2 CANNOT delete User 1's memory
    u2_del = client.delete(f"/api/memory/{mem_id}", headers=auth_headers_user_2)
    assert u2_del.status_code == 404

    # User 1 deletes their memory
    u1_del = client.delete(f"/api/memory/{mem_id}", headers=auth_headers)
    assert u1_del.status_code == 200

def test_shared_knowledge_moderation_pipeline(client, auth_headers):
    # Step 1: Submit educational insight (starts PENDING)
    submit_payload = {
        "subject": "Physics",
        "topic": "Special Relativity",
        "educational_level": "Undergraduate",
        "title": "Muon Lifetime Dilation as Empirical Proof",
        "content": "Atmospheric muons produced by cosmic rays reach sea level despite short laboratory half-life, providing direct relativistic time dilation evidence.",
        "source_reference": "Halliday & Resnick Physics Fundamentals"
    }
    sub_resp = client.post("/api/shared-knowledge", json=submit_payload, headers=auth_headers)
    assert sub_resp.status_code == 200
    entry_data = sub_resp.json()
    assert entry_data["verification_status"] == "PENDING"
    entry_id = entry_data["id"]

    # Step 2: Review and Approve entry
    rev_payload = {
        "status": "APPROVED",
        "review_notes": "Factually verified and pedagogically valuable."
    }
    rev_resp = client.post(f"/api/shared-knowledge/{entry_id}/review", json=rev_payload, headers=auth_headers)
    assert rev_resp.status_code == 200
    assert rev_resp.json()["verification_status"] == "APPROVED"

    # Step 3: Verified entry appears in public verified knowledge
    list_resp = client.get("/api/shared-knowledge?subject=Physics")
    assert list_resp.status_code == 200
    assert any(e["id"] == entry_id for e in list_resp.json())

    # Step 4: Upvote entry
    up_resp = client.post(f"/api/shared-knowledge/{entry_id}/upvote", headers=auth_headers)
    assert up_resp.status_code == 200
    assert up_resp.json()["upvotes"] == 1
