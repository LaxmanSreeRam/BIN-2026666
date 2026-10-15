import React from 'react';
import { Student, ActivityLog } from '../types';
import { Trophy, Sparkles } from 'lucide-react';
import { StudentLeaderboard } from './StudentLeaderboard';
import { SpinningWheel } from './SpinningWheel';

interface CampusDashboardProps {
  students: Student[];
  weeklyChartData?: any[];
  currentStudent?: Student | null;
  logs?: ActivityLog[];
  onOpenLogModal?: () => void;
  onOpenCertificateModal?: (student?: Student) => void;
  onUpdateStudent?: (student: Student) => void;
}

export const CampusDashboard: React.FC<CampusDashboardProps> = ({
  students,
  currentStudent,
  logs = [],
  onOpenCertificateModal,
  onUpdateStudent,
}) => {
  const onlyStudents = students.filter(
    (s) => s.grNo !== 'ADMIN-001'
  );

  return (
    <div className="container py-5">
      
      {/* Hero Banner - Eco Yellow Color Blocking */}
      <div className="card text-dark rounded-0 p-4 p-md-5 mb-5" style={{ backgroundColor: '#F0C020', border: '4px solid #121212', boxShadow: '8px 8px 0px 0px #121212' }}>
        <div className="card-body d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 p-0">
          <div>
            <div className="badge bg-dark text-white fw-black px-3 py-2 rounded-0 text-uppercase mb-3" style={{ border: '2px solid #121212' }}>
              <Sparkles className="w-3.5 h-3.5 me-1 text-warning" />
              Sustainability Rankings
            </div>

            <h1 className="display-5 fw-black text-dark text-uppercase d-flex align-items-center gap-2 mb-2 tracking-tighter" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <Trophy className="w-10 h-10 text-danger flex-shrink-0" />
              <span>Verde Tech Leaderboard</span>
            </h1>

            <p className="text-dark fw-bold fs-6 m-0 opacity-90">
              Top Sustainable Contributors ranked by verified Verde Tech Points
            </p>
          </div>

          <div className="bg-white border border-4 border-dark p-4 rounded-0 d-flex align-items-center gap-4 flex-shrink-0 shadow-[4px_4px_0px_0px_black]">
            <div>
              <div className="small fw-bold text-uppercase text-muted">Contributors</div>
              <div className="h3 fw-black text-dark m-0">{onlyStudents.length}</div>
            </div>
            <div className="vr bg-dark opacity-100" style={{ width: '3px' }}></div>
            <div>
              <div className="small fw-bold text-uppercase text-muted">Total Points</div>
              <div className="h3 fw-black text-danger m-0">
                {onlyStudents.reduce((sum, s) => sum + s.points, 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Student Leaderboard */}
      <div className="mb-5">
        <StudentLeaderboard
          students={students}
          currentStudent={currentStudent || null}
          onOpenLogModal={() => {}}
          onOpenCertificateModal={onOpenCertificateModal}
        />
      </div>

      {/* Spinning Wheel */}
      <div className="mb-4">
        <SpinningWheel
          currentStudent={currentStudent || null}
          logs={logs}
          onUpdateStudent={onUpdateStudent}
        />
      </div>

    </div>
  );
};

export const HouseLeaderboard = CampusDashboard;
