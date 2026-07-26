"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, PlusCircle, Sparkles, Activity, RefreshCcw, ArrowRight, 
  HelpCircle, BookOpen, Calculator, Compass, Layers, ShieldCheck
} from 'lucide-react';
import { AccessLog } from '../../types/benzene';
import { API_BASE_URL } from '../../utils/apiConfig';

interface Message {
  id: string;
  sender: 'USER' | 'AI';
  content: string;
  suggestions?: string[];
  timestamp: string;
}

interface AiSocAnalystTabProps {
  logs: AccessLog[];
  isBackendOnline?: boolean;
  onShowNotification: (msg: string) => void;
}

export const AiSocAnalystTab: React.FC<AiSocAnalystTabProps> = ({
  logs,
  isBackendOnline = false,
  onShowNotification,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      sender: 'AI',
      content: `## 🤖 Welcome to Benzene AI SOC Consultant & Platform Guide

I am your interactive AI Consultant powered by **Gemini Flash**. I am here to help you navigate the platform, understand every security metric and statistic on your dashboard, and explain **how each metric is calculated step-by-step**.

### 💡 What I can help you with:
* **Metric Calculations**: Understand formulas for Explainable Risk Score (0-100), Isolation Forest Anomaly Score, False-Positive Rate, and Model Precision/Recall/F1.
* **Platform Mechanics**: Learn how Cold Start group baselines, Concept Drift adaptation, and False-Positive Reduction work.
* **Site Navigation**: Find out where to inspect specific logs, graphs, user baselines, and cyberattack simulations.

Select a quick prompt card above or ask any question about the platform metrics!`,
      suggestions: [
        "How is the Explainable Risk Score calculated?",
        "What is the difference between Anomaly Score and Risk Score?",
        "How does Cold Start switch from Group to Personal baseline?",
        "Explain the 6-stage Benzene UEBA pipeline"
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [summaryStats, setSummaryStats] = useState<any>({
    total_events: 0,
    total_anomalies: 0,
    critical_threats: 0,
    false_positive_rate: 0.1
  });

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Fetch summary stats for top security banner
  const fetchSummaryStats = async () => {
    if (!isBackendOnline) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard-metrics`);
      if (res.ok) {
        const data = await res.json();
        setSummaryStats({
          total_events: data.overview?.total_events || 0,
          total_anomalies: data.overview?.total_anomalies || 0,
          critical_threats: data.overview?.critical_threats || 0,
          false_positive_rate: data.overview?.false_positive_rate || 0.1
        });
      }
    } catch (e) {
      // Catch error
    }
  };

  useEffect(() => {
    fetchSummaryStats();
  }, [isBackendOnline]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend || !textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsLoading(true);

    if (!isBackendOnline) {
      setTimeout(() => {
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: 'AI',
          content: `## ⚠️ FastAPI Backend Offline\n\nPlease launch the FastAPI server on port 8000 to connect to the live Gemini Flash API engine.`,
          suggestions: [
            "How is the Explainable Risk Score calculated?",
            "How does Cold Start work?",
            "Explain False-Positive Rate"
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome-msg')
        .map((m) => ({
          role: m.sender === 'USER' ? 'user' : 'model',
          content: m.content
        }));

      const res = await fetch(`${API_BASE_URL}/api/ai-analyst/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToSend.trim(),
          history: historyPayload
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: 'AI',
          content: data.text,
          suggestions: data.suggestions || [
            "How is the Explainable Risk Score calculated?",
            "What is Cold Start vs Concept Drift?",
            "How does False-Positive Reduction work?",
            "Explain the 6-stage UEBA pipeline"
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        onShowNotification("AI Analyst request failed.");
      }
    } catch (err) {
      onShowNotification("Network error communicating with AI Analyst.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewInvestigation = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'AI',
        content: `## 🔄 New Consultation Session Started

Conversation history cleared. How can I help you understand platform metrics or navigate the site?`,
        suggestions: [
          "How is the Explainable Risk Score calculated?",
          "What is the difference between Anomaly Score and Risk Score?",
          "How does Cold Start switch from Group to Personal baseline?",
          "Explain the 6-stage Benzene UEBA pipeline"
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    onShowNotification("Started new consultation session.");
  };

  // Clean raw LaTeX math expressions like \frac{A}{B}, \ge, \times into readable text math
  const sanitizeMathText = (raw: string): string => {
    return raw
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
      .replace(/\\times/g, ' × ')
      .replace(/\\ge/g, ' ≥ ')
      .replace(/\\le/g, ' ≤ ')
      .replace(/\\cdot/g, ' * ')
      .replace(/\$([^\$]+)\$/g, '$1')
      .replace(/\\/g, '');
  };

  // Simple Markdown Component Renderer for AI Bubbles
  const renderMarkdown = (content: string) => {
    const cleanContent = sanitizeMathText(content);
    const lines = cleanContent.split('\n');
    let inTable = false;
    let tableHeader: string[] = [];
    let tableRows: string[][] = [];

    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Handle Markdown Tables
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
        if (cells.every(c => c.startsWith(':---') || c.startsWith('---') || c.startsWith('---:'))) {
          // Table separator row, ignore
          return;
        }
        if (!inTable) {
          inTable = true;
          tableHeader = cells;
          tableRows = [];
        } else {
          tableRows.push(cells);
        }
        return;
      } else if (inTable) {
        // End of table
        inTable = false;
        elements.push(
          <div key={`table-${idx}`} className="my-3 overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-left border-collapse text-xs font-mono-code">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800 text-cyan-400 font-bold">
                  {tableHeader.map((h, i) => (
                    <th key={i} className="p-2.5">{h.replace(/\*\*/g, '')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-zinc-900/60 hover:bg-zinc-900/40">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2.5 text-zinc-300">
                        {cell.includes('**') ? <strong>{cell.replace(/\*\*/g, '')}</strong> : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      // Headings
      if (trimmed.startsWith('## ')) {
        elements.push(<h2 key={idx} className="text-lg font-syne font-bold text-white mt-4 mb-2 flex items-center gap-2">{trimmed.replace('## ', '')}</h2>);
      } else if (trimmed.startsWith('### ')) {
        elements.push(<h3 key={idx} className="text-sm font-syne font-bold text-cyan-300 mt-3 mb-1">{trimmed.replace('### ', '')}</h3>);
      } 
      // Blockquotes
      else if (trimmed.startsWith('> ')) {
        elements.push(<blockquote key={idx} className="p-3 my-2 rounded-xl bg-cyan-950/30 border-l-4 border-cyan-500 text-xs italic text-cyan-200 font-space">{trimmed.replace('> ', '').replace(/"/g, '')}</blockquote>);
      }
      // Lists
      else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const itemText = trimmed.substring(2);
        elements.push(
          <li key={idx} className="text-xs text-zinc-300 my-1 ml-4 list-disc font-space">
            {itemText.includes('**') ? (
              <span>
                {itemText.split('**').map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="text-white font-bold">{part}</strong> : part)}
              </span>
            ) : itemText}
          </li>
        );
      } 
      // Regular Paragraphs
      else if (trimmed.length > 0) {
        elements.push(
          <p key={idx} className="text-xs text-zinc-300 my-1.5 leading-relaxed font-space">
            {trimmed.includes('**') ? (
              <span>
                {trimmed.split('**').map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="text-white font-bold">{part}</strong> : part)}
              </span>
            ) : trimmed}
          </p>
        );
      }
    });

    if (inTable) {
      elements.push(
        <div key="table-end" className="my-3 overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-left border-collapse text-xs font-mono-code">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800 text-cyan-400 font-bold">
                {tableHeader.map((h, i) => (
                  <th key={i} className="p-2.5">{h.replace(/\*\*/g, '')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-zinc-900/60 hover:bg-zinc-900/40">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-2.5 text-zinc-300">{cell.replace(/\*\*/g, '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return elements;
  };

  const quickPrompts = [
    "How is the Explainable Risk Score calculated?",
    "What is the difference between Anomaly Score and Risk Score?",
    "How does Cold Start switch from Group to Personal baseline?",
    "What does Smart False-Positive Reduction do?",
    "How is the False-Positive Rate calculated?",
    "Explain the 6-stage Benzene UEBA pipeline"
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      
      {/* Module Header & Live Security Summary Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-900/40 bg-gradient-to-br from-[#0c1824] via-[#060e17] to-[#020509] p-6 shadow-2xl">
        <span className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-cyan-600/10 filter blur-3xl" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-xs font-mono-code text-cyan-400 font-bold uppercase tracking-widest">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Gemini Flash API &bull; Site Guide & Metric Calculation Assistant</span>
            </div>
            
            <h2 className="text-3xl font-syne font-extrabold text-white tracking-tight">
              AI SOC Consultant & Platform Guide
            </h2>
            
            <p className="text-xs text-zinc-400 max-w-3xl font-space leading-relaxed">
              Interactive AI Assistant powered directly by Gemini Flash. Ask any questions about how metrics are calculated, understand dashboard statistics, or learn how to navigate platform features.
            </p>
          </div>

          {/* Live System Metrics Ribbon */}
          <div className="grid grid-cols-3 gap-3 shrink-0 font-mono-code text-xs">
            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center">
              <span className="text-[10px] text-zinc-500 font-bold block">TOTAL EVENTS</span>
              <span className="text-xl font-extrabold text-white">{summaryStats.total_events || logs.length}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center">
              <span className="text-[10px] text-zinc-500 font-bold block">ANOMALIES</span>
              <span className="text-xl font-extrabold text-amber-400">{summaryStats.total_anomalies || logs.filter(l => l.isAnomaly).length}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center">
              <span className="text-[10px] text-zinc-500 font-bold block">FP RATE</span>
              <span className="text-xl font-extrabold text-emerald-400">{summaryStats.false_positive_rate}%</span>
            </div>
          </div>
        </div>

        {/* Quick Investigation Prompt Cards Carousel Bar */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80">
          <div className="text-[11px] font-mono-code text-zinc-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Quick Metric & Feature Prompts:
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-cyan-500 hover:bg-cyan-950/30 text-zinc-200 font-space text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shrink-0"
              >
                <span>{prompt}</span>
                <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Interface Window */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 shadow-2xl flex flex-col h-[680px] overflow-hidden">
        
        {/* Chat Header Bar */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="font-syne text-sm font-bold text-white flex items-center gap-2">
                <span>Benzene AI SOC Consultant</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="text-[10px] font-mono-code text-zinc-400">
                Model: Gemini Flash &bull; Genuine API Responses (No Dummy Data)
              </div>
            </div>
          </div>

          <button
            onClick={handleStartNewInvestigation}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-mono-code text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>New Consultation</span>
          </button>
        </div>

        {/* Scrollable Message History Container */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {messages.map((msg) => {
            const isUser = msg.sender === 'USER';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-400 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-3xl space-y-3 ${
                  isUser 
                    ? 'bg-cyan-950/70 border border-cyan-700 text-white rounded-2xl p-4 shadow-lg' 
                    : 'bg-zinc-900/70 border border-zinc-800 text-zinc-200 rounded-2xl p-5 shadow-lg'
                }`}>
                  
                  <div className="flex items-center justify-between text-[10px] font-mono-code text-zinc-400 border-b border-zinc-800/80 pb-2">
                    <span className="font-bold uppercase tracking-wider text-cyan-300">
                      {isUser ? 'YOUR QUERY' : 'GEMINI FLASH AI RESPONSE'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Content */}
                  <div className="space-y-2">
                    {isUser ? (
                      <p className="text-xs font-space leading-relaxed">{msg.content}</p>
                    ) : (
                      renderMarkdown(msg.content)
                    )}
                  </div>

                  {/* Clickable Follow-Up Suggestions Pills */}
                  {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                      <div className="text-[10px] font-mono-code text-zinc-400 font-bold uppercase tracking-wider">
                        Suggested Follow-Up Topics:
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {msg.suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(sug)}
                            className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-cyan-900/60 hover:border-cyan-500 hover:bg-cyan-950/40 text-cyan-300 font-space text-[11px] transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>{sug}</span>
                            <ArrowRight className="w-3 h-3 text-cyan-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center shrink-0 mt-1 font-mono-code text-xs font-bold">
                    USER
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-xs font-mono-code text-cyan-400 flex items-center gap-2">
                <RefreshCcw className="w-4 h-4 animate-spin" />
                <span>Consulting Gemini Flash API...</span>
              </div>
            </div>
          )}

        </div>

        {/* Message Input Controls */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              placeholder="Ask AI Consultant about how any metric is calculated or how to navigate site features..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs font-space text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="px-5 py-3 rounded-2xl bg-cyan-950 border border-cyan-600 hover:bg-cyan-900 text-cyan-200 font-mono-code text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              <span>Send Query</span>
              <Send className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
