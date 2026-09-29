import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Split, 
  CheckCircle2, 
  AlertCircle,
  Play,
  Terminal as TerminalIcon,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { ExecutionEvent } from '../../types';

interface TerminalSession {
  id: string;
  name: string;
  type: 'powershell' | 'cmd' | 'bash';
  history: string[];
}

interface VSCodeBottomPanelProps {
  logs: ExecutionEvent[];
  onClearLogs: () => void;
  isRunning: boolean;
  activeProjectDir?: string;
  onClose: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export const VSCodeBottomPanel: React.FC<VSCodeBottomPanelProps> = ({
  logs,
  onClearLogs,
  isRunning,
  activeProjectDir = 'D:/Engineering/Project',
  onClose,
  isMaximized = false,
  onToggleMaximize
}) => {
  const [activeTab, setActiveTab] = useState<'problems' | 'output' | 'debug' | 'terminal' | 'ports'>('terminal');
  
  // Terminal Sessions
  const [sessions, setSessions] = useState<TerminalSession[]>([
    {
      id: '1',
      name: '1: powershell',
      type: 'powershell',
      history: [
        'Windows PowerShell',
        'Copyright (C) Microsoft Corporation. All rights reserved.',
        '',
        `PS ${activeProjectDir}> `
      ]
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>('1');
  const [isSplit, setIsSplit] = useState<boolean>(false);
  const [splitSessionId, setSplitSessionId] = useState<string | null>(null);

  const [terminalInput, setTerminalInput] = useState<string>('');
  const [splitInput, setSplitInput] = useState<string>('');
  const [showSessionDropdown, setShowSessionDropdown] = useState<boolean>(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const splitEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const splitSession = sessions.find(s => s.id === splitSessionId) || null;

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, logs]);

  useEffect(() => {
    splitEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions]);

  // Append execution logs to terminal if active
  useEffect(() => {
    if (logs.length > 0) {
      const last = logs[logs.length - 1];
      if (last.type === 'stdout' || last.type === 'stderr' || last.type === 'status' || last.type === 'exit') {
        setSessions(prev =>
          prev.map(s =>
            s.id === activeSessionId
              ? { ...s, history: [...s.history, last.data] }
              : s
          )
        );
      }
    }
  }, [logs]);

  const handleCommandExecution = async (rawCmd: string, targetSessionId: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    // Local commands
    if (cmd.toLowerCase() === 'cls' || cmd.toLowerCase() === 'clear') {
      setSessions(prev =>
        prev.map(s =>
          s.id === targetSessionId
            ? { ...s, history: [`PS ${activeProjectDir}> `] }
            : s
        )
      );
      return;
    }

    if (cmd.toLowerCase() === 'help') {
      setSessions(prev =>
        prev.map(s =>
          s.id === targetSessionId
            ? {
                ...s,
                history: [
                  ...s.history,
                  cmd,
                  'Elix Universal Terminal v1.0',
                  '  Supported commands: all PowerShell/CMD system commands, gcc, g++, python, node, rustc, cargo, git, npm, dir, cls, exit',
                  `PS ${activeProjectDir}> `
                ]
              }
            : s
        )
      );
      return;
    }

    if (cmd.toLowerCase() === 'exit') {
      handleKillSession(targetSessionId);
      return;
    }

    // Append command to session history
    setSessions(prev =>
      prev.map(s =>
        s.id === targetSessionId
          ? { ...s, history: [...s.history, cmd] }
          : s
      )
    );

    if (window.elix) {
      try {
        const parts = cmd.split(' ');
        await window.elix.run({
          command: parts[0],
          args: parts.slice(1),
          cwd: activeProjectDir
        });
      } catch (err: any) {
        setSessions(prev =>
          prev.map(s =>
            s.id === targetSessionId
              ? {
                  ...s,
                  history: [...s.history, `Error: ${err.message}`, `PS ${activeProjectDir}> `]
                }
              : s
          )
        );
      }
    }
  };

  const handleCreateNewSession = () => {
    const newId = String(Date.now());
    const newName = `${sessions.length + 1}: powershell`;
    const newSession: TerminalSession = {
      id: newId,
      name: newName,
      type: 'powershell',
      history: [
        'Windows PowerShell',
        'Copyright (C) Microsoft Corporation. All rights reserved.',
        '',
        `PS ${activeProjectDir}> `
      ]
    };
    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newId);
  };

  const handleKillSession = (idToKill: string) => {
    if (sessions.length <= 1) {
      // Just clear history
      setSessions([
        {
          id: '1',
          name: '1: powershell',
          type: 'powershell',
          history: [`PS ${activeProjectDir}> `]
        }
      ]);
      setActiveSessionId('1');
      setIsSplit(false);
      setSplitSessionId(null);
      return;
    }

    const remaining = sessions.filter(s => s.id !== idToKill);
    setSessions(remaining);
    if (activeSessionId === idToKill) {
      setActiveSessionId(remaining[0].id);
    }
    if (splitSessionId === idToKill) {
      setIsSplit(false);
      setSplitSessionId(null);
    }
  };

  const handleToggleSplit = () => {
    if (isSplit) {
      setIsSplit(false);
      setSplitSessionId(null);
    } else {
      let other = sessions.find(s => s.id !== activeSessionId);
      if (!other) {
        const newId = String(Date.now());
        other = {
          id: newId,
          name: `${sessions.length + 1}: powershell`,
          type: 'powershell',
          history: [
            'Windows PowerShell',
            'Copyright (C) Microsoft Corporation. All rights reserved.',
            '',
            `PS ${activeProjectDir}> `
          ]
        };
        setSessions(prev => [...prev, other!]);
      }
      setSplitSessionId(other.id);
      setIsSplit(true);
    }
  };

  const errorCount = logs.filter(l => l.type === 'stderr' || l.type === 'error').length;

  return (
    <div className="w-full h-full bg-[var(--ide-panel-bg)] flex flex-col select-none z-30 font-mono text-xs text-[var(--ide-text)]">
      {/* Tab Navigation Header (VS Code Parity) */}
      <div className="h-[32px] px-3 border-b border-[var(--ide-border)] flex items-center justify-between bg-[var(--ide-title-bg)] shrink-0">
        <div className="flex items-center gap-4 text-[11px] font-sans">
          <button
            onClick={() => setActiveTab('problems')}
            className={`py-1.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'problems'
                ? 'border-[var(--ide-accent)] text-[var(--ide-text)] font-semibold'
                : 'border-transparent text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]'
            }`}
          >
            <span>PROBLEMS</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              errorCount > 0 ? 'bg-[#f48771]/20 text-[#f48771]' : 'bg-[var(--ide-input-bg)] text-[var(--ide-text-muted)]'
            }`}>
              {errorCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('output')}
            className={`py-1.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'output'
                ? 'border-[var(--ide-accent)] text-[var(--ide-text)] font-semibold'
                : 'border-transparent text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]'
            }`}
          >
            <span>OUTPUT</span>
            {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
          </button>

          <button
            onClick={() => setActiveTab('debug')}
            className={`py-1.5 border-b-2 transition-colors ${
              activeTab === 'debug'
                ? 'border-[var(--ide-accent)] text-[var(--ide-text)] font-semibold'
                : 'border-transparent text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]'
            }`}
          >
            DEBUG CONSOLE
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`py-1.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'terminal'
                ? 'border-[var(--ide-accent)] text-[var(--ide-text)] font-semibold'
                : 'border-transparent text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]'
            }`}
          >
            <span>TERMINAL</span>
            <span className="text-[10px] text-[var(--ide-text-muted)] font-mono">{activeSession.type}</span>
          </button>

          <button
            onClick={() => setActiveTab('ports')}
            className={`py-1.5 border-b-2 transition-colors ${
              activeTab === 'ports'
                ? 'border-[var(--ide-accent)] text-[var(--ide-text)] font-semibold'
                : 'border-transparent text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]'
            }`}
          >
            PORTS
          </button>
        </div>

        {/* Panel Action Controls (VS Code Top Right Icons) */}
        <div className="flex items-center gap-1.5 text-[var(--ide-text-muted)]">
          {activeTab === 'terminal' && (
            <div className="flex items-center gap-1 mr-1 pr-2 border-r border-[var(--ide-border)]">
              {/* Terminal session dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSessionDropdown(prev => !prev)}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-sans hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)]"
                  title="Select Terminal Session"
                >
                  <TerminalIcon size={12} className="text-[var(--ide-accent)]" />
                  <span>{activeSession.name}</span>
                  <ChevronDown size={11} />
                </button>

                {showSessionDropdown && (
                  <div className="absolute top-full right-0 mt-1 w-44 bg-[#252526] border border-[#454545] rounded shadow-2xl py-1 z-50 text-[11px] font-sans">
                    {sessions.map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setActiveSessionId(s.id);
                          setShowSessionDropdown(false);
                        }}
                        className={`px-3 py-1.5 flex items-center justify-between cursor-pointer hover:bg-[#094771] hover:text-white ${
                          s.id === activeSessionId ? 'bg-[#04395e] text-white font-medium' : 'text-[#cccccc]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <TerminalIcon size={12} />
                          <span className="truncate">{s.name}</span>
                        </div>
                        {sessions.length > 1 && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleKillSession(s.id);
                            }}
                            className="text-[#888888] hover:text-[#f48771]"
                            title="Kill Terminal"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* New Terminal button */}
              <button
                onClick={handleCreateNewSession}
                title="New Terminal (Ctrl+Shift+`)"
                className="p-1 hover:bg-[#333333] hover:text-white rounded"
              >
                <Plus size={13} />
              </button>

              {/* Split Terminal button */}
              <button
                onClick={handleToggleSplit}
                title={isSplit ? 'Unsplit Terminal' : 'Split Terminal (Ctrl+Shift+5)'}
                className={`p-1 rounded ${isSplit ? 'text-white bg-[#333333]' : 'hover:bg-[#333333] hover:text-white'}`}
              >
                <Split size={13} />
              </button>

              {/* Kill Terminal button */}
              <button
                onClick={() => handleKillSession(activeSessionId)}
                title="Kill Terminal"
                className="p-1 hover:bg-[#333333] hover:text-rose-400 rounded"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}

          {activeTab !== 'terminal' && (
            <button
              onClick={onClearLogs}
              title="Clear Output"
              className="p-1 hover:bg-[#333333] hover:text-white rounded mr-1"
            >
              <Trash2 size={13} />
            </button>
          )}

          {/* Toggle Panel Size (Maximize / Restore) */}
          {onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              title={isMaximized ? 'Restore Panel Size' : 'Maximize Panel Size'}
              className="p-1 hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)] rounded"
            >
              {isMaximized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          )}

          {/* Close Panel */}
          <button
            onClick={onClose}
            title="Close Panel (Ctrl+`)"
            className="p-1 hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)] rounded"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Tab Body Content */}
      <div className="flex-1 overflow-hidden p-2 bg-[var(--ide-panel-bg)] font-mono text-[12px]">
        {/* 1. Terminal Tab */}
        {activeTab === 'terminal' && (
          <div className="h-full flex gap-2 overflow-hidden">
            {/* Primary Session Pane */}
            <div className="flex-1 h-full flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-0.5 select-text pr-1">
                {activeSession.history.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap leading-relaxed text-[var(--ide-text)] font-mono">
                    {line}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleCommandExecution(terminalInput, activeSession.id);
                  setTerminalInput('');
                }}
                className="flex items-center gap-1.5 pt-1.5 border-t border-[var(--ide-border)] shrink-0"
              >
                <span className="text-[var(--ide-accent)] font-bold shrink-0">PS {activeProjectDir}&gt;</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={e => setTerminalInput(e.target.value)}
                  autoFocus
                  className="flex-1 bg-transparent text-[var(--ide-text)] outline-none font-mono text-xs"
                  placeholder=""
                />
              </form>
            </div>

            {/* Split Session Pane */}
            {isSplit && splitSession && (
              <div className="flex-1 h-full flex flex-col justify-between overflow-hidden border-l border-[var(--ide-border)] pl-2">
                <div className="flex items-center justify-between pb-1 border-b border-[var(--ide-border)] text-[10px] text-[var(--ide-text-muted)] font-sans">
                  <span>{splitSession.name}</span>
                  <button
                    onClick={() => setIsSplit(false)}
                    className="hover:text-[var(--ide-text)]"
                    title="Close Split Pane"
                  >
                    <X size={11} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-0.5 select-text pr-1">
                  {splitSession.history.map((line, idx) => (
                    <div key={idx} className="whitespace-pre-wrap leading-relaxed text-[var(--ide-text)] font-mono">
                      {line}
                    </div>
                  ))}
                  <div ref={splitEndRef} />
                </div>

                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleCommandExecution(splitInput, splitSession.id);
                    setSplitInput('');
                  }}
                  className="flex items-center gap-1.5 pt-1.5 border-t border-[var(--ide-border)] shrink-0"
                >
                  <span className="text-emerald-500 font-bold shrink-0">PS {activeProjectDir}&gt;</span>
                  <input
                    type="text"
                    value={splitInput}
                    onChange={e => setSplitInput(e.target.value)}
                    className="flex-1 bg-transparent text-[var(--ide-text)] outline-none font-mono text-xs"
                    placeholder=""
                  />
                </form>
              </div>
            )}
          </div>
        )}

        {/* 2. Output Tab */}
        {activeTab === 'output' && (
          <div className="h-full overflow-y-auto space-y-1 select-text">
            {logs.length === 0 ? (
              <div className="text-[var(--ide-text-muted)] italic">No output generated. Press F5 or click ▶ Run to execute workspace.</div>
            ) : (
              logs.map((log, idx) => (
                <div 
                  key={idx} 
                  className={`leading-relaxed ${
                    log.type === 'stderr' || log.type === 'error' 
                      ? 'text-[#f48771]' 
                      : log.type === 'status' 
                      ? 'text-[#007acc] dark:text-cyan-400 font-semibold' 
                      : 'text-[var(--ide-text)]'
                  }`}
                >
                  <span className="text-[var(--ide-text-muted)] mr-2">[{log.timestamp}]</span>
                  {log.data}
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. Problems Tab */}
        {activeTab === 'problems' && (
          <div className="h-full overflow-y-auto">
            {errorCount === 0 ? (
              <div className="flex items-center gap-2 text-emerald-400 py-2">
                <CheckCircle2 size={15} />
                <span className="font-sans text-xs">No problems have been detected in the workspace.</span>
              </div>
            ) : (
              <div className="space-y-1">
                {logs
                  .filter(l => l.type === 'stderr' || l.type === 'error')
                  .map((err, i) => (
                    <div key={i} className="p-2 bg-[#2d1b1b] border border-[#5a1d1d] rounded text-[#f48771] flex items-start gap-2">
                      <AlertCircle size={14} className="shrink-0 mt-0.5 text-[#f48771]" />
                      <div className="leading-snug select-text">
                        <span className="text-[10px] text-[#888888] font-sans mr-2">[{err.timestamp}] Error:</span>
                        {err.data}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* 4. Debug Console */}
        {activeTab === 'debug' && (
          <div className="h-full flex flex-col justify-between">
            <div className="text-[#666666] italic">
              Debug session inactive. Press F5 to start run and attach debugger.
            </div>
            <div className="pt-2 border-t border-[#2d2d2d] flex items-center gap-2">
              <ChevronRight size={14} className="text-[#888888]" />
              <input
                type="text"
                placeholder="Evaluate expression..."
                className="flex-1 bg-transparent text-white outline-none font-mono text-xs"
              />
            </div>
          </div>
        )}

        {/* 5. Ports Tab */}
        {activeTab === 'ports' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 bg-[#252526] rounded border border-[#333333] font-sans text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-white font-medium">Port 5173</span>
                <span className="text-[#888888] text-[11px]">(Vite Dev Server)</span>
              </div>
              <a 
                href="http://localhost:5173" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[#3794ff] hover:underline flex items-center gap-1 font-mono"
              >
                http://localhost:5173 ↗
              </a>
            </div>
            <div className="text-[#666666] font-sans text-[11px]">
              Port forwarding is active for local loopback interfaces.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
