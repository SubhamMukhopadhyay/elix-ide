import { app, BrowserWindow, ipcMain, dialog, shell, session, clipboard } from 'electron';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { DatabaseService } from './services/DatabaseService';
import { EnvironmentManager } from './services/EnvironmentManager';
import { ExecutionEngine } from './services/ExecutionEngine';
import { TemplateRegistry } from './services/TemplateRegistry';
import { QuestionBankService } from './services/QuestionBankService';
import { GitService } from './services/GitService';
import { AiService } from './services/AiService';
import { TimeMachineService } from './services/TimeMachineService';
import { TerminalService } from './services/TerminalService';
import { PracticeRunnerService } from './services/PracticeRunnerService';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const iconPath = fs.existsSync(path.join(__dirname, '../public/app-icon.ico'))
    ? path.join(__dirname, '../public/app-icon.ico')
    : fs.existsSync(path.join(__dirname, '../public/icon.png'))
    ? path.join(__dirname, '../public/icon.png')
    : path.join(__dirname, '../dist/icon.png');

  let initialOverlayColor = '#181818';
  let initialSymbolColor = '#cccccc';
  try {
    const db = DatabaseService.getInstance();
    const settings = db.getSettings();
    const themeName = (settings?.theme || '').toLowerCase();
    if (themeName.includes('light')) {
      initialOverlayColor = '#f8f8f8';
      initialSymbolColor = '#333333';
    }
  } catch {}

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Elix IDE',
    icon: iconPath,
    backgroundColor: initialOverlayColor === '#f8f8f8' ? '#ffffff' : '#070a0f',
    titleBarStyle: 'hidden',
    titleBarOverlay: process.platform === 'win32' ? {
      color: initialOverlayColor,
      symbolColor: initialSymbolColor,
      height: 34
    } : false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false
    }
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window:state-changed', { isMaximized: true });
  });

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:state-changed', { isMaximized: false });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function setupEnvironmentPaths(): void {
  if (process.platform === 'win32') {
    const candidatePaths = [
      'C:\\MinGW\\bin',
      'C:\\MinGW64\\bin',
      'C:\\msys64\\mingw64\\bin',
      'C:\\msys64\\ucrt64\\bin',
      'C:\\msys64\\clang64\\bin',
      'C:\\msys64\\usr\\bin',
      'C:\\TDM-GCC-64\\bin',
      'C:\\Program Files\\mingw-w64\\x86_64-8.1.0-posix-seh-rt_v6-rev0\\mingw64\\bin',
      'C:\\Program Files (x86)\\Dev-Cpp\\MinGW64\\bin',
      'C:\\w64devkit\\bin',
      'C:\\LLVM\\bin'
    ];

    const currentPath = process.env.PATH || '';
    const pathsToAdd: string[] = [];

    for (const p of candidatePaths) {
      if (fs.existsSync(p) && !currentPath.toLowerCase().includes(p.toLowerCase())) {
        pathsToAdd.push(p);
      }
    }

    if (pathsToAdd.length > 0) {
      process.env.PATH = `${pathsToAdd.join(';')};${currentPath}`;
      console.log('[Elix] Auto-injected toolchains into PATH:', pathsToAdd);
    }
  }
}

