import React, { useEffect, useState } from 'react';
import { Sparkles, Terminal, Cpu } from 'lucide-react';

interface StartupAnimationProps {
  onComplete: () => void;
}

export const StartupAnimation: React.FC<StartupAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'intro' | 'glow' | 'fade'>('intro');

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('glow'), 500);
    const timer2 = setTimeout(() => setPhase('fade'), 1400);
    const timer3 = setTimeout(() => onComplete(), 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div 
      onClick={onComplete}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-elix-950 transition-opacity duration-500 cursor-pointer ${
        phase === 'fade' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background ambient lighting */}
      <div className="absolute w-96 h-96 rounded-full bg-cyan-500/10 blur-[100px] animate-pulse-subtle" />
      <div className="absolute w-80 h-80 rounded-full bg-violet-600/10 blur-[120px] -translate-x-12 translate-y-12" />

      {/* Center Logo Emblem */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 p-[1.5px] shadow-2xl shadow-cyan-500/30">
            <div className="w-full h-full bg-elix-950 rounded-2xl flex items-center justify-center overflow-hidden">
              <span className="text-4xl font-extrabold bg-gradient-to-br from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-transparent tracking-tighter">
                ELIX
              </span>
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
          ELIX IDE <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">v1.0</span>
        </h1>
        <p className="text-slate-400 text-xs tracking-wider uppercase font-medium">
          Universal Development Environment & Career Platform
        </p>

        {/* Loading Progress Bar */}
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden mt-6">
          <div className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 animate-[pulse_1s_infinite] w-full" />
        </div>

        <span className="text-[10px] text-slate-500 mt-4">Click anywhere to skip</span>
      </div>
    </div>
  );
};
