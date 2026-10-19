import React, { useState, useEffect, useRef } from 'react';
import { Student } from '../types';
import { usePortalLogo } from '../utils/logoStorage';
import { playSound } from '../utils/soundFx';
import { 
  Shield, 
  User, 
  LogOut, 
  Sparkles,
  Gift,
  Send,
  Menu,
  X,
  PlusCircle,
  Clock,
  Compass,
  Volume2,
  VolumeX,
  Radio
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
  onOpenGate?: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStudent,
  activeTab,
  setActiveTab,
  onOpenLogin,
  onOpenLogModal,
  onOpenRedeemGiftCards,
  onOpenDirectMessages,
  unreadMessagesCount = 0,
  onLogout,
  onOpenGate,
  soundEnabled = true,
  onToggleSound
}) => {
  const [logoSrc, { isLocked, uploadAndLockLogo }] = usePortalLogo();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('00:00:00');

  // Live ticking HUD clock (Muscat time / local time as in iswkoman.com/stai)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(' ')[0]);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'feed', label: 'Eco Feed' },
    { id: 'rewards', label: 'Rewards Store' },
    { id: 'about', label: 'About Us' },
  ];

  const handleTabClick = (tabId: string) => {
    playSound('blip');
    setActiveTab(tabId);
  };

  return (
    <>
      {/* Top HUD Telemetry Ribbon (Direct STAI 2026 Signature) */}
      <div className="bg-[#03050c] border-b border-white/5 py-1.5 px-4 text-xs font-mono text-slate-400 select-none">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <span className="hud-dot"></span>
              <span>SYS.STATUS — OPERATIONAL</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="hidden sm:flex items-center gap-1 text-slate-400">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>23.59° N · 58.54° E</span>
              <span className="text-slate-500">(Muscat, Oman)</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Audio Toggle */}
            {onToggleSound && (
              <button
                onClick={() => {
                  onToggleSound();
                  playSound('blip');
                }}
                className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition-colors"
                title={soundEnabled ? 'Audio feedback active' : 'Audio muted'}
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden md:inline">AUDIO ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-slate-600" />
                    <span className="hidden md:inline text-slate-600">MUTED</span>
                  </>
                )}
              </button>
            )}



            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-cyan-300 font-semibold">{currentTime}</span>
            </div>

            {currentStudent && (
              <span className="text-emerald-400 font-semibold hidden md:inline">
                VERDE BALANCE: <strong className="text-white">{currentStudent.points || 0} PTS</strong>
              </span>
            )}
          </div>

        </div>
      </div>

      {/* Main Glassmorphic Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#060913]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* STAI-Style Brand Lockup */}
            <div className="flex items-center gap-3 shrink-0">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadAndLockLogo(file);
                }} 
                accept="image/*" 
                className="hidden" 
              />

              <div 
                onClick={() => {
                  if (!isLocked) fileInputRef.current?.click();
                  else handleTabClick('worlds');
                }}
                className="relative cursor-pointer rounded-xl bg-slate-900/80 p-1 border border-cyan-400/30 hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(94,242,255,0.2)] flex items-center justify-center overflow-hidden w-11 h-11 shrink-0"
                title={!isLocked ? "Upload logo" : "Verde Tech Portal"}
              >
                <img 
                  src={logoSrc} 
                  alt="Logo" 
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.jpg'; }}
                  className="w-full h-full object-contain"
                />
              </div>

              <div 
                onClick={() => handleTabClick('worlds')} 
                className="cursor-pointer group flex flex-col"
              >
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-white font-display group-hover:text-cyan-300 transition-colors">
                    VERDE TECH
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-400/30 tracking-wider">
                    2026
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium tracking-wide flex items-center gap-1.5">
                  <span className="text-cyan-400">Future World</span>
                  <span className="text-slate-600">·</span>
                  <span>Science · Tech · Innovation</span>
                </span>
              </div>
            </div>

            {/* Desktop Numbered Nav Links (Exact STAI convention) */}
            <nav className="hidden xl:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = activeTab === link.id || (link.id === 'mission' && activeTab === 'dashboard');
                return (
                  <button
                    key={link.id}
                    onClick={() => handleTabClick(link.id)}
                    className={`stai-nav-link text-xs px-2.5 py-1.5 ${isActive ? 'active' : ''}`}
                  >
                    <span className="mono-index">{link.num}</span>
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Compact Desktop Navigation for Medium Screens (lg) */}
            <nav className="hidden lg:flex xl:hidden items-center gap-1">
              {navLinks.slice(0, 5).map((link) => {
                const isActive = activeTab === link.id || (link.id === 'mission' && activeTab === 'dashboard');
                return (
                  <button
                    key={link.id}
                    onClick={() => handleTabClick(link.id)}
                    className={`stai-nav-link text-xs px-2 py-1.5 ${isActive ? 'active' : ''}`}
                  >
                    <span className="mono-index">{link.num}</span>
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Action Bar */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Quick Action: Log Activity Button */}
              <button
                onClick={() => {
                  playSound('click');
                  onOpenLogModal();
                }}
                className="btn-stai-outline hidden sm:inline-flex"
                title="Log Eco Action"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Log Action</span>
              </button>

              {/* Gift Cards Redeem */}
              {onOpenRedeemGiftCards && (
                <button
                  onClick={() => {
                    playSound('click');
                    onOpenRedeemGiftCards();
                  }}
                  className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 hover:bg-amber-500/20 transition-colors text-xs font-mono font-bold flex items-center gap-1.5"
                  title="Redeem Gift Cards"
                >
                  <Gift className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Gift Code</span>
                </button>
              )}

              {/* Direct Messages */}
              {currentStudent && onOpenDirectMessages && (
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    onOpenDirectMessages();
                  }}
                  className="relative p-2 rounded-full bg-slate-800/80 border border-white/10 text-slate-300 hover:text-cyan-300 hover:border-cyan-400/40 transition-colors"
                  title="Direct Messages"
                >
                  <Send className="w-4 h-4" />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                      {unreadMessagesCount}
                    </span>
                  )}
                </button>
              )}

              {/* User Account / Login Button */}
              {currentStudent ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTabClick('my-profile')}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-slate-800/80 border border-cyan-400/30 hover:border-cyan-400 transition-all shadow-[0_0_12px_rgba(94,242,255,0.15)]"
                    title={`Profile: ${currentStudent.name}`}
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-tr from-cyan-400 to-violet-500 p-0.5">
                      <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden text-xs font-bold text-cyan-300">
                        {currentStudent.avatarUrl ? (
                          <img src={currentStudent.avatarUrl} alt={currentStudent.name} className="w-full h-full object-cover" />
                        ) : (
                          currentStudent.name.charAt(0)
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-200 hidden sm:inline max-w-[90px] truncate">
                      {currentStudent.name.split(' ')[0]}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      playSound('click');
                      onLogout();
                    }}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    playSound('click');
                    onOpenLogin();
                  }}
                  className="btn-stai-cyan text-xs"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Enter Portal</span>
                </button>
              )}

              {/* Mobile Drawer Toggle */}
              <button
                onClick={() => {
                  playSound('click');
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                className="lg:hidden p-2 rounded-lg bg-slate-800/60 border border-white/10 text-slate-300 hover:text-white"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#080c1d] border-b border-white/10 px-4 py-5 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    handleTabClick(link.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === link.id || (link.id === 'mission' && activeTab === 'dashboard')
                      ? 'bg-cyan-500/10 border border-cyan-400/40 text-cyan-300'
                      : 'text-slate-400 hover:text-white bg-slate-900/40'
                  }`}
                >
                  <span className="font-mono text-[10px] text-cyan-400">{link.num}</span>
                  <span>{link.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  playSound('click');
                  onOpenLogModal();
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 btn-stai-cyan justify-center py-2 text-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log Action</span>
              </button>

              {onOpenGate && (
                <button
                  onClick={() => {
                    playSound('click');
                    onOpenGate();
                    setIsMobileMenuOpen(false);
                  }}
                  className="btn-stai-outline text-xs"
                >
                  <span>Launch Gate</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
