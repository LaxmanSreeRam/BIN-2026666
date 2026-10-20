import React from 'react';
import { usePortalLogo } from '../utils/logoStorage';
import { Leaf, ShieldCheck, CheckCircle2, Trees, Recycle, Award, Sparkles } from 'lucide-react';

interface EcoAuthBannerProps {
  isPasswordVisible?: boolean;
  isPasswordFocused?: boolean;
  mode?: 'login' | 'register';
}

export const EcoAuthBanner: React.FC<EcoAuthBannerProps> = ({
  mode = 'login',
}) => {
  const [logoSrc] = usePortalLogo();

  return (
    <div className="h-full p-6 sm:p-10 text-white flex flex-col justify-between relative bg-gradient-to-b from-[#0a0e24] via-[#070b1a] to-[#04060e] border-r border-white/10">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />
      
      {/* Top Brand Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-mono text-xs font-semibold uppercase tracking-wider shadow-[0_0_15px_rgba(94,242,255,0.2)]">
            <Leaf className="w-3.5 h-3.5 text-cyan-400 inline" />
            <span>VERDE TECH</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
            AUTH 2026
          </span>
        </div>

        {/* Center Official Logo Showcase */}
        <div className="text-center my-6 py-2">
          <div className="relative inline-block mx-auto mb-5 p-2 rounded-2xl bg-black/60 border border-cyan-400/40 shadow-[0_0_30px_rgba(94,242,255,0.2)]">
            <img
              src={logoSrc || '/logo.jpg'}
              alt="Verde Tech Official Logo"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/logo.jpg';
              }}
              className="w-auto h-20 sm:h-24 object-contain rounded-xl"
            />
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display tracking-tight uppercase">
            VERDE TECH PORTAL
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed max-w-xs mx-auto">
            {mode === 'login' 
              ? 'Authenticated gateway for logging verified sustainability actions, eco-points telemetry, and environmental honors.' 
              : 'Join the global sustainability network. Record verified ecological impact and earn official certificates of sustainability.'}
          </p>
        </div>
      </div>

      {/* Security & Verification Badges */}
      <div className="relative z-10 pt-6 border-t border-white/10 text-center">
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 text-xs font-mono mb-2">
          <span className="inline-flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Encrypted Identity</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="inline-flex items-center gap-1.5 text-cyan-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Verified Telemetry</span>
          </span>
        </div>
        <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest mt-1">
          Verde Tech Sustainability Network • 2026
        </p>
      </div>
    </div>
  );
};
