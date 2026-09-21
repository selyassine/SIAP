import pytest

@pytest.fixture
def auth_token(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "actuary@example.com", "password": "password123", "full_name": "Actuary"}
    )
    res = client.post(
        "/api/v1/auth/login",
        data={"username": "actuary@example.com", "password": "password123"}
    )
    return res.json()["access_token"]

def test_predict_premium_standard(client, auth_token):
    payload = {
        "veh_power": 5,
        "veh_age": 2,
        "driv_age": 40,
        "bonus_malus": 60,
        "density": 100.5,
        "area": "C",
        "veh_brand": "B2",
        "veh_gas": "Regular",
        "region": "R11",
        "exposure": 1.0
    }
    res = client.post(
        "/api/v1/pricing/predict",
        json=payload,
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "pure_premium" in data
    assert "commercial_premium" in data
    assert "risk_level" in data
    assert data["risk_level"] in ["Low", "Medium", "High", "Very High"]

def test_predict_premium_rare_region(client, auth_token):
    payload = {
        "veh_power": 5,
        "veh_age": 2,
        "driv_age": 40,
        "bonus_malus": 60,
        "density": 10.5,
        "area": "C",
        "veh_brand": "B2",
        "veh_gas": "Regular",
        "region": "R41",  # Rare region
        "exposure": 1.0
    }
    res = client.post(
        "/api/v1/pricing/predict",
        json=payload,
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert res.status_code == 200

def test_predict_batch(client, auth_token):
    payload = {
        "policies": [
            {
                "veh_power": 5, "veh_age": 2, "driv_age": 40, "bonus_malus": 60,
                "density": 100.5, "area": "C", "veh_brand": "B2", "veh_gas": "Regular",
                "region": "R11", "exposure": 1.0
            },
            {
                "veh_power": 10, "veh_age": 0, "driv_age": 20, "bonus_malus": 120,
                "density": 500.5, "area": "E", "veh_brand": "B12", "veh_gas": "Diesel",
                "region": "R24", "exposure": 0.5
            }
        ]
    }
    res = client.post(
        "/api/v1/pricing/batch",
        json=payload,
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "results" in data
    assert "summary" in data
    assert data["summary"]["count"] == 2
