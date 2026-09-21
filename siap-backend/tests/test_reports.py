import pytest
from unittest.mock import AsyncMock, patch
from app.db.seed_monitoring import seed_monitoring_data
from tests.conftest import TestingSessionLocal


@pytest.fixture
def auth_headers(client):
    client.post('/api/v1/auth/register', json={
        'email': 'reports_test@test.com',
        'password': 'test123',
        'full_name': 'Reports Test',
        'company': 'SIAP'
    })
    resp = client.post('/api/v1/auth/login', data={
        'username': 'reports_test@test.com',
        'password': 'test123'
    })
    if resp.status_code == 200:
        token = resp.json()['access_token']
        return {'Authorization': f'Bearer {token}'}
    return {}


@pytest.fixture(autouse=True)
def seed_monitoring():
    db = TestingSessionLocal()
    try:
        seed_monitoring_data(db, artifacts_dir="data/monitoring/")
        db.commit()
    finally:
        db.close()


MOCK_COMMENTARY = {
    'synthese_generale': 'Synthèse test du portefeuille.',
    'analyse_fraude': 'Analyse fraude test.',
    'analyse_reserves': 'Analyse réserves test.',
}


@patch(
    'app.services.report_service.ReportService._generate_ai_commentary',
    new_callable=AsyncMock,
    return_value=MOCK_COMMENTARY,
)
def test_generate_report_returns_pdf(mock_commentary, client, auth_headers):
    r = client.post("/api/v1/reports/generate", headers=auth_headers)
    assert r.status_code == 200, r.text
    assert r.headers["content-type"] == "application/pdf"
    assert "attachment" in r.headers["content-disposition"]
    assert r.content[:4] == b"%PDF"
    assert len(r.content) > 5000


def test_generate_report_no_auth_rejected(client):
    r = client.post("/api/v1/reports/generate")
    assert r.status_code == 401
