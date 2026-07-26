import datetime
from geopy.distance import geodesic
import database

DEPT_RESOURCES = {
    "Engineering": ["Internal Git Repo-03", "Kubernetes Cluster K8s-01", "Dev Web Server-04", "File Server File-Storage-01"],
    "HR": ["HR Intranet Portal HR-Portal", "File Server File-Storage-01", "Benefits Server HR-02"],
    "Finance": ["Payroll Portal Payroll-02", "Finance Database FinDB-01", "File Server File-Storage-01"],
    "Sales": ["CRM System CRM-01", "Sales Pipeline Sales-03", "File Server File-Storage-01"],
    "Executive": ["Executive Board Sharepoint", "File Server File-Storage-01", "HR Intranet Portal HR-Portal"]
}

CRITICAL_RESOURCES = [
    "Domain Controller DC-01",
    "PostgreSQL Master",
    "Auth Gateway Auth-Gateway-01",
    "Internal Git Repo-03",
    "HashiCorp Secrets Vault"
]

class ExplainableRiskEngine:
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

    def calculate_risk_score(self, log):
        """Calculates a transparent weighted risk score (0-100), severity band, and factor breakdown"""
        u_id = log.get('user_id')
        user = self.user_cache.get(u_id)
        if not user:
            self.refresh_cache()
            user = self.user_cache.get(u_id, {})
            
        user_devs = self.device_cache.get(u_id, [])

        factors = []
        total_points = 0

        # 1. ML Anomaly Score Contribution (up to +25 pts)
        anom_score = float(log.get('anomaly_score', 0.10))
        if anom_score > 0.30:
            anom_pts = min(25, int(round(anom_score * 25)))
            factors.append({
                "factor": "ML Anomaly Score",
                "points": anom_pts,
                "detail": f"Isolation Forest score: {int(anom_score * 100)}%"
            })
            total_points += anom_pts

        # 2. Attack Classification Confidence Contribution (up to +20 pts)
        pred_attack = log.get('predicted_attack_type', 'Normal')
        clf_conf = float(log.get('classification_confidence', 0.0))
        if pred_attack != 'Normal' and clf_conf > 0.5:
            clf_pts = min(20, int(round(clf_conf * 20)))
            factors.append({
                "factor": f"Predicted {pred_attack} Attack",
                "points": clf_pts,
                "detail": f"Random Forest confidence rating: {int(clf_conf * 100)}%"
            })
            total_points += clf_pts

        # 3. Failed Login Frequency (up to +15 pts)
        failed_cnt = int(log.get('failed_attempt_count', 0))
        if failed_cnt > 0:
            failed_pts = min(15, failed_cnt * 3)
            factors.append({
                "factor": "Failed Login Frequency",
                "points": failed_pts,
                "detail": f"{failed_cnt} sequential failed authentication tries"
            })
            total_points += failed_pts

        # 4. Sensitive / Critical Resource Access (+15 pts)
        res_accessed = log.get('resource_accessed', 'N/A')
        dept = user.get('department', 'Engineering') if user else 'Engineering'
        allowed_res = DEPT_RESOURCES.get(dept, [])
        if res_accessed in CRITICAL_RESOURCES or (res_accessed not in allowed_res and res_accessed != 'N/A'):
            res_pts = 15
            factors.append({
                "factor": "Sensitive Resource Access",
                "points": res_pts,
                "detail": f"Targeted restricted corporate asset '{res_accessed}'"
            })
            total_points += res_pts

        # 5. Unknown / Unassigned Device (+10 pts)
        known_dev_ids = [d['id'] for d in user_devs] if user_devs else []
        if log.get('device_id') not in known_dev_ids:
            dev_pts = 10
            factors.append({
                "factor": "Unknown Device",
                "points": dev_pts,
                "detail": f"Unassigned hardware GUID {log.get('device_id', 'DEV-UNKNOWN')}"
            })
            total_points += dev_pts

        # 6. Unusual Location / Distance (+10 pts)
        home_city = user.get('home_city', 'New York') if user else 'New York'
        home_lat = user.get('home_lat', 40.7128) if user else 40.7128
        home_lon = user.get('home_lon', -74.0060) if user else -74.0060
        log_lat = log.get('latitude', home_lat)
        log_lon = log.get('longitude', home_lon)
        try:
            dist_km = geodesic((home_lat, home_lon), (log_lat, log_lon)).kilometers
        except Exception:
            dist_km = 0.0

        if log.get('city') != home_city or dist_km > 100:
            loc_pts = 10
            factors.append({
                "factor": "Unusual Location",
                "points": loc_pts,
                "detail": f"Access from {log.get('city', 'Unknown')}, {log.get('country', '')} ({int(dist_km)} km from home base {home_city})"
            })
            total_points += loc_pts

        # 7. Abnormal Login Time (+5 pts)
        try:
            ts = datetime.datetime.fromisoformat(log['timestamp'].replace('Z', '+00:00'))
            log_hour = ts.hour
        except Exception:
            log_hour = 12
            
        start_hr = user.get('usual_start_hour', 9) if user else 9
        end_hr = user.get('usual_end_hour', 17) if user else 17
        if not (start_hr <= log_hour <= end_hr):
            time_pts = 5
            factors.append({
                "factor": "Abnormal Login Time",
                "points": time_pts,
                "detail": f"Access hour ({log_hour}:00) outside usual working window ({start_hr}:00-{end_hr}:00)"
            })
            total_points += time_pts

        # 8. Device Changes / OS Mismatch (+5 pts)
        known_os = set(d['os'] for d in user_devs) if user_devs else set()
        if log.get('os') and log.get('os') not in known_os:
            os_pts = 5
            factors.append({
                "factor": "Device Changes / OS Mismatch",
                "points": os_pts,
                "detail": f"Hardware OS '{log.get('os')}' differs from registered profile"
            })
            total_points += os_pts

        # Cap score at 100 max
        final_risk_score = min(100, max(0, total_points))

        # Severity Level Classification
        if final_risk_score >= 75:
            severity = "Critical"
        elif final_risk_score >= 50:
            severity = "High"
        elif final_risk_score >= 30:
            severity = "Medium"
        else:
            severity = "Low"

        log['risk_score'] = final_risk_score
        log['severity_level'] = severity
        log['risk_factors'] = factors

        return log
