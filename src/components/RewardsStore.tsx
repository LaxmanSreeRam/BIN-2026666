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
  Clock, 
  X, 
  ShoppingBag, 
  Trash2, 
  ShieldCheck, 
  Tag, 
  Layers, 
  Key, 
  Lock
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
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_REWARDS;
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
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSavingReward, setIsSavingReward] = useState<boolean>(false);

  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newPointsCost, setNewPointsCost] = useState<number>(150);
  const [newCategory, setNewCategory] = useState<RewardCategory>('Campus Perk');
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

  const categories = ['All', 'Campus Perk', 'Eco Merchandise', 'School Supplies', 'Recognition', 'Voucher'];

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee': return <Coffee className="w-6 h-6 text-warning" />;
      case 'BookOpen': return <BookOpen className="w-6 h-6 text-primary" />;
      case 'Droplet': return <Droplet className="w-6 h-6 text-info" />;
      case 'Award': return <Award className="w-6 h-6 text-danger" />;
      case 'Trees': return <Trees className="w-6 h-6 text-success" />;
      case 'PenTool': return <PenTool className="w-6 h-6 text-danger" />;
      case 'Sun': return <Sun className="w-6 h-6 text-warning" />;
      case 'FileCheck': return <FileCheck className="w-6 h-6 text-success" />;
      default: return <Gift className="w-6 h-6 text-success" />;
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
      description: newDescription.trim() || 'Official school sustainability perk.',
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
    <div className="container py-4 space-y-4">
      
      {/* Top Banner & Wallet Overview */}
      <div className="card bg-success text-white p-4 p-md-5 rounded-0 border border-4 border-dark shadow-[6px_6px_0px_0px_black]">
        <div className="d-flex flex-column lg:flex-row align-items-lg-center justify-content-between gap-4">
          <div className="space-y-2">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-dark text-white fw-bold px-3 py-2 rounded-0 border border-2 border-white">
                <ShoppingBag className="w-3.5 h-3.5 me-1 text-success" />
                Campus Eco Rewards Store
              </span>
            </div>
            <h1 className="display-6 fw-black text-white text-uppercase m-0">
              Redeem Verde Points for Perks
            </h1>
            <p className="text-light fw-medium fs-6 m-0 opacity-90">
              Exchange your verified sustainability points for cafeteria vouchers, school supplies, eco-friendly merchandise, and campus privileges.
            </p>
          </div>

          {/* Wallet Balance Card */}
          <div className="d-flex flex-column sm:flex-row align-items-stretch sm:align-items-center gap-3">
            <div className="card bg-white text-dark rounded-0 border border-3 border-dark p-3 shadow-[4px_4px_0px_0px_black] d-flex flex-row align-items-center gap-3">
              <div className="p-3 bg-success text-white rounded-0 border border-2 border-dark">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="d-block fw-bold text-uppercase small text-muted">Your Balance</span>
                <div className="d-flex align-items-baseline gap-1">
                  <span className="fs-3 fw-black text-success">
                    {currentStudent ? currentStudent.points : 0}
                  </span>
                  <span className="fw-bold text-dark small">Pts</span>
                </div>
                {currentStudent ? (
                  <p className="small fw-bold text-dark m-0">{currentStudent.name}</p>
                ) : (
                  <button onClick={onOpenLogin} className="btn btn-sm btn-link p-0 text-success fw-bold">
                    Sign In to Redeem
                  </button>
                )}
              </div>
            </div>

            {isPortalAdmin && (
              <div className="d-flex gap-2">
                {rewards.length > 0 && (
                  <button
                    onClick={handleClearAllRewards}
                    className="btn btn-danger fw-black rounded-0 border border-3 border-dark px-3 py-2 shadow-[2px_2px_0px_0px_black]"
                    title="Clear all rewards"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="btn btn-warning text-dark fw-black rounded-0 border border-3 border-dark px-4 py-2 shadow-[2px_2px_0px_0px_black] d-flex align-items-center gap-2"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add Reward</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* View Tabs */}
        <div className="d-flex flex-wrap gap-2 mt-4 pt-4 border-top border-light">
          <button
            onClick={() => setViewTab('catalog')}
            className={`btn rounded-0 fw-black text-uppercase border border-3 border-dark px-4 py-2 shadow-[2px_2px_0px_0px_black] ${
              viewTab === 'catalog' ? 'bg-warning text-dark' : 'bg-light text-dark'
            }`}
          >
            <ShoppingBag className="w-4 h-4 me-1.5 inline" />
            Store Catalog ({rewards.length})
          </button>
          
          <button
            onClick={() => setViewTab('vouchers')}
            className={`btn rounded-0 fw-black text-uppercase border border-3 border-dark px-4 py-2 shadow-[2px_2px_0px_0px_black] ${
              viewTab === 'vouchers' ? 'bg-warning text-dark' : 'bg-light text-dark'
            }`}
          >
            <Ticket className="w-4 h-4 me-1.5 inline" />
            My Redeemed Vouchers ({redemptions.length})
          </button>
        </div>
      </div>

      {/* Catalog View */}
      {viewTab === 'catalog' && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="card bg-white text-dark rounded-0 border border-4 border-dark shadow-[4px_4px_0px_0px_black] p-3">
            <div className="row g-3 align-items-center">
              <div className="col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-dark text-white rounded-0 border-dark">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search rewards, vouchers, perks..."
                    className="form-control rounded-0 border-2 border-dark fw-medium"
                  />
                </div>
              </div>

              <div className="col-md-7">
                <div className="d-flex flex-wrap gap-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`btn btn-sm rounded-0 fw-bold border border-2 border-dark ${
                        selectedCategory === cat ? 'bg-success text-white' : 'bg-light text-dark'
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
          <div className="row g-4">
            {filteredRewards.length === 0 ? (
              <div className="col-12">
                <div className="card bg-white text-dark rounded-0 border border-4 border-dark p-5 text-center shadow-[4px_4px_0px_0px_black]">
                  <Gift className="w-12 h-12 text-success mx-auto mb-3" />
                  <h4 className="fw-black text-uppercase">No Rewards Found</h4>
                  <p className="text-muted fw-medium mb-3">Try adjusting your category filters or search query.</p>
                  <button
                    onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                    className="btn btn-success text-white fw-bold rounded-0 border border-2 border-dark px-4 py-2"
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
                  <div key={reward.id} className="col-md-6 col-lg-4">
                    <div className="card bg-white text-dark rounded-0 border border-4 border-dark shadow-[6px_6px_0px_0px_black] h-100 p-4 d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <div className="p-3 bg-light border border-2 border-dark rounded-0">
                            {renderIcon(reward.iconName || 'Gift')}
                          </div>
                          <span className="badge bg-dark text-white rounded-0 fw-bold px-3 py-1.5 border border-dark">
                            {reward.category}
                          </span>
                        </div>

                        <h4 className="fw-black text-uppercase mb-2">{reward.title}</h4>
                        <p className="text-muted fw-medium small mb-3">{reward.description}</p>
                      </div>

                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-3 p-2 bg-light border border-2 border-dark">
                          <div>
                            <span className="d-block text-muted small fw-bold text-uppercase">Cost</span>
                            <span className="fs-5 fw-black text-success">{reward.pointsCost} Pts</span>
                          </div>
                          <div className="text-end">
                            <span className="d-block text-muted small fw-bold text-uppercase">Stock</span>
                            <span className="fw-black text-dark">{reward.stock ?? 10} left</span>
                          </div>
                        </div>

                        <div className="d-flex gap-2">
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
                            className={`btn w-100 fw-black text-uppercase rounded-0 border border-3 border-dark py-2.5 shadow-[3px_3px_0px_0px_black] ${
                              isOutOfStock
                                ? 'bg-secondary text-white'
                                : canAfford
                                ? 'btn-success text-white'
                                : 'btn-warning text-dark'
                            }`}
                          >
                            {isOutOfStock ? 'Out of Stock' : canAfford ? 'Redeem Perk' : 'Need More Points'}
                          </button>

                          {isPortalAdmin && (
                            <button
                              onClick={() => handleDeleteReward(reward.id)}
                              className="btn btn-outline-danger rounded-0 border-3 border-dark"
                              title="Delete reward"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
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
        <div className="space-y-4">
          <div className="card bg-white text-dark rounded-0 border border-4 border-dark shadow-[4px_4px_0px_0px_black] p-4">
            <h3 className="fw-black text-uppercase mb-3">My Redeemed Vouchers & Perks</h3>
            
            {redemptions.length === 0 ? (
              <div className="text-center py-5">
                <Ticket className="w-12 h-12 text-muted mx-auto mb-3" />
                <h5 className="fw-black text-uppercase">No Vouchers Redeemed Yet</h5>
                <p className="text-muted fw-medium mb-3">Explore the store catalog and redeem your Verde Points for exciting school perks!</p>
                <button
                  onClick={() => setViewTab('catalog')}
                  className="btn btn-success text-white fw-bold rounded-0 border border-2 border-dark px-4 py-2"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              <div className="row g-3">
                {redemptions.map((item) => (
                  <div key={item.id} className="col-md-6">
                    <div className="card bg-light text-dark rounded-0 border border-3 border-dark p-3 shadow-[4px_4px_0px_0px_black]">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <span className="badge bg-success text-white rounded-0 fw-bold px-2 py-1 small mb-1">{item.category}</span>
                          <h5 className="fw-black text-uppercase m-0">{item.rewardTitle}</h5>
                        </div>
                        <span className="badge bg-warning text-dark fw-bold px-2 py-1 rounded-0 border border-dark">{item.status}</span>
                      </div>

                      <div className="bg-white p-3 border border-2 border-dark my-2 d-flex align-items-center justify-content-between">
                        <div>
                          <span className="d-block text-muted small fw-bold text-uppercase">Voucher Code</span>
                          <span className="fs-5 fw-mono fw-black text-success">{item.redemptionCode}</span>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(item.redemptionCode);
                            alert(`Copied voucher code ${item.redemptionCode} to clipboard!`);
                          }}
                          className="btn btn-sm btn-outline-dark rounded-0 fw-bold border-2"
                        >
                          <Copy className="w-4 h-4 me-1" /> Copy
                        </button>
                      </div>

                      <div className="d-flex justify-content-between align-items-center text-muted small">
                        <span>Redeemed by: {item.studentName || 'Student'}</span>
                        <span>{new Date(item.redeemedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Redemption Confirmation Modal */}
      {selectedRewardToRedeem && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-0 border border-4 border-dark shadow-[8px_8px_0px_0px_black]">
              <div className="modal-header bg-success text-white rounded-0 border-bottom border-4 border-dark">
                <h5 className="modal-title fw-black text-uppercase">Confirm Reward Redemption</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setSelectedRewardToRedeem(null);
                    setSuccessVoucherCode(null);
                  }}
                ></button>
              </div>

              <div className="modal-body bg-white text-dark p-4">
                {successVoucherCode ? (
                  <div className="text-center space-y-3">
                    <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
                    <h4 className="fw-black text-uppercase text-success">Redemption Successful!</h4>
                    <p className="text-dark fw-medium">Your perk has been successfully redeemed and saved to your vouchers.</p>
                    
                    <div className="p-3 bg-light border border-3 border-dark my-3">
                      <span className="d-block text-muted small fw-bold text-uppercase">Your Voucher Code</span>
                      <span className="fs-3 fw-black fw-mono text-success">{successVoucherCode}</span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedRewardToRedeem(null);
                        setSuccessVoucherCode(null);
                        setViewTab('vouchers');
                      }}
                      className="btn btn-success text-white fw-black text-uppercase rounded-0 border border-3 border-dark px-4 py-2"
                    >
                      View My Vouchers
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="fw-black text-uppercase">{selectedRewardToRedeem.title}</h4>
                    <p className="text-muted fw-medium">{selectedRewardToRedeem.description}</p>

                    <div className="p-3 bg-light border border-2 border-dark d-flex justify-content-between align-items-center">
                      <div>
                        <span className="d-block text-muted small fw-bold uppercase">Points Cost</span>
                        <span className="fs-5 fw-black text-danger">{selectedRewardToRedeem.pointsCost} Pts</span>
                      </div>
                      <div>
                        <span className="d-block text-muted small fw-bold uppercase">Your Balance</span>
                        <span className="fs-5 fw-black text-success">{currentStudent?.points || 0} Pts</span>
                      </div>
                    </div>

                    <p className="small text-muted mb-0">
                      Upon confirmation, {selectedRewardToRedeem.pointsCost} points will be deducted from your Verde balance and a unique voucher code will be generated.
                    </p>

                    <div className="d-flex justify-content-end gap-2 pt-3 border-top border-dark">
                      <button
                        type="button"
                        onClick={() => setSelectedRewardToRedeem(null)}
                        className="btn btn-outline-dark rounded-0 fw-bold border-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmRedeem}
                        disabled={isRedeeming}
                        className="btn btn-success text-white fw-black text-uppercase rounded-0 border border-3 border-dark px-4 py-2"
                      >
                        {isRedeeming ? 'Processing...' : 'Confirm Redemption'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Reward Modal (Portal Admin Only) */}
      {isAddModalOpen && isPortalAdmin && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-0 border border-4 border-dark shadow-[8px_8px_0px_0px_black]">
              <div className="modal-header bg-warning text-dark rounded-0 border-bottom border-4 border-dark">
                <h5 className="modal-title fw-black text-uppercase">Add New Campus Reward</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsAddModalOpen(false)}
                ></button>
              </div>

              <form onSubmit={handleCreateReward} className="modal-body bg-white text-dark p-4 space-y-3">
                <div>
                  <label className="form-label fw-bold text-uppercase small">Reward Title *</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Free Canteen Snack / Library Fast Pass"
                    className="form-control rounded-0 border-2 border-dark fw-medium"
                    required
                  />
                </div>

                <div>
                  <label className="form-label fw-bold text-uppercase small">Description</label>
                  <textarea
                    rows={2}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Details about the perk..."
                    className="form-control rounded-0 border-2 border-dark fw-medium"
                  />
                </div>

                <div className="row g-2">
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-uppercase small">Points Cost</label>
                    <input
                      type="number"
                      value={newPointsCost}
                      onChange={(e) => setNewPointsCost(Number(e.target.value))}
                      className="form-control rounded-0 border-2 border-dark fw-medium"
                      min={10}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-uppercase small">Stock Quantity</label>
                    <input
                      type="number"
                      value={newStock}
                      onChange={(e) => setNewStock(Number(e.target.value))}
                      className="form-control rounded-0 border-2 border-dark fw-medium"
                      min={1}
                      required
                    />
                  </div>
                </div>

                <div className="row g-2">
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-uppercase small">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as RewardCategory)}
                      className="form-select rounded-0 border-2 border-dark fw-medium"
                    >
                      <option value="Campus Perk">Campus Perk</option>
                      <option value="Eco Merchandise">Eco Merchandise</option>
                      <option value="School Supplies">School Supplies</option>
                      <option value="Recognition">Recognition</option>
                      <option value="Voucher">Voucher</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-uppercase small">Voucher Code Prefix</label>
                    <input
                      type="text"
                      value={newCodePrefix}
                      onChange={(e) => setNewCodePrefix(e.target.value)}
                      placeholder="e.g. SNACK"
                      className="form-control rounded-0 border-2 border-dark fw-medium"
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 pt-3 border-top border-dark">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="btn btn-outline-dark rounded-0 fw-bold border-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingReward}
                    className="btn btn-success text-white fw-black text-uppercase rounded-0 border border-3 border-dark px-4 py-2"
                  >
                    {isSavingReward ? 'Saving...' : 'Publish Reward'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
