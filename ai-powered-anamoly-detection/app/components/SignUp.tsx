"use client";

import React, { useState } from 'react';
import { insforge } from '../utils/insforge';
import { saveAccountToVault } from '../utils/authVault';
import { KeyRound, Mail, AlertTriangle, ArrowRight, X, User, Eye, EyeOff } from 'lucide-react';

interface SignUpProps {
  onSuccess: (user: any) => void;
  onClose: () => void;
  onToggleSignIn: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onSuccess, onClose, onToggleSignIn }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // 1. Check if email already exists in InsForge database
      try {
        const { data: existingUser } = await insforge.database
          .from('users')
          .select('id, email, name')
          .eq('email', email)
          .maybeSingle();

        if (existingUser) {
          setError(`An account with email "${email}" is already registered. Please sign in instead.`);
          setLoading(false);
          return;
        }
      } catch (checkErr) {
        // Ignore check error
      }

      // 2. Call Auth SignUp API
      const res = await insforge.auth.signUp({
        email,
        password,
        name,
        redirectTo: window.location.origin
      }).catch((err: any) => ({ data: null, error: err }));

      if (res?.error && (
        res.error.message?.toLowerCase().includes('already registered') ||
        res.error.message?.toLowerCase().includes('already in use') ||
        res.error.message?.toLowerCase().includes('exists')
      )) {
        setError(`Account already exists for ${email}. Please click "Sign In" below.`);
        setLoading(false);
        return;
      }

      const vaultAccount = saveAccountToVault(email, password, name);

      const authUser = res?.data?.user || {
        id: vaultAccount.id,
        email: vaultAccount.email,
        name: vaultAccount.name,
        emailVerified: true
      };

      setSuccessMsg('Registration successful! Access key generated...');
      setTimeout(() => {
        onSuccess(authUser);
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Registration error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setOauthLoading(true);
    setError(null);
    try {
      const res = await insforge.auth.signInWithOAuth('google', {
        redirectTo: window.location.origin,
      }).catch((err: any) => ({ data: null, error: err }));

      if (res?.error) {
        setError(res.error.message || 'Failed to initiate Google sign-in');
        setOauthLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to initiate Google sign-in');
      setOauthLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#09090b] border border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-black/90">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-900"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand / Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 shadow-inner">
            <svg className="w-7 h-7 text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2" />
              <circle cx="12" cy="12" r="4.5" strokeDasharray="3 2" />
            </svg>
          </div>
          <h2 className="text-2xl font-syne font-extrabold text-white tracking-tight">
            REGISTER SECURITY KEY
          </h2>
          <p className="text-xs font-mono-code text-zinc-400 mt-1 uppercase tracking-wider">
            UEBA AI OPERATOR ENROLLMENT
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 space-y-2 p-3.5 bg-red-950/40 border border-red-800/80 rounded-xl text-red-200 text-xs font-space">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {(error.toLowerCase().includes('registered') || error.toLowerCase().includes('exists')) && (
              <button
                type="button"
                onClick={onToggleSignIn}
                className="ml-7 text-xs font-bold text-white underline hover:text-zinc-200 cursor-pointer block"
              >
                Click here to Sign In now &rarr;
              </button>
            )}
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 p-3.5 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-emerald-200 text-xs font-space">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 font-space">
          {/* Operator Name */}
          <div className="space-y-2">
            <label className="text-xs font-mono-code font-bold text-zinc-400 uppercase tracking-wider">
              Operator Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Agent Ada Lovelace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading || oauthLoading}
                className="w-full bg-[#030303] border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-mono-code font-bold text-zinc-400 uppercase tracking-wider">
              System Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                placeholder="operator@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || oauthLoading}
                className="w-full bg-[#030303] border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-mono-code font-bold text-zinc-400 uppercase tracking-wider">
              Create Access Code / Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || oauthLoading}
                className="w-full bg-[#030303] border border-zinc-800 rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || oauthLoading}
            className="w-full bg-white hover:bg-zinc-200 text-black font-space font-bold text-sm py-3.5 px-4 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-zinc-400 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <span>Enroll Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center justify-between text-xs font-mono-code text-zinc-600">
          <span className="w-full border-b border-zinc-800/80"></span>
          <span className="px-3 shrink-0">OR</span>
          <span className="w-full border-b border-zinc-800/80"></span>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading || oauthLoading}
          className="w-full bg-[#030303] hover:bg-zinc-900 border border-zinc-800 text-white font-space font-medium text-xs py-3.5 px-4 rounded-xl transition-all duration-150 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {oauthLoading ? (
            <span className="w-4 h-4 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.34 0-6.05-2.71-6.05-6.05s2.71-6.05 6.05-6.05c1.493 0 2.859.543 3.918 1.437l3.226-3.226C19.129 2.213 15.86 1 12.24 1 6.043 1 1 6.043 1 12.24S6.043 23.48 12.24 23.48c5.908 0 10.96-4.243 10.96-11.24 0-.763-.082-1.428-.22-1.955H12.24z"/>
              </svg>
              <span>Continue with Gmail / Google</span>
            </>
          )}
        </button>

        {/* Toggle link */}
        <div className="mt-8 text-center text-xs font-space text-zinc-500">
          <span>Already registered? </span>
          <button 
            onClick={onToggleSignIn}
            className="text-white hover:underline font-bold transition-all ml-1 cursor-pointer"
          >
            Sign In Operator
          </button>
        </div>

      </div>
    </div>
  );
};
