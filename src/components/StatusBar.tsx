import React from 'react';
import { 
  GitBranch, 
  Check, 
  AlertTriangle, 
  XCircle, 
  Code, 
  Bell, 
  Sliders
} from 'lucide-react';
import { FileItem, EditorSettings } from '../types/ide';

interface StatusBarProps {
  activeFile: FileItem | null;
  settings: EditorSettings;
  errorCount: number;
  warnCount: number;
  onOpenSettings: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  activeFile,
  settings,
  errorCount,
  warnCount,
  onOpenSettings
}) => {
  return (
    <footer className="h-6 bg-[#007acc] text-white flex items-center justify-between px-2 text-[11px] font-mono select-none z-20 shrink-0">
      {/* Left items */}
      <div className="flex items-center gap-3">
        {/* Branch */}
        <a
          href="https://github.com/poluanjali/IDE"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 hover:bg-black/20 px-1.5 py-0.5 rounded transition"
          title="Git Branch: main (poluanjali/IDE)"
        >
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </a>

        {/* Sync status */}
        <div className="flex items-center gap-1 hover:bg-black/20 px-1.5 py-0.5 rounded transition">
          <Check className="w-3 h-3 text-emerald-200" />
          <span>poluanjali/IDE</span>
        </div>

        {/* Error / Warning count */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 hover:bg-black/20 px-1 py-0.5 rounded">
            <XCircle className="w-3 h-3 text-rose-200" />
            <span>{errorCount}</span>
          </div>
          <div className="flex items-center gap-0.5 hover:bg-black/20 px-1 py-0.5 rounded">
            <AlertTriangle className="w-3 h-3 text-amber-200" />
            <span>{warnCount}</span>
          </div>
        </div>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-3">
        {activeFile && (
          <>
            <span className="hidden sm:inline hover:bg-black/20 px-1.5 py-0.5 rounded">
              Spaces: {settings.tabSize}
            </span>
            <span className="hidden sm:inline hover:bg-black/20 px-1.5 py-0.5 rounded">
              UTF-8
            </span>
            <span className="hover:bg-black/20 px-1.5 py-0.5 rounded uppercase font-semibold">
              {activeFile.language}
            </span>
          </>
        )}

        <button
          onClick={onOpenSettings}
          className="hover:bg-black/20 px-1.5 py-0.5 rounded flex items-center gap-1 transition"
          title="IDE Preferences"
        >
          <Sliders className="w-3 h-3" />
          <span className="hidden md:inline">{settings.theme}</span>
        </button>

        <div className="hover:bg-black/20 px-1 py-0.5 rounded">
          <Bell className="w-3 h-3" />
        </div>
      </div>
    </footer>
  );
};
