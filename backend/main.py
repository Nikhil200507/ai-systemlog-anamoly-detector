from fastapi import FastAPI, HTTPException, Response, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import pydantic
from typing import Optional, List
import database
import generator
from detector import BehavioralAnomalyDetector
from classifier import CyberattackClassifier
from risk_engine import ExplainableRiskEngine
from fp_reducer import SmartFPReducer
from cold_start_drift import ColdStartDriftEngine
from ai_analyst import generate_ai_analyst_response
import explainer
import asyncio
import threading
import io
import pandas as pd
import random
import datetime

app = FastAPI(title="Benzene UEBA - Full Pipeline API (Detector, Classifier, Risk Engine, FP Reducer & Cold Start/Drift)")

# Configure CORS to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

ws_manager = ConnectionManager()

# Global generator configurations
state = {
    "is_generating": False,
    "events_per_second": 0.4, # Default: 1 event every 2.5 seconds
}

state_lock = threading.Lock()
detector = BehavioralAnomalyDetector()
classifier = CyberattackClassifier()
risk_engine = ExplainableRiskEngine()
fp_reducer = SmartFPReducer()
cold_start_drift = ColdStartDriftEngine()

def process_and_enrich_log(log):
    """Full 6-Stage UEBA Pipeline: Isolation Forest ➔ Classifier ➔ Risk Engine ➔ Gemini AI ➔ FP Reducer ➔ Cold Start & Drift"""
    # Step 1: Isolation Forest Anomaly Detection
    analyzed_log = detector.analyze_log(log)
    u_id = analyzed_log.get('user_id')
    user = detector.user_cache.get(u_id, {})
    user_name = user.get('name', u_id) if user else u_id
    dept = user.get('department', 'Engineering') if user else 'Engineering'

    # Step 2: Cyberattack Multi-Class Classification (for anomalous events)
    if analyzed_log.get('is_anomaly') == 1 or analyzed_log.get('anomaly_score', 0) >= 0.5:
        analyzed_log = classifier.classify_event(analyzed_log)
        explanation = explainer.generate_explanation(analyzed_log, user, analyzed_log.get('deviations', []))
        analyzed_log['explanation'] = explanation
    else:
        analyzed_log['predicted_attack_type'] = "Normal"
        analyzed_log['classification_confidence'] = 0.98
        analyzed_log['attack_indicators'] = []
        analyzed_log['explanation'] = f"Normal Activity Baseline: Access event by {user_name} ({dept}) conforms to all expected behavioral parameters, IP subnet, and device baselines."

    # Step 3: Weighted Risk Score Calculation (0-100 & Severity Classification)
    analyzed_log = risk_engine.calculate_risk_score(analyzed_log)

    # Step 4: Gemini Risk Audit Explanation
    risk_exp = explainer.generate_risk_explanation(
        analyzed_log, user, 
        analyzed_log['risk_score'], 
        analyzed_log['severity_level'], 
        analyzed_log.get('risk_factors', [])
    )
    analyzed_log['risk_explanation'] = risk_exp

    # Step 5: Smart False-Positive Reduction & Contextual Escalation Logic
    analyzed_log = fp_reducer.evaluate_event(analyzed_log)

    # Step 6: Cold Start Maturation & Concept Drift Adaptation
    analyzed_log = cold_start_drift.process_log(analyzed_log)

    # Broadcast real-time log event to WebSocket subscribers
    try:
        asyncio.create_task(ws_manager.broadcast({"type": "NEW_LOG", "data": analyzed_log}))
    except Exception:
        pass

    return analyzed_log

async def generator_loop():
    """Background loop that continuously appends security events"""
    while True:
        with state_lock:
            active = state["is_generating"]
            eps = state["events_per_second"]
            
        if active:
            try:
                users = database.get_users()
                devices = database.get_devices()
                
                if users and devices:
                    user = random.choice(users)
                    user_devs = [d for d in devices if d["user_id"] == user["id"]]
                    if not user_devs:
                        user_devs = [{"id": f"DEV-{user['id']}-0", "user_id": user["id"], "device_type": "Laptop", "os": "Windows", "browser": "Chrome"}]
                    
                    roll = random.randint(1, 100)
                    if roll <= 3: # 3% chance of auto-generating attack
                        attack_type = random.choice([
                            "BRUTE_FORCE", 
                            "CREDENTIAL_MISUSE", 
                            "IMPOSSIBLE_TRAVEL", 
                            "DEVICE_SPOOFING", 
                            "LATERAL_MOVEMENT"
                        ])
                        await trigger_attack_internal(user, user_devs, attack_type)
                    else:
                        # Normal log
                        raw_log = generator.generate_normal_log(user, user_devs)
                        enriched_log = process_and_enrich_log(raw_log)
                        database.insert_log(enriched_log)
            except Exception as e:
                print(f"Error in generator loop: {e}")
                
        sleep_time = 1.0 / max(eps, 0.01)
        await asyncio.sleep(sleep_time)

