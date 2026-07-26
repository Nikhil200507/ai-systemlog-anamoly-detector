import random
import uuid
import datetime
from faker import Faker
import numpy as np
import pandas as pd
from geopy.distance import geodesic
import database

fake = Faker()

# Define global locations for simulated employees
LOCATIONS = [
    {"city": "New York", "country": "USA", "lat": 40.7128, "lon": -74.0060},
    {"city": "London", "country": "UK", "lat": 51.5074, "lon": -0.1278},
    {"city": "Tokyo", "country": "Japan", "lat": 35.6762, "lon": 139.6503},
    {"city": "Mumbai", "country": "India", "lat": 19.0760, "lon": 72.8777},
    {"city": "Sydney", "country": "Australia", "lat": -33.8688, "lon": 151.2093},
    {"city": "San Francisco", "country": "USA", "lat": 37.7749, "lon": -122.4194},
    {"city": "Munich", "country": "Germany", "lat": 48.1351, "lon": 11.5820},
    {"city": "São Paulo", "country": "Brazil", "lat": -23.5505, "lon": -46.6333},
    {"city": "Johannesburg", "country": "South Africa", "lat": -26.2041, "lon": 28.0473},
    {"city": "Singapore", "country": "Singapore", "lat": 1.3521, "lon": 103.8198}
]

DEPARTMENTS = ["Engineering", "HR", "Finance", "Sales", "Executive"]

# Define normal resources that different departments access
RESOURCES = {
    "Engineering": ["Internal Git Repo-03", "Kubernetes Cluster K8s-01", "Dev Web Server-04", "File Server File-Storage-01"],
    "HR": ["HR Intranet Portal HR-Portal", "File Server File-Storage-01", "Benefits Server HR-02"],
    "Finance": ["Payroll Portal Payroll-02", "Finance Database FinDB-01", "File Server File-Storage-01"],
    "Sales": ["CRM System CRM-01", "Sales Pipeline Sales-03", "File Server File-Storage-01"],
    "Executive": ["Executive Board Sharepoint", "File Server File-Storage-01", "HR Intranet Portal HR-Portal"]
}

# Critical admin resources (usually flagged when accessed by unauthorised personnel)
CRITICAL_RESOURCES = [
    "Domain Controller DC-01",
    "PostgreSQL Master",
    "Auth Gateway Auth-Gateway-01",
    "Internal Git Repo-03"
]

DEVICES = {
    "Engineering": [
        {"type": "Laptop", "os": "macOS", "browser": "Chrome"},
        {"type": "Laptop", "os": "Linux", "browser": "Firefox"},
        {"type": "Desktop", "os": "Linux", "browser": "Chrome"}
    ],
    "HR": [
        {"type": "Laptop", "os": "Windows", "browser": "Edge"},
        {"type": "Desktop", "os": "Windows", "browser": "Chrome"}
    ],
    "Finance": [
        {"type": "Laptop", "os": "Windows", "browser": "Edge"},
        {"type": "Desktop", "os": "Windows", "browser": "Chrome"}
    ],
    "Sales": [
        {"type": "Laptop", "os": "Windows", "browser": "Chrome"},
        {"type": "Mobile", "os": "Android", "browser": "Chrome"},
        {"type": "Laptop", "os": "macOS", "browser": "Safari"}
    ],
    "Executive": [
        {"type": "Laptop", "os": "macOS", "browser": "Safari"},
        {"type": "Mobile", "os": "iOS", "browser": "Safari"}
    ]
}

