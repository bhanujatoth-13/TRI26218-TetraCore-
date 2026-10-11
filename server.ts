import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { diagnoseRootCauses, generateRemediationPlan } from './src/lib/remediationEngine.ts';
import { analyzeResumeTextLocally } from './src/lib/resumeAnalyzerEngine.ts';
import {
  generateContextualFollowUp,
  generateNextStageQuestion,
  isQuestionAlreadyAsked,
  analyzeCandidateAnswer,
} from './src/lib/questionEngine.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
let isAiAccessDenied = false;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Check if error is access denial (403 PERMISSION_DENIED)
function handleAiError(endpoint: string, err: any) {
  const msg = err?.message || String(err);
  const status = err?.status || err?.code;
  if (status === 403 || msg.includes('PERMISSION_DENIED') || msg.includes('denied access')) {
    isAiAccessDenied = true;
    console.info(`[MockMate AI] Graceful offline engine activated for ${endpoint} (Cloud project quota/access policy fallback).`);
  } else {
    console.warn(`[MockMate AI] Local fallback applied for ${endpoint}:`, msg);
  }
}

// Helper for clean JSON extraction from Gemini output
function extractJsonFromText(text: string): any {
  try {
    const trimmed = text.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return JSON.parse(trimmed);
    }
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      return JSON.parse(match[1]);
    }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    }
  } catch (err) {
    console.error('Failed to parse JSON from AI response:', err);
  }
  return null;
}

// Timeout helper to guarantee fast responses and prevent UI hangs
async function withTimeout<T>(promise: Promise<T>, ms: number = 3500): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout after ${ms}ms`));
    }, ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// API: Audio Transcription using Gemini
app.post('/api/transcribe', async (req, res) => {
  const { audioData, mimeType } = req.body;
  if (!audioData || typeof audioData !== 'string') {
    return res.json({ text: '' });
  }

  // Strip data URL prefix if present
  let cleanData = audioData;
  if (cleanData.includes(',')) {
    cleanData = cleanData.split(',')[1];
  }
  cleanData = cleanData.replace(/\s+/g, '');

  if (cleanData.length < 2500) {
    return res.json({ text: '' });
  }

  let cleanMime = 'audio/webm';
  if (mimeType && typeof mimeType === 'string') {
    const rawMime = mimeType.split(';')[0].trim().toLowerCase();
    const allowed = ['audio/webm', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/mp3'];
    if (allowed.includes(rawMime)) {
      cleanMime = rawMime;
    }
  }

  if (!aiClient) {
    return res.json({ text: '' });
  }

  try {
    const audioPart = {
      inlineData: {
        mimeType: cleanMime,
        data: cleanData,
      },
    };
    const response = await withTimeout(
      aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          audioPart,
          {
            text: 'Transcribe this spoken interview answer into clean, accurate English text. Provide strictly the transcribed words without any quotes, metadata, or prefixes.',
          },
        ],
      }),
      10000
    );
    const text = response.text ? response.text.trim() : '';
    return res.json({ text });
  } catch (_err) {
    return res.json({ text: '' });
  }
});

// API: Deep Resume Analysis, Shortcoming Detection & Questions Generation
app.post('/api/parse-resume', async (req, res) => {
  const { resumeText, fileData, mimeType, targetRole } = req.body;
  const roleTarget = targetRole || 'Software Development Engineer (SDE-1)';

  let contentText = typeof resumeText === 'string' ? resumeText.trim() : '';

  // Local fallback baseline
  const localAnalysis = analyzeResumeTextLocally(contentText || 'Software Developer Resume', roleTarget);

  if (!aiClient && !contentText && !fileData) {
    return res.status(400).json({ error: 'resumeText or fileData is required' });
  }

  if (!aiClient || isAiAccessDenied) {
    return res.json(localAnalysis);
  }

  try {
    const promptInstructions = `You are a Principal Technical Campus Recruiter, ATS Expert, and Hiring Bar Raiser at a top tier tech company.
Analyze this candidate's resume thoroughly for the target role: "${roleTarget}".
Evaluate their technical background, detect where they are lacking, calculate an ATS compatibility score, provide before/after bullet rewrites, and generate tailored technical interview questions based strictly on their actual projects and claims.

Target Role: "${roleTarget}".
${contentText ? `Resume Text:\n\`\`\`\n${contentText.slice(0, 8000)}\n\`\`\`` : 'Evaluate the attached resume document.'}

