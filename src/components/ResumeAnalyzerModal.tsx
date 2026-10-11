import React, { useState, useRef } from 'react';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Play,
  Upload,
  RefreshCw,
  Award,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Target,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldAlert,
  Flame,
  FileCheck,
  X,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import JSZip from 'jszip';
import {
  InterviewSession,
  ResumeDeepAnalysis,
  ResumeQuestionItem,
  StudentProfile,
} from '../types';
import {
  SAMPLE_RESUME_CS,
  SAMPLE_RESUME_DATA,
  saveProfile,
} from '../lib/storage';
import {
  analyzeResumeTextLocally,
  createResumeInterviewSession,
} from '../lib/resumeAnalyzerEngine';
import { extractTextFromPdf } from '../lib/pdfTextExtractor';

interface ResumeAnalyzerModalProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  onLaunchTailoredMock: (parsedSkills: string[], resumeText: string) => void;
  onStartResumeInterview?: (session: InterviewSession) => void;
}

const SAMPLE_RESUME_FULLSTACK = `VIKAS PATEL
Email: vikas.patel@tech.edu | GitHub: github.com/vikas-code | Portfolio: vikasdev.io
B.Tech in Computer Science & Engineering, 2022 - 2026, CGPA: 8.4/10

TECHNICAL SKILLS:
- Languages: JavaScript, TypeScript, Python, SQL, HTML/CSS
- Frontend: React, Next.js, Redux, Tailwind CSS
- Backend: Node.js, Express, PostgreSQL, MongoDB, Redis
- Cloud & DevOps: Docker, Git, CI/CD, AWS (S3, EC2), Postman

PROJECTS:
1. CloudPulse - Microservices System Monitor:
- Built a web dashboard for monitoring server health metrics using React and Express.
- Worked on database queries to fetch server logs and display CPU utilization.
- Deployed on AWS EC2 and configured Nginx reverse proxy.

2. QuickCommerce - Grocery Delivery Platform:
- Developed a grocery shopping application with shopping cart and user authentication.
- Used MongoDB for storing products and Stripe API for payment integration.
- Tested endpoints using Postman and implemented basic error handling.

EXPERIENCE:
- Web Development Intern at TechSolutions (Summer 2024):
  - Assisted team with building UI pages using React.
  - Fixed frontend styling issues and updated documentation.`;

const TARGET_ROLES = [
  'Software Development Engineer (SDE-1)',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'AI / ML Engineer',
];

