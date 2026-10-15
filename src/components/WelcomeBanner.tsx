import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Leaf, Sparkles, X, CheckCircle2, ArrowRight } from 'lucide-react';

interface WelcomeBannerProps {
  type: 'login' | 'register';
  studentName: string;
  username?: string;
  ecoNumber?: string;
  onDismiss: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  type,
  studentName,
  username,
  ecoNumber,
  onDismiss,
}) => {
  const displayHandle = username || ecoNumber || 'student';
  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#f59e0b', '#3b82f6'],
      });
    } catch {
      // Ignore if canvas is not ready
    }

    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const isLogin = type === 'login';
  const headingText = isLogin ? `Welcome Back, ${studentName}!` : `Welcome, ${studentName}!`;

  return (
    <div 
      className="modal show d-block" 
      tabIndex={-1} 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1065 }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px' }}>
        <div className="modal-content border border-4 border-dark rounded-0 shadow-[8px_8px_0px_0px_black] bg-white overflow-hidden text-center">
          
          {/* Header Strip */}
          <div className="bg-success text-white p-3 border-bottom border-dark border-3 d-flex align-items-center justify-content-between">
            <span className="badge bg-warning text-dark border border-dark rounded-0 fw-black text-uppercase px-2.5 py-1 small">
              ★ {isLogin ? 'Authentication Verified' : 'Account Created'} ★
            </span>
            <button
              type="button"
              onClick={onDismiss}
              className="btn-close btn-close-white rounded-0"
              aria-label="Dismiss"
            />
          </div>

          <div className="p-4 p-sm-5">
            {/* Mascot / Icon Badge */}
            <div className="mx-auto mb-3 p-3 bg-dark text-white rounded-0 border border-3 border-dark d-inline-flex align-items-center justify-content-center shadow-[4px_4px_0px_0px_black]" style={{ width: '64px', height: '64px' }}>
              {isLogin ? (
                <Leaf className="w-8 h-8 text-success" />
              ) : (
                <Sparkles className="w-8 h-8 text-warning" />
              )}
            </div>

            <h3 className="fw-black text-dark text-uppercase tracking-tight mb-2">
              {headingText}
            </h3>

            <p className="text-dark fw-medium small mb-4">
              {isLogin ? (
                <>
                  Ready to log your green actions today? Logged in as{' '}
                  <strong className="badge bg-dark text-warning rounded-0 font-monospace px-2 py-1 fs-6">
                    @{displayHandle}
                  </strong>
                  .
                </>
              ) : (
                <>
                  Your student profile is all set! Your handle is{' '}
                  <strong className="badge bg-dark text-warning rounded-0 font-monospace px-2 py-1 fs-6">
                    @{displayHandle}
                  </strong>
                  . Start earning points, connect with classmates, and climb the campus leaderboard!
                </>
              )}
            </p>

            <button
              onClick={onDismiss}
              className="btn btn-success text-white w-100 fw-black text-uppercase rounded-0 border border-3 border-dark py-3 fs-6 shadow-[4px_4px_0px_0px_black] d-flex align-items-center justify-content-center gap-2"
            >
              <span>{isLogin ? "Go to Dashboard" : 'Start My Green Journey'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
