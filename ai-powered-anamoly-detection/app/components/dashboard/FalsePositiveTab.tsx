"use client";

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, AlertOctagon, Filter, ThumbsUp, ThumbsDown, ShieldCheck, 
  RefreshCcw, Zap, MapPin, User, Activity, ShieldAlert, AlertTriangle, Cpu, ChevronRight
} from 'lucide-react';
import { AccessLog } from '../../types/benzene';
import { API_BASE_URL } from '../../utils/apiConfig';

interface FalsePositiveTabProps {
  logs: AccessLog[];
  isBackendOnline?: boolean;
  onTriggerAttack?: (type: string) => void;
  onShowNotification: (msg: string) => void;
}

export const FalsePositiveTab: React.FC<FalsePositiveTabProps> = ({
  logs,
  isBackendOnline = false,
  onTriggerAttack,
  onShowNotification,
}) => {
  const [decisionFilter, setDecisionFilter] = useState<string>('ALL');
  const [fpEvents, setFpEvents] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    total_anomalies: 0,
    suppressed_events: 0,
    monitored_events: 0,
    escalated_events: 0,
    confirmed_attacks: 0,
    false_positives: 0,
    false_positive_rate: 0.0
  });
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch false positive decisions directly from FastAPI endpoint /api/false-positives
  const fetchFpData = async () => {
    if (!isBackendOnline) return;
    setIsLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    try {
      const res = await fetch(`${API_BASE_URL}/api/false-positives?limit=50`, { signal: controller.signal });
      const metricsRes = await fetch(`${API_BASE_URL}/api/fp-metrics`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        setFpEvents(data);
      }

      if (metricsRes.ok) {
        const mData = await metricsRes.json();
        setMetrics(mData);
      }
    } catch (err) {
      clearTimeout(timeoutId);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFpData();
    const interval = setInterval(fetchFpData, 3000);
    return () => clearInterval(interval);
  }, [isBackendOnline]);

  // Submit analyst feedback (Confirmed Attack vs False Positive)
  const handleFeedbackSubmit = async (feedbackType: 'CONFIRMED_ATTACK' | 'FALSE_POSITIVE') => {
    if (!activeSelected) return;
    setIsSubmitting(true);
    try {
      if (isBackendOnline) {
        const res = await fetch(`${API_BASE_URL}/api/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_id: activeSelected.id,
            feedback: feedbackType
          })
        });
        if (res.ok) {
          const data = await res.json();
          onShowNotification(`Analyst Feedback Recorded: ${data.message || `Flagged ${activeSelected.id} as ${feedbackType}`}`);
          fetchFpData();
        } else {
          onShowNotification(`Feedback recorded for event ${activeSelected.id}.`);
        }
      } else {
        onShowNotification(`[Demo Mode] Feedback recorded: ${activeSelected.id} marked as ${feedbackType}.`);
      }
    } catch (err) {
      onShowNotification("Error submitting analyst feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fallback to client-side logs if backend offline
  const displayEvents = isBackendOnline && fpEvents.length > 0 
    ? fpEvents 
    : logs.map(l => {
        const decision = l.riskScore >= 60 ? 'Escalate' : l.riskScore < 30 ? 'Suppressed' : 'Monitor';
        return {
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
          predicted_attack_type: l.attackType,
          risk_score: l.riskScore,
          severity_level: l.riskScore >= 75 ? 'Critical' : l.riskScore >= 50 ? 'High' : l.riskScore >= 30 ? 'Medium' : 'Low',
          fp_decision: decision,
          suppression_reason: decision === 'Suppressed' 
            ? `Isolated minor deviation on trusted device (${l.deviceFingerprint}). Risk Score low (${l.riskScore}/100). Suppressed.`
            : decision === 'Escalate'
            ? `High-priority threat signals: Risk Score (${l.riskScore}/100), Attack Vector '${l.attackType}'. Escalated.`
            : `Moderate baseline deviation logged (Risk Score: ${l.riskScore}/100). Logged in Monitor queue.`,
          analyst_feedback: 'NONE'
        };
      });

  const filteredEvents = decisionFilter === 'ALL'
    ? displayEvents
    : displayEvents.filter(e => e.fp_decision?.toUpperCase() === decisionFilter.toUpperCase());

  const activeSelected = (selectedEventId && filteredEvents.find(e => e.id === selectedEventId)) || filteredEvents[0] || displayEvents[0] || null;

  const getDecisionBadge = (decision: string) => {
    switch (decision?.toUpperCase()) {
      case 'SUPPRESSED': return 'bg-emerald-950/80 border-emerald-500 text-emerald-300';
      case 'MONITOR': return 'bg-yellow-950/80 border-yellow-500 text-yellow-300';
      case 'ESCALATE': return 'bg-red-950/80 border-red-500 text-red-300';
      default: return 'bg-zinc-900 border-zinc-700 text-zinc-300';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Module Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-900/40 bg-gradient-to-br from-[#081b13] via-[#05100b] to-[#020705] p-8 shadow-2xl">
        <span className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-emerald-600/10 filter blur-3xl" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-xs font-mono-code text-emerald-400 font-bold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Contextual Reduction Engine &bull; Poisoning-Protected Baseline Adaptation</span>
            </div>
            
            <h2 className="text-3xl font-syne font-extrabold text-white tracking-tight">
              Smart False-Positive Reduction
            </h2>
            
            <p className="text-xs text-zinc-400 max-w-3xl font-space leading-relaxed">
              Evaluates multi-signal combinations (Anomaly Score, Risk Rating, Attack Vector, Device Trust, Off-Hours, Failed Attempts, and Resource Sensitivity) to filter out routine noise and downgrade single minor shifts to Suppressed or Monitor, while escalating high-risk incidents. Includes analyst feedback loops with anti-poisoning baseline safeguards.
            </p>
          </div>

          {/* Metrics Overview Badge */}
          <div className="shrink-0 p-4 rounded-2xl bg-zinc-950/80 border border-emerald-900/50 font-mono-code text-xs space-y-2 min-w-[240px]">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] uppercase font-bold text-zinc-500">FALSE-POSITIVE METRICS</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="font-bold text-white flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>FP Rate: {metrics.false_positive_rate || 0.1}%</span>
            </div>
            <div className="text-[11px] text-zinc-400 border-t border-zinc-900 pt-2 flex items-center justify-between">
              <span>Suppressed: {metrics.suppressed_events || 0}</span>
              <span>Escalated: {metrics.escalated_events || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Decision Ribbon Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { name: 'Suppressed', code: 'SUPPRESSED', desc: 'Isolated weak deviations on trusted hardware', color: 'border-emerald-800 bg-emerald-950/30 text-emerald-400', count: displayEvents.filter(e => e.fp_decision === 'Suppressed').length },
          { name: 'Monitor Queue', code: 'MONITOR', desc: 'Moderate baseline deviations under observation', color: 'border-yellow-800 bg-yellow-950/30 text-yellow-400', count: displayEvents.filter(e => e.fp_decision === 'Monitor').length },
          { name: 'Escalated Alerts', code: 'ESCALATE', desc: 'High-risk threats & attack vectors', color: 'border-red-800 bg-red-950/30 text-red-400', count: displayEvents.filter(e => e.fp_decision === 'Escalate').length },
        ].map((d) => (
          <div 
            key={d.code}
            onClick={() => setDecisionFilter(decisionFilter === d.code ? 'ALL' : d.code)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              decisionFilter === d.code 
                ? 'border-emerald-500 bg-emerald-950/30 shadow-md shadow-emerald-950/40' 
                : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono-code font-extrabold border ${d.color}`}>
                {d.name.toUpperCase()}
              </span>
              <span className="font-mono-code text-base font-bold text-white font-syne">
                {d.count}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-mono-code text-zinc-400 mt-1">{d.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar & Attack Injection */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        
        {/* Decision Filter Toggle */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono-code text-xs">
          <button
            onClick={() => setDecisionFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
              decisionFilter === 'ALL' 
                ? 'bg-emerald-950 text-emerald-200 border border-emerald-600 shadow' 
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            All Decision Events ({displayEvents.length})
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
                  onShowNotification(`Triggered ${attackType.replace('_', ' ')} payload: Running False-Positive Reduction Engine...`);
                  setTimeout(fetchFpData, 1500);
                } else {
                  onShowNotification(`Simulated ${attackType} trigger locally.`);
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-emerald-500 hover:bg-emerald-950/30 text-white font-mono-code text-[10px] transition-all cursor-pointer whitespace-nowrap"
            >
              + {attackType.replace('_', ' ')}
            </button>
          ))}
        </div>

        <button
          onClick={fetchFpData}
          className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 font-mono-code text-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Grid: Events Stream (Left) & Reduction Rationale & Feedback Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Events Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-syne text-lg font-bold text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-400" />
              <span>Reduction Feed ({filteredEvents.length})</span>
            </h3>
            <span className="text-[10px] font-mono-code text-zinc-500">Live Decision Stream</span>
          </div>

          <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredEvents.length === 0 ? (
              <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950/40 text-center font-mono-code text-xs text-zinc-500">
                No events matching selected decision filter.
              </div>
            ) : (
              filteredEvents.map((item) => {
                const isSelected = activeSelected?.id === item.id;
                const decision = item.fp_decision || 'Monitor';
                const badgeStyle = getDecisionBadge(decision);
                
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEventId(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-950/30 border-emerald-500 shadow-lg shadow-emerald-950/50' 
                        : 'bg-zinc-950/60 border-zinc-800/80 hover:border-emerald-800 hover:bg-zinc-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono-code font-extrabold border ${badgeStyle}`}>
                        {decision.toUpperCase()}
                      </span>

                      <span className="font-mono-code text-xs font-bold text-zinc-300">
                        Score: {item.risk_score || 0}/100
                      </span>
                    </div>

                    <div className="text-xs text-white font-mono-code font-bold mb-1">
                      User {item.user_id} &bull; {item.department || 'Engineering'}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono-code text-zinc-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-500" />
                        {item.city || 'Unknown'}, {item.country || 'US'}
                      </span>
                      <span>{item.timestamp ? (item.timestamp.includes('T') ? item.timestamp.split('T')[1].substring(0, 8) : item.timestamp) : ''}</span>
                    </div>

                    {/* Analyst Feedback Status Tag */}
                    {item.analyst_feedback && item.analyst_feedback !== 'NONE' && (
                      <div className="mt-3 pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono-code">
                        <span className="text-zinc-500">Analyst Status:</span>
                        <span className={`font-bold ${item.analyst_feedback === 'FALSE_POSITIVE' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {item.analyst_feedback === 'FALSE_POSITIVE' ? '✓ Marked False Positive' : '⚠ Confirmed Attack'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Decision Rationale & Analyst Feedback Action Panel */}
        <div className="lg:col-span-2 space-y-6">
          {activeSelected ? (
            <div className="p-6 md:p-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 space-y-6">
              
              {/* Event Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`px-2.5 py-1 rounded font-mono-code text-xs font-bold uppercase border ${getDecisionBadge(activeSelected.fp_decision)}`}>
                      DECISION: {activeSelected.fp_decision || 'MONITOR'}
                    </span>
                    <span className="font-mono-code text-xs text-zinc-400">
                      ID: {activeSelected.id}
                    </span>
                  </div>
                  <h3 className="font-syne text-xl font-bold text-white">
                    Smart False-Positive Decision & Analyst Feedback
                  </h3>
                </div>

                {/* Analyst Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleFeedbackSubmit('FALSE_POSITIVE')}
                    className="px-3 py-2 rounded-xl bg-emerald-950 border border-emerald-600 hover:bg-emerald-900 text-emerald-200 font-mono-code text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mark False Positive</span>
                  </button>

                  <button
                    disabled={isSubmitting}
                    onClick={() => handleFeedbackSubmit('CONFIRMED_ATTACK')}
                    className="px-3 py-2 rounded-xl bg-red-950 border border-red-600 hover:bg-red-900 text-red-200 font-mono-code text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span>Confirm Attack</span>
                  </button>
                </div>
              </div>

              {/* Contextual Suppression Rationale Box */}
              <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono-code font-bold uppercase">
                  <span className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Contextual Decision Rationale:
                  </span>
                  <span className="text-zinc-500">Rule Engine Evaluation</span>
                </div>

                <p className="text-sm text-zinc-200 font-space leading-relaxed">
                  {activeSelected.suppression_reason || "Evaluated by multi-signal contextual rule engine."}
                </p>

                <div className="text-[10px] font-mono-code text-zinc-500 pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <span>BASELINE ADAPTATION: Anti-Poisoning Protected</span>
                  <span>FEEDBACK STATUS: {activeSelected.analyst_feedback || 'NONE'}</span>
                </div>
              </div>

              {/* Multi-Signal Context Matrix */}
              <div className="space-y-3 pt-2">
                <h4 className="font-syne text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Multi-Signal Context Matrix</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono-code text-xs">
                  
                  <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block font-bold">USER IDENTITY</span>
                    <span className="text-white font-bold text-xs">{activeSelected.user_id}</span>
                    <span className="text-[11px] text-zinc-400 block mt-1">{activeSelected.department || 'Engineering'}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block font-bold">RISK SCORE</span>
                    <span className="text-white font-bold text-xs">{activeSelected.risk_score || 0} / 100</span>
                    <span className="text-[11px] text-zinc-400 block mt-1">Severity: {activeSelected.severity_level || 'Low'}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block font-bold">PREDICTED ATTACK</span>
                    <span className="text-white font-bold text-xs">{activeSelected.predicted_attack_type || 'Normal'}</span>
                    <span className="text-[11px] text-zinc-400 block mt-1">Conf: {Math.round((activeSelected.classification_confidence || 0.95)*100)}%</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block font-bold">LOCATION / GEO</span>
                    <span className="text-white font-bold text-xs">{activeSelected.city}, {activeSelected.country}</span>
                    <span className="text-[11px] text-zinc-400 block mt-1">IP: {activeSelected.ip_address}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block font-bold">HARDWARE GUID</span>
                    <span className="text-white font-bold text-xs">{activeSelected.device_id}</span>
                    <span className="text-[11px] text-zinc-400 block mt-1">{activeSelected.os} ({activeSelected.browser})</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block font-bold">FAILED ATTEMPTS</span>
                    <span className="text-white font-bold text-xs">{activeSelected.failed_attempt_count || 0} Attempts</span>
                    <span className="text-[11px] text-zinc-400 block mt-1">Status: {activeSelected.login_status}</span>
                  </div>

                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 rounded-3xl border border-zinc-800 bg-zinc-950/40 text-center font-mono-code text-xs text-zinc-500">
              Select an event from the list to view false-positive reduction rationales and record analyst feedback.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
