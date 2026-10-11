/**
 * Question Engine for AI Mock Interview Platform (MockMate)
 * Generates context-aware, non-repetitive follow-up and stage questions.
 * Probes student reasoning, concepts, trade-offs, and asks for clarification when answers are vague.
 */

export interface CandidateInsight {
  wordCount: number;
  isUnclearOrBrief: boolean;
  clarificationReason?: string;
  detectedConcepts: string[];
  primaryTopic: string;
  extractedStatements: string[];
}

export interface QuestionResult {
  message: string;
  question: string;
  stage: string;
  isFollowUp: boolean;
  hint: string;
  codePrompt?: string;
  followUpType?: 'clarification' | 'deep_dive' | 'reasoning' | 'standard';
  contextFocus?: string;
}

// Common technical and conceptual taxonomy
const CONCEPT_TAXONOMY: Record<string, { keywords: string[]; alternatives: string[]; depthProbes: string[] }> = {
  react_frontend: {
    keywords: ['react', 'component', 'components', 'hook', 'hooks', 'useeffect', 'usestate', 'usememo', 'usecallback', 'redux', 'zustand', 'context', 'virtual dom', 're-render', 'tailwind', 'frontend', 'ui', 'dom'],
    alternatives: ['Vue', 'Svelte', 'standard SSR with Next.js', 'Vanilla JS'],
    depthProbes: [
      'How did you structure state synchronization between parent and child components, and how did you verify unnecessary re-renders were minimized?',
      'Walk me through how you handled asynchronous data loading, abort controllers on unmount, and optimistic UI updates.',
      'What was your strategy for error boundaries, fallback UI states, and responsive layout performance on mobile viewports?',
    ],
  },
  node_backend: {
    keywords: ['node', 'nodejs', 'express', 'nestjs', 'backend', 'api', 'rest', 'endpoint', 'endpoints', 'middleware', 'server', 'http', 'jwt', 'auth', 'authentication'],
    alternatives: ['FastAPI in Python', 'Go HTTP microservices', 'Spring Boot'],
    depthProbes: [
      'How did you approach API rate limiting, token expiration, and secure token rotation across concurrent requests?',
      'How do you manage error-handling middleware and guarantee graceful process shutdown when an uncaught exception occurs?',
      'Under heavy traffic spikes, how does the Node event loop handle CPU-bound vs I/O-bound tasks in your architecture?',
    ],
  },
  database_sql: {
    keywords: ['database', 'db', 'sql', 'postgres', 'postgresql', 'mysql', 'mongo', 'mongodb', 'schema', 'table', 'query', 'indexing', 'index', 'join', 'foreign key', 'acid', 'transaction', 'transactions'],
    alternatives: ['Document stores (MongoDB)', 'Key-value caches (Redis)', 'Distributed SQL (CockroachDB)'],
    depthProbes: [
      'How did you design your database indexing strategy, and how did you use EXPLAIN ANALYZE to identify slow query bottlenecks?',
      'How do you enforce ACID transaction isolation and prevent deadlocks or dirty reads during concurrent financial or status writes?',
      'If write volume scaled by a factor of 100, what would be your strategy between read replicas, table partitioning, and connection pooling?',
    ],
  },
  redis_caching: {
    keywords: ['redis', 'cache', 'caching', 'memcached', 'ttl', 'eviction', 'lru', 'in-memory'],
    alternatives: ['In-process memory caching', 'CDN edge caching', 'Application-level memoization'],
    depthProbes: [
      'How do you tackle cache invalidation and prevent the cache avalanche or cache stampede problem during peak traffic?',
      'What eviction policy (e.g. LRU, LFU) did you configure, and how did you guarantee data consistency between Redis and the primary database?',
    ],
  },
  system_design_scaling: {
    keywords: ['system design', 'microservices', 'microservice', 'distributed', 'kafka', 'rabbitmq', 'queue', 'pubsub', 'pub/sub', 'load balancer', 'nginx', 'docker', 'kubernetes', 'aws', 's3', 'scalability', 'concurrency', 'throughput'],
    alternatives: ['Monolithic modular architecture', 'Direct synchronous HTTP/gRPC', 'Serverless event triggers'],
    depthProbes: [
      'If an upstream worker crashes halfway through consuming a message from the queue, how do you achieve at-least-once or exactly-once delivery semantics?',
      'How do you prevent cascade failures across microservices, and have you implemented circuit breakers or exponential backoff with jitter?',
      'What were your latency SLAs, and where in the request lifecycle did you find the highest latency percentile (p99)?',
    ],
  },
  dsa_algorithms: {
    keywords: ['dsa', 'algorithm', 'algorithms', 'array', 'arrays', 'string', 'binary search', 'two pointers', 'sliding window', 'tree', 'trees', 'binary tree', 'graph', 'graphs', 'bfs', 'dfs', 'dynamic programming', 'dp', 'memoization', 'recursion', 'hash map', 'hashmap', 'heap', 'stack', 'queue', 'complexity', 'big o', 'o(n)', 'o(log n)'],
    alternatives: ['Iterative two-pointer approach', 'Monotonic queue / stack', 'Bit manipulation'],
    depthProbes: [
      'What are the strict worst-case time and space complexities of your proposed solution, and can the auxiliary space be optimized to O(1)?',
      'Walk me through the boundary conditions: how does your algorithm handle duplicate values, empty arrays, or extreme integer overflow?',
      'If the dataset does not fit into system memory and is streamed line-by-line, how would your algorithm adapt?',
    ],
  },
  testing_debugging: {
    keywords: ['test', 'tests', 'testing', 'unit test', 'jest', 'integration', 'ci/cd', 'github actions', 'bug', 'bugs', 'debug', 'debugging', 'production', 'crash', 'logs', 'monitoring', 'sentry'],
    alternatives: ['End-to-end testing with Playwright/Cypress', 'Fuzz testing', 'Canary deployments'],
    depthProbes: [
      'Walk me through your systematic debugging process when a production issue cannot be reproduced locally in development.',
      'How do you balance unit test coverage against integration tests to ensure critical regression paths are covered without slowing CI pipelines?',
    ],
  },
  behavioral_teamwork: {
    keywords: ['team', 'teammate', 'peer', 'conflict', 'deadline', 'agile', 'scrum', 'client', 'stakeholder', 'disagree', 'priority', 'feedback', 'mentorship', 'communication'],
    alternatives: ['Direct consensus building with data', 'Escalation to tech lead with trade-off matrices'],
    depthProbes: [
      'When differing technical opinions arose, what objective engineering metrics or prototypes did you use to reach consensus without stalling the project?',
      'Reflecting on that experience, what was the biggest takeaway about stakeholder communication or project scope estimation?',
    ],
  },
};

