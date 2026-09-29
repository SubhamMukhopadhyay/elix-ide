import { loader } from '@monaco-editor/react';

export type SupportedTheme = 
  | 'Dark Modern'
  | 'Dark+ (default dark)'
  | 'Light Modern'
  | 'Light+ (default light)'
  | 'AMOLED (Pure Black)'
  | 'Dark High Contrast (AMOLED)'
  | 'Dark High Contrast'
  | 'Light High Contrast'
  | 'Monokai'
  | 'Solarized Dark'
  | 'Solarized Light'
  | 'Quiet Light';

export function getThemeId(themeName?: string): string {
  if (!themeName) return 'dark-modern';
  const lower = themeName.toLowerCase();
  if (lower.includes('dark modern')) return 'dark-modern';
  if (lower.includes('dark+') || lower === 'dark+' || lower.includes('default dark')) return 'dark-plus';
  if (lower.includes('light modern')) return 'light-modern';
  if (lower.includes('light+') || lower === 'light+' || lower.includes('default light')) return 'light-plus';
  if (lower.includes('hc-light') || lower.includes('light high contrast')) return 'hc-light';
  if (lower.includes('amoled') || lower.includes('pure black') || lower.includes('oled')) return 'amoled';
  if (lower.includes('hc-black') || lower.includes('dark high contrast')) return 'hc-black';
  if (lower.includes('monokai')) return 'monokai';
  if (lower.includes('solarized light')) return 'solarized-light';
  if (lower.includes('solarized')) return 'solarized-dark';
  if (lower.includes('quiet')) return 'quiet-light';
  if (lower.includes('light')) return 'light-modern';
  return 'dark-modern';
}

export function isLightTheme(themeName?: string): boolean {
  const id = getThemeId(themeName);
  return id === 'light-modern' || id === 'light-plus' || id === 'hc-light' || id === 'solarized-light' || id === 'quiet-light';
}

export function getMonacoTheme(themeName?: string): string {
  const id = getThemeId(themeName);
  switch (id) {
    case 'dark-modern':
      return 'vs-dark';
    case 'dark-plus':
      return 'vs-dark';
    case 'light-modern':
      return 'vs';
    case 'light-plus':
      return 'vs';
    case 'amoled':
      return 'elix-amoled';
    case 'hc-black':
      return 'hc-black';
    case 'hc-light':
      return 'hc-light';
    case 'monokai':
      return 'elix-monokai';
    case 'solarized-dark':
      return 'elix-solarized';
    case 'solarized-light':
      return 'elix-solarized-light';
    case 'quiet-light':
      return 'elix-light';
    default:
      return 'vs-dark';
  }
}

