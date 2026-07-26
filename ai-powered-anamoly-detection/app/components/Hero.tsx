"use client";

import React from 'react';
import { ShieldCheck, Zap, Activity, ArrowRight, Eye, AlertTriangle, Play, Database, Cpu, Layers } from 'lucide-react';
import { AccessLog } from '../types/benzene';

interface HeroProps {
  onLaunchDashboard: () => void;
  onRunSimulation: () => void;
  recentAnomalies: AccessLog[];
}

export const Hero: React.FC<HeroProps> = ({ onLaunchDashboard, onRunSimulation, recentAnomalies }) => {
  return (
    <section className="relative pt-12 pb-24 overflow-hidden grid-bg-pattern border-b border-zinc-800/60">
      
      {/* Background Ambient Monochrome Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-zinc-700/10 via-white/10 to-zinc-700/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-12 left-10 w-72 h-72 bg-white/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Announcement Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full monochrome-gradient-badge text-xs font-mono-code text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="font-semibold text-white">BENZENE v4.2 RELEASED</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400">Zero-Signature UEBA & XAI Engine</span>
          </div>
        </div>

        {/* Hero Title and Subtitle */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="font-syne text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            Behavioral Anomaly Detection <br />
            <span className="monochrome-gradient-text">Devoid of Signatures</span>
          </h1>
          
          <p className="font-space text-lg sm:text-xl text-zinc-300 max-w-3xl mx-auto leading-relaxed font-light">
            Legacy security fails against unknown zero-day attacks. <strong className="text-white font-medium">Benzene</strong> replaces fragile static rules with high-dimensional AI that continuously models normal user, device, and network telemetry to pinpoint cyber threats in milliseconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={onLaunchDashboard}
              className="px-5 py-2.5 rounded-lg bg-white text-black font-space font-bold text-xs transition-all duration-300 hover:bg-zinc-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Activity className="w-4 h-4 text-black" />
              <span>Launch Live SOC Console</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </button>

            <button
              onClick={onRunSimulation}
              className="px-5 py-2.5 rounded-lg bg-zinc-900/90 border border-zinc-700 hover:border-zinc-400 text-white font-space font-medium text-xs transition-all hover:bg-zinc-800 flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-zinc-300" />
              <span>Simulate Attack Injection</span>
            </button>
          </div>
        </div>

        {/* Core System Metrics Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          
          <div className="glass-panel p-5 rounded-2xl border border-zinc-800 text-center hover:border-zinc-600 transition-all">
            <div className="font-syne text-3xl sm:text-4xl font-extrabold text-white">99.42%</div>
            <div className="font-mono-code text-xs text-zinc-400 mt-1 uppercase tracking-wider">Detection Precision</div>
            <p className="text-[11px] text-zinc-500 mt-1 font-space">Evaluated across 1.4M+ logs</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-zinc-800 text-center hover:border-zinc-600 transition-all">
            <div className="font-syne text-3xl sm:text-4xl font-extrabold text-white">&lt;0.01%</div>
            <div className="font-mono-code text-xs text-zinc-400 mt-1 uppercase tracking-wider">False Positive Rate</div>
            <p className="text-[11px] text-zinc-500 mt-1 font-space">Eliminates alert fatigue</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-zinc-800 text-center hover:border-zinc-600 transition-all">
            <div className="font-syne text-3xl sm:text-4xl font-extrabold text-white">8.4 ms</div>
            <div className="font-mono-code text-xs text-zinc-400 mt-1 uppercase tracking-wider">Inference Latency</div>
            <p className="text-[11px] text-zinc-500 mt-1 font-space">Real-time edge evaluation</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-zinc-800 text-center hover:border-zinc-600 transition-all">
            <div className="font-syne text-3xl sm:text-4xl font-extrabold text-white">100%</div>
            <div className="font-mono-code text-xs text-zinc-400 mt-1 uppercase tracking-wider">Explainable SHAP</div>
            <p className="text-[11px] text-zinc-500 mt-1 font-space">Transparent risk attribution</p>
          </div>

        </div>

      </div>
    </section>
  );
};
