"use client";

import React, { useState } from 'react';
import { Terminal, Play, Pause, RotateCcw, AlertTriangle, ShieldCheck, Zap, ArrowRight, Info } from 'lucide-react';
import { AccessLog, AttackType } from '../types/benzene';
import { generateRandomLog } from '../utils/syntheticLogGenerator';

interface LiveConsoleDemoProps {
  onLaunchFullDashboard: () => void;
  logs: AccessLog[];
  onAddLog: (log: AccessLog) => void;
}

export const LiveConsoleDemo: React.FC<LiveConsoleDemoProps> = ({ onLaunchFullDashboard, logs, onAddLog }) => {
  const [selectedLog, setSelectedLog] = useState<AccessLog | null>(logs[0] || null);

  const handleInjectAttack = (attackType: AttackType) => {
    const newLog = generateRandomLog(attackType);
    onAddLog(newLog);
    setSelectedLog(newLog);
  };

  return (
    <section className="py-20 bg-[#07070a] border-b border-zinc-800/80 grid-bg-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono-code text-zinc-300 mb-3">
              <Terminal className="w-3.5 h-3.5 text-white" />
              <span>INTERACTIVE REAL-TIME SANDBOX</span>
            </div>
            <h2 className="font-syne text-3xl sm:text-4xl font-bold text-white">
              Try the Benzene <span className="monochrome-gradient-text">Detection Engine</span>
            </h2>
            <p className="font-space text-zinc-400 text-sm sm:text-base mt-1">
              Inject synthetic cyber attacks into the live intake stream and inspect instant XAI feature attributions.
            </p>
          </div>

          <button
            onClick={onLaunchFullDashboard}
            className="px-6 py-3 rounded-xl bg-white text-black font-space font-bold text-sm transition-all hover:bg-zinc-200 flex items-center gap-2.5 shrink-0 self-start md:self-auto cursor-pointer"
          >
            <span>Open Full SOC Analyst Dashboard</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* Attack Injector Buttons Bar */}
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 mb-8 flex flex-wrap items-center gap-3">
          <span className="font-mono-code text-xs text-zinc-400 font-bold uppercase tracking-wider mr-2">
            INJECT SYNTHETIC ATTACK:
          </span>

          <button
            onClick={() => handleInjectAttack('IMPOSSIBLE_TRAVEL')}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-white text-white font-mono-code text-xs transition-all flex items-center gap-2 hover:bg-zinc-800"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-white" />
            <span>Impossible Travel</span>
          </button>

          <button
            onClick={() => handleInjectAttack('BRUTE_FORCE')}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-white text-white font-mono-code text-xs transition-all flex items-center gap-2 hover:bg-zinc-800"
          >
            <Zap className="w-3.5 h-3.5 text-white" />
            <span>Brute-Force Spray</span>
          </button>

          <button
            onClick={() => handleInjectAttack('LATERAL_MOVEMENT')}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-white text-white font-mono-code text-xs transition-all flex items-center gap-2 hover:bg-zinc-800"
          >
            <RotateCcw className="w-3.5 h-3.5 text-white" />
            <span>Lateral Movement</span>
          </button>

          <button
            onClick={() => handleInjectAttack('DEVICE_SPOOFING')}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-white text-white font-mono-code text-xs transition-all flex items-center gap-2 hover:bg-zinc-800"
          >
            <Terminal className="w-3.5 h-3.5 text-white" />
            <span>Device Spoofing</span>
          </button>

          <button
            onClick={() => handleInjectAttack('CREDENTIAL_MISUSE')}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-white text-white font-mono-code text-xs transition-all flex items-center gap-2 hover:bg-zinc-800"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>Credential Misuse</span>
          </button>

          <button
            onClick={() => handleInjectAttack('NORMAL')}
            className="px-3.5 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 text-zinc-400 font-mono-code text-xs transition-all ml-auto hover:text-white"
          >
            <span>+ Inject Normal Log</span>
          </button>
        </div>

        {/* Console Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Live Stream Table */}
          <div className="lg:col-span-7 glass-panel rounded-2xl border border-zinc-800 overflow-hidden flex flex-col h-[520px]">
            <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center text-xs font-mono-code text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white font-bold">LIVE STREAM TELEMETRY INTAKE</span>
              </div>
              <span>SHOWING LATEST {logs.length} LOGS</span>
            </div>

            <div className="overflow-y-auto flex-1 p-3 space-y-2 font-mono-code text-xs">
              {logs.slice(0, 15).map((log) => {
                const isSelected = selectedLog?.id === log.id;
                return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected 
                        ? 'bg-zinc-800 border-white text-white shadow-lg' 
                        : log.isAnomaly 
                          ? 'bg-zinc-900/90 border-zinc-700 hover:border-zinc-500 text-zinc-200' 
                          : 'bg-zinc-950/60 border-zinc-900 hover:border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-zinc-500 font-bold">{log.timestamp}</span>
                      <div>
                        <div className="font-semibold text-white text-xs">{log.userName}</div>
                        <div className="text-[11px] text-zinc-400">{log.attackType.replace('_', ' ')} &bull; {log.sourceIp}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-syne font-bold text-sm">{log.riskScore}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        log.isAnomaly ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {log.isAnomaly ? 'ANOMALY' : 'NORMAL'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Selected Log Inspector & SHAP Breakdown */}
          <div className="lg:col-span-5 bg-zinc-950 rounded-2xl border border-zinc-800 p-6 flex flex-col justify-between h-[520px] overflow-y-auto">
            {selectedLog ? (
              <div className="space-y-5">
                
                <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono-code text-zinc-500 uppercase font-bold">
                      INSPECTOR PAYLOAD ID: {selectedLog.id}
                    </span>
                    <h4 className="font-syne text-xl font-bold text-white mt-0.5">
                      {selectedLog.userName}
                    </h4>
                    <p className="text-xs font-space text-zinc-400">
                      {selectedLog.userRole} &bull; {selectedLog.department}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] font-mono-code text-zinc-400">RISK SCORE</div>
                    <div className="font-syne text-3xl font-extrabold text-white">
                      {selectedLog.riskScore}
                    </div>
                  </div>
                </div>

                {/* Log Key-Value Details */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono-code bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">SOURCE IP</span>
                    <span className="text-zinc-200">{selectedLog.sourceIp}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">LOCATION</span>
                    <span className="text-zinc-200 truncate">{selectedLog.location}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">TARGET SYSTEM</span>
                    <span className="text-zinc-200 truncate">{selectedLog.targetSystem}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">AUTH METHOD</span>
                    <span className="text-zinc-200 truncate">{selectedLog.authMethod}</span>
                  </div>
                </div>

                {/* SHAP Feature Contribution Waterfall */}
                <div className="space-y-3">
                  <div className="text-xs font-mono-code text-white font-bold uppercase tracking-wider flex justify-between">
                    <span>SHAP EXPLAINABILITY BREAKDOWN</span>
                    <span className="text-zinc-400 font-normal">DELTA ATTRIBUTION</span>
                  </div>

                  <div className="space-y-2">
                    {selectedLog.shapFeatures.map((f, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono-code space-y-1">
                        <div className="flex justify-between text-zinc-300">
                          <span>{f.name}</span>
                          <span className="font-bold text-white">+{f.contributionPercent}%</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 font-space">{f.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500 font-mono-code text-xs">
                Select a log from the left stream to inspect XAI details.
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
