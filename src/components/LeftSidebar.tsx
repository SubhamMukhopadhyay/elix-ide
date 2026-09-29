import React from 'react';
import { 
  Home, 
  Files, 
  GitBranch, 
  Target, 
  Trophy, 
  Briefcase, 
  History, 
  Boxes, 
  FolderPlus, 
  Settings,
  HelpCircle
} from 'lucide-react';

interface LeftSidebarProps {
  activeView: string;
  onSelectView: (view: any) => void;
  onOpenTimeMachine: () => void;
  onOpenSettings: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeView,
  onSelectView,
  onOpenTimeMachine,
  onOpenSettings
}) => {
  return (
    <aside className="w-12 bg-elix-900 border-r border-elix-border flex flex-col items-center py-3 justify-between select-none z-20">
      {/* Top Main Navigation icons */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => onSelectView('home')}
          title="Home & New Project"
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            activeView === 'home'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <Home size={18} />
        </button>

        <button
          onClick={() => onSelectView('editor')}
          title="Code Explorer & Workspace"
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            activeView === 'editor'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <Files size={18} />
        </button>

        <button
          onClick={() => onSelectView('practice')}
          title="Practice & Career Hub (DSA, Core CS, Interviews)"
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            activeView === 'practice'
              ? 'bg-violet-500/20 text-violet-400 border border-violet-500/40 shadow-sm shadow-violet-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <Target size={18} />
        </button>

        <button
          onClick={() => onSelectView('hackathon')}
          title="Hackathon Hub & Sprints"
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            activeView === 'hackathon'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm shadow-amber-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <Trophy size={18} />
        </button>

        <button
          onClick={() => onSelectView('career')}
          title="Career & Skills Dashboard"
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            activeView === 'career'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <Briefcase size={18} />
        </button>

        <div className="w-6 h-[1px] bg-slate-800 my-1" />

        <button
          onClick={onOpenTimeMachine}
          title="Project Time Machine & Snapshots"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-all"
        >
          <History size={18} />
        </button>

        <button
          onClick={() => onSelectView('environments')}
          title="Universal Environments & Runtimes"
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            activeView === 'environments'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <Boxes size={18} />
        </button>
      </div>

      {/* Bottom Settings icon */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={onOpenSettings}
          title="Settings & Integrations"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-all"
        >
          <Settings size={18} />
        </button>
      </div>
    </aside>
  );
};
