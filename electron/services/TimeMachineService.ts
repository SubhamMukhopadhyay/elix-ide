import fs from 'fs';
import path from 'path';
import { TimeMachineSnapshot } from '../../src/types';
import { DatabaseService } from './DatabaseService';

export class TimeMachineService {
  private static instance: TimeMachineService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  public static getInstance(): TimeMachineService {
    if (!TimeMachineService.instance) {
      TimeMachineService.instance = new TimeMachineService();
    }
    return TimeMachineService.instance;
  }

  public takeSnapshot(
    projectId: string,
    projectDir: string,
    title: string,
    trigger: TimeMachineSnapshot['trigger'] = 'manual'
  ): TimeMachineSnapshot {
    const files: Record<string, string> = {};

    const scan = (dir: string, baseDir: string) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (
          entry.name === 'node_modules' ||
          entry.name === '.git' ||
          entry.name === 'dist' ||
          entry.name === 'build' ||
          entry.name === '.elix-storage'
        ) {
          continue;
        }

        const fullPath = path.join(dir, entry.name);
        const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

        if (entry.isDirectory()) {
          scan(fullPath, baseDir);
        } else if (entry.isFile()) {
          try {
            // Only capture text files under 2MB
            const stat = fs.statSync(fullPath);
            if (stat.size < 2 * 1024 * 1024) {
              files[relPath] = fs.readFileSync(fullPath, 'utf8');
            }
          } catch {
            // Ignore unreadable files
          }
        }
      }
    };

    scan(projectDir, projectDir);

    const snap = this.db.createSnapshot({
      projectId,
      title,
      description: `Snapshot captured ${Object.keys(files).length} files (${trigger})`,
      trigger,
      files
    });

    return snap;
  }

  public restoreSnapshot(snapshotId: string, projectDir: string): boolean {
    const snaps = this.db.getSnapshots(''); // All or find by ID
    // Find matching snapshot
    const allSnaps = (this.db as any).data.snapshots as TimeMachineSnapshot[];
    const snap = allSnaps.find(s => s.id === snapshotId);
    if (!snap) return false;

    try {
      for (const [relPath, content] of Object.entries(snap.files)) {
        const targetPath = path.join(projectDir, relPath);
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.writeFileSync(targetPath, content, 'utf8');
      }
      return true;
    } catch {
      return false;
    }
  }

  public getSnapshots(projectId: string): TimeMachineSnapshot[] {
    return this.db.getSnapshots(projectId);
  }
}
