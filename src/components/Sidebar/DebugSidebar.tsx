import React from 'react';
import { Play, Bug, ChevronDown, ChevronRight, Settings, Plus } from 'lucide-react';
import { ProjectMetadata } from '../../types';

interface DebugSidebarProps {
  activeProject: ProjectMetadata | null;
  onRun: () => void;
  isRunning?: boolean;
}

export const DebugSidebar: React.FC<DebugSidebarProps> = ({ activeProject, onRun, isRunning }) => {
  return (
    <div className="w-full bg-[var(--ide-sidebar-bg)] border-r border-[var(--ide-border)] flex flex-col h-full select-none text-[var(--ide-text)] font-sans">
      <div className="p-3 border-b border-[var(--ide-border)] flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ide-text-muted)]">Run and Debug</span>
        <button
          className="p-1 hover:bg-[var(--ide-hover-bg)] rounded text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]"
          title="Configure launch.json"
        >
          <Settings size={13} />
        </button>
      </div>

      <div className="p-3 border-b border-[var(--ide-border)] space-y-3">
        <button
          onClick={onRun}
          disabled={isRunning}
          className="w-full py-2 bg-[#007acc] hover:bg-[#0062a3] text-white rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Play size={13} fill="currentColor" />
          <span>{isRunning ? 'Running...' : 'Run and Debug (F5)'}</span>
        </button>

        <p className="text-[11px] text-[var(--ide-text-muted)]">
          To customize Run and Debug, create a <span className="text-[#007acc] hover:underline cursor-pointer">launch.json</span> file in your workspace.
        </p>
      </div>

      {/* Accordion sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Variables Section */}
        <div className="border-b border-[var(--ide-border)]">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--ide-bg)] text-xs font-semibold text-[var(--ide-text-muted)] cursor-pointer hover:text-[var(--ide-text)]">
            <ChevronDown size={13} />
            <span>VARIABLES</span>
          </div>
          <div className="px-5 py-2 text-[11px] text-[var(--ide-text-muted)]">
            No variables available (pause on breakpoint to view)
          </div>
        </div>

        {/* Watch Section */}
        <div className="border-b border-[var(--ide-border)]">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--ide-bg)] text-xs font-semibold text-[var(--ide-text-muted)] cursor-pointer hover:text-[var(--ide-text)]">
            <div className="flex items-center gap-1.5">
              <ChevronDown size={13} />
              <span>WATCH</span>
            </div>
            <button className="hover:text-[var(--ide-text)]">
              <Plus size={12} />
            </button>
          </div>
          <div className="px-5 py-2 text-[11px] text-[var(--ide-text-muted)]">
            No watch expressions
          </div>
        </div>

        {/* Call Stack Section */}
        <div className="border-b border-[var(--ide-border)]">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--ide-bg)] text-xs font-semibold text-[var(--ide-text-muted)] cursor-pointer hover:text-[var(--ide-text)]">
            <ChevronDown size={13} />
            <span>CALL STACK</span>
          </div>
          <div className="px-5 py-2 text-[11px] text-[var(--ide-text-muted)]">
            {isRunning ? 'Execution active: Local Runtime thread' : 'Not debugging'}
          </div>
        </div>

        {/* Breakpoints Section */}
        <div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--ide-bg)] text-xs font-semibold text-[var(--ide-text-muted)] cursor-pointer hover:text-[var(--ide-text)]">
            <ChevronDown size={13} />
            <span>BREAKPOINTS</span>
          </div>
          <div className="px-5 py-2 text-[11px] text-[var(--ide-text-muted)] space-y-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-[#007acc]" />
              <span>Uncaught Exceptions</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded text-[#007acc]" />
              <span>All Exceptions</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
