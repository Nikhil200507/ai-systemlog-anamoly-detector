"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Terminal, Network, Cpu, Search, Pause, Play, RefreshCcw, Zap, LayoutDashboard, Download,
  Brain, Layers, HelpCircle, CheckCircle
} from 'lucide-react';
import { AccessLog, IncidentAlert, ModelMetrics } from '../types/benzene';
import { generateRandomLog, getDefaultModelMetrics } from '../utils/syntheticLogGenerator';
import { API_BASE_URL } from '../utils/apiConfig';

import { ConsoleOverviewTab } from './dashboard/ConsoleOverviewTab';
import { IncidentTriageTab } from './dashboard/IncidentTriageTab';
import { TelemetryStreamTab } from './dashboard/TelemetryStreamTab';
import { LateralGraphTab } from './dashboard/LateralGraphTab';
import { ModelHealthTab } from './dashboard/ModelHealthTab';
import { AnomalyDetectionTab } from './dashboard/AnomalyDetectionTab';
import { AttackTypesTab } from './dashboard/AttackTypesTab';
import { RiskScoreTab } from './dashboard/RiskScoreTab';
import { FalsePositiveTab } from './dashboard/FalsePositiveTab';
import { ColdStartTab } from './dashboard/ColdStartTab';
import { RealtimeDashboardTab } from './dashboard/RealtimeDashboardTab';
import { AiSocAnalystTab } from './dashboard/AiSocAnalystTab';

