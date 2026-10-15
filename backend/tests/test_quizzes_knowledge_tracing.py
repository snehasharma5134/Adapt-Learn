def test_generate_and_take_quiz(client, auth_headers):
    # Step 1: Generate quiz on a general topic without PDF
    gen_payload = {
        "subject": "Computer Science",
        "topic": "Graph Algorithms",
        "difficulty": "medium",
        "question_count": 3,
        "mode": "PRACTICE"
    }
    gen_resp = client.post("/api/quizzes/generate", json=gen_payload, headers=auth_headers)
    assert gen_resp.status_code == 200
    quiz_data = gen_resp.json()
    quiz_id = quiz_data["id"]
    questions = quiz_data["questions"]
    assert len(questions) == 3

    # Step 2: Submit answers to quiz
    responses = [
        {"question_id": questions[0]["id"], "selected_option": "A", "time_spent_seconds": 25},
        {"question_id": questions[1]["id"], "selected_option": "B", "time_spent_seconds": 30},
        {"question_id": questions[2]["id"], "selected_option": "A", "time_spent_seconds": 20}
    ]
    submit_payload = {
        "quiz_id": quiz_id,
        "responses": responses,
        "total_time_taken_seconds": 75
    }
    sub_resp = client.post(f"/api/quizzes/{quiz_id}/submit", json=submit_payload, headers=auth_headers)
    assert sub_resp.status_code == 200
    res_data = sub_resp.json()
    assert "score" in res_data
    assert "percentage" in res_data
    assert "xp_earned" in res_data
    assert res_data["xp_earned"] > 0
    assert len(res_data["question_results"]) == 3

    # Step 3: Verify Knowledge Tracing topic mastery updated
    mastery_resp = client.get("/api/learning/mastery", headers=auth_headers)
    assert mastery_resp.status_code == 200
    masteries = mastery_resp.json()
    assert len(masteries) > 0
    graph_mastery = next((m for m in masteries if m["topic"] == "Graph Algorithms"), None)
    assert graph_mastery is not None
    assert graph_mastery["attempts_count"] == 3
    assert 0.0 < graph_mastery["mastery_score"] <= 1.0

    # Step 4: Verify DKT benchmark evaluation endpoint
    dkt_resp = client.get("/api/learning/dkt-benchmark")
    assert dkt_resp.status_code == 200
    dkt_data = dkt_resp.json()
    assert "roc_auc" in dkt_data["metrics"]
    assert "accuracy" in dkt_data["metrics"]
    assert "rmse" in dkt_data["metrics"]
