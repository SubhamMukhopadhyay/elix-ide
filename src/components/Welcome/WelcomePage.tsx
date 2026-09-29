import React from 'react';
import { 
  FolderOpen, 
  FilePlus, 
  GitBranch, 
  Code2, 
  Target, 
  Trophy, 
  Briefcase, 
  Zap, 
  Clock, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { ProjectMetadata, ProjectTemplate } from '../../types';
import { ElixLogo } from '../Common/ElixLogo';

interface WelcomePageProps {
  onOpenFolder: () => void;
  onNewFile: () => void;
  recentProjects: ProjectMetadata[];
  onOpenProject: (project: ProjectMetadata) => void;
  templates: ProjectTemplate[];
  onCreateFromTemplate: (template: ProjectTemplate) => void;
  onSelectPractice: () => void;
  onSelectHackathon: () => void;
  onSelectCareer: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onOpenFolder,
  onNewFile,
  recentProjects,
  onOpenProject,
  templates,
  onCreateFromTemplate,
  onSelectPractice,
  onSelectHackathon,
  onSelectCareer
}) => {
  return (
    <div className="flex-1 overflow-y-auto bg-[var(--ide-bg)] text-[var(--ide-text)] p-10 flex flex-col justify-between w-full max-w-5xl mx-auto select-none transition-colors">
      <div>
        {/* Header */}
        <div className="mb-8 border-b border-[var(--ide-border)] pb-6">
          <div className="flex items-center gap-4 mb-2">
            <ElixLogo size={46} />
            <div>
              <h1 className="text-3xl font-normal text-[var(--ide-text)]">Elix IDE</h1>
              <p className="text-[var(--ide-text-muted)] text-xs mt-0.5">Universal Development Environment & Career Platform</p>
            </div>
          </div>
        </div>

        {/* Two-Column Start / Quick Starts Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column: Start & Recent Workspaces */}
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-[var(--ide-text)] mb-3">Start</h2>
              <div className="space-y-1 text-[13px]">
                <button
                  onClick={onNewFile}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-[var(--ide-hover-bg)] text-[var(--ide-accent)] flex items-center gap-2.5 transition-colors font-medium"
                >
                  <FilePlus size={16} className="text-[var(--ide-accent)]" />
                  <span>New File...</span>
                </button>

                <button
                  onClick={onOpenFolder}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-[var(--ide-hover-bg)] text-[var(--ide-accent)] flex items-center gap-2.5 transition-colors font-medium"
                >
                  <FolderOpen size={16} className="text-[var(--ide-accent)]" />
                  <span>Open Folder...</span>
                </button>
              </div>
            </div>

            {/* Recent Workspaces */}
            <div>
              <h2 className="text-sm font-semibold text-[var(--ide-text)] mb-2 flex items-center gap-1.5">
                <Clock size={14} className="text-[var(--ide-text-muted)]" />
                <span>Recent Workspaces</span>
              </h2>

              {recentProjects.length === 0 ? (
                <p className="text-xs text-[var(--ide-text-muted)] italic px-2">No recent folders yet. Open any folder to get started.</p>
              ) : (
                <div className="space-y-1 text-[12px]">
                  {recentProjects.slice(0, 5).map(proj => (
                    <div
                      key={proj.id}
                      onClick={() => onOpenProject(proj)}
                      className="p-2 rounded hover:bg-[var(--ide-hover-bg)] cursor-pointer flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <span className="font-medium text-[var(--ide-text)] group-hover:text-[var(--ide-accent)] transition-colors block">
                          {proj.name}
                        </span>
                        <span className="text-[11px] text-[var(--ide-text-muted)] truncate block max-w-sm font-mono">
                          {proj.path}
                        </span>
                      </div>
                      <ArrowRight size={13} className="text-[var(--ide-text-muted)] group-hover:text-[var(--ide-accent)] transition-colors" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Practice & Career Shortcuts */}
            <div className="pt-2 border-t border-[var(--ide-border)] space-y-2">
              <h2 className="text-sm font-semibold text-[var(--ide-text)] mb-2">Practice & Career</h2>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={onSelectPractice}
                  className="p-3 rounded-lg bg-[var(--ide-input-bg)] hover:bg-[var(--ide-hover-bg)] border border-[var(--ide-border)] text-left transition-colors"
                >
                  <Target size={16} className="text-violet-500 mb-1" />
                  <div className="font-semibold text-[var(--ide-text)]">DSA & Core CS</div>
                  <div className="text-[11px] text-[var(--ide-text-muted)]">1,300+ LeetCode & GFG Problems</div>
                </button>

                <button
                  onClick={onSelectHackathon}
                  className="p-3 rounded-lg bg-[var(--ide-input-bg)] hover:bg-[var(--ide-hover-bg)] border border-[var(--ide-border)] text-left transition-colors"
                >
                  <Trophy size={16} className="text-amber-500 mb-1" />
                  <div className="font-semibold text-[var(--ide-text)]">Hackathon Sprints</div>
                  <div className="text-[11px] text-[var(--ide-text-muted)]">Task boards & countdowns</div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Universal Ready Templates */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--ide-text)] mb-3">
              Universal Templates (Zero Runtime Setup)
            </h2>
            <div className="space-y-2.5">
              {templates.slice(0, 6).map(tmpl => (
                <div
                  key={tmpl.id}
                  onClick={() => onCreateFromTemplate(tmpl)}
                  className="p-3 rounded-lg bg-[var(--ide-input-bg)] hover:bg-[var(--ide-hover-bg)] border border-[var(--ide-border)] hover:border-[var(--ide-accent)] cursor-pointer transition-all group flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-xs text-[var(--ide-text)] group-hover:text-[var(--ide-accent)] transition-colors">
                        {tmpl.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--ide-bg)] border border-[var(--ide-border)] text-[var(--ide-text-muted)] font-mono">
                        {tmpl.language}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--ide-text-muted)] line-clamp-1">
                      {tmpl.description}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateFromTemplate(tmpl);
                    }}
                    className="px-2.5 py-1 bg-[var(--ide-accent)] hover:opacity-90 text-white text-[11px] rounded font-medium shadow-sm transition-colors"
                  >
                    Create
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-8 border-t border-[var(--ide-border)] flex items-center justify-between text-[11px] text-[var(--ide-text-muted)]">
        <span>Elix Universal Execution Engine: Bundled Node.js, Python 3.12, OpenJDK 17 LTS, C & C++ (GCC/G++).</span>
        <span>Keyboard: Press Ctrl+P anytime to search files or commands.</span>
      </div>
    </div>
  );
};
