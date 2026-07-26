# Benzene — Zero-Signature Behavioral Anomaly Detection

**AI/ML-powered UEBA (User & Entity Behavior Analytics) platform that learns what "normal" looks like for every user and device, then flags the moment reality drifts away from it — no signatures, no static rules.**

Legacy security tools compare activity against a list of known attack patterns, which means anything novel walks straight through. Benzene flips that: it continuously models each user's and device's behavioral baseline (login times, locations, resources accessed, device fingerprints) and scores every new event against *that specific* baseline in real time.

---

## Why it's different

| Signature-based security | Benzene |
|---|---|
| Detects what it already knows | Detects deviation from learned behavior |
| Static rule lists, manually maintained | Behavioral baselines that adapt over time |
| Binary allow/deny | 0–100 explainable risk score with severity band |
| Blind on day one for new users/devices | Synthetic-data cold start + heuristic fallback |
| Alerts are a black box | Every alert ships with a plain-language "why" |

---

## Core capabilities

1. **Synthetic behavioral log generator** — `Faker`-driven engine that manufactures realistic user/device/network telemetry (logins, locations, resources, working hours) so the system has a baseline to learn from before real traffic ever arrives.
2. **Behavioral anomaly engine** — an `IsolationForest` model scores each event against per-user and per-device history for zero-signature deviation detection.
3. **Multi-vector attack classification** — a `RandomForestClassifier` labels flagged events into five attack classes: **Brute Force, Credential Misuse, Impossible Travel, Device Spoofing, Lateral Movement**.
4. **Impossible-travel detection** — geodesic distance (via `geopy`) between a user's last known location and their new one, checked against elapsed time, to catch physically implausible logins.
5. **Explainable risk engine** — a transparent, weighted scoring model (not a black box) that produces a 0–100 risk score, a severity band, and a factor-by-factor breakdown of *why* a score was assigned.
6. **Cold-start & concept-drift engine** — tracks a rolling "profile maturity" score per user; new users start on a shared group baseline and graduate to a personal one as trusted events accumulate, while drift detection prevents attackers from slowly "poisoning" a baseline.
7. **Smart false-positive reducer** — contextual logic that buckets borderline events into `Suppressed`, `Monitor`, or `Escalate`, using known devices, trusted-observation history, and resource sensitivity.
8. **AI SOC analyst (Gemini-powered)** — a chat assistant, grounded in live dashboard metrics and telemetry, that explains any alert, metric, or the math behind it in natural language.
9. **Real-time analyst dashboard** — a WebSocket-streamed console (Next.js + Recharts) covering live telemetry, anomaly detection, attack classification, risk scoring, cold start/drift, false-positive triage, and model health — all in one place.

---

## Architecture

```
┌─────────────────────┐        ┌──────────────────────────────────────────────┐
│  Synthetic / Live    │        │                  FastAPI Backend               │
│  Log Generator       │──────▶│  detector.py      → IsolationForest anomaly    │
│  (Faker + geopy)      │        │  classifier.py    → RandomForest attack class │
└─────────────────────┘        │  risk_engine.py   → explainable risk scoring  │
                                │  cold_start_drift.py → maturity + drift       │
                                │  fp_reducer.py    → false-positive triage     │
                                │  ai_analyst.py / explainer.py → Gemini layer  │
                                │  database.py      → SQLite persistence        │
                                └───────────────┬────────────────────────────────┘
                                                │  REST + WebSocket (/ws/stream)
                                                ▼
                                ┌──────────────────────────────────────────────┐
                                │       Next.js Dashboard (React + Recharts)     │
                                │  Console Overview · Telemetry Stream           │
                                │  Anomaly Detection · Attack Types              │
                                │  Risk Score · Cold Start · False Positives     │
                                │  Lateral Movement Graph · Model Health         │
                                │  AI SOC Analyst chat                           │
                                └──────────────────────────────────────────────┘
```

---

## Tech stack

**Backend:** Python, FastAPI, Uvicorn, SQLite, scikit-learn (`IsolationForest`, `RandomForestClassifier`), pandas, NumPy, Faker, geopy, Google Generative AI (Gemini)

