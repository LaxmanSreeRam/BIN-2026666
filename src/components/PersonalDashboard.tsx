import React, { useState } from 'react';
import { Student, ActivityLog, Badge } from '../types';
import { BadgeProgressTracker } from './BadgeProgressTracker';
import {
  Award,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  User,
  X,
  ShieldCheck,
  Edit3,
  Megaphone,
  Send,
  Users,
  ArrowUpRight
} from 'lucide-react';

interface PersonalDashboardProps {
  currentStudent: Student;
  students?: Student[];
  logs: ActivityLog[];
  badges: Badge[];
  onOpenLogModal: () => void;
  onOpenCertificateModal?: () => void;
  onUpdateStudent?: (updatedStudent: Student) => void;
  onAcceptFollowRequest?: (requesterGrNo: string) => void;
  onDeclineFollowRequest?: (requesterGrNo: string) => void;
  onOpenNetworkModal?: (tab?: 'followers' | 'following' | 'suggestions') => void;
  onOpenDirectMessages?: () => void;
  unreadMessagesCount?: number;
}

const PRESET_AVATARS = [
  { name: 'Laxman Sree Ram', url: '/laxman_sree_ram.jpg' },
  { name: 'Sprout Leaf', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&auto=format&fit=crop&q=80' },
  { name: 'Forest Trees', url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=300&auto=format&fit=crop&q=80' },
  { name: 'Planet Earth', url: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=300&auto=format&fit=crop&q=80' },
  { name: 'Solar Energy', url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=300&auto=format&fit=crop&q=80' },
  { name: 'Ocean Waves', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80' },
  { name: 'Panda Bear', url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef9?w=300&auto=format&fit=crop&q=80' },
  { name: 'Wind Turbines', url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=300&auto=format&fit=crop&q=80' },
  { name: 'Eco Ambassador', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
  { name: 'Green Youth', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80' },
  { name: 'Clean Energy', url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=300&auto=format&fit=crop&q=80' },
];

export const PersonalDashboard: React.FC<PersonalDashboardProps> = ({
  currentStudent,
  students = [],
  logs,
  badges,
  onOpenLogModal,
  onOpenCertificateModal,
  onUpdateStudent,
  onAcceptFollowRequest,
  onDeclineFollowRequest,
  onOpenNetworkModal,
  onOpenDirectMessages,
  unreadMessagesCount = 0,
}) => {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [photoSourceTab, setPhotoSourceTab] = useState<'upload' | 'presets' | 'url'>('presets');
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'requests'>('overview');
  const [editName, setEditName] = useState<string>(currentStudent.name || '');
  const [editUsername, setEditUsername] = useState<string>(currentStudent.username || '');
  const [editGrade, setEditGrade] = useState<string>(currentStudent.grade || '');
  const [editPosition, setEditPosition] = useState<string>(currentStudent.schoolPosition || '');
  const [editProfession, setEditProfession] = useState<string>(currentStudent.profession || '');
  const [editFollowPrivacy, setEditFollowPrivacy] = useState<'direct' | 'request' | 'private'>(currentStudent.followPrivacy || 'direct');
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string>(currentStudent.avatarUrl || '');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [copiedHandle, setCopiedHandle] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const myLogs = logs.filter((l) => l.grNo === currentStudent.grNo);
  const is1000PtsUnlocked = currentStudent.points >= 1000;
  const userHandle = currentStudent.username || currentStudent.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const pendingRequests = currentStudent.followRequests || [];

  const handleCopyHandle = () => {
    navigator.clipboard.writeText(`@${userHandle}`);
    setCopiedHandle(true);
    setTimeout(() => setCopiedHandle(false), 2000);
  };

  const handleOpenEditProfile = () => {
    setEditName(currentStudent.name || '');
    setEditUsername(currentStudent.username || userHandle);
    setEditGrade(currentStudent.grade || '');
    setEditPosition(currentStudent.schoolPosition || '');
    setEditProfession(currentStudent.profession || '');
    setEditFollowPrivacy(currentStudent.followPrivacy || 'direct');
    setPreviewAvatarUrl(currentStudent.avatarUrl || '');
    setIsEditProfileOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPreviewAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editName.trim()) {
      alert('Student name cannot be empty.');
      return;
    }

    const cleanUser = editUsername.toLowerCase().replace(/[^a-z0-9_]/g, '').trim();

    const updatedStudent: Student = {
      ...currentStudent,
      name: editName.trim(),
      username: cleanUser || userHandle,
      followPrivacy: editFollowPrivacy,
      grade: editGrade.trim() || currentStudent.grade || 'Grade 10',
      schoolPosition: editPosition.trim() || undefined,
      profession: editProfession.trim() || undefined,
      avatarUrl: previewAvatarUrl || currentStudent.avatarUrl,
      updatedAt: new Date().toISOString(),
    };

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }
    setIsEditProfileOpen(false);
    setToastMsg('Profile and social settings updated successfully!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const inputCls =
    'w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition';
  const labelCls = 'block mb-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400';
  const cardCls = 'rounded-3xl bg-[#0a0f24]/80 backdrop-blur-xl border border-white/10';
  const primaryBtn =
    'inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-teal-300 to-violet-400 text-slate-950 font-display font-extrabold uppercase tracking-wider shadow-[0_0_24px_rgba(94,242,255,0.35)] hover:shadow-[0_0_36px_rgba(94,242,255,0.55)] hover:-translate-y-0.5 transition-all';
  const ghostBtn =
    'inline-flex items-center justify-center gap-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 hover:border-cyan-400/50 text-slate-200 hover:text-white font-mono text-xs font-bold transition-all';

  const tabs: { id: 'overview' | 'logs' | 'requests'; label: string; count?: number; alert?: boolean }[] = [
    { id: 'overview', label: 'Overview & Badges' },
    { id: 'logs', label: 'Activity Logs', count: myLogs.length },
    { id: 'requests', label: 'Follow Requests', count: pendingRequests.length, alert: pendingRequests.length > 0 },
  ];

  const privacyOptions: { value: 'direct' | 'request' | 'private'; title: string; desc: string }[] = [
    { value: 'direct', title: 'Direct Follow (Public)', desc: 'Anyone in the student network can follow you immediately with one click.' },
    { value: 'request', title: 'Request to Follow', desc: 'Peers must send a follow request; you accept or decline in your Follow Requests tab.' },
    { value: 'private', title: 'Private Account', desc: 'Followers require approval, and your activity logs remain private to non-followers.' },
  ];

  const privacyLabel =
    currentStudent.followPrivacy === 'direct'
      ? 'Direct Follow'
      : currentStudent.followPrivacy === 'request'
      ? 'Request to Follow'
      : 'Private';

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 space-y-5 text-slate-200">
      {/* Toast */}
      {toastMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-400/40 px-4 py-3 text-sm font-semibold text-emerald-300 shadow-[0_0_24px_rgba(77,255,195,0.15)]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1,000 Points milestone */}
      {is1000PtsUnlocked && (
        <div className="relative overflow-hidden rounded-3xl border border-amber-300/40 bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-cyan-500/10 p-5 sm:p-6 shadow-[0_0_40px_rgba(255,209,102,0.12)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="p-3 rounded-2xl bg-amber-400/15 border border-amber-300/40 shrink-0">
                <Award className="w-7 h-7 text-amber-300" />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-300/40 text-amber-200 font-mono text-[10px] font-bold uppercase tracking-widest mb-1.5">
                  ★ Milestone Unlocked
                </span>
                <h4 className="font-display text-lg sm:text-xl font-bold text-white m-0">VerdeTech Certificate of Sustainability</h4>
                <p className="text-sm text-slate-300 mt-1 mb-0">
                  Congratulations {currentStudent.name}! You have achieved over 1,000 Verde Points. Your official certificate is ready to download and print.
                </p>
              </div>
            </div>
            <button type="button" onClick={onOpenCertificateModal} className={`${primaryBtn} px-6 py-3 text-sm shrink-0`}>
              <Award className="w-4 h-4" />
              <span>View &amp; Download</span>
            </button>
          </div>
        </div>
      )}

      {/* Profile hero */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-cyan-950/70 via-[#0a0f24] to-violet-950/50 p-5 sm:p-8 shadow-[0_0_50px_rgba(94,242,255,0.1)]">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-cyan-400/10 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-violet-500/10 blur-[90px]" />

        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-center">
          {/* Left: avatar + identity */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative shrink-0 self-start sm:self-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-cyan-500/15 border-2 border-cyan-400/50 flex items-center justify-center text-3xl font-bold font-display text-cyan-300 overflow-hidden shadow-[0_0_28px_rgba(94,242,255,0.3)]">
                {currentStudent.avatarUrl ? (
                  <img src={currentStudent.avatarUrl} alt={currentStudent.name} className="w-full h-full object-cover" />
                ) : (
                  currentStudent.name.charAt(0)
                )}
              </div>
              <button
                type="button"
                onClick={handleOpenEditProfile}
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 text-slate-950 shadow-[0_0_16px_rgba(94,242,255,0.5)] hover:scale-110 transition-transform"
                title="Edit Profile & Photo"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white m-0 break-words">{currentStudent.name}</h2>
                {currentStudent.grade && (
                  <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 border border-violet-400/40 text-violet-200 font-mono text-xs font-bold">
                    {currentStudent.grade}
                  </span>
                )}
                <button type="button" onClick={handleOpenEditProfile} className={`${ghostBtn} px-3 py-1.5`}>
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-cyan-400/30 text-cyan-300 font-mono text-sm">
                  <span className="font-bold">@</span>
                  <span>{userHandle}</span>
                  <button type="button" onClick={handleCopyHandle} className="ml-1 text-cyan-300 hover:text-white transition-colors" title="Copy Username">
                    {copiedHandle ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 font-mono text-xs font-bold uppercase">
                  {currentStudent.role || 'Eco Club Member'}
                </span>
                {currentStudent.schoolPosition && currentStudent.schoolPosition !== 'None / Member' && (
                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/15 text-slate-200 font-mono text-xs font-bold">
                    {currentStudent.schoolPosition}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button type="button" onClick={() => onOpenNetworkModal?.('followers')} className={`${ghostBtn} px-3.5 py-1.5`} title="View Followers">
                  <strong className="text-cyan-300 text-sm">{(currentStudent.followers || []).length}</strong>
                  <span>Followers</span>
                </button>
                <button type="button" onClick={() => onOpenNetworkModal?.('following')} className={`${ghostBtn} px-3.5 py-1.5`} title="View Following">
                  <strong className="text-cyan-300 text-sm">{(currentStudent.following || []).length}</strong>
                  <span>Following</span>
                </button>
                <span className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-slate-400 font-mono text-[11px] uppercase tracking-wide">
                  Privacy: <span className="text-slate-200 font-bold">{privacyLabel}</span>
                </span>
                <button type="button" onClick={() => onOpenDirectMessages?.()} className={`${ghostBtn} px-3.5 py-1.5`} title="Direct Messages">
                  <Send className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Direct Messages</span>
                  {unreadMessagesCount > 0 && (
                    <span className="ml-1 min-w-[18px] px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] leading-none text-center">
                      {unreadMessagesCount}
                    </span>
                  )}
                </button>
                {pendingRequests.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('requests')}
                    className="px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-300/50 text-amber-200 font-mono text-xs font-bold animate-pulse"
                  >
                    ⚡ {pendingRequests.length} Follow Request{pendingRequests.length > 1 ? 's' : ''}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: stats */}
          <div className="rounded-2xl bg-black/35 border border-white/10 p-4 sm:p-5 backdrop-blur-md">
            <div className="grid grid-cols-1 gap-3 text-center mb-4">
              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">Rank</span>
                <span className="font-display text-3xl font-extrabold text-cyan-300 leading-none">#{currentStudent.rank}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenCertificateModal}
              className={`w-full py-2.5 text-sm ${
                is1000PtsUnlocked
                  ? primaryBtn
                  : 'inline-flex items-center justify-center gap-2 rounded-full bg-white/5 border border-white/10 text-slate-400 font-display font-bold uppercase tracking-wider hover:bg-white/10 transition-all'
              }`}
            >
              <Award className="w-4 h-4" />
              {is1000PtsUnlocked ? 'Eco Certificate' : 'Certificate (Locked)'}
            </button>
          </div>
        </div>
      </div>

      {/* Official channels */}
      <div className={`${cardCls} p-5 sm:p-6`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3 rounded-2xl bg-violet-500/15 border border-violet-400/30 shrink-0">
              <Megaphone className="w-6 h-6 text-violet-300" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-400/30 text-violet-200 font-mono text-[10px] font-bold uppercase tracking-widest mb-1.5">
                Official Handles
              </span>
              <h5 className="font-display text-lg font-bold text-white m-0">Connect with Verde Tech Systems</h5>
              <p className="text-sm text-slate-400 m-0 mt-0.5">Follow our official channels for live updates, competitions, and sustainability highlights.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Instagram', href: 'https://www.instagram.com/verdetechsystems?stkn=MWcxbGRhYThyN2VlOA==' },
              { name: 'LinkedIn', href: 'https://www.linkedin.com/company/verdetechsystemss' },
              { name: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61594541660052' },
              { name: 'YouTube', href: 'https://www.youtube.com/channel/UCilJpKT3EpbNywLsUycQbFw' },
            ].map((l) => (
              <a
                key={l.name}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${ghostBtn} px-4 py-2 uppercase tracking-wider no-underline`}
              >
                {l.name}
                <ArrowUpRight className="w-3.5 h-3.5 text-cyan-300" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-black/40 border border-white/10 p-1.5">
        {tabs.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wide transition-all ${
                active
                  ? 'bg-cyan-500/15 border border-cyan-400/50 text-cyan-200 shadow-[0_0_16px_rgba(94,242,255,0.2)]'
                  : 'border border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>
                {t.label}
                {t.id === 'logs' && ` (${t.count})`}
              </span>
              {t.id === 'requests' && (t.count || 0) > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[10px] leading-none">
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
        <div className="ml-auto hidden md:block pr-1">
          <button
            type="button"
            onClick={() => onOpenNetworkModal?.('suggestions')}
            className={`${ghostBtn} px-4 py-2 uppercase tracking-wide`}
          >
            <Users className="w-3.5 h-3.5 text-cyan-300" />
            Explore Peer Network →
          </button>
        </div>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <BadgeProgressTracker
          currentStudent={currentStudent}
          logs={logs}
          badges={badges}
          onOpenLogModal={onOpenLogModal}
        />
      )}

      {/* Tab: Activity logs */}
      {activeTab === 'logs' && (
        <div className={`${cardCls} p-5 sm:p-8`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-white/10">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white m-0">My Activity Log History ({myLogs.length})</h3>
              <p className="text-sm text-slate-400 m-0 mt-1">Your verified green doings and smart bin deposits</p>
            </div>
            <button type="button" onClick={onOpenLogModal} className={`${primaryBtn} px-5 py-2.5 text-sm`}>
              + Log New Activity
            </button>
          </div>

          {myLogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 mb-4">
                <Sparkles className="w-10 h-10 text-cyan-300" />
              </div>
              <h5 className="font-display text-lg font-bold text-white mb-1">No Activities Logged Yet</h5>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-5">
                Start logging your daily sustainability actions or scan smart bins to earn Verde Points!
              </p>
              <button type="button" onClick={onOpenLogModal} className={`${primaryBtn} px-6 py-2.5 text-sm`}>
                Log First Activity
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-white/[0.04] text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    {['Activity', 'Category', 'Quantity', 'Points', 'Status', 'Date'].map((h) => (
                      <th key={h} className="px-4 py-3 font-bold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {myLogs.map((log) => (
                    <tr key={log.id} className="border-t border-white/5 hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3 font-semibold text-white">{log.challengeTitle}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/15 text-slate-300 font-mono text-xs">{log.category}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{log.quantity} {log.unitLabel}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-mono text-xs font-bold whitespace-nowrap">
                          +{log.pointsEarned} Pts
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full border font-mono text-xs font-bold ${
                            log.status === 'Approved'
                              ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300'
                              : 'bg-amber-400/15 border-amber-300/40 text-amber-200'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Follow requests */}
      {activeTab === 'requests' && (
        <div className={`${cardCls} p-5 sm:p-8`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white m-0">Follow Requests ({pendingRequests.length})</h3>
                {pendingRequests.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-300/40 text-amber-200 font-mono text-[10px] font-bold uppercase tracking-wider">
                    Action Required
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 m-0 mt-1">
                Classmates requesting to follow your profile and view your verified sustainability progress
              </p>
            </div>
            <div className="rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5">
              <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-500">Current Setting</span>
              <strong className="text-sm text-cyan-300 font-mono uppercase">
                {currentStudent.followPrivacy === 'direct'
                  ? 'Direct Follow (Public)'
                  : currentStudent.followPrivacy === 'request'
                  ? 'Request Required'
                  : 'Private Account'}
              </strong>
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 mb-4">
                <ShieldCheck className="w-10 h-10 text-emerald-300" />
              </div>
              <h5 className="font-display text-lg font-bold text-white mb-1">No Pending Follow Requests</h5>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-5">
                Your request queue is clean! When other students request to follow your green journey, their requests will appear here for you to accept or decline.
              </p>
              <button type="button" onClick={() => onOpenNetworkModal?.('suggestions')} className={`${primaryBtn} px-6 py-2.5 text-sm`}>
                Discover Classmates in Network
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((reqId) => {
                const requester = students.find((s) => s.grNo === reqId);
                const name = requester?.name || `Student (${reqId})`;
                const reqHandle = requester?.username || name.toLowerCase().replace(/[^a-z0-9]/g, '_');

                return (
                  <div
                    key={reqId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/30 p-4 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-400/40 overflow-hidden shrink-0 flex items-center justify-center font-display font-bold text-cyan-300">
                        {requester?.avatarUrl ? (
                          <img src={requester.avatarUrl} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <h6 className="font-display font-bold text-white m-0 truncate">{name}</h6>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="px-2 py-0.5 rounded-full bg-black/40 border border-cyan-400/25 text-cyan-300 font-mono">@{reqHandle}</span>
                          {requester && (
                            <>
                              <span className="font-mono font-bold text-emerald-300">{requester.points} Pts</span>
                              <span>•</span>
                              <span>{requester.grade}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onAcceptFollowRequest?.(reqId);
                          setToastMsg(`Accepted follow request from @${reqHandle}`);
                          setTimeout(() => setToastMsg(null), 3000);
                        }}
                        className={`${primaryBtn} px-4 py-2 text-xs`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeclineFollowRequest?.(reqId);
                          setToastMsg(`Declined follow request from @${reqHandle}`);
                          setTimeout(() => setToastMsg(null), 3000);
                        }}
                        className={`${ghostBtn} px-4 py-2 uppercase tracking-wide hover:!border-rose-400/60 hover:!text-rose-300`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Edit Profile modal */}
      {isEditProfileOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditProfileOpen(false);
          }}
        >
          <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0a0f24] border border-cyan-400/40 shadow-[0_0_50px_rgba(94,242,255,0.2)] overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-gradient-to-r from-cyan-950/80 via-emerald-950/60 to-black border-b border-white/10 shrink-0">
              <h5 className="font-display text-lg font-bold text-white m-0">Edit Profile &amp; Avatar</h5>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Full Name *</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Username Handle (@) *</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-xl bg-black/40 border border-r-0 border-white/15 text-cyan-300 font-mono font-bold">@</span>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      required
                      className={`${inputCls} !rounded-l-none font-mono`}
                      placeholder="username"
                      maxLength={20}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Grade / Class</label>
                  <input type="text" value={editGrade} onChange={(e) => setEditGrade(e.target.value)} className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>School Position / Role</label>
                  <select value={editPosition} onChange={(e) => setEditPosition(e.target.value)} className={inputCls}>
                    {['None / Member', 'Portal Administrator', 'Eco Club President', 'Head Prefect', 'House Captain', 'Sustainability Lead'].map((o) => (
                      <option key={o} value={o} className="bg-[#0a0f24] text-white">{o}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className={labelCls}>Profession / Tagline</label>
                  <input
                    type="text"
                    value={editProfession}
                    onChange={(e) => setEditProfession(e.target.value)}
                    placeholder="e.g. Student Technologist"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Privacy */}
              <div className="pt-4 border-t border-white/10">
                <label className={labelCls}>Follow &amp; Network Privacy</label>
                <div className="space-y-2">
                  {privacyOptions.map((o) => {
                    const selected = editFollowPrivacy === o.value;
                    return (
                      <label
                        key={o.value}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          selected ? 'bg-cyan-500/10 border-cyan-400/60' : 'bg-white/[0.03] border-white/10 hover:border-white/25'
                        }`}
                      >
                        <input
                          type="radio"
                          name="privacyOption"
                          value={o.value}
                          checked={selected}
                          onChange={() => setEditFollowPrivacy(o.value)}
                          className="mt-1 accent-cyan-400"
                        />
                        <div>
                          <span className="block font-mono text-xs font-bold uppercase tracking-wide text-white">{o.title}</span>
                          <span className="block text-xs text-slate-400 mt-0.5">{o.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Avatar */}
              <div className="pt-4 border-t border-white/10">
                <label className={labelCls}>Choose Avatar / Profile Picture</label>

                <div className="flex flex-wrap gap-2 mb-4">
                  {([
                    ['presets', 'Preset Avatars'],
                    ['upload', 'Upload File (Under 2MB)'],
                    ['url', 'Image URL'],
                  ] as const).map(([id, text]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPhotoSourceTab(id)}
                      className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-bold border transition-all ${
                        photoSourceTab === id
                          ? 'bg-cyan-500/15 border-cyan-400/60 text-cyan-200'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {text}
                    </button>
                  ))}
                </div>

                {photoSourceTab === 'presets' && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {PRESET_AVATARS.map((p) => (
                      <button
                        type="button"
                        key={p.url}
                        onClick={() => setPreviewAvatarUrl(p.url)}
                        className={`p-1 rounded-xl border text-center transition-all ${
                          previewAvatarUrl === p.url
                            ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_14px_rgba(94,242,255,0.35)]'
                            : 'border-white/10 bg-white/[0.03] hover:border-white/30'
                        }`}
                      >
                        <img src={p.url} alt={p.name} className="w-full h-14 object-cover rounded-lg" />
                        <span className="block text-[10px] text-slate-300 truncate mt-1">{p.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {photoSourceTab === 'upload' && (
                  <div className="p-5 rounded-xl bg-white/[0.03] border border-dashed border-white/20 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="block w-full text-sm text-slate-300 file:mr-3 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-cyan-500/20 file:text-cyan-200 file:font-mono file:text-xs file:font-bold hover:file:bg-cyan-500/30"
                    />
                    <span className="block text-xs text-slate-500 mt-2">Supports JPG, PNG, WEBP (Max 2MB).</span>
                  </div>
                )}

                {photoSourceTab === 'url' && (
                  <input
                    type="url"
                    value={previewAvatarUrl}
                    onChange={(e) => setPreviewAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className={inputCls}
                  />
                )}

                <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="w-12 h-12 rounded-xl border border-cyan-400/40 overflow-hidden bg-black/40 flex items-center justify-center shrink-0">
                    {previewAvatarUrl ? (
                      <img src={previewAvatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="block font-mono text-[11px] font-bold uppercase tracking-wider text-slate-300">Avatar Preview</span>
                    <span className="block text-xs text-slate-500 truncate">{previewAvatarUrl || 'No image selected'}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsEditProfileOpen(false)} className={`${ghostBtn} px-5 py-2.5`}>
                  Cancel
                </button>
                <button type="submit" className={`${primaryBtn} px-6 py-2.5 text-sm`}>
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
