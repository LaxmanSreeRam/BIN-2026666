import React, { useState } from 'react';
import { playSound } from '../utils/soundFx';
import { Student } from '../types';
import { 
  FlaskConical, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Award, 
  Zap, 
  Cpu, 
  ArrowRight 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FutureLabSimulatorProps {
  currentStudent: Student | null;
  onUpdateStudent?: (student: Student) => void;
}

interface ItemCase {
  id: string;
  name: string;
  category: string;
  icon: string;
  hint: string;
  correctBin: string;
  explanation: string;
  ecoPts: number;
}

const SIMULATOR_ITEMS: ItemCase[] = [
  {
    id: 'item-1',
    name: 'PET Water Bottle with Cap',
    category: 'Plastics & Polymers',
    icon: '🍾',
    hint: 'Must be empty, rinsed, and uncrushed for optical sensor classification.',
    correctBin: 'smart-plastic',
    explanation: 'Optical sensors detect PET #1. The cap and bottle are shredded into 3D printer filament at ISWK Lab.',
    ecoPts: 15
  },
  {
    id: 'item-2',
    name: 'Swollen Lithium-ion Battery',
    category: 'Hazardous E-Waste',
    icon: '🔋',
    hint: 'Contains cobalt and lithium salts. Fire risk if crushed in normal bins.',
    correctBin: 'e-waste',
    explanation: 'Routed to sealed fireproof containment. Rare earth metals are harvested for robotics prototyping.',
    ecoPts: 25
  },
  {
    id: 'item-3',
    name: 'Cafeteria Banana Peel & Apple Core',
    category: 'Biomass & Organic',
    icon: '🍌',
    hint: 'Decomposes in 3-4 weeks under aerobic bacteria cultures.',
    correctBin: 'compost',
    explanation: 'Fed directly to the ISWK campus vermicompost bins, producing organic soil for tree saplings.',
    ecoPts: 10
  },
  {
    id: 'item-4',
    name: 'Classroom AC Running at 18°C (Door Open)',
    category: 'Energy Optimization',
    icon: '❄️',
    hint: 'Vampire thermal load causing 45% power waste across school corridors.',
    correctBin: 'eco-override',
    explanation: 'Setting thermostat to 24°C and closing thermal seals cuts 2.4 kWh per hour!',
    ecoPts: 20
  },
  {
    id: 'item-5',
    name: 'Old Math Exam Papers (Ink Printed)',
    category: 'Cellulose Paper',
    icon: '📄',
    hint: 'Dry and clean paper fibers can be recycled up to 7 times.',
    correctBin: 'paper-pulp',
    explanation: 'De-inked and pulped for recycled campus notebook covers and certificates.',
    ecoPts: 15
  }
];

const TARGET_BINS = [
  { id: 'smart-plastic', label: 'Smart Plastic Sensor Bin', icon: '♻️', color: 'from-cyan-500/20 to-cyan-500/5 border-cyan-400' },
  { id: 'e-waste', label: 'E-Waste Hazard Vault', icon: '⚡', color: 'from-amber-500/20 to-amber-500/5 border-amber-400' },
  { id: 'compost', label: 'Microbial Bio-Composter', icon: '🌱', color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-400' },
  { id: 'paper-pulp', label: 'Cellulose Paper Stream', icon: '📦', color: 'from-blue-500/20 to-blue-500/5 border-blue-400' },
  { id: 'eco-override', label: 'IoT Smart Energy Override', icon: '💡', color: 'from-violet-500/20 to-violet-500/5 border-violet-400' },
];

export const FutureLabSimulator: React.FC<FutureLabSimulatorProps> = ({
  currentStudent,
  onUpdateStudent
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string; pts: number } | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);

  const currentItem = SIMULATOR_ITEMS[currentIndex];

  const handleSelectBin = (binId: string) => {
    if (feedback !== null) return; // Wait for next

    const isCorrect = binId === currentItem.correctBin;
    if (isCorrect) {
      playSound('success');
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#5ef2ff', '#7dff8a', '#ffd166']
        });
      } catch {
        // Safe canvas fallback
      }

      const newScore = score + currentItem.ecoPts;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);

      setFeedback({
        isCorrect: true,
        message: `PERFECT CALIBRATION! ${currentItem.explanation}`,
        pts: currentItem.ecoPts
      });

      // Award live student points if logged in
      if (currentStudent && onUpdateStudent) {
        const updated: Student = {
          ...currentStudent,
          points: (currentStudent.points || 0) + currentItem.ecoPts,
          weeklyPoints: (currentStudent.weeklyPoints || 0) + currentItem.ecoPts
        };
        onUpdateStudent(updated);
      }
    } else {
      playSound('blip');
      setStreak(0);
      setFeedback({
        isCorrect: false,
        message: `ROUTING MISMATCH. ${currentItem.explanation}`,
        pts: 0
      });
    }
  };

  const handleNext = () => {
    playSound('click');
    setFeedback(null);
    if (currentIndex + 1 < SIMULATOR_ITEMS.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCompleted(true);
      playSound('enter');
    }
  };

  const handleRestart = () => {
    playSound('click');
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setFeedback(null);
    setCompleted(false);
  };

  return (
    <div className="relative rounded-3xl border border-white/10 bg-[#070b19]/90 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl overflow-hidden">
      {/* Ambient background lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

      {/* Lab Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1.5">
            <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-400/30">02</span>
            <span className="w-8 h-px bg-cyan-400/40" />
            <span className="uppercase tracking-widest">Future Lab Simulator</span>
          </div>
          <h2 className="text-3xl font-extrabold font-display text-white tracking-tight">
            Build, test & <span className="stai-gradient-text">automate the future.</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Test your eco-engineering acumen. Route simulated campus materials and energy flows to the correct destination to score live Verde points!
          </p>
        </div>

        {/* Live Lab Stats */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2">
            <Zap className="w-4 h-4 text-warning" />
            <span className="text-slate-400">LAB SCORE:</span>
            <span className="text-white font-bold">{score} PTS</span>
          </div>

          <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2">
            <span className="hud-dot"></span>
            <span className="text-slate-400">STREAK:</span>
            <span className="text-emerald-400 font-bold">{streak}x</span>
          </div>
        </div>
      </div>

      {!completed ? (
        <div className="space-y-8">
          {/* Active Item Card */}
          <div className="relative rounded-2xl bg-black/50 border border-cyan-500/30 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(94,242,255,0.08)]">
            <div className="flex items-center gap-5 text-left w-full md:w-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-400/30 flex items-center justify-center text-3xl sm:text-4xl shadow-inner shrink-0">
                {currentItem.icon}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    TEST CASE {currentIndex + 1} OF {SIMULATOR_ITEMS.length}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    +{currentItem.ecoPts} PTS
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                  {currentItem.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 italic">
                  "{currentItem.hint}"
                </p>
              </div>
            </div>

            <div className="text-right shrink-0 hidden md:block">
              <span className="text-xs font-mono text-slate-500 block">SUB-SYSTEM CLASSIFICATION:</span>
              <span className="text-xs font-mono text-cyan-300 font-bold">{currentItem.category}</span>
            </div>
          </div>

          {/* Target Bins Interactive Grid */}
          <div>
            <p className="text-xs font-mono text-slate-400 mb-3 tracking-wider uppercase">
              SELECT DESTINATION STATION:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {TARGET_BINS.map((bin) => (
                <button
                  key={bin.id}
                  onClick={() => handleSelectBin(bin.id)}
                  disabled={feedback !== null}
                  className={`p-4 rounded-xl border bg-gradient-to-b ${bin.color} text-left transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group flex flex-col justify-between h-32`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-2xl group-hover:scale-125 transition-transform">{bin.icon}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-white transition-all" />
                  </div>

                  <span className="text-xs font-bold text-white font-display leading-snug">
                    {bin.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Drawer */}
          {feedback && (
            <div className={`p-5 rounded-2xl border transition-all animate-fadeIn ${
              feedback.isCorrect 
                ? 'bg-emerald-950/40 border-emerald-400/50 text-emerald-200 shadow-[0_0_25px_rgba(52,211,153,0.2)]'
                : 'bg-rose-950/40 border-rose-400/50 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.2)]'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  {feedback.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">
                      {feedback.message}
                    </p>
                    {feedback.isCorrect && (
                      <p className="text-xs font-mono text-emerald-400">
                        +{feedback.pts} VERDE CREDITS ADDED TO CAMPUS ACCOUNT
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-full bg-white text-slate-950 font-mono font-bold text-xs uppercase tracking-wider hover:bg-cyan-300 transition-colors shrink-0 flex items-center justify-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Lab Completed Screen */
        <div className="text-center py-10 space-y-5 animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center mx-auto text-4xl shadow-[0_0_35px_rgba(94,242,255,0.4)]">
            🏆
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-extrabold font-display text-white">
              SIMULATION COMPLETED!
            </h3>
            <p className="text-slate-300 text-sm max-w-md mx-auto">
              You've successfully solved all campus engineering scenarios and earned <strong className="text-cyan-300">{score} Verde Points</strong>!
            </p>
          </div>

          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={handleRestart}
              className="btn-stai-cyan text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Simulate Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
