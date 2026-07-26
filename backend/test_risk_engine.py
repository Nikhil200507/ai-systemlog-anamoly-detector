import urllib.request
import json
import time

BASE_URL = "http://localhost:8000"

def test_risk_scoring_engine():
    print("--- 1. Testing GET /api/status ---")
    req = urllib.request.urlopen(f"{BASE_URL}/api/status")
    status = json.loads(req.read().decode())
    print("Status response:", json.dumps(status, indent=2))

    print("\n--- 2. Triggering Cyberattack Sequences ---")
    for attack in ["BRUTE_FORCE", "CREDENTIAL_MISUSE", "IMPOSSIBLE_TRAVEL", "LATERAL_MOVEMENT"]:
        data = json.dumps({"attack_type": attack}).encode('utf-8')
        headers = {'Content-Type': 'application/json'}
        req = urllib.request.Request(f"{BASE_URL}/api/trigger-attack", data=data, headers=headers)
        res = urllib.request.urlopen(req)
        body = json.loads(res.read().decode())
        print(f"Triggered {attack}:", body)

    time.sleep(1)

    print("\n--- 3. Testing GET /api/risk-scores ---")
    req = urllib.request.urlopen(f"{BASE_URL}/api/risk-scores?limit=10")
    risk_events = json.loads(req.read().decode())
    print(f"Fetched {len(risk_events)} risk-scored events:")
    
    for item in risk_events[:6]:
        print(f"\n[ID: {item['id']} | User: {item['user_id']} | Attack: {item.get('attack_type')}]")
        print(f"  CALCULATED RISK SCORE: {item.get('risk_score')} / 100")
        print(f"  SEVERITY LEVEL: {item.get('severity_level')}")
        print(f"  Contributing Factors ({len(item.get('risk_factors', []))}):")
        for f in item.get('risk_factors', []):
            print(f"    - {f['factor']} (+{f['points']} pts): {f['detail']}")
        print(f"  AI Risk Audit Explanation: {item.get('risk_explanation')}")

        assert 0 <= item.get('risk_score', 0) <= 100, "Risk score must be between 0 and 100!"
        assert item.get('severity_level') in ["Low", "Medium", "High", "Critical"], "Invalid severity level!"

    print("\n--- ALL EXPLAINABLE RISK SCORE TESTS PASSED PERFECTLY! ---")

if __name__ == "__main__":
    test_risk_scoring_engine()
