import React, { useRef } from 'react';
import Editor, { Monaco, OnMount } from '@monaco-editor/react';
import { 
  X, 
  Plus, 
  Copy, 
  Check, 
  AlignLeft, 
  Code, 
  Sparkles,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { FileItem, TabItem, EditorSettings } from '../types/ide';
import { getFileIcon } from '../utils/fileIcons';

interface EditorAreaProps {
  tabs: TabItem[];
  activeTabId: string | null;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string, e: React.MouseEvent) => void;
  activeFile: FileItem | null;
  onContentChange: (fileId: string, newContent: string) => void;
  settings: EditorSettings;
  onRunPreview: () => void;
  onNewFileClick: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
}

export const EditorArea: React.FC<EditorAreaProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  activeFile,
  onContentChange,
  settings,
  onRunPreview,
  onNewFileClick,
  isZenMode,
  onToggleZenMode
}) => {
  const [copied, setCopied] = React.useState(false);
  const editorRef = useRef<any>(null);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Custom theme configurations
    monaco.editor.defineTheme('tokyo-night', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '565f89', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'bb9af7' },
        { token: 'string', foreground: '9ece6a' },
        { token: 'number', foreground: 'ff9e64' },
        { token: 'type', foreground: '7aa2f7' }
      ],
      colors: {
        'editor.background': '#1a1b26',
        'editor.foreground': '#a9b1d6',
        'editorLineNumber.foreground': '#3b4261',
        'editorLineNumber.activeForeground': '#7aa2f7',
        'editor.selectionBackground': '#283457',
        'editor.lineHighlightBackground': '#1f2335'
      }
    });

    monaco.editor.defineTheme('one-dark-pro', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c678dd' },
        { token: 'string', foreground: '98c379' },
        { token: 'number', foreground: 'd19a66' }
      ],
      colors: {
        'editor.background': '#21252b',
        'editor.foreground': '#abb2bf',
        'editorLineNumber.foreground': '#4b5263',
        'editor.selectionBackground': '#3e4451'
      }
    });

    // Keyboard shortcut: Ctrl+S or Cmd+S to Run Preview
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onRunPreview();
    });
  };

  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  const handleCopyCode = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!activeFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#1e1e1e] text-slate-500 p-8 select-none">
        <Code className="w-12 h-12 mb-3 text-slate-600" />
        <h3 className="text-sm font-semibold text-slate-400">No File Opened</h3>
        <p className="text-xs text-slate-500 mt-1">Select a file from the explorer on the left or create a new file.</p>
        <button
          onClick={onNewFileClick}
          className="mt-4 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Create File
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1e1e] overflow-hidden">
      {/* 1. Tabs Header Bar */}
      <div className="h-9 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between overflow-x-auto select-none px-1">
        <div className="flex items-center h-full">
          {tabs.map(tab => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`h-full flex items-center gap-2 px-3 text-xs border-r border-[#27272a] cursor-pointer transition max-w-[200px] group ${
                  isActive
                    ? 'bg-[#1e1e1e] text-white font-medium border-t-2 border-t-indigo-500'
                    : 'bg-[#141416] hover:bg-[#18181b] text-slate-400 hover:text-slate-200'
                }`}
              >
                {getFileIcon(tab.name, false)}
                <span className="truncate">{tab.name}</span>

                {/* Close Button */}
                <button
                  onClick={(e) => onCloseTab(tab.id, e)}
                  className="p-0.5 rounded hover:bg-slate-700/60 text-slate-400 hover:text-white transition opacity-60 group-hover:opacity-100"
                  title="Close Tab"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          <button
            onClick={onNewFileClick}
            className="p-1.5 ml-1 text-slate-400 hover:text-white hover:bg-[#27272a] rounded transition"
            title="New File"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Tab controls */}
        <div className="flex items-center gap-1 pr-2">
          <button
            onClick={handleFormatCode}
            className="p-1 text-slate-400 hover:text-white hover:bg-[#27272a] rounded transition"
            title="Format Document (Shift+Alt+F)"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopyCode}
            className="p-1 text-slate-400 hover:text-white hover:bg-[#27272a] rounded transition"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onToggleZenMode}
            className="p-1 text-slate-400 hover:text-white hover:bg-[#27272a] rounded transition"
            title={isZenMode ? "Exit Zen Mode" : "Zen Fullscreen Mode"}
          >
            {isZenMode ? <Minimize2 className="w-3.5 h-3.5 text-indigo-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Breadcrumbs Bar */}
      <div className="h-6 bg-[#1a1a1c] border-b border-[#27272a]/60 px-3 flex items-center justify-between text-[11px] text-slate-400 select-none">
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-slate-500">poluanjali</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-500">IDE</span>
          <span className="text-slate-600">/</span>
          <span className="text-indigo-400 font-mono font-medium">{activeFile.name}</span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono hidden sm:block">
          UTF-8 • {activeFile.language.toUpperCase()} • Ctrl+S to Run
        </div>
      </div>

      {/* 3. Monaco Editor Host */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={activeFile.language}
          value={activeFile.content}
          theme={settings.theme}
          onChange={(value) => onContentChange(activeFile.id, value || '')}
          onMount={handleEditorMount}
          options={{
            fontSize: settings.fontSize,
            tabSize: settings.tabSize,
            minimap: { enabled: settings.minimap },
            wordWrap: settings.wordWrap,
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            automaticLayout: true,
            fontFamily: settings.fontFamily || "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            lineNumbers: 'on',
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true }
          }}
          loading={
            <div className="w-full h-full flex items-center justify-center bg-[#1e1e1e] text-slate-400 text-xs">
              <span className="animate-pulse">Loading Monaco Editor Engine...</span>
            </div>
          }
        />
      </div>
    </div>
  );
};
