import React from 'react';
import { 
  Play, 
  RotateCw, 
  Download, 
  FolderGit2, 
  ExternalLink, 
  Search, 
  Sparkles,
  Layers,
  Palette,
  Terminal,
  CheckCircle2
} from 'lucide-react';
import { EditorSettings } from '../types/ide';

interface HeaderBarProps {
  onRun: () => void;
  isRunning: boolean;
  onExportZip: () => void;
  onOpenCommandPalette: () => void;
  onSelectTemplateModal: () => void;
  settings: EditorSettings;
  onUpdateSettings: (settings: Partial<EditorSettings>) => void;
  activeFileName?: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onRun,
  isRunning,
  onExportZip,
  onOpenCommandPalette,
  onSelectTemplateModal,
  settings,
  onUpdateSettings,
  activeFileName
}) => {
  return (
    <header className="h-11 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between px-3 text-xs select-none z-30">
      {/* Left: Brand & GitHub Repo Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-xs">&lt;/&gt;</span>
          </div>
          <span className="font-semibold text-slate-200 tracking-tight text-sm hidden sm:inline">
            Cloud IDE
          </span>
        </div>

        {/* GitHub Repository Link Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#27272a]/70 hover:bg-[#27272a] border border-[#3f3f46]/60 transition group">
          <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
          <a 
            href="https://github.com/poluanjali/IDE" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-slate-300 group-hover:text-white font-medium"
            title="Open poluanjali/IDE on GitHub"
          >
            <span>poluanjali/IDE</span>
            <span className="text-[10px] text-slate-400 px-1 py-0.2 rounded bg-[#18181b] border border-[#3f3f46]">main</span>
            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
          </a>
        </div>

        {/* Quick status */}
        <div className="hidden lg:flex items-center gap-1 text-[11px] text-emerald-400">
          <CheckCircle2 className="w-3 h-3" />
          <span>Synced</span>
        </div>
      </div>

      {/* Middle: Command search bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1 bg-[#27272a]/50 hover:bg-[#27272a] border border-[#3f3f46]/50 rounded-md text-slate-400 hover:text-slate-200 transition text-xs shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Search files or commands ({activeFileName || 'index.html'})...</span>
          </div>
          <kbd className="text-[10px] bg-[#18181b] px-1.5 py-0.5 rounded border border-[#3f3f46] text-slate-400 font-mono">
            Ctrl + P
          </kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Template Switcher */}
        <button
          onClick={onSelectTemplateModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#27272a] hover:bg-[#3f3f46] text-slate-200 transition font-medium text-xs border border-[#3f3f46]"
          title="Switch Project Template"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Templates</span>
        </button>

        {/* Run / Preview Button */}
        <button
          onClick={onRun}
          className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium text-xs shadow-md transition ${
            isRunning 
              ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse' 
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
          }`}
          title="Run project & refresh preview (Ctrl + S)"
        >
          {isRunning ? (
            <RotateCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>{isRunning ? 'Running...' : 'Run Preview'}</span>
        </button>

        {/* Export ZIP */}
        <button
          onClick={onExportZip}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white transition text-xs border border-[#3f3f46]"
          title="Download Project as ZIP Archive"
        >
          <Download className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Export ZIP</span>
        </button>

        {/* Theme Picker */}
        <div className="relative group">
          <button 
            className="p-1.5 rounded bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 border border-[#3f3f46]"
            title="Change Editor Theme"
          >
            <Palette className="w-3.5 h-3.5 text-violet-400" />
          </button>
          
          <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#1f1f23] border border-[#3f3f46] rounded-md shadow-xl py-1 hidden group-hover:block z-50">
            <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Editor Theme
            </div>
            {[
              { id: 'vs-dark', label: 'VS Code Dark+' },
              { id: 'tokyo-night', label: 'Tokyo Night' },
              { id: 'one-dark-pro', label: 'One Dark Pro' },
              { id: 'light', label: 'GitHub Light' }
            ].map(th => (
              <button
                key={th.id}
                onClick={() => onUpdateSettings({ theme: th.id })}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#27272a] ${
                  settings.theme === th.id ? 'text-indigo-400 font-semibold' : 'text-slate-300'
                }`}
              >
                <span>{th.label}</span>
                {settings.theme === th.id && <span>✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
