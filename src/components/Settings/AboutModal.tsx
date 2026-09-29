import React, { useState } from 'react';
import { X, Copy, Check, Info, ExternalLink } from 'lucide-react';
import { ElixLogo } from '../Common/ElixLogo';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const sys = window.elix?.getSystemInfo?.() || {
    version: '1.0.0',
    platform: 'win32',
    arch: 'x64',
    electron: '34.5.8',
    node: '20.18.0',
    chrome: '132.0.0.0',
    v8: '13.2.0.0'
  };

  const systemInfo = `Version: ${sys.version}
OS: ${sys.platform} (${sys.arch})
Electron: ${sys.electron}
Node.js: ${sys.node}
Chromium: ${sys.chrome}
V8: ${sys.v8}
Monaco Editor: 0.52.2
Engine: Elix Universal Execution Engine`;

  const handleCopy = () => {
    navigator.clipboard.writeText(systemInfo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-sans"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[var(--ide-sidebar-bg)] border border-[var(--ide-border)] rounded-lg shadow-2xl p-6 text-[var(--ide-text)] space-y-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with App Logo */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <ElixLogo size={42} />
            <div>
              <h2 className="text-base font-bold text-[var(--ide-text)]">Elix IDE</h2>
              <p className="text-xs text-[var(--ide-text-muted)]">Universal AI Development Environment</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-[var(--ide-hover-bg)] rounded text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Specifications Table */}
        <div className="bg-[var(--ide-panel-bg)] border border-[var(--ide-border)] rounded p-3 text-[11px] font-mono space-y-1 text-[var(--ide-text-muted)]">
          <div className="flex justify-between"><span className="text-[var(--ide-text)]">Version:</span> <span>{sys.version}</span></div>
          <div className="flex justify-between"><span className="text-[var(--ide-text)]">Architecture:</span> <span>{sys.platform}-{sys.arch}</span></div>
          <div className="flex justify-between"><span className="text-[var(--ide-text)]">Universal Execution:</span> <span>MinGW, Node, Python, Java, Rust</span></div>
          <div className="flex justify-between"><span className="text-[var(--ide-text)]">Electron:</span> <span>{sys.electron}</span></div>
          <div className="flex justify-between"><span className="text-[var(--ide-text)]">Node.js:</span> <span>{sys.node}</span></div>
          <div className="flex justify-between"><span className="text-[var(--ide-text)]">V8:</span> <span>{sys.v8}</span></div>
          <div className="flex justify-between"><span className="text-[var(--ide-text)]">Monaco Editor:</span> <span>0.52.2</span></div>
        </div>

        {/* Description */}
        <p className="text-[11px] text-[var(--ide-text-muted)] leading-relaxed">
          Built with Electron, TypeScript, Monaco Editor, and Elix Universal Execution Engine. Features zero-config offline & online runtimes, integrated AI Agent pair-programming, interactive mobile simulator, and career practice platform.
        </p>

        {/* Actions */}
        <div className="pt-2 border-t border-[var(--ide-border)] flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 border border-[var(--ide-border)] hover:bg-[var(--ide-hover-bg)] text-[var(--ide-text)] rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 bg-[#007acc] hover:bg-[#0062a3] text-white rounded font-medium text-xs shadow-sm transition-colors cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
