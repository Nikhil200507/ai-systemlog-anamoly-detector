"use client";

import React, { useState, useEffect } from 'react';
import { 
  Brain, Zap, RefreshCcw, UserCheck, ShieldAlert, History, MapPin, 
  Clock, Award, CheckCircle2, User, Layers, ArrowRight
} from 'lucide-react';
import { AccessLog } from '../../types/benzene';
import { API_BASE_URL } from '../../utils/apiConfig';

interface ColdStartTabProps {
  logs: AccessLog[];
  isBackendOnline?: boolean;
  onShowNotification: (msg: string) => void;
}

export const ColdStartTab: React.FC<ColdStartTabProps> = ({
  logs,
  isBackendOnline = false,
  onShowNotification,
}) => {
  const [subView, setSubView] = useState<'PROFILES' | 'DRIFT_HISTORY'>('PROFILES');
  const [coldProfiles, setColdProfiles] = useState<any[]>([]);
  const [driftHistory, setDriftHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Fetch cold start profiles and drift history from FastAPI
  const fetchColdStartData = async () => {
    if (!isBackendOnline) return;
    setIsLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    try {
      const pRes = await fetch(`${API_BASE_URL}/api/cold-start`, { signal: controller.signal });
      const hRes = await fetch(`${API_BASE_URL}/api/concept-drift`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (pRes.ok) {
        const pData = await pRes.json();
        setColdProfiles(pData);
      }
      if (hRes.ok) {
        const hData = await hRes.json();
        setDriftHistory(hData);
      }
    } catch (err) {
      clearTimeout(timeoutId);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchColdStartData();
    const interval = setInterval(fetchColdStartData, 4000);
    return () => clearInterval(interval);
  }, [isBackendOnline]);

  // Simulate concept drift (Location Shift or Working Hours Shift)
  const handleTriggerDrift = async (driftType: 'LOCATION_SHIFT' | 'WORKING_HOURS_SHIFT') => {
    if (!activeUser) return;
    if (!isBackendOnline) {
      onShowNotification(`Simulated ${driftType} for ${activeUser.name} locally.`);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/trigger-drift`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: activeUser.user_id, drift_type: driftType })
      });
      if (res.ok) {
        const data = await res.json();
        onShowNotification(data.message);
        await fetchColdStartData();
      }
    } catch (err) {
      onShowNotification("Error triggering concept drift.");
    }
  };

  const displayProfiles = isBackendOnline && coldProfiles.length > 0
    ? coldProfiles
    : [
        { user_id: 'USR-101', name: 'Austin Kane', department: 'Sales', trusted_event_count: 15, profile_maturity: 100, baseline_type: 'PERSONAL', drift_detected: 0 },
        { user_id: 'USR-102', name: 'Joshua Bradley', department: 'Engineering', trusted_event_count: 8, profile_maturity: 53, baseline_type: 'GROUP', drift_detected: 0 },
        { user_id: 'USR-103', name: 'Jasmine Watson', department: 'HR', trusted_event_count: 3, profile_maturity: 20, baseline_type: 'GROUP', drift_detected: 0 }
      ];

  const activeUser = (selectedUserId && displayProfiles.find(u => u.user_id === selectedUserId || u.id === selectedUserId)) || displayProfiles[0] || null;

  const maturedCount = displayProfiles.filter(p => p.profile_maturity >= 100).length;
  const coldCount = displayProfiles.filter(p => p.profile_maturity < 100).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Module Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-900/40 bg-gradient-to-br from-[#0a1824] via-[#050d14] to-[#020508] p-8 shadow-2xl">
        <span className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-cyan-600/10 filter blur-3xl" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-xs font-mono-code text-cyan-400 font-bold uppercase tracking-widest">
              <Brain className="w-4 h-4 text-cyan-400" />
              <span>Department Group Fallback &bull; Anti-Poisoning Profile Adaptation</span>
            </div>
            
            <h2 className="text-3xl font-syne font-extrabold text-white tracking-tight">
              Cold Start & Concept Drift Handling
            </h2>
            
            <p className="text-xs text-zinc-400 max-w-3xl font-space leading-relaxed">
              Manages the lifecycle of user profiles. Evaluates new users against department-level group baselines until 15 trusted events are collected, then automatically promotes to a personal profile. Continuously adapts baselines when legitimate work hours or location shifts occur while blocking malicious baseline poisoning.
            </p>
          </div>

          {/* Maturity Summary Badge */}
          <div className="shrink-0 p-4 rounded-2xl bg-zinc-950/80 border border-cyan-900/50 font-mono-code text-xs space-y-2 min-w-[240px]">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] uppercase font-bold text-zinc-500">PROFILES STATUS</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="font-bold text-white flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Matured: {maturedCount} Profiles</span>
            </div>
            <div className="text-[11px] text-zinc-400 border-t border-zinc-900 pt-2 flex items-center justify-between">
              <span>Cold Start (Group): {coldCount}</span>
              <span>Total: {displayProfiles.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-view Selector & Drift Trigger Controls */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-2 font-mono-code text-xs">
          <button
            onClick={() => setSubView('PROFILES')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-2 ${
              subView === 'PROFILES' 
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-600 shadow' 
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>User Profiles & Maturity ({displayProfiles.length})</span>
          </button>

          <button
            onClick={() => setSubView('DRIFT_HISTORY')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-2 ${
              subView === 'DRIFT_HISTORY' 
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-600 shadow' 
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>Concept Drift Audit Log ({driftHistory.length})</span>
          </button>
        </div>

        {/* Drift Simulation Actions */}
        {activeUser && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono-code text-[11px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Simulate Drift for {activeUser.name}:
            </span>

            <button
              onClick={() => handleTriggerDrift('LOCATION_SHIFT')}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-cyan-500 hover:bg-cyan-950/30 text-white font-mono-code text-[10px] transition-all cursor-pointer flex items-center gap-1"
            >
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>Location Shift</span>
            </button>

            <button
              onClick={() => handleTriggerDrift('WORKING_HOURS_SHIFT')}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-cyan-500 hover:bg-cyan-950/30 text-white font-mono-code text-[10px] transition-all cursor-pointer flex items-center gap-1"
            >
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Work Hours Shift</span>
            </button>
          </div>
        )}

        <button
          onClick={fetchColdStartData}
          className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 font-mono-code text-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Content Grid */}
      {subView === 'PROFILES' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: User Profiles Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-syne text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Employee Profiles</span>
              </h3>
              <span className="text-[10px] font-mono-code text-zinc-500">Maturity Ranking</span>
            </div>

            <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1 scrollbar-thin">
              {displayProfiles.map((userProf) => {
                const isSelected = activeUser?.user_id === userProf.user_id;
                const isPersonal = userProf.baseline_type === 'PERSONAL';
                
                return (
                  <div
                    key={userProf.user_id}
                    onClick={() => setSelectedUserId(userProf.user_id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-cyan-950/30 border-cyan-500 shadow-lg shadow-cyan-950/50' 
                        : 'bg-zinc-950/60 border-zinc-800/80 hover:border-cyan-800 hover:bg-zinc-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono-code text-xs font-bold text-white flex items-center gap-1.5">
                        <User className="w-3 h-3 text-cyan-400" />
                        {userProf.name}
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase border ${
                        isPersonal ? 'bg-emerald-950 border-emerald-600 text-emerald-300' : 'bg-amber-950 border-amber-600 text-amber-300'
                      }`}>
                        {userProf.baseline_type} BASELINE
                      </span>
                    </div>

                    <div className="text-xs text-zinc-400 font-mono-code mb-2">
                      Dept: {userProf.department} &bull; ID: {userProf.user_id}
                    </div>

                    {/* Maturity Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono-code text-zinc-400">
                        <span>Profile Maturity</span>
                        <span>{userProf.profile_maturity}% ({userProf.trusted_event_count}/15 Events)</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${userProf.profile_maturity}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: User Profile Diagnostic Panel */}
          <div className="lg:col-span-2 space-y-6">
            {activeUser ? (
              <div className="p-6 md:p-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 space-y-6">
                
                {/* User Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`px-2.5 py-1 rounded font-mono-code text-xs font-bold uppercase border ${
                        activeUser.baseline_type === 'PERSONAL' ? 'bg-emerald-950 border-emerald-600 text-emerald-300' : 'bg-amber-950 border-amber-600 text-amber-300'
                      }`}>
                        {activeUser.baseline_type} BASELINE ACTIVE
                      </span>
                      <span className="font-mono-code text-xs text-zinc-400">
                        {activeUser.user_id}
                      </span>
                    </div>
                    <h3 className="font-syne text-xl font-bold text-white">
                      {activeUser.name} &bull; {activeUser.department} Department
                    </h3>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-center font-mono-code min-w-[140px]">
                    <span className="text-[10px] text-zinc-500 block font-bold">PROFILE MATURITY</span>
                    <span className="text-2xl font-extrabold text-cyan-400">
                      {activeUser.profile_maturity}%
                    </span>
                  </div>
                </div>

                {/* Cold Start / Maturity Mechanics Explanation */}
                <div className="p-6 rounded-2xl border border-cyan-900/60 bg-gradient-to-br from-cyan-950/30 via-zinc-950 to-zinc-950 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono-code text-cyan-300 font-bold uppercase">
                    <Award className="w-4 h-4 text-cyan-400" />
                    <span>Baseline Lifecycle Mechanics:</span>
                  </div>

                  <p className="text-xs text-zinc-300 font-space leading-relaxed">
                    {activeUser.baseline_type === 'GROUP' 
                      ? `Cold Start Fallback Active: User has collected ${activeUser.trusted_event_count} of 15 required trusted events. Behavior is currently evaluated against the ${activeUser.department} Department aggregate baseline (08:00–18:00 work hours, department subnet rules). Will automatically switch to PERSONAL baseline upon reaching 15 events.`
                      : `Personal Profile Matured: User has collected ${activeUser.trusted_event_count} trusted observations. Behavior is evaluated against ${activeUser.name}'s dedicated personal profile.`
                    }
                  </p>

                  <div className="text-[10px] font-mono-code text-zinc-500 pt-2 border-t border-cyan-900/40 flex items-center justify-between">
                    <span>MATURITY THRESHOLD: 15 Trusted Events</span>
                    <span>ANTI-POISONING: Enforced</span>
                  </div>
                </div>

                {/* Profile Parameters Grid */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-syne text-sm font-bold text-white flex items-center gap-2">
                    <Brain className="w-4 h-4 text-emerald-400" />
                    <span>Active Behavioral Profile Parameters</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono-code text-xs">
                    
                    <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 block font-bold">WORKING HOURS WINDOW</span>
                      <span className="text-white font-bold text-sm">
                        {activeUser.baseline_type === 'GROUP' ? '08:00 – 18:00 (Dept Baseline)' : 'Assigned Working Hours'}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 block font-bold">TRUSTED HARDWARE DEVICES</span>
                      <span className="text-white font-bold text-sm">
                        Registered Corporate Hardware GUIDs
                      </span>
                    </div>

                  </div>
                </div>

              </div>
            ) : (
              <div className="p-12 rounded-3xl border border-zinc-800 bg-zinc-950/40 text-center font-mono-code text-xs text-zinc-500">
                Select an employee from the list to view profile maturity and baseline lifecycle details.
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Concept Drift Audit Log Stream View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-syne text-lg font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Concept Drift Audit Trail ({driftHistory.length})</span>
            </h3>
            <span className="text-[10px] font-mono-code text-zinc-500">Immutable Audit Trail</span>
          </div>

          <div className="space-y-3">
            {driftHistory.length === 0 ? (
              <div className="p-12 rounded-3xl border border-zinc-800 bg-zinc-950/40 text-center font-mono-code text-xs text-zinc-500">
                No concept drift events recorded yet. Click &apos;Simulate Drift&apos; on a user profile above to test.
              </div>
            ) : (
              driftHistory.map((item) => (
                <div key={item.id} className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3 font-mono-code text-xs">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                    <span className="px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-600 text-cyan-300 font-bold uppercase">
                      {item.change_type}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Trigger: {item.trigger_source} &bull; {item.timestamp ? item.timestamp.substring(0, 19).replace('T', ' ') : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-zinc-200">
                    <span className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
                      {item.old_value}
                    </span>
                    <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="p-2 rounded-lg bg-cyan-950/50 border border-cyan-800 text-cyan-200 font-bold">
                      {item.new_value}
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-400">
                    Target User: <span className="text-white font-bold">{item.name || item.user_id}</span> ({item.department || 'Corporate'})
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
