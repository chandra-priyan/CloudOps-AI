from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["service"] == "cloudops-ai-service"

def test_ai_status_endpoint():
    response = client.get("/api/v1/ai/status")
    assert response.status_code == 200
    assert "model" in response.json()

def test_diagnose_incident_fallback():
    payload = {
        "incidentId": "INC-TEST-99",
        "serviceName": "banking-api",
        "triggerReason": "ENOTFOUND mongodb-primary",
        "logsContext": [
            "[ERROR] getaddrinfo ENOTFOUND mongodb-primary",
            "[FATAL] Connection timed out"
        ],
        "k8sEventsContext": []
    }
    response = client.post("/api/v1/ai/diagnose", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "probableRootCause" in data
    assert "supportingEvidence" in data
    assert len(data["diagnosticCommands"]) > 0
