from fastapi.testclient import TestClient
from app.main import app
import pytest

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture
def auth_headers(client):
    client.post('/api/v1/auth/register', json={
        'email': 'monitor_test@test.com', 'password': 'test123',
        'full_name': 'Test Monitor', 'company': 'Test'
    })
    resp = client.post('/api/v1/auth/login', data={'username': 'monitor_test@test.com', 'password': 'test123'})
    if resp.status_code == 200:
        token = resp.json()['access_token']
        return {'Authorization': f'Bearer {token}'}
    return {}

def test_dashboard_loads(client, auth_headers):
    r = client.get("/api/v1/monitoring/dashboard", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "global_kpis" in data
    assert "fraud_stats" in data
    assert "reserves_summary" in data
    assert "top_risky_regions" in data
    assert len(data["top_risky_regions"]) == 5

def test_global_kpis_values(client, auth_headers):
    r = client.get("/api/v1/monitoring/global-kpis", headers=auth_headers)
    assert r.status_code == 200
    kpis = r.json()["kpis"]
    assert abs(kpis["loss_ratio"] - 0.5462) < 0.001
    assert abs(kpis["frequency"]  - 0.1007) < 0.001
    assert kpis["combined_ratio"] > kpis["loss_ratio"]

def test_regions_count(client, auth_headers):
    r = client.get("/api/v1/monitoring/regions", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["total_regions"] == 22

def test_trends_annual(client, auth_headers):
    r = client.get("/api/v1/monitoring/trends", headers=auth_headers)
    assert r.status_code == 200
    annual = r.json()["annual"]
    assert len(annual) == 10        # 2006-2015 tous en base
    assert annual[0]["year"] == 2006
    assert annual[-1]["year"] == 2015

def test_trends_quarterly(client, auth_headers):
    r = client.get("/api/v1/monitoring/trends", headers=auth_headers)
    assert len(r.json()["quarterly"]) == 37

def test_fraud_stats(client, auth_headers):
    r = client.get("/api/v1/monitoring/fraud-stats", headers=auth_headers)
    assert r.status_code == 200
    g = r.json()["global_stats"]
    assert 10.0 <= g["fraud_rate_pct"] <= 35.0
    assert g["avg_fraud_amount"] > g["avg_legit_amount"]

def test_reserves_total(client, auth_headers):
    r = client.get("/api/v1/monitoring/reserves", headers=auth_headers)
    assert r.status_code == 200
    summary = r.json()["summary"]
    assert abs(summary["total_ibnr"] - 494112) < 2

def test_reserves_summary_in_dashboard(client, auth_headers):
    """Vérifier que reserves_summary est bien un objet Pydantic et non un dict imbriqué."""
    r = client.get("/api/v1/monitoring/dashboard", headers=auth_headers)
    rs = r.json()["reserves_summary"]
    assert "total_ibnr" in rs
    assert "ibnr_to_premium_ratio" in rs
    assert abs(rs["total_ibnr"] - 494112) < 2

def test_no_auth_rejected(client):
    r = client.get("/api/v1/monitoring/dashboard")
    assert r.status_code == 401

def test_dashboard_excludes_partial_2015(client, auth_headers):
    """2015 ne doit pas apparaître dans latest_yearly_trend (données partielles)."""
    r = client.get("/api/v1/monitoring/dashboard", headers=auth_headers)
    years = [row["year"] for row in r.json()["latest_yearly_trend"]]
    assert 2015 not in years
