import React, { useState } from 'react';
import { playSound } from '../utils/soundFx';
import { 
  Bot, 
  Dna, 
  TreePine, 
  Zap, 
  Building2, 
  Rocket, 
  ArrowRight, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface StaiWorldsSectionProps {
  onOpenLogModal?: () => void;
  onExploreChallenges?: (topic: string) => void;
}

export const StaiWorldsSection: React.FC<StaiWorldsSectionProps> = ({
  onOpenLogModal,
  onExploreChallenges
}) => {
  const [selectedWorld, setSelectedWorld] = useState<string>('climate');

  const worlds = [
    {
      id: 'ai',
      code: 'W.01',
      title: 'AI & Robotics',
      tagline: 'What happens when machines learn, create, and think?',
      accent: '#5ef2ff',
      icon: Bot,
      stats: '14 Active Smart Bins',
      application: 'Computer vision cameras detect sorting errors in campus recycling stations in 120ms.',
      actionPrompt: 'Audit or train bin AI sensors'
    },
    {
      id: 'biotech',
      code: 'W.02',
      title: 'Biotechnology',
      tagline: 'Can science change the future of human health & ecology?',
      accent: '#5ef2ff',
      icon: Dna,
      stats: '3 Microbial Soil Tests',
      application: 'Student bacterial compost cultures accelerating organic decomposition by 300%.',
      actionPrompt: 'Log composting activity'
    },
    {
      id: 'climate',
      code: 'W.03',
      title: 'Climate',
      tagline: 'Can technology help us build a sustainable planet?',
      accent: '#7dff8a',
      icon: TreePine,
      stats: '450+ kg CO₂ Diverted',
      application: 'Micro-climate sensors logging humidity, heat islands, and tree canopy impact across ISWK.',
      actionPrompt: 'Planting & biodiversity logs'
    },
    {
      id: 'energy',
      code: 'W.04',
      title: 'Clean Energy',
      tagline: 'How will we power tomorrow’s world?',
      accent: '#ffd166',
      icon: Zap,
      stats: '340 kWh Solar Tracked',
      application: 'Solar rooftop panels and classroom power draw monitors showing peak consumption drops.',
      actionPrompt: 'Classroom energy audit'
    },
    {
      id: 'cities',
      code: 'W.05',
      title: 'Smart Cities',
      tagline: 'What will the cities of the future look like?',
      accent: '#ff6ad5',
      icon: Building2,
      stats: '1,280 kg Diverted',
      application: 'Circular resource hubs eliminating single-use packaging and routing plastic into 3D printer filament.',
      actionPrompt: 'Log zero-waste lunchbox'
    },
    {
      id: 'space',
      code: 'W.06',
      title: 'Deep Space',
      tagline: 'What lies beyond our planet — and how does it protect Earth?',
      accent: '#9d7bff',
      icon: Rocket,
      stats: 'Satellite Earth Telemetry',
      application: 'Using Copernicus satellite indices to study desert greening and coastal waters around Muscat.',
      actionPrompt: 'Explore satellite data'
    }
  ];

  const active = worlds.find(w => w.id === selectedWorld) || worlds[2];

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
            <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-400/30">01</span>
            <span className="w-8 h-px bg-cyan-400/40" />
            <span className="uppercase tracking-widest">The Core Theme</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
            The future is <span className="stai-gradient-text">not one thing.</span>
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mt-1">
            From artificial intelligence to space exploration, from biotechnology to sustainable cities — enter the six worlds shaping campus innovation at ISWK.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">SELECT WORLD:</span>
          <span className="text-xs font-mono text-cyan-300 font-bold px-2 py-1 rounded bg-black/40 border border-white/10">
            {active.code} // {active.title.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Six Interactive World Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {worlds.map((w) => {
          const Icon = w.icon;
          const isSelected = w.id === selectedWorld;

          return (
            <button
              key={w.id}
              onClick={() => {
                setSelectedWorld(w.id);
                playSound('blip');
              }}
              className={`relative text-left p-4 rounded-2xl transition-all duration-300 border flex flex-col justify-between h-44 overflow-hidden group ${
                isSelected
                  ? 'bg-slate-900/90 border-cyan-400 shadow-[0_0_25px_rgba(94,242,255,0.25)] scale-[1.02]'
                  : 'bg-[#080d1e]/70 border-white/10 hover:border-white/20 hover:bg-[#0c1228]'
              }`}
            >
              {/* Top Meta */}
              <div className="flex items-center justify-between w-full">
                <span 
                  className="font-mono text-xs font-bold"
                  style={{ color: w.accent }}
                >
                  {w.code}
                </span>
                <Icon 
                  className="w-5 h-5 transition-transform group-hover:scale-110" 
                  style={{ color: w.accent }}
                />
              </div>

              {/* Bottom Body */}
              <div>
                <h3 className="font-display font-bold text-white text-sm sm:text-base leading-tight">
                  {w.title}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {w.tagline}
                </p>
              </div>

              {/* Active Bottom Glow Line */}
              {isSelected && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{ backgroundColor: w.accent, boxShadow: `0 0 10px ${w.accent}` }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Expanded World Spotlight Panel (Direct STAI style) */}
      <div className="relative rounded-3xl border border-white/10 bg-[#090e21]/90 backdrop-blur-2xl p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div 
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] pointer-events-none opacity-20"
          style={{ backgroundColor: active.accent }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <span 
                className="px-3 py-1 rounded-full text-xs font-mono font-bold border"
                style={{ 
                  borderColor: `${active.accent}55`, 
                  backgroundColor: `${active.accent}15`, 
                  color: active.accent 
                }}
              >
                {active.code} · WORLD SPOTLIGHT
              </span>
              <span className="text-xs font-mono text-slate-400">
                {active.stats}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              {active.title} — {active.tagline}
            </h3>

            <p className="text-slate-300 text-sm leading-relaxed">
              {active.application}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {onOpenLogModal && (
                <button
                  onClick={() => {
                    playSound('click');
                    onOpenLogModal();
                  }}
                  className="btn-stai-cyan text-xs sm:text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{active.actionPrompt}</span>
                </button>
              )}

              {onExploreChallenges && (
                <button
                  onClick={() => {
                    playSound('click');
                    onExploreChallenges(active.id);
                  }}
                  className="btn-stai-outline text-xs sm:text-sm"
                >
                  <span>Explore Missions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Info Box */}
          <div className="rounded-2xl bg-black/40 border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-white/10 pb-2">
              <span>CAMPUS PROTOCOL</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ACTIVE
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Verified Metric:</span>
                <span className="font-mono font-bold text-white">{active.stats}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Sector Authority:</span>
                <span className="font-mono text-cyan-300">ISWK Eco Council</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Student Builders:</span>
                <span className="font-mono text-white">350+ Participating</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 font-mono">
              STAI 2026 // Future World Curriculum Matrix
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
