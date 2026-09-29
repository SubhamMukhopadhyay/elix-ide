import { contextBridge, ipcRenderer } from 'electron';

export const elixAPI = {
  // Window
  hasNativeTitleBar: process.platform === 'win32',
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  setWindowTitle: (title: string) => ipcRenderer.invoke('window:setTitle', title),
  isWindowMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  setTitleBarOverlay: (options: { color?: string; symbolColor?: string }) => ipcRenderer.invoke('window:setTitleBarOverlay', options),
  onWindowStateChange: (callback: (data: { isMaximized: boolean }) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on('window:state-changed', handler);
    return () => ipcRenderer.removeListener('window:state-changed', handler);
  },
  getSystemInfo: () => ({
    version: '1.0.0',
    platform: process.platform,
    arch: process.arch,
    electron: process.versions.electron || '34.5.8',
    node: process.versions.node || '20.18.0',
    chrome: process.versions.chrome || '132.0.0.0',
    v8: process.versions.v8 || '13.2.0.0',
  }),

  // Dialogs
  openFolderDialog: () => ipcRenderer.invoke('dialog:openFolder'),

  // Categories & Projects
  getCategories: () => ipcRenderer.invoke('db:getCategories'),
  addCategory: (cat: any) => ipcRenderer.invoke('db:addCategory', cat),
  updateCategory: (id: string, updates: any) => ipcRenderer.invoke('db:updateCategory', id, updates),
  deleteCategory: (id: string) => ipcRenderer.invoke('db:deleteCategory', id),
  getProjects: () => ipcRenderer.invoke('db:getProjects'),
  saveProject: (project: any) => ipcRenderer.invoke('db:saveProject', project),
  createProjectFromTemplate: (params: any) => ipcRenderer.invoke('project:createFromTemplate', params),

  // Filesystem
  readDir: (dirPath: string) => ipcRenderer.invoke('fs:readDir', dirPath),
  readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
  readFileBase64: (filePath: string) => ipcRenderer.invoke('fs:readFileBase64', filePath),
  getFileStats: (filePath: string) => ipcRenderer.invoke('fs:getFileStats', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('fs:writeFile', { filePath, content }),
  createFile: (filePath: string) => ipcRenderer.invoke('fs:createFile', filePath),
  createDir: (dirPath: string) => ipcRenderer.invoke('fs:createDir', dirPath),
  deleteFile: (targetPath: string) => ipcRenderer.invoke('fs:delete', targetPath),
  renameFile: (oldPath: string, newPath: string) => ipcRenderer.invoke('fs:rename', { oldPath, newPath }),
  revealInExplorer: (targetPath: string) => ipcRenderer.invoke('fs:revealInExplorer', targetPath),
  openExternal: (urlOrPath: string) => ipcRenderer.invoke('shell:openExternal', urlOrPath),
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  getLanIp: () => ipcRenderer.invoke('network:getLanIp'),
  getClipboardText: () => ipcRenderer.invoke('clipboard:readText'),
  setClipboardText: (text: string) => ipcRenderer.invoke('clipboard:writeText', text),

  // Execution
  run: (req: any) => ipcRenderer.invoke('execution:run', req),
  stop: () => ipcRenderer.invoke('execution:stop'),
  restart: (req: any) => ipcRenderer.invoke('execution:restart'),
  isRunning: () => ipcRenderer.invoke('execution:isRunning'),
  setConnectionState: (state: string) => ipcRenderer.invoke('execution:setConnectionState', state),
  onExecutionEvent: (callback: (event: any) => void) => {
    const handler = (_: any, event: any) => callback(event);
    ipcRenderer.on('execution:event', handler);
    return () => ipcRenderer.removeListener('execution:event', handler);
  },

  // Environments
  getEnvironments: () => ipcRenderer.invoke('env:getEnvironments'),
  scanEnvironments: () => ipcRenderer.invoke('env:scan'),
  installEnvironment: (id: string, method?: string) => ipcRenderer.invoke('env:install', id, method),
  uninstallEnvironment: (id: string) => ipcRenderer.invoke('env:uninstall', id),
  repairEnvironment: (id: string) => ipcRenderer.invoke('env:repair', id),
  onEnvProgress: (callback: (data: any) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on('env:progress', handler);
    return () => ipcRenderer.removeListener('env:progress', handler);
  },

  // Practice & DSA
  getQuestions: (filter?: any) => ipcRenderer.invoke('practice:getQuestions', filter),
  getQuestionById: (id: string) => ipcRenderer.invoke('practice:getQuestionById', id),
  getPracticeStats: () => ipcRenderer.invoke('practice:getStats'),
  recordSubmission: (sub: any) => ipcRenderer.invoke('practice:recordSubmission', sub),
  runPracticeTests: (req: any) => ipcRenderer.invoke('practice:runTests', req),
  getSubmissions: (questionId?: string) => ipcRenderer.invoke('practice:getSubmissions', questionId),
  resetPracticeProgress: () => ipcRenderer.invoke('practice:resetProgress'),
  setPracticeGoal: (goal: any) => ipcRenderer.invoke('practice:setGoal', goal),
  getPracticeGoals: () => ipcRenderer.invoke('practice:getGoals'),

  // Streaks & Activities
  getStreaks: () => ipcRenderer.invoke('db:getStreaks'),
  getActivities: (filter?: any) => ipcRenderer.invoke('db:getActivities', filter),

  // Hackathons
  getHackathons: () => ipcRenderer.invoke('db:getHackathons'),
  saveHackathon: (hackathon: any) => ipcRenderer.invoke('db:saveHackathon', hackathon),
  deleteHackathon: (id: string) => ipcRenderer.invoke('db:deleteHackathon', id),

  // Git
  getGitStatus: (repoPath: string) => ipcRenderer.invoke('git:getStatus', repoPath),
  stageFile: (repoPath: string, file: string) => ipcRenderer.invoke('git:stageFile', repoPath, file),
  unstageFile: (repoPath: string, file: string) => ipcRenderer.invoke('git:unstageFile', repoPath, file),
  commitGit: (repoPath: string, message: string) => ipcRenderer.invoke('git:commit', repoPath, message),
  getGitDiff: (repoPath: string, file?: string) => ipcRenderer.invoke('git:getDiff', repoPath, file),
  getGitLog: (repoPath: string, limit?: number) => ipcRenderer.invoke('git:getLog', repoPath, limit),
  initGit: (repoPath: string) => ipcRenderer.invoke('git:init', repoPath),
  pushGit: (repoPath: string, remote?: string, branch?: string) => ipcRenderer.invoke('git:push', repoPath, remote, branch),
  pullGit: (repoPath: string, remote?: string, branch?: string) => ipcRenderer.invoke('git:pull', repoPath, remote, branch),
  cloneGit: (repoUrl: string, targetParentDir: string) => ipcRenderer.invoke('git:clone', { repoUrl, targetParentDir }),

  // AI Agent & Mentor
  processAiMessage: (req: any) => ipcRenderer.invoke('ai:processMessage', req),
  applyAiFileChange: (filePath: string, content: string) => ipcRenderer.invoke('ai:applyFileChange', filePath, content),
  transcribeAudio: (base64Audio: string, mimeType: string) => ipcRenderer.invoke('ai:transcribeAudio', { base64Audio, mimeType }),
  getAiConfig: () => ipcRenderer.invoke('ai:getConfig'),
  updateAiConfig: (cfg: any) => ipcRenderer.invoke('ai:updateConfig', cfg),

  // Time Machine
  getTimeMachineSnapshots: (projectId: string) => ipcRenderer.invoke('timemachine:getSnapshots', projectId),
  takeSnapshot: (params: any) => ipcRenderer.invoke('timemachine:takeSnapshot', params),
  restoreSnapshot: (params: any) => ipcRenderer.invoke('timemachine:restoreSnapshot', params),

  // Templates
  getAllTemplates: () => ipcRenderer.invoke('templates:getAll'),
  getTemplatesByCategory: (cat: string) => ipcRenderer.invoke('templates:getByCategory', cat),

  // Interactive Terminal
  createTerminalSession: (id: string, cwd: string, onData: (data: string) => void) => {
    ipcRenderer.invoke('terminal:create', { id, cwd });
    const channel = `terminal:data:${id}`;
    const handler = (_: any, data: string) => onData(data);
    ipcRenderer.on(channel, handler);
    return () => ipcRenderer.removeListener(channel, handler);
  },
  writeTerminal: (id: string, data: string) => ipcRenderer.invoke('terminal:write', { id, data }),
  killTerminal: (id: string) => ipcRenderer.invoke('terminal:kill', id),

  // GitHub Auth
  getGithubCredential: () => ipcRenderer.invoke('auth:getGithubCredential')
};

contextBridge.exposeInMainWorld('elix', elixAPI);
