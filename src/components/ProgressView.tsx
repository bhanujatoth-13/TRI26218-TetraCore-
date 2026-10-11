import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Trophy,
  Target,
  Calendar,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Award,
  ArrowRight,
  ArrowUpRight,
  Play,
  Pause,
  Volume2,
  ChevronRight,
  Sparkles,
  BookOpen,
  Brain,
  ShieldCheck,
  User,
  BarChart3,
  BarChart2,
  FileText,
  X,
  ListFilter,
  Check,
  RotateCcw,
  MessageSquare,
  HelpCircle,
  Flame,
  Send,
} from 'lucide-react';
import { EvaluationReport } from '../types';

interface ProgressViewProps {
  reports: EvaluationReport[];
  onOpenReport: (reportId: string) => void;
  onRetake: () => void;
  onStartNewMock: () => void;
}

interface PracticeDrill {
  id: string;
  question: string;
  weaknessTargeted: string;
  category: string;
  recommendedTime: string;
  idealFramework: string;
  sampleKeyPoints: string[];
}

const RECOMMENDED_DRILLS: PracticeDrill[] = [
  {
    id: 'drill-1',
    question: 'Explain the end-to-end architecture of your flagship project and quantify the performance bottlenecks you solved.',
    weaknessTargeted: 'Incomplete Project Explanations',
    category: 'Architecture & Resume',
    recommendedTime: '90 - 120s',
    idealFramework: 'Google X-Y-Z Formula (Accomplished X, measured by Y, by implementing Z)',
    sampleKeyPoints: [
      'High-level architecture (client, API gateway, cache, database)',
      'Specific quantitative metrics (e.g. 38% latency drop, 20+ concurrent socket connections)',
      'Why you chose your database & state management stack over alternatives'
    ]
  },
  {
    id: 'drill-2',
    question: 'What is the precise technical difference between Concurrency vs. Parallelism and Process vs. Thread in operating systems?',
    weaknessTargeted: 'Incorrect Technical Concepts',
    category: 'OS & Systems Core',
    recommendedTime: '60 - 90s',
    idealFramework: 'Runtime Mechanisms & Memory Allocation Contrast',
    sampleKeyPoints: [
      'Process: independent memory space; Thread: shared heap/process memory with private stack',
      'Concurrency: dealing with multiple things at once (event loop, interleaved execution)',
      'Parallelism: executing multiple things simultaneously on physical multi-core CPUs'
    ]
  },
  {
    id: 'drill-3',
    question: 'Describe a high-stakes production bug or technical roadblock you faced under pressure using the STAR method.',
    weaknessTargeted: 'Unclear Answers & Lack of Structure',
    category: 'Behavioral & HR Round',
    recommendedTime: '90s',
    idealFramework: 'STAR (Situation 15s • Task 10s • Action 50s • Result 15s)',
    sampleKeyPoints: [
      'State immediate crisis context and business risk succinctly',
      'Explain your diagnostic hypothesis and systematic debugging steps',
      'End with measurable outcomes and preventative post-mortem measures'
    ]
  },
  {
    id: 'drill-4',
    question: 'Design an LRU Cache or Sliding Window Rate Limiter. Clarify constraints and state time and auxiliary space complexity.',
    weaknessTargeted: 'Premature Coding Before Edge Cases',
    category: 'DSA & System Design',
    recommendedTime: '120s',
    idealFramework: 'Constraint Clarification • Design • Complexity Analysis',
    sampleKeyPoints: [
      'Ask 3 clarifying questions (max throughput, eviction policy on concurrency, negative values)',
      'Articulate Hash Map + Doubly Linked List for O(1) get/put operations',
      'Differentiate auxiliary space O(Capacity) from input stream size'
    ]
  },
  {
    id: 'drill-5',
    question: 'How do Database Indexes work internally (B+ Trees vs. Hash)? When can an index hurt write performance?',
    weaknessTargeted: 'Incorrect Technical Concepts',
    category: 'Databases & Backend',
    recommendedTime: '90s',
    idealFramework: 'Index Structure Mechanics & Write Amplification Trade-off',
    sampleKeyPoints: [
      'B+ Tree supports range scans in O(log N); Hash indexes only support point lookups in O(1)',
      'Every INSERT/UPDATE/DELETE requires rebalancing the B+ Tree and updating index pages',
      'How to inspect query bottlenecks using EXPLAIN ANALYZE'
    ]
  }
];

