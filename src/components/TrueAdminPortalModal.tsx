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
  FileText
} from 'lucide-react';
import { ActivityLog } from '../types';

interface TrueAdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ActivityLog[];
}

export const TrueAdminPortalModal: React.FC<TrueAdminPortalModalProps> = ({
  isOpen,
  onClose,
  logs,
}) => {
  const [step, setStep] = useState<'auth' | 'verify' | 'dashboard'>('auth');
  const [staffId, setStaffId] = useState<string>('');
  const [email, setEmail] = useState<string>('subashiniompop@gmail.com');
  const [code, setCode] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'usage' | 'emptying' | 'sensors'>('usage');
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

    const matchedAdmin = AUTHORIZED_ADMINS.find(
      (a) => a.staffId === trimmedStaff && a.email.toLowerCase() === trimmedEmail
    );

    if (!matchedAdmin) {
      setErrorMsg('❌ Invalid Staff ID or authorized email. Access denied.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          studentName: matchedAdmin.name,
          ecoNumber: trimmedStaff,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Verification code sent to ${trimmedEmail}. Please check your inbox.`);
        setStep('verify');
      } else {
        setErrorMsg(data.error || 'Failed to send verification code.');
      }
    } catch (err) {
      setErrorMsg('Network error sending verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setStep('dashboard');
        setSuccessMsg('Authentication successful. Welcome to True Admin Portal.');
      } else {
        setErrorMsg('❌ Invalid verification code. Please check and try again.');
      }
    } catch (err) {
      setErrorMsg('Verification network error.');
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
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content rounded-0 border border-4 border-dark shadow-[8px_8px_0px_0px_black]">
          
          {/* Header */}
          <div className="modal-header bg-dark text-white rounded-0 border-bottom border-4 border-dark d-flex align-items-center justify-content-between p-3 p-md-4">
            <div className="d-flex align-items-center gap-3">
              <div className="p-2.5 bg-danger text-white border border-2 border-white rounded-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="badge bg-danger text-white fw-bold px-2.5 py-1 rounded-0 text-uppercase border border-dark">
                  Restricted Access • Authorized Personnel Only
                </span>
                <h3 className="h4 fw-black text-uppercase text-white tracking-tight m-0 mt-1">
                  True Admin Portal & Audit Logs
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

          {/* Content */}
          <div className="modal-body bg-white text-dark p-4 p-md-5">
            {step === 'auth' && (
              <div className="max-w-md mx-auto py-4 text-center" style={{ maxWidth: '480px' }}>
                <div className="p-3 bg-light border border-3 border-dark rounded-0 d-inline-flex align-items-center justify-content-center text-dark mb-3">
                  <KeyRound className="w-10 h-10 text-danger" />
                </div>

                <h3 className="fw-black text-uppercase text-dark mb-2">Admin Staff Authentication</h3>
                <p className="text-muted fw-medium small mb-4">
                  Enter your authorized Staff ID and registered email address to receive a verification code.
                </p>

                <form onSubmit={handleRequestCode} className="text-start space-y-3">
                  <div>
                    <label className="form-label fw-bold text-uppercase small">Staff ID</label>
                    <input
                      type="password"
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      placeholder="Enter Staff ID (e.g. 201120)..."
                      className="form-control rounded-0 border-2 border-dark py-2.5 fw-mono fw-bold"
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="form-label fw-bold text-uppercase small">Registered Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="subashiniompop@gmail.com"
                      className="form-control rounded-0 border-2 border-dark py-2.5 fw-mono fw-bold"
                      required
                    />
                  </div>

                  {errorMsg && (
                    <div className="alert alert-danger rounded-0 border-2 border-dark text-dark fw-bold py-2 small">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-danger text-white fw-black text-uppercase rounded-0 border border-3 border-dark w-100 py-3 shadow-[4px_4px_0px_0px_black] d-flex align-items-center justify-content-center gap-2 mt-3"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{loading ? 'Sending Verification Code...' : 'Send Email Verification Code'}</span>
                  </button>
                </form>
              </div>
            )}

            {step === 'verify' && (
              <div className="max-w-md mx-auto py-4 text-center" style={{ maxWidth: '480px' }}>
                <div className="p-3 bg-light border border-3 border-dark rounded-0 d-inline-flex align-items-center justify-content-center text-dark mb-3">
                  <Mail className="w-10 h-10 text-success" />
                </div>

                <h3 className="fw-black text-uppercase text-dark mb-2">Enter Verification Code</h3>
                <p className="text-muted fw-medium small mb-3">
                  We have sent a 6-digit verification code to <strong className="text-dark">{email}</strong>.
                </p>

                {successMsg && (
                  <div className="alert alert-success rounded-0 border-2 border-dark text-dark fw-bold py-2 small mb-3">
                    {successMsg}
                  </div>
                )}

                <form onSubmit={handleVerifyCode} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter 6-digit code..."
                      className="form-control rounded-0 border-3 border-dark py-3 text-center fw-mono fw-black fs-4"
                      required
                      autoFocus
                    />
                    {errorMsg && (
                      <div className="alert alert-danger rounded-0 border-2 border-dark text-dark fw-bold mt-2 py-2 small">
                        {errorMsg}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-success text-white fw-black text-uppercase rounded-0 border border-3 border-dark w-100 py-3 shadow-[4px_4px_0px_0px_black]"
                  >
                    {loading ? 'Verifying...' : 'Verify & Enter Admin Portal'}
                  </button>
                </form>
              </div>
            )}

            {step === 'dashboard' && (
              <div className="space-y-4">
                
                {/* Tabs */}
                <div className="d-flex flex-wrap gap-2 border-bottom border-dark pb-3">
                  <button
                    onClick={() => setActiveTab('usage')}
                    className={`btn rounded-0 fw-black text-uppercase border border-3 border-dark px-3 py-2 shadow-[2px_2px_0px_0px_black] ${
                      activeTab === 'usage' ? 'btn-danger text-white' : 'btn-light text-dark'
                    }`}
                  >
                    <FileText className="w-4 h-4 me-1.5 inline" />
                    <span>Smart Bin Maintenance & Usage Records ({smartBinLogs.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('emptying')}
                    className={`btn rounded-0 fw-black text-uppercase border border-3 border-dark px-3 py-2 shadow-[2px_2px_0px_0px_black] ${
                      activeTab === 'emptying' ? 'btn-danger text-white' : 'btn-light text-dark'
                    }`}
                  >
                    <Trash2 className="w-4 h-4 me-1.5 inline" />
                    <span>Bin Emptying & Staff Logs ({emptyingRecords.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('sensors')}
                    className={`btn rounded-0 fw-black text-uppercase border border-3 border-dark px-3 py-2 shadow-[2px_2px_0px_0px_black] ${
                      activeTab === 'sensors' ? 'btn-danger text-white' : 'btn-light text-dark'
                    }`}
                  >
                    <HardDrive className="w-4 h-4 me-1.5 inline" />
                    <span>System & IoT Sensors</span>
                  </button>
                </div>

                {/* Tab 1: Smart Bin Usage */}
                {activeTab === 'usage' && (
                  <div className="space-y-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="fw-black text-uppercase m-0">
                        Smart Bin Usage & Disposal Audit Trail
                      </h5>
                      <span className="text-muted small font-mono">Showing all recorded bin interactions</span>
                    </div>

                    {smartBinLogs.length === 0 ? (
                      <div className="card bg-light text-dark rounded-0 border border-2 border-dark p-5 text-center">
                        <p className="text-muted fw-bold m-0">No smart bin disposal logs recorded yet.</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-bordered border-dark align-middle m-0">
                          <thead className="table-dark text-white">
                            <tr>
                              <th className="fw-black text-uppercase small">Timestamp</th>
                              <th className="fw-black text-uppercase small">Student Name</th>
                              <th className="fw-black text-uppercase small">Student ID</th>
                              <th className="fw-black text-uppercase small">Disposal Type / Title</th>
                              <th className="fw-black text-uppercase small">Points</th>
                              <th className="fw-black text-uppercase small">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {smartBinLogs.map((log) => (
                              <tr key={log.id}>
                                <td className="font-mono text-muted small">
                                  {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className="fw-bold">{log.studentName}</td>
                                <td><span className="badge bg-dark text-white rounded-0 font-mono">{log.grNo}</span></td>
                                <td className="fw-medium">{log.challengeTitle || log.category}</td>
                                <td className="fw-bold text-success">+{log.pointsEarned} pts</td>
                                <td>
                                  <span className="badge bg-success text-white rounded-0 fw-bold">
                                    {log.status}
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

                {/* Tab 2: Bin Emptying Records */}
                {activeTab === 'emptying' && (
                  <div className="space-y-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="fw-black text-uppercase m-0">
                        Bin Emptying & Collection Logs (Verified by Staff ID)
                      </h5>
                      <span className="text-muted small font-mono">Collection Team Audits</span>
                    </div>

                    {emptyingRecords.length === 0 ? (
                      <div className="card bg-light text-dark rounded-0 border border-2 border-dark p-5 text-center">
                        <p className="text-muted fw-bold m-0">No bin emptying collection logs recorded yet. Use the Maintenance Control Center to mark bins emptied with Staff ID.</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-bordered border-dark align-middle m-0">
                          <thead className="table-dark text-white">
                            <tr>
                              <th className="fw-black text-uppercase small">Timestamp</th>
                              <th className="fw-black text-uppercase small">Bin ID</th>
                              <th className="fw-black text-uppercase small">Staff ID</th>
                              <th className="fw-black text-uppercase small">Action Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {emptyingRecords.map((record, idx) => (
                              <tr key={record.id || idx}>
                                <td className="font-mono text-muted small">
                                  {new Date(record.timestamp).toLocaleString()}
                                </td>
                                <td><span className="badge bg-dark text-white rounded-0 font-mono">{record.binId}</span></td>
                                <td><span className="badge bg-warning text-dark rounded-0 font-mono fw-bold">Staff ID: {record.staffId}</span></td>
                                <td>
                                  <span className="badge bg-success text-white rounded-0 fw-bold">
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
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="card bg-light text-dark rounded-0 border border-3 border-dark p-4 shadow-[4px_4px_0px_0px_black]">
                        <span className="text-muted small fw-bold text-uppercase d-block mb-1">Active IoT Nodes</span>
                        <h4 className="fw-black font-mono text-dark m-0">3 Units Online</h4>
                        <p className="small text-success fw-bold m-0 mt-2">Raspberry Pi Zero W telemetry active</p>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="card bg-light text-dark rounded-0 border border-3 border-dark p-4 shadow-[4px_4px_0px_0px_black]">
                        <span className="text-muted small fw-bold text-uppercase d-block mb-1">Database Persistence</span>
                        <h4 className="fw-black font-mono text-success m-0">Firestore Synchronized</h4>
                        <p className="small text-muted fw-bold m-0 mt-2">Real-time audit log streaming</p>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="card bg-light text-dark rounded-0 border border-3 border-dark p-4 shadow-[4px_4px_0px_0px_black]">
                        <span className="text-muted small fw-bold text-uppercase d-block mb-1">Authenticated Admin</span>
                        <h6 className="fw-black font-mono text-dark m-0 text-truncate">{email}</h6>
                        <p className="small text-success fw-bold m-0 mt-2">Staff Session Verified</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="d-flex justify-content-end pt-4 border-top border-dark mt-4">
                  <button
                    onClick={() => {
                      setIsAuthenticated(false);
                      setStep('auth');
                      setCode('');
                    }}
                    className="btn btn-outline-dark rounded-0 fw-bold border-2"
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
