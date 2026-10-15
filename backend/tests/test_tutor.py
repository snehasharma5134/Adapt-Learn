def test_general_tutor_chat(client, auth_headers):
    # Step 1: Ask initial question without PDF
    payload1 = {
        "message": "Explain binary search and its time complexity.",
        "explanation_depth": "standard",
        "target_language": "English",
        "educational_level": "Undergraduate"
    }
    resp1 = client.post("/api/tutor/chat", json=payload1, headers=auth_headers)
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert "content" in data1
    conv_id = data1["conversation_id"]

    # Step 2: Follow-up question requesting simpler explanation
    payload2 = {
        "message": "Can you explain the divide and conquer part using a simple book searching analogy?",
        "conversation_id": conv_id,
        "explanation_depth": "simpler",
        "target_language": "English"
    }
    resp2 = client.post("/api/tutor/chat", json=payload2, headers=auth_headers)
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["conversation_id"] == conv_id

    # Step 3: Request multilingual explanation in Hindi
    payload3 = {
        "message": "अब इसे संक्षेप में हिंदी में समझाएं।",
        "conversation_id": conv_id,
        "explanation_depth": "standard",
        "target_language": "Hindi"
    }
    resp3 = client.post("/api/tutor/chat", json=payload3, headers=auth_headers)
    assert resp3.status_code == 200
    data3 = resp3.json()
    assert len(data3["content"]) > 10

    # Step 4: Verify conversation history is saved
    conv_resp = client.get(f"/api/tutor/conversations/{conv_id}", headers=auth_headers)
    assert conv_resp.status_code == 200
    conv_data = conv_resp.json()
    # At least user and assistant messages stored
    assert len(conv_data["messages"]) >= 4
