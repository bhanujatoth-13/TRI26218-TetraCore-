import { EvaluationReport, InterviewSession, StudentProfile } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'mockmate_profile',
  SESSIONS: 'mockmate_sessions',
  REPORTS: 'mockmate_reports',
};

export const SAMPLE_RESUME_CS = `ANANYA SHARMA
Email: ananya.sharma@example.edu | GitHub: github.com/ananya-dev | LinkedIn: linkedin.com/in/ananya-sharma
B.Tech Computer Science and Engineering, National Institute of Technology (2022 - 2026), CGPA: 8.9/10

TECHNICAL SKILLS:
- Languages: TypeScript, JavaScript, Python, C++, SQL
- Frontend: React.js, Next.js, Tailwind CSS, Redux Toolkit
- Backend & DB: Node.js, Express, PostgreSQL, MongoDB, Redis, REST APIs, GraphQL
- Tools: Git, Docker, AWS (S3, Lambda), Linux, Postman

PROJECTS:
1. DevFlow - Real-time Collaborative Code Workspace:
- Built full-stack collaborative editor using React, WebSockets, and Node.js microservices.
- Implemented operational transformation algorithms handling 20+ concurrent socket connections with sub-50ms latency.
- Containerized with Docker and deployed on AWS ECS with automated CI/CD pipeline.

2. Campus Placement Portal & Algorithmic Matcher:
- Designed relational PostgreSQL schema with complex indexing for 3,500+ student profiles and 60+ recruiters.
- Implemented resume keyword semantic match ranker achieving 92% placement coordinator accuracy rating.
- Integrated JWT authentication and role-based access control (RBAC).

EXPERIENCE & ACHIEVEMENTS:
- Software Engineering Intern at FinTech Startup (Summer 2025): Optimized API queries reducing p99 latency by 38%.
- Knight on LeetCode (Rating 1890+, 450+ problems solved across DP, Graphs, and Trees).
- Finalist at Smart India Hackathon 2024.`;

export const SAMPLE_RESUME_DATA = `RAHUL VERMA
Email: rahul.verma@example.edu | Portfolio: rahulverma.dev
B.Tech in Information Technology, 2022-2026, CGPA: 8.6/10

SKILLS:
- Data Analysis & Science: Python (Pandas, NumPy, Scikit-Learn), SQL, Tableau, Power BI
- Engineering: FastAPI, PostgreSQL, Git, Statistical Modeling, A/B Testing

PROJECTS:
1. E-Commerce Customer Churn Prediction Engine:
- Trained XGBoost and Random Forest classifiers on 100K+ transactional records with 89% ROC-AUC.
- Built interactive monitoring dashboard with Streamlit and automated weekly batch inference.

2. Placement Trends & Salary Insight Visualizer:
- Extracted and cleaned 5 years of campus placement records using Pandas and regex.
- Created interactive dashboards in Tableau and embedded them into a web app.`;

export const INTERVIEWERS = [
  {
    id: 'aria' as const,
    name: 'Aria',
    title: 'Senior Campus Recruiter & Career Coach',
    avatar: '/src/assets/images/female_interviewer_avatar_1791667770929.jpg',
    tone: 'Encouraging, structured, and campus-friendly',
    description: 'Specializes in behavioral rounds, communication poise, and foundational tech screening.',
    accent: 'Warm & Professional',
  },
  {
    id: 'alex' as const,
    name: 'Alex',
    title: 'Lead Systems Architect & FAANG Bar Raiser',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    tone: 'Rigorous, analytical, and edge-case focused',
    description: 'Probes deep into data structures, computational trade-offs, and architecture bottlenecks.',
    accent: 'Analytical & Direct',
  },
  {
    id: 'elena' as const,
    name: 'Elena',
    title: 'Global HR Director & Culture Assessor',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    tone: 'Empathetic, deep listener, STAR methodology evaluator',
    description: 'Evaluates culture-fit, situational problem solving, ownership, and cross-team leadership.',
    accent: 'Balanced & Thoughtful',
  },
];

