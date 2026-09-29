import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MenuBar } from './components/TitleBar/MenuBar';
import { ActivityBar } from './components/ActivityBar/ActivityBar';
import { ExplorerSidebar } from './components/Sidebar/ExplorerSidebar';
import { SearchSidebar } from './components/Sidebar/SearchSidebar';
import { GitSidebar } from './components/Sidebar/GitSidebar';
import { DebugSidebar } from './components/Sidebar/DebugSidebar';
import { EditorWorkspace, EditorTab } from './components/Editor/EditorWorkspace';
import { VSCodeBottomPanel } from './components/BottomPanel/VSCodeBottomPanel';
import { StatusBar } from './components/StatusBar/StatusBar';
import { PracticeHub } from './components/Practice/PracticeHub';
import { HackathonHub } from './components/Hackathons/HackathonHub';
import { CareerDashboard } from './components/Career/CareerDashboard';
import { EnvironmentModal } from './components/Environments/EnvironmentModal';
import { AiAgentPanel } from './components/AiAgent/AiAgentPanel';
import { UniversalSearchModal } from './components/Search/UniversalSearchModal';
import { MobilePreviewModal } from './components/Mobile/MobilePreviewModal';
import { TimeMachineModal } from './components/TimeMachine/TimeMachineModal';
import { ThemePickerModal, ThemePickerMode } from './components/Settings/ThemePickerModal';
import { ProjectMetadata, ProjectTemplate, ExecutionEvent, ConnectionState } from './types';
import { getLanguageMeta, getLanguageDisplayName } from './utils/languageHelper';
import { getStoredSettings } from './utils/settingsHelper';
import { applyThemeGlobally } from './utils/themeHelper';

