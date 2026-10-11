import React, { useState } from 'react';
import {
  X,
  Sparkles,
  FileText,
  Building2,
  Briefcase,
  Layers,
  Check,
  Loader2,
  ArrowRight,
  Flame,
  UserCheck
} from 'lucide-react';
import {
  InterviewMode,
  DifficultyLevel,
  InterviewerProfile,
  InterviewSession
} from '../types';
import {
  INTERVIEWERS,
  SAMPLE_RESUME_CS,
  SAMPLE_RESUME_DATA,
  saveSession
} from '../lib/storage';

interface InterviewSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (session: InterviewSession) => void;
  initialPreset?: {
    mode?: InterviewMode;
    role?: string;
    company?: string;
    topics?: string[];
  };
}

const AVAILABLE_TOPICS = [
  'HR',
  'Technical',
  'DSA',
  'System Design',
  'Aptitude',
  'Communication',
  'Resume',
];

const POPULAR_COMPANIES = [
  'TCS',
  'Infosys',
  'Wipro',
  'Google',
  'Microsoft',
  'Amazon',
  'Meta',
  'Accenture',
  'Flipkart',
  'General Tech',
];

const POPULAR_ROLES = [
  'Software Development Engineer (SDE-1)',
  'Frontend Engineer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'Cloud / DevOps Engineer',
];