Return strictly a valid JSON object matching this schema:
{
  "candidateName": string,
  "recommendedRole": string,
  "summary": string (2-3 sentences assessing overall competitiveness),
  "atsScore": number (0 to 100, realistic rating: penalize lack of numbers/metrics and missing modern tools),
  "atsScoreBreakdown": {
    "quantification": number (0-100),
    "skillRelevance": number (0-100),
    "depthAndImpact": number (0-100),
    "clarityAndFormat": number (0-100)
  },
  "extractedSkills": string[] (10-15 detected technical competencies),
  "missingSkillsForRole": string[] (3-6 critical technologies or tools absent from resume for this role),
  "projectsDetected": [
    {
      "name": string,
      "techStack": string[],
      "assessment": string,
      "critique": string
    }
  ],
  "lackingAreas": [
    {
      "id": string,
      "category": "Quantification" | "Missing Skills" | "Action Verbs" | "Formatting/ATS" | "Project Depth",
      "severity": "Critical" | "High" | "Medium",
      "title": string,
      "description": string,
      "currentExcerpt": string,
      "improvedVersion": string,
      "whyItMatters": string
    }
  ],
  "bulletPointImprovements": [
    {
      "id": string,
      "original": string,
      "improved": string,
      "critique": string,
      "impactGain": string
    }
  ],
  "tailoredQuestions": [
    {
      "id": string,
      "category": "Project Deep Dive" | "Skill Verification" | "Addressing Weakness" | "Behavioral",
      "question": string,
      "contextOrReason": string,
      "stage": "resume" | "technical" | "dsa" | "system_design" | "behavioral",
      "hint": string,
      "expectedKeywords": string[]
    }
  ],
  "overallCritique": string,
  "actionableNextSteps": string[],
  "suggestedTopics": string[]
}
Do NOT include markdown formatting or commentary outside the JSON object.`;

    const contents: any[] = [];
    if (fileData && mimeType === 'application/pdf') {
      let cleanData = fileData;
      if (cleanData.includes(',')) cleanData = cleanData.split(',')[1];
      contents.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: cleanData.replace(/\s+/g, ''),
        },
      });
    }
    contents.push({ text: promptInstructions });

    const response = await withTimeout(
      aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
        },
      }),
      9500
    );

    const parsed = extractJsonFromText(response.text || '');
    if (parsed && (parsed.extractedSkills || parsed.candidateName || parsed.tailoredQuestions)) {
      const merged: any = {
        ...localAnalysis,
        ...parsed,
        atsScoreBreakdown: {
          ...localAnalysis.atsScoreBreakdown,
          ...(parsed.atsScoreBreakdown || {}),
        },
        lackingAreas: (parsed.lackingAreas && parsed.lackingAreas.length > 0) ? parsed.lackingAreas : localAnalysis.lackingAreas,
        bulletPointImprovements: (parsed.bulletPointImprovements && parsed.bulletPointImprovements.length > 0) ? parsed.bulletPointImprovements : localAnalysis.bulletPointImprovements,
        tailoredQuestions: (parsed.tailoredQuestions && parsed.tailoredQuestions.length > 0) ? parsed.tailoredQuestions : localAnalysis.tailoredQuestions,
        projectsDetected: (parsed.projectsDetected && parsed.projectsDetected.length > 0) ? parsed.projectsDetected : localAnalysis.projectsDetected,
        missingSkillsForRole: (parsed.missingSkillsForRole && parsed.missingSkillsForRole.length > 0) ? parsed.missingSkillsForRole : localAnalysis.missingSkillsForRole,
      };
      return res.json(merged);
    }
  } catch (error: any) {
    handleAiError('/api/parse-resume', error);
  }

  return res.json(localAnalysis);
});

// API: Generate Next Adaptive Question / Follow-up
app.post('/api/generate-question', async (req, res) => {
  const {
    session,
    transcript = [],
    currentQuestionIndex = 0,
    totalQuestions = 5,
    candidateAnswer = '',
    isFollowUp = false,
  } = req.body;

  const role = session?.role || 'Software Development Engineer';
  const company = session?.company || 'General Tech';
  const difficulty = session?.difficulty || 'Medium';
  const interviewerName = session?.interviewer?.name || 'Aria';
  const interviewerStyle = session?.interviewer?.style || 'Friendly, supportive, yet technically precise';
  const topics = session?.topics || ['Technical', 'HR'];
  const resumeText = session?.resumeText || '';

  // Collect all previously asked questions from explicit array and transcript history
  const askedQuestions: string[] = Array.isArray(req.body.askedQuestions)
    ? [...req.body.askedQuestions]
    : [];

  (transcript || []).forEach((t: any) => {
    if (t.role === 'interviewer') {
      if (t.question && !askedQuestions.includes(t.question)) {
        askedQuestions.push(t.question);
      }
      if (t.content && !askedQuestions.includes(t.content)) {
        askedQuestions.push(t.content);
      }
    }
  });

  // Determine whether this request is for a follow-up or next primary question
  const isFollowUpRequest = Boolean(candidateAnswer && !isFollowUp);

  // Remediation Session Handling
  if (session?.isRemediation && session?.customQuestions && session.customQuestions.length > 0) {
    const qList = session.customQuestions;
    const targetQ = qList[Math.min(currentQuestionIndex, qList.length - 1)];

    if (isFollowUpRequest) {
      const followUp = generateContextualFollowUp({
        candidateAnswer,
        transcript,
        askedQuestions,
        role,
        company,
        stage: targetQ.stage || 'technical',
        interviewerName,
        interviewerStyle,
      });
      return res.json({
        ...followUp,
        stage: targetQ.stage || 'technical',
        hint: targetQ.coachingTip || followUp.hint,
      });
    }

    return res.json({
      message: `[Remediation Round: ${session.remediationFocus || 'Targeted Practice'}] Q${currentQuestionIndex + 1}/${totalQuestions}: ${targetQ.question}`,
      question: targetQ.question,
      stage: targetQ.stage || 'technical',
      isFollowUp: false,
      hint: `🎯 Remediation Tip: ${targetQ.coachingTip || 'Focus on eliminating previous weaknesses'} (Drill Goal: ${targetQ.drillGoal || 'Targeted Practice'})`,
    });
  }

  // Resume-driven Session Handling
  if (session?.isResumeBased && session?.resumeQuestions && session.resumeQuestions.length > 0) {
    const qList = session.resumeQuestions;
    const targetQ = qList[Math.min(currentQuestionIndex, qList.length - 1)];

    if (isFollowUpRequest) {
      const followUp = generateContextualFollowUp({
        candidateAnswer,
        transcript,
        askedQuestions,
        role,
        company,
        stage: targetQ.stage || 'resume',
        interviewerName,
        interviewerStyle,
      });
      return res.json({
        ...followUp,
        stage: targetQ.stage || 'resume',
        hint: targetQ.hint || followUp.hint,
      });
    }

    return res.json({
      message: `[Resume Drill: ${targetQ.category}] Q${currentQuestionIndex + 1}/${totalQuestions}: ${targetQ.question}`,
      question: targetQ.question,
      stage: targetQ.stage || 'resume',
      isFollowUp: false,
      hint: `📋 Resume Context: ${targetQ.contextOrReason || 'Answer using the STAR framework'} (Hint: ${targetQ.hint})`,
    });
  }

  // Determine interview stage for standard sessions
  let stage = 'warmup';
  if (currentQuestionIndex === 0) {
    stage = 'warmup';
  } else if (currentQuestionIndex === 1) {
    stage = topics.includes('Resume') && resumeText ? 'resume' : 'technical';
  } else if (currentQuestionIndex === 2) {
    stage = topics.includes('DSA') ? 'dsa' : 'technical';
  } else if (currentQuestionIndex === 3) {
    stage = topics.includes('System Design') ? 'system_design' : 'behavioral';
  } else if (currentQuestionIndex >= 4) {
    stage = currentQuestionIndex >= totalQuestions - 1 ? 'wrapup' : 'behavioral';
  }

  // If Gemini client is active and not denied access, attempt LLM question generation with strict deduplication
  if (aiClient && !isAiAccessDenied) {
    try {
      const fullHistory = (transcript || [])
        .map((t: any) => `${t.role === 'interviewer' ? interviewerName : 'Candidate'}: ${(t.content || t.question || '').slice(0, 400)}`)
        .join('\n');

      const askedListFormatted = askedQuestions
        .slice(-10)
        .map((q, i) => `${i + 1}. ${q.replace(/^Follow-up:\s*/i, '')}`)
        .join('\n');

      const prompt = `You are ${interviewerName}, a senior tech recruiter and engineering coach (${interviewerStyle}) conducting a realistic mock interview for a ${role} position at ${company} (Difficulty: ${difficulty}).
