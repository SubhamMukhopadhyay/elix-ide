import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FileCode, 
  Terminal, 
  Play, 
  Settings, 
  Sparkles, 
  Target, 
  Trophy, 
  Briefcase, 
  Boxes, 
  History,
  RotateCw,
  FolderOpen,
  FilePlus,
  Save,
  Split,
  Search,
  Layout,
  HelpCircle,
  Hash,
  Code2
} from 'lucide-react';
import { ProjectMetadata, EditorTab } from '../../types';
import { FileIcon } from '../Common/FileIcon';

interface UniversalSearchModalProps {
  onClose: () => void;
  initialQuery?: string;
  activeProject: ProjectMetadata | null;
  openTabs?: EditorTab[];
  activeTab?: EditorTab | null;
  onOpenFile: (path: string, name: string) => void;
  onOpenFolder?: () => void;
  onNewFile?: () => void;
  onSaveActiveFile?: () => void;
  onCloseFolder?: () => void;
  onToggleSidebar?: () => void;
  onToggleBottomPanel?: () => void;
  onToggleAi?: () => void;
  onSelectView?: (view: string) => void;
  onRun?: () => void;
  onStop?: () => void;
  onRestart?: () => void;
  onOpenSettings?: () => void;
  onOpenTimeMachine?: () => void;
  onSelectAction?: (type: string, payload: any) => void;
}

interface QuickPickItem {
  id: string;
  label: string;
  suffix?: string;
  description?: string;
  rightText?: string;
  shortcut?: string;
  icon?: React.ReactNode;
  action: () => void;
}

