import React, { useState } from 'react';
import { 
  Files, 
  Search, 
  GitBranch, 
  Layers, 
  Settings, 
  Plus, 
  FolderPlus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  ChevronRight, 
  ChevronDown, 
  Upload, 
  ExternalLink,
  GitCommit,
  ArrowUpCircle,
  RefreshCw
} from 'lucide-react';
import { FileItem, EditorSettings, ProjectTemplate } from '../types/ide';
import { getFileIcon, detectLanguage } from '../utils/fileIcons';
import { PROJECT_TEMPLATES } from '../constants/templates';

interface SidebarProps {
  files: FileItem[];
  activeFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (name: string, isFolder?: boolean) => void;
  onDeleteFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  settings: EditorSettings;
  onUpdateSettings: (settings: Partial<EditorSettings>) => void;
  onLoadTemplate: (template: ProjectTemplate) => void;
  activeTemplateId: string;
}

type ActivityTab = 'explorer' | 'search' | 'git' | 'templates' | 'settings';

export const Sidebar: React.FC<SidebarProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  settings,
  onUpdateSettings,
  onLoadTemplate,
  activeTemplateId
}) => {
  const [activeTab, setActiveTab] = useState<ActivityTab>('explorer');
  const [searchQuery, setSearchQuery] = useState('');
  
  // File creation states
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  
  // File renaming states
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Git state
  const [commitMessage, setCommitMessage] = useState('Update project structure');
  const [gitStatus, setGitStatus] = useState<string | null>(null);

  const handleStartCreate = (isFolder: boolean) => {
    setIsCreatingFolder(isFolder);
    setIsCreatingFile(!isFolder);
    setNewFileName('');
  };

  const handleConfirmCreate = () => {
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim(), isCreatingFolder);
    }
    setIsCreatingFile(false);
    setIsCreatingFolder(false);
    setNewFileName('');
  };

  const handleStartRename = (file: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(file.id);
    setRenameValue(file.name);
  };

  const handleConfirmRename = (fileId: string) => {
    if (renameValue.trim()) {
      onRenameFile(fileId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const handleGitCommit = () => {
    if (!commitMessage.trim()) return;
    setGitStatus(`Committed & Pushed to poluanjali/IDE (main): "${commitMessage}"`);
    setTimeout(() => setGitStatus(null), 4000);
  };

  // Filter search results
  const searchResults = searchQuery.trim()
    ? files.filter(f => !f.isFolder && (f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.content.toLowerCase().includes(searchQuery.toLowerCase())))
    : [];

  return (
    <div className="flex h-full border-r border-[#27272a] bg-[#18181b] select-none text-slate-300">
      {/* 1. Left Vertical Activity Bar */}
      <div className="w-12 bg-[#121214] border-r border-[#27272a] flex flex-col items-center py-3 gap-2 shrink-0">
        <button
          onClick={() => setActiveTab(activeTab === 'explorer' ? 'explorer' : 'explorer')}
          className={`p-2.5 rounded-lg transition relative ${
            activeTab === 'explorer' 
              ? 'text-white bg-[#27272a]' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f1f23]'
          }`}
          title="Explorer (Files)"
        >
          <Files className="w-5 h-5" />
          {activeTab === 'explorer' && (
            <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-indigo-500 rounded-r" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`p-2.5 rounded-lg transition relative ${
            activeTab === 'search' 
              ? 'text-white bg-[#27272a]' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f1f23]'
          }`}
          title="Search in files"
        >
          <Search className="w-5 h-5" />
          {activeTab === 'search' && (
            <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-indigo-500 rounded-r" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('git')}
          className={`p-2.5 rounded-lg transition relative ${
            activeTab === 'git' 
              ? 'text-white bg-[#27272a]' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f1f23]'
          }`}
          title="Source Control (Git - poluanjali/IDE)"
        >
          <GitBranch className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-[#121214]"></span>
          {activeTab === 'git' && (
            <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-indigo-500 rounded-r" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`p-2.5 rounded-lg transition relative ${
            activeTab === 'templates' 
              ? 'text-white bg-[#27272a]' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f1f23]'
          }`}
          title="Project Templates"
        >
          <Layers className="w-5 h-5" />
          {activeTab === 'templates' && (
            <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-indigo-500 rounded-r" />
          )}
        </button>

        <div className="mt-auto flex flex-col items-center gap-2">
          <a
            href="https://github.com/poluanjali/IDE"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 text-slate-400 hover:text-white hover:bg-[#1f1f23] rounded-lg transition"
            title="Open poluanjali/IDE on GitHub"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={() => setActiveTab('settings')}
            className={`p-2.5 rounded-lg transition relative ${
              activeTab === 'settings' 
                ? 'text-white bg-[#27272a]' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f1f23]'
            }`}
            title="IDE Settings"
          >
            <Settings className="w-5 h-5" />
            {activeTab === 'settings' && (
              <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-indigo-500 rounded-r" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Collapsible Side Panel */}
      <div className="w-64 flex flex-col h-full bg-[#18181b]">
        {/* Explorer Tab */}
        {activeTab === 'explorer' && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-3 py-2.5 flex items-center justify-between border-b border-[#27272a] text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span className="truncate">poluanjali / IDE</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleStartCreate(false)}
                  className="p-1 hover:bg-[#27272a] rounded text-slate-400 hover:text-white transition"
                  title="New File"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleStartCreate(true)}
                  className="p-1 hover:bg-[#27272a] rounded text-slate-400 hover:text-white transition"
                  title="New Folder"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto py-1 px-1.5 space-y-0.5">
              {/* Add Input */}
              {(isCreatingFile || isCreatingFolder) && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-[#27272a] rounded border border-indigo-500/50">
                  {getFileIcon(newFileName, isCreatingFolder)}
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirmCreate();
                      if (e.key === 'Escape') {
                        setIsCreatingFile(false);
                        setIsCreatingFolder(false);
                      }
                    }}
                    placeholder={isCreatingFolder ? "folder name..." : "file.ext..."}
                    autoFocus
                    className="w-full bg-transparent text-xs text-white focus:outline-none"
                  />
                  <button onClick={handleConfirmCreate} className="text-emerald-400 hover:text-emerald-300">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => { setIsCreatingFile(false); setIsCreatingFolder(false); }}
                    className="text-slate-400 hover:text-rose-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {files.map(file => {
                const isActive = file.id === activeFileId;
                const isRenaming = renamingId === file.id;

                return (
                  <div
                    key={file.id}
                    onClick={() => !file.isFolder && onSelectFile(file.id)}
                    className={`group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer text-xs transition ${
                      isActive 
                        ? 'bg-[#27272a] text-white font-medium border-l-2 border-indigo-500' 
                        : 'hover:bg-[#1f1f23] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getFileIcon(file.name, file.isFolder, file.isOpen)}
                      
                      {isRenaming ? (
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleConfirmRename(file.id);
                            if (e.key === 'Escape') setRenamingId(null);
                          }}
                          onBlur={() => handleConfirmRename(file.id)}
                          autoFocus
                          className="bg-[#121214] text-white text-xs px-1 rounded border border-indigo-500 focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="truncate">{file.name}</span>
                      )}
                    </div>

                    {/* Actions on hover */}
                    <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => handleStartRename(file, e)}
                        className="p-1 hover:text-white text-slate-400 transition"
                        title="Rename"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteFile(file.id);
                        }}
                        className="p-1 hover:text-rose-400 text-slate-400 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Template Switcher Footer */}
            <div className="p-3 border-t border-[#27272a] bg-[#121214]/60">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                <span>Active Template:</span>
                <span className="font-semibold text-indigo-400 truncate max-w-[120px]">
                  {PROJECT_TEMPLATES.find(t => t.id === activeTemplateId)?.name || 'Custom'}
                </span>
              </div>
              <button
                onClick={() => setActiveTab('templates')}
                className="w-full py-1.5 px-2 bg-[#27272a] hover:bg-[#3f3f46] rounded text-xs text-slate-200 font-medium transition flex items-center justify-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Change Template
              </button>
            </div>
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="flex flex-col h-full p-3 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Search Project
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Find in files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121214] border border-[#27272a] rounded-md pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
              <div className="text-[11px] text-slate-400">
                {searchResults.length} {searchResults.length === 1 ? 'file' : 'files'} matching
              </div>
              {searchResults.map(f => (
                <div
                  key={f.id}
                  onClick={() => onSelectFile(f.id)}
                  className="p-2 rounded-md bg-[#27272a]/50 hover:bg-[#27272a] cursor-pointer text-xs space-y-1 transition"
                >
                  <div className="flex items-center gap-1.5 font-medium text-indigo-400">
                    {getFileIcon(f.name, false)}
                    <span>{f.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-2 font-mono bg-[#121214] p-1 rounded">
                    {f.content.slice(0, 100)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source Control Tab */}
        {activeTab === 'git' && (
          <div className="flex flex-col h-full p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Source Control</span>
              <a 
                href="https://github.com/poluanjali/IDE" 
                target="_blank" 
                rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
              >
                poluanjali/IDE <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-[#121214] p-2.5 rounded-lg border border-[#27272a] space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                <span>Branch: <b className="text-white">main</b></span>
              </div>
              <div className="text-[11px] text-slate-400">
                Remote: https://github.com/poluanjali/IDE.git
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium">Commit Message</label>
              <textarea
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Message (Ctrl+Enter to commit)"
                rows={3}
                className="w-full bg-[#121214] border border-[#27272a] rounded-md p-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
              <button
                onClick={handleGitCommit}
                className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-semibold text-white transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30"
              >
                <GitCommit className="w-3.5 h-3.5" />
                Commit &amp; Push to main
              </button>
            </div>

            {gitStatus && (
              <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{gitStatus}</span>
              </div>
            )}

            <div className="pt-2 text-xs text-slate-400">
              <div className="font-semibold text-slate-300 mb-1">Staged Changes:</div>
              <ul className="space-y-1">
                {files.map(f => (
                  <li key={f.id} className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate">{f.name}</span>
                    <span className="text-emerald-400 font-mono text-[10px]">M</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="flex flex-col h-full p-3 space-y-3 overflow-y-auto">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Starter Templates
            </div>
            <div className="space-y-2.5">
              {PROJECT_TEMPLATES.map(tpl => {
                const isCurrent = tpl.id === activeTemplateId;
                return (
                  <div
                    key={tpl.id}
                    className={`p-3 rounded-lg border transition ${
                      isCurrent 
                        ? 'bg-indigo-950/40 border-indigo-500/60' 
                        : 'bg-[#1f1f23]/60 border-[#27272a] hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white">{tpl.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-400 font-medium">
                        {tpl.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {tpl.description}
                    </p>
                    <button
                      onClick={() => onLoadTemplate(tpl)}
                      className={`mt-2.5 w-full py-1 rounded text-xs font-medium transition ${
                        isCurrent 
                          ? 'bg-emerald-600 text-white cursor-default' 
                          : 'bg-[#27272a] hover:bg-indigo-600 text-slate-200 hover:text-white'
                      }`}
                    >
                      {isCurrent ? 'Active Project' : 'Load Project'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="flex flex-col h-full p-3 space-y-4 overflow-y-auto">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Editor Preferences
            </div>

            {/* Font Size */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Font Size</span>
                <span className="font-mono text-indigo-400">{settings.fontSize}px</span>
              </div>
              <input
                type="range"
                min={11}
                max={22}
                value={settings.fontSize}
                onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Tab Size */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300">Tab Indentation</label>
              <div className="flex gap-2">
                {[2, 4].map(size => (
                  <button
                    key={size}
                    onClick={() => onUpdateSettings({ tabSize: size })}
                    className={`flex-1 py-1 rounded text-xs font-medium transition border ${
                      settings.tabSize === size
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-[#121214] text-slate-400 border-[#27272a] hover:text-white'
                    }`}
                  >
                    {size} Spaces
                  </button>
                ))}
              </div>
            </div>

            {/* Minimap Toggle */}
            <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-[#27272a]">
              <span>Editor Minimap</span>
              <input
                type="checkbox"
                checked={settings.minimap}
                onChange={(e) => onUpdateSettings({ minimap: e.target.checked })}
                className="accent-indigo-500 w-4 h-4 cursor-pointer"
              />
            </div>

            {/* Word wrap Toggle */}
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Word Wrap</span>
              <input
                type="checkbox"
                checked={settings.wordWrap === 'on'}
                onChange={(e) => onUpdateSettings({ wordWrap: e.target.checked ? 'on' : 'off' })}
                className="accent-indigo-500 w-4 h-4 cursor-pointer"
              />
            </div>

            {/* Auto-run Toggle */}
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Auto-Run On Edit</span>
              <input
                type="checkbox"
                checked={settings.autoRun}
                onChange={(e) => onUpdateSettings({ autoRun: e.target.checked })}
                className="accent-indigo-500 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
