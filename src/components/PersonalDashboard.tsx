import React, { useState, useEffect } from 'react';
import { Student, ActivityLog, Badge } from '../types';
import { usePortalLogo } from '../utils/logoStorage';
import { BadgeProgressTracker } from './BadgeProgressTracker';
import { 
  Award, 
  Trees, 
  Droplets, 
  Zap, 
  Trash2, 
  Sparkles, 
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  Camera,
  Copy,
  Check,
  Upload,
  Image as ImageIcon,
  User,
  X,
  Leaf,
  Globe,
  Sun,
  ShieldCheck,
  RefreshCw,
  Edit3,
  GraduationCap,
  Briefcase,
  MessageSquare,
  ExternalLink,
  Megaphone,
  Share2,
  Send
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
  const [logoSrc] = usePortalLogo();
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

  return (
    <div className="container py-4 space-y-4">
      {toastMsg && (
        <div className="alert alert-success rounded-0 border border-3 border-dark fw-bold text-dark shadow-[4px_4px_0px_0px_black] d-flex align-items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1,000 Points Unlocked Certificate Special Celebration Banner */}
      {is1000PtsUnlocked && (
        <div className="card rounded-0 p-4 border border-4 border-dark shadow-[6px_6px_0px_0px_black]" style={{ backgroundColor: '#F0C020' }}>
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-dark text-white rounded-0 border border-2 border-dark">
                <Award className="w-7 h-7 text-warning animate-bounce" />
              </div>
              <div>
                <span className="badge bg-dark text-white fw-bold px-2.5 py-1 rounded-0 uppercase text-xs mb-1">
                  ★ Milestone Achievement Unlocked ★
                </span>
                <h4 className="fw-black text-dark text-uppercase m-0">VerdeTech Certificate of Sustainability</h4>
                <p className="text-dark fw-medium small m-0 mt-1">
                  Congratulations {currentStudent.name}! You have achieved over 1,000 Verde Points. Your official Certificate of Sustainability is ready for download and printing.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenCertificateModal}
              className="btn btn-success text-white fw-black text-uppercase rounded-0 border border-3 border-dark px-4 py-3 shadow-[4px_4px_0px_0px_black]"
            >
              <Award className="w-4 h-4 me-1.5 inline" />
              <span>View & Download Certificate</span>
            </button>
          </div>
        </div>
      )}

      {/* Profile Overview Banner */}
      <div className="card bg-success text-white rounded-0 border border-4 border-dark p-4 p-md-5 shadow-[6px_6px_0px_0px_black]">
        <div className="row align-items-center g-4">
          
          {/* Left Column: Avatar & Student Details */}
          <div className="col-12 col-lg-7 col-xl-8">
            <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-4">
              <div className="position-relative flex-shrink-0 align-self-start align-self-sm-center">
                <div 
                  className="rounded-0 border border-3 border-dark bg-white text-dark d-flex align-items-center justify-content-center fw-black fs-2 overflow-hidden shadow-[4px_4px_0px_0px_black]" 
                  style={{ width: '100px', height: '100px' }}
                >
                  {currentStudent.avatarUrl ? (
                    <img 
                      src={currentStudent.avatarUrl} 
                      alt={currentStudent.name} 
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    currentStudent.name.charAt(0)
                  )}
                </div>
                
                <button
                  onClick={handleOpenEditProfile}
                  className="position-absolute bottom-0 end-0 btn btn-warning btn-sm rounded-0 border-2 border-dark p-1.5 shadow"
                  title="Edit Profile & Photo"
                >
                  <Edit3 className="w-4 h-4 text-dark" />
                </button>
              </div>

              <div className="d-flex flex-column gap-2">
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <h2 className="display-6 fw-black text-white text-uppercase m-0 tracking-tight">
                    {currentStudent.name}
                  </h2>
                  <span className="badge bg-warning text-dark fw-bold rounded-0 border border-2 border-dark px-2.5 py-1">
                    {currentStudent.grade}
                  </span>
                  <button
                    onClick={handleOpenEditProfile}
                    className="btn btn-sm btn-light text-dark fw-bold rounded-0 border border-2 border-dark px-3 py-1 shadow-[2px_2px_0px_0px_black]"
                  >
                    <Edit3 className="w-3.5 h-3.5 me-1 inline" /> Edit Profile
                  </button>
                </div>

                <div className="d-flex flex-wrap align-items-center gap-2 text-light small fw-medium">
                  {/* Handle with copy */}
                  <div className="badge bg-dark text-warning rounded-0 border border-2 border-white px-2.5 py-1 font-monospace d-inline-flex align-items-center gap-1.5 fs-6">
                    <span className="fw-black text-warning">@</span>
                    <span>{userHandle}</span>
                    <button
                      onClick={handleCopyHandle}
                      className="btn btn-link text-warning p-0 ms-1 text-decoration-none"
                      title="Copy Username"
                    >
                      {copiedHandle ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Role / School Position */}
                  <span className="badge bg-warning text-dark fw-bold px-2 py-1 rounded-0 border border-dark">
                    {currentStudent.role || 'Eco Club Member'}
                  </span>

                  {currentStudent.schoolPosition && currentStudent.schoolPosition !== 'None / Member' && (
                    <span className="badge bg-light text-dark fw-bold px-2 py-1 rounded-0 border border-dark">
                      {currentStudent.schoolPosition}
                    </span>
                  )}
                </div>

                {/* Instagram-style Connections & Followers Bar */}
                <div className="d-flex flex-wrap align-items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenNetworkModal?.('followers')}
                    className="btn btn-sm btn-dark text-white rounded-0 border border-2 border-white px-3 py-1 fw-bold d-inline-flex align-items-center gap-1.5 shadow-[2px_2px_0px_0px_black]"
                    title="View Followers"
                  >
                    <strong className="text-warning fs-6">{(currentStudent.followers || []).length}</strong>
                    <span>Followers</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenNetworkModal?.('following')}
                    className="btn btn-sm btn-dark text-white rounded-0 border border-2 border-white px-3 py-1 fw-bold d-inline-flex align-items-center gap-1.5 shadow-[2px_2px_0px_0px_black]"
                    title="View Following"
                  >
                    <strong className="text-warning fs-6">{(currentStudent.following || []).length}</strong>
                    <span>Following</span>
                  </button>

                  <span className="badge bg-white text-dark rounded-0 border border-2 border-dark px-2.5 py-1 text-uppercase fw-bold small">
                    Privacy: {currentStudent.followPrivacy === 'direct' ? 'Direct Follow' : currentStudent.followPrivacy === 'request' ? 'Request to Follow' : 'Private'}
                  </span>

                  <button
                    type="button"
                    onClick={() => onOpenDirectMessages?.()}
                    className="btn btn-sm btn-dark text-white rounded-0 border border-2 border-white px-3 py-1 fw-bold d-inline-flex align-items-center gap-1.5 shadow-[2px_2px_0px_0px_black]"
                    title="Direct Messages"
                  >
                    <Send className="w-3.5 h-3.5 text-warning" />
                    <span>Direct Messages</span>
                    {unreadMessagesCount > 0 && (
                      <span className="badge bg-danger text-white rounded-pill ms-1 px-1.5 py-0.5 xsmall">
                        {unreadMessagesCount}
                      </span>
                    )}
                  </button>

                  {pendingRequests.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('requests')}
                      className="btn btn-sm btn-warning text-dark fw-black text-uppercase rounded-0 border border-2 border-dark px-2.5 py-1 shadow-[2px_2px_0px_0px_black] animate-pulse"
                    >
                      ⚡ {pendingRequests.length} Follow Request{pendingRequests.length > 1 ? 's' : ''}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Stats Callout Box */}
          <div className="col-12 col-lg-5 col-xl-4">
            <div className="card bg-white text-dark rounded-0 border border-4 border-dark p-3 p-sm-4 shadow-[4px_4px_0px_0px_black]">
              <div className="row g-2 text-center align-items-center mb-3">
                <div className="col-6">
                  <span className="d-block text-muted small fw-bold text-uppercase">Total Points</span>
                  <span className="fs-2 fw-black text-success lh-1">{currentStudent.points} <span className="fs-6 text-muted fw-normal">pts</span></span>
                </div>
                <div className="col-6 border-start border-2 border-dark ps-2">
                  <span className="d-block text-muted small fw-bold text-uppercase">Campus Rank</span>
                  <span className="fs-2 fw-black text-dark lh-1">#{currentStudent.rank}</span>
                </div>
              </div>

              <button
                onClick={onOpenCertificateModal}
                className={`btn w-100 rounded-0 fw-black text-uppercase border border-3 border-dark py-2.5 shadow-[2px_2px_0px_0px_black] ${
                  is1000PtsUnlocked ? 'btn-warning text-dark' : 'btn-secondary text-white'
                }`}
              >
                <Award className="w-4 h-4 me-1.5 inline" />
                {is1000PtsUnlocked ? 'Eco Certificate' : 'Certificate (Locked)'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Official Social Media Channels Banner */}
      <div className="card bg-warning text-dark rounded-0 border border-4 border-dark p-4 shadow-[6px_6px_0px_0px_black]">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="p-3 bg-dark text-white rounded-0 border border-2 border-dark">
              <Megaphone className="w-6 h-6 text-warning" />
            </div>
            <div>
              <span className="badge bg-dark text-white fw-bold px-2.5 py-1 rounded-0 uppercase text-xs mb-1">Official Handles</span>
              <h5 className="fw-black text-uppercase m-0">Connect with Verde Tech Systems</h5>
              <p className="text-dark fw-medium small m-0">Follow our official channels for live updates, competitions, and sustainability highlights.</p>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <a
              href="https://www.instagram.com/verdetechsystems?stkn=MWcxbGRhYThyN2VlOA=="
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-dark text-white fw-black rounded-0 border border-2 border-dark px-3 py-2 text-uppercase small shadow-[2px_2px_0px_0px_black]"
            >
              Instagram
            </a>
            <a
              href="https://www.linkedin.com/company/verdetechsystemss"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-dark text-white fw-black rounded-0 border border-2 border-dark px-3 py-2 text-uppercase small shadow-[2px_2px_0px_0px_black]"
            >
              LinkedIn
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61594541660052"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-dark text-white fw-black rounded-0 border border-2 border-dark px-3 py-2 text-uppercase small shadow-[2px_2px_0px_0px_black]"
            >
              Facebook
            </a>
            <a
              href="https://www.youtube.com/channel/UCilJpKT3EpbNywLsUycQbFw"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-dark text-white fw-black rounded-0 border border-2 border-dark px-3 py-2 text-uppercase small shadow-[2px_2px_0px_0px_black]"
            >
              YouTube
            </a>
          </div>
        </div>
      </div>



      {/* Dashboard Navigation Tabs */}
      <div className="d-flex flex-wrap bg-light border border-4 border-dark rounded-0 p-1.5 gap-2 shadow-[4px_4px_0px_0px_black]">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`btn btn-sm rounded-0 fw-black text-uppercase border-2 px-3 py-2 ${
            activeTab === 'overview'
              ? 'bg-success text-white border-dark shadow-[2px_2px_0px_0px_black]'
              : 'btn-light text-dark border-transparent'
          }`}
        >
          Overview & Badges
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`btn btn-sm rounded-0 fw-black text-uppercase border-2 px-3 py-2 ${
            activeTab === 'logs'
              ? 'bg-success text-white border-dark shadow-[2px_2px_0px_0px_black]'
              : 'btn-light text-dark border-transparent'
          }`}
        >
          Activity Logs ({myLogs.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`btn btn-sm rounded-0 fw-black text-uppercase border-2 px-3 py-2 d-inline-flex align-items-center gap-2 ${
            activeTab === 'requests'
              ? 'bg-success text-white border-dark shadow-[2px_2px_0px_0px_black]'
              : 'btn-light text-dark border-transparent'
          }`}
        >
          <span>Follow Requests</span>
          {pendingRequests.length > 0 && (
            <span className="badge bg-warning text-dark rounded-0 font-monospace fw-black px-1.5 py-0.5">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <div className="ms-auto d-none d-md-flex align-items-center pe-2">
          <button
            type="button"
            onClick={() => onOpenNetworkModal?.('suggestions')}
            className="btn btn-outline-dark btn-sm rounded-0 fw-bold border-2"
          >
            Explore Peer Network →
          </button>
        </div>
      </div>

      {/* Tab 1: Overview & Badge Progress Tracker */}
      {activeTab === 'overview' && (
        <div className="card bg-white text-dark rounded-0 border border-4 border-dark p-4 p-md-5 shadow-[6px_6px_0px_0px_black]">
          <h3 className="fw-black text-uppercase mb-4">Badge Progress & Achievements</h3>
          <BadgeProgressTracker student={currentStudent} badges={badges} />
        </div>
      )}

      {/* Tab 2: Activity Logs History */}
      {activeTab === 'logs' && (
        <div className="card bg-white text-dark rounded-0 border border-4 border-dark p-4 p-md-5 shadow-[6px_6px_0px_0px_black]">
          <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-dark">
            <div>
              <h3 className="fw-black text-uppercase m-0">My Activity Log History ({myLogs.length})</h3>
              <p className="text-muted small m-0">Your verified green doings and smart bin deposits</p>
            </div>
            <button
              onClick={onOpenLogModal}
              className="btn btn-success text-white fw-black text-uppercase rounded-0 border border-3 border-dark px-4 py-2 shadow-[3px_3px_0px_0px_black]"
            >
              + Log New Activity
            </button>
          </div>

          {myLogs.length === 0 ? (
            <div className="text-center py-5">
              <Sparkles className="w-12 h-12 text-success mx-auto mb-3" />
              <h5 className="fw-black text-uppercase">No Activities Logged Yet</h5>
              <p className="text-muted fw-medium mb-3">Start logging your daily sustainability actions or scan smart bins to earn Verde Points!</p>
              <button
                onClick={onOpenLogModal}
                className="btn btn-success text-white fw-bold rounded-0 border border-2 border-dark px-4 py-2"
              >
                Log First Activity
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered border-dark align-middle m-0">
                <thead className="table-success text-dark">
                  <tr>
                    <th className="fw-black text-uppercase small">Activity</th>
                    <th className="fw-black text-uppercase small">Category</th>
                    <th className="fw-black text-uppercase small">Quantity</th>
                    <th className="fw-black text-uppercase small">Points</th>
                    <th className="fw-black text-uppercase small">Status</th>
                    <th className="fw-black text-uppercase small">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {myLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="fw-bold">{log.challengeTitle}</td>
                      <td>
                        <span className="badge bg-light text-dark border border-dark rounded-0 fw-bold">{log.category}</span>
                      </td>
                      <td className="fw-bold">{log.quantity} {log.unitLabel}</td>
                      <td>
                        <span className="badge bg-success text-white rounded-0 fw-bold">+{log.pointsEarned} Pts</span>
                      </td>
                      <td>
                        <span className={`badge rounded-0 fw-bold ${
                          log.status === 'Approved' ? 'bg-success text-white' : 'bg-warning text-dark'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="text-muted small">{new Date(log.timestamp).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Dedicated Follow Requests Tab (Requested by User) */}
      {activeTab === 'requests' && (
        <div className="card bg-white text-dark rounded-0 border border-4 border-dark p-4 p-md-5 shadow-[6px_6px_0px_0px_black]">
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4 pb-3 border-bottom border-dark">
            <div>
              <div className="d-flex align-items-center gap-2">
                <h3 className="fw-black text-uppercase m-0">
                  Follow Requests ({pendingRequests.length})
                </h3>
                {pendingRequests.length > 0 && (
                  <span className="badge bg-warning text-dark rounded-0 fw-black">Action Required</span>
                )}
              </div>
              <p className="text-muted small m-0 mt-1">
                Classmates requesting to follow your profile and view your verified sustainability progress
              </p>
            </div>

            <div className="badge bg-light text-dark border border-2 border-dark rounded-0 p-2 text-start">
              <span className="small text-muted d-block text-uppercase fw-bold">Current Setting</span>
              <strong className="text-success text-uppercase">
                {currentStudent.followPrivacy === 'direct' ? 'Direct Follow (Public)' : currentStudent.followPrivacy === 'request' ? 'Request Required' : 'Private Account'}
              </strong>
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-5">
              <div className="p-3 bg-light rounded-0 border border-3 border-dark d-inline-flex mx-auto mb-3 shadow-[3px_3px_0px_0px_black]">
                <ShieldCheck className="w-10 h-10 text-success" />
              </div>
              <h5 className="fw-black text-uppercase mb-1">No Pending Follow Requests</h5>
              <p className="text-muted small mb-4" style={{ maxWidth: '420px', margin: '0 auto' }}>
                Your request queue is clean! When other students request to follow your green journey, their requests will appear here for you to accept or decline.
              </p>
              <button
                type="button"
                onClick={() => onOpenNetworkModal?.('suggestions')}
                className="btn btn-warning text-dark fw-black text-uppercase rounded-0 border border-2 border-dark px-4 py-2.5 shadow-[3px_3px_0px_0px_black]"
              >
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
                    className="card bg-light text-dark rounded-0 border border-2 border-dark p-3 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 shadow-[2px_2px_0px_0px_black] mb-2"
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="bg-white rounded-0 border border-2 border-dark overflow-hidden flex-shrink-0"
                        style={{ width: '48px', height: '48px' }}
                      >
                        {requester?.avatarUrl ? (
                          <img src={requester.avatarUrl} alt={name} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                        ) : (
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center fw-black fs-5">
                            {name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div>
                        <h6 className="fw-black text-uppercase m-0">{name}</h6>
                        <div className="d-flex align-items-center gap-2 small text-muted mt-0.5">
                          <span className="badge bg-dark text-warning rounded-0 font-monospace px-2 py-0.5">
                            @{reqHandle}
                          </span>
                          {requester && (
                            <>
                              <span>•</span>
                              <span className="fw-bold text-success">{requester.points} Pts</span>
                              <span>•</span>
                              <span>{requester.grade}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onAcceptFollowRequest?.(reqId);
                          setToastMsg(`Accepted follow request from @${reqHandle}`);
                          setTimeout(() => setToastMsg(null), 3000);
                        }}
                        className="btn btn-sm btn-success text-white fw-black text-uppercase rounded-0 border border-2 border-dark px-3 py-1.5 shadow-[2px_2px_0px_0px_black] d-flex align-items-center gap-1"
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
                        className="btn btn-sm btn-outline-dark fw-bold text-uppercase rounded-0 border-2 px-3 py-1.5 d-flex align-items-center gap-1"
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

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-0 border border-4 border-dark shadow-[8px_8px_0px_0px_black]">
              <div className="modal-header bg-success text-white rounded-0 border-bottom border-4 border-dark">
                <h5 className="modal-title fw-black text-uppercase">Edit Profile & Avatar</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setIsEditProfileOpen(false)}
                ></button>
              </div>

              <form onSubmit={handleSaveProfile} className="modal-body bg-white text-dark p-4 space-y-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-uppercase small">Full Name *</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className="form-control rounded-0 border-2 border-dark fw-medium"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-bold text-uppercase small">Username Handle (@) *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark text-warning fw-black rounded-0 border-2 border-dark">@</span>
                      <input
                        type="text"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        required
                        className="form-control rounded-0 border-2 border-dark font-monospace fw-bold"
                        placeholder="username"
                        maxLength={20}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-bold text-uppercase small">Grade / Class</label>
                    <input
                      type="text"
                      value={editGrade}
                      onChange={(e) => setEditGrade(e.target.value)}
                      className="form-control rounded-0 border-2 border-dark fw-medium"
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-bold text-uppercase small">School Position / Role</label>
                    <select
                      value={editPosition}
                      onChange={(e) => setEditPosition(e.target.value)}
                      className="form-select rounded-0 border-2 border-dark fw-medium"
                    >
                      <option value="None / Member">None / Member</option>
                      <option value="Portal Administrator">Portal Administrator</option>
                      <option value="Eco Club President">Eco Club President</option>
                      <option value="Head Prefect">Head Prefect</option>
                      <option value="House Captain">House Captain</option>
                      <option value="Sustainability Lead">Sustainability Lead</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-bold text-uppercase small">Profession / Tagline</label>
                    <input
                      type="text"
                      value={editProfession}
                      onChange={(e) => setEditProfession(e.target.value)}
                      placeholder="e.g. Student Technologist"
                      className="form-control rounded-0 border-2 border-dark fw-medium"
                    />
                  </div>

                  {/* Follow Privacy Setting - Instagram Style */}
                  <div className="col-12 pt-2 border-top border-dark">
                    <label className="form-label fw-bold text-uppercase small mb-2 d-block">
                      Follow & Network Privacy
                    </label>
                    <div className="space-y-2">
                      <label 
                        className={`d-flex align-items-start gap-3 p-2.5 border-2 border-dark cursor-pointer rounded-0 ${
                          editFollowPrivacy === 'direct' ? 'bg-success-subtle border-success' : 'bg-light'
                        }`}
                        style={{ cursor: 'pointer' }}
                      >
                        <input
                          type="radio"
                          name="privacyOption"
                          value="direct"
                          checked={editFollowPrivacy === 'direct'}
                          onChange={() => setEditFollowPrivacy('direct')}
                          className="mt-1"
                        />
                        <div>
                          <span className="fw-black text-dark text-uppercase small d-block">
                            Direct Follow (Public)
                          </span>
                          <span className="text-muted small">
                            Anyone in the student network can follow you immediately with one click.
                          </span>
                        </div>
                      </label>

                      <label 
                        className={`d-flex align-items-start gap-3 p-2.5 border-2 border-dark cursor-pointer rounded-0 ${
                          editFollowPrivacy === 'request' ? 'bg-success-subtle border-success' : 'bg-light'
                        }`}
                        style={{ cursor: 'pointer' }}
                      >
                        <input
                          type="radio"
                          name="privacyOption"
                          value="request"
                          checked={editFollowPrivacy === 'request'}
                          onChange={() => setEditFollowPrivacy('request')}
                          className="mt-1"
                        />
                        <div>
                          <span className="fw-black text-dark text-uppercase small d-block">
                            Request to Follow
                          </span>
                          <span className="text-muted small">
                            Peers must send a follow request; you accept or decline in your Follow Requests tab.
                          </span>
                        </div>
                      </label>

                      <label 
                        className={`d-flex align-items-start gap-3 p-2.5 border-2 border-dark cursor-pointer rounded-0 ${
                          editFollowPrivacy === 'private' ? 'bg-success-subtle border-success' : 'bg-light'
                        }`}
                        style={{ cursor: 'pointer' }}
                      >
                        <input
                          type="radio"
                          name="privacyOption"
                          value="private"
                          checked={editFollowPrivacy === 'private'}
                          onChange={() => setEditFollowPrivacy('private')}
                          className="mt-1"
                        />
                        <div>
                          <span className="fw-black text-dark text-uppercase small d-block">
                            Private Account
                          </span>
                          <span className="text-muted small">
                            Followers require approval, and your activity logs remain private to non-followers.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Avatar Selection */}
                <div className="pt-3 border-top border-dark">
                  <label className="form-label fw-bold text-uppercase small mb-2">Choose Avatar / Profile Picture</label>
                  
                  <div className="d-flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setPhotoSourceTab('presets')}
                      className={`btn btn-sm rounded-0 fw-bold border-2 ${photoSourceTab === 'presets' ? 'bg-success text-white' : 'bg-light text-dark'}`}
                    >
                      Preset Avatars
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoSourceTab('upload')}
                      className={`btn btn-sm rounded-0 fw-bold border-2 ${photoSourceTab === 'upload' ? 'bg-success text-white' : 'bg-light text-dark'}`}
                    >
                      Upload File (Under 2MB)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoSourceTab('url')}
                      className={`btn btn-sm rounded-0 fw-bold border-2 ${photoSourceTab === 'url' ? 'bg-success text-white' : 'bg-light text-dark'}`}
                    >
                      Image URL
                    </button>
                  </div>

                  {photoSourceTab === 'presets' && (
                    <div className="row g-2">
                      {PRESET_AVATARS.map((p) => (
                        <div key={p.url} className="col-3 col-md-2 text-center">
                          <div
                            onClick={() => setPreviewAvatarUrl(p.url)}
                            className={`p-1 border-2 cursor-pointer ${previewAvatarUrl === p.url ? 'border-success bg-success-subtle' : 'border-dark bg-light'}`}
                            style={{ cursor: 'pointer' }}
                          >
                            <img src={p.url} alt={p.name} className="w-100 rounded-0" style={{ height: '60px', objectFit: 'cover' }} />
                            <span className="d-block xsmall fw-bold text-truncate mt-1">{p.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {photoSourceTab === 'upload' && (
                    <div className="p-4 bg-light border-2 border-dark text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="form-control rounded-0 border-2 border-dark"
                      />
                      <span className="d-block text-muted small mt-2">Supports JPG, PNG, WEBP (Max 2MB).</span>
                    </div>
                  )}

                  {photoSourceTab === 'url' && (
                    <div>
                      <input
                        type="url"
                        value={previewAvatarUrl}
                        onChange={(e) => setPreviewAvatarUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="form-control rounded-0 border-2 border-dark fw-medium"
                      />
                    </div>
                  )}

                  {/* Preview Selected */}
                  <div className="mt-3 d-flex align-items-center gap-3 p-3 bg-light border border-2 border-dark">
                    <div className="rounded-0 border border-2 border-dark overflow-hidden bg-white" style={{ width: '50px', height: '50px' }}>
                      {previewAvatarUrl ? (
                        <img src={previewAvatarUrl} alt="Preview" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                      ) : (
                        <User className="w-100 h-100 p-2 text-muted" />
                      )}
                    </div>
                    <div>
                      <span className="d-block fw-bold small text-uppercase">Avatar Preview</span>
                      <span className="text-muted xsmall text-truncate d-block" style={{ maxWidth: '300px' }}>{previewAvatarUrl || 'No image selected'}</span>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 pt-3 border-top border-dark">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(false)}
                    className="btn btn-outline-dark rounded-0 fw-bold border-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success text-white fw-black text-uppercase rounded-0 border border-3 border-dark px-4 py-2"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
