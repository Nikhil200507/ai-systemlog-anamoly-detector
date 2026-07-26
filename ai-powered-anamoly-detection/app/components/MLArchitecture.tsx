"use client";

import React, { useState } from 'react';
import { Layers, RefreshCcw, UserPlus, SlidersHorizontal, ArrowUpRight, Cpu, Activity } from 'lucide-react';

export const MLArchitecture: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'imbalance' | 'drift' | 'coldstart'>('imbalance');

  return (
    <section id="ml-architecture" className="py-24 bg-[#09090e] border-b border-zinc-800/80 grid-line-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono-code text-zinc-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
            <span>ROBUSTNESS & MATHEMATICAL FOUNDATIONS</span>
          </div>
          <h2 className="font-syne text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Solving the Hardest <span className="monochrome-gradient-text">Cyber ML Bottlenecks</span>
          </h2>
          <p className="font-space text-zinc-400 text-base sm:text-lg">
            Standard ML models collapse when deployed on enterprise telemetry. Benzene incorporates specialized algorithmic safeguards against extreme imbalance, dynamic behavior changes, and zero-history entities.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab('imbalance')}
            className={`px-6 py-3.5 rounded-xl font-space font-semibold text-sm transition-all flex items-center gap-3 cursor-pointer border ${
              activeTab === 'imbalance'
                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.25)]'
                : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Class Imbalance (1 : 14,200)</span>
          </button>

          <button
            onClick={() => setActiveTab('drift')}
            className={`px-6 py-3.5 rounded-xl font-space font-semibold text-sm transition-all flex items-center gap-3 cursor-pointer border ${
              activeTab === 'drift'
                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.25)]'
                : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
            }`}
          >
            <RefreshCcw className="w-4 h-4" />
            <span>2. Concept Drift Adaptation</span>
          </button>

          <button
            onClick={() => setActiveTab('coldstart')}
            className={`px-6 py-3.5 rounded-xl font-space font-semibold text-sm transition-all flex items-center gap-3 cursor-pointer border ${
              activeTab === 'coldstart'
                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.25)]'
                : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>3. Cold-Start Profiling</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="glass-panel rounded-3xl border border-zinc-800 p-8 sm:p-12">
          
          {/* TAB 1: Class Imbalance */}
          {activeTab === 'imbalance' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-block px-3 py-1 rounded bg-zinc-800 border border-zinc-700 text-xs font-mono-code text-zinc-300">
                  PROBLEM: 99.99% NORMAL LOGS vs 0.01% THREATS
                </div>
                <h3 className="font-syne text-3xl font-extrabold text-white">
                  Focal Loss & Dynamic Quantile Oversampling
                </h3>
                <p className="font-space text-zinc-300 text-base leading-relaxed">
                  Standard machine learning classifiers trained on security logs suffer from extreme class imbalance: 99.99% of logs represent legitimate user activity. Naive models achieve 99.99% accuracy by simply predicting &quot;Normal&quot; for every event, completely missing true cyber attacks.
                </p>
                <div className="space-y-3 font-space text-sm text-zinc-400">
                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
                    <span className="font-mono-code font-bold text-white shrink-0">SOL 1:</span>
                    <span><strong className="text-white">SMOTE-Cyber Oversampling:</strong> Generates synthetic minority attack feature vectors in feature space based on nearest-neighbor graph interpolation.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
                    <span className="font-mono-code font-bold text-white shrink-0">SOL 2:</span>
                    <span><strong className="text-white">Focal Loss Objective Function:</strong> Suppresses loss contribution from easily classified normal logs, forcing neural layers to focus on hard boundary anomalies.</span>
                  </div>
                </div>
              </div>

              {/* Optimization Visualization Card */}
              <div className="lg:col-span-5 bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-4 font-mono-code text-xs">
                <div className="text-zinc-400 font-bold uppercase tracking-wider">FOCAL LOSS OPTIMIZATION</div>
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center font-mono-code text-sm text-white font-bold">
                  Hard-Example Weighted Loss Function
                </div>
                <div className="space-y-2 text-zinc-400 text-[11px]">
                  <div className="flex justify-between">
                    <span>Modulating Factor (Gamma):</span>
                    <span className="text-white font-bold">2.0 (Hard Example Focus)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Alpha Imbalance Weight (Alpha):</span>
                    <span className="text-white font-bold">0.99 (Minority Penalty)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Quantile Threshold:</span>
                    <span className="text-white font-bold">99.9th Percentile</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-zinc-800 text-zinc-500 text-[10px]">
                  Result: Zero missed true positive cyber threats even at 1 : 14,200 log imbalance ratios.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Concept Drift */}
          {activeTab === 'drift' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-block px-3 py-1 rounded bg-zinc-800 border border-zinc-700 text-xs font-mono-code text-zinc-300">
                  PROBLEM: EVOLVING USER WORKFLOWS & FALSE POSITIVES
                </div>
                <h3 className="font-syne text-3xl font-extrabold text-white">
                  Continuous Sliding-Window Drift Adaptation
                </h3>
                <p className="font-space text-zinc-300 text-base leading-relaxed">
                  User behaviors shift over time—employees switch shifts, engineering teams migrate cloud regions, and remote work travel occurs. Static ML baselines quickly cause massive false positive storms. Benzene dynamically updates behavior baselines without losing threat memory.
                </p>
                <div className="space-y-3 font-space text-sm text-zinc-400">
                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
                    <span className="font-mono-code font-bold text-white shrink-0">SOL 1:</span>
                    <span><strong className="text-white">Page-Hinkley Test & Wasserstein Metric:</strong> Continuously measures probability distribution distance W₁(&#80;ₜ, &#80;ₜ₋₁) across sliding 7-day windows.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
                    <span className="font-mono-code font-bold text-white shrink-0">SOL 2:</span>
                    <span><strong className="text-white">Automated Micro-Retraining:</strong> When drift index exceeds 0.75, Benzene initiates asynchronous background model retraining without stopping active log ingestion.</span>
                  </div>
                </div>
              </div>

              {/* Drift Monitor Card */}
              <div className="lg:col-span-5 bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-4 font-mono-code text-xs">
                <div className="flex justify-between items-center text-zinc-400 font-bold uppercase tracking-wider">
                  <span>DRIFT METRIC MONITOR</span>
                  <span className="text-white font-normal text-[10px]">REAL-TIME</span>
                </div>
                
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                  <div className="flex justify-between text-zinc-300">
                    <span>Wasserstein Drift Distance:</span>
                    <span className="font-bold text-white">0.12 (Nominal)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: '12%' }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-500">
                    <span>Threshold: 0.75</span>
                    <span>Status: Baseline Stable</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/50 text-[11px] text-zinc-400 space-y-1">
                  <div className="text-white font-bold">Sliding Window: 7 Days (100k events)</div>
                  <div>Adaptive Learning Rate: &eta; = 0.001 &times; (1 + Drift Score)</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Cold-Start */}
          {activeTab === 'coldstart' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-block px-3 py-1 rounded bg-zinc-800 border border-zinc-700 text-xs font-mono-code text-zinc-300">
                  PROBLEM: NEW EMPLOYEES & ZERO-HISTORY DEVIATION
                </div>
                <h3 className="font-syne text-3xl font-extrabold text-white">
                  Peer-Group Bayesian Prior Bootstrap
                </h3>
                <p className="font-space text-zinc-300 text-base leading-relaxed">
                  When a new user joins an organization or a new microservice is spawned, there is no historical access log baseline. Naive anomaly engines either ignore these accounts or trigger immediate false alarms. Benzene solves cold start using hierarchical Bayesian transfer learning.
                </p>
                <div className="space-y-3 font-space text-sm text-zinc-400">
                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
                    <span className="font-mono-code font-bold text-white shrink-0">SOL 1:</span>
                    <span><strong className="text-white">Role & Department Peer Clustering:</strong> New accounts automatically inherit prior probability distributions P(&theta; | Peer Group Role) from established peer clusters.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
                    <span className="font-mono-code font-bold text-white shrink-0">SOL 2:</span>
                    <span><strong className="text-white">Rapid 24h Variance Annealing:</strong> As new logs arrive, weight dynamically shifts from the peer group prior to the individual user profile over a 24-hour window.</span>
                  </div>
                </div>
              </div>

              {/* Prior Weight Curve Card */}
              <div className="lg:col-span-5 bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-4 font-mono-code text-xs">
                <div className="text-zinc-400 font-bold uppercase tracking-wider">BAYESIAN PRIOR TRANSFER</div>
                
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                  <div className="flex justify-between text-zinc-300">
                    <span>Hour 00:00 (Initial):</span>
                    <span className="font-bold text-white">100% Peer Prior</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>Hour 12:00 (Warm):</span>
                    <span className="font-bold text-white">50% Peer / 50% Self</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>Hour 24:00+ (Trained):</span>
                    <span className="font-bold text-white">10% Peer / 90% Self</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-[11px] text-zinc-400">
                  <span className="text-white font-bold">Result: </span>
                  Zero false positive spike on day-one employee onboarding while maintaining full threat detection sensitivity.
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