export const App: React.FC = () => {
  // Theme State
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    const s = getStoredSettings();
    return s.theme || 'Dark Modern';
  });
  const [themePickerMode, setThemePickerMode] = useState<ThemePickerMode | null>(null);
  const lastCtrlKTimeRef = useRef<number>(0);

  useEffect(() => {
    const s = getStoredSettings();
    applyThemeGlobally(s.theme || 'Dark Modern');

    const handleSettingsChanged = (e: any) => {
      if (e.detail?.theme) {
        applyThemeGlobally(e.detail.theme);
        setCurrentTheme(e.detail.theme);
      }
    };
    window.addEventListener('elix-settings-changed', handleSettingsChanged);
    return () => window.removeEventListener('elix-settings-changed', handleSettingsChanged);
  }, []);

  // Active Project & Workspaces
  const [activeProject, setActiveProject] = useState<ProjectMetadata | null>(null);
  const [recentProjects, setRecentProjects] = useState<ProjectMetadata[]>([]);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);

  // Navigation & Layout
  const [activeActivity, setActiveActivity] = useState<string>('explorer');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState<boolean>(true);
  const [isAiOpen, setIsAiOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('elix_is_ai_open');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('elix_is_ai_open', String(isAiOpen));
  }, [isAiOpen]);

  // Resizable Panels State (with localStorage persistence)
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem('elix_sidebar_width');
    return saved ? Math.max(170, Math.min(600, Number(saved))) : 260;
  });
  const [bottomPanelHeight, setBottomPanelHeight] = useState<number>(() => {
    const saved = localStorage.getItem('elix_bottom_panel_height');
    return saved ? Math.max(100, Math.min(650, Number(saved))) : 240;
  });
  const [aiPanelWidth, setAiPanelWidth] = useState<number>(() => {
    const saved = localStorage.getItem('elix_ai_panel_width');
    if (!saved || saved === '310') return 380;
    return Math.max(260, Math.min(800, Number(saved)));
  });
  const [isAiMaximized, setIsAiMaximized] = useState<boolean>(false);
  const prevAiWidthRef = useRef<number>(380);

  const handleToggleMaximizeAi = () => {
    setIsAiMaximized(prev => {
      const next = !prev;
      if (next) {
        prevAiWidthRef.current = aiPanelWidth;
        const targetWidth = Math.min(850, Math.max(600, Math.round(window.innerWidth * 0.55)));
        setAiPanelWidth(targetWidth);
      } else {
        setAiPanelWidth(prevAiWidthRef.current || 380);
      }
      return next;
    });
  };

  const [activeDrag, setActiveDrag] = useState<'sidebar' | 'bottom' | 'ai' | null>(null);

  // Pointer drag resize handlers with Snap-to-Close
  const startResizeSidebar = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveDrag('sidebar');
    const startX = e.clientX;
    const initialWidth = sidebarWidth;
    let didSnapClose = false;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const rawWidth = initialWidth + delta;
      
      // Snap-to-close: dragging smaller than 130px closes sidebar
      if (rawWidth < 130) {
        didSnapClose = true;
        setIsSidebarOpen(false);
      } else {
        didSnapClose = false;
        setIsSidebarOpen(true);
        const nextWidth = Math.max(160, Math.min(600, rawWidth));
        setSidebarWidth(nextWidth);
        localStorage.setItem('elix_sidebar_width', String(nextWidth));
      }
    };

    const onMouseUp = () => {
      setActiveDrag(null);
      if (didSnapClose) {
        setSidebarWidth(260);
        localStorage.setItem('elix_sidebar_width', '260');
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const startResizeBottomPanel = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveDrag('bottom');
    const startY = e.clientY;
    const initialHeight = bottomPanelHeight;
    let didSnapClose = false;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startY - moveEvent.clientY;
      const rawHeight = initialHeight + delta;

      // Snap-to-close: dragging smaller than 80px closes bottom panel
      if (rawHeight < 80) {
        didSnapClose = true;
        setIsBottomPanelOpen(false);
      } else {
        didSnapClose = false;
        setIsBottomPanelOpen(true);
        const maxHeight = Math.round(window.innerHeight * 0.8);
        const nextHeight = Math.max(100, Math.min(maxHeight, rawHeight));
        setBottomPanelHeight(nextHeight);
        localStorage.setItem('elix_bottom_panel_height', String(nextHeight));
      }
    };

    const onMouseUp = () => {
      setActiveDrag(null);
      if (didSnapClose) {
        setBottomPanelHeight(240);
        localStorage.setItem('elix_bottom_panel_height', '240');
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const startResizeAiPanel = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveDrag('ai');
    const startX = e.clientX;
    const initialWidth = aiPanelWidth;
    let didSnapClose = false;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.clientX;
      const rawWidth = initialWidth + delta;

      // Snap-to-close: dragging smaller than 280px closes AI panel (itna tak hi khulega fir band ho jayega)
      if (rawWidth < 280) {
        didSnapClose = true;
        setIsAiOpen(false);
      } else {
        didSnapClose = false;
        setIsAiOpen(true);
        setIsAiMaximized(false);
        const nextWidth = Math.max(280, Math.min(800, rawWidth));
        setAiPanelWidth(nextWidth);
        localStorage.setItem('elix_ai_panel_width', String(nextWidth));
      }
    };

    const onMouseUp = () => {
      setActiveDrag(null);
      if (didSnapClose) {
        setAiPanelWidth(380);
        localStorage.setItem('elix_ai_panel_width', '380');
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Tabs & Editing
  const [tabs, setTabs] = useState<EditorTab[]>([
    { id: 'welcome', name: 'Get Started', isWelcome: true, content: '' }
  ]);
  const [activeTabId, setActiveTabId] = useState<string | null>('welcome');
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number }>({ line: 1, col: 1 });

  // Execution & Terminal
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionLogs, setExecutionLogs] = useState<ExecutionEvent[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>(() => {
    return typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'local';
  });
  const [isBottomPanelMaximized, setIsBottomPanelMaximized] = useState<boolean>(false);

  // Auto-detect online / offline status
  useEffect(() => {
    const handleOnline = () => setConnectionState('online');
    const handleOffline = () => setConnectionState('local');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Modals
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [searchModalInitialQuery, setSearchModalInitialQuery] = useState<string>('');
  const [showMobileModal, setShowMobileModal] = useState<boolean>(false);
  const [showTimeMachineModal, setShowTimeMachineModal] = useState<boolean>(false);

  // Dynamic Practice & Coding Streak
  const [practiceStreak, setPracticeStreak] = useState<number>(1);

  const refreshStreaks = async () => {
    if (window.elix) {
      const strks = await window.elix.getStreaks();
      const current = strks?.['overall']?.currentStreak || strks?.['dsa']?.currentStreak || 1;
      setPracticeStreak(current);
    }
  };

  // Helper to find the best primary file to auto-open in a folder
  const findPrimaryFile = (items: Array<{ name: string; isDirectory: boolean; path: string }>) => {
    const files = items.filter(i => !i.isDirectory && !i.name.startsWith('.'));
    if (files.length === 0) return null;

    // Filter out binaries / compiled files
    const nonBinaries = files.filter(f => {
      const ext = f.name.toLowerCase().split('.').pop() || '';
      return !['exe', 'dll', 'so', 'dylib', 'bin', 'o', 'obj', 'class', 'pyc', 'zip', 'tar', 'gz'].includes(ext);
    });
    if (nonBinaries.length === 0) return null;

    // Priority 1: Main entry points
    const entrypoint = nonBinaries.find(f => /^(main|index|app|server|run)\.[a-z0-9]+$/i.test(f.name));
    if (entrypoint) return entrypoint;

    // Priority 2: Primary source code files
    const codeFile = nonBinaries.find(f => {
      const ext = f.name.toLowerCase().split('.').pop() || '';
      return ['cpp', 'c', 'h', 'hpp', 'py', 'js', 'ts', 'tsx', 'jsx', 'java', 'rs', 'go', 'cs', 'html', 'css'].includes(ext);
    });
    if (codeFile) return codeFile;

    // Priority 3: Readme files
    const readme = nonBinaries.find(f => f.name.toLowerCase().startsWith('readme'));
    if (readme) return readme;

    // Priority 4: First readable non-binary file
    return nonBinaries[0];
  };

  // Open File into Tab
  const handleOpenFile = useCallback(async (filePath: string, fileName: string) => {
    if (!window.elix) return;
    const cleanPath = filePath.replace(/\\/g, '/');

    const ext = fileName.toLowerCase().split('.').pop() || '';
    const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'bmp', 'svg', 'avif'].includes(ext);
    const isPdf = ext === 'pdf';
    const isDocx = ['docx', 'doc'].includes(ext);
    const isVideo = ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
    const isAudio = ['mp3', 'wav', 'aac'].includes(ext);
    const isBinary = isImage || isPdf || isDocx || isVideo || isAudio;

    if (isBinary) {
      const [base64Url, stats] = await Promise.all([
        window.elix.readFileBase64 ? window.elix.readFileBase64(cleanPath) : null,
        window.elix.getFileStats ? window.elix.getFileStats(cleanPath) : null
      ]);

      const newTab: EditorTab = {
        id: cleanPath,
        name: fileName,
        path: cleanPath,
        content: '',
        isDirty: false,
        isBinary: true,
        mediaType: isImage ? 'image' : isPdf ? 'pdf' : isDocx ? 'docx' : isVideo ? 'video' : 'audio',
        base64Url: base64Url || `file:///${cleanPath.replace(/\\/g, '/')}`,
        fileSize: stats?.size || 0
      };

      setTabs(prev => {
        const nonWelcome = prev.filter(t => !t.isWelcome && t.id !== 'welcome');
        if (nonWelcome.some(t => t.id === newTab.id)) {
          return nonWelcome;
        }
        return [...nonWelcome, newTab];
      });
      setActiveTabId(newTab.id);
      return;
    }

    const content = await window.elix.readFile(cleanPath);
    if (typeof content === 'string') {
      const newTab: EditorTab = {
        id: cleanPath,
        name: fileName,
        path: cleanPath,
        content,
        isDirty: false
      };
      setTabs(prev => {
        const nonWelcome = prev.filter(t => !t.isWelcome && t.id !== 'welcome');
        if (nonWelcome.some(t => t.id === newTab.id)) {
          return nonWelcome;
        }
        return [...nonWelcome, newTab];
      });
      setActiveTabId(newTab.id);
    }
  }, []);

  // Open Folder / Project with smart auto-file opening
  const openFolderPath = useCallback(async (folderPath: string, specificFileToOpen?: string) => {
    if (!window.elix) return;
    const cleanPath = folderPath.replace(/\\/g, '/').replace(/\/+$/, '');
    const folderName = cleanPath.split('/').pop() || 'Workspace';

    const proj: ProjectMetadata = {
      id: `proj_${Date.now()}`,
      name: folderName,
      path: cleanPath,
      categories: ['general'],
      language: 'Auto',
      createdAt: new Date().toISOString(),
      lastOpenedAt: new Date().toISOString()
    };

    await window.elix.saveProject(proj);
    setActiveProject(proj);
    localStorage.setItem('elix_active_project_path', proj.path);
    setActiveActivity('explorer');
    setIsSidebarOpen(true);

    const projs = await window.elix.getProjects();
    if (projs) setRecentProjects(projs);

    if (specificFileToOpen) {
      const fileName = specificFileToOpen.replace(/\\/g, '/').split('/').pop() || specificFileToOpen;
      await handleOpenFile(specificFileToOpen, fileName);
    } else {
      try {
        const items = await window.elix.readDir(cleanPath);
        if (items && items.length > 0) {
          const primary = findPrimaryFile(items);
          if (primary) {
            await handleOpenFile(primary.path, primary.name);
          }
        }
      } catch (err) {
        console.error('Failed to auto-open primary file:', err);
      }
    }
  }, [handleOpenFile]);

  const handleOpenTargetPath = useCallback(async (targetPath: string) => {
    if (!window.elix || !targetPath) return;
    const info = window.elix.getPathInfo ? await window.elix.getPathInfo(targetPath) : null;
    if (info && info.exists) {
      if (info.isDirectory) {
        await openFolderPath(targetPath);
      } else if (info.isFile) {
        await openFolderPath(info.dir, targetPath);
      }
    } else {
      await openFolderPath(targetPath);
    }
  }, [openFolderPath]);

  // Initial Load: Projects & Templates & Streaks
  useEffect(() => {
    if (!window.elix) return;
    refreshStreaks();

    (async () => {
      let launchPath: string | null = null;
      try {
        if (window.elix.getLaunchPath) {
          launchPath = await window.elix.getLaunchPath();
        }
      } catch (e) {
        console.error('Failed to get launch path:', e);
      }

      try {
        const projs = await window.elix.getProjects();
        if (projs && projs.length > 0) {
          setRecentProjects(projs);
        }
      } catch (e) {
        console.error('Failed to get projects:', e);
      }

      if (launchPath) {
        await handleOpenTargetPath(launchPath);
      } else {
        const savedPath = localStorage.getItem('elix_active_project_path');
        if (savedPath) {
          await openFolderPath(savedPath);
        }
      }
    })();

      window.elix.getAllTemplates().then(tmpls => {
        if (tmpls) setTemplates(tmpls);
      });

      const unsub = window.elix.onExecutionEvent(event => {
        setExecutionLogs(prev => [...prev, event]);
        if (event.type === 'exit') {
          setIsRunning(false);
          refreshStreaks();
        }
      });

      // Listen for runtime external file/folder opens (e.g. 2nd instance launched from context menu)
      const unsubOpenPath = window.elix.onOpenExternalPath
        ? window.elix.onOpenExternalPath(p => handleOpenTargetPath(p))
        : () => {};

      const handleResetEvent = () => refreshStreaks();
      window.addEventListener('elix-progress-reset', handleResetEvent);

      return () => {
        unsub();
        unsubOpenPath();
        window.removeEventListener('elix-progress-reset', handleResetEvent);
      };
  }, [handleOpenTargetPath]);

  // Keyboard Shortcuts (Standard VS Code)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+P: Command Palette
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setSearchModalInitialQuery('>');
        setShowSearchModal(true);
      }
      // Ctrl+Shift+X: Open Environments & SDKs
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        handleOpenSettingsTab('environments');
      }
      // Ctrl+K chord detection
      else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'k') {
        lastCtrlKTimeRef.current = Date.now();
      }
      // Ctrl+T after Ctrl+K -> Color Theme
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't' && Date.now() - lastCtrlKTimeRef.current < 1500) {
        e.preventDefault();
        lastCtrlKTimeRef.current = 0;
        setThemePickerMode('color');
      }
      // Ctrl+S: Check if following Ctrl+K (Keyboard Shortcuts) or regular Save
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (Date.now() - lastCtrlKTimeRef.current < 1500) {
          lastCtrlKTimeRef.current = 0;
          handleOpenSettingsTab('shortcuts');
        } else {
          handleSaveActiveFile();
        }
      }
      // Ctrl+P: Quick Open / Universal Search
      else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setSearchModalInitialQuery('');
        setShowSearchModal(prev => !prev);
      }
      // Ctrl+B: Toggle Primary Sidebar
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      }
      // Ctrl+`: Toggle Bottom Panel
      else if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setIsBottomPanelOpen(prev => !prev);
      }
      // Ctrl+W: Close Active Tab
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (activeTabId) handleCloseTab(activeTabId);
      }
      // F5: Run File
      else if (e.key === 'F5') {
        e.preventDefault();
        handleRun();
      }
      // Ctrl+O: Open File
      else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpenFileDialog();
      }
      // Ctrl+N: New File
      else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewFile();
      }
      // Ctrl+,: Open Settings Tab (VS Code Parity)
      else if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        handleOpenSettingsTab();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });


  // Open File Dialog
  const handleOpenFileDialog = useCallback(async () => {
    if (window.elix) {
      const filePath = await window.elix.openFileDialog();
      if (filePath) {
        const fileName = filePath.replace(/\\/g, '/').split('/').pop() || filePath;
        handleOpenFile(filePath, fileName);
      }
    }
  }, [handleOpenFile]);

  // Open Settings as Editor Tab (VS Code Parity)
  const handleOpenSettingsTab = useCallback((category?: string) => {
    setActiveActivity('explorer');
    setTabs(prev => {
      const existing = prev.find(t => t.id === 'settings');
      if (existing) {
        if (category) {
          return prev.map(t => (t.id === 'settings' ? { ...t, settingsCategory: category } : t));
        }
        return prev;
      }
      return [
        {
          id: 'settings',
          name: 'Settings',
          isSettings: true,
          settingsCategory: category || 'commonly_used',
          content: ''
        },
        ...prev
      ];
    });
    setActiveTabId('settings');
  }, []);

  useEffect(() => {
    const handleOpenSettingsEvent = (e: any) => {
      const cat = e?.detail?.category || 'commonly_used';
      handleOpenSettingsTab(cat);
    };
    window.addEventListener('open-settings', handleOpenSettingsEvent);
    return () => {
      window.removeEventListener('open-settings', handleOpenSettingsEvent);
    };
  }, [handleOpenSettingsTab]);

  // Close Tab
  const handleCloseTab = useCallback((id: string) => {
    setTabs(prev => {
      const filtered = prev.filter(t => t.id !== id);
      if (activeTabId === id) {
        if (filtered.length > 0) {
          setActiveTabId(filtered[filtered.length - 1].id);
        } else {
          setActiveTabId(null);
        }
      }
      return filtered;
    });
  }, [activeTabId]);

  // Tab Content Change
  const handleTabContentChange = useCallback((id: string, content: string) => {
    setTabs(prev =>
      prev.map(t => (t.id === id ? { ...t, content, isDirty: true } : t))
    );
  }, []);

  // Save Active File
  const handleSaveActiveFile = useCallback(async () => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab || !activeTab.path || !window.elix) return;

    await window.elix.writeFile(activeTab.path, activeTab.content);
    setTabs(prev =>
      prev.map(t => (t.id === activeTab.id ? { ...t, isDirty: false } : t))
    );
  }, [tabs, activeTabId]);

  // New File
  const handleNewFile = useCallback(() => {
    const untitledId = `untitled_${Date.now()}`;
    const newTab: EditorTab = {
      id: untitledId,
      name: `Untitled-${tabs.filter(t => t.id.startsWith('untitled')).length + 1}`,
      content: '',
      isDirty: true
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(untitledId);
  }, [tabs]);

  // Open Folder Dialog
  const handleOpenFolderDialog = async () => {
    if (window.elix) {
      const folderPath = await window.elix.openFolderDialog();
      if (folderPath) {
        await openFolderPath(folderPath);
      }
    }
  };

  // Open Project from Welcome/Recents
  const handleOpenProject = (project: ProjectMetadata) => {
    if (project?.path) {
      openFolderPath(project.path);
    }
  };

  // Close Folder (VS Code Parity)
  const handleCloseFolder = useCallback(() => {
    setActiveProject(null);
    localStorage.removeItem('elix_active_project_path');
    setTabs(prev => {
      const welcomeTab = prev.find(t => t.isWelcome);
      if (welcomeTab) {
        return [welcomeTab];
      }
      return [{ id: 'welcome', name: 'Get Started', isWelcome: true, content: '' }];
    });
    setActiveTabId('welcome');
  }, []);

  // Close All Tabs
  const handleCloseAllTabs = useCallback(() => {
    setTabs([{ id: 'welcome', name: 'Get Started', isWelcome: true, content: '' }]);
    setActiveTabId('welcome');
  }, []);

  // Save All Tabs
  const handleSaveAllTabs = useCallback(async () => {
    if (!window.elix) return;
    for (const tab of tabs) {
      if (tab.path && tab.isDirty) {
        await window.elix.writeFile(tab.path, tab.content);
      }
    }
    setTabs(prev => prev.map(t => ({ ...t, isDirty: false })));
  }, [tabs]);

  // Clone Git Repository
  const handleCloneRepo = async () => {
    if (!window.elix) return;
    const repoUrl = window.prompt('Enter Git repository URL to clone (e.g. https://github.com/username/repository.git):');
    if (!repoUrl?.trim()) return;

    const targetDir = await window.elix.openFolderDialog();
    if (!targetDir) return;

    try {
      const res = await window.elix.cloneGit(repoUrl.trim(), targetDir);
      if (res && res.success && res.projectPath) {
        const name = res.projectPath.split(/[/\\]/).pop() || 'Cloned-Project';
        const newProj: ProjectMetadata = {
          id: `proj_${Date.now()}`,
          name,
          path: res.projectPath,
          categories: ['general'],
          language: 'Auto',
          createdAt: new Date().toISOString(),
          lastOpenedAt: new Date().toISOString()
        };
        await window.elix.saveProject(newProj);
        handleOpenProject(newProj);
      } else {
        alert(`Clone failed: ${res?.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      alert(`Clone failed: ${err.message || 'Unknown error'}`);
    }
  };

  // Create Project from Template: browse folder dialog to choose destination
  const handleCreateFromTemplate = async (template: ProjectTemplate) => {
    if (window.elix) {
      // 1. Browse destination folder
      const targetDir = await window.elix.openFolderDialog();
      if (!targetDir) {
        // User cancelled browsing
        return;
      }

      // 2. Ask project name (default to template-id-app)
      const defaultName = `${template.id}-app`;
      const inputName = window.prompt(`Enter project folder name for "${template.name}":`, defaultName);
      if (inputName === null) {
        return; // User cancelled prompt
      }
      const projectName = inputName.trim() || defaultName;

      try {
        const proj = await window.elix.createProjectFromTemplate({
          templateId: template.id,
          targetDirectory: targetDir,
          projectName
        });
        if (proj) {
          handleOpenProject(proj);
        }
      } catch (err: any) {
        console.error('Failed to create project from template:', err);
        alert(`Failed to create project: ${err.message || 'Unknown error'}`);
      }
    }
  };

  // Run Code
  const handleRun = async () => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    const cwd = activeProject ? activeProject.path : 'D:/Engineering/Project';

    setIsRunning(true);
    setIsBottomPanelOpen(true);

    if (window.elix) {
      if (activeTab && activeTab.path) {
        // Run active file directly
        const filePath = activeTab.path;
        const meta = getLanguageMeta(filePath);

        if (meta?.runner === 'browser') {
          if (window.elix?.openExternal) {
            await window.elix.openExternal(filePath);
          }
          setExecutionLogs(prev => [
            ...prev,
            { type: 'stdout', data: `[HTML Web View] Opened in default web browser: ${filePath}\r\n`, timestamp: new Date().toISOString() },
            { type: 'exit', data: '', code: 0, timestamp: new Date().toISOString() }
          ]);
          setIsRunning(false);
          return;
        }

        if (meta?.runner === 'cpp-run') {
          await window.elix.run({ command: 'cpp-run', args: [filePath], cwd, language: 'cpp' });
          return;
        }

        if (meta?.runner === 'c-run') {
          await window.elix.run({ command: 'c-run', args: [filePath], cwd, language: 'c' });
          return;
        }

        if (meta?.runner === 'python') {
          await window.elix.run({ command: 'python', args: [filePath], cwd, language: 'python' });
          return;
        }

        if (meta?.runner === 'java') {
          await window.elix.run({ command: 'java', args: [filePath], cwd, language: 'java' });
          return;
        }

        if (meta?.runner === 'node') {
          await window.elix.run({ command: 'node', args: [filePath], cwd, language: 'javascript' });
          return;
        }

        if (meta?.runner === 'rust-run') {
          await window.elix.run({ command: 'rust-run', args: [filePath], cwd, language: 'rust' });
          return;
        }

        if (meta?.runner === 'go') {
          await window.elix.run({ command: 'go', args: ['run', filePath], cwd, language: 'go' });
          return;
        }

        if (meta?.runner === 'csharp-run') {
          await window.elix.run({ command: 'csharp-run', args: [filePath], cwd, language: 'csharp' });
          return;
        }

        if (meta?.runner === 'powershell') {
          await window.elix.run({ command: 'powershell.exe', args: ['-ExecutionPolicy', 'Bypass', '-File', filePath], cwd });
          return;
        }

        if (meta?.runner === 'bat') {
          await window.elix.run({ command: 'cmd.exe', args: ['/c', filePath], cwd });
          return;
        }

        const cmd = activeProject?.runCommand || 'npm start';
        const parts = cmd.split(' ');
        await window.elix.run({ command: parts[0], args: parts.slice(1), cwd });
      } else {
        const cmd = activeProject?.runCommand || 'npm start';
        const parts = cmd.split(' ');
        await window.elix.run({ command: parts[0], args: parts.slice(1), cwd });
      }
    }
  };

  // Stop Run
  const handleStop = async () => {
    if (window.elix) {
      await window.elix.stop();
      setIsRunning(false);
    }
  };

  // Restart Run
  const handleRestart = async () => {
    await handleStop();
    await handleRun();
  };

  // Activity Bar item selection
  const handleSelectActivity = (view: string) => {
    if (view === 'environments') {
      handleOpenSettingsTab('environments');
      return;
    }
    if (activeActivity === view) {
      // Toggle sidebar if clicking already active sidebar item
      if (['explorer', 'search', 'git', 'debug'].includes(view)) {
        setIsSidebarOpen(!isSidebarOpen);
      }
    } else {
      setActiveActivity(view);
      if (['explorer', 'search', 'git', 'debug'].includes(view)) {
        setIsSidebarOpen(true);
      }
    }
  };

  const activeTab = tabs.find(t => t.id === activeTabId);

  // Dynamic Window Title (Antigravity IDE / VS Code parity)
  useEffect(() => {
    const projectName = activeProject?.name || '';
    const activeFileName = activeTab && !activeTab.isWelcome && !activeTab.isSettings ? activeTab.name : '';
    
    let windowTitle = 'Elix IDE';
    if (projectName && activeFileName) {
      windowTitle = `${projectName} - Elix IDE - ${activeFileName}`;
    } else if (projectName) {
      windowTitle = `${projectName} - Elix IDE`;
    } else if (activeFileName) {
      windowTitle = `Elix IDE - ${activeFileName}`;
    }
    
    document.title = windowTitle;
    if (window.elix?.setWindowTitle) {
      window.elix.setWindowTitle(windowTitle);
    }
  }, [activeProject?.name, activeTab?.name, activeTab?.isWelcome, activeTab?.isSettings]);

  return (
    <div 
      className="flex flex-col h-screen w-screen bg-[var(--ide-bg)] text-[var(--ide-text)] overflow-hidden select-none font-sans"
      style={{ backgroundColor: 'var(--ide-bg)', color: 'var(--ide-text)' }}
    >
      {/* 1. TOP MENU BAR (VS Code Title Bar) */}
      <MenuBar
        activeProject={activeProject}
        activeFileName={activeTab?.name}
        onOpenFolder={handleOpenFolderDialog}
        onOpenFile={handleOpenFileDialog}
        onNewFile={handleNewFile}
        onSaveActiveFile={handleSaveActiveFile}
        onCloseFolder={handleCloseFolder}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onToggleBottomPanel={() => setIsBottomPanelOpen(!isBottomPanelOpen)}
        onToggleAi={() => setIsAiOpen(!isAiOpen)}
        isAiOpen={isAiOpen}
        onOpenSearch={(query?: string) => {
          setSearchModalInitialQuery(query || '');
          setShowSearchModal(true);
        }}
        onOpenSettings={handleOpenSettingsTab}
        onSelectView={view => {
          if (view === 'welcome') {
            const hasWelcome = tabs.some(t => t.isWelcome);
            if (!hasWelcome) {
              setTabs(prev => [{ id: 'welcome', name: 'Get Started', isWelcome: true, content: '' }, ...prev]);
            }
            setActiveTabId('welcome');
            setActiveActivity('explorer');
          } else {
            handleSelectActivity(view);
          }
        }}
        isRunning={isRunning}
        onRun={handleRun}
        onStop={handleStop}
        onRestart={handleRestart}
        connectionState={connectionState}
      />

      {/* 2. MAIN BODY AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Pointer drag capture overlay */}
        {activeDrag && (
          <div
            className={`fixed inset-0 z-[9999] select-none pointer-events-auto ${
              activeDrag === 'bottom' ? 'cursor-row-resize' : 'cursor-col-resize'
            }`}
          />
        )}

        {/* Left Activity Bar (48px) */}
        <ActivityBar
          activeView={activeActivity}
          onSelectView={handleSelectActivity}
          uncommittedChangesCount={0}
          practiceStreak={practiceStreak}
          onOpenSettings={handleOpenSettingsTab}
          onOpenThemePicker={(mode) => setThemePickerMode(mode)}
          onOpenSearch={(query?: string) => {
            setSearchModalInitialQuery(query || '');
            setShowSearchModal(true);
          }}
          onOpenTimeMachine={() => setShowTimeMachineModal(true)}
        />

        {/* Primary Sidebar (Collapsible, Resizable) */}
        {isSidebarOpen && ['explorer', 'search', 'git', 'debug'].includes(activeActivity) && (
          <>
            <div
              style={{ width: `${sidebarWidth}px` }}
              className="shrink-0 h-full overflow-hidden"
            >
              {activeActivity === 'explorer' && (
                <ExplorerSidebar
                  activeProject={activeProject}
                  onOpenFile={handleOpenFile}
                  activeFilePath={activeTab?.path}
                  onOpenFolder={handleOpenFolderDialog}
                  openTabs={tabs}
                  activeTabId={activeTabId}
                  onSelectTab={setActiveTabId}
                  onCloseTab={handleCloseTab}
                  onCloseAllTabs={handleCloseAllTabs}
                  onSaveAllTabs={handleSaveAllTabs}
                  onCloseFolder={handleCloseFolder}
                  onCloneRepo={handleCloneRepo}
                  onRunFile={async (filePath) => {
                    await handleOpenFile(filePath, filePath.split('/').pop() || filePath);
                    setTimeout(() => handleRun(), 150);
                  }}
                  onOpenTerminalAtPath={() => {
                    setIsBottomPanelOpen(true);
                  }}
                />
              )}
              {activeActivity === 'search' && (
                <SearchSidebar
                  activeProject={activeProject}
                  onOpenFile={handleOpenFile}
                />
              )}
              {activeActivity === 'git' && (
                <GitSidebar
                  activeProject={activeProject}
                  onOpenFile={handleOpenFile}
                />
              )}
              {activeActivity === 'debug' && (
                <DebugSidebar
                  activeProject={activeProject}
                  onRun={handleRun}
                  isRunning={isRunning}
                />
              )}
            </div>

            {/* Draggable Vertical Splitter for Primary Sidebar */}
            <div
              onMouseDown={startResizeSidebar}
              onDoubleClick={() => {
                setSidebarWidth(260);
                localStorage.setItem('elix_sidebar_width', '260');
              }}
              className="w-1 hover:w-1.5 bg-[var(--ide-border)] hover:bg-[#007acc] active:bg-[#007acc] cursor-col-resize shrink-0 transition-colors z-20 group relative"
              title="Drag to resize Primary Sidebar (Double-click to reset)"
            >
              <div className="absolute inset-y-0 -left-1 -right-1 cursor-col-resize" />
            </div>
          </>
        )}

        {/* Center Workspace / Tool Views */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-[var(--ide-bg)]">
          {/* If Fullscreen Tool is Active: Practice, Hackathon, Career, Environments */}
          {activeActivity === 'practice' && (
            <div className="flex-1 h-full w-full overflow-hidden flex flex-col">
              <PracticeHub />
            </div>
          )}

          {activeActivity === 'hackathon' && (
            <div className="flex-1 h-full w-full overflow-hidden flex flex-col">
              <HackathonHub />
            </div>
          )}

          {activeActivity === 'career' && (
            <div className="flex-1 h-full w-full overflow-hidden flex flex-col">
              <CareerDashboard />
            </div>
          )}

          {activeActivity === 'environments' && (
            <div className="flex-1 h-full w-full overflow-hidden flex flex-col">
              <EnvironmentModal onClose={() => setActiveActivity('explorer')} />
            </div>
          )}

          {/* Standard Code Editor / Get Started Workspace */}
          {['explorer', 'search', 'git', 'debug'].includes(activeActivity) && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <EditorWorkspace
                activeProject={activeProject}
                tabs={tabs}
                activeTabId={activeTabId}
                onSelectTab={setActiveTabId}
                onCloseTab={handleCloseTab}
                onContentChange={handleTabContentChange}
                onSaveActiveFile={handleSaveActiveFile}
                onRun={handleRun}
                isRunning={isRunning}
                onOpenMobileSimulator={() => setShowMobileModal(true)}
                onOpenFile={handleOpenFile}
                onOpenFolder={handleOpenFolderDialog}
                onNewFile={handleNewFile}
                recentProjects={recentProjects}
                onOpenProject={handleOpenProject}
                templates={templates}
                onCreateFromTemplate={handleCreateFromTemplate}
                onSelectPractice={() => setActiveActivity('practice')}
                onSelectHackathon={() => setActiveActivity('hackathon')}
                onSelectCareer={() => setActiveActivity('career')}
                onCursorChange={(line, col) => setCursorPos({ line, col })}
                onOpenThemePicker={(mode) => setThemePickerMode(mode)}
              />

              {/* Bottom Execution Panel (VS Code Bottom Panel - Resizable) */}
              {isBottomPanelOpen && (
                <div
                  style={{ height: isBottomPanelMaximized ? '75vh' : `${bottomPanelHeight}px` }}
                  className="border-t border-[var(--ide-border)] shrink-0 flex flex-col overflow-hidden relative bg-[var(--ide-panel-bg)]"
                >
                  {/* Draggable Top Splitter for Bottom Panel */}
                  <div
                    onMouseDown={startResizeBottomPanel}
                    onDoubleClick={() => {
                      setBottomPanelHeight(240);
                      localStorage.setItem('elix_bottom_panel_height', '240');
                    }}
                    className="h-1 hover:h-1.5 bg-[var(--ide-border)] hover:bg-[#007acc] active:bg-[#007acc] cursor-row-resize shrink-0 transition-colors z-20 relative group"
                    title="Drag to resize Output/Terminal Panel (Double-click to reset)"
                  >
                    <div className="absolute inset-x-0 -top-1 -bottom-1 cursor-row-resize" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <VSCodeBottomPanel
                      logs={executionLogs}
                      onClearLogs={() => setExecutionLogs([])}
                      isRunning={isRunning}
                      activeProjectDir={activeProject?.path || 'D:/Engineering/Project'}
                      onClose={() => setIsBottomPanelOpen(false)}
                      isMaximized={isBottomPanelMaximized}
                      onToggleMaximize={() => setIsBottomPanelMaximized(prev => !prev)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Agent / Copilot Drawer (Right - Resizable) */}
        {isAiOpen && (
          <>
            {/* Draggable Vertical Splitter for AI Copilot Panel */}
            <div
              onMouseDown={startResizeAiPanel}
              onDoubleClick={() => {
                setAiPanelWidth(380);
                localStorage.setItem('elix_ai_panel_width', '380');
              }}
              className="w-1 hover:w-1.5 bg-[var(--ide-border)] hover:bg-[#007acc] active:bg-[#007acc] cursor-col-resize shrink-0 transition-colors z-20 group relative"
              title="Drag to resize AI Agent panel (Double-click to reset)"
            >
              <div className="absolute inset-y-0 -left-1 -right-1 cursor-col-resize" />
            </div>

            <div
              style={{ width: `${aiPanelWidth}px` }}
              className="shrink-0 h-full overflow-hidden"
            >
              <AiAgentPanel
                onClose={() => setIsAiOpen(false)}
                isMaximized={isAiMaximized}
                onToggleMaximize={handleToggleMaximizeAi}
                activeFilePath={activeTab?.path}
                activeFileContent={activeTab?.content}
                projectPath={activeProject?.path}
              />
            </div>
          </>
        )}
      </div>

      {/* 3. STATUS BAR (VS Code Blue #007acc) */}
      <StatusBar
        activeLanguage={getLanguageDisplayName(activeTab?.path)}
        cursorLine={cursorPos.line}
        cursorCol={cursorPos.col}
        gitBranch="main"
        errorCount={0}
        warningCount={0}
        practiceStreak={practiceStreak}
        isAiActive={isAiOpen}
        onToggleAi={() => setIsAiOpen(!isAiOpen)}
        onOpenPractice={() => setActiveActivity('practice')}
        onOpenGit={() => {
          setActiveActivity('git');
          setIsSidebarOpen(true);
        }}
        onOpenProblems={() => {
          setIsBottomPanelOpen(true);
        }}
        onOpenEnvironments={() => setActiveActivity('environments')}
        onOpenSearch={() => {
          setSearchModalInitialQuery('');
          setShowSearchModal(true);
        }}
      />

      {/* 4. MODALS */}
      {showSearchModal && (
        <UniversalSearchModal
          onClose={() => setShowSearchModal(false)}
          initialQuery={searchModalInitialQuery}
          activeProject={activeProject}
          openTabs={tabs}
          activeTab={activeTab}
          onOpenFile={(path, name) => handleOpenFile(path, name)}
          onOpenFolder={handleOpenFolderDialog}
          onNewFile={handleNewFile}
          onSaveActiveFile={handleSaveActiveFile}
          onCloseFolder={() => setActiveProject(null)}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          onToggleBottomPanel={() => setIsBottomPanelOpen(prev => !prev)}
          onToggleAi={() => setIsAiOpen(prev => !prev)}
          onSelectView={view => {
            if (view === 'welcome') {
              const hasWelcome = tabs.some(t => t.isWelcome);
              if (!hasWelcome) {
                setTabs(prev => [{ id: 'welcome', name: 'Get Started', isWelcome: true, content: '' }, ...prev]);
              }
              setActiveTabId('welcome');
              setActiveActivity('explorer');
            } else {
              handleSelectActivity(view);
            }
          }}
          onRun={handleRun}
          onStop={handleStop}
          onRestart={handleRestart}
          onOpenSettings={handleOpenSettingsTab}
          onOpenTimeMachine={() => setShowTimeMachineModal(true)}
          onSelectAction={(type, payload) => {
            if (type === 'view') {
              if (payload.id === 'practice') setActiveActivity('practice');
              if (payload.id === 'hackathons') setActiveActivity('hackathon');
              if (payload.id === 'career') setActiveActivity('career');
            } else if (type === 'command') {
              if (payload.id === '8') handleRun();
              if (payload.id === '9') setShowTimeMachineModal(true);
            }
          }}
        />
      )}

      {showMobileModal && (
        <MobilePreviewModal 
          onClose={() => setShowMobileModal(false)}
          activeProject={activeProject}
          activeTab={tabs.find(t => t.id === activeTabId)}
        />
      )}

      {showTimeMachineModal && (
        <TimeMachineModal
          onClose={() => setShowTimeMachineModal(false)}
          projectId={activeProject?.id}
          projectDir={activeProject?.path}
        />
      )}

      {/* Theme Picker Modal (Color Theme, File Icon Theme, Product Icon Theme) */}
      {themePickerMode && (
        <ThemePickerModal
          mode={themePickerMode}
          onClose={() => setThemePickerMode(null)}
          currentTheme={currentTheme}
          onSelectTheme={theme => {
            setCurrentTheme(theme);
            applyThemeGlobally(theme);
          }}
        />
      )}

      {/* Fullscreen transparent drag overlay for butter-smooth resizing across editors & iframes */}
      {activeDrag && (
        <div 
          className={`fixed inset-0 z-[99999] select-none ${
            activeDrag === 'bottom' ? 'cursor-row-resize' : 'cursor-col-resize'
          }`} 
        />
      )}
    </div>
  );
};