export const ResumeAnalyzerModal: React.FC<ResumeAnalyzerModalProps> = ({
  profile,
  onUpdateProfile,
  onLaunchTailoredMock,
  onStartResumeInterview,
}) => {
  const [resumeText, setResumeText] = useState(profile.resumeText || SAMPLE_RESUME_CS);
  const [selectedRole, setSelectedRole] = useState(
    profile.targetRole || 'Software Development Engineer (SDE-1)'
  );
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [activeInputTab, setActiveInputTab] = useState<'upload' | 'text'>('upload');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('Ready');
  const [analysisResult, setAnalysisResult] = useState<ResumeDeepAnalysis | null>(() => {
    // Initialize baseline analysis if resumeText exists
    if (profile.resumeText) {
      return analyzeResumeTextLocally(profile.resumeText, selectedRole);
    }
    return null;
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [activeFeedbackTab, setActiveFeedbackTab] = useState<'lacking' | 'questions' | 'bullets' | 'skills'>('lacking');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  // Extract text from DOCX
  const extractTextFromDocx = async (file: File): Promise<string> => {
    try {
      const zip = new JSZip();
      const loaded = await zip.loadAsync(file);
      const docXml = await loaded.file('word/document.xml')?.async('text');
      if (!docXml) return '';
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(docXml, 'application/xml');
      const paragraphs = xmlDoc.getElementsByTagName('w:p');
      const lines: string[] = [];
      for (let i = 0; i < paragraphs.length; i++) {
        const textNodes = paragraphs[i].getElementsByTagName('w:t');
        let line = '';
        for (let j = 0; j < textNodes.length; j++) {
          line += textNodes[j].textContent || '';
        }
        if (line.trim()) lines.push(line.trim());
      }
      return lines.join('\n');
    } catch (err) {
      console.warn('DOCX parsing error, falling back to basic reader', err);
      return '';
    }
  };

  // Reusable analysis trigger that works with both local and API intelligence
  const triggerAnalysis = async (
    textToAnalyze: string,
    b64Data?: string | null,
    fileName?: string | null,
    roleTarget?: string
  ) => {
    const role = roleTarget || selectedRole;
    setIsAnalyzing(true);
    setAnalysisStep('1/3 Extracting resume projects, technologies & experience...');

    try {
      const payload: any = {
        resumeText: textToAnalyze.trim(),
        targetRole: role,
      };

      if (b64Data) {
        payload.fileData = b64Data;
        payload.mimeType = 'application/pdf';
        payload.fileName = fileName || 'resume.pdf';
      }

      setAnalysisStep('2/3 Auditing ATS shortcomings, missing metrics & skill gaps...');

      // Run local analysis immediately so user never waits with an empty screen
      const localHeuristic = analyzeResumeTextLocally(
        textToAnalyze.trim() || 'Candidate Software Engineering Resume',
        role
      );

      // Attempt server-side Gemini enhancement with abort controller
      let finalResult = localHeuristic;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch('/api/parse-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify(payload),
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const apiData = await res.json();
          if (apiData && (apiData.extractedSkills || apiData.lackingAreas)) {
            finalResult = apiData;
          }
        }
      } catch (_apiErr) {
        // Smoothly fall back to rich local analysis
      }

      setAnalysisStep('3/3 Generating project-tailored interview questions...');
      setAnalysisResult(finalResult);

      if (finalResult?.extractedSkills) {
        const updatedProfile: StudentProfile = {
          ...profile,
          resumeText: textToAnalyze || profile.resumeText,
          extractedSkills: finalResult.extractedSkills,
          targetRole: finalResult.recommendedRole || role,
        };
        onUpdateProfile(updatedProfile);
        saveProfile(updatedProfile);
      }

      // Automatically focus on where they are lacking
      setActiveFeedbackTab('lacking');

      // Scroll to results smoothly
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (e) {
      console.error('Error during resume analysis:', e);
      const fallback = analyzeResumeTextLocally(textToAnalyze, role);
      setAnalysisResult(fallback);
      setActiveFeedbackTab('lacking');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('Ready');
    }
  };

  // Handle file selection (PDF, DOCX, TXT, MD) - AUTOMATICALLY ANALYZES!
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploadedFileName(file.name);
    setUploadedFileSize((file.size / 1024).toFixed(1) + ' KB');
    setIsAnalyzing(true);
    setAnalysisStep('Reading uploaded resume file...');

    const extension = file.name.split('.').pop()?.toLowerCase();
    let text = '';
    let b64: string | null = null;

    if (extension === 'docx') {
      text = await extractTextFromDocx(file);
      setResumeText(text);
      setPdfBase64(null);
    } else if (extension === 'pdf') {
      // 1. Extract text via lightweight in-browser PDF stream reader
      const extracted = await extractTextFromPdf(file);
      text = extracted;
      // 2. Also obtain data URL
      b64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || '');
        reader.readAsDataURL(file);
      });
      setPdfBase64(b64);
      setResumeText(text || `[PDF Document: ${file.name}]`);
    } else {
      // Plain text or markdown
      text = await file.text();
      setResumeText(text);
      setPdfBase64(null);
    }

    // AUTOMATICALLY analyze the uploaded resume immediately!
    await triggerAnalysis(text || `[Document: ${file.name}]`, b64, file.name, selectedRole);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() && !pdfBase64) return;
    await triggerAnalysis(resumeText, pdfBase64, uploadedFileName, selectedRole);
  };

  const handleRoleChange = async (newRole: string) => {
    setSelectedRole(newRole);
    if (resumeText.trim() || pdfBase64) {
      await triggerAnalysis(resumeText, pdfBase64, uploadedFileName, newRole);
    }
  };

  const handleUseSample = async (type: 'cs' | 'fullstack' | 'data') => {
    let text = SAMPLE_RESUME_CS;
    let role = 'Software Development Engineer (SDE-1)';
    if (type === 'data') {
      text = SAMPLE_RESUME_DATA;
      role = 'Data Analyst';
    } else if (type === 'fullstack') {
      text = SAMPLE_RESUME_FULLSTACK;
      role = 'Full Stack Developer';
    }
    setResumeText(text);
    setSelectedRole(role);
    setUploadedFileName(null);
    setPdfBase64(null);
    await triggerAnalysis(text, null, null, role);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartResumeInterview = (questionToFocus?: ResumeQuestionItem) => {
    if (!analysisResult) return;
    const session = createResumeInterviewSession(
      analysisResult,
      resumeText,
      selectedRole,
      'Technical Interviewer'
    );

    if (questionToFocus) {
      // Re-order so the chosen question is first
      session.resumeQuestions = [
        questionToFocus,
        ...analysisResult.tailoredQuestions.filter((q) => q.id !== questionToFocus.id),
      ];
    }

    if (onStartResumeInterview) {
      onStartResumeInterview(session);
    } else {
      onLaunchTailoredMock(analysisResult.extractedSkills, resumeText);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <FileText className="h-5 w-5 stroke-[2]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  AI Resume Intelligence &amp; Interview Questions
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Upload your resume to uncover where you are lacking, get concrete bullet rewrites, and practice customized interview questions based on your experience.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Target Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-2xs focus:border-indigo-600 focus:outline-none cursor-pointer"
            >
              {TARGET_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Upload & Input Section */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <button
                onClick={() => setActiveInputTab('upload')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeInputTab === 'upload'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                📁 Upload Document (PDF / DOCX / TXT)
              </button>
              <button
                onClick={() => setActiveInputTab('text')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeInputTab === 'text'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                ✏️ Paste / Edit Resume Text
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="text-slate-400">Sample Resumes:</span>
              <button
                onClick={() => handleUseSample('cs')}
                className="text-indigo-600 hover:underline font-semibold cursor-pointer"
              >
                CS SDE
              </button>
              <span>•</span>
              <button
                onClick={() => handleUseSample('fullstack')}
                className="text-indigo-600 hover:underline font-semibold cursor-pointer"
              >
                Full-Stack
              </button>
              <span>•</span>
              <button
                onClick={() => handleUseSample('data')}
                className="text-indigo-600 hover:underline font-semibold cursor-pointer"
              >
                Data Analyst
              </button>
            </div>
          </div>

          {activeInputTab === 'upload' ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                uploadedFileName
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f);
                }}
                className="hidden"
              />

              {isAnalyzing ? (
                <div className="space-y-3 py-4">
                  <div className="h-14 w-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-[#5452F6] mx-auto flex items-center justify-center animate-pulse">
                    <Loader2 className="h-7 w-7 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">
                      Analyzing Resume with AI Placement Bar Raiser...
                    </h4>
                    <p className="text-xs font-bold text-[#5452F6] animate-pulse">
                      {analysisStep}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Detecting shortcoming areas, extracting skills &amp; projects, and synthesizing tailored questions.
                    </p>
                  </div>
                </div>
              ) : uploadedFileName ? (
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <FileCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{uploadedFileName}</h4>
                    <p className="text-xs text-slate-500">
                      {uploadedFileSize} • File loaded &amp; analyzed successfully
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="text-xs font-bold text-indigo-600 hover:underline pt-1 inline-block"
                  >
                    Upload different resume
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Drop your resume here, or <span className="text-indigo-600 underline">browse</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Supports PDF (.pdf), Microsoft Word (.docx), or Text (.txt, .md) • Auto-analyzed on upload
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <textarea
              rows={8}
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                setUploadedFileName(null);
                setPdfBase64(null);
              }}
              placeholder="Paste your resume content here: Education, Skills, Projects, and Work History..."
              className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-xs font-mono focus:border-indigo-500 focus:outline-none resize-none leading-relaxed text-slate-800"
            />
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-400">
              Evaluated against real campus hiring rubrics, ATS criteria, and interview standards.
            </span>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!resumeText.trim() && !pdfBase64)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#5452F6] hover:bg-[#4341E8] text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{analysisStep.split(' ')[0]} Analyzing Resume...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Analyze Resume &amp; Generate Tailored Questions</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Area */}
        {analysisResult && (
          <div ref={resultsRef} className="space-y-6 animate-in fade-in">
            {/* Navigation Tabs for Deep Feedback & Questions */}
            <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveFeedbackTab('lacking')}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeFeedbackTab === 'lacking'
                    ? 'border-rose-600 text-rose-700 bg-rose-50/50 rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldAlert className="h-4 w-4 text-rose-600" />
                <span>Where You Are Lacking ({analysisResult.lackingAreas.length})</span>
              </button>

              <button
                onClick={() => setActiveFeedbackTab('questions')}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeFeedbackTab === 'questions'
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <HelpCircle className="h-4 w-4 text-indigo-600" />
                <span>Resume-Based Interview Questions ({analysisResult.tailoredQuestions.length})</span>
              </button>

              <button
                onClick={() => setActiveFeedbackTab('bullets')}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeFeedbackTab === 'bullets'
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Before &amp; After Bullet Rewrites ({analysisResult.bulletPointImprovements.length})</span>
              </button>

              <button
                onClick={() => setActiveFeedbackTab('skills')}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeFeedbackTab === 'skills'
                    ? 'border-amber-600 text-amber-700 bg-amber-50/50 rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Target className="h-4 w-4 text-amber-600" />
                <span>Missing Industry Skills ({analysisResult.missingSkillsForRole.length})</span>
              </button>
            </div>

            {/* TAB 1: Where the User is Lacking (Deep Feedback) */}
            {activeFeedbackTab === 'lacking' && (
              <div className="space-y-4">
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-900 flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm">Critical Resume Shortcomings &amp; Deficiencies</h4>
                    <p className="leading-relaxed">
                      These are the specific blind spots, missing metrics, and passive statements that cause technical recruiters to filter out your resume before reaching the interview stage.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {analysisResult.lackingAreas.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm hover:border-slate-300 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              item.severity === 'Critical'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : item.severity === 'High'
                                ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {item.severity} Shortcoming
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {item.category}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-400">
                          Issue #{idx + 1}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-slate-900">{item.title}</h4>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1">
                          {item.description}
                        </p>
                      </div>

                      {/* Excerpt vs Improved */}
                      <div className="grid sm:grid-cols-2 gap-3 pt-2">
                        {item.currentExcerpt && (
                          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3 space-y-1">
                            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                              ❌ What&apos;s Currently In Your Resume:
                            </span>
                            <p className="text-xs font-mono text-rose-950 italic">
                              &ldquo;{item.currentExcerpt}&rdquo;
                            </p>
                          </div>
                        )}

                        {item.improvedVersion && (
                          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 space-y-1 relative">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                                ✅ How to Fix &amp; Rewrite:
                              </span>
                              <button
                                onClick={() => handleCopy(item.improvedVersion || '', item.id)}
                                className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                              >
                                {copiedId === item.id ? (
                                  <>
                                    <Check className="h-3 w-3" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    <span>Copy Fix</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-xs text-emerald-950 font-medium">
                              {item.improvedVersion}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-2 flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-bold text-slate-700">Recruiter Bar:</span>
                        <span>{item.whyItMatters}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Priority Next Steps Checklist */}
                {analysisResult.actionableNextSteps && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                      Priority Action Plan to Fix Shortcomings
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {analysisResult.actionableNextSteps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Resume-Based Interview Questions */}
            {activeFeedbackTab === 'questions' && (
              <div className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-xs text-indigo-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm">
                        Questions Derived Directly from Your Resume Experience
                      </h4>
                      <p className="leading-relaxed">
                        Our AI analyzed your projects, tech stack, and experience gaps. Technical interviewers will ask these exact questions to verify if you truly built what is written.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartResumeInterview()}
                    className="px-4 py-2.5 rounded-xl bg-[#5452F6] hover:bg-[#4341E8] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Start Mock Interview</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {analysisResult.tailoredQuestions.map((q, idx) => {
                    const isExpanded = expandedQuestionId === q.id;
                    return (
                      <div
                        key={q.id || idx}
                        className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm hover:border-indigo-300 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-black">
                              {idx + 1}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                              {q.category}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              Stage: {q.stage}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStartResumeInterview(q)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <Play className="h-3 w-3 fill-current" />
                              <span>Practice This Question</span>
                            </button>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-slate-900 leading-snug">
                            {q.question}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                            <Target className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                            <span>{q.contextOrReason}</span>
                          </p>
                        </div>

                        {/* Hint & Keywords */}
                        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 space-y-2 text-xs">
                          <div className="flex items-start gap-2">
                            <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                            <p className="text-indigo-950 font-medium leading-relaxed">
                              <strong className="font-bold text-indigo-900">Interviewer Expectation: </strong>
                              {q.hint}
                            </p>
                          </div>

                          {q.expectedKeywords && q.expectedKeywords.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[10px] font-bold text-indigo-800 uppercase">
                                Keywords to Hit:
                              </span>
                              {q.expectedKeywords.map((k) => (
                                <span
                                  key={k}
                                  className="px-2 py-0.5 rounded-md bg-white text-indigo-700 border border-indigo-200 text-[10px] font-bold"
                                >
                                  {k}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Expandable Model Answer / Strategy */}
                        <div>
                          <button
                            onClick={() =>
                              setExpandedQuestionId(isExpanded ? null : q.id)
                            }
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                          >
                            <span>{isExpanded ? 'Hide Preparation Strategy' : 'View High-Scoring Answer Structure'}</span>
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </button>

                          {isExpanded && (
                            <div className="mt-2 p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 space-y-2 leading-relaxed animate-in fade-in">
                              <h5 className="font-bold text-slate-900">Recommended 4-Step Response Formula:</h5>
                              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                                <li><strong>Context &amp; Architecture:</strong> State the problem, chosen tech stack, and system diagram.</li>
                                <li><strong>Engineering Hurdle:</strong> Detail a specific bottleneck (e.g. latency, race conditions, memory bounds).</li>
                                <li><strong>Trade-Offs Made:</strong> Explain why alternative libraries or designs were rejected.</li>
                                <li><strong>Quantified Impact:</strong> Conclude with numbers (e.g., &ldquo;Achieved 38% latency drop, verified via load testing&rdquo;).</li>
                              </ol>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: Before & After Bullet Point Rewrites */}
            {activeFeedbackTab === 'bullets' && (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm">
                      STAR &amp; Google XYZ Formula Bullet Point Rewrites
                    </h4>
                    <p className="leading-relaxed">
                      Transform passive project descriptions into high-impact engineering accomplishments. Copy these rewrites directly into your resume to immediately elevate your callback rate.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {analysisResult.bulletPointImprovements.map((b, idx) => (
                    <div
                      key={b.id || idx}
                      className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Bullet Point #{idx + 1} Rewrite
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200">
                          {b.impactGain}
                        </span>
                      </div>

                      {/* Before: Weak Bullet */}
                      <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3.5 space-y-1">
                        <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                          ❌ Original / Weak Phrasing:
                        </span>
                        <p className="text-xs font-mono text-rose-950">
                          &ldquo;{b.original}&rdquo;
                        </p>
                        <p className="text-[11px] text-rose-800 italic pt-1">
                          Deficiency: {b.critique}
                        </p>
                      </div>

                      {/* After: High-Impact Rewrite */}
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 space-y-2 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                            ✅ Optimized ATS &amp; Metric-Driven Rewrite:
                          </span>
                          <button
                            onClick={() => handleCopy(b.improved, b.id)}
                            className="text-xs text-emerald-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            {copiedId === b.id ? (
                              <>
                                <Check className="h-3 w-3" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy Rewrite</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-emerald-950 leading-relaxed">
                          • {b.improved}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Missing Skills for Role */}
            {activeFeedbackTab === 'skills' && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
                  <Target className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm">
                      Missing High-Demand Skills for {analysisResult.recommendedRole}
                    </h4>
                    <p className="leading-relaxed">
                      Recruiters filter by keywords. Adding proof of these tools and concepts in your projects will ensure you pass automated ATS screenings.
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Missing Skills */}
                  <div className="rounded-2xl border border-rose-200 bg-white p-5 space-y-3 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4" />
                      Missing from Your Profile ({analysisResult.missingSkillsForRole.length})
                    </h4>
                    <p className="text-xs text-slate-500">
                      Standard industry tools expected for this role not detected in your resume:
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {analysisResult.missingSkillsForRole.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold"
                        >
                          + {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Extracted Skills */}
                  <div className="rounded-2xl border border-emerald-200 bg-white p-5 space-y-3 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Detected Skills ({analysisResult.extractedSkills.length})
                    </h4>
                    <p className="text-xs text-slate-500">
                      Technologies successfully recognized from your resume:
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1 max-h-48 overflow-y-auto">
                      {analysisResult.extractedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Detected Projects Breakdown */}
                {analysisResult.projectsDetected && analysisResult.projectsDetected.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Flagship Projects Evaluated by AI
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {analysisResult.projectsDetected.map((p, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-2"
                        >
                          <h5 className="font-bold text-sm text-slate-900">{p.name}</h5>
                          <div className="flex flex-wrap gap-1">
                            {p.techStack.map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.5 rounded bg-white text-slate-600 text-[10px] font-bold border border-slate-200"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-slate-600">{p.assessment}</p>
                          <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium">
                            Critique: {p.critique}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
