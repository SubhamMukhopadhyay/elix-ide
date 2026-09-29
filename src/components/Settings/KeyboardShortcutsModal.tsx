import React, { useState, useMemo } from 'react';
import { Search, X, Keyboard, Command as CommandIcon, Edit3 } from 'lucide-react';

export interface KeybindingItem {
  id: string;
  command: string;
  description: string;
  keys: string[];
  when: string;
  source: 'System' | 'User' | 'Extension';
}

export const DEFAULT_KEYBINDINGS: KeybindingItem[] = [
  { id: '1', command: 'workbench.action.showCommands', description: 'Show All Commands (Command Palette)', keys: ['Ctrl', 'Shift', 'P'], when: '-', source: 'System' },
  { id: '2', command: 'workbench.action.quickOpen', description: 'Go to File / Quick Open', keys: ['Ctrl', 'P'], when: '-', source: 'System' },
  { id: '3', command: 'workbench.action.terminal.toggleTerminal', description: 'View: Toggle Terminal', keys: ['Ctrl', '`'], when: 'terminalProcessSupported', source: 'System' },
  { id: '4', command: 'workbench.action.files.save', description: 'File: Save Active File', keys: ['Ctrl', 'S'], when: 'editorTextFocus', source: 'System' },
  { id: '5', command: 'workbench.action.files.newUntitledFile', description: 'File: New Untitled Text File', keys: ['Ctrl', 'N'], when: '-', source: 'System' },
  { id: '6', command: 'workbench.action.openSettings', description: 'Preferences: Open Settings (UI)', keys: ['Ctrl', ','], when: '-', source: 'System' },
  { id: '7', command: 'workbench.action.openGlobalKeybindings', description: 'Preferences: Open Keyboard Shortcuts', keys: ['Ctrl', 'K', 'Ctrl', 'S'], when: '-', source: 'System' },
  { id: '8', command: 'workbench.action.selectTheme', description: 'Preferences: Color Theme', keys: ['Ctrl', 'K', 'Ctrl', 'T'], when: '-', source: 'System' },
  { id: '9', command: 'workbench.action.toggleSidebarVisibility', description: 'View: Toggle Primary Side Bar', keys: ['Ctrl', 'B'], when: '-', source: 'System' },
  { id: '10', command: 'workbench.action.toggleAiAgent', description: 'View: Toggle Elix Agent Side Bar', keys: ['Ctrl', 'I'], when: '-', source: 'System' },
  { id: '11', command: 'workbench.action.findInFiles', description: 'Search: Find in Files', keys: ['Ctrl', 'Shift', 'F'], when: '-', source: 'System' },
  { id: '12', command: 'workbench.action.debug.start', description: 'Universal Execution: Run Active File', keys: ['F5'], when: 'editorTextFocus', source: 'System' },
  { id: '13', command: 'editor.action.formatDocument', description: 'Format Document', keys: ['Shift', 'Alt', 'F'], when: 'editorHasDocumentFormattingProvider', source: 'System' },
  { id: '14', command: 'editor.action.commentLine', description: 'Toggle Line Comment', keys: ['Ctrl', '/'], when: 'editorTextFocus && !editorReadonly', source: 'System' },
  { id: '15', command: 'editor.action.indentLines', description: 'Indent Line', keys: ['Ctrl', ']'], when: 'editorTextFocus && !editorReadonly', source: 'System' },
  { id: '16', command: 'editor.action.outdentLines', description: 'Outdent Line', keys: ['Ctrl', '['], when: 'editorTextFocus && !editorReadonly', source: 'System' },
  { id: '17', command: 'workbench.action.closeActiveEditor', description: 'View: Close Editor', keys: ['Ctrl', 'W'], when: '-', source: 'System' },
  { id: '18', command: 'workbench.action.nextEditor', description: 'View: Next Tab', keys: ['Ctrl', 'Tab'], when: '-', source: 'System' },
  { id: '19', command: 'workbench.view.extension.git', description: 'View: Show Source Control (Git)', keys: ['Ctrl', 'Shift', 'G'], when: '-', source: 'System' },
  { id: '20', command: 'workbench.action.reloadWindow', description: 'Developer: Reload Window', keys: ['Ctrl', 'R'], when: '-', source: 'System' }
];

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState<string>('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return DEFAULT_KEYBINDINGS;
    return DEFAULT_KEYBINDINGS.filter(item => 
      item.command.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.keys.join(' ').toLowerCase().includes(q)
    );
  }, [search]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-sans"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl h-[78vh] bg-[var(--ide-sidebar-bg)] border border-[var(--ide-border)] rounded-lg shadow-2xl flex flex-col text-[var(--ide-text)] text-xs overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[var(--ide-border)] bg-[var(--ide-title-bg)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#007acc]/20 text-[#007acc] rounded-md">
              <Keyboard size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[var(--ide-text)]">Keyboard Shortcuts</h3>
              <p className="text-[11px] text-[var(--ide-text-muted)]">
                Browse and search keybindings across Elix IDE
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-[var(--ide-hover-bg)] rounded text-[var(--ide-text-muted)] hover:text-[var(--ide-text)] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search Input Bar (VS Code Parity) */}
        <div className="p-4 border-b border-[var(--ide-border)] bg-[var(--ide-panel-bg)] shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-[var(--ide-text-muted)]" />
            <input 
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Type to search in keybindings (e.g. Save, Terminal, Ctrl+P)..."
              autoFocus
              className="w-full bg-[var(--ide-input-bg)] text-[var(--ide-text)] pl-9 pr-8 py-2 rounded border border-[var(--ide-input-border)] focus:border-[#007acc] outline-none text-xs"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-[var(--ide-title-bg)] border-b border-[var(--ide-border)] text-[var(--ide-text-muted)] text-[11px]">
              <tr>
                <th className="py-2.5 px-4 font-semibold w-2/5">Command</th>
                <th className="py-2.5 px-4 font-semibold w-1/4">Keybinding</th>
                <th className="py-2.5 px-4 font-semibold w-1/4">When</th>
                <th className="py-2.5 px-4 font-semibold w-1/6">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ide-border)]/50">
              {filtered.map(item => (
                <tr 
                  key={item.id} 
                  className="hover:bg-[var(--ide-hover-bg)] transition-colors group cursor-default"
                >
                  <td className="py-2.5 px-4">
                    <div className="font-medium text-[var(--ide-text)]">{item.description}</div>
                    <div className="text-[10px] text-[var(--ide-text-muted)] font-mono">{item.command}</div>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-1 flex-wrap">
                      {item.keys.map((k, i) => (
                        <React.Fragment key={i}>
                          <kbd className="px-1.5 py-0.5 bg-[var(--ide-input-bg)] border border-[var(--ide-border)] rounded text-[11px] font-mono text-[var(--ide-text)] shadow-xs">
                            {k}
                          </kbd>
                          {i < item.keys.length - 1 && item.keys[i+1] !== 'Ctrl' && (
                            <span className="text-[var(--ide-text-muted)] text-[10px]">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-[var(--ide-text-muted)] truncate max-w-[200px]" title={item.when}>
                    {item.when}
                  </td>
                  <td className="py-2.5 px-4 text-[var(--ide-text-muted)]">
                    <span className="px-1.5 py-0.5 bg-[var(--ide-panel-bg)] rounded border border-[var(--ide-border)] text-[10px]">
                      {item.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-[var(--ide-text-muted)]">
              No matching keyboard shortcuts found for "{search}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-[var(--ide-border)] bg-[var(--ide-title-bg)] flex items-center justify-between text-[11px] text-[var(--ide-text-muted)] shrink-0">
          <span>{filtered.length} keybindings available</span>
          <button 
            onClick={onClose}
            className="px-3 py-1 bg-[#007acc] hover:bg-[#0062a3] text-white rounded font-medium cursor-pointer transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