Current stage: "${stage}" (Question ${currentQuestionIndex + 1} of ${totalQuestions}).

CONVERSATION TRANSCRIPT SO FAR:
"""
${fullHistory || '(Interview starting)'}
"""

${candidateAnswer ? `LATEST CANDIDATE ANSWER:
"""
${candidateAnswer}
"""` : ''}

${resumeText ? `CANDIDATE RESUME PROFILE & PROJECTS:
"""
${resumeText.slice(0, 1500)}
"""` : ''}

PREVIOUSLY ASKED QUESTIONS IN THIS SESSION (STRICTLY FORBIDDEN TO REPEAT OR PARAPHRASE):
"""
${askedListFormatted || 'None yet'}
"""

TASK:
${isFollowUpRequest
  ? `Generate a relevant, non-repetitive follow-up question based on the student's previous answers and conversation context.
- Explore the student's reasoning, architectural concepts, trade-offs, and technical explanations in greater depth.
- If the student's answer was brief, vague, or unclear, ask for specific clarification on the unclear technical concept or data flow instead of accepting it at face value.
- Never repeat previous questions or ask unrelated questions.
- Acknowledge their specific point naturally in the spoken message.`
  : `Generate the next primary interview question for the "${stage}" stage.
- Ensure every question is unique, non-repetitive, and natural.
- Never repeat previous questions from the forbidden list.
- Keep the question crisp, technically rigorous, and directly relevant to the ${role} position.`}

