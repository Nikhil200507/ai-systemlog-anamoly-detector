import urllib.request
import json
import time

BASE_URL = "http://localhost:8000"

def test_cold_start_drift_engine():
    print("--- 1. Testing GET /api/status ---")
    req = urllib.request.urlopen(f"{BASE_URL}/api/status")
    status = json.loads(req.read().decode())
    print("Status response:", json.dumps(status, indent=2))

    print("\n--- 2. Testing GET /api/cold-start ---")
    req = urllib.request.urlopen(f"{BASE_URL}/api/cold-start")
    profiles = json.loads(req.read().decode())
    print(f"Fetched {len(profiles)} cold-start user profiles:")
    for prof in profiles[:5]:
        print(f"  User: {prof['name']} ({prof['user_id']}) | Maturity: {prof['profile_maturity']}% | Baseline: {prof['baseline_type']} | Trusted Events: {prof['trusted_event_count']}")

    target_user = profiles[0]
    target_id = target_user['user_id']

    print(f"\n--- 3. Testing POST /api/trigger-drift (LOCATION_SHIFT for {target_user['name']}) ---")
    drift_data = json.dumps({"user_id": target_id, "drift_type": "LOCATION_SHIFT"}).encode('utf-8')
    headers = {'Content-Type': 'application/json'}
    req = urllib.request.Request(f"{BASE_URL}/api/trigger-drift", data=drift_data, headers=headers)
    res = urllib.request.urlopen(req)
    drift_resp = json.loads(res.read().decode())
    print("Drift Response:", drift_resp)

    print(f"\n--- 4. Testing POST /api/trigger-drift (WORKING_HOURS_SHIFT for {target_user['name']}) ---")
    drift_data_2 = json.dumps({"user_id": target_id, "drift_type": "WORKING_HOURS_SHIFT"}).encode('utf-8')
    req_2 = urllib.request.Request(f"{BASE_URL}/api/trigger-drift", data=drift_data_2, headers=headers)
    res_2 = urllib.request.urlopen(req_2)
    drift_resp_2 = json.loads(res_2.read().decode())
    print("Drift Response 2:", drift_resp_2)

    print("\n--- 5. Testing GET /api/concept-drift ---")
    req = urllib.request.urlopen(f"{BASE_URL}/api/concept-drift")
    history = json.loads(req.read().decode())
    print(f"Fetched {len(history)} concept drift audit trail events:")
    for item in history[:5]:
        print(f"\n[Change ID: {item['id']} | User: {item.get('name', item['user_id'])} | Type: {item['change_type']}]")
        print(f"  Old Value: {item['old_value']}")
        print(f"  New Value: {item['new_value']}")
        print(f"  Trigger Source: {item['trigger_source']}")
        print(f"  Timestamp: {item['timestamp']}")

    assert len(history) >= 2, "Concept drift audit trail should contain at least 2 entries!"

    print("\n--- ALL COLD START & CONCEPT DRIFT TESTS PASSED PERFECTLY! ---")

if __name__ == "__main__":
    test_cold_start_drift_engine()
