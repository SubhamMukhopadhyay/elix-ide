import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, CaseSensitive, WholeWord, Regex, RefreshCw, FileCode } from 'lucide-react';
import { ProjectMetadata } from '../../types';

interface SearchResult {
  filePath: string;
  fileName: string;
  line: number;
  preview: string;
}

interface SearchSidebarProps {
  activeProject: ProjectMetadata | null;
  onOpenFile: (path: string, name: string) => void;
}

export const SearchSidebar: React.FC<SearchSidebarProps> = ({ activeProject, onOpenFile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [matchWord, setMatchWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim() || !activeProject?.path || !window.elix) return;

    setIsSearching(true);
    setResults([]);

    try {
      const found: SearchResult[] = [];
      const searchDir = async (dirPath: string) => {
        const items = await window.elix.readDir(dirPath);
        if (!items) return;

        for (const item of items) {
          if (item.isDirectory) {
            if (!item.name.startsWith('.') && item.name !== 'node_modules' && item.name !== 'dist' && item.name !== 'release') {
              await searchDir(item.path);
            }
          } else {
            const content = await window.elix.readFile(item.path);
            if (typeof content === 'string') {
              const lines = content.split('\n');
              lines.forEach((line, idx) => {
                let matches = false;
                if (matchCase) {
                  matches = line.includes(searchTerm);
                } else {
                  matches = line.toLowerCase().includes(searchTerm.toLowerCase());
                }
                if (matches) {
                  found.push({
                    filePath: item.path,
                    fileName: item.name,
                    line: idx + 1,
                    preview: line.trim()
                  });
                }
              });
            }
          }
        }
      };

      await searchDir(activeProject.path);
      setResults(found);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Group results by file
  const groupedResults = results.reduce<Record<string, SearchResult[]>>((acc, res) => {
    if (!acc[res.filePath]) acc[res.filePath] = [];
    acc[res.filePath].push(res);
    return acc;
  }, {});

  return (
    <div className="w-full bg-[var(--ide-sidebar-bg)] border-r border-[var(--ide-border)] flex flex-col h-full select-none text-[var(--ide-text)] font-sans">
      <div className="p-3 border-b border-[var(--ide-border)] flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ide-text-muted)]">Search</span>
        <button
          onClick={() => handleSearch()}
          className="p-1 hover:bg-[var(--ide-hover-bg)] rounded text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]"
          title="Refresh Search"
        >
          <RefreshCw size={13} className={isSearching ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="p-3 space-y-2 border-b border-[var(--ide-border)]">
        {/* Search input with toggles */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search"
            className="w-full bg-[var(--ide-input-bg)] text-[var(--ide-text)] text-xs px-2.5 py-1.5 rounded pr-16 focus:outline-none focus:ring-1 focus:ring-[#007acc] placeholder-[var(--ide-text-muted)] border border-[var(--ide-border)]"
          />
          <div className="absolute right-1 top-1 flex items-center gap-0.5">
            <button
              onClick={() => setMatchCase(!matchCase)}
              className={`p-0.5 rounded text-[10px] ${matchCase ? 'bg-[#007acc] text-white' : 'text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]'}`}
              title="Match Case (Alt+C)"
            >
              <CaseSensitive size={13} />
            </button>
            <button
              onClick={() => setMatchWord(!matchWord)}
              className={`p-0.5 rounded text-[10px] ${matchWord ? 'bg-[#007acc] text-white' : 'text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]'}`}
              title="Match Whole Word (Alt+W)"
            >
              <WholeWord size={13} />
            </button>
            <button
              onClick={() => setUseRegex(!useRegex)}
              className={`p-0.5 rounded text-[10px] ${useRegex ? 'bg-[#007acc] text-white' : 'text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]'}`}
              title="Use Regular Expression (Alt+R)"
            >
              <Regex size={13} />
            </button>
          </div>
        </div>

        {/* Toggle Replace */}
        <button
          onClick={() => setShowReplace(!showReplace)}
          className="text-[11px] text-[var(--ide-text-muted)] hover:text-[var(--ide-text)] flex items-center gap-1"
        >
          {showReplace ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          <span>Toggle Replace</span>
        </button>

        {showReplace && (
          <input
            type="text"
            value={replaceTerm}
            onChange={e => setReplaceTerm(e.target.value)}
            placeholder="Replace"
            className="w-full bg-[var(--ide-input-bg)] text-[var(--ide-text)] text-xs px-2.5 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-[#007acc] placeholder-[var(--ide-text-muted)] border border-[var(--ide-border)]"
          />
        )}
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isSearching && (
          <div className="text-xs text-[var(--ide-text-muted)] text-center py-4">Searching files...</div>
        )}

        {!isSearching && searchTerm && results.length === 0 && (
          <div className="text-xs text-[var(--ide-text-muted)] text-center py-4">No results found.</div>
        )}

        {!isSearching && Object.keys(groupedResults).length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] text-[var(--ide-text-muted)] px-1">
              {results.length} result{results.length !== 1 ? 's' : ''} in {Object.keys(groupedResults).length} file{Object.keys(groupedResults).length !== 1 ? 's' : ''}
            </div>

            {Object.entries(groupedResults).map(([filePath, fileMatches]) => {
              const fileName = fileMatches[0].fileName;
              return (
                <div key={filePath} className="border-b border-[var(--ide-border)] pb-1">
                  <div
                    onClick={() => onOpenFile(filePath, fileName)}
                    className="flex items-center gap-1.5 px-1 py-1 hover:bg-[var(--ide-hover-bg)] rounded cursor-pointer text-xs text-[var(--ide-text)]"
                  >
                    <FileCode size={13} className="text-[#007acc] shrink-0" />
                    <span className="font-semibold truncate">{fileName}</span>
                    <span className="text-[10px] text-[var(--ide-text-muted)] ml-auto shrink-0">{fileMatches.length}</span>
                  </div>

                  <div className="pl-4 space-y-0.5 mt-0.5">
                    {fileMatches.map((m, idx) => (
                      <div
                        key={idx}
                        onClick={() => onOpenFile(filePath, fileName)}
                        className="px-1 py-0.5 hover:bg-[var(--ide-hover-bg)] rounded cursor-pointer text-[11px] text-[var(--ide-text-muted)] hover:text-[var(--ide-text)] truncate flex items-baseline gap-2"
                      >
                        <span className="text-[#007acc] text-[10px] shrink-0">{m.line}:</span>
                        <span className="truncate">{m.preview}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
