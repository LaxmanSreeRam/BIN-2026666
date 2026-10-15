import React from 'react';
import { usePortalLogo } from '../utils/logoStorage';
import { Leaf, ShieldCheck, CheckCircle2, Trees, Recycle, Award } from 'lucide-react';

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
    <div 
      className="h-100 p-4 p-lg-5 text-white d-flex flex-column justify-content-between position-relative border-end border-4 border-dark"
      style={{ backgroundColor: '#064E3B' }}
    >
      {/* Top Brand Header */}
      <div>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <span className="badge bg-warning text-dark fw-black rounded-0 px-3 py-1.5 border border-2 border-dark text-uppercase small">
            <Leaf className="w-3.5 h-3.5 me-1 inline" />
            VERDE TECH PORTAL
          </span>
          <span className="badge bg-dark text-white rounded-0 font-monospace border border-1 border-white small">
            PORTAL ACCESS
          </span>
        </div>

        {/* Center Official Logo Showcase */}
        <div className="text-center my-4 py-3">
          <div 
            className="card border border-3 border-dark rounded-0 bg-white p-2 d-inline-block shadow-[4px_4px_0px_0px_black] mb-3"
            style={{ maxWidth: '240px' }}
          >
            <img
              src={logoSrc || '/logo.jpg'}
              alt="Verde Tech Official Logo"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/logo.jpg';
              }}
              className="img-fluid d-block"
              style={{ maxHeight: '90px', objectFit: 'contain' }}
            />
          </div>

          <h3 className="fw-black text-uppercase tracking-tight text-white m-0">
            VERDETECH PLATFORM
          </h3>
          <p className="text-white-50 small mt-2 mb-0" style={{ maxWidth: '320px', margin: '0 auto' }}>
            {mode === 'login' 
              ? 'Official authenticated portal for logging sustainability actions, smart bin waste diversion, and environmental recognition.' 
              : 'Join the VerdeTech sustainability network. Record verified environmental impact and earn official certificates of sustainability.'}
          </p>
        </div>
      </div>

      {/* Static Institutional Security Notice (Zero Rotating Boxes) */}
      <div className="pt-3 border-top border-white border-opacity-25 text-center">
        <div className="d-flex justify-content-center gap-3 text-white-50 small mb-2">
          <span className="d-inline-flex align-items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-warning" />
            <span>Encrypted Identity</span>
          </span>
          <span>•</span>
          <span className="d-inline-flex align-items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>Verified Smart Bins</span>
          </span>
        </div>
        <p className="text-white-50 xsmall m-0 font-monospace text-uppercase">
          Verde Tech Official Sustainability Network • 2026
        </p>
      </div>
    </div>
  );
};
