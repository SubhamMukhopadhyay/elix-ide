import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Palette, FolderTree, Sparkles, Check, Search, X } from 'lucide-react';
import { applyThemeGlobally } from '../../utils/themeHelper';
import { updateSetting, getStoredSettings } from '../../utils/settingsHelper';

export type ThemePickerMode = 'color' | 'file-icon' | 'product-icon';

interface ThemePickerModalProps {
  mode: ThemePickerMode;
  onClose: () => void;
  currentTheme: string;
  onSelectTheme: (theme: string) => void;
  onSelectFileIconTheme?: (theme: string) => void;
  onSelectProductIconTheme?: (theme: string) => void;
}

interface PickerOption {
  id: string;
  label: string;
  description: string;
  badge?: string;
}

const COLOR_THEMES: PickerOption[] = [
  { id: 'Dark Modern', label: 'Dark Modern', description: 'Visual Studio Code Default Dark', badge: 'Dark' },
  { id: 'Dark+ (default dark)', label: 'Dark+ (default dark)', description: 'Classic Visual Studio Dark', badge: 'Dark' },
  { id: 'Light Modern', label: 'Light Modern', description: 'Visual Studio Code Default Light', badge: 'Light' },
  { id: 'Light+ (default light)', label: 'Light+ (default light)', description: 'Classic Visual Studio Light', badge: 'Light' },
  { id: 'AMOLED (Pure Black)', label: 'AMOLED (Pure Black)', description: '100% Pure Black for OLED Displays', badge: 'OLED' },
  { id: 'Dark High Contrast', label: 'Dark High Contrast', description: 'High accessibility contrast dark theme', badge: 'High Contrast' },
  { id: 'Light High Contrast', label: 'Light High Contrast', description: 'High accessibility contrast light theme', badge: 'High Contrast' },
  { id: 'Monokai', label: 'Monokai', description: 'Iconic vibrant syntax colors on dark charcoal', badge: 'Dark' },
  { id: 'Solarized Dark', label: 'Solarized Dark', description: 'Precision colors by Ethan Schoonover', badge: 'Dark' },
  { id: 'Solarized Light', label: 'Solarized Light', description: 'Light palette optimized for reading', badge: 'Light' },
  { id: 'Quiet Light', label: 'Quiet Light', description: 'Soft pastel colors for long coding sessions', badge: 'Light' }
];

const FILE_ICON_THEMES: PickerOption[] = [
  { id: 'seti', label: 'Seti (Visual Studio Code)', description: 'Standard built-in file icon set with distinctive colors', badge: 'Default' },
  { id: 'material', label: 'Material Icon Theme', description: 'Vibrant modern icons for web, backend and systems', badge: 'Popular' },
  { id: 'minimal', label: 'Minimal', description: 'Subtle monochrome line icons', badge: 'Clean' },
  { id: 'none', label: 'None', description: 'Disable all file and folder icons in explorer', badge: 'Off' }
];

const PRODUCT_ICON_THEMES: PickerOption[] = [
  { id: 'default', label: 'Default (Visual Studio Code)', description: 'Official VS Code codicon set for IDE navigation and tools', badge: 'Default' },
  { id: 'fluent', label: 'Fluent Icons', description: 'Modern Microsoft Fluent design iconography', badge: 'Modern' },
  { id: 'codicons', label: 'Codicons Modern', description: 'High precision glyphs for developer tools', badge: 'Developer' },
  { id: 'minimalist', label: 'Minimalist', description: 'Clean geometric icons with minimal visual clutter', badge: 'Clean' }
];

