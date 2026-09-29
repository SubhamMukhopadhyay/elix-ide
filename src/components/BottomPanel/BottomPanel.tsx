import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TerminalIcon, 
  AlignLeft, 
  AlertCircle, 
  Bug, 
  Radio, 
  CheckSquare, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Maximize2 
} from 'lucide-react';
import { ExecutionEvent } from '../../types';

interface BottomPanelProps {
  logs: ExecutionEvent[];
  onClearLogs: () => void;
  isRunning: boolean;
  activeProjectDir?: string;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  logs,
  onClearLogs,
  isRunning,
  activeProjectDir
}) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'output' | 'problems' | 'debug' | 'ports'>('output');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [terminalInput, setTerminalInput] = useState<string>('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'Elix Universal Terminal [Version 1.0.0]',
    'Connected to PowerShell local execution sandbox.',
    'Type commands below (e.g. dir, python, git status, npm run):',
    ''
  ]);
  const outputEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput;
    setTerminalHistory(prev => [...prev, `PS ${activeProjectDir || ''}> ${cmd}`]);
    setTerminalInput('');

    if (window.elix) {
      try {
        await window.elix.run({
          command: cmd.split(' ')[0],
          args: cmd.split(' ').slice(1),
          cwd: activeProjectDir || 'D:/Engineering/Project'
        });
      } catch (err: any) {
        setTerminalHistory(prev => [...prev, `[Error] ${err.message}`]);
      }
    }
  };

  const errorCount = logs.filter(l => l.type === 'stderr' || l.type === 'error').length;

  return (
    <div className={`bg-elix-900 border-t border-elix-border flex flex-col transition-all duration-200 select-none ${
      isCollapsed ? 'h-8' : 'h-64'
    }`}>
      {/* Tab Navigation Header */}
      <div className="h-8 bg-elix-950 px-3 border-b border-elix-border flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => { setActiveTab('output'); setIsCollapsed(false); }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              activeTab === 'output' && !isCollapsed
                ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlignLeft size={13} />
            <span>Output</span>
            {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
          </button>

          <button
            onClick={() => { setActiveTab('terminal'); setIsCollapsed(false); }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              activeTab === 'terminal' && !isCollapsed
                ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TerminalIcon size={13} />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => { setActiveTab('problems'); setIsCollapsed(false); }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              activeTab === 'problems' && !isCollapsed
                ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertCircle size={13} />
            <span>Problems</span>
            {errorCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500/30 text-rose-300 text-[10px] rounded-full font-bold">
                {errorCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('debug'); setIsCollapsed(false); }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              activeTab === 'debug' && !isCollapsed
                ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bug size={13} />
            <span>Debug Console</span>
          </button>

          <button
            onClick={() => { setActiveTab('ports'); setIsCollapsed(false); }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              activeTab === 'ports' && !isCollapsed
                ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio size={13} />
            <span>Ports</span>
          </button>
        </div>

        {/* Panel controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onClearLogs}
            title="Clear Console Output"
            className="p-1 text-slate-500 hover:text-slate-300 rounded"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
            className="p-1 text-slate-500 hover:text-slate-300 rounded"
          >
            {isCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Panel Content */}
      {!isCollapsed && (
        <div className="flex-1 overflow-hidden bg-elix-950 font-mono text-xs p-3">
          {activeTab === 'output' && (
            <div className="h-full overflow-y-auto space-y-1 select-text">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic">No execution logs yet. Click ▶ Run to execute your project.</div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className={`leading-relaxed ${
                      log.type === 'stderr' || log.type === 'error'
                        ? 'text-rose-400'
                        : log.type === 'status'
                        ? 'text-cyan-400 font-semibold'
                        : 'text-slate-300'
                    }`}
                  >
                    <span className="text-slate-600 mr-2 select-none">[{log.timestamp}]</span>
                    {log.data}
                  </div>
                ))
              )}
              <div ref={outputEndRef} />
            </div>
          )}

          {activeTab === 'terminal' && (
            <div className="h-full flex flex-col justify-between">
              <div className="flex-1 overflow-y-auto space-y-1 text-slate-300 select-text">
                {terminalHistory.map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
              <form onSubmit={handleTerminalSubmit} className="mt-2 flex items-center gap-2 border-t border-slate-800 pt-2">
                <span className="text-cyan-400 font-bold">PS &gt;</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={e => setTerminalInput(e.target.value)}
                  className="flex-1 bg-transparent text-white focus:outline-none font-mono"
                  placeholder="Type a command..."
                />
              </form>
            </div>
          )}

          {activeTab === 'problems' && (
            <div className="h-full overflow-y-auto space-y-2 select-text">
              {errorCount === 0 ? (
                <div className="text-emerald-400 flex items-center gap-2">
                  <CheckSquare size={14} />
                  <span>No problems detected in workspace. All environments healthy.</span>
                </div>
              ) : (
                logs
                  .filter(l => l.type === 'stderr' || l.type === 'error')
                  .map((err, i) => (
                    <div key={i} className="p-2 bg-rose-950/20 border border-rose-900/40 rounded text-rose-300">
                      {err.data}
                    </div>
                  ))
              )}
            </div>
          )}

          {activeTab === 'debug' && (
            <div className="h-full text-slate-500 italic">
              Debug Console connected. Supports breakpoints and variable inspection during debug sessions.
            </div>
          )}

          {activeTab === 'ports' && (
            <div className="h-full flex flex-col gap-2">
              <div className="flex items-center justify-between p-2 bg-elix-900 rounded border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-200">Port 5173</span>
                  <span className="text-slate-500">(Web Dev Server)</span>
                </div>
                <a
                  href="http://localhost:5173"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline"
                >
                  http://localhost:5173 ↗
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