export const UniversalSearchModal: React.FC<UniversalSearchModalProps> = ({
  onClose,
  initialQuery = '',
  activeProject,
  openTabs = [],
  activeTab,
  onOpenFile,
  onOpenFolder,
  onNewFile,
  onSaveActiveFile,
  onCloseFolder,
  onToggleSidebar,
  onToggleBottomPanel,
  onToggleAi,
  onSelectView,
  onRun,
  onStop,
  onRestart,
  onOpenSettings,
  onOpenTimeMachine,
  onSelectAction
}) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [workspaceFiles, setWorkspaceFiles] = useState<{ name: string; path: string; relativePath: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus and select input on mount
  useEffect(() => {
    inputRef.current?.focus();
    if (initialQuery) {
      inputRef.current?.select();
    }
  }, [initialQuery]);

  // Index workspace files asynchronously (up to 3 levels deep)
  useEffect(() => {
    let isCancelled = false;
    const loadFiles = async () => {
      if (!activeProject?.path || !window.elix) return;
      const discovered: { name: string; path: string; relativePath: string }[] = [];
      const root = activeProject.path.replace(/\\/g, '/');

      const scanDir = async (dirPath: string, depth = 0) => {
        if (depth > 3 || isCancelled) return;
        try {
          const items = await window.elix.readDir(dirPath);
          if (!items) return;
          for (const item of items) {
            if (isCancelled) return;
            const normPath = item.path.replace(/\\/g, '/');
            const rel = normPath.startsWith(root) ? normPath.slice(root.length).replace(/^\//, '') : item.name;

            if (item.isDirectory) {
              if (
                !item.name.startsWith('.') &&
                item.name !== 'node_modules' &&
                item.name !== 'dist' &&
                item.name !== 'release' &&
                item.name !== 'build' &&
                item.name !== 'out'
              ) {
                await scanDir(item.path, depth + 1);
              }
            } else {
              discovered.push({
                name: item.name,
                path: item.path,
                relativePath: rel
              });
            }
          }
        } catch {
          // ignore directory read errors
        }
      };

      await scanDir(activeProject.path);
      if (!isCancelled) {
        setWorkspaceFiles(discovered);
      }
    };

    loadFiles();
    return () => {
      isCancelled = true;
    };
  }, [activeProject?.path]);

  // Parse symbols from active file
  const symbols = useMemo(() => {
    if (!activeTab?.content) return [];
    const lines = activeTab.content.split('\n');
    const result: { name: string; line: number; kind: string }[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      const funcMatch = trimmed.match(/(?:function|def)\s+([a-zA-Z0-9_$]+)/);
      if (funcMatch) {
        result.push({ name: funcMatch[1], line: idx + 1, kind: 'function' });
        return;
      }
      const classMatch = trimmed.match(/class\s+([a-zA-Z0-9_$]+)/);
      if (classMatch) {
        result.push({ name: classMatch[1], line: idx + 1, kind: 'class' });
        return;
      }
      const typeMatch = trimmed.match(/(?:interface|type)\s+([a-zA-Z0-9_$]+)/);
      if (typeMatch) {
        result.push({ name: typeMatch[1], line: idx + 1, kind: 'interface' });
        return;
      }
      const arrowMatch = trimmed.match(/(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_$]+)?\s*=>/);
      if (arrowMatch) {
        result.push({ name: arrowMatch[1], line: idx + 1, kind: 'function' });
        return;
      }
    });

    return result.slice(0, 60);
  }, [activeTab?.content]);

  // Helper for quick pick file icons (VS Code accurate)
  const getFileIcon = (fileName: string) => {
    return <FileIcon fileName={fileName} size={15} />;
  };

  // Commands registry for Command Palette (starts with >)
  const allCommands: QuickPickItem[] = useMemo(() => [
    {
      id: 'cmd-theme',
      label: 'Preferences: Color Theme',
      action: () => { onOpenSettings?.(); onClose(); }
    },
    {
      id: 'cmd-settings-ui',
      label: 'Preferences: Open Settings (UI)',
      shortcut: 'Ctrl + ,',
      action: () => { onOpenSettings?.(); onClose(); }
    },
    {
      id: 'cmd-new-file',
      label: 'File: New File...',
      shortcut: 'Ctrl + N',
      action: () => { onNewFile?.(); onClose(); }
    },
    {
      id: 'cmd-open-file',
      label: 'File: Open File...',
      shortcut: 'Ctrl + O',
      action: () => { window.elix?.openFileDialog(); onClose(); }
    },
    {
      id: 'cmd-open-folder',
      label: 'File: Open Folder...',
      shortcut: 'Ctrl + K Ctrl + O',
      action: () => { onOpenFolder?.(); onClose(); }
    },
    {
      id: 'cmd-save',
      label: 'File: Save',
      shortcut: 'Ctrl + S',
      action: () => { onSaveActiveFile?.(); onClose(); }
    },
    {
      id: 'cmd-close-folder',
      label: 'File: Close Folder',
      shortcut: 'Ctrl + K F',
      action: () => { onCloseFolder?.(); onClose(); }
    },
    {
      id: 'cmd-toggle-sidebar',
      label: 'View: Toggle Primary Side Bar',
      shortcut: 'Ctrl + B',
      action: () => { onToggleSidebar?.(); onClose(); }
    },
    {
      id: 'cmd-toggle-terminal',
      label: 'View: Toggle Terminal Panel',
      shortcut: 'Ctrl + `',
      action: () => { onToggleBottomPanel?.(); onClose(); }
    },
    {
      id: 'cmd-toggle-ai',
      label: 'View: Toggle AI Coding Agent',
      shortcut: 'Ctrl + I',
      action: () => { onToggleAi?.(); onClose(); }
    },
    {
      id: 'cmd-show-explorer',
      label: 'View: Show Explorer',
      shortcut: 'Ctrl + Shift + E',
      action: () => { onSelectView?.('explorer'); onClose(); }
    },
    {
      id: 'cmd-show-search',
      label: 'View: Show Search in Files',
      shortcut: 'Ctrl + Shift + F',
      action: () => { onSelectView?.('search'); onClose(); }
    },
    {
      id: 'cmd-show-git',
      label: 'View: Show Source Control',
      shortcut: 'Ctrl + Shift + G',
      action: () => { onSelectView?.('git'); onClose(); }
    },
    {
      id: 'cmd-show-debug',
      label: 'View: Show Run and Debug',
      shortcut: 'Ctrl + Shift + D',
      action: () => { onSelectView?.('debug'); onClose(); }
    },
    {
      id: 'cmd-show-practice',
      label: 'View: Show Practice & DSA Hub',
      action: () => { onSelectView?.('practice'); onClose(); }
    },
    {
      id: 'cmd-show-hackathon',
      label: 'View: Show Hackathons Hub',
      action: () => { onSelectView?.('hackathon'); onClose(); }
    },
    {
      id: 'cmd-show-career',
      label: 'View: Show Career Dashboard',
      action: () => { onSelectView?.('career'); onClose(); }
    },
    {
      id: 'cmd-show-env',
      label: 'View: Show Environments & SDKs',
      shortcut: 'Ctrl + Shift + X',
      action: () => { onSelectView?.('environments'); onClose(); }
    },
    {
      id: 'cmd-run',
      label: 'Run: Start Debugging (Run Code)',
      shortcut: 'F5',
      action: () => { onRun?.(); onClose(); }
    },
    {
      id: 'cmd-stop',
      label: 'Run: Stop Execution',
      shortcut: 'Shift + F5',
      action: () => { onStop?.(); onClose(); }
    },
    {
      id: 'cmd-restart',
      label: 'Run: Restart Execution',
      shortcut: 'Ctrl + Shift + F5',
      action: () => { onRestart?.(); onClose(); }
    },
    {
      id: 'cmd-new-terminal',
      label: 'Terminal: Create New Terminal',
      shortcut: 'Ctrl + Shift + `',
      action: () => { onToggleBottomPanel?.(); onClose(); }
    },
    {
      id: 'cmd-snapshot',
      label: 'Time Machine: Take Project Snapshot',
      action: () => { onOpenTimeMachine?.(); onClose(); }
    },
    {
      id: 'cmd-reload',
      label: 'Developer: Reload Window',
      action: () => { window.location.reload(); }
    },
    {
      id: 'cmd-welcome',
      label: 'Help: Welcome / Get Started',
      action: () => { onSelectView?.('welcome'); onClose(); }
    },
    {
      id: 'cmd-about',
      label: 'Help: About Elix IDE',
      action: () => {
        alert('Elix IDE v1.0.0\nVS Code-OSS Compatible Architecture\nElectron, TypeScript & Monaco Editor\nZero-Config Polyglot Execution Layer');
        onClose();
      }
    }
  ], [
    onClose,
    onOpenSettings,
    onNewFile,
    onOpenFolder,
    onSaveActiveFile,
    onCloseFolder,
    onToggleSidebar,
    onToggleBottomPanel,
    onToggleAi,
    onSelectView,
    onRun,
    onStop,
    onRestart,
    onOpenTimeMachine
  ]);

  // Generate Items based on query prefix or input state
  const items: QuickPickItem[] = useMemo(() => {
    const trimmed = query.trim();

    // 1. COMMAND PALETTE MODE: starts with '>'
    if (query.startsWith('>')) {
      const search = query.slice(1).trim().toLowerCase();
      if (!search) return allCommands;
      return allCommands.filter(c => c.label.toLowerCase().includes(search));
    }

    // 2. GO TO LINE MODE: starts with ':'
    if (query.startsWith(':')) {
      const lineStr = query.slice(1).trim();
      const lineNum = parseInt(lineStr, 10);
      if (isNaN(lineNum) || lineNum <= 0) {
        return [
          {
            id: 'line-hint',
            label: 'Type a line number to navigate to.',
            action: () => {}
          }
        ];
      }
      return [
        {
          id: `line-${lineNum}`,
          label: `Go to line ${lineNum}`,
          action: () => {
            window.dispatchEvent(new CustomEvent('elix-editor-jump-line', { detail: { line: lineNum } }));
            onClose();
          }
        }
      ];
    }

    // 3. GO TO SYMBOL MODE: starts with '@'
    if (query.startsWith('@')) {
      const symSearch = query.slice(1).trim().toLowerCase();
      const filtered = symSearch
        ? symbols.filter(s => s.name.toLowerCase().includes(symSearch))
        : symbols;

      if (filtered.length === 0) {
        return [
          {
            id: 'sym-empty',
            label: 'No symbols found in current document',
            action: () => {}
          }
        ];
      }

      return filtered.map(s => ({
        id: `sym-${s.line}-${s.name}`,
        label: s.name,
        description: s.kind,
        rightText: `line ${s.line}`,
        icon: <Hash size={13} className="text-[#007acc]" />,
        action: () => {
          window.dispatchEvent(new CustomEvent('elix-editor-jump-line', { detail: { line: s.line } }));
          onClose();
        }
      }));
    }

    // 4. SEARCH FOR TEXT MODE: starts with '%'
    if (query.startsWith('%')) {
      const text = query.slice(1).trim();
      return [
        {
          id: 'search-text-exec',
          label: text ? `Search for '${text}' across files` : 'Type text to search across workspace files...',
          action: () => {
            if (onSelectView) onSelectView('search');
            onClose();
          }
        }
      ];
    }

    // 5. MORE / HELP MODE: starts with '?'
    if (query.startsWith('?')) {
      return [
        {
          id: 'help-cmd',
          label: '> Show and Run Commands',
          action: () => setQuery('>')
        },
        {
          id: 'help-sym',
          label: '@ Go to Symbol in Editor',
          action: () => setQuery('@')
        },
        {
          id: 'help-line',
          label: ': Go to Line',
          action: () => setQuery(':')
        },
        {
          id: 'help-text',
          label: '% Search for Text in Files',
          action: () => setQuery('%')
        }
      ];
    }

    // 6. DEFAULT QUICK OPEN MODE: query === '' (EXACT MATCH TO VS CODE IMAGE 1)
    if (!trimmed) {
      const defaults: QuickPickItem[] = [
        {
          id: 'q-goto-file',
          label: 'Go to File',
          shortcut: 'Ctrl + P',
          action: () => {
            inputRef.current?.focus();
          }
        },
        {
          id: 'q-commands',
          label: 'Show and Run Commands',
          suffix: '>',
          shortcut: 'Ctrl + Shift + P',
          action: () => {
            setQuery('>');
            setSelectedIndex(0);
          }
        },
        {
          id: 'q-search-text',
          label: 'Search for Text',
          suffix: '%',
          action: () => {
            setQuery('%');
            setSelectedIndex(0);
          }
        },
        {
          id: 'q-quick-chat',
          label: 'Open Quick Chat',
          shortcut: 'Ctrl + Shift + Alt + L',
          action: () => {
            onToggleAi?.();
            onClose();
          }
        },
        {
          id: 'q-goto-symbol',
          label: 'Go to Symbol in Editor',
          suffix: '@',
          shortcut: 'Ctrl + Shift + O',
          action: () => {
            setQuery('@');
            setSelectedIndex(0);
          }
        },
        {
          id: 'q-start-debug',
          label: 'Start Debugging',
          suffix: 'debug',
          action: () => {
            onRun?.();
            onClose();
          }
        },
        {
          id: 'q-run-task',
          label: 'Run Task',
          suffix: 'task',
          action: () => {
            onRun?.();
            onClose();
          }
        },
        {
          id: 'q-more',
          label: 'More',
          suffix: '?',
          action: () => {
            setQuery('?');
            setSelectedIndex(0);
          }
        }
      ];

      // Append recently opened files (open tabs & discovered workspace files)
      const recentTabs = openTabs.filter(t => !t.isWelcome && !t.isSettings);
      const recentItems: QuickPickItem[] = recentTabs.map(t => ({
        id: `recent-${t.id}`,
        label: t.name,
        rightText: 'recently opened',
        icon: getFileIcon(t.name),
        action: () => {
          onOpenFile(t.path, t.name);
          onClose();
        }
      }));

      // If no tabs are open, fallback to index.html or first file in workspace
      if (recentItems.length === 0 && workspaceFiles.length > 0) {
        const topFiles = workspaceFiles.slice(0, 3);
        topFiles.forEach(f => {
          recentItems.push({
            id: `recent-wf-${f.path}`,
            label: f.name,
            rightText: 'recently opened',
            icon: getFileIcon(f.name),
            action: () => {
              onOpenFile(f.path, f.name);
              onClose();
            }
          });
        });
      }

      return [...defaults, ...recentItems];
    }

    // 7. FILE SEARCH BY NAME MODE: user is typing letters (e.g. 'index', 'app', 'button')
    const lower = trimmed.toLowerCase();
    const allCandidateFiles = new Map<string, { name: string; path: string; relativePath: string }>();

    // Add open tabs first
    openTabs.forEach(t => {
      if (!t.isWelcome && !t.isSettings) {
        allCandidateFiles.set(t.path, {
          name: t.name,
          path: t.path,
          relativePath: t.name
        });
      }
    });

    // Add workspace files
    workspaceFiles.forEach(f => {
      if (!allCandidateFiles.has(f.path)) {
        allCandidateFiles.set(f.path, f);
      }
    });

    const fileList = Array.from(allCandidateFiles.values());
    const matches = fileList.filter(
      f => f.name.toLowerCase().includes(lower) || f.relativePath.toLowerCase().includes(lower)
    );

    if (matches.length === 0) {
      return [
        {
          id: 'no-match',
          label: `No matching files found for '${query}'`,
          action: () => {}
        }
      ];
    }

    return matches.slice(0, 30).map(f => ({
      id: `file-${f.path}`,
      label: f.name,
      description: f.relativePath !== f.name ? f.relativePath : undefined,
      rightText: openTabs.some(t => t.path === f.path) ? 'recently opened' : undefined,
      icon: getFileIcon(f.name),
      action: () => {
        onOpenFile(f.path, f.name);
        onClose();
      }
    }));
  }, [
    query,
    allCommands,
    symbols,
    openTabs,
    workspaceFiles,
    onOpenFile,
    onClose,
    onToggleAi,
    onRun,
    onSelectView
  ]);

  // Ensure selectedIndex is within bounds
  useEffect(() => {
    if (selectedIndex >= items.length) {
      setSelectedIndex(Math.max(0, items.length - 1));
    }
  }, [items.length, selectedIndex]);

  // Scroll active item into view
  useEffect(() => {
    const activeEl = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    if (activeEl && listRef.current) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Handle Keyboard Navigation (Arrow keys, Enter, Escape, Backspace)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (items.length > 0 ? (prev + 1) % items.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (items.length > 0 ? (prev - 1 + items.length) % items.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Backspace' && (query === '>' || query === '@' || query === ':' || query === '%' || query === '?')) {
      e.preventDefault();
      setQuery('');
      setSelectedIndex(0);
    }
  };

  // Dynamic input placeholder matching VS Code
  const getPlaceholder = () => {
    if (query.startsWith('>')) return '> Type a command to run';
    if (query.startsWith('@')) return '@ Type a symbol to navigate to';
    if (query.startsWith(':')) return ': Type a line number to navigate to';
    if (query.startsWith('%')) return '% Type text to search in files';
    if (query.startsWith('?')) return '? Type to view quick open help';
    return 'Search files by name (append : to go to line or @ to go to symbol)';
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-start justify-center pt-2 select-none animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-[600px] max-w-[94vw] bg-[var(--ide-sidebar-bg)] border border-[var(--ide-border)] rounded-md shadow-2xl overflow-hidden flex flex-col font-sans text-xs"
      >
        {/* Top Input Field */}
        <div className="p-1.5 pb-1 border-b border-[var(--ide-border)]/60">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            className="w-full bg-[var(--ide-input-bg)] text-[var(--ide-text)] border border-[var(--ide-input-border)] focus:border-[#007acc] rounded px-3 py-1.5 text-[12px] outline-none placeholder:text-[var(--ide-text-muted)] font-sans"
            autoFocus
          />
        </div>

        {/* Quick Pick Items List */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto py-1 px-1">
          {items.map((item, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <div
                key={item.id}
                onClick={() => item.action()}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`h-[28px] px-3 flex items-center justify-between cursor-pointer rounded text-[12px] transition-colors ${
                  isSelected
                    ? 'bg-[#007acc] text-white font-medium'
                    : 'text-[var(--ide-text)] hover:bg-[var(--ide-hover-bg)]'
                }`}
              >
                {/* Left side: Icon, Label, Suffix, Description */}
                <div className="flex items-center gap-2 truncate">
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span className="truncate">{item.label}</span>
                  {item.suffix && (
                    <span className={`text-[11px] font-normal ${isSelected ? 'text-white/80' : 'text-[var(--ide-text-muted)]'}`}>
                      {item.suffix}
                    </span>
                  )}
                  {item.description && (
                    <span className={`text-[11px] font-normal truncate ml-1 ${isSelected ? 'text-white/70' : 'text-[var(--ide-text-muted)]'}`}>
                      {item.description}
                    </span>
                  )}
                </div>

                {/* Right side: Keyboard Shortcut badges or Right text */}
                {item.shortcut ? (
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {item.shortcut.split('+').map((k, kIdx, arr) => (
                      <React.Fragment key={kIdx}>
                        <kbd
                          className={`px-1.5 py-0.2 text-[10px] font-sans rounded border shadow-sm ${
                            isSelected
                              ? 'bg-white/20 border-white/30 text-white'
                              : 'bg-[var(--ide-input-bg)] border-[var(--ide-border)] text-[var(--ide-text-muted)]'
                          }`}
                        >
                          {k.trim()}
                        </kbd>
                        {kIdx < arr.length - 1 && (
                          <span className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-[var(--ide-text-muted)]'}`}>
                            +
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                ) : item.rightText ? (
                  <span className={`text-[11px] shrink-0 ml-2 ${isSelected ? 'text-white/80' : 'text-[var(--ide-text-muted)]'}`}>
                    {item.rightText}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
