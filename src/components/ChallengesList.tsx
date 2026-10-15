import React, { useState } from 'react';
import { Challenge, ActionCategory } from '../types';
import { 
  Sparkles, 
  UtensilsCrossed, 
  Bike, 
  Trees, 
  Zap, 
  Recycle, 
  Droplets, 
  Leaf, 
  FileText, 
  ChevronRight, 
  PlusCircle, 
  Award,
  CheckCircle2
} from 'lucide-react';

interface ChallengesListProps {
  challenges: Challenge[];
  onSelectChallengeToLog: (challenge: Challenge) => void;
}

export const ChallengesList: React.FC<ChallengesListProps> = ({
  challenges,
  onSelectChallengeToLog,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('All');

  const categories: ActionCategory[] = [
    'Waste',
    'Transport',
    'Nature',
    'Energy',
    'Recycling',
    'Water',
    'Digital',
  ];

  const filteredChallenges = challenges.filter((c) => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesFrequency = selectedFrequency === 'All' || c.frequency === selectedFrequency;
    return matchesCategory && matchesFrequency;
  });

  const getChallengeIcon = (iconName: string) => {
    switch (iconName) {
      case 'UtensilsCrossed':
        return <UtensilsCrossed className="w-5 h-5 text-amber-600" />;
      case 'Bike':
        return <Bike className="w-5 h-5 text-emerald-600" />;
      case 'Trees':
        return <Trees className="w-5 h-5 text-teal-600" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Recycle':
        return <Recycle className="w-5 h-5 text-emerald-600" />;
      case 'Droplets':
        return <Droplets className="w-5 h-5 text-blue-600" />;
      case 'Leaf':
        return <Leaf className="w-5 h-5 text-emerald-600" />;
      case 'FileText':
        return <FileText className="w-5 h-5 text-cyan-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Campus Action Directory</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sustainability Challenges
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Complete daily, weekly, or special drive eco actions. Every verified submission awards points to your Verde Points total!
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
          <Award className="w-8 h-8 text-amber-400 flex-shrink-0" />
          <div>
            <div className="font-bold text-white">Instant Verification</div>
            <div className="text-[11px] text-slate-400">Upload photo/note proof to claim points</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="space-y-3 bg-slate-900 p-4 rounded-3xl border border-slate-800 shadow-xl">
        
        {/* Category Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pr-2">Category:</span>
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            All Actions
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Frequency Filters */}
        <div className="flex items-center space-x-2 border-t border-slate-800 pt-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pr-2">Frequency:</span>
          {['All', 'Daily', 'Weekly', 'Special Drive'].map((freq) => (
            <button
              key={freq}
              onClick={() => setSelectedFrequency(freq)}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedFrequency === freq
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {freq}
            </button>
          ))}
        </div>

      </div>

      {/* Challenge Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredChallenges.map((challenge) => (
          <div
            key={challenge.id}
            className={`relative group bg-slate-900 border rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/60 ${
              challenge.featured
                ? 'border-2 border-emerald-500/80 bg-slate-900/90'
                : 'border-slate-800'
            }`}
          >
            {challenge.featured && (
              <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-full shadow-md">
                Featured Challenge
              </div>
            )}

            <div>
              {/* Header: Icon & Category */}
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  {getChallengeIcon(challenge.icon)}
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-mono font-bold text-sm">
                    +{challenge.points} Eco Pts
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">per {challenge.unitLabel}</div>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="font-bold text-white text-base mt-4 group-hover:text-emerald-400 transition-colors">
                {challenge.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {challenge.description}
              </p>


            </div>

            {/* Card Footer Action */}
            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                Difficulty: <span className="text-slate-200 font-semibold">{challenge.difficulty}</span>
              </span>

              <button
                onClick={() => onSelectChallengeToLog(challenge)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Log Action</span>
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