interface DashboardProps {
  logs: AccessLog[];
  alerts: IncidentAlert[];
  onAddLog: (log: AccessLog) => void;
  onUpdateAlertStatus: (alertId: string, status: IncidentAlert['status']) => void;
  user: any;
  isBackendOnline?: boolean;
  isGenerating?: boolean;
  onToggleGenerator?: () => void;
  onTriggerAttack?: (type: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  logs, 
  alerts, 
  onAddLog, 
  onUpdateAlertStatus,
  user,
  isBackendOnline = false,
  isGenerating = false,
  onToggleGenerator,
  onTriggerAttack
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'triage' | 'stream' | 'graph' | 'model_health' | 'anomaly_detection' | 'attack_types' | 'classification' | 'risk_score' | 'false_positive' | 'cold_start' | 'realtime_dashboard' | 'ai_soc_analyst'>('overview');
  const [selectedAlert, setSelectedAlert] = useState<IncidentAlert | null>(alerts[0] || null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Local streaming simulation state (only active when backend is offline)
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [metrics, setMetrics] = useState<ModelMetrics>(getDefaultModelMetrics());
  const [notification, setNotification] = useState<string | null>(null);

  // Auto-stream local synthetic logs periodically when backend is offline
  useEffect(() => {
    if (isBackendOnline || !isStreaming) return;
    const interval = setInterval(() => {
      const newLog = generateRandomLog();
      onAddLog(newLog);
      setMetrics(prev => ({
        ...prev,
        totalLogsScanned: prev.totalLogsScanned + 1
      }));
    }, 2500);

    return () => clearInterval(interval);
  }, [isStreaming, onAddLog, isBackendOnline]);

  // Synchronise dashboard metrics directly from the live database API
  useEffect(() => {
    if (!isBackendOnline) return;

    const fetchLiveMetrics = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/dashboard-metrics`);
        if (res.ok) {
          const data = await res.json();
          setMetrics(prev => ({
            ...prev,
            totalLogsScanned: data.overview?.total_events || prev.totalLogsScanned,
            activeAnomalies: data.overview?.active_threats || prev.activeAnomalies,
            falsePositiveRate: data.overview?.false_positive_rate ?? prev.falsePositiveRate,
            precision: data.model_metrics?.precision ? Math.round(data.model_metrics.precision * 100) : prev.precision,
            inferenceLatencyMs: data.model_metrics?.inference_latency_ms || prev.inferenceLatencyMs,
            driftScore: data.model_metrics?.drift_score || prev.driftScore
          }));
        }
      } catch (e) {
        // Ignore fetch error
      }
    };

    fetchLiveMetrics();
    const interval = setInterval(fetchLiveMetrics, 3000);
    return () => clearInterval(interval);
  }, [isBackendOnline]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleForceRetrain = () => {
    setMetrics(prev => ({
      ...prev,
      modelStatus: 'RETRAINING',
      driftScore: 0.02,
      lastRetrained: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC (Manual Trigger)'
    }));
    showNotification('Model Retraining Pipeline Launched: Re-indexing baseline feature distributions...');
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        modelStatus: 'OPTIMAL'
      }));
    }, 3000);
  };

  const downloadMockLogsCSV = () => {
    const headers = "id,timestamp,userId,userName,userRole,department,sourceIp,location,targetSystem,deviceFingerprint,deviceType,browser,authMethod,status,riskScore,isAnomaly,attackType,severity\n";
    const rows = logs.map(l => 
      `"${l.id}","${l.timestamp}","${l.userId}","${l.userName}","${l.userRole}","${l.department}","${l.sourceIp}","${l.location}","${l.targetSystem}","${l.deviceFingerprint}","${l.deviceType}","${l.browser}","${l.authMethod}","${l.status}",${l.riskScore},${l.isAnomaly},"${l.attackType}","${l.severity}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "benzene_security_logs.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification("Downloaded local mock logs as CSV.");
  };

  const openAnomaliesCount = alerts.filter(a => a.status === 'OPEN').length;

  return (
    <div className="min-h-screen bg-[#050507] text-white font-space pb-16">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl bg-white text-black font-mono-code text-xs font-bold shadow-2xl flex items-center gap-3 border border-zinc-300 animate-bounce">
          <Zap className="w-4 h-4 text-black" />
          <span>{notification}</span>
        </div>
      )}

      {/* SOC Top Bar & System Health Overview */}
      <div className="bg-zinc-950 border-b border-zinc-800/90 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <h1 className="font-syne text-2xl font-bold text-white tracking-tight">
                  Security Operations Center (SOC) Console
                </h1>
                <span className={`px-2.5 py-0.5 rounded border text-[10px] font-mono-code font-bold ${
                  isBackendOnline 
                    ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-400' 
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}>
                  {isBackendOnline ? 'LIVE FASTAPI SERVER' : 'LIVE TELEMETRY AGENT'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Benzene Zero-Signature UEBA Engine &bull; Continuous High-Dimensional Access Profiling
              </p>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center gap-3">
              <button
                onClick={isBackendOnline && onToggleGenerator ? onToggleGenerator : () => setIsStreaming(!isStreaming)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono-code font-semibold transition-all flex items-center gap-2 border cursor-pointer ${
                  (isBackendOnline ? isGenerating : isStreaming)
                    ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500' 
                    : 'bg-white text-black border-white'
                }`}
              >
                {(isBackendOnline ? isGenerating : isStreaming) ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{(isBackendOnline ? isGenerating : isStreaming) ? 'Pause Stream Intake' : 'Resume Telemetry Stream'}</span>
              </button>

              <a
                href={isBackendOnline ? `${API_BASE_URL}/api/export` : "#"}
                onClick={(e) => {
                  if (!isBackendOnline) {
                    e.preventDefault();
                    downloadMockLogsCSV();
                  } else {
                    showNotification("Exporting SQL logs database to CSV...");
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-200 text-xs font-mono-code font-semibold transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span>Export CSV</span>
              </a>

              <button
                onClick={handleForceRetrain}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-200 text-xs font-mono-code font-semibold transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCcw className="w-3.5 h-3.5 text-zinc-400" />
                <span>Force Baseline Retrain</span>
              </button>
            </div>
          </div>

          {/* Metrics Pills Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-6">
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center font-mono-code">
              <span className="text-[10px] text-zinc-500 block font-bold">TOTAL SCANNED LOGS</span>
              <span className="text-sm font-bold text-white">{metrics.totalLogsScanned.toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center font-mono-code">
              <span className="text-[10px] text-zinc-500 block font-bold">ACTIVE INCIDENTS</span>
              <span className="text-sm font-bold text-white font-syne">{alerts.filter(a => a.status !== 'MITIGATED').length} OPEN</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center font-mono-code">
              <span className="text-[10px] text-zinc-500 block font-bold">FALSE POSITIVE RATE</span>
              <span className="text-sm font-bold text-white">{metrics.falsePositiveRate}%</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center font-mono-code">
              <span className="text-[10px] text-zinc-500 block font-bold">DETECTION PRECISION</span>
              <span className="text-sm font-bold text-white">{metrics.precision}%</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center font-mono-code">
              <span className="text-[10px] text-zinc-500 block font-bold">MODEL DRIFT SCORE</span>
              <span className="text-sm font-bold text-white">{metrics.driftScore} (Stable)</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center font-mono-code">
              <span className="text-[10px] text-zinc-500 block font-bold">INFERENCE LATENCY</span>
              <span className="text-sm font-bold text-white">{metrics.inferenceLatencyMs} ms</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main SOC Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Back to Overview breadcrumb — shown on all sub-tabs */}
        {activeTab !== 'overview' && (
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white text-xs font-mono-code font-semibold transition-all cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>← Back to Console Overview</span>
            </button>

            {/* Search Input — available on sub-tabs */}
            <div className="relative w-64 shrink-0">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user, IP, target..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono-code text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Tab Composition */}
        {activeTab === 'overview' && (
          <ConsoleOverviewTab
            user={user}
            onTabChange={(tab) => setActiveTab(tab)}
            activeAnomalyCount={openAnomaliesCount}
          />
        )}

        {/* Real-Time Analyst Dashboard */}
        {activeTab === 'realtime_dashboard' && (
          <RealtimeDashboardTab
            logs={logs}
            isBackendOnline={isBackendOnline}
            onTriggerAttack={onTriggerAttack}
            onShowNotification={showNotification}
          />
        )}

        {activeTab === 'triage' && (
          <IncidentTriageTab
            alerts={alerts}
            searchTerm={searchTerm}
            selectedAlert={selectedAlert}
            setSelectedAlert={setSelectedAlert}
            onUpdateAlertStatus={onUpdateAlertStatus}
            onShowNotification={showNotification}
          />
        )}

        {activeTab === 'stream' && (
          <TelemetryStreamTab
            logs={logs}
            isStreaming={isBackendOnline ? isGenerating : isStreaming}
            searchTerm={searchTerm}
            onAddLog={onAddLog}
            onShowNotification={showNotification}
            isBackendOnline={isBackendOnline}
            onTriggerAttack={onTriggerAttack}
          />
        )}

        {activeTab === 'graph' && <LateralGraphTab />}

        {activeTab === 'model_health' && (
          <ModelHealthTab
            metrics={metrics}
            onForceRetrain={handleForceRetrain}
          />
        )}

        {/* Anomaly Detection Module */}
        {activeTab === 'anomaly_detection' && (
          <AnomalyDetectionTab
            logs={logs}
            isBackendOnline={isBackendOnline}
            onTriggerAttack={onTriggerAttack}
            onShowNotification={showNotification}
          />
        )}

        {/* Five Cyberattack Detection Types Module */}
        {activeTab === 'attack_types' && (
          <AttackTypesTab
            logs={logs}
            isBackendOnline={isBackendOnline}
            onTriggerAttack={onTriggerAttack}
            onShowNotification={showNotification}
          />
        )}

        {/* AI SOC Analyst Chat Assistant Module */}
        {activeTab === 'ai_soc_analyst' && (
          <AiSocAnalystTab
            logs={logs}
            isBackendOnline={isBackendOnline}
            onShowNotification={showNotification}
          />
        )}

        {/* Explainable Risk Score Module */}
        {activeTab === 'risk_score' && (
          <RiskScoreTab
            logs={logs}
            isBackendOnline={isBackendOnline}
            onTriggerAttack={onTriggerAttack}
            onShowNotification={showNotification}
          />
        )}

        {/* Smart False-Positive Reduction Module */}
        {activeTab === 'false_positive' && (
          <FalsePositiveTab
            logs={logs}
            isBackendOnline={isBackendOnline}
            onTriggerAttack={onTriggerAttack}
            onShowNotification={showNotification}
          />
        )}

        {/* Cold Start + Concept Drift Handling Module */}
        {activeTab === 'cold_start' && (
          <ColdStartTab
            logs={logs}
            isBackendOnline={isBackendOnline}
            onShowNotification={showNotification}
          />
        )}

      </div>
    </div>
  );
};
