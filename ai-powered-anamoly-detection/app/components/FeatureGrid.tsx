"use client";

import React, { useState } from 'react';
import { KeyRound, ShieldAlert, Network, Compass, Fingerprint, ChevronRight, CheckCircle2, Cpu, BarChart3 } from 'lucide-react';
import { AttackType } from '../types/benzene';

interface FeatureItem {
  id: AttackType;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  description: string;
  behavioralSignals: string[];
  detectionMechanism: string;
  shapExample: { name: string; impact: string }[];
}

const THREAT_FEATURES: FeatureItem[] = [
  {
    id: 'CREDENTIAL_MISUSE',
    title: 'Credential Misuse Detection',
    subtitle: 'Stolen Session Tokens & Off-Hours Privilege Exploitation',
    icon: KeyRound,
    badge: 'ZERO-TRUST ANOMALY',
    description: 'Valid credentials can bypass traditional firewall rules. Benzene profiles user working hours, historical API access patterns, and resource sensitivity to identify compromised accounts.',
    behavioralSignals: [
      'Access initiated outside 90-day user working time histogram',
      'Unusual session token age replay from foreign ISP subnets',
      'Sudden query spikes into high-privilege engineering vaults by non-technical roles'
    ],
    detectionMechanism: 'Variational Autoencoder (VAE) reconstruction error spikes on session context vectors.',
    shapExample: [
      { name: 'Time Envelope Delta', impact: '+38% Risk' },
      { name: 'Resource Sensitivity', impact: '+31% Risk' },
      { name: 'Token Age Replay', impact: '+18% Risk' }
    ]
  },
  {
    id: 'BRUTE_FORCE',
    title: 'Brute-Force & Password Spraying',
    subtitle: 'Distributed Multi-Vector Authentication Bursts',
    icon: ShieldAlert,
    badge: 'HIGH VELOCITY THREAT',
    description: 'Attackers rotate residential proxies to evade IP rate limits. Benzene monitors aggregate multi-tenant authentication entropy, timing distributions, and client TLS hello signatures.',
    behavioralSignals: [
      'Distributed sub-second failed logins across 50+ proxy IP ranges',
      'Headless browser / Python urllib HTTP protocol header structure',
      'Sequential directory account enumeration targeting global admin accounts'
    ],
    detectionMechanism: 'Sliding-window Poisson distribution anomaly cutoff + TLS JA3 hash clustering.',
    shapExample: [
      { name: 'Auth Velocity Spike', impact: '+52% Risk' },
      { name: 'Botnet JA3 Cluster', impact: '+24% Risk' },
      { name: 'Proxy ASN Reputation', impact: '+16% Risk' }
    ]
  },
  {
    id: 'LATERAL_MOVEMENT',
    title: 'Lateral Movement Tracking',
    subtitle: 'Pass-the-Hash & Subnet Pivot Identification',
    icon: Network,
    badge: 'GRAPH EMBEDDING',
    description: 'Once inside a network, adversaries hop across internal hosts via Kerberos / SMB. Benzene builds dynamic graph embeddings of role peer groups to flag unprecedented node connections.',
    behavioralSignals: [
      'Workstation initiating raw RDP / WinRM connections to domain controllers',
      'Abnormal Kerberos ticket request frequency across internal VLAN boundaries',
      'User traversing 4 internal subnets in under 30 seconds'
    ],
    detectionMechanism: 'Graph Neural Network (GNN) peer group node edge prediction confidence delta.',
    shapExample: [
      { name: 'Role Peer Outlier', impact: '+44% Risk' },
      { name: 'Subnet Hop Rate', impact: '+30% Risk' },
      { name: 'Kerberos Ticket Entropy', impact: '+12% Risk' }
    ]
  },
  {
    id: 'IMPOSSIBLE_TRAVEL',
    title: 'Impossible Travel Analytics',
    subtitle: 'Physical Geo-Velocity Delta Exceeded',
    icon: Compass,
    badge: 'GEO-VELOCITY ENGINE',
    description: 'Compares geographic coordinates between consecutive logins against realistic physical maximum transport speeds (> 900 km/h), catching TOR exit nodes and proxy drops.',
    behavioralSignals: [
      'Login from San Francisco followed 6 minutes later by login from Frankfurt',
      'Calculated velocity delta exceeding Mach 4 (4,850 km/h)',
      'Simultaneous active session states bound to disparate ISP Autonomous Systems'
    ],
    detectionMechanism: 'Haversine spherical distance over time delta with ISP latency buffering.',
    shapExample: [
      { name: 'Spherical Distance Delta', impact: '+46% Risk' },
      { name: 'TOR Exit ASN Match', impact: '+28% Risk' },
      { name: 'Unregistered Device Hash', impact: '+14% Risk' }
    ]
  },
  {
    id: 'DEVICE_SPOOFING',
    title: 'Device & Browser Spoofing',
    subtitle: 'Header Forgery & Hardware Fingerprint Mismatch',
    icon: Fingerprint,
    badge: 'HARDWARE VERIFICATION',
    description: 'Attackers spoof User-Agent strings to mimic employee laptops. Benzene cross-examines client JS canvas noise, WebGL renderer strings, and TCP window scaling.',
    behavioralSignals: [
      'Claimed macOS Safari browser submitting NVIDIA Windows WebGL render strings',
      'Non-standard HTTP/2 header field ordering characteristic of proxy tools',
      'Canvas fingerprint entropy divergence from baseline user hardware'
    ],
    detectionMechanism: 'Isolation Forest feature split on low-level OS canvas and network stack fingerprints.',
    shapExample: [
      { name: 'WebGL Entropy Mismatch', impact: '+42% Risk' },
      { name: 'TLS JA3 Signature', impact: '+33% Risk' },
      { name: 'Header Field Order Delta', impact: '+15% Risk' }
    ]
  }
];

