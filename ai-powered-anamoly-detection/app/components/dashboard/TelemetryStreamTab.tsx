"use client";

import React from 'react';
import { AccessLog } from '../../types/benzene';
import { generateRandomLog } from '../../utils/syntheticLogGenerator';

interface TelemetryStreamTabProps {
  logs: AccessLog[];
  isStreaming: boolean;
  searchTerm: string;
  onAddLog: (log: AccessLog) => void;
  onShowNotification: (msg: string) => void;
  onTriggerAttack?: (type: string) => void;
  isBackendOnline?: boolean;
}

export const TelemetryStreamTab: React.FC<TelemetryStreamTabProps> = ({
  logs,
  isStreaming,
  searchTerm,
  onAddLog,
  onShowNotification,
  onTriggerAttack,
  isBackendOnline
}) => {
  const filteredLogs = logs.filter(l => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return l.userName.toLowerCase().includes(term) || l.sourceIp.includes(term) || l.targetSystem.toLowerCase().includes(term);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Filter & Injector Control Bar */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono-code text-[11px] text-white font-bold uppercase tracking-wider">
            ATTACK INJECTOR:
          </span>
          <button
            onClick={() => {
              if (isBackendOnline && onTriggerAttack) {
                onTriggerAttack('impossible_travel');
                onShowNotification('FastAPI Server: Injected Impossible Travel sequence.');
              } else {
                const l = generateRandomLog('IMPOSSIBLE_TRAVEL');
                onAddLog(l);
                onShowNotification('In-Memory Mock: Injected Impossible Travel Cyber Attack');
              }
            }}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-white text-white font-mono-code text-[10px] transition-all cursor-pointer whitespace-nowrap"
          >
            + Impossible Travel
          </button>
          <button
            onClick={() => {
              if (isBackendOnline && onTriggerAttack) {
                onTriggerAttack('brute_force');
                onShowNotification('FastAPI Server: Injected Brute-Force Password Spray Burst.');
              } else {
                const l = generateRandomLog('BRUTE_FORCE');
                onAddLog(l);
                onShowNotification('In-Memory Mock: Injected Brute-Force Password Spray Burst');
              }
            }}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-white text-white font-mono-code text-[10px] transition-all cursor-pointer whitespace-nowrap"
          >
            + Brute Force
          </button>
          <button
            onClick={() => {
              if (isBackendOnline && onTriggerAttack) {
                onTriggerAttack('lateral_movement');
                onShowNotification('FastAPI Server: Injected Lateral Movement Subnet Pivoting.');
              } else {
                const l = generateRandomLog('LATERAL_MOVEMENT');
                onAddLog(l);
                onShowNotification('In-Memory Mock: Injected Lateral Movement Subnet Pivoting');
              }
            }}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-white text-white font-mono-code text-[10px] transition-all cursor-pointer whitespace-nowrap"
          >
            + Lateral Movement
          </button>
          <button
            onClick={() => {
              if (isBackendOnline && onTriggerAttack) {
                onTriggerAttack('credential_misuse');
                onShowNotification('FastAPI Server: Injected Credential Misuse signature.');
              } else {
                const l = generateRandomLog('CREDENTIAL_MISUSE');
                onAddLog(l);
                onShowNotification('In-Memory Mock: Injected Credential Misuse signature');
              }
            }}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-white text-white font-mono-code text-[10px] transition-all cursor-pointer whitespace-nowrap"
          >
            + Credential Misuse
          </button>
          <button
            onClick={() => {
              if (isBackendOnline && onTriggerAttack) {
                onTriggerAttack('device_spoofing');
                onShowNotification('FastAPI Server: Injected Device Spoofing payload.');
              } else {
                const l = generateRandomLog('DEVICE_SPOOFING');
                onAddLog(l);
                onShowNotification('In-Memory Mock: Injected Device Spoofing payload');
              }
            }}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-white text-white font-mono-code text-[10px] transition-all cursor-pointer whitespace-nowrap"
          >
            + Device Spoofing
          </button>
        </div>

        <div className="text-xs font-mono-code text-zinc-400">
          STREAM STATUS: <span className="text-white font-bold">{isStreaming ? 'INGESTING ACTIVE' : 'PAUSED'}</span>
        </div>
      </div>

      {/* Stream Table */}
      <div className="glass-panel rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-code text-xs">
            <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">User Identity</th>
                <th className="p-3.5">Role / Dept</th>
                <th className="p-3.5">Source IP / Geo</th>
                <th className="p-3.5">Target System</th>
                <th className="p-3.5">Risk Score</th>
                <th className="p-3.5">Attack Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredLogs.map((log) => (
                <tr 
                  key={log.id}
                  className={`hover:bg-zinc-800/40 transition-colors ${
                    log.isAnomaly ? 'bg-zinc-900/60 font-semibold' : ''
                  }`}
                >
                  <td className="p-3.5 text-zinc-400 text-[11px]">{log.timestamp}</td>
                  <td className="p-3.5 text-white font-bold">{log.userName}</td>
                  <td className="p-3.5 text-zinc-400">{log.userRole}</td>
                  <td className="p-3.5 text-zinc-300">
                    <div>{log.sourceIp}</div>
                    <div className="text-[10px] text-zinc-500">{log.location}</div>
                  </td>
                  <td className="p-3.5 text-zinc-300">{log.targetSystem}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-md font-syne font-bold text-xs ${
                      log.riskScore > 80 
                        ? 'bg-white text-black' 
                        : log.riskScore > 50 
                          ? 'bg-zinc-300 text-black' 
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}>
                      {log.riskScore}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.isAnomaly ? 'bg-zinc-100 text-black uppercase' : 'text-zinc-500 uppercase'
                    }`}>
                      {log.attackType.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
