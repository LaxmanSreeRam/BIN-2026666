import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  KeyRound, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  HardDrive, 
  Clock, 
  User, 
  X, 
  RefreshCw,
  FileText,
  Key
} from 'lucide-react';
import { ActivityLog, Student } from '../types';
import { saveStudentToFirestore } from '../lib/firebaseSync';
import { playSound } from '../utils/soundFx';
import { getApiUrl } from '../utils/apiConfig';

interface TrueAdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ActivityLog[];
  students?: Student[];
}

export const TrueAdminPortalModal: React.FC<TrueAdminPortalModalProps> = ({
  isOpen,
  onClose,
  logs,
  students = [],
}) => {
  const [step, setStep] = useState<'auth' | 'verify' | 'dashboard'>('auth');
  const [staffId, setStaffId] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [adminPin, setAdminPin] = useState<string>('');
  const [usePinMode, setUsePinMode] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'usage' | 'emptying' | 'sensors' | 'maintenance'>('usage');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const AUTHORIZED_ADMINS = [
    { staffId: '201120', email: 'subashiniompop@gmail.com', name: 'Laxman Sree Ram' },
    { staffId: '730482', email: 'admin2@verdetech.internal', name: 'Verde Admin 2' },
    { staffId: '195304', email: 'admin3@verdetech.internal', name: 'Verde Admin 3' },
  ];

  const [emptyingRecords, setEmptyingRecords] = useState<Array<{ id: string; binId: string; staffId: string; timestamp: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('verdetech_bin_emptying_logs');
      if (saved) {
        try {
          setEmptyingRecords(JSON.parse(saved));
        } catch (e) {
          setEmptyingRecords([]);
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedStaff = staffId.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // Match admin by staff ID or email
    const matchedAdmin = AUTHORIZED_ADMINS.find(
      (a) => a.staffId === trimmedStaff || (trimmedEmail && a.email.toLowerCase() === trimmedEmail)
    );

    if (!matchedAdmin) {
      setErrorMsg('❌ Invalid Staff ID or authorized credentials. Access restricted.');
      return;
    }

    setLoading(true);
    try {
      const targetEmail = matchedAdmin.email;
      const res = await fetch(getApiUrl('/api/send-verification'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          studentName: matchedAdmin.name,
          ecoNumber: matchedAdmin.staffId,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success) {
        setSuccessMsg('Verification code dispatched to your registered admin email address.');
        setStep('verify');
      } else {
        // Fallback: If SMTP or server has delivery issue, inform user and allow direct PIN verification
        const errText = data?.error || 'Email dispatcher unavailable or connection timed out.';
        setErrorMsg(`${errText} You may authenticate directly using your 6-digit Admin PIN below.`);
        setUsePinMode(true);
      }
    } catch (err) {
      console.warn('Network request failed, offering Admin PIN bypass:', err);
      setErrorMsg('Network connectivity to verification server unavailable. Please authenticate with your Admin PIN.');
      setUsePinMode(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectPinAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedPin = (adminPin || code).trim();
    const trimmedStaff = staffId.trim();

    // Check if entered pin matches Master PIN, Staff ID, or valid admin bypass
    const isValidPin = 
      trimmedPin === '201120' || 
      trimmedPin === 'VERDETECH2026' || 
      trimmedPin === '730482' || 
      trimmedPin === '195304' ||
      trimmedPin === trimmedStaff;

    if (isValidPin) {
      playSound('success');
      setIsAuthenticated(true);
      setStep('dashboard');
      setSuccessMsg('Admin Security PIN verified. Access granted.');
    } else {
      playSound('blip');
      setErrorMsg('❌ Invalid Admin PIN. Please enter your valid 6-digit security code or Staff ID.');
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanCode = code.trim();

    // First check if user typed their direct Admin PIN
    if (cleanCode === '201120' || cleanCode === 'VERDETECH2026' || cleanCode === staffId.trim()) {
      playSound('success');
      setIsAuthenticated(true);
      setStep('dashboard');
      setSuccessMsg('Admin credentials verified. Welcome to True Admin Portal.');
      return;
    }

    setLoading(true);
    try {
      const matchedAdmin = AUTHORIZED_ADMINS.find((a) => a.staffId === staffId.trim());
      const targetEmail = matchedAdmin ? matchedAdmin.email : email.trim().toLowerCase();

      const res = await fetch(getApiUrl('/api/verify-code'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          code: cleanCode,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success) {
        playSound('success');
        setIsAuthenticated(true);
        setStep('dashboard');
        setSuccessMsg('Authentication successful. Welcome to True Admin Portal.');
      } else {
        playSound('blip');
        setErrorMsg('❌ Invalid verification code. You can also enter your 6-digit Staff ID as your security PIN.');
      }
    } catch (err) {
      // In case serverless/Vercel is offline, check fallback pin
      if (cleanCode === '201120' || cleanCode === 'VERDETECH2026' || cleanCode === staffId.trim()) {
        playSound('success');
        setIsAuthenticated(true);
        setStep('dashboard');
        setSuccessMsg('Security PIN verified offline.');
      } else {
        setErrorMsg('Server verification offline. Please enter your 6-digit Staff ID (e.g. 201120) to unlock.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter smart bin usage logs
  const smartBinLogs = logs.filter((l) => 
    l.challengeTitle?.toLowerCase().includes('bin') ||
    l.challengeTitle?.toLowerCase().includes('disposal') ||
    l.category === 'Recycling' ||
    l.category === 'Waste'
  );

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(3, 6, 15, 0.88)', backdropFilter: 'blur(16px)', zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content rounded-3xl border border-cyan-400/30 bg-[#080d1e] text-white shadow-[0_0_60px_rgba(94,242,255,0.2)] overflow-hidden">
          
          {/* Header */}
          <div className="bg-[#050813] border-b border-white/10 p-5 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-400/30 font-mono text-xs uppercase">
                  RESTRICTED ACCESS • AUTHORIZED PERSONNEL ONLY
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-white mt-1">
                  True Admin Portal & Telemetry Console
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {step === 'auth' && (
              <div className="max-w-md mx-auto py-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mx-auto mb-4 shadow-[0_0_20px_rgba(94,242,255,0.2)]">
                  <KeyRound className="w-8 h-8" />
                </div>

                <h3 className="text-2xl font-bold font-display text-white mb-2">
                  Staff Authentication
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm mb-6">
                  Enter your authorized Staff ID or registered administrator credentials.
                </p>

                {!usePinMode ? (
                  <form onSubmit={handleRequestCode} className="space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">
                        Staff ID (e.g. 201120)
                      </label>
                      <input
                        type="text"
                        value={staffId}
                        onChange={(e) => setStaffId(e.target.value)}
                        placeholder="Enter Staff ID..."
                        className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                        required
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">
                        Authorized Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@school.internal"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    {errorMsg && (
                      <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-mono">
                        {errorMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full btn-stai-cyan justify-center py-3 text-xs uppercase tracking-wider font-bold"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{loading ? 'Transmitting Code...' : 'Send Verification Code'}</span>
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setUsePinMode(true);
                          setErrorMsg(null);
                        }}
                        className="text-xs font-mono text-cyan-400 hover:text-white underline underline-offset-4"
                      >
                        Use Direct Admin Security PIN ›
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Direct Admin PIN Authentication */
                  <form onSubmit={handleDirectPinAuth} className="space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">
                        Staff ID
                      </label>
                      <input
                        type="text"
                        value={staffId}
                        onChange={(e) => setStaffId(e.target.value)}
                        placeholder="e.g. 201120"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                        required
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">
                        Admin Security PIN / Key
                      </label>
                      <input
                        type="password"
                        value={adminPin}
                        onChange={(e) => setAdminPin(e.target.value)}
                        placeholder="Enter 6-digit PIN or Staff Key..."
                        className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>

                    {errorMsg && (
                      <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-mono">
                        {errorMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full btn-stai-cyan justify-center py-3 text-xs uppercase tracking-wider font-bold"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      <span>Unlock Admin Portal</span>
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setUsePinMode(false);
                          setErrorMsg(null);
                        }}
                        className="text-xs font-mono text-slate-400 hover:text-white"
                      >
                        ‹ Return to Email Code Dispatch
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {step === 'verify' && (
              <div className="max-w-md mx-auto py-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mx-auto mb-4 shadow-[0_0_20px_rgba(94,242,255,0.2)]">
                  <Mail className="w-8 h-8" />
                </div>

                <h3 className="text-2xl font-bold font-display text-white mb-2">
                  Enter Verification Code
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm mb-4">
                  We have sent a 6-digit verification code to your registered email address.
                </p>

                {successMsg && (
                  <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-mono mb-4">
                    {successMsg}
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-mono mb-4">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      maxLength={12}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter 6-digit code or PIN..."
                      className="w-full text-center text-2xl tracking-widest font-mono font-bold px-4 py-3 rounded-xl bg-black/50 border border-cyan-400/40 text-cyan-300 focus:outline-none"
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-stai-cyan justify-center py-3 text-xs uppercase tracking-wider font-bold"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    <span>{loading ? 'Verifying...' : 'Verify & Enter Dashboard'}</span>
                  </button>

                  <div className="flex items-center justify-between text-xs font-mono pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('auth')}
                      className="text-slate-400 hover:text-white"
                    >
                      ‹ Change Staff ID
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCode(staffId.trim());
                      }}
                      className="text-cyan-400 hover:text-white underline underline-offset-4"
                    >
                      Use Staff ID as PIN
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 'dashboard' && isAuthenticated && (
              <div className="space-y-6">
                
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
                  <button
                    onClick={() => setActiveTab('usage')}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                      activeTab === 'usage'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                        : 'text-slate-400 hover:text-white bg-black/20'
                    }`}
                  >
                    Bin Activity ({smartBinLogs.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('emptying')}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                      activeTab === 'emptying'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                        : 'text-slate-400 hover:text-white bg-black/20'
                    }`}
                  >
                    Emptying Audit ({emptyingRecords.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('sensors')}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                      activeTab === 'sensors'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                        : 'text-slate-400 hover:text-white bg-black/20'
                    }`}
                  >
                    Sensor Telemetry
                  </button>
                  <button
                    onClick={() => setActiveTab('maintenance')}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                      activeTab === 'maintenance'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                        : 'text-slate-400 hover:text-white bg-black/20'
                    }`}
                  >
                    System Maintenance
                  </button>
                </div>

                {/* Tab 1: Bin Activity */}
                {activeTab === 'usage' && (
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-black/30 border border-white/10 overflow-hidden">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-black/50 text-slate-400 font-mono uppercase text-[11px] border-b border-white/10">
                          <tr>
                            <th className="p-3">Timestamp</th>
                            <th className="p-3">Student</th>
                            <th className="p-3">Action</th>
                            <th className="p-3">Diverted</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono">
                          {smartBinLogs.slice(0, 15).map((log) => (
                            <tr key={log.id} className="hover:bg-white/[0.02]">
                              <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                              <td className="p-3 text-white font-bold">{log.studentName}</td>
                              <td className="p-3 text-cyan-300">{log.challengeTitle}</td>
                              <td className="p-3 text-emerald-400">{log.quantity} {log.unitLabel}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab 2: Emptying */}
                {activeTab === 'emptying' && (
                  <div className="space-y-4">
                    {emptyingRecords.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 font-mono text-xs">
                        No bin emptying audit records found.
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-black/30 border border-white/10 overflow-hidden">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-black/50 text-slate-400 font-mono uppercase text-[11px] border-b border-white/10">
                            <tr>
                              <th className="p-3">Timestamp</th>
                              <th className="p-3">Bin ID</th>
                              <th className="p-3">Staff ID</th>
                              <th className="p-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-mono">
                            {emptyingRecords.map((r, idx) => (
                              <tr key={r.id || idx}>
                                <td className="p-3 text-slate-400">{new Date(r.timestamp).toLocaleString()}</td>
                                <td className="p-3 text-white font-bold">{r.binId}</td>
                                <td className="p-3 text-cyan-300">Staff #{r.staffId}</td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                                    Emptied & Reset
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Sensors */}
                {activeTab === 'sensors' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-500">Active IoT Nodes</span>
                      <h4 className="text-xl font-bold font-mono text-white">3 Units Online</h4>
                      <p className="text-xs text-emerald-400">Ultrasonic telemetry active</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-500">Database Sync</span>
                      <h4 className="text-xl font-bold font-mono text-cyan-300">Firestore Active</h4>
                      <p className="text-xs text-slate-400">Real-time ledger connected</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-500">Authorized Admin</span>
                      <h4 className="text-xl font-bold font-mono text-white">Staff #{staffId || '201120'}</h4>
                      <p className="text-xs text-emerald-400">Verified Personnel Session</p>
                    </div>
                  </div>
                )}

                {/* Tab 4: Maintenance */}
                {activeTab === 'maintenance' && (
                  <div className="p-8 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-center space-y-4">
                    <h5 className="text-xl font-bold font-display text-rose-300">
                      System Maintenance: Reset All Points
                    </h5>
                    <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                      WARNING: This action will reset user points to zero across the platform for academic term reconciliation.
                    </p>
                    <button
                      onClick={async () => {
                        if (confirm('Are you absolutely sure you want to reset all user points to zero? This action is irreversible.')) {
                          setLoading(true);
                          try {
                            const res = await fetch(getApiUrl('/api/admin/reset-all-points'), {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                            });
                            const data = await res.json();
                            if (res.ok && data.success) {
                              const studentList = students || [];
                              for (const s of studentList) {
                                await saveStudentToFirestore({ ...s, points: 0, weeklyPoints: 0 });
                              }
                              alert(data.message || 'All user points have been reset to zero.');
                            } else {
                              throw new Error(data.error || 'Server error');
                            }
                          } catch (err: any) {
                            alert('Failed to reset points: ' + (err?.message || 'Unknown error'));
                          } finally {
                            setLoading(false);
                          }
                        }
                      }}
                      disabled={loading}
                      className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg"
                    >
                      {loading ? 'Processing...' : 'Reset All Points'}
                    </button>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      setIsAuthenticated(false);
                      setStep('auth');
                      setCode('');
                      setAdminPin('');
                    }}
                    className="btn-stai-ghost text-xs"
                  >
                    Lock & Exit Admin Portal
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
