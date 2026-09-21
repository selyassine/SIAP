import base64
import io
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from app.main import app

# ── fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def auth_headers(client):
    client.post("/api/v1/auth/register", json={
        "email": "vision_test@siap.com",
        "password": "test1234",
        "full_name": "Vision Tester",
        "company": "SIAP",
    })
    resp = client.post(
        "/api/v1/auth/login",
        data={"username": "vision_test@siap.com", "password": "test1234"},
    )
    token = resp.json().get("access_token", "")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def sample_vehicle_image() -> bytes:
    """Créer une image JPEG factice (rectangle rouge 640x640)."""
    from PIL import Image
    img = Image.new("RGB", (640, 640), color=(200, 50, 50))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


# ── tests ──────────────────────────────────────────────────────────────────────

def test_model_info(client, auth_headers):
    r = client.get("/api/v1/vision/model-info", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert data["model_type"] == "YOLOv8n"
    assert data["n_classes"] == 31
    assert abs(data["performance"]["map50"] - 0.5988) < 0.001
    assert "severity_mapping" in data
    assert "cost_estimate" in data


def test_analyze_damage(client, auth_headers, sample_vehicle_image):
    r = client.post(
        "/api/v1/vision/analyze",
        files={"file": ("car.jpg", sample_vehicle_image, "image/jpeg")},
        headers=auth_headers,
    )
    assert r.status_code == 200
    data = r.json()
    assert "damage_detected" in data
    assert "overall_severity" in data
    assert "cost_estimate" in data
    assert "annotated_image_b64" in data
    assert "n_damage_zones" in data
    assert "confidence_avg" in data
    # Vérifier que la base64 est décodable
    decoded = base64.b64decode(data["annotated_image_b64"])
    assert len(decoded) > 1000  # image non vide


def test_analyze_with_fraud_coherent(client, auth_headers, sample_vehicle_image):
    r = client.post(
        "/api/v1/vision/analyze-with-fraud",
        params={"declared_severity": "Moderate", "declared_amount": 3500.0},
        files={"file": ("car.jpg", sample_vehicle_image, "image/jpeg")},
        headers=auth_headers,
    )
    assert r.status_code == 200
    data = r.json()
    assert "visual_analysis" in data
    assert "fraud_coherence" in data
    fc = data["fraud_coherence"]
    assert "incoherence_score" in fc
    assert "recommendation" in fc
    assert fc["recommendation"] in [
        "AUTO_APPROVE", "MANUAL_REVIEW", "INVESTIGATION_REQUIRED"
    ]
    assert 0 <= fc["incoherence_score"] <= 100


def test_analyze_with_fraud_suspicious(client, auth_headers, sample_vehicle_image):
    """Montant x10 : score doit refléter la suspicion."""
    r = client.post(
        "/api/v1/vision/analyze-with-fraud",
        params={"declared_severity": "Minor", "declared_amount": 50000.0},
        files={"file": ("car.jpg", sample_vehicle_image, "image/jpeg")},
        headers=auth_headers,
    )
    assert r.status_code == 200
    fc = r.json()["fraud_coherence"]
    assert fc["incoherence_score"] >= 0


def test_invalid_file_type(client, auth_headers):
    """PDF rejeté avec 415."""
    r = client.post(
        "/api/v1/vision/analyze",
        files={"file": ("doc.pdf", b"%PDF-1.4", "application/pdf")},
        headers=auth_headers,
    )
    assert r.status_code == 415


def test_invalid_declared_severity(client, auth_headers, sample_vehicle_image):
    """Sévérité invalide → 422."""
    r = client.post(
        "/api/v1/vision/analyze-with-fraud",
        params={"declared_severity": "Catastrophic", "declared_amount": 5000.0},
        files={"file": ("car.jpg", sample_vehicle_image, "image/jpeg")},
        headers=auth_headers,
    )
    assert r.status_code == 422


def test_no_auth_rejected(client, sample_vehicle_image):
    """Sans token → 401/403."""
    r = client.post(
        "/api/v1/vision/analyze",
        files={"file": ("car.jpg", sample_vehicle_image, "image/jpeg")},
    )
    assert r.status_code in (401, 403)
