"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, Activity, AlertTriangle, CheckCircle2, RefreshCcw, Zap, 
  User, MapPin, Cpu, Sparkles, X, ThumbsUp, ThumbsDown, ShieldCheck, 
  TrendingUp, Users, Brain, Eye, ArrowUpRight, Lock, Server, BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, Legend 
} from 'recharts';
import { AccessLog } from '../../types/benzene';

interface RealtimeDashboardTabProps {
  logs: AccessLog[];
  isBackendOnline?: boolean;
  onTriggerAttack?: (type: string) => void;
  onShowNotification: (msg: string) => void;
}

const COLORS = ['#ef4444', '#f59e0b', '#06b6d4', '#a855f7', '#ec4899', '#10b981'];

export const RealtimeDashboardTab: React.FC<RealtimeDashboardTabProps> = ({
  logs,
  isBackendOnline = false,
  onTriggerAttack,
  onShowNotification,
}) => {
  const [dashboardData, setDashboardData] = useState<any>({
    overview: { total_events: 0, total_anomalies: 0, critical_threats: 0, active_threats: 0, false_positive_rate: 0.1 },
    attack_distribution: [],
    severity_distribution: [],
    high_risk_users: [],
    model_metrics: { precision: 0.96, recall: 0.94, f1_score: 0.95, false_positive_rate: 0.1 }
  });

  const [liveStream, setLiveStream] = useState<any[]>([]);
  const [investigatingEvent, setInvestigatingEvent] = useState<any | null>(null);
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch backend dashboard aggregated metrics from /api/dashboard-metrics
  const fetchDashboardMetrics = async () => {
    if (!isBackendOnline) return;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    try {
      const res = await fetch("http://localhost:8000/api/dashboard-metrics", { signal: controller.signal });
      const logsRes = await fetch("http://localhost:8000/api/logs?limit=40", { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLiveStream(logsData);
      }
    } catch (err) {
      clearTimeout(timeoutId);
    }
  };

  // Connect to FastAPI WebSocket ws://localhost:8000/ws/stream
  useEffect(() => {
    if (!isBackendOnline) return;

    fetchDashboardMetrics();
    const interval = setInterval(fetchDashboardMetrics, 4000);

    try {
      const ws = new WebSocket("ws://localhost:8000/ws/stream");
      wsRef.current = ws;

      ws.onopen = () => {
        setIsWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "NEW_LOG" && message.data) {
            setLiveStream((prev) => [message.data, ...prev.slice(0, 39)]);
            fetchDashboardMetrics();
          }
        } catch (e) {
          // JSON parse skip
        }
      };

      ws.onclose = () => {
        setIsWsConnected(false);
      };
    } catch (err) {
      setIsWsConnected(false);
    }

    return () => {
      clearInterval(interval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isBackendOnline]);

  // Analyst Action Handler (Confirm Attack, Mark False Positive)
  const handleAnalystAction = async (eventId: string, feedbackType: 'FALSE_POSITIVE' | 'CONFIRMED_ATTACK') => {
    if (!isBackendOnline) {
      onShowNotification(`Analyst action logged locally: ${feedbackType}`);
      return;
    }
    setIsActionLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, feedback: feedbackType })
      });
      if (res.ok) {
        const data = await res.json();
        onShowNotification(data.message);
        await fetchDashboardMetrics();
        if (investigatingEvent && investigatingEvent.id === eventId) {
          setInvestigatingEvent({
            ...investigatingEvent,
            analyst_feedback: feedbackType,
            fp_decision: feedbackType === 'FALSE_POSITIVE' ? 'Suppressed' : 'Escalate'
          });
        }
      }
    } catch (err) {
      onShowNotification("Action failed.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Fallback logs array if offline
  const displayStream = isBackendOnline && liveStream.length > 0
    ? liveStream
    : logs.map(l => ({
        id: l.id,
        user_id: l.userId,
        timestamp: l.timestamp,
        department: l.department,
        device_id: l.deviceFingerprint,
        ip_address: l.sourceIp,
        city: l.location.split(',')[0] || 'Unknown',
        country: l.location.split(',')[1]?.trim() || 'US',
        os: l.browser.split(' ')[0] || 'Windows',
        browser: l.browser,
        event_type: l.authMethod,
        login_status: l.status,
        resource_accessed: l.targetSystem,
        failed_attempt_count: l.status === 'FAILED' ? 4 : 0,
        anomaly_score: l.riskScore / 100,
        is_anomaly: l.isAnomaly ? 1 : 0,
        predicted_attack_type: l.attackType === 'NORMAL' ? 'Normal' : l.attackType.replace('_', ' '),
        classification_confidence: 0.94,
        risk_score: l.riskScore,
        severity_level: l.riskScore >= 75 ? 'Critical' : l.riskScore >= 50 ? 'High' : l.riskScore >= 30 ? 'Medium' : 'Low',
        explanation: l.isAnomaly ? `Anomalous access request detected targeting ${l.targetSystem} from ${l.location}.` : `Normal baseline match.`,
        fp_decision: l.isAnomaly ? 'Escalate' : 'Suppressed',
        suppression_reason: l.isAnomaly ? 'High-risk baseline deviation.' : 'Routine employee access.',
        analyst_feedback: 'NONE'
      }));

  const ov = dashboardData.overview || {};
  const modelM = dashboardData.model_metrics || {};

  // Mock Timeline Data for Recharts
  const timelineData = [
    { time: '00:00', total: 120, anomalies: 4, critical: 1 },
    { time: '04:00', total: 45, anomalies: 1, critical: 0 },
    { time: '08:00', total: 340, anomalies: 8, critical: 2 },
    { time: '12:00', total: 580, anomalies: 14, critical: 3 },
    { time: '16:00', total: 490, anomalies: 11, critical: 2 },
    { time: '20:00', total: 210, anomalies: 6, critical: 1 }
  ];

  const attackPieData = dashboardData.attack_distribution?.length > 0 
    ? dashboardData.attack_distribution 
    : [
        { name: 'Brute Force', count: 14 },
        { name: 'Credential Misuse', count: 8 },
        { name: 'Impossible Travel', count: 6 },
        { name: 'Device Spoofing', count: 5 },
        { name: 'Lateral Movement', count: 7 }
      ];

  const severityBarData = dashboardData.severity_distribution?.length > 0 
    ? dashboardData.severity_distribution 
    : [
        { name: 'Low', count: 3159 },
        { name: 'Medium', count: 2 },
        { name: 'High', count: 24 },
        { name: 'Critical', count: 1 }
      ];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Module Header & Attack Injection Control Bar */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-[#12131c] via-[#090a12] to-[#04050a] p-6 md:p-8 shadow-2xl">
        <span className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-cyan-600/10 filter blur-3xl" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-xs font-mono-code text-cyan-400 font-bold uppercase tracking-widest">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Security Operations Center (SOC) Command Console</span>
            </div>
            
            <h2 className="text-3xl font-syne font-extrabold text-white tracking-tight">
              Real-Time Cybersecurity Analyst Dashboard
            </h2>
            
            <p className="text-xs text-zinc-400 max-w-3xl font-space leading-relaxed">
              Unified command center streaming live UEBA telemetry via WebSockets (`ws://localhost:8000/ws/stream`). Unifies Isolation Forest anomaly scores, Random Forest attack classifications, Explainable Risk Ratings, Gemini AI narratives, and False-Positive reduction decisions.
            </p>
          </div>

          {/* WebSocket Connection Status Badge */}
          <div className="shrink-0 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 font-mono-code text-xs space-y-2 min-w-[230px]">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] uppercase font-bold text-zinc-500">REALTIME STREAM</span>
              <span className={`w-2.5 h-2.5 rounded-full ${isWsConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            </div>
            <div className="font-bold text-white flex items-center gap-2 text-sm">
              <CheckCircle2 className={`w-4 h-4 ${isWsConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span>{isWsConnected ? 'WebSocket Live Stream' : 'HTTP Polling Stream'}</span>
            </div>
            <div className="text-[11px] text-zinc-400 border-t border-zinc-900 pt-2 flex items-center justify-between">
              <span>Port: 8000</span>
              <span>Latency: &lt;50ms</span>
            </div>
          </div>
        </div>

        {/* Prominent Cyberattack Injection Control Bar */}
        <div className="mt-6 pt-6 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-2 font-mono-code text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Simulate Real-Time Cyberattack Payload:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { name: 'Brute Force', type: 'brute_force', color: 'hover:border-red-500 hover:bg-red-950/40' },
              { name: 'Credential Misuse', type: 'credential_misuse', color: 'hover:border-amber-500 hover:bg-amber-950/40' },
              { name: 'Impossible Travel', type: 'impossible_travel', color: 'hover:border-cyan-500 hover:bg-cyan-950/40' },
              { name: 'Device Spoofing', type: 'device_spoofing', color: 'hover:border-purple-500 hover:bg-purple-950/40' },
              { name: 'Lateral Movement', type: 'lateral_movement', color: 'hover:border-pink-500 hover:bg-pink-950/40' },
            ].map((atk) => (
              <button
                key={atk.type}
                onClick={() => {
                  if (isBackendOnline && onTriggerAttack) {
                    onTriggerAttack(atk.type);
                    onShowNotification(`Injecting ${atk.name} attack payload through UEBA pipeline...`);
                    setTimeout(fetchDashboardMetrics, 1500);
                  } else {
                    onShowNotification(`Simulated ${atk.name} locally.`);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono-code text-xs font-bold transition-all cursor-pointer ${atk.color}`}
              >
                + {atk.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5 Key Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono-code">
            <span>TOTAL TELEMETRY</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-syne font-extrabold text-white">
            {ov.total_events || displayStream.length}
          </div>
          <div className="text-[10px] font-mono-code text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Live Event Stream
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono-code">
            <span>DETECTED ANOMALIES</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-syne font-extrabold text-amber-400">
            {ov.total_anomalies || displayStream.filter((l: any) => l.is_anomaly === 1).length}
          </div>
          <div className="text-[10px] font-mono-code text-zinc-500">
            Isolation Forest Filter
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono-code">
            <span>CRITICAL THREATS</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-syne font-extrabold text-red-400">
            {ov.critical_threats || displayStream.filter((l: any) => l.risk_score >= 75).length}
          </div>
          <div className="text-[10px] font-mono-code text-red-400 font-bold">
            Risk Score &ge; 75 / 100
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono-code">
            <span>ACTIVE ESCALATED</span>
            <Lock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-syne font-extrabold text-purple-400">
            {ov.active_threats || displayStream.filter((l: any) => l.fp_decision === 'Escalate').length}
          </div>
          <div className="text-[10px] font-mono-code text-zinc-500">
            Triage Queue
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono-code">
            <span>FALSE-POSITIVE RATE</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-syne font-extrabold text-emerald-400">
            {ov.false_positive_rate || 0.1}%
          </div>
          <div className="text-[10px] font-mono-code text-emerald-400">
            Contextual Reduction
          </div>
        </div>

      </div>

      {/* Visual Analytics Grid (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Timeline Chart */}
        <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-950/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-syne text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Threat Activity Timeline</span>
            </h3>
            <span className="text-[10px] font-mono-code text-zinc-500">Live Volume (24h)</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAnom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#52525b" fontSize={10} fontFamily="monospace" />
                <YAxis stroke="#52525b" fontSize={10} fontFamily="monospace" />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px', fontFamily: 'monospace' }} />
                <Area type="monotone" dataKey="total" name="Total Events" stroke="#06b6d4" fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="anomalies" name="Anomalies" stroke="#ef4444" fillOpacity={1} fill="url(#colorAnom)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attack Vector Distribution Chart */}
        <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-950/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-syne text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-purple-400" />
              <span>Attack Vector Distribution</span>
            </h3>
            <span className="text-[10px] font-mono-code text-zinc-500">Random Forest</span>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attackPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {attackPieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px', fontFamily: 'monospace' }} />
                <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Severity Distribution Bar Chart */}
        <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-950/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-syne text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Risk Severity Distribution</span>
            </h3>
            <span className="text-[10px] font-mono-code text-zinc-500">Weighted Scoring Engine</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityBarData.map((s: any) => ({
                ...s,
                fill: s.name === 'Critical' ? '#ef4444' : s.name === 'High' ? '#f59e0b' : s.name === 'Medium' ? '#eab308' : '#10b981'
              }))}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#52525b" fontSize={11} fontFamily="monospace" />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px', fontFamily: 'monospace' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {severityBarData.map((entry: any, index: number) => {
                    const fill = entry.name === 'Critical' ? '#ef4444' : entry.name === 'High' ? '#f59e0b' : entry.name === 'Medium' ? '#eab308' : '#10b981';
                    return <Cell key={`cell-sev-${index}`} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Main Stream & Threat Inspection Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Live Security Event Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-syne text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Live Security Event Stream ({displayStream.length})</span>
            </h3>
            <span className="text-[10px] font-mono-code text-zinc-500">Click Event for Deep Investigation</span>
          </div>

          <div className="p-4 rounded-3xl border border-zinc-800 bg-zinc-950/90 max-h-[640px] overflow-y-auto scrollbar-thin space-y-2">
            {displayStream.map((item: any) => {
              const isSelected = investigatingEvent?.id === item.id;
              const isAnom = item.is_anomaly === 1;
              const riskScore = item.risk_score || 0;
              const severity = item.severity_level || (riskScore >= 75 ? 'Critical' : riskScore >= 50 ? 'High' : riskScore >= 30 ? 'Medium' : 'Low');

              return (
                <div
                  key={item.id}
                  onClick={() => setInvestigatingEvent(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-950/50' 
                      : isAnom 
                      ? 'bg-red-950/20 border-red-900/60 hover:border-red-600' 
                      : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 font-mono-code text-xs font-bold text-white">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{item.user_id} ({item.department || 'Engineering'})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAnom && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-extrabold bg-red-950 border border-red-600 text-red-300 uppercase">
                          {item.predicted_attack_type || 'ANOMALY'}
                        </span>
                      )}

                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono-code font-bold border ${
                        severity === 'Critical' ? 'bg-red-950 border-red-500 text-red-300' :
                        severity === 'High' ? 'bg-amber-950 border-amber-500 text-amber-300' :
                        severity === 'Medium' ? 'bg-yellow-950 border-yellow-600 text-yellow-300' :
                        'bg-emerald-950 border-emerald-600 text-emerald-300'
                      }`}>
                        {riskScore} / 100 &bull; {severity.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono-code text-zinc-400 gap-1">
                    <span>Target: <strong className="text-white">{item.resource_accessed}</strong></span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-zinc-500" />
                      {item.city}, {item.country} ({item.ip_address})
                    </span>
                    <span>{item.timestamp ? (item.timestamp.includes('T') ? item.timestamp.split('T')[1].substring(0, 8) : item.timestamp) : ''}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: High-Risk Users & Model Health Panel */}
        <div className="space-y-6">
          
          {/* High Risk Users Card */}
          <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-950/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-syne text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-red-400" />
                <span>Top High-Risk Users</span>
              </h3>
              <span className="text-[10px] font-mono-code text-zinc-500">Vulnerability Ranking</span>
            </div>

            <div className="space-y-2.5">
              {(dashboardData.high_risk_users?.length > 0 ? dashboardData.high_risk_users : [
                { user_id: 'USR-103', name: 'Austin Kane', department: 'Sales', max_risk_score: 72, anomaly_count: 5 },
                { user_id: 'USR-191', name: 'Christopher Anderson', department: 'Executive', max_risk_score: 60, anomaly_count: 4 },
                { user_id: 'USR-151', name: 'Matthew Walker', department: 'Finance', max_risk_score: 52, anomaly_count: 3 }
              ]).map((usr: any, idx: number) => (
                <div key={usr.user_id} className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between font-mono-code text-xs">
                  <div>
                    <div className="font-bold text-white text-xs">{usr.name || usr.user_id}</div>
                    <div className="text-[10px] text-zinc-500">{usr.department} &bull; {usr.user_id}</div>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-red-950 border border-red-700 text-red-300 font-bold text-[11px]">
                      Score: {usr.max_risk_score}
                    </span>
                    <div className="text-[10px] text-zinc-400 mt-1">{usr.anomaly_count} Anomalies</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Performance Metrics Card */}
          <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-950/80 space-y-4 font-mono-code text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-syne text-sm font-bold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-400" />
                <span>Model Health & Accuracy</span>
              </h3>
              <span className="text-[10px] text-zinc-500">Scikit-Learn Evaluation</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">PRECISION</span>
                <span className="text-lg font-extrabold text-emerald-400">{Math.round((modelM.precision || 0.96)*100)}%</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">RECALL</span>
                <span className="text-lg font-extrabold text-cyan-400">{Math.round((modelM.recall || 0.94)*100)}%</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">F1 SCORE</span>
                <span className="text-lg font-extrabold text-purple-400">{Math.round((modelM.f1_score || 0.95)*100)}%</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">FALSE POSITIVE</span>
                <span className="text-lg font-extrabold text-amber-400">{modelM.false_positive_rate || 0.1}%</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Interactive Deep Investigation Side Drawer */}
      {investigatingEvent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 h-full overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl">
            
            {/* Drawer Top Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase border ${
                    investigatingEvent.risk_score >= 75 ? 'bg-red-950 border-red-500 text-red-300' : 'bg-amber-950 border-amber-500 text-amber-300'
                  }`}>
                    {investigatingEvent.severity_level || 'HIGH'} SEVERITY THREAT
                  </span>
                  <span className="font-mono-code text-xs text-zinc-500">ID: {investigatingEvent.id}</span>
                </div>
                <h3 className="font-syne text-xl font-bold text-white">
                  Threat Deep Investigation & Triage
                </h3>
              </div>

              <button
                onClick={() => setInvestigatingEvent(null)}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Analyst Action Controls */}
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono-code text-xs font-bold text-zinc-300">ANALYST ACTIONS:</span>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  disabled={isActionLoading}
                  onClick={() => handleAnalystAction(investigatingEvent.id, 'FALSE_POSITIVE')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-600 hover:bg-emerald-900 text-emerald-200 font-mono-code text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mark False Positive</span>
                </button>

                <button
                  disabled={isActionLoading}
                  onClick={() => handleAnalystAction(investigatingEvent.id, 'CONFIRMED_ATTACK')}
                  className="px-3 py-1.5 rounded-lg bg-red-950 border border-red-600 hover:bg-red-900 text-red-200 font-mono-code text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <ThumbsDown className="w-3.5 h-3.5 text-red-400" />
                  <span>Confirm Attack</span>
                </button>
              </div>
            </div>

            {/* Gemini Flash AI Security Narrative Box */}
            <div className="p-6 rounded-2xl border border-cyan-900/60 bg-gradient-to-br from-cyan-950/30 via-zinc-950 to-zinc-950 space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-mono-code text-cyan-300 font-bold uppercase">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Gemini Flash AI Security Analyst Narrative:</span>
              </div>

              <p className="text-sm text-zinc-200 font-space leading-relaxed italic">
                &ldquo;{investigatingEvent.explanation || investigatingEvent.risk_explanation || "Behavioral anomaly evaluated across multi-dimensional baseline features."}&rdquo;
              </p>
            </div>

            {/* Baseline Normal vs Current Behavior Comparison Table */}
            <div className="space-y-3">
              <h4 className="font-syne text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Baseline Profile vs Current Event Comparison</span>
              </h4>

              <div className="border border-zinc-800 rounded-2xl overflow-hidden font-mono-code text-xs">
                <div className="grid grid-cols-3 bg-zinc-900/80 p-3 font-bold text-zinc-400 border-b border-zinc-800">
                  <span>PARAMETER</span>
                  <span>EMPLOYEE BASELINE</span>
                  <span>CURRENT EVENT</span>
                </div>

                <div className="grid grid-cols-3 p-3 border-b border-zinc-900 text-zinc-300">
                  <span className="text-zinc-500 font-bold">Location</span>
                  <span>Home Base Profile</span>
                  <span className="text-red-400 font-bold">{investigatingEvent.city}, {investigatingEvent.country}</span>
                </div>

                <div className="grid grid-cols-3 p-3 border-b border-zinc-900 text-zinc-300">
                  <span className="text-zinc-500 font-bold">Hardware GUID</span>
                  <span>Assigned Workstation</span>
                  <span className="text-amber-400 font-bold">{investigatingEvent.device_id}</span>
                </div>

                <div className="grid grid-cols-3 p-3 border-b border-zinc-900 text-zinc-300">
                  <span className="text-zinc-500 font-bold">Target Resource</span>
                  <span>Routine Dept Tools</span>
                  <span className="text-cyan-400 font-bold">{investigatingEvent.resource_accessed}</span>
                </div>

                <div className="grid grid-cols-3 p-3 text-zinc-300">
                  <span className="text-zinc-500 font-bold">Failed Attempts</span>
                  <span>0 Attempts</span>
                  <span className="text-red-400 font-bold">{investigatingEvent.failed_attempt_count || 0} Failed Tries</span>
                </div>
              </div>
            </div>

            {/* Explainable Risk Factor Attributions */}
            {investigatingEvent.risk_factors && investigatingEvent.risk_factors.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-syne text-sm font-bold text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-purple-400" />
                  <span>Explainable Risk Factor Attribution</span>
                </h4>

                <div className="space-y-2">
                  {investigatingEvent.risk_factors.map((f: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between font-mono-code text-xs">
                      <div>
                        <span className="font-bold text-white">{f.factor}</span>
                        <div className="text-[10px] text-zinc-400">{f.detail}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-700 text-indigo-300 font-bold">
                        +{f.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contextual FP Rationale */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1 font-mono-code text-xs">
              <span className="text-zinc-500 block font-bold">FALSE-POSITIVE DECISION RATIONALE:</span>
              <p className="text-zinc-300">{investigatingEvent.suppression_reason || "Evaluated by contextual reduction engine."}</p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
