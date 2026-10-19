import React, { useState } from 'react';
import { Student, Badge } from '../types';
import { Crown, Search, Award, Shield, Sparkles, Trophy } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [timeframe, setTimeframe] = useState<'all' | 'weekly'>('all');

  const getStudentBadges = (student: Student): Badge[] => {
    const badgeSet = new Set(student.badges || []);
    if (student.points >= 1000) badgeSet.add('badge-century');
    if (student.role === 'Eco Officer') badgeSet.add('badge-captain');
    if (student.points >= 50) badgeSet.add('badge-waste-warrior');

    return INITIAL_BADGES.filter((b) => badgeSet.has(b.id));
  };

  const studentOnlyList = students.filter((s) => s.grNo !== 'ADMIN-001');

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
      (student.grade || '').toLowerCase().includes(query)
    );
  });

  const top3 = sortedStudents.slice(0, 3);

  return (
    <div className="space-y-6">
      
      {/* Timeframe Filter Bar & Search */}
      <div className="stai-card p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Toggle Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/10 rounded-full w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setTimeframe('all')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
              timeframe === 'all'
                ? 'bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 shadow-[0_0_15px_rgba(94,242,255,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All-Time Points
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('weekly')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
              timeframe === 'weekly'
                ? 'bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 shadow-[0_0_15px_rgba(94,242,255,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            This Week's Gain
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/30 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
            placeholder="Search contributor / @handle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

      </div>

      {/* Top 3 Podium Cards (STAI Cyber World Style) */}
      {top3.length >= 3 && !query && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* 2nd Place */}
          {top3[1] && (
            <div className="order-2 md:order-1 stai-card p-6 text-center border-violet-500/30 hover:border-violet-400 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-violet-500/20 text-violet-300 font-mono text-[10px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-violet-500/30">
                RANK 02 · SILVER
              </div>
              
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-400 p-0.5 shadow-[0_0_20px_rgba(157,123,255,0.3)] my-2">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden font-bold text-violet-300">
                  {top3[1].avatarUrl ? (
                    <img src={top3[1].avatarUrl} alt={top3[1].name} className="w-full h-full object-cover" />
                  ) : (
                    top3[1].name.charAt(0)
                  )}
                </div>
              </div>

              <h3 className="font-bold text-white text-base mt-2 mb-0.5 font-display truncate">
                {top3[1].name}
              </h3>
              <p className="font-mono text-cyan-400 text-xs font-semibold mb-1">
                @{top3[1].username || top3[1].name.toLowerCase().replace(/[^a-z0-9]/g, '_')}
              </p>
              <div className="text-[11px] text-slate-400 mb-3">{top3[1].grade}</div>

              <div className="pt-3 border-t border-white/5">
                <span className="font-mono text-xl font-extrabold text-white tabular-nums tracking-tight">
                  {(timeframe === 'weekly' ? top3[1].weeklyPoints : top3[1].points).toLocaleString()}
                </span>
                <span className="text-xs font-mono text-violet-400 ml-1">pts</span>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <div className="order-1 md:order-2 stai-card p-7 text-center border-cyan-400/50 shadow-[0_0_35px_rgba(94,242,255,0.2)] bg-gradient-to-b from-cyan-950/20 via-[#0a0e1d] to-[#080c1a] relative overflow-hidden -translate-y-1">
              <div className="absolute top-0 right-0 bg-cyan-400 text-slate-950 font-mono text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-lg">
                RANK 01 · CHAMPION 👑
              </div>

              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-400 via-amber-300 to-violet-500 p-1 shadow-[0_0_30px_rgba(94,242,255,0.5)] my-2">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden font-bold text-cyan-300 text-lg">
                  {top3[0].avatarUrl ? (
                    <img src={top3[0].avatarUrl} alt={top3[0].name} className="w-full h-full object-cover" />
                  ) : (
                    top3[0].name.charAt(0)
                  )}
                </div>
              </div>

              <h3 className="font-extrabold text-white text-lg mt-2 mb-0.5 font-display truncate">
                {top3[0].name}
              </h3>
              <p className="font-mono text-cyan-300 text-xs font-bold mb-1">
                @{top3[0].username || top3[0].name.toLowerCase().replace(/[^a-z0-9]/g, '_')}
              </p>
              <div className="text-[11px] text-slate-400 mb-3">{top3[0].grade}</div>

              <div className="pt-3 border-t border-cyan-400/20">
                <span className="font-mono text-2xl font-black text-cyan-300 tabular-nums tracking-tight">
                  {(timeframe === 'weekly' ? top3[0].weeklyPoints : top3[0].points).toLocaleString()}
                </span>
                <span className="text-xs font-mono text-cyan-400 ml-1">pts</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div className="order-3 stai-card p-6 text-center border-emerald-500/30 hover:border-emerald-400 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-emerald-500/30">
                RANK 03 · BRONZE
              </div>

              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400 p-0.5 shadow-[0_0_20px_rgba(57,255,20,0.3)] my-2">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden font-bold text-emerald-300">
                  {top3[2].avatarUrl ? (
                    <img src={top3[2].avatarUrl} alt={top3[2].name} className="w-full h-full object-cover" />
                  ) : (
                    top3[2].name.charAt(0)
                  )}
                </div>
              </div>

              <h3 className="font-bold text-white text-base mt-2 mb-0.5 font-display truncate">
                {top3[2].name}
              </h3>
              <p className="font-mono text-emerald-400 text-xs font-semibold mb-1">
                @{top3[2].username || top3[2].name.toLowerCase().replace(/[^a-z0-9]/g, '_')}
              </p>
              <div className="text-[11px] text-slate-400 mb-3">{top3[2].grade}</div>

              <div className="pt-3 border-t border-white/5">
                <span className="font-mono text-xl font-extrabold text-white tabular-nums tracking-tight">
                  {(timeframe === 'weekly' ? top3[2].weeklyPoints : top3[2].points).toLocaleString()}
                </span>
                <span className="text-xs font-mono text-emerald-400 ml-1">pts</span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Main Leaderboard Table in Cyber Glass */}
      <div className="stai-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-black/50 border-b border-white/10 font-mono text-[11px] text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Rank</th>
                <th className="py-3.5 px-4">Student Maker</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Handle</th>
                <th className="py-3.5 px-4 hidden sm:table-cell">Grade / Role</th>
                <th className="py-3.5 px-4 hidden lg:table-cell">Badges</th>
                <th className="py-3.5 px-4 text-right">Verde Pts</th>
                {onOpenCertificateModal && <th className="py-3.5 px-4 text-center">Audit</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredStudents.map((student) => {
                const rank = sortedStudents.findIndex((s) => s.grNo === student.grNo) + 1;
                const isMe = currentStudent?.grNo === student.grNo;
                const badges = getStudentBadges(student);
                const handle = student.username || student.name.toLowerCase().replace(/[^a-z0-9]/g, '_');

                return (
                  <tr 
                    key={student.grNo} 
                    className={`transition-colors ${
                      isMe 
                        ? 'bg-cyan-500/10 font-medium' 
                        : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {rank === 1 ? (
                        <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">#01 👑</span>
                      ) : rank === 2 ? (
                        <span className="px-2 py-0.5 rounded bg-violet-400/20 text-violet-300 border border-violet-400/40">#02</span>
                      ) : rank === 3 ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">#03</span>
                      ) : (
                        <span className="text-slate-400">#{rank < 10 ? `0${rank}` : rank}</span>
                      )}
                    </td>

                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 border border-white/20 shrink-0 flex items-center justify-center font-bold text-xs text-white">
                          {student.avatarUrl ? (
                            <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            student.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{student.name}</span>
                            {isMe && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-400 text-slate-950 font-bold uppercase">
                                You
                              </span>
                            )}
                          </div>
                          <div className="md:hidden font-mono text-[11px] text-cyan-400">@{handle}</div>
                        </div>
                      </div>
                    </td>

                    {/* Handle */}
                    <td className="py-3.5 px-4 hidden md:table-cell font-mono text-cyan-400 text-xs">
                      @{handle}
                    </td>

                    {/* Grade */}
                    <td className="py-3.5 px-4 hidden sm:table-cell text-slate-400 text-xs">
                      {student.grade}
                    </td>

                    {/* Badges */}
                    <td className="py-3.5 px-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {badges.slice(0, 2).map((b) => (
                          <span 
                            key={b.id} 
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-slate-300" 
                            title={b.description}
                          >
                            {b.title}
                          </span>
                        ))}
                        {badges.length > 2 && (
                          <span className="text-[10px] font-mono text-slate-500">+{badges.length - 2}</span>
                        )}
                      </div>
                    </td>

                    {/* Points */}
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-white text-sm tabular-nums">
                      <span className="text-cyan-300 font-bold">
                        {(timeframe === 'weekly' ? student.weeklyPoints : student.points).toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500 ml-1 font-normal">pts</span>
                    </td>

                    {/* Certificate */}
                    {onOpenCertificateModal && (
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onOpenCertificateModal(student)}
                          className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-white/5 border border-white/10 text-cyan-400 hover:border-cyan-400 hover:bg-cyan-500/10 transition-colors"
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
