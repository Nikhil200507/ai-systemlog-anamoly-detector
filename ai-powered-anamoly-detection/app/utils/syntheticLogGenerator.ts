import { AccessLog, AttackType, SeverityLevel, ShapFeature, IncidentAlert, ModelMetrics } from '../types/benzene';

// Seed users for realistic telemetry
const USER_PROFILES = [
  { id: 'usr-901', name: 'Elena Rostova', role: 'DevOps Lead', dept: 'Engineering', defaultIp: '192.168.1.45', loc: 'San Francisco, US', normalHours: [8, 19] },
  { id: 'usr-412', name: 'Marcus Vance', role: 'Financial Controller', dept: 'Finance', defaultIp: '192.168.2.110', loc: 'New York, US', normalHours: [9, 17] },
  { id: 'usr-783', name: 'Aisha Patel', role: 'Security Engineer', dept: 'SecOps', defaultIp: '192.168.1.88', loc: 'London, UK', normalHours: [7, 18] },
  { id: 'usr-204', name: 'Chen Wei', role: 'Backend Developer', dept: 'Engineering', defaultIp: '192.168.3.15', loc: 'Singapore, SG', normalHours: [9, 21] },
  { id: 'usr-559', name: 'David Miller', role: 'HR Director', dept: 'Human Resources', defaultIp: '192.168.4.22', loc: 'Chicago, US', normalHours: [8, 17] },
  { id: 'usr-108', name: 'Samantha Clark', role: 'VP Operations', dept: 'Executive', defaultIp: '192.168.5.01', loc: 'Seattle, US', normalHours: [8, 18] },
  { id: 'usr-882', name: 'Tariq Al-Mansoor', role: 'Database Admin', dept: 'IT Infrastructure', defaultIp: '192.168.1.12', loc: 'Dubai, AE', normalHours: [8, 17] },
];

const TARGET_SYSTEMS = [
  'AWS Production K8s Cluster',
  'PostgreSQL Primary DB',
  'Active Directory Domain Controller (DC-01)',
  'Corporate GSuite SSO',
  'Salesforce CRM Vault',
  'Internal HashiCorp Vault',
  'Stripe Payment Gateway API',
  'Workday HR Portal'
];

const BROWSERS = [
  'Chrome 126.0 (macOS)',
  'Firefox 127.0 (Windows 11)',
  'Safari 17.5 (macOS)',
  'Edge 125.0 (Windows 11)',
  'Brave 1.66 (Linux)'
];

let logCounter = 1000;

