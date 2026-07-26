"use client";

import React from 'react';
import { RefreshCcw } from 'lucide-react';
import { ModelMetrics } from '../../types/benzene';

interface ModelHealthTabProps {
  metrics: ModelMetrics;
  onForceRetrain: () => void;
}

export const ModelHealthTab: React.FC<ModelHealthTabProps> = ({ metrics, onForceRetrain }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <div className="lg:col-span-8 glass-panel rounded-3xl border border-zinc-800 p-8 space-y-6">
        <div>
          <span className="text-xs font-mono-code text-zinc-400 font-bold uppercase tracking-wider">
            CONTINUOUS LEARNING PIPELINE
          </span>
          <h3 className="font-syne text-2xl font-bold text-white mt-1">
            Model Health & Baseline Drift Monitor
          </h3>
          <p className="text-xs font-space text-zinc-400 mt-1">
            Benzene continuously calculates distribution distances across user activity vectors to adapt to natural workflow changes without false alarm surges.
          </p>
        </div>

        {/* Drift Status Card */}
        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 font-mono-code text-xs">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="font-bold text-white uppercase">PAGE-HINKLEY DRIFT DETECTOR</span>
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-white text-[10px]">
              STATUS: {metrics.modelStatus}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-zinc-300">
              <span>Wasserstein Probability Distance (W1):</span>
              <span className="font-bold text-white">{metrics.driftScore}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500" 
                style={{ width: `${metrics.driftScore * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-zinc-500">
              <span>Baseline (0.00)</span>
              <span>Retrain Cutoff Threshold (0.75)</span>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 text-zinc-400 text-[11px] space-y-1">
            <div>LAST RETRAINED: <span className="text-white">{metrics.lastRetrained}</span></div>
            <div>CLASS IMBALANCE RATIO: <span className="text-white">{metrics.classImbalanceRatio}</span></div>
            <div>COLD-START ACCOUNTS BOOTSTRAPPED: <span className="text-white">{metrics.coldStartResolvedCount} Users</span></div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={onForceRetrain}
            className="px-6 py-3 rounded-xl bg-white text-black font-mono-code font-bold text-xs hover:bg-zinc-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCcw className="w-4 h-4 text-black" />
            <span>Execute Asynchronous Retraining Pipeline</span>
          </button>
        </div>
      </div>

      {/* Model Architecture Specs */}
      <div className="lg:col-span-4 bg-zinc-950 rounded-3xl border border-zinc-800 p-6 space-y-5 font-mono-code text-xs">
        <div className="font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-3">
          ENSEMBLE MODEL SPECIFICATIONS
        </div>

        <div className="space-y-3 text-zinc-400">
          <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
            <div className="text-white font-bold">1. Variational Autoencoder (VAE)</div>
            <div className="text-[11px] text-zinc-400 font-space">Reconstruction loss on 32-dim user session embeddings.</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
            <div className="text-white font-bold">2. Isolation Forest Ensemble</div>
            <div className="text-[11px] text-zinc-400 font-space">Tree depth anomaly partitioning for low-latency scoring.</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
            <div className="text-white font-bold">3. SHAP Game-Theoretic XAI</div>
            <div className="text-[11px] text-zinc-400 font-space">Provides marginal feature attribution for every alert.</div>
          </div>
        </div>
      </div>

    </div>
  );
};
