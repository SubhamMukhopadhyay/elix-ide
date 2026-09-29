import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Save, 
  Eye, 
  Smartphone, 
  Split, 
  X, 
  FileCode, 
  Code2,
  ChevronRight,
  Globe,
  RotateCw,
  ExternalLink,
  Sliders,
  Columns,
  Maximize2,
  QrCode
} from 'lucide-react';
import { ProjectMetadata, ProjectTemplate } from '../../types';
import { WelcomePage } from '../Welcome/WelcomePage';
import { SettingsPage } from '../Settings/SettingsPage';
import { FileIcon } from '../Common/FileIcon';
import { ImageViewer } from './ImageViewer';
import { PdfViewer } from './PdfViewer';
import { DocxViewer } from './DocxViewer';
import { MarkdownViewer } from './MarkdownViewer';
import { getMonacoLanguage } from '../../utils/languageHelper';
import { getStoredSettings, ElixIdeSettings } from '../../utils/settingsHelper';
import { defineCustomMonacoThemes, getMonacoTheme } from '../../utils/themeHelper';

export interface EditorTab {
  id: string;
  name: string;
  path?: string;
  content: string;
  isDirty?: boolean;
  isWelcome?: boolean;
  isSettings?: boolean;
  settingsCategory?: string;
  isBinary?: boolean;
  mediaType?: 'image' | 'pdf' | 'docx' | 'video' | 'audio' | 'markdown';
  base64Url?: string;
  fileSize?: number;
}

