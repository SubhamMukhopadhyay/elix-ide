import React, { useState, useRef, useEffect } from 'react';
import { 
  Files, 
  Search, 
  GitBranch, 
  PlayCircle, 
  Target, 
  Trophy, 
  Briefcase, 
  Boxes, 
  Settings, 
  Sparkles, 
  History,
  User,
  Check,
  ShieldCheck,
  ExternalLink,
  Sliders,
  Keyboard,
  Palette,
  Terminal,
  Info,
  X,
  Key,
  Loader2,
  ChevronRight,
  Clipboard
} from 'lucide-react';

import { AboutModal } from '../Settings/AboutModal';
import { ElixLogo } from '../Common/ElixLogo';

const GithubIcon: React.FC<{ size?: number; className?: string }> = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export interface GithubUserProfile {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  public_repos?: number;
}

interface ActivityBarProps {
  activeView: string;
  onSelectView: (view: string) => void;
  uncommittedChangesCount?: number;
  practiceStreak?: number;
  onOpenSettings: (category?: string) => void;
  onOpenThemePicker?: (mode: 'color' | 'file-icon' | 'product-icon') => void;
  onOpenSearch?: (initialQuery?: string) => void;
  onOpenTimeMachine: () => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeView,
  onSelectView,
  uncommittedChangesCount = 0,
  practiceStreak = 1,
  onOpenSettings,
  onOpenThemePicker,
  onOpenSearch,
  onOpenTimeMachine
}) => {
  const [showAccountsPopover, setShowAccountsPopover] = useState<boolean>(false);
  const [showGearPopover, setShowGearPopover] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [showThemesSubmenu, setShowThemesSubmenu] = useState<boolean>(false);
  const [githubUser, setGithubUser] = useState<GithubUserProfile | null>(() => {
    try {
      const raw = localStorage.getItem('elix_github_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [showGithubModal, setShowGithubModal] = useState<boolean>(false);
  const [tokenInput, setTokenInput] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isWaitingBrowserAuth, setIsWaitingBrowserAuth] = useState<boolean>(false);
  const [showManualToken, setShowManualToken] = useState<boolean>(false);
  const [detectedAccount, setDetectedAccount] = useState<{ username: string; token: string } | null>(null);
  const accountsRef = useRef<HTMLDivElement>(null);
  const gearRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showGithubModal && !githubUser) {
      window.elix?.getGithubCredential?.().then(cred => {
        if (cred && cred.username) {
          setDetectedAccount(cred);
        }
      }).catch(() => {});
    }
  }, [showGithubModal, githubUser]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountsRef.current && !accountsRef.current.contains(e.target as Node)) {
        setShowAccountsPopover(false);
      }
      if (gearRef.current && !gearRef.current.contains(e.target as Node)) {
        setShowGearPopover(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const verifyAndSaveToken = async (token: string): Promise<boolean> => {
    setIsVerifying(true);
    setTokenError(null);
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          Accept: 'application/vnd.github.v3+json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const profile: GithubUserProfile = {
          login: data.login,
          name: data.name || data.login,
          avatar_url: data.avatar_url,
          html_url: data.html_url,
          public_repos: data.public_repos
        };
        localStorage.setItem('elix_github_user', JSON.stringify(profile));
        localStorage.setItem('elix_github_token', token.trim());
        setGithubUser(profile);
        setShowGithubModal(false);
        setTokenInput('');
        setIsWaitingBrowserAuth(false);
        window.dispatchEvent(new CustomEvent('elix-github-changed', { detail: profile }));
        return true;
      } else {
        setTokenError('Invalid GitHub token or insufficient permissions.');
        return false;
      }
    } catch (err: any) {
      setTokenError(`Connection failed: ${err.message || 'Network error'}`);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  // Auto-listen to clipboard when modal is open and waiting for browser authorization
  useEffect(() => {
    if (!showGithubModal || !isWaitingBrowserAuth) return;

    let intervalId: any;
    const checkClipboardForToken = async () => {
      try {
        const text = await window.elix?.getClipboardText?.();
        if (text && (text.startsWith('ghp_') || text.startsWith('github_pat_'))) {
          if (text.trim() !== tokenInput.trim()) {
            setTokenInput(text.trim());
            await verifyAndSaveToken(text.trim());
          }
        }
      } catch {}
    };

    intervalId = setInterval(checkClipboardForToken, 1200);

    const onFocus = () => {
      checkClipboardForToken();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [showGithubModal, isWaitingBrowserAuth, tokenInput]);

  const handleLaunchBrowserAuth = async () => {
    setIsVerifying(true);
    setTokenError(null);

    // 1. Try 1-click Windows / Git Credential Manager parity (just like VS Code)
    try {
      if (detectedAccount && detectedAccount.token) {
        const success = await verifyAndSaveToken(detectedAccount.token);
        if (success) {
          setIsVerifying(false);
          return;
        }
      }

      const cred = await window.elix?.getGithubCredential?.();
      if (cred && cred.token) {
        const success = await verifyAndSaveToken(cred.token);
        if (success) {
          setIsVerifying(false);
          return;
        }
      }
    } catch (e: any) {
      console.warn('Git credential lookup fallback:', e);
    }

    // 2. Fallback to browser if no credentials saved in Windows
    setIsVerifying(false);
    setIsWaitingBrowserAuth(true);
    window.elix?.openExternal?.('https://github.com/settings/tokens/new?scopes=repo,read:user,workflow&description=Elix%20IDE');
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await window.elix?.getClipboardText?.();
      if (text && (text.startsWith('ghp_') || text.startsWith('github_pat_'))) {
        setTokenInput(text.trim());
        await verifyAndSaveToken(text.trim());
      } else if (text) {
        setTokenInput(text.trim());
      }
    } catch {}
  };

  const handleConnectGithub = async () => {
    if (!tokenInput.trim()) return;
    await verifyAndSaveToken(tokenInput);
  };

  const handleDisconnectGithub = () => {
    localStorage.removeItem('elix_github_user');
    localStorage.removeItem('elix_github_token');
    setGithubUser(null);
    window.dispatchEvent(new CustomEvent('elix-github-changed', { detail: null }));
  };

  return (
    <div className="w-[48px] bg-[var(--ide-activity-bg)] border-r border-[var(--ide-border)] flex flex-col justify-between items-center py-2 select-none z-30">
      {/* Top Main Navigation items (Standard VS Code + Integrated Elix Hubs) */}
      <div className="flex flex-col items-center gap-1 w-full">
        {/* Explorer */}
        <button
          onClick={() => onSelectView('explorer')}
          title="Explorer (Ctrl+Shift+E)"
          className={`w-full h-11 flex items-center justify-center relative transition-colors ${
            activeView === 'explorer'
              ? 'text-[var(--ide-text)] border-l-2 border-[var(--ide-text)]'
              : 'text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]'
          }`}
        >
          <Files size={22} strokeWidth={1.5} />
        </button>

        {/* Search */}
        <button
          onClick={() => onSelectView('search')}
          title="Search in Files (Ctrl+Shift+F)"
          className={`w-full h-11 flex items-center justify-center relative transition-colors ${
            activeView === 'search'
              ? 'text-[var(--ide-text)] border-l-2 border-[var(--ide-text)]'
              : 'text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]'
          }`}
        >
          <Search size={22} strokeWidth={1.5} />
        </button>

        {/* Source Control / Git */}
        <button
          onClick={() => onSelectView('git')}
          title="Source Control (Ctrl+Shift+G)"
          className={`w-full h-11 flex items-center justify-center relative transition-colors ${
            activeView === 'git'
              ? 'text-[var(--ide-text)] border-l-2 border-[var(--ide-text)]'
              : 'text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]'
          }`}
        >
          <GitBranch size={22} strokeWidth={1.5} />
          {uncommittedChangesCount > 0 && (
            <span className="absolute top-2 right-2 px-1 bg-[#007acc] text-white text-[9px] font-bold rounded-full">
              {uncommittedChangesCount}
            </span>
          )}
        </button>

        {/* Run & Debug */}
        <button
          onClick={() => onSelectView('debug')}
          title="Run & Debug (Ctrl+Shift+D)"
          className={`w-full h-11 flex items-center justify-center relative transition-colors ${
            activeView === 'debug'
              ? 'text-[var(--ide-text)] border-l-2 border-[var(--ide-text)]'
              : 'text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]'
          }`}
        >
          <PlayCircle size={22} strokeWidth={1.5} />
        </button>

        <div className="w-6 h-[1px] bg-[var(--ide-border)] my-1" />

        {/* Practice & DSA Hub */}
        <button
          onClick={() => onSelectView('practice')}
          title="Practice & Career: DSA, Core CS, Interview Prep"
          className={`w-full h-11 flex items-center justify-center relative transition-colors ${
            activeView === 'practice'
              ? 'text-violet-400 border-l-2 border-violet-400'
              : 'text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]'
          }`}
        >
          <Target size={22} strokeWidth={1.5} />
          {practiceStreak > 0 && (
            <span className="absolute bottom-1 right-2 text-[9px] font-bold text-amber-400">
              🔥{practiceStreak}
            </span>
          )}
        </button>

        {/* Hackathons */}
        <button
          onClick={() => onSelectView('hackathon')}
          title="Hackathon Sprints & Milestones"
          className={`w-full h-11 flex items-center justify-center relative transition-colors ${
            activeView === 'hackathon'
              ? 'text-amber-400 border-l-2 border-amber-400'
              : 'text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]'
          }`}
        >
          <Trophy size={21} strokeWidth={1.5} />
        </button>

        {/* Career Dashboard */}
        <button
          onClick={() => onSelectView('career')}
          title="Developer Career & Analytics"
          className={`w-full h-11 flex items-center justify-center relative transition-colors ${
            activeView === 'career'
              ? 'text-emerald-400 border-l-2 border-emerald-400'
              : 'text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]'
          }`}
        >
          <Briefcase size={21} strokeWidth={1.5} />
        </button>

        {/* Time Machine */}
        <button
          onClick={onOpenTimeMachine}
          title="Project Time Machine & Snapshots"
          className="w-full h-11 flex items-center justify-center text-[var(--ide-text-muted)] hover:text-[var(--ide-text)] transition-colors"
        >
          <History size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* Bottom Actions: Environments, Accounts, Settings */}
      <div className="flex flex-col items-center gap-1 w-full relative">
        {/* Environments */}
        <button
          onClick={() => onSelectView('environments')}
          title="Universal Environments & Runtimes"
          className={`w-full h-11 flex items-center justify-center relative transition-colors ${
            activeView === 'environments'
              ? 'text-cyan-400 border-l-2 border-cyan-400'
              : 'text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]'
          }`}
        >
          <Boxes size={21} strokeWidth={1.5} />
        </button>

        {/* Accounts / Profile (VS Code Parity) */}
        <div className="relative w-full" ref={accountsRef}>
          <button
            onClick={() => {
              setShowGearPopover(false);
              setShowAccountsPopover(prev => !prev);
            }}
            title={githubUser ? `GitHub: @${githubUser.login}` : "Accounts & GitHub Sync"}
            className={`w-full h-11 flex items-center justify-center transition-colors relative ${
              showAccountsPopover ? 'text-[var(--ide-text)]' : 'text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]'
            }`}
          >
            {githubUser?.avatar_url ? (
              <div className="relative">
                <img 
                  src={githubUser.avatar_url} 
                  alt={githubUser.login} 
                  className="w-5 h-5 rounded-full border border-[var(--ide-border)]"
                />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5 ring-1 ring-[var(--ide-activity-bg)]" />
              </div>
            ) : (
              <User size={20} strokeWidth={1.5} />
            )}
          </button>

          {showAccountsPopover && (
            <div className="absolute left-[52px] bottom-0 w-72 bg-[var(--ide-sidebar-bg)] border border-[var(--ide-border)] rounded shadow-2xl py-2 z-50 text-[12px] text-[var(--ide-text)] font-sans animate-in fade-in duration-100">
              <div className="px-3 py-1.5 border-b border-[var(--ide-border)] flex items-center justify-between">
                <div className="font-semibold text-[var(--ide-text)] flex items-center gap-1.5">
                  <GithubIcon size={14} className="text-[#007acc]" />
                  <span>GitHub & Accounts</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--ide-hover-bg)] text-[var(--ide-text-muted)] font-mono">
                  v1.0
                </span>
              </div>

              {/* GitHub Connected / Sign In Section */}
              <div className="px-3 py-2 border-b border-[var(--ide-border)]">
                {githubUser ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={githubUser.avatar_url} 
                        alt={githubUser.login} 
                        className="w-8 h-8 rounded-full border border-[var(--ide-border)]"
                      />
                      <div className="truncate">
                        <div className="font-semibold text-[var(--ide-text)] truncate">{githubUser.name}</div>
                        <div className="text-[11px] text-[var(--ide-text-muted)] truncate">@{githubUser.login}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 flex items-center gap-1 font-medium">
                        <Check size={11} /> GitHub Connected
                      </span>
                      {githubUser.public_repos !== undefined && (
                        <span className="text-[var(--ide-text-muted)]">{githubUser.public_repos} repos</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => window.elix?.openExternal(githubUser.html_url)}
                        className="flex-1 py-1 px-2 bg-[var(--ide-input-bg)] hover:bg-[var(--ide-hover-bg)] text-[var(--ide-text)] rounded border border-[var(--ide-border)] text-[11px] flex items-center justify-center gap-1"
                      >
                        <span>Profile</span>
                        <ExternalLink size={10} />
                      </button>
                      <button
                        onClick={handleDisconnectGithub}
                        className="py-1 px-2 text-[#f48771] hover:bg-[#f48771]/10 rounded border border-[#f48771]/30 text-[11px]"
                        title="Disconnect GitHub Account"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-[11px] text-[var(--ide-text-muted)] leading-relaxed">
                      Sign in with GitHub to sync repositories, push & pull code, and sync settings across machines.
                    </div>
                    <button
                      onClick={() => {
                        setShowAccountsPopover(false);
                        setShowGithubModal(true);
                      }}
                      className="w-full py-1.5 px-3 bg-[#238636] hover:bg-[#2ea043] text-white rounded font-medium flex items-center justify-center gap-2 text-xs shadow-sm transition-colors"
                    >
                      <GithubIcon size={14} />
                      <span>Sign in with GitHub</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Developer stats */}
              <div className="px-3 py-2 border-b border-[var(--ide-border)] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[var(--ide-text-muted)]">Settings Sync:</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <Check size={11} /> Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[var(--ide-text-muted)]">Practice Streak:</span>
                  <span className="text-amber-400 font-bold">🔥 {practiceStreak} Days</span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => {
                    setShowAccountsPopover(false);
                    onOpenSettings('sync');
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#007acc] hover:text-white flex items-center justify-between text-[11px]"
                >
                  <span>Sync Settings & Preferences</span>
                  <ExternalLink size={11} className="text-[var(--ide-text-muted)]" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings / Manage Gear (VS Code Parity Frame 2) */}
        <div className="relative w-full" ref={gearRef}>
          <button
            onClick={() => {
              setShowAccountsPopover(false);
              setShowGearPopover(prev => !prev);
            }}
            title="Manage (Settings, Shortcuts, Themes)"
            className={`w-full h-11 flex items-center justify-center transition-colors ${
              showGearPopover ? 'text-[var(--ide-text)]' : 'text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]'
            }`}
          >
            <Settings size={21} strokeWidth={1.5} />
          </button>

          {showGearPopover && (
            <div className="absolute left-[52px] bottom-0 w-60 bg-[var(--ide-sidebar-bg)] border border-[var(--ide-border)] rounded shadow-2xl py-1 z-50 text-[12px] text-[var(--ide-text)] font-sans">
              <button
                onClick={() => {
                  setShowGearPopover(false);
                  onOpenSearch?.('>');
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-[#007acc] hover:text-white flex items-center justify-between"
              >
                <span>Command Palette...</span>
                <span className="text-[10px] text-[var(--ide-text-muted)]">Ctrl+Shift+P</span>
              </button>

              <div className="h-[1px] bg-[var(--ide-border)] my-1" />

              <button
                onClick={() => {
                  setShowGearPopover(false);
                  onOpenSettings();
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-[#007acc] hover:text-white flex items-center justify-between"
              >
                <span>Settings</span>
                <span className="text-[10px] text-[var(--ide-text-muted)]">Ctrl+,</span>
              </button>

              <button
                onClick={() => {
                  setShowGearPopover(false);
                  onOpenSettings('environments');
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-[#007acc] hover:text-white flex items-center justify-between"
              >
                <span>Environments & SDKs</span>
                <span className="text-[10px] text-[var(--ide-text-muted)]">Ctrl+Shift+X</span>
              </button>

              <button
                onClick={() => {
                  setShowGearPopover(false);
                  onOpenSettings('shortcuts');
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-[#007acc] hover:text-white flex items-center justify-between cursor-pointer"
              >
                <span>Keyboard Shortcuts</span>
                <span className="text-[10px] text-[var(--ide-text-muted)]">Ctrl+K Ctrl+S</span>
              </button>

              {/* Themes with flyout submenu */}
              <div 
                className="relative"
                onMouseEnter={() => setShowThemesSubmenu(true)}
                onMouseLeave={() => setShowThemesSubmenu(false)}
              >
                <button
                  onClick={() => setShowThemesSubmenu(prev => !prev)}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#007acc] hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>Themes</span>
                  <ChevronRight size={12} className="text-[var(--ide-text-muted)]" />
                </button>

                {showThemesSubmenu && (
                  <div className="absolute left-full top-0 ml-0.5 w-52 bg-[var(--ide-sidebar-bg)] border border-[var(--ide-border)] rounded-md shadow-2xl py-1 z-50 text-[12px] text-[var(--ide-text)] animate-in fade-in duration-100">
                    <button
                      onClick={() => {
                        setShowThemesSubmenu(false);
                        setShowGearPopover(false);
                        if (onOpenThemePicker) onOpenThemePicker('color');
                        else onOpenSettings('workbench');
                      }}
                      className="w-full px-3 py-1.5 text-left hover:bg-[#007acc] hover:text-white flex items-center justify-between cursor-pointer"
                    >
                      <span>Color Theme</span>
                      <span className="text-[10px] text-[var(--ide-text-muted)]">Ctrl+K Ctrl+T</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowThemesSubmenu(false);
                        setShowGearPopover(false);
                        if (onOpenThemePicker) onOpenThemePicker('file-icon');
                        else onOpenSettings('workbench');
                      }}
                      className="w-full px-3 py-1.5 text-left hover:bg-[#007acc] hover:text-white flex items-center justify-between cursor-pointer"
                    >
                      <span>File Icon Theme</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowThemesSubmenu(false);
                        setShowGearPopover(false);
                        if (onOpenThemePicker) onOpenThemePicker('product-icon');
                        else onOpenSettings('workbench');
                      }}
                      className="w-full px-3 py-1.5 text-left hover:bg-[#007acc] hover:text-white flex items-center justify-between cursor-pointer"
                    >
                      <span>Product Icon Theme</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="h-[1px] bg-[var(--ide-border)] my-1" />

              <button
                onClick={() => {
                  setShowGearPopover(false);
                  onOpenSettings('sync');
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-[#007acc] hover:text-white flex items-center justify-between cursor-pointer"
              >
                <span>Backup and Sync Settings...</span>
              </button>

              <div className="h-[1px] bg-[var(--ide-border)] my-1" />

              <button
                onClick={() => {
                  setShowGearPopover(false);
                  setShowAboutModal(true);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-[#007acc] hover:text-white flex items-center justify-between cursor-pointer"
              >
                <span>About Elix IDE</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* GitHub Authentication Modal (VS Code Parity Flow) */}
      {showGithubModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans"
          onClick={() => {
            setShowGithubModal(false);
            setIsWaitingBrowserAuth(false);
          }}
        >
          <div 
            className="w-full max-w-md bg-[#181a1f] border border-[#2b2d35] rounded-2xl shadow-2xl p-6 text-white space-y-5 animate-in zoom-in-95 duration-150 relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => {
                setShowGithubModal(false);
                setIsWaitingBrowserAuth(false);
              }}
              className="absolute top-4 right-4 p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            {/* VS Code Style Header */}
            <div className="flex flex-col items-center text-center pt-2 pb-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#24292f] border border-neutral-700 flex items-center justify-center text-white shadow-lg">
                  <GithubIcon size={26} />
                </div>
                <span className="text-neutral-500 font-bold text-base select-none">⇄</span>
                <div className="w-12 h-12 rounded-2xl bg-[#0F141C] border border-neutral-700/80 flex items-center justify-center text-white shadow-lg select-none">
                  <ElixLogo size={28} />
                </div>
              </div>
              <h3 className="font-bold text-lg text-white tracking-tight">
                Authorize Elix IDE
              </h3>
              <p className="text-xs text-neutral-400 mt-1.5 max-w-xs leading-relaxed">
                From the options below, choose which account you would like to use to authorize this app.
              </p>
            </div>

            {/* VS Code Primary Account Choice Card */}
            <div className="p-3.5 bg-[#0f1115] border border-neutral-800 hover:border-neutral-700 rounded-xl flex items-center justify-between gap-3 shadow-inner transition-all">
              <div className="flex items-center gap-3 truncate">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm border border-white/20">
                  {detectedAccount?.username ? detectedAccount.username.substring(0, 2).toUpperCase() : 'SM'}
                </div>
                <div className="truncate text-left">
                  <div className="text-[11px] text-neutral-400 font-medium">
                    {detectedAccount ? 'Detected Windows / Git Account' : 'Signed in as'}
                  </div>
                  <div className="text-xs font-semibold text-white truncate">
                    {detectedAccount?.username || 'SubhamMukhopadhyay'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLaunchBrowserAuth}
                disabled={isVerifying}
                className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] active:scale-95 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <Check size={13} />
                  </>
                )}
              </button>
            </div>

            {/* Waiting for Browser Authorization State */}
            {isWaitingBrowserAuth && (
              <div className="p-3.5 bg-[#007acc]/10 border border-[#007acc]/30 rounded-xl text-xs space-y-2 text-left animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-[#4fc1ff] font-semibold">
                  <Loader2 size={14} className="animate-spin shrink-0" />
                  <span>Waiting for browser authorization...</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  In your browser, click the green <strong>"Generate token"</strong> button and copy it. Elix IDE is actively listening to your clipboard and will finish signing in automatically!
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handlePasteFromClipboard}
                    className="px-3 py-1.5 bg-[#007acc] hover:bg-[#0062a3] text-white rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Clipboard size={12} />
                    <span>Paste & Connect</span>
                  </button>
                  <button
                    onClick={handleLaunchBrowserAuth}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-[11px] font-medium transition-colors"
                  >
                    Reopen Browser Tab
                  </button>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-2 text-neutral-600 text-xs">
              <div className="flex-1 h-[1px] bg-neutral-800" />
              <span>or</span>
              <div className="flex-1 h-[1px] bg-neutral-800" />
            </div>

            {/* Manual Token Section Toggle */}
            <div>
              {!showManualToken ? (
                <button
                  onClick={() => setShowManualToken(true)}
                  className="w-full text-center text-xs text-neutral-400 hover:text-white py-1 hover:underline transition-colors"
                >
                  Use a different account or paste a token manually
                </button>
              ) : (
                <div className="space-y-3 p-3 bg-[#0f1115] rounded-xl border border-neutral-800 text-left animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-neutral-300">
                      Personal Access Token (classic or fine-grained)
                    </label>
                    <button
                      onClick={handlePasteFromClipboard}
                      className="text-[10px] text-[#4fc1ff] hover:underline flex items-center gap-1"
                    >
                      <Clipboard size={10} />
                      <span>Paste clipboard</span>
                    </button>
                  </div>
                  <input
                    type="password"
                    value={tokenInput}
                    onChange={e => setTokenInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleConnectGithub()}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-[#1e2026] text-white border border-neutral-700 focus:border-[#007acc] rounded-lg px-3 py-2 text-xs font-mono outline-none"
                    autoFocus
                  />
                  {tokenError && (
                    <div className="text-xs text-[#f48771] flex items-center gap-1">
                      <span>{tokenError}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setShowManualToken(false)}
                      className="text-[11px] text-neutral-400 hover:text-white"
                    >
                      Hide manual token
                    </button>
                    <button
                      onClick={handleConnectGithub}
                      disabled={!tokenInput.trim() || isVerifying}
                      className="px-3.5 py-1.5 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {isVerifying ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      <span>{isVerifying ? 'Verifying...' : 'Connect Token'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* About Elix IDE Modal */}
      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
    </div>
  );
};