export const FeatureGrid: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<AttackType>('CREDENTIAL_MISUSE');
  const activeItem = THREAT_FEATURES.find(f => f.id === selectedFeature) || THREAT_FEATURES[0];

  return (
    <section id="features" className="py-24 bg-[#050507] border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono-code text-zinc-300">
            <Cpu className="w-3.5 h-3.5 text-white" />
            <span>REAL-TIME THREAT CLASSIFICATION</span>
          </div>
          <h2 className="font-syne text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Five Pillars of <span className="monochrome-gradient-text">Behavioral Threat Intelligence</span>
          </h2>
          <p className="font-space text-zinc-400 text-base sm:text-lg">
            Instead of relying on static signature feeds that fail against zero-day exploits, Benzene builds continuous multi-dimensional profiles to flag subtle behavioral drift.
          </p>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-5 mb-14">
          {THREAT_FEATURES.map((item) => {
            const Icon = item.icon;
            const isSelected = item.id === selectedFeature;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedFeature(item.id)}
                className={`px-5 py-3 rounded-xl font-space font-medium text-sm transition-all duration-200 flex items-center gap-2.5 cursor-pointer border ${
                  isSelected 
                    ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] font-semibold scale-105' 
                    : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-black' : 'text-zinc-400'}`} />
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>

        {/* Feature Detail Showcase Card */}
        <div className="glass-panel rounded-3xl border border-zinc-800 p-6 sm:p-10 transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Description Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded bg-zinc-800 border border-zinc-700 text-[11px] font-mono-code font-bold text-white uppercase tracking-wider">
                  {activeItem.badge}
                </span>
                <span className="text-xs font-mono-code text-zinc-400">
                  CLASSIFIER: ZERO-SIGNATURE ENSEMBLE
                </span>
              </div>

              <div>
                <h3 className="font-syne text-2xl sm:text-3xl font-extrabold text-white">
                  {activeItem.title}
                </h3>
                <p className="font-space text-zinc-400 text-sm mt-1 font-medium">
                  {activeItem.subtitle}
                </p>
              </div>

              <p className="font-space text-zinc-300 text-base leading-relaxed">
                {activeItem.description}
              </p>

            </div>

            {/* Right Interactive SHAP Breakdown Preview */}
            <div className="lg:col-span-5 bg-zinc-950 p-6 rounded-2xl border border-zinc-800/90 space-y-6">
              
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-white" />
                  <span className="font-mono-code text-xs text-white font-bold uppercase tracking-wider">
                    SHAP Feature Contribution
                  </span>
                </div>
                <span className="text-[10px] font-mono-code text-zinc-400">BENZENE XAI</span>
              </div>

              <div className="space-y-4">
                {activeItem.shapExample.map((feat, idx) => (
                  <div key={idx} className="space-y-1.5 font-mono-code text-xs">
                    <div className="flex justify-between text-zinc-300">
                      <span>{feat.name}</span>
                      <span className="font-bold text-white">{feat.impact}</span>
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-zinc-400 to-white rounded-full transition-all duration-700"
                        style={{ width: feat.impact.replace(/[^0-9]/g, '') + '%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono-code text-zinc-400">
                <span>MODEL CONFIDENCE: 98.6%</span>
                <span className="text-white font-semibold">ACTION: TRIGGER STEP-UP MFA</span>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
