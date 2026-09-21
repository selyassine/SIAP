import pytest

@pytest.fixture
def auth_headers(client):
    client.post('/api/v1/auth/register', json={
        'email': 'assistant_test@test.com',
        'password': 'test123',
        'full_name': 'Assistant Test',
        'company': 'SIAP'
    })
    resp = client.post('/api/v1/auth/login', data={
        'username': 'assistant_test@test.com',
        'password': 'test123'
    })
    if resp.status_code == 200:
        token = resp.json()['access_token']
        return {'Authorization': f'Bearer {token}'}
    return {}


def test_chat_monitoring_question(client, auth_headers):
    r = client.post(
        "/api/v1/assistant/chat",
        json={"message": "Quel est le loss ratio actuel ?", "history": []},
        headers=auth_headers
    )
    assert r.status_code == 200
    data = r.json()
    assert "response" in data
    assert len(data["response"]) > 20
    assert "monitoring" in data["intents_detected"]

def test_chat_fraud_question(client, auth_headers):
    r = client.post(
        "/api/v1/assistant/chat",
        json={"message": "Quel est le taux de fraude ?", "history": []},
        headers=auth_headers
    )
    assert r.status_code == 200
    assert "fraud" in r.json()["intents_detected"]

def test_chat_with_history(client, auth_headers):
    history = [
        {"role": "user", "content": "Quel est le loss ratio ?"},
        {"role": "assistant", "content": "Le loss ratio est de 54.62%."}
    ]
    r = client.post(
        "/api/v1/assistant/chat",
        json={
            "message": "Et le combined ratio ?",
            "history": history
        },
        headers=auth_headers
    )
    assert r.status_code == 200

def test_empty_message_rejected(client, auth_headers):
    r = client.post(
        "/api/v1/assistant/chat",
        json={"message": "", "history": []},
        headers=auth_headers
    )
    assert r.status_code == 400

def test_capabilities(client, auth_headers):
    r = client.get("/api/v1/assistant/capabilities", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "quick_questions" in data
    assert len(data["quick_questions"]) >= 5

def test_no_auth_rejected(client):
    r = client.post(
        "/api/v1/assistant/chat",
        json={"message": "test", "history": []}
    )
    assert r.status_code == 401
