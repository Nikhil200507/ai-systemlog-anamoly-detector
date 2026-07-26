"use client";

import React, { useState } from 'react';
import { ShieldAlert, Terminal, Activity, ChevronRight, Cpu, LogOut, Menu, X } from 'lucide-react';

interface HeaderProps {
  currentView: 'landing' | 'dashboard';
  setCurrentView: (view: 'landing' | 'dashboard') => void;
  activeAnomalyCount: number;
  user: any;
  onSignInClick: () => void;
  onSignOutClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentView, 
  setCurrentView, 
  activeAnomalyCount,
  user,
  onSignInClick,
  onSignOutClick
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (targetId?: string) => {
    setCurrentView('landing');
    setMobileMenuOpen(false);
    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-[#050507]/95 backdrop-blur-2xl transition-all">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Brand Logo */}
        <div 
          onClick={() => { setCurrentView('landing'); setMobileMenuOpen(false); }}
          className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group shrink-0"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center transition-all group-hover:scale-105 group-hover:border-white shadow-xl">
            {/* SVG Benzene Chemical Ring Icon */}
            <svg className="w-5 h-5 text-white transition-transform group-hover:rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2" />
              <circle cx="12" cy="12" r="4.5" strokeDasharray="3 2" />
            </svg>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-syne font-extrabold text-xl sm:text-2xl tracking-tight text-white group-hover:text-zinc-200 transition-colors">
                BENZENE
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono-code uppercase px-1.5 py-0.5 rounded bg-zinc-800/90 border border-zinc-700 text-zinc-300 font-semibold tracking-wider">
                UEBA AI
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-space text-zinc-400 -mt-0.5 tracking-wide hidden md:block">
              Zero-Signature Behavioral Anomaly Engine
            </p>
          </div>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2.5 text-xs font-mono-code">
          <button 
            onClick={() => handleNavClick()}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-all border whitespace-nowrap cursor-pointer ${
              currentView === 'landing' 
                ? 'bg-white text-black border-white font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                : 'bg-zinc-900/50 text-zinc-400 border-zinc-800/80 hover:border-zinc-600 hover:text-white hover:bg-zinc-800/80'
            }`}
          >
            Overview
          </button>
          
          <a 
            href="#features" 
            onClick={() => handleNavClick('features')}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-zinc-400 hover:text-white hover:border-zinc-600 hover:bg-zinc-800/80 transition-all whitespace-nowrap"
          >
            Threat Vectors
          </a>
          
          <a 
            href="#ml-architecture" 
            onClick={() => handleNavClick('ml-architecture')}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-zinc-400 hover:text-white hover:border-zinc-600 hover:bg-zinc-800/80 transition-all whitespace-nowrap"
          >
            ML Architecture
          </a>
          
          <a 
            href="#explainability" 
            onClick={() => handleNavClick('explainability')}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-zinc-400 hover:text-white hover:border-zinc-600 hover:bg-zinc-800/80 transition-all whitespace-nowrap"
          >
            XAI Scoring
          </a>
        </nav>

        {/* Right: Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
          
          {/* Engine Status Pill */}
          <div className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono-code whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-300 font-bold">CORE ACTIVE</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">8.4ms</span>
          </div>

          {/* User Status */}
          {user ? (
            <div className="flex items-center gap-2 sm:gap-2.5 bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-mono-code select-none whitespace-nowrap">
              <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 text-[10px] font-bold uppercase shrink-0">
                {user.name ? user.name[0] : (user.email ? user.email[0] : 'U')}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-zinc-200 font-semibold truncate max-w-[100px]">
                  {user.name || user.email.split('@')[0]}
                </span>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider leading-none mt-0.5">
                  OPERATOR
                </span>
              </div>
              <button
                onClick={onSignOutClick}
                title="Sign Out"
                className="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignInClick}
              className="rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-400 text-white font-space font-medium text-xs px-3 py-1.5 sm:px-4 sm:py-2 transition-all hover:bg-zinc-800 cursor-pointer whitespace-nowrap"
            >
              Sign In
            </button>
          )}

          {/* View Mode Toggle Button */}
          {currentView === 'landing' ? (
            <button
              onClick={() => {
                if (!user) {
                  onSignInClick();
                } else {
                  setCurrentView('dashboard');
                }
              }}
              className="relative group overflow-hidden rounded-xl bg-white text-black font-space font-bold text-xs px-3 py-1.5 sm:px-4 sm:py-2 transition-all duration-300 hover:bg-zinc-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] flex items-center gap-1.5 sm:gap-2 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Terminal className="w-3.5 h-3.5 text-black group-hover:rotate-12 transition-transform shrink-0" />
              <span>
                <span className="hidden sm:inline">Launch SOC Console</span>
                <span className="inline sm:hidden">Console</span>
              </span>
              {activeAnomalyCount > 0 && (
                <span className="px-1.5 py-0.2 text-[9px] font-mono-code font-extrabold bg-black text-white rounded-full">
                  {activeAnomalyCount}
                </span>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-black group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentView('landing')}
              className="rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-400 text-white font-space font-medium text-xs px-3 py-1.5 sm:px-4 sm:py-2 transition-all flex items-center gap-1.5 sm:gap-2 hover:bg-zinc-800 cursor-pointer whitespace-nowrap"
            >
              <Cpu className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>
                <span className="hidden sm:inline">Return to Landing</span>
                <span className="inline sm:hidden">Landing</span>
              </span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-800 bg-[#07070a]/98 px-4 py-4 space-y-2 font-mono-code text-xs">
          <button
            onClick={() => handleNavClick()}
            className={`w-full text-left px-4 py-2.5 rounded-xl border transition-all ${
              currentView === 'landing'
                ? 'bg-white text-black font-bold border-white'
                : 'bg-zinc-900/60 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            Overview
          </button>

          <a
            href="#features"
            onClick={() => handleNavClick('features')}
            className="block w-full text-left px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition-all"
          >
            Threat Vectors
          </a>

          <a
            href="#ml-architecture"
            onClick={() => handleNavClick('ml-architecture')}
            className="block w-full text-left px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition-all"
          >
            ML Architecture
          </a>

          <a
            href="#explainability"
            onClick={() => handleNavClick('explainability')}
            className="block w-full text-left px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition-all"
          >
            XAI Scoring
          </a>
        </div>
      )}
    </header>
  );
};