async def trigger_attack_internal(user, user_devs, attack_type):
    """Saves simulated logs for a specific cyberattack to the database with full UEBA enrichment"""
    now = datetime.datetime.now(datetime.timezone.utc)
    if attack_type == "BRUTE_FORCE":
        raw_logs = generator.simulate_brute_force(user, user_devs, now)
    elif attack_type == "CREDENTIAL_MISUSE":
        raw_logs = generator.simulate_credential_misuse(user, user_devs, now)
    elif attack_type == "IMPOSSIBLE_TRAVEL":
        raw_logs = generator.simulate_impossible_travel(user, user_devs, now)
    elif attack_type == "DEVICE_SPOOFING":
        raw_logs = generator.simulate_device_spoofing(user, user_devs, now)
    elif attack_type == "LATERAL_MOVEMENT":
        raw_logs = generator.simulate_lateral_movement(user, user_devs, now)
    else:
        return
        
    enriched_logs = [process_and_enrich_log(l) for l in raw_logs]
    database.insert_logs(enriched_logs)

@app.on_event("startup")
def on_startup():
    """Initializes schema, bootstraps company profile, and trains models on startup"""
    database.init_db()
    users = database.get_users()
    if not users:
        print("SQLite is empty. Bootstrapping mock company profile (100 users)...")
        generator.generate_static_env()
        
    detector.fit_baseline()
    classifier.train_model()
    risk_engine.refresh_cache()
    fp_reducer.refresh_cache()
    
    # Start the continuous generator background task
    asyncio.create_task(generator_loop())

