import React, { useState, useEffect } from 'react';
import { Student, ActivityLog } from '../types';
import { Sparkles, Trophy, Lock, Unlock, Gift, RotateCw, CheckCircle2, AlertCircle, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SpinningWheelProps {
  currentStudent: Student | null;
  logs: ActivityLog[];
  onUpdateStudent?: (student: Student) => void;
}

interface WheelSector {
  label: string;
  points: number;
  color: string;
  textColor: string;
  accent: string;
}

const SECTORS: WheelSector[] = [
  { label: '100 Pts', points: 100, color: '#D02020', textColor: '#ffffff', accent: '#ff4d4d' },
  { label: '250 Pts', points: 250, color: '#1040C0', textColor: '#ffffff', accent: '#3b82f6' },
  { label: '500 Pts', points: 500, color: '#F0C020', textColor: '#121212', accent: '#fde047' },
  { label: '1000 Pts', points: 1000, color: '#059669', textColor: '#ffffff', accent: '#34d399' },
  { label: '1500 Pts', points: 1500, color: '#7c3aed', textColor: '#ffffff', accent: '#c084fc' },
  { label: '0 Pts', points: 0, color: '#121212', textColor: '#ffffff', accent: '#475569' },
];

export const SpinningWheel: React.FC<SpinningWheelProps> = ({
  currentStudent,
  logs,
  onUpdateStudent,
}) => {
  const studentDisposalLogs = Array.isArray(logs) ? logs.filter(
    (l) => {
      if (!currentStudent || !l || l.grNo !== currentStudent.grNo) return false;
      const title = String(l.challengeTitle || l.proofNote || '').toLowerCase();
      return (
        l.category === 'Recycling' ||
        l.category === 'Waste' ||
        title.includes('bin') ||
        title.includes('disposal') ||
        title.includes('plastic') ||
        title.includes('can') ||
        title.includes('bottle')
      );
    }
  ) : [];

  const totalDisposals = studentDisposalLogs.length;
  const REQUIRED_DISPOSALS = 25;
  const isUnlocked = totalDisposals >= REQUIRED_DISPOSALS;

  useEffect(() => {
    if (typeof window !== 'undefined' && currentStudent) {
      localStorage.removeItem(`verdetech_wheel_disposals_${currentStudent.grNo}`);
    }
  }, [currentStudent]);

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<WheelSector | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  const spinWheel = () => {
    if (isSpinning || !isUnlocked) return;

    setIsSpinning(true);
    setWonPrize(null);
    setShowResultModal(false);

    const randomIndex = Math.floor(Math.random() * SECTORS.length);
    const selectedSector = SECTORS[randomIndex];

    const sectorAngle = 360 / SECTORS.length;
    const sectorCenter = randomIndex * sectorAngle + sectorAngle / 2;
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const targetDegree = 360 * extraSpins + (270 - sectorCenter);
    const jitter = (Math.random() - 0.5) * 20;
    const finalDegree = rotation + (targetDegree - (rotation % 360)) + jitter;

    setRotation(finalDegree);

    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(selectedSector);
      setShowResultModal(true);

      if (selectedSector.points > 0 && currentStudent && onUpdateStudent) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#D02020', '#1040C0', '#F0C020', '#059669', '#7c3aed'],
        });

        const updatedStudent: Student = {
          ...currentStudent,
          points: currentStudent.points + selectedSector.points,
          weeklyPoints: (currentStudent.weeklyPoints || 0) + selectedSector.points,
        };
        onUpdateStudent(updatedStudent);
      }
    }, 4200);
  };

  return (
    <div className="bg-white border border-4 border-dark rounded-0 p-4 sm:p-6 text-dark shadow-[6px_6px_0px_0px_black] relative mb-5">
      
      {/* Header */}
      <div className="d-flex flex-column md:flex-row align-items-md-center justify-content-between gap-3 border-bottom border-4 border-dark pb-4 mb-4">
        <div>
          <div className="badge bg-warning text-dark fw-black px-3 py-2 rounded-0 text-uppercase mb-2 border border-2 border-dark">
            <Sparkles className="w-3.5 h-3.5 me-1" />
            Campus Eco Rewards • Up to 1,500 Pts
          </div>
          <h2 className="h3 fw-black text-dark text-uppercase tracking-tight m-0">
            Verde Tech Lucky Wheel
          </h2>
          <p className="small text-muted m-0 mt-1 fw-semibold">
            Unlocked exclusively after completing 25 Smart Bin disposals. Spin for a chance to win up to 1,500 bonus points!
          </p>
        </div>

        <div>
          {isUnlocked ? (
            <span className="badge bg-success text-white fw-black rounded-0 px-3 py-2 border border-2 border-dark text-uppercase">
              <Unlock className="w-4 h-4 me-1" /> Unlocked & Ready
            </span>
          ) : (
            <span className="badge bg-secondary text-white fw-black rounded-0 px-3 py-2 border border-2 border-dark text-uppercase">
              <Lock className="w-4 h-4 me-1" /> Locked ({totalDisposals}/25 Disposals)
            </span>
          )}
        </div>
      </div>

      {/* Wheel Area */}
      <div className="text-center py-4 bg-light border border-4 border-dark mb-4 position-relative overflow-hidden">
        
        {/* Pointer */}
        <div 
          className="position-absolute top-0 start-50 translate-middle-x z-3" 
          style={{ width: '0', height: '0', borderLeft: '18px solid transparent', borderRight: '18px solid transparent', borderTop: '32px solid #121212', filter: 'drop-shadow(2px 2px 0px #F0C020)' }}
        ></div>

        <div className="position-relative d-inline-block my-3">
          <div 
            className="rounded-circle border border-4 border-dark shadow-lg overflow-hidden position-relative mx-auto"
            style={{
              width: '280px',
              height: '280px',
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4.2s cubic-bezier(0.15, 0.85, 0.15, 1)' : 'none',
            }}
          >
            {SECTORS.map((sector, index) => {
              const angle = (360 / SECTORS.length) * index;
              return (
                <div
                  key={index}
                  className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center fw-black"
                  style={{
                    backgroundColor: sector.color,
                    color: sector.textColor,
                    transform: `rotate(${angle}deg)`,
                    clipPath: 'polygon(50% 50%, 0% 0%, 100% 0%)',
                    border: '1px solid #121212',
                  }}
                >
                  <span className="position-absolute text-uppercase fw-black" style={{ transform: 'translateY(-70px) rotate(30deg)', fontSize: '13px', textShadow: '1px 1px 0px #121212' }}>
                    {sector.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Center Hub */}
          <div className="position-absolute top-50 start-50 translate-middle rounded-circle bg-warning border border-4 border-dark d-flex align-items-center justify-content-center shadow" style={{ width: '60px', height: '60px', zIndex: 4 }}>
            <Trophy className="w-6 h-6 text-dark" />
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={spinWheel}
            disabled={isSpinning || !isUnlocked}
            className={`btn btn-lg fw-black text-uppercase rounded-0 border border-4 border-dark px-5 py-3 shadow-[4px_4px_0px_0px_black] ${
              !isUnlocked ? 'btn-secondary text-white' : isSpinning ? 'btn-warning text-dark' : 'btn-danger text-white'
            }`}
          >
            {isSpinning ? 'Spinning Wheel...' : !isUnlocked ? `Locked (${25 - totalDisposals} more disposals needed)` : 'Spin & Win Pts!'}
          </button>
        </div>
      </div>

      {/* Rules & Status info */}
      <div className="bg-light border border-2 border-dark p-3 rounded-0">
        <h5 className="fw-black text-dark text-uppercase fs-6 mb-2 d-flex align-items-center gap-1">
          <Gift className="w-4 h-4 text-danger" />
          <span>Lucky Wheel Guidelines</span>
        </h5>
        <ul className="small text-dark fw-medium m-0 ps-3">
          <li>Complete verified Smart Bin waste disposals to unlock the lucky wheel.</li>
          <li>Each 25 disposals grant you an eligible spin.</li>
          <li>Win guaranteed bonus points ranging from 100 up to 1,500 points instantly added to your tally!</li>
        </ul>
      </div>

      {/* Result Modal */}
      {showResultModal && wonPrize && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-0 border border-4 border-dark shadow-[8px_8px_0px_0px_black] p-4 bg-white text-dark text-center">
              <div className="mb-3">
                <div className="display-4 fw-black text-danger text-uppercase">🎉 CONGRATULATIONS!</div>
                <p className="lead fw-bold text-dark mt-2">You won {wonPrize.label}!</p>
              </div>

              <div className="bg-light border border-2 border-dark p-3 rounded-0 mb-4">
                <div className="h2 fw-black text-success font-monospace m-0">+{wonPrize.points} Pts</div>
                <div className="small text-muted fw-semibold mt-1">Successfully added to your Verde Tech account.</div>
              </div>

              <button
                type="button"
                onClick={() => setShowResultModal(false)}
                className="btn btn-warning text-dark fw-black rounded-0 text-uppercase px-5 py-2 border border-2 border-dark shadow-[2px_2px_0px_0px_black]"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
