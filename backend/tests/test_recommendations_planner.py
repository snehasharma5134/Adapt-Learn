def test_recommendations_and_evaluations(client, auth_headers):
    # Fetch recommendations
    rec_resp = client.get("/api/recommendations", headers=auth_headers)
    assert rec_resp.status_code == 200
    recs = rec_resp.json()
    assert len(recs) > 0

    # Comparative evaluation
    eval_resp = client.get("/api/recommendations/evaluation")
    assert eval_resp.status_code == 200
    eval_data = eval_resp.json()
    assert "comparison" in eval_data
    assert len(eval_data["comparison"]) == 3

def test_adaptive_study_planner(client, auth_headers):
    # Generate study plan
    plan_payload = {
        "goal": "Score 95% in Computer Science End-Semesters",
        "daily_study_minutes": 60,
        "subjects": ["Operating Systems", "Computer Networks", "Database Systems"],
        "focus_on_weak_topics": True
    }
    plan_resp = client.post("/api/study-plans/generate", json=plan_payload, headers=auth_headers)
    assert plan_resp.status_code == 200
    plan_data = plan_resp.json()
    assert plan_data["is_active"] is True
    assert len(plan_data["tasks"]) > 0

    task_id = plan_data["tasks"][0]["id"]

    # Mark task completed
    patch_resp = client.patch(f"/api/study-plans/tasks/{task_id}", json={"is_completed": True}, headers=auth_headers)
    assert patch_resp.status_code == 200
    assert patch_resp.json()["is_completed"] is True

def test_flashcards_and_sm2_review(client, auth_headers):
    # Create flashcard
    card_payload = {
        "front_prompt": "What is Amdahl's Law?",
        "back_answer": "It predicts the theoretical speedup in latency of the execution of a task at fixed workload that can be expected of a system whose resources are improved.",
        "subject": "Computer Science",
        "topic": "Computer Architecture"
    }
    card_resp = client.post("/api/flashcards", json=card_payload, headers=auth_headers)
    assert card_resp.status_code == 200
    card_data = card_resp.json()
    card_id = card_data["id"]

    # Perform SM-2 Review (Rating 3: Good)
    rev_payload = {
        "flashcard_id": card_id,
        "rating": 3
    }
    rev_resp = client.post("/api/flashcards/review", json=rev_payload, headers=auth_headers)
    assert rev_resp.status_code == 200
    rev_data = rev_resp.json()
    assert rev_data["new_interval_days"] >= 1
    assert rev_data["xp_earned"] > 0
