def test_register_new_learner(client):
    payload = {
        "email": "rohit.verma@example.edu",
        "password": "SecurePassword123!",
        "display_name": "Rohit Verma",
        "educational_category": "undergraduate",
        "current_level": "BCA 1st Year",
        "institution_or_board": "Delhi University",
        "stream": "Computer Applications",
        "subjects_of_interest": ["C Programming", "Discrete Mathematics"],
        "preferred_language": "Hindi",
        "preferred_style": "intuitive_analogy",
        "learning_goals": "Master algorithms and pass semester exams with distinction",
        "daily_study_minutes": 60
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["display_name"] == "Rohit Verma"
    assert data["educational_level"] == "BCA 1st Year"

def test_login_existing_user(client, test_user):
    response = client.post("/api/auth/login", data={"username": test_user.email, "password": "password123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["display_name"] == "Aarav Sharma"

def test_get_current_user_profile(client, auth_headers):
    response = client.get("/api/users/profile", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["display_name"] == "Aarav Sharma"
    assert data["current_level"] == "B.Tech Computer Science 2nd Year"

def test_update_learner_profile(client, auth_headers):
    update_data = {
        "daily_study_minutes": 90,
        "preferred_style": "step_by_step"
    }
    response = client.patch("/api/users/profile", json=update_data, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["daily_study_minutes"] == 90
    assert data["preferred_style"] == "step_by_step"
