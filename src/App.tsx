/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { DashboardView } from './components/DashboardView';
import { InterviewSetupView } from './components/InterviewSetupView';
import { InterviewRoom } from './components/InterviewRoom';
import { ReportCardView } from './components/ReportCardView';
import { HistoryView } from './components/HistoryView';
import { ResumeAnalyzerModal } from './components/ResumeAnalyzerModal';
import { ProgressView } from './components/ProgressView';
import { CandidateAuthPage } from './components/CandidateAuthPage';
import {
  EvaluationReport,
  InterviewSession,
  StudentProfile,
} from './types';
import {
  getProfile,
  getReports,
  getReportById,
  saveProfile,
  saveSession,
  INTERVIEWERS,
} from './lib/storage';
import {
  StudentUser,
  getCurrentUser,
  userToProfile,
  onAuthChange,
} from './lib/auth';

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    'dashboard' | 'setup' | 'auth' | 'interview' | 'report' | 'history' | 'resume' | 'progress'
  >('dashboard');
  const [profile, setProfile] = useState<StudentProfile>(getProfile());
  const [currentUser, setCurrentUser] = useState<StudentUser | null>(getCurrentUser());
  const [reports, setReports] = useState<EvaluationReport[]>(getReports());
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [pendingSession, setPendingSession] = useState<InterviewSession | null>(null);
  const [activeReport, setActiveReport] = useState<EvaluationReport | null>(null);

  // Sync reports, profile, & user on mount and listen to auth changes
  useEffect(() => {
    setProfile(getProfile());
    setReports(getReports());
    setCurrentUser(getCurrentUser());

    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
      if (user) {
        const p = userToProfile(user);
        setProfile(p);
        saveProfile(p);
      }
    });

    return () => unsubscribe();
  }, []);

  // Before starting interview, route through candidate login/verification checkpoint
  const handleStartSession = (session: InterviewSession) => {
    setPendingSession(session);
    setCurrentTab('auth');
  };

  const handleConfirmAndStartInterview = (user?: StudentUser) => {
    const candidateUser = user || currentUser;
    const sessionToLaunch: InterviewSession = pendingSession
      ? {
          ...pendingSession,
          candidateName: candidateUser?.name || pendingSession.candidateName,
          candidateEmail: candidateUser?.email || pendingSession.candidateEmail,
          candidateCollege: candidateUser?.college || pendingSession.candidateCollege,
        }
      : activeSession || {
          id: 'sess-' + Date.now(),
          mode: 'quick',
          title: 'Software Development Engineer (SDE-1) - Technical Round',
          role: 'Software Development Engineer (SDE-1)',
          company: 'Tech Recruiter',
          difficulty: 'Intermediate',
          interviewer: INTERVIEWERS[0],
          topics: ['Technical', 'DSA'],
          createdAt: Date.now(),
          status: 'in_progress',
          totalQuestions: 5,
          permissionsApproved: true,
          candidateName: candidateUser?.name,
          candidateEmail: candidateUser?.email,
          candidateCollege: candidateUser?.college,
        };

    if (candidateUser) {
      const updatedProfile = userToProfile(candidateUser);
      setProfile(updatedProfile);
      saveProfile(updatedProfile);
    }

    saveSession(sessionToLaunch);
    setActiveSession(sessionToLaunch);
    setCurrentTab('interview');
  };

  const handleFinishInterview = (report: EvaluationReport) => {
    setActiveReport(report);
    setReports(getReports());
    setProfile(getProfile());
    setCurrentTab('report');
  };

  const handleOpenReport = (reportId: string) => {
    const rep = getReportById(reportId);
    if (rep) {
      setActiveReport(rep);
      setCurrentTab('report');
    } else if (reports.length > 0) {
      setActiveReport(reports[0]);
      setCurrentTab('report');
    }
  };

  const handleRetake = () => {
    setCurrentTab('setup');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-indigo-500/20 selection:text-indigo-600">
      {/* Top Navigation bar only when outside interview room, dashboard & setup */}
      {currentTab !== 'interview' && currentTab !== 'dashboard' && currentTab !== 'setup' && (
        <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2 text-sm font-bold text-slate-800 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setCurrentTab('progress')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentTab === 'progress'
                  ? 'bg-indigo-50 text-indigo-600 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Progress
            </button>
            <button
              onClick={() => setCurrentTab('history')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentTab === 'history'
                  ? 'bg-indigo-50 text-indigo-600 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setCurrentTab('resume')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentTab === 'resume'
                  ? 'bg-indigo-50 text-indigo-600 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Resume &amp; Questions
            </button>
            <button
              onClick={() => setCurrentTab('auth')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'auth'
                  ? 'bg-indigo-50 text-indigo-600 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <User className="h-3.5 w-3.5 text-indigo-600" />
              <span>{currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}</span>
            </button>
          </div>
        </nav>
      )}

      {/* Main Views */}
      <div className="w-full">
        {currentTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            reports={reports}
            onStartNewMock={() => setCurrentTab('setup')}
            onOpenReport={handleOpenReport}
            onOpenResumeTool={() => setCurrentTab('resume')}
            onOpenHistory={() => setCurrentTab('history')}
            onOpenProgress={() => setCurrentTab('progress')}
            onOpenAuth={() => setCurrentTab('auth')}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressView
            reports={reports}
            onOpenReport={handleOpenReport}
            onRetake={handleRetake}
            onStartNewMock={() => setCurrentTab('setup')}
          />
        )}

        {currentTab === 'setup' && (
          <InterviewSetupView
            onBack={() => setCurrentTab('dashboard')}
            onContinueToInterview={handleStartSession}
            onOpenResumeTool={() => setCurrentTab('resume')}
          />
        )}

        {currentTab === 'auth' && (
          <CandidateAuthPage
            pendingSession={pendingSession}
            onConfirmAndStartInterview={handleConfirmAndStartInterview}
            onBack={() => {
              if (pendingSession) {
                setCurrentTab('setup');
              } else {
                setCurrentTab('dashboard');
              }
            }}
            onUserChange={(u) => {
              setCurrentUser(u);
              if (u) {
                const p = userToProfile(u);
                setProfile(p);
                saveProfile(p);
              }
            }}
          />
        )}

        {currentTab === 'interview' && activeSession && (
          <InterviewRoom
            session={activeSession}
            onFinishInterview={handleFinishInterview}
            onExit={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'report' && activeReport && (
          <ReportCardView
            report={activeReport}
            onBackToDashboard={() => setCurrentTab('dashboard')}
            onRetake={handleRetake}
            onStartRemediationSession={(session) => {
              handleStartSession(session);
            }}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            reports={reports}
            onOpenReport={handleOpenReport}
            onStartNewMock={() => setCurrentTab('setup')}
          />
        )}

        {currentTab === 'resume' && (
          <ResumeAnalyzerModal
            profile={profile}
            onUpdateProfile={(updated) => setProfile(updated)}
            onLaunchTailoredMock={() => {
              setCurrentTab('setup');
            }}
            onStartResumeInterview={(session) => {
              handleStartSession(session);
            }}
          />
        )}
      </div>
    </div>
  );
}