export function generateRandomLog(forceAttackType?: AttackType): AccessLog {
  logCounter++;
  const id = `LOG-${logCounter}`;
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
  const epoch = now.getTime();

  const user = USER_PROFILES[Math.floor(Math.random() * USER_PROFILES.length)];
  const isAttack = forceAttackType ? forceAttackType !== 'NORMAL' : Math.random() < 0.15;
  
  const attackType: AttackType = forceAttackType 
    ? forceAttackType 
    : (isAttack ? getRandomAttackType() : 'NORMAL');

  if (attackType === 'NORMAL') {
    return {
      id,
      timestamp: timeStr,
      timeEpoch: epoch,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      department: user.dept,
      sourceIp: user.defaultIp,
      location: user.loc,
      targetSystem: TARGET_SYSTEMS[Math.floor(Math.random() * TARGET_SYSTEMS.length)],
      deviceFingerprint: `FP-${user.id.slice(-3)}-78A9`,
      deviceType: 'Corporate Laptop (Managed)',
      browser: BROWSERS[Math.floor(Math.random() * BROWSERS.length)],
      authMethod: 'FIDO2 / WebAuthn Hardware Key',
      status: 'SUCCESS',
      riskScore: Math.floor(Math.random() * 15) + 2, // Low 2-17
      isAnomaly: false,
      attackType: 'NORMAL',
      severity: 'INFO',
      shapFeatures: [
        { name: 'Geo-Velocity', value: '0 km/h (In-Region)', contributionPercent: 2, impact: 'baseline_match', description: 'Matches historical geographic centroid' },
        { name: 'Device Fingerprint Hash', value: 'Match (Score: 0.99)', contributionPercent: 1, impact: 'baseline_match', description: 'Known hardware GUID and canvas hash' },
        { name: 'Time-of-Day Window', value: 'Standard Hours (11:24)', contributionPercent: 3, impact: 'baseline_match', description: 'Fits within user 30-day working histogram' },
        { name: 'Subnet Entropy', value: 'Corporate VPN / Low', contributionPercent: 1, impact: 'baseline_match', description: 'Internal trusted subnet range 192.168.x.x' }
      ],
      rawPayload: {
        session_id: `sess_${Math.random().toString(36).substring(7)}`,
        auth_protocol: 'OIDC/SAML2',
        tls_ja3: '771,4865-4866-4867,0-23-65281-10-11,29-23-24,0',
        peer_distance_score: 0.04
      }
    };
  }

  // Generate Attack Scenarios
  switch (attackType) {
    case 'IMPOSSIBLE_TRAVEL': {
      return {
        id,
        timestamp: timeStr,
        timeEpoch: epoch,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        department: user.dept,
        sourceIp: '185.220.101.42',
        location: 'Frankfurt, DE (TOR Exit)',
        targetSystem: 'HashiCorp Secrets Vault',
        deviceFingerprint: 'FP-UNK-8899X',
        deviceType: 'Unrecognized Linux Workstation',
        browser: 'Firefox 115.0 (Tor Browser)',
        authMethod: 'Password + SMS OTP',
        status: 'SUCCESS',
        riskScore: 94,
        isAnomaly: true,
        attackType: 'IMPOSSIBLE_TRAVEL',
        severity: 'CRITICAL',
        shapFeatures: [
          { name: 'Geo-Velocity', value: '4,850 km/h (Delta: 6 mins)', contributionPercent: 46, impact: 'risk_increase', description: 'Physical impossibility: Prior login San Francisco 6m ago' },
          { name: 'IP Reputation / ASN', value: 'Known TOR Relay (AS200651)', contributionPercent: 28, impact: 'risk_increase', description: 'High-risk anonymizing proxy network detected' },
          { name: 'Device Hardware Delta', value: 'New Unregistered Device', contributionPercent: 14, impact: 'risk_increase', description: 'No prior fingerprint record for user profile' },
          { name: 'Access Sensitivity', value: 'Tier 1 Infrastructure Vault', contributionPercent: 6, impact: 'risk_increase', description: 'Critical asset target outside normal developer scope' }
        ],
        rawPayload: {
          session_id: `sess_anom_${Math.random().toString(36).substring(7)}`,
          velocity_kmh: 4850.4,
          prev_ip: user.defaultIp,
          prev_location: user.loc,
          time_delta_seconds: 360
        }
      };
    }

    case 'BRUTE_FORCE': {
      return {
        id,
        timestamp: timeStr,
        timeEpoch: epoch,
        userId: 'usr-999',
        userName: 'Admin.Root (Targeted)',
        userRole: 'Global Administrator',
        department: 'IT Security',
        sourceIp: '45.142.214.103',
        location: 'Moscow, RU',
        targetSystem: 'Active Directory Domain Controller (DC-01)',
        deviceFingerprint: 'FP-BOT-NET-01',
        deviceType: 'Automated Scripting Engine',
        browser: 'Python-urllib/3.10',
        authMethod: 'Basic NTLM / LDAP',
        status: 'FAILED',
        riskScore: 98,
        isAnomaly: true,
        attackType: 'BRUTE_FORCE',
        severity: 'CRITICAL',
        shapFeatures: [
          { name: 'Authentication Burst Velocity', value: '142 requests / 5 sec', contributionPercent: 52, impact: 'risk_increase', description: 'Exponential spike in failed password attempts' },
          { name: 'User-Agent Mismatch', value: 'Python Script / Botnet Signature', contributionPercent: 24, impact: 'risk_increase', description: 'Automated headless request structure' },
          { name: 'IP Threat Intelligence', value: 'Malicious Botnet ASN 44122', contributionPercent: 16, impact: 'risk_increase', description: 'Listed on active C2 vulnerability feeds' },
          { name: 'Target Credential Privilege', value: 'Global Admin Acct', contributionPercent: 6, impact: 'risk_increase', description: 'High-value privilege account target' }
        ],
        rawPayload: {
          failure_count_window: 142,
          auth_protocol: 'LDAPS',
          burst_duration_ms: 4800,
          error_code: 'STATUS_WRONG_PASSWORD'
        }
      };
    }

    case 'LATERAL_MOVEMENT': {
      return {
        id,
        timestamp: timeStr,
        timeEpoch: epoch,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        department: user.dept,
        sourceIp: '10.240.12.99',
        location: 'Internal Subnet (VLAN 40)',
        targetSystem: 'PostgreSQL Primary DB (Financial Vault)',
        deviceFingerprint: `FP-${user.id.slice(-3)}-78A9`,
        deviceType: 'Compromised Dev Laptop',
        browser: 'WinRM / PowerShell Remoting',
        authMethod: 'Kerberos Ticket (Pass-The-Hash)',
        status: 'SUCCESS',
        riskScore: 89,
        isAnomaly: true,
        attackType: 'LATERAL_MOVEMENT',
        severity: 'HIGH',
        shapFeatures: [
          { name: 'Peer Group Deviation', value: 'Top 0.01% Role Outlier', contributionPercent: 44, impact: 'risk_increase', description: 'DevOps role attempting direct database SMB access' },
          { name: 'Subnet Hopping Frequency', value: '4 Subnets in 20 seconds', contributionPercent: 30, impact: 'risk_increase', description: 'Abnormal sequential network traversal detected' },
          { name: 'Auth Token Entropy', value: 'Kerberos TGT Replay Signature', contributionPercent: 12, impact: 'risk_increase', description: 'Pass-the-hash indicators in Kerberos ticket metadata' },
          { name: 'Protocol Anomaly', value: 'Raw PowerShell SMB', contributionPercent: 3, impact: 'risk_increase', description: 'Non-interactive shell protocol execution' }
        ],
        rawPayload: {
          hop_path: ['10.240.1.10', '10.240.4.18', '10.240.12.99'],
          kerberos_ticket_age: 18400,
          is_pass_the_hash: true
        }
      };
    }

    case 'CREDENTIAL_MISUSE': {
      return {
        id,
        timestamp: timeStr,
        timeEpoch: epoch,
        userId: 'usr-108',
        userName: 'Samantha Clark',
        userRole: 'VP Operations',
        department: 'Executive',
        sourceIp: '198.51.100.99',
        location: 'Sao Paulo, BR',
        targetSystem: 'AWS Production K8s Cluster',
        deviceFingerprint: 'FP-SPOOF-991',
        deviceType: 'Unmanaged Android Emulator',
        browser: 'Headless Chrome / Puppeteer',
        authMethod: 'Session Token Injection',
        status: 'SUCCESS',
        riskScore: 87,
        isAnomaly: true,
        attackType: 'CREDENTIAL_MISUSE',
        severity: 'HIGH',
        shapFeatures: [
          { name: 'Off-Hours Anomaly', value: '03:14 AM Local Time', contributionPercent: 38, impact: 'risk_increase', description: 'Access outside executive 90-day activity envelope' },
          { name: 'Role Privilege Mismatch', value: 'K8s Cluster Secret Export', contributionPercent: 31, impact: 'risk_increase', description: 'Executive account accessing raw engineering cluster API' },
          { name: 'Session Token Reuse', value: 'Expired Token Replay', contributionPercent: 18, impact: 'risk_increase', description: 'Auth token generated from previous session in US' },
          { name: 'IP Velocity', value: 'New Regional Gateway', contributionPercent: 10, impact: 'risk_increase', description: 'Unprecedented geographic ISP ASN' }
        ],
        rawPayload: {
          api_endpoint: '/api/v1/namespaces/kube-system/secrets',
          token_age_hours: 72,
          is_off_hours: true
        }
      };
    }

    case 'DEVICE_SPOOFING': {
      return {
        id,
        timestamp: timeStr,
        timeEpoch: epoch,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        department: user.dept,
        sourceIp: user.defaultIp,
        location: user.loc,
        targetSystem: 'Corporate GSuite SSO',
        deviceFingerprint: 'FP-SPOOF-CANVAS-FAIL',
        deviceType: 'Forged User-Agent (Bot)',
        browser: 'Safari 17.5 (Claimed) / Chrome Engine (Actual)',
        authMethod: 'Password + Push Notification',
        status: 'SUCCESS',
        riskScore: 82,
        isAnomaly: true,
        attackType: 'DEVICE_SPOOFING',
        severity: 'MEDIUM',
        shapFeatures: [
          { name: 'Canvas & WebGL Fingerprint Mismatch', value: 'Entropy Mismatch 0.94', contributionPercent: 42, impact: 'risk_increase', description: 'Rendered canvas noise contradicts claimed Safari browser' },
          { name: 'TLS Client Hello JA3 Hash', value: 'JA3: e7d705a3286e9... (Python)', contributionPercent: 33, impact: 'risk_increase', description: 'Low-level TLS stack matches automated Python HTTP library' },
          { name: 'Headers Order Perturbation', value: 'Non-Standard HTTP/2 Flags', contributionPercent: 15, impact: 'risk_increase', description: 'Header field ordering characteristic of proxy interceptors' },
          { name: 'IP Subnet Match', value: 'Match Corporate Subnet', contributionPercent: 10, impact: 'baseline_match', description: 'Valid internal network IP address used' }
        ],
        rawPayload: {
          claimed_ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)... Safari/605.1.15',
          webgl_vendor: 'Google Inc. (NVIDIA)',
          ja3_hash: 'e7d705a3286e91ea40f5b4974d92209b',
          fingerprint_score: 0.12
        }
      };
    }

    default:
      return generateRandomLog('NORMAL');
  }
}

