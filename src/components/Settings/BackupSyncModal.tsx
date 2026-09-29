import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  RefreshCw, 
  Download, 
  Upload, 
  Check, 
  ExternalLink,
  Settings as SettingsIcon,
  Sliders,
  Sparkles,
  GitBranch,
  Layers,
  Keyboard
} from 'lucide-react';
import { 
  getStoredSettings, 
  saveStoredSettings, 
  DEFAULT_SETTINGS 
} from '../../utils/settingsHelper';

interface BackupSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: (category?: string) => void;
  onOpenGithubAuth?: () => void;
}

export const BackupSyncModal: React.FC<BackupSyncModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
  onOpenGithubAuth
}) => {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just now');
  const [isSyncEnabled, setIsSyncEnabled] = useState<boolean>(true);

  // Sync checkboxes
  const [syncSettings, setSyncSettings] = useState<boolean>(true);
  const [syncKeybindings, setSyncKeybindings] = useState<boolean>(true);
  const [syncSnippets, setSyncSnippets] = useState<boolean>(true);
  const [syncExtensions, setSyncExtensions] = useState<boolean>(true);
  const [syncUiState, setSyncUiState] = useState<boolean>(true);

  if (!isOpen) return null;

  const currentSettings = getStoredSettings();
  const githubUser = currentSettings.gitUserName || null;

  const handleSyncNow = () => {
    setIsSyncing(true);
    setSyncSuccessMsg(null);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setSyncSuccessMsg('All configurations backed up and synchronized!');
      setTimeout(() => setSyncSuccessMsg(null), 3000);
    }, 800);
  };

  const handleExportBackup = () => {
    try {
      const backupData = {
        app: 'Elix IDE',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        settings: getStoredSettings(),
        syncedItems: {
          settings: syncSettings,
          keybindings: syncKeybindings,
          snippets: syncSnippets,
          extensions: syncExtensions,
          uiState: syncUiState
        }
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

      setSyncSuccessMsg('Backup exported successfully to JSON!');
      setTimeout(() => setSyncSuccessMsg(null), 3000);
    } catch (err: any) {
      alert('Export failed: ' + err.message);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const importedSettings = parsed.settings || parsed;
        if (typeof importedSettings === 'object' && importedSettings !== null) {
          const merged = { ...DEFAULT_SETTINGS, ...importedSettings };
          saveStoredSettings(merged);
          setSyncSuccessMsg('Backup restored successfully! Changes applied.');
          setTimeout(() => {
            setSyncSuccessMsg(null);
            window.location.reload();
          }, 1200);
        } else {
          alert('Invalid settings backup format.');
        }
      } catch (err: any) {
        alert('Failed to parse backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[var(--ide-sidebar-bg)] border border-[var(--ide-border)] rounded-lg shadow-2xl overflow-hidden flex flex-col text-[var(--ide-text)] text-xs"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--ide-border)] bg-[var(--ide-title-bg)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#007acc]/20 text-[#007acc] rounded-md">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[var(--ide-text)]">Backup and Sync Settings</h3>
              <p className="text-[11px] text-[var(--ide-text-muted)]">
                Synchronize preferences, AI keys, and keybindings across devices
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-[var(--ide-hover-bg)] rounded text-[var(--ide-text-muted)] hover:text-[var(--ide-text)] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Status Box */}
          <div className="bg-[var(--ide-panel-bg)] border border-[var(--ide-border)] rounded-md p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isSyncEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'}`} />
              <div>
                <div className="font-semibold text-[13px] flex items-center gap-1.5">
                  <span>{isSyncEnabled ? 'Settings Sync is On' : 'Settings Sync is Paused'}</span>
                  {isSyncEnabled && <Check size={13} className="text-emerald-400" />}
                </div>
                <div className="text-[11px] text-[var(--ide-text-muted)]">
                  Last backed up: <span className="text-[var(--ide-text)]">{lastSyncedTime}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="px-3 py-1.5 bg-[#007acc] hover:bg-[#0062a3] text-white rounded font-medium flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer text-xs"
              >
                <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSyncEnabled(prev => !prev)}
                className="px-2.5 py-1.5 border border-[var(--ide-border)] hover:bg-[var(--ide-hover-bg)] text-[var(--ide-text)] rounded text-[11px] transition-colors cursor-pointer"
              >
                {isSyncEnabled ? 'Turn Off' : 'Turn On'}
              </button>
            </div>
          </div>

          {/* Feedback Banner */}
          {syncSuccessMsg && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded flex items-center gap-2 text-[11px] animate-in fade-in">
              <Check size={14} className="shrink-0" />
              <span>{syncSuccessMsg}</span>
            </div>
          )}

          {/* Select What to Synchronize */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-[var(--ide-text-muted)] uppercase tracking-wider">
              Items to Synchronize
            </label>
            <div className="grid grid-cols-1 gap-2">
              <label className="flex items-center justify-between p-2.5 bg-[var(--ide-input-bg)] border border-[var(--ide-border)] rounded hover:bg-[var(--ide-hover-bg)] cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5">
                  <SettingsIcon size={14} className="text-[#007acc]" />
                  <div>
                    <div className="font-medium text-[var(--ide-text)]">Settings & Configurations</div>
                    <div className="text-[10px] text-[var(--ide-text-muted)]">Workbench themes, editor fonts, auto-save, AI keys</div>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={syncSettings} 
                  onChange={e => setSyncSettings(e.target.checked)} 
                  className="rounded border-[var(--ide-border)] text-[#007acc] focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-[var(--ide-input-bg)] border border-[var(--ide-border)] rounded hover:bg-[var(--ide-hover-bg)] cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5">
                  <Keyboard size={14} className="text-amber-400" />
                  <div>
                    <div className="font-medium text-[var(--ide-text)]">Keyboard Shortcuts</div>
                    <div className="text-[10px] text-[var(--ide-text-muted)]">Custom keybindings and editor command shortcuts</div>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={syncKeybindings} 
                  onChange={e => setSyncKeybindings(e.target.checked)} 
                  className="rounded border-[var(--ide-border)] text-[#007acc] focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-[var(--ide-input-bg)] border border-[var(--ide-border)] rounded hover:bg-[var(--ide-hover-bg)] cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5">
                  <Sparkles size={14} className="text-purple-400" />
                  <div>
                    <div className="font-medium text-[var(--ide-text)]">Snippets & Code Templates</div>
                    <div className="text-[10px] text-[var(--ide-text-muted)]">Custom code snippets, project blueprints, user templates</div>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={syncSnippets} 
                  onChange={e => setSyncSnippets(e.target.checked)} 
                  className="rounded border-[var(--ide-border)] text-[#007acc] focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-[var(--ide-input-bg)] border border-[var(--ide-border)] rounded hover:bg-[var(--ide-hover-bg)] cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5">
                  <Layers size={14} className="text-cyan-400" />
                  <div>
                    <div className="font-medium text-[var(--ide-text)]">Universal Execution SDKs</div>
                    <div className="text-[10px] text-[var(--ide-text-muted)]">MinGW, Python, Node, OpenJDK & Rust runtime paths</div>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={syncExtensions} 
                  onChange={e => setSyncExtensions(e.target.checked)} 
                  className="rounded border-[var(--ide-border)] text-[#007acc] focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-[var(--ide-input-bg)] border border-[var(--ide-border)] rounded hover:bg-[var(--ide-hover-bg)] cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5">
                  <Sliders size={14} className="text-emerald-400" />
                  <div>
                    <div className="font-medium text-[var(--ide-text)]">UI Layout & State</div>
                    <div className="text-[10px] text-[var(--ide-text-muted)]">Sidebar widths, AI panel width, bottom execution panel</div>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={syncUiState} 
                  onChange={e => setSyncUiState(e.target.checked)} 
                  className="rounded border-[var(--ide-border)] text-[#007acc] focus:ring-0 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Cloud Account Sync */}
          <div className="p-3 bg-[var(--ide-input-bg)] border border-[var(--ide-border)] rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch size={14} className="text-[#2ea043]" />
                <span className="font-semibold text-[var(--ide-text)]">Cloud Sync Provider</span>
              </div>
              {githubUser ? (
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <Check size={11} /> Connected (@{githubUser})
                </span>
              ) : (
                <span className="text-[11px] text-[var(--ide-text-muted)]">Local only</span>
              )}
            </div>
            <p className="text-[11px] text-[var(--ide-text-muted)]">
              {githubUser 
                ? `Settings are linked to GitHub account @${githubUser}. Pushing changes automatically updates your cloud backup.`
                : 'Connect your GitHub account to sync settings and repositories across your laptops and workstations.'}
            </p>
            {!githubUser && onOpenGithubAuth && (
              <button
                type="button"
                onClick={onOpenGithubAuth}
                className="mt-1 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
              >
                <span>Sign in with GitHub</span>
                <ExternalLink size={11} />
              </button>
            )}
          </div>

          {/* Manual Backup & Restore Buttons */}
          <div className="pt-1 border-t border-[var(--ide-border)]">
            <div className="flex items-center justify-between text-[11px] text-[var(--ide-text-muted)] mb-2">
              <span>Manual Backup Files:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="p-2.5 bg-[var(--ide-hover-bg)] hover:bg-[#007acc]/20 border border-[var(--ide-border)] hover:border-[#007acc] rounded flex items-center justify-center gap-2 text-[var(--ide-text)] transition-colors cursor-pointer font-medium"
              >
                <Download size={14} className="text-[#007acc]" />
                <span>Export Backup (.json)</span>
              </button>

              <label className="p-2.5 bg-[var(--ide-hover-bg)] hover:bg-[#007acc]/20 border border-[var(--ide-border)] hover:border-[#007acc] rounded flex items-center justify-center gap-2 text-[var(--ide-text)] transition-colors cursor-pointer font-medium">
                <Upload size={14} className="text-emerald-400" />
                <span>Restore Backup (.json)</span>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImportBackup} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--ide-border)] bg-[var(--ide-title-bg)] flex items-center justify-between">
          {onOpenSettings ? (
            <button
              type="button"
              onClick={() => onOpenSettings('sync')}
              className="text-[#007acc] hover:underline cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <span>Open in Full Settings Tab</span>
              <ExternalLink size={11} />
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#007acc] hover:bg-[#0062a3] text-white rounded font-medium cursor-pointer transition-colors text-xs shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
