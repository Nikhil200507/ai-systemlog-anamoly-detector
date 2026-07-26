"use client";

import React from 'react';

export const LateralGraphTab: React.FC = () => {
  return (
    <div className="glass-panel rounded-3xl border border-zinc-800 p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <span className="text-xs font-mono-code text-zinc-400 font-bold uppercase tracking-wider">
            GRAPH EMBEDDING RECONSTRUCTION
          </span>
          <h3 className="font-syne text-2xl font-bold text-white mt-1">
            Lateral Movement Network Traversal Graph
          </h3>
          <p className="text-xs font-space text-zinc-400 mt-1">
            Visual map of compromised user identity pivoting across internal workstations, jump boxes, and production domain controllers.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono-code">
          <span className="flex items-center gap-1 text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" /> Compromised Node
          </span>
          <span className="flex items-center gap-1 text-zinc-400">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" /> Internal Host
          </span>
        </div>
      </div>

      {/* Visual SVG Network Topology Canvas */}
      <div className="w-full h-[450px] bg-zinc-950 rounded-2xl border border-zinc-800 relative overflow-hidden flex items-center justify-center">
        
        <svg className="w-full h-full" viewBox="0 0 800 400">
          {/* Connecting Edges */}
          <line x1="120" y1="200" x2="300" y2="120" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 2" />
          <line x1="300" y1="120" x2="520" y2="120" stroke="#ffffff" strokeWidth="2.5" />
          <line x1="300" y1="120" x2="520" y2="280" stroke="#ffffff" strokeWidth="2.5" />
          <line x1="120" y1="320" x2="300" y2="320" stroke="#3f3f46" strokeWidth="1.5" />

          {/* Nodes */}
          {/* Node A: Compromised Dev Workstation */}
          <g transform="translate(120, 200)">
            <circle r="26" fill="#0d0d12" stroke="#ffffff" strokeWidth="2" />
            <circle r="8" fill="#ffffff" className="animate-ping" />
            <circle r="6" fill="#ffffff" />
            <text x="0" y="42" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
              Dev-Laptop-04
            </text>
            <text x="0" y="56" textAnchor="middle" fill="#a1a1aa" fontSize="9" fontFamily="JetBrains Mono">
              10.240.1.10 (Origin)
            </text>
          </g>

          {/* Node B: Pivoted Jumpbox */}
          <g transform="translate(300, 120)">
            <circle r="28" fill="#0d0d12" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">
              RDP
            </text>
            <text x="0" y="44" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
              Internal-Jump-01
            </text>
            <text x="0" y="58" textAnchor="middle" fill="#a1a1aa" fontSize="9" fontFamily="JetBrains Mono">
              10.240.4.18 (Pivot)
            </text>
          </g>

          {/* Node C: Active Directory DC-01 */}
          <g transform="translate(520, 120)">
            <circle r="30" fill="#ffffff" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#000000" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
              TARGET
            </text>
            <text x="0" y="46" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
              Domain Controller DC-01
            </text>
            <text x="0" y="60" textAnchor="middle" fill="#a1a1aa" fontSize="9" fontFamily="JetBrains Mono">
              10.240.12.99 (Kerberos)
            </text>
          </g>

          {/* Node D: Financial DB Cluster */}
          <g transform="translate(520, 280)">
            <circle r="26" fill="#0d0d12" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono">
              DB
            </text>
            <text x="0" y="42" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
              PostgreSQL Master
            </text>
            <text x="0" y="56" textAnchor="middle" fill="#a1a1aa" fontSize="9" fontFamily="JetBrains Mono">
              10.240.20.05 (Vault)
            </text>
          </g>

          {/* Node E: Normal Baseline Workstation */}
          <g transform="translate(120, 320)">
            <circle r="20" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
            <text x="0" y="34" textAnchor="middle" fill="#71717a" fontSize="10" fontFamily="JetBrains Mono">
              HR-Laptop-02 (Normal)
            </text>
          </g>
        </svg>

        {/* Overlay Callout */}
        <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono-code text-zinc-300">
          <span className="text-white font-bold">GNN PATH RISK SCORE: 89/100</span> &bull; 3 Subnet Pivots in 20s
        </div>
      </div>

    </div>
  );
};
