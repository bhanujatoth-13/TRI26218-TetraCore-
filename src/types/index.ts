export type InterviewMode = 'quick' | 'full' | 'company' | 'remediation';
export type DifficultyLevel = 'Campus / Entry' | 'Intermediate' | 'Advanced';

export interface InterviewerProfile {
  id: 'aria' | 'alex' | 'elena';
  name: string;
  title: string;
  avatar: string;
  tone: string;
  description: string;
  accent: string;
}

export interface RemediationQuestion {
  question: string;
  stage: string;
  coachingTip: string;
  drillGoal: string;
  expectedKeyTerms?: string[];
}

export interface RootCauseDiagnosis {
  category: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium';
  explanation: string;
  evidenceQuote?: string;
  marksDeductedApprox?: number;
  remediationFocus: string;
  simpleTitle?: string;
  simpleExplanation?: string;
  simpleFix?: string;
}


export interface RemediationSessionPlan {
  weaknessTargeted: string;
  sessionTitle: string;
  description: string;
  focusArea: string;
  targetScoreGoal: number;
  coachingFormula: string;
  questions: RemediationQuestion[];
}

export interface ResumeWeaknessItem {
  id: string;
  category: 'Quantification' | 'Missing Skills' | 'Action Verbs' | 'Formatting/ATS' | 'Project Depth' | 'Testing & Reliability';
  severity: 'Critical' | 'High' | 'Medium';
  title: string;
  description: string;
  currentExcerpt?: string;
  improvedVersion?: string;
  whyItMatters: string;
}

export interface ResumeBulletImprovement {
  id: string;
  original: string;
  improved: string;
  critique: string;
  impactGain: string;
}

export interface ResumeProjectDetected {
  name: string;
  techStack: string[];
  assessment: string;
  critique: string;
}

export interface ResumeQuestionItem {
  id: string;
  category: 'Project Deep Dive' | 'Skill Verification' | 'Addressing Weakness' | 'Behavioral';
  question: string;
  contextOrReason: string;
  stage: 'resume' | 'technical' | 'dsa' | 'system_design' | 'behavioral';
  hint: string;
  expectedKeywords: string[];
}

export interface ResumeDeepAnalysis {
  candidateName: string;
  recommendedRole: string;
  summary: string;
  atsScore: number;
  atsScoreBreakdown: {
    quantification: number;
    skillRelevance: number;
    depthAndImpact: number;
    clarityAndFormat: number;
  };
  extractedSkills: string[];
  missingSkillsForRole: string[];
  projectsDetected: ResumeProjectDetected[];
  lackingAreas: ResumeWeaknessItem[];
  bulletPointImprovements: ResumeBulletImprovement[];
  tailoredQuestions: ResumeQuestionItem[];
  overallCritique: string;
  actionableNextSteps: string[];
}

export interface InterviewSession {
  id: string;
  mode: InterviewMode;
  title: string;
  role: string;
  company: string;
  difficulty: DifficultyLevel;
  interviewer: InterviewerProfile;
  topics: string[];
  resumeText?: string;
  candidateSkills?: string[];
  createdAt: number;
  completedAt?: number;
  status: 'setup' | 'in_progress' | 'completed';
  totalQuestions: number;
  permissionsApproved?: boolean;
  // Candidate identity
  candidateName?: string;
  candidateEmail?: string;
  candidateCollege?: string;
  // Remediation-specific fields
  isRemediation?: boolean;
  remediationFocus?: string;
  targetWeakness?: string;
  customQuestions?: RemediationQuestion[];
  // Resume-driven interview fields
  isResumeBased?: boolean;
  resumeQuestions?: ResumeQuestionItem[];
  resumeAnalysis?: ResumeDeepAnalysis;
}

export interface ChatMessage {
  id: string;
  role: 'interviewer' | 'candidate' | 'system';
  content: string;
  question?: string;
  stage?: 'warmup' | 'resume' | 'technical' | 'dsa' | 'system_design' | 'behavioral' | 'wrapup';
  isFollowUp?: boolean;
  codePrompt?: string;
  codeAnswer?: string;
  hint?: string;
  timestamp: number;
}

export interface QuestionEvaluation {
  questionNumber: number;
  stage: string;
  question: string;
  candidateAnswer: string;
  score: number; // Score out of 100
  feedback: string;
  missingConcepts?: string[]; // Concepts the candidate omitted or missed
  whyItNeedsImprovement?: string; // Clear explanation of why the answer fell short
  drawbacks?: string[];
  improvements?: string[];
  sampleAnswer: string; // Stronger model answer
  rootCause?: string; // Pinpointed reason for score loss on this question
}

export interface LearningResource {
  title: string;
  type: 'Article' | 'Practice' | 'Video' | 'Framework';
  description: string;
  linkOrKeyTakeaway: string;
}

export interface EvaluationReport {
  id: string;
  sessionId: string;
  role: string;
  company: string;
  difficulty: DifficultyLevel;
  overallScore: number;
  performanceTier: 'Placement Ready' | 'Near Ready' | 'Needs Focused Practice';
  categoryScores: {
    technical: number;
    communication: number;
    problemSolving: number;
    confidence: number;
    accuracy: number;
  };
  strengths: string[];
  weaknesses: string[];
  drawbacks?: string[];
  improvements?: string[];
  // AI Root Cause Diagnosis & Remediation Plan
  rootCauses?: RootCauseDiagnosis[];
  remediationPlan?: RemediationSessionPlan;
  questionBreakdown: QuestionEvaluation[];
  recommendedResources: LearningResource[];
  interviewerVerdict: string;
  companyFitScore: number;
  proctorTrustScore: number;
  tabSwitches: number;
  completedAt: number;
  durationSeconds: number;
}

export interface StudentProfile {
  name: string;
  college: string;
  graduationYear: string;
  targetRole: string;
  targetCompany: string;
  resumeText: string;
  extractedSkills: string[];
  streakDays: number;
}
