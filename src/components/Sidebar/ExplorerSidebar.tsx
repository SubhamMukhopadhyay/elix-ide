import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileCode, 
  FileText, 
  FilePlus, 
  FolderPlus, 
  RefreshCw, 
  ChevronRight, 
  ChevronDown, 
  Trash2, 
  Edit2, 
  ExternalLink, 
  Copy,
  Code,
  File,
  ChevronsDownUp,
  Play,
  Terminal,
  Files,
  Check,
  X,
  FolderX,
  Save
} from 'lucide-react';
import { ProjectMetadata } from '../../types';
import { FileIcon } from '../Common/FileIcon';

interface FileNode {
  name: string;
  isDirectory: boolean;
  path: string;
  children?: FileNode[];
  isLoaded?: boolean;
}

interface ExplorerSidebarProps {
  activeProject: ProjectMetadata | null;
  onOpenFile: (path: string, name: string) => void;
  activeFilePath?: string;
  onOpenFolder: () => void;
  onRunFile?: (path: string) => void;
  onOpenTerminalAtPath?: (dirPath: string) => void;
  openTabs?: { id: string; name: string; path?: string; isDirty?: boolean; isWelcome?: boolean }[];
  activeTabId?: string | null;
  onSelectTab?: (id: string) => void;
  onCloseTab?: (id: string) => void;
  onCloseAllTabs?: () => void;
  onSaveAllTabs?: () => void;
  onCloseFolder?: () => void;
  onCloneRepo?: () => void;
}