interface EditorWorkspaceProps {
  activeProject: ProjectMetadata | null;
  tabs: EditorTab[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onContentChange: (id: string, content: string) => void;
  onSaveActiveFile: () => void;
  onRun: () => void;
  isRunning?: boolean;
  onOpenMobileSimulator?: () => void;
  onOpenFile?: (path: string, name: string) => void;
  onOpenFolder: () => void;
  onNewFile: () => void;
  recentProjects: ProjectMetadata[];
  onOpenProject: (project: ProjectMetadata) => void;
  templates: ProjectTemplate[];
  onCreateFromTemplate: (template: ProjectTemplate) => void;
  onSelectPractice: () => void;
  onSelectHackathon: () => void;
  onSelectCareer: () => void;
  onCursorChange?: (line: number, col: number) => void;
  onOpenThemePicker?: (mode: 'color' | 'file-icon' | 'product-icon') => void;
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({
  activeProject,
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onContentChange,
  onSaveActiveFile,
  onRun,
  isRunning,
  onOpenMobileSimulator,
  onOpenFile,
  onOpenFolder,
  onNewFile,
  recentProjects,
  onOpenProject,
  templates,
  onCreateFromTemplate,
  onSelectPractice,
  onSelectHackathon,
  onSelectCareer,
  onCursorChange,
  onOpenThemePicker
}) => {
  const [showWebPreview, setShowWebPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('http://localhost:5173');
  const [previewMode, setPreviewMode] = useState<string>('document');
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [editorSettings, setEditorSettings] = useState<ElixIdeSettings>(getStoredSettings);
  const [lastActiveCodeTabId, setLastActiveCodeTabId] = useState<string | null>(null);
  const [isSideBySide, setIsSideBySide] = useState<boolean>(true);
  const monacoRef = useRef<any>(null);
  const editorRef = useRef<any>(null);

  React.useEffect(() => {
    const handleJumpLine = (e: any) => {
      if (editorRef.current && e.detail && typeof e.detail.line === 'number') {
        const line = e.detail.line;
        editorRef.current.revealLineInCenter(line);
        editorRef.current.setPosition({ lineNumber: line, column: e.detail.col || 1 });
        editorRef.current.focus();
      }
    };
    window.addEventListener('elix-editor-jump-line', handleJumpLine);
    return () => window.removeEventListener('elix-editor-jump-line', handleJumpLine);
  }, []);

  React.useEffect(() => {
    const handler = (e: any) => {
      if (e.detail) {
        setEditorSettings(e.detail);
        if (monacoRef.current && e.detail.theme) {
          const target = getMonacoTheme(e.detail.theme);
          monacoRef.current.editor.setTheme(target);
        }
      }
    };
    window.addEventListener('elix-settings-changed', handler);
    return () => window.removeEventListener('elix-settings-changed', handler);
  }, []);

  React.useEffect(() => {
    if (monacoRef.current && editorSettings.theme) {
      const target = getMonacoTheme(editorSettings.theme);
      monacoRef.current.editor.setTheme(target);
    }
  }, [editorSettings.theme]);

  const activeTab = tabs.find(t => t.id === activeTabId);

  // Track the most recent code tab
  React.useEffect(() => {
    if (activeTab && !activeTab.isBinary && !activeTab.isWelcome && !activeTab.isSettings) {
      setLastActiveCodeTabId(activeTab.id);
    }
  }, [activeTab]);

  // Code tab to display on the left (either active code tab or most recent code tab)
  const codeTab = (activeTab && !activeTab.isBinary && !activeTab.isWelcome && !activeTab.isSettings)
    ? activeTab
    : (lastActiveCodeTabId ? tabs.find(t => t.id === lastActiveCodeTabId && !t.isBinary) : null)
    || tabs.find(t => !t.isBinary && !t.isWelcome && !t.isSettings)
    || null;

  const [lastActiveMediaTabId, setLastActiveMediaTabId] = useState<string | null>(null);

  React.useEffect(() => {
    if (activeTab?.isBinary) {
      setLastActiveMediaTabId(activeTab.id);
    }
  }, [activeTab]);

  const mediaTabs = tabs.filter(t => t.isBinary);
  const mediaTab = activeTab?.isBinary 
    ? activeTab 
    : (lastActiveMediaTabId ? tabs.find(t => t.id === lastActiveMediaTabId && t.isBinary) : null)
    || mediaTabs[0]
    || null;

  const isBinarySideBySide = Boolean(isSideBySide && codeTab && mediaTab);

  const handleToggleSideBySide = async () => {
    if (isBinarySideBySide) {
      // User is on side-by-side: 2nd click -> Code pura khulna chahiye!
      setIsSideBySide(false);
      setShowWebPreview(false);
      if (codeTab) {
        onSelectTab(codeTab.id);
      }
    } else {
      // 1st click: Side-by-side khulna chahiye!
      setShowWebPreview(false);

      // If no code tab is currently open in tabs, automatically find or open a code file from the project!
      if (!codeTab) {
        let opened = false;
        if (onOpenFile && activeProject?.path && window.elix?.readDir) {
          try {
            const files = await window.elix.readDir(activeProject.path);
            const priorityNames = ['index.html', 'app.tsx', 'app.jsx', 'app.js', 'main.py', 'index.js', 'index.ts', 'readme.md'];
            // 1. Look for known top-level entry files
            let target = files?.find(f => !f.isDirectory && priorityNames.includes(f.name.toLowerCase()));
            // 2. Or any non-binary code file
            if (!target) {
              target = files?.find(f => !f.isDirectory && !f.name.match(/\.(png|jpg|jpeg|gif|webp|ico|bmp|svg|avif|pdf|docx|doc|mp4|webm|mp3|wav|zip|tar|gz|exe)$/i));
            }
            if (target) {
              await onOpenFile(target.path, target.name);
              opened = true;
            }
          } catch (err) {
            console.error('Error finding project code file for side-by-side:', err);
          }
        }
        if (!opened && onNewFile) {
          onNewFile();
        }
      }

      setIsSideBySide(true);
    }
  };

  const isHtmlFile = Boolean(
    activeTab?.name?.toLowerCase().endsWith('.html') ||
    activeTab?.name?.toLowerCase().endsWith('.htm') ||
    activeTab?.path?.toLowerCase().endsWith('.html') ||
    activeTab?.path?.toLowerCase().endsWith('.htm') ||
    (typeof activeTab?.content === 'string' && (activeTab.content.includes('<html') || activeTab.content.includes('<!DOCTYPE html>')))
  );

  const isMarkdownFile = Boolean(
    activeTab?.name?.toLowerCase().endsWith('.md') ||
    activeTab?.path?.toLowerCase().endsWith('.md')
  );

  React.useEffect(() => {
    if (activeTab?.isBinary) {
      // Never show HTML live web preview when viewing a binary file
      setShowWebPreview(false);
    }
  }, [activeTab?.isBinary]);

  // Robust Eye Button Toggle Handler
  const handleToggleLivePreview = () => {
    if (!showWebPreview) {
      setPreviewMode('document');
      setPreviewKey(k => k + 1);
      setShowWebPreview(true);
    } else {
      if (previewMode !== 'document') {
        // If preview was open in 'url' mode, switch to live HTML document mode
        setPreviewMode('document');
        setPreviewKey(k => k + 1);
      } else {
        setShowWebPreview(false);
      }
    }
  };

  // Draggable preview ratio between Editor and Preview Pane
  const [isDeviceFrame, setIsDeviceFrame] = useState<boolean>(false);
  const [previewSplitRatio, setPreviewSplitRatio] = useState<number>(() => {
    const saved = localStorage.getItem('elix_preview_split_ratio');
    return saved ? Math.max(20, Math.min(80, Number(saved))) : 50;
  });
  const [isDraggingPreview, setIsDraggingPreview] = useState(false);
  const editorWorkspaceRef = useRef<HTMLDivElement>(null);

  const handleMouseDownPreviewResizer = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingPreview(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!editorWorkspaceRef.current) return;
      const rect = editorWorkspaceRef.current.getBoundingClientRect();
      const pointerX = moveEvent.clientX;
      const previewPx = rect.right - pointerX;
      const newPercent = (previewPx / rect.width) * 100;
      const clamped = Math.max(20, Math.min(80, newPercent));
      setPreviewSplitRatio(clamped);
      localStorage.setItem('elix_preview_split_ratio', String(clamped));
    };

    const onMouseUp = () => {
      setIsDraggingPreview(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const getRenderedHtml = (): string => {
    if (!activeTab || typeof activeTab.content !== 'string') return '';
    let content = activeTab.content;
    const filePath = activeTab.path || '';
    if (filePath) {
      const lastSlash = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'));
      const dirPath = lastSlash !== -1 ? filePath.substring(0, lastSlash) : '';
      if (dirPath) {
        const normalizedDir = dirPath.replace(/\\/g, '/');
        const baseHref = `file:///${normalizedDir.replace(/^\/+/, '')}/`;
        const baseTag = `<base href="${baseHref}">`;
        if (content.includes('<head>')) {
          content = content.replace('<head>', `<head>\n  ${baseTag}`);
        } else if (content.match(/<head[^>]*>/i)) {
          content = content.replace(/(<head[^>]*>)/i, `$1\n  ${baseTag}`);
        } else if (content.includes('<html>')) {
          content = content.replace('<html>', `<html><head>${baseTag}</head>`);
        } else if (content.trim().length > 0) {
          content = `<!DOCTYPE html><html><head>${baseTag}<meta charset="utf-8"></head><body>${content}</body></html>`;
        }
      }
    }
    return content;
  };

  const renderMediaContent = (tab: EditorTab) => {
    if (tab.mediaType === 'image') {
      return (
        <ImageViewer
          src={tab.base64Url || ''}
          fileName={tab.name}
          filePath={tab.path}
          fileSize={tab.fileSize}
        />
      );
    }
    if (tab.mediaType === 'pdf') {
      return (
        <PdfViewer
          src={tab.base64Url || ''}
          fileName={tab.name}
          filePath={tab.path}
          fileSize={tab.fileSize}
        />
      );
    }
    if (tab.mediaType === 'docx') {
      return (
        <DocxViewer
          src={tab.base64Url || ''}
          fileName={tab.name}
          filePath={tab.path}
          fileSize={tab.fileSize}
        />
      );
    }
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#888]">
        <p className="text-sm text-[#ccc] mb-2">Unsupported Binary File</p>
        <p className="text-xs text-[#777] mb-4">This file cannot be displayed directly in the code editor.</p>
        {tab.path && (
          <button
            onClick={() => window.elix?.openExternal?.(tab.path!)}
            className="px-3 py-1.5 bg-[#007acc] hover:bg-[#0062a3] text-white rounded text-xs transition-colors"
          >
            Open in System Default App
          </button>
        )}
      </div>
    );
  };

  const handleOpenExternalBrowser = () => {
    if (previewMode === 'url') {
      if (window.elix?.openExternal) {
        window.elix.openExternal(previewUrl);
      }
    } else {
      if (activeTab?.path && window.elix?.openExternal) {
        window.elix.openExternal(activeTab.path);
      }
    }
  };

  const getLanguageFromExt = (filePath?: string): string => {
    if (!filePath) return 'plaintext';
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) return 'typescript';
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) return 'javascript';
    if (filePath.endsWith('.py')) return 'python';
    if (filePath.endsWith('.java')) return 'java';
    if (filePath.endsWith('.cpp') || filePath.endsWith('.c') || filePath.endsWith('.h')) return 'cpp';
    if (filePath.endsWith('.rs')) return 'rust';
    if (filePath.endsWith('.go')) return 'go';
    if (filePath.endsWith('.cs')) return 'csharp';
    if (filePath.endsWith('.json')) return 'json';
    if (filePath.endsWith('.html')) return 'html';
    if (filePath.endsWith('.css')) return 'css';
    if (filePath.endsWith('.sql')) return 'sql';
    if (filePath.endsWith('.md')) return 'markdown';
    return 'plaintext';
  };

  const getBreadcrumbs = (filePath?: string): string[] => {
    if (!filePath) return [];
    const normalized = filePath.replace(/\\/g, '/');
    const parts = normalized.split('/');
    if (parts.length > 4) {
      return ['...', ...parts.slice(-3)];
    }
    return parts.slice(-3);
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden bg-[var(--ide-bg)] text-[var(--ide-text)] font-sans transition-colors duration-150`}>
      {/* Editor Tab Bar */}
      <div className="h-9 bg-[var(--ide-title-bg)] border-b border-[var(--ide-border)] flex items-center justify-between select-none">
        {/* Horizontal tabs */}
        <div className="flex items-center overflow-x-auto h-full scrollbar-none">
          {tabs.map(tab => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`h-full flex items-center gap-2 px-3 text-xs border-r border-[var(--ide-border)] cursor-pointer group transition-colors ${
                  isActive
                    ? 'bg-[var(--ide-tab-active-bg)] text-[var(--ide-text)] border-t-2 border-t-[var(--ide-accent)]'
                    : 'bg-[var(--ide-tab-inactive-bg)] text-[var(--ide-text-muted)] hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)]'
                }`}
              >
                {tab.isWelcome ? (
                  <Code2 size={13} className="text-[var(--ide-accent)] shrink-0" />
                ) : tab.isSettings ? (
                  <Sliders size={13} className="text-[var(--ide-accent)] shrink-0" />
                ) : (
                  <FileIcon fileName={tab.name} size={14} className="shrink-0" />
                )}
                <span className="truncate max-w-[150px]">{tab.name}</span>
                {tab.isDirty && (
                  <span className="w-2 h-2 rounded-full bg-white opacity-80" />
                )}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="p-0.5 rounded hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)] text-[var(--ide-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Close (Ctrl+W)"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Action icons on right of Tab Bar */}
        <div className="flex items-center gap-1 px-2 h-full text-[var(--ide-text-muted)]">
          {activeTab && !activeTab.isWelcome && !activeTab.isSettings && (
            <>
              {/* Unified Side-by-Side Toggle Button */}
              {(activeTab.isBinary || (codeTab && mediaTab)) && (
                <button
                  onClick={handleToggleSideBySide}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors border ${
                    isBinarySideBySide
                      ? 'bg-[var(--ide-accent)]/15 text-[var(--ide-accent)] border-[var(--ide-accent)]/30'
                      : 'bg-[var(--ide-input-bg)] text-[var(--ide-text-muted)] hover:text-[var(--ide-text)] border-[var(--ide-border)]'
                  }`}
                  title={isBinarySideBySide ? "Switch to Full Code (Close Media Split)" : "Split Side-by-Side with Code"}
                >
                  <Columns size={12} />
                  <span>Side-by-Side</span>
                </button>
              )}

              {activeTab.isBinary ? (
                activeTab.path && (
                  <button
                    onClick={() => window.elix?.openExternal?.(activeTab.path!)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--ide-input-bg)] hover:bg-[var(--ide-hover-bg)] text-[var(--ide-text)] rounded text-[11px] font-medium transition-colors border border-[var(--ide-border)]"
                    title="Open file in system default application"
                  >
                    <ExternalLink size={12} />
                    <span>Open in Default App</span>
                  </button>
                )
              ) : (
                <>

                {/* VS Code standard top right actions */}
                <button
                  onClick={onRun}
                  className="p-1 hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)] rounded text-[var(--ide-text-muted)] transition-colors"
                  title="Run Code (F5 / Ctrl+Alt+N)"
                >
                  <Play size={13} fill="currentColor" />
                </button>

                <button
                  onClick={() => {
                    setPreviewMode('url');
                    setShowWebPreview(!showWebPreview);
                  }}
                  className={`p-1 hover:bg-[var(--ide-hover-bg)] rounded transition-colors ${
                    showWebPreview && previewMode === 'url' ? 'text-[var(--ide-accent)] bg-[var(--ide-accent)]/15' : 'text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]'
                  }`}
                  title={showWebPreview ? 'Close Split Editor' : 'Split Editor Right (Ctrl+\\)'}
                >
                  <Split size={13} />
                </button>

                {isHtmlFile && (
                  <>
                    <button
                      onClick={handleToggleLivePreview}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors border ${
                        showWebPreview && previewMode === 'document'
                          ? 'bg-[var(--ide-accent)] text-white border-[var(--ide-accent)] shadow-sm'
                          : 'bg-[var(--ide-input-bg)] text-[var(--ide-text-muted)] hover:text-[var(--ide-text)] border-[var(--ide-border)] hover:bg-[var(--ide-hover-bg)]'
                      }`}
                      title={showWebPreview && previewMode === 'document' ? 'Close Split Live Preview' : 'Open Split Live Preview'}
                    >
                      <Eye size={12} />
                      <span>{showWebPreview && previewMode === 'document' ? 'Hide Preview' : 'Live Preview'}</span>
                    </button>

                    <button
                      onClick={handleOpenExternalBrowser}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--ide-input-bg)] hover:bg-[var(--ide-hover-bg)] text-[var(--ide-text)] rounded text-[11px] font-medium transition-colors border border-[var(--ide-border)]"
                      title="Open in Default Browser (Chrome / Edge / Firefox)"
                    >
                      <ExternalLink size={12} />
                      <span>Browser</span>
                    </button>
                  </>
                )}

                {isMarkdownFile && (
                  <button
                    onClick={() => {
                      setPreviewMode('markdown');
                      setShowWebPreview(prev => !prev || previewMode !== 'markdown');
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors border ${
                      showWebPreview && previewMode === 'markdown'
                        ? 'bg-[var(--ide-accent)] text-white border-[var(--ide-accent)] shadow-sm'
                        : 'bg-[var(--ide-input-bg)] text-[var(--ide-text-muted)] hover:text-[var(--ide-text)] border-[var(--ide-border)] hover:bg-[var(--ide-hover-bg)]'
                    }`}
                    title={showWebPreview && previewMode === 'markdown' ? 'Hide Markdown Preview' : 'Open Markdown Live Preview Side-by-Side'}
                  >
                    <Eye size={12} />
                    <span>{showWebPreview && previewMode === 'markdown' ? 'Hide Preview' : 'Preview'}</span>
                  </button>
                )}

                <button
                  onClick={onSaveActiveFile}
                  className="p-1 hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)] rounded text-[var(--ide-text-muted)] transition-colors"
                  title="Save (Ctrl+S)"
                >
                  <Save size={13} />
                </button>

                {!isHtmlFile && (
                  <button
                    onClick={() => {
                      setPreviewMode('url');
                      setShowWebPreview(!showWebPreview);
                    }}
                    className={`p-1 hover:bg-[var(--ide-hover-bg)] rounded transition-colors ${
                      showWebPreview && previewMode === 'url' ? 'text-[#007acc] bg-[#007acc]/15' : 'text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]'
                    }`}
                    title={showWebPreview ? 'Close Embedded Browser' : 'Open Embedded Browser (Localhost / URL)'}
                  >
                    <Globe size={13} />
                  </button>
                )}

                {/* Dedicated Virtual Phone Split Toggle */}
                <button
                  onClick={() => {
                    setIsDeviceFrame(true);
                    if (previewMode === 'markdown') setPreviewMode('document');
                    setShowWebPreview(prev => !prev || !isDeviceFrame);
                  }}
                  className={`p-1 hover:bg-[var(--ide-hover-bg)] rounded transition-colors ${
                    showWebPreview && isDeviceFrame ? 'text-[#007acc] bg-[#007acc]/15' : 'text-violet-400 hover:text-violet-300'
                  }`}
                  title={showWebPreview && isDeviceFrame ? "Close Virtual Phone" : "Open Live Virtual Phone (Split Preview)"}
                >
                  <Smartphone size={13} />
                </button>
              </>
            )}
          </>
        )}
      </div>
      </div>

      {/* Breadcrumb line (if code tab) */}
      {activeTab && !activeTab.isWelcome && !activeTab.isSettings && (
        <div className="h-6 bg-[var(--ide-bg)] border-b border-[var(--ide-border)] px-4 flex items-center gap-1 text-[11px] text-[var(--ide-text-muted)] select-none">
          {getBreadcrumbs(activeTab.path).map((part, idx, arr) => (
            <React.Fragment key={idx}>
              <span className={idx === arr.length - 1 ? 'text-[var(--ide-text)] font-medium' : 'hover:text-[var(--ide-text)] cursor-pointer'}>
                {part}
              </span>
              {idx < arr.length - 1 && <ChevronRight size={11} className="text-[var(--ide-text-muted)]" />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Editor Center Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab?.isWelcome ? (
          <WelcomePage
            onOpenFolder={onOpenFolder}
            onNewFile={onNewFile}
            recentProjects={recentProjects}
            onOpenProject={onOpenProject}
            templates={templates}
            onCreateFromTemplate={onCreateFromTemplate}
            onSelectPractice={onSelectPractice}
            onSelectHackathon={onSelectHackathon}
            onSelectCareer={onSelectCareer}
          />
        ) : activeTab?.isSettings ? (
          <SettingsPage 
            initialCategory={activeTab.settingsCategory as any} 
            onOpenThemePicker={onOpenThemePicker} 
          />
        ) : activeTab ? (
          <div ref={editorWorkspaceRef} className="flex-1 flex overflow-hidden relative">
            {isDraggingPreview && (
              <div className="fixed inset-0 z-50 cursor-col-resize select-none pointer-events-auto" />
            )}
            {isBinarySideBySide && codeTab ? (
              <>
                {/* Left Side: Code Editor (e.g. index.html) */}
                <div
                  style={{ width: `${100 - previewSplitRatio}%` }}
                  className="h-full overflow-hidden min-w-[150px] flex flex-col border-r border-[#2b2b2b]"
                >
                  {/* Left Code Header */}
                  <div className="h-7 bg-[var(--ide-title-bg)] border-b border-[var(--ide-border)] px-3 flex items-center justify-between text-xs text-[var(--ide-text-muted)] shrink-0">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <FileIcon fileName={codeTab.name} size={13} />
                      <span className="font-medium text-[var(--ide-text)] truncate">{codeTab.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] opacity-70 mr-1">{getLanguageFromExt(codeTab.path)}</span>
                      <button
                        onClick={handleToggleSideBySide}
                        className="px-2 py-0.5 rounded hover:bg-[var(--ide-hover-bg)] text-[11px] text-[var(--ide-text-muted)] hover:text-[var(--ide-text)] flex items-center gap-1 transition-colors"
                        title="Switch to full code (close media split)"
                      >
                        <Maximize2 size={11} />
                        <span>Full Code</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <Editor
                      height="100%"
                      theme={getMonacoTheme(editorSettings.theme)}
                      beforeMount={defineCustomMonacoThemes}
                      language={getMonacoLanguage(codeTab.path)}
                      value={codeTab.content}
                      onChange={val => onContentChange(codeTab.id, val || '')}
                      onMount={(editor, monaco) => {
                        editorRef.current = editor;
                        monacoRef.current = monaco;
                        const targetTheme = getMonacoTheme(editorSettings.theme);
                        monaco.editor.setTheme(targetTheme);
                        editor.onDidChangeCursorPosition(e => {
                          if (onCursorChange) {
                            onCursorChange(e.position.lineNumber, e.position.column);
                          }
                        });
                      }}
                      options={{
                        fontFamily: editorSettings.fontFamily,
                        fontSize: editorSettings.fontSize,
                        lineHeight: Math.round(editorSettings.fontSize * 1.5),
                        minimap: { enabled: editorSettings.minimap, side: 'right' },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: editorSettings.tabSize,
                        wordWrap: editorSettings.wordWrap,
                        renderLineHighlight: 'all',
                        cursorBlinking: editorSettings.cursorBlinking,
                        cursorStyle: editorSettings.cursorStyle,
                        cursorSmoothCaretAnimation: 'on',
                        smoothScrolling: editorSettings.smoothScrolling,
                        formatOnPaste: editorSettings.formatOnPaste,
                        padding: { top: 8 }
                      }}
                    />
                  </div>
                </div>

                {/* Draggable Vertical Splitter between Code and Media Viewer */}
                <div
                  onMouseDown={handleMouseDownPreviewResizer}
                  onDoubleClick={() => {
                    setPreviewSplitRatio(50);
                    localStorage.setItem('elix_preview_split_ratio', '50');
                  }}
                  className="w-1.5 hover:w-2 bg-[#2b2b2b] hover:bg-[#007acc] active:bg-[#007acc] cursor-col-resize shrink-0 transition-colors z-20 group relative flex items-center justify-center"
                  title="Drag to resize Code / Media (Double-click to reset to 50%)"
                >
                  <div className="absolute inset-y-0 -left-1.5 -right-1.5 cursor-col-resize" />
                  <div className="w-0.5 h-6 bg-white/20 group-hover:bg-white/60 rounded" />
                </div>

                {/* Right Side: Media Viewer (Image, PDF, DOCX) */}
                {mediaTab && (
                  <div
                    style={{ width: `${previewSplitRatio}%` }}
                    className="h-full overflow-hidden min-w-[200px] flex flex-col bg-[var(--ide-bg)] shrink-0"
                  >
                    {/* Right Media Header Toolbar */}
                    <div className="h-7 bg-[var(--ide-title-bg)] border-b border-[var(--ide-border)] px-3 flex items-center justify-between text-xs text-[var(--ide-text-muted)] shrink-0">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <FileIcon fileName={mediaTab.name} size={13} />
                        <span className="font-medium text-[var(--ide-text)] truncate">{mediaTab.name}</span>
                        {mediaTab.fileSize && (
                          <span className="text-[10px] opacity-70">({formatFileSize(mediaTab.fileSize)})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setIsSideBySide(false);
                            onSelectTab(mediaTab.id);
                          }}
                          className="px-2 py-0.5 rounded hover:bg-[var(--ide-hover-bg)] text-[11px] text-[var(--ide-text-muted)] hover:text-[var(--ide-text)] flex items-center gap-1 transition-colors"
                          title="View full width (close code split)"
                        >
                          <Maximize2 size={11} />
                          <span>Full Width</span>
                        </button>
                        {mediaTab.path && (
                          <button
                            onClick={() => window.elix?.openExternal?.(mediaTab.path!)}
                            className="p-1 rounded hover:bg-[var(--ide-hover-bg)] text-[var(--ide-text-muted)] hover:text-[var(--ide-text)] transition-colors"
                            title="Open in System Default App"
                          >
                            <ExternalLink size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      {renderMediaContent(mediaTab)}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div
                style={{ width: showWebPreview ? `${100 - previewSplitRatio}%` : '100%' }}
                className="h-full overflow-hidden min-w-[150px]"
              >
                {activeTab.isBinary ? (
                  renderMediaContent(activeTab)
                ) : (
                  <Editor
                    height="100%"
                    theme={getMonacoTheme(editorSettings.theme)}
                    beforeMount={defineCustomMonacoThemes}
                    language={getMonacoLanguage(activeTab.path)}
                    value={activeTab.content}
                    onChange={val => onContentChange(activeTab.id, val || '')}
                    onMount={(editor, monaco) => {
                      editorRef.current = editor;
                      monacoRef.current = monaco;
                      const targetTheme = getMonacoTheme(editorSettings.theme);
                      monaco.editor.setTheme(targetTheme);
                      editor.onDidChangeCursorPosition(e => {
                        if (onCursorChange) {
                          onCursorChange(e.position.lineNumber, e.position.column);
                        }
                      });
                    }}
                    options={{
                      fontFamily: editorSettings.fontFamily,
                      fontSize: editorSettings.fontSize,
                      lineHeight: Math.round(editorSettings.fontSize * 1.5),
                      minimap: { enabled: editorSettings.minimap, side: 'right' },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: editorSettings.tabSize,
                      wordWrap: editorSettings.wordWrap,
                      renderLineHighlight: 'all',
                      cursorBlinking: editorSettings.cursorBlinking,
                      cursorStyle: editorSettings.cursorStyle,
                      cursorSmoothCaretAnimation: 'on',
                      smoothScrolling: editorSettings.smoothScrolling,
                      formatOnPaste: editorSettings.formatOnPaste,
                      padding: { top: 8 }
                    }}
                  />
                )}
              </div>
            )}

            {/* Split Web Preview (Only for HTML/Markdown/URL when not viewing binary files) */}
            {!isBinarySideBySide && !activeTab?.isBinary && showWebPreview && (
              <>
                {/* Draggable Vertical Splitter between Editor and Preview */}
                <div
                  onMouseDown={handleMouseDownPreviewResizer}
                  onDoubleClick={() => {
                    setPreviewSplitRatio(50);
                    localStorage.setItem('elix_preview_split_ratio', '50');
                  }}
                  className="w-1 hover:w-1.5 bg-[#2b2b2b] hover:bg-[#007acc] active:bg-[#007acc] cursor-col-resize shrink-0 transition-colors z-20 group relative"
                  title="Drag to resize Live Preview / Editor (Double-click to reset to 50%)"
                >
                  <div className="absolute inset-y-0 -left-1 -right-1 cursor-col-resize" />
                </div>

                <div
                  style={{ width: `${previewSplitRatio}%` }}
                  className="border-l border-[#2b2b2b] flex flex-col bg-[#1e1e1e] shrink-0 min-w-[200px] overflow-hidden"
                >
                  {/* Preview Toolbar */}
                  <div className="h-9 px-3 bg-[#252526] border-b border-[#181818] flex items-center justify-between text-xs select-none gap-2">
                    {/* Left: Mode toggle */}
                    <div className="flex items-center gap-1 bg-[#1e1e1e] p-0.5 rounded border border-[#333333]">
                      {isMarkdownFile ? (
                        <button
                          onClick={() => setPreviewMode('markdown')}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                            previewMode === 'markdown'
                              ? 'bg-[#007acc] text-white'
                              : 'text-[#858585] hover:text-[#cccccc]'
                          }`}
                        >
                          Markdown
                        </button>
                      ) : (
                        <button
                          onClick={() => setPreviewMode('document')}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                            previewMode === 'document'
                              ? 'bg-[#007acc] text-white'
                              : 'text-[#858585] hover:text-[#cccccc]'
                          }`}
                        >
                          Active HTML
                        </button>
                      )}
                      <button
                        onClick={() => setPreviewMode('url')}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          previewMode === 'url'
                            ? 'bg-[#007acc] text-white'
                            : 'text-[#858585] hover:text-[#cccccc]'
                        }`}
                      >
                        Server URL
                      </button>
                    </div>

                    {/* Center: Address Bar or File Status */}
                    <div className="flex-1 flex items-center justify-center">
                      {previewMode === 'url' ? (
                        <div className="flex items-center gap-1.5 w-full max-w-xs bg-[#3c3c3c] px-2 py-0.5 rounded border border-[#2b2b2b]">
                          <Globe size={11} className="text-[#007acc] shrink-0" />
                          <input
                            type="text"
                            value={previewUrl}
                            onChange={e => setPreviewUrl(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                setPreviewKey(k => k + 1);
                              }
                            }}
                            placeholder="http://localhost:5173"
                            className="bg-transparent text-white text-[11px] w-full focus:outline-none"
                          />
                        </div>
                      ) : previewMode === 'markdown' ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-[#cccccc] truncate">
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                          <span className="truncate text-amber-300">{activeTab?.name}</span>
                          <span className="text-[#777777] text-[10px] hidden lg:inline">(Rendered)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px] text-[#cccccc] truncate">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                          <span className="truncate text-[#9cdcfe]">{activeTab?.name || 'index.html'}</span>
                          <span className="text-[#777777] text-[10px] hidden lg:inline">(Live Updates)</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 text-[#858585]">
                      <button
                        onClick={() => setPreviewKey(k => k + 1)}
                        className="p-1 hover:bg-[#333333] hover:text-white rounded transition-colors"
                        title="Reload Preview"
                      >
                        <RotateCw size={13} />
                      </button>

                      {/* Virtual Phone Frame Mode Toggle */}
                      <button
                        onClick={() => setIsDeviceFrame(prev => !prev)}
                        className={`p-1 rounded transition-colors ${
                          isDeviceFrame ? 'bg-[#007acc] text-white shadow-sm' : 'hover:bg-[#333333] hover:text-white text-[#858585]'
                        }`}
                        title={isDeviceFrame ? "Switch to Responsive View" : "Switch to Virtual Phone Frame (iPhone / Android Simulator)"}
                      >
                        <Smartphone size={13} />
                      </button>

                      {/* Full Simulator with Real Phone QR Code */}
                      {onOpenMobileSimulator && (
                        <button
                          onClick={onOpenMobileSimulator}
                          className="p-1 hover:bg-[#333333] hover:text-white text-[#858585] rounded transition-colors"
                          title="Open Full Mobile Simulator & Real Phone QR Code"
                        >
                          <QrCode size={13} />
                        </button>
                      )}

                      <button
                        onClick={handleOpenExternalBrowser}
                        className="p-1 hover:bg-[#333333] hover:text-white rounded transition-colors"
                        title="Open in Default Browser (Chrome / Edge)"
                      >
                        <ExternalLink size={13} />
                      </button>

                      <button
                        onClick={() => setShowWebPreview(false)}
                        className="p-1 hover:bg-[#333333] hover:text-white rounded transition-colors"
                        title="Close Preview"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Preview Frame Body */}
                  <div className="flex-1 bg-white relative overflow-hidden flex flex-col">
                    {previewMode === 'markdown' && activeTab ? (
                      <MarkdownViewer
                        content={activeTab.content}
                        fileName={activeTab.name}
                        filePath={activeTab.path}
                      />
                    ) : isDeviceFrame ? (
                      /* Virtual Phone Screen Frame (Mobile Simulator View) */
                      <div className="flex-1 bg-[#0b0f19] flex items-center justify-center p-3 overflow-auto select-none">
                        <div className="w-[330px] h-[610px] max-h-full bg-[#18181b] rounded-[38px] p-2.5 shadow-2xl border-[3px] border-[#3f3f46] flex flex-col relative shrink-0">
                          {/* Top Speaker / Dynamic Island */}
                          <div className="w-full h-5 flex items-center justify-center relative shrink-0 z-10">
                            <div className="w-20 h-3 bg-[#09090b] rounded-full flex items-center justify-end px-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#27272a]" />
                            </div>
                          </div>
                          {/* Inner Screen */}
                          <div className="flex-1 rounded-[26px] overflow-hidden bg-white relative">
                            {previewMode === 'document' ? (
                              isHtmlFile && activeTab ? (
                                <iframe
                                  key={`doc-phone-${previewKey}`}
                                  srcDoc={getRenderedHtml() || '<!DOCTYPE html><html><body><div style="font-family:sans-serif;color:#888;padding:16px;">(Empty HTML Document)</div></body></html>'}
                                  title="Virtual Phone Preview"
                                  className="w-full h-full border-none bg-white"
                                  sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#18181b] text-[#888888] select-none text-xs">
                                  <Smartphone size={28} className="text-[#555] mb-2" />
                                  <p className="text-white font-medium mb-1">No Active HTML/App</p>
                                  <p className="text-[11px] text-[#777] mb-3">Open an app or switch to Server URL mode.</p>
                                  <button
                                    onClick={() => setPreviewMode('url')}
                                    className="px-2.5 py-1 bg-[#007acc] text-white rounded text-[11px] font-medium"
                                  >
                                    Switch to Dev Server
                                  </button>
                                </div>
                              )
                            ) : (
                              <iframe
                                key={`url-phone-${previewKey}`}
                                src={previewUrl}
                                title="Virtual Phone Dev Server"
                                className="w-full h-full border-none bg-white"
                                sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                              />
                            )}
                          </div>
                          {/* Bottom Home Indicator Bar */}
                          <div className="w-full h-4 flex items-center justify-center shrink-0">
                            <div className="w-24 h-1 bg-[#52525b] rounded-full" />
                          </div>
                        </div>
                      </div>
                    ) : previewMode === 'document' ? (
                      isHtmlFile && activeTab ? (
                        <iframe
                          key={`doc-${previewKey}`}
                          srcDoc={getRenderedHtml() || '<!DOCTYPE html><html><body><div style="font-family:sans-serif;color:#888;padding:16px;">(Empty HTML Document)</div></body></html>'}
                          title="Live HTML Preview"
                          className="w-full h-full border-none bg-white"
                          sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#1e1e1e] text-[#888888] select-none">
                          <Globe size={40} className="text-[#555555] mb-3" />
                          <p className="text-sm font-medium text-[#cccccc] mb-1">No Active HTML File</p>
                          <p className="text-xs text-[#888888] max-w-xs mb-4">
                            Open an <code>.html</code> file in the editor to see live updates, or switch to Server URL mode.
                          </p>
                          <button
                            onClick={() => setPreviewMode('url')}
                            className="px-3 py-1.5 bg-[#007acc] hover:bg-[#0062a3] text-white rounded text-xs font-semibold transition-colors"
                          >
                            Switch to Server URL ({previewUrl})
                          </button>
                        </div>
                      )
                    ) : (
                      <iframe
                        key={`url-${previewKey}`}
                        src={previewUrl}
                        title="Dev Server Preview"
                        className="w-full h-full border-none bg-white"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                      />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Empty Workspace state */
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--ide-text-muted)] select-none p-6 text-center">
            <Code2 size={48} className="mb-4 text-[var(--ide-text-muted)] opacity-50" />
            <p className="text-sm font-medium text-[var(--ide-text)] mb-1">No files open</p>
            <p className="text-xs text-[var(--ide-text-muted)] max-w-sm mb-4">
              Select a file from the Explorer on the left, or open a workspace folder to begin.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenFolder}
                className="px-3 py-1.5 bg-[#007acc] hover:bg-[#0062a3] text-white rounded text-xs font-semibold transition-colors"
              >
                Open Folder
              </button>
              <button
                onClick={onNewFile}
                className="px-3 py-1.5 bg-[var(--ide-hover-bg)] hover:bg-[var(--ide-border)] text-[var(--ide-text)] border border-[var(--ide-border)] rounded text-xs transition-colors"
              >
                New File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
