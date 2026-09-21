from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_drift_summary(auth_headers):
    r = client.get("/api/v1/drift/summary", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert data["stability_score"] == 100.0
    assert data["stability_class"] == "STABLE"
    assert data["n_alerts"] == 0
    assert data["drift_detected"] is False

def test_drift_full_report(auth_headers):
    r = client.get("/api/v1/drift/report", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert len(data["psi_results"]) == 10
    assert data["performance"]["degradation"] is False
    assert all(p["status"] == "STABLE" for p in data["psi_results"]
               if p["psi"] is not None)

def test_drift_psi_values(auth_headers):
    r = client.get("/api/v1/drift/report", headers=auth_headers)
    psi_vals = [p["psi"] for p in r.json()["psi_results"] if p["psi"] is not None]
    assert all(v < 0.10 for v in psi_vals), "Toutes les PSI doivent être < 0.10 (STABLE)"

def test_drift_gini_not_degraded(auth_headers):
    r = client.get("/api/v1/drift/report", headers=auth_headers)
    perf = r.json()["performance"]
    assert perf["gini_delta"] > -0.02, "Gini ne doit pas avoir dégradé de plus de 2 pts"

def test_no_auth_rejected():
    r = client.get("/api/v1/drift/report")
    assert r.status_code == 401