export const ExplorerSidebar: React.FC<ExplorerSidebarProps> = ({
  activeProject,
  onOpenFile,
  activeFilePath,
  onOpenFolder,
  onRunFile,
  onOpenTerminalAtPath,
  openTabs = [],
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCloseAllTabs,
  onSaveAllTabs,
  onCloseFolder,
  onCloneRepo
}) => {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({});
  const [childrenMap, setChildrenMap] = useState<Record<string, FileNode[]>>({});
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: FileNode } | null>(null);
  const [isCreatingItem, setIsCreatingItem] = useState<{ type: 'file' | 'folder'; parentPath: string } | null>(null);
  const [newItemName, setNewItemName] = useState<string>('');
  
  // Views toggle state with localStorage persistence (matching media_1790538513898.png)
  const [showViewsMenu, setShowViewsMenu] = useState(false);
  const viewsMenuRef = React.useRef<HTMLDivElement>(null);
  const [visibleViews, setVisibleViews] = useState<{
    openEditors: boolean;
    folders: boolean;
    outline: boolean;
    timeline: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem('elix_explorer_views');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { openEditors: false, folders: true, outline: true, timeline: true };
  });

  const toggleView = (viewKey: 'openEditors' | 'folders' | 'outline' | 'timeline') => {
    setVisibleViews(prev => {
      const next = { ...prev, [viewKey]: !prev[viewKey] };
      localStorage.setItem('elix_explorer_views', JSON.stringify(next));
      return next;
    });
  };

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (viewsMenuRef.current && !viewsMenuRef.current.contains(e.target as Node)) {
        setShowViewsMenu(false);
      }
    };
    if (showViewsMenu) {
      window.addEventListener('mousedown', handleOutsideClick);
    }
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [showViewsMenu]);

  const [isOpenEditorsExpanded, setIsOpenEditorsExpanded] = useState<boolean>(true);
  const [isFoldersExpanded, setIsFoldersExpanded] = useState<boolean>(true);
  const [isOutlineOpen, setIsOutlineOpen] = useState<boolean>(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState<boolean>(false);

  const normalizePath = (p: string) => (p || '').replace(/\\/g, '/');

  useEffect(() => {
    if (activeProject?.path) {
      loadRootDirectory(activeProject.path);
    } else {
      setFileTree([]);
      setChildrenMap({});
    }
  }, [activeProject]);

  const loadRootDirectory = async (rootPath: string) => {
    if (window.elix) {
      const normRoot = normalizePath(rootPath);
      const items = await window.elix.readDir(normRoot);
      const normalizedItems = (items || []).map(i => ({ ...i, path: normalizePath(i.path) }));
      setFileTree(normalizedItems);
      setExpandedDirs({ [normRoot]: true });
      setChildrenMap({});
    }
  };

  const handleToggleFolder = async (folderNode: FileNode) => {
    const normPath = normalizePath(folderNode.path);
    const isExpanded = !!expandedDirs[normPath];

    if (!isExpanded && !childrenMap[normPath]) {
      // Lazy load subfolder contents
      if (window.elix) {
        const subItems = await window.elix.readDir(normPath);
        const normalizedSub = (subItems || []).map(item => ({
          ...item,
          path: normalizePath(item.path)
        }));
        setChildrenMap(prev => ({ ...prev, [normPath]: normalizedSub }));
      }
    }

    setExpandedDirs(prev => ({ ...prev, [normPath]: !isExpanded }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !isCreatingItem || !window.elix) return;

    const fullPath = `${isCreatingItem.parentPath}/${newItemName.trim()}`.replace(/\\/g, '/');

    if (isCreatingItem.type === 'file') {
      await window.elix.createFile(fullPath);
      onOpenFile(fullPath, newItemName.trim());
    } else {
      await window.elix.createDir(fullPath);
    }

    setIsCreatingItem(null);
    setNewItemName('');
    if (activeProject) loadRootDirectory(activeProject.path);
  };

  const handleDelete = async (targetPath: string) => {
    if (confirm(`Are you sure you want to delete ${targetPath.split('/').pop()}?`)) {
      if (window.elix) {
        await window.elix.deleteFile(targetPath);
        if (activeProject) loadRootDirectory(activeProject.path);
      }
    }
    setContextMenu(null);
  };

  const handleReveal = (targetPath: string) => {
    if (window.elix) {
      window.elix.revealInExplorer(targetPath);
    }
    setContextMenu(null);
  };

  const handleRename = async (node: FileNode) => {
    const currentName = node.name;
    const newName = prompt('Enter new name:', currentName);
    if (newName && newName.trim() && newName.trim() !== currentName) {
      const parentDir = node.path.substring(0, Math.max(node.path.lastIndexOf('/'), node.path.lastIndexOf('\\')));
      const newPath = `${parentDir}/${newName.trim()}`.replace(/\\/g, '/');
      if (window.elix) {
        try {
          if (window.elix.renameFile) {
            await window.elix.renameFile(node.path, newPath);
          } else {
            const content = await window.elix.readFile(node.path);
            await window.elix.createFile(newPath);
            if (typeof content === 'string') await window.elix.writeFile(newPath, content);
            await window.elix.deleteFile(node.path);
          }
          if (activeProject) loadRootDirectory(activeProject.path);
        } catch (e) {
          console.error('Rename failed:', e);
        }
      }
    }
    setContextMenu(null);
  };

  const handleDuplicate = async (node: FileNode) => {
    const ext = node.name.includes('.') ? `.${node.name.split('.').pop()}` : '';
    const base = ext ? node.name.slice(0, -ext.length) : node.name;
    const copyName = `${base} copy${ext}`;
    const parentDir = node.path.substring(0, Math.max(node.path.lastIndexOf('/'), node.path.lastIndexOf('\\')));
    const copyPath = `${parentDir}/${copyName}`.replace(/\\/g, '/');
    if (window.elix) {
      try {
        const content = await window.elix.readFile(node.path);
        await window.elix.createFile(copyPath);
        if (typeof content === 'string') await window.elix.writeFile(copyPath, content);
        if (activeProject) loadRootDirectory(activeProject.path);
      } catch (e) {
        console.error('Duplicate failed:', e);
      }
    }
    setContextMenu(null);
  };

  const handleCopyRelativePath = (node: FileNode) => {
    if (activeProject?.path) {
      const rootNorm = normalizePath(activeProject.path);
      const nodeNorm = normalizePath(node.path);
      let rel = nodeNorm.startsWith(rootNorm) ? nodeNorm.slice(rootNorm.length) : nodeNorm;
      if (rel.startsWith('/')) rel = rel.slice(1);
      navigator.clipboard.writeText(rel);
    } else {
      navigator.clipboard.writeText(node.name);
    }
    setContextMenu(null);
  };

  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map(node => {
      const normPath = normalizePath(node.path);
      const isExpanded = !!expandedDirs[normPath];
      const isSelected = normalizePath(activeFilePath || '') === normPath;
      const children = childrenMap[normPath] || node.children;

      return (
        <div key={normPath}>
          <div
            onClick={() => {
              if (node.isDirectory) handleToggleFolder(node);
              else onOpenFile(normPath, node.name);
            }}
            onContextMenu={e => {
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY, node });
            }}
            style={{ paddingLeft: `${depth * 14 + 10}px` }}
            className={`h-[22px] flex items-center justify-between pr-2 cursor-pointer text-[12px] group select-none ${
              isSelected 
                ? 'bg-[var(--ide-hover-bg)] text-[var(--ide-text)] font-semibold border-l-2 border-[#007acc]' 
                : 'text-[var(--ide-text)] hover:bg-[var(--ide-hover-bg)]'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-visible">
              <span className="w-4 h-4 shrink-0 flex items-center justify-center overflow-visible">
                {node.isDirectory ? (
                  isExpanded ? (
                    <ChevronDown size={14} className="text-[var(--ide-text-muted)] shrink-0" />
                  ) : (
                    <ChevronRight size={14} className="text-[var(--ide-text-muted)] shrink-0" />
                  )
                ) : (
                  <FileIcon fileName={node.name} size={15} />
                )}
              </span>
              <span className="truncate text-[12px] leading-tight">{node.name}</span>
            </div>
          </div>

          {/* Render Children Recursively */}
          {node.isDirectory && isExpanded && (
            <div>
              {children && children.length > 0 ? (
                renderTree(children, depth + 1)
              ) : (
                <div
                  style={{ paddingLeft: `${(depth + 1) * 14 + 10}px` }}
                  className="h-[20px] flex items-center text-[11px] text-[var(--ide-text-muted)] italic select-none"
                >
                  (empty folder)
                </div>
              )}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div 
      className="w-full bg-[var(--ide-sidebar-bg)] border-r border-[var(--ide-border)] flex flex-col justify-between select-none h-full text-[var(--ide-text)]"
      onClick={() => setContextMenu(null)}
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Explorer Header */}
        <div className="h-[34px] px-3 flex items-center justify-between text-[var(--ide-text-muted)] text-[11px] font-semibold tracking-wider uppercase border-b border-[var(--ide-border)] relative shrink-0">
          <span>EXPLORER</span>
          
          {/* Views Button and Menu matching media_1790538513898.png */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowViewsMenu(prev => !prev);
              }}
              title="Views and More Actions..."
              className="p-1 rounded hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)] transition-colors"
            >
              <span className="text-sm font-bold tracking-widest px-1">···</span>
            </button>

            {showViewsMenu && (
              <div
                ref={viewsMenuRef}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1 z-50 w-44 bg-[#1e1e1e] border border-[#333333] rounded-md shadow-2xl py-1 text-[12px] text-[#cccccc] font-normal normal-case select-none"
              >
                <div
                  onClick={() => toggleView('openEditors')}
                  className="px-3 py-1.5 flex items-center gap-2 hover:bg-[#007acc] hover:text-white cursor-pointer transition-colors"
                >
                  <span className="w-4 flex items-center justify-center shrink-0">
                    {visibleViews.openEditors && <Check size={13} strokeWidth={2.5} />}
                  </span>
                  <span>Open Editors</span>
                </div>

                <div
                  onClick={() => toggleView('folders')}
                  className="px-3 py-1.5 flex items-center gap-2 hover:bg-[#007acc] hover:text-white cursor-pointer transition-colors"
                >
                  <span className="w-4 flex items-center justify-center shrink-0">
                    {visibleViews.folders && <Check size={13} strokeWidth={2.5} />}
                  </span>
                  <span>Folders</span>
                </div>

                <div
                  onClick={() => toggleView('outline')}
                  className="px-3 py-1.5 flex items-center gap-2 hover:bg-[#007acc] hover:text-white cursor-pointer transition-colors"
                >
                  <span className="w-4 flex items-center justify-center shrink-0">
                    {visibleViews.outline && <Check size={13} strokeWidth={2.5} />}
                  </span>
                  <span>Outline</span>
                </div>

                <div
                  onClick={() => toggleView('timeline')}
                  className="px-3 py-1.5 flex items-center gap-2 hover:bg-[#007acc] hover:text-white cursor-pointer transition-colors"
                >
                  <span className="w-4 flex items-center justify-center shrink-0">
                    {visibleViews.timeline && <Check size={13} strokeWidth={2.5} />}
                  </span>
                  <span>Timeline</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 1. Open Editors Section (when toggled on in views menu) */}
        {visibleViews.openEditors && (
          <div className="border-b border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] select-none shrink-0">
            <div
              onClick={() => setIsOpenEditorsExpanded(prev => !prev)}
              className="h-[24px] px-2 flex items-center justify-between bg-[var(--ide-bg)] text-[var(--ide-text)] text-[11px] font-bold uppercase tracking-wider group cursor-pointer hover:bg-[var(--ide-hover-bg)] transition-colors"
            >
              <div className="flex items-center gap-1">
                {isOpenEditorsExpanded ? <ChevronDown size={14} className="text-[var(--ide-text-muted)]" /> : <ChevronRight size={14} className="text-[var(--ide-text-muted)]" />}
                <span>OPEN EDITORS</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                {onSaveAllTabs && (
                  <button onClick={onSaveAllTabs} title="Save All (Ctrl+K S)" className="p-0.5 hover:text-white rounded">
                    <Save size={12} />
                  </button>
                )}
                {onCloseAllTabs && (
                  <button onClick={onCloseAllTabs} title="Close All Editors (Ctrl+K Ctrl+W)" className="p-0.5 hover:text-white rounded">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {isOpenEditorsExpanded && (
              <div className="py-1 max-h-48 overflow-y-auto">
                {openTabs.length === 0 ? (
                  <div className="px-4 py-1 text-[11px] text-[var(--ide-text-muted)] italic">
                    No open editors
                  </div>
                ) : (
                  openTabs.map(tab => (
                    <div
                      key={tab.id}
                      onClick={() => onSelectTab?.(tab.id)}
                      className={`h-[22px] px-3 flex items-center justify-between text-[12px] cursor-pointer group transition-colors ${
                        activeTabId === tab.id
                          ? 'bg-[var(--ide-hover-bg)] text-[var(--ide-text)] font-medium'
                          : 'text-[var(--ide-text-muted)] hover:bg-[var(--ide-hover-bg)]/60 hover:text-[var(--ide-text)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileIcon fileName={tab.name} className="shrink-0" />
                        <span className="truncate">{tab.name}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {tab.isDirty && (
                          <span className="w-2 h-2 rounded-full bg-white group-hover:hidden" />
                        )}
                        {onCloseTab && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCloseTab(tab.id);
                            }}
                            className={`p-0.5 rounded hover:bg-[var(--ide-border)] hover:text-white ${
                              tab.isDirty ? 'hidden group-hover:block' : 'opacity-0 group-hover:opacity-100'
                            }`}
                            title="Close"
                          >
                            <X size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. Folders / NO FOLDER OPENED Section (when visible) */}
        {visibleViews.folders && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeProject ? (
              <div 
                onClick={() => setIsFoldersExpanded(prev => !prev)}
                className="h-[24px] px-2 flex items-center justify-between bg-[var(--ide-bg)] text-[var(--ide-text)] text-[11px] font-bold uppercase tracking-wider group cursor-pointer hover:bg-[var(--ide-hover-bg)] transition-colors border-b border-[var(--ide-border)] shrink-0"
              >
                <div className="flex items-center gap-1 truncate">
                  {isFoldersExpanded ? <ChevronDown size={14} className="text-[var(--ide-text-muted)] shrink-0" /> : <ChevronRight size={14} className="text-[var(--ide-text-muted)] shrink-0" />}
                  <span className="truncate">{activeProject.name}</span>
                </div>

                <div 
                  className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity" 
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => setIsCreatingItem({ type: 'file', parentPath: activeProject.path })}
                    title="New File..."
                    className="p-1 hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)] rounded"
                  >
                    <FilePlus size={13} />
                  </button>
                  <button
                    onClick={() => setIsCreatingItem({ type: 'folder', parentPath: activeProject.path })}
                    title="New Folder..."
                    className="p-1 hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)] rounded"
                  >
                    <FolderPlus size={13} />
                  </button>
                  <button
                    onClick={() => loadRootDirectory(activeProject.path)}
                    title="Refresh Explorer"
                    className="p-1 hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)] rounded"
                  >
                    <RefreshCw size={12} />
                  </button>
                  <button
                    onClick={() => setExpandedDirs({})}
                    title="Collapse All Folders"
                    className="p-1 hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)] rounded"
                  >
                    <ChevronsDownUp size={12} />
                  </button>
                  {onCloseFolder && (
                    <button
                      onClick={onCloseFolder}
                      title="Close Folder"
                      className="p-1 hover:bg-[var(--ide-hover-bg)] hover:text-red-400 rounded"
                    >
                      <FolderX size={13} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* EXACT VS Code "NO FOLDER OPENED" Accordion matching media_1790538569317.png */
              <div 
                onClick={() => setIsFoldersExpanded(prev => !prev)}
                className="h-[24px] px-2 flex items-center justify-between bg-[var(--ide-bg)] text-[var(--ide-text)] text-[11px] font-bold tracking-wider group cursor-pointer hover:bg-[var(--ide-hover-bg)] transition-colors border-b border-[var(--ide-border)] shrink-0"
              >
                <div className="flex items-center gap-1">
                  {isFoldersExpanded ? <ChevronDown size={14} className="text-[var(--ide-text-muted)] shrink-0" /> : <ChevronRight size={14} className="text-[var(--ide-text-muted)] shrink-0" />}
                  <span className="font-semibold text-[11px]">No Folder Opened</span>
                </div>
              </div>
            )}

            {/* Tree Container or Authentic VS Code No Folder Opened Body */}
            {isFoldersExpanded && (
              <div className="flex-1 overflow-y-auto py-1">
                {activeProject ? (
                  <>
                    {isCreatingItem && (
                      <form onSubmit={handleCreateSubmit} className="px-3 py-1 flex items-center gap-1">
                        {isCreatingItem.type === 'file' ? <FilePlus size={13} className="text-cyan-400" /> : <FolderPlus size={13} className="text-amber-400" />}
                        <input
                          type="text"
                          autoFocus
                          value={newItemName}
                          onChange={e => setNewItemName(e.target.value)}
                          onBlur={() => setIsCreatingItem(null)}
                          placeholder={isCreatingItem.type === 'file' ? 'filename.ts' : 'folder-name'}
                          className="flex-1 bg-[var(--ide-input-bg)] text-[var(--ide-text)] text-[12px] px-1.5 py-0.5 rounded outline-none border border-[var(--ide-input-border)] focus:border-[#007acc]"
                        />
                      </form>
                    )}
                    {renderTree(fileTree)}
                  </>
                ) : (
                  /* EXACT VS CODE NO FOLDER OPENED UI (media_1790538569317.png) */
                  <div className="p-4 flex flex-col gap-3 text-[12px] text-[#cccccc] leading-relaxed select-text font-sans">
                    <p className="text-[#cccccc] text-[12px]">You have not yet opened a folder.</p>
                    
                    <button
                      onClick={onOpenFolder}
                      className="w-full py-1.5 px-3 bg-[#007acc] hover:bg-[#0062a3] text-white text-[12px] font-medium rounded transition-colors text-center cursor-pointer shadow-sm select-none"
                    >
                      Open Folder
                    </button>

                    <p className="text-[#999999] text-[11px] leading-relaxed">
                      Opening a folder will close all currently open editors. To keep them open,{' '}
                      <button 
                        onClick={onOpenFolder} 
                        className="text-[#3794ff] hover:underline cursor-pointer bg-transparent border-0 p-0 inline text-[11px]"
                      >
                        add a folder
                      </button>{' '}
                      instead.
                    </p>

                    <p className="text-[#cccccc] text-[12px] mt-1">You can clone a repository locally.</p>

                    <button
                      onClick={onCloneRepo || onOpenFolder}
                      className="w-full py-1.5 px-3 bg-[#007acc] hover:bg-[#0062a3] text-white text-[12px] font-medium rounded transition-colors text-center cursor-pointer shadow-sm select-none"
                    >
                      Clone Repository
                    </button>

                    <p className="text-[#999999] text-[11px] leading-relaxed">
                      To learn more about how to use Git and source control in the IDE{' '}
                      <button
                        onClick={() => window.elix?.openExternal('https://code.visualstudio.com/docs/sourcecontrol/overview')}
                        className="text-[#3794ff] hover:underline cursor-pointer bg-transparent border-0 p-0 inline text-[11px]"
                      >
                        read our docs
                      </button>
                      .
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. Outline Section (when toggled on in views menu) */}
        {visibleViews.outline && (
          <div className="border-t border-[var(--ide-border)] bg-[var(--ide-bg)] text-[11px] font-bold uppercase tracking-wider select-none shrink-0">
            <div 
              onClick={() => setIsOutlineOpen(prev => !prev)}
              className="h-[22px] px-2 flex items-center justify-between cursor-pointer hover:bg-[var(--ide-hover-bg)] text-[var(--ide-text-muted)] transition-colors"
            >
              <div className="flex items-center gap-1">
                {isOutlineOpen ? <ChevronDown size={14} className="text-[var(--ide-text-muted)]" /> : <ChevronRight size={14} className="text-[var(--ide-text-muted)]" />}
                <span>OUTLINE</span>
              </div>
            </div>
            {isOutlineOpen && (
              <div className="p-2 text-[11px] font-normal text-[var(--ide-text-muted)] bg-[var(--ide-sidebar-bg)] border-t border-[var(--ide-border)] max-h-32 overflow-y-auto">
                {activeFilePath ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-cyan-400">
                      <span className="font-mono text-[10px]">class</span>
                      <span>{activeFilePath.split(/[/\\]/).pop()?.split('.')[0] || 'Module'}</span>
                    </div>
                    <div className="pl-3 space-y-1 text-[var(--ide-text)]">
                      <div className="flex items-center gap-1.5 hover:text-[#007acc] cursor-pointer">
                        <span className="font-mono text-[10px] text-amber-400">m</span>
                        <span>main()</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="italic">No symbols found in document</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. Timeline Section (when toggled on in views menu) */}
        {visibleViews.timeline && (
          <div className="border-t border-[var(--ide-border)] bg-[var(--ide-bg)] text-[11px] font-bold uppercase tracking-wider select-none shrink-0">
            <div 
              onClick={() => setIsTimelineOpen(prev => !prev)}
              className="h-[22px] px-2 flex items-center justify-between cursor-pointer hover:bg-[var(--ide-hover-bg)] text-[var(--ide-text-muted)] transition-colors"
            >
              <div className="flex items-center gap-1">
                {isTimelineOpen ? <ChevronDown size={14} className="text-[var(--ide-text-muted)]" /> : <ChevronRight size={14} className="text-[var(--ide-text-muted)]" />}
                <span>TIMELINE</span>
              </div>
            </div>
            {isTimelineOpen && (
              <div className="p-2 text-[11px] font-normal text-[var(--ide-text-muted)] bg-[var(--ide-sidebar-bg)] border-t border-[var(--ide-border)] max-h-28 overflow-y-auto">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[var(--ide-text)]">
                    <span>File Saved</span>
                    <span className="text-[10px] text-[var(--ide-text-muted)]">Just now</span>
                  </div>
                  <div className="flex items-center justify-between text-[var(--ide-text-muted)]">
                    <span>Local Snapshot</span>
                    <span className="text-[10px] text-[var(--ide-text-muted)]">5m ago</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Right-click Context Menu */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 w-48 bg-[var(--ide-sidebar-bg)] border border-[var(--ide-border)] rounded shadow-2xl py-1 text-[12px] text-[var(--ide-text)]"
        >
          {/* Actions for Files */}
          {!contextMenu.node.isDirectory && (
            <>
              <button
                onClick={() => {
                  const node = contextMenu.node;
                  setContextMenu(null);
                  if (onRunFile) {
                    onRunFile(node.path);
                  } else {
                    onOpenFile(node.path, node.name);
                  }
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-[#007acc] hover:text-white flex items-center justify-between text-emerald-400 group"
              >
                <div className="flex items-center gap-2">
                  <Play size={13} className="text-emerald-400 group-hover:text-white" />
                  <span className="font-medium text-[var(--ide-text)] group-hover:text-white">Run Code</span>
                </div>
                <span className="text-[10px] text-[var(--ide-text-muted)] group-hover:text-cyan-200">Ctrl+Alt+N</span>
              </button>

              <button
                onClick={() => {
                  onOpenFile(contextMenu.node.path, contextMenu.node.name);
                  setContextMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-[#007acc] hover:text-white flex items-center justify-between text-[var(--ide-text)]"
              >
                <div className="flex items-center gap-2">
                  <Files size={13} />
                  <span>Open to the Side</span>
                </div>
                <span className="text-[10px] text-[var(--ide-text-muted)]">Ctrl+Enter</span>
              </button>
              <div className="h-[1px] bg-[var(--ide-border)] my-1" />
            </>
          )}

          {/* Directory creation actions */}
          {contextMenu.node.isDirectory && (
            <>
              <button
                onClick={() => setIsCreatingItem({ type: 'file', parentPath: contextMenu.node.path })}
                className="w-full px-3 py-1.5 text-left hover:bg-[#007acc] hover:text-white flex items-center gap-2 text-[var(--ide-text)]"
              >
                <FilePlus size={13} /> New File...
              </button>
              <button
                onClick={() => setIsCreatingItem({ type: 'folder', parentPath: contextMenu.node.path })}
                className="w-full px-3 py-1.5 text-left hover:bg-[#007acc] hover:text-white flex items-center gap-2 text-[var(--ide-text)]"
              >
                <FolderPlus size={13} /> New Folder...
              </button>
              <div className="h-[1px] bg-[var(--ide-border)] my-1" />
            </>
          )}

          {/* Reveal & Terminal */}
          <button
            onClick={() => handleReveal(contextMenu.node.path)}
            className="w-full px-3 py-1.5 text-left hover:bg-[#007acc] hover:text-white flex items-center justify-between text-[var(--ide-text)]"
          >
            <div className="flex items-center gap-2">
              <ExternalLink size={13} />
              <span>Reveal in File Explorer</span>
            </div>
            <span className="text-[10px] text-[var(--ide-text-muted)]">Shift+Alt+R</span>
          </button>

          <button
            onClick={() => {
              const targetDir = contextMenu.node.isDirectory 
                ? contextMenu.node.path 
                : contextMenu.node.path.substring(0, Math.max(contextMenu.node.path.lastIndexOf('/'), contextMenu.node.path.lastIndexOf('\\')));
              if (onOpenTerminalAtPath) {
                onOpenTerminalAtPath(targetDir);
              }
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#007acc] hover:text-white flex items-center gap-2 text-[var(--ide-text)]"
          >
            <Terminal size={13} /> Open in Integrated Terminal
          </button>

          <div className="h-[1px] bg-[var(--ide-border)] my-1" />

          {/* Path copy actions */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(contextMenu.node.path);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#007acc] hover:text-white flex items-center justify-between text-[var(--ide-text)]"
          >
            <div className="flex items-center gap-2">
              <Copy size={13} />
              <span>Copy Path</span>
            </div>
            <span className="text-[10px] text-[var(--ide-text-muted)]">Shift+Alt+C</span>
          </button>

          <button
            onClick={() => handleCopyRelativePath(contextMenu.node)}
            className="w-full px-3 py-1.5 text-left hover:bg-[#007acc] hover:text-white flex items-center gap-2 text-[var(--ide-text)]"
          >
            <Copy size={13} /> Copy Relative Path
          </button>

          <div className="h-[1px] bg-[var(--ide-border)] my-1" />

          {/* File manipulation actions */}
          {!contextMenu.node.isDirectory && (
            <button
              onClick={() => handleDuplicate(contextMenu.node)}
              className="w-full px-3 py-1.5 text-left hover:bg-[#007acc] hover:text-white flex items-center gap-2 text-[var(--ide-text)]"
            >
              <Files size={13} /> Duplicate
            </button>
          )}

          <button
            onClick={() => handleRename(contextMenu.node)}
            className="w-full px-3 py-1.5 text-left hover:bg-[#007acc] hover:text-white flex items-center justify-between text-[var(--ide-text)]"
          >
            <div className="flex items-center gap-2">
              <Edit2 size={13} />
              <span>Rename...</span>
            </div>
            <span className="text-[10px] text-[var(--ide-text-muted)]">F2</span>
          </button>

          <button
            onClick={() => handleDelete(contextMenu.node.path)}
            className="w-full px-3 py-1.5 text-left hover:bg-[#a1260d] text-[#f48771] hover:text-white flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Trash2 size={13} />
              <span>Delete</span>
            </div>
            <span className="text-[10px] text-[#f48771]/70">Del</span>
          </button>
        </div>
      )}
    </div>
  );
};