export const InterviewSetupModal: React.FC<InterviewSetupModalProps> = ({
  isOpen,
  onClose,
  onStartSession,
  initialPreset,
}) => {
  const [mode, setMode] = useState<InterviewMode>(initialPreset?.mode || 'full');
  const [company, setCompany] = useState<string>(initialPreset?.company || 'TCS');
  const [role, setRole] = useState<string>(initialPreset?.role || 'Software Development Engineer (SDE-1)');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Campus / Entry');
  const [selectedInterviewer, setSelectedInterviewer] = useState<InterviewerProfile>(INTERVIEWERS[0]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    initialPreset?.topics || ['HR', 'Technical', 'DSA', 'Resume']
  );
  const [resumeText, setResumeText] = useState<string>('');
  const [isParsingResume, setIsParsingResume] = useState<boolean>(false);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      if (selectedTopics.length > 1) {
        setSelectedTopics(selectedTopics.filter((t) => t !== topic));
      }
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleParseResume = async (textToParse: string) => {
    if (!textToParse.trim()) return;
    setIsParsingResume(true);
    try {
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: textToParse }),
      });
      const data = await res.json();
      if (data?.skills) {
        setExtractedSkills(data.skills);
      }
      if (data?.suggestedTopics && Array.isArray(data.suggestedTopics)) {
        const merged = Array.from(new Set([...selectedTopics, 'Resume', ...data.suggestedTopics]));
        setSelectedTopics(merged.filter((t) => AVAILABLE_TOPICS.includes(t)));
      }
      if (data?.recommendedRole) {
        setRole(data.recommendedRole);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsParsingResume(false);
    }
  };

  const handleInsertSample = (type: 'cs' | 'data') => {
    const text = type === 'cs' ? SAMPLE_RESUME_CS : SAMPLE_RESUME_DATA;
    setResumeText(text);
    handleParseResume(text);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setResumeText(content);
        handleParseResume(content);
      }
    };
    reader.readAsText(file);
  };

  const handleLaunch = () => {
    const totalQuestions = mode === 'quick' ? 3 : mode === 'company' ? 4 : 5;
    const newSession: InterviewSession = {
      id: 'sess-' + Date.now(),
      mode,
      title: `${company} ${role} Mock`,
      role,
      company,
      difficulty,
      interviewer: selectedInterviewer,
      topics: selectedTopics,
      resumeText: resumeText.trim() || undefined,
      candidateSkills: extractedSkills.length > 0 ? extractedSkills : undefined,
      createdAt: Date.now(),
      status: 'in_progress',
      totalQuestions,
    };
    saveSession(newSession);
    onStartSession(newSession);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
            Interview Studio
          </span>
          <span className="text-xs text-slate-500">• Campus 2026 Engine</span>
        </div>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Configure Your Mock Interview
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Customize your role, company style, AI interviewer persona, and upload your resume for personalized technical questions.
        </p>

        <div className="mt-6 space-y-6">
          {/* Mode Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Select Practice Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setMode('quick')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  mode === 'quick'
                    ? 'border-[#5452F6] bg-indigo-50/60 ring-1 ring-[#5452F6]'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">Quick Practice</span>
                  {mode === 'quick' && <Check className="h-4 w-4 text-[#5452F6]" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">10-minute rapid warm-up (3 questions)</p>
              </button>
              <button
                type="button"
                onClick={() => setMode('full')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  mode === 'full'
                    ? 'border-[#5452F6] bg-indigo-50/60 ring-1 ring-[#5452F6]'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">Full Mock</span>
                  {mode === 'full' && <Check className="h-4 w-4 text-[#5452F6]" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">Multi-stage HR + Technical + DSA (5 questions)</p>
              </button>
              <button
                type="button"
                onClick={() => setMode('company')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  mode === 'company'
                    ? 'border-[#5452F6] bg-indigo-50/60 ring-1 ring-[#5452F6]'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">Company Track</span>
                  {mode === 'company' && <Check className="h-4 w-4 text-[#5452F6]" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">TCS, Google, Amazon recruiter pattern</p>
              </button>
            </div>
          </div>

          {/* Company & Role */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Target Company
              </label>
              <div className="relative">
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {POPULAR_COMPANIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Target Job Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {POPULAR_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Difficulty & Interviewer */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Campus / Entry', 'Intermediate', 'Advanced'] as DifficultyLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-2 px-1 text-center rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      difficulty === lvl
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {lvl.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                AI Interviewer Persona
              </label>
              <div className="flex gap-2">
                {INTERVIEWERS.map((inv) => (
                  <button
                    key={inv.id}
                    type="button"
                    onClick={() => setSelectedInterviewer(inv)}
                    className={`flex-1 p-2 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer ${
                      selectedInterviewer.id === inv.id
                        ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {inv.name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate text-slate-900">{inv.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{inv.tone.split(',')[0]}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Topics Included */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Topics & Rounds to Cover
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TOPICS.map((topic) => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                    <span>{topic}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resume Upload / Input Section */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-semibold text-slate-900">Resume Context (Optional for tailored questions)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleInsertSample('cs')}
                  className="text-indigo-600 hover:underline font-semibold cursor-pointer"
                >
                  + Sample CS Resume
                </button>
                <span>|</span>
                <button
                  type="button"
                  onClick={() => handleInsertSample('data')}
                  className="text-indigo-600 hover:underline font-semibold cursor-pointer"
                >
                  + Sample Data Resume
                </button>
              </div>
            </div>
            <textarea
              rows={3}
              placeholder="Paste your resume details, projects, tech stack, and achievements... AI will extract skills and tailor questions."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs focus:border-indigo-500 focus:outline-none font-mono"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <label className="cursor-pointer text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50">
                  <span>Upload .txt or .md</span>
                  <input
                    type="file"
                    accept=".txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {resumeText.trim() && (
                  <button
                    type="button"
                    onClick={() => handleParseResume(resumeText)}
                    disabled={isParsingResume}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                  >
                    {isParsingResume ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Analyzing with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" />
                        <span>Analyze Skills</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              {extractedSkills.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <Check className="h-3.5 w-3.5" />
                  <span>{extractedSkills.length} skills parsed</span>
                </div>
              )}
            </div>
            {/* Extracted Skills badges */}
            {extractedSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200">
                {extractedSkills.map((sk) => (
                  <span
                    key={sk}
                    className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-800 border border-slate-200"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLaunch}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#5452F6] hover:bg-[#4341E8] text-white px-7 py-2.5 text-sm font-bold shadow-md shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
          >
            <span>Start {selectedInterviewer.name} Mock Interview</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
