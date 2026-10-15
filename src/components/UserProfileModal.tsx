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
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-0 border border-4 border-dark shadow-[8px_8px_0px_0px_black] overflow-hidden">
          
          {/* Header / Banner */}
          <div className="bg-success text-white p-4 p-md-5 position-relative border-bottom border-4 border-dark">
            <button
              onClick={onClose}
              className="btn btn-outline-light btn-sm rounded-0 position-absolute top-0 end-0 m-3 border-2"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start gap-4">
              {/* Avatar */}
              <div 
                className="bg-white text-dark rounded-0 border border-3 border-dark d-flex align-items-center justify-content-center fw-black fs-1 overflow-hidden shadow-[4px_4px_0px_0px_black] flex-shrink-0"
                style={{ width: '96px', height: '96px' }}
              >
                {student.avatarUrl ? (
                  <img src={student.avatarUrl} alt={student.name} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                ) : (
                  student.name.charAt(0)
                )}
              </div>

              <div className="text-center text-sm-start flex-grow-1 space-y-1">
                <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-sm-start gap-2 mb-1">
                  <span className="badge bg-dark text-white rounded-0 px-2.5 py-1 border border-light fw-bold text-uppercase">
                    {student.role || 'Eco Contributor'}
                  </span>
                  <span className="badge bg-dark text-warning rounded-0 px-2.5 py-1 border border-dark font-monospace fw-black">
                    @{student.username || student.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}
                  </span>
                  <span className="badge bg-white text-dark rounded-0 px-2 py-1 border border-dark text-uppercase small">
                    {student.followPrivacy === 'direct' ? 'Public' : student.followPrivacy === 'request' ? 'Request' : 'Private'}
                  </span>
                  {student.location && (
                    <span className="badge bg-light text-dark rounded-0 px-2.5 py-1 border border-dark fw-bold">
                      <MapPin className="w-3 h-3 me-1 inline" />
                      {student.location}
                    </span>
                  )}
                </div>

                <h3 className="fw-black text-uppercase text-white tracking-tight m-0">
                  {student.name}
                </h3>

                <p className="small text-light fw-medium m-0 opacity-90">
                  {student.grade || student.profession || 'Verde Tech Sustainability Network'}
                </p>

                {/* Followers & Following Counts */}
                <div className="d-flex align-items-center justify-content-center justify-content-sm-start gap-3 pt-2 small text-light fw-medium">
                  <span className="badge bg-dark text-white rounded-0 px-2.5 py-1 border border-white">
                    <strong className="text-warning me-1">{followersList.length}</strong> Followers
                  </span>
                  <span className="badge bg-dark text-white rounded-0 px-2.5 py-1 border border-white">
                    <strong className="text-warning me-1">{followingList.length}</strong> Following
                  </span>
                  <span className="badge bg-dark text-warning border border-warning rounded-0 font-monospace fw-bold px-2 py-1">
                    {student.points} Points
                  </span>
                </div>
              </div>

              {/* Follow & Message Buttons */}
              {!isSelf && currentStudent && (
                <div className="flex-shrink-0 mt-3 mt-sm-0 d-flex flex-wrap align-items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenDirectMessage?.(student);
                      onClose();
                    }}
                    className="btn btn-dark text-white fw-black text-uppercase rounded-0 border border-3 border-dark px-3 py-2 shadow-[2px_2px_0px_0px_black] d-inline-flex align-items-center gap-1.5"
                    title="Send Direct Message"
                  >
                    <Send className="w-4 h-4 text-warning" />
                    <span>Message</span>
                  </button>

                  {(() => {
                    const isPending = (student.followRequests || []).includes(currentStudent.grNo);
                    return (
                      <button
                        onClick={() => onToggleFollow(student.grNo)}
                        className={`btn fw-black text-uppercase rounded-0 border border-3 border-dark px-3 py-2 shadow-[2px_2px_0px_0px_black] ${
                          isFollowing
                            ? 'btn-light text-dark'
                            : isPending
                            ? 'btn-secondary text-white'
                            : 'btn-warning text-dark'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="w-4 h-4 me-1 inline" />
                            <span>Following</span>
                          </>
                        ) : isPending ? (
                          <>
                            <span>Requested</span>
                          </>
                        ) : student.followPrivacy === 'request' || student.followPrivacy === 'private' ? (
                          <>
                            <UserPlus className="w-4 h-4 me-1 inline" />
                            <span>Request to Follow</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 me-1 inline" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Quick Metrics Bar */}
            <div className="row g-2 text-center mt-4 pt-3 border-top border-light">
              <div className="col-3">
                <div className="bg-dark text-white p-2 border border-2 border-white rounded-0">
                  <span className="d-block small text-warning fw-bold text-uppercase">Rank</span>
                  <span className="fs-5 fw-black font-mono">#{student.rank}</span>
                </div>
              </div>
              <div className="col-3">
                <div className="bg-dark text-white p-2 border border-2 border-white rounded-0">
                  <span className="d-block small text-warning fw-bold text-uppercase">Points</span>
                  <span className="fs-5 fw-black font-mono">{student.points || 0}</span>
                </div>
              </div>
              <div className="col-3">
                <div className="bg-dark text-white p-2 border border-2 border-white rounded-0">
                  <span className="d-block small text-warning fw-bold text-uppercase">Badges</span>
                  <span className="fs-5 fw-black font-mono">{earnedBadges.length}</span>
                </div>
              </div>
              <div className="col-3">
                <div className="bg-dark text-white p-2 border border-2 border-white rounded-0">
                  <span className="d-block small text-warning fw-bold text-uppercase">Doings</span>
                  <span className="fs-5 fw-black font-mono">{userPosts.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="d-flex bg-light border-bottom border-dark px-3 pt-2 gap-2">
            <button
              onClick={() => setActiveTab('activity')}
              className={`btn btn-sm rounded-0 fw-black text-uppercase border-top border-start border-end border-2 border-dark ${
                activeTab === 'activity' ? 'bg-white text-dark border-bottom-0' : 'bg-transparent text-muted border-0'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 me-1 inline" />
              Green Doings ({userPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`btn btn-sm rounded-0 fw-black text-uppercase border-top border-start border-end border-2 border-dark ${
                activeTab === 'badges' ? 'bg-white text-dark border-bottom-0' : 'bg-transparent text-muted border-0'
              }`}
            >
              <Award className="w-3.5 h-3.5 me-1 inline" />
              Eco Badges ({earnedBadges.length})
            </button>
            <button
              onClick={() => setActiveTab('network')}
              className={`btn btn-sm rounded-0 fw-black text-uppercase border-top border-start border-end border-2 border-dark ${
                activeTab === 'network' ? 'bg-white text-dark border-bottom-0' : 'bg-transparent text-muted border-0'
              }`}
            >
              <Users className="w-3.5 h-3.5 me-1 inline" />
              Network ({followersList.length})
            </button>
          </div>

          {/* Modal Body / Tab Content */}
          <div className="modal-body bg-white text-dark p-4 overflow-y-auto" style={{ maxHeight: '50vh' }}>
            {activeTab === 'activity' && (
              <div className="space-y-3">
                {userPosts.length === 0 ? (
                  <div className="text-center py-5 text-muted small fw-bold">
                    {student.name} hasn't posted any green actions on the community feed yet.
                  </div>
                ) : (
                  userPosts.map((post) => (
                    <div key={post.id} className="card bg-light text-dark rounded-0 border border-2 border-dark p-3 shadow-[3px_3px_0px_0px_black] mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-warning text-dark rounded-0 border border-dark fw-bold">
                          {post.category}
                        </span>
                        <span className="text-muted small">{formatRelativeTime(post.timestamp)}</span>
                      </div>

                      {post.doingTag && (
                        <h6 className="fw-black text-uppercase text-success m-0 mb-1">
                          🌿 {post.doingTag}
                        </h6>
                      )}

                      <p className="text-dark small m-0 mb-2">{post.content}</p>

                      {post.location && (
                        <div className="small text-muted fw-bold mb-2">
                          <MapPin className="w-3.5 h-3.5 text-success inline me-1" />
                          <span>Location: {post.location}</span>
                        </div>
                      )}

                      {post.photoUrl && (
                        <div className="border border-2 border-dark overflow-hidden mb-2 bg-dark">
                          <img src={post.photoUrl} alt="Proof" className="w-100" style={{ maxHeight: '200px', objectFit: 'cover' }} />
                        </div>
                      )}

                      <div className="d-flex gap-3 pt-2 border-top border-dark text-muted small">
                        <span>❤️ {post.reactions?.cheer || 0} Cheers</span>
                        <span>🔥 {post.reactions?.fire || 0} Fire</span>
                        <span>🌿 {post.reactions?.leaf || 0} Eco</span>
                        <span>💬 {post.comments?.length || 0} Comments</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'badges' && (
              <div className="row g-3">
                {earnedBadges.length === 0 ? (
                  <div className="col-12 text-center py-5 text-muted small fw-bold">
                    No badges unlocked yet. Keep logging eco actions to earn badges!
                  </div>
                ) : (
                  earnedBadges.map((badge) => (
                    <div key={badge.id} className="col-sm-6">
                      <div className="card bg-light text-dark rounded-0 border border-2 border-dark p-3 d-flex flex-row align-items-center gap-3">
                        <div className="fs-2">{badge.icon}</div>
                        <div>
                          <h6 className="fw-black text-uppercase m-0">{badge.title}</h6>
                          <p className="text-muted small m-0 mt-1">{badge.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'network' && (
              <div className="space-y-3">
                <div className="card bg-light text-dark rounded-0 border border-2 border-dark p-3">
                  <h6 className="fw-black text-uppercase mb-2">Followers ({followersList.length})</h6>
                  {followersList.length === 0 ? (
                    <p className="text-muted small fst-italic m-0">No followers yet. Be the first to follow!</p>
                  ) : (
                    <div className="d-flex flex-wrap gap-1">
                      {followersList.map((fGrNo) => (
                        <span key={fGrNo} className="badge bg-dark text-white rounded-0 font-mono px-2 py-1">
                          {fGrNo}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card bg-light text-dark rounded-0 border border-2 border-dark p-3">
                  <h6 className="fw-black text-uppercase mb-2">Following ({followingList.length})</h6>
                  {followingList.length === 0 ? (
                    <p className="text-muted small fst-italic m-0">Not following anyone yet.</p>
                  ) : (
                    <div className="d-flex flex-wrap gap-1">
                      {followingList.map((fGrNo) => (
                        <span key={fGrNo} className="badge bg-dark text-white rounded-0 font-mono px-2 py-1">
                          {fGrNo}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer bg-light border-top border-4 border-dark d-flex justify-content-between">
            <span className="text-muted small fw-bold">Member since {student.joinedDate || '2026'}</span>
            {onOpenCertificateModal && (
              <button
                onClick={() => onOpenCertificateModal(student)}
                className="btn btn-success text-white fw-black text-uppercase rounded-0 border border-2 border-dark px-3 py-2 shadow-[2px_2px_0px_0px_black]"
              >
                View Eco Certificate
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
