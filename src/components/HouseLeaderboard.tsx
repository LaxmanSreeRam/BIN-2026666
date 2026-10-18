import React from 'react';
import { Student, ActivityLog } from '../types';
import { Trophy, Sparkles, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <div className="space-y-8">
      
      {/* Game-like Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-3xl p-8 text-white shadow-xl"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-emerald-500/50 rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 inline mr-1" />
                Live Mission
              </span>
            </div>
            <h1 className="text-4xl font-extrabold mb-2 font-display">Campus Impact Dashboard</h1>
            <p className="text-emerald-100 font-medium">Track your sustainability missions and climb the leaderboards!</p>
          </div>

          <div className="flex items-center gap-6 bg-emerald-900/50 p-6 rounded-2xl">
            <div className="text-center">
              <div className="text-xs text-emerald-300 font-bold uppercase tracking-wider">Contributors</div>
              <div className="text-3xl font-extrabold tabular-nums">{onlyStudents.length}</div>
            </div>
            <div className="w-px h-12 bg-emerald-700"></div>
            <div className="text-center">
              <div className="text-xs text-emerald-300 font-bold uppercase tracking-wider">Total Points</div>
              <div className="text-3xl font-extrabold tabular-nums text-amber-400">
                {onlyStudents.reduce((sum, s) => sum + s.points, 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mission Board Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mission-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-display">Leaderboard</h2>
          </div>
          <StudentLeaderboard
            students={students}
            currentStudent={currentStudent || null}
            onOpenLogModal={() => {}}
            onOpenCertificateModal={onOpenCertificateModal}
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mission-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-display">Bonus Missions</h2>
          </div>
          <SpinningWheel
            currentStudent={currentStudent || null}
            logs={logs}
            onUpdateStudent={onUpdateStudent}
          />
        </motion.div>
      </div>

    </div>
  );
};

export const HouseLeaderboard = CampusDashboard;
