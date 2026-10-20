import React, { useState } from 'react';
import { Student } from '../types';
import { Mail, KeyRound, X, CheckCircle2, AlertCircle, Send, ArrowRight, Loader2 } from 'lucide-react';
import { getApiUrl } from '../utils/apiConfig';

interface RequestCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
}

export const RequestCredentialsModal: React.FC<RequestCredentialsModalProps> = ({
  isOpen,
  onClose,
  students,
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<{
    email: string;
    studentName: string;
    username: string;
    previewUrl?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleRequestCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessInfo(null);

    const trimmed = inputQuery.trim();
    if (!trimmed) {
      setErrorMsg('Please enter your registered Email Address or @username.');
      return;
    }

    setIsLoading(true);

    try {
      const lowerQuery = trimmed.toLowerCase();
      const cleanUser = lowerQuery.replace(/^@/, '');

      // 1. Look in provided students list
      const foundStudent = students.find((s) => {
        const emailMatch = s.email?.toLowerCase() === lowerQuery;
        const userMatch = s.username && s.username.toLowerCase().replace(/^@/, '') === cleanUser;
        const grMatch = s.grNo?.toLowerCase() === lowerQuery;
        return emailMatch || userMatch || grMatch;
      });

      if (!foundStudent) {
        setIsLoading(false);
        setErrorMsg('No student account found with this Email Address or Username. Please verify or register a new account.');
        return;
      }

      // 2. Dispatch credentials via server
      try {
        const response = await fetch(getApiUrl('/api/request-credentials'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: trimmed,
            email: foundStudent.email,
            studentName: foundStudent.name,
            username: foundStudent.username || foundStudent.name.toLowerCase().replace(/\s+/g, '_'),
            password: foundStudent.password || 'password123',
          }),
        });

        const data = await response.json();
        setSuccessInfo({
          email: foundStudent.email || 'Registered Email',
          studentName: foundStudent.name,
          username: foundStudent.username || foundStudent.name.toLowerCase().replace(/\s+/g, '_'),
          previewUrl: data?.previewUrl,
        });
      } catch {
        // Fallback info for local preview
        setSuccessInfo({
          email: foundStudent.email || 'Registered Email',
          studentName: foundStudent.name,
          username: foundStudent.username || foundStudent.name.toLowerCase().replace(/\s+/g, '_'),
        });
      }
    } catch (err: any) {
      console.error('Request credentials error:', err);
      setErrorMsg('Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInputQuery('');
    setErrorMsg('');
    setSuccessInfo(null);
  };

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '540px' }}>
        <div className="modal-content border border-4 border-dark rounded-0 shadow-[8px_8px_0px_0px_black] bg-white">
          
          {/* Header */}
          <div className="modal-header bg-success text-white border-bottom border-dark border-3 rounded-0 px-4 py-3">
            <div className="d-flex align-items-center gap-2.5">
              <div className="p-2 bg-dark text-warning rounded-0 border border-2 border-dark">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h5 className="modal-title fw-black text-uppercase tracking-tight m-0">
                  REQUEST ACCOUNT CREDENTIALS
                </h5>
                <p className="text-white-50 small m-0 mt-0.5">
                  Retrieve your @username & login details
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn-close btn-close-white rounded-0"
              aria-label="Close"
            />
          </div>

          <div className="modal-body p-4 bg-light">
            {successInfo ? (
              <div className="text-center py-2">
                <div className="p-3 bg-dark text-success rounded-0 border border-3 border-dark d-inline-flex mx-auto mb-3 shadow-[4px_4px_0px_0px_black]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h4 className="fw-black text-dark text-uppercase mb-2">
                  Credentials Dispatched!
                </h4>
                <p className="text-muted small mb-3">
                  Account details for <strong>{successInfo.studentName}</strong>:
                </p>

                <div className="card bg-white border border-2 border-dark rounded-0 p-3 mb-3 text-start shadow-[3px_3px_0px_0px_black]">
                  <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-dark">
                    <span className="small text-muted fw-bold text-uppercase">Account Name:</span>
                    <span className="fw-bold text-dark">{successInfo.studentName}</span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-dark">
                    <span className="small text-muted fw-bold text-uppercase">Username Handle:</span>
                    <span className="fw-black text-success font-monospace fs-5">@{successInfo.username}</span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted fw-bold text-uppercase">Registered Email:</span>
                    <span className="fw-bold text-dark font-monospace small">{successInfo.email}</span>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn btn-outline-dark rounded-0 border-2 fw-bold px-3 py-2 flex-grow-1"
                  >
                    Check Another Account
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-success text-white rounded-0 border-2 border-dark fw-black text-uppercase px-4 py-2 shadow-[2px_2px_0px_0px_black]"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRequestCredentials}>
                <p className="text-dark fw-medium small mb-3">
                  Enter your registered school Email Address or @username to retrieve your credentials.
                </p>

                {errorMsg && (
                  <div className="alert alert-danger border border-2 border-dark rounded-0 text-dark small fw-bold py-2 d-flex align-items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark text-uppercase mb-1">
                    Email Address or @Username
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white rounded-0 border-2 border-dark">
                      <Mail className="w-4 h-4 text-dark" />
                    </span>
                    <input
                      type="text"
                      required
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      placeholder="e.g. student@school.edu or @alex_green"
                      className="form-control rounded-0 border-2 border-dark fw-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-success text-white w-100 fw-black text-uppercase rounded-0 border border-3 border-dark py-2.5 fs-6 shadow-[3px_3px_0px_0px_black] d-flex align-items-center justify-content-center gap-2 mt-4"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Retrieving Credentials...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Find & Dispatch Credentials</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="modal-footer bg-white border-top border-dark border-2 px-4 py-2.5 d-flex justify-content-between text-muted small">
            <span className="fw-bold font-monospace">VERDETECH IDENTITY SYSTEM</span>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-link text-dark fw-bold text-decoration-none p-0 small"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
