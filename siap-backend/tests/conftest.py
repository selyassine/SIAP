"""Configuration commune des tests.

Les tests utilisent la même base que l'application : au démarrage, celle-ci y
charge ses données (réserves, pilotage). Rediriger les tests vers une autre base
la laissait vide, d'où des 404 sur les routes de pilotage.
"""
import os
import uuid

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("SECRET_KEY", "secret-de-test")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402

# Utilisé par certains tests pour préparer des données : même base que l'API.
TestingSessionLocal = SessionLocal


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def auth_token(client):
    """Crée un utilisateur unique et renvoie un jeton d'accès valide."""
    email = f"pytest_{uuid.uuid4().hex[:10]}@siap.test"
    r = client.post("/api/v1/auth/register",
                    json={"email": email, "password": "test1234", "full_name": "Pytest"})
    assert r.status_code == 200, r.text
    r = client.post("/api/v1/auth/login", data={"username": email, "password": "test1234"})
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}
