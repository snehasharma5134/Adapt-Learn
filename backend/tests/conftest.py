import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import Base, get_db
from app.main import app
from app.core.security import create_access_token
from app.models.user import User, UserProfile, UserConsent
from app.core.security import get_password_hash

# Use in-memory SQLite for high-speed isolated automated test execution
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(db_session):
    user = User(
        email="student@companion.edu",
        hashed_password=get_password_hash("password123"),
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    profile = UserProfile(
        user_id=user.id,
        display_name="Aarav Sharma",
        educational_category="undergraduate",
        current_level="B.Tech Computer Science 2nd Year",
        subjects_of_interest=["Data Structures", "Computer Architecture", "Physics"],
        preferred_language="English",
        preferred_style="intuitive_analogy",
        daily_study_minutes=60
    )
    db_session.add(profile)

    consent = UserConsent(user_id=user.id)
    db_session.add(consent)

    db_session.commit()
    return user

@pytest.fixture
def user_token(test_user):
    return create_access_token(subject=test_user.id)

@pytest.fixture
def auth_headers(user_token):
    return {"Authorization": f"Bearer {user_token}"}

@pytest.fixture
def test_user_2(db_session):
    user = User(
        email="second_student@companion.edu",
        hashed_password=get_password_hash("password123"),
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    profile = UserProfile(
        user_id=user.id,
        display_name="Priya Patel",
        educational_category="secondary",
        current_level="Class 10 CBSE",
        subjects_of_interest=["Mathematics", "Science"],
        preferred_language="Hindi",
        daily_study_minutes=45
    )
    db_session.add(profile)
    db_session.commit()
    return user

@pytest.fixture
def auth_headers_user_2(test_user_2):
    token = create_access_token(subject=test_user_2.id)
    return {"Authorization": f"Bearer {token}"}
