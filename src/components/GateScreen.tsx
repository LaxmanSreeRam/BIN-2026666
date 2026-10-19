import React, { useState, useEffect } from 'react';
import { playSound } from '../utils/soundFx';
import { ArrowRight, Volume2, VolumeX, Sparkles, Terminal } from 'lucide-react';

interface GateScreenProps {
  onEnter: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const GateScreen: React.FC<GateScreenProps> = ({
  onEnter,
  soundEnabled,
  onToggleSound
}) => {
  const [currentTime, setCurrentTime] = useState<string>('00:00:00');
  const [isBooting, setIsBooting] = useState<boolean>(false);
  const [bootProgress, setBootProgress] = useState<number>(0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);

  // Muscat / Oman time sync
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut: Press Enter to launch
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isBooting) {
        startBootSequence();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBooting]);

  const startBootSequence = () => {
    if (isBooting) return;
    setIsBooting(true);
    playSound('boot');

    const logs = [
      '[SYS.INIT] Engaging Verde Tech Neural Engine...',
      '[TELEMETRY] Connecting to ISWK Campus Sensors (23.59° N, 58.54° E)...',
      '[WORLDS] Mapping 6 Future Sectors: AI, Bio, Climate, Energy, Cities, Space...',
      '[SECURITY] Verifying Student Eco Credentials & Database...',
      '[ONLINE] System Active. Welcome to Future World 2026.'
    ];

    let currentStep = 0;
    const logInterval = setInterval(() => {
      if (currentStep < logs.length) {
        const nextLog = logs[currentStep];
        setBootLogs((prev) => [...prev, nextLog]);
        playSound('blip');
        currentStep++;
      } else {
        clearInterval(logInterval);
      }
    }, 280);

    const startTime = Date.now();
    const duration = 1600;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setBootProgress(progress);

      if (progress >= 100) {
        clearInterval(progressInterval);
        playSound('enter');
        setTimeout(() => {
          onEnter();
        }, 350);
      }
    }, 25);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#060913] text-white flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden font-body">
      {/* Background Cyber Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(94, 242, 255, 0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(94, 242, 255, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Atmospheric Glowing Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Top HUD Bar */}
      <div className="relative z-10 flex items-center justify-between text-xs font-mono tracking-wider">
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-bold">STAI</span>
          <span className="text-slate-600">//</span>
          <span className="text-white font-semibold">2026</span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">VERDE TECH PORTAL</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSound}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-cyan-400 transition-all text-xs"
            title={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">AUDIO ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline text-slate-500">MUTED</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <span className="text-emerald-400 font-semibold hidden sm:inline">SYS.STATUS — {isBooting ? 'BOOTING' : 'STANDBY'}</span>
          </div>
        </div>
      </div>

      {/* Centerpiece Content */}
      <div className="relative z-10 my-auto text-center max-w-4xl mx-auto px-4 py-8">
        {!isBooting ? (
          <div className="space-y-6 sm:space-y-8 animate-fadeIn">
            {/* Kicker */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-400/30 text-cyan-300 text-xs sm:text-sm font-mono tracking-widest uppercase shadow-[0_0_20px_rgba(94,242,255,0.15)]">
              <span>ISWK</span>
              <span className="text-cyan-500">•</span>
              <span>Science</span>
              <span className="text-slate-500">•</span>
              <span>Technology</span>
              <span className="text-slate-500">•</span>
              <span>Innovation</span>
            </div>

            {/* Giant Future World Headline */}
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-display tracking-tight leading-none">
              <span className="block text-white drop-shadow-[0_0_35px_rgba(94,242,255,0.45)]">
                FUTURE
              </span>
              <span 
                className="block text-transparent"
                style={{
                  WebkitTextStroke: '2px #5ef2ff',
                  textShadow: '0 0 30px rgba(94, 242, 255, 0.4)'
                }}
              >
                WORLD
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-2xl text-slate-300 font-light max-w-xl mx-auto leading-relaxed">
              The future isn't something we wait for.<br />
              <em className="text-cyan-300 font-normal not-italic drop-shadow-[0_0_12px_rgba(94,242,255,0.3)]">
                It's something we create.
              </em>
            </p>

            {/* Enter Button */}
            <div className="pt-4">
              <button
                onClick={startBootSequence}
                className="group relative inline-flex items-center gap-3 px-8 sm:px-12 py-4 rounded-full bg-gradient-to-r from-cyan-400 via-teal-300 to-violet-400 text-slate-950 font-display font-extrabold text-base sm:text-lg tracking-wider uppercase shadow-[0_0_35px_rgba(94,242,255,0.5)] hover:shadow-[0_0_60px_rgba(94,242,255,0.8)] hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <span>Enter the Future</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Hint */}
            <p className="text-xs font-mono text-slate-500 pt-2">
              Press <kbd className="px-2 py-0.5 rounded bg-white/10 text-cyan-300 border border-white/10">Enter</kbd> or click to begin
            </p>
          </div>
        ) : (
          /* Cyber Boot Sequence Terminal */
          <div className="space-y-6 max-w-xl mx-auto bg-black/70 border border-cyan-400/40 p-6 sm:p-8 rounded-2xl shadow-[0_0_50px_rgba(94,242,255,0.25)] text-left backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold">
                <Terminal className="w-4 h-4" />
                <span>SYS.BOOT SEQUENCE // INITIALIZING</span>
              </div>
              <span className="text-2xl font-mono font-black text-cyan-300 tabular-nums">
                {String(bootProgress).padStart(3, '0')}%
              </span>
            </div>

            {/* Glowing Segmented Progress Bar */}
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-cyan-500/30">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-violet-400 rounded-full transition-all duration-75 shadow-[0_0_15px_#5ef2ff]"
                style={{ width: `${bootProgress}%` }}
              />
            </div>

            {/* Terminal Logs */}
            <div className="min-h-[110px] space-y-1.5 font-mono text-xs text-slate-300">
              {bootLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-cyan-400 shrink-0">›</span>
                  <span className={index === bootLogs.length - 1 ? 'text-white font-semibold' : 'text-slate-400'}>
                    {log}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">
                VERDE TECH KERNEL v2.6.0 · ISWK MUSCAT
              </span>
              <button
                onClick={onEnter}
                className="text-xs font-mono text-cyan-400 hover:text-white underline underline-offset-4"
              >
                Skip Boot ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom HUD Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400">23.59° N</span>
          <span className="text-slate-600">//</span>
          <span className="text-cyan-400">58.54° E</span>
          <span className="text-slate-500 hidden sm:inline">(Muscat, Oman)</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500 hidden md:inline">LOCAL NODE TIME:</span>
          <span className="text-cyan-300 font-bold tabular-nums text-sm">{currentTime}</span>
        </div>
      </div>
    </div>
  );
};