def generate_static_env():
    """Generates the static company profile metadata (100 users + devices)"""
    users = []
    devices = []
    
    for i in range(1, 101):
        u_id = f"USR-{100 + i}"
        name = fake.name()
        dept = random.choice(DEPARTMENTS)
        
        # Consistent location profile
        loc = random.choice(LOCATIONS)
        
        # Working hours (eg 9 to 17 or similar)
        start_hour = random.choice([7, 8, 9, 10])
        end_hour = start_hour + 8
        
        # IP subnet profile for this employee (VPN or local)
        ip_subnet = f"10.240.{i}"
        
        user = {
            "id": u_id,
            "name": name,
            "department": dept,
            "home_city": loc["city"],
            "home_country": loc["country"],
            "home_lat": loc["lat"],
            "home_lon": loc["lon"],
            "usual_start_hour": start_hour,
            "usual_end_hour": end_hour,
            "ip_subnet": ip_subnet
        }
        users.append(user)
        
        # Create 1-2 devices per user
        num_devices = random.choice([1, 2])
        for d_idx in range(num_devices):
            d_id = f"DEV-{u_id}-{d_idx}"
            dev_template = random.choice(DEVICES[dept])
            device = {
                "id": d_id,
                "user_id": u_id,
                "device_type": dev_template["type"],
                "os": dev_template["os"],
                "browser": dev_template["browser"]
            }
            devices.append(device)
            
    database.save_users(users)
    database.save_devices(devices)
    print("Static environment initialized: 100 users and devices stored in SQLite.")

def generate_normal_log(user, user_devices, timestamp=None):
    """Generates a normal log entry following user's profile baseline"""
    if not timestamp:
        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
    device = random.choice(user_devices)
    ip_addr = f"{user['ip_subnet']}.{random.randint(10, 250)}"
    
    # Event type distribution: logins, resource access, logout
    event_type = random.choices(
        ["LOGIN", "LOGOUT", "RESOURCE_ACCESS"],
        weights=[0.3, 0.1, 0.6],
        k=1
    )[0]
    
    login_status = "SUCCESS"
    resource = "N/A"
    
    if event_type == "RESOURCE_ACCESS":
        resource = random.choice(RESOURCES[user["department"]])
    elif event_type == "LOGIN":
        # Check if login falls within working hours, otherwise generate challenged
        hr = datetime.datetime.fromisoformat(timestamp).hour
        if hr < user["usual_start_hour"] or hr > user["usual_end_hour"]:
            # challenging logins outside hours
            login_status = random.choice(["SUCCESS", "CHALLENGED"])
        else:
            login_status = "SUCCESS"
            
    return {
        "id": str(uuid.uuid4()),
        "timestamp": timestamp,
        "user_id": user["id"],
        "department": user["department"],
        "device_id": device["id"],
        "ip_address": ip_addr,
        "city": user["home_city"],
        "country": user["home_country"],
        "latitude": user["home_lat"],
        "longitude": user["home_lon"],
        "os": device["os"],
        "browser": device["browser"],
        "event_type": event_type,
        "login_status": login_status,
        "resource_accessed": resource,
        "failed_attempt_count": 0,
        "session_id": f"SESS-{user['id']}-{random.randint(10000, 99999)}",
        "anomaly_label": 0,
        "attack_type": "NORMAL"
    }

# ----------------- ATTACK SIMULATIONS -----------------

def simulate_brute_force(user, user_devices, base_time=None):
    """Simulates a brute-force attack: multiple failures followed by possible success"""
    if not base_time:
        base_time = datetime.datetime.now(datetime.timezone.utc)
        
    logs = []
    device = random.choice(user_devices)
    # Attack IP is usually different from user's subnet
    ip_addr = f"198.51.100.{random.randint(2, 254)}" 
    attack_loc = random.choice([l for l in LOCATIONS if l["city"] != user["home_city"]])
    
    failed_attempts = random.randint(5, 8)
    session_id = f"SESS-ATTACK-{random.randint(1000, 9999)}"
    
    # 1. Failed attempts
    for i in range(failed_attempts):
        time_offset = base_time + datetime.timedelta(seconds=i * random.randint(2, 5))
        log = {
            "id": str(uuid.uuid4()),
            "timestamp": time_offset.isoformat(),
            "user_id": user["id"],
            "department": user["department"],
            "device_id": device["id"],
            "ip_address": ip_addr,
            "city": attack_loc["city"],
            "country": attack_loc["country"],
            "latitude": attack_loc["lat"],
            "longitude": attack_loc["lon"],
            "os": device["os"],
            "browser": device["browser"],
            "event_type": "LOGIN",
            "login_status": "FAILED",
            "resource_accessed": "N/A",
            "failed_attempt_count": i + 1,
            "session_id": session_id,
            "anomaly_label": 1,
            "attack_type": "BRUTE_FORCE"
        }
        logs.append(log)
        
    # 2. Final successful login (simulating cracked credentials)
    time_offset = base_time + datetime.timedelta(seconds=failed_attempts * 3 + 2)
    success_log = {
        "id": str(uuid.uuid4()),
        "timestamp": time_offset.isoformat(),
        "user_id": user["id"],
        "department": user["department"],
        "device_id": device["id"],
        "ip_address": ip_addr,
        "city": attack_loc["city"],
        "country": attack_loc["country"],
        "latitude": attack_loc["lat"],
        "longitude": attack_loc["lon"],
        "os": device["os"],
        "browser": device["browser"],
        "event_type": "LOGIN",
        "login_status": "SUCCESS",
        "resource_accessed": "N/A",
        "failed_attempt_count": 0,
        "session_id": session_id,
        "anomaly_label": 1,
        "attack_type": "BRUTE_FORCE"
    }
    logs.append(success_log)
    return logs

