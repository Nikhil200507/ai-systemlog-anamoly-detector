"use client";

import React, { useState } from 'react';
import { ShieldAlert, Filter, Lock, Zap, Ban } from 'lucide-react';
import { IncidentAlert } from '../../types/benzene';

interface IncidentTriageTabProps {
  alerts: IncidentAlert[];
  searchTerm: string;
  selectedAlert: IncidentAlert | null;
  setSelectedAlert: (alert: IncidentAlert | null) => void;
  onUpdateAlertStatus: (alertId: string, status: IncidentAlert['status']) => void;
  onShowNotification: (msg: string) => void;
}

export const IncidentTriageTab: React.FC<IncidentTriageTabProps> = ({
  alerts,
  searchTerm,
  selectedAlert,
  setSelectedAlert,
  onUpdateAlertStatus,
  onShowNotification,
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [attackFilter, setAttackFilter] = useState<string>('ALL');

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (attackFilter !== 'ALL' && a.attackType !== attackFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return a.title.toLowerCase().includes(term) || a.targetUser.toLowerCase().includes(term) || a.sourceIp.includes(term);
    }
    return true;
  });

  const handleMitigate = (alertId: string, actionName: string) => {
    onUpdateAlertStatus(alertId, 'MITIGATED');
    onShowNotification(`Mitigation Executed: ${actionName} applied to alert ${alertId}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Alert Cards Column */}
      <div className="lg:col-span-6 space-y-4">
        
        {/* Filter Controls */}
        <div className="flex items-center justify-between text-xs font-mono-code text-zinc-400 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span>SEVERITY:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-white focus:outline-none"
            >
              <option value="ALL">ALL SEVERITIES</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span>VECTOR:</span>
            <select
              value={attackFilter}
              onChange={(e) => setAttackFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-white focus:outline-none"
            >
              <option value="ALL">ALL VECTORS</option>
              <option value="IMPOSSIBLE_TRAVEL">IMPOSSIBLE TRAVEL</option>
              <option value="BRUTE_FORCE">BRUTE FORCE</option>
              <option value="LATERAL_MOVEMENT">LATERAL MOVEMENT</option>
              <option value="CREDENTIAL_MISUSE">CREDENTIAL MISUSE</option>
              <option value="DEVICE_SPOOFING">DEVICE SPOOFING</option>
            </select>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => {
              const isSelected = selectedAlert?.id === alert.id;
              return (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isSelected 
                      ? 'bg-zinc-900 border-white shadow-xl' 
                      : alert.status === 'MITIGATED'
                        ? 'bg-zinc-950/40 border-zinc-900 opacity-60'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase ${
                        alert.severity === 'CRITICAL' 
                          ? 'bg-white text-black' 
                          : alert.severity === 'HIGH' 
                            ? 'bg-zinc-200 text-black' 
                            : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        {alert.severity}
                      </span>

                      <span className="text-xs font-mono-code text-zinc-400 font-bold">
                        {alert.id}
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code ${
                        alert.status === 'OPEN' ? 'bg-zinc-800 text-zinc-200 font-semibold' : 'bg-zinc-900 text-zinc-500'
                      }`}>
                        {alert.status}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono-code text-zinc-500">
                      {alert.detectedAt}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-syne font-bold text-base text-white">
                      {alert.title}
                    </h4>
                    <p className="text-xs font-space text-zinc-400 mt-1 line-clamp-2">
                      {alert.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs font-mono-code text-zinc-400">
                    <div>
                      Target: <span className="text-white font-semibold">{alert.targetUser}</span> ({alert.userRole})
                    </div>
                    <div className="font-syne font-extrabold text-white text-sm">
                      RISK {alert.riskScore}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-zinc-500 font-mono-code text-xs bg-zinc-950 rounded-2xl border border-zinc-800">
              No alerts match current search filter criteria.
            </div>
          )}
        </div>

      </div>

      {/* Deep-Dive Incident Inspector Modal / Side Panel */}
      <div className="lg:col-span-6 bg-zinc-950 rounded-2xl border border-zinc-800 p-6 space-y-6 flex flex-col justify-between">
        {selectedAlert ? (
          <div className="space-y-6">
            
            {/* Top Header */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono-code font-bold text-white bg-zinc-800 px-2 py-0.5 rounded">
                    INCIDENT DETAILS: {selectedAlert.id}
                  </span>
                  <span className="text-xs font-mono-code text-zinc-400">
                    DETECTED AT {selectedAlert.detectedAt}
                  </span>
                </div>
                <h3 className="font-syne text-2xl font-extrabold text-white mt-1">
                  {selectedAlert.title}
                </h3>
                <p className="text-xs font-space text-zinc-300 mt-1">
                  {selectedAlert.summary}
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[10px] font-mono-code text-zinc-400">ANOMALY SCORE</div>
                <div className="font-syne text-4xl font-extrabold text-white">
                  {selectedAlert.riskScore}
                  <span className="text-sm font-normal text-zinc-500">/100</span>
                </div>
              </div>
            </div>

            {/* Incident User & Network Context */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono-code bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
              <div>
                <span className="text-zinc-500 text-[10px] block">TARGET ACCOUNT</span>
                <span className="text-white font-bold">{selectedAlert.targetUser}</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] block">USER ROLE</span>
                <span className="text-zinc-300">{selectedAlert.userRole}</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] block">SOURCE IP</span>
                <span className="text-zinc-300">{selectedAlert.sourceIp}</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] block">LOCATION</span>
                <span className="text-zinc-300">{selectedAlert.location}</span>
              </div>
              <div className="col-span-2">
                <span className="text-zinc-500 text-[10px] block">AFFECTED ASSETS</span>
                <span className="text-zinc-300">{selectedAlert.affectedAssets.join(', ')}</span>
              </div>
            </div>

            {/* SHAP Feature Waterfall */}
            <div className="space-y-3">
              <h4 className="font-mono-code text-xs text-white font-bold uppercase tracking-wider flex items-center justify-between">
                <span>SHAP Mathematical Attribution Breakdown</span>
                <span className="text-zinc-400 font-normal text-[10px]">XAI VERIFIED</span>
              </h4>

              <div className="space-y-2">
                {selectedAlert.shapFeatures.map((feat, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800/90 text-xs font-mono-code space-y-1">
                    <div className="flex justify-between text-zinc-200">
                      <span className="font-semibold">{feat.name}</span>
                      <span className="font-bold text-white">+{feat.contributionPercent}% Risk</span>
                    </div>
                    <p className="text-[11px] font-space text-zinc-400">{feat.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Incident Timeline Sequence */}
            <div className="space-y-3">
              <h4 className="font-mono-code text-xs text-white font-bold uppercase tracking-wider">
                Event Sequence Timeline
              </h4>
              <div className="space-y-2 font-mono-code text-xs">
                {selectedAlert.timeline.map((t, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-zinc-900/50 border border-zinc-800">
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-500 text-[10px]">{t.time}</span>
                      <span className="text-zinc-300 font-space">{t.event}</span>
                    </div>
                    <span className="font-bold text-white">Score: {t.anomalyScore}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Playbook Mitigations */}
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <h4 className="font-mono-code text-xs text-white font-bold uppercase tracking-wider">
                Execute SOC Playbook Mitigation:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleMitigate(selectedAlert.id, 'Quarantine Session Token')}
                  disabled={selectedAlert.status === 'MITIGATED'}
                  className="p-3 rounded-xl bg-white text-black font-mono-code font-bold text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-black" />
                  <span>Quarantine Session Token</span>
                </button>

                <button
                  onClick={() => handleMitigate(selectedAlert.id, 'Challenge FIDO2 Hardware Key')}
                  disabled={selectedAlert.status === 'MITIGATED'}
                  className="p-3 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-white text-white font-mono-code font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-white" />
                  <span>Trigger Step-Up MFA</span>
                </button>

                <button
                  onClick={() => handleMitigate(selectedAlert.id, 'Block Source Subnet')}
                  disabled={selectedAlert.status === 'MITIGATED'}
                  className="p-3 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-white text-white font-mono-code font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5 text-white" />
                  <span>Block Source IP Subnet</span>
                </button>

                <button
                  onClick={() => {
                    onUpdateAlertStatus(selectedAlert.id, 'DISMISSED');
                    onShowNotification(`Alert ${selectedAlert.id} marked as Dismissed / Baseline Normal.`);
                  }}
                  className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 text-zinc-400 font-mono-code text-xs transition-all flex items-center justify-center gap-2 cursor-pointer hover:text-white"
                >
                  <span>Dismiss as Normal Noise</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-zinc-500 font-mono-code text-xs">
            Select an alert from the left panel to inspect incident telemetry.
          </div>
        )}
      </div>

    </div>
  );
};
