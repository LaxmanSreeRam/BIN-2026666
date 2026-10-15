import React, { useState } from 'react';
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

  const VALID_STAFF_IDS = ['482915', '730482', '195304', '826149', '309852', '641207'];

  // Staff ID verification for marking bin emptied
  const [activeBinForEmpty, setActiveBinForEmpty] = useState<string | null>(null);
  const [staffIdInput, setStaffIdInput] = useState<string>('');
  const [staffIdError, setStaffIdError] = useState<boolean>(false);

  // Simulated IoT Bin States
  const [bins, setBins] = useState([
    {
      id: 'BIN-001',
      location: 'Main Campus Entrance',
      fillLevel: 84, // %
      isFull: false,
      status: 'Near Full / Action Recommended',
      condition: 'Intact & Weatherproof',
      battery: '12.4V (94%)',
      temperature: '38.5°C',
      rssi: '-62 dBm',
      lastPing: 'Live (10s ago)',
    },
    {
      id: 'BIN-002',
      location: 'Science Lab Quad',
      fillLevel: 32, // %
      isFull: false,
      status: 'Optimal / Normal',
      condition: 'Intact & Clean',
      battery: '12.7V (98%)',
      temperature: '36.2°C',
      rssi: '-58 dBm',
      lastPing: 'Live (4s ago)',
    },
    {
      id: 'BIN-003',
      location: 'Cafeteria Hallway',
      fillLevel: 97, // %
      isFull: true,
      status: '🚨 FULL - COLLECTION REQUIRED',
      condition: 'Intact (High Volume)',
      battery: '11.9V (82%)',
      temperature: '41.1°C',
      rssi: '-71 dBm',
      lastPing: 'Live (Just now)',
    },
  ]);

  const [actionMessage, setActionMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === 'VERDETECH2026') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleConfirmEmpty = (binId: string, e: React.FormEvent) => {
    e.preventDefault();
    const trimmedStaffId = staffIdInput.trim();
    if (VALID_STAFF_IDS.includes(trimmedStaffId)) {
      setBins((prev) =>
        prev.map((b) => {
          if (b.id === binId) {
            setActionMessage(`Bin ${binId} marked emptied successfully by Staff ID ${trimmedStaffId}.`);
            setTimeout(() => setActionMessage(null), 3500);
            return { ...b, fillLevel: 0, isFull: false, status: 'Newly Emptied / Optimal' };
          }
          return b;
        })
      );

      // Save emptying log for True Admin Portal
      const emptyingRecord = {
        id: 'empty-' + Date.now(),
        binId,
        staffId: trimmedStaffId,
        timestamp: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('verdetech_bin_emptying_logs') || '[]');
      localStorage.setItem('verdetech_bin_emptying_logs', JSON.stringify([emptyingRecord, ...existing]));

      setActiveBinForEmpty(null);
      setStaffIdInput('');
      setStaffIdError(false);
    } else {
      setStaffIdError(true);
    }
  };

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content rounded-0 border border-4 border-dark shadow-[8px_8px_0px_0px_black]">
          
          {/* Header */}
          <div className="modal-header bg-dark text-white rounded-0 border-bottom border-4 border-dark d-flex align-items-center justify-content-between p-3 p-md-4">
            <div className="d-flex align-items-center gap-3">
              <div className="p-2.5 bg-warning text-dark border border-2 border-white rounded-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <span className="badge bg-warning text-dark fw-bold px-2.5 py-1 rounded-0 text-uppercase border border-dark">
                    Secure Access Portal
                  </span>
                  <span className="text-light small font-monospace">IoT Telemetry & Hardware Diagnostics</span>
                </div>
                <h3 className="h4 fw-black text-uppercase text-white tracking-tight m-0 mt-1">
                  Maintenance Control Center
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline-light btn-sm rounded-0 border-2"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="modal-body bg-white text-dark p-4 p-md-5">
            {!isAuthenticated ? (
              /* Portal Password Authentication Screen */
              <div className="max-w-md mx-auto py-4 text-center" style={{ maxWidth: '480px' }}>
                <div className="p-3 bg-light border border-3 border-dark rounded-0 d-inline-flex align-items-center justify-content-center text-dark mb-3">
                  <KeyRound className="w-10 h-10 text-warning" />
                </div>

                <h3 className="fw-black text-uppercase text-dark mb-2">Maintenance Access Authentication</h3>
                <p className="text-muted fw-medium small mb-4">
                  Enter the secure administrator password to access live smart bin fill levels and hardware telemetry.
                </p>

                <form onSubmit={handleLogin} className="space-y-3">
                  <div>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter Password..."
                      className="form-control rounded-0 border-3 border-dark py-3 text-center fw-mono fw-black fs-5"
                      autoFocus
                    />
                    {authError && (
                      <div className="alert alert-danger rounded-0 border-2 border-dark text-dark fw-bold mt-2 py-2">
                        ❌ Incorrect password. Please try again.
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-warning text-dark fw-black text-uppercase rounded-0 border border-3 border-dark w-100 py-3 shadow-[4px_4px_0px_0px_black]"
                  >
                    Unlock Maintenance Control Center
                  </button>
                </form>
              </div>
            ) : (
              /* Authenticated Dashboard */
              <div className="space-y-4">
                
                {/* Action Feedback Banner */}
                {actionMessage && (
                  <div className="alert alert-success rounded-0 border border-3 border-dark fw-bold text-dark shadow-[4px_4px_0px_0px_black] d-flex align-items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span>{actionMessage}</span>
                  </div>
                )}

                {/* Status Overview Cards */}
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="card bg-light text-dark rounded-0 border border-3 border-dark p-3 shadow-[4px_4px_0px_0px_black] d-flex flex-row align-items-center gap-3">
                      <div className="p-3 bg-success text-white border border-2 border-dark rounded-0">
                        <Trash2 className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="d-block text-muted small fw-bold text-uppercase">Total Connected Bins</span>
                        <span className="fs-5 fw-black text-dark">3 Active IoT Units</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card bg-light text-dark rounded-0 border border-3 border-dark p-3 shadow-[4px_4px_0px_0px_black] d-flex flex-row align-items-center gap-3">
                      <div className="p-3 bg-danger text-white border border-2 border-dark rounded-0">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="d-block text-muted small fw-bold text-uppercase">Bins Requiring Service</span>
                        <span className="fs-5 fw-black text-danger">1 Unit (Cafeteria)</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card bg-light text-dark rounded-0 border border-3 border-dark p-3 shadow-[4px_4px_0px_0px_black] d-flex flex-row align-items-center gap-3">
                      <div className="p-3 bg-info text-dark border border-2 border-dark rounded-0">
                        <Activity className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="d-block text-muted small fw-bold text-uppercase">Telemetry Status</span>
                        <span className="fs-5 fw-black text-dark">100% Online (MQTT)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bin Diagnostics Table / Cards */}
                <div className="mt-4">
                  <h4 className="fw-black text-uppercase text-dark mb-3 d-flex align-items-center gap-2">
                    <HardDrive className="w-5 h-5 text-success" />
                    <span>Live Smart Bin Sensors & Physical Condition</span>
                  </h4>

                  <div className="space-y-3">
                    {bins.map((bin) => (
                      <div 
                        key={bin.id}
                        className={`card rounded-0 border border-3 border-dark p-4 shadow-[4px_4px_0px_0px_black] ${
                          bin.isFull ? 'bg-danger-subtle border-danger' : 'bg-white'
                        }`}
                      >
                        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 pb-3 border-bottom border-dark">
                          <div className="d-flex align-items-center gap-3">
                            <span className={`badge rounded-0 fw-black px-3 py-2 font-mono ${
                              bin.isFull ? 'bg-danger text-white' : 'bg-dark text-white border border-dark'
                            }`}>
                              {bin.id}
                            </span>
                            <div>
                              <h5 className="fw-black text-uppercase m-0">{bin.location}</h5>
                              <p className="small fw-bold m-0 mt-1">
                                Status: <span className={bin.isFull ? 'text-danger' : 'text-success'}>{bin.status}</span>
                              </p>
                            </div>
                          </div>

                          <div>
                            {activeBinForEmpty === bin.id ? (
                              <form onSubmit={(e) => handleConfirmEmpty(bin.id, e)} className="d-flex align-items-center gap-2">
                                <input
                                  type="password"
                                  value={staffIdInput}
                                  onChange={(e) => setStaffIdInput(e.target.value)}
                                  placeholder="Enter Staff ID..."
                                  className="form-control form-control-sm rounded-0 border-2 border-dark fw-mono"
                                  style={{ width: '140px' }}
                                  autoFocus
                                />
                                <button
                                  type="submit"
                                  className="btn btn-sm btn-success text-white fw-bold rounded-0 border border-2 border-dark"
                                >
                                  Confirm
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setActiveBinForEmpty(null); setStaffIdInput(''); setStaffIdError(false); }}
                                  className="btn btn-sm btn-outline-dark rounded-0 border-2"
                                >
                                  Cancel
                                </button>
                              </form>
                            ) : (
                              <button
                                onClick={() => { setActiveBinForEmpty(bin.id); setStaffIdInput(''); setStaffIdError(false); }}
                                className="btn btn-sm btn-success text-white fw-bold rounded-0 border border-2 border-dark px-3 py-1.5 shadow-[2px_2px_0px_0px_black]"
                                title="Reset capacity after collection"
                              >
                                <RefreshCw className="w-3.5 h-3.5 me-1 inline" />
                                <span>Mark Emptied</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {staffIdError && activeBinForEmpty === bin.id && (
                          <div className="alert alert-danger rounded-0 border-2 border-dark py-1 px-2 my-2 small fw-bold">
                            ❌ Invalid Staff ID. Please enter an authorized staff ID to confirm.
                          </div>
                        )}

                        {/* Fill Level Progress */}
                        <div className="mt-3">
                          <div className="d-flex justify-content-between small font-mono fw-bold mb-1">
                            <span>Bin Fill Capacity</span>
                            <span className={bin.fillLevel >= 90 ? 'text-danger fw-black' : bin.fillLevel >= 70 ? 'text-warning fw-black' : 'text-success fw-black'}>
                              {bin.fillLevel}% {bin.fillLevel >= 90 ? '🚨 FULL' : bin.fillLevel >= 70 ? '⚠️ High' : '🟢 Optimal'}
                            </span>
                          </div>
                          <div className="progress rounded-0 border border-2 border-dark" style={{ height: '14px' }}>
                            <div
                              className={`progress-bar ${
                                bin.fillLevel >= 90 ? 'bg-danger' : bin.fillLevel >= 70 ? 'bg-warning' : 'bg-success'
                              }`}
                              style={{ width: `${bin.fillLevel}%` }}
                            />
                          </div>
                        </div>

                        {/* Sensor & Hardware Specs Grid */}
                        <div className="row g-2 mt-3 pt-2 border-top border-dark">
                          <div className="col-6 col-md-3">
                            <div className="bg-light p-2 border border-2 border-dark small">
                              <span className="text-muted d-block small fw-bold text-uppercase">Physical State</span>
                              <span className="fw-bold text-truncate d-block">{bin.condition}</span>
                            </div>
                          </div>

                          <div className="col-6 col-md-3">
                            <div className="bg-light p-2 border border-2 border-dark small">
                              <span className="text-muted d-block small fw-bold text-uppercase">Battery Voltage</span>
                              <span className="fw-bold text-truncate d-block">{bin.battery}</span>
                            </div>
                          </div>

                          <div className="col-6 col-md-3">
                            <div className="bg-light p-2 border border-2 border-dark small">
                              <span className="text-muted d-block small fw-bold text-uppercase">Controller Temp</span>
                              <span className="fw-bold text-truncate d-block">{bin.temperature}</span>
                            </div>
                          </div>

                          <div className="col-6 col-md-3">
                            <div className="bg-light p-2 border border-2 border-dark small">
                              <span className="text-muted d-block small fw-bold text-uppercase">WiFi / RSSI</span>
                              <span className="fw-bold text-truncate d-block">{bin.rssi}</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 pt-4 border-top border-dark mt-4">
                  <span className="text-muted small font-mono">
                    Connected via REST & MQTT telemetry to Raspberry Pi Zero W units.
                  </span>
                  <button
                    onClick={() => setIsAuthenticated(false)}
                    className="btn btn-outline-dark rounded-0 fw-bold border-2"
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