function getRandomAttackType(): AttackType {
  const types: AttackType[] = [
    'CREDENTIAL_MISUSE',
    'BRUTE_FORCE',
    'LATERAL_MOVEMENT',
    'IMPOSSIBLE_TRAVEL',
    'DEVICE_SPOOFING'
  ];
  return types[Math.floor(Math.random() * types.length)];
}

export function generateInitialLogs(count = 35): AccessLog[] {
  const logs: AccessLog[] = [];
  for (let i = 0; i < count; i++) {
    // Make first few non-anomalies, then inject 3-4 distinct anomalies
    let forceType: AttackType | undefined = undefined;
    if (i === 5) forceType = 'IMPOSSIBLE_TRAVEL';
    if (i === 12) forceType = 'BRUTE_FORCE';
    if (i === 19) forceType = 'LATERAL_MOVEMENT';
    if (i === 27) forceType = 'DEVICE_SPOOFING';
    if (i === 32) forceType = 'CREDENTIAL_MISUSE';
    
    logs.push(generateRandomLog(forceType));
  }
  return logs;
}

export function generateInitialAlerts(logs: AccessLog[]): IncidentAlert[] {
  const anomalies = logs.filter(l => l.isAnomaly);
  return anomalies.map((log, index) => ({
    id: `ALT-2026-${890 + index}`,
    title: getAlertTitle(log.attackType, log.userName),
    attackType: log.attackType,
    severity: log.severity,
    targetUser: log.userName,
    userRole: log.userRole,
    riskScore: log.riskScore,
    detectedAt: log.timestamp,
    sourceIp: log.sourceIp,
    location: log.location,
    summary: getAlertSummary(log),
    status: index === 0 ? 'OPEN' : index === 1 ? 'INVESTIGATING' : 'MITIGATED',
    affectedAssets: [log.targetSystem, 'Internal Kube-DNS', 'Auth-Gateway-02'],
    shapFeatures: log.shapFeatures,
    timeline: [
      { time: 'T-15m', event: 'Normal baseline access from home region', anomalyScore: 12 },
      { time: 'T-06m', event: `Session created from ${log.location}`, anomalyScore: 68 },
      { time: 'T-00m', event: `Benzene Engine flagged ${log.attackType} (SHAP Score: ${log.riskScore})`, anomalyScore: log.riskScore }
    ]
  }));
}

