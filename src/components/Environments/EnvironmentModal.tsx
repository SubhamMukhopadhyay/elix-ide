import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  CheckCircle2, 
  Cloud, 
  Download, 
  Wrench, 
  X, 
  AlertTriangle,
  RotateCw,
  HardDrive,
  Info
} from 'lucide-react';
import { EnvironmentInfo } from '../../types';

interface EnvironmentModalProps {
  onClose: () => void;
}

export const EnvironmentModal: React.FC<EnvironmentModalProps> = ({ onClose }) => {
  const [environments, setEnvironments] = useState<EnvironmentInfo[]>([]);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installProgress, setInstallProgress] = useState<string>('');
  const [repairMsg, setRepairMsg] = useState<string | null>(null);

  useEffect(() => {
    loadEnvs();
    if (window.elix) {
      return window.elix.onEnvProgress(data => {
        setInstallProgress(data.message);
      });
    }
  }, []);

  const loadEnvs = async () => {
    if (window.elix) {
      const list = await window.elix.getEnvironments();
      setEnvironments(list || []);
    }
  };

  const handleInstall = async (id: string) => {
    setInstallingId(id);
    setInstallProgress('Initializing download & verification...');
    if (window.elix) {
      try {
        await window.elix.installEnvironment(id);
        await loadEnvs();
      } catch (e: any) {
        alert(e.message);
      }
    }
    setInstallingId(null);
    setInstallProgress('');
  };

  const handleRepair = async (id: string) => {
    if (window.elix) {
      const res = await window.elix.repairEnvironment(id);
      setRepairMsg(res.message);
      await loadEnvs();
      setTimeout(() => setRepairMsg(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-2xl bg-[var(--ide-sidebar-bg)] border border-[var(--ide-border)] rounded-md shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-[var(--ide-text)]">
        {/* VS Code Style Header */}
        <div className="px-4 py-2.5 border-b border-[var(--ide-border)] flex items-center justify-between bg-[var(--ide-panel-bg)]">
          <div className="flex items-center gap-2">
            <Boxes size={16} className="text-[#007acc]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--ide-text)]">
              Universal Environments & Runtimes
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-[var(--ide-text-muted)] hover:text-[var(--ide-text)] hover:bg-[var(--ide-hover-bg)] p-1 rounded transition-colors"
            title="Close (Esc)"
          >
            <X size={15} />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="px-4 py-2 bg-[var(--ide-bg)] border-b border-[var(--ide-border)] text-xs text-[var(--ide-text-muted)] flex items-center gap-2">
          <Info size={14} className="shrink-0 text-[#007acc]" />
          <span>
            Elix automatically detects compilers and runtimes on Windows. No manual PATH configuration required.
          </span>
        </div>

        {repairMsg && (
          <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-1.5 font-mono">
            <CheckCircle2 size={13} />
            <span>{repairMsg}</span>
          </div>
        )}

        {/* Environments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin">
          {environments.map(env => (
            <div
              key={env.id}
              className="p-3 bg-[var(--ide-bg)] border border-[var(--ide-border)] rounded-md flex items-center justify-between gap-4 hover:border-[#007acc]/40 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-xs text-[var(--ide-text)]">{env.name}</span>
                  {env.version && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--ide-input-bg)] text-[var(--ide-text-muted)] font-mono border border-[var(--ide-border)]">
                      {env.version}
                    </span>
                  )}
                  {env.status === 'ready' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 size={10} /> Ready (Local)
                    </span>
                  )}
                  {env.status === 'cloud_ready' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#007acc]/15 text-[#007acc] font-semibold border border-[#007acc]/30 flex items-center gap-1">
                      <Cloud size={10} /> Cloud Ready
                    </span>
                  )}
                  {env.status === 'not_installed' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--ide-input-bg)] text-[var(--ide-text-muted)] font-medium border border-[var(--ide-border)]">
                      Optional Component
                    </span>
                  )}
                  {env.status === 'downloading' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold animate-pulse">
                      Configuring...
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--ide-text-muted)] leading-relaxed">
                  {env.description}
                </p>
                {env.downloadSize && env.status === 'not_installed' && (
                  <span className="text-[10px] text-[var(--ide-text-muted)] mt-0.5 block font-mono">
                    Download size: {env.downloadSize}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {env.status === 'not_installed' && (
                  <button
                    onClick={() => handleInstall(env.id)}
                    disabled={installingId === env.id}
                    className="flex items-center gap-1 px-3 py-1 bg-[#007acc] hover:bg-[#0062a3] text-white font-medium rounded text-xs transition-colors active:scale-95"
                  >
                    <Download size={12} />
                    <span>Install</span>
                  </button>
                )}

                <button
                  onClick={() => handleRepair(env.id)}
                  title="Repair Environment & Clean Cache"
                  className="flex items-center gap-1 px-2.5 py-1 bg-[var(--ide-input-bg)] hover:bg-[var(--ide-hover-bg)] text-[var(--ide-text)] border border-[var(--ide-border)] rounded text-xs transition-colors"
                >
                  <Wrench size={11} />
                  <span>Repair</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-[var(--ide-border)] flex items-center justify-between bg-[var(--ide-panel-bg)] text-[11px] text-[var(--ide-text-muted)]">
          <span>Automatic optional component system handles all environment registrations.</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1 bg-[var(--ide-input-bg)] border border-[var(--ide-border)] hover:bg-[var(--ide-hover-bg)] text-[var(--ide-text)] rounded text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
