import urllib.request
import json
import time

BASE_URL = "http://localhost:8000"

def test_fp_reducer_engine():
    print("--- 1. Testing GET /api/status ---")
    req = urllib.request.urlopen(f"{BASE_URL}/api/status")
    status = json.loads(req.read().decode())
    print("Status response:", json.dumps(status, indent=2))

    print("\n--- 2. Triggering Attack Payloads ---")
    for attack in ["BRUTE_FORCE", "DEVICE_SPOOFING"]:
        data = json.dumps({"attack_type": attack}).encode('utf-8')
        headers = {'Content-Type': 'application/json'}
        req = urllib.request.Request(f"{BASE_URL}/api/trigger-attack", data=data, headers=headers)
        res = urllib.request.urlopen(req)
        body = json.loads(res.read().decode())
        print(f"Triggered {attack}:", body)

    time.sleep(1)

    print("\n--- 3. Testing GET /api/false-positives ---")
    req = urllib.request.urlopen(f"{BASE_URL}/api/false-positives?limit=10")
    fp_events = json.loads(req.read().decode())
    print(f"Fetched {len(fp_events)} events with FP decisions:")

    for item in fp_events[:5]:
        print(f"\n[ID: {item['id']} | User: {item['user_id']} | Risk Score: {item.get('risk_score')}]")
        print(f"  DECISION: {item.get('fp_decision')}")
        print(f"  REASON: {item.get('suppression_reason')}")
        print(f"  ANALYST FEEDBACK: {item.get('analyst_feedback')}")

        assert item.get('fp_decision') in ["Suppressed", "Monitor", "Escalate"], "Invalid FP decision!"

    target_event = fp_events[0]
    target_id = target_event['id']

    print("\n--- 4. Testing POST /api/feedback (FALSE_POSITIVE) ---")
    fb_data = json.dumps({"event_id": target_id, "feedback": "FALSE_POSITIVE"}).encode('utf-8')
    headers = {'Content-Type': 'application/json'}
    req = urllib.request.Request(f"{BASE_URL}/api/feedback", data=fb_data, headers=headers)
    res = urllib.request.urlopen(req)
    fb_resp = json.loads(res.read().decode())
    print("Feedback response:", fb_resp)

    print("\n--- 5. Testing POST /api/feedback (CONFIRMED_ATTACK) ---")
    target_id_2 = fp_events[1]['id'] if len(fp_events) > 1 else target_id
    fb_data_2 = json.dumps({"event_id": target_id_2, "feedback": "CONFIRMED_ATTACK"}).encode('utf-8')
    req_2 = urllib.request.Request(f"{BASE_URL}/api/feedback", data=fb_data_2, headers=headers)
    res_2 = urllib.request.urlopen(req_2)
    fb_resp_2 = json.loads(res_2.read().decode())
    print("Feedback response 2:", fb_resp_2)

    print("\n--- 6. Testing GET /api/fp-metrics ---")
    req = urllib.request.urlopen(f"{BASE_URL}/api/fp-metrics")
    metrics = json.loads(req.read().decode())
    print("False Positive Reduction Metrics:", json.dumps(metrics, indent=2))

    assert "total_anomalies" in metrics, "Missing total_anomalies in metrics!"
    assert "false_positive_rate" in metrics, "Missing false_positive_rate in metrics!"
    assert metrics["false_positives"] >= 1, "False positive count should be at least 1!"

    print("\n--- ALL SMART FALSE-POSITIVE REDUCTION TESTS PASSED PERFECTLY! ---")

if __name__ == "__main__":
    test_fp_reducer_engine()
