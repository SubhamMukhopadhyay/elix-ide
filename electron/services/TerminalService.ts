import { spawn, ChildProcess } from 'child_process';
import os from 'os';

export interface TerminalSession {
  id: string;
  process: ChildProcess;
  cwd: string;
}

export class TerminalService {
  private static instance: TerminalService;
  private sessions: Map<string, TerminalSession> = new Map();
  private dataListeners: Map<string, (data: string) => void> = new Map();

  private constructor() {}

  public static getInstance(): TerminalService {
    if (!TerminalService.instance) {
      TerminalService.instance = new TerminalService();
    }
    return TerminalService.instance;
  }

  public createSession(id: string, cwd: string, onData: (data: string) => void): void {
    const isWindows = os.platform() === 'win32';
    const shell = isWindows ? 'powershell.exe' : (process.env.SHELL || 'bash');
    const args = isWindows ? ['-NoLogo'] : [];

    const proc = spawn(shell, args, {
      cwd,
      env: { ...process.env, TERM: 'xterm-256color' }
    });

    proc.stdout?.on('data', chunk => {
      onData(chunk.toString('utf8'));
    });

    proc.stderr?.on('data', chunk => {
      onData(chunk.toString('utf8'));
    });

    proc.on('close', () => {
      this.sessions.delete(id);
    });

    this.sessions.set(id, { id, process: proc, cwd });
  }

  public write(id: string, data: string): void {
    const session = this.sessions.get(id);
    if (session && session.process.stdin) {
      session.process.stdin.write(data);
    }
  }

  public resize(id: string, cols: number, rows: number): void {
    // Handled by pty if native pty available
  }

  public kill(id: string): void {
    const session = this.sessions.get(id);
    if (session) {
      try {
        session.process.kill();
      } catch (e) {}
      this.sessions.delete(id);
    }
  }
}