function getAlertTitle(attackType: AttackType, user: string): string {
  switch (attackType) {
    case 'IMPOSSIBLE_TRAVEL': return `Geographic Velocity Anomaly (${user})`;
    case 'BRUTE_FORCE': return `High-Density Password Spraying Detected`;
    case 'LATERAL_MOVEMENT': return `Internal Subnet Traversals Outside Role Baseline`;
    case 'CREDENTIAL_MISUSE': return `Executive Account Off-Hours Vault Exfiltration`;
    case 'DEVICE_SPOOFING': return `Browser TLS Fingerprint & Canvas Mismatch`;
    default: return `Behavioral Anomaly Triggered (${user})`;
  }
}

function getAlertSummary(log: AccessLog): string {
  switch (log.attackType) {
    case 'IMPOSSIBLE_TRAVEL':
      return `User ${log.userName} initiated session in ${log.location} within 6 minutes of an active session in San Francisco. Physical velocity delta exceeds 4,800 km/h.`;
    case 'BRUTE_FORCE':
      return `Automated botnet from ${log.sourceIp} generated 142 failed authentication attempts against ${log.targetSystem} targeting privileged accounts.`;
    case 'LATERAL_MOVEMENT':
      return `Compromised workstation traversing internal subnets via Kerberos ticket replaying (Pass-The-Hash) targeting ${log.targetSystem}.`;
    case 'CREDENTIAL_MISUSE':
      return `Account ${log.userName} (${log.userRole}) attempted sensitive production API calls at 03:14 AM from Brazil using an expired token replay.`;
    case 'DEVICE_SPOOFING':
      return `HTTP headers claim Safari browser on macOS, but low-level TLS JA3 fingerprint matches Python requests library from ${log.sourceIp}.`;
    default:
      return `Statistical anomaly threshold exceeded for user ${log.userName}.`;
  }
}

export function getDefaultModelMetrics(): ModelMetrics {
  return {
    totalLogsScanned: 1482910,
    activeAnomalies: 14,
    falsePositiveRate: 0.008, // 0.008%
    precision: 99.42,
    inferenceLatencyMs: 8.4,
    driftScore: 0.12, // Low drift
    classImbalanceRatio: '1 : 14,200',
    coldStartResolvedCount: 412,
    lastRetrained: '2026-07-25 04:00 UTC (Auto-Pipeline)',
    modelStatus: 'OPTIMAL'
  };
}
