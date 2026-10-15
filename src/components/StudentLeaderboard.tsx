import React, { useState } from 'react';
import { Student, Badge } from '../types';
import { Crown, Search, Award, Shield, Sparkles } from 'lucide-react';
import { usePortalLogo } from '../utils/logoStorage';
import { INITIAL_BADGES } from '../data/mockData';

interface StudentLeaderboardProps {
  students: Student[];
  currentStudent: Student | null;
  onOpenLogModal: () => void;
  onOpenCertificateModal?: (student?: Student) => void;
}

export const StudentLeaderboard: React.FC<StudentLeaderboardProps> = ({
  students,
  currentStudent,
  onOpenCertificateModal,
}) => {
  const [logoSrc] = usePortalLogo();
  const [searchQuery, setSearchQuery] = useState('');
  const [timeframe, setTimeframe] = useState<'all' | 'weekly'>('all');

  const getStudentBadges = (student: Student): Badge[] => {
    const badgeSet = new Set(student.badges || []);
    if (student.points >= 1000) badgeSet.add('badge-century');
    if (student.role === 'Eco Officer') badgeSet.add('badge-captain');
    if (student.points >= 50) badgeSet.add('badge-waste-warrior');

    return INITIAL_BADGES.filter((b) => badgeSet.has(b.id));
  };

  const studentOnlyList = students.filter(
    (s) => s.grNo !== 'ADMIN-001'
  );

  const sortedStudents = [...studentOnlyList].sort((a, b) => {
    return timeframe === 'weekly' ? b.weeklyPoints - a.weeklyPoints : b.points - a.points;
  });

  const query = (searchQuery || '').trim().toLowerCase();
  const cleanQ = query.replace(/^@/, '');
  const filteredStudents = sortedStudents.filter((student) => {
    if (!student) return false;
    if (!query) return true;
    return (
      (student.name || '').toLowerCase().includes(query) ||
      (student.username && student.username.toLowerCase().includes(cleanQ)) ||
      (student.grNo || '').toLowerCase().includes(query) ||
      (student.grade || '').toLowerCase().includes(query) ||
      (student.profession ? String(student.profession).toLowerCase().includes(query) : false)
    );
  });

  const top3 = sortedStudents.slice(0, 3);

  return (
    <div className="container py-4">
      
      {/* Header & Timeframe Toggle */}
      <div className="card shadow-sm border-success mb-4 rounded-4">
        <div className="card-body p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <h2 className="h4 fw-extrabold text-dark d-flex align-items-center gap-2 m-0">
              <Crown className="text-warning w-5 h-5" />
              <span>Verde Tech Leaderboard</span>
            </h2>
            <p className="text-muted small m-0 mt-1">
              Top Sustainable Contributors ranked by verified Verde Tech Points
            </p>
          </div>

          <div className="btn-group shadow-sm bg-light p-1 rounded-pill" role="group">
            <button
              type="button"
              onClick={() => setTimeframe('all')}
              className={`btn btn-sm rounded-pill px-3 fw-bold ${timeframe === 'all' ? 'btn-success text-white shadow-sm' : 'btn-light text-muted'}`}
            >
              All-Time Points
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('weekly')}
              className={`btn btn-sm rounded-pill px-3 fw-bold ${timeframe === 'weekly' ? 'btn-success text-white shadow-sm' : 'btn-light text-muted'}`}
            >
              This Week's Gain
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {top3.length >= 3 && (
        <div className="row g-3 mb-4">
          
          {/* 2nd Place */}
          {top3[1] && (
            <div className="col-12 col-md-4 order-2 order-md-1">
              <div className="card h-100 shadow-sm border-success rounded-4 text-center p-4 position-relative">
                <span className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-secondary text-white px-3 py-1 fw-bold">
                  2nd Rank
                </span>
                <div className="mx-auto rounded-circle bg-light border border-success d-flex align-items-center justify-content-center fw-bold text-success mt-2 overflow-hidden shadow-sm" style={{ width: '70px', height: '70px' }}>
                  {top3[1].avatarUrl ? (
                    <img src={top3[1].avatarUrl} alt={top3[1].name} className="w-100 h-100 object-fit-cover" />
                  ) : (
                    top3[1].name.charAt(0)
                  )}
                </div>
                <h5 className="fw-bold mt-3 mb-1 text-dark">{top3[1].name}</h5>
                <p className="font-monospace text-success fw-bold small m-0">@{top3[1].username || top3[1].name.toLowerCase().replace(/[^a-z0-9]/g, '_')}</p>
                <div className="text-muted small mb-2">{top3[1].grade}</div>

                <div className="h4 fw-black text-success font-monospace m-0">
                  {timeframe === 'weekly' ? top3[1].weeklyPoints : top3[1].points} <span className="small text-muted">pts</span>
                </div>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <div className="col-12 col-md-4 order-1 order-md-2">
              <div className="card h-100 shadow border-success bg-success-subtle bg-opacity-25 rounded-4 text-center p-4 position-relative">
                <span className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-warning text-dark px-3 py-1 fw-bold shadow">
                  1st Rank 👑
                </span>
                <div className="mx-auto rounded-circle bg-white border border-success border-2 d-flex align-items-center justify-content-center fw-bold text-success mt-2 overflow-hidden shadow" style={{ width: '80px', height: '80px' }}>
                  {top3[0].avatarUrl ? (
                    <img src={top3[0].avatarUrl} alt={top3[0].name} className="w-100 h-100 object-fit-cover" />
                  ) : (
                    top3[0].name.charAt(0)
                  )}
                </div>
                <h5 className="fw-extrabold mt-3 mb-1 text-dark fs-4">{top3[0].name}</h5>
                <p className="font-monospace text-success fw-bold small m-0">@{top3[0].username || top3[0].name.toLowerCase().replace(/[^a-z0-9]/g, '_')}</p>
                <div className="text-muted small mb-2">{top3[0].grade}</div>

                <div className="h3 fw-black text-success font-monospace m-0">
                  {timeframe === 'weekly' ? top3[0].weeklyPoints : top3[0].points} <span className="small text-muted">pts</span>
                </div>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div className="col-12 col-md-4 order-3">
              <div className="card h-100 shadow-sm border-success rounded-4 text-center p-4 position-relative">
                <span className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-success text-white px-3 py-1 fw-bold">
                  3rd Rank
                </span>
                <div className="mx-auto rounded-circle bg-light border border-success d-flex align-items-center justify-content-center fw-bold text-success mt-2 overflow-hidden shadow-sm" style={{ width: '70px', height: '70px' }}>
                  {top3[2].avatarUrl ? (
                    <img src={top3[2].avatarUrl} alt={top3[2].name} className="w-100 h-100 object-fit-cover" />
                  ) : (
                    top3[2].name.charAt(0)
                  )}
                </div>
                <h5 className="fw-bold mt-3 mb-1 text-dark">{top3[2].name}</h5>
                <p className="font-monospace text-success fw-bold small m-0">@{top3[2].username || top3[2].name.toLowerCase().replace(/[^a-z0-9]/g, '_')}</p>
                <div className="text-muted small mb-2">{top3[2].grade}</div>

                <div className="h4 fw-black text-success font-monospace m-0">
                  {timeframe === 'weekly' ? top3[2].weeklyPoints : top3[2].points} <span className="small text-muted">pts</span>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Search Bar */}
      <div className="card shadow-sm border-success mb-4 rounded-4">
        <div className="card-body p-3">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0 shadow-none"
              placeholder="Search by name, @username, or grade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="card shadow-sm border-success rounded-4 overflow-hidden">
        <div className="table-responsive m-0">
          <table className="table table-hover table-striped align-middle mb-0">
            <thead className="table-success text-success">
              <tr>
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Contributor</th>
                <th className="py-3 px-3">Username</th>
                <th className="py-3 px-3">Grade / Role</th>
                <th className="py-3 px-3">Badges</th>
                <th className="py-3 px-3 text-end">Points</th>
                {onOpenCertificateModal && <th className="py-3 px-3 text-center">Certificate</th>}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, idx) => {
                const rank = sortedStudents.findIndex((s) => s.grNo === student.grNo) + 1;
                const isMe = currentStudent?.grNo === student.grNo;
                const badges = getStudentBadges(student);
                const handle = student.username || student.name.toLowerCase().replace(/[^a-z0-9]/g, '_');

                return (
                  <tr key={student.grNo} className={isMe ? 'table-success fw-bold' : ''}>
                    <td className="py-3 px-3 font-monospace fw-bold">
                      {rank === 1 ? '🥇 1' : rank === 2 ? '🥈 2' : rank === 3 ? '🥉 3' : `#${rank}`}
                    </td>
                    <td className="py-3 px-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle bg-success text-white fw-bold d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0 shadow-sm" style={{ width: '36px', height: '36px' }}>
                          {student.avatarUrl ? (
                            <img src={student.avatarUrl} alt={student.name} className="w-100 h-100 object-fit-cover" />
                          ) : (
                            student.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{student.name} {isMe && <span className="badge bg-success ms-1">You</span>}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-monospace text-success fw-bold">@{handle}</td>
                    <td className="py-3 px-3 text-muted">{student.grade}</td>
                    <td className="py-3 px-3">
                      <div className="d-flex flex-wrap gap-1">
                        {badges.map((b) => (
                          <span key={b.id} className="badge bg-success-subtle text-success border border-success fw-bold" title={b.description}>
                            {b.title}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-end font-monospace fw-black text-success fs-6">
                      {timeframe === 'weekly' ? student.weeklyPoints : student.points} pts
                    </td>
                    {onOpenCertificateModal && (
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onOpenCertificateModal(student)}
                          className="btn btn-outline-success btn-sm fw-bold"
                        >
                          Certificate
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
