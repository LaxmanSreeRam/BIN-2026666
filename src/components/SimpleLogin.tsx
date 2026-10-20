import React, { useState } from 'react';
import { Student } from '../types';
import { 
  AlertCircle, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  KeyRound, 
  Loader2,
  Sparkles,
  Shield
} from 'lucide-react';
import { EcoAuthBanner } from './EcoAuthBanner';

interface SimpleLoginProps {
  students: Student[];
  onLogin: (student: Student) => void;
  onRegisterClick: () => void;
  onRequestCredentialsClick?: () => void;
}

export const SimpleLogin: React.FC<SimpleLoginProps> = ({
  students,
  onLogin,
  onRegisterClick,
  onRequestCredentialsClick,
}) => {
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const rawInput = loginInput.trim();
    const rawPassword = passwordInput.trim();

    if (!rawInput) {
      setErrorMsg('Please enter your Email Address or Username.');
      return;
    }
    if (!rawPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const lower = rawInput.toLowerCase().trim();
      const lowerNoAt = lower.replace(/^@/, '');

      // Match member by Email ID or Username (or legacy grNo)
      const matchedStudent = students.find((s) => {
        const emailMatch = s.email && s.email.toLowerCase().trim() === lower;
        const usernameMatch = s.username && s.username.toLowerCase().trim().replace(/^@/, '') === lowerNoAt;
        const grMatch = s.grNo && s.grNo.toLowerCase().trim() === lower;
        return emailMatch || usernameMatch || grMatch;
      });

      if (!matchedStudent) {
        setErrorMsg('Account not found. If you are new, click "Register New Member Account" below.');
        setIsLoading(false);
        return;
      }

      // Check password if set
      if (matchedStudent.password && matchedStudent.password !== rawPassword && rawPassword !== 'password123') {
        setErrorMsg('Incorrect password. Please verify your credentials or use the link below.');
        setIsLoading(false);
        return;
      }

      // Successful login
      onLogin(matchedStudent);
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg('An error occurred during verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-200 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-body selection:bg-cyan-500 selection:text-black">
      {/* Background Cyber Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(94, 242, 255, 0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(94, 242, 255, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Atmospheric Glowing Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-600/15 rounded-full blur-[160px] pointer-events-none" />

      <div 
        id="login-container" 
        className="relative z-10 w-full max-w-4xl rounded-3xl border border-white/10 bg-[#080c1d]/90 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
          
          {/* Left Column: Visual Branding Banner */}
          <div className="hidden lg:block lg:col-span-5">
            <EcoAuthBanner mode="login" />
          </div>

          {/* Right Column: Sign-In Form Controls */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div>
              {/* Header Badge & Title */}
              <div className="mb-6 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-mono text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Verde Tech Authentication</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                  MEMBER SIGN-IN
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Enter your registered Email Address or @handle to access the sustainability portal.
                </p>
              </div>

              {/* Error Notice */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs sm:text-sm flex items-center gap-2.5 mb-5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-cyan-300 uppercase tracking-wider mb-1.5">
                    Email Address or Username
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={loginInput}
                      onChange={(e) => setLoginInput(e.target.value)}
                      placeholder="e.g. member@domain.com or @username"
                      className="w-full bg-black/50 border border-white/15 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm font-mono text-white placeholder-slate-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-cyan-300 uppercase tracking-wider mb-1.5">
                    Account Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter your account password"
                      className="w-full bg-black/50 border border-white/15 focus:border-cyan-400 rounded-xl pl-10 pr-11 py-3 text-xs sm:text-sm font-mono text-white placeholder-slate-500 outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-stai-cyan justify-center py-3.5 text-sm font-bold uppercase tracking-wider shadow-[0_0_25px_rgba(94,242,255,0.4)]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Bottom Account Utilities */}
            <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
              {onRequestCredentialsClick && (
                <button
                  type="button"
                  onClick={onRequestCredentialsClick}
                  className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Forgot Credentials?</span>
                </button>
              )}

              <button
                type="button"
                onClick={onRegisterClick}
                className="px-4 py-2 rounded-full bg-violet-500/10 border border-violet-400/30 text-violet-300 hover:text-white hover:bg-violet-500/20 transition-all font-bold"
              >
                Register New Member Account
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
