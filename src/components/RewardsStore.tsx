import React, { useState, useEffect } from 'react';
import { Student, Reward, RedeemedReward, RewardCategory } from '../types';
import { INITIAL_REWARDS } from '../data/mockRewards';
import { 
  Gift, 
  Coffee, 
  BookOpen, 
  Droplet, 
  Award, 
  Trees, 
  PenTool, 
  Sun, 
  FileCheck, 
  Search, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  Copy, 
  Ticket, 
  X, 
  ShoppingBag, 
  Trash2
} from 'lucide-react';

interface RewardsStoreProps {
  currentStudent: Student | null;
  onUpdateStudent: (updated: Student) => void;
  onOpenLogin: () => void;
}

export const RewardsStore: React.FC<RewardsStoreProps> = ({
  currentStudent,
  onUpdateStudent,
  onOpenLogin,
}) => {
  const [rewards, setRewards] = useState<Reward[]>(() => {
    const saved = localStorage.getItem('verdetech_rewards') || localStorage.getItem('ecopoints_rewards');
    if (saved) {
      try {
        const parsed: Reward[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Clean up any legacy 'Campus Perk' category labels
          return parsed.map(r => ({
            ...r,
            category: r.category === 'Campus Perk' ? 'Eco Perk' : r.category === 'School Supplies' ? 'Green Essentials' : r.category
          }));
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_REWARDS.map(r => ({
      ...r,
      category: r.category === 'Campus Perk' ? 'Eco Perk' : r.category === 'School Supplies' ? 'Green Essentials' : r.category
    }));
  });

  const [redemptions, setRedemptions] = useState<RedeemedReward[]>(() => {
    const saved = localStorage.getItem('verdetech_redemptions') || localStorage.getItem('ecopoints_redemptions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // fallback
      }
    }
    return [];
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewTab, setViewTab] = useState<'catalog' | 'vouchers'>('catalog');

  const [selectedRewardToRedeem, setSelectedRewardToRedeem] = useState<Reward | null>(null);
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);
  const [successVoucherCode, setSuccessVoucherCode] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSavingReward, setIsSavingReward] = useState<boolean>(false);

  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newPointsCost, setNewPointsCost] = useState<number>(150);
  const [newCategory, setNewCategory] = useState<RewardCategory>('Eco Perk');
  const [newStock, setNewStock] = useState<number>(20);
  const [newIconName, setNewIconName] = useState<string>('Gift');
  const [newCodePrefix, setNewCodePrefix] = useState<string>('VERDE');

  const isPortalAdmin =
    currentStudent?.grNo === '83502' ||
    currentStudent?.grNo === 'ECO-835902' ||
    currentStudent?.grNo === '835902' ||
    currentStudent?.email?.trim().toLowerCase() === 'subashiniompop@gmail.com' ||
    (currentStudent?.role === 'Admin' && currentStudent?.schoolPosition === 'Portal Administrator');

  useEffect(() => {
    localStorage.setItem('verdetech_rewards', JSON.stringify(rewards));
    localStorage.setItem('ecopoints_rewards', JSON.stringify(rewards));
  }, [rewards]);

  useEffect(() => {
    localStorage.setItem('verdetech_redemptions', JSON.stringify(redemptions));
    localStorage.setItem('ecopoints_redemptions', JSON.stringify(redemptions));
  }, [redemptions]);

  const categories = ['All', 'Eco Perk', 'Eco Merchandise', 'Green Essentials', 'Recognition', 'Voucher'];

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee': return <Coffee className="w-5 h-5 text-amber-400" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-cyan-400" />;
      case 'Droplet': return <Droplet className="w-5 h-5 text-cyan-400" />;
      case 'Award': return <Award className="w-5 h-5 text-violet-400" />;
      case 'Trees': return <Trees className="w-5 h-5 text-emerald-400" />;
      case 'PenTool': return <PenTool className="w-5 h-5 text-rose-400" />;
      case 'Sun': return <Sun className="w-5 h-5 text-amber-400" />;
      case 'FileCheck': return <FileCheck className="w-5 h-5 text-emerald-400" />;
      default: return <Gift className="w-5 h-5 text-emerald-400" />;
    }
  };

  const filteredRewards = rewards.filter((r) => {
    if (!r) return false;
    const matchesCat = selectedCategory === 'All' || r.category === selectedCategory;
    const search = (searchQuery || '').trim().toLowerCase();
    const matchesSearch = !search ||
      (r.title ? r.title.toLowerCase().includes(search) : false) || 
      (r.description ? r.description.toLowerCase().includes(search) : false);
    return matchesCat && matchesSearch;
  });

  const handleConfirmRedeem = async () => {
    if (!currentStudent || !selectedRewardToRedeem) return;

    if (currentStudent.points < selectedRewardToRedeem.pointsCost) {
      alert('You do not have enough Verde Points to redeem this reward.');
      return;
    }

    setIsRedeeming(true);

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const voucherCode = `${selectedRewardToRedeem.codePrefix || 'ECO'}-${randomNum}`;
    const newPoints = currentStudent.points - selectedRewardToRedeem.pointsCost;

    const updatedStudent: Student = {
      ...currentStudent,
      points: newPoints,
    };

    onUpdateStudent(updatedStudent);

    const newRedemption: RedeemedReward = {
      id: 'red_' + Date.now() + Math.random().toString(36).substring(2, 6),
      rewardId: selectedRewardToRedeem.id,
      rewardTitle: selectedRewardToRedeem.title,
      pointsSpent: selectedRewardToRedeem.pointsCost,
      redeemedAt: new Date().toISOString(),
      redemptionCode: voucherCode,
      status: 'Active',
      studentGrNo: currentStudent.grNo,
      studentName: currentStudent.name,
    };

    setRedemptions([newRedemption, ...redemptions]);

    setRewards(rewards.map((r) => {
      if (r.id === selectedRewardToRedeem.id) {
        return {
          ...r,
          stock: Math.max(0, (r.stock || 1) - 1),
        };
      }
      return r;
    }));

    setIsRedeeming(false);
    setSuccessVoucherCode(voucherCode);
  };

  const handleClearAllRewards = () => {
    if (!isPortalAdmin) return;
    if (window.confirm('Are you sure you want to clear all rewards from the store?')) {
      setRewards([]);
    }
  };

  const handleDeleteReward = (id: string) => {
    if (!isPortalAdmin) return;
    if (window.confirm('Delete this reward item?')) {
      setRewards(rewards.filter((r) => r.id !== id));
    }
  };

  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPortalAdmin) return;
    if (!newTitle.trim()) {
      alert('Please enter a reward title.');
      return;
    }

    setIsSavingReward(true);

    const newReward: Reward = {
      id: 'rew_' + Date.now(),
      title: newTitle.trim(),
      description: newDescription.trim() || 'Verified sustainability reward perk.',
      pointsCost: Number(newPointsCost) || 100,
      category: newCategory,
      stock: Number(newStock) || 10,
      iconName: newIconName,
      codePrefix: newCodePrefix.trim().toUpperCase() || 'VERDE',
      createdAt: new Date().toISOString(),
    };

    setRewards([newReward, ...rewards]);
    setIsSavingReward(false);
    setIsAddModalOpen(false);

    setNewTitle('');
    setNewDescription('');
    setNewPointsCost(150);
    setNewStock(20);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Wallet Overview */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#080c1b]/80 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="hud-pill">
                <span className="hud-dot" />
                <span>ECO REWARDS // PERKS</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-medium">
                Verified Exchange
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
              Redeem Verde Points for <span className="stai-gradient-text">Eco Perks</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Exchange your verified sustainability credits for green vouchers, eco-friendly gear, digital certificates, and community honors.
            </p>
          </div>

          {/* Wallet Balance Card */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="stai-card p-4 flex items-center gap-4 bg-gradient-to-br from-slate-900 to-[#0c1630]">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">Your Balance</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
                    {currentStudent ? currentStudent.points : 0}
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-400">PTS</span>
                </div>
                {currentStudent ? (
                  <p className="text-xs font-mono text-slate-400 mt-0.5">{currentStudent.name}</p>
                ) : (
                  <button onClick={onOpenLogin} className="text-xs font-mono text-cyan-400 hover:text-white underline">
                    Sign In to Redeem
                  </button>
                )}
              </div>
            </div>

            {isPortalAdmin && (
              <div className="flex items-center gap-2">
                {rewards.length > 0 && (
                  <button
                    onClick={handleClearAllRewards}
                    className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-colors"
                    title="Clear all rewards"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="btn-stai-cyan text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Reward</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/10">
          <button
            onClick={() => setViewTab('catalog')}
            className={`px-4 py-2 rounded-full font-mono text-xs font-semibold transition-all flex items-center gap-2 ${
              viewTab === 'catalog'
                ? 'bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(94,242,255,0.4)]'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Store Catalog ({rewards.length})</span>
          </button>
          
          <button
            onClick={() => setViewTab('vouchers')}
            className={`px-4 py-2 rounded-full font-mono text-xs font-semibold transition-all flex items-center gap-2 ${
              viewTab === 'vouchers'
                ? 'bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(94,242,255,0.4)]'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>My Redeemed Vouchers ({redemptions.length})</span>
          </button>
        </div>
      </section>

      {/* Catalog View */}
      {viewTab === 'catalog' && (
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="stai-card p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search perks, vouchers, merchandise..."
                  className="w-full bg-black/50 border border-white/10 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-7">
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                        selectedCategory === cat
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                          : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.length === 0 ? (
              <div className="col-span-full">
                <div className="stai-card p-12 text-center">
                  <Gift className="w-12 h-12 text-cyan-400 mx-auto mb-3 opacity-60" />
                  <h4 className="text-xl font-bold font-display text-white mb-2">No Rewards Found</h4>
                  <p className="text-sm text-slate-400 mb-4 max-w-md mx-auto">
                    Try adjusting your category filter or search query.
                  </p>
                  <button
                    onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                    className="btn-stai-outline"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            ) : (
              filteredRewards.map((reward) => {
                const canAfford = currentStudent && currentStudent.points >= reward.pointsCost;
                const isOutOfStock = (reward.stock ?? 10) <= 0;

                return (
                  <div key={reward.id} className="stai-card p-6 flex flex-col justify-between transition-all hover:border-cyan-400/40 group">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:border-cyan-400/30 transition-colors">
                          {renderIcon(reward.iconName || 'Gift')}
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                          {reward.category}
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-bold text-white font-display mb-2">
                        {reward.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                        {reward.description}
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div>
                          <span className="text-slate-500 block uppercase">Points Cost</span>
                          <span className="text-base font-bold text-cyan-400">{reward.pointsCost} PTS</span>
                        </div>
                        <div className="text-end">
                          <span className="text-slate-500 block uppercase">Available</span>
                          <span className="text-slate-300">{reward.stock ?? 10} units</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (!currentStudent) {
                              alert('Please sign in to redeem rewards.');
                              onOpenLogin();
                              return;
                            }
                            setSelectedRewardToRedeem(reward);
                          }}
                          disabled={isOutOfStock}
                          className={`flex-1 py-2.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                            isOutOfStock
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                              : canAfford
                              ? 'bg-gradient-to-r from-cyan-400 to-teal-300 text-slate-950 hover:shadow-[0_0_25px_rgba(94,242,255,0.4)]'
                              : 'bg-white/5 text-amber-300 border border-amber-400/30 hover:bg-amber-500/10'
                          }`}
                        >
                          {isOutOfStock ? 'Out of Stock' : canAfford ? 'Redeem Perk' : 'Need More Points'}
                        </button>

                        {isPortalAdmin && (
                          <button
                            onClick={() => handleDeleteReward(reward.id)}
                            className="p-2.5 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-colors"
                            title="Delete reward"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* Vouchers View */}
      {viewTab === 'vouchers' && (
        <div className="stai-card p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div>
              <h3 className="text-xl font-bold font-display text-white">My Redeemed Vouchers</h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">Active redemption codes and eco honors</p>
            </div>
            <span className="text-xs font-mono text-cyan-400">{redemptions.length} TOTAL VOUCHERS</span>
          </div>
          
          {redemptions.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white font-display">No Vouchers Redeemed Yet</h4>
              <p className="text-xs font-mono text-slate-400 mb-4 max-w-sm mx-auto">
                Explore the store catalog and redeem your Verde Points for eco perks and benefits.
              </p>
              <button
                onClick={() => setViewTab('catalog')}
                className="btn-stai-outline"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {redemptions.map((item) => (
                <div key={item.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-400/20">
                        {item.category || 'Reward'}
                      </span>
                      <h4 className="text-sm font-bold text-white font-display mt-1">{item.rewardTitle}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-400/30">
                      {item.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/60 border border-cyan-400/30 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] font-mono text-slate-400 uppercase">Voucher Code</span>
                      <span className="text-base font-mono font-bold text-cyan-300">{item.redemptionCode}</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.redemptionCode);
                        alert(`Copied voucher code ${item.redemptionCode} to clipboard!`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                  </div>

                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 pt-1">
                    <span>Issued to: {item.studentName || 'Member'}</span>
                    <span>{new Date(item.redeemedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Redemption Confirmation Modal */}
      {selectedRewardToRedeem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0f24] border border-cyan-400/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(94,242,255,0.2)] animate-scaleUp">
            
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <h4 className="text-lg font-bold font-display text-white">
                {successVoucherCode ? 'Redemption Successful' : 'Confirm Redemption'}
              </h4>
              <button
                type="button"
                className="text-slate-400 hover:text-white transition-colors"
                onClick={() => {
                  setSelectedRewardToRedeem(null);
                  setSuccessVoucherCode(null);
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successVoucherCode ? (
              <div className="text-center space-y-4">
                <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-xl font-bold font-display text-white">Perk Confirmed!</h4>
                <p className="text-xs sm:text-sm text-slate-300">
                  Your reward code is ready and safely saved in your vouchers tab.
                </p>
                
                <div className="p-4 rounded-2xl bg-black/60 border border-cyan-400/40 my-3">
                  <span className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Your Unique Code</span>
                  <span className="text-2xl font-mono font-bold text-cyan-300 tracking-wider">{successVoucherCode}</span>
                </div>

                <button
                  onClick={() => {
                    setSelectedRewardToRedeem(null);
                    setSuccessVoucherCode(null);
                    setViewTab('vouchers');
                  }}
                  className="w-full btn-stai-cyan justify-center py-3 text-sm font-bold uppercase"
                >
                  View My Vouchers
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-bold text-white">{selectedRewardToRedeem.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{selectedRewardToRedeem.description}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex justify-between items-center text-xs font-mono">
                  <div>
                    <span className="block text-slate-500 uppercase">Cost</span>
                    <span className="text-base font-bold text-cyan-400">{selectedRewardToRedeem.pointsCost} PTS</span>
                  </div>
                  <div className="text-end">
                    <span className="block text-slate-500 uppercase">Your Balance</span>
                    <span className="text-base font-bold text-emerald-400">{currentStudent?.points || 0} PTS</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Upon confirmation, {selectedRewardToRedeem.pointsCost} Verde Points will be debited from your balance and an instant redemption voucher will be created.
                </p>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRewardToRedeem(null)}
                    className="flex-1 py-2.5 rounded-full border border-white/10 text-slate-300 hover:bg-white/5 font-mono text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmRedeem}
                    disabled={isRedeeming}
                    className="flex-1 btn-stai-cyan justify-center py-2.5 text-xs font-bold uppercase"
                  >
                    {isRedeeming ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Add Reward Modal (Portal Admin Only) */}
      {isAddModalOpen && isPortalAdmin && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0a0f24] border border-cyan-400/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(94,242,255,0.2)]">
            
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <h4 className="text-lg font-bold font-display text-white">Create New Eco Reward</h4>
              <button
                type="button"
                className="text-slate-400 hover:text-white transition-colors"
                onClick={() => setIsAddModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReward} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-cyan-300 uppercase tracking-wider mb-1.5">
                  Reward Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Tree Planting Sponsorship / Green Certificate"
                  className="w-full bg-black/60 border border-white/15 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-cyan-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Details about the sustainability perk..."
                  className="w-full bg-black/60 border border-white/15 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-cyan-300 uppercase tracking-wider mb-1.5">
                    Points Cost
                  </label>
                  <input
                    type="number"
                    value={newPointsCost}
                    onChange={(e) => setNewPointsCost(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/15 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 outline-none"
                    min={10}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-cyan-300 uppercase tracking-wider mb-1.5">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/15 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 outline-none"
                    min={1}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-cyan-300 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as RewardCategory)}
                    className="w-full bg-black/60 border border-white/15 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 outline-none"
                  >
                    <option value="Eco Perk" className="bg-slate-950">Eco Perk</option>
                    <option value="Eco Merchandise" className="bg-slate-950">Eco Merchandise</option>
                    <option value="Green Essentials" className="bg-slate-950">Green Essentials</option>
                    <option value="Recognition" className="bg-slate-950">Recognition</option>
                    <option value="Voucher" className="bg-slate-950">Voucher</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-cyan-300 uppercase tracking-wider mb-1.5">
                    Voucher Prefix
                  </label>
                  <input
                    type="text"
                    value={newCodePrefix}
                    onChange={(e) => setNewCodePrefix(e.target.value)}
                    placeholder="e.g. GREEN"
                    className="w-full bg-black/60 border border-white/15 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-white/10 text-slate-300 hover:bg-white/5 font-mono text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingReward}
                  className="btn-stai-cyan text-xs"
                >
                  {isSavingReward ? 'Publishing...' : 'Publish Perk'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
