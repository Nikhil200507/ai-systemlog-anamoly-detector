"use client";

import React from 'react';
import { Shield, Terminal, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigateSOC: () => void;
  metrics?: {
    precision?: number;
    falsePositiveRate?: number;
    inferenceLatencyMs?: number;
  };
}

export const Footer: React.FC<FooterProps> = ({ onNavigateSOC, metrics }) => {
  const precisionText = metrics?.precision !== undefined ? `${metrics.precision}%` : '96%';
  const fpText = metrics?.falsePositiveRate !== undefined ? `${metrics.falsePositiveRate}%` : '0.4%';
  const latencyText = metrics?.inferenceLatencyMs !== undefined ? `${metrics.inferenceLatencyMs}ms` : '6.8ms';

  return (
    <footer className="bg-[#030304] border-t border-zinc-800/80 text-zinc-400 font-space py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-zinc-800/60">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2" />
                  <circle cx="12" cy="12" r="4.5" strokeDasharray="3 2" />
                </svg>
              </div>
              <span className="font-syne text-xl font-extrabold text-white tracking-tight">
                BENZENE
              </span>
            </div>

            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed font-light">
              Next-generation AI/ML behavioral anomaly detection system replacing legacy signature feeds with continuous, explainable user and entity behavior analytics (UEBA).
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono-code text-zinc-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>BENZENE ENGINE v4.2 ONLINE</span>
              </div>
            </div>
          </div>

          {/* Core Modules Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-mono-code text-xs font-bold text-white uppercase tracking-wider">
              Detection Capabilities
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400 font-space">
              <li><a href="#features" className="hover:text-white transition-colors">Credential Misuse Engine</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Brute-Force & Spray Profiler</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Lateral Movement Graph (GNN)</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Impossible Geo-Velocity Analytics</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">TLS & Canvas Device Spoofing</a></li>
            </ul>
          </div>

          {/* ML Architecture Links */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-mono-code text-xs font-bold text-white uppercase tracking-wider">
              ML Hard Problem Safeguards
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400 font-space">
              <li><a href="#ml-architecture" className="hover:text-white transition-colors">SMOTE-Cyber Class Imbalance Oversampling</a></li>
              <li><a href="#ml-architecture" className="hover:text-white transition-colors">Page-Hinkley Concept Drift Adaptation</a></li>
              <li><a href="#ml-architecture" className="hover:text-white transition-colors">Hierarchical Bayesian Cold-Start Transfer</a></li>
              <li><a href="#explainability" className="hover:text-white transition-colors">Game-Theoretic SHAP XAI Attribution</a></li>
            </ul>

            <div className="pt-2">
              <button
                onClick={onNavigateSOC}
                className="px-4 py-2 rounded-xl bg-white text-black font-space font-bold text-xs hover:bg-zinc-200 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-black" />
                <span>Launch Security Console</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono-code text-zinc-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} Benzene Cyber AI Systems. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Precision: {precisionText}</span>
            <span>False Positives: {fpText}</span>
            <span>Latency: {latencyText}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
