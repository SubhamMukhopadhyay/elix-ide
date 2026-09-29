export interface LanguageMeta {
  id: string;
  displayName: string;
  extensions: string[];
  runner?: 'cpp-run' | 'c-run' | 'python' | 'java' | 'node' | 'rust-run' | 'go' | 'csharp-run' | 'browser' | 'powershell' | 'bat';
  executableExt?: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  {
    id: 'cpp',
    displayName: 'C++',
    extensions: ['.cpp', '.c++', '.cc', '.cxx', '.cp', '.hpp', '.hxx', '.h++', '.hh'],
    runner: 'cpp-run',
    executableExt: true
  },
  {
    id: 'c',
    displayName: 'C',
    extensions: ['.c', '.h'],
    runner: 'c-run',
    executableExt: true
  },
  {
    id: 'python',
    displayName: 'Python',
    extensions: ['.py', '.pyw', '.pyt'],
    runner: 'python',
    executableExt: true
  },
  {
    id: 'java',
    displayName: 'Java',
    extensions: ['.java'],
    runner: 'java',
    executableExt: true
  },
  {
    id: 'typescript',
    displayName: 'TypeScript',
    extensions: ['.ts', '.mts', '.cts'],
    runner: 'node',
    executableExt: true
  },
  {
    id: 'typescript',
    displayName: 'TypeScript React',
    extensions: ['.tsx'],
    runner: 'node',
    executableExt: true
  },
  {
    id: 'javascript',
    displayName: 'JavaScript',
    extensions: ['.js', '.mjs', '.cjs'],
    runner: 'node',
    executableExt: true
  },
  {
    id: 'javascript',
    displayName: 'JavaScript React',
    extensions: ['.jsx'],
    runner: 'node',
    executableExt: true
  },
  {
    id: 'rust',
    displayName: 'Rust',
    extensions: ['.rs'],
    runner: 'rust-run',
    executableExt: true
  },
  {
    id: 'go',
    displayName: 'Go',
    extensions: ['.go'],
    runner: 'go',
    executableExt: true
  },
  {
    id: 'csharp',
    displayName: 'C#',
    extensions: ['.cs'],
    runner: 'csharp-run',
    executableExt: true
  },
  {
    id: 'html',
    displayName: 'HTML',
    extensions: ['.html', '.htm', '.xhtml'],
    runner: 'browser',
    executableExt: true
  },
  {
    id: 'css',
    displayName: 'CSS',
    extensions: ['.css', '.scss', '.sass', '.less'],
    executableExt: false
  },
  {
    id: 'json',
    displayName: 'JSON',
    extensions: ['.json', '.jsonc'],
    executableExt: false
  },
  {
    id: 'markdown',
    displayName: 'Markdown',
    extensions: ['.md', '.markdown'],
    executableExt: false
  },
  {
    id: 'powershell',
    displayName: 'PowerShell',
    extensions: ['.ps1', '.psm1'],
    runner: 'powershell',
    executableExt: true
  },
  {
    id: 'bat',
    displayName: 'Batch',
    extensions: ['.bat', '.cmd'],
    runner: 'bat',
    executableExt: true
  },
  {
    id: 'shell',
    displayName: 'Shell Script',
    extensions: ['.sh', '.bash', '.zsh'],
    runner: 'node',
    executableExt: true
  },
  {
    id: 'sql',
    displayName: 'SQL',
    extensions: ['.sql'],
    executableExt: false
  },
  {
    id: 'yaml',
    displayName: 'YAML',
    extensions: ['.yaml', '.yml'],
    executableExt: false
  },
  {
    id: 'xml',
    displayName: 'XML',
    extensions: ['.xml', '.svg'],
    executableExt: false
  }
];

export function getLanguageMeta(filePath?: string): LanguageMeta | null {
  if (!filePath) return null;
  const lower = filePath.toLowerCase();
  for (const lang of SUPPORTED_LANGUAGES) {
    if (lang.extensions.some(ext => lower.endsWith(ext))) {
      return lang;
    }
  }
  return null;
}

export function getMonacoLanguage(filePath?: string): string {
  const meta = getLanguageMeta(filePath);
  return meta?.id || 'plaintext';
}

export function getLanguageDisplayName(filePath?: string): string {
  const meta = getLanguageMeta(filePath);
  return meta?.displayName || 'Plain Text';
}
