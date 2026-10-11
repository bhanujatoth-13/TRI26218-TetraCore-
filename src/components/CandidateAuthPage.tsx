import React, { useState, useEffect } from 'react';
import {
  Brain,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Lock,
  User,
  GraduationCap,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  FileText,
  Clock,
  Video,
  Mic,
  Award,
  ChevronRight,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { InterviewSession } from '../types';
import { AI_AVATAR_IMG } from '../assets/images';
import {
  StudentUser,
  getCurrentUser,
  loginUser,
  signUpUser,
  logoutUser,
  continueAsGuest,
  DEMO_USERS_SEEDS,
} from '../lib/auth';

interface CandidateAuthPageProps {
  pendingSession: InterviewSession | null;
  onConfirmAndStartInterview: (user?: StudentUser) => void;
  onBack: () => void;
  onUserChange?: (user: StudentUser | null) => void;
}

const ROLES = [
  'Software Development Engineer (SDE-1)',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'AI / ML Engineer',
  'Cloud / DevOps Engineer',
  'Mobile App Developer',
];

const GRAD_YEARS = ['2025', '2026', '2027', '2028'];

export const CandidateAuthPage: React.FC<CandidateAuthPageProps> = ({
  pendingSession,
  onConfirmAndStartInterview,
  onBack,
  onUserChange,
}) => {
  const [currentUser, setCurrentUser] = useState<StudentUser | null>(getCurrentUser());
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Sign up form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('Kakatiya Institute of Technology & Science (KITSW)');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [targetRole, setTargetRole] = useState(
    pendingSession?.role || 'Software Development Engineer (SDE-1)'
  );
  const [targetCompany, setTargetCompany] = useState('Google & TCS Digital');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Keep currentUser state in sync
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user && onUserChange) {
      onUserChange(user);
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await loginUser(loginEmail, loginPassword);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        if (onUserChange) onUserChange(res.user);
        setSuccessToast(`Welcome back, ${res.user.name}!`);
        setTimeout(() => {
          onConfirmAndStartInterview(res.user);
        }, 600);
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login encountered an unexpected error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await signUpUser({
        name,
        email,
        password,
        college,
        graduationYear,
        targetRole,
        targetCompany,
        resumeText: pendingSession?.resumeText,
      });

      if (res.success && res.user) {
        setCurrentUser(res.user);
        if (onUserChange) onUserChange(res.user);
        setSuccessToast(`Account created for ${res.user.name}!`);
        setTimeout(() => {
          onConfirmAndStartInterview(res.user);
        }, 600);
      } else {
        setErrorMessage(res.error || 'Failed to create student account.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Sign up encountered an unexpected error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoUser: typeof DEMO_USERS_SEEDS[0]) => {
    setLoginEmail(demoUser.email);
    setLoginPassword('student123');
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await loginUser(demoUser.email, 'student123');
      if (res.success && res.user) {
        setCurrentUser(res.user);
        if (onUserChange) onUserChange(res.user);
        setSuccessToast(`Signed in as ${res.user.name} (${res.user.college})`);
        setTimeout(() => {
          onConfirmAndStartInterview(res.user);
        }, 500);
      } else {
        setErrorMessage(res.error || 'Quick login failed.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Quick login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    if (onUserChange) onUserChange(null);
    setSuccessToast('Signed out successfully.');
    setTimeout(() => setSuccessToast(null), 2500);
  };

  const handleGuestEntry = () => {
    continueAsGuest();
    onConfirmAndStartInterview();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5452F6] text-white shadow-sm shadow-indigo-500/20">
            <Brain className="h-5 w-5 stroke-[1.75]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">MockMate</h1>
            <p className="text-xs text-slate-500 font-medium">Candidate Check-In &amp; Verification</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Placement Season 2026</span>
          </span>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Success Toast */}
        {successToast && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-sm font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Interview Briefing & Verification Rules (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            {pendingSession ? (
              /* Session Briefing Card */
              <div className="rounded-3xl border border-indigo-200 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 p-6 text-white shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-indigo-800/60 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-black uppercase tracking-wider">
                      Ready to Launch
                    </span>
                    <span className="text-xs text-indigo-300 font-medium">
                      {pendingSession.difficulty} Difficulty
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-indigo-400">
                    ID: {pendingSession.id.slice(-6)}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                    Upcoming Interview Track:
                  </span>
                  <h2 className="text-xl font-bold text-white leading-tight">
                    {pendingSession.title}
                  </h2>
                  <p className="text-xs text-slate-300">
                    Role: <strong className="text-white">{pendingSession.role}</strong> • Target:{' '}
                    <strong className="text-white">{pendingSession.company}</strong>
                  </p>
                </div>

                {/* Interview Specs Grid */}
                <div className="grid grid-cols-2 gap-2.5 bg-white/5 rounded-2xl p-3.5 border border-white/10 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>
                      <strong className="text-white font-bold">{pendingSession.totalQuestions}</strong> Questions
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Brain className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Adaptive AI</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Video className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Camera Proctor</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mic className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Speech AI Active</span>
                  </div>
                </div>

                {/* AI Interviewer Persona */}
                <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10 flex items-center gap-3">
                  <img
                    src={pendingSession.interviewer?.avatar || AI_AVATAR_IMG}
                    alt={pendingSession.interviewer.name}
                    referrerPolicy="no-referrer"
                    className="h-10 w-10 rounded-xl object-cover border border-white/20"
                  />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{pendingSession.interviewer.name}</span>
                      <span className="text-[10px] text-indigo-300 font-normal">
                        ({pendingSession.interviewer.accent})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-1">
                      {pendingSession.interviewer.title}
                    </p>
                  </div>
                </div>

                {/* Resume Targeted Notice */}
                {pendingSession.isResumeBased && (
                  <div className="rounded-xl bg-blue-500/15 border border-blue-400/30 p-3 text-xs text-blue-200 flex items-start gap-2">
                    <FileText className="h-4 w-4 text-blue-300 shrink-0 mt-0.5" />
                    <span>
                      Resume questions loaded. Interviewer will probe project claims and tech stack.
                    </span>
                  </div>
                )}

                {/* Verification Notice */}
                <div className="border-t border-indigo-800/60 pt-4 text-[11px] text-slate-400 leading-relaxed">
                  Candidate sign-in records your performance in the university database, generates an official placement report card, and tracks your readiness score.
                </div>
              </div>
            ) : (
              /* Standalone Portal Card */
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-indigo-50 text-[#5452F6] flex items-center justify-center font-bold">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Student Placement Portal</h3>
                    <p className="text-xs text-slate-500">Candidate identification before practice</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                  <p>
                    Logging in links all your interview sessions, scores, and AI diagnostic reports to your student profile.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Track progress across DSA, Technical, and HR rounds</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Permanent evaluation report cards with STAR coaching</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Custom weakness drill sessions tailored to your mistakes</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-indigo-50/70 border border-indigo-100 p-4 space-y-1 text-xs">
                  <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-[#5452F6]" />
                    <span>Placement Season Readiness</span>
                  </div>
                  <p className="text-indigo-800/80 leading-relaxed text-[11px]">
                    Over 8,400 students prepared with MockMate for Google, TCS, Microsoft, and Infosys campus drives.
                  </p>
                </div>
              </div>
            )}

            {/* Quick Demo Student Passports for 1-Click Login */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#5452F6]" />
                  <span>1-Click Demo Student Accounts</span>
                </h4>
                <span className="text-[10px] text-slate-400">Click to auto-sign in</span>
              </div>

              <div className="space-y-2">
                {DEMO_USERS_SEEDS.map((demo) => {
                  const isCurrent = currentUser?.email === demo.email;
                  return (
                    <button
                      key={demo.id}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleQuickDemoLogin(demo)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isCurrent
                          ? 'border-[#5452F6] bg-indigo-50/50 ring-1 ring-[#5452F6]'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`h-8 w-8 rounded-lg ${demo.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                          {demo.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {demo.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {demo.college.split('(')[0]} • {demo.targetRole.split('(')[0]}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[#5452F6] shrink-0 ml-2">
                        {isCurrent ? 'Current' : 'Sign In →'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The Login / Sign In Form or Verified Pass (7 Cols) */}
          <div className="lg:col-span-7">
            {currentUser ? (
              /* State A: Candidate Is Already Signed In - Show Verified Pass */
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Candidate Identity Verified
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Ready for Interview, {currentUser.name}!
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Your session token is active and linked to your official placement records.
                    </p>
                  </div>

                  <div className={`h-12 w-12 rounded-2xl ${currentUser.avatarColor || 'bg-indigo-600'} text-white flex items-center justify-center font-extrabold text-lg shadow-sm shrink-0`}>
                    {currentUser.name.charAt(0)}
                  </div>
                </div>

                {/* Candidate Badge Card */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Candidate Name</span>
                      <span className="font-bold text-slate-900 text-sm">{currentUser.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Student Email</span>
                      <span className="font-mono text-slate-700">{currentUser.email}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">College / University</span>
                      <span className="font-semibold text-slate-800">{currentUser.college}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Graduation Batch</span>
                      <span className="font-semibold text-slate-800">Class of {currentUser.graduationYear}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Target Career Role</span>
                      <span className="font-bold text-[#5452F6]">{currentUser.targetRole}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Interview Streak</span>
                      <span className="font-bold text-amber-600">{currentUser.streakDays} Days Consistent</span>
                    </div>
                  </div>
                </div>

                {/* Primary Launch CTA */}
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onConfirmAndStartInterview(currentUser)}
                    className="w-full py-4 px-6 rounded-xl bg-[#5452F6] hover:bg-[#4341E8] active:scale-[0.99] text-white font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-500/25 transition-all text-base cursor-pointer"
                  >
                    <span>Confirm Identity &amp; Enter AI Interview Room</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCurrentUser(null)}
                      className="text-[#5452F6] font-semibold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>Sign in with a different account</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-rose-600 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* State B: Sign In or Sign Up Form */
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                {/* Mode Selector Tabs */}
                <div className="flex items-center p-1 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage(null);
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      mode === 'login'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Sign In to Candidate Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMessage(null);
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      mode === 'signup'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Create Student Account
                  </button>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 font-semibold flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* 1. SIGN IN FORM */}
                {mode === 'login' && (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span>Student Email / College ID</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="e.g. b25cs261@kitsw.ac.in or ananya.sharma@example.edu"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:border-[#5452F6] focus:ring-1 focus:ring-[#5452F6] focus:outline-none placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-slate-400" />
                          <span>Password</span>
                        </label>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Demo default: <strong className="text-indigo-600 font-mono">student123</strong>
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter your student password"
                          className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:border-[#5452F6] focus:ring-1 focus:ring-[#5452F6] focus:outline-none placeholder:text-slate-400 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-[#5452F6] focus:ring-[#5452F6] accent-[#5452F6]"
                        />
                        <span>Remember student credentials</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginEmail('b25cs261@kitsw.ac.in');
                          setLoginPassword('student123');
                        }}
                        className="text-[#5452F6] font-semibold hover:underline cursor-pointer"
                      >
                        Autofill Bhanu (KITSW)
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-3.5 px-6 rounded-xl bg-[#5452F6] hover:bg-[#4341E8] active:scale-[0.99] text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/25 transition-all text-sm cursor-pointer disabled:opacity-60"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Authenticating Candidate...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In &amp; Enter Interview Room</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* 2. SIGN UP FORM */}
                {mode === 'signup' && (
                  <form onSubmit={handleSignUpSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span>Full Name</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Bhanu Jathoth"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:border-[#5452F6] focus:outline-none placeholder:text-slate-400"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          <span>College Email / Roll ID</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. b25cs261@kitsw.ac.in"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:border-[#5452F6] focus:outline-none placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                        <span>College / Institute Name</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        placeholder="e.g. Kakatiya Institute of Technology & Science (KITSW)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:border-[#5452F6] focus:outline-none placeholder:text-slate-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">Graduation Batch</label>
                        <select
                          value={graduationYear}
                          onChange={(e) => setGraduationYear(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium focus:border-[#5452F6] focus:outline-none"
                        >
                          {GRAD_YEARS.map((y) => (
                            <option key={y} value={y}>
                              Class of {y}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">Target Role</label>
                        <select
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium focus:border-[#5452F6] focus:outline-none"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                        <span>Dream Companies</span>
                      </label>
                      <input
                        type="text"
                        value={targetCompany}
                        onChange={(e) => setTargetCompany(e.target.value)}
                        placeholder="e.g. Google, TCS Digital, Microsoft"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:border-[#5452F6] focus:outline-none placeholder:text-slate-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-slate-400" />
                          <span>Password (min 6 chars)</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create password"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:border-[#5452F6] focus:outline-none placeholder:text-slate-400"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-slate-400" />
                          <span>Confirm Password</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:border-[#5452F6] focus:outline-none placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-3 py-3.5 px-6 rounded-xl bg-[#5452F6] hover:bg-[#4341E8] active:scale-[0.99] text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/25 transition-all text-sm cursor-pointer disabled:opacity-60"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Registering Student Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Student Account &amp; Start Interview</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Direct Guest Entry Fallback */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                  <span>Want to practice quickly without signing in?</span>
                  <button
                    type="button"
                    onClick={handleGuestEntry}
                    className="font-bold text-[#5452F6] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Continue as Guest Candidate</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