const DEFAULT_PROFILE: StudentProfile = {
  name: 'Ananya Sharma',
  college: 'National Institute of Technology',
  graduationYear: '2026',
  targetRole: 'Software Development Engineer (SDE-1)',
  targetCompany: 'Google & TCS Digital',
  resumeText: SAMPLE_RESUME_CS,
  extractedSkills: [
    'Data Structures & Algorithms',
    'TypeScript',
    'React',
    'Node.js',
    'PostgreSQL',
    'Docker',
    'System Design',
    'Git',
  ],
  streakDays: 4,
};

const DEFAULT_REPORTS: EvaluationReport[] = [
  {
    id: 'rep-tcs-101',
    sessionId: 'sess-tcs-101',
    role: 'SDE-1 / Digital Cadre',
    company: 'TCS',
    difficulty: 'Campus / Entry',
    overallScore: 86,
    performanceTier: 'Placement Ready',
    categoryScores: {
      technical: 88,
      communication: 90,
      problemSolving: 82,
      confidence: 86,
      accuracy: 84,
    },
    strengths: [
      'Very articulate STAR responses during behavioral and HR screening',
      'Solid command of OOPs fundamentals, polymorphism, and database normalization',
      'Calm and confident delivery with professional posture and tone',
    ],
    weaknesses: [
      'Could explain space complexity optimizations more proactively during algorithmic explanations',
      'Make sure to mention automated testing strategies when discussing web projects',
    ],
    questionBreakdown: [
      {
        questionNumber: 1,
        stage: 'warmup',
        question: 'Introduce yourself and walk me through your engineering journey and what excites you about TCS.',
        candidateAnswer: 'Introduced background in CSE, core full-stack stack, and passion for large-scale enterprise transformation.',
        score: 92,
        feedback: 'Clear, concise, and stayed within 90 seconds without filler words.',
        sampleAnswer: 'Start with current degree & focus area, highlight 1 flagship project with quantifiable outcomes, and bridge to why the company matches your career aspirations.',
      },
      {
        questionNumber: 2,
        stage: 'technical',
        question: 'Explain the difference between synchronous and asynchronous operations in Node.js and how the Event Loop handles I/O.',
        candidateAnswer: 'Explained single-threaded non-blocking architecture, libuv worker threads, and microtask vs macrotask queues.',
        score: 88,
        feedback: 'Thorough conceptual accuracy and good usage of technical terminology.',
        sampleAnswer: 'Node.js delegates heavy I/O to libuv threadpool while the main event loop processes callbacks via microtask (promises) and macrotask (timers/I/O) phases.',
      },
      {
        questionNumber: 3,
        stage: 'dsa',
        question: 'Given an array of integers, how would you determine if there exists a subarray whose sum equals zero in O(N)?',
        candidateAnswer: 'Proposed prefix sums combined with a HashSet to detect recurring cumulative sums.',
        score: 85,
        feedback: 'Instantly recognized the optimal prefix sum pattern with O(N) time and O(N) space.',
        sampleAnswer: 'Compute running prefix sums; if prefixSum === 0 or prefixSum already exists in the seen set, return true. Time O(N), Space O(N).',
      },
      {
        questionNumber: 4,
        stage: 'behavioral',
        question: 'Describe a project where you faced a tight deadline or technical obstacle. How did you prioritize?',
        candidateAnswer: 'Shared hackathon project experience where API rate limits threatened demo; implemented Redis cache under pressure.',
        score: 89,
        feedback: 'Strong situation-action-result narrative with clear personal contribution.',
        sampleAnswer: 'Clearly state the stakes, the exact options evaluated, the chosen workaround, and the measurable result (e.g., successful zero-downtime demo).',
      },
    ],
    recommendedResources: [
      {
        title: 'TCS Digital Advanced Technical Preparation Guide',
        type: 'Practice',
        description: 'Covers core Java/Python concepts, relational indexing, and DSA frequency lists.',
        linkOrKeyTakeaway: 'Focus on recursion trees, array hash lookups, and SQL joins.',
      },
      {
        title: 'STAR Method Presentation Blueprint',
        type: 'Framework',
        description: 'How to structure HR answers to highlight leadership, ownership, and measurable impact.',
        linkOrKeyTakeaway: 'Spend 60% of narrative on Actions and Results rather than setting up the backstory.',
      },
    ],
    interviewerVerdict: 'High-probability campus hire for the TCS Digital band. Candidate demonstrated structured thought, strong core computer science fundamentals, and poise.',
    companyFitScore: 90,
    proctorTrustScore: 100,
    tabSwitches: 0,
    completedAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    durationSeconds: 780,
  },
  {
    id: 'rep-google-102',
    sessionId: 'sess-google-102',
    role: 'Software Development Engineer (SDE-1)',
    company: 'Google',
    difficulty: 'Advanced',
    overallScore: 81,
    performanceTier: 'Near Ready',
    categoryScores: {
      technical: 85,
      communication: 82,
      problemSolving: 84,
      confidence: 76,
      accuracy: 80,
    },
    strengths: [
      'Strong algorithmic intuition; immediately verified constraints and edge cases',
      'Clean explanation of Big-O asymptotic bounds',
    ],
    weaknesses: [
      'Take a brief pause to outline trade-offs before committing to the first proposed algorithm',
      'Be more assertive when asked to defend design choices',
    ],
    questionBreakdown: [
      {
        questionNumber: 1,
        stage: 'warmup',
        question: 'What is the most technically complex bug you have ever diagnosed, and how did you resolve it?',
        candidateAnswer: 'Discussed a WebSocket race condition causing out-of-order state merges in collaborative text editor.',
        score: 84,
        feedback: 'Good technical depth; explain root cause analysis methodology earlier in the response.',
        sampleAnswer: 'Structure as: Symptom -> Hypothesis -> Verification with logs -> Root cause -> Fix & regression test.',
      },
      {
        questionNumber: 2,
        stage: 'dsa',
        question: 'Design an LRU Cache with O(1) get and put operations.',
        candidateAnswer: 'Proposed hash map combined with doubly linked list to achieve constant time lookups and updates.',
        score: 88,
        feedback: 'Accurately articulated node removal and insertion mechanics.',
        sampleAnswer: 'Map keys to DoublyLinkedList nodes. On get/put, move accessed node to head. Evict tail node on capacity overflow.',
      },
    ],
    recommendedResources: [
      {
        title: 'Google SDE Coding Interview Patterns',
        type: 'Practice',
        description: 'Top patterns tested in Google technical screening: Monotonic stacks, Dijkstra, and Interval Scheduling.',
        linkOrKeyTakeaway: 'Always verify constraints: null inputs, negative numbers, integer overflows.',
      },
    ],
    interviewerVerdict: 'Promising candidate with solid problem-solving foundation. Advancing to mock loop with focus on distributed systems fundamentals.',
    companyFitScore: 82,
    proctorTrustScore: 92,
    tabSwitches: 1,
    rootCauses: [
      {
        category: 'Algorithmic Precision & CS Fundamentals',
        title: 'Omission of Upfront Big-O Time & Space Complexity',
        severity: 'High',
        explanation: 'Candidate dove into algorithm implementation without explicitly deriving asymptotic Time O(...) and Space O(...) bounds upfront in the first 30 seconds.',
        evidenceQuote: 'Proposed doubly linked list without upfront runtime and memory analysis.',
        marksDeductedApprox: 12,
        remediationFocus: 'Upfront Complexity Protocol: Always state Time O(...) and Space O(...) within the first 30 seconds',
      },
      {
        category: 'Engineering Credibility & Project Impact',
        title: 'Lack of Quantified Performance & Scale Metrics',
        severity: 'Medium',
        explanation: 'Described WebSocket bug resolution without citing exact concurrent client connections, latency percentiles, or socket drop rates.',
        evidenceQuote: 'Vague description of WebSocket race condition without empirical benchmark numbers.',
        marksDeductedApprox: 7,
        remediationFocus: 'Quantified Evidence: Anchor project stories with concrete numbers (% speedup, user scale, memory bounds)',
      },
    ],
    remediationPlan: {
      weaknessTargeted: 'Upfront Big-O Runtime & Auxiliary Space Complexity Analysis',
      sessionTitle: 'Algorithmic Rigor & Big-O Protocol Drill for Google (SDE-1)',
      description: 'Drills the habit of proactively analyzing and announcing Time O(...) and Space O(...) complexity in the first 30 seconds of every coding and system problem.',
      focusArea: 'Data Structures, Algorithms & Complexity',
      targetScoreGoal: 90,
      coachingFormula: 'Rule: State "This approach achieves Time O(N) and auxiliary Space O(1) because..." BEFORE writing or describing code.',
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
    },
    completedAt: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
    durationSeconds: 1140,
  },
  {
    id: 'rep-amazon-103',
    sessionId: 'sess-amazon-103',
    role: 'Software Development Engineer (SDE-1)',
    company: 'Amazon',
    difficulty: 'Intermediate',
    overallScore: 52,
    performanceTier: 'Needs Focused Practice',
    categoryScores: {
      technical: 50,
      communication: 58,
      problemSolving: 48,
      confidence: 52,
      accuracy: 52,
    },
    strengths: [
      'Polite and respectful tone throughout the screening round',
      'Familiar with basic object-oriented programming concepts',
    ],
    weaknesses: [
      'Answers were overly brief and lacked deep technical and algorithmic mechanics',
      'Did not provide quantitative metrics for past projects or benchmarks',
      'Failed to state Big-O runtime and space complexity upfront',
    ],
    drawbacks: [
      'Superficial responses: Provided high-level definitions without unpacking runtime memory models or thread synchronization.',
      'Omitted Big-O bounds: Did not announce asymptotic runtime or memory overhead before proposing logic.',
      'Lack of STAR behavioral structure: Stories lacked separation between background context and personal technical contributions.',
    ],
    improvements: [
      'Apply the 15-60-15s STAR method: Spend 15s on situation, 60s detailing exact code and technical decisions you made, 15s on measurable results.',
      'Announce Time O(...) and Space O(...) within the first 30 seconds of any algorithmic problem.',
      'Quantify past projects with 2-3 hard benchmark numbers (% latency reduction, queries/second, active users).',
    ],
    rootCauses: [
      {
        category: 'Algorithmic Precision & CS Fundamentals',
        title: 'Omission of Upfront Big-O Time & Space Complexity',
        severity: 'Critical',
        explanation: 'Candidate dove into algorithm descriptions without calculating computational Time Complexity O(...) or memory Space Complexity O(...). In Amazon SDE bar-raiser loops, missing Big-O analysis causes automatic point deductions.',
        evidenceQuote: 'Described sliding window logic without stating Time O(N) or auxiliary Space O(K) bounds.',
        marksDeductedApprox: 24,
        remediationFocus: 'Upfront Complexity Protocol: Always state Time O(...) and Space O(...) within the first 30 seconds',
      },
      {
        category: 'Engineering Credibility & Project Impact',
        title: 'Lack of Quantified Performance & Scale Metrics',
        severity: 'High',
        explanation: 'When discussing engineering projects, candidate spoke in broad qualitative statements ("it ran fast", "handled the traffic") rather than empirical numbers (% latency reduction, requests per second, database query times).',
        evidenceQuote: 'Spoke in vague qualitative generalities without numbers, percentages, or scale metrics.',
        marksDeductedApprox: 18,
        remediationFocus: 'Quantified Evidence: Anchor project stories with concrete numbers (% speedup, user scale, memory bounds)',
      },
      {
        category: 'Professional Communication & Behavioral Poise',
        title: 'Unstructured Behavioral Storytelling (Missing STAR Method)',
        severity: 'Medium',
        explanation: 'Answers to behavioral and teamwork scenarios lacked the structured 15-60-15s STAR formula, blurring the line between general team tasks and the candidate\'s own engineering contribution.',
        evidenceQuote: 'Story wandered through background history without clear personal engineering actions or measurable results.',
        marksDeductedApprox: 14,
        remediationFocus: '15-60-15s STAR Blueprint: Emphasize personal technical decisions and quantifiable outcomes',
      },
    ],
    remediationPlan: {
      weaknessTargeted: 'Upfront Big-O Runtime & Auxiliary Space Complexity Analysis',
      sessionTitle: 'Targeted Remediation Drill: Algorithmic Big-O & Quantitative Precision for Amazon',
      description: 'Engineered specifically to overcome the -24 point deduction on Big-O analysis and the -18 point deduction on project metrics. Drills upfront asymptotic bounds and empirical project defense.',
      focusArea: 'Data Structures, Algorithms & Complexity',
      targetScoreGoal: 85,
      coachingFormula: 'Rule: State "This approach achieves Time O(N) and auxiliary Space O(1) because..." in your first 20 seconds, followed by 2 boundary tests.',
      questions: [
        {
          question: 'Amazon Complexity Drill 1: You are given an array of customer order amounts and need to find the maximum sum of any contiguous subarray of size K. State your optimal approach and its Time and Space complexity in your first sentence.',
          stage: 'dsa',
          coachingTip: 'Immediately announce: "This is solved via a fixed-size sliding window in Time O(N) and Space O(1)." Explain why recalculating from scratch is O(N*K) and inferior.',
          drillGoal: 'State Big-O upfront in the first sentence and contrast optimal against naive approaches.',
          expectedKeyTerms: ['Time O(N)', 'Space O(1)', 'sliding window', 'naive O(N*K)'],
        },
        {
          question: 'Amazon Metric Defense Drill: Tell me about an API or database query you designed or optimized. State the exact latency before optimization, the latency after, and how many requests per second it handled.',
          stage: 'resume',
          coachingTip: 'Use concrete numbers! E.g. "reduced p99 latency from 450ms to 120ms (73% speedup) under 3,000 queries/second by adding a compound B-tree index and Redis cache."',
          drillGoal: 'Provide empirical before-and-after benchmarks instead of qualitative generalities.',
          expectedKeyTerms: ['latency before vs after in ms', '% reduction', 'throughput in requests/sec', 'indexing / caching mechanism'],
        },
        {
          question: 'Amazon STAR Drill: Describe a time a project deadline was at risk due to an unexpected technical roadblock. Structure your answer strictly using Situation (15s), Task (10s), Action (60s), and Result (15s).',
          stage: 'behavioral',
          coachingTip: 'Spend 60% of your time on the Actions YOU personally took: code written, debugging logs reviewed, and the measurable outcome achieved.',
          drillGoal: 'Execute crisp 15-60-15s STAR structure with personal technical accountability.',
          expectedKeyTerms: ['Situation', 'Task', 'personal Action', 'quantifiable Result'],
        },
      ],
    },
    questionBreakdown: [
      {
        questionNumber: 1,
        stage: 'warmup',
        question: 'Tell me about yourself and your background in software engineering.',
        candidateAnswer: 'I am a student pursuing CSE and I have built full stack websites with React and Node.',
        score: 45,
        feedback: 'Extremely brief. Fails to highlight flagship project metrics, architectural focus, or why you match the Amazon SDE bar.',
        missingConcepts: ['Quantified project achievements', 'Core engineering focus area', 'Alignment with scalable systems'],
        whyItNeedsImprovement: 'A 15-word introduction prevents the interviewer from evaluating your technical depth, drive, or communication competence.',
        sampleAnswer: 'Structure with 3 pillars: current degree and focus, flagship project with concrete numbers (% latency reduction or scale), and alignment with company technology.',
      },
      {
        questionNumber: 2,
        stage: 'dsa',
        question: 'How do you find the maximum subarray sum in an array of numbers?',
        candidateAnswer: 'We can loop through the array and check all possible subarrays and find the max sum.',
        score: 48,
        feedback: 'Proposed brute-force nested scan without mentioning Kadane\'s algorithm or Big-O complexity bounds.',
        missingConcepts: ['Kadane\'s algorithm in Time O(N)', 'Asymptotic Space O(1)', 'Omission of Big-O bounds upfront'],
        whyItNeedsImprovement: 'In placement interviews, proposing only an O(N^2) brute force without identifying the optimal O(N) linear scan indicates weak DSA preparation.',
        sampleAnswer: 'Kadane\'s algorithm tracks maxEndingHere and maxSoFar in a single linear pass with Time O(N) and auxiliary Space O(1).',
      },
      {
        questionNumber: 3,
        stage: 'behavioral',
        question: 'Tell me about a disagreement you had with a team member.',
        candidateAnswer: 'We had a disagreement about which database to use, but we talked and picked MongoDB.',
        score: 55,
        feedback: 'Did not use the STAR method. Missing the engineering criteria evaluated, data-driven benchmarking, and measurable outcome.',
        missingConcepts: ['15-60-15s STAR method', 'Empirical benchmarking of trade-offs', 'Collaborative data-driven mediation'],
        whyItNeedsImprovement: 'Interviewers look for how you handle conflict using data, technical pros/cons, and consensus rather than arbitrary decisions.',
        sampleAnswer: 'Explain the conflicting requirements (e.g. relational schema consistency vs unstructured document flexibility), how you benchmarked prototype query latencies, and how data drove team consensus.',
      },
    ],
    recommendedResources: [
      {
        title: 'Amazon Leadership Principles & STAR Interview Mastery',
        type: 'Framework',
        description: 'How to structure answers for Amazon SDE loops with Customer Obsession and Bias for Action.',
        linkOrKeyTakeaway: 'Always detail specific technical Actions and quantifiable impact.',
      },
      {
        title: 'Kadane Algorithm & Subarray Complexity Mastery',
        type: 'Practice',
        description: 'Linear time dynamic programming patterns for arrays and sliding windows.',
        linkOrKeyTakeaway: 'State Time O(N) and auxiliary Space O(1) immediately.',
      },
    ],
    interviewerVerdict: 'Candidate has basic potential but fell below the Amazon SDE-1 placement bar (Score: 52/100). Critical need to practice upfront Big-O complexity analysis and metric-driven project articulation before retaking.',
    companyFitScore: 54,
    proctorTrustScore: 95,
    tabSwitches: 0,
    completedAt: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
    durationSeconds: 650,
  },
];

export function getProfile(): StudentProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: StudentProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error(e);
  }
}

export function getSessions(): InterviewSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveSession(session: InterviewSession): void {
  try {
    const list = getSessions();
    const existingIndex = list.findIndex((s) => s.id === session.id);
    if (existingIndex >= 0) {
      list[existingIndex] = session;
    } else {
      list.unshift(session);
    }
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

export function getReports(): EvaluationReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_REPORTS;
}

export function saveReport(report: EvaluationReport): void {
  try {
    const list = getReports();
    const existingIndex = list.findIndex((r) => r.id === report.id);
    if (existingIndex >= 0) {
      list[existingIndex] = report;
    } else {
      list.unshift(report);
    }
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(list));
    // Update streak and profile stats
    const prof = getProfile();
    prof.streakDays = Math.max(1, prof.streakDays + 1);
    saveProfile(prof);
  } catch (e) {
    console.error(e);
  }
}

export function getReportById(id: string): EvaluationReport | undefined {
  const reports = getReports();
  return reports.find((r) => r.id === id || r.sessionId === id);
}
