"use client";

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { LiveConsoleDemo } from './components/LiveConsoleDemo';
import { FeatureGrid } from './components/FeatureGrid';
import { MLArchitecture } from './components/MLArchitecture';
import { ExplainabilitySection } from './components/ExplainabilitySection';
import { Dashboard } from './components/Dashboard';
import { Footer } from './components/Footer';
import { SignIn } from './components/SignIn';
import { SignUp } from './components/SignUp';

import { insforge } from './utils/insforge';
import { generateInitialLogs, generateInitialAlerts } from './utils/syntheticLogGenerator';
import { AccessLog, IncidentAlert } from './types/benzene';

export default function Home() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [user, setUser] = useState<any>(null);
  const [authModal, setAuthModal] = useState<'signin' | 'signup' | null>(null);

  // Initial synthetic dataset states — initialized empty to avoid SSR hydration mismatch
  // (generateInitialLogs uses Date.now() which differs between server and client)
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [alerts, setAlerts] = useState<IncidentAlert[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Backend connection states
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [alertStatuses, setAlertStatuses] = useState<Record<string, IncidentAlert['status']>>({});

  // Generate initial mock logs client-side only to prevent hydration mismatch
  useEffect(() => {
    if (!hasInitialized) {
      const initialLogs = generateInitialLogs(40);
      setLogs(initialLogs);
      setAlerts(generateInitialAlerts(initialLogs));
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  // Check user session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await insforge.auth.getCurrentUser().catch((err: any) => {
          // Gracefully handle network fetch failures when InsForge is unreachable
          return { data: null, error: err };
        });
        
        if (res?.data?.user) {
          await verifyAndSyncUser(res.data.user);
        }
      } catch (err) {
        // Suppress unhandled network error
      }
    };
    initAuth();
  }, []);

  // Sync user information to InsForge PostgreSQL "users" table
  const verifyAndSyncUser = async (authUser: any) => {
    if (!authUser) return;
    
    try {
      const { data: dbUser } = await insforge.database
        .from('users')
        .select('id')
        .eq('id', authUser.id)
        .maybeSingle();

      if (!dbUser) {
        await insforge.database
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            name: authUser.name || authUser.email.split('@')[0],
            email_verified: authUser.emailVerified || true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
      }
    } catch (err) {
      // Gracefully catch any InsForge DB network error
    } finally {
      setUser(authUser);
      setAuthModal(null);
    }
  };

  const [footerMetrics, setFooterMetrics] = useState<{
    precision: number;
    falsePositiveRate: number;
    inferenceLatencyMs: number;
  }>({
    precision: 96,
    falsePositiveRate: 0.4,
    inferenceLatencyMs: 6.8
  });

  // Poll status and live metrics from the FastAPI backend
  useEffect(() => {
    const checkBackend = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      try {
        const res = await fetch("http://localhost:8000/api/status", { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          setIsBackendOnline(true);
          setIsGenerating(data.is_generating);
        } else {
          setIsBackendOnline(false);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        setIsBackendOnline(false);
      }
    };

    const fetchFooterMetrics = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/dashboard-metrics");
        if (res.ok) {
          const data = await res.json();
          setFooterMetrics({
            precision: data.model_metrics?.precision ? Math.round(data.model_metrics.precision * 100) : 96,
            falsePositiveRate: data.overview?.false_positive_rate ?? 0.4,
            inferenceLatencyMs: data.model_metrics?.inference_latency_ms || 6.8
          });
        }
      } catch (err) {
        // Ignore fetch error
      }
    };
    
    checkBackend();
    fetchFooterMetrics();
    const interval = setInterval(() => {
      checkBackend();
      fetchFooterMetrics();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Poll backend logs dynamically if online
  useEffect(() => {
    if (!isBackendOnline) return;

    const fetchLogs = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      try {
        const res = await fetch("http://localhost:8000/api/logs?limit=40", { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const blogData = await res.json();
          
          const mappedLogs: AccessLog[] = blogData.map((blog: any) => {
            const location = blog.city ? `${blog.city}, ${blog.country}` : "Unknown";
            const riskScore = blog.anomaly_label ? 85 : 12;
            const severity = blog.anomaly_label ? "HIGH" : "INFO";
            
            return {
              id: blog.id,
              timestamp: blog.timestamp.includes("T") ? blog.timestamp.split("T")[1].substring(0, 8) : blog.timestamp,
              timeEpoch: new Date(blog.timestamp).getTime(),
              userId: blog.user_id,
              userName: blog.user_id ? `Operator ${blog.user_id.split('-')[1] || ''}` : "Unknown Operator",
              userRole: "Security Analyst",
              department: blog.department || "Engineering",
              sourceIp: blog.ip_address,
              location: location,
              targetSystem: blog.resource_accessed || "Internal Network",
              deviceFingerprint: blog.device_id || "DEV-UNKNOWN",
              deviceType: "Workstation",
              browser: blog.browser || "Chrome",
              authMethod: blog.event_type || "LOGIN",
              status: blog.login_status || "SUCCESS",
              riskScore: riskScore,
              isAnomaly: !!blog.anomaly_label,
              attackType: blog.attack_type || "NORMAL",
              severity: severity,
              shapFeatures: blog.anomaly_label ? [
                {
                  name: "Abnormal Behavior Signature",
                  value: "True",
                  contributionPercent: 75,
                  impact: "risk_increase",
                  description: `Flagged via simulated ${blog.attack_type} cyberattack sequence.`
                }
              ] : [],
              rawPayload: { ...blog }
            };
          });

          setLogs(mappedLogs);

          // Build alerts list from backend logs
          const anomalies = mappedLogs.filter(l => l.isAnomaly);
          const newAlerts: IncidentAlert[] = anomalies.map((log, index) => {
            const savedStatus = alertStatuses[log.id] || (index === 0 ? 'OPEN' : index === 1 ? 'INVESTIGATING' : 'MITIGATED');
            return {
              id: `ALT-${log.id.slice(0, 8)}`,
              title: `Behavioral Anomaly: ${log.attackType.replace('_', ' ')} (${log.userName})`,
              attackType: log.attackType as any,
              severity: log.severity as any,
              targetUser: log.userName,
              userRole: log.userRole,
              riskScore: log.riskScore,
              detectedAt: log.timestamp,
              sourceIp: log.sourceIp,
              location: log.location,
              summary: `Benzene flagged high-confidence ${log.attackType} anomaly targeting ${log.targetSystem} from ${log.location}.`,
              status: savedStatus,
              affectedAssets: [log.targetSystem, 'Auth-Gateway-01'],
              shapFeatures: log.shapFeatures,
              timeline: [
                { time: 'T-10m', event: 'Historical baseline lookup completed', anomalyScore: 10 },
                { time: 'T-00m', event: `${log.attackType} flagged by VAE + Isolation Forest`, anomalyScore: log.riskScore }
              ]
            };
          });
          setAlerts(newAlerts);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        setIsBackendOnline(false);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, [isBackendOnline, alertStatuses]);

  const handleSignOut = async () => {
    try {
      await insforge.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setUser(null);
      setCurrentView('landing');
    }
  };

  const handleAddLog = (newLog: AccessLog) => {
    setLogs(prev => [newLog, ...prev]);

    if (newLog.isAnomaly) {
      const newAlert: IncidentAlert = {
        id: `ALT-2026-${Math.floor(Math.random() * 800) + 900}`,
        title: `Behavioral Anomaly: ${newLog.attackType.replace('_', ' ')} (${newLog.userName})`,
        attackType: newLog.attackType,
        severity: newLog.severity,
        targetUser: newLog.userName,
        userRole: newLog.userRole,
        riskScore: newLog.riskScore,
        detectedAt: newLog.timestamp,
        sourceIp: newLog.sourceIp,
        location: newLog.location,
        summary: `Benzene flagged high-confidence ${newLog.attackType} anomaly targeting ${newLog.targetSystem} from ${newLog.location}.`,
        status: 'OPEN',
        affectedAssets: [newLog.targetSystem, 'Auth-Gateway-01'],
        shapFeatures: newLog.shapFeatures,
        timeline: [
          { time: 'T-10m', event: 'Historical baseline lookup completed', anomalyScore: 10 },
          { time: 'T-00m', event: `${newLog.attackType} flagged by VAE + Isolation Forest`, anomalyScore: newLog.riskScore }
        ]
      };
      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  const handleUpdateAlertStatus = (alertId: string, status: IncidentAlert['status']) => {
    const rawId = alertId.startsWith('ALT-') ? alertId.replace('ALT-', '') : alertId;
    setAlertStatuses(prev => ({ ...prev, [rawId]: status }));
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status } : a));
  };

  const handleToggleGenerator = async () => {
    if (!isBackendOnline) return;
    const endpoint = isGenerating ? "http://localhost:8000/api/stop" : "http://localhost:8000/api/start";
    try {
      const res = await fetch(endpoint, { method: "POST" });
      if (res.ok) {
        setIsGenerating(!isGenerating);
      }
    } catch (err) {
      console.error("Error toggling generator:", err);
    }
  };

  const handleTriggerAttack = async (attackType: string) => {
    if (!isBackendOnline) return;
    try {
      await fetch("http://localhost:8000/api/trigger-attack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attack_type: attackType })
      });
    } catch (err) {
      console.error("Error triggering attack:", err);
    }
  };

  const openAnomaliesCount = alerts.filter(a => a.status === 'OPEN').length;

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col">
      
      {/* Global Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeAnomalyCount={openAnomaliesCount}
        user={user}
        onSignInClick={() => setAuthModal('signin')}
        onSignOutClick={handleSignOut}
      />

      {/* Main View Switching */}
      {currentView === 'landing' ? (
        <main className="flex-1">
          {/* Hero Section */}
          <Hero
            onLaunchDashboard={() => {
              if (!user) {
                setAuthModal('signin');
              } else {
                setCurrentView('dashboard');
              }
            }}
            onRunSimulation={() => {
              const el = document.getElementById('interactive-sandbox');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            recentAnomalies={logs.filter(l => l.isAnomaly)}
          />

          {/* Interactive Real-Time Demo Sandbox directly on Landing Page */}
          <div id="interactive-sandbox">
            <LiveConsoleDemo
              onLaunchFullDashboard={() => {
                if (!user) {
                  setAuthModal('signin');
                } else {
                  setCurrentView('dashboard');
                }
              }}
              logs={logs}
              onAddLog={handleAddLog}
            />
          </div>

          {/* 5 Pillars Threat Vector Grid */}
          <FeatureGrid />

          {/* ML Hard Bottlenecks & Solutions Architecture */}
          <MLArchitecture />

          {/* Explainability XAI SHAP Attribution Section */}
          <ExplainabilitySection />
        </main>
      ) : (
        <main className="flex-1">
          {/* Full Analyst Security Operations Center Dashboard */}
          <Dashboard
            logs={logs}
            alerts={alerts}
            onAddLog={handleAddLog}
            onUpdateAlertStatus={handleUpdateAlertStatus}
            user={user}
            isBackendOnline={isBackendOnline}
            isGenerating={isGenerating}
            onToggleGenerator={handleToggleGenerator}
            onTriggerAttack={handleTriggerAttack}
          />
        </main>
      )}

      {/* Global Footer */}
      <Footer 
        metrics={footerMetrics}
        onNavigateSOC={() => {
          if (!user) {
            setAuthModal('signin');
          } else {
            setCurrentView('dashboard');
          }
        }} 
      />

      {/* Authentication Modals */}
      {authModal === 'signin' && (
        <SignIn
          onSuccess={verifyAndSyncUser}
          onClose={() => setAuthModal(null)}
          onToggleSignUp={() => setAuthModal('signup')}
        />
      )}

      {authModal === 'signup' && (
        <SignUp
          onSuccess={verifyAndSyncUser}
          onClose={() => setAuthModal(null)}
          onToggleSignIn={() => setAuthModal('signin')}
        />
      )}

    </div>
  );
}