export function defineCustomMonacoThemes(monaco: any): void {
  // 1. Dark Modern (VS Code Default Dark)
  monaco.editor.defineTheme('vscode-dark-modern', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: '569cd6', fontStyle: 'bold' },
      { token: 'string', foreground: 'ce9178' },
      { token: 'number', foreground: 'b5cea8' },
      { token: 'type', foreground: '4ec9b0' },
      { token: 'variable', foreground: '9cdcfe' },
      { token: 'function', foreground: 'dcdcaa' }
    ],
    colors: {
      'editor.background': '#1F1F1F',
      'editor.foreground': '#CCCCCC',
      'editor.lineHighlightBackground': '#2A2A2A',
      'editorCursor.foreground': '#0078D4',
      'editorLineNumber.foreground': '#6E7681',
      'editorLineNumber.activeForeground': '#CCCCCC',
      'editor.selectionBackground': '#264F78',
      'editorGutter.background': '#1F1F1F'
    }
  });

  // 2. Light Modern (VS Code Default Light)
  monaco.editor.defineTheme('vscode-light-modern', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '008000', fontStyle: 'italic' },
      { token: 'keyword', foreground: '0000ff', fontStyle: 'bold' },
      { token: 'string', foreground: 'a31515' },
      { token: 'number', foreground: '098658' },
      { token: 'type', foreground: '267f99' },
      { token: 'function', foreground: '795e26' }
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#3B3B3B',
      'editor.lineHighlightBackground': '#F8F8F8',
      'editorCursor.foreground': '#005FB8',
      'editorLineNumber.foreground': '#8A8A8A',
      'editorLineNumber.activeForeground': '#1F1F1F',
      'editor.selectionBackground': '#ADD6FF80',
      'editorGutter.background': '#FFFFFF'
    }
  });

  // 3. AMOLED (100% Pure Black OLED)
  monaco.editor.defineTheme('elix-amoled', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '7ca668', fontStyle: 'italic' },
      { token: 'keyword', foreground: '569cd6', fontStyle: 'bold' },
      { token: 'string', foreground: 'ce9178' },
      { token: 'number', foreground: 'b5cea8' },
      { token: 'type', foreground: '4ec9b0' },
      { token: 'variable', foreground: '9cdcfe' },
      { token: 'function', foreground: 'dcdcaa' },
      { token: 'delimiter', foreground: 'ffffff' }
    ],
    colors: {
      'editor.background': '#000000',
      'editor.foreground': '#FFFFFF',
      'editorCursor.foreground': '#007ACC',
      'editor.lineHighlightBackground': '#0D0D0D',
      'editorLineNumber.foreground': '#7C7C7C',
      'editorLineNumber.activeForeground': '#007ACC',
      'editor.selectionBackground': '#264F78',
      'editorGutter.background': '#000000',
      'minimap.background': '#000000'
    }
  });

  // 4. Monokai
  monaco.editor.defineTheme('elix-monokai', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'f92672', fontStyle: 'bold' },
      { token: 'string', foreground: 'e6db74' },
      { token: 'number', foreground: 'ae81ff' },
      { token: 'type', foreground: '66d9ef' },
      { token: 'identifier', foreground: 'a6e22e' },
      { token: 'function', foreground: 'a6e22e' },
      { token: 'variable', foreground: 'f8f8f2' }
    ],
    colors: {
      'editor.background': '#272822',
      'editor.foreground': '#F8F8F2',
      'editor.lineHighlightBackground': '#3E3D32',
      'editorCursor.foreground': '#F8F8F0',
      'editorLineNumber.foreground': '#90908A',
      'editorLineNumber.activeForeground': '#C4C4BE',
      'editor.selectionBackground': '#49483E',
      'editorGutter.background': '#272822'
    }
  });

  // 5. Solarized Dark
  monaco.editor.defineTheme('elix-solarized', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '586e75', fontStyle: 'italic' },
      { token: 'keyword', foreground: '859900', fontStyle: 'bold' },
      { token: 'string', foreground: '2aa198' },
      { token: 'number', foreground: 'd33682' },
      { token: 'type', foreground: 'b58900' },
      { token: 'function', foreground: '268bd2' },
      { token: 'variable', foreground: '839496' }
    ],
    colors: {
      'editor.background': '#002B36',
      'editor.foreground': '#839496',
      'editor.lineHighlightBackground': '#073642',
      'editorCursor.foreground': '#268BD2',
      'editorLineNumber.foreground': '#586E75',
      'editor.selectionBackground': '#073642',
      'editorGutter.background': '#002B36'
    }
  });

  // 6. Solarized Light
  monaco.editor.defineTheme('elix-solarized-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '93a1a1', fontStyle: 'italic' },
      { token: 'keyword', foreground: '859900', fontStyle: 'bold' },
      { token: 'string', foreground: '2aa198' },
      { token: 'number', foreground: 'd33682' },
      { token: 'type', foreground: 'b58900' },
      { token: 'function', foreground: '268bd2' },
      { token: 'variable', foreground: '657b83' }
    ],
    colors: {
      'editor.background': '#FDF6E3',
      'editor.foreground': '#657B83',
      'editor.lineHighlightBackground': '#EEE8D5',
      'editorCursor.foreground': '#268BD2',
      'editorLineNumber.foreground': '#93A1A1',
      'editor.selectionBackground': '#EEE8D5',
      'editorGutter.background': '#FDF6E3'
    }
  });

  // 7. Quiet Light
  monaco.editor.defineTheme('elix-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: 'aaaaaa', fontStyle: 'italic' },
      { token: 'keyword', foreground: '7a3e9d', fontStyle: 'bold' },
      { token: 'string', foreground: '448c27' },
      { token: 'number', foreground: '9c5d27' },
      { token: 'type', foreground: '007acc' },
      { token: 'function', foreground: 'aa3731' }
    ],
    colors: {
      'editor.background': '#F5F5F5',
      'editor.foreground': '#333333',
      'editor.lineHighlightBackground': '#E8E8E8',
      'editorCursor.foreground': '#333333',
      'editorLineNumber.foreground': '#999999',
      'editor.selectionBackground': '#CCE8FF',
      'editorGutter.background': '#F5F5F5'
    }
  });
}

