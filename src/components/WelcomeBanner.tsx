import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Leaf, Sparkles, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { playSound } from '../utils/soundFx';

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
    playSound('enter');
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#5ef2ff', '#7dff8a', '#ffd166', '#9d7bff'],
      });
    } catch {
      // Ignore
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
      style={{ backgroundColor: 'rgba(6, 9, 19, 0.85)', backdropFilter: 'blur(12px)', zIndex: 1065 }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px' }}>
        <div className="modal-content rounded-3xl border border-cyan-400/40 shadow-[0_0_50px_rgba(94,242,255,0.25)] bg-[#090e21] overflow-hidden text-center text-white">
          
          {/* Header Strip */}
          <div className="bg-black/40 px-5 py-3 border-b border-white/10 flex items-center justify-between">
            <span className="badge bg-cyan-950 text-cyan-300 border border-cyan-400/40 font-mono text-xs uppercase px-2.5 py-1">
              SYS.AUTH // {isLogin ? 'VERIFIED' : 'PROVISIONED'}
            </span>
            <button
              type="button"
              onClick={onDismiss}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* Mascot / Icon Badge */}
            <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-violet-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_25px_rgba(94,242,255,0.2)]">
              {isLogin ? (
                <Leaf className="w-8 h-8 text-emerald-400" />
              ) : (
                <Sparkles className="w-8 h-8 text-cyan-400" />
              )}
            </div>

            <h3 className="font-extrabold font-display text-white text-xl sm:text-2xl tracking-tight mb-2">
              {headingText}
            </h3>

            <p className="text-slate-300 text-xs sm:text-sm mb-6 leading-relaxed">
              {isLogin ? (
                <>
                  Ready to deploy your sustainability innovations? Logged in as{' '}
                  <strong className="font-mono text-cyan-300 px-1.5 py-0.5 rounded bg-black/50 border border-white/10">
                    @{displayHandle}
                  </strong>
                  .
                </>
              ) : (
                <>
                  Your student identity has been established on the Verde Tech Grid! Your handle is{' '}
                  <strong className="font-mono text-cyan-300 px-1.5 py-0.5 rounded bg-black/50 border border-white/10">
                    @{displayHandle}
                  </strong>
                  . Start logging verified actions and earn Verde credits!
                </>
              )}
            </p>

            <button
              onClick={onDismiss}
              className="w-full btn-stai-cyan justify-center py-3 text-xs sm:text-sm font-bold uppercase tracking-wider"
            >
              <span>Enter Workspace</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
