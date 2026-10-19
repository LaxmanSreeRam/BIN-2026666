import React, { useState } from 'react';
import { Student, ActivityLog } from '../types';
import { 
  Trophy, 
  Sparkles, 
  Zap, 
  Flame, 
  Leaf, 
  ShieldCheck, 
  Globe2, 
  Compass, 
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
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
  onOpenLogModal,
  onOpenCertificateModal,
  onUpdateStudent,
}) => {
  const onlyStudents = students.filter((s) => s.grNo !== 'ADMIN-001');

  const totalPoints = onlyStudents.reduce((sum, s) => sum + (s.points || 0), 0);
  const totalCo2 = onlyStudents.reduce((sum, s) => sum + (s.co2SavedKg || 0), 0);
  const totalWaste = onlyStudents.reduce((sum, s) => sum + (s.wasteDivertedKg || 0), 0);
  const totalDisposals = logs.filter(l => l.status === 'Approved').length;

  const [activePillar, setActivePillar] = useState<'waste' | 'energy' | 'nature' | 'mobility'>('waste');

  const pillars = [
    {
      id: 'waste',
      title: '01 · Circular Waste & Smart Bins',
      desc: 'Smart IoT telemetry sensors and verified sorting divert campus plastics and e-waste.',
      icon: '♻️',
      stat: `${totalWaste.toFixed(0)} kg`,
      label: 'Waste Diverted'
    },
    {
      id: 'energy',
      title: '02 · Clean Power & Grid Efficiency',
      desc: 'Classroom energy audits, vampire load elimination, and solar monitoring in real-time.',
      icon: '💡',
      stat: '340 kWh',
      label: 'Energy Conserved'
    },
    {
      id: 'nature',
      title: '03 · Campus Ecosystems & Planting',
      desc: 'Tree sapling care, indigenous flora planting, and soil conservation missions.',
      icon: '🌱',
      stat: `${totalCo2.toFixed(1)} kg`,
      label: 'CO₂ Neutralized'
    },
    {
      id: 'mobility',
      title: '04 · Low-Carbon Transit & Walkers',
      desc: 'Pedestrian and cycle commutes tracked with eco bonuses and house credit.',
      icon: '🚴',
      stat: '100% Green',
      label: 'Campus Mobility'
    }
  ];

  return (
    <div className="space-y-10">
      
      {/* ══════════════════════════════════════════════════════════════
          STAI FUTURE WORLD HERO SECTION
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
                <span>FUTURE WORLD · 2026</span>
              </span>
              <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-violet-500/10 border border-violet-400/30 text-violet-300 text-xs font-mono font-medium">
                ISWK · CAMPUS ECO INNOVATION
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
              <span className="stai-gradient-text">BECOMES INVENTION.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
              Enter the Verde Tech Future World — four mission pillars, smart bin telemetry, and verified student actions turning campus climate goals into tangible reality.
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-white/10">
            
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Total Verde Points</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight tabular-nums">
                {totalPoints.toLocaleString()} <span className="text-xs text-cyan-400">pts</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-[11px] font-mono text-violet-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                <span>Verified Students</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight tabular-nums">
                {onlyStudents.length} <span className="text-xs text-slate-400">makers</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>CO₂ Neutralized</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-300 tracking-tight tabular-nums">
                {totalCo2.toFixed(1)} <span className="text-xs text-slate-400">kg</span>
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
          FOUR WORLDS / PILLARS (Inspired directly by STAI Worlds)
          ══════════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-cyan-400 tracking-widest uppercase mb-1">
              [ 01 // SUSTAINABILITY WORLDS ]
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Four Worlds of Action
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            SELECT A WORLD TO VIEW IMPACT
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((p) => {
            const isSelected = activePillar === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setActivePillar(p.id as any)}
                className={`stai-card p-5 cursor-pointer select-none transition-all ${
                  isSelected 
                    ? 'border-cyan-400 shadow-[0_0_30px_rgba(94,242,255,0.2)] bg-[#0d1326]' 
                    : 'hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{p.icon}</span>
                  <span className="font-mono text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-400/20">
                    {p.stat}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base mb-2 font-display">
                  {p.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {p.desc}
                </p>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{p.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          LEADERBOARD SECTION (MAKERS OF CHANGE)
          ══════════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-violet-400 tracking-widest uppercase mb-1">
              [ 02 // MAKERS & RANKINGS ]
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Campus Makers Leaderboard
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

      {/* ══════════════════════════════════════════════════════════════
          BONUS WHEEL & MYSTERY CHALLENGES
          ══════════════════════════════════════════════════════════════ */}
      <section className="stai-card p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
          <div>
            <div className="text-xs font-mono text-amber-400 tracking-wider uppercase mb-1">
              [ BONUS LAB PROTOCOL ]
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Campus Eco Spin & Bonus Grant</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Spin to receive daily eco-actions, multiplier points, and campus house achievements.
            </p>
          </div>
        </div>

        <SpinningWheel
          currentStudent={currentStudent || null}
          logs={logs}
          onUpdateStudent={onUpdateStudent}
        />
      </section>

    </div>
  );
};

export const HouseLeaderboard = CampusDashboard;
