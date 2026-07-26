"use client";

import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, Sparkles, ShieldAlert, AlertTriangle, MapPin, 
  RefreshCcw, Zap, CheckCircle2, User, Activity, BarChart3, ChevronRight, Scale
} from 'lucide-react';
import { AccessLog } from '../../types/benzene';
import { API_BASE_URL } from '../../utils/apiConfig';

interface RiskScoreTabProps {
  logs: AccessLog[];
  isBackendOnline?: boolean;
  onTriggerAttack?: (type: string) => void;
  onShowNotification: (msg: string) => void;
}

export const RiskScoreTab: React.FC<RiskScoreTabProps> = ({
  logs,
  isBackendOnline = false,
  onTriggerAttack,
  onShowNotification,
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [riskEvents, setRiskEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch risk-scored telemetry directly from FastAPI endpoint /api/risk-scores
  const fetchRiskScores = async () => {
    if (!isBackendOnline) return;
    setIsLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    try {
      const res = await fetch(`${API_BASE_URL}/api/risk-scores?limit=50`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        setRiskEvents(data);
      }
    } catch (err) {
      clearTimeout(timeoutId);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskScores();
    const interval = setInterval(fetchRiskScores, 3000);
    return () => clearInterval(interval);
  }, [isBackendOnline]);

  // Fallback to client-side logs if backend offline
  const displayEvents = isBackendOnline && riskEvents.length > 0 
    ? riskEvents 
    : logs.map(l => {
        const calculatedScore = l.riskScore;
        const sev = calculatedScore >= 75 ? 'Critical' : calculatedScore >= 50 ? 'High' : calculatedScore >= 25 ? 'Medium' : 'Low';
        return {
          id: l.id,
          user_id: l.userId,
          timestamp: l.timestamp,
          department: l.department,
          device_id: l.deviceFingerprint,
          ip_address: l.sourceIp,
          city: l.location.split(',')[0] || 'Unknown',
          country: l.location.split(',')[1]?.trim() || 'US',
          resource_accessed: l.targetSystem,
          anomaly_score: l.riskScore / 100,
          is_anomaly: l.isAnomaly ? 1 : 0,
          predicted_attack_type: l.attackType,
          risk_score: calculatedScore,
          severity_level: sev,
          risk_factors: [
            { factor: 'Isolation Forest Score', weight: '+35%', description: 'Unusual feature vector split depth' },
            { factor: 'Off-Hours Envelope Delta', weight: '+25%', description: 'Access outside normal schedule' },
            { factor: 'Critical Resource Access', weight: '+20%', description: `Sensitive asset '${l.targetSystem}'` }
          ],
          risk_explanation: l.isAnomaly 
            ? `High Risk Alert for ${l.userName} (${l.department}). Risk rating spiked to ${calculatedScore}/100 due to multiple anomalous signals.`
            : `Security Event for ${l.userName} evaluated at ${calculatedScore}/100 Risk Score (Low Severity). Access event conforms to routine baseline.`
        };
      });

  const filteredEvents = severityFilter === 'ALL'
    ? displayEvents
    : displayEvents.filter(e => e.severity_level?.toUpperCase() === severityFilter.toUpperCase());

  const activeSelected = (selectedEventId && filteredEvents.find(e => e.id === selectedEventId)) || filteredEvents[0] || displayEvents[0] || null;

  const countSeverity = (sev: string) => {
    return displayEvents.filter(e => e.severity_level?.toUpperCase() === sev.toUpperCase()).length;
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-950/80 border-red-500 text-red-300';
      case 'HIGH': return 'bg-amber-950/80 border-amber-500 text-amber-300';
      case 'MEDIUM': return 'bg-yellow-950/60 border-yellow-600 text-yellow-300';
      default: return 'bg-emerald-950/60 border-emerald-600 text-emerald-300';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Module Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-900/40 bg-gradient-to-br from-[#120a21] via-[#090514] to-[#040208] p-8 shadow-2xl">
        <span className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-indigo-600/10 filter blur-3xl" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-xs font-mono-code text-indigo-400 font-bold uppercase tracking-widest">
              <Scale className="w-4 h-4 text-indigo-400" />
              <span>Transparent Weighted Scoring Engine &bull; Gemini Risk Auditor</span>
            </div>
            
            <h2 className="text-3xl font-syne font-extrabold text-white tracking-tight">
              Explainable Risk Score
            </h2>
            
            <p className="text-xs text-zinc-400 max-w-3xl font-space leading-relaxed">
              Calculates a transparent weighted risk rating (0 to 100) combining ML anomaly scores, attack classification confidence, failed login bursts, hardware GUID changes, geographic distance, and restricted resource access. Provides factor-level point attributions and Gemini Flash AI risk audit summaries.
            </p>
          </div>

          {/* Scoring Engine Status Badge */}
          <div className="shrink-0 p-4 rounded-2xl bg-zinc-950/80 border border-indigo-900/50 font-mono-code text-xs space-y-2 min-w-[220px]">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] uppercase font-bold text-zinc-500">SCORING ENGINE</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="font-bold text-white flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Weighted Engine Active</span>
            </div>
            <div className="text-[11px] text-zinc-400 border-t border-zinc-900 pt-2">
              0-100 Scale &bull; 4 Severity Bands
            </div>
          </div>
        </div>
      </div>

      {/* 4 Severity Level Cards Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { name: 'Critical', code: 'CRITICAL', range: '75 – 100', color: 'border-red-800 bg-red-950/30 text-red-400', count: countSeverity('CRITICAL') },
          { name: 'High', code: 'HIGH', range: '50 – 74', color: 'border-amber-800 bg-amber-950/30 text-amber-400', count: countSeverity('HIGH') },
          { name: 'Medium', code: 'MEDIUM', range: '30 – 49', color: 'border-yellow-800 bg-yellow-950/30 text-yellow-400', count: countSeverity('MEDIUM') },
          { name: 'Low', code: 'LOW', range: '0 – 29', color: 'border-emerald-800 bg-emerald-950/30 text-emerald-400', count: countSeverity('LOW') },
        ].map((s) => (
          <div 
            key={s.code}
            onClick={() => setSeverityFilter(severityFilter === s.code ? 'ALL' : s.code)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              severityFilter === s.code 
                ? 'border-indigo-500 bg-indigo-950/30 shadow-md shadow-indigo-950/40' 
                : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-extrabold border ${s.color}`}>
                {s.range}
              </span>
              <span className="font-mono-code text-xs font-bold text-white font-syne">
                {s.count}
              </span>
            </div>
            <div>
              <h4 className="font-syne text-xs font-bold text-white">{s.name} Severity</h4>
              <span className="text-[10px] font-mono-code text-zinc-500">Filter Events</span>
            </div>
          </div>
        ))}
      </div>

      {/* Trigger Bar & Filter Controls */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        
        {/* Severity Filter Toggle */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono-code text-xs">
          <button
            onClick={() => setSeverityFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
              severityFilter === 'ALL' 
                ? 'bg-indigo-950 text-indigo-200 border border-indigo-600 shadow' 
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            All Severity Events ({displayEvents.length})
          </button>
        </div>

        {/* Attack Injectors */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono-code text-[11px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Inject Event:
          </span>
          {['BRUTE_FORCE', 'IMPOSSIBLE_TRAVEL', 'DEVICE_SPOOFING', 'CREDENTIAL_MISUSE', 'LATERAL_MOVEMENT'].map((attackType) => (
            <button
              key={attackType}
              onClick={() => {
                if (isBackendOnline && onTriggerAttack) {
                  onTriggerAttack(attackType.toLowerCase());
                  onShowNotification(`Triggered ${attackType.replace('_', ' ')} payload: Computing Explainable Risk Score...`);
                  setTimeout(fetchRiskScores, 1500);
                } else {
                  onShowNotification(`Simulated ${attackType} trigger locally.`);
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-indigo-500 hover:bg-indigo-950/30 text-white font-mono-code text-[10px] transition-all cursor-pointer whitespace-nowrap"
            >
              + {attackType.replace('_', ' ')}
            </button>
          ))}
        </div>

        <button
          onClick={fetchRiskScores}
          className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 font-mono-code text-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Grid: Events Stream (Left) & Risk Factor Diagnostic Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Risk Scored Events Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-syne text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Risk Scored Events ({filteredEvents.length})</span>
            </h3>
            <span className="text-[10px] font-mono-code text-zinc-500">Live Stream</span>
          </div>

          <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredEvents.length === 0 ? (
              <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950/40 text-center font-mono-code text-xs text-zinc-500">
                No events matching selected severity filter.
              </div>
            ) : (
              filteredEvents.map((item) => {
                const isSelected = activeSelected?.id === item.id;
                const score = item.risk_score || 14;
                const severity = item.severity_level || 'Low';
                const badgeStyle = getSeverityBadge(severity);
                
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEventId(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-950/30 border-indigo-500 shadow-lg shadow-indigo-950/50' 
                        : 'bg-zinc-950/60 border-zinc-800/80 hover:border-indigo-800 hover:bg-zinc-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono-code text-xs font-bold text-white flex items-center gap-1.5">
                        <User className="w-3 h-3 text-zinc-400" />
                        User {item.user_id}
                      </span>

                      {/* Risk Score & Severity Badge */}
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono-code font-extrabold border ${badgeStyle}`}>
                        {score} / 100 &bull; {severity.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-300 font-space font-medium mb-2">
                      Target: {item.resource_accessed || 'Internal Asset'}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono-code text-zinc-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-500" />
                        {item.city || 'Unknown'}, {item.country || 'US'}
                      </span>
                      <span>{item.timestamp ? (item.timestamp.includes('T') ? item.timestamp.split('T')[1].substring(0, 8) : item.timestamp) : ''}</span>
                    </div>

                    {/* Small Factor Count */}
                    {item.risk_factors && item.risk_factors.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-zinc-900 text-[10px] font-mono-code text-zinc-400">
                        {item.risk_factors.length} Contributing Risk Factors Identified
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Risk Diagnostic & Attribution Breakdown Panel */}
        <div className="lg:col-span-2 space-y-6">
          {activeSelected ? (
            <div className="p-6 md:p-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 space-y-6">
              
              {/* Event Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`px-2.5 py-1 rounded font-mono-code text-xs font-bold uppercase border ${getSeverityBadge(activeSelected.severity_level)}`}>
                      {activeSelected.severity_level || 'LOW'} SEVERITY
                    </span>
                    <span className="font-mono-code text-xs text-zinc-400">
                      ID: {activeSelected.id}
                    </span>
                  </div>
                  <h3 className="font-syne text-xl font-bold text-white">
                    Explainable Risk Score Diagnostic & Attribution
                  </h3>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-center font-mono-code min-w-[130px]">
                  <span className="text-[10px] text-zinc-500 block font-bold">CALCULATED SCORE</span>
                  <span className="text-2xl font-extrabold text-indigo-400">
                    {activeSelected.risk_score || 0} <span className="text-xs text-zinc-500 font-normal">/ 100</span>
                  </span>
                </div>
              </div>

              {/* Gemini Flash AI Risk Audit Explanation */}
              <div className="p-6 rounded-2xl border border-indigo-800/60 bg-gradient-to-br from-indigo-950/40 via-zinc-950 to-zinc-950 space-y-3 relative overflow-hidden">
                <span className="absolute top-0 right-0 w-32 h-32 rounded-full bg-indigo-500/10 filter blur-2xl" />
                
                <div className="flex items-center gap-2 text-xs font-mono-code text-indigo-300 font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <span>Gemini Flash AI Risk Audit Explanation:</span>
                </div>

                <p className="text-sm text-zinc-200 font-space leading-relaxed italic">
                  &ldquo;{activeSelected.risk_explanation || activeSelected.explanation || "Security event evaluated through weighted factor attribution."}&rdquo;
                </p>

                <div className="text-[10px] font-mono-code text-zinc-500 flex items-center justify-between pt-2 border-t border-indigo-900/40">
                  <span>SCORE LOGIC: Transparent Weighted System (0-100)</span>
                  <span>AI AUDITOR: Gemini Flash</span>
                </div>
              </div>

              {/* Contributing Factor Point Breakdown (Attribution Bars) */}
              <div className="space-y-3">
                <h4 className="font-syne text-sm font-bold text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    <span>Contributing Risk Factors Breakdown ({activeSelected.risk_factors?.length || 0})</span>
                  </span>
                  <span className="text-[10px] font-mono-code text-zinc-500">Point Attributions</span>
                </h4>

                <div className="space-y-3">
                  {activeSelected.risk_factors && activeSelected.risk_factors.length > 0 ? (
                    activeSelected.risk_factors.map((f: any, idx: number) => {
                      const pts = f.points || 0;
                      const pct = Math.min(100, Math.round((pts / 25) * 100));
                      
                      return (
                        <div key={idx} className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono-code">
                            <span className="font-bold text-white">{f.factor}</span>
                            <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-700 text-indigo-300 font-bold">
                              +{pts} pts
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-500" 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>

                          <div className="text-[11px] font-mono-code text-zinc-400">
                            {f.detail}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-xs font-mono-code text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Zero risk factors triggered — Routine employee access.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Event & Identity Attributes Grid */}
              <div className="space-y-3 pt-2">
                <h4 className="font-syne text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Event Attributes & Metadata</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono-code text-xs">
                  
                  <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block font-bold">USER IDENTITY</span>
                    <span className="text-white font-bold text-xs">{activeSelected.user_id}</span>
                    <span className="text-[11px] text-zinc-400 block mt-1">{activeSelected.department || 'Engineering'}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block font-bold">LOCATION / GEO</span>
                    <span className="text-white font-bold text-xs">{activeSelected.city}, {activeSelected.country}</span>
                    <span className="text-[11px] text-zinc-400 block mt-1">{activeSelected.ip_address}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block font-bold">DEVICE GUID</span>
                    <span className="text-white font-bold text-xs">{activeSelected.device_id}</span>
                    <span className="text-[11px] text-zinc-400 block mt-1">{activeSelected.os} ({activeSelected.browser})</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block font-bold">TARGET ASSET</span>
                    <span className="text-white font-bold text-xs">{activeSelected.resource_accessed}</span>
                    <span className="text-[11px] text-zinc-400 block mt-1">Event: {activeSelected.event_type}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block font-bold">FAILED ATTEMPTS</span>
                    <span className="text-white font-bold text-xs">{activeSelected.failed_attempt_count || 0} Attempts</span>
                    <span className="text-[11px] text-zinc-400 block mt-1">Status: {activeSelected.login_status}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block font-bold">TIMESTAMP</span>
                    <span className="text-white font-bold text-xs">{activeSelected.timestamp ? activeSelected.timestamp.substring(0, 19).replace('T', ' ') : ''}</span>
                    <span className="text-[11px] text-zinc-400 block mt-1">UTC Zone</span>
                  </div>

                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 rounded-3xl border border-zinc-800 bg-zinc-950/40 text-center font-mono-code text-xs text-zinc-500">
              Select an event from the list to view risk score attributions and AI audit explanations.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
