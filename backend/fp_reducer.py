import datetime
import database

CRITICAL_RESOURCES = [
    "Domain Controller DC-01",
    "PostgreSQL Master",
    "Auth Gateway Auth-Gateway-01",
    "Internal Git Repo-03",
    "HashiCorp Secrets Vault"
]

class SmartFPReducer:
    def __init__(self):
        self.user_cache = {}
        self.device_cache = {}

    def refresh_cache(self):
        users = database.get_users()
        devices = database.get_devices()
        self.user_cache = {u['id']: u for u in users}
        self.device_cache = {}
        for d in devices:
            u_id = d['user_id']
            if u_id not in self.device_cache:
                self.device_cache[u_id] = []
            self.device_cache[u_id].append(d)

    def evaluate_event(self, log):
        """Contextual false-positive reduction logic classifying events into Suppressed, Monitor, or Escalate"""
        u_id = log.get('user_id')
        user = self.user_cache.get(u_id)
        if not user:
            self.refresh_cache()
            user = self.user_cache.get(u_id, {})

        user_devs = self.device_cache.get(u_id, [])
        known_dev_ids = [d['id'] for d in user_devs] if user_devs else []
        
        # Check trusted observations table
        trusted_obs = database.get_trusted_observations(u_id)
        trusted_locations = set(o['observation_value'] for o in trusted_obs if o['observation_type'] == 'LOCATION' and o['is_trusted'] == 1)
        trusted_devices = set(o['observation_value'] for o in trusted_obs if o['observation_type'] == 'DEVICE' and o['is_trusted'] == 1)

        # Context Signals
        risk_score = int(log.get('risk_score', 0))
        failed_cnt = int(log.get('failed_attempt_count', 0))
        deviations = log.get('deviations', [])
        dev_count = len(deviations) if isinstance(deviations, list) else 1
        
        city = log.get('city', '')
        home_city = user.get('home_city', '')
        device_id = log.get('device_id', '')

        is_device_trusted = (device_id in known_dev_ids) or (device_id in trusted_devices)
        is_location_trusted = (city == home_city) or (city in trusted_locations)

        try:
            ts = datetime.datetime.fromisoformat(log['timestamp'].replace('Z', '+00:00'))
            log_hour = ts.hour
        except Exception:
            log_hour = 12

        start_hr = user.get('usual_start_hour', 9) if user else 9
        end_hr = user.get('usual_end_hour', 17) if user else 17
        is_normal_hours = (start_hr <= log_hour <= end_hr)

        res_accessed = log.get('resource_accessed', 'N/A')
        is_critical_res = res_accessed in CRITICAL_RESOURCES
        pred_attack = log.get('predicted_attack_type', 'Normal')

        # 1. ESCALATION RULES
        if (
            risk_score >= 60 
            or failed_cnt >= 3 
            or (pred_attack not in ['Normal', ''] and log.get('classification_confidence', 0) >= 0.85)
            or is_critical_res
            or (not is_device_trusted and not is_normal_hours and dev_count >= 2)
        ):
            decision = "Escalate"
            reason = (
                f"High-priority threat signals detected: Risk Score ({risk_score}/100), "
                f"Predicted Vector '{pred_attack}', Failed Attempts ({failed_cnt}), "
                f"or Restricted Asset '{res_accessed}'. Escalated to Analyst Triage Queue."
            )

        # 2. SUPPRESSION RULES (Isolated weak deviation on trusted device/location during normal working hours)
        elif (
            risk_score < 35
            and failed_cnt == 0
            and not is_critical_res
            and (
                (is_device_trusted and is_normal_hours and dev_count <= 1)
                or (is_location_trusted and is_device_trusted)
            )
        ):
            decision = "Suppressed"
            reason = (
                f"Isolated minor deviation (single location shift) observed using trusted workstation "
                f"({device_id}) during normal working hours ({log_hour}:00). "
                f"Risk Score low ({risk_score}/100). Downgraded to Suppressed."
            )

        # 3. MONITOR RULES (Default moderate risk level)
        else:
            decision = "Monitor"
            reason = (
                f"Moderate baseline deviation logged (Risk Score: {risk_score}/100, {dev_count} deviations). "
                f"Does not meet critical escalation threshold. Retained in Active Monitor queue."
            )

        # Auto-Adapt Baseline for repeated non-malicious observations (Anti-Poisoning Safeguard)
        if decision == "Suppressed" and risk_score < 30 and not is_critical_res:
            if city and city != home_city:
                database.record_observation_and_adapt(u_id, 'LOCATION', city, force_trust=False)
            if device_id and device_id not in known_dev_ids:
                database.record_observation_and_adapt(u_id, 'DEVICE', device_id, force_trust=False)

        log['fp_decision'] = decision
        log['suppression_reason'] = reason

        return log

    def process_analyst_feedback(self, event_id, feedback_type):
        """Processes analyst feedback (FALSE_POSITIVE / CONFIRMED_ATTACK) with anti-poisoning safeguards"""
        event = database.get_log_by_id(event_id)
        if not event:
            return False, "Event ID not found."

        u_id = event.get('user_id')
        city = event.get('city')
        device_id = event.get('device_id')
        risk_score = event.get('risk_score', 0)

        if feedback_type == "FALSE_POSITIVE":
            new_decision = "Suppressed"
            new_reason = "Marked as False Positive by Security Analyst. Event downgraded to Suppressed."
            database.update_analyst_feedback(event_id, "FALSE_POSITIVE", new_decision, new_reason)

            # Baseline Adaptation: Force Trust for this location/device (Anti-poisoning check: risk_score must be < 75)
            if risk_score < 75:
                if u_id and city:
                    database.record_observation_and_adapt(u_id, 'LOCATION', city, force_trust=True)
                if u_id and device_id:
                    database.record_observation_and_adapt(u_id, 'DEVICE', device_id, force_trust=True)

            return True, f"Event {event_id} marked as False Positive. Trusted baseline adapted for User {u_id}."

        elif feedback_type == "CONFIRMED_ATTACK":
            new_decision = "Escalate"
            new_reason = "Confirmed Malicious Attack by Security Analyst. Escalated to Priority Incident."
            database.update_analyst_feedback(event_id, "CONFIRMED_ATTACK", new_decision, new_reason)
            
            # Anti-poisoning safeguard: NEVER learn or trust confirmed attack observations
            return True, f"Event {event_id} confirmed as Cyberattack. Escalated for Incident Response."

        else:
            return False, f"Invalid feedback type: {feedback_type}. Must be 'FALSE_POSITIVE' or 'CONFIRMED_ATTACK'."
