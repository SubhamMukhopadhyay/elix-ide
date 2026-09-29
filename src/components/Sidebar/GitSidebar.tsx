import React, { useState, useEffect } from 'react';
import { GitBranch, Check, Plus, Minus, RefreshCw, FileCode, CheckCircle2, Upload, Download } from 'lucide-react';
import { ProjectMetadata } from '../../types';

interface GitSidebarProps {
  activeProject: ProjectMetadata | null;
  onOpenFile: (path: string, name: string) => void;
}

export const GitSidebar: React.FC<GitSidebarProps> = ({ activeProject, onOpenFile }) => {
  const [branch, setBranch] = useState('main');
  const [commitMessage, setCommitMessage] = useState('');
  const [modifiedFiles, setModifiedFiles] = useState<{ path: string; name: string; status: 'modified' | 'added' | 'untracked' }[]>([]);
  const [stagedFiles, setStagedFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [githubUser, setGithubUser] = useState<any>(() => {
    try {
      const raw = localStorage.getItem('elix_github_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleGithubChange = (e: any) => {
      setGithubUser(e.detail);
    };
    window.addEventListener('elix-github-changed', handleGithubChange);
    return () => window.removeEventListener('elix-github-changed', handleGithubChange);
  }, []);

  useEffect(() => {
    if (activeProject?.path) {
      loadGitStatus();
    }
  }, [activeProject]);

  const loadGitStatus = async () => {
    if (!activeProject?.path || !window.elix) return;
    setIsLoading(true);
    try {
      const status = await window.elix.getGitStatus(activeProject.path);
      if (status) {
        setBranch(status.branch || 'main');
        // Convert status files
        const list = (status.files || []).map((f: any) => ({
          path: typeof f === 'string' ? f : f.path,
          name: (typeof f === 'string' ? f : f.path).split(/[/\\]/).pop() || '',
          status: (f.status || 'modified') as any
        }));
        setModifiedFiles(list);
      }
    } catch (err) {
      console.warn('Git status check:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStageAll = () => {
    setStagedFiles(modifiedFiles.map(f => f.path));
  };

  const handleCommit = async () => {
    if (!commitMessage.trim() || !activeProject?.path || !window.elix) return;
    setIsLoading(true);
    try {
      await window.elix.commitGit(activeProject.path, commitMessage.trim());
      setCommitMessage('');
      setCommitSuccess(true);
      setTimeout(() => setCommitSuccess(false), 2500);
      loadGitStatus();
    } catch (err) {
      console.error('Git commit error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePush = async () => {
    if (!activeProject?.path || !window.elix) return;
    setIsLoading(true);
    setSyncFeedback(null);
    try {
      const res = await window.elix.pushGit(activeProject.path);
      if (res.success) {
        setSyncFeedback('Pushed to remote successfully!');
      } else {
        setSyncFeedback(`Push: ${res.error || 'Check remote origin'}`);
      }
      setTimeout(() => setSyncFeedback(null), 4000);
      loadGitStatus();
    } catch (err: any) {
      setSyncFeedback(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePull = async () => {
    if (!activeProject?.path || !window.elix) return;
    setIsLoading(true);
    setSyncFeedback(null);
    try {
      const res = await window.elix.pullGit(activeProject.path);
      if (res.success) {
        setSyncFeedback('Pulled latest changes from remote!');
      } else {
        setSyncFeedback(`Pull: ${res.error || 'Check remote origin'}`);
      }
      setTimeout(() => setSyncFeedback(null), 4000);
      loadGitStatus();
    } catch (err: any) {
      setSyncFeedback(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-[var(--ide-sidebar-bg)] border-r border-[var(--ide-border)] flex flex-col h-full select-none text-[var(--ide-text)] font-sans">
      <div className="p-3 border-b border-[var(--ide-border)] flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ide-text-muted)]">Source Control</span>
          {githubUser && (
            <div className="text-[10px] text-emerald-400 font-medium">@{githubUser.login}</div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={loadGitStatus}
            className="p-1 hover:bg-[var(--ide-hover-bg)] rounded text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]"
            title="Refresh Git Status"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="p-3 border-b border-[var(--ide-border)] space-y-2">
        {/* Branch status indicator */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--ide-text-muted)]">
          <GitBranch size={13} className="text-[#007acc]" />
          <span>Branch: <strong className="text-[var(--ide-text)]">{branch}</strong></span>
        </div>

        {/* Commit Message Box */}
        <textarea
          value={commitMessage}
          onChange={e => setCommitMessage(e.target.value)}
          placeholder="Message (Ctrl+Enter to commit)"
          rows={3}
          className="w-full bg-[var(--ide-input-bg)] text-[var(--ide-text)] text-xs p-2 rounded resize-none focus:outline-none focus:ring-1 focus:ring-[#007acc] placeholder-[var(--ide-text-muted)] border border-[var(--ide-border)]"
          onKeyDown={e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              handleCommit();
            }
          }}
        />

        {/* Commit Button */}
        <button
          onClick={handleCommit}
          disabled={!commitMessage.trim() || isLoading}
          className={`w-full py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            commitMessage.trim()
              ? 'bg-[#007acc] hover:bg-[#0062a3] text-white'
              : 'bg-[var(--ide-hover-bg)] text-[var(--ide-text-muted)] cursor-not-allowed'
          }`}
        >
          <Check size={13} />
          <span>Commit</span>
        </button>

        {/* Push & Pull Buttons */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            onClick={handlePush}
            disabled={isLoading || !activeProject?.path}
            className="py-1 px-2 rounded text-[11px] font-medium bg-[var(--ide-input-bg)] hover:bg-[var(--ide-hover-bg)] text-[var(--ide-text)] border border-[var(--ide-border)] flex items-center justify-center gap-1 transition-colors"
            title="Push commits to remote (git push)"
          >
            <Upload size={12} className="text-[#007acc]" />
            <span>Push</span>
          </button>
          <button
            onClick={handlePull}
            disabled={isLoading || !activeProject?.path}
            className="py-1 px-2 rounded text-[11px] font-medium bg-[var(--ide-input-bg)] hover:bg-[var(--ide-hover-bg)] text-[var(--ide-text)] border border-[var(--ide-border)] flex items-center justify-center gap-1 transition-colors"
            title="Pull commits from remote (git pull)"
          >
            <Download size={12} className="text-emerald-400" />
            <span>Pull</span>
          </button>
        </div>

        {syncFeedback && (
          <div className="text-[10px] text-[var(--ide-text)] bg-[var(--ide-hover-bg)] border border-[var(--ide-border)] px-2 py-1 rounded text-center truncate">
            {syncFeedback}
          </div>
        )}

        {commitSuccess && (
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 justify-center py-0.5">
            <CheckCircle2 size={12} />
            <span>Changes committed successfully!</span>
          </div>
        )}
      </div>

      {/* Changes list */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex items-center justify-between text-xs text-[var(--ide-text-muted)] px-1 py-1">
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            Changes ({modifiedFiles.length})
          </span>
          {modifiedFiles.length > 0 && (
            <button
              onClick={handleStageAll}
              className="text-[10px] text-[#007acc] hover:underline"
            >
              Stage All
            </button>
          )}
        </div>

        {modifiedFiles.length === 0 ? (
          <div className="text-xs text-[var(--ide-text-muted)] text-center py-6">
            Working tree clean. No changes detected.
          </div>
        ) : (
          <div className="space-y-0.5 mt-1">
            {modifiedFiles.map(file => (
              <div
                key={file.path}
                onClick={() => onOpenFile(file.path, file.name)}
                className="flex items-center gap-1.5 px-2 py-1 hover:bg-[var(--ide-hover-bg)] rounded cursor-pointer text-xs group"
              >
                <FileCode size={13} className="text-[var(--ide-text-muted)] group-hover:text-[#007acc]" />
                <span className="text-[var(--ide-text)] truncate">{file.name}</span>
                <span className="text-[10px] font-mono ml-auto text-amber-400">M</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
