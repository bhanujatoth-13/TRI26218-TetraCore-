import {
  InterviewSession,
  RemediationQuestion,
  RemediationSessionPlan,
  RootCauseDiagnosis,
} from '../types';

/**
 * Diagnostic Engine: Analyzes candidate interview answers to discover the root reasons
 * for score loss and generates targeted remediation practice sessions to fix them.
 */

export function diagnoseRootCauses(
  transcript: any[],
  session: any,
  overallScore: number
): RootCauseDiagnosis[] {
  const candidateMessages = (transcript || []).filter((t: any) => t.role === 'candidate');
  const actualCandidateTexts = candidateMessages
    .map((t: any) => (t.content || '').trim())
    .filter(
      (c: string) =>
        c &&
        c !== 'Spoken answer submitted.' &&
        c !== 'No verbal answer recorded.' &&
        !c.startsWith('[No answer')
    );

  const totalCandidateWords = actualCandidateTexts.reduce((sum: number, text: string) => {
    return sum + text.split(/\s+/).filter(Boolean).length;
  }, 0);

  const candidateAllText = actualCandidateTexts.join(' ');
  const lowerAll = candidateAllText.toLowerCase();

  const causes: RootCauseDiagnosis[] = [];

  // 1. Critical: Silence / Zero verbal participation
  if (totalCandidateWords === 0 || actualCandidateTexts.length === 0) {
    causes.push({
      category: 'Spoken Communication & Engagement',
      title: 'Complete Silence & Non-Response to Prompts',
      simpleTitle: 'No spoken or written answer submitted',
      severity: 'Critical',
      explanation:
        'You did not submit spoken or typed answers for the interview questions. In campus placement drives and company hiring loops, remaining silent or leaving questions unanswered results in an immediate 0/100 and disqualification. Interviewers evaluate how you communicate your thought process under pressure. Even explaining a partial intuition or brute-force approach earns 40-50 marks, whereas silence guarantees elimination.',
      simpleExplanation:
        'You stayed silent or skipped the question. In interviews, even a basic attempt gets 40-50 marks, but saying nothing is an automatic fail.',
      simpleFix:
        'Always start speaking within 5 seconds: "Here is my initial thought, and here is how I would solve it simply first..."',
      evidenceQuote: '[No verbal or written answer recorded during this session]',
      marksDeductedApprox: 85,
      remediationFocus: 'Zero-to-One Articulation: Always state initial thoughts and clarify constraints within 10 seconds',
    });
    causes.push({
      category: 'Problem-Solving Methodology',
      title: 'Missing Problem Decomposition & Clarifying Questions',
      simpleTitle: 'Did not ask clarifying questions before solving',
      severity: 'Critical',
      explanation:
        'Without verbal answers, the interviewer cannot gauge your ability to break down problems, ask clarifying questions on input bounds, or walk through a high-level approach.',
      simpleExplanation:
        'You didn\'t ask questions about the problem constraints (e.g. "Can inputs be negative?" or "What is the maximum size?").',
      simpleFix:
        'Always ask 1 clarifying question before coding: "Can the array be empty, and are negative numbers allowed?"',
      evidenceQuote: 'Skipped interview prompts without initial clarifying queries.',
      marksDeductedApprox: 20,
      remediationFocus: 'Structured 3-Step Answering: 1) Clarify, 2) Intuition, 3) Big-O bounds',
    });
    return causes;
  }

  // 2. High: Brevity / Superficial answers
  if (totalCandidateWords < 60) {
    causes.push({
      category: 'Technical Depth & Elaboration',
      title: 'Excessive Brevity & Superficial Explanations',
      simpleTitle: 'Answers were way too short (under 60 words total)',
      severity: 'High',
      explanation:
        `Your entire interview submission contained only ${totalCandidateWords} words across all questions. Senior engineering interviewers look for candidates who can unpack complex technical mechanisms, explain component lifecycles, and evaluate trade-offs. One-sentence responses suggest rote memorization rather than hands-on working proficiency.`,
      simpleExplanation:
        `You answered in just a few words (${totalCandidateWords} words total). One-sentence answers make interviewers think you memorized definitions instead of really understanding how they work.`,
      simpleFix:
        'Use the 3-sentence rule: 1) What it is, 2) How it works under the hood, 3) An example of when you used it.',
      evidenceQuote: actualCandidateTexts[0]?.slice(0, 100) || 'Overly brief responses',
      marksDeductedApprox: 35,
      remediationFocus: '3-Part Elaboration: Define concept, explain runtime mechanism under the hood, cite production example',
    });
  }

  // 3. Asymptotic Complexity (Big-O) Omission
  const hasBigO = /time complexity|space complexity|o\(|o\s*\(|big-o|big\s*o/i.test(lowerAll);
  if (!hasBigO) {
    causes.push({
      category: 'Algorithmic Precision & CS Fundamentals',
      title: 'Omission of Upfront Big-O Time & Space Complexity',
      simpleTitle: 'Forgot to state Time & Memory speed (Big-O)',
      severity: 'High',
      explanation:
        'You discussed algorithms and logic without proactively announcing the computational Time Complexity O(...) and Space Complexity O(...) bounds. In technical and DSA placement rounds, top companies penalize candidates who dive into solutions without quantifying runtime scalability upfront.',
      simpleExplanation:
        'You explained your code solution, but forgot to tell the interviewer how fast it runs (Time Complexity) and how much RAM/memory it uses (Space Complexity).',
      simpleFix:
        'State this in your first sentence before explaining code: "This approach runs in O(N) time and uses O(1) extra space because..."',
      evidenceQuote: 'Did not state Time O(...) or auxiliary Space O(...) in algorithmic answers.',
      marksDeductedApprox: 24,
      remediationFocus: 'Upfront Complexity Protocol: Always state Time O(...) and Space O(...) within the first 30 seconds',
    });
  }

  // 4. Missing Quantitative Metrics in Projects
  const hasMetrics = /\d+%\s*|\d+\s*(ms|seconds|sec|users|rps|qps|queries|req|gb|mb|tb|k\b)/i.test(candidateAllText);
  if (!hasMetrics) {
    causes.push({
      category: 'Engineering Credibility & Project Impact',
      title: 'Lack of Quantified Performance & Scale Metrics',
      simpleTitle: 'Missing real numbers and metrics in your projects',
      severity: 'High',
      explanation:
        'When describing past projects or architectural optimizations, you spoke in generalities ("it was faster", "handled data well") rather than empirical metrics (e.g., "reduced p99 latency by 38% for 4,500 active users"). Placement interviewers use numbers to separate real contributors from passive team members.',
      simpleExplanation:
        'When describing your projects, you used generic phrases like "it made it faster" or "it worked well" without giving real numbers. Interviewers look for concrete numbers to prove you actually built it.',
      simpleFix:
        'Add a number to every project story: "Reduced page load time by 35%" or "Handled 5,000 active users with zero crashes."',
      evidenceQuote: 'Described project features without numerical benchmarks, latency numbers, or scale figures.',
      marksDeductedApprox: 20,
      remediationFocus: 'Quantified Evidence: Anchor project stories with concrete numbers (% speedup, user scale, memory bounds)',
    });
  }

  // 5. Missing Deep Under-the-Hood Mechanics
  const hasDeepMechanics = /event loop|microtask|index|b-tree|thread|concurrency|mutex|connection pool|cache invalidation|race condition|acid|isolation|idempotent/i.test(lowerAll);
  if (!hasDeepMechanics) {
    causes.push({
      category: 'System Architecture & Engineering Depth',
      title: 'Surface-Level Terminology Without Internal Mechanics',
      simpleTitle: 'Did not explain how things work under the hood',
      severity: 'Medium',
      explanation:
        'You referenced popular tools or frameworks without detailing how they operate internally (e.g., event loop execution, database index lookups, memory allocation, or network serialization). Senior interviewers test whether you understand the runtime engine or merely call high-level APIs.',
      simpleExplanation:
        'You mentioned tools and libraries by name, but didn\'t explain what happens inside (e.g. how the event loop works, how database indexing works, or how memory is stored).',
      simpleFix:
        'Explain what happens behind the scenes: "Under the hood, this uses a B-tree index which allows lookups in logarithmic O(log N) time."',
      evidenceQuote: 'Mentioned technical stack without walking through under-the-hood runtime execution.',
      marksDeductedApprox: 18,
      remediationFocus: 'Internal Mechanics Walkthrough: Detail thread safety, data structures, and protocol execution',
    });
  }

  // 6. Unstructured Behavioral Delivery (Non-STAR)
  const hasStarStructure = /situation|task|action|result|star|faced|resolved|impact|outcome/i.test(lowerAll);
  if (!hasStarStructure && candidateMessages.length >= 3) {
    causes.push({
      category: 'Professional Communication & Behavioral Poise',
      title: 'Unstructured Behavioral Storytelling (Missing STAR Method)',
      simpleTitle: 'Project story lacked a clear structure (STAR format)',
      severity: 'Medium',
      explanation:
        'Your answers to behavioral and situational questions lacked a structured narrative. The 15-60-15s STAR technique (15s Situation, 60s concrete personal Actions, 15s measurable Results) ensures you spend 70% of your time highlighting your specific technical actions rather than irrelevant context.',
      simpleExplanation:
        'Your story jumped around without a clear beginning, middle, and end. Spend most of your time on what YOU personally built and the result.',
      simpleFix:
        'Follow this 3-part formula: 1) The Problem (15 sec), 2) What YOU coded/did (45 sec), 3) The Result with numbers (15 sec).',
      evidenceQuote: 'Behavioral responses blended background context with ambiguous personal contributions.',
      marksDeductedApprox: 15,
      remediationFocus: '15-60-15s STAR Blueprint: Emphasize personal technical decisions and quantifiable outcomes',
    });
  }

  // 7. Edge Cases & Boundary Conditions
  const hasEdgeCases = /edge case|boundary|null|undefined|overflow|empty|timeout|partition|concurrency/i.test(lowerAll);
  if (!hasEdgeCases && candidateMessages.length >= 2) {
    causes.push({
      category: 'Production Resilience & Quality Assurance',
      title: 'Neglected Edge Cases, Null Boundaries & Failure Modes',
      simpleTitle: 'Forgot to check edge cases (empty inputs, nulls)',
      severity: 'Medium',
      explanation:
        'Your solutions focused primarily on the "happy path" without proactively identifying boundary constraints (empty arrays, duplicate keys, integer overflow, network drops). Top candidates distinguish themselves by guarding against subtle failure modes before being prompted.',
      simpleExplanation:
        'You only handled normal cases and forgot to mention what happens if the input is empty, null, very large, or contains duplicates.',
      simpleFix:
        'Say: "First, let me check edge cases: if the array is null or has length 0, we should return immediately..."',
      evidenceQuote: 'Proposed solutions did not address invalid inputs, boundary overflow, or network partition errors.',
      marksDeductedApprox: 14,
      remediationFocus: 'Proactive Edge-Case Defense: Test for null pointers, duplicate keys, and extreme inputs upfront',
    });
  }

  // If score is decent but we need refinement causes
  if (causes.length === 0) {
    causes.push({
      category: 'Advanced Engineering Mastery',
      title: 'Refining Distributed Systems Trade-offs & Observability',
      simpleTitle: 'Solid performance! Ready for top 1% system design refinements',
      severity: 'Medium',
      explanation:
        'Solid foundational performance! To cross the 90+ barrier and reach the top 1% benchmark, discuss distributed idempotency, caching invalidation protocols, and distributed tracing telemetry.',
      simpleExplanation:
        'You did great! To reach the absolute top tier, mention caching strategies, system reliability, and handling high server traffic.',
      simpleFix:
        'Mention how your system handles cache invalidation and network retries.',
      evidenceQuote: 'Strong response; further gains require advanced distributed resilience analysis.',
      marksDeductedApprox: 8,
      remediationFocus: 'Advanced Distributed System Architecture & Observability',
    });
  }

  return causes;
}

/**
 * Generates a targeted remediation practice session specifically crafted to fix
 * the candidate's primary weakness or chosen root cause.
 */
export function generateRemediationPlan(
  rootCauses: RootCauseDiagnosis[],
  session: any,
  chosenFocus?: string
): RemediationSessionPlan {
  const role = session?.role || 'Software Development Engineer';
  const company = session?.company || 'Top Tech';

  const primaryCause = chosenFocus
    ? rootCauses.find((c) => c.remediationFocus === chosenFocus || c.title === chosenFocus) || rootCauses[0]
    : rootCauses[0] || {
        category: 'Spoken Communication',
        title: 'Zero-to-One Articulation & Initial Intuition',
        severity: 'Critical' as const,
        explanation: 'Practice verbalizing answers immediately.',
        remediationFocus: 'Zero-to-One Articulation',
      };

  const titleLower = (primaryCause.title + ' ' + primaryCause.remediationFocus).toLowerCase();

  // Route 1: Silence / Zero Verbal Communication
  if (titleLower.includes('silence') || titleLower.includes('zero') || titleLower.includes('non-response')) {
    return {
      weaknessTargeted: 'Zero-to-One Verbalization & Immediate Thought Articulation',
      sessionTitle: `Rapid Articulation Drill for ${company} (${role})`,
      description:
        'Eliminates the hesitation of being silent. Trains you to verbalize your initial problem-solving intuition, state basic definitions, and outline a brute-force approach within the first 10 seconds.',
      focusArea: 'Verbal Articulation & Problem Decomposition',
      targetScoreGoal: 85,
      coachingFormula:
        'Formula: [Repeat core term] -> [State high-level intuition in 1 sentence] -> [Propose brute-force approach] -> [Clarify constraints]',
      questions: [
        {
          question: `Let's practice immediate verbal delivery: In simple, conversational words, explain what a Hash Map is, how it resolves collisions under the hood, and where you used it in a project.`,
          stage: 'technical',
          coachingTip: 'Speak immediately within 5 seconds. Do not wait for perfection—explain the bucket array, hash function, and chaining.',
          drillGoal: 'Overcome hesitation by articulating the fundamental mechanism in the first 15 seconds.',
          expectedKeyTerms: ['hash function', 'buckets', 'chaining / open addressing', 'O(1) average lookup'],
        },
        {
          question: `Problem Solving: You are given an array of integers and need to find the pair with the maximum sum. Walk me out loud through your thought process from brute force to optimal.`,
          stage: 'dsa',
          coachingTip: 'State the brute force O(N^2) first, then immediately propose the two-variable scan in O(N). Announce Time & Space out loud.',
          drillGoal: 'Demonstrate active thinking aloud rather than staying silent while calculating.',
          expectedKeyTerms: ['brute force O(N^2)', 'two largest elements', 'Time O(N)', 'Space O(1)'],
        },
        {
          question: `Behavioral Articulation: Tell me about a small technical challenge you encountered when setting up your development environment or learning a new framework.`,
          stage: 'behavioral',
          coachingTip: 'Use a simple 30-second STAR structure: 10s issue, 15s how you debugged it, 5s what you learned.',
          drillGoal: 'Maintain continuous, fluid spoken delivery without long awkward pauses.',
          expectedKeyTerms: ['error logs', 'debugging steps', 'fix applied', 'key takeaway'],
        },
      ],
    };
  }

  // Route 2: Big-O Complexity & Algorithmic Rigor
  if (titleLower.includes('big-o') || titleLower.includes('complexity') || titleLower.includes('asymptotic')) {
    return {
      weaknessTargeted: 'Upfront Big-O Runtime & Auxiliary Space Complexity Analysis',
      sessionTitle: `Algorithmic Rigor & Big-O Protocol Drill for ${company}`,
      description:
        'Drills the habit of proactively analyzing and announcing Time O(...) and Space O(...) complexity in the first 30 seconds of every coding and system problem.',
      focusArea: 'Data Structures, Algorithms & Complexity',
      targetScoreGoal: 90,
      coachingFormula:
        'Rule: State "This approach achieves Time O(N) and auxiliary Space O(1) because..." BEFORE writing or describing code.',
      questions: [
        {
          question: `Complexity Drill 1: You need to detect a cycle in a singly linked list. Explain Floyd's Tortoise and Hare algorithm. State both the exact Time and Space complexities within your first two sentences.`,
          stage: 'dsa',
          coachingTip: 'State Time O(N) and Space O(1) immediately. Contrast this against a hash set approach which requires Space O(N).',
          drillGoal: 'Proactively announce complexity bounds upfront and contrast against naive approaches.',
          expectedKeyTerms: ['Time O(N)', 'Space O(1)', 'slow and fast pointers', 'hash set alternative requires O(N) space'],
        },
        {
          question: `Complexity Drill 2: Suppose you have a stream of 10 million integers and must find the median dynamically. Compare a sorting approach vs two heaps (MaxHeap + MinHeap). Walk through the Big-O for insertion and retrieval.`,
          stage: 'dsa',
          coachingTip: 'Compare insertion: sorting is O(N log N) vs Two Heaps which is O(log N). Retrieval: O(1) for two heaps. State auxiliary memory Space O(N).',
          drillGoal: 'Contrast time/space tradeoffs between alternative data structures.',
          expectedKeyTerms: ['insertion Time O(log N)', 'median retrieval Time O(1)', 'auxiliary Space O(N)', 'heap balance'],
        },
        {
          question: `System Complexity: In a distributed key-value store, how does in-memory indexing (e.g. LSM-tree vs B-Tree) impact write throughput vs read latency complexity?`,
          stage: 'technical',
          coachingTip: 'Explain write amplification: LSM-trees optimize for O(1) sequential append writes; B-Trees require O(log N) in-place page writes.',
          drillGoal: 'Bridge Big-O computational bounds with real-world system architecture tradeoffs.',
          expectedKeyTerms: ['sequential append O(1)', 'write amplification', 'compaction', 'B-Tree logarithmic search O(log N)'],
        },
      ],
    };
  }

  // Route 3: Lack of Quantified Metrics in Projects
  if (titleLower.includes('metric') || titleLower.includes('quantified') || titleLower.includes('scale') || titleLower.includes('numbers')) {
    return {
      weaknessTargeted: 'Quantified Engineering Metrics & Empirical Evidence',
      sessionTitle: `Metric-Driven Project Defense Drill for ${company}`,
      description:
        'Trains you to eliminate vague generalities and anchor all engineering stories with hard numbers: % latency reduction, throughput (RPS), active user scale, query execution time, and memory overhead.',
      focusArea: 'Resume Deep Dive & Architectural Impact',
      targetScoreGoal: 90,
      coachingFormula:
        'Formula: [Technology used] + [Previous baseline metric] -> [Your specific optimization] -> [Final quantified outcome (% or absolute)]',
      questions: [
        {
          question: `Quantified Metric Drill 1: Pick the flagship project on your resume. Explain a specific bottleneck you discovered in development and state the exact numbers: what was the latency before, what was it after, and what scale of data did it process?`,
          stage: 'resume',
          coachingTip: 'Cite concrete numbers! E.g. "reduced API response time from 420ms to 160ms (62% drop) for 2,500 simulated concurrent requests using Redis caching and indexing".',
          drillGoal: 'Provide empirical before-and-after benchmarks instead of qualitative descriptions.',
          expectedKeyTerms: ['baseline number (e.g. ms or seconds)', '% improvement or speedup', 'concurrent requests / data volume', 'resource savings'],
        },
        {
          question: `Quantified Metric Drill 2: Suppose your database queries start taking 3 seconds under 5,000 requests per second during campus placement registrations. Walk me through the diagnostic metrics you check and the specific fix you apply to bring query time below 100ms.`,
          stage: 'technical',
          coachingTip: 'Mention EXPLAIN ANALYZE, slow query log thresholds (>200ms), composite B-Tree indexes, and connection pool sizing (e.g. pool size of 20-50).',
          drillGoal: 'Demonstrate familiarity with real performance metrics, query plans, and connection limits.',
          expectedKeyTerms: ['EXPLAIN ANALYZE', 'query execution time < 100ms', 'B-tree index scan', 'connection pool bounds'],
        },
        {
          question: `Behavioral Metric Drill: Describe a time you collaborated with peers to ship a technical project. How did you measure team velocity, code quality, or successful user adoption?`,
          stage: 'behavioral',
          coachingTip: 'Include numbers: e.g. "shipped 3 sprints on time, maintained 85% test coverage, onboarded 350 active student users".',
          drillGoal: 'Infuse behavioral answers with measurable team and product impact.',
          expectedKeyTerms: ['sprint deadlines', 'test coverage %', 'user adoption / engagement metrics', 'measurable outcome'],
        },
      ],
    };
  }

  // Route 4: Deep Under-the-Hood System Mechanics
  if (titleLower.includes('mechanic') || titleLower.includes('depth') || titleLower.includes('superficial') || titleLower.includes('internal')) {
    return {
      weaknessTargeted: 'Under-the-Hood Runtime Mechanics & Internal Architecture',
      sessionTitle: `Deep System Mechanics & Protocol Drill for ${company}`,
      description:
        'Trains you to move beyond surface-level API usage and explain how systems actually execute at the memory, thread, protocol, and database engine level.',
      focusArea: 'Core CS, Concurrency & Internal Mechanics',
      targetScoreGoal: 88,
      coachingFormula:
        'Formula: [High-level API] -> [Memory / Thread model underneath] -> [Failure mode / Race condition to prevent]',
      questions: [
        {
          question: `Runtime Mechanics Drill 1: Explain step-by-step what happens in Node.js when an async I/O call like fs.readFile executes. Walk through the call stack, libuv thread pool, event loop phases, and the callback queue.`,
          stage: 'technical',
          coachingTip: 'Name the specific components: V8 call stack -> libuv worker thread -> OS non-blocking poll -> poll phase -> callback execution.',
          drillGoal: 'Demonstrate deep under-the-hood mastery of asynchronous runtimes.',
          expectedKeyTerms: ['libuv thread pool', 'poll phase', 'microtask vs macrotask', 'V8 call stack', 'non-blocking I/O'],
        },
        {
          question: `Database Mechanics Drill 2: How does a relational database index actually work under the hood? Explain the B-Tree node structure, page splits, and why index lookups take O(log N) page I/Os.`,
          stage: 'technical',
          coachingTip: 'Explain disk pages (typically 8KB or 16KB), balanced tree branching factor, binary search within the node page, and leaf node linked list pointers for range scans.',
          drillGoal: 'Explain storage engine mechanics and disk I/O costs.',
          expectedKeyTerms: ['B-Tree balanced structure', 'disk page I/O', 'root, branch, leaf nodes', 'range scan linked list'],
        },
        {
          question: `Concurrency & Memory Drill 3: How do you prevent race conditions and memory leaks in stateful applications? Contrast optimistic locking vs pessimistic locking.`,
          stage: 'technical',
          coachingTip: 'Explain version columns (version_id) in optimistic locking vs SELECT FOR UPDATE in pessimistic locking. Mention deadlocks and rollback recovery.',
          drillGoal: 'Address concurrency synchronization and data consistency at the database level.',
          expectedKeyTerms: ['version number check', 'optimistic vs pessimistic', 'SELECT FOR UPDATE', 'deadlock prevention'],
        },
      ],
    };
  }

  // Route 5: Default / STAR Behavioral Narrative
  return {
    weaknessTargeted: 'STAR Behavioral Framework & Crisp Technical Delivery',
    sessionTitle: `Structured STAR Delivery & Poise Drill for ${company}`,
    description:
      'Master the 15-60-15s STAR formula (15s Situation, 60s personal technical Actions, 15s quantifiable Results) to deliver high-impact behavioral answers.',
    focusArea: 'Behavioral Poise & Structured Storytelling',
    targetScoreGoal: 90,
    coachingFormula:
      'Formula: 15s Situation (Context) -> 60s Action (Exact technical code/decisions YOU made) -> 15s Result (Quantified impact)',
    questions: [
      {
        question: `STAR Drill 1: Tell me about a time you had a technical disagreement with a team member regarding system architecture or technology selection. Walk through Situation, Task, Action, and Result.`,
        stage: 'behavioral',
        coachingTip: 'Dedicate 60% of your answer to the concrete Actions: how you benchmarked both options, collected data, and facilitated consensus.',
        drillGoal: 'Apply the 15-60-15s STAR structure with clear personal accountability.',
        expectedKeyTerms: ['Situation in 15s', 'data-driven benchmarking', 'personal mediation Actions', 'quantified collaborative Result'],
      },
      {
        question: `STAR Drill 2: Describe a scenario where a critical bug slipped into production or a project demo almost failed. How did you diagnose it under pressure?`,
        stage: 'behavioral',
        coachingTip: 'Focus on root-cause isolation (logs, reproducing locally), mitigation under pressure, and the automated test added to prevent regression.',
        drillGoal: 'Demonstrate calm problem-solving and permanent post-mortem remediation.',
        expectedKeyTerms: ['immediate triage', 'log inspection', 'hotfix deployment', 'automated regression test'],
      },
      {
        question: `STAR Drill 3: Why should ${company} hire you over other qualified candidates for the ${role} position? Anchor your answer in 2 concrete engineering strengths.`,
        stage: 'wrapup',
        coachingTip: 'Highlight: 1) Proven track record of mastering CS fundamentals & Big-O thinking, 2) Fast adaptability and passion for production quality.',
        drillGoal: 'Deliver a crisp, memorable closing pitch aligned with company engineering values.',
        expectedKeyTerms: ['core engineering strengths', 'quantifiable track record', 'passion for scalable systems'],
      },
    ],
  };
}

/**
 * Creates an executable InterviewSession pre-configured for Targeted Remediation
 */
export function createCustomRemediationSession(
  plan: RemediationSessionPlan,
  baseSession: any
): InterviewSession {
  const role = baseSession?.role || 'Software Development Engineer';
  const company = baseSession?.company || 'General Tech';
  const difficulty = baseSession?.difficulty || 'Intermediate';

  return {
    id: 'remediation-' + Date.now(),
    mode: 'remediation',
    title: plan.sessionTitle,
    role,
    company,
    difficulty,
    interviewer: baseSession?.interviewer || {
      id: 'alex',
      name: 'Alex',
      title: 'Bar Raiser & Remediation Coach',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      tone: 'Targeted, highly diagnostic, weakness-fixing focus',
      description: 'Specializes in zeroing in on candidate shortfalls and coaching them to Placement Ready standards.',
      accent: 'Analytical & Direct',
    },
    topics: ['Technical', 'DSA', 'Remediation', plan.focusArea],
    createdAt: Date.now(),
    status: 'in_progress',
    totalQuestions: plan.questions.length,
    permissionsApproved: true,
    isRemediation: true,
    remediationFocus: plan.weaknessTargeted,
    targetWeakness: plan.weaknessTargeted,
    customQuestions: plan.questions,
  };
}
