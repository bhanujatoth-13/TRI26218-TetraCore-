import React, { useState, useRef, useEffect } from 'react';
import { 
  RotateCw, 
  ExternalLink, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Terminal, 
  Bug, 
  Globe, 
  FolderGit2, 
  Trash2, 
  Check, 
  Copy, 
  Play,
  ArrowRight,
  ShieldCheck,
  Code
} from 'lucide-react';
import { ConsoleMessage, FileItem } from '../types/ide';
import { executeTerminalCommand } from '../utils/terminalHelper';

interface PreviewPaneProps {
  bundledHtml: string;
  onRefresh: () => void;
  isRunning: boolean;
  autoRun: boolean;
  onToggleAutoRun: (val: boolean) => void;
  consoleLogs: ConsoleMessage[];
  onClearConsole: () => void;
  files: FileItem[];
  activeFile: FileItem | null;
}

type TabType = 'preview' | 'console' | 'terminal' | 'github';
type ViewportType = 'desktop' | 'tablet' | 'mobile';

export const PreviewPane: React.FC<PreviewPaneProps> = ({
  bundledHtml,
  onRefresh,
  isRunning,
  autoRun,
  onToggleAutoRun,
  consoleLogs,
  onClearConsole,
  files,
  activeFile
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('preview');
  const [viewport, setViewport] = useState<ViewportType>('desktop');
  const [iframeKey, setIframeKey] = useState(0);

  // Terminal state
  const [terminalHistory, setTerminalHistory] = useState<Array<{ cmd: string; out: string; isErr?: boolean }>>([
    { cmd: 'git clone https://github.com/poluanjali/IDE.git', out: 'Cloning into \'IDE\'...\nremote: Enumerating objects: 24, done.\nremote: Total 24 (delta 0), reused 0 (delta 0)\nReceiving objects: 100% (24/24), done.\nProject loaded into workspace.' },
    { cmd: 'npm run dev', out: '➜  Local: http://localhost:3000/\n➜  Status: Live reload active' }
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [commandHistoryList, setCommandHistoryList] = useState<string[]>(['git status', 'ls']);
  const terminalBottomRef = useRef<HTMLDivElement>(null);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  // Console log filter
  const [logFilter, setLogFilter] = useState<'all' | 'log' | 'warn' | 'error'>('all');
  const [copiedClone, setCopiedClone] = useState(false);

  // Refresh iframe when bundledHtml changes or onRefresh triggered
  useEffect(() => {
    setIframeKey(k => k + 1);
  }, [bundledHtml]);

  useEffect(() => {
    if (activeTab === 'console') {
      consoleBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs, activeTab]);

  useEffect(() => {
    if (activeTab === 'terminal') {
      terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory, activeTab]);

  const handleManualRefresh = () => {
    setIframeKey(k => k + 1);
    onRefresh();
  };

  const handlePopout = () => {
    const blob = new Blob([bundledHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const input = terminalInput.trim();
    setCommandHistoryList(prev => [...prev, input]);
    setHistoryIndex(-1);

    const res = executeTerminalCommand(input, files, () => {
      setTerminalHistory([]);
    });

    if (input.toLowerCase() !== 'clear') {
      setTerminalHistory(prev => [...prev, { cmd: input, out: res.output, isErr: res.isError }]);
    }
    setTerminalInput('');
  };

  const handleTerminalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistoryList.length > 0) {
        const nextIdx = historyIndex === -1 ? commandHistoryList.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIdx);
        setTerminalInput(commandHistoryList[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIdx = historyIndex + 1;
        if (nextIdx < commandHistoryList.length) {
          setHistoryIndex(nextIdx);
          setTerminalInput(commandHistoryList[nextIdx]);
        } else {
          setHistoryIndex(-1);
          setTerminalInput('');
        }
      }
    }
  };

  const filteredLogs = consoleLogs.filter(log => {
    if (logFilter === 'all') return true;
    return log.type === logFilter;
  });

  const errorCount = consoleLogs.filter(l => l.type === 'error').length;
  const warnCount = consoleLogs.filter(l => l.type === 'warn').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141416] border-l border-[#27272a] select-none text-slate-300">
      {/* 1. Header Toolbar */}
      <div className="h-9 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between px-2 text-xs">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition text-xs font-medium ${
              activeTab === 'preview' 
                ? 'bg-[#27272a] text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f1f23]'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>Web Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('console')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition text-xs font-medium relative ${
              activeTab === 'console' 
                ? 'bg-[#27272a] text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f1f23]'
            }`}
          >
            <Bug className="w-3.5 h-3.5 text-amber-400" />
            <span>Console</span>
            {consoleLogs.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                errorCount > 0 ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'
              }`}>
                {consoleLogs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition text-xs font-medium ${
              activeTab === 'terminal' 
                ? 'bg-[#27272a] text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f1f23]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition text-xs font-medium ${
              activeTab === 'github' 
                ? 'bg-[#27272a] text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f1f23]'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5 text-sky-400" />
            <span>GitHub</span>
          </button>
        </div>

        {/* Right Toolbar Controls */}
        <div className="flex items-center gap-2">
          {activeTab === 'preview' && (
            <>
              {/* Viewport switchers */}
              <div className="flex items-center bg-[#121214] p-0.5 rounded border border-[#27272a]">
                <button
                  onClick={() => setViewport('desktop')}
                  className={`p-1 rounded transition ${viewport === 'desktop' ? 'bg-[#27272a] text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  title="Desktop (100%)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewport('tablet')}
                  className={`p-1 rounded transition ${viewport === 'tablet' ? 'bg-[#27272a] text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  title="Tablet (768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewport('mobile')}
                  className={`p-1 rounded transition ${viewport === 'mobile' ? 'bg-[#27272a] text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  title="Mobile (375px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Refresh button */}
              <button
                onClick={handleManualRefresh}
                className="p-1 hover:bg-[#27272a] text-slate-400 hover:text-white rounded transition"
                title="Refresh preview"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin text-indigo-400' : ''}`} />
              </button>

              {/* Popout button */}
              <button
                onClick={handlePopout}
                className="p-1 hover:bg-[#27272a] text-slate-400 hover:text-white rounded transition"
                title="Open in new window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {activeTab === 'console' && (
            <button
              onClick={onClearConsole}
              className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 transition"
              title="Clear Console"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          )}

          {activeTab === 'terminal' && (
            <button
              onClick={() => setTerminalHistory([])}
              className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 transition"
            >
              <Trash2 className="w-3 h-3" />
              Clear Screen
            </button>
          )}
        </div>
      </div>

      {/* 2. Content Pane */}
      <div className="flex-1 overflow-hidden relative flex flex-col bg-[#0d0d11]">
        {/* TAB A: WEB PREVIEW */}
        {activeTab === 'preview' && (
          <div className="flex-1 flex flex-col h-full">
            {/* Address bar */}
            <div className="h-7 bg-[#141417] border-b border-[#27272a] flex items-center px-3 gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>localhost:3000</span>
              </div>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400 truncate">preview</span>

              <div className="ml-auto flex items-center gap-2">
                <label className="flex items-center gap-1 cursor-pointer select-none text-[10px] text-slate-400">
                  <input
                    type="checkbox"
                    checked={autoRun}
                    onChange={(e) => onToggleAutoRun(e.target.checked)}
                    className="accent-indigo-500 w-3 h-3"
                  />
                  <span>Live Auto-Run</span>
                </label>
              </div>
            </div>

            {/* iFrame Viewport Container */}
            <div className="flex-1 flex items-center justify-center p-2 bg-[#09090b] overflow-auto">
              <div
                className={`h-full bg-white transition-all duration-300 shadow-2xl overflow-hidden rounded-md border border-[#27272a] ${
                  viewport === 'desktop'
                    ? 'w-full'
                    : viewport === 'tablet'
                    ? 'w-[768px] max-w-full'
                    : 'w-[375px] max-w-full'
                }`}
              >
                <iframe
                  key={iframeKey}
                  title="IDE Live Sandbox Preview"
                  srcDoc={bundledHtml}
                  sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                  className="w-full h-full border-none block bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB B: CONSOLE */}
        {activeTab === 'console' && (
          <div className="flex-1 flex flex-col h-full bg-[#121214] font-mono text-xs">
            {/* Filter buttons */}
            <div className="p-2 border-b border-[#27272a] flex items-center gap-2 text-xs">
              {(['all', 'log', 'warn', 'error'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setLogFilter(filter)}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider transition ${
                    logFilter === filter
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-[#1f1f23] text-slate-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
              <span className="ml-auto text-[11px] text-slate-500">
                {filteredLogs.length} events logged
              </span>
            </div>

            {/* Logs List */}
            <div className="flex-1 p-3 overflow-y-auto space-y-1.5 select-text">
              {filteredLogs.length === 0 ? (
                <div className="text-slate-500 text-center py-12">
                  No console events recorded yet. Call <code>console.log()</code> in your code or click "Run Simulation" in the preview.
                </div>
              ) : (
                filteredLogs.map(log => {
                  let badgeColor = 'text-slate-300 bg-slate-800';
                  if (log.type === 'error') badgeColor = 'text-rose-400 bg-rose-500/10 border border-rose-500/20';
                  if (log.type === 'warn') badgeColor = 'text-amber-400 bg-amber-500/10 border border-amber-500/20';
                  if (log.type === 'info') badgeColor = 'text-sky-400 bg-sky-500/10 border border-sky-500/20';

                  return (
                    <div 
                      key={log.id} 
                      className={`p-2 rounded flex items-start gap-2.5 border-b border-[#1f1f23] ${badgeColor}`}
                    >
                      <span className="text-[10px] text-slate-500 shrink-0 select-none">
                        [{log.timestamp}]
                      </span>
                      <span className="text-[10px] font-bold uppercase shrink-0">
                        {log.type}
                      </span>
                      <span className="flex-1 whitespace-pre-wrap break-all text-slate-200">
                        {log.content}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={consoleBottomRef} />
            </div>
          </div>
        )}

        {/* TAB C: TERMINAL */}
        {activeTab === 'terminal' && (
          <div className="flex-1 flex flex-col h-full bg-[#0d0d11] font-mono text-xs p-3 select-text overflow-hidden">
            {/* Terminal output stream */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              <div className="text-slate-400 leading-relaxed text-[11px] pb-2 border-b border-[#27272a]/60">
                <span className="text-indigo-400 font-bold">Cloud IDE Interactive Virtual Terminal</span><br />
                Connected repository: <a href="https://github.com/poluanjali/IDE" target="_blank" rel="noreferrer" className="text-sky-400 underline">https://github.com/poluanjali/IDE</a><br />
                Type <code className="text-amber-300 bg-slate-800 px-1 rounded">help</code> for commands or <code className="text-emerald-300 bg-slate-800 px-1 rounded">python main.py</code> / <code className="text-sky-300 bg-slate-800 px-1 rounded">ls</code>.
              </div>

              {terminalHistory.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-emerald-400 font-semibold">poluanjali@cloud-ide</span>
                    <span className="text-slate-600">:</span>
                    <span className="text-indigo-400 font-semibold">~/workspace$</span>
                    <span>{item.cmd}</span>
                  </div>
                  {item.out && (
                    <div className={`whitespace-pre-wrap text-[11px] pl-3 border-l-2 ${
                      item.isErr ? 'text-rose-400 border-rose-500' : 'text-slate-300 border-slate-700'
                    }`}>
                      {item.out}
                    </div>
                  )}
                </div>
              ))}
              <div ref={terminalBottomRef} />
            </div>

            {/* Terminal Input Prompt */}
            <form onSubmit={handleTerminalSubmit} className="mt-2 pt-2 border-t border-[#27272a] flex items-center gap-2">
              <span className="text-emerald-400 font-semibold shrink-0">poluanjali@cloud-ide:~$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyDown={handleTerminalKeyDown}
                placeholder="type a command (e.g. ls, cat index.html, git status, help)..."
                autoFocus
                className="flex-1 bg-transparent text-white text-xs font-mono focus:outline-none placeholder-slate-600"
              />
              <button type="submit" className="text-slate-500 hover:text-white px-1">
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* TAB D: GITHUB INFO & REPOSITORY */}
        {activeTab === 'github' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-slate-200">
            {/* Header banner */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-indigo-500/30 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold text-white tracking-tight">poluanjali / IDE</h2>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    Public
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-lg">
                  Repository created on GitHub. Use this live Cloud IDE to edit files, preview dynamic web code, and execute terminal commands.
                </p>
              </div>

              <a
                href="https://github.com/poluanjali/IDE"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/30"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Quick Git Commands Card */}
            <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" /> Clone &amp; Local Setup
              </h3>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d0d11] border border-[#27272a] font-mono text-xs">
                <span className="text-slate-300 truncate">git clone https://github.com/poluanjali/IDE.git</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('git clone https://github.com/poluanjali/IDE.git');
                    setCopiedClone(true);
                    setTimeout(() => setCopiedClone(false), 2000);
                  }}
                  className="p-1 text-slate-400 hover:text-white transition"
                  title="Copy command"
                >
                  {copiedClone ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Project Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#18181b] border border-[#27272a]">
                <div className="text-[11px] text-slate-400">Default Branch</div>
                <div className="mt-1 font-mono text-sm font-semibold text-white">main</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#18181b] border border-[#27272a]">
                <div className="text-[11px] text-slate-400">Environment</div>
                <div className="mt-1 font-mono text-sm font-semibold text-emerald-400">Vite 6 + React 19</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#18181b] border border-[#27272a]">
                <div className="text-[11px] text-slate-400">Editor Engine</div>
                <div className="mt-1 font-mono text-sm font-semibold text-indigo-400">Monaco (VS Code)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
