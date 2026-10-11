import React from 'react';
import { 
  FileCode2, 
  FileJson, 
  FileText, 
  File, 
  Folder, 
  FolderOpen,
  FileTerminal,
  Code2,
  Palette
} from 'lucide-react';
import { SupportedLanguage } from '../types/ide';

export function getFileIcon(name: string, isFolder: boolean, isOpen?: boolean) {
  if (isFolder) {
    return isOpen ? (
      <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
    ) : (
      <Folder className="w-4 h-4 text-amber-400 shrink-0" />
    );
  }

  const ext = name.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'html':
      return <FileCode2 className="w-4 h-4 text-orange-500 shrink-0" />;
    case 'css':
      return <Palette className="w-4 h-4 text-sky-400 shrink-0" />;
    case 'js':
    case 'jsx':
      return <Code2 className="w-4 h-4 text-yellow-400 shrink-0" />;
    case 'ts':
    case 'tsx':
      return <Code2 className="w-4 h-4 text-blue-400 shrink-0" />;
    case 'json':
      return <FileJson className="w-4 h-4 text-amber-300 shrink-0" />;
    case 'md':
      return <FileText className="w-4 h-4 text-cyan-300 shrink-0" />;
    case 'py':
      return <FileTerminal className="w-4 h-4 text-emerald-400 shrink-0" />;
    default:
      return <File className="w-4 h-4 text-slate-400 shrink-0" />;
  }
}

export function detectLanguage(filename: string): SupportedLanguage {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
      return 'css';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'json':
      return 'json';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'py':
      return 'python';
    default:
      return 'plaintext';
  }
}
