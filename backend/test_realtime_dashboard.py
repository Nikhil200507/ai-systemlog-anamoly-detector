import urllib.request
import json

BASE_URL = "http://localhost:8000"

def test_realtime_dashboard_backend():
    print("--- 1. Testing GET /api/status ---")
    req = urllib.request.urlopen(f"{BASE_URL}/api/status")
    status = json.loads(req.read().decode())
    print("Status response:", json.dumps(status, indent=2))

    print("\n--- 2. Testing GET /api/dashboard-metrics ---")
    req = urllib.request.urlopen(f"{BASE_URL}/api/dashboard-metrics")
    metrics = json.loads(req.read().decode())
    print("Dashboard Metrics response keys:", list(metrics.keys()))
    print("Overview statistics:", json.dumps(metrics['overview'], indent=2))
    print("Model metrics:", json.dumps(metrics['model_metrics'], indent=2))
    print(f"Attack Distribution ({len(metrics['attack_distribution'])} categories):", metrics['attack_distribution'])
    print(f"Severity Distribution ({len(metrics['severity_distribution'])} bands):", metrics['severity_distribution'])
    print(f"High-Risk Users ({len(metrics['high_risk_users'])} top users):", metrics['high_risk_users'])

    assert "overview" in metrics, "Missing overview in dashboard metrics!"
    assert "attack_distribution" in metrics, "Missing attack_distribution in dashboard metrics!"
    assert "model_metrics" in metrics, "Missing model_metrics in dashboard metrics!"

    print("\n--- 3. Testing Attack Injection via /api/trigger-attack ---")
    data = json.dumps({"attack_type": "IMPOSSIBLE_TRAVEL"}).encode('utf-8')
    headers = {'Content-Type': 'application/json'}
    req = urllib.request.Request(f"{BASE_URL}/api/trigger-attack", data=data, headers=headers)
    res = urllib.request.urlopen(req)
    body = json.loads(res.read().decode())
    print("Trigger Attack response:", body)

    print("\n--- ALL REAL-TIME DASHBOARD BACKEND TESTS PASSED PERFECTLY! ---")

if __name__ == "__main__":
    test_realtime_dashboard_backend()