def simulate_credential_misuse(user, user_devices, base_time=None):
    """Simulates credential misuse (successful login under abnormal conditions)"""
    if not base_time:
        base_time = datetime.datetime.now(datetime.timezone.utc)
        
    # New location, device, time, IP, or critical resources
    new_loc = random.choice([l for l in LOCATIONS if l["city"] != user["home_city"]])
    new_ip = f"203.0.113.{random.randint(2, 254)}"
    
    # Spoof device type or assign completely new device
    dev_template = random.choice([d for depts in DEVICES.values() for d in depts if d not in DEVICES[user["department"]]])
    
    # Access to unauthorized critical resource
    crit_resource = random.choice(CRITICAL_RESOURCES)
    
    log = {
        "id": str(uuid.uuid4()),
        "timestamp": base_time.isoformat(),
        "user_id": user["id"],
        "department": user["department"],
        "device_id": f"DEV-UNKNOWN-{random.randint(100, 999)}",
        "ip_address": new_ip,
        "city": new_loc["city"],
        "country": new_loc["country"],
        "latitude": new_loc["lat"],
        "longitude": new_loc["lon"],
        "os": dev_template["os"],
        "browser": dev_template["browser"],
        "event_type": "RESOURCE_ACCESS",
        "login_status": "SUCCESS",
        "resource_accessed": crit_resource,
        "failed_attempt_count": 0,
        "session_id": f"SESS-{user['id']}-{random.randint(10000, 99999)}",
        "anomaly_label": 1,
        "attack_type": "CREDENTIAL_MISUSE"
    }
    return [log]

def simulate_impossible_travel(user, user_devices, base_time=None):
    """Simulates impossible travel: successful login in geographically distant place shortly after"""
    if not base_time:
        base_time = datetime.datetime.now(datetime.timezone.utc)
        
    logs = []
    device = random.choice(user_devices)
    
    # Event 1: Normal login from home
    time1 = base_time - datetime.timedelta(minutes=5)
    log1 = {
        "id": str(uuid.uuid4()),
        "timestamp": time1.isoformat(),
        "user_id": user["id"],
        "department": user["department"],
        "device_id": device["id"],
        "ip_address": f"{user['ip_subnet']}.{random.randint(10, 250)}",
        "city": user["home_city"],
        "country": user["home_country"],
        "latitude": user["home_lat"],
        "longitude": user["home_lon"],
        "os": device["os"],
        "browser": device["browser"],
        "event_type": "LOGIN",
        "login_status": "SUCCESS",
        "resource_accessed": "N/A",
        "failed_attempt_count": 0,
        "session_id": f"SESS-{user['id']}-10",
        "anomaly_label": 1,
        "attack_type": "IMPOSSIBLE_TRAVEL"
    }
    logs.append(log1)
    
    # Event 2: Distant login 3 minutes later
    time2 = base_time
    distant_loc = random.choice([l for l in LOCATIONS if l["city"] != user["home_city"]])
    
    # Calculate travel speed to document in log (geodesic distance)
    p1 = (user["home_lat"], user["home_lon"])
    p2 = (distant_loc["lat"], distant_loc["lon"])
    dist_km = geodesic(p1, p2).kilometers
    
    log2 = {
        "id": str(uuid.uuid4()),
        "timestamp": time2.isoformat(),
        "user_id": user["id"],
        "department": user["department"],
        "device_id": f"DEV-EXTERNAL-{random.randint(10, 99)}",
        "ip_address": f"192.0.2.{random.randint(2, 254)}",
        "city": distant_loc["city"],
        "country": distant_loc["country"],
        "latitude": distant_loc["lat"],
        "longitude": distant_loc["lon"],
        "os": "Android" if device["os"] != "Android" else "Windows",
        "browser": "Chrome",
        "event_type": "LOGIN",
        "login_status": "SUCCESS",
        "resource_accessed": "N/A",
        "failed_attempt_count": 0,
        "session_id": f"SESS-{user['id']}-20",
        "anomaly_label": 1,
        "attack_type": "IMPOSSIBLE_TRAVEL"
    }
    logs.append(log2)
    return logs

