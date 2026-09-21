import pytest

def test_ew_summary(client, auth_headers):
    r = client.get("/api/v1/early-warning/summary", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert data["global_score"] == 100.0
    assert data["classification"] == "ROUGE"
    assert data["n_alerts_forte"] == 2
    assert data["reserve_standard"] == pytest.approx(494113, abs=5)

def test_ew_full_report(client, auth_headers):
    r = client.get("/api/v1/early-warning/report", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert len(data["alerts"]) == 4
    assert len(data["lag_details"]) == 9
    assert "ldf_series" in data

def test_ew_ldf_series_specific_lag(client, auth_headers):
    r = client.get("/api/v1/early-warning/ldf-series?lag=2->3",
                   headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "2->3" in data
    assert len(data["2->3"]["historical"]) > 0
    assert len(data["2->3"]["forecast"]) == 2

def test_ew_lag_details(client, auth_headers):
    r = client.get("/api/v1/early-warning/lag-details", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 9
    forte = [d for d in data if d["alert_level"] == "FORTE"]
    assert len(forte) == 2

def test_no_auth_rejected(client):
    r = client.get("/api/v1/early-warning/summary")
    assert r.status_code == 401
