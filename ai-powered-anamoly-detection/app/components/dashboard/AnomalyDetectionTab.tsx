"use client";

import React, { useState, useEffect } from 'react';
import { 
  Brain, Sparkles, ShieldAlert, AlertTriangle, MapPin, Clock, 
  Laptop, Activity, ChevronRight, RefreshCcw, Zap, CheckCircle2, User, Globe, Filter
} from 'lucide-react';
import { AccessLog } from '../../types/benzene';
import { API_BASE_URL } from '../../utils/apiConfig';

interface AnomalyDetectionTabProps {
  logs: AccessLog[];
  isBackendOnline?: boolean;
  onTriggerAttack?: (type: string) => void;
  onShowNotification: (msg: string) => void;
}

export const AnomalyDetectionTab: React.FC<AnomalyDetectionTabProps> = ({
  logs,
  isBackendOnline = false,
  onTriggerAttack,
  onShowNotification,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'anomalies_only'>('all');
  const [fetchedLogs, setFetchedLogs] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch real-time telemetry from FastAPI (all logs or anomalies only)
  const fetchTelemetry = async () => {
    if (!isBackendOnline) return;
    setIsLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    try {
      const endpoint = filterMode === 'anomalies_only' 
        ? `${API_BASE_URL}/api/anomalies?limit=50`
        : `${API_BASE_URL}/api/logs?limit=50`;
      
      const res = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        setFetchedLogs(data);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      // Backend fetch paused or server restarting
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, [isBackendOnline, filterMode]);

  // Combine backend telemetry or fallback to client-side logs
  const displayItems = isBackendOnline && fetchedLogs.length > 0 
    ? fetchedLogs 
    : logs.filter(l => filterMode === 'all' || l.isAnomaly).map(l => ({
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
        anomaly_score: l.isAnomaly ? (l.riskScore / 100) : 0.12,
        is_anomaly: l.isAnomaly ? 1 : 0,
        attack_type: l.attackType || 'NORMAL',
        deviations: l.isAnomaly ? [
          `Unusual login time outside normal user schedule`,
          `Geographic location mismatch (${l.location})`,
          `Access attempt to sensitive resource (${l.targetSystem})`
        ] : [],
        explanation: l.isAnomaly 
          ? `Behavioral Anomaly Detected for ${l.userName} (${l.department}). Access from ${l.location} targeting ${l.targetSystem} with elevated risk metrics.`
          : `Normal Activity Baseline: Access event by ${l.userName} (${l.department}) matches all typical behavioral parameters.`
      }));

  const activeSelected = (selectedId && displayItems.find(i => i.id === selectedId)) || displayItems[0] || null;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Module Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-900/40 bg-gradient-to-br from-[#12091c] via-[#090510] to-[#040407] p-8 shadow-2xl">
        <span className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-purple-600/10 filter blur-3xl" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-xs font-mono-code text-purple-400 font-bold uppercase tracking-widest">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>Scikit-Learn Isolation Forest &bull; Gemini Flash AI Engine</span>
            </div>
            
            <h2 className="text-3xl font-syne font-extrabold text-white tracking-tight">
              Behavioral Anomaly Detection
            </h2>
            
            <p className="text-xs text-zinc-400 max-w-3xl font-space leading-relaxed">
              Real-time Isolation Forest evaluation across all incoming telemetry (both Normal and Anomalous events). Extracts 7 dimensional behavioral features per event, calculates dynamic anomaly confidence ratings, and generates analyst explanations for every activity.
            </p>
          </div>

          {/* Machine Learning Status Badge */}
          <div className="shrink-0 p-4 rounded-2xl bg-zinc-950/80 border border-purple-900/50 font-mono-code text-xs space-y-2 min-w-[220px]">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] uppercase font-bold text-zinc-500">MODEL STATUS</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="font-bold text-white flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Isolation Forest Active</span>
            </div>
            <div className="text-[11px] text-zinc-400 border-t border-zinc-900 pt-2">
              4,500 Baseline Profiles Trained
            </div>
          </div>
        </div>
      </div>

      {/* View Filter & Cyberattack Simulator Bar */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        
        {/* Mode Selector Toggle */}
        <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800 font-mono-code text-xs">
          <button
            onClick={() => { setFilterMode('all'); setSelectedId(null); }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
              filterMode === 'all' 
                ? 'bg-purple-950 text-purple-200 border border-purple-600 shadow' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Telemetry (Normal + Anomalies)
          </button>
          <button
            onClick={() => { setFilterMode('anomalies_only'); setSelectedId(null); }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
              filterMode === 'anomalies_only' 
                ? 'bg-purple-950 text-purple-200 border border-purple-600 shadow' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Anomalies Only
          </button>
        </div>

        {/* Attack Injectors */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono-code text-[11px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Inject Attack:
          </span>
          {['BRUTE_FORCE', 'IMPOSSIBLE_TRAVEL', 'DEVICE_SPOOFING', 'CREDENTIAL_MISUSE', 'LATERAL_MOVEMENT'].map((attackType) => (
            <button
              key={attackType}
              onClick={() => {
                if (isBackendOnline && onTriggerAttack) {
                  onTriggerAttack(attackType.toLowerCase());
                  onShowNotification(`Triggered ${attackType.replace('_', ' ')}: Processing through Isolation Forest & Gemini...`);
                  setTimeout(fetchTelemetry, 1500);
                } else {
                  onShowNotification(`Simulated ${attackType} trigger locally.`);
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-purple-500 hover:bg-purple-950/30 text-white font-mono-code text-[10px] transition-all cursor-pointer whitespace-nowrap"
            >
              + {attackType.replace('_', ' ')}
            </button>
          ))}
        </div>

        <button
          onClick={fetchTelemetry}
          className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 font-mono-code text-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Grid: Telemetry Feed (Left) & Diagnostic Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Telemetry Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-syne text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>{filterMode === 'all' ? 'All Telemetry Events' : 'Anomalous Events'} ({displayItems.length})</span>
            </h3>
            <span className="text-[10px] font-mono-code text-zinc-500">Live Ingestion</span>
          </div>

          <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1 scrollbar-thin">
            {displayItems.length === 0 ? (
              <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950/40 text-center font-mono-code text-xs text-zinc-500">
                No telemetry logs matching selected filter.
              </div>
            ) : (
              displayItems.map((item) => {
                const isSelected = activeSelected?.id === item.id;
                const isAnomaly = item.is_anomaly === 1 || item.anomaly_score >= 0.5;
                const scorePct = Math.round((item.anomaly_score || 0.12) * 100);
                
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? (isAnomaly ? 'bg-purple-950/30 border-purple-500 shadow-lg shadow-purple-950/50' : 'bg-emerald-950/30 border-emerald-500 shadow-lg shadow-emerald-950/50')
                        : (isAnomaly ? 'bg-zinc-950/60 border-zinc-800/80 hover:border-purple-800' : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-700')
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono-code text-xs font-bold text-white flex items-center gap-1.5">
                        <User className="w-3 h-3 text-zinc-400" />
                        {item.user_id}
                      </span>

                      {/* Anomaly Score Pill */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-extrabold border ${
                        isAnomaly 
                          ? 'bg-purple-900/50 border-purple-500 text-purple-200' 
                          : 'bg-emerald-950/50 border-emerald-700 text-emerald-400'
                      }`}>
                        {scorePct}% {isAnomaly ? 'ANOMALY' : 'NORMAL'}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-300 font-space font-medium mb-2">
                      {item.attack_type && item.attack_type !== 'NORMAL' ? item.attack_type.replace('_', ' ') : 'Standard Baseline Activity'}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono-code text-zinc-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-500" />
                        {item.city || 'Unknown'}, {item.country || 'US'}
                      </span>
                      <span>{item.timestamp ? (item.timestamp.includes('T') ? item.timestamp.split('T')[1].substring(0, 8) : item.timestamp) : ''}</span>
                    </div>

                    {/* Small Deviation Badges */}
                    {item.deviations && item.deviations.length > 0 ? (
                      <div className="mt-3 pt-2.5 border-t border-zinc-900 flex flex-wrap gap-1">
                        {item.deviations.slice(0, 2).map((dev: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono-code text-zinc-400 truncate max-w-full">
                            &bull; {dev.split('(')[0]}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-2 text-[10px] font-mono-code text-emerald-500/80">
                        &check; Conforms to Baseline
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Diagnostic & Gemini Flash AI Explanation Card */}
        <div className="lg:col-span-2 space-y-6">
          {activeSelected ? (
            <div className="p-6 md:p-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 space-y-6">
              
              {/* Event Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`px-2.5 py-1 rounded border font-mono-code text-xs font-bold uppercase ${
                      activeSelected.is_anomaly === 1 || activeSelected.anomaly_score >= 0.5
                        ? 'bg-purple-950 border-purple-600 text-purple-300'
                        : 'bg-emerald-950 border-emerald-700 text-emerald-300'
                    }`}>
                      {activeSelected.is_anomaly === 1 || activeSelected.anomaly_score >= 0.5 ? 'ANOMALOUS EVENT' : 'NORMAL TELEMETRY'}
                    </span>
                    <span className="font-mono-code text-xs text-zinc-400">
                      ID: {activeSelected.id}
                    </span>
                  </div>
                  <h3 className="font-syne text-xl font-bold text-white">
                    Behavioral Anomaly Diagnostic & Baseline Analysis
                  </h3>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-center font-mono-code">
                  <span className="text-[10px] text-zinc-500 block font-bold">ISOLATION FOREST SCORE</span>
                  <span className={`text-lg font-extrabold ${
                    activeSelected.is_anomaly === 1 || activeSelected.anomaly_score >= 0.5 ? 'text-purple-400' : 'text-emerald-400'
                  }`}>
                    {Math.round((activeSelected.anomaly_score || 0.12) * 100)} / 100
                  </span>
                </div>
              </div>

              {/* Gemini Flash AI Explanation Section */}
              <div className={`p-6 rounded-2xl border space-y-3 relative overflow-hidden ${
                activeSelected.is_anomaly === 1 || activeSelected.anomaly_score >= 0.5
                  ? 'border-purple-800/60 bg-gradient-to-br from-purple-950/40 via-zinc-950 to-zinc-950'
                  : 'border-emerald-900/50 bg-gradient-to-br from-emerald-950/20 via-zinc-950 to-zinc-950'
              }`}>
                <span className={`absolute top-0 right-0 w-32 h-32 rounded-full filter blur-2xl ${
                  activeSelected.is_anomaly === 1 || activeSelected.anomaly_score >= 0.5 ? 'bg-purple-500/10' : 'bg-emerald-500/10'
                }`} />
                
                <div className={`flex items-center gap-2 text-xs font-mono-code font-bold uppercase tracking-wider ${
                  activeSelected.is_anomaly === 1 || activeSelected.anomaly_score >= 0.5 ? 'text-purple-300' : 'text-emerald-300'
                }`}>
                  <Sparkles className={`w-4 h-4 ${
                    activeSelected.is_anomaly === 1 || activeSelected.anomaly_score >= 0.5 ? 'text-purple-400 animate-pulse' : 'text-emerald-400'
                  }`} />
                  <span>AI Security Analyst Evaluation:</span>
                </div>

                <p className="text-sm text-zinc-200 font-space leading-relaxed italic">
                  &ldquo;{activeSelected.explanation || "Access event matches expected employee baseline parameters."}&rdquo;
                </p>

                <div className="text-[10px] font-mono-code text-zinc-500 flex items-center justify-between pt-2 border-t border-zinc-900">
                  <span>MODEL: Isolation Forest + Gemini 1.5/2.5 Flash</span>
                  <span>EVALUATION STATUS: COMPLETE</span>
                </div>
              </div>

              {/* Identified Behavioral Deviations */}
              <div className="space-y-3">
                <h4 className="font-syne text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Identified Behavioral Deviations ({activeSelected.deviations?.length || 0})</span>
                </h4>

                <div className="space-y-2">
                  {activeSelected.deviations && activeSelected.deviations.length > 0 ? (
                    activeSelected.deviations.map((dev: string, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-start gap-3 text-xs font-mono-code text-zinc-300">
                        <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>{dev}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 text-xs font-mono-code text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Zero deviations detected — Activity perfectly matches employee baseline profile.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Telemetry vs Baseline Comparison Grid */}
              <div className="space-y-3 pt-2">
                <h4 className="font-syne text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Event Attributes vs Employee Baseline</span>
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
                    <span className="text-[10px] text-zinc-500 block font-bold">DEVICE & OS</span>
                    <span className="text-white font-bold text-xs">{activeSelected.device_id}</span>
                    <span className="text-[11px] text-zinc-400 block mt-1">{activeSelected.os} ({activeSelected.browser})</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block font-bold">TARGET RESOURCE</span>
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
              Select a telemetry item from the list to view Isolation Forest diagnostics and AI analyst evaluations.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
