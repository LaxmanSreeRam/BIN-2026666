import React from 'react';
import { Student, ActivityLog } from '../types';
import { 
  Trophy, 
  Sparkles
} from 'lucide-react';
import { StudentLeaderboard } from './StudentLeaderboard';

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
  onOpenLogModal,
  onOpenCertificateModal,
}) => {
  const onlyStudents = students.filter((s) => s.grNo !== 'ADMIN-001');

  const totalPoints = onlyStudents.reduce((sum, s) => sum + (s.points || 0), 0);
  const totalCo2 = onlyStudents.reduce((sum, s) => sum + (s.co2SavedKg || 0), 0);
  const totalDisposals = logs.filter(l => l.status === 'Approved').length;

  return (
    <div className="space-y-10">
      
      {/* ══════════════════════════════════════════════════════════════
          CAMPUS DASHBOARD HERO SECTION
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#080c1b]/80 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl">
        
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />
        
        {/* Background Cyber Grid Accent */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(94, 242, 255, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(94, 242, 255, 0.15) 1px, transparent 1px)',
            backgroundSize: '36px 36px'
          }}
        />

        <div className="relative z-10">
          
          {/* Top HUD Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="hud-pill">
                <span className="hud-dot"></span>
                <span>VERDE TECH · TELEMETRY</span>
              </span>
              <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-medium">
                COMMUNITY INITIATIVE
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-cyan-400">TELEMETRY</span>
              <span>//</span>
              <span className="text-emerald-400">LIVE FEED</span>
            </div>
          </div>

          {/* Large Hero Title in Syne */}
          <div className="max-w-4xl space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-none font-display">
              WHERE SUSTAINABILITY <br />
              <span className="stai-gradient-text">BECOMES ACTION.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
              Smart bin telemetry, verified eco-actions, and sustainable community initiatives turning environmental goals into tangible reality.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-8">
            {onOpenLogModal && (
              <button
                onClick={onOpenLogModal}
                className="btn-stai-cyan text-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Log Verified Action</span>
              </button>
            )}

            {onOpenCertificateModal && currentStudent && (
              <button
                onClick={() => onOpenCertificateModal(currentStudent)}
                className="btn-stai-outline"
              >
                <Trophy className="w-4 h-4" />
                <span>My Certificate</span>
              </button>
            )}
          </div>

          {/* Real-time Telemetry Metrics Strip */}
          <div className="grid grid-cols-2 gap-4 mt-10 pt-8 border-t border-white/10 max-w-xl">

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-[11px] font-mono text-violet-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                <span>Active Members</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight tabular-nums">
                {onlyStudents.length} <span className="text-xs text-slate-400">members</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Verified Disposals</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-300 tracking-tight tabular-nums">
                {totalDisposals} <span className="text-xs text-slate-400">logs</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          LEADERBOARD SECTION (MEMBER RANKINGS)
          ══════════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-violet-400 tracking-widest uppercase mb-1">
              [ 01 // MEMBER RANKINGS ]
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Member Eco Leaderboard
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            VERIFIED THROUGH SMART BIN TELEMETRY
          </span>
        </div>

        <StudentLeaderboard
          students={students}
          currentStudent={currentStudent || null}
          onOpenLogModal={onOpenLogModal || (() => {})}
          onOpenCertificateModal={onOpenCertificateModal}
        />
      </section>

    </div>
  );
};

export const HouseLeaderboard = CampusDashboard;
