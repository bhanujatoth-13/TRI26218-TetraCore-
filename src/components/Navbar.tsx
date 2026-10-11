import React from 'react';
import {
  Sparkles,
  LayoutDashboard,
  History,
  FileText,
  Play,
  Flame,
  Award,
  CheckCircle2
} from 'lucide-react';
import { StudentProfile } from '../types';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onStartNewMock: () => void;
  profile: StudentProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onStartNewMock,
  profile,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#5452F6] text-white font-bold shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            M
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-900">MockMate</span>
              <span className="rounded bg-indigo-50 px-1.5 py-0.2 text-[10px] font-semibold text-[#5452F6] border border-indigo-200">
                AI Prep
              </span>
            </div>
            <span className="text-[10px] text-slate-500 hidden sm:inline -mt-0.5">
              Campus Placement Engine
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentTab === 'dashboard'
                ? 'text-[#5452F6] bg-indigo-50 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('progress')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentTab === 'progress'
                ? 'text-[#5452F6] bg-indigo-50 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Progress
          </button>
          <button
            onClick={() => onNavigate('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentTab === 'history'
                ? 'text-[#5452F6] bg-indigo-50 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="h-4 w-4" />
            Past Reports
          </button>
          <button
            onClick={() => onNavigate('resume')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentTab === 'resume'
                ? 'text-[#5452F6] bg-indigo-50 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="h-4 w-4" />
            Resume &amp; Questions
          </button>
        </nav>

        {/* Right Action buttons */}
        <div className="flex items-center gap-3">
          <div 
            title="Current Practice Streak"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold"
          >
            <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{profile.streakDays}d Streak</span>
          </div>

          <button
            onClick={onStartNewMock}
            className="flex items-center gap-2 rounded-xl bg-[#5452F6] hover:bg-[#4341E8] active:scale-95 text-white px-4 py-2 text-sm font-semibold shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Start Mock</span>
          </button>
        </div>
      </div>
    </header>
  );
};
