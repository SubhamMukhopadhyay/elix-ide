import React, { useState, useEffect } from 'react';
import { History, RotateCcw, X, Plus, Clock, FileCode, CheckCircle2 } from 'lucide-react';
import { TimeMachineSnapshot } from '../../types';

interface TimeMachineModalProps {
  onClose: () => void;
  projectId?: string;
  projectDir?: string;
}

export const TimeMachineModal: React.FC<TimeMachineModalProps> = ({
  onClose,
  projectId = '',
  projectDir = 'D:/Engineering/Project'
}) => {
  const [snapshots, setSnapshots] = useState<TimeMachineSnapshot[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<TimeMachineSnapshot | null>(null);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    loadSnapshots();
  }, [projectId]);

  const loadSnapshots = async () => {
    if (window.elix && projectId) {
      const list = await window.elix.getTimeMachineSnapshots(projectId);
      setSnapshots(list || []);
      if (list && list.length > 0) setSelectedSnapshot(list[0]);
    }
  };

  const handleCreateSnapshot = async () => {
    if (window.elix && projectId) {
      await window.elix.takeSnapshot({
        projectId,
        projectDir,
        title: `Manual Snapshot ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      });
      setStatusMsg('New project snapshot captured successfully.');
      loadSnapshots();
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleRestore = async (snapId: string) => {
    if (!window.elix) return;
    setIsRestoring(true);
    await window.elix.restoreSnapshot({ snapshotId: snapId, projectDir });
    setIsRestoring(false);
    setStatusMsg('Project rolled back to selected snapshot!');
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-2xl bg-[var(--ide-sidebar-bg)] border border-[var(--ide-border)] rounded-md shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-[var(--ide-text)]">
        {/* VS Code Style Header */}
        <div className="px-4 py-2.5 border-b border-[var(--ide-border)] flex items-center justify-between bg-[var(--ide-panel-bg)]">
          <div className="flex items-center gap-2">
            <History size={16} className="text-[#007acc]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--ide-text)]">
              Project Time Machine
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

        {statusMsg && (
          <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 font-mono">
            <CheckCircle2 size={13} />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex overflow-hidden min-h-[360px]">
          {/* Snapshots Timeline list */}
          <div className="w-72 border-r border-[var(--ide-border)] overflow-y-auto p-3 space-y-2 bg-[var(--ide-sidebar-bg)] scrollbar-thin">
            <button
              onClick={handleCreateSnapshot}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#007acc] hover:bg-[#0062a3] text-white font-medium rounded text-xs transition-colors mb-2"
            >
              <Plus size={13} />
              <span>Capture Snapshot Now</span>
            </button>

            {snapshots.length === 0 ? (
              <div className="text-[var(--ide-text-muted)] text-xs text-center py-8 italic">
                No snapshots captured yet for this project.
              </div>
            ) : (
              snapshots.map(s => (
                <div
                  key={s.id}
                  onClick={() => setSelectedSnapshot(s)}
                  className={`p-2.5 rounded-md cursor-pointer border text-xs transition-all ${
                    selectedSnapshot?.id === s.id
                      ? 'bg-[#007acc]/15 border-[#007acc] text-[var(--ide-text)]'
                      : 'bg-[var(--ide-bg)] border-[var(--ide-border)] text-[var(--ide-text-muted)] hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)]'
                  }`}
                >
                  <div className="font-medium text-[var(--ide-text)] mb-1 truncate">{s.title}</div>
                  <div className="flex items-center gap-1 text-[10px] text-[var(--ide-text-muted)] font-mono">
                    <Clock size={11} />
                    <span>{new Date(s.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Snapshot Details & Restore view */}
          <div className="flex-1 p-4 flex flex-col justify-between overflow-y-auto bg-[var(--ide-bg)] scrollbar-thin">
            {selectedSnapshot ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--ide-border)]">
                  <div>
                    <h3 className="font-semibold text-xs text-[var(--ide-text)]">{selectedSnapshot.title}</h3>
                    <p className="text-[11px] text-[var(--ide-text-muted)] mt-0.5">{selectedSnapshot.description}</p>
                    <span className="text-[10px] font-mono text-[var(--ide-text-muted)] mt-1 block">
                      Snapshot ID: {selectedSnapshot.id}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRestore(selectedSnapshot.id)}
                    disabled={isRestoring}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d83b01] hover:bg-[#c43501] disabled:opacity-50 text-white rounded text-xs font-medium transition-colors shrink-0"
                  >
                    <RotateCcw size={12} />
                    <span>{isRestoring ? 'Restoring...' : 'Restore Snapshot'}</span>
                  </button>
                </div>

                <div>
                  <span className="text-xs font-semibold text-[var(--ide-text)] block mb-2">
                    Preserved Files ({Object.keys(selectedSnapshot.files).length}):
                  </span>
                  <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-thin">
                    {Object.keys(selectedSnapshot.files).map((f, i) => (
                      <div 
                        key={i} 
                        className="flex items-center gap-2 text-xs font-mono text-[var(--ide-text)] p-2 bg-[var(--ide-panel-bg)] rounded border border-[var(--ide-border)]"
                      >
                        <FileCode size={13} className="text-[#007acc] shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-[var(--ide-text-muted)] text-xs italic text-center py-12">
                Select a snapshot from the timeline to inspect its preserved files and restore state.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[var(--ide-border)] flex items-center justify-between bg-[var(--ide-panel-bg)] text-[11px] text-[var(--ide-text-muted)]">
          <span>Local shadow checkpoints protect against destructive edits.</span>
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
