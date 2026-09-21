import pytest

def test_mc_summary(client, auth_headers):
    r = client.get("/api/v1/monte-carlo/summary", headers=auth_headers)
    assert r.status_code == 200
    d = r.json()
    assert d["reserve_central"] == pytest.approx(494113, abs=100)
    assert d["mean_mc"] > d["reserve_central"]          # drift positif
    assert d["var_99_5"] > d["mean_mc"]                 # VaR > moyenne
    assert d["cvar_99_5"] > d["var_99_5"]               # CVaR > VaR
    assert 5 < d["cv_pct"] < 20                         # CV réaliste
    assert d["capital_buffer_99_5"] > 0

def test_mc_report_full(client, auth_headers):
    r = client.get("/api/v1/monte-carlo/report", headers=auth_headers)
    assert r.status_code == 200
    d = r.json()
    assert d["methodology"]["n_simulations"] == 100_000
    assert len(d["scenarios"]) == 4
    assert len(d["ldf_params"]) == 9

def test_mc_scenarios_ordered(client, auth_headers):
    r = client.get("/api/v1/monte-carlo/scenarios", headers=auth_headers)
    reserves = [s["reserve"] for s in r.json()]
    assert reserves == sorted(reserves)     # Central < Mild < Moderate < Severe

def test_mc_histogram_not_empty(client, auth_headers):
    r = client.get("/api/v1/monte-carlo/histogram", headers=auth_headers)
    assert r.status_code == 200
    assert len(r.json()) > 0

def test_no_auth_rejected(client):
    r = client.get("/api/v1/monte-carlo/report")
    assert r.status_code == 401
