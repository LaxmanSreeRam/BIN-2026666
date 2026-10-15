import React, { useState, useRef } from 'react';
import { Student } from '../types';
import { usePortalLogo } from '../utils/logoStorage';
import { 
  Shield, 
  User, 
  LogOut, 
  BarChart3, 
  Activity,
  Award,
  ShoppingBag,
  KeyRound,
  Info,
  Headphones,
  Upload,
  Gift,
  Menu,
  Send,
  QrCode,
  Cpu
} from 'lucide-react';

interface NavbarProps {
  currentStudent: Student | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLogin: () => void;
  onOpenLogModal: () => void;
  onOpenCertificateModal?: () => void;
  onOpenReportIssue?: () => void;
  onOpenRequestCredentials?: () => void;
  onOpenQRScanner?: () => void;
  onOpenRedeemGiftCards?: () => void;
  onOpenDirectMessages?: () => void;
  unreadMessagesCount?: number;
  onLogout: () => void;
  pendingVerificationCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStudent,
  activeTab,
  setActiveTab,
  onOpenLogin,
  onOpenQRScanner,
  onOpenRedeemGiftCards,
  onOpenDirectMessages,
  unreadMessagesCount = 0,
  onLogout,
}) => {
  const [logoSrc, { isLocked, uploadAndLockLogo }] = usePortalLogo();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        await uploadAndLockLogo(file);
      } catch (err) {
        console.error('Failed to upload and lock logo:', err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top bg-white" style={{ borderBottom: '4px solid #121212', boxShadow: '0 4px 0 0 #121212' }}>
      <div className="container-fluid px-3 px-lg-4 py-2">
        
        {/* Brand / Logo Section with Geometric Emblems */}
        <div className="d-flex align-items-center gap-3">
          <div className="d-none sm:d-flex align-items-center gap-1 bg-light p-1 border border-2 border-dark">
            <div className="rounded-circle bg-danger" style={{ width: '10px', height: '10px' }}></div>
            <div className="bg-warning" style={{ width: '10px', height: '10px' }}></div>
            <div className="bg-primary" style={{ width: '0', height: '0', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '10px solid #1040C0' }}></div>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleLogoUpload} 
            accept="image/*" 
            className="d-none" 
          />

          <div 
            onClick={() => {
              if (!isLocked) {
                fileInputRef.current?.click();
              } else {
                setActiveTab('dashboard');
              }
            }}
            title={!isLocked ? "Click to upload your image and lock it" : "VERDETECH Portal"}
            className={`position-relative rounded-0 bg-white border border-dark border-3 ${
              !isLocked ? 'ring-2 ring-warning cursor-pointer' : 'cursor-pointer'
            } p-1 shadow-sm d-flex align-items-center justify-content-center overflow-hidden`}
            style={{ width: '90px', height: '42px', boxShadow: '2px 2px 0px 0px #121212' }}
          >
            <img 
              src={logoSrc} 
              alt="VERDETECH Logo" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/logo.jpg';
              }}
              className="w-100 h-100 object-fit-contain"
            />
          </div>

          <span 
            onClick={() => setActiveTab('dashboard')}
            className="navbar-brand fw-black fs-5 mb-0 text-dark text-uppercase tracking-tight cursor-pointer"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            VERDE TECH <span className="text-success">PORTAL</span>
          </span>
        </div>

        {/* Mobile Hamburger Toggler & Actions */}
        <div className="d-flex align-items-center gap-2">
          {onOpenRedeemGiftCards && (
            <button
              onClick={onOpenRedeemGiftCards}
              className="btn btn-warning text-dark fw-black btn-sm d-flex align-items-center gap-1.5 border border-2 border-dark"
              style={{ boxShadow: '2px 2px 0px 0px #121212', borderRadius: '0px' }}
              title="Redeem Gift Cards"
            >
              <Gift className="w-4 h-4" />
              <span className="text-uppercase">Redeem Gift Cards</span>
            </button>
          )}


          {/* Account Actions */}
          {currentStudent ? (
            <div className="d-flex align-items-center gap-2">
              {onOpenDirectMessages && (
                <button
                  type="button"
                  onClick={onOpenDirectMessages}
                  className="btn btn-dark text-white fw-black btn-sm d-flex align-items-center gap-1.5 border border-2 border-dark rounded-0 position-relative shadow-[2px_2px_0px_0px_black] px-2.5 py-1.5"
                  title="Instagram Direct Messages"
                >
                  <Send className="w-4 h-4 text-warning" />
                  <span className="d-none d-md-inline text-uppercase small">DMs</span>
                  {unreadMessagesCount > 0 && (
                    <span className="badge bg-danger text-white rounded-pill ms-0.5 px-1.5 py-0.5 xsmall animate-pulse">
                      {unreadMessagesCount}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => setActiveTab('my-profile')}
                className={`btn p-1 rounded-circle border border-2 border-dark ${
                  activeTab === 'my-profile' ? 'bg-warning shadow' : 'bg-white'
                }`}
                style={{ boxShadow: '2px 2px 0px 0px #121212' }}
                title={`My Profile (${currentStudent.name})`}
              >
                <div className="rounded-circle bg-light text-dark fw-bold d-flex align-items-center justify-content-center overflow-hidden" style={{ width: '34px', height: '34px' }}>
                  {currentStudent.avatarUrl ? (
                    <img src={currentStudent.avatarUrl} alt={currentStudent.name} className="w-100 h-100 object-fit-cover" />
                  ) : (
                    currentStudent.name.charAt(0)
                  )}
                </div>
              </button>

              <button
                onClick={onLogout}
                className="btn btn-danger text-dark fw-black btn-sm border border-2 border-dark d-none d-sm-inline-flex align-items-center gap-1 text-uppercase"
                style={{ boxShadow: '2px 2px 0px 0px #121212', borderRadius: '0px', backgroundColor: '#F0C020' }}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-1">
              <button
                onClick={onOpenLogin}
                className="btn btn-warning text-dark fw-black btn-sm d-flex align-items-center gap-1 border border-2 border-dark text-uppercase"
                style={{ boxShadow: '2px 2px 0px 0px #121212', borderRadius: '0px' }}
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </button>
            </div>
          )}

          {/* Navbar Toggler for Mobile */}
          <button
            className="navbar-toggler border border-2 border-dark shadow-none text-dark p-1.5 ms-1 rounded-0 bg-warning"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbarNav"
            aria-controls="mainNavbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <Menu className="w-6 h-6 text-dark" />
          </button>
        </div>

        {/* Collapsible Main Navigation Links with Dropdowns */}
        <div className="collapse navbar-collapse justify-content-end mt-2 mt-lg-0" id="mainNavbarNav">
          <ul className="navbar-nav align-items-lg-center gap-2 py-2 py-lg-0">
            
            {/* Dropdown 1: Sustainability & Monitoring */}
            <li className="nav-item dropdown">
              <a 
                className="nav-link dropdown-toggle text-dark fw-black text-uppercase d-flex align-items-center gap-1 px-3 py-2 border border-2 border-dark bg-light" 
                href="#" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <BarChart3 className="w-4 h-4 text-danger" />
                <span>Sustainability</span>
              </a>
              <ul className="dropdown-menu shadow-lg border border-4 border-dark rounded-0 p-2 bg-white">
                <li>
                  <button 
                    className="dropdown-item rounded-0 py-2 fw-bold text-uppercase text-dark d-flex align-items-center gap-2"
                    onClick={() => setActiveTab('dashboard')}
                  >
                    <BarChart3 className="w-4 h-4 text-danger" />
                    <span>Dashboard</span>
                  </button>
                </li>
                <li>
                  <button 
                    className="dropdown-item rounded-0 py-2 fw-bold text-uppercase text-dark d-flex align-items-center gap-2"
                    onClick={() => setActiveTab('feed')}
                  >
                    <Activity className="w-4 h-4 text-primary" />
                    <span>Eco Feed</span>
                  </button>
                </li>
                <li>
                  <button 
                    className="dropdown-item rounded-0 py-2 fw-bold text-uppercase text-dark d-flex align-items-center gap-2"
                    onClick={() => setActiveTab('badges')}
                  >
                    <Award className="w-4 h-4 text-warning" />
                    <span>Badges</span>
                  </button>
                </li>
              </ul>
            </li>

            {/* Rewards Button */}
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('rewards')}
                className={`nav-link btn btn-sm fw-black text-uppercase w-100 text-start text-lg-center px-3 py-2 border border-2 border-dark d-flex align-items-center gap-2 ${
                  activeTab === 'rewards' ? 'bg-warning text-dark shadow-sm' : 'bg-light text-dark'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-primary" />
                <span>Rewards</span>
              </button>
            </li>

            {/* Dropdown 2: More Info */}
            <li className="nav-item dropdown">
              <a 
                className="nav-link dropdown-toggle text-dark fw-black text-uppercase d-flex align-items-center gap-1 px-3 py-2 border border-2 border-dark bg-light" 
                href="#" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <Info className="w-4 h-4 text-primary" />
                <span>More Info</span>
              </a>
              <ul className="dropdown-menu shadow-lg border border-4 border-dark rounded-0 p-2 bg-white">
                <li>
                  <button 
                    className="dropdown-item rounded-0 py-2 fw-bold text-uppercase text-dark d-flex align-items-center gap-2"
                    onClick={() => setActiveTab('about')}
                  >
                    <Info className="w-4 h-4 text-danger" />
                    <span>About Us</span>
                  </button>
                </li>
                <li>
                  <button 
                    className="dropdown-item rounded-0 py-2 fw-bold text-uppercase text-dark d-flex align-items-center gap-2"
                    onClick={() => setActiveTab('support')}
                  >
                    <Headphones className="w-4 h-4 text-primary" />
                    <span>Support</span>
                  </button>
                </li>
              </ul>
            </li>

            {currentStudent && (
              <li className="nav-item">
                <button
                  onClick={() => setActiveTab('my-profile')}
                  className={`nav-link btn btn-sm fw-black text-uppercase w-100 text-start text-lg-center px-3 py-2 border border-2 border-dark d-flex align-items-center gap-2 ${
                    activeTab === 'my-profile' ? 'bg-warning text-dark shadow-sm' : 'bg-light text-dark'
                  }`}
                >
                  <User className="w-4 h-4 text-dark" />
                  <span>Profile</span>
                </button>
              </li>
            )}

            {currentStudent && onOpenDirectMessages && (
              <li className="nav-item">
                <button
                  type="button"
                  onClick={onOpenDirectMessages}
                  className="nav-link btn btn-sm fw-black text-uppercase w-100 text-start text-lg-center px-3 py-2 border border-2 border-dark d-flex align-items-center gap-2 bg-dark text-white shadow-sm position-relative"
                  title="Direct Messages"
                >
                  <Send className="w-4 h-4 text-warning" />
                  <span>Messages</span>
                  {unreadMessagesCount > 0 && (
                    <span className="badge bg-danger text-white rounded-pill ms-1 px-1.5 py-0.5 xsmall animate-pulse">
                      {unreadMessagesCount}
                    </span>
                  )}
                </button>
              </li>
            )}
          </ul>
        </div>

      </div>
    </nav>
  );
};
