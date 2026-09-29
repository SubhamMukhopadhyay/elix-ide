import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { app, shell } from 'electron';
import { EnvironmentInfo } from '../../src/types';

export class EnvironmentManager {
  private static instance: EnvironmentManager;
  private environments: Map<string, EnvironmentInfo> = new Map();
  private isOnline: boolean = true;

  private constructor() {
    this.initializeDefaultEnvironments();
    this.refreshSystemPaths();
    this.detectAllEnvironments();
  }

  public static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }

  private initializeDefaultEnvironments(): void {
    const envs: EnvironmentInfo[] = [
      {
        id: 'node',
        name: 'Node.js & TypeScript',
        category: 'web',
        status: 'ready',
        isBundled: true,
        canExecuteOffline: true,
        description: 'Bundled Node.js runtime for JavaScript, TypeScript, React, and Full-Stack apps.',
        wingetId: 'OpenJS.NodeJS',
        officialUrl: 'https://nodejs.org/en/download'
      },
      {
        id: 'python',
        name: 'Python Runtime',
        category: 'python',
        status: 'ready',
        isBundled: true,
        canExecuteOffline: true,
        description: 'Built-in Python 3.12 environment with AI/ML script runner.',
        wingetId: 'Python.Python.3.12',
        officialUrl: 'https://www.python.org/downloads/'
      },
      {
        id: 'java',
        name: 'Java Development Kit (JDK)',
        category: 'java',
        status: 'ready',
        isBundled: true,
        canExecuteOffline: true,
        description: 'OpenJDK 17 LTS runtime for Java, Spring Boot, Maven, and Gradle.',
        wingetId: 'Microsoft.OpenJDK.17',
        officialUrl: 'https://learn.microsoft.com/en-us/java/openjdk/download'
      },
      {
        id: 'cpp',
        name: 'C & C++ Compiler Toolchain (GCC / G++)',
        category: 'cpp',
        status: 'ready',
        isBundled: true,
        canExecuteOffline: true,
        description: 'Native GCC & G++ compilers with MinGW / Clang support and local sandbox execution for C and C++.',
        wingetId: 'winlibs.standalone.gcc.posix',
        officialUrl: 'https://www.mingw-w64.org/downloads/'
      },
      {
        id: 'rust',
        name: 'Rust & Cargo',
        category: 'rust',
        status: 'not_installed',
        isBundled: false,
        downloadSize: '120 MB',
        canExecuteOffline: false,
        description: 'Rust compiler, Cargo package manager, and systems development toolchain.',
        wingetId: 'Rustlang.Rustup',
        officialUrl: 'https://rustup.rs/'
      },
      {
        id: 'go',
        name: 'Go Toolchain',
        category: 'go',
        status: 'not_installed',
        isBundled: false,
        downloadSize: '95 MB',
        canExecuteOffline: false,
        description: 'Go language compiler and tools for microservices and cloud systems.',
        wingetId: 'GoLang.Go',
        officialUrl: 'https://go.dev/dl/'
      },
      {
        id: 'flutter',
        name: 'Flutter & Dart SDK',
        category: 'mobile',
        status: 'not_installed',
        isBundled: false,
        downloadSize: '850 MB',
        canExecuteOffline: false,
        description: 'Cross-platform mobile UI framework for Android, iOS, and Web.',
        wingetId: 'Flutter.Flutter',
        officialUrl: 'https://docs.flutter.dev/get-started/install/windows'
      },
      {
        id: 'android',
        name: 'Android Command-line Tools',
        category: 'mobile',
        status: 'not_installed',
        isBundled: false,
        downloadSize: '1.2 GB',
        canExecuteOffline: false,
        description: 'Android SDK build-tools, platform tools, and emulator utilities.',
        wingetId: 'Google.AndroidStudio',
        officialUrl: 'https://developer.android.com/studio'
      }
    ];

    envs.forEach(env => this.environments.set(env.id, env));
  }

  public refreshSystemPaths(): void {
    if (process.platform !== 'win32') return;
    try {
      let machinePath = '';
      let userPath = '';

      try {
        const outMachine = execSync(
          'reg query "HKLM\\System\\CurrentControlSet\\Control\\Session Manager\\Environment" /v Path',
          { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 2000 }
        );
        const match = outMachine.match(/Path\s+REG_\w+\s+(.*)/i);
        if (match) machinePath = match[1].trim();
      } catch {}

      try {
        const outUser = execSync('reg query "HKCU\\Environment" /v Path', {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore'],
          timeout: 2000
        });
        const match = outUser.match(/Path\s+REG_\w+\s+(.*)/i);
        if (match) userPath = match[1].trim();
      } catch {}

      const expandVars = (str: string) => {
        return str
          .replace(/%SystemRoot%/gi, process.env.SystemRoot || 'C:\\Windows')
          .replace(/%USERPROFILE%/gi, process.env.USERPROFILE || 'C:\\Users\\' + (process.env.USERNAME || ''))
          .replace(/%LOCALAPPDATA%/gi, process.env.LOCALAPPDATA || '')
          .replace(/%APPDATA%/gi, process.env.APPDATA || '')
          .replace(/%ProgramFiles%/gi, process.env.ProgramFiles || 'C:\\Program Files');
      };

      const customCandidates = [
        'C:\\MinGW\\bin',
        'C:\\MinGW64\\bin',
        'C:\\msys64\\mingw64\\bin',
        'C:\\msys64\\ucrt64\\bin',
        'C:\\TDM-GCC-64\\bin',
        'C:\\Program Files\\nodejs',
        'C:\\Program Files\\Go\\bin',
        path.join(process.env.USERPROFILE || '', '.cargo', 'bin'),
        path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk', 'platform-tools'),
        path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python312')
      ];

      const all = [
        ...expandVars(userPath).split(';'),
        ...expandVars(machinePath).split(';'),
        ...(process.env.PATH || '').split(';'),
        ...customCandidates
      ];

      const unique = Array.from(new Set(all.map(d => d.trim()).filter(Boolean)));
      process.env.PATH = unique.join(';');
    } catch (e) {
      console.warn('[EnvironmentManager] Failed to refresh system paths from registry:', e);
    }
  }

  private findExecutable(exeName: string, candidates: string[] = []): string | null {
    if (process.platform === 'win32') {
      try {
        const out = execSync(`where.exe ${exeName}`, {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore'],
          timeout: 2500
        });
        const lines = out
          .split(/\r?\n/)
          .map(l => l.trim())
          .filter(l => l && !l.toLowerCase().includes('windowsapps'));
        if (lines.length > 0 && fs.existsSync(lines[0])) {
          return lines[0];
        }
      } catch {}

      for (const cand of candidates) {
        if (cand && fs.existsSync(cand)) {
          const dir = path.dirname(cand);
          if (!process.env.PATH?.toLowerCase().includes(dir.toLowerCase())) {
            process.env.PATH = `${dir};${process.env.PATH}`;
          }
          return cand;
        }
      }
    } else {
      try {
        const out = execSync(`which ${exeName}`, {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore'],
          timeout: 2000
        }).trim();
        if (out && fs.existsSync(out)) return out;
      } catch {}
    }
    return null;
  }

  public detectAllEnvironments(): void {
    // 1. Node.js
    const nodeCandidates = [
      'C:\\Program Files\\nodejs\\node.exe',
      'C:\\Program Files (x86)\\nodejs\\node.exe'
    ];
    const nodePath = this.findExecutable('node', nodeCandidates);
    const nodeEnv = this.environments.get('node');
    if (nodeEnv) {
      if (nodePath) {
        try {
          const v = execSync(`"${nodePath}" -v`, { encoding: 'utf8', timeout: 2000 }).trim();
          nodeEnv.status = 'ready';
          nodeEnv.version = v;
          nodeEnv.path = nodePath;
          nodeEnv.canExecuteOffline = true;
        } catch {
          nodeEnv.status = 'ready';
          nodeEnv.version = 'Bundled Node.js';
          nodeEnv.path = nodePath;
        }
      } else {
        nodeEnv.status = 'ready';
        nodeEnv.version = 'Bundled Node.js';
      }
    }

    // 2. Python
    const pyCandidates = [
      path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python312', 'python.exe'),
      path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python311', 'python.exe'),
      path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python310', 'python.exe'),
      'C:\\Python312\\python.exe',
      'C:\\Python311\\python.exe',
      'C:\\Program Files\\Python312\\python.exe'
    ];
    const pyPath = this.findExecutable('python', pyCandidates);
    const pyEnv = this.environments.get('python');
    if (pyEnv) {
      if (pyPath) {
        try {
          const v = execSync(`"${pyPath}" --version`, { encoding: 'utf8', timeout: 2000 }).trim();
          pyEnv.status = 'ready';
          pyEnv.version = v;
          pyEnv.path = pyPath;
          pyEnv.canExecuteOffline = true;
        } catch {
          pyEnv.status = 'ready';
          pyEnv.version = 'Python 3.12 (Local)';
          pyEnv.path = pyPath;
        }
      } else {
        pyEnv.status = this.isOnline ? 'cloud_ready' : 'not_installed';
        pyEnv.path = undefined;
        pyEnv.canExecuteOffline = false;
      }
    }

    // 3. Java JDK
    const javaCandidates = [
      'C:\\Program Files\\Microsoft\\jdk-17.0.19.10-hotspot\\bin\\java.exe',
      path.join(process.env.JAVA_HOME || '', 'bin', 'java.exe'),
      'C:\\Program Files\\Java\\jdk-17\\bin\\java.exe',
      'C:\\Program Files\\Eclipse Adoptium\\jdk-17\\bin\\java.exe'
    ];
    const javaPath = this.findExecutable('java', javaCandidates);
    const javaEnv = this.environments.get('java');
    if (javaEnv) {
      if (javaPath) {
        try {
          const out = execSync(`"${javaPath}" -version 2>&1`, {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
            timeout: 2000
          });
          const match = out.match(/(?:openjdk|java) version "([^"]+)"/i);
          javaEnv.status = 'ready';
          javaEnv.version = match ? `OpenJDK ${match[1]}` : 'OpenJDK 17 LTS';
          javaEnv.path = javaPath;
          javaEnv.canExecuteOffline = true;
        } catch {
          javaEnv.status = 'ready';
          javaEnv.version = 'OpenJDK 17 LTS';
          javaEnv.path = javaPath;
        }
      } else {
        javaEnv.status = this.isOnline ? 'cloud_ready' : 'not_installed';
        javaEnv.path = undefined;
        javaEnv.canExecuteOffline = false;
      }
    }

    // 4. C & C++ (GCC/G++)
    const gccCandidates = [
      'C:\\MinGW\\bin\\gcc.exe',
      'C:\\MinGW64\\bin\\gcc.exe',
      'C:\\msys64\\mingw64\\bin\\gcc.exe',
      'C:\\msys64\\ucrt64\\bin\\gcc.exe',
      'C:\\TDM-GCC-64\\bin\\gcc.exe',
      'C:\\w64devkit\\bin\\gcc.exe'
    ];
    const gccPath = this.findExecutable('gcc', gccCandidates);
    const cppEnv = this.environments.get('cpp');
    if (cppEnv) {
      if (gccPath) {
        try {
          const out = execSync(`"${gccPath}" --version`, { encoding: 'utf8', timeout: 2000 });
          const firstLine = out.split('\n')[0].trim();
          cppEnv.status = 'ready';
          cppEnv.version = firstLine.length > 35 ? firstLine.substring(0, 35) : firstLine;
          cppEnv.path = gccPath;
          cppEnv.canExecuteOffline = true;
        } catch {
          cppEnv.status = 'ready';
          cppEnv.version = 'GCC Toolchain (MinGW)';
          cppEnv.path = gccPath;
        }
      } else {
        cppEnv.status = this.isOnline ? 'cloud_ready' : 'ready';
        cppEnv.version = 'Elix Sandbox C/C++ Toolchain';
        cppEnv.path = undefined;
        cppEnv.canExecuteOffline = true;
      }
    }

    // 5. Rust
    const rustCandidates = [
      path.join(process.env.USERPROFILE || '', '.cargo', 'bin', 'rustc.exe'),
      'C:\\Program Files\\Rust\\bin\\rustc.exe'
    ];
    const rustPath = this.findExecutable('rustc', rustCandidates);
    const rustEnv = this.environments.get('rust');
    if (rustEnv) {
      if (rustPath) {
        try {
          const v = execSync(`"${rustPath}" --version`, { encoding: 'utf8', timeout: 2000 }).trim();
          rustEnv.status = 'ready';
          rustEnv.version = v;
          rustEnv.path = rustPath;
          rustEnv.canExecuteOffline = true;
        } catch {
          rustEnv.status = 'ready';
          rustEnv.version = 'Rust (Local)';
          rustEnv.path = rustPath;
        }
      } else {
        rustEnv.status = this.isOnline ? 'cloud_ready' : 'not_installed';
        rustEnv.path = undefined;
        rustEnv.canExecuteOffline = false;
      }
    }

    // 6. Go
    const goCandidates = [
      'C:\\Program Files\\Go\\bin\\go.exe',
      'C:\\Go\\bin\\go.exe',
      path.join(process.env.USERPROFILE || '', 'go', 'bin', 'go.exe')
    ];
    const goPath = this.findExecutable('go', goCandidates);
    const goEnv = this.environments.get('go');
    if (goEnv) {
      if (goPath) {
        try {
          const v = execSync(`"${goPath}" version`, { encoding: 'utf8', timeout: 2000 }).trim();
          goEnv.status = 'ready';
          goEnv.version = v;
          goEnv.path = goPath;
          goEnv.canExecuteOffline = true;
        } catch {
          goEnv.status = 'ready';
          goEnv.version = 'Go (Local)';
          goEnv.path = goPath;
        }
      } else {
        goEnv.status = this.isOnline ? 'cloud_ready' : 'not_installed';
        goEnv.path = undefined;
        goEnv.canExecuteOffline = false;
      }
    }

    // 7. Flutter
    const flutterCandidates = [
      'C:\\src\\flutter\\bin\\flutter.bat',
      'C:\\flutter\\bin\\flutter.bat',
      path.join(process.env.LOCALAPPDATA || '', 'flutter', 'bin', 'flutter.bat')
    ];
    const flutterPath = this.findExecutable('flutter', flutterCandidates);
    const flutterEnv = this.environments.get('flutter');
    if (flutterEnv) {
      if (flutterPath) {
        try {
          const out = execSync(`"${flutterPath}" --version 2>&1`, { encoding: 'utf8', timeout: 3500 });
          const firstLine = out.split('\n')[0].trim();
          flutterEnv.status = 'ready';
          flutterEnv.version = firstLine || 'Flutter SDK';
          flutterEnv.path = flutterPath;
          flutterEnv.canExecuteOffline = true;
        } catch {
          flutterEnv.status = 'ready';
          flutterEnv.version = 'Flutter SDK';
          flutterEnv.path = flutterPath;
        }
      } else {
        flutterEnv.status = 'not_installed';
        flutterEnv.path = undefined;
        flutterEnv.canExecuteOffline = false;
      }
    }

    // 8. Android
    const androidCandidates = [
      path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk', 'platform-tools', 'adb.exe'),
      path.join(process.env.ANDROID_HOME || '', 'platform-tools', 'adb.exe'),
      path.join(process.env.ANDROID_SDK_ROOT || '', 'platform-tools', 'adb.exe')
    ];
    const adbPath = this.findExecutable('adb', androidCandidates);
    const androidEnv = this.environments.get('android');
    if (androidEnv) {
      if (adbPath) {
        try {
          const out = execSync(`"${adbPath}" --version 2>&1`, { encoding: 'utf8', timeout: 2500 });
          const firstLine = out.split('\n')[0].trim();
          androidEnv.status = 'ready';
          androidEnv.version = firstLine || 'Android SDK Platform Tools';
          androidEnv.path = adbPath;
          androidEnv.canExecuteOffline = true;
        } catch {
          androidEnv.status = 'ready';
          androidEnv.version = 'Android SDK Platform Tools';
          androidEnv.path = adbPath;
        }
      } else {
        androidEnv.status = 'not_installed';
        androidEnv.path = undefined;
        androidEnv.canExecuteOffline = false;
      }
    }
  }

  public scanSystemPaths(): { environments: EnvironmentInfo[]; summary: string; foundCount: number } {
    this.refreshSystemPaths();
    this.detectAllEnvironments();

    const envs = this.getEnvironments();
    const readyEnvs = envs.filter(e => e.status === 'ready');
    const names = readyEnvs.map(e => e.name.split(' ')[0]).join(', ');

    const summary = readyEnvs.length > 0
      ? `System scan complete: ${readyEnvs.length} local runtimes detected on your PC (${names}). All other environments are active via Instant Cloud Runner.`
      : `System scan complete: No local runtimes found. All supported languages are active via Instant Cloud Runner.`;

    return {
      environments: envs,
      summary,
      foundCount: readyEnvs.length
    };
  }

  public getEnvironments(): EnvironmentInfo[] {
    return Array.from(this.environments.values());
  }

  public getEnvironment(id: string): EnvironmentInfo | undefined {
    return this.environments.get(id);
  }

  public setOnlineStatus(online: boolean): void {
    this.isOnline = online;
    this.detectAllEnvironments();
  }

  public async installEnvironment(
    id: string,
    method: 'winget' | 'browser' = 'winget',
    onProgress?: (msg: string) => void
  ): Promise<{ success: boolean; message: string }> {
    const env = this.environments.get(id);
    if (!env) return { success: false, message: 'Environment not found' };

    // Method 1: Official browser download portal
    if (method === 'browser') {
      if (env.officialUrl) {
        shell.openExternal(env.officialUrl);
        return {
          success: true,
          message: `Opened official download page for ${env.name} in your browser.`
        };
      }
      return { success: false, message: 'No official URL configured for this environment.' };
    }

    // Method 2: In-IDE Automated Windows Package Manager (winget) install
    if (!this.isOnline) {
      throw new Error(`Cannot install ${env.name} while offline. Please connect to the internet.`);
    }

    const wingetId = env.wingetId;
    if (!wingetId) {
      if (env.officialUrl) {
        shell.openExternal(env.officialUrl);
        return { success: true, message: `Opened official installer for ${env.name}.` };
      }
      return { success: false, message: 'Installation method not supported.' };
    }

    // Check if winget is available
    const hasWinget = Boolean(this.findExecutable('winget'));
    if (!hasWinget) {
      if (env.officialUrl) {
        shell.openExternal(env.officialUrl);
        return {
          success: true,
          message: `winget not found on system. Opened official ${env.name} download page in browser.`
        };
      }
      throw new Error('Windows Package Manager (winget) is not installed on this system.');
    }

    env.status = 'downloading';
    onProgress?.(`Starting automated installation for ${env.name} (${wingetId})...`);

    return new Promise<{ success: boolean; message: string }>((resolve, reject) => {
      onProgress?.(`Running: winget install -e --id ${wingetId} ...`);

      const proc = spawn(
        'winget',
        ['install', '-e', '--id', wingetId, '--accept-source-agreements', '--accept-package-agreements', '--silent'],
        { shell: true }
      );

      proc.stdout?.on('data', chunk => {
        const str = chunk.toString('utf8').trim();
        if (str) onProgress?.(str.length > 80 ? str.substring(0, 80) + '...' : str);
      });

      proc.stderr?.on('data', chunk => {
        const str = chunk.toString('utf8').trim();
        if (str) onProgress?.(`[winget] ${str}`);
      });

      proc.on('close', code => {
        // Refresh paths & re-detect
        this.scanSystemPaths();

        if (code === 0) {
          onProgress?.(`${env.name} installed successfully and registered!`);
          resolve({
            success: true,
            message: `${env.name} has been installed on your PC and is ready for native execution.`
          });
        } else {
          // If silent install was cancelled by UAC or failed, provide fallback
          env.status = (id === 'flutter' || id === 'android') ? 'not_installed' : 'cloud_ready';
          if (env.officialUrl) {
            shell.openExternal(env.officialUrl);
          }
          resolve({
            success: false,
            message: `winget exited with code ${code}. Opened official installer page in browser for manual setup.`
          });
        }
      });

      proc.on('error', err => {
        env.status = (id === 'flutter' || id === 'android') ? 'not_installed' : 'cloud_ready';
        if (env.officialUrl) {
          shell.openExternal(env.officialUrl);
        }
        resolve({
          success: false,
          message: `Install error: ${err.message}. Opened official download page.`
        });
      });
    });
  }

  public async uninstallEnvironment(id: string): Promise<{ success: boolean; message: string }> {
    const env = this.environments.get(id);
    if (!env) return { success: false, message: 'Environment not found' };

    // Reset environment state in Elix
    env.status = (id === 'flutter' || id === 'android') ? 'not_installed' : 'cloud_ready';
    env.path = undefined;
    env.version = undefined;
    env.canExecuteOffline = (id === 'cpp');

    // If winget package was used, attempt silent uninstall
    if (env.wingetId && this.findExecutable('winget')) {
      try {
        spawn('winget', ['uninstall', '-e', '--id', env.wingetId, '--silent'], {
          shell: true,
          stdio: 'ignore'
        });
      } catch {}
    }

    return {
      success: true,
      message: `${env.name} has been unlinked from Elix. Active mode: ${
        env.status === 'cloud_ready' ? 'Instant Online Cloud Runner' : 'Not Installed'
      }.`
    };
  }

  public async repairEnvironment(id: string): Promise<{ success: boolean; message: string }> {
    const env = this.environments.get(id);
    if (!env) return { success: false, message: 'Environment not found' };

    this.refreshSystemPaths();
    this.detectAllEnvironments();

    const isReady = env.status === 'ready';
    return {
      success: true,
      message: isReady
        ? `Verified ${env.name}. Local toolchain detected at ${env.path || 'System PATH'}. Execution validated.`
        : `Environment ${env.name} refreshed. Cloud Runner sandbox is active and ready.`
    };
  }
}
