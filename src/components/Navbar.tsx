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
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-white group-hover:scale-105 transition-transform">
                V
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">VERDETECH <span className="text-emerald-600">PORTAL</span></span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => setActiveTab('dashboard')} className={`text-sm font-semibold hover:text-emerald-600 transition-colors ${activeTab === 'dashboard' ? 'text-emerald-600' : 'text-slate-600'}`}>Dashboard</button>
            <button onClick={() => setActiveTab('feed')} className={`text-sm font-semibold hover:text-emerald-600 transition-colors ${activeTab === 'feed' ? 'text-emerald-600' : 'text-slate-600'}`}>Eco Feed</button>
            <button onClick={() => setActiveTab('rewards')} className={`text-sm font-semibold hover:text-emerald-600 transition-colors ${activeTab === 'rewards' ? 'text-emerald-600' : 'text-slate-600'}`}>Rewards</button>
          </div>

          {/* User/Auth Actions */}
          <div className="flex items-center gap-4">
            {currentStudent ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('my-profile')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700">
                    {currentStudent.avatarUrl ? (
                      <img src={currentStudent.avatarUrl} alt={currentStudent.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      currentStudent.name.charAt(0)
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-700">{currentStudent.name}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-5 py-2 bg-emerald-600 text-white font-bold text-sm rounded-full hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
