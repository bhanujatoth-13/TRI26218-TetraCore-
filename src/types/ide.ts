export type SupportedLanguage = 
  | 'javascript'
  | 'typescript'
  | 'html'
  | 'css'
  | 'json'
  | 'markdown'
  | 'python'
  | 'plaintext';

export interface FileItem {
  id: string;
  name: string;
  path: string;
  content: string;
  language: SupportedLanguage;
  isFolder: boolean;
  parentId?: string | null;
  isOpen?: boolean;
}

export interface TabItem {
  id: string;
  fileId: string;
  name: string;
  path: string;
  language: SupportedLanguage;
  isDirty?: boolean;
}

export interface ConsoleMessage {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error';
  content: string;
  timestamp: string;
  source?: string;
}

export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  theme: string;
  minimap: boolean;
  wordWrap: 'on' | 'off';
  autoRun: boolean;
  formatOnSave: boolean;
  fontFamily: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  iconName: string;
  badge: string;
  entryFileId: string;
  files: FileItem[];
}
