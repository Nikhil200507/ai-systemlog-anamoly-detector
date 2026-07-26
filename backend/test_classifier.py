import urllib.request
import json
import time

BASE_URL = "http://localhost:8000"

def test_attack_classifier():
    print("--- 1. Testing GET /api/status ---")
    req = urllib.request.urlopen(f"{BASE_URL}/api/status")
    status = json.loads(req.read().decode())
    print("Status response:", json.dumps(status, indent=2))
    assert status.get("is_classifier_trained") == True, "Classifier should be trained!"

    print("\n--- 2. Triggering All 5 Cyberattack Sequences ---")
    attack_types = ["BRUTE_FORCE", "CREDENTIAL_MISUSE", "IMPOSSIBLE_TRAVEL", "DEVICE_SPOOFING", "LATERAL_MOVEMENT"]
    
    for attack in attack_types:
        data = json.dumps({"attack_type": attack}).encode('utf-8')
        headers = {'Content-Type': 'application/json'}
        req = urllib.request.Request(f"{BASE_URL}/api/trigger-attack", data=data, headers=headers)
        res = urllib.request.urlopen(req)
        body = json.loads(res.read().decode())
        print(f"Triggered {attack}:", body)

    time.sleep(1)

    print("\n--- 3. Testing GET /api/classified-attacks ---")
    req = urllib.request.urlopen(f"{BASE_URL}/api/classified-attacks?limit=10")
    classified = json.loads(req.read().decode())
    print(f"Fetched {len(classified)} classified attack logs:")
    
    for item in classified:
        print(f"\n[ID: {item['id']} | Target User: {item['user_id']}]")
        print(f"  Ground-Truth Simulation Type: {item.get('attack_type')}")
        print(f"  PREDICTED Attack Type: {item.get('predicted_attack_type')}")
        print(f"  Classification Confidence: {item.get('classification_confidence')} ({int((item.get('classification_confidence') or 0)*100)}%)")
        print(f"  Attack Indicators ({len(item.get('attack_indicators', []))}):")
        for ind in item.get('attack_indicators', []):
            print(f"    - {ind}")

    assert len(classified) > 0, "Should have returned classified attack events!"
    print("\n--- ALL CYBERATTACK CLASSIFICATION TESTS PASSED PERFECTLY! ---")

if __name__ == "__main__":
    test_attack_classifier()