**Frontend:** Next.js, React, TypeScript, Tailwind CSS, Recharts, lucide-react

**Realtime:** WebSockets (`/ws/stream`) for live event streaming to the dashboard

---

## Project structure

```
ai-systemlog-anamoly-detector/
├── backend/
│   ├── main.py                 # FastAPI app, REST + WebSocket routes
│   ├── generator.py            # Synthetic telemetry generator
│   ├── detector.py             # Isolation Forest anomaly engine
│   ├── classifier.py           # Random Forest attack classifier
│   ├── risk_engine.py          # Explainable weighted risk scoring
│   ├── cold_start_drift.py     # Profile maturity + concept drift
│   ├── fp_reducer.py           # False-positive triage engine
│   ├── ai_analyst.py           # Gemini-powered SOC analyst
│   ├── explainer.py            # Natural-language alert narratives
│   ├── database.py             # SQLite schema + queries
│   └── requirements.txt
└── ai-powered-anamoly-detection/   # Next.js frontend
    └── app/
        ├── components/
        │   ├── Dashboard.tsx, Hero.tsx, MLArchitecture.tsx, ...
        │   └── dashboard/
        │       ├── ConsoleOverviewTab.tsx, TelemetryStreamTab.tsx
        │       ├── AnomalyDetectionTab.tsx, AttackTypesTab.tsx
        │       ├── RiskScoreTab.tsx, ColdStartTab.tsx
        │       ├── FalsePositiveTab.tsx, LateralGraphTab.tsx
        │       ├── ModelHealthTab.tsx, IncidentTriageTab.tsx
        │       └── AiSocAnalystTab.tsx
        └── utils/
            ├── syntheticLogGenerator.ts, apiConfig.ts, authVault.ts
```

---

## Getting started

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API starts serving REST endpoints under `/api/*` and a live event feed over `ws://localhost:8000/ws/stream`.

Optional — enable the AI SOC analyst chat by setting a Gemini key:

```bash
# backend/.env
GEMINI_API_KEY=your_key_here
```

### Frontend

```bash
cd ai-powered-anamoly-detection
npm install
npm run dev
```

Open `http://localhost:3000`. By default it talks to the backend at `http://localhost:8000` — override with:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Key API endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/status` · `POST /api/start` / `/api/stop` | Control the live simulation pipeline |
| `GET /api/logs` | Recent raw telemetry |
| `GET /api/anomalies` | Isolation Forest–flagged events |
| `GET /api/classified-attacks` | Attack-type classifications |
| `GET /api/risk-scores` | Explainable risk scores + factor breakdown |
| `GET /api/cold-start` · `GET /api/concept-drift` | Profile maturity & drift status |
| `GET /api/false-positives` · `GET /api/fp-metrics` | FP triage results |
| `POST /api/feedback` | Analyst feedback loop (confirm attack / mark false positive) |
| `POST /api/ai-analyst/chat` | Gemini-powered SOC analyst chat |
| `POST /api/trigger-attack` · `POST /api/trigger-drift` | Manually inject a scenario for demo/testing |
| `GET /api/export` | Export telemetry/results |
| `WS /ws/stream` | Live event stream to the dashboard |

---

## Evaluation criteria

Detection accuracy · Low false-positive rate · Explainability · Scalability · Attack classification accuracy · Design & usability

---

## References

- [MITRE ATT&CK — T1078: Valid Accounts](https://attack.mitre.org/techniques/T1078/)
- [Cold-start handling research (arXiv:2405.20341)](https://arxiv.org/abs/2405.20341)
- [FastAPI WebSockets](https://fastapi.tiangolo.com/advanced/websockets/)
- [SHAP — Explainable AI](https://shap.readthedocs.io/en/latest/)
- [scikit-learn — Isolation Forest example](https://scikit-learn.org/stable/auto_examples/ensemble/plot_isolation_forest.html)

---

## Author

**Nikhil Sai** — VIT-AP University
