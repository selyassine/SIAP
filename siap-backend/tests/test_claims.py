import pytest

SAMPLE_CLAIM = {
    "months_as_customer": 120, "age": 35,
    "policy_state": "OH", "policy_csl": "250/500",
    "policy_deductable": 1000, "policy_annual_premium": 1200.0,
    "umbrella_limit": 0, "insured_sex": "MALE",
    "insured_education_level": "College", "insured_occupation": "exec-managerial",
    "insured_hobbies": "reading", "insured_relationship": "husband",
    "capital_gains": 0.0, "capital_loss": 0.0,
    "incident_type": "Multi-vehicle Collision", "collision_type": "Front Collision",
    "incident_severity": "Major Damage", "authorities_contacted": "Police",
    "incident_state": "OH", "incident_city": "Columbus",
    "incident_location": "Main St", "incident_hour_of_the_day": 14,
    "number_of_vehicles_involved": 2, "property_damage": "YES",
    "bodily_injuries": 1, "witnesses": 2, "police_report_available": "YES",
    "total_claim_amount": 15000.0, "injury_claim": 5000.0,
    "property_claim": 5000.0, "vehicle_claim": 5000.0,
    "auto_make": "Honda", "auto_model": "Civic", "auto_year": 2018,
}


@pytest.fixture
def auth_headers(client):
    client.post('/api/v1/auth/register', json={
        'email': 'claims_test@test.com',
        'password': 'test123',
        'full_name': 'Claims Test',
        'company': 'SIAP'
    })
    resp = client.post('/api/v1/auth/login', data={
        'username': 'claims_test@test.com',
        'password': 'test123'
    })
    if resp.status_code == 200:
        token = resp.json()['access_token']
        return {'Authorization': f'Bearer {token}'}
    return {}


def test_create_claim(client, auth_headers):
    r = client.post("/api/v1/claims/create", json=SAMPLE_CLAIM, headers=auth_headers)
    assert r.status_code == 201, r.text
    data = r.json()
    assert data["claim_number"].startswith("CLM-")
    assert data["fraud_score"] is not None
    assert data["fraud_score"] >= 0
    assert data["status"] == "pending"


def test_recent_claims_list(client, auth_headers):
    client.post("/api/v1/claims/create", json=SAMPLE_CLAIM, headers=auth_headers)
    r = client.get("/api/v1/claims/recent", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert data["total"] >= 1
    assert len(data["claims"]) >= 1


def test_claims_stats(client, auth_headers):
    client.post("/api/v1/claims/create", json=SAMPLE_CLAIM, headers=auth_headers)
    r = client.get("/api/v1/claims/stats", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert data["total_claims"] >= 1
    assert "by_risk_level" in data
    assert "by_status" in data


def test_claim_detail_not_found(client, auth_headers):
    r = client.get("/api/v1/claims/999999", headers=auth_headers)
    assert r.status_code == 404


def test_update_claim_status(client, auth_headers):
    create_r = client.post("/api/v1/claims/create", json=SAMPLE_CLAIM, headers=auth_headers)
    claim_id = create_r.json()["id"]
    r = client.patch(
        f"/api/v1/claims/{claim_id}/status?status=reviewed",
        headers=auth_headers
    )
    assert r.status_code == 200
    assert r.json()["status"] == "reviewed"


def test_claim_number_increments(client, auth_headers):
    r1 = client.post("/api/v1/claims/create", json=SAMPLE_CLAIM, headers=auth_headers)
    r2 = client.post("/api/v1/claims/create", json=SAMPLE_CLAIM, headers=auth_headers)
    num1 = r1.json()["claim_number"]
    num2 = r2.json()["claim_number"]
    assert num1 != num2


def test_no_auth_rejected(client):
    r = client.post("/api/v1/claims/create", json=SAMPLE_CLAIM)
    assert r.status_code in (401, 403)
