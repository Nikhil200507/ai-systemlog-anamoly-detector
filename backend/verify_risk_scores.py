import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "benzene_telemetry.db")

def verify_db_risk_scores():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT id, user_id, risk_score, severity_level, risk_factors, anomaly_score, is_anomaly, predicted_attack_type FROM logs ORDER BY timestamp DESC LIMIT 30")
    rows = cursor.fetchall()
    conn.close()

    print(f"--- Verifying {len(rows)} recent database logs ---")

    passed_count = 0
    mismatch_count = 0

    for idx, row in enumerate(rows):
        log_id = row['id']
        u_id = row['user_id']
        stored_score = row['risk_score']
        stored_severity = row['severity_level']
        
        try:
            factors = json.loads(row['risk_factors']) if row['risk_factors'] else []
        except Exception:
            factors = []

        # 1. Sum factor points
        computed_sum = sum(f.get('points', 0) for f in factors)
        expected_score = min(100, max(0, computed_sum))

        # 2. Check Severity mapping
        if expected_score >= 75:
            expected_sev = "Critical"
        elif expected_score >= 50:
            expected_sev = "High"
        elif expected_score >= 30:
            expected_sev = "Medium"
        else:
            expected_sev = "Low"

        is_score_ok = (stored_score == expected_score)
        is_sev_ok = (stored_severity == expected_sev)

        if is_score_ok and is_sev_ok:
            passed_count += 1
        else:
            mismatch_count += 1
            print(f"Mismatch at Log {log_id}:")
            print(f"  Stored Score: {stored_score} | Computed Points Sum: {computed_sum} (Expected: {expected_score})")
            print(f"  Stored Severity: {stored_severity} | Expected Severity: {expected_sev}")
            print(f"  Factors ({len(factors)}): {factors}")

    print("\n=== VERIFICATION RESULT ===")
    print(f"Total Logs Checked: {len(rows)}")
    print(f"Correctly Verified: {passed_count}")
    print(f"Mismatches: {mismatch_count}")

if __name__ == "__main__":
    verify_db_risk_scores()
