export interface ElixIdeSettings {
  // Text Editor
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: 'on' | 'off' | 'wordWrapColumn';
  lineNumbers: 'on' | 'off' | 'relative';
  minimap: boolean;
  formatOnSave: boolean;
  formatOnPaste: boolean;
  cursorBlinking: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid';
  cursorStyle: 'line' | 'block' | 'underline';
  smoothScrolling: boolean;

  // Files
  autoSave: 'off' | 'afterDelay' | 'onFocusChange';
  autoSaveDelay: number;
  filesExclude: string[];

  // Workbench & Appearance
  colorTheme: 'vs-dark' | 'vs-light' | 'hc-black';
  theme: string;
  fileIconTheme?: string;
  productIconTheme?: string;
  zoomLevel: number;
  showBreadcrumbs: boolean;

  // Terminal
  terminalFontSize: number;
  terminalFontFamily: string;
  terminalCursorStyle: 'block' | 'line' | 'underline';
  terminalShell: string;

  // AI & Integrations
  aiProvider: 'gemini' | 'groq' | 'openrouter' | 'nvidia' | 'ollama' | 'openai' | 'anthropic' | 'mistral' | 'custom_api';
  aiApiKey: string;
  aiModel: string;
  aiCustomEndpoint?: string;
  githubToken: string;

  // Git & Privacy
  gitUserName?: string;
  gitUserEmail?: string;
  gitDefaultBranch?: string;
  gitAutoFetch: boolean;
  gitConfirmSync?: boolean;
  gitAutoStaging?: boolean;
  telemetry: boolean;
}

export const DEFAULT_SETTINGS: ElixIdeSettings = {
  fontSize: 14,
  fontFamily: "Consolas, 'Courier New', monospace",
  tabSize: 2,
  wordWrap: 'on',
  lineNumbers: 'on',
  minimap: true,
  formatOnSave: true,
  formatOnPaste: true,
  cursorBlinking: 'smooth',
  cursorStyle: 'line',
  smoothScrolling: true,

  autoSave: 'afterDelay',
  autoSaveDelay: 1000,
  filesExclude: ['**/node_modules', '**/.git', '**/dist', '**/.next', '**/__pycache__'],

  colorTheme: 'vs-dark',
  theme: 'Dark Modern',
  fileIconTheme: 'seti',
  productIconTheme: 'default',
  zoomLevel: 100,
  showBreadcrumbs: true,

  terminalFontSize: 13,
  terminalFontFamily: "Consolas, 'Courier New', monospace",
  terminalCursorStyle: 'block',
  terminalShell: 'powershell',

  aiProvider: 'gemini',
  aiApiKey: '',
  aiModel: 'gemini-1.5-flash',
  githubToken: '',

  gitUserName: '',
  gitUserEmail: '',
  gitDefaultBranch: 'main',
  gitAutoFetch: true,
  gitConfirmSync: true,
  gitAutoStaging: false,
  telemetry: false
};

const STORAGE_KEY = 'elix_ide_settings_v1';

import { applyThemeGlobally } from './themeHelper';

export function getStoredSettings(): ElixIdeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const settings = { ...DEFAULT_SETTINGS, ...parsed };
      if (typeof window !== 'undefined' && settings.theme) {
        applyThemeGlobally(settings.theme);
      }
      return settings;
    }
  } catch (e) {
    console.error('Failed to parse settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: ElixIdeSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    if (settings.theme) {
      applyThemeGlobally(settings.theme);
    }
    window.dispatchEvent(new CustomEvent('elix-settings-changed', { detail: settings }));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function updateSetting<K extends keyof ElixIdeSettings>(key: K, value: ElixIdeSettings[K]): void {
  const current = getStoredSettings();
  const updated = { ...current, [key]: value };
  saveStoredSettings(updated);
}
