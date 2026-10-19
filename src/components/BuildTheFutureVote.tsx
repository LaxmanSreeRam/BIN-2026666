import React, { useState } from 'react';
import { playSound } from '../utils/soundFx';
import { Student } from '../types';
import { Vote, Check, Sparkles, TrendingUp, Users } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BuildTheFutureVoteProps {
  currentStudent: Student | null;
}

interface InnovationProject {
  id: string;
  code: string;
  title: string;
  category: string;
  description: string;
  votes: number;
  tags: string[];
}

export const BuildTheFutureVote: React.FC<BuildTheFutureVoteProps> = ({
  currentStudent
}) => {
  const [projects, setProjects] = useState<InnovationProject[]>([
    {
      id: 'p-1',
      code: 'INV.01',
      title: 'Solar Kinetic Pavements',
      category: 'Clean Energy',
      description: 'Footstep-powered piezoelectric floor tiles along main corridors powering hallway LED matrices.',
      votes: 142,
      tags: ['Kinetic Energy', 'Zero Carbon']
    },
    {
      id: 'p-2',
      code: 'INV.02',
      title: 'AI Smart Compost Bio-Digester',
      category: 'Biotechnology',
      description: 'Autonomous temperature & moisture regulated composting chambers generating organic campus fertilizer.',
      votes: 189,
      tags: ['Microbial Science', 'Zero Waste']
    },
    {
      id: 'p-3',
      code: 'INV.03',
      title: 'Drone Canopy & Litter Mapper',
      category: 'Robotics & AI',
      description: 'Autonomous micro-drones monitoring campus foliage hydration, dust deposition, and outdoor recycling spots.',
      votes: 118,
      tags: ['Computer Vision', 'Campus Telemetry']
    },
    {
      id: 'p-4',
      code: 'INV.04',
      title: 'Solar Hydroponic Vertical Farm',
      category: 'Climate & Smart Cities',
      description: 'Closed-loop automated water nutrient misting towers producing fresh herbs and microgreens.',
      votes: 215,
      tags: ['Hydroponics', 'Food Security']
    }
  ]);

  const [votedId, setVotedId] = useState<string | null>(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('stai_voted_project_id');
    }
    return null;
  });

  const totalVotes = projects.reduce((sum, p) => sum + p.votes, 0);

  const handleVote = (id: string) => {
    if (votedId) return;

    playSound('vote');
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#5ef2ff', '#9d7bff', '#ff6ad5']
      });
    } catch {
      // safe fallback
    }

    setProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, votes: p.votes + 1 } : p))
    );
    setVotedId(id);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('stai_voted_project_id', id);
    }
  };

  return (
    <section className="relative rounded-3xl border border-white/10 bg-[#080d1e]/90 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
            <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-400/30">05</span>
            <span className="w-8 h-px bg-cyan-400/40" />
            <span className="uppercase tracking-widest">Build the Future</span>
          </div>
          <h2 className="text-3xl font-extrabold font-display text-white tracking-tight">
            Which invention should <span className="stai-gradient-text">ISWK build next?</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Cast your student vote for the next green technology deployment on campus. Winning ideas receive funding from the STAI 2026 Innovation Fund.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Users className="w-4 h-4 text-cyan-400" />
          <span>{totalVotes} TOTAL VOTES CAST</span>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((proj) => {
          const isVoted = votedId === proj.id;
          const pct = Math.round((proj.votes / (totalVotes || 1)) * 100);

          return (
            <div
              key={proj.id}
              className={`p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                isVoted
                  ? 'bg-gradient-to-br from-cyan-950/40 to-slate-900 border-cyan-400 shadow-[0_0_25px_rgba(94,242,255,0.2)]'
                  : 'bg-black/40 border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {proj.code} · {proj.category.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-semibold">
                    {proj.votes} votes ({pct}%)
                  </span>
                </div>

                <h3 className="text-xl font-bold font-display text-white mb-2">
                  {proj.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {proj.description}
                </p>

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {proj.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                      #{t}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => handleVote(proj.id)}
                  disabled={votedId !== null}
                  className={`px-4 py-2 rounded-full text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
                    isVoted
                      ? 'bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(94,242,255,0.5)]'
                      : votedId !== null
                      ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                      : 'bg-white/10 hover:bg-cyan-400 hover:text-slate-950 text-white border border-white/10'
                  }`}
                >
                  {isVoted ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Voted</span>
                    </>
                  ) : (
                    <>
                      <Vote className="w-3.5 h-3.5" />
                      <span>Vote Idea</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
