export type AttackType = 
  | 'NORMAL'
  | 'CREDENTIAL_MISUSE'
  | 'BRUTE_FORCE'
  | 'LATERAL_MOVEMENT'
  | 'IMPOSSIBLE_TRAVEL'
  | 'DEVICE_SPOOFING';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface ShapFeature {
  name: string;
  value: string;
  contributionPercent: number; // e.g. 42
  impact: 'risk_increase' | 'baseline_match';
  description: string;
}

export interface AccessLog {
  id: string;
  timestamp: string;
  timeEpoch: number;
  userId: string;
  userName: string;
  userRole: string;
  department: string;
  sourceIp: string;
  location: string;
  targetSystem: string;
  deviceFingerprint: string;
  deviceType: string;
  browser: string;
  authMethod: string;
  status: 'SUCCESS' | 'FAILED' | 'CHALLENGED';
  riskScore: number; // 0 - 100
  isAnomaly: boolean;
  attackType: AttackType;
  severity: SeverityLevel;
  shapFeatures: ShapFeature[];
  rawPayload: Record<string, unknown>;
}

export interface IncidentAlert {
  id: string;
  title: string;
  attackType: AttackType;
  severity: SeverityLevel;
  targetUser: string;
  userRole: string;
  riskScore: number;
  detectedAt: string;
  sourceIp: string;
  location: string;
  summary: string;
  status: 'OPEN' | 'INVESTIGATING' | 'MITIGATED' | 'DISMISSED';
  affectedAssets: string[];
  shapFeatures: ShapFeature[];
  timeline: {
    time: string;
    event: string;
    anomalyScore: number;
  }[];
}

export interface ModelMetrics {
  totalLogsScanned: number;
  activeAnomalies: number;
  falsePositiveRate: number; // percentage
  precision: number; // percentage
  inferenceLatencyMs: number;
  driftScore: number; // 0.0 to 1.0
  classImbalanceRatio: string; // e.g. "1 : 12,500"
  coldStartResolvedCount: number;
  lastRetrained: string;
  modelStatus: 'OPTIMAL' | 'DRIFT_DETECTED' | 'RETRAINING';
}

export interface LateralMovementNode {
  id: string;
  label: string;
  type: 'USER' | 'WORKSTATION' | 'SERVER' | 'DOMAIN_CONTROLLER' | 'DATABASE';
  ip: string;
  isCompromised?: boolean;
}

export interface LateralMovementEdge {
  from: string;
  to: string;
  protocol: string;
  timestamp: string;
  riskScore: number;
  isAnomaly: boolean;
}
