import datetime
import database

MATURITY_THRESHOLD = 15

class ColdStartDriftEngine:
    def __init__(self):
        self.rolling_locations = {} # { user_id: { city_name: count } }
        self.rolling_hours = {}     # { user_id: { hour: count } }

    def process_log(self, log):
        """Processes cold start profile maturation and anti-poisoning concept drift adaptation"""
        u_id = log.get('user_id')
        if not u_id:
            log['baseline_type'] = 'GROUP'
            log['profile_maturity'] = 0
            log['drift_detected'] = ''
            return log

        # Fetch current user profile
        prof = database.get_user_profile(u_id)
        if not prof:
            trusted_count = 0
            maturity = 0
            baseline_type = 'GROUP'
        else:
            trusted_count = prof.get('trusted_event_count', 0)
            maturity = prof.get('profile_maturity', 0)
            baseline_type = prof.get('baseline_type', 'GROUP')

        is_trusted_event = (
            log.get('is_anomaly') == 0 
            and log.get('risk_score', 0) < 50 
            and log.get('analyst_feedback') != 'CONFIRMED_ATTACK'
        ) or (log.get('analyst_feedback') == 'FALSE_POSITIVE')

        # 1. COLD START & PROFILE MATURATION
        if is_trusted_event:
            trusted_count += 1
            maturity = min(100, int((trusted_count / MATURITY_THRESHOLD) * 100))
            
            old_baseline = baseline_type
            baseline_type = 'PERSONAL' if maturity >= 100 else 'GROUP'

            if old_baseline == 'GROUP' and baseline_type == 'PERSONAL':
                database.record_baseline_change(
                    u_id, 
                    'PROFILE_MATURATION', 
                    'GROUP Baseline (Dept Level)', 
                    'PERSONAL Baseline (Matured)', 
                    'COLD_START_ENGINE'
                )

            database.update_user_profile(u_id, trusted_count, maturity, baseline_type)

        # Attach cold start metadata to log
        log['baseline_type'] = baseline_type
        log['profile_maturity'] = maturity
        log['drift_detected'] = ''

        # 2. CONCEPT DRIFT HANDLING (Strict Anti-Poisoning Safeguard)
        if is_trusted_event:
            drift_msg = self._evaluate_concept_drift(u_id, log)
            if drift_msg:
                log['drift_detected'] = drift_msg
                database.update_user_profile(u_id, trusted_count, maturity, baseline_type, drift_flag=1, drift_time=datetime.datetime.now(datetime.timezone.utc).isoformat())

        return log

    def _evaluate_concept_drift(self, user_id, log):
        """Monitors rolling trusted observations for location or working hours shifts"""
        users = database.get_users()
        user = next((u for u in users if u['id'] == user_id), None)
        if not user:
            return ""

        city = log.get('city')
        home_city = user.get('home_city')

        # Location Drift Tracking
        if city and city != home_city:
            if user_id not in self.rolling_locations:
                self.rolling_locations[user_id] = {}
            self.rolling_locations[user_id][city] = self.rolling_locations[user_id].get(city, 0) + 1

            if self.rolling_locations[user_id][city] >= 3:
                old_loc = home_city
                new_loc = city
                database.update_user_home_city(user_id, new_loc)
                database.record_baseline_change(
                    user_id, 
                    'LOCATION_SHIFT', 
                    f"Home City: {old_loc}", 
                    f"Home City: {new_loc}", 
                    'CONCEPT_DRIFT_ENGINE'
                )
                self.rolling_locations[user_id][city] = 0
                return f"Concept Drift Detected: Home city adapted from {old_loc} to {new_loc} after repeated trusted observations."

        # Working Hours Shift Tracking
        try:
            ts = datetime.datetime.fromisoformat(log['timestamp'].replace('Z', '+00:00'))
            log_hour = ts.hour
        except Exception:
            log_hour = 12

        start_hr = user.get('usual_start_hour', 9)
        end_hr = user.get('usual_end_hour', 17)

        if not (start_hr <= log_hour <= end_hr):
            if user_id not in self.rolling_hours:
                self.rolling_hours[user_id] = {}
            self.rolling_hours[user_id][log_hour] = self.rolling_hours[user_id].get(log_hour, 0) + 1

            if self.rolling_hours[user_id][log_hour] >= 3:
                old_window = f"{start_hr}:00–{end_hr}:00"
                new_start = max(0, log_hour - 4)
                new_end = min(23, log_hour + 4)
                new_window = f"{new_start}:00–{new_end}:00"

                database.update_user_working_hours(user_id, new_start, new_end)
                database.record_baseline_change(
                    user_id, 
                    'WORKING_HOURS_SHIFT', 
                    f"Hours: {old_window}", 
                    f"Hours: {new_window}", 
                    'CONCEPT_DRIFT_ENGINE'
                )
                self.rolling_hours[user_id][log_hour] = 0
                return f"Concept Drift Detected: Working hours adapted from {old_window} to {new_window} after repeated trusted observations."

        return ""

    def trigger_simulated_drift(self, user_id, drift_type):
        """Helper function for testing concept drift triggers manually"""
        users = database.get_users()
        user = next((u for u in users if u['id'] == user_id), None)
        if not user:
            return False, "User not found."

        if drift_type.upper() == "LOCATION_SHIFT":
            old_city = user.get('home_city', 'New York')
            new_city = "Paris" if old_city != "Paris" else "Tokyo"
            database.update_user_home_city(user_id, new_city)
            database.record_baseline_change(
                user_id, 
                'LOCATION_SHIFT', 
                f"Home City: {old_city}", 
                f"Home City: {new_city}", 
                'SIMULATED_DRIFT_TRIGGER'
            )
            database.update_user_profile(user_id, 15, 100, 'PERSONAL', drift_flag=1, drift_time=datetime.datetime.now(datetime.timezone.utc).isoformat())
            return True, f"Simulated Location Shift for {user['name']}: {old_city} -> {new_city}."

        elif drift_type.upper() == "WORKING_HOURS_SHIFT":
            old_window = f"{user.get('usual_start_hour', 9)}:00–{user.get('usual_end_hour', 17)}:00"
            new_start = 20 # Night Shift
            new_end = 4
            new_window = "20:00–04:00"
            database.update_user_working_hours(user_id, new_start, new_end)
            database.record_baseline_change(
                user_id, 
                'WORKING_HOURS_SHIFT', 
                f"Hours: {old_window}", 
                f"Hours: {new_window}", 
                'SIMULATED_DRIFT_TRIGGER'
            )
            database.update_user_profile(user_id, 15, 100, 'PERSONAL', drift_flag=1, drift_time=datetime.datetime.now(datetime.timezone.utc).isoformat())
            return True, f"Simulated Working Hours Shift for {user['name']}: {old_window} -> {new_window}."

        else:
            return False, "Invalid drift type. Use 'LOCATION_SHIFT' or 'WORKING_HOURS_SHIFT'."
