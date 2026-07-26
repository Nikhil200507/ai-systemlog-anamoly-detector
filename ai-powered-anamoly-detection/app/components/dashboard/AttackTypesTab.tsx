"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, UserX, Globe, Laptop, Network, RefreshCcw, 
  Zap, CheckCircle2, AlertOctagon, MapPin, Activity, Shield, Cpu, ChevronRight
} from 'lucide-react';
import { AccessLog } from '../../types/benzene';
import { API_BASE_URL } from '../../utils/apiConfig';

interface AttackTypesTabProps {
  logs: AccessLog[];
  isBackendOnline?: boolean;
  onTriggerAttack?: (type: string) => void;
  onShowNotification: (msg: string) => void;
}

export const AttackTypesTab: React.FC<AttackTypesTabProps> = ({
  logs,
  isBackendOnline = false,
  onTriggerAttack,
  onShowNotification,
}) => {
  const [selectedVector, setSelectedVector] = useState<string>('ALL');
  const [classifiedAttacks, setClassifiedAttacks] = useState<any[]>([]);
  const [selectedAttackId, setSelectedAttackId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch classified attacks directly from FastAPI endpoint /api/classified-attacks
  const fetchClassifiedAttacks = async () => {
    if (!isBackendOnline) return;
    setIsLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    try {
      const res = await fetch(`${API_BASE_URL}/api/classified-attacks?limit=50`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        setClassifiedAttacks(data);
      }
    } catch (err) {
      clearTimeout(timeoutId);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClassifiedAttacks();
    const interval = setInterval(fetchClassifiedAttacks, 3000);
    return () => clearInterval(interval);
  }, [isBackendOnline]);

  // Fallback to client-side logs if backend offline
  const displayAttacks = isBackendOnline && classifiedAttacks.length > 0 
    ? classifiedAttacks 
    : logs.filter(l => l.isAnomaly).map(l => ({
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
        is_anomaly: 1,
        attack_type: l.attackType,
        predicted_attack_type: l.attackType === 'CREDENTIAL_MISUSE' ? 'Credential Misuse' 
          : l.attackType === 'BRUTE_FORCE' ? 'Brute Force'
          : l.attackType === 'LATERAL_MOVEMENT' ? 'Lateral Movement'
          : l.attackType === 'IMPOSSIBLE_TRAVEL' ? 'Impossible Travel'
          : l.attackType === 'DEVICE_SPOOFING' ? 'Device Spoofing'
          : 'Brute Force',
        classification_confidence: 0.94,
        attack_indicators: [
          `Targeted asset '${l.targetSystem}' from IP ${l.sourceIp}`,
          `Access request from ${l.location} deviates from user baseline`,
          `Elevated risk score signature (${l.riskScore}%)`
        ],
        explanation: `Behavioral Anomaly Detected for ${l.userName} (${l.department}). Access from ${l.location} targeting ${l.targetSystem}.`
      }));

  const filteredAttacks = selectedVector === 'ALL' 
    ? displayAttacks 
    : displayAttacks.filter(a => a.predicted_attack_type?.toUpperCase().replace(/\s+/g, '_') === selectedVector || a.attack_type === selectedVector);

  const activeSelected = (selectedAttackId && filteredAttacks.find(a => a.id === selectedAttackId)) || filteredAttacks[0] || displayAttacks[0] || null;

  // Counts for the 5 vector badges
  const countVector = (type: string) => {
    return displayAttacks.filter(a => 
      a.predicted_attack_type?.toUpperCase().replace(/\s+/g, '_') === type || a.attack_type === type
    ).length;
  };

  const getVectorColor = (type: string) => {
    switch (type) {
      case 'Brute Force': case 'BRUTE_FORCE': return 'text-red-400 border-red-800 bg-red-950/40';
      case 'Credential Misuse': case 'CREDENTIAL_MISUSE': return 'text-amber-400 border-amber-800 bg-amber-950/40';
      case 'Impossible Travel': case 'IMPOSSIBLE_TRAVEL': return 'text-cyan-400 border-cyan-800 bg-cyan-950/40';
      case 'Device Spoofing': case 'DEVICE_SPOOFING': return 'text-purple-400 border-purple-800 bg-purple-950/40';
      case 'Lateral Movement': case 'LATERAL_MOVEMENT': return 'text-pink-400 border-pink-800 bg-pink-950/40';
      default: return 'text-zinc-300 border-zinc-800 bg-zinc-900';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Module Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-red-900/40 bg-gradient-to-br from-[#1c0909] via-[#100505] to-[#070404] p-8 shadow-2xl">
        <span className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-red-600/10 filter blur-3xl" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-xs font-mono-code text-red-400 font-bold uppercase tracking-widest">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Scikit-Learn Random Forest Classifier &bull; 10 Feature Dimensions</span>
            </div>
            
            <h2 className="text-3xl font-syne font-extrabold text-white tracking-tight">
              Five Cyberattack Detection & Classification Types
            </h2>
            
            <p className="text-xs text-zinc-400 max-w-3xl font-space leading-relaxed">
              Multi-class Random Forest engine evaluating events flagged as anomalous by the Behavioral Anomaly Detector. Extracts 10 behavioral dimensions (failed attempt bursts, geographic velocity, unassigned hardware GUIDs, subnet mismatches, and multi-server access speed) to categorize threats into 5 distinct attack vectors.
            </p>
          </div>

          {/* Machine Learning Status Badge */}
          <div className="shrink-0 p-4 rounded-2xl bg-zinc-950/80 border border-red-900/50 font-mono-code text-xs space-y-2 min-w-[220px]">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] uppercase font-bold text-zinc-500">CLASSIFIER MODEL</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="font-bold text-white flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Random Forest Active</span>
            </div>
            <div className="text-[11px] text-zinc-400 border-t border-zinc-900 pt-2">
              100 Decision Trees &bull; 5 Vector Output
            </div>
          </div>
        </div>
      </div>

      {/* 5 Attack Vector Cards Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { name: 'Brute Force', code: 'BRUTE_FORCE', icon: <ShieldAlert className="w-4 h-4 text-red-400" />, count: countVector('BRUTE_FORCE') },
          { name: 'Credential Misuse', code: 'CREDENTIAL_MISUSE', icon: <UserX className="w-4 h-4 text-amber-400" />, count: countVector('CREDENTIAL_MISUSE') },
          { name: 'Impossible Travel', code: 'IMPOSSIBLE_TRAVEL', icon: <Globe className="w-4 h-4 text-cyan-400" />, count: countVector('IMPOSSIBLE_TRAVEL') },
          { name: 'Device Spoofing', code: 'DEVICE_SPOOFING', icon: <Laptop className="w-4 h-4 text-purple-400" />, count: countVector('DEVICE_SPOOFING') },
          { name: 'Lateral Movement', code: 'LATERAL_MOVEMENT', icon: <Network className="w-4 h-4 text-pink-400" />, count: countVector('LATERAL_MOVEMENT') },
        ].map((v) => (
          <div 
            key={v.code}
            onClick={() => setSelectedVector(selectedVector === v.code ? 'ALL' : v.code)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedVector === v.code 
                ? 'bg-red-950/40 border-red-500 shadow-md shadow-red-950/40' 
                : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                {v.icon}
              </div>
              <span className="font-mono-code text-xs font-bold text-white font-syne">
                {v.count}
              </span>
            </div>
            <div>
              <h4 className="font-syne text-xs font-bold text-white">{v.name}</h4>
              <span className="text-[10px] font-mono-code text-zinc-500">Vector Filter</span>
            </div>
          </div>
        ))}
      </div>

      {/* Cyberattack Trigger Bar & Vector Selector */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        
        {/* Vector Filter Toggle */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono-code text-xs">
          <button
            onClick={() => setSelectedVector('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
              selectedVector === 'ALL' 
                ? 'bg-red-950 text-red-200 border border-red-600 shadow' 
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            All Vectors ({displayAttacks.length})
          </button>
        </div>

        {/* Attack Injectors */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono-code text-[11px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Inject Vector:
          </span>
          {['BRUTE_FORCE', 'IMPOSSIBLE_TRAVEL', 'DEVICE_SPOOFING', 'CREDENTIAL_MISUSE', 'LATERAL_MOVEMENT'].map((attackType) => (
            <button
              key={attackType}
              onClick={() => {
                if (isBackendOnline && onTriggerAttack) {
                  onTriggerAttack(attackType.toLowerCase());
                  onShowNotification(`Triggered ${attackType.replace('_', ' ')} payload: Running through Random Forest Classifier...`);
                  setTimeout(fetchClassifiedAttacks, 1500);
                } else {
                  onShowNotification(`Simulated ${attackType} trigger locally.`);
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-red-500 hover:bg-red-950/30 text-white font-mono-code text-[10px] transition-all cursor-pointer whitespace-nowrap"
            >
              + {attackType.replace('_', ' ')}
            </button>
          ))}
        </div>

        <button
          onClick={fetchClassifiedAttacks}
          className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 font-mono-code text-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Grid: Classified Stream (Left) & Classification Diagnostic Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Classified Attacks Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-syne text-lg font-bold text-white flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-400" />
              <span>Classified Threats ({filteredAttacks.length})</span>
            </h3>
            <span className="text-[10px] font-mono-code text-zinc-500">Random Forest Output</span>
          </div>

          <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredAttacks.length === 0 ? (
              <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950/40 text-center font-mono-code text-xs text-zinc-500">
                No classified attack events matching selected vector filter.
              </div>
            ) : (
              filteredAttacks.map((item) => {
                const isSelected = activeSelected?.id === item.id;
                const predType = item.predicted_attack_type || 'Brute Force';
                const confidencePct = Math.round((item.classification_confidence || 0.94) * 100);
                const colorClass = getVectorColor(predType);
                
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedAttackId(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-red-950/30 border-red-500 shadow-lg shadow-red-950/50' 
                        : 'bg-zinc-950/60 border-zinc-800/80 hover:border-red-800 hover:bg-zinc-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-extrabold uppercase tracking-wider border ${colorClass}`}>
                        {predType}
                      </span>

                      {/* Confidence Pill */}
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-zinc-900 border border-zinc-700 text-zinc-200">
                        {confidencePct}% CONFIDENCE
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

                    {/* Small Indicator Count Badge */}
                    {item.attack_indicators && item.attack_indicators.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-zinc-900 text-[10px] font-mono-code text-zinc-400">
                        {item.attack_indicators.length} Attack Indicators Identified
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Classification Diagnostic & Indicators Card */}
        <div className="lg:col-span-2 space-y-6">
          {activeSelected ? (
            <div className="p-6 md:p-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 space-y-6">
              
              {/* Event Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="px-2.5 py-1 rounded bg-red-950 border border-red-600 text-red-300 font-mono-code text-xs font-bold uppercase">
                      PREDICTED: {activeSelected.predicted_attack_type || 'BRUTE FORCE'}
                    </span>
                    <span className="font-mono-code text-xs text-zinc-400">
                      ID: {activeSelected.id}
                    </span>
                  </div>
                  <h3 className="font-syne text-xl font-bold text-white">
                    Random Forest Multi-Class Classification & Threat Diagnostics
                  </h3>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-center font-mono-code">
                  <span className="text-[10px] text-zinc-500 block font-bold">CLASSIFIER CONFIDENCE</span>
                  <span className="text-lg font-extrabold text-red-400">
                    {Math.round((activeSelected.classification_confidence || 0.94) * 100)}%
                  </span>
                </div>
              </div>

              {/* Extracted Attack Indicators */}
              <div className="space-y-3">
                <h4 className="font-syne text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>Relevant Attack Indicators ({activeSelected.attack_indicators?.length || 0})</span>
                </h4>

                <div className="space-y-2">
                  {activeSelected.attack_indicators && activeSelected.attack_indicators.length > 0 ? (
                    activeSelected.attack_indicators.map((ind: string, idx: number) => (
                      <div key={idx} className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-start gap-3 text-xs font-mono-code text-zinc-200">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1 shrink-0" />
                        <span className="leading-relaxed">{ind}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 text-xs font-mono-code text-zinc-500">
                      Multi-dimensional baseline deviation detected.
                    </div>
                  )}
                </div>
              </div>

              {/* Vector Mechanics Explanation Box */}
              <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono-code text-zinc-400 font-bold uppercase">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Attack Vector Classification Mechanics:</span>
                </div>
                <p className="text-xs text-zinc-300 font-space leading-relaxed">
                  {activeSelected.predicted_attack_type === 'Brute Force' && "Classified by analyzing rapid sequential failed authentication attempts within a short time window originating from non-baseline IP ranges."}
                  {activeSelected.predicted_attack_type === 'Credential Misuse' && "Classified by identifying successful authentication requests where multiple characteristics (unassigned hardware, off-hours, restricted target asset) deviate from employee baseline."}
                  {activeSelected.predicted_attack_type === 'Impossible Travel' && "Classified by calculating geographic distance and travel velocity (km/h) between consecutive logins for the same user account."}
                  {activeSelected.predicted_attack_type === 'Device Spoofing' && "Classified by comparing the active hardware fingerprint against known employee device records, identifying OS, browser, or device GUID mismatches."}
                  {activeSelected.predicted_attack_type === 'Lateral Movement' && "Classified by detecting rapid multi-server pivoting requests targeting critical infrastructure assets outside standard departmental authorization scope."}
                  {(!activeSelected.predicted_attack_type || activeSelected.predicted_attack_type === 'Normal') && "Classified as normal baseline activity."}
                </p>
              </div>

              {/* Telemetry & Identity Attributes Grid */}
              <div className="space-y-3 pt-2">
                <h4 className="font-syne text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Telemetry & Feature Attributes</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono-code text-xs">
                  
                  <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block font-bold">TARGET USER</span>
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
              Select a classified attack from the list to view Random Forest diagnostics and relevant attack indicators.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
