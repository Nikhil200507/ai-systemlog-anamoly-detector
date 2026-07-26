import os
import json
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "ai-powered-anamoly-detection", ".env.local"))
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

def get_api_key():
    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or ""
    if key and key.startswith("AIzaSy"):
        return key
    return ""

def build_dynamic_fallback(log, user, deviations):
    """Generates a rich, highly detailed scenario-specific security narrative when Gemini API is unconfigured/invalid"""
    user_name = user.get('name', log.get('user_id', 'Unknown Operator')) if user else log.get('user_id', 'Unknown Operator')
    dept = user.get('department', 'Engineering') if user else 'Engineering'
    home_city = user.get('home_city', 'Home Base') if user else 'Home Base'
    
    attack_type = log.get('attack_type', 'BEHAVIORAL_ANOMALY').upper()
    ip_addr = log.get('ip_address', 'Unknown IP')
    city = log.get('city', 'Unknown City')
    country = log.get('country', '')
    location_str = f"{city}, {country}" if country else city
    target = log.get('resource_accessed', 'Internal Infrastructure')
    failed_cnt = log.get('failed_attempt_count', 0)
    dev_id = log.get('device_id', 'Unrecognized Device')
    score_pct = int(log.get('anomaly_score', 0.8) * 100)

    if "BRUTE" in attack_type or failed_cnt > 0:
        return (
            f"High-severity credential attack detected targeting {user_name} ({dept}). "
            f"Originating from {location_str} ({ip_addr}), {failed_cnt} sequential failed login attempts were recorded before access evaluation. "
            f"This rapid burst contradicts {user_name}'s baseline login pattern from {home_city} (Anomaly Confidence: {score_pct}%)."
        )
    elif "TRAVEL" in attack_type or "IMPOSSIBLE" in attack_type:
        return (
            f"Impossible geographic velocity anomaly flagged for {user_name} ({dept}). "
            f"An active session was established from {location_str} via IP {ip_addr}, which is geographically infeasible relative to {user_name}'s recent baseline in {home_city}. "
            f"This indicates potential session hijacking or stolen token reuse (Anomaly Confidence: {score_pct}%)."
        )
    elif "SPOOF" in attack_type or "DEV" in attack_type:
        return (
            f"Hardware signature mismatch detected for {user_name} ({dept}). "
            f"Access attempt used device ID {dev_id} ({log.get('os', 'Unknown OS')}/{log.get('browser', 'Browser')}) from IP {ip_addr} in {location_str}. "
            f"The environment fingerprint deviates from {user_name}'s registered workstation baseline (Anomaly Confidence: {score_pct}%)."
        )
    elif "LATERAL" in attack_type:
        return (
            f"Suspicious lateral movement pivoting detected by user {user_name} ({dept}). "
            f"Rapid sequential access requests were initiated targeting critical infrastructure asset '{target}' from non-standard IP {ip_addr}. "
            f"This resource is outside {user_name}'s standard departmental authorization profile (Anomaly Confidence: {score_pct}%)."
        )
    elif "MISUSE" in attack_type or "CREDENTIAL" in attack_type:
        return (
            f"Unauthorized credential misuse anomaly detected for {user_name} ({dept}). "
            f"Authenticated session from {location_str} ({ip_addr}) accessed sensitive asset '{target}'. "
            f"The access timing and resource sensitivity conflict with {user_name}'s established baseline (Anomaly Confidence: {score_pct}%)."
        )
    else:
        dev_summary = "; ".join(deviations) if deviations else "Unusual access metrics"
        return (
            f"Behavioral baseline deviation flagged for {user_name} ({dept}). "
            f"Key anomalies: {dev_summary}. "
            f"Target asset: '{target}' from {location_str} via {ip_addr} (Anomaly Confidence: {score_pct}%)."
        )

