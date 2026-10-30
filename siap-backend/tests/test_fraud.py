# Authentification réelle via les fixtures de conftest.py. L'ancienne
# substitution globale de get_current_user désactivait l'authentification
# pour toute la session de tests, ce qui faussait les tests « sans jeton ».

valid_claim = {
    "months_as_customer": 120,
    "age": 35,
    "policy_state": "OH",
    "policy_csl": "250/500",
    "policy_deductable": 1000,
    "policy_annual_premium": 1400.0,
    "umbrella_limit": 0,
    "insured_sex": "MALE",
    "insured_education_level": "MD",
    "insured_occupation": "craft-repair",
    "insured_hobbies": "reading",
    "insured_relationship": "husband",
    "capital_gains": 0.0,
    "capital_loss": 0.0,
    "incident_type": "Multi-vehicle Collision",
    "collision_type": "Rear Collision",
    "incident_severity": "Minor Damage",
    "authorities_contacted": "Police",
    "incident_state": "NY",
    "incident_city": "Arlington",
    "incident_location": "9935 4th Drive",
    "incident_hour_of_the_day": 12,
    "number_of_vehicles_involved": 3,
    "property_damage": "?",
    "bodily_injuries": 1,
    "witnesses": 2,
    "police_report_available": "YES",
    "total_claim_amount": 50000.0,
    "injury_claim": 10000.0,
    "property_claim": 10000.0,
    "vehicle_claim": 30000.0,
    "auto_make": "Saab",
    "auto_model": "92x",
    "auto_year": 2004
}

def test_fraud_detect(client, auth_headers):
    response = client.post("/api/v1/fraud/detect", json=valid_claim, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "fraud_score" in data
    assert "risk_level" in data
    assert "alert" in data

def test_fraud_detect_unknown_category(client, auth_headers):
    claim = dict(valid_claim)
    claim["incident_city"] = "Unknown City 123"
    response = client.post("/api/v1/fraud/detect", json=claim, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "fraud_score" in data

def test_fraud_batch(client, auth_headers):
    batch_input = {
        "claims": [valid_claim, valid_claim]
    }
    response = client.post("/api/v1/fraud/batch", json=batch_input, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) == 2
    assert data["summary"]["total_claims"] == 2

def test_fraud_model_info(client, auth_headers):
    response = client.get("/api/v1/fraud/model-info", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "performance" in data
    assert "optimal_threshold" in data


def test_no_auth_rejected(client):
    r = client.post("/api/v1/fraud/detect", json=valid_claim)
    assert r.status_code == 401
