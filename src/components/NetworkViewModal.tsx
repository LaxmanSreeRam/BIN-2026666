import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { 
  X, 
  Users, 
  UserPlus, 
  UserCheck, 
  Search, 
  MapPin, 
  Clock,
  Lock,
  Sparkles, 
  Shield, 
  Award,
  CheckCircle2,
  Compass,
  Send
} from 'lucide-react';

interface NetworkViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  currentStudent: Student | null;
  initialTab?: 'suggestions' | 'following' | 'followers';
  onToggleFollow: (targetGrNo: string) => void;
  onSelectStudent: (student: Student) => void;
  onOpenDirectMessage?: (student: Student) => void;
}

export const NetworkViewModal: React.FC<NetworkViewModalProps> = ({
  isOpen,
  onClose,
  students,
  currentStudent,
  initialTab = 'suggestions',
  onToggleFollow,
  onSelectStudent,
  onOpenDirectMessage,
}) => {
  if (!isOpen || !currentStudent) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'suggestions' | 'following' | 'followers'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  const myFollowing = currentStudent.following || [];
  const myFollowers = currentStudent.followers || [];

  const otherStudents = students.filter((s) => s.grNo !== currentStudent.grNo && s.grNo !== 'ADMIN-001');

  // Filtered lists
  const suggestions = otherStudents.filter((s) => !myFollowing.includes(s.grNo));
  const followingList = otherStudents.filter((s) => myFollowing.includes(s.grNo));
  const followersList = otherStudents.filter((s) => myFollowers.includes(s.grNo));

  const getActiveList = () => {
    if (activeTab === 'following') return followingList;
    if (activeTab === 'followers') return followersList;
    return suggestions;
  };

  const filteredList = getActiveList().filter((s) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const sUser = (s.username || '').toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      sUser.includes(q.replace(/^@/, '')) ||
      (s.grade && s.grade.toLowerCase().includes(q)) ||
      (s.location && s.location.toLowerCase().includes(q))
    );
  });

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-0 border border-4 border-dark shadow-[8px_8px_0px_0px_black] bg-white overflow-hidden">
          
          {/* Header */}
          <div className="bg-success text-white p-4 position-relative border-bottom border-4 border-dark">
            <button
              onClick={onClose}
              className="btn btn-outline-light btn-sm rounded-0 position-absolute top-0 end-0 m-3 border-2"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-dark text-white border border-2 border-white rounded-0">
                <Users className="w-6 h-6 text-warning" />
              </div>
              <div>
                <h4 className="fw-black text-uppercase text-white m-0">Verde Tech Peer Network</h4>
                <p className="small text-light fw-medium m-0 opacity-90">
                  Connect with classmates across campus, build your sustainability network, and cheer daily green actions.
                </p>
              </div>
            </div>

            {/* Search Input */}
            <div className="mt-3">
              <div className="input-group">
                <span className="input-group-text bg-dark text-white rounded-0 border-dark">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search peers by name or @username..."
                  className="form-control rounded-0 border-2 border-dark fw-medium"
                />
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="d-flex bg-light border-bottom border-dark px-3 pt-2 gap-2">
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`btn btn-sm rounded-0 fw-black text-uppercase border-top border-start border-end border-2 border-dark ${
                activeTab === 'suggestions' ? 'bg-white text-dark border-bottom-0' : 'bg-transparent text-muted border-0'
              }`}
            >
              Discover Peers ({suggestions.length})
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`btn btn-sm rounded-0 fw-black text-uppercase border-top border-start border-end border-2 border-dark ${
                activeTab === 'following' ? 'bg-white text-dark border-bottom-0' : 'bg-transparent text-muted border-0'
              }`}
            >
              Following ({followingList.length})
            </button>
            <button
              onClick={() => setActiveTab('followers')}
              className={`btn btn-sm rounded-0 fw-black text-uppercase border-top border-start border-end border-2 border-dark ${
                activeTab === 'followers' ? 'bg-white text-dark border-bottom-0' : 'bg-transparent text-muted border-0'
              }`}
            >
              Followers ({followersList.length})
            </button>
          </div>

          {/* Content List */}
          <div className="modal-body bg-white text-dark p-4 overflow-y-auto" style={{ maxHeight: '55vh' }}>
            {filteredList.length === 0 ? (
              <div className="text-center py-5 text-muted small fw-bold">
                No students found matching your search.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredList.map((student) => {
                  const isFollowing = myFollowing.includes(student.grNo);
                  const isPending = (student.followRequests || []).includes(currentStudent.grNo);
                  const userHandle = student.username || student.name.toLowerCase().replace(/[^a-z0-9]/g, '_');

                  return (
                    <div
                      key={student.grNo}
                      className="card bg-light text-dark rounded-0 border border-2 border-dark p-3 d-flex flex-row align-items-center justify-content-between gap-3 shadow-[2px_2px_0px_0px_black] mb-2"
                    >
                      <div
                        onClick={() => {
                          onSelectStudent(student);
                          onClose();
                        }}
                        className="d-flex align-items-center gap-3 cursor-pointer flex-grow-1"
                        style={{ cursor: 'pointer' }}
                      >
                        <div
                          className="bg-white rounded-0 border border-2 border-dark overflow-hidden flex-shrink-0"
                          style={{ width: '48px', height: '48px' }}
                        >
                          {student.avatarUrl ? (
                            <img src={student.avatarUrl} alt={student.name} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                          ) : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center fw-black fs-5">
                              {student.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <h6 className="fw-black text-uppercase m-0">{student.name}</h6>
                            {student.followPrivacy === 'private' && (
                              <Lock className="w-3.5 h-3.5 text-muted" title="Private Account" />
                            )}
                          </div>
                          <div className="d-flex align-items-center gap-2 small text-muted mt-0.5">
                            <span className="badge bg-dark text-warning rounded-0 font-monospace px-2 py-0.5">
                              @{userHandle}
                            </span>
                            <span>•</span>
                            <span className="fw-bold text-success">{student.points} Pts</span>
                            {student.grade && (
                              <>
                                <span>•</span>
                                <span>{student.grade}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onOpenDirectMessage?.(student);
                            onClose();
                          }}
                          className="btn btn-sm btn-dark text-white rounded-0 border border-2 border-dark px-2.5 py-1.5 shadow-[2px_2px_0px_0px_black] d-inline-flex align-items-center gap-1"
                          title="Message Student"
                        >
                          <Send className="w-3.5 h-3.5 text-warning" />
                          <span className="small fw-bold d-none d-sm-inline">Message</span>
                        </button>

                        <button
                          onClick={() => onToggleFollow(student.grNo)}
                          className={`btn btn-sm rounded-0 fw-black text-uppercase border border-2 border-dark px-3 py-1.5 shadow-[2px_2px_0px_0px_black] ${
                            isFollowing
                              ? 'btn-light text-dark'
                              : isPending
                              ? 'btn-secondary text-white'
                              : 'btn-warning text-dark'
                          }`}
                        >
                          {isFollowing ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5 me-1 inline" />
                              <span>Following</span>
                            </>
                          ) : isPending ? (
                            <>
                              <Clock className="w-3.5 h-3.5 me-1 inline" />
                              <span>Requested</span>
                            </>
                          ) : student.followPrivacy === 'request' || student.followPrivacy === 'private' ? (
                            <>
                              <UserPlus className="w-3.5 h-3.5 me-1 inline" />
                              <span>Request</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5 me-1 inline" />
                              <span>Follow</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="modal-footer bg-light border-top border-4 border-dark">
            <button onClick={onClose} className="btn btn-outline-dark rounded-0 fw-bold border-2">
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
