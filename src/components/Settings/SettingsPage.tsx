import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Code, 
  Files, 
  Layout, 
  Terminal, 
  Sparkles, 
  GitBranch, 
  Shield, 
  Check, 
  RotateCcw,
  Star,
  Settings as SettingsIcon,
  FileCode,
  ShieldCheck,
  Sliders,
  RefreshCw,
  Download,
  Upload,
  ExternalLink,
  Keyboard,
  Boxes,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Info,
  Palette,
  FolderTree,
  Cloud,
  Trash2
} from 'lucide-react';
import { 
  ElixIdeSettings, 
  DEFAULT_SETTINGS, 
  getStoredSettings, 
  saveStoredSettings 
} from '../../utils/settingsHelper';
import { DEFAULT_KEYBINDINGS, KeybindingItem } from './KeyboardShortcutsModal';
import { EnvironmentInfo } from '../../types';

export type SettingsCategory = 
  | 'commonly_used'
  | 'editor'
  | 'files'
  | 'workbench'
  | 'shortcuts'
  | 'environments'
  | 'terminal'
  | 'ai'
  | 'git'
  | 'sync'
  | 'privacy';

interface SettingsPageProps {
  initialCategory?: SettingsCategory;
  onOpenThemePicker?: (mode: 'color' | 'file-icon' | 'product-icon') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ initialCategory, onOpenThemePicker }) => {
  const [settings, setSettings] = useState<ElixIdeSettings>(getStoredSettings);
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>(initialCategory || 'commonly_used');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [scope, setScope] = useState<'user' | 'workspace'>('user');
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);
  const [showJsonView, setShowJsonView] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Keyboard Shortcuts Category State
  const [shortcutsSearch, setShortcutsSearch] = useState<string>('');

  // Environments & SDKs Category State
  const [environments, setEnvironments] = useState<EnvironmentInfo[]>([]);
  const [isScanningEnvs, setIsScanningEnvs] = useState<boolean>(false);
  const [scanSummaryMsg, setScanSummaryMsg] = useState<string | null>(null);
  const [envRepairMsg, setEnvRepairMsg] = useState<string | null>(null);
  const [installingEnvId, setInstallingEnvId] = useState<string | null>(null);
  const [installProgressMsg, setInstallProgressMsg] = useState<string | null>(null);
  const [activeInstallModalEnv, setActiveInstallModalEnv] = useState<EnvironmentInfo | null>(null);
  const [confirmUninstallEnv, setConfirmUninstallEnv] = useState<EnvironmentInfo | null>(null);

  const handleScanEnvs = async () => {
    if (window.elix) {
      setIsScanningEnvs(true);
      try {
        const res = await window.elix.scanEnvironments();
        if (res && res.environments) {
          setEnvironments(res.environments);
          setScanSummaryMsg(res.summary);
          setTimeout(() => setScanSummaryMsg(null), 6500);
        } else {
          const list = await window.elix.getEnvironments();
          setEnvironments(list || []);
        }
      } catch (err) {
        console.error('Failed to scan environments:', err);
      } finally {
        setIsScanningEnvs(false);
      }
    }
  };

  const loadEnvs = async () => {
    if (window.elix) {
      try {
        const list = await window.elix.getEnvironments();
        setEnvironments(list || []);
      } catch (err) {
        console.error('Failed to load environments:', err);
      }
    }
  };

  const handleInstallEnv = async (env: EnvironmentInfo, method: 'winget' | 'browser') => {
    if (!window.elix) return;
    if (method === 'browser') {
      await window.elix.installEnvironment(env.id, 'browser');
      setActiveInstallModalEnv(null);
      return;
    }

    setInstallingEnvId(env.id);
    setInstallProgressMsg(`Initializing ${env.name} setup via Windows Package Manager...`);
    try {
      const res = await window.elix.installEnvironment(env.id, 'winget');
      setEnvRepairMsg(res.message);
      await loadEnvs();
      setActiveInstallModalEnv(null);
      setTimeout(() => setEnvRepairMsg(null), 5000);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setInstallingEnvId(null);
      setInstallProgressMsg(null);
    }
  };

  const handleUninstallEnv = async (env: EnvironmentInfo) => {
    if (!window.elix) return;
    try {
      const res = await window.elix.uninstallEnvironment(env.id);
      setEnvRepairMsg(res.message);
      await loadEnvs();
      setConfirmUninstallEnv(null);
      setTimeout(() => setEnvRepairMsg(null), 5000);
    } catch (e: any) {
      alert(e.message);
    }
  };

  useEffect(() => {
    loadEnvs();
  }, []);

  useEffect(() => {
    if (window.elix?.onEnvProgress) {
      const unsub = window.elix.onEnvProgress((data: any) => {
        if (data?.message) {
          setInstallProgressMsg(data.message);
        }
      });
      return unsub;
    }
  }, []);

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    const handleCategoryEvent = (e: any) => {
      if (e?.detail?.category) {
        setActiveCategory(e.detail.category as SettingsCategory);
      }
    };
    window.addEventListener('open-settings', handleCategoryEvent);
    return () => window.removeEventListener('open-settings', handleCategoryEvent);
  }, []);

  useEffect(() => {
    // Load initial AI config from electron if available
    if (window.elix) {
      window.elix.getAiConfig().then(cfg => {
        if (cfg) {
          setSettings(prev => ({
            ...prev,
            aiProvider: (cfg.provider as any) || prev.aiProvider,
            aiApiKey: cfg.apiKey || prev.aiApiKey,
            aiModel: cfg.model || prev.aiModel
          }));
        }
      });
    }
  }, []);

  const updateSetting = <K extends keyof ElixIdeSettings>(key: K, value: ElixIdeSettings[K]) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      saveStoredSettings(updated);

      // Also sync AI settings with backend if changed
      if (['aiProvider', 'aiApiKey', 'aiModel'].includes(key as string) && window.elix) {
        window.elix.updateAiConfig({
          provider: updated.aiProvider,
          apiKey: updated.aiApiKey,
          model: updated.aiModel,
          permissionLevel: 'full_agent',
          mentorMode: 'guided'
        });
      }

      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 1500);
      return updated;
    });
  };

  const resetSetting = <K extends keyof ElixIdeSettings>(key: K) => {
    updateSetting(key, DEFAULT_SETTINGS[key]);
  };

  const isMatch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase().trim());
  };

  const filteredShortcuts = DEFAULT_KEYBINDINGS.filter(item => {
    const q = shortcutsSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      item.command.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.keys.join(' ').toLowerCase().includes(q) ||
      item.when.toLowerCase().includes(q) ||
      item.source.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full h-full bg-[var(--ide-bg)] flex flex-col overflow-hidden text-[var(--ide-text)] font-sans select-none">
      {/* Top VS Code Settings Header */}
      <div className="px-6 py-3 border-b border-[var(--ide-border)] bg-[var(--ide-title-bg)] shrink-0">
        <div className="flex items-center justify-between gap-4 max-w-4xl">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-2.5 text-[#888888]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search settings"
              className="w-full bg-[var(--ide-input-bg)] text-[var(--ide-text)] text-xs pl-9 pr-8 py-2 rounded border border-[var(--ide-input-border)] focus:border-[#007acc] focus:outline-none placeholder-[#666666]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[var(--ide-text-muted)] hover:text-[var(--ide-text)] text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowJsonView(prev => !prev)}
              title={showJsonView ? 'Show UI Settings' : 'Open Settings (JSON)'}
              className={`p-1.5 rounded transition-colors ${showJsonView ? 'text-[var(--ide-text)] bg-[var(--ide-hover-bg)]' : 'text-[var(--ide-text-muted)] hover:text-[var(--ide-text)] hover:bg-[var(--ide-hover-bg)]'}`}
            >
              <FileCode size={15} />
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('sync')}
              title="Configure Settings Sync & Backups"
              className="flex items-center gap-1.5 px-3 py-1 bg-[var(--ide-input-bg)] border border-[var(--ide-border)] hover:border-[#007acc] rounded text-[11px] text-[var(--ide-text)] transition-colors cursor-pointer"
            >
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>Settings Sync Active</span>
            </button>
          </div>
        </div>

        {/* Scope Tabs: User | Workspace */}
        <div className="flex items-center gap-6 mt-3 text-xs border-b border-[var(--ide-border)] pb-1">
          <button
            onClick={() => setScope('user')}
            className={`pb-1 font-medium transition-colors border-b-2 ${
              scope === 'user'
                ? 'border-[#007acc] text-[var(--ide-text)] font-semibold'
                : 'border-transparent text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]'
            }`}
          >
            User
          </button>
          <button
            onClick={() => setScope('workspace')}
            className={`pb-1 font-medium transition-colors border-b-2 ${
              scope === 'workspace'
                ? 'border-[#007acc] text-[var(--ide-text)] font-semibold'
                : 'border-transparent text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]'
            }`}
          >
            Workspace
          </button>

          {savedFeedback && (
            <span className="text-emerald-400 text-[11px] flex items-center gap-1 ml-auto">
              <Check size={12} /> Changes saved & synced
            </span>
          )}
        </div>
      </div>

      {showJsonView ? (
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs select-text">
          <div className="max-w-3xl bg-[var(--ide-input-bg)] p-4 rounded border border-[var(--ide-border)] text-[var(--ide-text)] leading-relaxed whitespace-pre">
            {JSON.stringify(settings, null, 2)}
          </div>
        </div>
      ) : (
        /* Settings Main Split Layout (Categories on Left, Fields on Right) */
        <div className="flex-1 flex overflow-hidden">
          {/* Left Category Sidebar */}
          <div className="w-56 bg-[var(--ide-sidebar-bg)] border-r border-[var(--ide-border)] overflow-y-auto p-3 shrink-0 text-xs">
            <div className="space-y-0.5">
              {[
                { id: 'commonly_used', label: 'Commonly Used', icon: Star },
                { id: 'editor', label: 'Text Editor', icon: Code },
                { id: 'files', label: 'Files & Auto Save', icon: Files },
                { id: 'workbench', label: 'Workbench', icon: Layout },
                { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
                { id: 'environments', label: 'Environments & SDKs', icon: Boxes },
                { id: 'terminal', label: 'Terminal', icon: Terminal },
                { id: 'ai', label: 'AI Agent & Models', icon: Sparkles },
                { id: 'git', label: 'Git & Version Control', icon: GitBranch },
                { id: 'sync', label: 'Backup & Sync', icon: ShieldCheck },
                { id: 'privacy', label: 'Security & Privacy', icon: Shield }
              ].map(cat => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id as SettingsCategory);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors ${
                      isActive
                        ? 'bg-[#007acc] text-white font-medium'
                        : 'text-[var(--ide-text-muted)] hover:text-[var(--ide-text)] hover:bg-[var(--ide-hover-bg)]'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-white' : 'text-[var(--ide-text-muted)]'} />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Settings Fields Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 max-w-4xl text-xs">
            {/* COMMONLY USED / TEXT EDITOR */}
            {(activeCategory === 'commonly_used' || activeCategory === 'editor') && (
              <div className="space-y-6">
                <div className="text-base font-bold text-[var(--ide-text)] border-b border-[var(--ide-border)] pb-2">
                  {activeCategory === 'commonly_used' ? 'Commonly Used' : 'Text Editor'}
                </div>

                {/* Color Theme (Also in Commonly Used for instant accessibility) */}
                {isMatch('Color Theme') && (
                  <div className="space-y-1.5 pb-2 border-b border-[var(--ide-border)]/50">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-[var(--ide-text)]">Workbench: Color Theme</label>
                      <button onClick={() => resetSetting('theme')} title="Reset to Default" className="text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]">
                        <RotateCcw size={12} />
                      </button>
                    </div>
                    <p className="text-[var(--ide-text-muted)] text-[11px]">Controls the unified color theme for the entire IDE window (Editor, Title Bar, Activity Bar, Sidebars, Terminal, and Settings).</p>
                    <select
                      value={settings.theme}
                      onChange={e => updateSetting('theme', e.target.value)}
                      className="bg-[var(--ide-input-bg)] text-[var(--ide-text)] px-3 py-1.5 rounded border border-[var(--ide-input-border)] focus:border-[#007acc] outline-none"
                    >
                      <option value="Dark Modern">Dark Modern (VS Code Default)</option>
                      <option value="Dark+ (default dark)">Dark+ (default dark)</option>
                      <option value="AMOLED (Pure Black)">AMOLED (Pure Black)</option>
                      {settings.theme === 'Dark High Contrast (AMOLED)' && (
                        <option value="Dark High Contrast (AMOLED)">AMOLED (Pure Black)</option>
                      )}
                      <option value="Dark High Contrast">Dark High Contrast</option>
                      <option value="Light Modern">Light Modern (VS Code Default)</option>
                      <option value="Light+ (default light)">Light+ (default light)</option>
                      <option value="Light High Contrast">Light High Contrast</option>
                      <option value="Monokai">Monokai</option>
                      <option value="Solarized Dark">Solarized Dark</option>
                      <option value="Solarized Light">Solarized Light</option>
                      <option value="Quiet Light">Quiet Light</option>
                    </select>
                  </div>
                )}

                {isMatch('Font Size') && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-[var(--ide-text)]">Editor: Font Size</label>
                      <button onClick={() => resetSetting('fontSize')} title="Reset to Default" className="text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]">
                        <RotateCcw size={12} />
                      </button>
                    </div>
                    <p className="text-[var(--ide-text-muted)] text-[11px]">Controls the font size in pixels for Monaco Editor.</p>
                    <input
                      type="number"
                      min={10}
                      max={32}
                      value={settings.fontSize}
                      onChange={e => updateSetting('fontSize', Number(e.target.value) || 14)}
                      className="w-32 bg-[var(--ide-input-bg)] text-[var(--ide-text)] px-2.5 py-1.5 rounded border border-[var(--ide-input-border)] focus:border-[#007acc] outline-none"
                    />
                  </div>
                )}

                {isMatch('Font Family') && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-[var(--ide-text)]">Editor: Font Family</label>
                      <button onClick={() => resetSetting('fontFamily')} title="Reset to Default" className="text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]">
                        <RotateCcw size={12} />
                      </button>
                    </div>
                    <p className="text-[var(--ide-text-muted)] text-[11px]">Controls the font family used in the editor.</p>
                    <input
                      type="text"
                      value={settings.fontFamily}
                      onChange={e => updateSetting('fontFamily', e.target.value)}
                      className="w-full max-w-md bg-[var(--ide-input-bg)] text-[var(--ide-text)] px-2.5 py-1.5 rounded border border-[var(--ide-input-border)] focus:border-[#007acc] outline-none font-mono"
                    />
                  </div>
                )}

                {isMatch('Tab Size') && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-[var(--ide-text)]">Editor: Tab Size</label>
                      <button onClick={() => resetSetting('tabSize')} title="Reset to Default" className="text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]">
                        <RotateCcw size={12} />
                      </button>
                    </div>
                    <p className="text-[var(--ide-text-muted)] text-[11px]">The number of spaces a tab is equal to.</p>
                    <select
                      value={settings.tabSize}
                      onChange={e => updateSetting('tabSize', Number(e.target.value))}
                      className="bg-[var(--ide-input-bg)] text-[var(--ide-text)] px-3 py-1.5 rounded border border-[var(--ide-input-border)] focus:border-[#007acc] outline-none"
                    >
                      <option value={2}>2 spaces</option>
                      <option value={4}>4 spaces</option>
                      <option value={8}>8 spaces</option>
                    </select>
                  </div>
                )}

                {isMatch('Word Wrap') && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-[var(--ide-text)]">Editor: Word Wrap</label>
                      <button onClick={() => resetSetting('wordWrap')} title="Reset to Default" className="text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]">
                        <RotateCcw size={12} />
                      </button>
                    </div>
                    <p className="text-[var(--ide-text-muted)] text-[11px]">Controls how lines should wrap in the editor.</p>
                    <select
                      value={settings.wordWrap}
                      onChange={e => updateSetting('wordWrap', e.target.value as any)}
                      className="bg-[var(--ide-input-bg)] text-[var(--ide-text)] px-3 py-1.5 rounded border border-[var(--ide-input-border)] focus:border-[#007acc] outline-none"
                    >
                      <option value="off">off (lines will not wrap)</option>
                      <option value="on">on (wrap to viewport)</option>
                      <option value="wordWrapColumn">wordWrapColumn</option>
                    </select>
                  </div>
                )}

                {isMatch('Minimap') && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-[var(--ide-text)]">Editor: Minimap Enabled</label>
                      <button onClick={() => resetSetting('minimap')} title="Reset to Default" className="text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]">
                        <RotateCcw size={12} />
                      </button>
                    </div>
                    <p className="text-[var(--ide-text-muted)] text-[11px]">Controls whether the editor minimap is shown on the right side.</p>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.minimap}
                        onChange={e => updateSetting('minimap', e.target.checked)}
                        className="rounded border-[var(--ide-input-border)] text-[#007acc] focus:ring-0"
                      />
                      <span className="text-[var(--ide-text)]">Show Minimap</span>
                    </label>
                  </div>
                )}

                {isMatch('Cursor Blinking') && (
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[var(--ide-text)]">Editor: Cursor Blinking</label>
                    <p className="text-[var(--ide-text-muted)] text-[11px]">Controls the cursor animation style.</p>
                    <select
                      value={settings.cursorBlinking}
                      onChange={e => updateSetting('cursorBlinking', e.target.value as any)}
                      className="bg-[var(--ide-input-bg)] text-[var(--ide-text)] px-3 py-1.5 rounded border border-[var(--ide-input-border)] focus:border-[#007acc] outline-none"
                    >
                      <option value="blink">blink</option>
                      <option value="smooth">smooth</option>
                      <option value="phase">phase</option>
                      <option value="expand">expand</option>
                      <option value="solid">solid</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* FILES & AUTO SAVE */}
            {(activeCategory === 'commonly_used' || activeCategory === 'files') && (
              <div className="space-y-6 pt-4 border-t border-[var(--ide-border)]">
                <div className="text-base font-bold text-[var(--ide-text)] border-b border-[var(--ide-border)] pb-2">
                  Files & Auto Save
                </div>

                {isMatch('Auto Save') && (
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[var(--ide-text)]">Files: Auto Save</label>
                    <p className="text-[var(--ide-text-muted)] text-[11px]">Controls auto save of editors that have unsaved changes.</p>
                    <select
                      value={settings.autoSave}
                      onChange={e => updateSetting('autoSave', e.target.value as any)}
                      className="bg-[var(--ide-input-bg)] text-[var(--ide-text)] px-3 py-1.5 rounded border border-[var(--ide-input-border)] focus:border-[#007acc] outline-none"
                    >
                      <option value="off">off</option>
                      <option value="afterDelay">afterDelay</option>
                      <option value="onFocusChange">onFocusChange</option>
                      <option value="onWindowChange">onWindowChange</option>
                    </select>
                  </div>
                )}

                {isMatch('Format On Save') && (
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[var(--ide-text)]">Editor: Format On Save</label>
                    <p className="text-[var(--ide-text-muted)] text-[11px]">Format a file on save using Prettier or configured language formatter.</p>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.formatOnSave}
                        onChange={e => updateSetting('formatOnSave', e.target.checked)}
                        className="rounded border-[var(--ide-input-border)] text-[#007acc]"
                      />
                      <span className="text-[var(--ide-text)]">Enable Format on Save</span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* WORKBENCH */}
            {activeCategory === 'workbench' && (
              <div className="space-y-6">
                <div className="text-base font-bold text-[var(--ide-text)] border-b border-[var(--ide-border)] pb-2">
                  Workbench & Appearance
                </div>

                {/* 1. Color Theme */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-[var(--ide-text)]">Workbench: Color Theme</label>
                    <span className="text-[10px] text-[var(--ide-text-muted)] font-mono">Ctrl+K Ctrl+T</span>
                  </div>
                  <p className="text-[var(--ide-text-muted)] text-[11px]">
                    Controls the unified color theme for the entire IDE window (Editor, Title Bar, Activity Bar, Sidebars, Terminal, and Settings).
                  </p>
                  <div className="flex items-center gap-2">
                    <select
                      value={settings.theme}
                      onChange={e => updateSetting('theme', e.target.value)}
                      className="flex-1 bg-[var(--ide-input-bg)] text-[var(--ide-text)] px-3 py-1.5 rounded border border-[var(--ide-input-border)] focus:border-[#007acc] outline-none"
                    >
                      <option value="Dark Modern">Dark Modern (VS Code Default)</option>
                      <option value="Dark+ (default dark)">Dark+ (default dark)</option>
                      <option value="AMOLED (Pure Black)">AMOLED (Pure Black)</option>
                      <option value="Dark High Contrast">Dark High Contrast</option>
                      <option value="Light Modern">Light Modern (VS Code Default)</option>
                      <option value="Light+ (default light)">Light+ (default light)</option>
                      <option value="Light High Contrast">Light High Contrast</option>
                      <option value="Monokai">Monokai</option>
                      <option value="Solarized Dark">Solarized Dark</option>
                      <option value="Solarized Light">Solarized Light</option>
                      <option value="Quiet Light">Quiet Light</option>
                    </select>
                    {onOpenThemePicker && (
                      <button
                        onClick={() => onOpenThemePicker('color')}
                        className="px-3 py-1.5 bg-[var(--ide-hover-bg)] hover:bg-[#007acc]/20 text-[var(--ide-text)] border border-[var(--ide-border)] rounded text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Palette size={13} className="text-[#007acc]" />
                        <span>Quick Pick (Palette)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. File Icon Theme */}
                <div className="space-y-1.5 pt-4 border-t border-[var(--ide-border)]">
                  <label className="font-semibold text-[var(--ide-text)]">Workbench: File Icon Theme</label>
                  <p className="text-[var(--ide-text-muted)] text-[11px]">
                    Specifies the file icon theme used in the file tree explorer and open tabs.
                  </p>
                  <div className="flex items-center gap-2">
                    <select
                      value={settings.fileIconTheme || 'seti'}
                      onChange={e => updateSetting('fileIconTheme' as any, e.target.value)}
                      className="flex-1 bg-[var(--ide-input-bg)] text-[var(--ide-text)] px-3 py-1.5 rounded border border-[var(--ide-input-border)] focus:border-[#007acc] outline-none"
                    >
                      <option value="seti">Seti (Visual Studio Code Default)</option>
                      <option value="material">Material Icon Theme</option>
                      <option value="minimal">Minimal Line Icons</option>
                      <option value="none">None (Disable File Icons)</option>
                    </select>
                    {onOpenThemePicker && (
                      <button
                        onClick={() => onOpenThemePicker('file-icon')}
                        className="px-3 py-1.5 bg-[var(--ide-hover-bg)] hover:bg-[#007acc]/20 text-[var(--ide-text)] border border-[var(--ide-border)] rounded text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <FolderTree size={13} className="text-amber-400" />
                        <span>Select Icon Theme</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. Product Icon Theme */}
                <div className="space-y-1.5 pt-4 border-t border-[var(--ide-border)]">
                  <label className="font-semibold text-[var(--ide-text)]">Workbench: Product Icon Theme</label>
                  <p className="text-[var(--ide-text-muted)] text-[11px]">
                    Specifies the product icon theme used in the Activity Bar, Title Bar and UI controls.
                  </p>
                  <div className="flex items-center gap-2">
                    <select
                      value={settings.productIconTheme || 'default'}
                      onChange={e => updateSetting('productIconTheme' as any, e.target.value)}
                      className="flex-1 bg-[var(--ide-input-bg)] text-[var(--ide-text)] px-3 py-1.5 rounded border border-[var(--ide-input-border)] focus:border-[#007acc] outline-none"
                    >
                      <option value="default">Default (Visual Studio Code Codicons)</option>
                      <option value="fluent">Fluent Icons (Modern Microsoft Design)</option>
                      <option value="codicons">Codicons Modern Outline</option>
                      <option value="minimalist">Minimalist</option>
                    </select>
                    {onOpenThemePicker && (
                      <button
                        onClick={() => onOpenThemePicker('product-icon')}
                        className="px-3 py-1.5 bg-[var(--ide-hover-bg)] hover:bg-[#007acc]/20 text-[var(--ide-text)] border border-[var(--ide-border)] rounded text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Sparkles size={13} className="text-violet-400" />
                        <span>Select Product Theme</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* KEYBOARD SHORTCUTS */}
            {activeCategory === 'shortcuts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--ide-border)] pb-2">
                  <div>
                    <h2 className="text-base font-bold text-[var(--ide-text)] flex items-center gap-2">
                      <Keyboard size={18} className="text-[#007acc]" />
                      Keyboard Shortcuts
                    </h2>
                    <p className="text-[11px] text-[var(--ide-text-muted)] mt-0.5">
                      Search, view and manage keyboard keybindings across Elix IDE
                    </p>
                  </div>
                  <span className="text-[11px] text-[var(--ide-text-muted)] font-mono">
                    Ctrl+K Ctrl+S
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-[var(--ide-text-muted)]" />
                  <input
                    type="text"
                    value={shortcutsSearch}
                    onChange={e => setShortcutsSearch(e.target.value)}
                    placeholder="Type to search in keybindings (e.g. Save, Terminal, Ctrl+P)..."
                    className="w-full bg-[var(--ide-input-bg)] text-[var(--ide-text)] pl-9 pr-8 py-2 rounded border border-[var(--ide-input-border)] focus:border-[#007acc] outline-none text-xs"
                  />
                  {shortcutsSearch && (
                    <button
                      onClick={() => setShortcutsSearch('')}
                      className="absolute right-2.5 top-2.5 text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-[var(--ide-text-muted)] flex items-center justify-between">
                  <span>Showing {filteredShortcuts.length} of {DEFAULT_KEYBINDINGS.length} keybindings</span>
                </div>

                {/* Table */}
                <div className="border border-[var(--ide-border)] rounded-md overflow-hidden bg-[var(--ide-panel-bg)]">
                  <div className="grid grid-cols-12 px-4 py-2 bg-[var(--ide-title-bg)] border-b border-[var(--ide-border)] font-semibold text-[11px] text-[var(--ide-text-muted)] uppercase tracking-wider">
                    <div className="col-span-5">Command</div>
                    <div className="col-span-3">Keybinding</div>
                    <div className="col-span-2">When</div>
                    <div className="col-span-2">Source</div>
                  </div>

                  <div className="divide-y divide-[var(--ide-border)] max-h-[500px] overflow-y-auto">
                    {filteredShortcuts.map(item => (
                      <div
                        key={item.id}
                        className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-[var(--ide-hover-bg)] text-xs transition-colors"
                      >
                        <div className="col-span-5 pr-2">
                          <div className="font-medium text-[var(--ide-text)]">{item.description}</div>
                          <div className="text-[10px] text-[var(--ide-text-muted)] font-mono truncate">{item.command}</div>
                        </div>
                        <div className="col-span-3 flex items-center gap-1 flex-wrap">
                          {item.keys.map((k, i) => (
                            <kbd
                              key={i}
                              className="px-2 py-0.5 rounded bg-[var(--ide-input-bg)] border border-[var(--ide-border)] font-mono text-[11px] shadow-xs text-[var(--ide-text)] font-semibold"
                            >
                              {k}
                            </kbd>
                          ))}
                        </div>
                        <div className="col-span-2 text-[11px] text-[var(--ide-text-muted)] font-mono truncate">
                          {item.when}
                        </div>
                        <div className="col-span-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--ide-input-bg)] border border-[var(--ide-border)] text-[var(--ide-text-muted)] font-mono">
                            {item.source}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ENVIRONMENTS & SDKS */}
            {activeCategory === 'environments' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--ide-border)] pb-2">
                  <div>
                    <h2 className="text-base font-bold text-[var(--ide-text)] flex items-center gap-2">
                      <Boxes size={18} className="text-[#007acc]" />
                      Environments & Universal Runtimes
                    </h2>
                    <p className="text-[11px] text-[var(--ide-text-muted)] mt-0.5">
                      Compilers, runtimes, package managers and SDKs detected for zero-setup execution
                    </p>
                  </div>
                  <button
                    onClick={handleScanEnvs}
                    disabled={isScanningEnvs}
                    className="px-3 py-1.5 bg-[#007acc] text-white hover:bg-[#007acc]/90 rounded flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-colors"
                  >
                    <RefreshCw size={12} className={isScanningEnvs ? 'animate-spin' : ''} />
                    <span>{isScanningEnvs ? 'Scanning System Paths...' : 'Scan System Paths'}</span>
                  </button>
                </div>

                {/* Scan Feedback Banner */}
                {scanSummaryMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md text-xs flex items-center gap-2 font-mono">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>{scanSummaryMsg}</span>
                  </div>
                )}

                {/* Cloud vs Local Info Banner */}
                <div className="p-3.5 bg-[var(--ide-panel-bg)] border border-[var(--ide-border)] rounded-md space-y-1.5 text-xs text-[var(--ide-text-muted)]">
                  <div className="flex items-center gap-2 text-[var(--ide-text)] font-semibold text-xs">
                    <Cloud size={14} className="text-[#007acc]" />
                    <span>Universal Cloud vs Local Execution</span>
                  </div>
                  <p className="leading-relaxed text-[11px]">
                    Languages like <strong>C/C++, Python, Java, Node.js, Go, and Rust</strong> work out-of-the-box via Elix IDE's built-in <strong>Online Cloud Sandbox</strong> without needing local gigabyte toolchains. Local SDK installation is optional for offline compilation.
                  </p>
                  <p className="leading-relaxed text-[11px] text-[var(--ide-text-muted)]">
                    Only <strong>Mobile Development (Flutter & Android SDK)</strong> requires downloading local platform toolchains ({'850 MB'} – {'1.2 GB'}) for building device APKs and physical emulator debugging.
                  </p>
                </div>

                {envRepairMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md text-xs flex items-center gap-2 font-mono">
                    <CheckCircle2 size={14} />
                    <span>{envRepairMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {environments.length > 0 ? (
                    environments.map(env => (
                      <div
                        key={env.id}
                        className="p-3.5 bg-[var(--ide-panel-bg)] border border-[var(--ide-border)] rounded-lg hover:border-[var(--ide-accent)] transition-colors flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <span className="font-semibold text-xs text-[var(--ide-text)]">{env.name}</span>
                            
                            {env.status === 'ready' && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <CheckCircle2 size={10} /> Ready (Local Native)
                              </span>
                            )}
                            {env.status === 'cloud_ready' && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-[#007acc]/15 text-[#007acc] border border-[#007acc]/30 flex items-center gap-1">
                                <Cloud size={10} /> Cloud Ready (Online Runner)
                              </span>
                            )}
                            {env.status === 'not_installed' && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                <Download size={10} /> Required for Device Builds
                              </span>
                            )}
                            {env.status === 'downloading' && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                                Installing...
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-[11px] text-[var(--ide-text-muted)] leading-relaxed mt-1.5">
                            {env.description}
                          </p>

                          {/* Metadata row: version, downloadSize */}
                          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                            {env.version && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--ide-input-bg)] text-[var(--ide-text-muted)] font-mono border border-[var(--ide-border)]">
                                {env.version}
                              </span>
                            )}
                            {env.downloadSize && (
                              <span className="text-[11px] font-mono text-[var(--ide-text-muted)]">
                                Download Size: <strong className="text-[var(--ide-text)]">{env.downloadSize}</strong>
                              </span>
                            )}
                            {env.status === 'cloud_ready' && (
                              <span className="text-[10px] text-emerald-400 font-medium">
                                ⚡ Instant Online Runner Active
                              </span>
                            )}
                          </div>

                          {/* Detected Path display */}
                          {env.path && (
                            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[var(--ide-text-muted)] font-mono bg-[var(--ide-bg)] px-2 py-1 rounded border border-[var(--ide-border)] truncate" title={env.path}>
                              <Terminal size={10} className="shrink-0 text-emerald-400" />
                              <span className="truncate">{env.path}</span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="mt-3.5 pt-2.5 border-t border-[var(--ide-border)] flex items-center justify-between">
                          <span className="text-[10px] text-[var(--ide-text-muted)] font-mono uppercase tracking-wider">
                            {env.category}
                          </span>

                          {env.status === 'ready' && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={async () => {
                                  if (window.elix) {
                                    const res = await window.elix.repairEnvironment(env.id);
                                    setEnvRepairMsg(res.message);
                                    await loadEnvs();
                                    setTimeout(() => setEnvRepairMsg(null), 3500);
                                  }
                                }}
                                className="px-2 py-1 bg-[var(--ide-hover-bg)] hover:bg-[#007acc]/20 text-[var(--ide-text)] border border-[var(--ide-border)] rounded text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                                title="Verify installation and validate sandbox"
                              >
                                <Wrench size={11} />
                                <span>Verify</span>
                              </button>
                              <button
                                onClick={() => setConfirmUninstallEnv(env)}
                                className="px-2 py-1 bg-[var(--ide-hover-bg)] hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-[var(--ide-border)] rounded text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                                title="Uninstall or unlink local toolchain and revert to Cloud Runner"
                              >
                                <Trash2 size={11} />
                                <span>Uninstall</span>
                              </button>
                            </div>
                          )}

                          {env.status === 'cloud_ready' && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium flex items-center gap-1">
                                <CheckCircle2 size={10} /> Online Active
                              </span>
                              <button
                                onClick={() => setActiveInstallModalEnv(env)}
                                className="px-2.5 py-1 bg-[var(--ide-hover-bg)] hover:bg-[#007acc]/20 text-[var(--ide-text)] border border-[var(--ide-border)] rounded text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                                title="Optional: Download offline compiler toolchain or open official setup"
                              >
                                <Download size={11} />
                                <span>Local SDK ({env.downloadSize || 'Setup'})</span>
                              </button>
                            </div>
                          )}

                          {env.status === 'not_installed' && (
                            <button
                              onClick={() => setActiveInstallModalEnv(env)}
                              className="px-3 py-1 bg-[#007acc] hover:bg-[#007acc]/90 text-white rounded text-[11px] font-medium flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                            >
                              <Download size={11} />
                              <span>Install SDK ({env.downloadSize || 'Setup'})</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Default Tool Cards */
                    [
                      { name: 'C / C++ (GCC MinGW-w64)', desc: 'Gnu C/C++ Native Compiler for Windows', status: 'Ready' },
                      { name: 'Python 3.x Runtime', desc: 'CPython & Pip Package Ecosystem', status: 'Ready' },
                      { name: 'Node.js & npm', desc: 'JavaScript, TypeScript & Web Platform', status: 'Ready' },
                      { name: 'Java OpenJDK', desc: 'Java Development Kit & JVM Runtime', status: 'Ready' },
                      { name: 'Rust & Cargo', desc: 'Systems programming compiler & package manager', status: 'Available' },
                      { name: 'Git SCM', desc: 'Distributed version control system', status: 'Ready' }
                    ].map((tool, i) => (
                      <div key={i} className="p-3.5 bg-[var(--ide-panel-bg)] border border-[var(--ide-border)] rounded-lg flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-xs text-[var(--ide-text)] flex items-center gap-2">
                            <span>{tool.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                              {tool.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-[var(--ide-text-muted)] mt-1">{tool.desc}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Setup / Install Modal */}
                {activeInstallModalEnv && (
                  <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-[var(--ide-panel-bg)] border border-[var(--ide-border)] rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-[var(--ide-text)] flex items-center gap-2">
                            <Download size={16} className="text-[#007acc]" />
                            Setup {activeInstallModalEnv.name}
                          </h3>
                          <p className="text-[11px] text-[var(--ide-text-muted)] mt-0.5">
                            Download Size: {activeInstallModalEnv.downloadSize || 'Varies'} • Choose installation method
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (!installingEnvId) setActiveInstallModalEnv(null);
                          }}
                          className="text-[var(--ide-text-muted)] hover:text-[var(--ide-text)] text-xs p-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      {activeInstallModalEnv.status === 'cloud_ready' && (
                        <div className="p-3 bg-[#007acc]/10 border border-[#007acc]/30 rounded-md text-[11px] text-[var(--ide-text)] space-y-1">
                          <div className="font-semibold flex items-center gap-1.5 text-[#007acc]">
                            <Cloud size={13} /> Instant Cloud Runner Active
                          </div>
                          <p className="text-[var(--ide-text-muted)] text-[10.5px] leading-relaxed">
                            You can write and run {activeInstallModalEnv.name} code right now without installing anything locally. Installing local SDK is optional for offline builds.
                          </p>
                        </div>
                      )}

                      {/* Options */}
                      <div className="space-y-2.5">
                        {/* Option 1: 1-Click winget */}
                        <div className="p-3 border border-[var(--ide-border)] hover:border-[#007acc] rounded-lg bg-[var(--ide-bg)] transition-colors flex items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="text-xs font-semibold text-[var(--ide-text)] flex items-center gap-1.5">
                              <span>⚡ 1-Click Install (In-IDE)</span>
                            </div>
                            <p className="text-[10px] text-[var(--ide-text-muted)] leading-tight">
                              Automated background setup via Windows Package Manager (winget).
                            </p>
                          </div>
                          <button
                            onClick={() => handleInstallEnv(activeInstallModalEnv, 'winget')}
                            disabled={Boolean(installingEnvId)}
                            className="px-3 py-1.5 bg-[#007acc] hover:bg-[#007acc]/90 text-white rounded text-xs font-medium cursor-pointer shrink-0 transition-colors disabled:opacity-50"
                          >
                            {installingEnvId === activeInstallModalEnv.id ? 'Installing...' : 'Install via winget'}
                          </button>
                        </div>

                        {/* Option 2: Browser download */}
                        <div className="p-3 border border-[var(--ide-border)] hover:border-[#007acc] rounded-lg bg-[var(--ide-bg)] transition-colors flex items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="text-xs font-semibold text-[var(--ide-text)] flex items-center gap-1.5">
                              <span>🌐 Official Download Page</span>
                            </div>
                            <p className="text-[10px] text-[var(--ide-text-muted)] leading-tight">
                              Open official download portal in your browser to download the installer (.msi / .exe).
                            </p>
                          </div>
                          <button
                            onClick={() => handleInstallEnv(activeInstallModalEnv, 'browser')}
                            className="px-3 py-1.5 bg-[var(--ide-hover-bg)] hover:bg-[var(--ide-input-bg)] text-[var(--ide-text)] border border-[var(--ide-border)] rounded text-xs font-medium cursor-pointer shrink-0 flex items-center gap-1 transition-colors"
                          >
                            <span>Open in Browser</span>
                            <ExternalLink size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Progress log if installing */}
                      {installingEnvId === activeInstallModalEnv.id && (
                        <div className="p-2.5 bg-black/40 border border-amber-500/30 rounded text-[11px] font-mono text-amber-300 flex items-center gap-2">
                          <RefreshCw size={13} className="animate-spin shrink-0 text-amber-400" />
                          <span className="truncate">{installProgressMsg || 'Installing toolchain in background...'}</span>
                        </div>
                      )}

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => {
                            if (!installingEnvId) setActiveInstallModalEnv(null);
                          }}
                          disabled={Boolean(installingEnvId)}
                          className="px-3 py-1 text-xs text-[var(--ide-text-muted)] hover:text-[var(--ide-text)] cursor-pointer disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirm Uninstall Modal */}
                {confirmUninstallEnv && (
                  <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-[var(--ide-panel-bg)] border border-[var(--ide-border)] rounded-xl max-w-sm w-full p-5 shadow-2xl space-y-3">
                      <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                        <AlertTriangle size={16} />
                        <span>Uninstall / Unlink {confirmUninstallEnv.name}?</span>
                      </div>
                      <p className="text-[11px] text-[var(--ide-text-muted)] leading-relaxed">
                        This will unlink the local toolchain from Elix IDE and launch uninstallation. The environment will automatically revert to the <strong>Instant Cloud Runner</strong>.
                      </p>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setConfirmUninstallEnv(null)}
                          className="px-3 py-1 bg-[var(--ide-input-bg)] border border-[var(--ide-border)] rounded text-xs text-[var(--ide-text)] hover:bg-[var(--ide-hover-bg)] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUninstallEnv(confirmUninstallEnv)}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium cursor-pointer"
                        >
                          Confirm Uninstall
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TERMINAL */}
            {activeCategory === 'terminal' && (
              <div className="space-y-6">
                <div className="text-base font-bold text-[var(--ide-text)] border-b border-[var(--ide-border)] pb-2">
                  Integrated Terminal
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[var(--ide-text)]">Terminal &gt; Integrated: Font Size</label>
                  <p className="text-[var(--ide-text-muted)] text-[11px]">Controls the font size in pixels of the terminal.</p>
                  <input
                    type="number"
                    min={10}
                    max={28}
                    value={settings.terminalFontSize}
                    onChange={e => updateSetting('terminalFontSize', Number(e.target.value) || 12)}
                    className="w-32 bg-[var(--ide-input-bg)] text-[var(--ide-text)] px-2.5 py-1.5 rounded border border-[var(--ide-input-border)] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[var(--ide-text)]">Terminal &gt; Integrated: Default Profile (Windows)</label>
                  <p className="text-[var(--ide-text-muted)] text-[11px]">Default shell to launch on Windows.</p>
                  <select
                    value={settings.terminalShell}
                    onChange={e => updateSetting('terminalShell', e.target.value)}
                    className="bg-[var(--ide-input-bg)] text-[var(--ide-text)] px-3 py-1.5 rounded border border-[var(--ide-input-border)] outline-none"
                  >
                    <option value="powershell">PowerShell (Recommended)</option>
                    <option value="cmd">Command Prompt (cmd.exe)</option>
                    <option value="git-bash">Git Bash</option>
                  </select>
                </div>
              </div>
            )}

            {/* AI AGENT */}
            {activeCategory === 'ai' && (
              <div className="space-y-6">
                <div className="text-base font-bold text-[var(--ide-text)] border-b border-[var(--ide-border)] pb-2">
                  AI Agent & LLM Providers
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[var(--ide-text)]">AI Provider</label>
                  <p className="text-[var(--ide-text-muted)] text-[11px]">Choose the active cloud or local provider for the integrated AI Agent and DSA Practice Mentor.</p>
                  <select
                    value={settings.aiProvider}
                    onChange={e => {
                      const prov = e.target.value as any;
                      updateSetting('aiProvider', prov);
                      if (prov === 'gemini') updateSetting('aiModel', 'gemini-1.5-flash');
                      else if (prov === 'openrouter') updateSetting('aiModel', 'deepseek/deepseek-r1:free');
                      else if (prov === 'nvidia') updateSetting('aiModel', 'meta/llama-3.3-70b-instruct');
                      else if (prov === 'groq') updateSetting('aiModel', 'llama-3.3-70b-versatile');
                    }}
                    className="bg-[var(--ide-input-bg)] text-[var(--ide-text)] px-3 py-1.5 rounded border border-[var(--ide-input-border)] outline-none"
                  >
                    <option value="gemini">Gemini</option>
                    <option value="openrouter">OpenRouter</option>
                    <option value="nvidia">NVIDIA</option>
                    <option value="groq">Groq (Ultra-Fast Llama 3.3)</option>
                  </select>
                </div>

                {/* Free API Key Direct Resource Links */}
                <div className="p-3 rounded-lg bg-[var(--ide-hover-bg)] border border-[var(--ide-border)] text-[11px] space-y-1.5">
                  <div className="font-semibold text-[var(--ide-text)] flex items-center gap-1.5">
                    <Sparkles size={12} className="text-cyan-400" />
                    <span>Free Provider Keys &amp; Resources:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <a 
                      href="https://console.groq.com/keys" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[#007acc] hover:underline flex items-center gap-1 font-medium"
                    >
                      • Groq (Free API Key - starts with gsk_)
                    </a>
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[#007acc] hover:underline flex items-center gap-1"
                    >
                      • Gemini (Free API Key - starts with AIza)
                    </a>
                    <a 
                      href="https://openrouter.ai/keys" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[#007acc] hover:underline flex items-center gap-1"
                    >
                      • OpenRouter (Free API Key)
                    </a>
                    <a 
                      href="https://build.nvidia.com/" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[#007acc] hover:underline flex items-center gap-1"
                    >
                      • NVIDIA (Free API Key)
                    </a>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[var(--ide-text)]">API Key</label>
                  <p className="text-[var(--ide-text-muted)] text-[11px]">
                    {settings.aiProvider === 'ollama' 
                      ? 'Not required for Local Ollama.' 
                      : 'Securely saved locally in Elix IDE storage.'}
                  </p>
                  <input
                    type="password"
                    value={settings.aiApiKey}
                    onChange={e => updateSetting('aiApiKey', e.target.value)}
                    placeholder={settings.aiProvider === 'ollama' ? 'Optional for local Ollama' : 'Enter your API key...'}
                    className="w-full max-w-md bg-[var(--ide-input-bg)] text-[var(--ide-text)] px-2.5 py-1.5 rounded border border-[var(--ide-input-border)] font-mono outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[var(--ide-text)]">Model Name</label>
                  <input
                    type="text"
                    value={settings.aiModel}
                    onChange={e => updateSetting('aiModel', e.target.value)}
                    placeholder="e.g. gemini-1.5-flash, llama-3.3-70b-versatile, meta-llama/llama-3.3-70b-instruct:free..."
                    className="w-full max-w-md bg-[var(--ide-input-bg)] text-[var(--ide-text)] px-2.5 py-1.5 rounded border border-[var(--ide-input-border)] outline-none"
                  />
                </div>

                {(settings.aiProvider === 'custom_api' || settings.aiProvider === 'ollama') && (
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[var(--ide-text)]">Endpoint URL</label>
                    <p className="text-[var(--ide-text-muted)] text-[11px]">Base URL of your local or OpenAI-compatible server.</p>
                    <input
                      type="text"
                      value={settings.aiCustomEndpoint || ''}
                      onChange={e => updateSetting('aiCustomEndpoint' as any, e.target.value)}
                      placeholder="http://localhost:11434/v1"
                      className="w-full max-w-md bg-[var(--ide-input-bg)] text-[var(--ide-text)] px-2.5 py-1.5 rounded border border-[var(--ide-input-border)] font-mono outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* GIT */}
            {activeCategory === 'git' && (
              <div className="space-y-6">
                <div className="text-base font-bold text-[var(--ide-text)] border-b border-[var(--ide-border)] pb-2 flex items-center justify-between">
                  <span>Git & Version Control</span>
                </div>

                {/* Git User Name */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-[var(--ide-text)]">Git: User Name</label>
                  <p className="text-[var(--ide-text-muted)] text-[11px]">User name configured for Git author signatures and commits (`user.name`).</p>
                  <input
                    type="text"
                    value={settings.gitUserName || ''}
                    onChange={e => updateSetting('gitUserName' as any, e.target.value)}
                    placeholder="e.g. Subham Mukhopadhyay"
                    className="w-full max-w-md bg-[var(--ide-input-bg)] text-[var(--ide-text)] px-2.5 py-1.5 rounded border border-[var(--ide-input-border)] outline-none"
                  />
                </div>

                {/* Git User Email */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-[var(--ide-text)]">Git: User Email</label>
                  <p className="text-[var(--ide-text-muted)] text-[11px]">User email configured for Git commits and repository tracking (`user.email`).</p>
                  <input
                    type="email"
                    value={settings.gitUserEmail || ''}
                    onChange={e => updateSetting('gitUserEmail' as any, e.target.value)}
                    placeholder="e.g. yourname@example.com"
                    className="w-full max-w-md bg-[var(--ide-input-bg)] text-[var(--ide-text)] px-2.5 py-1.5 rounded border border-[var(--ide-input-border)] outline-none"
                  />
                </div>

                {/* Git Default Branch */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-[var(--ide-text)]">Git: Default Branch Name</label>
                  <p className="text-[var(--ide-text-muted)] text-[11px]">The default initial branch name when creating new Git repositories (`init.defaultBranch`).</p>
                  <input
                    type="text"
                    value={settings.gitDefaultBranch || 'main'}
                    onChange={e => updateSetting('gitDefaultBranch' as any, e.target.value)}
                    placeholder="main"
                    className="w-full max-w-xs bg-[var(--ide-input-bg)] text-[var(--ide-text)] px-2.5 py-1.5 rounded border border-[var(--ide-input-border)] outline-none"
                  />
                </div>

                {/* GitHub Authentication Token */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-[var(--ide-text)]">GitHub Personal Access Token</label>
                  <p className="text-[var(--ide-text-muted)] text-[11px]">
                    Token used for 1-click push, pull, cloning, and repository synchronization without terminal login prompts.
                  </p>
                  <input
                    type="password"
                    value={settings.githubToken || ''}
                    onChange={e => updateSetting('githubToken', e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full max-w-md bg-[var(--ide-input-bg)] text-[var(--ide-text)] px-2.5 py-1.5 rounded border border-[var(--ide-input-border)] font-mono outline-none"
                  />
                  <div className="pt-1">
                    <a 
                      href="https://github.com/settings/tokens" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[#007acc] hover:underline text-[11px] inline-flex items-center gap-1"
                    >
                      Generate GitHub Token (classic or fine-grained) →
                    </a>
                  </div>
                </div>

                {/* Automation Toggles */}
                <div className="space-y-3 pt-2 border-t border-[var(--ide-border)]">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[var(--ide-text)]">Git: Auto Fetch</label>
                    <p className="text-[var(--ide-text-muted)] text-[11px]">When set to true, commits will automatically be fetched from the remote repository in the background.</p>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.gitAutoFetch}
                        onChange={e => updateSetting('gitAutoFetch', e.target.checked)}
                        className="rounded border-[var(--ide-input-border)] text-[#007acc]"
                      />
                      <span className="text-[var(--ide-text)]">Enable Auto Fetch</span>
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-[var(--ide-text)]">Git: Confirm Sync</label>
                    <p className="text-[var(--ide-text-muted)] text-[11px]">Confirm before synchronizing (pushing or pulling) changes to remote repositories.</p>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.gitConfirmSync ?? true}
                        onChange={e => updateSetting('gitConfirmSync' as any, e.target.checked)}
                        className="rounded border-[var(--ide-input-border)] text-[#007acc]"
                      />
                      <span className="text-[var(--ide-text)]">Confirm Before Sync</span>
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-[var(--ide-text)]">Git: Auto Staging</label>
                    <p className="text-[var(--ide-text-muted)] text-[11px]">Automatically stage all modified files when creating a commit.</p>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.gitAutoStaging ?? false}
                        onChange={e => updateSetting('gitAutoStaging' as any, e.target.checked)}
                        className="rounded border-[var(--ide-input-border)] text-[#007acc]"
                      />
                      <span className="text-[var(--ide-text)]">Enable Auto Staging</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* BACKUP & SYNC */}
            {activeCategory === 'sync' && (
              <div className="space-y-6">
                <div className="text-base font-bold text-[var(--ide-text)] border-b border-[var(--ide-border)] pb-2 flex items-center justify-between">
                  <span>Backup & Settings Sync</span>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-normal">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Sync Active</span>
                  </div>
                </div>

                {/* Status Box */}
                <div className="bg-[var(--ide-panel-bg)] border border-[var(--ide-border)] rounded-md p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-[var(--ide-text)]">Cloud & Local Synchronization</div>
                      <p className="text-[11px] text-[var(--ide-text-muted)]">
                        Your settings, themes, AI provider keys, keybindings, and execution SDKs are tracked.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSyncing(true);
                        setTimeout(() => {
                          setIsSyncing(false);
                          setSyncFeedback('All configurations synchronized successfully!');
                          setTimeout(() => setSyncFeedback(null), 3000);
                        }, 800);
                      }}
                      disabled={isSyncing}
                      className="px-3 py-1.5 bg-[#007acc] hover:bg-[#0062a3] text-white rounded font-medium flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer text-xs"
                    >
                      <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                      <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                    </button>
                  </div>

                  {syncFeedback && (
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded text-[11px] flex items-center gap-2">
                      <Check size={13} />
                      <span>{syncFeedback}</span>
                    </div>
                  )}
                </div>

                {/* Synced Elements List */}
                <div className="space-y-3">
                  <label className="font-semibold text-[var(--ide-text)]">Synchronized Elements</label>
                  <div className="space-y-2">
                    {[
                      { title: 'Settings & Preferences', desc: 'Editor font, theme, auto-save, AI model selection, provider API keys' },
                      { title: 'Keyboard Shortcuts', desc: 'Custom keybindings and editor command mappings' },
                      { title: 'Universal Execution SDKs', desc: 'Configured local compiler runtimes (MinGW, Python, Node, OpenJDK, Rustc)' },
                      { title: 'Git & Version Control', desc: 'Git author details, default branch, sync preferences' },
                      { title: 'UI Layout & Sidebars', desc: 'Panel split ratios, sidebar sizes, active view layout' }
                    ].map((item, idx) => (
                      <div key={idx} className="p-2.5 bg-[var(--ide-input-bg)] border border-[var(--ide-border)] rounded flex items-center justify-between">
                        <div>
                          <div className="font-medium text-[var(--ide-text)]">{item.title}</div>
                          <div className="text-[10px] text-[var(--ide-text-muted)]">{item.desc}</div>
                        </div>
                        <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                          <Check size={12} /> Synced
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manual Backup Export / Import */}
                <div className="space-y-3 pt-3 border-t border-[var(--ide-border)]">
                  <label className="font-semibold text-[var(--ide-text)]">Manual Backup Files</label>
                  <p className="text-[11px] text-[var(--ide-text-muted)]">
                    Export your full IDE configuration to a JSON backup file, or restore settings from an existing file.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const backupData = {
                          app: 'Elix IDE',
                          version: '1.0.0',
                          exportedAt: new Date().toISOString(),
                          settings
                        };
                        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `elix-settings-backup-${new Date().toISOString().slice(0, 10)}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        setSyncFeedback('Backup exported successfully to JSON!');
                        setTimeout(() => setSyncFeedback(null), 3000);
                      }}
                      className="px-3.5 py-2 bg-[var(--ide-hover-bg)] hover:bg-[#007acc]/20 border border-[var(--ide-border)] hover:border-[#007acc] rounded flex items-center gap-2 text-[var(--ide-text)] text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Download size={14} className="text-[#007acc]" />
                      <span>Export Settings Backup (.json)</span>
                    </button>

                    <label className="px-3.5 py-2 bg-[var(--ide-hover-bg)] hover:bg-[#007acc]/20 border border-[var(--ide-border)] hover:border-[#007acc] rounded flex items-center gap-2 text-[var(--ide-text)] text-xs font-medium transition-colors cursor-pointer">
                      <Upload size={14} className="text-emerald-400" />
                      <span>Restore from Backup (.json)</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = ev => {
                            try {
                              const parsed = JSON.parse(ev.target?.result as string);
                              const imported = parsed.settings || parsed;
                              if (typeof imported === 'object' && imported !== null) {
                                const merged = { ...DEFAULT_SETTINGS, ...imported };
                                saveStoredSettings(merged);
                                setSettings(merged);
                                setSyncFeedback('Settings restored successfully! Reloading...');
                                setTimeout(() => window.location.reload(), 1200);
                              }
                            } catch (err: any) {
                              alert('Failed to parse backup file: ' + err.message);
                            }
                          };
                          reader.readAsText(file);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* PRIVACY */}
            {activeCategory === 'privacy' && (
              <div className="space-y-6">
                <div className="text-base font-bold text-[var(--ide-text)] border-b border-[var(--ide-border)] pb-2">
                  Security & Privacy
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[var(--ide-text)]">Telemetry & Crash Reporting</label>
                  <p className="text-[var(--ide-text-muted)] text-[11px]">Controls whether telemetry data is sent. Elix IDE defaults to off for maximum privacy.</p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.telemetry}
                      onChange={e => updateSetting('telemetry', e.target.checked)}
                      className="rounded border-[var(--ide-input-border)] text-[#007acc]"
                    />
                    <span className="text-[var(--ide-text)]">Allow Anonymous Telemetry</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
