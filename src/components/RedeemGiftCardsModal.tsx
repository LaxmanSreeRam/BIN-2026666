import React, { useState } from 'react';
import { Student, ActivityLog, RedeemedReward } from '../types';
import { 
  Gift, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  KeyRound, 
  RotateCw,
  Clock,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// ... (Rest of the component implementation with Firestore logic)

export interface RecentRedemption {
  id: string;
  code: string;
  title: string;
  pointsAwarded?: number;
  type: 'points' | 'item';
  timestamp: string;
}

interface RedeemGiftCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: Student | null;
  onRedeemPoints?: (points: number, description: string) => void;
  onRedeemRewardItem?: (rewardItem: RedeemedReward) => void;
  onSubmitActivity?: (log: ActivityLog) => void;
}

export const RedeemGiftCardsModal: React.FC<RedeemGiftCardsModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  onRedeemPoints,
  onRedeemRewardItem,
  onSubmitActivity,
}) => {
  const [codeInput, setCodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<{
    type: 'points' | 'item';
    title: string;
    description: string;
    pointsAwarded?: number;
    code: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redeemedCodes, setRedeemedCodes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('verdetech_redeemed_gift_codes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentRedemptions, setRecentRedemptions] = useState<RecentRedemption[]>(() => {
    try {
      const saved = localStorage.getItem('verdetech_recent_redemptions');
      if (saved) return JSON.parse(saved);
      return [
        {
          id: 'preset-1',
          code: 'BIN-100PTS-DISPOSAL',
          title: '+100 Verde Points Credited',
          pointsAwarded: 100,
          type: 'points',
          timestamp: 'Yesterday'
        },
        {
          id: 'preset-2',
          code: 'GIFT-SNACK-PASS',
          title: 'Cafeteria Snack Voucher',
          type: 'item',
          timestamp: '3 days ago'
        }
      ];
    } catch {
      return [];
    }
  });

  if (!isOpen) return null;

  // Pleasant Web Audio Chime on successful redemption
  const playRedemptionChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.25); // C6

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // Audio not permitted
    }
  };

  const handleRedeem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const clean = codeInput.trim().toUpperCase();
    if (!/^\d{4}$/.test(clean)) {
      setErrorMsg('Please enter a 4-digit numeric code.');
      return;
    }

    const studentGr = currentStudent?.grNo || '83502';
    const studentName = currentStudent?.name || 'Active Student';

    setIsSubmitting(true);

    try {
      // 1. First attempt to redeem via Backend API & Firebase Firestore (supports Raspberry Pi codes)
      const apiRes = await fetch('/api/redeem-gift-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: clean,
          grNo: studentGr,
          studentName,
        }),
      });

      const apiData = await apiRes.json();

      if (apiRes.ok && apiData.success) {
        const pointsAwarded = Number(apiData.pointsAwarded) || 50;
        const title = `+${pointsAwarded} Verde Points Credited`;
        const description = `Smart Bin Gift Card ${clean} successfully credited to your account.`;

        playRedemptionChime();
        try {
          confetti({
            particleCount: 85,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#059669', '#10B981', '#F59E0B', '#3B82F6'],
          });
        } catch {}

        if (onRedeemPoints) {
          onRedeemPoints(pointsAwarded, `Smart Bin Gift Card (${clean})`);
        }

        const updatedCodes = [...redeemedCodes, clean];
        setRedeemedCodes(updatedCodes);
        try {
          localStorage.setItem('verdetech_redeemed_gift_codes', JSON.stringify(updatedCodes));
        } catch {}

        const newRecent: RecentRedemption = {
          id: `rec_${Date.now()}`,
          code: clean,
          title,
          pointsAwarded,
          type: 'points',
          timestamp: 'Just now',
        };
        const updatedRecents = [newRecent, ...recentRedemptions.filter((r) => r.code !== clean)];
        setRecentRedemptions(updatedRecents);
        try {
          localStorage.setItem('verdetech_recent_redemptions', JSON.stringify(updatedRecents));
        } catch {}

        setSuccessInfo({
          type: 'points',
          title,
          description,
          pointsAwarded,
        });
        setCodeInput('');
        return;
      }

      // If backend says already redeemed
      if (apiRes.status === 400 && apiData.error) {
        setErrorMsg(apiData.error);
        return;
      }

      // If code was not in database (404), evaluate preset/store voucher patterns
      let type: 'points' | 'item' = 'points';
      let pointsAwarded = 50;
      let title = 'Waste Disposal Reward';
      let description = 'Verified waste disposal deposit reward.';

      if (clean.includes('250') || clean.includes('MEGA') || clean.includes('BONUS')) {
        pointsAwarded = 250;
        title = '+250 Verde Points Credited';
        description = 'Premium disposal bonus reward credited to your account.';
      } else if (clean.includes('100') || clean.includes('DOUBLE')) {
        pointsAwarded = 100;
        title = '+100 Verde Points Credited';
        description = 'Verified waste sorting reward credited to your account.';
      } else if (clean.includes('50') || clean.startsWith('BIN-') || clean.startsWith('ECO-')) {
        pointsAwarded = 50;
        title = '+50 Verde Points Credited';
        description = 'Verified waste disposal deposit reward credited to your account.';
      } else if (clean.includes('SNACK') || clean.includes('CAFE') || clean.includes('FOOD')) {
        type = 'item';
        title = 'Cafeteria Snack Voucher';
        description = 'Free Organic Snack Voucher redeemable at the cafeteria.';
      } else if (clean.includes('PIN') || clean.includes('MERCH') || clean.includes('STORE')) {
        type = 'item';
        title = 'Verde Tech Ambassador Pin';
        description = 'Official Ambassador Enamel Pin reward redeemable at the eco council desk.';
      } else if (clean.startsWith('GIFT-') || clean.includes('VOUCHER') || clean.includes('PASS')) {
        type = 'item';
        title = 'Eco Store Voucher Pass';
        description = 'Verified disposal reward voucher pass redeemable at the Rewards Store.';
      } else {
        setErrorMsg(apiData.error || `Invalid gift code "${clean}". No active Gift Card found in database.`);
        return;
      }

      // Trigger celebration
      playRedemptionChime();
      try {
        confetti({
          particleCount: 85,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#059669', '#10B981', '#F59E0B', '#3B82F6'],
        });
      } catch {}

      if (type === 'points') {
        if (onRedeemPoints) {
          onRedeemPoints(pointsAwarded, `Gift Code Redemption (${clean})`);
        }
        if (onSubmitActivity) {
          const newLog: ActivityLog = {
            id: `log-gift-${Date.now()}`,
            grNo: studentGr,
            studentName,
            challengeId: 'challenge-gift-code',
            challengeTitle: `Gift Code (${clean})`,
            category: 'Recycling',
            quantity: 1,
            unitLabel: 'Disposal',
            pointsEarned: pointsAwarded,
            co2SavedKg: 0.45,
            waterSavedLiters: 1.2,
            wasteDivertedKg: 0.35,
            energySavedKwh: 0.8,
            status: 'Approved',
            timestamp: new Date().toISOString(),
            proofNote: `Redeemed disposal gift code ${clean} on Verde Tech Portal.`,
            cheersCount: 0,
            reactions: { cheer: 0, fire: 0, leaf: 0 },
          };
          onSubmitActivity(newLog);
        }
      } else {
        const newReward: RedeemedReward = {
          id: `red_gift_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          rewardId: `gift-${clean}`,
          rewardTitle: title,
          pointsSpent: 0,
          redeemedAt: new Date().toISOString(),
          redemptionCode: clean,
          studentGrNo: studentGr,
          studentName,
          status: 'Active',
        };
        try {
          const saved = localStorage.getItem('verdetech_redemptions') || localStorage.getItem('ecopoints_redemptions');
          const list = saved ? JSON.parse(saved) : [];
          list.unshift(newReward);
          localStorage.setItem('verdetech_redemptions', JSON.stringify(list));
          localStorage.setItem('ecopoints_redemptions', JSON.stringify(list));
        } catch (e) {
          console.warn('Could not save redeemed reward to localStorage', e);
        }
        if (onRedeemRewardItem) {
          onRedeemRewardItem(newReward);
        }
        if (onSubmitActivity) {
          const newLog: ActivityLog = {
            id: `log-gift-item-${Date.now()}`,
            grNo: studentGr,
            studentName,
            challengeId: 'challenge-gift-reward',
            challengeTitle: `Gift Voucher (${title})`,
            category: 'Recycling',
            quantity: 1,
            unitLabel: 'Voucher',
            pointsEarned: 25,
            co2SavedKg: 0.45,
            waterSavedLiters: 1.2,
            wasteDivertedKg: 0.35,
            energySavedKwh: 0.8,
            status: 'Approved',
            timestamp: new Date().toISOString(),
            proofNote: `Redeemed gift voucher code ${clean} for ${title}.`,
            cheersCount: 0,
            reactions: { cheer: 0, fire: 0, leaf: 0 },
          };
          onSubmitActivity(newLog);
        }
      }

      const updatedCodes = [...redeemedCodes, clean];
      setRedeemedCodes(updatedCodes);
      try {
        localStorage.setItem('verdetech_redeemed_gift_codes', JSON.stringify(updatedCodes));
      } catch {}

      const newRecent: RecentRedemption = {
        id: `rec_${Date.now()}`,
        code: clean,
        title,
        pointsAwarded: type === 'points' ? pointsAwarded : undefined,
        type,
        timestamp: 'Just now',
      };
      const updatedRecents = [newRecent, ...recentRedemptions.filter(r => r.code !== clean)];
      setRecentRedemptions(updatedRecents);
      try {
        localStorage.setItem('verdetech_recent_redemptions', JSON.stringify(updatedRecents));
      } catch {}

      setSuccessInfo({
        type,
        title,
        description,
        pointsAwarded: type === 'points' ? pointsAwarded : undefined,
      });
      setCodeInput('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error occurred while validating gift card.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-md modal-dialog-centered">
        <div className="modal-content border border-4 border-dark rounded-0 shadow-[8px_8px_0px_0px_black] bg-white">
          
          {/* Header Bar - Corporate Eco Green */}
          <div className="modal-header bg-success text-white border-bottom border-dark border-3 rounded-0 px-4 py-3">
            <div className="d-flex align-items-center gap-3">
              <div className="p-2.5 bg-dark text-warning rounded-0 border border-2 border-dark">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <h5 className="modal-title fw-black text-uppercase tracking-tight m-0">
                  REDEEM GIFT CARDS
                </h5>
                <p className="text-white-50 small m-0 mt-0.5">
                  Enter your verification code to claim points or store rewards
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn-close btn-close-white rounded-0"
              aria-label="Close"
            />
          </div>

          <div className="modal-body p-4 bg-light">
            
            {/* SUCCESS BANNER */}
            {successInfo ? (
              <div className="card border border-3 border-dark rounded-0 bg-white p-4 shadow-[4px_4px_0px_0px_black] text-center">
                <div className="p-3 bg-dark text-success rounded-0 border border-2 border-dark d-inline-flex mx-auto mb-3">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                
                <span className="badge bg-success text-white rounded-0 fw-black text-uppercase px-3 py-1 small mb-2 d-inline-block">
                  ★ Code Successfully Redeemed! ★
                </span>

                <h4 className="fw-black text-dark text-uppercase m-0">
                  {successInfo.title}
                </h4>

                <p className="text-muted small mt-1 mb-3">
                  {successInfo.description}
                </p>

                <div className="p-3 bg-light border border-2 border-dark rounded-0 d-inline-block mx-auto mb-4 font-monospace">
                  <span className="text-muted xsmall d-block fw-bold">STATUS</span>
                  <span className="fs-5 fw-black text-dark">CLAIMED</span>
                </div>

                <div className="d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSuccessInfo(null)}
                    className="btn btn-outline-dark rounded-0 fw-bold border-2 px-3 py-2"
                  >
                    <RotateCw className="w-4 h-4 me-1.5 inline" />
                    Redeem Another Code
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-success text-white rounded-0 fw-black text-uppercase border border-2 border-dark px-4 py-2 shadow-[2px_2px_0px_0px_black]"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* REDEMPTION INPUT FORM */
              <div className="card bg-white border border-3 border-dark rounded-0 p-4 shadow-[4px_4px_0px_0px_black]">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fw-black text-dark text-uppercase m-0 d-flex align-items-center gap-2">
                    <KeyRound className="w-5 h-5 text-warning" />
                    <span>Enter Voucher / Gift Code</span>
                  </h6>
                  <span className="badge bg-dark text-white rounded-0 font-monospace small">
                    PORTAL VERIFIED
                  </span>
                </div>

                {errorMsg && (
                  <div className="alert alert-danger rounded-0 border border-2 border-dark text-dark fw-bold small py-2 d-flex align-items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleRedeem}>
                  <div className="input-group mb-3">
                    <span className="input-group-text bg-light rounded-0 border-2 border-dark">
                      <Gift className="w-5 h-5 text-dark" />
                    </span>
                    <input
                      type="text"
                      required
                      autoFocus
                      disabled={isSubmitting}
                      value={codeInput}
                      onChange={(e) => {
                        setCodeInput(e.target.value.toUpperCase());
                        setErrorMsg('');
                      }}
                      placeholder="e.g. 6930, BIN-50PTS, or GIFT-REWARD"
                      className="form-control rounded-0 border-2 border-dark fw-black font-monospace py-2.5 fs-5 text-uppercase"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-success text-white fw-black text-uppercase rounded-0 border border-2 border-dark px-4 py-2.5 shadow-[2px_2px_0px_0px_black] d-flex align-items-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Redeem Now</span>
                      )}
                    </button>
                  </div>

                  <div className="d-flex align-items-center gap-1.5 text-success small fw-bold mb-2">
                    <span>Verde Tech Gift Code System</span>
                  </div>

                  <div className="d-flex flex-wrap align-items-center justify-content-between text-muted small pt-1 border-top border-dark border-opacity-10">
                    <span>
                      Credited to: <strong>{currentStudent?.name || 'Active Student'}</strong> ({currentStudent?.grNo || '83502'})
                    </span>
                    <span className="font-monospace">Points or Store Vouchers</span>
                  </div>
                </form>
              </div>
            )}

            {/* RECENT REDEMPTIONS SUMMARY LIST */}
            <div className="mt-4 pt-3 border-top border-dark border-2">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="fw-black text-dark text-uppercase m-0 d-flex align-items-center gap-2 small">
                  <Clock className="w-4 h-4 text-success" />
                  <span>Recent Redemptions</span>
                </h6>
                <span className="badge bg-dark text-white rounded-0 font-monospace small px-2 py-0.5">
                  {recentRedemptions.length} Claimed
                </span>
              </div>

              {recentRedemptions.length === 0 ? (
                <div className="p-3 bg-white border border-2 border-dark rounded-0 text-center text-muted small">
                  <span>No recent gift codes redeemed yet. Enter your disposal code above.</span>
                </div>
              ) : (
                <div className="bg-white border border-2 border-dark rounded-0 overflow-hidden shadow-[2px_2px_0px_0px_black]">
                  {recentRedemptions.slice(0, 5).map((item, idx) => (
                    <div 
                      key={item.id} 
                      className={`p-2.5 px-3 d-flex flex-wrap align-items-center justify-content-between gap-2 text-dark small ${
                        idx !== recentRedemptions.slice(0, 5).length - 1 ? 'border-bottom border-secondary border-opacity-25' : ''
                      }`}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold">{item.title}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        {item.type === 'points' && item.pointsAwarded ? (
                          <span className="badge bg-success text-white rounded-0 fw-black">
                            +{item.pointsAwarded} Pts
                          </span>
                        ) : (
                          <span className="badge bg-warning text-dark rounded-0 fw-bold border border-dark">
                            Reward Perk
                          </span>
                        )}
                        <span className="text-muted xsmall font-monospace">{item.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Modal Footer */}
          <div className="modal-footer bg-white border-top border-dark border-3 px-4 py-3 d-flex align-items-center justify-content-between">
            <span className="small text-muted d-flex align-items-center gap-1.5 fw-bold">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span>Verde Tech Official Gift Verification Protocol</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline-dark rounded-0 fw-bold border-2 px-3 py-1.5"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
