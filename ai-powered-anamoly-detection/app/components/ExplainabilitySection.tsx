"use client";

import React, { useState } from 'react';
import { Eye, HelpCircle, ArrowRight, Activity, FileText, Check } from 'lucide-react';

interface Scenario {
  id: string;
  name: string;
  user: string;
  role: string;
  riskScore: number;
  threatType: string;
  baseScore: number;
  features: {
    name: string;
    value: string;
    points: number;
    impact: 'positive' | 'negative';
    description: string;
  }[];
}

const SAMPLE_SCENARIOS: Scenario[] = [
  {
    id: 'scen-1',
    name: 'Impossible Geo-Velocity Attack',
    user: 'Elena Rostova',
    role: 'DevOps Lead',
    riskScore: 94,
    threatType: 'IMPOSSIBLE_TRAVEL',
    baseScore: 10,
    features: [
      { name: 'Geographic Distance / Time Delta', value: '4,850 km in 6 minutes', points: 42, impact: 'positive', description: 'Calculated velocity exceeds maximum commercial flight speed by 400%' },
      { name: 'TOR Exit Relay ASN', value: 'AS200651 (Known Anonymizer)', points: 26, impact: 'positive', description: 'Source IP originates from known high-risk proxy exit node' },
      { name: 'Unregistered Hardware GUID', value: 'FP-UNK-8899X (No Prior Record)', points: 14, impact: 'positive', description: 'Device fingerprint has no historical linkage to user account' },
      { name: 'Sensitive Asset Target', value: 'HashiCorp Secrets Vault API', points: 8, impact: 'positive', description: 'Access target involves master infrastructure secrets' },
      { name: 'Trusted Department Baseline', value: 'Engineering Subnet', points: -6, impact: 'negative', description: 'Target system falls within legitimate DevOps engineering domain' }
    ]
  },
  {
    id: 'scen-2',
    name: 'Pass-The-Hash Subnet Hopping',
    user: 'Marcus Vance',
    role: 'Financial Controller',
    riskScore: 89,
    threatType: 'LATERAL_MOVEMENT',
    baseScore: 10,
    features: [
      { name: 'Role Peer Outlier Metric', value: 'Top 0.01% Role Deviation', points: 38, impact: 'positive', description: 'Finance role attempting raw SMB connections to Active Directory DC-01' },
      { name: 'Internal Subnet Hop Rate', value: '4 Subnets / 20 Seconds', points: 28, impact: 'positive', description: 'Rapid sequential traversal across VLAN boundaries' },
      { name: 'Kerberos Ticket Entropy', value: 'Replay Signature (Pass-The-Hash)', points: 15, impact: 'positive', description: 'Kerberos TGT ticket age and structure indicates hash hijacking' },
      { name: 'Standard Business Hours', value: '14:22 Local Time', points: -2, impact: 'negative', description: 'Occurred during standard business shift window' }
    ]
  },
  {
    id: 'scen-3',
    name: 'Browser TLS Canvas Spoofing',
    user: 'Chen Wei',
    role: 'Backend Developer',
    riskScore: 82,
    threatType: 'DEVICE_SPOOFING',
    baseScore: 10,
    features: [
      { name: 'Canvas & WebGL Divergence', value: 'Entropy Delta 0.94', points: 36, impact: 'positive', description: 'Rendered hardware canvas noise contradicts claimed Safari browser' },
      { name: 'TLS Client Hello JA3 Hash', value: 'JA3: e7d705a3286e... (Python)', points: 28, impact: 'positive', description: 'TLS handshake signature matches automated HTTP bot client' },
      { name: 'Header Field Order Anomaly', value: 'Non-Standard Flags', points: 12, impact: 'positive', description: 'HTTP request headers exhibit proxy interceptor ordering' },
      { name: 'Subnet Match', value: '192.168.3.15 (Corporate VPN)', points: -4, impact: 'negative', description: 'Source IP is a valid internal corporate network address' }
    ]
  }
];

