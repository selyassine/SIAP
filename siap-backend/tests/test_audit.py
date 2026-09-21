def test_bias_report_full(client, auth_token):
    r = client.get("/api/v1/audit/bias-report", headers={"Authorization": f"Bearer {auth_token}"})
    assert r.status_code == 200
    data = r.json()
    assert data["equity_score"] == 94.5
    assert data["verdict"] == "FAIBLE RISQUE"
    assert "regulatory_context" in data
    assert data["regulatory_context"]["gender_directive_compliant"] is True

def test_bias_report_summary(client, auth_token):
    r = client.get("/api/v1/audit/bias-report/summary", headers={"Authorization": f"Bearer {auth_token}"})
    assert r.status_code == 200
    data = r.json()
    assert data["equity_score"] == 94.5
    assert data["flags_count"] >= 1

def test_bias_report_contains_shap_decomposition(client, auth_token):
    r = client.get("/api/v1/audit/bias-report", headers={"Authorization": f"Bearer {auth_token}"})
    shap = r.json()["tests"]["shap_decomposition"]
    assert "pure_risk_factors" in shap["category_contribution_pct"]
    assert shap["proxy_total_pct"] > 0

def test_no_auth_rejected(client):
    r = client.get("/api/v1/audit/bias-report")
    assert r.status_code == 401
