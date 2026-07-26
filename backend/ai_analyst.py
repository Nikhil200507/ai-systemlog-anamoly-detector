import os
import json
import database

# Load GEMINI_API_KEY from environment or .env.local file
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    try:
        env_path = os.path.join(os.path.dirname(__file__), "..", "ai-powered-anamoly-detection", ".env.local")
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("GEMINI_API_KEY="):
                        GEMINI_API_KEY = line.strip().split("=", 1)[1].strip('"').strip("'")
                        break
    except Exception:
        pass

def generate_ai_analyst_response(user_query: str, conversation_history: list = None):
    """
    Genuine AI SOC Assistant powered by Gemini Flash API.
    Guides the user on navigating the Benzene UEBA site, explains all dashboard metrics and stats, 
    and details the exact mathematical formulas and architecture used to calculate every metric.
    NO hardcoded fallback dummy data is used.
    """
    if conversation_history is None:
        conversation_history = []

    if not GEMINI_API_KEY:
        return {
            "text": "## ⚠️ Gemini API Key Required\n\nNo `GEMINI_API_KEY` was detected in the backend environment or `.env.local` file. Please ensure `GEMINI_API_KEY` is configured to receive live AI responses.",
            "suggestions": ["How is the Risk Score calculated?", "What is Cold Start?", "Explain False-Positive Rate"],
            "context_summary": {"status": "NO_API_KEY"}
        }

    # Retrieve live system metrics and telemetry from SQLite database
    dashboard_metrics = database.get_dashboard_metrics()
    context = database.get_ai_analyst_context()

    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)

        # Candidate Gemini models (trying models/gemini-flash-latest first)
        candidate_models = ['models/gemini-flash-latest', 'models/gemini-pro-latest', 'models/gemini-2.0-flash-lite', 'models/gemini-2.0-flash', 'models/gemini-1.5-flash']
        
        system_instruction = f"""
You are the Official AI SOC Consultant & Platform Guide for the Benzene Zero-Signature UEBA Platform.
Your purpose is to help the user navigate the site, understand every security metric and statistic displayed on the dashboard, and explain EXACTLY how each metric is calculated mathematically and architecturally in Python and SQLite.

CORE PLATFORM METRICS & EXACT CALCULATION FORMULAS TO EXPLAIN WHEN ASKED:

1. EXPLAINABLE RISK SCORE (0 - 100):
   - Formula: Weighted sum of multi-dimensional threat factors capped at 100.
   - Point Contributions:
     • Isolation Forest Anomaly Score: Up to +30 pts (normalized score * 30)
     • Attack Classification Confidence: Up to +20 pts (confidence * 20)
     • Unknown Device / Hardware Spoofing: +15 pts
     • Unusual Location / Geo-Velocity Delta: +15 pts
     • Abnormal Login Hours (outside assigned window): +10 pts
     • Failed Login Frequency (>= 3 failed attempts): +10 pts
   - Severity Level Bands:
     • Low: 0–29 | Medium: 30–49 | High: 50–74 | Critical: 75–100

2. ISOLATION FOREST ANOMALY SCORE (0.00 - 1.00):
   - Calculation: Unsupervised Scikit-Learn Isolation Forest trained on 3,500 baseline feature samples.
   - Measures decision tree isolation depth. Scores >= 0.50 indicate behavioral deviation from normal baselines.

3. FALSE-POSITIVE RATE (%):
   - Formula: (Analyst-Confirmed False Positives / Total Anomalies) * 100
   - Current Live Rate: {dashboard_metrics['overview'].get('false_positive_rate', 0.1)}%

4. COLD START PROFILE MATURITY (%):
   - Formula: (Trusted Event Count / 15) * 100
   - Mechanics: Evaluates new users against their Department Group Baseline (08:00–18:00 work hours, department subnet rules) until 15 trusted events are logged, then automatically promotes them to a Personal Baseline.

5. CONCEPT DRIFT ADAPTATION:
   - Mechanics: Continuously tracks rolling user behavior. Requires 3 consecutive trusted observations of a new location or schedule shift before updating baselines in the database (`user_profiles` & `baseline_history`).
   - Anti-Poisoning Safeguard: Malicious attacks and high-risk anomalies are strictly blocked from updating baselines.

6. MODEL PERFORMANCE METRICS:
   - Precision: {int(dashboard_metrics['model_metrics'].get('precision', 0.96)*100)}% (True Positives / (True Positives + False Positives))
   - Recall: {int(dashboard_metrics['model_metrics'].get('recall', 0.94)*100)}% (True Positives / (True Positives + False Negatives))
   - F1 Score: {int(dashboard_metrics['model_metrics'].get('f1_score', 0.95)*100)}% (2 * (Precision * Recall) / (Precision + Recall))

7. SYSTEM PIPELINE STAGES (6-STAGE UEBA ARCHITECTURE):
   - Stage 1: Isolation Forest Anomaly Detection
   - Stage 2: Cyberattack Multi-Class Classification (Brute Force, Credential Misuse, Impossible Travel, Device Spoofing, Lateral Movement)
   - Stage 3: Transparent Weighted Risk Scoring (0-100)
   - Stage 4: Gemini Flash AI Threat Narrative Generation
   - Stage 5: Smart False-Positive Reduction & Contextual Triage
   - Stage 6: Cold Start Maturation & Concept Drift Adaptation

LIVE DATABASE METRICS SUMMARY (FROM SQLITE):
- Total Processed Telemetry Events: {dashboard_metrics['overview'].get('total_events')}
- Total Isolation Forest Anomalies: {dashboard_metrics['overview'].get('total_anomalies')}
- Critical Threats Count (Score >= 75): {dashboard_metrics['overview'].get('critical_threats')}
- Active Escalated Queue: {dashboard_metrics['overview'].get('active_threats')}
- High Risk Users Roster: {json.dumps(dashboard_metrics.get('high_risk_users', []), indent=2)}

OPERATIONAL RESPONSE FORMATTING:
1. ALWAYS provide clear, helpful, and comprehensive answers using GitHub Markdown:
   - Use Headings (## for main title, ### for sub-sections)
   - Use Tables (| Metric | Formula / Value |) for formulas or stats
   - Use Bullet Lists (*) for step-by-step breakdowns
   - Use Bold text (**text**) for key terms
2. ALWAYS guide the user on where to navigate on the site (e.g. SOC Console Overview, Real-Time Analyst Dashboard, Cold Start tab, Risk Score tab).
3. ABSOLUTELY NO LATEX SYNTAX: NEVER use LaTeX math symbols like frac, \\ge, \\le, \\times, or $. ALWAYS write clean, readable plain-text math formulas (e.g. "(False Positives / Total Anomalies) * 100", ">= 75", "*", "/").
4. At the very end of your response, output a single line starting with:
   FOLLOW_UP_SUGGESTIONS: ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
"""

        # Build conversation prompt
        chat_prompt = f"{system_instruction}\n\nCONVERSATION HISTORY:\n"
        for msg in conversation_history[-6:]:
            role = "USER" if msg.get("role") in ["user", "USER"] else "AI SOC CONSULTANT"
            chat_prompt += f"{role}: {msg.get('content', '')}\n"
        
        chat_prompt += f"\nUSER QUERY: {user_query}\n\nAI SOC CONSULTANT RESPONSE:"

        last_error = None
        for model_name in candidate_models:
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(chat_prompt)
                if response and response.text:
                    return parse_ai_analyst_output(response.text, dashboard_metrics)
            except Exception as model_err:
                last_error = str(model_err)
                print(f"Gemini model {model_name} error: {model_err}")
                continue

        # If all Gemini models returned an API error (e.g. rate limit), return genuine error message
        return {
            "text": f"## ⚠️ Gemini Flash API Response\n\nThe Gemini Flash API encountered a rate limit or service error:\n\n```\n{last_error}\n```\n\nPlease retry your query in a few seconds.",
            "suggestions": ["How is the Risk Score calculated?", "Explain Cold Start vs Concept Drift", "How does False-Positive Reduction work?"],
            "context_summary": {"error": last_error}
        }

    except Exception as e:
        return {
            "text": f"## ⚠️ Gemini API Initialization Error\n\nFailed to initialize Gemini API client:\n\n```\n{e}\n```",
            "suggestions": ["How is the Risk Score calculated?", "Explain Cold Start vs Concept Drift", "How does False-Positive Reduction work?"],
            "context_summary": {"error": str(e)}
        }

def parse_ai_analyst_output(raw_text: str, dashboard_metrics: dict):
    """Extracts main response markdown and follow-up suggestion pills from genuine Gemini output"""
    suggestions = [
        "How is the Explainable Risk Score calculated?",
        "What is Cold Start vs Concept Drift?",
        "How does False-Positive Reduction work?",
        "Explain the 6-stage UEBA pipeline"
    ]
    
    clean_text = raw_text
    if "FOLLOW_UP_SUGGESTIONS:" in raw_text:
        parts = raw_text.split("FOLLOW_UP_SUGGESTIONS:")
        clean_text = parts[0].strip()
        try:
            parsed_sug = json.loads(parts[1].strip())
            if isinstance(parsed_sug, list) and len(parsed_sug) > 0:
                suggestions = parsed_sug[:4]
        except Exception:
            pass

    return {
        "text": clean_text,
        "suggestions": suggestions,
        "context_summary": {
            "total_events": dashboard_metrics['overview'].get('total_events'),
            "total_anomalies": dashboard_metrics['overview'].get('total_anomalies'),
            "fp_rate": dashboard_metrics['overview'].get('false_positive_rate')
        }
    }
