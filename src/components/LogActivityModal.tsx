import React, { useState, useEffect } from 'react';
import { Challenge, Student, ActivityLog } from '../types';
import { 
  Shield, 
  X, 
  Sparkles, 
  PlusCircle, 
  CheckCircle2, 
  Upload, 
  Award,
  Trees, 
  Droplets, 
  Zap, 
  Trash2, 
  Image as ImageIcon,
  Gift,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LogActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenges: Challenge[];
  currentStudent: Student | null;
  selectedChallengePreFill?: Challenge | null;
  onSubmitActivity: (newLog: ActivityLog) => void;
  onOpenQRScanner?: () => void;
  onOpenRedeemGiftCards?: () => void;
}

const SAMPLE_PROOF_PHOTOS = [
  { name: 'Tree Sapling Planted', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80' },
  { name: 'Zero Plastic Lunch Box', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80' },
  { name: 'E-Waste Deposit Bin', url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80' },
  { name: 'Bicycle Commute', url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80' },
  { name: 'Classroom Unplugged', url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80' },
];

export const LogActivityModal: React.FC<LogActivityModalProps> = ({
  isOpen,
  onClose,
  challenges,
  currentStudent,
  selectedChallengePreFill,
  onSubmitActivity,
  onOpenQRScanner,
  onOpenRedeemGiftCards,
}) => {
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(
    selectedChallengePreFill?.id || challenges[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(
    selectedChallengePreFill?.defaultQuantity || 1
  );
  const [smartBinId, setSmartBinId] = useState<string>('Smart Bin #1 - Main Cafeteria');
  const [proofNote, setProofNote] = useState<string>('');
  const [proofImageUrl, setProofImageUrl] = useState<string>(SAMPLE_PROOF_PHOTOS[0].url);
  const [customPhotoInput, setCustomPhotoInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (selectedChallengePreFill) {
      setSelectedChallengeId(selectedChallengePreFill.id);
      setQuantity(selectedChallengePreFill.defaultQuantity || 1);
    }
  }, [selectedChallengePreFill]);

  if (!isOpen || !currentStudent) return null;

  const currentChallenge = challenges.find((c) => c.id === selectedChallengeId) || challenges[0];

  // Dynamic Impact Calculations
  const computedPoints = (currentChallenge?.points || 0) * (quantity || 1);
  const computedCo2 = ((currentChallenge?.co2Multiplier || 0) * (quantity || 1));
  const computedWater = ((currentChallenge?.waterMultiplier || 0) * (quantity || 1));
  const computedWaste = ((currentChallenge?.wasteMultiplier || 0) * (quantity || 1));
  const computedEnergy = ((currentChallenge?.energyMultiplier || 0) * (quantity || 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#10B981', '#F59E0B', '#3B82F6'],
      });
    } catch {
      // Ignore
    }

    const finalImage = customPhotoInput.trim() || proofImageUrl;
    const finalNote = proofNote.trim() || `Waste disposal at ${smartBinId} (${quantity} item/s)`;

    try {
      await fetch('/api/smart-bin-disposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: currentStudent.name,
          grNo: currentStudent.grNo,
          category: currentChallenge?.category || 'Recycling',
          pointsClaimed: computedPoints,
          smartBinId,
          proofNote: finalNote,
          proofImage: finalImage,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      // Offline fallback
    }

    const newLog: ActivityLog = {
      id: `log-manual-${Date.now()}`,
      grNo: currentStudent.grNo,
      studentName: currentStudent.name,
      challengeId: currentChallenge?.id || 'challenge-smart-bin',
      challengeTitle: currentChallenge?.title || `Smart Bin Waste Disposal (${smartBinId})`,
      category: currentChallenge?.category || 'Recycling',
      quantity,
      unitLabel: currentChallenge?.unitLabel || 'Items',
      pointsEarned: computedPoints,
      co2SavedKg: computedCo2,
      wasteDivertedKg: computedWaste,
      waterSavedLiters: computedWater,
      energySavedKwh: computedEnergy,
      status: 'Pending Verification',
      timestamp: new Date().toISOString(),
      proofNote: finalNote,
      proofImageUrl: finalImage,
      verifiedBy: 'Submitted to Admin for Bin Verification',
      cheersCount: 1,
      reactions: { cheer: 1, fire: 0, leaf: 1 },
    };

    onSubmitActivity(newLog);
    setIsSubmitting(false);

    setSubmittedNotice(
      `Your points request for Smart Bin disposal (${smartBinId}) has been submitted! An email notification has been dispatched to the administrator to verify against the physical bin records.`
    );
  };

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border border-4 border-dark rounded-0 shadow-[8px_8px_0px_0px_black] bg-white">
          
          {/* Header */}
          <div className="modal-header bg-success text-white border-bottom border-dark border-3 rounded-0 px-4 py-3">
            <div className="d-flex align-items-center gap-3">
              <div className="p-2.5 bg-dark text-warning rounded-0 border border-2 border-dark">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h5 className="modal-title fw-black text-uppercase tracking-tight m-0">
                  LOG SMART BIN WASTE DISPOSAL
                </h5>
                <p className="text-white-50 small m-0 mt-0.5">
                  Student: <strong className="text-white">{currentStudent.name}</strong> (GR {currentStudent.grNo})
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSubmittedNotice(null);
                onClose();
              }}
              className="btn-close btn-close-white rounded-0"
              aria-label="Close"
            />
          </div>

          {submittedNotice ? (
            <div className="modal-body p-4 p-md-5 text-center bg-light">
              <div className="p-3 bg-dark text-success rounded-0 border border-3 border-dark d-inline-flex mx-auto mb-3 shadow-[4px_4px_0px_0px_black]">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="fw-black text-dark text-uppercase mb-2">Points Request Submitted!</h3>
              <div className="alert alert-warning border border-2 border-dark rounded-0 p-3 text-dark small fw-bold mx-auto mb-4" style={{ maxWidth: '540px' }}>
                {submittedNotice}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSubmittedNotice(null);
                  onClose();
                }}
                className="btn btn-success text-white fw-black text-uppercase rounded-0 border border-3 border-dark px-5 py-2.5 shadow-[4px_4px_0px_0px_black]"
              >
                Got It
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="modal-body p-4 bg-light">
              
              {/* Select Smart Bin Location */}
              <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between mb-1.5">
                  <label className="form-label small fw-bold text-dark text-uppercase m-0">
                    Select Smart Bin Location
                  </label>
                  {onOpenRedeemGiftCards && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenRedeemGiftCards) onOpenRedeemGiftCards();
                      }}
                      className="btn btn-warning text-dark btn-sm fw-black text-uppercase rounded-0 border border-2 border-dark py-1 px-2.5 shadow-[2px_2px_0px_0px_black] d-flex align-items-center gap-1"
                    >
                      <Gift className="w-3.5 h-3.5 text-dark" />
                      <span>Redeem Gift Cards</span>
                    </button>
                  )}
                </div>

                <select
                  value={smartBinId}
                  onChange={(e) => setSmartBinId(e.target.value)}
                  className="form-select rounded-0 border-2 border-dark fw-bold"
                >
                  <option value="Smart Bin #1 - Main Cafeteria">Smart Bin #1 - Main Cafeteria (Recycling & Plastics)</option>
                  <option value="Smart Bin #2 - Library Corridor">Smart Bin #2 - Library Corridor (Paper & E-Waste)</option>
                  <option value="Smart Bin #3 - Science Wing & Eco Courtyard">Smart Bin #3 - Science Wing & Eco Courtyard (Compost & Bottles)</option>
                  <option value="Smart Bin #4 - Sports Complex">Smart Bin #4 - Sports Complex (Hydration & Aluminum)</option>
                  <option value="Smart Bin #5 - Central Courtyard Garden">Smart Bin #5 - Central Courtyard Garden (Mixed Recyclables)</option>
                </select>
              </div>

              {/* Quantity & Points Reward Callout */}
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-dark text-uppercase mb-1">
                    Items Disposed (Quantity)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="form-control rounded-0 border-2 border-dark font-monospace fw-bold fs-5"
                  />
                </div>

                <div className="col-12 col-md-6">
                  <div className="card h-100 p-2.5 bg-white border border-2 border-dark rounded-0 d-flex flex-row align-items-center justify-content-between shadow-[2px_2px_0px_0px_black]">
                    <div>
                      <span className="small text-muted fw-bold text-uppercase d-block">Points Requested</span>
                      <span className="fs-3 fw-black text-success lh-1 font-monospace">
                        +{computedPoints} <span className="fs-6 text-muted fw-normal">pts</span>
                      </span>
                    </div>
                    <Award className="w-8 h-8 text-warning" />
                  </div>
                </div>
              </div>



              {/* Note / Description */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark text-uppercase mb-1">
                  Disposal Notes / Item Type
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Deposited plastic water bottles and cans into the designated recycling chamber..."
                  value={proofNote}
                  onChange={(e) => setProofNote(e.target.value)}
                  className="form-control rounded-0 border-2 border-dark small fw-medium"
                />
              </div>

              {/* Proof Image Attachment */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark text-uppercase mb-1 d-flex align-items-center gap-1">
                  <ImageIcon className="w-4 h-4 text-success" />
                  <span>Disposal Photo Evidence (Optional)</span>
                </label>

                <div className="row g-2 mb-2">
                  {SAMPLE_PROOF_PHOTOS.map((sample) => (
                    <div key={sample.name} className="col-6 col-md-2" style={{ width: '20%' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setProofImageUrl(sample.url);
                          setCustomPhotoInput('');
                        }}
                        className={`btn p-1 w-100 rounded-0 border text-center ${
                          proofImageUrl === sample.url && !customPhotoInput
                            ? 'border-3 border-dark bg-warning'
                            : 'border-2 border-secondary bg-white opacity-75'
                        }`}
                      >
                        <img
                          src={sample.url}
                          alt={sample.name}
                          className="w-100 rounded-0"
                          style={{ height: '42px', objectFit: 'cover' }}
                        />
                        <span className="xsmall text-dark fw-bold d-block text-truncate mt-1">
                          {sample.name}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Or paste photo URL (e.g. https://...)"
                  value={customPhotoInput}
                  onChange={(e) => setCustomPhotoInput(e.target.value)}
                  className="form-control form-control-sm rounded-0 border-2 border-dark"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-success text-white w-100 fw-black text-uppercase rounded-0 border border-3 border-dark py-3 fs-5 shadow-[4px_4px_0px_0px_black] d-flex align-items-center justify-content-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{isSubmitting ? 'Submitting Request...' : `Submit Smart Bin Request (+${computedPoints} Pts)`}</span>
              </button>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
