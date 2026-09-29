import React, { useState, useEffect, useMemo } from 'react';
import { 
  Settings as SettingsIcon, 
  Search, 
  X, 
  Code, 
  Files, 
  Layout, 
  Terminal, 
  Sparkles, 
  GitBranch, 
  Shield, 
  Check, 
  RotateCcw,
  Star
} from 'lucide-react';
import { 
  ElixIdeSettings, 
  DEFAULT_SETTINGS, 
  getStoredSettings, 
  saveStoredSettings 
} from '../../utils/settingsHelper';

interface SettingsModalProps {
  onClose: () => void;
}

type SettingsCategory = 
  | 'commonly_used'
  | 'editor'
  | 'files'
  | 'workbench'
  | 'terminal'
  | 'ai'
  | 'git'
  | 'privacy';

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<ElixIdeSettings>(getStoredSettings);
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('commonly_used');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [scope, setScope] = useState<'user' | 'workspace'>('user');
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);

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

  // Filter settings by search
  const isMatch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase().trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#1e1e1e] border border-[#3c3c3c] rounded-xl shadow-2xl flex flex-col overflow-hidden h-[85vh] text-[#cccccc]">
        
        {/* Top Header Bar */}
        <div className="p-3.5 border-b border-[#2d2d2d] flex items-center justify-between bg-[#252526] select-none">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <SettingsIcon size={18} className="text-[#007acc]" />
              <h2 className="text-sm font-semibold text-white">Settings</h2>
            </div>
            <span className="text-[11px] text-[#888888] hidden sm:inline">(Ctrl+,)</span>
          </div>

          {/* Search Settings input (VS Code Parity) */}
          <div className="flex-1 max-w-md mx-4">
            <div className="flex items-center gap-2 bg-[#3c3c3c] px-3 py-1 rounded border border-[#2b2b2b] focus-within:border-[#007acc]">
              <Search size={13} className="text-[#888888] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search settings (e.g., font size, auto save, wrap, theme)"
                className="bg-transparent text-white text-xs w-full focus:outline-none placeholder:text-[#777777]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-[#888888] hover:text-white">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {savedFeedback && (
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium animate-pulse">
                <Check size={12} /> Saved
              </span>
            )}
            <button 
              onClick={onClose} 
              className="text-[#888888] hover:text-white p-1 hover:bg-[#333333] rounded transition-colors"
              title="Close (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* User / Workspace Scope Tab Switcher */}
        <div className="flex items-center px-4 bg-[#252526] border-b border-[#2d2d2d] text-xs select-none">
          <button
            onClick={() => setScope('user')}
            className={`py-2 px-3 border-b-2 font-medium transition-colors ${
              scope === 'user'
                ? 'border-[#007acc] text-white'
                : 'border-transparent text-[#888888] hover:text-[#cccccc]'
            }`}
          >
            User
          </button>
          <button
            onClick={() => setScope('workspace')}
            className={`py-2 px-3 border-b-2 font-medium transition-colors ${
              scope === 'workspace'
                ? 'border-[#007acc] text-white'
                : 'border-transparent text-[#888888] hover:text-[#cccccc]'
            }`}
          >
            Workspace
          </button>
        </div>

        {/* Main Body: Categories Sidebar + Settings Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Categories Sidebar */}
          <div className="w-56 bg-[#252526] border-r border-[#2d2d2d] flex flex-col p-2 select-none overflow-y-auto shrink-0">
            <button
              onClick={() => { setActiveCategory('commonly_used'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-left transition-colors font-medium ${
                activeCategory === 'commonly_used' && !searchQuery
                  ? 'bg-[#37373d] text-white'
                  : 'hover:bg-[#2a2d2e] text-[#cccccc]'
              }`}
            >
              <Star size={14} className="text-amber-400" />
              <span>Commonly Used</span>
            </button>

            <button
              onClick={() => { setActiveCategory('editor'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-left transition-colors font-medium ${
                activeCategory === 'editor' && !searchQuery
                  ? 'bg-[#37373d] text-white'
                  : 'hover:bg-[#2a2d2e] text-[#cccccc]'
              }`}
            >
              <Code size={14} className="text-[#3178c6]" />
              <span>Text Editor</span>
            </button>

            <button
              onClick={() => { setActiveCategory('files'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-left transition-colors font-medium ${
                activeCategory === 'files' && !searchQuery
                  ? 'bg-[#37373d] text-white'
                  : 'hover:bg-[#2a2d2e] text-[#cccccc]'
              }`}
            >
              <Files size={14} className="text-[#e34c26]" />
              <span>Files & Auto Save</span>
            </button>

            <button
              onClick={() => { setActiveCategory('workbench'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-left transition-colors font-medium ${
                activeCategory === 'workbench' && !searchQuery
                  ? 'bg-[#37373d] text-white'
                  : 'hover:bg-[#2a2d2e] text-[#cccccc]'
              }`}
            >
              <Layout size={14} className="text-[#9cdcfe]" />
              <span>Workbench & Appearance</span>
            </button>

            <button
              onClick={() => { setActiveCategory('terminal'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-left transition-colors font-medium ${
                activeCategory === 'terminal' && !searchQuery
                  ? 'bg-[#37373d] text-white'
                  : 'hover:bg-[#2a2d2e] text-[#cccccc]'
              }`}
            >
              <Terminal size={14} className="text-[#89e051]" />
              <span>Integrated Terminal</span>
            </button>

            <button
              onClick={() => { setActiveCategory('ai'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-left transition-colors font-medium ${
                activeCategory === 'ai' && !searchQuery
                  ? 'bg-[#37373d] text-white'
                  : 'hover:bg-[#2a2d2e] text-[#cccccc]'
              }`}
            >
              <Sparkles size={14} className="text-violet-400" />
              <span>Cloud AI Providers</span>
            </button>

            <button
              onClick={() => { setActiveCategory('git'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-left transition-colors font-medium ${
                activeCategory === 'git' && !searchQuery
                  ? 'bg-[#37373d] text-white'
                  : 'hover:bg-[#2a2d2e] text-[#cccccc]'
              }`}
            >
              <GitBranch size={14} className="text-cyan-400" />
              <span>Git & GitHub</span>
            </button>

            <button
              onClick={() => { setActiveCategory('privacy'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-left transition-colors font-medium ${
                activeCategory === 'privacy' && !searchQuery
                  ? 'bg-[#37373d] text-white'
                  : 'hover:bg-[#2a2d2e] text-[#cccccc]'
              }`}
            >
              <Shield size={14} className="text-emerald-400" />
              <span>Privacy & Security</span>
            </button>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* 1. COMMONLY USED / EDITOR SETTINGS */}
            {(activeCategory === 'commonly_used' || activeCategory === 'editor' || searchQuery) && (
              <div className="space-y-6">
                <div className="border-b border-[#2d2d2d] pb-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px] text-[#007acc]">
                    {activeCategory === 'editor' ? 'Text Editor' : 'Commonly Used'}
                  </h3>
                </div>

                {/* Editor: Font Size */}
                {isMatch('font size editor text') && (
                  <div className="space-y-1.5 p-3 rounded-lg hover:bg-[#252526] transition-colors">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white">Editor: Font Size</label>
                      {settings.fontSize !== DEFAULT_SETTINGS.fontSize && (
                        <button 
                          onClick={() => resetSetting('fontSize')}
                          className="text-[10px] text-[#888888] hover:text-white flex items-center gap-1"
                        >
                          <RotateCcw size={10} /> Reset
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-[#888888]">Controls the font size in pixels.</p>
                    <input
                      type="number"
                      min={10}
                      max={36}
                      value={settings.fontSize}
                      onChange={e => updateSetting('fontSize', Number(e.target.value) || 14)}
                      className="w-32 bg-[#3c3c3c] text-white text-xs px-2.5 py-1 rounded border border-[#2b2b2b] focus:outline-none focus:border-[#007acc]"
                    />
                  </div>
                )}

                {/* Editor: Font Family */}
                {isMatch('font family editor consolas code') && (
                  <div className="space-y-1.5 p-3 rounded-lg hover:bg-[#252526] transition-colors">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white">Editor: Font Family</label>
                      {settings.fontFamily !== DEFAULT_SETTINGS.fontFamily && (
                        <button onClick={() => resetSetting('fontFamily')} className="text-[10px] text-[#888888] hover:text-white flex items-center gap-1">
                          <RotateCcw size={10} /> Reset
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-[#888888]">Controls the font family.</p>
                    <input
                      type="text"
                      value={settings.fontFamily}
                      onChange={e => updateSetting('fontFamily', e.target.value)}
                      className="w-full max-w-md bg-[#3c3c3c] text-white text-xs px-2.5 py-1 rounded border border-[#2b2b2b] focus:outline-none focus:border-[#007acc]"
                    />
                  </div>
                )}

                {/* Editor: Tab Size */}
                {isMatch('tab size spaces indent editor') && (
                  <div className="space-y-1.5 p-3 rounded-lg hover:bg-[#252526] transition-colors">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white">Editor: Tab Size</label>
                      {settings.tabSize !== DEFAULT_SETTINGS.tabSize && (
                        <button onClick={() => resetSetting('tabSize')} className="text-[10px] text-[#888888] hover:text-white flex items-center gap-1">
                          <RotateCcw size={10} /> Reset
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-[#888888]">The number of spaces a tab is equal to.</p>
                    <select
                      value={settings.tabSize}
                      onChange={e => updateSetting('tabSize', Number(e.target.value) || 2)}
                      className="w-32 bg-[#3c3c3c] text-white text-xs px-2.5 py-1 rounded border border-[#2b2b2b] focus:outline-none focus:border-[#007acc]"
                    >
                      <option value={2}>2 spaces</option>
                      <option value={4}>4 spaces</option>
                      <option value={8}>8 spaces</option>
                    </select>
                  </div>
                )}

                {/* Editor: Word Wrap */}
                {isMatch('word wrap lines wrap editor') && (
                  <div className="space-y-1.5 p-3 rounded-lg hover:bg-[#252526] transition-colors">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white">Editor: Word Wrap</label>
                      {settings.wordWrap !== DEFAULT_SETTINGS.wordWrap && (
                        <button onClick={() => resetSetting('wordWrap')} className="text-[10px] text-[#888888] hover:text-white flex items-center gap-1">
                          <RotateCcw size={10} /> Reset
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-[#888888]">Controls how lines should wrap in the editor.</p>
                    <select
                      value={settings.wordWrap}
                      onChange={e => updateSetting('wordWrap', e.target.value as any)}
                      className="w-48 bg-[#3c3c3c] text-white text-xs px-2.5 py-1 rounded border border-[#2b2b2b] focus:outline-none focus:border-[#007acc]"
                    >
                      <option value="on">on (wrap to viewport)</option>
                      <option value="off">off (never wrap)</option>
                      <option value="wordWrapColumn">wordWrapColumn</option>
                    </select>
                  </div>
                )}

                {/* Editor: Format On Save */}
                {isMatch('format on save prettier editor') && (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#252526] transition-colors">
                    <input
                      type="checkbox"
                      id="formatOnSave"
                      checked={settings.formatOnSave}
                      onChange={e => updateSetting('formatOnSave', e.target.checked)}
                      className="mt-0.5 accent-[#007acc] w-4 h-4 rounded"
                    />
                    <div>
                      <label htmlFor="formatOnSave" className="text-xs font-semibold text-white cursor-pointer">
                        Editor: Format On Save
                      </label>
                      <p className="text-[11px] text-[#888888]">Format a file on save. A formatter must be available.</p>
                    </div>
                  </div>
                )}

                {/* Editor: Minimap */}
                {isMatch('minimap preview code scrollbar editor') && (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#252526] transition-colors">
                    <input
                      type="checkbox"
                      id="minimap"
                      checked={settings.minimap}
                      onChange={e => updateSetting('minimap', e.target.checked)}
                      className="mt-0.5 accent-[#007acc] w-4 h-4 rounded"
                    />
                    <div>
                      <label htmlFor="minimap" className="text-xs font-semibold text-white cursor-pointer">
                        Editor &gt; Minimap: Enabled
                      </label>
                      <p className="text-[11px] text-[#888888]">Controls whether the minimap code preview is shown.</p>
                    </div>
                  </div>
                )}

                {/* Editor: Cursor Blinking */}
                {isMatch('cursor blinking animation editor') && (
                  <div className="space-y-1.5 p-3 rounded-lg hover:bg-[#252526] transition-colors">
                    <label className="text-xs font-semibold text-white">Editor: Cursor Blinking</label>
                    <p className="text-[11px] text-[#888888]">Control the cursor animation style.</p>
                    <select
                      value={settings.cursorBlinking}
                      onChange={e => updateSetting('cursorBlinking', e.target.value as any)}
                      className="w-48 bg-[#3c3c3c] text-white text-xs px-2.5 py-1 rounded border border-[#2b2b2b] focus:outline-none focus:border-[#007acc]"
                    >
                      <option value="smooth">smooth</option>
                      <option value="blink">blink</option>
                      <option value="phase">phase</option>
                      <option value="expand">expand</option>
                      <option value="solid">solid</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* 2. FILES & AUTOSAVE */}
            {(activeCategory === 'files' || activeCategory === 'commonly_used' || searchQuery) && (
              <div className="space-y-6">
                <div className="border-b border-[#2d2d2d] pb-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px] text-[#007acc]">
                    Files & Auto Save
                  </h3>
                </div>

                {/* Files: Auto Save */}
                {isMatch('auto save files save delay') && (
                  <div className="space-y-1.5 p-3 rounded-lg hover:bg-[#252526] transition-colors">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white">Files: Auto Save</label>
                      {settings.autoSave !== DEFAULT_SETTINGS.autoSave && (
                        <button onClick={() => resetSetting('autoSave')} className="text-[10px] text-[#888888] hover:text-white flex items-center gap-1">
                          <RotateCcw size={10} /> Reset
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-[#888888]">Controls auto save of editors that have unsaved changes.</p>
                    <select
                      value={settings.autoSave}
                      onChange={e => updateSetting('autoSave', e.target.value as any)}
                      className="w-64 bg-[#3c3c3c] text-white text-xs px-2.5 py-1 rounded border border-[#2b2b2b] focus:outline-none focus:border-[#007acc]"
                    >
                      <option value="afterDelay">afterDelay (configured delay)</option>
                      <option value="onFocusChange">onFocusChange (when editor loses focus)</option>
                      <option value="off">off (an editor must be saved explicitly)</option>
                    </select>
                  </div>
                )}

                {/* Files: Auto Save Delay */}
                {settings.autoSave === 'afterDelay' && isMatch('auto save delay milliseconds files') && (
                  <div className="space-y-1.5 p-3 rounded-lg hover:bg-[#252526] transition-colors">
                    <label className="text-xs font-semibold text-white">Files: Auto Save Delay</label>
                    <p className="text-[11px] text-[#888888]">Controls the delay in milliseconds after which the file is automatically saved.</p>
                    <input
                      type="number"
                      step={100}
                      min={100}
                      max={10000}
                      value={settings.autoSaveDelay}
                      onChange={e => updateSetting('autoSaveDelay', Number(e.target.value) || 1000)}
                      className="w-32 bg-[#3c3c3c] text-white text-xs px-2.5 py-1 rounded border border-[#2b2b2b] focus:outline-none focus:border-[#007acc]"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 3. WORKBENCH & APPEARANCE */}
            {(activeCategory === 'workbench' || searchQuery) && (
              <div className="space-y-6">
                <div className="border-b border-[#2d2d2d] pb-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px] text-[#007acc]">
                    Workbench & Appearance
                  </h3>
                </div>

                {/* Color Theme */}
                {isMatch('color theme workbench dark light appearance') && (
                  <div className="space-y-1.5 p-3 rounded-lg hover:bg-[#252526] transition-colors">
                    <label className="text-xs font-semibold text-white">Workbench: Color Theme</label>
                    <p className="text-[11px] text-[#888888]">Specifies the color theme used in the workbench.</p>
                    <select
                      value={settings.theme || settings.colorTheme}
                      onChange={e => {
                        updateSetting('theme', e.target.value);
                        updateSetting('colorTheme', e.target.value as any);
                      }}
                      className="w-64 bg-[#3c3c3c] text-white text-xs px-2.5 py-1 rounded border border-[#2b2b2b] focus:outline-none focus:border-[#007acc]"
                    >
                      <option value="Dark+ (default dark)">Dark+ (default dark)</option>
                      <option value="AMOLED (Pure Black)">AMOLED (Pure Black)</option>
                      <option value="Monokai">Monokai</option>
                      <option value="Solarized Dark">Solarized Dark</option>
                      <option value="Quiet Light">Quiet Light</option>
                    </select>
                  </div>
                )}

                {/* Show Breadcrumbs */}
                {isMatch('breadcrumbs path navigation workbench') && (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#252526] transition-colors">
                    <input
                      type="checkbox"
                      id="showBreadcrumbs"
                      checked={settings.showBreadcrumbs}
                      onChange={e => updateSetting('showBreadcrumbs', e.target.checked)}
                      className="mt-0.5 accent-[#007acc] w-4 h-4 rounded"
                    />
                    <div>
                      <label htmlFor="showBreadcrumbs" className="text-xs font-semibold text-white cursor-pointer">
                        Breadcrumbs: Enabled
                      </label>
                      <p className="text-[11px] text-[#888888]">Enable/disable interactive file breadcrumbs navigation above editor.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. INTEGRATED TERMINAL */}
            {(activeCategory === 'terminal' || searchQuery) && (
              <div className="space-y-6">
                <div className="border-b border-[#2d2d2d] pb-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px] text-[#007acc]">
                    Integrated Terminal
                  </h3>
                </div>

                {/* Terminal Font Size */}
                {isMatch('terminal font size console integrated') && (
                  <div className="space-y-1.5 p-3 rounded-lg hover:bg-[#252526] transition-colors">
                    <label className="text-xs font-semibold text-white">Terminal &gt; Integrated: Font Size</label>
                    <p className="text-[11px] text-[#888888]">Controls the font size in pixels of the integrated terminal.</p>
                    <input
                      type="number"
                      min={10}
                      max={28}
                      value={settings.terminalFontSize}
                      onChange={e => updateSetting('terminalFontSize', Number(e.target.value) || 13)}
                      className="w-32 bg-[#3c3c3c] text-white text-xs px-2.5 py-1 rounded border border-[#2b2b2b] focus:outline-none focus:border-[#007acc]"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 5. CLOUD AI PROVIDERS */}
            {(activeCategory === 'ai' || searchQuery) && (
              <div className="space-y-6">
                <div className="border-b border-[#2d2d2d] pb-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px] text-[#007acc]">
                    Cloud AI Providers
                  </h3>
                </div>

                <div className="space-y-4 p-4 bg-[#252526] border border-[#333333] rounded-lg">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white">Active AI Provider</label>
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
                      className="w-72 bg-[#3c3c3c] text-white text-xs px-2.5 py-1 rounded border border-[#2b2b2b] focus:outline-none focus:border-[#007acc]"
                    >
                      <option value="gemini">Gemini</option>
                      <option value="openrouter">OpenRouter</option>
                      <option value="nvidia">NVIDIA</option>
                      <option value="groq">Grok</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white">Provider API Key</label>
                    <input
                      type="password"
                      value={settings.aiApiKey}
                      onChange={e => updateSetting('aiApiKey', e.target.value)}
                      placeholder={settings.aiProvider === 'ollama' ? 'Optional for local Ollama' : 'Enter API key'}
                      className="w-full max-w-md bg-[#3c3c3c] text-white text-xs px-2.5 py-1 rounded border border-[#2b2b2b] focus:outline-none focus:border-[#007acc]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white">Default Model Name</label>
                    <input
                      type="text"
                      value={settings.aiModel}
                      onChange={e => updateSetting('aiModel', e.target.value)}
                      placeholder="e.g. gemini-1.5-flash, llama-3.3-70b-versatile..."
                      className="w-full max-w-md bg-[#3c3c3c] text-white text-xs px-2.5 py-1 rounded border border-[#2b2b2b] focus:outline-none focus:border-[#007acc]"
                    />
                  </div>

                  {(settings.aiProvider === 'custom_api' || settings.aiProvider === 'ollama') && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white">Endpoint URL</label>
                      <input
                        type="text"
                        value={settings.aiCustomEndpoint || ''}
                        onChange={e => updateSetting('aiCustomEndpoint' as any, e.target.value)}
                        placeholder="http://localhost:11434/v1"
                        className="w-full max-w-md bg-[#3c3c3c] text-white text-xs px-2.5 py-1 rounded border border-[#2b2b2b] focus:outline-none focus:border-[#007acc]"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. GIT & GITHUB */}
            {(activeCategory === 'git' || searchQuery) && (
              <div className="space-y-6">
                <div className="border-b border-[#2d2d2d] pb-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px] text-[#007acc]">
                    Git & GitHub Integration
                  </h3>
                </div>

                <div className="space-y-3 p-4 bg-[#252526] border border-[#333333] rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitBranch size={16} className="text-cyan-400" />
                      <span className="font-bold text-white text-xs">GitHub Authentication</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">
                      Connected
                    </span>
                  </div>
                  <p className="text-[11px] text-[#888888]">
                    Connect your GitHub Personal Access Token to clone, commit, push, and sync repositories directly inside Elix IDE.
                  </p>
                  <input
                    type="password"
                    value={settings.githubToken}
                    onChange={e => updateSetting('githubToken', e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full max-w-md bg-[#3c3c3c] text-white text-xs px-2.5 py-1 rounded border border-[#2b2b2b] focus:outline-none focus:border-[#007acc]"
                  />
                </div>
              </div>
            )}

            {/* 7. PRIVACY & SECURITY */}
            {(activeCategory === 'privacy' || searchQuery) && (
              <div className="space-y-6">
                <div className="border-b border-[#2d2d2d] pb-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px] text-[#007acc]">
                    Privacy & Security
                  </h3>
                </div>

                <div className="p-4 bg-[#252526] border border-[#333333] rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-emerald-400" />
                    <span className="font-bold text-white text-xs">Elix Privacy Guarantees</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 text-[11px] text-[#888888]">
                    <li>Projects and practice code remain stored locally on your machine.</li>
                    <li>Code is only transmitted to AI providers upon your explicit request.</li>
                    <li>Telemetry is strictly opt-in and off by default.</li>
                    <li>API keys and authentication tokens are kept isolated and encrypted in user storage.</li>
                  </ul>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#2d2d2d] flex items-center justify-between bg-[#252526] text-xs select-none">
          <span className="text-[11px] text-[#777777]">
            Elix IDE Universal Settings Engine • Changes apply in real time
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1 bg-[#007acc] hover:bg-[#0062a3] text-white text-xs font-medium rounded transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