export const ExplainabilitySection: React.FC = () => {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('scen-1');
  const scenario = SAMPLE_SCENARIOS.find(s => s.id === activeScenarioId) || SAMPLE_SCENARIOS[0];

  return (
    <section id="explainability" className="py-24 bg-[#050507] border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono-code text-zinc-300">
            <Eye className="w-3.5 h-3.5 text-white" />
            <span>TRANSPARENT CYBER TELEMETRY</span>
          </div>
          <h2 className="font-syne text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Explainable Risk Scoring <span className="monochrome-gradient-text">with SHAP Attribution</span>
          </h2>
          <p className="font-space text-zinc-400 text-base sm:text-lg">
            Security analysts reject &quot;black box&quot; AI recommendations. Benzene provides line-by-line mathematical feature attribution for every alert, so SOC teams understand exactly why a risk score was assigned.
          </p>
        </div>

        {/* Scenario Switcher */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {SAMPLE_SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveScenarioId(s.id)}
              className={`px-5 py-2.5 rounded-xl font-space font-medium text-xs transition-all flex items-center gap-2 cursor-pointer border ${
                s.id === activeScenarioId
                  ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)] font-bold'
                  : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
            >
              <span>{s.name}</span>
              <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono-code font-bold">
                {s.riskScore}
              </span>
            </button>
          ))}
        </div>

        {/* Main XAI Waterfall Showcase Panel */}
        <div className="glass-panel rounded-3xl border border-zinc-800 p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Overview Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/90 space-y-4">
                <div className="flex justify-between items-center text-xs font-mono-code text-zinc-400">
                  <span>TARGET USER</span>
                  <span className="text-white font-bold">{scenario.user}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono-code text-zinc-400">
                  <span>USER ROLE</span>
                  <span>{scenario.role}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono-code text-zinc-400">
                  <span>THREAT CLASSIFICATION</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-white font-bold">
                    {scenario.threatType}
                  </span>
                </div>
                
                {/* Gauge Score */}
                <div className="pt-4 border-t border-zinc-800 text-center">
                  <div className="text-[11px] font-mono-code text-zinc-400 uppercase tracking-wider">
                    CALCULATED ANOMALY RISK SCORE
                  </div>
                  <div className="font-syne text-5xl font-extrabold text-white mt-1">
                    {scenario.riskScore}
                    <span className="text-xl text-zinc-500 font-normal"> / 100</span>
                  </div>
                  <p className="text-xs font-space text-zinc-400 mt-2">
                    Base Model Prior ({scenario.baseScore}) + SHAP Increments (+{scenario.riskScore - scenario.baseScore})
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs font-space text-zinc-400 space-y-2">
                <div className="font-bold text-white font-mono-code flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-white" />
                  HOW SHAP VALUES WORK:
                </div>
                <p>
                  SHAP (SHapley Additive exPlanations) calculates game-theoretic marginal contributions for each feature in the input vector against the user&apos;s baseline probability distribution.
                </p>
              </div>
            </div>

            {/* Right Feature Waterfall Breakdown */}
            <div className="lg:col-span-8 bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h4 className="font-mono-code text-xs text-white font-bold uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-white" />
                  Additive SHAP Feature Contribution Waterfall
                </h4>
                <span className="text-[10px] font-mono-code text-zinc-400">
                  BASE PRIOR: {scenario.baseScore} POINTS
                </span>
              </div>

              {/* Waterfall List */}
              <div className="space-y-4">
                {scenario.features.map((feat, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800/90 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono-code">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{feat.name}</span>
                        <span className="text-zinc-500 font-mono-code text-[11px]">({feat.value})</span>
                      </div>

                      <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        feat.impact === 'positive' 
                          ? 'bg-zinc-800 text-white border border-zinc-600' 
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                      }`}>
                        {feat.impact === 'positive' ? `+${feat.points} Risk` : `${feat.points} Baseline`}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 font-space">{feat.description}</p>

                    {/* Progress representation */}
                    <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${feat.impact === 'positive' ? 'bg-white' : 'bg-zinc-600'}`}
                        style={{ width: `${Math.abs(feat.points) * 2}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono-code text-zinc-400">
                <span>SOC RECOMMENDED PLAYBOOK:</span>
                <span className="text-white font-bold bg-zinc-900 px-3 py-1 rounded border border-zinc-700">
                  MFA CHALLENGE & REVOKE SESSION TOKEN
                </span>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
