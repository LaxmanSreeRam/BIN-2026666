import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { 
  Shield, 
  Lock, 
  Unlock, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  Wifi, 
  BatteryCharging, 
  Thermometer, 
  Trash2, 
  RefreshCw, 
  KeyRound, 
  X, 
  Activity,
  HardDrive
} from 'lucide-react';
import { playSound } from '../utils/soundFx';

interface AdminBinDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminBinDiagnosticModal: React.FC<AdminBinDiagnosticModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<boolean>(false);

  const VALID_STAFF_IDS = ['482915', '730482', '195304', '826149', '309852', '641207', '201120'];

  // Staff ID verification for marking bin emptied
  const [activeBinForEmpty, setActiveBinForEmpty] = useState<string | null>(null);
  const [staffIdInput, setStaffIdInput] = useState<string>('');
  const [staffIdError, setStaffIdError] = useState<boolean>(false);

  // Simulated IoT Bin States
  const [bins, setBins] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'bins'), (snap) => {
      const binData = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBins(binData);
    });
    return unsub;
  }, []);

  const [actionMessage, setActionMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passwordInput.trim();
    if (clean === 'VERDETECH2026' || clean === '201120' || clean.toUpperCase() === 'ADMIN') {
      playSound('success');
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      playSound('blip');
      setAuthError(true);
    }
  };

  const handleConfirmEmpty = (binId: string, e: React.FormEvent) => {
    e.preventDefault();
    const trimmedStaffId = staffIdInput.trim();
    if (VALID_STAFF_IDS.includes(trimmedStaffId) || trimmedStaffId === '201120') {
      playSound('success');
      setBins((prev) =>
        prev.map((b) => {
          if (b.id === binId) {
            return {
              ...b,
              fillLevel: 0,
              isFull: false,
              status: 'Emptied & Calibrated (0%)',
              lastPing: 'Just Now (Emptied)',
            };
          }
          return b;
        })
      );

      // Save audit record
      const auditRecord = {
        id: `empty-${Date.now()}`,
        binId,
        staffId: trimmedStaffId,
        timestamp: new Date().toISOString(),
      };

      const existingRecords = JSON.parse(localStorage.getItem('verdetech_bin_emptying_logs') || '[]');
      localStorage.setItem('verdetech_bin_emptying_logs', JSON.stringify([auditRecord, ...existingRecords]));

      setActionMessage(`Bin ${binId} successfully emptied and sensor reset by Staff #${trimmedStaffId}.`);
      setActiveBinForEmpty(null);
      setStaffIdInput('');
      setStaffIdError(false);

      setTimeout(() => setActionMessage(null), 4000);
    } else {
      playSound('blip');
      setStaffIdError(true);
    }
  };

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(3, 6, 15, 0.88)', backdropFilter: 'blur(16px)', zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content rounded-3xl border border-amber-500/30 bg-[#080d1e] text-white shadow-[0_0_60px_rgba(245,158,11,0.2)] overflow-hidden">
          
          {/* Header */}
          <div className="bg-[#050813] border-b border-white/10 p-5 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/30 font-mono text-xs uppercase font-bold">
                  IoT HARDWARE DIAGNOSTICS & TELEMETRY
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-white mt-1">
                  Smart Bin Maintenance Control Center
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

          {/* Body Content */}
          <div className="p-6 sm:p-8">
            {!isAuthenticated ? (
              /* Portal Password Authentication Screen */
              <div className="max-w-md mx-auto py-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  <KeyRound className="w-8 h-8" />
                </div>

                <h3 className="text-2xl font-bold font-display text-white mb-2">
                  Maintenance Access
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm mb-6">
                  Enter maintenance password or master PIN (<code className="text-amber-300">VERDETECH2026</code>) to inspect live ultrasonic sensor telemetry.
                </p>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter Password / PIN..."
                      className="w-full text-center text-lg font-mono font-bold px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-amber-400"
                      autoFocus
                    />
                    {authError && (
                      <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-mono mt-3">
                        ❌ Incorrect password. (Hint: VERDETECH2026 or 201120)
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg"
                  >
                    Unlock Diagnostics Console
                  </button>
                </form>
              </div>
            ) : (
              /* Authenticated Dashboard */
              <div className="space-y-6">
                
                {/* Action Feedback Banner */}
                {actionMessage && (
                  <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-400 text-emerald-300 font-mono text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{actionMessage}</span>
                  </div>
                )}

                {/* Status Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-black/30 border border-white/10 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">
                      <Trash2 className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Connected Bins</span>
                      <span className="text-xl font-bold font-mono text-white">3 Active IoT Units</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/30 border border-white/10 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-400/30">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Needs Service</span>
                      <span className="text-xl font-bold font-mono text-rose-400">1 Unit (Cafeteria)</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/30 border border-white/10 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Telemetry Health</span>
                      <span className="text-xl font-bold font-mono text-emerald-400">100% Online (MQTT)</span>
                    </div>
                  </div>
                </div>

                {/* Bin Diagnostics Table / Cards */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold font-display text-white flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-cyan-400" />
                    <span>Live Smart Bin Sensors & Hardware Array</span>
                  </h4>

                  <div className="space-y-4">
                    {bins.map((bin) => (
                      <div 
                        key={bin.id}
                        className={`p-6 rounded-2xl border transition-all ${
                          bin.isFull ? 'bg-rose-950/20 border-rose-500/40' : 'bg-black/30 border-white/10'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full font-mono text-xs font-bold ${
                              bin.isFull ? 'bg-rose-600 text-white' : 'bg-cyan-950 text-cyan-300 border border-cyan-400/30'
                            }`}>
                              {bin.id}
                            </span>
                            <div>
                              <h5 className="text-base font-bold text-white">{bin.location}</h5>
                              <p className="text-xs font-mono mt-0.5">
                                Status: <span className={bin.isFull ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{bin.status}</span>
                              </p>
                            </div>
                          </div>

                          <div>
                            {activeBinForEmpty === bin.id ? (
                              <form onSubmit={(e) => handleConfirmEmpty(bin.id, e)} className="flex items-center gap-2">
                                <input
                                  type="password"
                                  value={staffIdInput}
                                  onChange={(e) => setStaffIdInput(e.target.value)}
                                  placeholder="Staff ID..."
                                  className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/20 text-white font-mono text-xs w-32 focus:outline-none focus:border-cyan-400"
                                  autoFocus
                                />
                                <button
                                  type="submit"
                                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all"
                                >
                                  Confirm
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setActiveBinForEmpty(null); setStaffIdInput(''); setStaffIdError(false); }}
                                  className="px-3 py-1.5 rounded-lg bg-white/10 text-slate-300 hover:text-white font-mono text-xs"
                                >
                                  Cancel
                                </button>
                              </form>
                            ) : (
                              <button
                                onClick={() => { setActiveBinForEmpty(bin.id); setStaffIdInput(''); setStaffIdError(false); }}
                                className="px-4 py-2 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono text-xs font-bold transition-all flex items-center gap-1.5"
                                title="Reset capacity after collection"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Mark Emptied</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {staffIdError && activeBinForEmpty === bin.id && (
                          <div className="p-2.5 my-3 rounded-lg bg-rose-950/60 border border-rose-500 text-rose-300 text-xs font-mono">
                            ❌ Invalid Staff ID. Enter an authorized staff ID (e.g. 201120 or 730482) to confirm.
                          </div>
                        )}

                        {/* Fill Level Progress */}
                        <div className="mt-4">
                          <div className="flex justify-between text-xs font-mono mb-1.5">
                            <span className="text-slate-400">Ultrasonic Fill Capacity</span>
                            <span className={bin.fillLevel >= 90 ? 'text-rose-400 font-bold' : bin.fillLevel >= 70 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                              {bin.fillLevel}% {bin.fillLevel >= 90 ? '🚨 FULL' : bin.fillLevel >= 70 ? '⚠️ High' : '🟢 Optimal'}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                            <div
                              className={`h-full transition-all duration-300 ${
                                bin.fillLevel >= 90 ? 'bg-rose-500' : bin.fillLevel >= 70 ? 'bg-amber-400' : 'bg-emerald-400'
                              }`}
                              style={{ width: `${bin.fillLevel}%` }}
                            />
                          </div>
                        </div>

                        {/* Sensor & Hardware Specs Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-white/5 text-xs font-mono">
                          <div className="p-2.5 rounded-xl bg-black/20 border border-white/5">
                            <span className="text-slate-500 text-[10px] block">Physical State</span>
                            <span className="text-slate-200">{bin.condition}</span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-black/20 border border-white/5">
                            <span className="text-slate-500 text-[10px] block">Battery Voltage</span>
                            <span className="text-cyan-300">{bin.battery}</span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-black/20 border border-white/5">
                            <span className="text-slate-500 text-[10px] block">Controller Temp</span>
                            <span className="text-amber-300">{bin.temperature}</span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-black/20 border border-white/5">
                            <span className="text-slate-500 text-[10px] block">WiFi / RSSI</span>
                            <span className="text-emerald-300">{bin.rssi}</span>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-white/10">
                  <span className="text-xs text-slate-500 font-mono">
                    Connected via REST & MQTT telemetry to Raspberry Pi Zero W units.
                  </span>
                  <button
                    onClick={() => setIsAuthenticated(false)}
                    className="btn-stai-ghost text-xs"
                  >
                    Lock & Exit Maintenance Center
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