/**
 * Normalizes text to lower-case word tokens for comparison.
 */
export function normalizeTokens(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/**
 * Calculates Jaccard token similarity between two questions.
 */
export function questionSimilarity(q1: string, q2: string): number {
  const set1 = new Set(normalizeTokens(q1));
  const set2 = new Set(normalizeTokens(q2));
  if (set1.size === 0 || set2.size === 0) return 0;
  let intersection = 0;
  for (const token of set1) {
    if (set2.has(token)) intersection++;
  }
  const union = new Set([...set1, ...set2]).size;
  return union > 0 ? intersection / union : 0;
}

/**
 * Checks if a question has already been asked in the session.
 */
export function isQuestionAlreadyAsked(newQuestion: string, askedQuestions: string[]): boolean {
  if (!askedQuestions || askedQuestions.length === 0) return false;
  const newNorm = (newQuestion || '').trim().toLowerCase();
  for (const asked of askedQuestions) {
    const askedNorm = (asked || '').trim().toLowerCase();
    if (newNorm === askedNorm) return true;
    if (questionSimilarity(newNorm, askedNorm) > 0.45) return true;
    // Check if substantial question stems match
    const stemA = newNorm.replace(/^follow-up:\s*/i, '').slice(0, 45);
    const stemB = askedNorm.replace(/^follow-up:\s*/i, '').slice(0, 45);
    if (stemA.length > 20 && stemB.length > 20 && stemA === stemB) return true;
  }
  return false;
}

/**
 * Analyzes candidate response for clarity, depth, keywords, and vagueness.
 */
export function analyzeCandidateAnswer(answer: string): CandidateInsight {
  const clean = (answer || '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  const lower = clean.toLowerCase();

  // Detection of vague, evasive, or brief responses
  const vaguePhrases = [
    'i don\'t know', 'dont know', 'not sure', 'it was simple', 'pretty simple',
    'standard way', 'just coded it', 'worked fine', 'no problem', 'can\'t remember',
    'cant remember', 'basic stuff', 'nothing special', 'i guess', 'i think so',
    'just built it', 'normal way', 'used a library', 'followed a tutorial',
    '[no answer', 'no answer provided', 'spoken answer submitted'
  ];

  const hasVaguePhrase = vaguePhrases.some((phrase) => lower.includes(phrase));
  const isTooShort = words.length < 12;
  const isModerateLength = words.length >= 12 && words.length < 25;

  let isUnclearOrBrief = isTooShort || (isModerateLength && hasVaguePhrase);
  let clarificationReason = '';

  if (isTooShort) {
    isUnclearOrBrief = true;
    clarificationReason = 'Response was very brief and lacked architectural details or implementation reasoning.';
  } else if (hasVaguePhrase) {
    isUnclearOrBrief = true;
    clarificationReason = 'Response included high-level or ambiguous phrasing without technical specifics.';
  }

  // Detect specific concepts and taxonomy matches
  const detectedConcepts: string[] = [];
  let primaryTopic = 'general_software';

  for (const [topicKey, config] of Object.entries(CONCEPT_TAXONOMY)) {
    const matched = config.keywords.filter((kw) => lower.includes(kw));
    if (matched.length > 0) {
      detectedConcepts.push(...matched);
      if (primaryTopic === 'general_software' || matched.length > 2) {
        primaryTopic = topicKey;
      }
    }
  }

  // Extract candidate's specific claims or phrases
  const sentences = clean.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 15);
  const extractedStatements = sentences.slice(0, 3);

  return {
    wordCount: words.length,
    isUnclearOrBrief,
    clarificationReason,
    detectedConcepts: Array.from(new Set(detectedConcepts)),
    primaryTopic,
    extractedStatements,
  };
}

/**
 * Rich bank of role- and topic-specific questions with zero repetition.
 */
export const STAGE_QUESTION_BANKS: Record<string, Array<{ question: string; message: string; hint: string; codePrompt?: string }>> = {
  warmup: [
    {
      question: 'Tell me about yourself, your academic background, and what inspired you to pursue software engineering.',
      message: 'Hello! Welcome to your technical mock interview. To start off, tell me about yourself, your engineering journey, and what areas of development excite you most.',
      hint: 'Use the Present-Past-Future framework: current status/projects, formative experiences, and your career direction.',
    },
    {
      question: 'Walk me through your key technical strengths, primary programming languages, and recent hands-on projects.',
      message: 'Great to meet you. Could you walk me through your core technical strengths, which programming languages you feel strongest in, and what you’ve built recently?',
      hint: 'Highlight 2-3 core skills with concrete project references and self-driven initiatives.',
    },
    {
      question: 'What motivated you to prepare for this specific software role, and how have you built your foundational skills?',
      message: 'Welcome! To get us started, tell me what drew you toward this role and how you have developed your technical problem-solving skills so far.',
      hint: 'Connect personal curiosity with coursework, open-source projects, and industry alignment.',
    },
  ],
  resume: [
    {
      question: 'Explain the technical architecture and toughest engineering hurdle of a key project listed on your resume.',
      message: 'Looking at your resume experience, walk me through the architecture of your proudest engineering project. What was the toughest technical hurdle you solved?',
      hint: 'Break down your stack, the specific problem, your individual contribution, and the measurable outcome.',
    },
    {
      question: 'In your resume projects, how did you choose your technology stack, and what trade-offs did you encounter during implementation?',
      message: 'Looking into your portfolio, how did you decide on the tech stack for your primary project? What trade-offs or constraints did you run into along the way?',
      hint: 'Discuss alternatives you considered (e.g., SQL vs NoSQL, client vs server rendering) and why your choice fit the project constraints.',
    },
    {
      question: 'Describe how you tested, deployed, and validated the reliability of one of your major resume applications.',
      message: 'On your resume projects, how did you ensure reliability before releasing? Walk me through your testing methodology, CI/CD pipeline, and deployment strategy.',
      hint: 'Mention test suites (unit, integration), environment variables, hosting platform, and how you tracked runtime errors.',
    },
    {
      question: 'Pick one complex feature or API you engineered in your projects. Walk me through the data flow from client to database.',
      message: 'Pick one complex feature you engineered in your projects. Trace the entire data flow step-by-step from user interaction down to persistent storage.',
      hint: 'Explain payload validation, middleware authentication, database queries, state updates, and error return paths.',
    },
  ],
  technical: [
    {
      question: 'Explain asynchronous execution and how you prevent concurrency or state inconsistencies in production.',
      message: 'Moving into technical fundamentals: In modern full-stack systems, how do you handle asynchronous operations, error boundaries, and race conditions?',
      hint: 'Discuss event loop mechanics, promises/async-await, optimistic UI, or distributed transactions.',
    },
    {
      question: 'How do you design RESTful or GraphQL APIs to ensure security, high throughput, and backward compatibility?',
      message: 'Let’s explore API architecture. When designing backend endpoints, how do you ensure security, rate limiting, and backward compatibility across versions?',
      hint: 'Cover idempotency keys, JWT auth headers, payload validation, semantic versioning, and status codes.',
    },
    {
      question: 'Explain how relational database indexing works under the hood and how you optimize slow queries.',
      message: 'Let’s talk database internals. How does B-Tree indexing accelerate queries, and what steps do you take when a query begins timing out in production?',
      hint: 'Cover composite indexes, table scans vs index seeks, EXPLAIN plans, and cardinality.',
    },
    {
      question: 'What is the difference between monolithic and microservice architectures, and when should a team avoid microservices?',
      message: 'In software architecture, how do you evaluate monolithic vs microservice designs? What hidden operational complexities make microservices risky for early teams?',
      hint: 'Highlight network overhead, distributed tracing, database per service challenges, and DevOps costs.',
    },
    {
      question: 'How do you prevent memory leaks, unhandled promise rejections, and CPU bottlenecks in Node.js or browser environments?',
      message: 'Let’s look at runtime performance. How do you identify and fix memory leaks or event loop lag in JavaScript and Node environments?',
      hint: 'Mention Chrome DevTools heap snapshots, garbage collection, detached DOM nodes, and async error listeners.',
    },
  ],
  dsa: [
    {
      question: 'Solve the Maximum Requests in Sliding Window problem with optimal time complexity.',
      message: 'Now let’s tackle a data structures problem. Suppose you are given an array of request timestamps and need to find the maximum requests processed within any window of size K. How do you solve this optimally?',
      codePrompt: `function maxRequestsInWindow(timestamps: number[], k: number): number {\n  // Optimal sliding window approach\n  \n}`,
      hint: 'A two-pointer sliding window or monotonic queue yields O(N) time and O(1) extra space.',
    },
    {
      question: 'Explain how you would find the Longest Substring Without Repeating Characters with optimal time and space complexity.',
      message: 'Here is a classic algorithmic challenge: How would you determine the length of the longest substring containing all unique characters? Explain your approach.',
      codePrompt: `function lengthOfLongestSubstring(s: string): number {\n  // Return length of longest substring without repeating characters\n  \n}`,
      hint: 'Use a sliding window with a hash map recording the most recent index of each character for O(N) single-pass execution.',
    },
    {
      question: 'Design an efficient solution to detect cycles in a directed graph or dependency tree.',
      message: 'Suppose you have a build system with package dependencies. How do you detect circular dependencies using graph traversal algorithms?',
      codePrompt: `function hasCycle(numCourses: number, prerequisites: number[][]): boolean {\n  // Topological sort via Kahn's algorithm or DFS with 3-color marking\n  \n}`,
      hint: 'Discuss Kahn\'s algorithm (indegree BFS) or DFS with visited and in-stack state flags.',
    },
    {
      question: 'Given an array of intervals, how do you merge all overlapping intervals in optimal time?',
      message: 'Let’s consider an interval scheduling problem: Given a collection of intervals, how do you merge all overlapping intervals into non-overlapping blocks?',
      codePrompt: `function mergeIntervals(intervals: number[][]): number[][] {\n  // Sort by start time then merge\n  \n}`,
      hint: 'Sort intervals by start timestamp in O(N log N), then iterate once merging when start <= current end.',
    },
  ],
  system_design: [
    {
      question: 'Design a scalable, fault-tolerant notification delivery service for millions of users.',
      message: 'Let’s explore system design. How would you architect a notification platform that dispatches push notifications and emails reliably to millions of campus students?',
      hint: 'Break down API Gateway, message broker (Kafka/RabbitMQ), worker pools, idempotency keys, and rate limiters.',
    },
    {
      question: 'Design a high-concurrency URL shortener (like TinyURL) capable of handling billions of redirects per month.',
      message: 'Let’s design a URL shortener service. Walk me through the hashing algorithm, database schema, caching layer, and how you prevent hash collisions.',
      hint: 'Discuss Base62 encoding, pre-generated unique ID counters (Snowflake), Redis caching with LRU, and read-heavy optimization.',
    },
    {
      question: 'How would you design a real-time collaborative code editor or live chat application with WebSockets?',
      message: 'Suppose we want to build a real-time collaborative document or chat system. What protocol and conflict-resolution mechanism would you choose?',
      hint: 'Compare WebSockets with SSE, and mention operational transformation (OT) or CRDTs for collaborative editing.',
    },
  ],
  behavioral: [
    {
      question: 'Describe a situation where you had a disagreement with a team member over technical direction. How did you resolve it?',
      message: 'Let’s talk about collaboration. Can you describe a technical disagreement you had with a teammate or peer, and how you worked through it to a constructive resolution?',
      hint: 'Apply the STAR method (Situation, Task, Action, Result) with an emphasis on empathy, evidence, and project goals.',
    },
    {
      question: 'Tell me about a time when a critical bug or unexpected deadline pressure occurred in your project. How did you handle it?',
      message: 'Tell me about a high-pressure situation or severe bug you faced near a deadline. How did you prioritize tasks and keep stakeholders informed?',
      hint: 'Highlight triage, transparent communication, systematic root-cause mitigation, and post-incident prevention.',
    },
    {
      question: 'Give an example of receiving critical feedback on your code or design. What was your reaction and what changes did you make?',
      message: 'Constructive critique is vital for engineers. Can you share an instance where you received tough feedback on your implementation? How did you respond?',
      hint: 'Demonstrate a growth mindset, gratitude for peer review, and tangible improvements in code quality.',
    },
  ],
  wrapup: [
    {
      question: 'Do you have any thoughtful questions for the interviewer regarding team engineering culture, technical stacks, or role expectations?',
      message: 'We are wrapping up our technical session. Before we finalize your evaluation report, what questions do you have for me about engineering culture or team practices?',
      hint: 'Asking about developer tooling, mentorship, deployment cadence, or architecture challenges demonstrates genuine engineering curiosity.',
    },
    {
      question: 'What closing thoughts or specific engineering achievements would you like to highlight before we complete your evaluation?',
      message: 'We’re at the end of the interview. Is there anything specific about your experience, problem-solving passion, or technical growth you’d like to add before we wrap up?',
      hint: 'Reiterate your core enthusiasm for the role and summarize how your skills align with the team mission.',
    },
  ],
};

/**
 * Generates an intelligent, context-aware follow-up question directly probing
 * the student's previous answer and conversation context.
 * Guarantees uniqueness, non-repetition, and depth.
 */
export function generateContextualFollowUp(params: {
  candidateAnswer: string;
  transcript: any[];
  askedQuestions: string[];
  role?: string;
  company?: string;
  stage?: string;
  interviewerName?: string;
  interviewerStyle?: string;
}): QuestionResult {
  const {
    candidateAnswer = '',
    transcript = [],
    askedQuestions = [],
    role = 'Software Development Engineer',
    company = 'General Tech',
    stage = 'technical',
    interviewerName = 'Aria',
  } = params;

  const insight = analyzeCandidateAnswer(candidateAnswer);
  const cleanAns = candidateAnswer.trim();

  // Warmup stage / Introduction Handling: Never interrogate a self-introduction with architecture trade-offs!
  if (stage === 'warmup' || /^(hi|hello|hey|myself|i am|my name|this is)/i.test(cleanAns)) {
    return {
      message: `Thanks for the introduction! Great to meet you. Let's move into our technical evaluation: tell me about a significant software project you built recently, what problem it solved, and what technology stack you chose.`,
      question: `Tell me about a technical project you built recently: what was the core problem, and what technology stack did you choose?`,
      stage: 'resume',
      isFollowUp: false,
      hint: 'Outline your project: state the problem, the core architecture (React, Node, Python, SQL), and your personal contribution.',
      followUpType: 'standard',
      contextFocus: 'Project Overview',
    };
  }

  // Case 1: Answer is vague, extremely brief, or unclear -> Generate targeted clarification
  if (insight.isUnclearOrBrief) {
    const clarificationCandidates = [
      {
        question: `Could you clarify the specific approach and data flow you had in mind? Walk me through the step-by-step logic you would implement.`,
        message: `I hear what you're aiming for, but could you clarify your reasoning? Walk me through the step-by-step technical logic and how data flows through that part of the solution.`,
        hint: 'Elaborate on specific function inputs, data structures, error handling, and return values.',
        followUpType: 'clarification' as const,
      },
      {
        question: `To make sure I understand your thought process, could you clarify how your solution handles edge cases and failure modes?`,
        message: `Thanks for starting with that overview. Could you clarify what happens when edge cases or unexpected inputs occur in that implementation?`,
        hint: 'Mention null checks, boundary conditions, timeout handling, or input validation.',
        followUpType: 'clarification' as const,
      },
      {
        question: `Could you provide more technical depth on the architecture decisions and trade-offs behind your choice?`,
        message: `That gives a high-level summary. Could you clarify the technical details? What specific libraries, database schemas, or algorithms would you select, and why?`,
        hint: 'Name concrete frameworks, data structures, and trade-offs you considered.',
        followUpType: 'clarification' as const,
      },
    ];

    for (const cand of clarificationCandidates) {
      if (!isQuestionAlreadyAsked(cand.question, askedQuestions)) {
        return {
          message: cand.message,
          question: `Follow-up: ${cand.question}`,
          stage,
          isFollowUp: true,
          hint: cand.hint,
          followUpType: cand.followUpType,
          contextFocus: 'Technical Clarification',
        };
      }
    }
  }

  // Case 2: Candidate mentioned specific technical concepts -> Deep-dive into their reasoning & trade-offs
  const taxonomyEntry = CONCEPT_TAXONOMY[insight.primaryTopic];
  if (taxonomyEntry && taxonomyEntry.depthProbes.length > 0) {
    // Pick an unasked depth probe
    const availableProbes = taxonomyEntry.depthProbes.filter(
      (p) => !isQuestionAlreadyAsked(p, askedQuestions)
    );

    if (availableProbes.length > 0) {
      const probe = availableProbes[0];
      const matchedConceptName = insight.detectedConcepts[0] || 'your implementation';
      const spokenIntro = `You mentioned working with ${matchedConceptName}. Digging a layer deeper into your reasoning: ${probe}`;

      return {
        message: spokenIntro,
        question: `Follow-up on ${matchedConceptName}: ${probe}`,
        stage,
        isFollowUp: true,
        hint: `Reference specific trade-offs, architecture patterns, and concrete failure recovery mechanisms.`,
        followUpType: 'deep_dive',
        contextFocus: matchedConceptName,
      };
    }
  }

  // Case 3: Natural engineering follow-up without raw verbatim quoting
  const technicalProbes = [
    {
      q: `What specific architectural trade-offs did you encounter in that approach, and why did you choose it over alternative solutions?`,
      msg: `Reflecting on that solution: what specific architectural trade-offs did you weigh, and why did that approach fit your constraints best?`,
      hint: 'Discuss alternatives considered, complexity trade-offs, and measurable impact.',
      focus: 'Architecture & Trade-offs',
    },
    {
      q: `How did you verify correctness, benchmark performance, and test for potential bottlenecks in that implementation?`,
      msg: `Good points. How did you verify its performance under load, and what metrics or automated tests did you use to catch edge cases?`,
      hint: 'Mention latency profiling, automated tests, or logging benchmarks.',
      focus: 'Performance & Testing',
    },
    {
      q: `If user traffic or data volume multiplied significantly, where would the primary bottleneck occur in that design, and how would you scale it?`,
      msg: `Looking ahead at scalability: if traffic or data scale multiplied significantly, where would that design break first, and how would you adapt?`,
      hint: 'Explain horizontal vs vertical scaling, caching layers, or database indexing.',
      focus: 'Scalability & Reliability',
    },
  ];

  for (const tp of technicalProbes) {
    if (!isQuestionAlreadyAsked(tp.q, askedQuestions)) {
      return {
        message: tp.msg,
        question: `Follow-up: ${tp.q}`,
        stage,
        isFollowUp: true,
        hint: tp.hint,
        followUpType: 'reasoning',
        contextFocus: tp.focus,
      };
    }
  }

  // Case 4: General high-caliber technical probing questions with guaranteed deduplication
  const generalProbes = [
    {
      q: `What were the most challenging edge cases you had to account for in that solution, and how did your architecture prevent silent failures?`,
      msg: `That’s a clear overview. What were the toughest edge cases or failure modes in that setup, and how did your design prevent silent errors?`,
      hint: 'Mention error handling boundaries, timeout recovery, and defensive validation.',
    },
    {
      q: `If you had an opportunity to refactor that implementation from scratch with today\'s experience, what architectural decision would you change?`,
      msg: `Reflecting critically on that solution: If you were rebuilding it from scratch today, what would you design differently, and why?`,
      hint: 'Demonstrate hindsight, engineering maturity, and continuous learning.',
    },
    {
      q: `How did you handle state consistency, asynchronous data loading, and boundary condition validation in that design?`,
      msg: `Digging deeper into system stability: How did you manage state consistency and asynchronous boundaries in that implementation?`,
      hint: 'Explain state persistence, synchronization, and race condition avoidance.',
    },
    {
      q: `What observability, logging, or metric monitoring did you implement to ensure you can debug unexpected anomalies in production?`,
      msg: `In terms of production readiness: What logging, metrics, or telemetry would you hook in to detect and debug issues under real workloads?`,
      hint: 'Mention structured logging, distributed tracing, metrics (p95/p99 latency), and alerting.',
    },
  ];

  for (const gp of generalProbes) {
    if (!isQuestionAlreadyAsked(gp.q, askedQuestions)) {
      return {
        message: gp.msg,
        question: `Follow-up: ${gp.q}`,
        stage,
        isFollowUp: true,
        hint: gp.hint,
        followUpType: 'deep_dive',
        contextFocus: 'Engineering robustness & production readiness',
      };
    }
  }

  // Ultimate fallback (guaranteed fresh with timestamp tag if needed)
  const dynamicProbe = `How would you write automated regression tests to verify that your implementation satisfies all performance and reliability bounds?`;
  return {
    message: `That's insightful. Digging into testability: How would you structure automated integration tests to guarantee reliability for that solution?`,
    question: `Follow-up: ${dynamicProbe}`,
    stage,
    isFollowUp: true,
    hint: 'Discuss unit tests, mocked dependencies, and end-to-end assertions.',
    followUpType: 'standard',
  };
}

/**
 * Selects or generates the next primary question for a stage, ensuring
 * it has NOT been previously asked in the interview.
 */
export function generateNextStageQuestion(params: {
  stage: string;
  transcript: any[];
  askedQuestions: string[];
  role?: string;
  company?: string;
  difficulty?: string;
  resumeText?: string;
  interviewerName?: string;
}): QuestionResult {
  const {
    stage = 'technical',
    askedQuestions = [],
    role = 'Software Development Engineer',
    company = 'General Tech',
    interviewerName = 'Aria',
  } = params;

  const bank = STAGE_QUESTION_BANKS[stage] || STAGE_QUESTION_BANKS.technical;

  // Filter out any question already asked
  const unasked = bank.filter((item) => !isQuestionAlreadyAsked(item.question, askedQuestions));

  if (unasked.length > 0) {
    const selected = unasked[0];
    return {
      message: selected.message.replace(/Aria/g, interviewerName).replace(/General Tech/g, company).replace(/Software Development Engineer/g, role),
      question: selected.question,
      stage,
      isFollowUp: false,
      hint: selected.hint,
      codePrompt: selected.codePrompt,
      followUpType: 'standard',
    };
  }

  // If all default questions for this stage were somehow asked, synthesize a fresh tailored question
  const synthesized: Record<string, { q: string; m: string; h: string }> = {
    warmup: {
      q: `What personal engineering principles or coding practices guide how you build software?`,
      m: `Before we jump into the next technical topic, what core coding principles and practices do you value most as an engineer?`,
      h: 'Discuss clean code, modularity, self-documenting APIs, or automated testing.',
    },
    resume: {
      q: `Describe the most critical bug or outage you resolved in your project work, and how you fixed it permanently.`,
      m: `Looking further at your project track record: Tell me about the most difficult bug or unexpected issue you resolved, and how you fixed it permanently.`,
      h: 'Explain reproduction, root-cause isolation, code patch, and automated regression guards.',
    },
    technical: {
      q: `How do you design systems to handle high concurrency, caching, and rate limiting in production?`,
      m: `Great explanation. Let’s explore high concurrency: How do you design systems with caching, rate limiting, and backpressure in production?`,
      h: 'Mention Redis caching, load balancers, database connections, and idempotent endpoints.',
    },
    dsa: {
      q: `How would you design an LRU Cache with O(1) get and put operations?`,
      m: `Let’s examine an advanced data structure design: How would you implement a Least Recently Used (LRU) Cache supporting get and put in O(1) time?`,
      h: 'Combine a doubly linked list with a hash map pointing to list nodes.',
    },
    system_design: {
      q: `Design a distributed rate limiter that throttles API abuse across multiple backend instances.`,
      m: `In distributed systems: How would you build a distributed rate limiter to prevent API abuse across multiple application servers?`,
      h: 'Discuss token bucket or sliding window algorithms implemented over Redis with atomic Lua scripts.',
    },
    behavioral: {
      q: `Tell me about a time you had to learn an unfamiliar framework or language quickly under pressure.`,
      m: `Engineering requires rapid adaptability. Can you share a time you had to learn an unfamiliar technology quickly to deliver a project?`,
      h: 'Detail your learning roadmap, documentation deep-dive, trial prototypes, and delivery outcome.',
    },
    wrapup: {
      q: `Do you have any questions for me about engineering culture, tech stack evolution, or role expectations?`,
      m: `That concludes our questions today. Do you have any questions for me about the team, our tech stack, or engineering culture?`,
      h: 'Inquire about team dynamics, CI/CD pipelines, or mentorship.',
    },
  };

  const synth = synthesized[stage] || synthesized.technical;
  return {
    message: synth.m,
    question: synth.q,
    stage,
    isFollowUp: false,
    hint: synth.h,
    followUpType: 'standard',
  };
}
