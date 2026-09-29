import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Square, 
  RotateCw, 
  Search, 
  Sparkles,
  PanelLeft,
  PanelBottom,
  PanelRight,
  Wifi,
  HardDrive,
  WifiOff,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { ConnectionState, ProjectMetadata } from '../../types';
import { ElixLogo } from '../Common/ElixLogo';

interface MenuBarProps {
  activeProject: ProjectMetadata | null;
  activeFileName?: string;
  onOpenFolder: () => void;
  onOpenFile?: () => void;
  onNewFile: () => void;
  onSaveActiveFile: () => void;
  onCloseFolder: () => void;
  onToggleSidebar: () => void;
  onToggleBottomPanel: () => void;
  onToggleAi: () => void;
  isAiOpen: boolean;
  onOpenSearch: (initialQuery?: string) => void;
  onOpenSettings: () => void;
  onSelectView: (view: any) => void;
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
  onRestart: () => void;
  connectionState: ConnectionState;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  activeProject,
  activeFileName,
  onOpenFolder,
  onOpenFile,
  onNewFile,
  onSaveActiveFile,
  onCloseFolder,
  onToggleSidebar,
  onToggleBottomPanel,
  onToggleAi,
  isAiOpen,
  onOpenSearch,
  onOpenSettings,
  onSelectView,
  isRunning,
  onRun,
  onStop,
  onRestart,
  connectionState
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let unmounted = false;
    window.elix?.isWindowMaximized?.().then((max: boolean) => {
      if (!unmounted && typeof max === 'boolean') {
        setIsMaximized(max);
      }
    }).catch(() => {});

    const unsubscribe = window.elix?.onWindowStateChange?.((state: { isMaximized: boolean }) => {
      if (!unmounted && state && typeof state.isMaximized === 'boolean') {
        setIsMaximized(state.isMaximized);
      }
    });

