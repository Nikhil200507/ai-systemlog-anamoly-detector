import urllib.request
import json

BASE_URL = "http://localhost:8000"

def test_ai_analyst_backend():
    print("--- 1. Testing POST /api/ai-analyst/chat ('What are the most critical threats right now?') ---")
    data = json.dumps({"query": "What are the most critical threats right now?"}).encode('utf-8')
    headers = {'Content-Type': 'application/json'}
    req = urllib.request.Request(f"{BASE_URL}/api/ai-analyst/chat", data=data, headers=headers)
    res = urllib.request.urlopen(req)
    response_1 = json.loads(res.read().decode())
    print("AI SOC Analyst Response 1 keys:", list(response_1.keys()))
    print("Context Summary:", response_1.get('context_summary'))
    print("Follow-up Suggestions:", response_1.get('suggestions'))
    print("AI Text Response Snippet:\n", response_1.get('text')[:300].encode('ascii', 'ignore').decode(), "...\n")

    assert "text" in response_1, "Missing text in AI analyst response!"
    assert "suggestions" in response_1, "Missing suggestions in AI analyst response!"

    print("\n--- 2. Testing Multi-Turn Follow-up Query ('Show me the highest-risk users') ---")
    history = [
        {"role": "user", "content": "What are the most critical threats right now?"},
        {"role": "model", "content": response_1.get('text')}
    ]
    data_2 = json.dumps({"query": "Show me the highest-risk users.", "history": history}).encode('utf-8')
    req_2 = urllib.request.Request(f"{BASE_URL}/api/ai-analyst/chat", data=data_2, headers=headers)
    res_2 = urllib.request.urlopen(req_2)
    response_2 = json.loads(res_2.read().decode())
    print("AI SOC Analyst Response 2 Follow-up Suggestions:", response_2.get('suggestions'))
    print("AI Response 2 Snippet:\n", response_2.get('text')[:350].encode('ascii', 'ignore').decode(), "...\n")

    print("\n--- ALL AI SOC ANALYST BACKEND TESTS PASSED PERFECTLY! ---")

if __name__ == "__main__":
    test_ai_analyst_backend()
