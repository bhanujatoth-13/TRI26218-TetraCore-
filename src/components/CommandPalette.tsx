import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  FileCode, 
  Play, 
  Download, 
  Palette, 
  Layers, 
  ExternalLink,
  Sliders,
  X
} from 'lucide-react';
import { FileItem, ProjectTemplate } from '../types/ide';
import { getFileIcon } from '../utils/fileIcons';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileItem[];
  onSelectFile: (fileId: string) => void;
  onRunPreview: () => void;
  onExportZip: () => void;
  onSetTheme: (theme: string) => void;
  onLoadTemplate: (tpl: ProjectTemplate) => void;
  templates: ProjectTemplate[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  files,
  onSelectFile,
  onRunPreview,
  onExportZip,
  onSetTheme,
  onLoadTemplate,
  templates
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build items list
  const fileItems = files
    .filter(f => !f.isFolder && f.name.toLowerCase().includes(query.toLowerCase()))
    .map(f => ({
      id: `file-${f.id}`,
      type: 'file',
      title: f.name,
      subtitle: `Open file • ${f.path}`,
      icon: getFileIcon(f.name, false),
      action: () => {
        onSelectFile(f.id);
        onClose();
      }
    }));

  const commandItems = [
    {
      id: 'cmd-run',
      type: 'cmd',
      title: 'Run Preview & Rebuild Sandbox',
      subtitle: 'Execute live code bundle (Ctrl+S)',
      icon: <Play className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onRunPreview();
        onClose();
      }
    },
    {
      id: 'cmd-export',
      type: 'cmd',
      title: 'Export Project to ZIP Archive',
      subtitle: 'Download full workspace source code',
      icon: <Download className="w-4 h-4 text-sky-400" />,
      action: () => {
        onExportZip();
        onClose();
      }
    },
    {
      id: 'cmd-github',
      type: 'cmd',
      title: 'Open poluanjali/IDE on GitHub',
      subtitle: 'Visit public repository page',
      icon: <ExternalLink className="w-4 h-4 text-indigo-400" />,
      action: () => {
        window.open('https://github.com/poluanjali/IDE', '_blank');
        onClose();
      }
    },
    {
      id: 'cmd-theme-tokyo',
      type: 'cmd',
      title: 'Theme: Tokyo Night',
      subtitle: 'Switch editor palette to Tokyo Night',
      icon: <Palette className="w-4 h-4 text-violet-400" />,
      action: () => {
        onSetTheme('tokyo-night');
        onClose();
      }
    },
    {
      id: 'cmd-theme-onedark',
      type: 'cmd',
      title: 'Theme: One Dark Pro',
      subtitle: 'Switch editor palette to One Dark Pro',
      icon: <Palette className="w-4 h-4 text-amber-400" />,
      action: () => {
        onSetTheme('one-dark-pro');
        onClose();
      }
    },
    {
      id: 'cmd-theme-vsdark',
      type: 'cmd',
      title: 'Theme: VS Code Dark+',
      subtitle: 'Default Dark Theme',
      icon: <Palette className="w-4 h-4 text-blue-400" />,
      action: () => {
        onSetTheme('vs-dark');
        onClose();
      }
    }
  ].filter(cmd => cmd.title.toLowerCase().includes(query.toLowerCase()));

  const templateItems = templates
    .filter(t => t.name.toLowerCase().includes(query.toLowerCase()))
    .map(t => ({
      id: `tpl-${t.id}`,
      type: 'template',
      title: `Template: ${t.name}`,
      subtitle: t.description,
      icon: <Layers className="w-4 h-4 text-amber-400" />,
      action: () => {
        onLoadTemplate(t);
        onClose();
      }
    }));

  const allItems = [...fileItems, ...commandItems, ...templateItems];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (allItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allItems.length) % (allItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4">
      <div 
        className="w-full max-w-xl bg-[#1e1e24] border border-[#3f3f46] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="flex items-center px-4 py-3 border-b border-[#27272a] gap-2.5">
          <Search className="w-4 h-4 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or file name..."
            className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-500"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-1.5 space-y-1">
          {allItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No matching files or commands found.
            </div>
          ) : (
            allItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition text-xs ${
                    isSelected ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-[#27272a]'
                  }`}
                >
                  <div className="shrink-0">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{item.title}</div>
                    <div className={`text-[10px] truncate ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[#141416] border-t border-[#27272a] text-[10px] text-slate-400 flex items-center justify-between">
          <span>Navigate with <kbd className="bg-[#27272a] px-1 rounded">↑</kbd> <kbd className="bg-[#27272a] px-1 rounded">↓</kbd></span>
          <span>Select with <kbd className="bg-[#27272a] px-1 rounded">Enter</kbd></span>
          <span>Close with <kbd className="bg-[#27272a] px-1 rounded">Esc</kbd></span>
        </div>
      </div>
    </div>
  );
};
