"use client";

import React from 'react';
import { 
  Terminal, Brain, ShieldAlert, Layers, HelpCircle, CheckCircle, 
  RefreshCcw, LayoutDashboard, User, Shield, Clock, ArrowRight, Bot
} from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  status: 'ACTIVE' | 'STUB';
  statusText: string;
  icon: React.ReactNode;
  colorClass: string;
  onClick?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  status, 
  statusText, 
  icon, 
  colorClass,
  onClick 
}) => {
  const isActive = status === 'ACTIVE';

  return (
    <div 
      onClick={onClick}
      className="glass-panel p-6 border rounded-2xl transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-full border-zinc-800 hover:border-zinc-500 hover:-translate-y-1 cursor-pointer bg-zinc-900/40"
    >
      {/* Corner decorative light element */}
      <span className={`absolute top-0 right-0 w-24 h-24 rounded-full filter blur-3xl opacity-10 transition-all group-hover:opacity-20 ${colorClass}`} />
      
      <div>
        {/* Header (Icon + Status Indicator) */}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl border bg-zinc-900 shadow-md transition-transform group-hover:scale-105 ${
            isActive ? 'border-zinc-700 text-white' : 'border-zinc-800/80 text-zinc-600'
          }`}>
            {icon}
          </div>
          
          <span className={`px-2 py-0.5 rounded text-[9px] font-mono-code font-extrabold uppercase tracking-wider border ${
            isActive 
              ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-400' 
              : 'bg-zinc-900/90 border-zinc-800 text-zinc-500'
          }`}>
            {statusText}
          </span>
        </div>

        {/* Feature Title */}
        <h4 className="font-syne text-lg font-bold text-white mb-2 group-hover:text-zinc-200 transition-colors">
          {title}
        </h4>

        {/* Description */}
        <p className="text-xs text-zinc-400 font-space leading-relaxed mb-4">
          {description}
        </p>
      </div>

      {/* Footer / Interaction Link */}
      <div className="flex items-center gap-1.5 text-[11px] font-mono-code font-bold text-zinc-400 group-hover:text-white transition-colors mt-auto pt-2">
        <span>Access Module</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
};

interface ConsoleOverviewTabProps {
  user: any;
  onTabChange: (tab: 'triage' | 'stream' | 'graph' | 'model_health' | 'anomaly_detection' | 'attack_types' | 'classification' | 'risk_score' | 'false_positive' | 'cold_start' | 'realtime_dashboard' | 'ai_soc_analyst') => void;
  activeAnomalyCount: number;
}

export const ConsoleOverviewTab: React.FC<ConsoleOverviewTabProps> = ({ 
  user, 
  onTabChange,
  activeAnomalyCount
}) => {
  const operatorName = user?.name || user?.email?.split('@')[0] || 'Operator';
  const operatorEmail = user?.email || 'N/A';
  const currentTimeString = new Date().toLocaleDateString(undefined, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const features = [
    {
      title: "Synthetic Security Log Generator",
      description: "Generates high-fidelity user access logs and network packet signatures to simulate multi-stage attack scenarios.",
      status: "ACTIVE" as const,
      statusText: "ACTIVE",
      icon: <Terminal className="w-5 h-5" />,
      colorClass: "bg-cyan-500",
      onClick: () => onTabChange('stream')
    },
    {
      title: "Behavioral Anomaly Detection",
      description: "Uses deep autoencoders (VAE) and isolation forests to continuously learn normal user behavioral baselines.",
      status: "ACTIVE" as const,
      statusText: "ACTIVE",
      icon: <Brain className="w-5 h-5" />,
      colorClass: "bg-purple-500",
      onClick: () => onTabChange('anomaly_detection')
    },
    {
      title: "Five Cyberattack Detection Types",
      description: "Real-time threat evaluation modules for credential misuse, brute force, lateral movement, impossible travel, and device spoofing.",
      status: "ACTIVE" as const,
      statusText: "ACTIVE",
      icon: <ShieldAlert className="w-5 h-5" />,
      colorClass: "bg-red-500",
      onClick: () => onTabChange('attack_types')
    },
    {
      title: "AI SOC Analyst Chat",
      description: "Interactive AI co-pilot powered by Gemini Flash that retrieves live SQLite database telemetry to explain anomalies, investigate users, and recommend triage actions.",
      status: "ACTIVE" as const,
      statusText: "ACTIVE",
      icon: <Bot className="w-5 h-5 text-cyan-400" />,
      colorClass: "bg-cyan-500",
      onClick: () => onTabChange('ai_soc_analyst')
    },
    {
      title: "Explainable Risk Score",
      description: "Integrates SHAP value attribution graphs to explain why a user's risk rating spiked and identify high-contribution factors.",
      status: "ACTIVE" as const,
      statusText: "ACTIVE",
      icon: <HelpCircle className="w-5 h-5" />,
      colorClass: "bg-indigo-500",
      onClick: () => onTabChange('risk_score')
    },
    {
      title: "Smart False-Positive Reduction",
      description: "Refines alerts using analyst feedback and machine learning feedback loops to scale down alerts on approved baseline adjustments.",
      status: "ACTIVE" as const,
      statusText: "ACTIVE",
      icon: <CheckCircle className="w-5 h-5" />,
      colorClass: "bg-emerald-500",
      onClick: () => onTabChange('false_positive')
    },
    {
      title: "Cold Start + Concept Drift Handling",
      description: "Adapts to user workflow changes (drift) and bootstraps new user profiles (cold start) with dynamic training loops.",
      status: "ACTIVE" as const,
      statusText: "ACTIVE",
      icon: <RefreshCcw className="w-5 h-5" />,
      colorClass: "bg-blue-500",
      onClick: () => onTabChange('cold_start')
    },
    {
      title: "Real-Time Analyst Dashboard",
      description: "Premium Security Operations Center interface equipped with live log flows, WebSockets, threat analytics, and interactive deep investigation drawer.",
      status: "ACTIVE" as const,
      statusText: "ACTIVE",
      icon: <LayoutDashboard className="w-5 h-5 text-cyan-400" />,
      colorClass: "bg-cyan-500",
      onClick: () => onTabChange('realtime_dashboard')
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Dynamic Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-[#0c0c11] via-[#07070b] to-[#040407] p-8 md:p-10 shadow-2xl">
        <span className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-zinc-800/20 filter blur-3xl" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono-code text-zinc-400 font-bold uppercase tracking-widest">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Security Access Portal</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-syne font-extrabold text-white tracking-tight leading-tight">
              Welcome back, Operator <span className="text-zinc-300 font-syne font-bold">{operatorName}</span>
            </h2>
            
            <p className="text-xs md:text-sm text-zinc-400 max-w-2xl font-space leading-relaxed">
              Benzene Zero-Signature UEBA core is actively auditing the network telemetry stream. 
              {activeAnomalyCount > 0 
                ? ` There are currently ${activeAnomalyCount} active security incidents requiring immediate triaging.`
                : " All ingestion lines are healthy and nominal."
              }
            </p>
          </div>

          {/* User Meta Card */}
          <div className="shrink-0 p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/85 font-mono-code text-xs space-y-3 min-w-[220px]">
            <div className="flex items-center justify-between text-zinc-500">
              <span>OPERATOR EMAIL:</span>
            </div>
            <div className="font-semibold text-white truncate max-w-[200px]" title={operatorEmail}>
              {operatorEmail}
            </div>
            <div className="border-t border-zinc-900 pt-2.5 space-y-2">
              <div className="flex items-center justify-between text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{currentTimeString}</span>
                </div>
              </div>

              <button
                onClick={() => onTabChange('realtime_dashboard')}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-cyan-950 border border-cyan-600 hover:bg-cyan-900 text-cyan-200 font-mono-code text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-cyan-950/40"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                <span>Real-Time SOC Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Header */}
      <div>
        <h3 className="font-syne text-xl font-bold text-white">
          System Core Operations & Modules
        </h3>
        <p className="text-xs text-zinc-500 font-space mt-1">
          Select an active component to deploy telemetry or triage incident nodes. Pending modules will be integrated incrementally.
        </p>
      </div>

      {/* 8 Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feat, idx) => (
          <FeatureCard
            key={idx}
            title={feat.title}
            description={feat.description}
            status={feat.status}
            statusText={feat.statusText}
            icon={feat.icon}
            colorClass={feat.colorClass}
            onClick={feat.onClick}
          />
        ))}
      </div>

    </div>
  );
};
