import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Sparkles } from 'lucide-react';

export const StaiCountdown: React.FC = () => {
  // STAI 2026 official kickoff date: 23 October 2026 09:00:00 GST
  const targetDate = new Date('2026-10-23T09:00:00+04:00').getTime();

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds }
  ];

  return (
    <div className="relative rounded-3xl border border-white/10 bg-[#060a17]/90 backdrop-blur-2xl p-6 sm:p-8 overflow-hidden shadow-2xl">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-400/30">06</span>
            <span className="w-6 h-px bg-cyan-400/40" />
            <span className="uppercase tracking-widest">Countdown to Future World</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            STAI 2026 — <span className="stai-gradient-text">Future World Exhibition</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>23–24 October 2026</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Indian School Al Wadi Al Kabir</span>
            </span>
          </p>
        </div>

        {/* Big Digit Ticker Blocks */}
        <div className="flex items-center gap-2 sm:gap-3">
          {units.map((unit, idx) => (
            <div key={idx} className="flex items-center gap-2 sm:gap-3">
              <div className="flex flex-col items-center">
                <div className="w-16 sm:w-20 h-18 sm:h-20 rounded-2xl bg-black/60 border border-cyan-500/30 flex items-center justify-center text-2xl sm:text-4xl font-mono font-black text-cyan-300 shadow-[0_0_20px_rgba(94,242,255,0.15)] tabular-nums">
                  {String(unit.value).padStart(2, '0')}
                </div>
                <span className="text-[10px] sm:text-xs font-mono uppercase text-slate-400 mt-1.5">
                  {unit.label}
                </span>
              </div>
              {idx < units.length - 1 && (
                <span className="text-xl sm:text-2xl font-mono text-cyan-500/50 mb-5">:</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