def simulate_device_spoofing(user, user_devices, base_time=None):
    """Simulates device spoofing: known device ID shows different OS/browser/network characteristics"""
    if not base_time:
        base_time = datetime.datetime.now(datetime.timezone.utc)
        
    device = random.choice(user_devices)
    # Spoof OS and browser
    spoofed_os = "Linux" if device["os"] != "Linux" else "Windows"
    spoofed_browser = "Firefox" if device["browser"] != "Firefox" else "Chrome"
    
    # IP is usually external/non-standard
    ip_addr = f"198.51.100.{random.randint(1, 254)}"
    spoofed_loc = random.choice([l for l in LOCATIONS if l["city"] != user["home_city"]])
    
    log = {
        "id": str(uuid.uuid4()),
        "timestamp": base_time.isoformat(),
        "user_id": user["id"],
        "department": user["department"],
        "device_id": device["id"], # Known device ID
        "ip_address": ip_addr,      # Non-typical subnet
        "city": spoofed_loc["city"],
        "country": spoofed_loc["country"],
        "latitude": spoofed_loc["lat"],
        "longitude": spoofed_loc["lon"],
        "os": spoofed_os,           # Spoofed OS
        "browser": spoofed_browser, # Spoofed browser
        "event_type": "LOGIN",
        "login_status": "SUCCESS",
        "resource_accessed": "N/A",
        "failed_attempt_count": 0,
        "session_id": f"SESS-SPOOF-{random.randint(1000, 9999)}",
        "anomaly_label": 1,
        "attack_type": "DEVICE_SPOOFING"
    }
    return [log]

def simulate_lateral_movement(user, user_devices, base_time=None):
    """Simulates lateral movement: user accessing multiple critical servers rapidly"""
    if not base_time:
        base_time = datetime.datetime.now(datetime.timezone.utc)
        
    logs = []
    device = random.choice(user_devices)
    ip_addr = f"{user['ip_subnet']}.{random.randint(10, 250)}"
    session_id = f"SESS-LATERAL-{random.randint(1000, 9999)}"
    
    # Access multiple critical resources in rapid succession
    for idx, resource in enumerate(CRITICAL_RESOURCES):
        time_offset = base_time + datetime.timedelta(seconds=idx * random.randint(1, 3))
        log = {
            "id": str(uuid.uuid4()),
            "timestamp": time_offset.isoformat(),
            "user_id": user["id"],
            "department": user["department"],
            "device_id": device["id"],
            "ip_address": ip_addr,
            "city": user["home_city"],
            "country": user["home_country"],
            "latitude": user["home_lat"],
            "longitude": user["home_lon"],
            "os": device["os"],
            "browser": device["browser"],
            "event_type": "RESOURCE_ACCESS",
            "login_status": "SUCCESS",
            "resource_accessed": resource,
            "failed_attempt_count": 0,
            "session_id": session_id,
            "anomaly_label": 1,
            "attack_type": "LATERAL_MOVEMENT"
        }
        logs.append(log)
    return logs
