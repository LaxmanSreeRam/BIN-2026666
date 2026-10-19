import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Megaphone,
  Globe2,
  Share2
} from 'lucide-react';
import { Student } from '../types';
import { TeamBiosSection } from './TeamBiosSection';

interface AboutUsViewProps {
  currentStudent?: Student | null;
  onNavigateToTab?: (tab: string) => void;
}

export const AboutUsView: React.FC<AboutUsViewProps> = ({
  currentStudent,
  onNavigateToTab,
}) => {
  return (
    <div className="space-y-8">
      
      {/* Hero Section - STAI Glass Card */}
      <div className="relative rounded-3xl border border-white/10 bg-[#080d1e]/90 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-400/30 text-cyan-300 font-mono text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Official Platform Overview</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight leading-tight">
            About Verde Tech <br />
            <span className="stai-gradient-text">Future World Portal</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            The Verde Tech Portal is our school's official sustainability tracking and eco-innovation platform designed to inspire, measure, and reward verified environmental actions. From optical smart bin recycling to solar efficiency and classroom audits, every positive action powers campus progress toward STAI 2026.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('feed')}
                className="btn-stai-cyan text-xs sm:text-sm"
              >
                <span>Explore Eco Feed</span>
                <ArrowRight className="w-4 h-4 ml-1 inline" />
              </button>
            )}
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('rewards')}
                className="btn-stai-outline text-xs sm:text-sm"
              >
                <span>Browse Rewards</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Official Social Media Channels Banner */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-violet-950/40 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-mono text-xs uppercase mb-3">
              <Megaphone className="w-3.5 h-3.5" />
              <span>Official Channels</span>
            </div>
            <h2 className="text-2xl font-bold font-display text-white">Follow ISWK Verde Tech</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Connect with Verde Tech across official social channels for live campus updates, competition notices, and eco highlights.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <a
              href="https://www.instagram.com/verdetechsystems?stkn=MWcxbGRhYThyN2VlOA=="
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-black/40 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-slate-200 hover:text-white font-mono text-xs transition-all"
            >
              Instagram
            </a>
            <a
              href="https://www.linkedin.com/company/verdetechsystemss"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-black/40 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-slate-200 hover:text-white font-mono text-xs transition-all"
            >
              LinkedIn
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61594541660052"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-black/40 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-slate-200 hover:text-white font-mono text-xs transition-all"
            >
              Facebook
            </a>
            <a
              href="https://www.youtube.com/channel/UCilJpKT3EpbNywLsUycQbFw"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-black/40 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-slate-200 hover:text-white font-mono text-xs transition-all"
            >
              YouTube
            </a>
          </div>
        </div>
      </div>

      {/* Team Bios Section */}
      <div className="stai-card p-6 sm:p-8">
        <h3 className="text-xl sm:text-2xl font-bold font-display text-white mb-6">
          Leadership & Student Innovators
        </h3>
        <TeamBiosSection currentStudent={currentStudent} />
      </div>

    </div>
  );
};