RETURN STRICTLY VALID JSON (no markdown formatting outside of JSON):
{
  "message": "Spoken interviewer statement (under 30 words) acknowledging their response and delivering the question",
  "question": "Crisp core question text (must be completely unique and non-repetitive)",
  "stage": "${stage}",
  "isFollowUp": ${isFollowUpRequest},
  "hint": "Actionable 1-sentence engineering cue (mention specific architectures, Big-O, metrics, or frameworks)"
}`;

      const response = await withTimeout(
        aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
          },
        }),
        7000
      );

      const parsed = extractJsonFromText(response.text || '');
      if (parsed && parsed.message && parsed.question) {
        // Validate that Gemini did NOT repeat a previous question
        if (!isQuestionAlreadyAsked(parsed.question, askedQuestions)) {
          return res.json(parsed);
        }
        console.info('[MockMate AI] Gemini returned a duplicate/near-duplicate question. Routing to local deduplicated question engine.');
      }
    } catch (err: any) {
      handleAiError('/api/generate-question', err);
    }
  }

  // Local Intelligent Contextual Question Engine (Deterministic, zero repetition, deep reasoning exploration)
  if (isFollowUpRequest) {
    const followUp = generateContextualFollowUp({
      candidateAnswer,
      transcript,
      askedQuestions,
      role,
      company,
      stage,
      interviewerName,
      interviewerStyle,
    });
    return res.json(followUp);
  }

  const nextQ = generateNextStageQuestion({
    stage,
    transcript,
    askedQuestions,
    role,
    company,
    difficulty,
    resumeText,
    interviewerName,
  });
  return res.json(nextQ);
});

// Helper for dynamic fast report generation deeply analyzing candidate answers
function buildFastTranscriptReport(transcript: any[], session: any, tabSwitches: number, proctorTrustScore: number) {
  const role = session?.role || 'Software Development Engineer';
  const company = session?.company || 'General Tech';
  const questionsAnswered = (transcript || []).filter((t: any) => t.role === 'interviewer');

  const candidateMessages = (transcript || []).filter((t: any) => t.role === 'candidate');
  const actualCandidateTexts = candidateMessages
    .map((t: any) => (t.content || '').trim())
    .filter((c: string) => c && c !== 'Spoken answer submitted.' && c !== 'No verbal answer recorded.' && !c.startsWith('[No answer'));

  const totalCandidateWords = actualCandidateTexts.reduce((sum: number, text: string) => {
    return sum + text.split(/\s+/).filter(Boolean).length;
  }, 0);

  if (totalCandidateWords === 0 || actualCandidateTexts.length === 0) {
    return {
      overallScore: 0,
      performanceTier: 'Needs Focused Practice',
      categoryScores: {
        technical: 0,
        communication: 0,
        problemSolving: 0,
        confidence: 0,
        accuracy: 0,
      },
      strengths: [
        'Successfully initiated the proctored interview session and webcam verification',
        `Attempted the ${role} campus placement round`,
      ],
      weaknesses: [
        'Zero questions answered: No verbal or written explanations were submitted during the interview.',
        'Unassessed technical skills: Core computer science fundamentals, architecture, and coding logic could not be evaluated.',
        'Immediate placement rejection: In campus placement drives and company interviews, leaving questions blank results in 0 score and immediate elimination.',
      ],
      drawbacks: [
        'Silence during questions: Did not record voice or type answers for the assigned interview prompts.',
        'Skipped evaluation stages: You did not communicate high-level intuition, problem constraints, or brute-force approach.',
        `No proof of technical competency provided for ${company} ${role}.`,
      ],
      improvements: [
        'Turn on the microphone or type directly into the answer box before advancing to the next question.',
        'Even if you are not 100% sure of the optimal solution, always explain your initial intuition, ask clarifying questions, and walk through a brute-force approach.',
        'Use the 3-step answering blueprint: 1) Clarify requirements, 2) Explain logic with Big-O Time & Space complexity, 3) Discuss edge cases.',
      ],
      questionBreakdown: questionsAnswered.map((t: any, idx: number) => ({
        questionNumber: idx + 1,
        stage: t.stage || 'technical',
        question: t.question || t.content,
        candidateAnswer: '[No answer recorded / Question skipped]',
        score: 0,
        feedback: 'No response was provided for this question. In placement interviews, unanswered questions receive 0/100.',
        missingConcepts: [
          'Problem decomposition & clarifying questions',
          'Core underlying algorithmic logic or system architecture',
          'Asymptotic Time & Space complexity bounds O(...)',
          'Production edge-case considerations',
        ],
        whyItNeedsImprovement: 'The question was skipped or left blank. Leaving questions unanswered in campus placement drives leads to an immediate 0/100 and elimination. Always speak through your intuition, clarify constraints, and propose a brute-force approach first.',
        drawbacks: [
          'No explanation attempted for this question.',
          'Failed to articulate the technical concepts or algorithmic mechanics required.',
        ],
        improvements: [
          'Speak through your thought process out loud even if you only have a partial idea.',
          'State the basic definition, how it functions under the hood, and a real-world example.',
        ],
        sampleAnswer: idx === 0
          ? `Structure with 3 pillars: 1) Current focus & education, 2) Flagship engineering project with concrete metrics (e.g. "reduced API p99 latency by 38% for 5,000 active users using Redis caching"), and 3) Alignment with ${company}'s ${role} tech stack.`
          : `State the fundamental concept clearly in the first 15 seconds, specify computational complexity bounds upfront ("Runs in Time O(N) and Space O(1)"), explain runtime mechanics, and cite boundary conditions (null pointers, concurrency, network drops).`,
      })),
      recommendedResources: [
        {
          title: 'Campus Placement Speaking & Articulation Blueprint',
          type: 'Practice',
          description: 'How to overcome nervousness and verbalize engineering thoughts under interview conditions.',
          linkOrKeyTakeaway: 'Always talk through your approach from the first 5 seconds rather than remaining silent.',
        },
        {
          title: 'STAR Method Presentation Blueprint for Campus Placements',
          type: 'Framework',
          description: 'Structure answers: Situation, Task, Action, Result with quantifiable impact.',
          linkOrKeyTakeaway: 'Spend 60% of narrative on concrete Actions and measurable Results rather than backstory.',
        },
        {
          title: 'Top DSA Placement Patterns & Constraint Clarification',
          type: 'Practice',
          description: 'Master sliding window, two-pointer, BFS/DFS, and dynamic programming patterns.',
          linkOrKeyTakeaway: 'Always verify constraints: null inputs, duplicates, and state Space O(...) alongside Time O(...).',
        },
      ],
      interviewerVerdict: `Interview Incomplete. No answers were provided during this session for ${role} at ${company}. Score: 0/100. Practice speaking or typing your responses and retake the interview to establish your performance baseline.`,
      companyFitScore: 0,
      proctorTrustScore,
      tabSwitches,
      rootCauses: diagnoseRootCauses(transcript, session, 0),
      remediationPlan: generateRemediationPlan(diagnoseRootCauses(transcript, session, 0), session),
    };
  }

  const questionBreakdown = questionsAnswered.map((t: any, idx: number) => {
    const tIndex = transcript.indexOf(t);
    const candAns = transcript.find(
      (c: any, cIdx: number) => c.role === 'candidate' && cIdx > tIndex
    );
    const rawText = candAns?.content?.trim() || '';
    const isPlaceholder = rawText === 'Spoken answer submitted.' || rawText === 'No verbal answer recorded.' || rawText.startsWith('[No answer');
    const text = isPlaceholder ? '' : rawText;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const lower = text.toLowerCase();

    const hasMetrics = /\d+%|\d+\s*(ms|s|sec|users|req|queries|gb|mb)/i.test(text);
    const hasTechDepth = /react|node|express|database|postgres|sql|mongo|redis|cache|async|promise|event loop|time complexity|o\(|space complexity|algorithm|hash|tree|graph|star|architecture|microservice|load balancer|api/i.test(lower);
    const hasTradeoffs = /trade-off|bottleneck|optimize|latency|concurrency|parallel|scale|index/i.test(lower);

    let score = 0;
    let feedback = '';
    const drawbacks: string[] = [];
    const improvements: string[] = [];
    const missingConcepts: string[] = [];
    let whyItNeedsImprovement = '';

    if (wordCount === 0 || text === '') {
      score = 0;
      feedback = 'No answer provided. In campus placement drives and technical interviews, an unanswered question receives 0/100. Always share your initial intuition, ask clarifying questions, and walk through brute force.';
      missingConcepts.push('Problem constraints & clarifying questions', 'Initial algorithmic intuition', 'Underlying technical principles & mechanisms', 'Asymptotic Time/Space complexity O(...)');
      whyItNeedsImprovement = 'The question was left blank without spoken or typed content. Without an initial solution, interviewers cannot gauge your problem-solving process, language fluency, or domain fundamentals.';
      drawbacks.push('Did not attempt an oral or written explanation for this question.');
      improvements.push('Even if unsure of the full solution, explain your high-level intuition and clarify constraints.');
    } else if (wordCount < 10) {
      score = 25;
      feedback = `Extremely brief response (${wordCount} words: "${text}"). Fails to explain core mechanisms, data structure trade-offs, or production architectural considerations.`;
      missingConcepts.push('Concrete technical architecture', 'Under-the-hood execution mechanics', 'Production failure modes or edge cases');
      whyItNeedsImprovement = 'Interviewers evaluate communication depth and technical mastery. A one-sentence response signals superficial familiarity rather than working proficiency.';
      drawbacks.push('Answer was overly terse and did not elaborate on technical mechanics or architecture.');
      improvements.push('Use the 3-step elaboration formula: state the core concept, explain how it works under the hood, and cite a practical example.');
    } else if (wordCount < 25) {
      score = 50;
      feedback = `Brief response ("${text.slice(0, 50)}..."). Missing quantitative performance impact, data structure details, and engineering trade-offs.`;
      missingConcepts.push('Big-O Time & Space complexity', 'Quantitative performance metrics (% speedup, memory)', 'Edge cases & exception handling');
      whyItNeedsImprovement = 'The answer mentions top-level terminology but fails to explain runtime behaviors, memory trade-offs, or why this approach is superior to alternatives.';
      drawbacks.push('Omitted quantitative performance impact, algorithmic complexity, and edge-case handling.');
      improvements.push('Quantify the outcome (e.g. % speedup or memory savings) and proactively discuss Big-O complexity.');
    } else if (hasTechDepth && hasMetrics && hasTradeoffs) {
      score = Math.min(96, 88 + Math.min(8, Math.floor(wordCount / 20)));
      feedback = `Excellent answer! You correctly referenced relevant technical concepts and quantified real-world outcomes. Clear logical flow and strong grasp of engineering trade-offs.`;
      missingConcepts.push('Subtle boundary conditions under extreme distributed load or network partitions');
      whyItNeedsImprovement = 'Strong demonstration. To reach the top 1% bar, elaborate on distributed idempotency, network partition handling, and observability tracing.';
      improvements.push('Maintain this high standard; ensure edge cases and boundary conditions are explicitly checked.');
    } else if (hasTechDepth) {
      score = Math.min(90, 75 + Math.min(10, Math.floor(wordCount / 25)));
      feedback = `Good conceptual grasp. You accurately highlighted relevant technologies and principles. To reach top-tier placement standards, quantify results and state Time & Space complexity upfront.`;
      missingConcepts.push('Concrete benchmark numbers (% latency reduction, RPS, memory overhead)', 'Upfront Big-O bounds (Time O(...) & Space O(...))', 'Alternative architecture comparisons');
      whyItNeedsImprovement = 'While conceptually sound, top-tier engineering interviewers expect candidates to anchor architectural choices with empirical numbers, complexity guarantees, and failure mitigations.';
      drawbacks.push('Omitted quantitative performance metrics and asymptotic complexity bounds.');
      improvements.push('Quantify the outcome (e.g. % speedup or memory savings) and proactively discuss failure recovery.');
    } else {
      score = Math.min(78, 58 + Math.min(12, Math.floor(wordCount / 25)));
      feedback = `Clear communication, but needs deeper technical precision. Ground your response in concrete architecture, database behavior, or algorithmic time/space complexity.`;
      missingConcepts.push('Low-level internal mechanics & memory model', 'Standard design pattern or protocol specification', 'Empirical engineering trade-offs');
      whyItNeedsImprovement = 'The explanation relied on high-level generalities without walking through step-by-step code execution, internal thread safety, or runtime bottlenecks.';
      drawbacks.push('Relied on high-level generalities without delving into concrete engineering implementation details.');
      improvements.push('Ground your answer in specific protocols, data structures, or Big-O complexity analysis.');
    }

    const strongerSampleAnswer = idx === 0
      ? `"${t.question || 'Tell me about yourself'}": "I am a software engineer focused on building high-performance, resilient backend systems and responsive web applications. Recently, I spearheaded an API optimization project where I refactored our caching tier using Redis and PostgreSQL connection pooling, reducing p99 latency by 42% (from 320ms to 185ms) while handling 8,500 requests per second. When approaching technical challenges, I systematically analyze Big-O complexity upfront and design for fault tolerance. I am thrilled about ${company}'s focus on scalable systems and eager to contribute to ${role}."`
      : `Model placement answer for "${(t.question || t.content || '').slice(0, 60)}...": Start with a 15-second definition ("Under the hood, X works by..."), immediately state computational bounds ("This provides Time O(N) lookup and Space O(1) auxiliary overhead"), contrast against alternatives ("Unlike naive nested scans which degrade to O(N ), hashing eliminates the bottleneck"), and finish with production resilience ("In production, we must guard against null keys, hash collisions via open addressing/chaining, and memory pressure under high throughput spikes.")`;

    return {
      questionNumber: idx + 1,
      stage: t.stage || 'technical',
      question: t.question || t.content,
      candidateAnswer: text || '[No verbal answer recorded]',
      score,
      feedback,
      missingConcepts,
      whyItNeedsImprovement,
      drawbacks: drawbacks.length > 0 ? drawbacks : ['Could explore deeper asynchronous event-loop or scaling bottlenecks.'],
      improvements: improvements.length > 0 ? improvements : ['State trade-offs between memory footprint and execution speed.'],
      sampleAnswer: strongerSampleAnswer,
    };
  });

  const totalQuestions = Math.max(session?.totalQuestions || questionsAnswered.length, questionBreakdown.length, 1);
  const totalScoreSum = questionBreakdown.reduce((sum: number, q: any) => sum + q.score, 0);
  const avgScore = Math.round(totalScoreSum / totalQuestions);
  const candidateAllText = actualCandidateTexts.join(' ');

  const strengthsList = [
    candidateAllText.length > 60
      ? `Clear verbal articulation and responsive communication during ${role} evaluation`
      : 'Calm composure and willingness to engage with the technical prompts',
    /react|node|sql|database|api|cache/i.test(candidateAllText)
      ? 'Demonstrated practical familiarity with core software engineering and full-stack concepts'
      : 'Structured logical approach to problem-solving and situational questions',
    'Maintained consistent professional pacing and engagement throughout the rounds',
  ];

  const weaknessesList = [
    /\d+%/i.test(candidateAllText)
      ? 'Ensure algorithmic asymptotic bounds (Time & Space O(N)) are stated upfront before writing code'
      : 'Quantify project achievements with concrete measurable metrics (e.g., % latency drop, user scale, memory usage)',
    /star/i.test(candidateAllText)
      ? 'Dedicate more time to discussing edge cases, boundary inputs, and failure recovery'
      : 'Structure behavioral answers using the 15-60-15s STAR method (15s Situation, 60s Actions, 15s Results)',
  ];

  const drawbacksList = [
    candidateAllText.split(/\s+/).length < 60
      ? 'Brevity in answers: Responses were too brief, preventing the interviewer from fully evaluating your depth of engineering knowledge.'
      : 'Lack of quantified impact: Project discussions did not include specific benchmarks, latency percentages, or scale metrics.',
    !/time complexity|space complexity|o\(/i.test(candidateAllText)
      ? 'Big-O Complexity omitted upfront: You did not state runtime or memory asymptotic bounds before explaining algorithms.'
      : 'Edge cases and failure states were not proactively addressed in technical solutions.',
    !/star|situation|action|result/i.test(candidateAllText)
      ? 'Unstructured behavioral responses: Storytelling lacked clear separation between background and concrete personal actions.'
      : 'Trade-offs between alternative technologies or patterns were not contrasted.'
  ];

  const improvementsList = [
    'Apply the 15-60-15s STAR technique: Spend 15 seconds on context, 60 seconds detailing the exact code/architecture you wrote, and 15 seconds sharing measurable results.',
    'Always state Time O(...) and Space O(...) within the first 30 seconds of explaining any algorithmic problem.',
    'Prepare 2-3 hard engineering numbers (e.g. 40% query optimization, 10k concurrent users) for your flagship projects.'
  ];

  const calculatedOverall = Math.min(98, Math.max(0, avgScore));

  return {
    overallScore: calculatedOverall,
    performanceTier: calculatedOverall >= 84 ? 'Placement Ready' : calculatedOverall >= 65 ? 'Near Ready' : 'Needs Focused Practice',
    categoryScores: {
      technical: Math.min(98, Math.max(0, calculatedOverall > 0 ? calculatedOverall + 1 : 0)),
      communication: Math.min(98, Math.max(0, calculatedOverall > 0 ? calculatedOverall : 0)),
      problemSolving: Math.min(98, Math.max(0, calculatedOverall > 0 ? calculatedOverall - 1 : 0)),
      confidence: Math.min(98, Math.max(0, calculatedOverall > 0 ? calculatedOverall - 2 : 0)),
      accuracy: Math.min(98, Math.max(0, calculatedOverall > 0 ? calculatedOverall + 1 : 0)),
    },
    strengths: strengthsList,
    weaknesses: weaknessesList,
    drawbacks: drawbacksList,
    improvements: improvementsList,
    questionBreakdown,
    recommendedResources: [
      {
        title: 'STAR Method Presentation Blueprint for Campus Placements',
        type: 'Framework',
        description: 'Structure answers: Situation, Task, Action, Result with quantifiable impact.',
        linkOrKeyTakeaway: 'Spend 60% of narrative on concrete Actions and measurable Results rather than backstory.',
      },
      {
        title: 'Top DSA Placement Patterns & Constraint Clarification',
        type: 'Practice',
        description: 'Master sliding window, two-pointer, BFS/DFS, and dynamic programming patterns.',
        linkOrKeyTakeaway: 'Always verify constraints: null inputs, duplicates, and state Space O(...) alongside Time O(...).',
      },
      {
        title: 'System Design & Core CS Fundamentals for Placements',
        type: 'Article',
        description: 'Understand client-server architecture, database indexing, caching, and concurrency.',
        linkOrKeyTakeaway: 'Identify bottlenecks (network latency vs CPU vs DB query execution) systematically.',
      },
    ],
    interviewerVerdict: calculatedOverall >= 84
      ? `Candidate demonstrated solid placement readiness for ${role} at ${company}. Recommended to proceed with practice in quantifying project metrics.`
      : calculatedOverall >= 65
      ? `Candidate has strong foundational potential for ${role}, but needs focused preparation on answer structure, technical depth, and metric quantification.`
      : `Candidate needs focused practice on speaking technical concepts out loud, problem decomposition, and answering all interview prompts.`,
    companyFitScore: Math.min(98, Math.max(0, calculatedOverall > 0 ? calculatedOverall + 1 : 0)),
    proctorTrustScore,
    tabSwitches,
    rootCauses: diagnoseRootCauses(transcript, session, calculatedOverall),
    remediationPlan: generateRemediationPlan(diagnoseRootCauses(transcript, session, calculatedOverall), session),
  };
}

// API: Comprehensive Evaluation & Report Card
app.post('/api/evaluate-interview', async (req, res) => {
  const { session, transcript = [], telemetry = {} } = req.body;
  const role = session?.role || 'Software Development Engineer';
  const company = session?.company || 'General Tech';
  const difficulty = session?.difficulty || 'Medium';
  const tabSwitches = telemetry.tabSwitches || 0;
  const proctorTrustScore = Math.max(30, Math.min(100, 100 - (tabSwitches * 12)));

  const candidateMessages = (transcript || []).filter((t: any) => t.role === 'candidate');
  const actualCandidateTexts = candidateMessages
    .map((t: any) => (t.content || '').trim())
    .filter((c: string) => c && c !== 'Spoken answer submitted.' && c !== 'No verbal answer recorded.' && !c.startsWith('[No answer'));

  const totalCandidateWords = actualCandidateTexts.reduce((sum: number, text: string) => {
    return sum + text.split(/\s+/).filter(Boolean).length;
  }, 0);

  if (totalCandidateWords === 0 || actualCandidateTexts.length === 0) {
    return res.json(buildFastTranscriptReport(transcript, session, tabSwitches, proctorTrustScore));
  }

  if (!aiClient || isAiAccessDenied) {
    return res.json(buildFastTranscriptReport(transcript, session, tabSwitches, proctorTrustScore));
  }

  try {
    const transcriptSummary = (transcript || [])
      .map((t: any, i: number) => `[${t.role.toUpperCase()} Q${i+1}]: ${t.content?.slice(0, 400)}`)
      .join('\n');

    const prompt = `You are a senior campus placement evaluator reviewing an interview for ${role} at ${company} (${difficulty}).
TRANSCRIPT OF QUESTIONS AND CANDIDATE'S ACTUAL ANSWERS:
${transcriptSummary.slice(0, 3500)}

Telemetry: Tab switches: ${tabSwitches}, Proctor Trust: ${proctorTrustScore}%. Total candidate words spoken/submitted: ${totalCandidateWords}.

CRITICAL SCORING & FEEDBACK RULES:
- The score out of 100 per question and overall MUST strictly reflect the candidate's actual answers.
- If candidate left questions unanswered or blank, unanswered questions MUST receive 0 points out of 100.
- If answers are very brief (< 15 words) or lack technical substance, score them 20-50 out of 100.
- If answers are solid with technical mechanisms, score 70-84 out of 100. If exemplary with metrics, Big-O, and trade-offs, score 85-95 out of 100.
- Output valid JSON matching this exact structure:
{
  "overallScore": number (0-98 based on candidate performance),
  "performanceTier": "Placement Ready" | "Near Ready" | "Needs Focused Practice",
  "categoryScores": {
    "technical": number,
    "communication": number,
    "problemSolving": number,
    "confidence": number,
    "accuracy": number
  },
  "strengths": string[],
  "weaknesses": string[],
  "drawbacks": string[],
  "improvements": string[],
  "questionBreakdown": [
    {
      "questionNumber": number,
      "stage": string,
      "question": string,
      "candidateAnswer": string,
      "score": number,
      "feedback": string,
      "missingConcepts": string[],
      "whyItNeedsImprovement": string,
      "drawbacks": string[],
      "improvements": string[],
      "sampleAnswer": string
    }
  ],
  "recommendedResources": [
    {
      "title": string,
      "type": "Framework" | "Practice" | "Article",
      "description": string,
      "linkOrKeyTakeaway": string
    }
  ],
  "interviewerVerdict": string,
  "companyFitScore": number,
  "rootCauses": [
    {
      "category": string,
      "title": string,
      "severity": "Critical" | "High" | "Medium",
      "explanation": string,
      "evidenceQuote": string,
      "marksDeductedApprox": number,
      "remediationFocus": string
    }
  ],
  "remediationPlan": {
    "weaknessTargeted": string,
    "sessionTitle": string,
    "description": string,
    "focusArea": string,
    "targetScoreGoal": number,
    "coachingFormula": string,
    "questions": [
      {
        "question": string,
        "stage": string,
        "coachingTip": string,
        "drillGoal": string,
        "expectedKeyTerms": string[]
      }
    ]
  }
}`;

    const response = await withTimeout(
      aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
        },
      }),
      12000
    );

    const parsed = extractJsonFromText(response.text || '');
    if (parsed && typeof parsed.overallScore === 'number' && parsed.categoryScores) {
      parsed.proctorTrustScore = parsed.proctorTrustScore ?? proctorTrustScore;
      parsed.tabSwitches = tabSwitches;
      if (!parsed.rootCauses || !Array.isArray(parsed.rootCauses) || parsed.rootCauses.length === 0) {
        parsed.rootCauses = diagnoseRootCauses(transcript, session, parsed.overallScore);
      }
      if (!parsed.remediationPlan || !parsed.remediationPlan.questions || parsed.remediationPlan.questions.length === 0) {
        parsed.remediationPlan = generateRemediationPlan(parsed.rootCauses, session);
      }
      return res.json(parsed);
    }
  } catch (err: any) {
    handleAiError('/api/evaluate-interview', err);
  }

  return res.json(buildFastTranscriptReport(transcript, session, tabSwitches, proctorTrustScore));
});

// API: Generate Specific Remediation Practice Session
app.post('/api/generate-remediation-session', async (req, res) => {
  const { session, weakness, rootCauses = [] } = req.body;
  const causes = Array.isArray(rootCauses) && rootCauses.length > 0
    ? rootCauses
    : diagnoseRootCauses([], session, 50);
  const plan = generateRemediationPlan(causes, session, weakness);
  return res.json(plan);
});

// Setup Vite or static serving
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MockMate Server running on http://0.0.0.0:${PORT} (${isDev ? 'development' : 'production'})`);
  });
}

startServer();
