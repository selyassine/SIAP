import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.seed_reserving import seed_reserving_data
from tests.conftest import TestingSessionLocal

# Seed test database
with TestingSessionLocal() as db:
    seed_reserving_data(db, artifacts_dir="data/reserving/")

client = TestClient(app)
GRCODE = 7080  # New Jersey Manufacturers Grp

def get_auth_headers():
    r = client.post("/api/v1/auth/login",
                    data={"username": "test_reserving@example.com", "password": "password123"})
    token = r.json().get("access_token")
    if not token:
        # Register user
        client.post("/api/v1/auth/register", json={"email": "test_reserving@example.com", "password": "password123", "full_name": "Test Reserving"})
        r = client.post("/api/v1/auth/login", data={"username": "test_reserving@example.com", "password": "password123"})
        token = r.json()["access_token"]
        
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="module")
def headers():
    return get_auth_headers()

# --- model-info ---
def test_model_info(headers):
    r = client.get("/api/v1/reserving/model-info", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert GRCODE in data["available_grcodes"]
    assert len(data["methods"]) == 4

# --- summary ---
def test_summary_structure(headers):
    r = client.get(f"/api/v1/reserving/summary?grcode={GRCODE}", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert "chain_ladder" in data
    assert "mack" in data
    assert "bornhuetter_ferguson" in data
    assert "bootstrap" in data
    assert "backtest" in data

def test_summary_cl_reserve(headers):
    r = client.get(f"/api/v1/reserving/summary?grcode={GRCODE}", headers=headers)
    cl = r.json()["chain_ladder"]
    # Valeur connue du notebook : 494,113
    assert abs(cl["total_reserve"] - 494113) < 500

def test_summary_mack_ci(headers):
    r = client.get(f"/api/v1/reserving/summary?grcode={GRCODE}", headers=headers)
    mack = r.json()["mack"]
    assert mack["ci_95_lower"] < mack["total_reserve"] < mack["ci_95_upper"]

def test_summary_bf_gt_cl(headers):
    r = client.get(f"/api/v1/reserving/summary?grcode={GRCODE}", headers=headers)
    d = r.json()
    # BF > CL sur ce portefeuille (592k vs 494k)
    assert d["bornhuetter_ferguson"]["total_reserve"] > d["chain_ladder"]["total_reserve"]

# --- triangle ---
def test_triangle_shape(headers):
    r = client.get(f"/api/v1/reserving/triangle?grcode={GRCODE}", headers=headers)
    assert r.status_code == 200
    tri = r.json()["triangle"]
    assert len(tri["origin_years"]) == 10
    assert len(tri["development_lags"]) == 10
    assert len(tri["cumulative_paid"]) == 10

# --- bootstrap ---
def test_bootstrap_histogram(headers):
    r = client.get(f"/api/v1/reserving/bootstrap?grcode={GRCODE}", headers=headers)
    assert r.status_code == 200
    bs = r.json()
    assert len(bs["histogram"]["bins"]) == 41    # 40 buckets → 41 bords
    assert len(bs["histogram"]["counts"]) == 40
    assert sum(bs["histogram"]["counts"]) == 1000  # toutes les simulations comptées

def test_bootstrap_percentile_monotone(headers):
    r = client.get(f"/api/v1/reserving/bootstrap?grcode={GRCODE}", headers=headers)
    pcts = r.json()["percentiles"]
    vals = [pcts[k] for k in ["5", "25", "50", "75", "90", "95", "99"]]
    assert all(vals[i] <= vals[i+1] for i in range(len(vals)-1))

# --- backtest ---
def test_backtest_mape(headers):
    r = client.get(f"/api/v1/reserving/backtest?grcode={GRCODE}", headers=headers)
    assert r.status_code == 200
    assert r.json()["mape_pct"] < 20.0  # seuil de validation actuarielle

# --- auth ---
def test_no_auth_rejected():
    r = client.get(f"/api/v1/reserving/summary?grcode={GRCODE}")
    assert r.status_code == 401

def test_invalid_grcode(headers):
    r = client.get("/api/v1/reserving/summary?grcode=9999", headers=headers)
    assert r.status_code == 404
