import React from 'react';
import setiTheme from '../../assets/seti/vs-seti-icon-theme.json';

const defs = setiTheme.iconDefinitions as unknown as Record<string, { fontCharacter: string; fontColor?: string }>;
const exts = (setiTheme.fileExtensions || {}) as unknown as Record<string, string>;
const names = (setiTheme.fileNames || {}) as unknown as Record<string, string>;
const langs = (setiTheme.languageIds || {}) as unknown as Record<string, string>;

// Comprehensive mapping of file extensions to VS Code Language IDs
const langMap: Record<string, string> = {
  // Web & UI
  html: 'html', htm: 'html', xhtml: 'html', vue: 'vue',
  css: 'css', scss: 'scss', sass: 'sass', less: 'less', postcss: 'postcss', stylus: 'stylus',
  js: 'javascript', mjs: 'javascript', cjs: 'javascript', jsx: 'javascriptreact',
  ts: 'typescript', mts: 'typescript', cts: 'typescript', tsx: 'typescriptreact',
  json: 'json', jsonc: 'jsonc', jsonl: 'jsonl',

  // Systems & Native
  c: 'c', h: 'c',
  cpp: 'cpp', hpp: 'cpp', cc: 'cpp', cxx: 'cpp', 'c++': 'cpp', 'h++': 'cpp', cu: 'cuda-cpp',
  rs: 'rust', rlib: 'rust',
  go: 'go',
  cs: 'csharp', csx: 'csharp',
  m: 'objective-c', mm: 'objective-cpp',
  vala: 'vala',

  // JVM & Mobile
  java: 'java', jsp: 'java', class: 'java', jar: 'java',
  kt: 'kotlin', kts: 'kotlin',
  swift: 'swift',
  dart: 'dart',
  scala: 'scala', sc: 'scala',
  groovy: 'groovy', gvy: 'groovy', gradle: 'gradle',
  clj: 'clojure', cljs: 'clojure', cljc: 'clojure', edn: 'clojure',

  // Scripting & Backend
  py: 'python', pyw: 'python', pyi: 'python',
  rb: 'ruby', erb: 'erb', gemspec: 'ruby', rake: 'ruby',
  php: 'php', phtml: 'php', php4: 'php', php5: 'php',
  pl: 'perl', pm: 'perl', t: 'perl',
  lua: 'lua',
  r: 'r', rmd: 'r',
  jl: 'julia',
  ex: 'elixir', exs: 'elixir',
  elm: 'elm',
  hs: 'haskell', lhs: 'haskell',
  ml: 'ocaml', mli: 'ocaml',
  fs: 'fsharp', fsi: 'fsharp', fsx: 'fsharp',
  coffee: 'coffeescript',

  // Shell & Scripts
  sh: 'shellscript', bash: 'shellscript', zsh: 'shellscript', ksh: 'shellscript', fish: 'shellscript',
  ps1: 'powershell', psm1: 'powershell', psd1: 'powershell',
  bat: 'bat', cmd: 'bat',

  // Data, Config & DevOps
  sql: 'sql',
  yaml: 'yaml', yml: 'yaml',
  xml: 'xml', xsd: 'xml', xsl: 'xml', svg: 'xml', plist: 'xml',
  md: 'markdown', markdown: 'markdown',
  tex: 'tex', latex: 'latex',
  tf: 'terraform', tfvars: 'terraform',
  env: 'dotenv',
  properties: 'properties', ini: 'properties', conf: 'properties', cfg: 'properties'
};

export const getSetiIcon = (fileName: string): { char: string; color: string } => {
  const lower = (fileName || '').toLowerCase();
  let id = names[lower];

  if (!id) {
    const parts = lower.split('.');
    if (parts.length > 2) {
      const doubleExt = parts.slice(-2).join('.');
      id = exts[doubleExt];
    }
    if (!id && parts.length > 1) {
      const ext = parts[parts.length - 1];
      id = exts[ext];
      if (!id) {
        const lang = langMap[ext];
        if (lang && langs[lang]) {
          id = langs[lang];
        }
      }
    }
  }

  // Exact filename special cases
  if (!id) {
    if (lower === '.gitignore' || lower === '.gitattributes' || lower === '.gitmodules') {
      id = '_git';
    } else if (lower === 'dockerfile' || lower.startsWith('dockerfile.')) {
      id = '_docker';
    } else if (lower === 'makefile' || lower.endsWith('.mk')) {
      id = '_makefile';
    } else if (lower.startsWith('.env')) {
      id = '_config';
    }
  }

  const def = (id && defs[id]) ? defs[id] : defs['_default'];
  const hex = (def?.fontCharacter || '\\E023').replace('\\', '');
  const char = String.fromCharCode(parseInt(hex, 16));
  return { char, color: def?.fontColor || '#d4d7d6' };
};

interface FileIconProps {
  fileName: string;
  size?: number;
  className?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({ fileName, size = 15, className = '' }) => {
  const [iconTheme, setIconTheme] = React.useState<string>(() => {
    try {
      const saved = localStorage.getItem('elix_settings');
      if (saved) return JSON.parse(saved).fileIconTheme || 'seti';
    } catch {}
    return 'seti';
  });

  React.useEffect(() => {
    const handler = () => {
      try {
        const saved = localStorage.getItem('elix_settings');
        if (saved) setIconTheme(JSON.parse(saved).fileIconTheme || 'seti');
      } catch {}
    };
    window.addEventListener('elix-settings-changed', handler);
    return () => window.removeEventListener('elix-settings-changed', handler);
  }, []);

  if (iconTheme === 'none') {
    return null;
  }

  const { char, color } = getSetiIcon(fileName);
  const displayColor = iconTheme === 'minimal' ? 'var(--ide-text-muted)' : color;

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{
        fontFamily: 'seti',
        fontSize: `${size}px`,
        color: displayColor,
        width: `${size}px`,
        height: `${size}px`,
        lineHeight: 1,
        fontStyle: 'normal',
        fontWeight: 'normal',
        textAlign: 'center'
      }}
      aria-hidden="true"
    >
      {char}
    </span>
  );
};