export const ThemePickerModal: React.FC<ThemePickerModalProps> = ({
  mode,
  onClose,
  currentTheme,
  onSelectTheme,
  onSelectFileIconTheme,
  onSelectProductIconTheme
}) => {
  const [search, setSearch] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const initialThemeRef = useRef<string>(currentTheme);

  const initialFileIconTheme = getStoredSettings().fileIconTheme || 'seti';
  const initialProductIconTheme = getStoredSettings().productIconTheme || 'default';

  const [activeFileIconTheme, setActiveFileIconTheme] = useState<string>(initialFileIconTheme);
  const [activeProductIconTheme, setActiveProductIconTheme] = useState<string>(initialProductIconTheme);

  const items = useMemo(() => {
    let source: PickerOption[] = [];
    if (mode === 'color') source = COLOR_THEMES;
    else if (mode === 'file-icon') source = FILE_ICON_THEMES;
    else source = PRODUCT_ICON_THEMES;

    const q = search.trim().toLowerCase();
    if (!q) return source;
    return source.filter(i => 
      i.label.toLowerCase().includes(q) || 
      i.description.toLowerCase().includes(q) ||
      (i.badge && i.badge.toLowerCase().includes(q))
    );
  }, [mode, search]);

  useEffect(() => {
    inputRef.current?.focus();
    // Set selected index to current active item
    if (mode === 'color') {
      const idx = COLOR_THEMES.findIndex(t => t.id.toLowerCase() === currentTheme.toLowerCase());
      if (idx !== -1) setSelectedIndex(idx);
    } else if (mode === 'file-icon') {
      const idx = FILE_ICON_THEMES.findIndex(t => t.id === activeFileIconTheme);
      if (idx !== -1) setSelectedIndex(idx);
    } else {
      const idx = PRODUCT_ICON_THEMES.findIndex(t => t.id === activeProductIconTheme);
      if (idx !== -1) setSelectedIndex(idx);
    }
  }, [mode]);

  // Preview on hover / arrow key in color mode
  const previewTheme = (themeId: string) => {
    if (mode === 'color') {
      applyThemeGlobally(themeId);
    }
  };

  const commitSelection = (item: PickerOption) => {
    if (mode === 'color') {
      onSelectTheme(item.id);
      applyThemeGlobally(item.id);
      updateSetting('theme', item.id);
    } else if (mode === 'file-icon') {
      setActiveFileIconTheme(item.id);
      updateSetting('fileIconTheme' as any, item.id);
      document.documentElement.setAttribute('data-file-icons', item.id);
      window.dispatchEvent(new CustomEvent('elix-settings-changed', { detail: { fileIconTheme: item.id } }));
      onSelectFileIconTheme?.(item.id);
    } else if (mode === 'product-icon') {
      setActiveProductIconTheme(item.id);
      updateSetting('productIconTheme' as any, item.id);
      document.documentElement.setAttribute('data-product-icons', item.id);
      window.dispatchEvent(new CustomEvent('elix-settings-changed', { detail: { productIconTheme: item.id } }));
      onSelectProductIconTheme?.(item.id);
    }
    onClose();
  };

  const handleCancel = () => {
    // Restore initial theme if cancelled
    if (mode === 'color') {
      applyThemeGlobally(initialThemeRef.current);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (selectedIndex + 1) % (items.length || 1);
      setSelectedIndex(next);
      if (items[next] && mode === 'color') previewTheme(items[next].id);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (selectedIndex - 1 + items.length) % (items.length || 1);
      setSelectedIndex(prev);
      if (items[prev] && mode === 'color') previewTheme(items[prev].id);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) commitSelection(items[selectedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const getPlaceholder = () => {
    if (mode === 'color') return 'Select Color Theme (up/down keys to preview, Enter to select)';
    if (mode === 'file-icon') return 'Select File Icon Theme (Enter to select)';
    return 'Select Product Icon Theme (Enter to select)';
  };

  const getTitle = () => {
    if (mode === 'color') return 'Preferences: Color Theme';
    if (mode === 'file-icon') return 'Preferences: File Icon Theme';
    return 'Preferences: Product Icon Theme';
  };

  const isCurrentActive = (item: PickerOption) => {
    if (mode === 'color') return item.id.toLowerCase() === currentTheme.toLowerCase();
    if (mode === 'file-icon') return item.id === activeFileIconTheme;
    return item.id === activeProductIconTheme;
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-center pt-10 px-4 animate-in fade-in duration-100 font-sans select-none"
      onClick={handleCancel}
    >
      <div 
        className="w-[580px] max-w-[95vw] h-fit max-h-[460px] bg-[var(--ide-sidebar-bg)] border border-[var(--ide-border)] rounded-md shadow-2xl flex flex-col text-[var(--ide-text)] text-xs overflow-hidden"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Top Header & Search Bar */}
        <div className="p-2 border-b border-[var(--ide-border)] bg-[var(--ide-panel-bg)]">
          <div className="px-2 py-1 flex items-center justify-between text-[11px] text-[var(--ide-text-muted)]">
            <span className="font-semibold text-[var(--ide-text)]">{getTitle()}</span>
            <span className="text-[10px]">Esc to Cancel</span>
          </div>
          <div className="relative mt-1">
            <Search size={14} className="absolute left-3 top-2.5 text-[var(--ide-text-muted)]" />
            <input 
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder={getPlaceholder()}
              className="w-full bg-[var(--ide-input-bg)] text-[var(--ide-text)] pl-9 pr-8 py-1.5 rounded border border-[var(--ide-input-border)] focus:border-[#007acc] outline-none text-xs"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Options List */}
        <div ref={listRef} className="overflow-y-auto max-h-[360px] p-1.5 space-y-0.5">
          {items.map((item, index) => {
            const isSelected = index === selectedIndex;
            const isActive = isCurrentActive(item);

            return (
              <div
                key={item.id}
                onClick={() => commitSelection(item)}
                onMouseEnter={() => {
                  setSelectedIndex(index);
                  if (mode === 'color') previewTheme(item.id);
                }}
                className={`px-3 py-2 rounded flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected 
                    ? 'bg-[#007acc] text-white' 
                    : 'text-[var(--ide-text)] hover:bg-[var(--ide-hover-bg)]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {mode === 'color' && (
                    <Palette size={14} className={isSelected ? 'text-white' : 'text-[#007acc]'} />
                  )}
                  {mode === 'file-icon' && (
                    <FolderTree size={14} className={isSelected ? 'text-white' : 'text-amber-400'} />
                  )}
                  {mode === 'product-icon' && (
                    <Sparkles size={14} className={isSelected ? 'text-white' : 'text-violet-400'} />
                  )}
                  <div className="truncate">
                    <span className="font-medium text-xs mr-2">{item.label}</span>
                    <span className={`text-[11px] truncate ${isSelected ? 'text-white/80' : 'text-[var(--ide-text-muted)]'}`}>
                      {item.description}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isSelected 
                        ? 'bg-white/20 text-white' 
                        : 'bg-[var(--ide-hover-bg)] text-[var(--ide-text-muted)] border border-[var(--ide-border)]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <Check size={14} className={isSelected ? 'text-white' : 'text-[#007acc]'} />
                  )}
                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="py-8 text-center text-[var(--ide-text-muted)] text-xs">
              No matching themes found for "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