export const ProgressView: React.FC<ProgressViewProps> = ({
  reports,
  onOpenReport,
  onRetake,
  onStartNewMock,
}) => {
  const [timeFilter, setTimeFilter] = useState<'all' | '30days' | 'month' | 'recent'>('all');
  const [selectedAttemptIdx, setSelectedAttemptIdx] = useState<number | null>(null);
  const [replayModalReport, setReplayModalReport] = useState<EvaluationReport | null>(null);
  const [playingAudioIndex, setPlayingAudioIndex] = useState<number | null>(null);
  const [activeDrillModal, setActiveDrillModal] = useState<PracticeDrill | null>(null);
  const [drillPracticeInput, setDrillPracticeInput] = useState('');
  const [drillPracticeFeedback, setDrillPracticeFeedback] = useState<string | null>(null);
  const [drillsFilter, setDrillsFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('mockmate_progress_steps');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      'drill-1': true,
      'drill-2': false,
      'drill-3': false,
      'drill-4': false,
      'drill-5': false,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('mockmate_progress_steps', JSON.stringify(completedSteps));
    } catch (e) {
      console.error(e);
    }
  }, [completedSteps]);

  const sortedReports = [...reports].sort((a, b) => (a.completedAt || 0) - (b.completedAt || 0));

  const attempts = sortedReports.map((r, i) => ({
    attemptNumber: i + 1,
    score: typeof r.overallScore === 'number' ? r.overallScore : 0,
    company: r.company || 'General Tech',
    role: r.role || 'Software Development Engineer',
    interviewType: (r.role || '').includes('HR') ? 'HR Behavioral' : 'Technical Core & Campus',
    date: new Date(r.completedAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    label: `Attempt ${i + 1}`,
    durationSeconds: r.durationSeconds || 720,
    reportId: r.id,
    report: r,
    notes: r.interviewerVerdict?.slice(0, 100) || (r.overallScore === 0 ? 'Incomplete interview: zero answers recorded.' : 'Evaluated session'),
  }));

  const hasReports = attempts.length > 0;
  const firstReport = sortedReports[0] || null;
  const latestReport = sortedReports[sortedReports.length - 1] || null;

  const totalInterviewsCount = attempts.length;
  const averageScore = hasReports
    ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
    : 0;
  const firstScore = attempts[0]?.score ?? 0;
  const latestScore = attempts[attempts.length - 1]?.score ?? 0;
  const bestScore = hasReports ? Math.max(...attempts.map((a) => a.score)) : 0;
  const bestAttemptNumber = hasReports ? (attempts.find((a) => a.score === bestScore)?.attemptNumber || 1) : 1;
  const absolutePointImprovement = hasReports && attempts.length > 1 ? latestScore - firstScore : 0;
  const totalSeconds = attempts.reduce((acc, a) => acc + (a.durationSeconds || 720), 0);
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMins = Math.floor((totalSeconds % 3600) / 60);

  const chartWidth = 580;
  const chartHeight = 220;
  const paddingX = 45;
  const paddingY = 32;

  const getCoordinates = (index: number, score: number) => {
    if (attempts.length <= 1) {
      const x = chartWidth / 2;
      const y = chartHeight - paddingY - (score / 100) * (chartHeight - paddingY * 2);
      return { x, y };
    }
    const x = paddingX + (index / (attempts.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (score / 100) * (chartHeight - paddingY * 2);
    return { x, y };
  };

  const points = attempts.map((a, i) => getCoordinates(i, a.score));
  const pointsPath = attempts.length > 1
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : '';
  const areaPath = attempts.length > 1
    ? `${pointsPath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : '';

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const completedStepsCount = Object.values(completedSteps).filter(Boolean).length;
  const totalDrillsCount = RECOMMENDED_DRILLS.length;
  const drillProgressPercent = Math.round((completedStepsCount / totalDrillsCount) * 100);

  const filteredDrills = RECOMMENDED_DRILLS.filter((d) => {
    if (drillsFilter === 'pending') return !completedSteps[d.id];
    if (drillsFilter === 'completed') return Boolean(completedSteps[d.id]);
    return true;
  });

  const handleSimulateDrillSubmit = () => {
    if (!drillPracticeInput.trim()) return;
    setDrillPracticeFeedback(
      `AI Evaluation: Good progress! You answered clearly. Recommend keeping answer under ${activeDrillModal?.recommendedTime}.`
    );
    if (activeDrillModal) {
      setCompletedSteps((prev) => ({ ...prev, [activeDrillModal.id]: true }));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-24">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#F95721] border border-orange-200/80 shadow-xs">
              <TrendingUp className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Your Progress
                </h1>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-orange-100 text-[#F95721] px-2.5 py-0.5 rounded-full border border-orange-200">
                  Campus Analytics
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Track your improvement with each interview attempt, eliminate recurring weaknesses, and reach placement readiness.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="relative">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="appearance-none bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold py-2 pl-8 pr-8 rounded-xl shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="all">All Time (5 Attempts)</option>
                <option value="30days">Last 30 Days</option>
                <option value="month">This Placement Season</option>
                <option value="recent">Recent Attempts</option>
              </select>
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <ListFilter className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 1. OVERALL PERFORMANCE SECTION */}
        <div className="mt-6 space-y-4">
          <div className="bg-gradient-to-r from-orange-50/90 via-indigo-50/70 to-emerald-50/90 border border-orange-200/70 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-orange-200 text-[#F95721] shadow-2xs">
                <Award className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Overall Performance Summary
                </span>
                <div className="text-base sm:text-lg font-black text-slate-900 flex flex-wrap items-center gap-2">
                  <span className="text-[#F95721]">{totalInterviewsCount} interviews</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-900">{averageScore}/100 average</span>
                  <span className="text-slate-300">•</span>
                  <span className={`font-extrabold ${absolutePointImprovement >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {hasReports && attempts.length > 1
                      ? `${absolutePointImprovement >= 0 ? '+' : ''}${absolutePointImprovement}% improvement`
                      : 'Baseline established'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 text-sm font-semibold">{totalHours > 0 ? `${totalHours}h ` : ''}{totalMins}m practice</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs border ${
                latestScore >= 84
                  ? 'bg-emerald-100/90 border-emerald-300/60 text-emerald-800'
                  : latestScore >= 65
                  ? 'bg-blue-100/90 border-blue-300/60 text-blue-800'
                  : hasReports
                  ? 'bg-amber-100/90 border-amber-300/60 text-amber-800'
                  : 'bg-slate-100 border-slate-300 text-slate-600'
              }`}>
                <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                {latestScore >= 84 ? 'Placement Ready Tier' : latestScore >= 65 ? 'Near Ready Tier' : hasReports ? 'Needs Practice Tier' : 'No Mocks Completed'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-1 hover:border-slate-300 transition-colors">
              <span className="text-slate-500 text-xs font-semibold">1. Interviews Completed</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalInterviewsCount}</span>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  {totalInterviewsCount === 1 ? '1 Session' : `${totalInterviewsCount} Sessions`}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Target: 8 campus placement mocks</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-1 hover:border-slate-300 transition-colors">
              <span className="text-slate-500 text-xs font-semibold">2. Average Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{averageScore}</span>
                <span className="text-xs font-semibold text-slate-400">/ 100</span>
              </div>
              <p className={`text-[11px] font-bold flex items-center gap-1 ${
                averageScore >= 75 ? 'text-emerald-600' : averageScore >= 50 ? 'text-blue-600' : 'text-amber-600'
              }`}>
                <TrendingUp className="h-3 w-3" />
                {averageScore >= 75 ? 'Strong placement standing' : averageScore > 0 ? 'Work through weak areas' : 'No answers scored yet'}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-1 hover:border-slate-300 transition-colors">
              <span className="text-slate-500 text-xs font-semibold">3. Improvement Percentage</span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl sm:text-3xl font-black ${
                  absolutePointImprovement >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {hasReports && attempts.length > 1
                    ? `${absolutePointImprovement >= 0 ? '+' : ''}${absolutePointImprovement}%`
                    : `${latestScore}%`}
                </span>
                <ArrowUpRight className="h-5 w-5 text-emerald-600 stroke-[2.5]" />
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {attempts.length > 1
                  ? `From Attempt 1 (${firstScore}%) to Latest (${latestScore}%)`
                  : `Attempt 1 baseline established (${latestScore}%)`}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-1 hover:border-slate-300 transition-colors">
              <span className="text-slate-500 text-xs font-semibold">4. Total Practice Time</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  {totalHours > 0 ? `${totalHours}h ` : ''}{totalMins}m
                </span>
                <Clock className="h-4 w-4 text-slate-400 -ml-0.5" />
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Voice interviews, coding & DSA rounds</p>
            </div>
          </div>
        </div>

        {/* 2. SCORE TREND CHART SECTION */}
        <div className="mt-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Score Trend Chart
              </h2>
              <p className="text-xs text-slate-500">
                Compare earlier and recent interview attempts over time to see score gains.
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 shadow-2xs">
              <span className="text-slate-400 text-[10px] uppercase font-semibold mr-1">Trend:</span>
              {attempts.map((att, i) => (
                <React.Fragment key={i}>
                  <span
                    className={`font-black ${
                      i === attempts.length - 1
                        ? 'text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded'
                        : i === 0
                        ? 'text-slate-600'
                        : 'text-orange-600'
                    }`}
                  >
                    {att.score}
                  </span>
                  {i < attempts.length - 1 && (
                    <span className="text-slate-300 font-bold">•</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">Overall Score Trajectory</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      (0 to 100 Scale)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#F95721]" />
                    <span className="font-semibold text-slate-700">Mock Score</span>
                  </div>
                </div>

                <div className="relative w-full overflow-x-auto pt-5 pb-2">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-52 select-none overflow-visible"
                  >
                    <defs>
                      <linearGradient id="scoreTrendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F95721" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#F95721" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {[100, 75, 50, 25, 0].map((val) => {
                      const y = chartHeight - paddingY - (val / 100) * (chartHeight - paddingY * 2);
                      return (
                        <g key={val}>
                          <line
                            x1={paddingX}
                            y1={y}
                            x2={chartWidth - paddingX}
                            y2={y}
                            stroke="#F1F5F9"
                            strokeWidth="1.2"
                          />
                          <text
                            x={paddingX - 10}
                            y={y + 3.5}
                            textAnchor="end"
                            className="text-[10px] fill-slate-400 font-medium"
                          >
                            {val}%
                          </text>
                        </g>
                      );
                    })}
                    <path d={areaPath} fill="url(#scoreTrendGradient)" />
                    <path
                      d={pointsPath}
                      fill="none"
                      stroke="#F95721"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {points.map((p, i) => {
                      const item = attempts[i];
                      const isSelected = selectedAttemptIdx === i;
                      const isLatest = i === attempts.length - 1;
                      const prevScore = i > 0 ? attempts[i - 1].score : null;
                      const deltaFromPrev = prevScore !== null ? item.score - prevScore : 0;
                      return (
                        <g
                          key={i}
                          className="cursor-pointer transition-transform hover:scale-110"
                          onMouseEnter={() => setSelectedAttemptIdx(i)}
                          onMouseLeave={() => setSelectedAttemptIdx(null)}
                        >
                          <text
                            x={p.x}
                            y={p.y - 14}
                            textAnchor="middle"
                            className={`text-xs font-bold ${
                              isLatest ? 'fill-emerald-600 font-black' : 'fill-[#F95721]'
                            }`}
                          >
                            {item.score}%
                          </text>
                          {deltaFromPrev > 0 && (
                            <text
                              x={p.x}
                              y={p.y - 28}
                              textAnchor="middle"
                              className="text-[9px] font-bold fill-emerald-600"
                            >
                              +{deltaFromPrev}%
                            </text>
                          )}
                          {isSelected && (
                            <circle cx={p.x} y={p.y} r="12" fill="#F95721" opacity="0.25" />
                          )}
                          <circle
                            cx={p.x}
                            y={p.y}
                            r="6"
                            fill={isLatest ? '#10B981' : '#F95721'}
                            stroke="#FFFFFF"
                            strokeWidth="2.5"
                          />
                          <text
                            x={p.x}
                            y={chartHeight - 8}
                            textAnchor="middle"
                            className="text-[11px] fill-slate-500 font-semibold"
                          >
                            {item.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                  {selectedAttemptIdx !== null && (
                    <div className="absolute top-2 right-4 bg-slate-900 text-white p-3 rounded-2xl shadow-xl text-xs pointer-events-none animate-in fade-in z-20 border border-slate-700">
                      <div className="font-bold text-amber-400">
                        {attempts[selectedAttemptIdx].label}: {attempts[selectedAttemptIdx].company} • {attempts[selectedAttemptIdx].role}
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        Round: {attempts[selectedAttemptIdx].interviewType}
                      </div>
                      <div className="text-xs font-semibold mt-1">
                        Score: <span className="text-emerald-400 font-extrabold">{attempts[selectedAttemptIdx].score}%</span> ({attempts[selectedAttemptIdx].date})
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#F95721]" />
                  <span className="font-medium">
                    {attempts.length > 1
                      ? `Attempt 1 (${firstScore}%) • Latest (${latestScore}%)`
                      : attempts.length === 1
                      ? `Attempt 1 (${firstScore}%) baseline recorded`
                      : 'No sessions completed yet'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  Hover points to inspect round breakdown
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Latest Attempt</h3>
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                    {attempts.length === 0 ? 'No Attempts' : `Attempt ${attempts.length}`}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className={`text-4xl sm:text-5xl font-black tracking-tight ${
                      latestScore >= 84 ? 'text-[#10B981]' : latestScore >= 65 ? 'text-[#5452F6]' : 'text-[#F95721]'
                    }`}>
                      {latestScore}%
                    </div>
                    <p className={`text-xs font-bold mt-1 flex items-center gap-1 ${
                      latestScore >= 84 ? 'text-[#10B981]' : latestScore >= 65 ? 'text-[#5452F6]' : 'text-amber-600'
                    }`}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {latestScore >= 84
                        ? 'Placement Ready Performance!'
                        : latestScore >= 65
                        ? 'Near Ready • Focus on Improvements'
                        : 'Needs Practice on Weak Areas'}
                    </p>
                  </div>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border shadow-2xs ${
                    latestScore >= 80 ? 'bg-emerald-50 border-emerald-100 text-[#10B981]' : 'bg-orange-50 border-orange-100 text-[#F95721]'
                  }`}>
                    <Trophy className="h-7 w-7 stroke-[2.2]" />
                  </div>
                </div>
                <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="p-1 rounded-md bg-emerald-50 text-emerald-600">
                        <TrendingUp className="h-3.5 w-3.5 stroke-[2.5]" />
                      </div>
                      <span>Gain from Attempt 1 ({firstScore}%)</span>
                    </div>
                    <span className="font-black text-[#10B981] text-sm">
                      +{absolutePointImprovement}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="p-1 rounded-md bg-emerald-50 text-emerald-600">
                        <Target className="h-3.5 w-3.5 stroke-[2.5]" />
                      </div>
                      <span>Best Score (Attempt {bestAttemptNumber})</span>
                    </div>
                    <span className="font-black text-[#10B981] text-sm">
                      {bestScore}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
                    <strong className="text-slate-800">Evaluator Note:</strong> &ldquo;{attempts[attempts.length - 1]?.notes}&rdquo;
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  const rep = attempts[attempts.length - 1]?.report;
                  if (rep) onOpenReport(rep.id);
                  else if (reports.length > 0) onOpenReport(reports[0].id);
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>View Full Feedback Report</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. SKILL-WISE ANALYSIS SECTION */}
        <div className="mt-10 space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Skill-Wise Analysis
              </h2>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                5 Core Dimensions
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Individual tracking for technical knowledge, communication, problem-solving, answer structure, and relevance based on your actual responses.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-2">
            {[
              {
                title: 'Technical Knowledge',
                score: latestReport?.categoryScores?.technical ?? 0,
                earlierScore: firstReport?.categoryScores?.technical ?? 0,
                subtext: 'Core CS, algorithms, and system architecture',
                focusArea: 'Accurate terminology & Big-O complexity',
              },
              {
                title: 'Communication',
                score: latestReport?.categoryScores?.communication ?? 0,
                earlierScore: firstReport?.categoryScores?.communication ?? 0,
                subtext: 'Clarity, speech cadence & minimal filler pauses',
                focusArea: 'Vocalize thought process out loud',
              },
              {
                title: 'Problem-Solving',
                score: latestReport?.categoryScores?.problemSolving ?? 0,
                earlierScore: firstReport?.categoryScores?.problemSolving ?? 0,
                subtext: 'Edge case identification & trade-offs',
                focusArea: 'Proactive constraint clarification',
              },
              {
                title: 'Answer Structure',
                score: latestReport?.categoryScores?.accuracy ?? 0,
                earlierScore: firstReport?.categoryScores?.accuracy ?? 0,
                subtext: 'STAR methodology (Situation-Action-Result)',
                focusArea: 'Action & Results emphasized in 60%',
              },
              {
                title: 'Relevance & Confidence',
                score: latestReport?.categoryScores?.confidence ?? 0,
                earlierScore: firstReport?.categoryScores?.confidence ?? 0,
                subtext: 'Direct responses addressing the interviewer',
                focusArea: 'Address the core question directly',
              },
            ].map((skill, idx) => {
              const diff = attempts.length > 1 ? skill.score - skill.earlierScore : null;
              return (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 hover:border-indigo-300 transition-colors"
                >
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                    {skill.title}
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900">{skill.score}%</span>
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                      diff === null
                        ? 'text-slate-500 bg-slate-100'
                        : diff >= 0
                        ? 'text-emerald-600 bg-emerald-50 border border-emerald-200'
                        : 'text-rose-600 bg-rose-50 border border-rose-200'
                    }`}>
                      {diff === null ? 'Baseline' : `${diff >= 0 ? '+' : ''}${diff}%`}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${skill.score >= 70 ? 'bg-[#10B981]' : skill.score >= 40 ? 'bg-[#5452F6]' : 'bg-[#FF6433]'}`}
                      style={{ width: `${Math.max(4, skill.score)}%` }}
                    />
                  </div>
                  <div className="pt-1">
                    <p className="text-[11px] text-slate-400 leading-snug">{skill.subtext}</p>
                    <p className="text-[10px] text-indigo-600 font-semibold mt-1">
                      {skill.focusArea}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. WEAKNESS DETECTION SECTION */}
        <div className="mt-10 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80">
                <AlertTriangle className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Weakness Detection Engine
                </h3>
                <p className="text-xs text-slate-500">
                  Analysis of errors and gaps identified from your actual interview answers.
                </p>
              </div>
            </div>
            <span className="self-start sm:self-auto text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300/60 px-3 py-1 rounded-full">
              {latestReport?.drawbacks?.length || 3} Areas Requiring Attention
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {(() => {
              const isZero = (latestReport?.overallScore ?? 0) === 0;
              const drawbacks = latestReport?.drawbacks || [];
              const items = isZero ? [
                {
                  title: 'Silence During Interview / Zero Answers Provided',
                  impact: 'Critical Elimination • Detected in latest attempt',
                  description: 'You did not speak into the microphone or submit written answers for the interview questions. Evaluators cannot score technical depth or problem solving without candidate responses.',
                  fix: 'Always speak through your initial thought process out loud or type your answer before advancing. Leaving questions blank guarantees 0 marks in campus placements.',
                },
                {
                  title: 'Unassessed Technical Foundations',
                  impact: 'High Impact • Missing Technical Evidence',
                  description: 'Core computer science fundamentals, data structures, and system design could not be verified without verbal answers.',
                  fix: 'Even if you are unsure of the full solution, clarify the question constraints and explain a brute-force approach first.',
                },
                {
                  title: 'Skipped Question Decomposition',
                  impact: 'High Impact • Disqualification',
                  description: 'Questions were passed without attempting an architectural overview or step-by-step logic.',
                  fix: 'Use the 3-step formula: 1) Clarify requirements, 2) Step-by-step algorithm with Big-O complexity, 3) Edge cases.',
                },
                {
                  title: 'Incomplete Practice Session',
                  impact: 'Action Required',
                  description: 'This mock session ended without recording sufficient response data to establish your placement rating.',
                  fix: 'Click Retake Interview, enable microphone permissions, and speak your answer out loud for each prompt.',
                },
              ] : [
                {
                  title: drawbacks[0] || 'Incomplete Project Explanations',
                  impact: 'High Impact • Identified in recent session',
                  description: latestReport?.weaknesses?.[0] || 'Answers lacked concrete measurable metrics (latency reduction, queries optimized, or concurrent user scale).',
                  fix: latestReport?.improvements?.[0] || 'Apply the Google X-Y-Z formula: "Accomplished [X], measured by [Y]%, by implementing [Z]."',
                },
                {
                  title: drawbacks[1] || 'Big-O Complexity & Edge Cases Omitted',
                  impact: 'High Impact • Identified in recent session',
                  description: latestReport?.weaknesses?.[1] || 'You omitted runtime Time O(...) and memory Space O(...) bounds before explaining solutions.',
                  fix: latestReport?.improvements?.[1] || 'Always state Big-O complexity upfront within the first 30 seconds of explaining any algorithmic prompt.',
                },
                {
                  title: drawbacks[2] || 'Unclear Behavioral Structure',
                  impact: 'Medium Impact • Identified in recent session',
                  description: 'Responses spent too much time setting up the backstory rather than explaining the specific engineering actions you took.',
                  fix: 'Apply the 15-60-15s Rule: 15s on Situation, 60s on concrete personal Actions, and 15s on measurable Results.',
                },
                {
                  title: 'Premature Coding Before Constraint Clarification',
                  impact: 'Medium Impact • Campus Screening Bar',
                  description: 'Always clarify constraints (null inputs, duplicates, integer overflow) before writing code.',
                  fix: 'Dedicate the first 30 seconds to asking clarifying questions and stating boundary assumptions.',
                },
              ];
              return items.map((w, i) => (
                <div key={i} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {w.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                      {w.impact}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {w.description}
                  </p>
                  <div className="text-[11px] font-semibold text-indigo-700 bg-indigo-50/80 p-2.5 rounded-xl border border-indigo-100">
                    <strong>Placement Fix:</strong> {w.fix}
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* 5. PERSONALIZED NEXT STEPS SECTION */}
        <div className="mt-10 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 text-[#5452F6] border border-indigo-100">
                <Target className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Personalized Next Steps & Practice Questions
                </h3>
                <p className="text-xs text-slate-500">
                  Targeted drills generated from your weak areas. Check them off as you prepare.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-900">
                  {completedStepsCount} of {totalDrillsCount} Completed
                </span>
                <span className="text-[11px] text-slate-400 block">
                  ({drillProgressPercent}% drill mastery)
                </span>
              </div>
              <div className="w-24 h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-[#5452F6] rounded-full transition-all duration-300"
                  style={{ width: `${drillProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs font-semibold">
            <button
              onClick={() => setDrillsFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                drillsFilter === 'all'
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Questions ({RECOMMENDED_DRILLS.length})
            </button>
            <button
              onClick={() => setDrillsFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                drillsFilter === 'pending'
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Pending ({RECOMMENDED_DRILLS.filter(d => !completedSteps[d.id]).length})
            </button>
            <button
              onClick={() => setDrillsFilter('completed')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                drillsFilter === 'completed'
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Completed ({completedStepsCount})
            </button>
          </div>

          <div className="space-y-3">
            {filteredDrills.map((drill) => {
              const isDone = Boolean(completedSteps[drill.id]);
              return (
                <div
                  key={drill.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isDone
                      ? 'bg-emerald-50/40 border-emerald-200/90'
                      : 'bg-white border-slate-200/90 hover:border-indigo-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleStep(drill.id)}
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all cursor-pointer ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                          : 'border-slate-300 hover:border-indigo-500 bg-white'
                      }`}
                      title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {isDone && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </button>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs sm:text-sm font-bold ${
                            isDone ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {drill.question}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[10px]">
                        <span className="font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                          Fixes: {drill.weaknessTargeted}
                        </span>
                        <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {drill.category}
                        </span>
                        <span className="text-slate-400">
                          Target duration: {drill.recommendedTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => {
                        setActiveDrillModal(drill);
                        setDrillPracticeInput('');
                        setDrillPracticeFeedback(null);
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Practice Question</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. INTERVIEW HISTORY SECTION */}
        <div className="mt-10 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Interview History
                </h3>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {attempts.length} Sessions Logged
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Displaying date, role, interview type, score, with direct links to view feedback reports or replay voice recordings.
              </p>
            </div>
            <button
              onClick={onStartNewMock}
              className="text-xs font-bold text-white bg-[#5452F6] hover:bg-[#4341E8] px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>Start New Interview</span>
            </button>
          </div>
          <div className="overflow-x-auto pt-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="pb-3 pl-2">Attempt</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Interview Type</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.slice().reverse().map((att, i) => {
                  const rep = att.report;
                  return (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pl-2 font-bold text-slate-900">
                        {att.label}
                      </td>
                      <td className="py-3.5 text-slate-500 font-medium">
                        {att.date}
                      </td>
                      <td className="py-3.5">
                        <div className="font-bold text-slate-900">{att.role}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{att.company}</div>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-[10px]">
                          {att.interviewType}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                            att.score >= 80
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : att.score >= 60
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {att.score}/100
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-500 font-medium">
                        {Math.floor(att.durationSeconds / 60)}m {att.durationSeconds % 60}s
                      </td>
                      <td className="py-3.5 text-right pr-2 space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => {
                            if (rep) {
                              onOpenReport(rep.id);
                            } else if (reports.length > 0) {
                              onOpenReport(reports[0].id);
                            }
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer border border-indigo-100"
                        >
                          Feedback Report
                        </button>
                        <button
                          onClick={() => setReplayModalReport(rep || reports[0] || null)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border border-slate-200"
                          title="Replay candidate vocal recording and AI transcript feedback"
                        >
                          Replay Recording
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Retake Interview Bottom Action CTA */}
        <div className="mt-12 flex flex-col items-center justify-center text-center space-y-3">
          <button
            onClick={onRetake}
            className="px-10 py-4 rounded-2xl bg-[#FF6433] hover:bg-[#E85526] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2.5 cursor-pointer"
          >
            <RefreshCw className="h-5 w-5 stroke-[2.5]" />
            <span>Retake Interview</span>
          </button>
          <p className="text-xs text-slate-500 font-medium">
            Keep practicing to reinforce your weak areas and boost your placement chances!
          </p>
        </div>
      </div>

      {/* MODAL 1: Recording Replay Modal */}
      {replayModalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full space-y-5 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-[#5452F6]">
                  <Volume2 className="h-5 w-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Interview Session Recording & Spoken Transcript
                  </h3>
                  <p className="text-xs text-slate-500">
                    {replayModalReport.company} • {replayModalReport.role} ({replayModalReport.overallScore}% overall score)
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setReplayModalReport(null);
                  setPlayingAudioIndex(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Review your recorded oral responses and evaluator transcript breakdown question-by-question:
              </p>
              <div className="space-y-3">
                {(replayModalReport.questionBreakdown || []).map((q, idx) => {
                  const isPlaying = playingAudioIndex === idx;
                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600">Question {q.questionNumber}</span>
                        <span className="text-xs font-black text-slate-800">{q.score}% Score</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900">{q.question}</p>
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Your Spoken Answer:
                          </span>
                          <button
                            onClick={() => setPlayingAudioIndex(isPlaying ? null : idx)}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer bg-indigo-50 px-2 py-0.5 rounded-md"
                          >
                            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 fill-current" />}
                            <span>{isPlaying ? 'Pause Audio' : 'Play Voice Recording'}</span>
                          </button>
                        </div>
                        <p className="italic text-slate-800">&ldquo;{q.candidateAnswer}&rdquo;</p>
                        {isPlaying && (
                          <div className="flex items-center gap-1 pt-1.5 border-t border-slate-100">
                            <span className="h-3 w-1 bg-indigo-500 rounded-full animate-bounce" />
                            <span className="h-5 w-1 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.1s]" />
                            <span className="h-2 w-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="h-6 w-1 bg-indigo-700 rounded-full animate-bounce [animation-delay:0.15s]" />
                            <span className="h-4 w-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.05s]" />
                            <span className="h-2 w-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.25s]" />
                            <span className="text-[10px] text-indigo-600 font-semibold pl-2">
                              Playing speech audio playback...
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 bg-white/60 p-2.5 rounded-lg border border-slate-200/60">
                        <strong className="text-slate-800">AI Feedback:</strong> {q.feedback}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setReplayModalReport(null);
                  setPlayingAudioIndex(null);
                }}
                className="py-2.5 px-5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                Close Replay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Interactive Drill Practice Modal */}
      {activeDrillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-[#5452F6]">
                  <Sparkles className="h-5 w-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Targeted Practice Drill
                  </h3>
                  <p className="text-xs text-rose-600 font-semibold">
                    Fixes: {activeDrillModal.weaknessTargeted}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveDrillModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  Recommended Question:
                </span>
                <p className="text-sm font-bold text-slate-900">{activeDrillModal.question}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  <strong>Framework:</strong> {activeDrillModal.idealFramework}
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Type or draft your answer key points (or say them aloud):
                </label>
                <textarea
                  value={drillPracticeInput}
                  onChange={(e) => setDrillPracticeInput(e.target.value)}
                  placeholder="Draft your answer here following the recommended framework..."
                  rows={4}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                />
              </div>
              {drillPracticeFeedback && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  <p className="font-semibold">{drillPracticeFeedback}</p>
                </div>
              )}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-slate-600">
                <span className="font-bold text-slate-800">Key Points to Include:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  {activeDrillModal.sampleKeyPoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  toggleStep(activeDrillModal.id);
                  setActiveDrillModal(null);
                }}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Mark as Completed
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveDrillModal(null)}
                  className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handleSimulateDrillSubmit}
                  className="py-2 px-4 rounded-xl bg-[#5452F6] hover:bg-[#4341E8] text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  Evaluate Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
