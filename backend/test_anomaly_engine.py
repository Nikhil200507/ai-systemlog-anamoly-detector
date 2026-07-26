import urllib.request
import json
import time

BASE_URL = "http://localhost:8000"

def test_anomaly_detection_pipeline():
    print("--- 1. Testing GET /api/status ---")
    req = urllib.request.urlopen(f"{BASE_URL}/api/status")
    status = json.loads(req.read().decode())
    print("Status response:", json.dumps(status, indent=2))
    assert (status.get("is_detector_trained") == True or status.get("is_model_trained") == True), "Model should be trained!"

    print("\n--- 2. Triggering Attack Sequence via POST /api/trigger-attack ---")
    for attack in ["BRUTE_FORCE", "IMPOSSIBLE_TRAVEL", "DEVICE_SPOOFING"]:
        data = json.dumps({"attack_type": attack}).encode('utf-8')
        headers = {'Content-Type': 'application/json'}
        req = urllib.request.Request(f"{BASE_URL}/api/trigger-attack", data=data, headers=headers)
        res = urllib.request.urlopen(req)
        body = json.loads(res.read().decode())
        print(f"Triggered {attack}:", body)

    time.sleep(1)

    print("\n--- 3. Testing GET /api/anomalies ---")
    req = urllib.request.urlopen(f"{BASE_URL}/api/anomalies?limit=5")
    anomalies = json.loads(req.read().decode())
    print(f"Fetched {len(anomalies)} anomalies:")
    for a in anomalies:
        print(f"\n[ID: {a['id']} | User: {a['user_id']} | Attack: {a['attack_type']}]")
        print(f"  Anomaly Score: {a.get('anomaly_score')} (is_anomaly={a.get('is_anomaly')})")
        print(f"  Deviations: {a.get('deviations')}")
        print(f"  AI Explanation: {a.get('explanation')}")

    assert len(anomalies) > 0, "Should have detected anomalies!"
    print("\n--- ALL ANOMALY DETECTION ENGINE TESTS PASSED PERFECTLY! ---")

if __name__ == "__main__":
    test_anomaly_detection_pipeline()