@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint pushing live security telemetry to the analyst dashboard"""
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

@app.get("/api/status")
def get_status():
    """Returns current system status flags"""
    return {
        "is_generating": state["is_generating"],
        "events_per_second": state["events_per_second"],
        "total_logs": database.get_log_count(),
        "is_detector_trained": detector.is_fitted,
        "is_classifier_trained": classifier.is_trained
    }

@app.post("/api/start")
def start_generator():
    """Resumes continuous log generation"""
    with state_lock:
        state["is_generating"] = True
    return {"message": "Telemetry generator activated", "is_generating": True}

@app.post("/api/stop")
def stop_generator():
    """Pauses continuous log generation"""
    with state_lock:
        state["is_generating"] = False
    return {"message": "Telemetry generator paused", "is_generating": False}

class ConfigRequest(pydantic.BaseModel):
    events_per_second: float

@app.post("/api/config")
def configure_generator(req: ConfigRequest):
    """Modifies generation velocity"""
    if req.events_per_second <= 0:
        raise HTTPException(status_code=400, detail="Velocity must be greater than 0")
    with state_lock:
        state["events_per_second"] = req.events_per_second
    return {
        "message": "Configuration updated", 
        "events_per_second": state["events_per_second"]
    }

class AiChatRequest(pydantic.BaseModel):
    query: str
    history: Optional[List[dict]] = []

@app.post("/api/ai-analyst/chat")
def ai_soc_analyst_chat(req: AiChatRequest):
    """RAG-driven AI SOC Analyst Endpoint powered by Gemini Flash and real-time database context"""
    if not req.query or not req.query.strip():
        raise HTTPException(status_code=400, detail="Query string cannot be empty.")
    
    response_data = generate_ai_analyst_response(req.query, req.history)
    return response_data

@app.get("/api/dashboard-metrics")
def get_dashboard_metrics():
    """Retrieves live overview metrics, attack distribution, severity distribution, top high risk users, and model performance"""
    return database.get_dashboard_metrics()

@app.get("/api/logs")
def get_logs(limit: int = 100, offset: int = 0, attack_type: Optional[str] = None):
    """Retrieves list of recent telemetry logs with full UEBA enrichment"""
    logs = database.get_recent_logs(limit, offset, attack_type)
    return logs

@app.get("/api/anomalies")
def get_anomalies(limit: int = 100, offset: int = 0):
    """Retrieves list of detected anomalous security events with Gemini Flash explanations"""
    anomalies = database.get_anomalies(limit, offset)
    return anomalies

@app.get("/api/classified-attacks")
def get_classified_attacks(limit: int = 100, offset: int = 0):
    """Retrieves list of classified anomalous events with predicted attack type, confidence, and indicators"""
    classified = database.get_classified_attacks(limit, offset)
    return classified

@app.get("/api/risk-scores")
def get_risk_scores(limit: int = 100, offset: int = 0):
    """Retrieves list of security events with calculated risk score, severity band, factor attribution, and AI risk explanations"""
    risk_data = database.get_risk_scores(limit, offset)
    return risk_data

@app.get("/api/false-positives")
def get_false_positives(limit: int = 100, offset: int = 0):
    """Retrieves security events with false-positive reduction decisions (Suppressed, Monitor, Escalate) and rationale"""
    fp_events = database.get_false_positives(limit, offset)
    return fp_events

class FeedbackRequest(pydantic.BaseModel):
    event_id: str
    feedback: str # "FALSE_POSITIVE" or "CONFIRMED_ATTACK"

@app.post("/api/feedback")
def submit_feedback(req: FeedbackRequest):
    """Submits analyst feedback to adapt baseline profiles with anti-poisoning safeguards"""
    feedback_upper = req.feedback.upper()
    if feedback_upper not in ["FALSE_POSITIVE", "CONFIRMED_ATTACK"]:
        raise HTTPException(status_code=400, detail="Feedback must be 'FALSE_POSITIVE' or 'CONFIRMED_ATTACK'")

    success, message = fp_reducer.process_analyst_feedback(req.event_id, feedback_upper)
    if not success:
        raise HTTPException(status_code=404, detail=message)
        
    return {
        "message": message,
        "event_id": req.event_id,
        "analyst_feedback": feedback_upper
    }

@app.get("/api/fp-metrics")
def get_fp_metrics():
    """Retrieves summary metrics for false-positive reduction (suppressed, monitored, escalated, FP rate)"""
    return database.get_fp_metrics()

@app.get("/api/cold-start")
def get_cold_start_status():
    """Retrieves cold-start profile maturity, trusted event counts, and baseline types across all users"""
    return database.get_cold_start_profiles()

@app.get("/api/concept-drift")
def get_concept_drift():
    """Retrieves list of detected concept drift events and complete baseline update audit history"""
    return database.get_baseline_history()

class DriftTriggerRequest(pydantic.BaseModel):
    user_id: str
    drift_type: str # "LOCATION_SHIFT" or "WORKING_HOURS_SHIFT"

@app.post("/api/trigger-drift")
def trigger_drift(req: DriftTriggerRequest):
    """Simulates a concept drift scenario (Location Shift or Working Hours Shift) for testing"""
    success, msg = cold_start_drift.trigger_simulated_drift(req.user_id, req.drift_type)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"message": msg, "user_id": req.user_id, "drift_type": req.drift_type}

class AttackRequest(pydantic.BaseModel):
    attack_type: str
    user_id: Optional[str] = None

@app.post("/api/trigger-attack")
def trigger_attack(req: AttackRequest):
    """Manually queues and injects a mock cyberattack sequence through the complete 6-stage UEBA pipeline"""
    users = database.get_users()
    devices = database.get_devices()
    if not users:
        raise HTTPException(status_code=500, detail="Database environments are empty")
        
    user = None
    if req.user_id:
        user = next((u for u in users if u["id"] == req.user_id), None)
    if not user:
        user = random.choice(users)
        
    user_devs = [d for d in devices if d["user_id"] == user["id"]]
    if not user_devs:
        user_devs = [{"id": f"DEV-{user['id']}-0", "user_id": user["id"], "device_type": "Laptop", "os": "Windows", "browser": "Chrome"}]
        
    attack_type_upper = req.attack_type.upper()
    valid_attacks = ["BRUTE_FORCE", "CREDENTIAL_MISUSE", "IMPOSSIBLE_TRAVEL", "DEVICE_SPOOFING", "LATERAL_MOVEMENT"]
    if attack_type_upper not in valid_attacks:
        raise HTTPException(status_code=400, detail=f"Invalid type. Choices: {valid_attacks}")
        
    now = datetime.datetime.now(datetime.timezone.utc)
    if attack_type_upper == "BRUTE_FORCE":
        raw_logs = generator.simulate_brute_force(user, user_devs, now)
    elif attack_type_upper == "CREDENTIAL_MISUSE":
        raw_logs = generator.simulate_credential_misuse(user, user_devs, now)
    elif attack_type_upper == "IMPOSSIBLE_TRAVEL":
        raw_logs = generator.simulate_impossible_travel(user, user_devs, now)
    elif attack_type_upper == "DEVICE_SPOOFING":
        raw_logs = generator.simulate_device_spoofing(user, user_devs, now)
    elif attack_type_upper == "LATERAL_MOVEMENT":
        raw_logs = generator.simulate_lateral_movement(user, user_devs, now)
        
    enriched_logs = [process_and_enrich_log(l) for l in raw_logs]
    database.insert_logs(enriched_logs)
    return {
        "message": f"Injected {attack_type_upper} payload.",
        "injected_count": len(enriched_logs),
        "target_user": user["name"]
    }

@app.get("/api/export")
def export_logs():
    """Exports SQLite logs database as a downloadable CSV file"""
    try:
        conn = database.get_db_connection()
        df = pd.read_sql_query("SELECT * FROM logs ORDER BY timestamp DESC", conn)
        conn.close()
        
        # Stream out CSV content
        stream = io.StringIO()
        df.to_csv(stream, index=False)
        csv_data = stream.getvalue()
        
        return Response(
            content=csv_data,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=benzene_security_logs.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
