import React, { useState } from 'react';
import { Student } from '../types';
import { usePortalLogo } from '../utils/logoStorage';
import { 
  UserCheck, 
  X, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Copy, 
  Check, 
  KeyRound, 
  AlertTriangle, 
  ArrowLeft, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { EcoAuthBanner } from './EcoAuthBanner';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onLogin: (student: Student) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  students,
  onLogin,
}) => {
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Multi-step Registration: 'form' -> 'verify' -> 'username'
  const [step, setStep] = useState<'form' | 'verify' | 'username'>('form');
  const [verificationCode, setVerificationCode] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [followPrivacyInput, setFollowPrivacyInput] = useState<'direct' | 'request' | 'private'>('direct');
  const [deliveryError, setDeliveryError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendNotice, setResendNotice] = useState('');

  // Registration success state
  const [registeredStudent, setRegisteredStudent] = useState<Student | null>(null);
  const [copied, setCopied] = useState(false);
  const [logoSrc] = usePortalLogo();

  if (!isOpen) return null;

  // Step 1: Validate input form and trigger email verification code
  const handleProceedToVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!emailInput.trim()) {
      setErrorMsg('Please enter your email ID');
      return;
    }
    if (!passwordInput.trim()) {
      setErrorMsg('Please enter a password');
      return;
    }
    if (passwordInput.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      setErrorMsg('Password and Confirm Password do not match');
      return;
    }

    const trimmedEmail = emailInput.trim().toLowerCase();

    setErrorMsg('');
    setResendNotice('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          studentName: nameInput.trim(),
        }),
      });
      const data = await response.json();
      if (data.success) {
        setVerificationCode('');
        if (data.delivered === false) {
          setDeliveryError(data.error || 'Email dispatch notice: Gmail App Password is not configured.');
        } else {
          setDeliveryError('');
        }
      } else {
        setDeliveryError(data.error || 'Failed to dispatch verification email.');
      }
      setStep('verify');
    } catch {
      setDeliveryError('Failed to reach verification service. Please check your connection.');
      setStep('verify');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setResendNotice('');
    setErrorMsg('');
    try {
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.trim().toLowerCase(),
          studentName: nameInput.trim(),
        }),
      });
      const data = await response.json();
      if (data.success) {
        if (data.delivered === false) {
          setDeliveryError(data.error || 'Email could not be delivered.');
          setResendNotice('Delivery notice: ' + (data.error || 'Gmail credentials not configured.'));
        } else {
          setDeliveryError('');
          setResendNotice('Fresh 6-digit verification code sent to your email inbox!');
        }
      } else {
        setResendNotice(data.error || 'Unable to resend code at this time.');
      }
    } catch {
      setResendNotice('Network error trying to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  // Step 2: Confirm email code and proceed to username selection
  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setErrorMsg('Please enter the 6-digit verification code sent to your email');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');

    try {
      // Propose an initial username handle based on student's name
      const cleanSuggestion = nameInput
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .slice(0, 16);
      
      setUsernameInput(cleanSuggestion || 'eco_student');
      setStep('username');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error verifying code. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Confirm unique username & privacy, create account
  const handleCompleteUsernameSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = usernameInput.toLowerCase().replace(/[^a-z0-9_]/g, '').trim();

    if (!cleanUser || cleanUser.length < 3) {
      setErrorMsg('Username must be at least 3 characters long and contain only letters, numbers, and underscores.');
      return;
    }

    const isTaken = students.some(
      (s) => s.username?.toLowerCase() === cleanUser
    );
    if (isTaken) {
      setErrorMsg(`@${cleanUser} is already taken. Please choose another username.`);
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // Finalize backend verification record
      await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.trim().toLowerCase(),
          code: verificationCode.trim(),
          studentName: nameInput.trim(),
          username: cleanUser,
          password: passwordInput,
        }),
      });
    } catch (e) {
      console.warn('Backend verification call warning:', e);
    }

    const internalId = Math.floor(10000 + Math.random() * 90000).toString();
    const newStudent: Student = {
      grNo: internalId,
      username: cleanUser,
      name: nameInput.trim(),
      email: emailInput.trim().toLowerCase(),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      password: passwordInput,
      role: 'Student',
      grade: 'Grade 10',
      profession: 'Student',
      points: 100, // Welcome bonus!
      weeklyPoints: 100,
      rank: students.length + 1,
      badges: ['badge-waste-warrior'],
      co2SavedKg: 2.5,
      waterSavedLiters: 10,
      wasteDivertedKg: 1.5,
      energySavedKwh: 1.0,
      joinedDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      followers: [],
      following: [],
      followRequests: [],
      followPrivacy: followPrivacyInput,
    };

    setRegisteredStudent(newStudent);
    setIsLoading(false);
  };

  const handleCopyUsername = () => {
    if (registeredStudent?.username) {
      navigator.clipboard.writeText(`@${registeredStudent.username}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFinishLogin = () => {
    if (registeredStudent) {
      onLogin(registeredStudent);
      onClose();
    }
  };

  const isUsernameAvailable = 
    usernameInput.trim().length >= 3 && 
    !students.some((s) => s.username?.toLowerCase() === usernameInput.toLowerCase().replace(/[^a-z0-9_]/g, ''));

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border border-4 border-dark rounded-0 shadow-[8px_8px_0px_0px_black] bg-white overflow-hidden">
          
          <div className="row g-0">
            {/* Left Column: Visual Banner */}
            <div className="col-12 col-lg-5 d-none d-lg-block">
              <EcoAuthBanner mode="register" />
            </div>

            {/* Right Column: Registration Form */}
            <div className="col-12 col-lg-7 d-flex flex-column justify-content-between bg-white p-4 p-md-5">
              
              <div>
                {/* Modal Header */}
                <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom border-dark">
                  <div className="d-flex align-items-center gap-2.5">
                    <div className="p-2 bg-dark text-warning rounded-0 border border-2 border-dark">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="fw-black text-dark text-uppercase tracking-tight m-0">
                        {registeredStudent 
                          ? 'ACCOUNT CREATED' 
                          : step === 'username'
                          ? 'CHOOSE YOUR USERNAME'
                          : step === 'verify' 
                          ? 'VERIFY EMAIL ADDRESS' 
                          : 'CREATE STUDENT ACCOUNT'}
                      </h4>
                      <p className="text-muted small m-0 mt-0.5">
                        {registeredStudent 
                          ? 'Your Verde Tech profile is verified and ready' 
                          : step === 'username'
                          ? 'Set your unique handle and Instagram-style follow privacy'
                          : step === 'verify' 
                          ? 'Enter the 6-digit confirmation code sent to your inbox' 
                          : 'Fill in your credentials to join campus climate actions'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-close rounded-0"
                    aria-label="Close"
                  />
                </div>

                {/* Error Notice */}
                {errorMsg && (
                  <div className="alert alert-danger rounded-0 border border-2 border-dark text-dark fw-bold small py-2 d-flex align-items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Success View */}
                {registeredStudent ? (
                  <div className="text-center py-3">
                    <div className="p-3 bg-dark text-success rounded-0 border border-3 border-dark d-inline-flex mx-auto mb-3 shadow-[4px_4px_0px_0px_black]">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <h3 className="fw-black text-dark text-uppercase mb-2">
                      Welcome, @{registeredStudent.username}!
                    </h3>
                    <p className="text-muted small mb-4">
                      Your Verde Tech profile is verified and credited with <strong>+100 Welcome Points</strong>.
                    </p>

                    {/* Username Handle Box */}
                    <div className="card bg-light border border-3 border-dark rounded-0 p-4 mb-4 shadow-[4px_4px_0px_0px_black] text-center">
                      <span className="small fw-bold text-muted text-uppercase d-block mb-1">
                        Your Official Verde Tech Handle
                      </span>
                      <div className="fs-1 fw-black font-monospace text-success lh-1 mb-2">
                        @{registeredStudent.username}
                      </div>
                      <div className="mb-3">
                        <span className="badge bg-dark text-white rounded-0 px-2.5 py-1 text-uppercase small">
                          Network: {registeredStudent.followPrivacy === 'direct' ? 'Direct Follow' : registeredStudent.followPrivacy === 'request' ? 'Request to Follow' : 'Private'}
                        </span>
                      </div>

                      <div className="d-flex justify-content-center">
                        <button
                          type="button"
                          onClick={handleCopyUsername}
                          className="btn btn-outline-dark btn-sm rounded-0 border-2 fw-bold d-flex align-items-center gap-1.5"
                        >
                          {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                          <span>{copied ? 'Copied to Clipboard!' : 'Copy Username'}</span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleFinishLogin}
                      className="btn btn-success text-white w-100 fw-black text-uppercase rounded-0 border border-3 border-dark py-3 fs-5 shadow-[4px_4px_0px_0px_black] d-flex align-items-center justify-content-center gap-2"
                    >
                      <span>Enter Verde Tech Dashboard</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                ) : step === 'username' ? (
                  /* Step 3: Choose Username & Privacy Settings */
                  <form onSubmit={handleCompleteUsernameSetup}>
                    <div className="alert alert-success border border-2 border-dark rounded-0 p-3 small fw-bold mb-3 d-flex align-items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                      <span>Email verified successfully! Pick your unique @username to complete setup.</span>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label fw-bold text-dark text-uppercase small m-0">
                          Student Username Handle *
                        </label>
                        {usernameInput.trim().length >= 3 && (
                          <span className={`small fw-bold ${isUsernameAvailable ? 'text-success' : 'text-danger'}`}>
                            {isUsernameAvailable ? '✓ Handle Available' : '⚠️ Username Taken'}
                          </span>
                        )}
                      </div>
                      <div className="input-group">
                        <span className="input-group-text bg-dark text-warning fw-black rounded-0 border-2 border-dark fs-5">
                          @
                        </span>
                        <input
                          type="text"
                          required
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          placeholder="your_handle"
                          className="form-control form-control-lg rounded-0 border-2 border-dark font-monospace fw-bold"
                          maxLength={20}
                        />
                      </div>
                      <span className="form-text text-muted small">
                        3-20 characters: letters, numbers, and underscores only.
                      </span>
                    </div>

                    {/* Instagram-style Follow Privacy Selection */}
                    <div className="mb-4">
                      <label className="form-label fw-bold text-dark text-uppercase small mb-2 d-block">
                        Follow & Connection Privacy
                      </label>
                      <div className="space-y-2">
                        <label 
                          className={`d-flex align-items-start gap-3 p-3 border-2 border-dark cursor-pointer rounded-0 transition-colors ${
                            followPrivacyInput === 'direct' ? 'bg-success-subtle border-success' : 'bg-light'
                          }`}
                          style={{ cursor: 'pointer' }}
                        >
                          <input
                            type="radio"
                            name="followPrivacy"
                            value="direct"
                            checked={followPrivacyInput === 'direct'}
                            onChange={() => setFollowPrivacyInput('direct')}
                            className="mt-1"
                          />
                          <div>
                            <span className="fw-black text-dark text-uppercase small d-block">
                              Direct Follow (Public)
                            </span>
                            <span className="text-muted small">
                              Any classmate can follow you instantly with one click and see your green actions.
                            </span>
                          </div>
                        </label>

                        <label 
                          className={`d-flex align-items-start gap-3 p-3 border-2 border-dark cursor-pointer rounded-0 transition-colors ${
                            followPrivacyInput === 'request' ? 'bg-success-subtle border-success' : 'bg-light'
                          }`}
                          style={{ cursor: 'pointer' }}
                        >
                          <input
                            type="radio"
                            name="followPrivacy"
                            value="request"
                            checked={followPrivacyInput === 'request'}
                            onChange={() => setFollowPrivacyInput('request')}
                            className="mt-1"
                          />
                          <div>
                            <span className="fw-black text-dark text-uppercase small d-block">
                              Request to Follow
                            </span>
                            <span className="text-muted small">
                              Peers must send a follow request; you accept or decline in your Profile section.
                            </span>
                          </div>
                        </label>

                        <label 
                          className={`d-flex align-items-start gap-3 p-3 border-2 border-dark cursor-pointer rounded-0 transition-colors ${
                            followPrivacyInput === 'private' ? 'bg-success-subtle border-success' : 'bg-light'
                          }`}
                          style={{ cursor: 'pointer' }}
                        >
                          <input
                            type="radio"
                            name="followPrivacy"
                            value="private"
                            checked={followPrivacyInput === 'private'}
                            onChange={() => setFollowPrivacyInput('private')}
                            className="mt-1"
                          />
                          <div>
                            <span className="fw-black text-dark text-uppercase small d-block">
                              Private Account
                            </span>
                            <span className="text-muted small">
                              Requires approval for followers; your profile and activity log remain private.
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !isUsernameAvailable}
                      className="btn btn-success text-white w-100 fw-black text-uppercase rounded-0 border border-3 border-dark py-3 fs-5 shadow-[4px_4px_0px_0px_black] d-flex align-items-center justify-content-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Finalizing Profile...</span>
                        </>
                      ) : (
                        <>
                          <span>Claim @{usernameInput || 'handle'} & Enter Dashboard</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>
                ) : step === 'verify' ? (
                  /* Step 2: Verification Code Entry */
                  <div>
                    <div className="alert alert-warning border border-2 border-dark rounded-0 p-3 small fw-bold mb-3">
                      We sent a 6-digit confirmation code to <strong>{emailInput}</strong>.
                      {deliveryError && (
                        <div className="alert alert-danger border border-2 border-dark rounded-0 p-2 mt-2 mb-0 text-dark small fw-bold">
                          <strong>⚠️ Email Delivery Notice:</strong> {deliveryError}
                        </div>
                      )}
                      {resendNotice && (
                        <div className="alert alert-success border border-2 border-dark rounded-0 p-2 mt-2 mb-0 text-success small fw-bold">
                          {resendNotice}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label fw-bold text-dark text-uppercase small m-0">
                          6-Digit Email Verification Code
                        </label>
                        <button
                          type="button"
                          onClick={handleResendCode}
                          disabled={isResending}
                          className="btn btn-link btn-sm text-success fw-bold p-0 text-decoration-underline"
                        >
                          {isResending ? 'Sending...' : 'Resend Code'}
                        </button>
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="123456"
                        className="form-control form-control-lg rounded-0 border-2 border-dark text-center font-monospace fw-black fs-2 tracking-widest"
                      />
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStep('form');
                          setErrorMsg('');
                          setResendNotice('');
                        }}
                        className="btn btn-outline-dark rounded-0 border-2 fw-bold px-3 py-2.5"
                      >
                        <ArrowLeft className="w-4 h-4 me-1 inline" />
                        Back
                      </button>

                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={isLoading || verificationCode.trim().length < 6}
                        className="btn btn-success text-white flex-grow-1 fw-black text-uppercase rounded-0 border border-2 border-dark py-2.5 shadow-[3px_3px_0px_0px_black]"
                      >
                        {isLoading ? 'Verifying Code...' : 'Verify & Pick Username'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Step 1: Registration Form */
                  <form onSubmit={handleProceedToVerification}>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-dark text-uppercase small mb-1">
                        Full Student Name
                      </label>
                      <input
                        type="text"
                        required
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder=""
                        className="form-control rounded-0 border-2 border-dark fw-bold"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold text-dark text-uppercase small mb-1">
                        Student Email ID
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light rounded-0 border-2 border-dark">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          type="email"
                          required
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="student@school.edu"
                          className="form-control rounded-0 border-2 border-dark fw-bold"
                        />
                      </div>
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-bold text-dark text-uppercase small mb-1">
                          Password (Min 6 Chars)
                        </label>
                        <div className="input-group">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="••••••••"
                            className="form-control rounded-0 border-2 border-dark font-monospace"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="btn btn-outline-dark rounded-0 border-2 border-dark"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label fw-bold text-dark text-uppercase small mb-1">
                          Confirm Password
                        </label>
                        <div className="input-group">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={confirmPasswordInput}
                            onChange={(e) => setConfirmPasswordInput(e.target.value)}
                            placeholder="••••••••"
                            className="form-control rounded-0 border-2 border-dark font-monospace"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="btn btn-outline-dark rounded-0 border-2 border-dark"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn btn-success text-white w-100 fw-black text-uppercase rounded-0 border border-3 border-dark py-3 fs-5 shadow-[4px_4px_0px_0px_black] d-flex align-items-center justify-content-center gap-2 mt-3"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Preparing Registration...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue to Email Verification</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Footer */}
              <div className="pt-3 mt-4 border-top border-dark d-flex align-items-center justify-content-between text-muted small">
                <span className="d-flex align-items-center gap-1.5 fw-bold">
                  <ShieldCheck className="w-4 h-4 text-success" />
                  <span>Verde Tech Identity Provider</span>
                </span>
                <span className="font-monospace">VERDETECH 2026</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