def generate_explanation(log, user, deviations):
    """Generates a human-readable AI explanation for anomalous security events using Gemini Flash API"""
    if not deviations and log.get('is_anomaly') == 0:
        return "Access event matches expected employee baseline."

    fallback_narrative = build_dynamic_fallback(log, user, deviations)

    api_key = get_api_key()
    if not api_key:
        return fallback_narrative

    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"

    user_name = user.get('name', log.get('user_id', 'Operator')) if user else log.get('user_id', 'Operator')
    dept = user.get('department', 'Engineering') if user else 'Engineering'

    prompt = f"""
You are an expert AI Cyber Security Analyst auditing user entity behavior anomalies (UEBA).
A security event has been flagged as ANOMALOUS by an Isolation Forest machine learning model.

[EMPLOYEE NORMAL BASELINE]
- User ID: {log.get('user_id')}
- Name: {user_name}
- Department: {dept}
- Home City: {user.get('home_city', 'Unknown')} ({user.get('home_country', 'Unknown')})
- Usual Working Hours: {user.get('usual_start_hour', 9)}:00 - {user.get('usual_end_hour', 17)}:00
- Assigned Subnet: {user.get('ip_subnet', '10.x.x.x')}

[CURRENT ANOMALOUS EVENT]
- Event ID: {log.get('id')}
- Timestamp: {log.get('timestamp')}
- Event Type: {log.get('event_type')} (Status: {log.get('login_status')})
- IP Address: {log.get('ip_address')}
- Location: {log.get('city')}, {log.get('country')}
- Device ID: {log.get('device_id')} ({log.get('os')}, {log.get('browser')})
- Resource Accessed: {log.get('resource_accessed')}
- Failed Attempt Count: {log.get('failed_attempt_count')}
- Calculated Anomaly Score: {log.get('anomaly_score')} / 1.00

[DETECTED BEHAVIORAL DEVIATIONS]
{json.dumps(deviations, indent=2)}

Task: Write a concise, 2-3 sentence security analyst explanation explaining WHY this activity deviates from the user's baseline and what security risks it poses. Keep it direct and professional. Do not use markdown bullet points.
"""

    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 150
        }
    }

    try:
        resp = requests.post(endpoint, json=payload, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            candidates = data.get("candidates", [])
            if candidates:
                text = candidates[0]["content"]["parts"][0]["text"].strip()
                if text:
                    return text
        return fallback_narrative
    except Exception:
        return fallback_narrative

def generate_risk_explanation(log, user, risk_score, severity_level, risk_factors):
    """Generates an explanation summarizing the pre-calculated risk score and factor contributions using Gemini Flash"""
    user_name = user.get('name', log.get('user_id', 'User')) if user else log.get('user_id', 'User')
    dept = user.get('department', 'Engineering') if user else 'Engineering'

    factor_texts = [f"{f['factor']} (+{f['points']} pts: {f['detail']})" for f in risk_factors]
    factors_summary = "; ".join(factor_texts) if factor_texts else "Routine employee access metrics."

    fallback_risk_explanation = (
        f"Security Event for {user_name} ({dept}) evaluated at {risk_score}/100 Risk Score ({severity_level} Severity). "
        f"Primary score contributors: {factors_summary}."
    )

    api_key = get_api_key()
    if not api_key:
        return fallback_risk_explanation

    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"

    prompt = f"""
You are an expert AI Security Risk Auditor explaining a pre-calculated Explainable Risk Score.
Do NOT calculate or modify the risk score. Explain strictly why the calculated score reached {risk_score}/100 based on the provided factor contributions.

[PRE-CALCULATED RISK METRICS]
- User: {user_name} ({dept})
- Calculated Risk Score: {risk_score} / 100
- Severity Band: {severity_level}
- Event Target: {log.get('resource_accessed')}
- Origin Location: {log.get('city')}, {log.get('country')} ({log.get('ip_address')})

[FACTOR CONTRIBUTION BREAKDOWN]
{json.dumps(risk_factors, indent=2)}

Task: Write a 2-sentence risk audit explanation explaining why this activity resulted in a {risk_score}/100 ({severity_level}) rating based on the contributing factors above. Do not suggest a different score. Keep it professional.
"""

    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 140
        }
    }

    try:
        resp = requests.post(endpoint, json=payload, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            candidates = data.get("candidates", [])
            if candidates:
                text = candidates[0]["content"]["parts"][0]["text"].strip()
                if text:
                    return text
        return fallback_risk_explanation
    except Exception:
        return fallback_risk_explanation
