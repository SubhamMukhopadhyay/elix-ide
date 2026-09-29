import React, { useState } from 'react';
import { 
  GitBranch, 
  CheckCircle, 
  Flame, 
  Bell, 
  Zap,
  Check
} from 'lucide-react';

interface StatusBarProps {
  activeLanguage?: string;
  cursorLine?: number;
  cursorCol?: number;
  gitBranch?: string;
  errorCount?: number;
  warningCount?: number;
  practiceStreak?: number;
  onOpenNotifications?: () => void;
  onToggleAi?: () => void;
  isAiActive?: boolean;
  onOpenPractice?: () => void;
  onOpenGit?: () => void;
  onOpenProblems?: () => void;
  onOpenEnvironments?: () => void;
  onOpenSearch?: () => void;
  onFormatDocument?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  activeLanguage = 'TypeScript',
  cursorLine = 1,
  cursorCol = 1,
  gitBranch = 'main',
  errorCount = 0,
  warningCount = 0,
  practiceStreak = 1,
  onOpenNotifications,
  onToggleAi,
  isAiActive = false,
  onOpenPractice,
  onOpenGit,
  onOpenProblems,
  onOpenEnvironments,
  onOpenSearch,
  onFormatDocument
}) => {
  const [indentSize, setIndentSize] = useState<number>(2);
  const [eolMode, setEolMode] = useState<'CRLF' | 'LF'>('CRLF');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2500);
  };

  const handleToggleIndent = () => {
    const next = indentSize === 2 ? 4 : 2;
    setIndentSize(next);
    showToast(`Indentation: Set to Spaces: ${next}`);
  };

  const handleToggleEol = () => {
    const next = eolMode === 'CRLF' ? 'LF' : 'CRLF';
    setEolMode(next);
    showToast(`End of Line: Switched to ${next} (${next === 'CRLF' ? 'Windows' : 'Unix/Linux'})`);
  };

  const handleEncodingClick = () => {
    showToast('File Encoding: UTF-8 (Western / Unicode Standard)');
  };

  const handlePrettierClick = () => {
    if (onFormatDocument) onFormatDocument();
    showToast('Prettier: Document formatted successfully');
  };

  const handleCursorClick = () => {
    if (onOpenSearch) onOpenSearch();
    showToast(`Cursor at Line ${cursorLine}, Column ${cursorCol}. Press Ctrl+P & type :line to jump`);
  };

  const handleLanguageClick = () => {
    if (onOpenSearch) onOpenSearch();
    showToast(`Language Mode: ${activeLanguage}. Press Ctrl+K M to change`);
  };

  const handleNotificationsClick = () => {
    if (onOpenNotifications) {
      onOpenNotifications();
    } else {
      showToast('Notifications: No pending system alerts. All services optimal.');
    }
  };

  return (
    <div className="h-[22px] bg-[var(--ide-statusbar-bg)] text-[var(--ide-statusbar-text)] border-t border-[var(--ide-border)]/30 flex items-center justify-between px-2 text-[11px] select-none z-40 font-sans relative transition-colors duration-150">
      {/* Floating Status Toast */}
      {toastMessage && (
        <div className="absolute bottom-[26px] right-4 bg-[var(--ide-input-bg)] text-[var(--ide-text)] border border-[var(--ide-border)] px-3 py-1.5 rounded-md shadow-2xl flex items-center gap-2 text-xs font-sans animate-fade-in z-50">
          <Check size={13} className="text-[#007acc] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left side items */}
      <div className="flex items-center gap-2">
        {/* Environment status indicator */}
        <button 
          onClick={onOpenEnvironments}
          className="flex items-center gap-1 hover:bg-[var(--ide-statusbar-hover,rgba(255,255,255,0.15))] px-1.5 py-0.5 rounded cursor-pointer transition-colors"
          title="Elix Universal Execution Layer: Bundled Local Runtimes Active (Click to configure)"
        >
          <Zap size={11} fill="currentColor" />
          <span className="font-semibold">Local (Zero-Config)</span>
        </button>

        {/* Git branch */}
        <button 
          onClick={onOpenGit}
          className="flex items-center gap-1 hover:bg-[var(--ide-statusbar-hover,rgba(255,255,255,0.15))] px-1.5 py-0.5 rounded cursor-pointer transition-colors"
          title={`Git repository branch: ${gitBranch} (Click to open Source Control)`}
        >
          <GitBranch size={11} />
          <span>{gitBranch}</span>
        </button>

        {/* Errors & Warnings count */}
        <button 
          onClick={onOpenProblems}
          className="flex items-center gap-2 hover:bg-[var(--ide-statusbar-hover,rgba(255,255,255,0.15))] px-1.5 py-0.5 rounded cursor-pointer transition-colors"
          title="Problems and Diagnostics (Click to open Problems panel)"
        >
          <span className={`flex items-center gap-0.5 ${errorCount > 0 ? 'text-red-400 font-bold' : ''}`}>
            <span className="text-[10px]">⨂</span> {errorCount}
          </span>
          <span className={`flex items-center gap-0.5 ${warningCount > 0 ? 'text-amber-400 font-bold' : ''}`}>
            <span className="text-[10px]">⚠</span> {warningCount}
          </span>
        </button>
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-1">
        {/* Cursor position */}
        <button 
          onClick={handleCursorClick}
          className="hover:bg-[var(--ide-statusbar-hover,rgba(255,255,255,0.15))] px-1.5 py-0.5 rounded cursor-pointer transition-colors"
          title="Go to Line/Column (Click to jump)"
        >
          Ln {cursorLine}, Col {cursorCol}
        </button>

        {/* Indentation */}
        <button 
          onClick={handleToggleIndent}
          className="hover:bg-[var(--ide-statusbar-hover,rgba(255,255,255,0.15))] px-1.5 py-0.5 rounded cursor-pointer transition-colors"
          title="Select Indentation (Click to toggle Spaces: 2 / 4)"
        >
          Spaces: {indentSize}
        </button>

        {/* Encoding */}
        <button 
          onClick={handleEncodingClick}
          className="hover:bg-[var(--ide-statusbar-hover,rgba(255,255,255,0.15))] px-1.5 py-0.5 rounded cursor-pointer transition-colors"
          title="Select Encoding (Click to view)"
        >
          UTF-8
        </button>

        {/* EOL */}
        <button 
          onClick={handleToggleEol}
          className="hover:bg-[var(--ide-statusbar-hover,rgba(255,255,255,0.15))] px-1.5 py-0.5 rounded cursor-pointer transition-colors"
          title="Select End of Line Sequence (Click to toggle CRLF / LF)"
        >
          {eolMode}
        </button>

        {/* Language mode */}
        <button 
          onClick={handleLanguageClick}
          className="hover:bg-[var(--ide-statusbar-hover,rgba(255,255,255,0.15))] px-1.5 py-0.5 rounded cursor-pointer font-medium transition-colors"
          title="Select Language Mode (Click to change)"
        >
          {activeLanguage}
        </button>

        {/* Prettier / Formatter */}
        <button 
          onClick={handlePrettierClick}
          className="hover:bg-[var(--ide-statusbar-hover,rgba(255,255,255,0.15))] px-1.5 py-0.5 rounded cursor-pointer flex items-center gap-1 transition-colors"
          title="Format Document with Prettier (Click to format)"
        >
          <CheckCircle size={10} /> Prettier
        </button>

        {/* Practice Streak badge */}
        {practiceStreak > 0 && (
          <button 
            onClick={onOpenPractice}
            className="hover:bg-[var(--ide-statusbar-hover,rgba(255,255,255,0.15))] px-1.5 py-0.5 rounded cursor-pointer font-bold text-amber-500 dark:text-amber-300 transition-colors"
            title="Daily Practice & Development Streak (Click to open Practice & DSA Hub)"
          >
            🔥 {practiceStreak}d
          </button>
        )}

        {/* Notification Bell */}
        <button 
          onClick={handleNotificationsClick}
          className="hover:bg-[var(--ide-statusbar-hover,rgba(255,255,255,0.15))] p-1 rounded cursor-pointer transition-colors"
          title="Notifications"
        >
          <Bell size={11} />
        </button>
      </div>
    </div>
  );
};
