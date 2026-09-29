import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { DatabaseService } from './DatabaseService';

export interface GitStatusResult {
  isRepo: boolean;
  branch: string;
  staged: string[];
  modified: string[];
  untracked: string[];
  ahead: number;
  behind: number;
}

export class GitService {
  private static instance: GitService;

  private constructor() {}

  public static getInstance(): GitService {
    if (!GitService.instance) {
      GitService.instance = new GitService();
    }
    return GitService.instance;
  }

  public getStatus(repoPath: string): GitStatusResult {
    if (!fs.existsSync(path.join(repoPath, '.git'))) {
      return {
        isRepo: false,
        branch: '',
        staged: [],
        modified: [],
        untracked: [],
        ahead: 0,
        behind: 0
      };
    }

    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: repoPath, encoding: 'utf8' }).trim();
      const statusRaw = execSync('git status --porcelain', { cwd: repoPath, encoding: 'utf8' });

      const staged: string[] = [];
      const modified: string[] = [];
      const untracked: string[] = [];

      statusRaw.split('\n').forEach(line => {
        if (!line.trim()) return;
        const x = line[0];
        const y = line[1];
        const file = line.substring(3).trim();

        if (x === 'M' || x === 'A' || x === 'D' || x === 'R') {
          staged.push(file);
        }
        if (y === 'M' || y === 'D') {
          modified.push(file);
        }
        if (x === '?' && y === '?') {
          untracked.push(file);
        }
      });

      return {
        isRepo: true,
        branch,
        staged,
        modified,
        untracked,
        ahead: 0,
        behind: 0
      };
    } catch (e) {
      return {
        isRepo: true,
        branch: 'main',
        staged: [],
        modified: [],
        untracked: [],
        ahead: 0,
        behind: 0
      };
    }
  }

  public stageFile(repoPath: string, file: string): boolean {
    try {
      execSync(`git add "${file}"`, { cwd: repoPath });
      return true;
    } catch {
      return false;
    }
  }

  public unstageFile(repoPath: string, file: string): boolean {
    try {
      execSync(`git reset HEAD "${file}"`, { cwd: repoPath });
      return true;
    } catch {
      return false;
    }
  }

  public commit(repoPath: string, message: string): { success: boolean; hash?: string; error?: string } {
    try {
      const out = execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd: repoPath, encoding: 'utf8' });
      DatabaseService.getInstance().recordActivity({
        type: 'git_commit',
        category: 'git',
        description: `Committed: "${message}"`
      });
      return { success: true, hash: out };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public getDiff(repoPath: string, file?: string): string {
    try {
      const cmd = file ? `git diff "${file}"` : 'git diff';
      return execSync(cmd, { cwd: repoPath, encoding: 'utf8' });
    } catch {
      return '';
    }
  }

  public getLog(repoPath: string, limit: number = 20): Array<{ hash: string; author: string; date: string; message: string }> {
    try {
      const out = execSync(`git log -n ${limit} --pretty=format:"%h||%an||%ad||%s" --date=short`, { cwd: repoPath, encoding: 'utf8' });
      return out.split('\n').filter(Boolean).map(line => {
        const [hash, author, date, message] = line.split('||');
        return { hash, author, date, message };
      });
    } catch {
      return [];
    }
  }

  public init(repoPath: string): boolean {
    try {
      execSync('git init', { cwd: repoPath });
      return true;
    } catch {
      return false;
    }
  }

  public push(repoPath: string, remote: string = 'origin', branch?: string): { success: boolean; output?: string; error?: string } {
    try {
      const b = branch || this.getStatus(repoPath).branch || 'main';
      const out = execSync(`git push ${remote} ${b}`, { cwd: repoPath, encoding: 'utf8' });
      return { success: true, output: out };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public pull(repoPath: string, remote: string = 'origin', branch?: string): { success: boolean; output?: string; error?: string } {
    try {
      const b = branch || this.getStatus(repoPath).branch || 'main';
      const out = execSync(`git pull ${remote} ${b}`, { cwd: repoPath, encoding: 'utf8' });
      return { success: true, output: out };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public clone(repoUrl: string, targetParentDir: string): { success: boolean; projectPath?: string; error?: string } {
    try {
      const cleanUrl = repoUrl.trim();
      let repoName = cleanUrl.split('/').pop()?.replace(/\.git$/, '') || 'cloned-repo';
      let destPath = path.join(targetParentDir, repoName);
      let count = 1;
      while (fs.existsSync(destPath)) {
        destPath = path.join(targetParentDir, `${repoName}-${count++}`);
      }
      execSync(`git clone "${cleanUrl}" "${destPath}"`, { encoding: 'utf8', timeout: 120000 });
      return { success: true, projectPath: destPath };
    } catch (err: any) {
      return { success: false, error: err.message || 'Clone failed' };
    }
  }
}

