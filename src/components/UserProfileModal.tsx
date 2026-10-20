import React, { useState } from 'react';
import { Student, FeedPost, Badge } from '../types';
import { 
  X, 
  UserPlus, 
  UserCheck, 
  MapPin, 
  Award, 
  Sparkles, 
  Shield, 
  MessageCircle, 
  Heart, 
  Flame, 
  Leaf, 
  Lightbulb,
  CheckCircle2,
  Users,
  Briefcase,
  Send
} from 'lucide-react';
import { INITIAL_BADGES } from '../data/mockData';
import { formatRelativeTime } from './CommunityFeed';

interface UserProfileModalProps {
  student: Student;
  currentStudent: Student | null;
  posts: FeedPost[];
  onClose: () => void;
  onToggleFollow: (targetGrNo: string) => void;
  onOpenCertificateModal?: (student: Student) => void;
  onOpenDirectMessage?: (student: Student) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  student,
  currentStudent,
  posts,
  onClose,
  onToggleFollow,
  onOpenCertificateModal,
  onOpenDirectMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'activity' | 'badges' | 'network'>('activity');

  const isSelf = currentStudent?.grNo === student.grNo;
  const followersList = student.followers || [];
  const followingList = student.following || [];
  const isFollowing = currentStudent ? followersList.includes(currentStudent.grNo) : false;

  const userPosts = posts.filter((p) => p.grNo === student.grNo);

  const getStudentBadges = (st: Student): Badge[] => {
    const badgeSet = new Set(st.badges || []);
    if (st.points >= 1000) badgeSet.add('badge-century');
    if (st.role === 'Eco Officer' || st.role === 'Admin') badgeSet.add('badge-captain');
    if (st.points >= 50) badgeSet.add('badge-waste-warrior');
    return INITIAL_BADGES.filter((b) => badgeSet.has(b.id));
  };

  const earnedBadges = getStudentBadges(student);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#0a0f24] border border-cyan-400/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(94,242,255,0.2)] animate-scaleUp max-h-[90vh] flex flex-col">
        
        {/* Header / Banner */}
        <div className="bg-gradient-to-r from-cyan-950/80 via-emerald-950/60 to-black p-6 relative border-b border-white/10 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400/50 flex items-center justify-center text-2xl font-bold text-cyan-300 overflow-hidden shadow-[0_0_20px_rgba(94,242,255,0.3)] shrink-0">
              {student.avatarUrl ? (
                <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
              ) : (
                student.name.charAt(0)
              )}
            </div>

            <div className="text-center sm:text-left flex-grow space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 font-mono text-xs font-bold uppercase">
                  {student.role || 'Eco Contributor'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-mono text-xs">
                  @{student.username || student.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}
                </span>
                {student.location && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs flex items-center gap-1 font-mono">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    {student.location}
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                {student.name}
              </h3>

              <p className="text-xs font-mono text-slate-400">
                {student.grade || student.profession || 'Verde Tech Sustainability Innovator'}
              </p>

              {/* Followers / Following / Points */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs font-mono">
                <span className="text-slate-300">
                  <strong className="text-cyan-400 font-bold mr-1">{followersList.length}</strong> Followers
                </span>
                <span className="text-slate-300">
                  <strong className="text-cyan-400 font-bold mr-1">{followingList.length}</strong> Following
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 font-bold">
                  {student.points} Points
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            {!isSelf && currentStudent && (
              <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                <button
                  type="button"
                  onClick={() => {
                    onOpenDirectMessage?.(student);
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                  title="Send Direct Message"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Message</span>
                </button>

                {(() => {
                  const isPending = (student.followRequests || []).includes(currentStudent.grNo);
                  return (
                    <button
                      onClick={() => onToggleFollow(student.grNo)}
                      className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                        isFollowing
                          ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                          : isPending
                          ? 'bg-slate-800 text-slate-400 border border-white/10'
                          : 'bg-gradient-to-r from-cyan-400 to-teal-300 text-slate-950 shadow-[0_0_15px_rgba(94,242,255,0.3)]'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Following</span>
                        </>
                      ) : isPending ? (
                        <span>Requested</span>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/10 text-center font-mono">
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Rank</span>
              <span className="text-sm font-bold text-cyan-400">#{student.rank || '-'}</span>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Points</span>
              <span className="text-sm font-bold text-emerald-400">{student.points || 0}</span>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Badges</span>
              <span className="text-sm font-bold text-amber-400">{earnedBadges.length}</span>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Posts</span>
              <span className="text-sm font-bold text-teal-400">{userPosts.length}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-black/40 px-6 shrink-0">
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-3 text-xs font-mono font-bold transition-all border-b-2 ${
              activeTab === 'activity'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Activity Feed ({userPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-3 text-xs font-mono font-bold transition-all border-b-2 ${
              activeTab === 'badges'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Badges & Honors ({earnedBadges.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-grow">
          {activeTab === 'activity' && (
            <div className="space-y-4">
              {userPosts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-mono text-xs">
                  No activity posts shared yet.
                </div>
              ) : (
                userPosts.map((post) => (
                  <div key={post.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span>{post.category}</span>
                      <span>{formatRelativeTime(post.timestamp)}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white font-display">{post.title}</h4>
                    <p className="text-xs text-slate-300">{post.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {earnedBadges.map((badge) => (
                <div key={badge.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-display">{badge.title}</h4>
                    <p className="text-[11px] text-slate-400">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-between items-center shrink-0">
          <span className="text-[11px] font-mono text-slate-500">
            Verified Eco ID: VERDE-@{student.username || student.grNo}
          </span>
          {onOpenCertificateModal && (
            <button
              onClick={() => onOpenCertificateModal(student)}
              className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>View Certificate</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
