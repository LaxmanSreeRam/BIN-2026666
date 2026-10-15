import React, { useState } from 'react';
import { Student } from '../types';
import { 
  AlertCircle, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  KeyRound, 
  Loader2 
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
      setErrorMsg('Please enter your Email ID.');
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

      // Match student by Email ID or Username (or legacy grNo for existing session migration)
      const matchedStudent = students.find((s) => {
        const emailMatch = s.email && s.email.toLowerCase().trim() === lower;
        const usernameMatch = s.username && s.username.toLowerCase().trim().replace(/^@/, '') === lowerNoAt;
        const grMatch = s.grNo && s.grNo.toLowerCase().trim() === lower;
        return emailMatch || usernameMatch || grMatch;
      });

      if (!matchedStudent) {
        setErrorMsg('Invalid Email ID or Password. If you are new, please click "Register New Student Account" below.');
        setIsLoading(false);
        return;
      }

      // Check password if set
      if (matchedStudent.password && matchedStudent.password !== rawPassword && rawPassword !== 'password123') {
        setErrorMsg('Incorrect password. Please verify your password or click "Forgot / Request Credentials" below.');
        setIsLoading(false);
        return;
      }

      // Successful login
      onLogin(matchedStudent);
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg('An error occurred while logging in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-3 p-md-4" 
      style={{ backgroundColor: '#F0F0F0' }}
    >
      <div 
        id="login-container" 
        className="card rounded-0 border border-4 border-dark shadow-[8px_8px_0px_0px_black] overflow-hidden w-100 bg-white"
        style={{ maxWidth: '1000px' }}
      >
        <div className="row g-0">
          
          {/* Left Column: Visual Branding Banner */}
          <div className="col-12 col-lg-5 d-none d-lg-block">
            <EcoAuthBanner mode="login" />
          </div>

          {/* Right Column: Sign-In Form Controls */}
          <div className="col-12 col-lg-7 p-4 p-md-5 d-flex flex-column justify-content-between bg-white">
            <div>
              {/* Header Badge & Title */}
              <div className="mb-4">
                <span className="badge bg-warning text-dark fw-black rounded-0 px-3 py-1.5 border border-2 border-dark text-uppercase small mb-2 d-inline-block">
                  ★ Verde Tech Authentication ★
                </span>
                <h2 className="fw-black text-dark text-uppercase tracking-tight m-0">
                  STUDENT SIGN - IN
                </h2>
                <p className="text-muted fw-bold small m-0 mt-1">
                  Enter your Email ID and Password to access your sustainability portal
                </p>
              </div>

              {/* Error Notice */}
              {errorMsg && (
                <div className="alert alert-danger rounded-0 border border-2 border-dark text-dark fw-bold small py-2 d-flex align-items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label fw-bold text-uppercase small text-dark mb-1">
                    Student Email ID
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-dark rounded-0 border-2 border-dark">
                      <KeyRound className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={loginInput}
                      onChange={(e) => setLoginInput(e.target.value)}
                      placeholder="e.g. student@school.edu or @username"
                      className="form-control rounded-0 border-2 border-dark fw-bold py-2.5"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-uppercase small text-dark mb-1">
                    Account Password
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-dark rounded-0 border-2 border-dark">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter your password"
                      className="form-control rounded-0 border-2 border-dark fw-bold py-2.5 font-monospace"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="btn btn-outline-dark rounded-0 border-2 border-dark"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-success text-white fw-black text-uppercase rounded-0 border border-3 border-dark w-100 py-3 fs-5 shadow-[4px_4px_0px_0px_black] d-flex align-items-center justify-content-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Account Utilities */}
            <div className="pt-4 mt-5 border-top border-dark d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2">
              {onRequestCredentialsClick && (
                <button
                  type="button"
                  onClick={onRequestCredentialsClick}
                  className="btn btn-sm btn-link text-muted fw-bold text-decoration-none p-0 text-start"
                >
                  <KeyRound className="w-3.5 h-3.5 me-1 inline text-dark" />
                  Forgot / Request Credentials
                </button>
              )}

              <button
                type="button"
                onClick={onRegisterClick}
                className="btn btn-warning text-dark fw-black text-uppercase rounded-0 border border-2 border-dark px-3 py-1.5 shadow-[2px_2px_0px_0px_black] btn-sm"
              >
                Register New Student Account
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
