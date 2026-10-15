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
      <div className={`bg-white border border-4 border-dark rounded-0 p-6 sm:p-8 text-center text-dark shadow-[6px_6px_0px_0px_black] ${className}`}>
        <Award className="w-12 h-12 text-danger mx-auto mb-3" />
        <h3 className="text-base fw-black text-dark text-uppercase">Login to Track Badge Progress</h3>
        <p className="small text-muted mt-1 max-w-sm mx-auto fw-semibold">
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
      description: 'Complete 25 verified Smart Bin disposals on campus. Unlocks the VerdeTech Lucky Wheel!',
      icon: 'Trash2',
      category: 'Smart Bins',
      color: '#D02020',
      isUnlocked: totalSmartBinDisposals >= 25 || studentBadges.includes('badge-smart-bin-master'),
      currentValue: Math.min(25, totalSmartBinDisposals),
      targetValue: 25,
      unit: 'Disposals',
      progressPercent: Math.min(100, Math.round((totalSmartBinDisposals / 25) * 100)),
      howToEarn: 'Scan Smart Eco Bin QR codes or log waste disposals to reach 25 items.',
      milestoneNote: totalSmartBinDisposals >= 25 
        ? 'Unlocked! Lucky Wheel active on dashboard.' 
        : `${25 - totalSmartBinDisposals} more Smart Bin disposals needed.`,
    },
    {
      id: 'badge-century',
      title: '1,000 Verde Club',
      description: 'Achieve 1,000 individual Verde Points for campus sustainability.',
      icon: 'Award',
      category: 'Milestone',
      color: '#1040C0',
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
      color: '#F0C020',
      isUnlocked: (currentStudent.waterSavedLiters || 0) >= 500 || studentBadges.includes('badge-ocean-guard'),
      currentValue: Math.min(500, Math.round(currentStudent.waterSavedLiters || 0)),
      targetValue: 500,
      unit: 'Liters',
      progressPercent: Math.min(100, Math.round(((currentStudent.waterSavedLiters || 0) / 500) * 100)),
      howToEarn: 'Complete water-saving audits, report campus leaks, or adopt shorter shower challenges.',
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
      color: '#D02020',
      isUnlocked: ((currentStudent.energySavedKwh || 0) >= 10 || energyLogsCount >= 5) || studentBadges.includes('badge-solar-master'),
      currentValue: Math.min(10, Math.round(Math.max(currentStudent.energySavedKwh || 0, energyLogsCount * 2))),
      targetValue: 10,
      unit: 'kWh',
      progressPercent: Math.min(100, Math.round((Math.max(currentStudent.energySavedKwh || 0, energyLogsCount * 2) / 10) * 100)),
      howToEarn: 'Switch off classroom projectors, lab lights, and unplug idle chargers.',
      milestoneNote: (currentStudent.energySavedKwh || 0) >= 10 
        ? 'Unlocked! Power conservation champion.' 
        : `${Math.max(0, 10 - Math.round(currentStudent.energySavedKwh || 0))} kWh needed to unlock.`,
    },
    {
      id: 'badge-ewaste-pioneer',
      title: 'Recycle Champion',
      description: 'Contribute 5+ recycling or e-waste items to campus collection points.',
      icon: 'Recycle',
      category: 'Recycling',
      color: '#1040C0',
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
      color: '#F0C020',
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
      color: '#D02020',
      isUnlocked: natureLogsCount >= 1 || studentBadges.includes('badge-tree-hero'),
      currentValue: Math.min(1, natureLogsCount),
      targetValue: 1,
      unit: 'Trees',
      progressPercent: Math.min(100, Math.round((natureLogsCount / 1) * 100)),
      howToEarn: 'Participate in campus greening drives or care for botanical plots.',
      milestoneNote: natureLogsCount >= 1 
        ? 'Unlocked! Living environmental legacy.' 
        : 'Plant 1 sapling or log nature care to unlock.',
    },
    {
      id: 'badge-co2-champion',
      title: 'Eco Action Champion',
      description: 'Actively participate in green campus drives and log regular sustainability actions.',
      icon: 'Flame',
      category: 'Climate',
      color: '#1040C0',
      isUnlocked: studentLogs.length >= 10 || currentStudent.points >= 500 || studentBadges.includes('badge-co2-champion'),
      currentValue: Math.min(10, studentLogs.length),
      targetValue: 10,
      unit: 'Actions',
      progressPercent: Math.min(100, Math.round((Math.min(10, studentLogs.length) / 10) * 100)),
      howToEarn: 'Log 10 sustainability activities or earn 500 Verde Points.',
      milestoneNote: studentLogs.length >= 10 || currentStudent.points >= 500
        ? 'Unlocked! Active campus eco contributor.' 
        : `${Math.max(0, 10 - studentLogs.length)} more green actions to unlock.`,
    },
    {
      id: 'badge-captain',
      title: 'Verde Leader / Officer',
      description: 'Official student leader or administrator guiding campus sustainability initiatives.',
      icon: 'Crown',
      category: 'Leadership',
      color: '#F0C020',
      isUnlocked: currentStudent.role === 'Eco Officer' || currentStudent.role === 'Administrator' || studentBadges.includes('badge-captain'),
      currentValue: (currentStudent.role === 'Eco Officer' || currentStudent.role === 'Administrator' || studentBadges.includes('badge-captain')) ? 1 : 0,
      targetValue: 1,
      unit: 'Role',
      progressPercent: (currentStudent.role === 'Eco Officer' || currentStudent.role === 'Administrator' || studentBadges.includes('badge-captain')) ? 100 : 0,
      howToEarn: 'Appointed as student eco captain, campus council member, or portal administrator.',
      milestoneNote: (currentStudent.role === 'Eco Officer' || currentStudent.role === 'Administrator' || studentBadges.includes('badge-captain'))
        ? 'Unlocked! Official leadership appointment.'
        : 'Earned via Eco Council appointment or teacher nomination.',
    },
  ];

  const unlockedCount = progressItems.filter((b) => b.isUnlocked).length;
  const inProgressCount = progressItems.length - unlockedCount;

  const filteredBadges = progressItems.filter((item) => {
    if (filter === 'unlocked') return item.isUnlocked;
    if (filter === 'in_progress') return !item.isUnlocked;
    return true;
  });

  const renderBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trash2':
        return <Trash2 className="w-5 h-5 text-dark" />;
      case 'Award':
        return <Award className="w-5 h-5 text-dark" />;
      case 'Droplets':
        return <Droplets className="w-5 h-5 text-dark" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-dark" />;
      case 'Recycle':
        return <Recycle className="w-5 h-5 text-dark" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-dark" />;
      case 'Trees':
        return <Trees className="w-5 h-5 text-dark" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-dark" />;
      case 'Crown':
        return <Crown className="w-5 h-5 text-dark" />;
      default:
        return <Award className="w-5 h-5 text-dark" />;
    }
  };

  return (
    <div className={`bg-white border border-4 border-dark rounded-0 p-4 sm:p-6 text-dark shadow-[6px_6px_0px_0px_black] relative ${className}`}>
      
      {/* Header */}
      <div className="d-flex flex-column md:flex-row align-items-md-center justify-content-between gap-3 border-bottom border-4 border-dark pb-4 mb-4">
        <div>
          <div className="badge bg-warning text-dark fw-black px-3 py-2 rounded-0 text-uppercase mb-2 border border-2 border-dark">
            <Sparkles className="w-3.5 h-3.5 me-1" />
            Badge Roadmap • {unlockedCount} of {progressItems.length} Unlocked
          </div>
          <h2 className="h3 fw-black text-dark text-uppercase tracking-tight m-0">
            Official Eco Badges & Live Progress
          </h2>
          <p className="small text-muted m-0 mt-1 fw-semibold">
            Track your verified environmental milestones across water, energy, recycling, and smart bin disposals.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="btn-group rounded-0 border border-2 border-dark shadow-[2px_2px_0px_0px_black]" role="group">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`btn btn-sm rounded-0 fw-black text-uppercase px-3 ${filter === 'all' ? 'btn-danger text-white' : 'btn-light text-dark'}`}
          >
            All ({progressItems.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('in_progress')}
            className={`btn btn-sm rounded-0 fw-black text-uppercase px-3 ${filter === 'in_progress' ? 'btn-danger text-white' : 'btn-light text-dark'}`}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unlocked')}
            className={`btn btn-sm rounded-0 fw-black text-uppercase px-3 ${filter === 'unlocked' ? 'btn-danger text-white' : 'btn-light text-dark'}`}
          >
            Unlocked ({unlockedCount})
          </button>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="row g-4">
        {filteredBadges.map((badge) => {
          return (
            <div key={badge.id} className="col-12 col-md-6 col-lg-4">
              <div 
                onClick={() => setSelectedBadge(badge)}
                className="card h-100 rounded-0 border border-4 border-dark p-3 shadow-[4px_4px_0px_0px_black] cursor-pointer bg-light position-relative"
                style={{ transition: 'transform 0.1s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div className="card-body p-0 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <div 
                          className="rounded-0 border border-2 border-dark d-flex align-items-center justify-content-center p-2"
                          style={{ backgroundColor: badge.color, width: '42px', height: '42px' }}
                        >
                          {renderBadgeIcon(badge.icon)}
                        </div>
                        <div>
                          <span className="badge bg-dark text-white fw-bold text-uppercase rounded-0" style={{ fontSize: '10px' }}>
                            {badge.category}
                          </span>
                          <h5 className="fw-black text-dark text-uppercase m-0 mt-1 fs-6">{badge.title}</h5>
                        </div>
                      </div>

                      <div>
                        {badge.isUnlocked ? (
                          <span className="badge bg-success text-white fw-black rounded-0 px-2.5 py-1 border border-dark text-uppercase" style={{ fontSize: '10px' }}>
                            <CheckCircle2 className="w-3 h-3 me-1" /> Unlocked
                          </span>
                        ) : (
                          <span className="badge bg-secondary text-white fw-black rounded-0 px-2.5 py-1 border border-dark text-uppercase" style={{ fontSize: '10px' }}>
                            <Lock className="w-3 h-3 me-1" /> Locked
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="small text-muted mb-3 fw-medium">
                      {badge.description}
                    </p>
                  </div>

                  <div className="border-top border-2 border-dark pt-3 mt-auto">
                    <div className="d-flex justify-content-between text-dark small fw-bold mb-1">
                      <span>Progress: {badge.currentValue} / {badge.targetValue} {badge.unit}</span>
                      <span>{badge.progressPercent}%</span>
                    </div>

                    <div className="progress rounded-0 border border-2 border-dark bg-white" style={{ height: '10px' }}>
                      <div 
                        className="progress-bar rounded-0" 
                        role="progressbar" 
                        style={{ width: `${badge.progressPercent}%`, backgroundColor: badge.color }}
                        aria-valuenow={badge.progressPercent} 
                        aria-valuemin={0} 
                        aria-valuemax={100}
                      ></div>
                    </div>

                    <div className="mt-2 text-muted" style={{ fontSize: '11px' }}>
                      {badge.milestoneNote}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-0 border border-4 border-dark shadow-[8px_8px_0px_0px_black] p-4 bg-white text-dark">
              <div className="d-flex align-items-center justify-content-between border-bottom border-2 border-dark pb-3 mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-0 border border-2 border-dark p-2" style={{ backgroundColor: selectedBadge.color }}>
                    {renderBadgeIcon(selectedBadge.icon)}
                  </div>
                  <h4 className="fw-black text-uppercase m-0 fs-5">{selectedBadge.title}</h4>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectedBadge(null)}
                  className="btn btn-dark btn-sm rounded-0 border border-2 border-dark fw-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-muted small fw-medium">{selectedBadge.description}</p>
                
                <div className="bg-light border border-2 border-dark p-3 rounded-0">
                  <div className="fw-black text-uppercase small text-success mb-1">How to Earn:</div>
                  <div className="small text-dark fw-semibold">{selectedBadge.howToEarn}</div>
                </div>

                <div className="bg-light border border-2 border-dark p-3 rounded-0">
                  <div className="fw-black text-uppercase small text-primary mb-1">Status Note:</div>
                  <div className="small text-dark fw-semibold">{selectedBadge.milestoneNote}</div>
                </div>
              </div>

              <div className="border-top border-2 border-dark pt-3 mt-4 text-end">
                <button
                  type="button"
                  onClick={() => setSelectedBadge(null)}
                  className="btn btn-dark rounded-0 fw-black text-uppercase px-4 border border-2 border-dark shadow-[2px_2px_0px_0px_black]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