app.whenReady().then(() => {
  setupEnvironmentPaths();

  // Automatically approve media/microphone for voice dictation
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(true);
  });
  session.defaultSession.setPermissionCheckHandler(() => true);

  const db = DatabaseService.getInstance();
  const envMgr = EnvironmentManager.getInstance();
  const execution = ExecutionEngine.getInstance();
  const qBank = QuestionBankService.getInstance();
  const git = GitService.getInstance();
  const ai = AiService.getInstance();
  const timeMachine = TimeMachineService.getInstance();
  const terminal = TerminalService.getInstance();
  const practiceRunner = PracticeRunnerService.getInstance();

  // Pipe execution events to renderer window
  execution.onEvent(event => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('execution:event', event);
    }
  });

  // --- Window Controls ---
  ipcMain.handle('window:minimize', () => mainWindow?.minimize());
  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
      return false;
    } else {
      mainWindow?.maximize();
      return true;
    }
  });
  ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized() || false);
  ipcMain.handle('window:close', () => mainWindow?.close());
  ipcMain.handle('window:setTitle', (_, title: string) => {
    if (mainWindow && typeof title === 'string') {
      mainWindow.setTitle(title);
    }
  });
  ipcMain.handle('window:setTitleBarOverlay', (_, options: { color?: string; symbolColor?: string }) => {
    if (mainWindow && process.platform === 'win32' && options) {
      try {
        mainWindow.setTitleBarOverlay({
          color: options.color || '#181818',
          symbolColor: options.symbolColor || '#cccccc',
          height: 34
        });
        return true;
      } catch (err) {
        console.error('Failed to update titleBarOverlay:', err);
        return false;
      }
    }
    return false;
  });

  // --- Database & Categories ---
  ipcMain.handle('db:getCategories', () => db.getCategories());
  ipcMain.handle('db:addCategory', (_, cat) => db.addCategory(cat));
  ipcMain.handle('db:updateCategory', (_, id, updates) => db.updateCategory(id, updates));
  ipcMain.handle('db:deleteCategory', (_, id) => db.deleteCategory(id));

  // --- Projects ---
  ipcMain.handle('db:getProjects', () => db.getProjects());
  ipcMain.handle('db:saveProject', (_, project) => db.saveProject(project));

  // --- Project Creation from Template ---
  ipcMain.handle('project:createFromTemplate', async (_, { templateId, projectName, targetDirectory }) => {
    const tmpl = TemplateRegistry.getTemplate(templateId);
    if (!tmpl) throw new Error('Template not found');

    const projectPath = path.join(targetDirectory, projectName);
    fs.mkdirSync(projectPath, { recursive: true });

    for (const [relPath, content] of Object.entries(tmpl.files)) {
      const fullPath = path.join(projectPath, relPath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, content, 'utf8');
    }

    const projectMeta = {
      id: `proj_${Date.now()}`,
      name: projectName,
      path: projectPath,
      categories: [tmpl.category],
      language: tmpl.language,
      framework: tmpl.framework,
      createdAt: new Date().toISOString(),
      lastOpenedAt: new Date().toISOString(),
      runCommand: tmpl.runCommand,
      buildCommand: tmpl.buildCommand
    };

    db.saveProject(projectMeta);
    timeMachine.takeSnapshot(projectMeta.id, projectPath, 'Initial Project Creation', 'manual');

    return projectMeta;
  });

  // --- Open Folder Dialog ---
  ipcMain.handle('dialog:openFolder', async () => {
    const res = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openDirectory', 'createDirectory']
    });
    if (res.canceled || !res.filePaths.length) return null;
    return res.filePaths[0];
  });

  // --- Filesystem Operations ---
  ipcMain.handle('fs:readDir', async (_, dirPath) => {
    if (!fs.existsSync(dirPath)) return [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    return entries.map(e => ({
      name: e.name,
      isDirectory: e.isDirectory(),
      path: path.join(dirPath, e.name).replace(/\\/g, '/')
    })).sort((a, b) => (b.isDirectory ? 1 : 0) - (a.isDirectory ? 1 : 0) || a.name.localeCompare(b.name));
  });

  ipcMain.handle('fs:readFile', async (_, filePath) => {
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf8');
  });

  ipcMain.handle('fs:readFileBase64', async (_, filePath) => {
    try {
      if (!fs.existsSync(filePath)) return null;
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.bmp': 'image/bmp',
        '.avif': 'image/avif',
        '.pdf': 'application/pdf',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.doc': 'application/msword',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav'
      };
      const mime = mimeTypes[ext] || 'application/octet-stream';
      const buffer = fs.readFileSync(filePath);
      return `data:${mime};base64,${buffer.toString('base64')}`;
    } catch (e: any) {
      console.error('Error reading base64 file:', e);
      return null;
    }
  });

  ipcMain.handle('fs:getFileStats', async (_, filePath) => {
    try {
      if (!fs.existsSync(filePath)) return null;
      const stats = fs.statSync(filePath);
      return {
        size: stats.size,
        mtime: stats.mtimeMs,
        birthtime: stats.birthtimeMs,
        isFile: stats.isFile()
      };
    } catch (e: any) {
      return null;
    }
  });

  ipcMain.handle('clipboard:readText', () => {
    try {
      return clipboard.readText();
    } catch {
      return '';
    }
  });

  ipcMain.handle('clipboard:writeText', (_, text: string) => {
    try {
      clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  });

  ipcMain.handle('fs:writeFile', async (_, { filePath, content }) => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
    db.recordActivity({
      type: 'file_modified',
      category: 'general',
      description: `Saved ${path.basename(filePath)}`
    });
    return true;
  });

  ipcMain.handle('fs:createFile', async (_, filePath) => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '', 'utf8');
    }
    return true;
  });

  ipcMain.handle('fs:createDir', async (_, dirPath) => {
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  });

  ipcMain.handle('fs:delete', async (_, targetPath) => {
    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { recursive: true, force: true });
      return true;
    }
    return false;
  });

  ipcMain.handle('fs:rename', async (_, { oldPath, newPath }) => {
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      return true;
    }
    return false;
  });

  ipcMain.handle('fs:revealInExplorer', async (_, targetPath) => {
    if (fs.existsSync(targetPath)) {
      shell.showItemInFolder(targetPath);
      return true;
    }
    return false;
  });

  ipcMain.handle('shell:openExternal', async (_, urlOrPath: string) => {
    if (!urlOrPath) return false;
    try {
      if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
        await shell.openExternal(urlOrPath);
      } else {
        const fileUrl = urlOrPath.startsWith('file://') 
          ? urlOrPath 
          : `file:///${urlOrPath.replace(/\\/g, '/')}`;
        await shell.openExternal(fileUrl);
      }
      return true;
    } catch (e) {
      console.error('Failed to open external:', e);
      try {
        await shell.openPath(urlOrPath);
      } catch (err) {}
      return false;
    }
  });

  ipcMain.handle('network:getLanIp', () => {
    try {
      const nets = os.networkInterfaces();
      for (const name of Object.keys(nets)) {
        for (const net of nets[name] || []) {
          if (net.family === 'IPv4' && !net.internal) {
            return net.address;
          }
        }
      }
    } catch {}
    return '127.0.0.1';
  });

  ipcMain.handle('dialog:openFile', async () => {
    const res = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openFile']
    });
    if (res.canceled || !res.filePaths.length) return null;
    return res.filePaths[0];
  });

  // --- Execution Engine ---
  ipcMain.handle('execution:run', async (_, req) => {
    return execution.run(req);
  });
  ipcMain.handle('execution:stop', async () => {
    return execution.stop();
  });
  ipcMain.handle('execution:restart', async (_, req) => {
    return execution.restart(req);
  });
  ipcMain.handle('execution:isRunning', () => execution.getIsRunning());
  ipcMain.handle('execution:setConnectionState', (_, state) => {
    execution.setConnectionState(state);
    envMgr.setOnlineStatus(state !== 'offline');
  });

  // --- Environments & Optional Components ---
  ipcMain.handle('env:getEnvironments', () => envMgr.getEnvironments());
  ipcMain.handle('env:scan', () => envMgr.scanSystemPaths());
  ipcMain.handle('env:install', async (_, id, method) => {
    return envMgr.installEnvironment(id, method, msg => {
      mainWindow?.webContents.send('env:progress', { id, message: msg });
    });
  });
  ipcMain.handle('env:uninstall', (_, id) => envMgr.uninstallEnvironment(id));
  ipcMain.handle('env:repair', (_, id) => envMgr.repairEnvironment(id));

  // --- Practice & Question Bank ---
  ipcMain.handle('practice:getQuestions', (_, filter) => qBank.getQuestions(filter));
  ipcMain.handle('practice:getQuestionById', (_, id) => qBank.getQuestionById(id));
  ipcMain.handle('practice:getStats', () => qBank.calculateUserStats());
  ipcMain.handle('practice:recordSubmission', (_, sub) => db.recordSubmission(sub));
  ipcMain.handle('practice:getSubmissions', (_, qId) => db.getSubmissions(qId));
  ipcMain.handle('practice:resetProgress', () => db.resetProgress());
  ipcMain.handle('practice:runTests', (_, req) => practiceRunner.runPracticeTests(req));
  ipcMain.handle('practice:setGoal', (_, goal) => db.setGoal(goal));
  ipcMain.handle('practice:getGoals', () => db.getGoals());

  // --- Streaks, Activities & History ---
  ipcMain.handle('db:getStreaks', () => db.getStreaks());
  ipcMain.handle('db:getActivities', (_, filter) => db.getActivities(filter));

  // --- Hackathons ---
  ipcMain.handle('db:getHackathons', () => db.getHackathons());
  ipcMain.handle('db:saveHackathon', (_, hackathon) => db.saveHackathon(hackathon));
  ipcMain.handle('db:deleteHackathon', (_, id) => db.deleteHackathon(id));

  // --- Git ---
  ipcMain.handle('git:getStatus', (_, repoPath) => git.getStatus(repoPath));
  ipcMain.handle('git:stageFile', (_, repoPath, file) => git.stageFile(repoPath, file));
  ipcMain.handle('git:unstageFile', (_, repoPath, file) => git.unstageFile(repoPath, file));
  ipcMain.handle('git:commit', (_, repoPath, message) => git.commit(repoPath, message));
  ipcMain.handle('git:getDiff', (_, repoPath, file) => git.getDiff(repoPath, file));
  ipcMain.handle('git:getLog', (_, repoPath, limit) => git.getLog(repoPath, limit));
  ipcMain.handle('git:init', (_, repoPath) => git.init(repoPath));
  ipcMain.handle('git:push', (_, repoPath, remote, branch) => git.push(repoPath, remote, branch));
  ipcMain.handle('git:pull', (_, repoPath, remote, branch) => git.pull(repoPath, remote, branch));
  ipcMain.handle('git:clone', (_, { repoUrl, targetParentDir }) => git.clone(repoUrl, targetParentDir));

  // --- AI Agent & Practice Mentor ---
  ipcMain.handle('ai:processMessage', (_, req) => ai.processMessage(req));
  ipcMain.handle('ai:applyFileChange', (_, filePath, content) => ai.applyFileChange(filePath, content));
  ipcMain.handle('ai:transcribeAudio', (_, { base64Audio, mimeType }) => ai.transcribeAudio(base64Audio, mimeType));
  ipcMain.handle('ai:getConfig', () => db.getAiConfig());
  ipcMain.handle('ai:updateConfig', (_, cfg) => db.updateAiConfig(cfg));

  // --- Time Machine ---
  ipcMain.handle('timemachine:getSnapshots', (_, projectId) => timeMachine.getSnapshots(projectId));
  ipcMain.handle('timemachine:takeSnapshot', (_, { projectId, projectDir, title }) => {
    return timeMachine.takeSnapshot(projectId, projectDir, title, 'manual');
  });
  ipcMain.handle('timemachine:restoreSnapshot', (_, { snapshotId, projectDir }) => {
    return timeMachine.restoreSnapshot(snapshotId, projectDir);
  });

  // --- Templates ---
  ipcMain.handle('templates:getAll', () => TemplateRegistry.getTemplates());
  ipcMain.handle('templates:getByCategory', (_, cat) => TemplateRegistry.getTemplatesByCategory(cat));

  // --- Interactive Terminal ---
  ipcMain.handle('terminal:create', (_, { id, cwd }) => {
    terminal.createSession(id, cwd, data => {
      mainWindow?.webContents.send(`terminal:data:${id}`, data);
    });
  });
  ipcMain.handle('terminal:write', (_, { id, data }) => terminal.write(id, data));
  ipcMain.handle('terminal:kill', (_, id) => terminal.kill(id));

  // --- GitHub Credential Integration (VS Code / Git Credential Manager parity) ---
  ipcMain.handle('auth:getGithubCredential', async () => {
    return new Promise(resolve => {
      try {
        const { spawn } = require('child_process');
        const child = spawn('git', ['credential', 'fill'], {
          shell: true,
          windowsHide: true
        });

        let stdout = '';
        let resolved = false;

        child.stdout.on('data', (d: Buffer) => {
          stdout += d.toString();
        });

        const finish = () => {
          if (resolved) return;
          resolved = true;
          let username = '';
          let token = '';
          const lines = stdout.split(/\r?\n/);
          for (const line of lines) {
            if (line.startsWith('username=')) {
              username = line.substring('username='.length).trim();
            } else if (line.startsWith('password=')) {
              token = line.substring('password='.length).trim();
            }
          }
          if (token) {
            resolve({ username, token });
          } else {
            resolve(null);
          }
        };

        child.on('close', finish);
        child.on('error', () => {
          if (!resolved) {
            resolved = true;
            resolve(null);
          }
        });

        child.stdin.write('protocol=https\nhost=github.com\n\n');
        child.stdin.end();

        setTimeout(() => {
          if (!resolved) {
            try { child.kill(); } catch {}
            finish();
          }
        }, 5000);
      } catch (e) {
        resolve(null);
      }
    });
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