export function applyThemeGlobally(themeName: string): void {
  const themeId = getThemeId(themeName);
  const isLight = isLightTheme(themeName);

  document.documentElement.setAttribute('data-theme', themeId);
  document.body.setAttribute('data-theme', themeId);

  try {
    const saved = localStorage.getItem('elix_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.productIconTheme) {
        document.documentElement.setAttribute('data-product-icons', parsed.productIconTheme);
      }
      if (parsed.fileIconTheme) {
        document.documentElement.setAttribute('data-file-icons', parsed.fileIconTheme);
      }
    }
  } catch {}

  // Synchronize Tailwind dark / light class
  if (isLight) {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.body.classList.remove('dark');
    document.body.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    document.body.classList.remove('light');
    document.body.classList.add('dark');
  }

  // Set CSS variables directly as inline styles on root for 100% guarantee
  const root = document.documentElement;

  // Set theme-adaptive logo colors
  if (isLight) {
    root.style.setProperty('--elix-logo-primary', '#0F172A');
    root.style.setProperty('--elix-logo-secondary', '#334155');
    root.style.setProperty('--elix-logo-accent', '#0098C7');
  } else {
    root.style.setProperty('--elix-logo-primary', '#F1F5F9');
    root.style.setProperty('--elix-logo-secondary', '#E2E8F0');
    root.style.setProperty('--elix-logo-accent', '#00E5FF');
  }
  switch (themeId) {
    case 'dark-modern':
      root.style.setProperty('--ide-bg', '#1f1f1f');
      root.style.setProperty('--ide-sidebar-bg', '#181818');
      root.style.setProperty('--ide-title-bg', '#181818');
      root.style.setProperty('--ide-panel-bg', '#181818');
      root.style.setProperty('--ide-activity-bg', '#181818');
      root.style.setProperty('--ide-activity-fg', '#d7d7d7');
      root.style.setProperty('--ide-tab-active-bg', '#1f1f1f');
      root.style.setProperty('--ide-tab-inactive-bg', '#181818');
      root.style.setProperty('--ide-border', '#2b2b2b');
      root.style.setProperty('--ide-border-subtle', '#333333');
      root.style.setProperty('--ide-text', '#cccccc');
      root.style.setProperty('--ide-text-muted', '#888888');
      root.style.setProperty('--ide-input-bg', '#2a2a2a');
      root.style.setProperty('--ide-input-border', '#3c3c3c');
      root.style.setProperty('--ide-hover-bg', '#2b2b2b');
      root.style.setProperty('--ide-accent', '#0078d4');
      root.style.setProperty('--ide-statusbar-bg', '#181818');
      root.style.setProperty('--ide-statusbar-text', '#cccccc');
      root.style.setProperty('--ide-statusbar-hover', 'rgba(255, 255, 255, 0.12)');
      break;

    case 'dark-plus':
      root.style.setProperty('--ide-bg', '#1e1e1e');
      root.style.setProperty('--ide-sidebar-bg', '#252526');
      root.style.setProperty('--ide-title-bg', '#1e1e1e');
      root.style.setProperty('--ide-panel-bg', '#1e1e1e');
      root.style.setProperty('--ide-activity-bg', '#333333');
      root.style.setProperty('--ide-activity-fg', '#ffffff');
      root.style.setProperty('--ide-tab-active-bg', '#1e1e1e');
      root.style.setProperty('--ide-tab-inactive-bg', '#2d2d2d');
      root.style.setProperty('--ide-border', '#2b2b2b');
      root.style.setProperty('--ide-border-subtle', '#333333');
      root.style.setProperty('--ide-text', '#cccccc');
      root.style.setProperty('--ide-text-muted', '#888888');
      root.style.setProperty('--ide-input-bg', '#252526');
      root.style.setProperty('--ide-input-border', '#3c3c3c');
      root.style.setProperty('--ide-hover-bg', '#2a2d2e');
      root.style.setProperty('--ide-accent', '#007acc');
      root.style.setProperty('--ide-statusbar-bg', '#007acc');
      root.style.setProperty('--ide-statusbar-text', '#ffffff');
      root.style.setProperty('--ide-statusbar-hover', 'rgba(255, 255, 255, 0.18)');
      break;

    case 'light-modern':
      root.style.setProperty('--ide-bg', '#ffffff');
      root.style.setProperty('--ide-sidebar-bg', '#f8f8f8');
      root.style.setProperty('--ide-title-bg', '#f8f8f8');
      root.style.setProperty('--ide-panel-bg', '#f8f8f8');
      root.style.setProperty('--ide-activity-bg', '#f8f8f8');
      root.style.setProperty('--ide-activity-fg', '#1f1f1f');
      root.style.setProperty('--ide-tab-active-bg', '#ffffff');
      root.style.setProperty('--ide-tab-inactive-bg', '#f8f8f8');
      root.style.setProperty('--ide-border', '#e5e5e5');
      root.style.setProperty('--ide-border-subtle', '#eeeeee');
      root.style.setProperty('--ide-text', '#3b3b3b');
      root.style.setProperty('--ide-text-muted', '#616161');
      root.style.setProperty('--ide-input-bg', '#ffffff');
      root.style.setProperty('--ide-input-border', '#cecece');
      root.style.setProperty('--ide-hover-bg', '#f0f0f0');
      root.style.setProperty('--ide-accent', '#005fb8');
      root.style.setProperty('--ide-statusbar-bg', '#f8f8f8');
      root.style.setProperty('--ide-statusbar-text', '#3b3b3b');
      root.style.setProperty('--ide-statusbar-hover', 'rgba(0, 0, 0, 0.08)');
      break;

    case 'light-plus':
      root.style.setProperty('--ide-bg', '#ffffff');
      root.style.setProperty('--ide-sidebar-bg', '#f3f3f3');
      root.style.setProperty('--ide-title-bg', '#dddddd');
      root.style.setProperty('--ide-panel-bg', '#ffffff');
      root.style.setProperty('--ide-activity-bg', '#2c2c2c');
      root.style.setProperty('--ide-activity-fg', '#ffffff');
      root.style.setProperty('--ide-tab-active-bg', '#ffffff');
      root.style.setProperty('--ide-tab-inactive-bg', '#ececec');
      root.style.setProperty('--ide-border', '#e5e5e5');
      root.style.setProperty('--ide-border-subtle', '#d4d4d4');
      root.style.setProperty('--ide-text', '#333333');
      root.style.setProperty('--ide-text-muted', '#616161');
      root.style.setProperty('--ide-input-bg', '#ffffff');
      root.style.setProperty('--ide-input-border', '#cecece');
      root.style.setProperty('--ide-hover-bg', '#e8e8e8');
      root.style.setProperty('--ide-accent', '#007acc');
      root.style.setProperty('--ide-statusbar-bg', '#007acc');
      root.style.setProperty('--ide-statusbar-text', '#ffffff');
      root.style.setProperty('--ide-statusbar-hover', 'rgba(255, 255, 255, 0.2)');
      break;

    case 'amoled':
      root.style.setProperty('--ide-bg', '#000000');
      root.style.setProperty('--ide-sidebar-bg', '#000000');
      root.style.setProperty('--ide-title-bg', '#000000');
      root.style.setProperty('--ide-panel-bg', '#000000');
      root.style.setProperty('--ide-activity-bg', '#000000');
      root.style.setProperty('--ide-activity-fg', '#ffffff');
      root.style.setProperty('--ide-tab-active-bg', '#000000');
      root.style.setProperty('--ide-tab-inactive-bg', '#050505');
      root.style.setProperty('--ide-border', '#1e1e1e');
      root.style.setProperty('--ide-border-subtle', '#141414');
      root.style.setProperty('--ide-text', '#ffffff');
      root.style.setProperty('--ide-text-muted', '#888888');
      root.style.setProperty('--ide-input-bg', '#0a0a0a');
      root.style.setProperty('--ide-input-border', '#262626');
      root.style.setProperty('--ide-hover-bg', '#141414');
      root.style.setProperty('--ide-accent', '#0078d4');
      root.style.setProperty('--ide-statusbar-bg', '#000000');
      root.style.setProperty('--ide-statusbar-text', '#cccccc');
      root.style.setProperty('--ide-statusbar-hover', 'rgba(255, 255, 255, 0.12)');
      break;

    case 'hc-black':
      root.style.setProperty('--ide-bg', '#000000');
      root.style.setProperty('--ide-sidebar-bg', '#000000');
      root.style.setProperty('--ide-title-bg', '#000000');
      root.style.setProperty('--ide-panel-bg', '#000000');
      root.style.setProperty('--ide-activity-bg', '#000000');
      root.style.setProperty('--ide-activity-fg', '#ffffff');
      root.style.setProperty('--ide-tab-active-bg', '#000000');
      root.style.setProperty('--ide-tab-inactive-bg', '#000000');
      root.style.setProperty('--ide-border', '#6fc3df');
      root.style.setProperty('--ide-border-subtle', '#2b2b2b');
      root.style.setProperty('--ide-text', '#ffffff');
      root.style.setProperty('--ide-text-muted', '#aaaaaa');
      root.style.setProperty('--ide-input-bg', '#000000');
      root.style.setProperty('--ide-input-border', '#6fc3df');
      root.style.setProperty('--ide-hover-bg', '#1a1a1a');
      root.style.setProperty('--ide-accent', '#f38518');
      root.style.setProperty('--ide-statusbar-bg', '#000000');
      root.style.setProperty('--ide-statusbar-text', '#ffffff');
      root.style.setProperty('--ide-statusbar-hover', 'rgba(255, 255, 255, 0.25)');
      break;

    case 'hc-light':
      root.style.setProperty('--ide-bg', '#ffffff');
      root.style.setProperty('--ide-sidebar-bg', '#ffffff');
      root.style.setProperty('--ide-title-bg', '#ffffff');
      root.style.setProperty('--ide-panel-bg', '#ffffff');
      root.style.setProperty('--ide-activity-bg', '#ffffff');
      root.style.setProperty('--ide-activity-fg', '#000000');
      root.style.setProperty('--ide-tab-active-bg', '#ffffff');
      root.style.setProperty('--ide-tab-inactive-bg', '#ffffff');
      root.style.setProperty('--ide-border', '#0f4a85');
      root.style.setProperty('--ide-border-subtle', '#0f4a85');
      root.style.setProperty('--ide-text', '#000000');
      root.style.setProperty('--ide-text-muted', '#222222');
      root.style.setProperty('--ide-input-bg', '#ffffff');
      root.style.setProperty('--ide-input-border', '#0f4a85');
      root.style.setProperty('--ide-hover-bg', '#e5e5e5');
      root.style.setProperty('--ide-accent', '#0f4a85');
      root.style.setProperty('--ide-statusbar-bg', '#ffffff');
      root.style.setProperty('--ide-statusbar-text', '#000000');
      root.style.setProperty('--ide-statusbar-hover', 'rgba(0, 0, 0, 0.12)');
      break;

    case 'monokai':
      root.style.setProperty('--ide-bg', '#272822');
      root.style.setProperty('--ide-sidebar-bg', '#1e1f1c');
      root.style.setProperty('--ide-title-bg', '#1e1f1c');
      root.style.setProperty('--ide-panel-bg', '#272822');
      root.style.setProperty('--ide-activity-bg', '#272822');
      root.style.setProperty('--ide-activity-fg', '#f8f8f2');
      root.style.setProperty('--ide-tab-active-bg', '#272822');
      root.style.setProperty('--ide-tab-inactive-bg', '#1e1f1c');
      root.style.setProperty('--ide-border', '#3e3d32');
      root.style.setProperty('--ide-border-subtle', '#49483e');
      root.style.setProperty('--ide-text', '#f8f8f2');
      root.style.setProperty('--ide-text-muted', '#75715e');
      root.style.setProperty('--ide-input-bg', '#1e1f1c');
      root.style.setProperty('--ide-input-border', '#3e3d32');
      root.style.setProperty('--ide-hover-bg', '#3e3d32');
      root.style.setProperty('--ide-accent', '#a6e22e');
      root.style.setProperty('--ide-statusbar-bg', '#414339');
      root.style.setProperty('--ide-statusbar-text', '#f8f8f2');
      root.style.setProperty('--ide-statusbar-hover', 'rgba(255, 255, 255, 0.15)');
      break;

    case 'solarized-dark':
      root.style.setProperty('--ide-bg', '#002b36');
      root.style.setProperty('--ide-sidebar-bg', '#073642');
      root.style.setProperty('--ide-title-bg', '#073642');
      root.style.setProperty('--ide-panel-bg', '#002b36');
      root.style.setProperty('--ide-activity-bg', '#00212b');
      root.style.setProperty('--ide-activity-fg', '#839496');
      root.style.setProperty('--ide-tab-active-bg', '#002b36');
      root.style.setProperty('--ide-tab-inactive-bg', '#073642');
      root.style.setProperty('--ide-border', '#004354');
      root.style.setProperty('--ide-border-subtle', '#0d4a58');
      root.style.setProperty('--ide-text', '#93a1a1');
      root.style.setProperty('--ide-text-muted', '#586e75');
      root.style.setProperty('--ide-input-bg', '#00212b');
      root.style.setProperty('--ide-input-border', '#004354');
      root.style.setProperty('--ide-hover-bg', '#0d4a58');
      root.style.setProperty('--ide-accent', '#268bd2');
      root.style.setProperty('--ide-statusbar-bg', '#00212b');
      root.style.setProperty('--ide-statusbar-text', '#93a1a1');
      root.style.setProperty('--ide-statusbar-hover', 'rgba(255, 255, 255, 0.15)');
      break;

    case 'solarized-light':
      root.style.setProperty('--ide-bg', '#fdf6e3');
      root.style.setProperty('--ide-sidebar-bg', '#eee8d5');
      root.style.setProperty('--ide-title-bg', '#eee8d5');
      root.style.setProperty('--ide-panel-bg', '#fdf6e3');
      root.style.setProperty('--ide-activity-bg', '#eee8d5');
      root.style.setProperty('--ide-activity-fg', '#657b83');
      root.style.setProperty('--ide-tab-active-bg', '#fdf6e3');
      root.style.setProperty('--ide-tab-inactive-bg', '#eee8d5');
      root.style.setProperty('--ide-border', '#d3368220');
      root.style.setProperty('--ide-border-subtle', '#e0d8c3');
      root.style.setProperty('--ide-text', '#657b83');
      root.style.setProperty('--ide-text-muted', '#93a1a1');
      root.style.setProperty('--ide-input-bg', '#fdf6e3');
      root.style.setProperty('--ide-input-border', '#d5ccb6');
      root.style.setProperty('--ide-hover-bg', '#dfd8c5');
      root.style.setProperty('--ide-accent', '#268bd2');
      root.style.setProperty('--ide-statusbar-bg', '#eee8d5');
      root.style.setProperty('--ide-statusbar-text', '#586e75');
      root.style.setProperty('--ide-statusbar-hover', 'rgba(0, 0, 0, 0.08)');
      break;

    case 'quiet-light':
      root.style.setProperty('--ide-bg', '#f5f5f5');
      root.style.setProperty('--ide-sidebar-bg', '#ececec');
      root.style.setProperty('--ide-title-bg', '#e0e0e0');
      root.style.setProperty('--ide-panel-bg', '#f5f5f5');
      root.style.setProperty('--ide-activity-bg', '#ede8ef');
      root.style.setProperty('--ide-activity-fg', '#333333');
      root.style.setProperty('--ide-tab-active-bg', '#ffffff');
      root.style.setProperty('--ide-tab-inactive-bg', '#ececec');
      root.style.setProperty('--ide-border', '#d4d4d4');
      root.style.setProperty('--ide-border-subtle', '#cccccc');
      root.style.setProperty('--ide-text', '#333333');
      root.style.setProperty('--ide-text-muted', '#666666');
      root.style.setProperty('--ide-input-bg', '#ffffff');
      root.style.setProperty('--ide-input-border', '#cccccc');
      root.style.setProperty('--ide-hover-bg', '#dedede');
      root.style.setProperty('--ide-accent', '#705697');
      root.style.setProperty('--ide-statusbar-bg', '#705697');
      root.style.setProperty('--ide-statusbar-text', '#ffffff');
      root.style.setProperty('--ide-statusbar-hover', 'rgba(255, 255, 255, 0.2)');
      break;

    default:
      root.style.setProperty('--ide-bg', '#1f1f1f');
      root.style.setProperty('--ide-sidebar-bg', '#181818');
      root.style.setProperty('--ide-title-bg', '#181818');
      root.style.setProperty('--ide-panel-bg', '#181818');
      root.style.setProperty('--ide-activity-bg', '#181818');
      root.style.setProperty('--ide-activity-fg', '#d7d7d7');
      root.style.setProperty('--ide-tab-active-bg', '#1f1f1f');
      root.style.setProperty('--ide-tab-inactive-bg', '#181818');
      root.style.setProperty('--ide-border', '#2b2b2b');
      root.style.setProperty('--ide-border-subtle', '#333333');
      root.style.setProperty('--ide-text', '#cccccc');
      root.style.setProperty('--ide-text-muted', '#888888');
      root.style.setProperty('--ide-input-bg', '#2a2a2a');
      root.style.setProperty('--ide-input-border', '#3c3c3c');
      root.style.setProperty('--ide-hover-bg', '#2b2b2b');
      root.style.setProperty('--ide-accent', '#0078d4');
      root.style.setProperty('--ide-statusbar-bg', '#181818');
      root.style.setProperty('--ide-statusbar-text', '#cccccc');
      root.style.setProperty('--ide-statusbar-hover', 'rgba(255, 255, 255, 0.12)');
      break;
  }

  document.body.style.backgroundColor = 'var(--ide-bg)';
  document.body.style.color = 'var(--ide-text)';

  // Dynamically update Windows 11 Native Title Bar Overlay color & symbols to match theme
  try {
    const titleBg = root.style.getPropertyValue('--ide-title-bg')?.trim() || (isLight ? '#f8f8f8' : '#181818');
    const symbolColor = isLight ? '#1f1f1f' : '#cccccc';
    if (window.elix?.setTitleBarOverlay) {
      window.elix.setTitleBarOverlay({ color: titleBg, symbolColor }).catch(() => {});
    }
  } catch (err) {
    console.warn('TitleBarOverlay update deferred:', err);
  }

  // Set Monaco editor theme via loader
  try {
    loader.init().then(monaco => {
      defineCustomMonacoThemes(monaco);
      const monacoTheme = getMonacoTheme(themeName);
      monaco.editor.setTheme(monacoTheme);
    }).catch(err => {
      console.warn('Monaco loader deferred:', err);
    });
  } catch (err) {
    console.error('Monaco theme error:', err);
  }
}
