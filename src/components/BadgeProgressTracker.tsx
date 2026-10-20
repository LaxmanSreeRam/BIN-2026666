import React, { useState } from 'react';
import { Student, ActivityLog, Badge } from '../types';
import { 
  Award, 
  Trees, 
  Droplets, 
  Zap, 
  Recycle, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Filter, 
  ChevronRight, 
  Trash2,
  Trophy,
  Flame,
  Crown,
  Info,
  X
} from 'lucide-react';

interface BadgeProgressTrackerProps {
  currentStudent: Student | null;
  logs: ActivityLog[];
  badges: Badge[];
  onOpenLogModal?: () => void;
  className?: string;
}

export interface BadgeProgressItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  color: string;
  isUnlocked: boolean;
  currentValue: number;
  targetValue: number;
  unit: string;
  progressPercent: number;
  howToEarn: string;
  milestoneNote: string;
}

export const BadgeProgressTracker: React.FC<BadgeProgressTrackerProps> = ({
  currentStudent,
  logs,
  badges,
  onOpenLogModal,
  className = '',
}) => {
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'unlocked'>('all');
  const [selectedBadge, setSelectedBadge] = useState<BadgeProgressItem | null>(null);

  if (!currentStudent) {
    return (
      <div className={`rounded-3xl bg-[#0a0f24]/80 border border-white/10 p-6 sm:p-8 text-center ${className}`}>
        <Award className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="font-display text-base font-bold text-white">Login to Track Badge Progress</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
          Sign in with your Email and Password to view your real-time progress towards unlocking official VerdeTech sustainability badges.
        </p>
      </div>
    );
  }

  const studentLogs = Array.isArray(logs) ? logs.filter((l) => l && l.grNo === currentStudent.grNo) : [];
  const studentBadges = Array.isArray(currentStudent.badges) ? currentStudent.badges : [];
  
  const matchesTitle = (log: any, terms: string[]) => {
    const rawTitle = log?.challengeTitle || log?.title || log?.name || '';
    const title = String(rawTitle).toLowerCase();
    return terms.some((term) => title.includes(term.toLowerCase()));
  };

  const natureLogsCount = studentLogs.filter(
    (l) => l.category === 'Nature' || matchesTitle(l, ['tree', 'sapling', 'plant', 'garden', 'flora'])
  ).length;

  const energyLogsCount = studentLogs.filter(
    (l) => l.category === 'Energy' || matchesTitle(l, ['power', 'unplug', 'solar', 'electricity', 'light'])
  ).length;

  const recyclingLogsCount = studentLogs.filter(
    (l) => l.category === 'Recycling' || matchesTitle(l, ['e-waste', 'recycle', 'bottle', 'can', 'paper'])
  ).length;

  const wasteLogsCount = studentLogs.filter(
    (l) => l.category === 'Waste' || matchesTitle(l, ['zero waste', 'lunch', 'plastic', 'compost'])
  ).length;

  const smartBinLogsCount = studentLogs.filter(
    (l) => matchesTitle(l, ['bin', 'disposal', 'eco bin', 'trash'])
  ).length;

  const totalSmartBinDisposals = smartBinLogsCount;

  const progressItems: BadgeProgressItem[] = [
    {
      id: 'badge-smart-bin-master',
      title: 'Smart Bin Master',
      description: 'Complete 25 verified Smart Bin disposals on campus.',
      icon: 'Trash2',
      category: 'Smart Bins',
      color: '#ff6ad5',
      isUnlocked: totalSmartBinDisposals >= 25 || studentBadges.includes('badge-smart-bin-master'),
      currentValue: Math.min(25, totalSmartBinDisposals),
      targetValue: 25,
      unit: 'Disposals',
      progressPercent: Math.min(100, Math.round((totalSmartBinDisposals / 25) * 100)),
      howToEarn: 'Scan Smart Eco Bin QR codes or log waste disposals to reach 25 items.',
      milestoneNote: totalSmartBinDisposals >= 25 
        ? 'Unlocked! Smart Bin Master status verified.' 
        : `${25 - totalSmartBinDisposals} more Smart Bin disposals needed.`,
    },
    {
      id: 'badge-century',
      title: '1,000 Verde Club',
      description: 'Achieve 1,000 individual Verde Points for environmental sustainability.',
      icon: 'Award',
      category: 'Milestone',
      color: '#5ef2ff',
      isUnlocked: currentStudent.points >= 1000 || studentBadges.includes('badge-century'),
      currentValue: Math.min(1000, currentStudent.points),
      targetValue: 1000,
      unit: 'Points',
      progressPercent: Math.min(100, Math.round((currentStudent.points / 1000) * 100)),
      howToEarn: 'Log verified recycling, smart bin disposals, and energy habits to accumulate points.',
      milestoneNote: currentStudent.points >= 1000 
        ? 'Unlocked! Official Eco Certificate eligible.' 
        : `${Math.max(0, 1000 - currentStudent.points)} more points needed to hit 1,000.`,
    },
    {
      id: 'badge-ocean-guard',
      title: 'Aqua Defender',
      description: 'Save 500+ liters of water through audits and verified conservation habits.',
      icon: 'Droplets',
      category: 'Water',
      color: '#ffd166',
      isUnlocked: (currentStudent.waterSavedLiters || 0) >= 500 || studentBadges.includes('badge-ocean-guard'),
      currentValue: Math.min(500, Math.round(currentStudent.waterSavedLiters || 0)),
      targetValue: 500,
      unit: 'Liters',
      progressPercent: Math.min(100, Math.round(((currentStudent.waterSavedLiters || 0) / 500) * 100)),
      howToEarn: 'Complete water-saving audits, report facility leaks, or adopt shorter shower challenges.',
      milestoneNote: (currentStudent.waterSavedLiters || 0) >= 500 
        ? 'Unlocked! Over 500 liters saved.' 
        : `${Math.max(0, 500 - Math.round(currentStudent.waterSavedLiters || 0))} more liters needed.`,
    },
    {
      id: 'badge-solar-master',
      title: 'Power Saver',
      description: 'Save 10+ kWh of electricity or unplug 10 phantom power devices.',
      icon: 'Zap',
      category: 'Energy',
      color: '#ff6ad5',
      isUnlocked: ((currentStudent.energySavedKwh || 0) >= 10 || energyLogsCount >= 5) || studentBadges.includes('badge-solar-master'),
      currentValue: Math.min(10, Math.round(Math.max(currentStudent.energySavedKwh || 0, energyLogsCount * 2))),
      targetValue: 10,
      unit: 'kWh',
      progressPercent: Math.min(100, Math.round((Math.max(currentStudent.energySavedKwh || 0, energyLogsCount * 2) / 10) * 100)),
      howToEarn: 'Switch off empty room projectors, lab lights, and unplug idle chargers.',
      milestoneNote: (currentStudent.energySavedKwh || 0) >= 10 
        ? 'Unlocked! Power conservation champion.' 
        : `${Math.max(0, 10 - Math.round(currentStudent.energySavedKwh || 0))} kWh needed to unlock.`,
    },
    {
      id: 'badge-ewaste-pioneer',
      title: 'Recycle Champion',
      description: 'Contribute 5+ recycling or e-waste items to verified collection points.',
      icon: 'Recycle',
      category: 'Recycling',
      color: '#5ef2ff',
      isUnlocked: recyclingLogsCount >= 5 || studentBadges.includes('badge-ewaste-pioneer'),
      currentValue: Math.min(5, recyclingLogsCount),
      targetValue: 5,
      unit: 'Items',
      progressPercent: Math.min(100, Math.round((recyclingLogsCount / 5) * 100)),
      howToEarn: 'Drop old batteries, paper stacks, or bottles at designated drop-off stations.',
      milestoneNote: recyclingLogsCount >= 5 
        ? 'Unlocked! Excellent recycling record.' 
        : `${Math.max(0, 5 - recyclingLogsCount)} more recycling entries needed.`,
    },
    {
      id: 'badge-waste-warrior',
      title: 'Zero Waste Warrior',
      description: 'Complete 5 zero-waste lunches or single-use plastic reduction habits.',
      icon: 'ShieldCheck',
      category: 'Waste',
      color: '#ffd166',
      isUnlocked: wasteLogsCount >= 5 || studentBadges.includes('badge-waste-warrior'),
      currentValue: Math.min(5, wasteLogsCount),
      targetValue: 5,
      unit: 'Habits',
      progressPercent: Math.min(100, Math.round((wasteLogsCount / 5) * 100)),
      howToEarn: 'Pack zero-waste lunches using reusable containers and utensils.',
      milestoneNote: wasteLogsCount >= 5 
        ? 'Unlocked! Zero-waste master.' 
        : `${Math.max(0, 5 - wasteLogsCount)} more zero-waste logs needed.`,
    },
    {
      id: 'badge-tree-hero',
      title: 'Tree Guardian',
      description: 'Plant at least 1 native tree sapling or nurture school garden plots.',
      icon: 'Trees',
      category: 'Nature',
      color: '#ff6ad5',
      isUnlocked: natureLogsCount >= 1 || studentBadges.includes('badge-tree-hero'),
      currentValue: Math.min(1, natureLogsCount),
      targetValue: 1,
      unit: 'Trees',
      progressPercent: Math.min(100, Math.round((natureLogsCount / 1) * 100)),
      howToEarn: 'Participate in community greening drives or care for botanical plots.',
      milestoneNote: natureLogsCount >= 1 
        ? 'Unlocked! Living environmental legacy.' 
        : 'Plant 1 sapling or log nature care to unlock.',
    },
    {
      id: 'badge-co2-champion',
      title: 'Eco Action Champion',
      description: 'Actively participate in green drives and log regular sustainability actions.',
      icon: 'Flame',
      category: 'Climate',
      color: '#5ef2ff',
      isUnlocked: studentLogs.length >= 10 || currentStudent.points >= 500 || studentBadges.includes('badge-co2-champion'),
      currentValue: Math.min(10, studentLogs.length),
      targetValue: 10,
      unit: 'Actions',
      progressPercent: Math.min(100, Math.round((Math.min(10, studentLogs.length) / 10) * 100)),
      howToEarn: 'Log 10 sustainability activities or earn 500 Verde Points.',
      milestoneNote: studentLogs.length >= 10 || currentStudent.points >= 500
        ? 'Unlocked! Active eco contributor.' 
        : `${Math.max(0, 10 - studentLogs.length)} more green actions to unlock.`,
    },
    {
      id: 'badge-captain',
      title: 'Verde Leader / Officer',
      description: 'Official leader or administrator guiding sustainability initiatives.',
      icon: 'Crown',
      category: 'Leadership',
      color: '#ffd166',
      isUnlocked: currentStudent.role === 'Eco Officer' || currentStudent.role === 'Administrator' || studentBadges.includes('badge-captain'),
      currentValue: (currentStudent.role === 'Eco Officer' || currentStudent.role === 'Administrator' || studentBadges.includes('badge-captain')) ? 1 : 0,
      targetValue: 1,
      unit: 'Role',
      progressPercent: (currentStudent.role === 'Eco Officer' || currentStudent.role === 'Administrator' || studentBadges.includes('badge-captain')) ? 100 : 0,
      howToEarn: 'Appointed as eco captain, council member, or portal administrator.',
      milestoneNote: (currentStudent.role === 'Eco Officer' || currentStudent.role === 'Administrator' || studentBadges.includes('badge-captain'))
        ? 'Unlocked! Official leadership appointment.'
        : 'Earned via Eco Council appointment or nomination.',
    },
  ];

  const unlockedCount = progressItems.filter((b) => b.isUnlocked).length;
  const inProgressCount = progressItems.length - unlockedCount;

  const filteredBadges = progressItems.filter((item) => {
    if (filter === 'unlocked') return item.isUnlocked;
    if (filter === 'in_progress') return !item.isUnlocked;
    return true;
  });

  const renderBadgeIcon = (iconName: string, color: string) => {
    const props = { className: 'w-5 h-5', style: { color } };
    switch (iconName) {
      case 'Trash2':
        return <Trash2 {...props} />;
      case 'Droplets':
        return <Droplets {...props} />;
      case 'Zap':
        return <Zap {...props} />;
      case 'Recycle':
        return <Recycle {...props} />;
      case 'ShieldCheck':
        return <ShieldCheck {...props} />;
      case 'Trees':
        return <Trees {...props} />;
      case 'Flame':
        return <Flame {...props} />;
      case 'Crown':
        return <Crown {...props} />;
      case 'Award':
      default:
        return <Award {...props} />;
    }
  };

  const filters: { id: 'all' | 'in_progress' | 'unlocked'; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: progressItems.length },
    { id: 'in_progress', label: 'In Progress', count: inProgressCount },
    { id: 'unlocked', label: 'Unlocked', count: unlockedCount },
  ];

  return (
    <div className={`relative rounded-3xl bg-[#0a0f24]/80 backdrop-blur-xl border border-white/10 p-5 sm:p-8 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-6 border-b border-white/10">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-mono text-[10px] font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Badge Roadmap • {unlockedCount} of {progressItems.length} Unlocked
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">Official Eco Badges &amp; Live Progress</h2>
          <p className="text-sm text-slate-400 m-0 mt-1">
            Track your verified environmental milestones across water, energy, recycling, and smart bin disposals.
          </p>
        </div>

        {/* Filter pills */}
        <div className="inline-flex self-start md:self-auto rounded-full bg-black/40 border border-white/10 p-1" role="group">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-full font-mono text-[11px] font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
                filter === f.id
                  ? 'bg-cyan-500/20 text-cyan-200 shadow-[0_0_14px_rgba(94,242,255,0.25)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => (
          <button
            type="button"
            key={badge.id}
            onClick={() => setSelectedBadge(badge)}
            className={`group w-full h-full text-left flex flex-col items-stretch justify-between rounded-2xl p-4 border transition-all hover:-translate-y-0.5 ${
              badge.isUnlocked ? 'bg-white/[0.05]' : 'bg-white/[0.02] hover:bg-white/[0.04]'
            }`}
            style={{
              borderColor: badge.isUnlocked ? `${badge.color}66` : 'rgba(255,255,255,0.1)',
              boxShadow: badge.isUnlocked ? `0 0 22px ${badge.color}1f` : undefined,
            }}
          >
            <div className="w-full">
              <div className="flex items-start justify-between gap-2 mb-3 w-full">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-11 h-11 rounded-xl border flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${badge.color}22`,
                      borderColor: `${badge.color}66`,
                      opacity: badge.isUnlocked ? 1 : 0.7,
                    }}
                  >
                    {renderBadgeIcon(badge.icon, badge.color)}
                  </div>
                  <div className="min-w-0">
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">{badge.category}</span>
                    <h5 className="font-display text-sm font-bold text-white m-0 mt-0.5 leading-tight">{badge.title}</h5>
                  </div>
                </div>

                {badge.isUnlocked ? (
                  <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 font-mono text-[10px] font-bold uppercase">
                    <CheckCircle2 className="w-3 h-3" /> Unlocked
                  </span>
                ) : (
                  <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/15 text-slate-400 font-mono text-[10px] font-bold uppercase">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 mb-4 leading-relaxed">{badge.description}</p>
            </div>

            <div className="w-full pt-3 border-t border-white/10">
              <div className="flex justify-between font-mono text-[11px] text-slate-300 mb-1.5">
                <span>
                  {badge.currentValue} / {badge.targetValue} {badge.unit}
                </span>
                <span className="font-bold" style={{ color: badge.color }}>{badge.progressPercent}%</span>
              </div>
              <div
                className="h-2 rounded-full bg-white/10 overflow-hidden"
                role="progressbar"
                aria-valuenow={badge.progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${badge.progressPercent}%`,
                    backgroundColor: badge.color,
                    boxShadow: `0 0 10px ${badge.color}`,
                  }}
                />
              </div>
              <div className="mt-2 text-[11px] text-slate-500">{badge.milestoneNote}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Badge detail modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedBadge(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-[#0a0f24] border p-5 sm:p-6 shadow-[0_0_50px_rgba(94,242,255,0.18)]"
            style={{ borderColor: `${selectedBadge.color}66` }}
          >
            <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-11 h-11 rounded-xl border flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${selectedBadge.color}22`, borderColor: `${selectedBadge.color}66` }}
                >
                  {renderBadgeIcon(selectedBadge.icon, selectedBadge.color)}
                </div>
                <h4 className="font-display text-lg font-bold text-white m-0 leading-tight">{selectedBadge.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-slate-300 m-0">{selectedBadge.description}</p>

              <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/25 p-3">
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-300 mb-1">How to earn</div>
                <div className="text-sm text-slate-200">{selectedBadge.howToEarn}</div>
              </div>

              <div className="rounded-xl bg-cyan-500/10 border border-cyan-400/25 p-3">
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-300 mb-1">Status note</div>
                <div className="text-sm text-slate-200">{selectedBadge.milestoneNote}</div>
              </div>
            </div>

            <div className="flex justify-end mt-5 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 font-mono text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