    return () => {
      unmounted = true;
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleToggleMaximize = async () => {
    try {
      const res = await window.elix?.maximize();
      if (typeof res === 'boolean') {
        setIsMaximized(res);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (menuName: string) => {
    setActiveMenu(prev => (prev === menuName ? null : menuName));
  };

  const closeMenu = () => setActiveMenu(null);

  return (
    <div 
      ref={menuRef}
      className="h-[34px] bg-[var(--ide-title-bg)] border-b border-[var(--ide-border)] flex items-center justify-between pl-2 pr-0 text-[var(--ide-text)] text-[12px] select-none z-50 [app-region:drag]"
    >
      {/* Left: App Icon & Standard File Menus */}
      <div className="flex items-center gap-1 [app-region:no-drag]">
        {/* Elix Logo */}
        <div className="mr-1.5 flex items-center">
          <ElixLogo 
            size={18} 
            symbolOnly={true} 
            showBackground={false}
            onClick={() => onSelectView('welcome')}
            title="Elix IDE — Welcome (Home)"
          />
        </div>

        {/* File Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('file')}
            className={`px-2 py-1 rounded hover:bg-[var(--ide-hover-bg)] transition-colors ${activeMenu === 'file' ? 'bg-[var(--ide-hover-bg)] text-[var(--ide-text)]' : ''}`}
          >
            File
          </button>
          {activeMenu === 'file' && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-[var(--ide-sidebar-bg)] border border-[var(--ide-border)] rounded shadow-2xl py-1 z-50 text-[12px] text-[var(--ide-text)]">
              <button 
                onClick={() => { onNewFile(); closeMenu(); }}
                className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white"
              >
                <span>New File...</span>
                <span className="text-[var(--ide-text-muted)] text-[10px]">Ctrl+N</span>
              </button>
              <button 
                onClick={() => { onOpenFile?.(); closeMenu(); }}
                className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white"
              >
                <span>Open File...</span>
                <span className="text-[var(--ide-text-muted)] text-[10px]">Ctrl+O</span>
              </button>
              <button 
                onClick={() => { onOpenFolder(); closeMenu(); }}
                className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white"
              >
                <span>Open Folder...</span>
                <span className="text-[var(--ide-text-muted)] text-[10px]">Ctrl+K Ctrl+O</span>
              </button>
              <div className="h-[1px] bg-[var(--ide-border)] my-1" />
              <button 
                onClick={() => { onSaveActiveFile(); closeMenu(); }}
                className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white"
              >
                <span>Save</span>
                <span className="text-[var(--ide-text-muted)] text-[10px]">Ctrl+S</span>
              </button>
              <div className="h-[1px] bg-[var(--ide-border)] my-1" />
              <button 
                onClick={() => { onCloseFolder(); closeMenu(); }}
                className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white"
              >
                <span>Close Folder</span>
                <span className="text-[var(--ide-text-muted)] text-[10px]">Ctrl+K F</span>
              </button>
              <div className="h-[1px] bg-[var(--ide-border)] my-1" />
              <button 
                onClick={() => window.elix?.close()}
                className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white"
              >
                <span>Exit</span>
                <span className="text-[var(--ide-text-muted)] text-[10px]">Alt+F4</span>
              </button>
            </div>
          )}
        </div>

        {/* Edit Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('edit')}
            className={`px-2 py-1 rounded hover:bg-[var(--ide-hover-bg)] transition-colors ${activeMenu === 'edit' ? 'bg-[var(--ide-hover-bg)] text-[var(--ide-text)]' : ''}`}
          >
            Edit
          </button>
          {activeMenu === 'edit' && (
            <div className="absolute top-full left-0 mt-1 w-52 bg-[var(--ide-sidebar-bg)] border border-[var(--ide-border)] rounded shadow-2xl py-1 z-50 text-[12px] text-[var(--ide-text)]">
              <button onClick={closeMenu} className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white">
                <span>Undo</span>
                <span className="text-[var(--ide-text-muted)] text-[10px]">Ctrl+Z</span>
              </button>
              <button onClick={closeMenu} className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white">
                <span>Redo</span>
                <span className="text-[var(--ide-text-muted)] text-[10px]">Ctrl+Y</span>
              </button>
              <div className="h-[1px] bg-[var(--ide-border)] my-1" />
              <button onClick={() => { onOpenSearch?.('%'); closeMenu(); }} className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white">
                <span>Find in Files...</span>
                <span className="text-[var(--ide-text-muted)] text-[10px]">Ctrl+Shift+F</span>
              </button>
            </div>
          )}
        </div>

        {/* Selection Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('selection')}
            className={`px-2 py-1 rounded hover:bg-[var(--ide-hover-bg)] transition-colors ${activeMenu === 'selection' ? 'bg-[var(--ide-hover-bg)] text-[var(--ide-text)]' : ''}`}
          >
            Selection
          </button>
          {activeMenu === 'selection' && (
            <div className="absolute top-full left-0 mt-1 w-52 bg-[var(--ide-sidebar-bg)] border border-[var(--ide-border)] rounded shadow-2xl py-1 z-50 text-[12px] text-[var(--ide-text)]">
              <button onClick={closeMenu} className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white">
                <span>Select All</span>
                <span className="text-[var(--ide-text-muted)] text-[10px]">Ctrl+A</span>
              </button>
            </div>
          )}
        </div>

        {/* View Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('view')}
            className={`px-2 py-1 rounded hover:bg-[var(--ide-hover-bg)] transition-colors ${activeMenu === 'view' ? 'bg-[var(--ide-hover-bg)] text-[var(--ide-text)]' : ''}`}
          >
            View
          </button>
          {activeMenu === 'view' && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-[var(--ide-sidebar-bg)] border border-[var(--ide-border)] rounded shadow-2xl py-1 z-50 text-[12px] text-[var(--ide-text)]">
              <button onClick={() => { onOpenSearch?.('>'); closeMenu(); }} className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white">
                <span>Command Palette...</span>
                <span className="text-[var(--ide-text-muted)] text-[10px]">Ctrl+Shift+P</span>
              </button>
              <button onClick={() => { onOpenSearch?.(''); closeMenu(); }} className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white">
                <span>Open View...</span>
              </button>
              <div className="h-[1px] bg-[var(--ide-border)] my-1" />
              <button onClick={() => { onSelectView('editor'); closeMenu(); }} className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white">
                <span>Explorer</span>
                <span className="text-[var(--ide-text-muted)] text-[10px]">Ctrl+Shift+E</span>
              </button>
              <button onClick={() => { onSelectView('practice'); closeMenu(); }} className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white">
                <span>Practice & DSA Hub</span>
              </button>
              <button onClick={() => { onSelectView('hackathon'); closeMenu(); }} className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white">
                <span>Hackathons</span>
              </button>
              <button onClick={() => { onSelectView('career'); closeMenu(); }} className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white">
                <span>Career Dashboard</span>
              </button>
              <div className="h-[1px] bg-[var(--ide-border)] my-1" />
              <button onClick={() => { onToggleBottomPanel(); closeMenu(); }} className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white">
                <span>Terminal Panel</span>
                <span className="text-[var(--ide-text-muted)] text-[10px]">Ctrl+`</span>
              </button>
              <button onClick={() => { onToggleAi(); closeMenu(); }} className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white">
                <span>AI Coding Agent</span>
                <span className="text-[var(--ide-text-muted)] text-[10px]">Ctrl+I</span>
              </button>
            </div>
          )}
        </div>

        {/* Go Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('go')}
            className={`px-2 py-1 rounded hover:bg-[var(--ide-hover-bg)] transition-colors ${activeMenu === 'go' ? 'bg-[var(--ide-hover-bg)] text-[var(--ide-text)]' : ''}`}
          >
            Go
          </button>
          {activeMenu === 'go' && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-[var(--ide-sidebar-bg)] border border-[var(--ide-border)] rounded shadow-2xl py-1 z-50 text-[12px] text-[var(--ide-text)]">
              <button onClick={() => { onOpenSearch?.(''); closeMenu(); }} className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white">
                <span>Go to File...</span>
                <span className="text-[var(--ide-text-muted)] text-[10px]">Ctrl+P</span>
              </button>
              <button onClick={() => { onOpenSearch?.('@'); closeMenu(); }} className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white">
                <span>Go to Symbol in Editor...</span>
                <span className="text-[var(--ide-text-muted)] text-[10px]">Ctrl+Shift+O</span>
              </button>
              <button onClick={() => { onOpenSearch?.(':'); closeMenu(); }} className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white">
                <span>Go to Line/Column...</span>
                <span className="text-[var(--ide-text-muted)] text-[10px]">Ctrl+G</span>
              </button>
            </div>
          )}
        </div>

        {/* Run Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('run')}
            className={`px-2 py-1 rounded hover:bg-[var(--ide-hover-bg)] transition-colors ${activeMenu === 'run' ? 'bg-[var(--ide-hover-bg)] text-[var(--ide-text)]' : ''}`}
          >
            Run
          </button>
          {activeMenu === 'run' && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-[var(--ide-sidebar-bg)] border border-[var(--ide-border)] rounded shadow-2xl py-1 z-50 text-[12px] text-[var(--ide-text)]">
              <button onClick={() => { onRun(); closeMenu(); }} className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white">
                <span>Start Run</span>
                <span className="text-[var(--ide-text-muted)] text-[10px]">F5</span>
              </button>
              <button onClick={() => { onStop(); closeMenu(); }} className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white">
                <span>Stop Execution</span>
                <span className="text-[var(--ide-text-muted)] text-[10px]">Shift+F5</span>
              </button>
              <button onClick={() => { onRestart(); closeMenu(); }} className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white">
                <span>Restart</span>
                <span className="text-[var(--ide-text-muted)] text-[10px]">Ctrl+Shift+F5</span>
              </button>
            </div>
          )}
        </div>

        {/* Terminal Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('terminal')}
            className={`px-2 py-1 rounded hover:bg-[var(--ide-hover-bg)] transition-colors ${activeMenu === 'terminal' ? 'bg-[var(--ide-hover-bg)] text-[var(--ide-text)]' : ''}`}
          >
            Terminal
          </button>
          {activeMenu === 'terminal' && (
            <div className="absolute top-full left-0 mt-1 w-52 bg-[var(--ide-sidebar-bg)] border border-[var(--ide-border)] rounded shadow-2xl py-1 z-50 text-[12px] text-[var(--ide-text)]">
              <button onClick={() => { onToggleBottomPanel(); closeMenu(); }} className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white">
                <span>New Terminal</span>
                <span className="text-[var(--ide-text-muted)] text-[10px]">Ctrl+Shift+`</span>
              </button>
            </div>
          )}
        </div>

        {/* Help Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('help')}
            className={`px-2 py-1 rounded hover:bg-[var(--ide-hover-bg)] transition-colors ${activeMenu === 'help' ? 'bg-[var(--ide-hover-bg)] text-[var(--ide-text)]' : ''}`}
          >
            Help
          </button>
          {activeMenu === 'help' && (
            <div className="absolute top-full left-0 mt-1 w-52 bg-[var(--ide-sidebar-bg)] border border-[var(--ide-border)] rounded shadow-2xl py-1 z-50 text-[12px] text-[var(--ide-text)]">
              <button onClick={() => { onSelectView('welcome'); closeMenu(); }} className="w-full px-3 py-1.5 hover:bg-[#007acc] hover:text-white text-left">
                Welcome / Get Started
              </button>
              <button onClick={() => { onOpenSettings(); closeMenu(); }} className="w-full px-3 py-1.5 hover:bg-[#007acc] hover:text-white text-left">
                Documentation & Settings
              </button>
              <div className="h-[1px] bg-[var(--ide-border)] my-1" />
              <button onClick={() => { alert('Elix IDE v1.0.0\nUniversal Development Environment\nNode v24 • Python 3.12 • OpenJDK 17 LTS'); closeMenu(); }} className="w-full px-3 py-1.5 hover:bg-[#007acc] hover:text-white text-left">
                About Elix IDE
              </button>
            </div>
          )}
        </div>

        {/* Navigation Arrows (VS Code Parity) */}
        <div className="flex items-center gap-0.5 ml-2 text-[var(--ide-text-muted)]">
          <button 
            title="Go Back (Alt+Left)"
            onClick={() => window.history.back?.()}
            className="p-1 hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)] rounded transition-colors"
          >
            <ArrowLeft size={13} />
          </button>
          <button 
            title="Go Forward (Alt+Right)"
            onClick={() => window.history.forward?.()}
            className="p-1 hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)] rounded transition-colors"
          >
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Center: Search / Title Command Palette (Dead Center Antigravity Style) */}
      <div className="absolute left-1/2 -translate-x-1/2 w-[440px] max-w-[38%] [app-region:no-drag]">
        <button
          onClick={() => onOpenSearch('')}
          className="w-full h-[22px] bg-[var(--ide-input-bg)] hover:bg-[var(--ide-hover-bg)] border border-[var(--ide-border)] rounded-md flex items-center justify-between px-3 text-[var(--ide-text)] text-[11px] transition-colors shadow-sm"
        >
          <div className="flex items-center gap-2 truncate">
            <Search size={11} className="text-[var(--ide-text-muted)] shrink-0" />
            <span className="truncate text-[var(--ide-text)]">
              {activeProject && activeFileName 
                ? `${activeProject.name} - Elix IDE - ${activeFileName}` 
                : activeProject 
                ? `${activeProject.name} - Elix IDE` 
                : activeFileName 
                ? `Elix IDE - ${activeFileName}` 
                : 'Elix IDE'}
            </span>
          </div>
          <kbd className="text-[10px] bg-[var(--ide-title-bg)] text-[var(--ide-text-muted)] px-1.5 rounded border border-[var(--ide-border)]">Ctrl+P</kbd>
        </button>
      </div>

      {/* Right: Run Actions, Layout Controls & Windows Controls */}
      <div className="flex items-center h-full gap-2 [app-region:no-drag]">
        {/* Run Controls */}
        <div className="flex items-center gap-1 mr-2">
          {!isRunning ? (
            <button
              onClick={onRun}
              title="Run Project (F5)"
              className="flex items-center gap-1 px-2.5 py-0.5 bg-[#0e639c] hover:bg-[#1177bb] text-white rounded text-[11px] font-medium shadow-sm transition-colors active:scale-95"
            >
              <Play size={11} fill="white" />
              <span>Run</span>
            </button>
          ) : (
            <button
              onClick={onStop}
              title="Stop Execution (Shift+F5)"
              className="flex items-center gap-1 px-2.5 py-0.5 bg-[#e51400] hover:bg-[#c71000] text-white rounded text-[11px] font-medium shadow-sm transition-colors animate-pulse"
            >
              <Square size={11} fill="white" />
              <span>Stop</span>
            </button>
          )}
          <button
            onClick={onRestart}
            title="Restart Execution"
            className="p-1 hover:bg-[var(--ide-hover-bg)] rounded text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]"
          >
            <RotateCw size={12} />
          </button>
        </div>


        {/* Top Header AI Agent Button (Professional Icon-Only) */}
        <button
          onClick={onToggleAi}
          title="AI Agent (Ctrl+I)"
          className={`p-1.5 rounded transition-colors flex items-center justify-center ${
            isAiOpen 
              ? 'text-[var(--ide-accent)] bg-[var(--ide-hover-bg)] border border-[var(--ide-border)]' 
              : 'text-[var(--ide-text-muted)] hover:text-[var(--ide-text)] hover:bg-[var(--ide-hover-bg)]'
          }`}
        >
          <Sparkles size={14} className={isAiOpen ? 'text-[var(--ide-accent)]' : 'text-[var(--ide-text-muted)] group-hover:text-[var(--ide-accent)]'} />
        </button>

        {/* Layout Icons (VS Code Parity) */}
        <div className="flex items-center gap-0.5 text-[var(--ide-text-muted)] border-l border-[var(--ide-border)] pl-2">
          <button
            onClick={onToggleSidebar}
            title="Toggle Primary Side Bar (Ctrl+B)"
            className="p-1 hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)] rounded transition-colors"
          >
            <PanelLeft size={13} />
          </button>
          <button
            onClick={onToggleBottomPanel}
            title="Toggle Panel (Ctrl+`)"
            className="p-1 hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)] rounded transition-colors"
          >
            <PanelBottom size={13} />
          </button>
          <button
            onClick={onToggleAi}
            title="Toggle Secondary Side Bar (Ctrl+Alt+B)"
            className={`p-1 rounded transition-colors ${isAiOpen ? 'text-[var(--ide-text)] bg-[var(--ide-hover-bg)]' : 'hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)]'}`}
          >
            <PanelRight size={13} />
          </button>
        </div>

        {/* Window controls (Windows 11 Native Overlay or Fallback HTML Controls) */}
        {window.elix?.hasNativeTitleBar ? (
          <div className="w-[138px] h-full shrink-0 [app-region:no-drag]" />
        ) : (
          <div className="flex items-center h-full [app-region:no-drag]">
            <button 
              onClick={() => window.elix?.minimize()}
              title="Minimize"
              aria-label="Minimize"
              className="w-[46px] h-full flex items-center justify-center hover:bg-[var(--ide-hover-bg)] text-[var(--ide-text)] transition-colors focus:outline-none"
            >
              <svg width="10" height="1" viewBox="0 0 10 1" className="fill-current">
                <rect width="10" height="1" />
              </svg>
            </button>
            <button 
              onClick={handleToggleMaximize}
              title={isMaximized ? "Restore Down" : "Maximize"}
              aria-label={isMaximized ? "Restore Down" : "Maximize"}
              className="w-[46px] h-full flex items-center justify-center hover:bg-[var(--ide-hover-bg)] text-[var(--ide-text)] transition-colors focus:outline-none"
            >
              {isMaximized ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="stroke-current">
                  <path d="M2.5 0.5h7v7h-1.5" strokeWidth="1" strokeLinecap="square" />
                  <rect x="0.5" y="2.5" width="7" height="7" strokeWidth="1" />
                </svg>
               ) : (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="stroke-current">
                  <rect x="0.5" y="0.5" width="9" height="9" strokeWidth="1" />
                </svg>
              )}
            </button>
            <button 
              onClick={() => window.elix?.close()}
              title="Close"
              aria-label="Close"
              className="w-[46px] h-full flex items-center justify-center hover:bg-[#e81123] hover:text-white text-[var(--ide-text)] transition-colors focus:outline-none"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="stroke-current">
                <path d="M 0.5,0.5 L 9.5,9.5 M 9.5,0.5 L 0.5,9.5" strokeWidth="1.1" strokeLinecap="square" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
