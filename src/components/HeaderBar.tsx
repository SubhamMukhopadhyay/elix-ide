import React from 'react';
import { 
  Play, 
  Square, 
  RotateCw, 
  Search, 
  Wifi, 
  HardDrive, 
  WifiOff, 
  Minus, 
  Square as MaximizeSquare, 
  X,
  Code2,
  Target,
  Trophy,
  Briefcase,
  Boxes,
  Sparkles
} from 'lucide-react';
import { ConnectionState, ProjectMetadata } from '../types';

interface HeaderBarProps {
  activeProject: ProjectMetadata | null;
  activeView: 'home' | 'editor' | 'practice' | 'hackathon' | 'career' | 'environments';
  onSelectView: (view: 'home' | 'editor' | 'practice' | 'hackathon' | 'career' | 'environments') => void;
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
  onRestart: () => void;
  connectionState: ConnectionState;
  onToggleConnectionState: () => void;
  onOpenSearch: () => void;
  isAiOpen: boolean;
  onToggleAi: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  activeProject,
  activeView,
  onSelectView,
  isRunning,
  onRun,
  onStop,
  onRestart,
  connectionState,
  onToggleConnectionState,
  onOpenSearch,
  isAiOpen,
  onToggleAi
}) => {
  return (
    <header className="h-11 bg-elix-900 border-b border-elix-border flex items-center justify-between px-3 select-none z-30 [app-region:drag]">
      {/* Left: Brand & View Navigation */}
      <div className="flex items-center gap-3 [app-region:no-drag]">
        <div 
          onClick={() => onSelectView('home')}
          className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-400 to-violet-600 flex items-center justify-center font-bold text-xs text-white shadow-sm">
            E
          </div>
          <span className="font-bold text-sm bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            ELIX
          </span>
        </div>

        {/* View Switchers */}
        <nav className="flex items-center gap-1 ml-2 bg-elix-950/60 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => onSelectView('editor')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              activeView === 'editor' 
                ? 'bg-cyan-500/20 text-cyan-300 font-medium shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 size={13} />
            <span>Code</span>
          </button>

          <button
            onClick={() => onSelectView('practice')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              activeView === 'practice' 
                ? 'bg-violet-500/20 text-violet-300 font-medium shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target size={13} />
            <span>Practice & DSA</span>
          </button>

          <button
            onClick={() => onSelectView('hackathon')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              activeView === 'hackathon' 
                ? 'bg-amber-500/20 text-amber-300 font-medium shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy size={13} />
            <span>Hackathons</span>
          </button>

          <button
            onClick={() => onSelectView('career')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              activeView === 'career' 
                ? 'bg-emerald-500/20 text-emerald-300 font-medium shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase size={13} />
            <span>Career</span>
          </button>
        </nav>
      </div>

      {/* Center: Universal Search & Run Controls */}
      <div className="flex items-center gap-3 [app-region:no-drag]">
        {/* Universal Search trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 bg-elix-950/70 border border-slate-800 hover:border-slate-700 text-slate-400 px-3 py-1 rounded-md text-xs transition-colors w-56 justify-between"
        >
          <div className="flex items-center gap-2">
            <Search size={12} className="text-slate-500" />
            <span className="truncate">
              {activeProject ? activeProject.name : 'Search projects, DSA, tools...'}
            </span>
          </div>
          <kbd className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Ctrl K</kbd>
        </button>

        {/* Execution Controls */}
        <div className="flex items-center gap-1 bg-elix-950/80 p-0.5 rounded-lg border border-slate-800">
          {!isRunning ? (
            <button
              onClick={onRun}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded text-xs font-medium shadow-sm transition-all active:scale-95"
            >
              <Play size={12} fill="white" />
              <span>Run</span>
            </button>
          ) : (
            <button
              onClick={onStop}
              className="flex items-center gap-1.5 px-3 py-1 bg-rose-600/90 hover:bg-rose-500 text-white rounded text-xs font-medium shadow-sm transition-all active:scale-95 animate-pulse"
            >
              <Square size={12} fill="white" />
              <span>Stop</span>
            </button>
          )}

          <button
            onClick={onRestart}
            title="Restart execution"
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            <RotateCw size={13} />
          </button>
        </div>
      </div>

      {/* Right: State Badges, AI Toggle & Window Controls */}
      <div className="flex items-center gap-2 [app-region:no-drag]">
        {/* Connection State Badge (Click to toggle for testing online/local/offline) */}
        <button
          onClick={onToggleConnectionState}
          title="Click to cycle Online / Local / Offline modes"
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
            connectionState === 'online'
              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
              : connectionState === 'local'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}
        >
          {connectionState === 'online' && <Wifi size={11} />}
          {connectionState === 'local' && <HardDrive size={11} />}
          {connectionState === 'offline' && <WifiOff size={11} />}
          <span className="capitalize">{connectionState}</span>
        </button>

        {/* Environments Modal shortcut */}
        <button
          onClick={() => onSelectView('environments')}
          title="Environments & Runtimes"
          className={`p-1.5 rounded-md text-xs transition-colors ${
            activeView === 'environments'
              ? 'bg-slate-800 text-cyan-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Boxes size={15} />
        </button>

        {/* AI Agent Drawer Button */}
        <button
          onClick={onToggleAi}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
            isAiOpen
              ? 'bg-violet-600/30 text-violet-300 border-violet-500/40 shadow-sm'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
          }`}
        >
          <Sparkles size={12} className="text-violet-400" />
          <span>AI Agent</span>
        </button>

        {/* Window action buttons */}
        <div className="flex items-center ml-2 border-l border-slate-800 pl-2">
          <button 
            onClick={() => window.elix?.minimize()}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:bg-slate-800 rounded transition-colors"
          >
            <Minus size={13} />
          </button>
          <button 
            onClick={() => window.elix?.maximize()}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:bg-slate-800 rounded transition-colors"
          >
            <MaximizeSquare size={11} />
          </button>
          <button 
            onClick={() => window.elix?.close()}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:bg-rose-600 hover:text-white rounded transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </header>
  );
};
