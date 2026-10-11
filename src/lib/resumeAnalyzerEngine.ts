import {
  ResumeBulletImprovement,
  ResumeDeepAnalysis,
  ResumeProjectDetected,
  ResumeQuestionItem,
  ResumeWeaknessItem,
  InterviewSession,
} from '../types';
import { INTERVIEWERS } from './storage';

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Skill taxonomy dictionary
const TECH_SKILL_DICTIONARY: Record<string, string[]> = {
  frontend: [
    'React', 'Next.js', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript',
    'HTML5', 'CSS3', 'Tailwind CSS', 'Redux', 'Zustand', 'GraphQL',
    'Vite', 'Webpack', 'Jest', 'Cypress'
  ],
  backend: [
    'Node.js', 'Express', 'NestJS', 'Python', 'Django', 'FastAPI',
    'Java', 'Spring Boot', 'Go', 'Rust', 'C++', 'C#', '.NET',
    'REST APIs', 'GraphQL', 'gRPC', 'WebSockets', 'Microservices'
  ],
  databases: [
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
    'SQLite', 'DynamoDB', 'Cassandra', 'Prisma', 'Drizzle'
  ],
  devops: [
    'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'CI/CD',
    'GitHub Actions', 'Terraform', 'Linux', 'Nginx', 'Prometheus'
  ],
  fundamentals: [
    'Data Structures & Algorithms', 'System Design', 'Object-Oriented Programming (OOP)',
    'Database Management Systems (DBMS)', 'Operating Systems', 'Computer Networks'
  ],
  data_ai: [
    'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow',
    'Pandas', 'NumPy', 'Scikit-Learn', 'NLP', 'Computer Vision',
    'LLMs', 'Prompt Engineering', 'RAG'
  ]
};

const ROLE_ESSENTIAL_SKILLS: Record<string, string[]> = {
  'Software Development Engineer (SDE-1)': ['Data Structures & Algorithms', 'System Design', 'PostgreSQL', 'Docker', 'Git', 'REST APIs', 'Testing/Jest'],
  'Frontend Developer': ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Web Performance', 'Testing (Jest/Playwright)', 'State Management'],
  'Backend Developer': ['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Microservices', 'API Security', 'System Design'],
  'Full Stack Developer': ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'CI/CD', 'Git'],
  'Data Analyst': ['SQL', 'Python', 'Pandas', 'Tableau/PowerBI', 'Data Cleaning', 'Statistics', 'Excel'],
  'AI / ML Engineer': ['Python', 'PyTorch', 'Pandas', 'Model Evaluation', 'Docker', 'REST APIs', 'RAG/LLMs'],
};

/**
 * Heuristic & Rule-based Resume Analyzer
 * Generates ATS scores, deep shortcomings/lacking feedback, and tailored questions.
 */
export function analyzeResumeTextLocally(
  resumeText: string,
  targetRole: string = 'Software Development Engineer (SDE-1)'
): ResumeDeepAnalysis {
  const clean = resumeText.trim();
  const lines = clean.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Detect candidate name
  let candidateName = 'Candidate';
  for (const line of lines.slice(0, 4)) {
    if (
      line.length > 2 &&
      line.length < 35 &&
      !line.toLowerCase().includes('resume') &&
      !line.toLowerCase().includes('curriculum') &&
      !line.toLowerCase().includes('email') &&
      !line.toLowerCase().includes('phone') &&
      !line.toLowerCase().includes('github') &&
      !line.toLowerCase().includes('http')
    ) {
      candidateName = line.replace(/[^a-zA-Z\s]/g, '').trim() || 'Candidate';
      break;
    }
  }

  // 2. Extract detected skills
  const extractedSkills: string[] = [];
  const lowerResume = clean.toLowerCase();

  for (const group of Object.values(TECH_SKILL_DICTIONARY)) {
    for (const skill of group) {
      const lowerSkill = skill.toLowerCase();
      // Regex word boundary match
      const regex = new RegExp(`\\b${escapeRegExp(lowerSkill)}\\b`, 'i');
      if (regex.test(clean) && !extractedSkills.includes(skill)) {
        extractedSkills.push(skill);
      }
    }
  }

  // Fallback skills if sparse
  if (extractedSkills.length === 0) {
    extractedSkills.push('JavaScript', 'Data Structures', 'Git', 'Problem Solving');
  }

  // 3. Recommended role alignment
  let recommendedRole = targetRole;
  if (lowerResume.includes('react') && lowerResume.includes('css') && !lowerResume.includes('spring')) {
    recommendedRole = 'Frontend Developer';
  } else if (lowerResume.includes('docker') && lowerResume.includes('sql') && lowerResume.includes('api')) {
    recommendedRole = 'Full Stack Developer';
  } else if (lowerResume.includes('machine learning') || lowerResume.includes('pytorch')) {
    recommendedRole = 'AI / ML Engineer';
  }

  // 4. Missing skills for role
  const essentialForRole = ROLE_ESSENTIAL_SKILLS[recommendedRole] || ROLE_ESSENTIAL_SKILLS['Software Development Engineer (SDE-1)'];
  const missingSkillsForRole = essentialForRole.filter(
    (req) => !extractedSkills.some((s) => s.toLowerCase() === req.toLowerCase())
  );

  // 5. Detect projects & their bullet points
  const detectedProjects: ResumeProjectDetected[] = [];
  const projectKeywords = ['project', 'built', 'developed', 'created', 'designed', 'engine', 'system', 'app', 'platform', 'portal', 'microservice', 'dashboard', 'monitor', 'commerce', 'bot', 'tracker', 'pipeline'];
  
  let currentProject: { name: string; tech: string[]; bullets: string[] } | null = null;
  const projectBulletsMap: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isNumberedOrDashed = /^(\d+[\.\)]|[-•*])\s+[A-Z]/.test(line);
    const hasSeparator = line.includes('|') || line.includes('–') || line.includes(' - ') || line.includes(':');
    const isProjectHeading =
      (hasSeparator || isNumberedOrDashed) &&
      line.length < 90 &&
      (projectKeywords.some((k) => line.toLowerCase().includes(k)) || lines[Math.max(0, i - 1)]?.toLowerCase().includes('project'));

    if (isProjectHeading && detectedProjects.length < 5) {
      if (currentProject) {
        detectedProjects.push({
          name: currentProject.name,
          techStack: currentProject.tech.length > 0 ? currentProject.tech : ['Full-Stack', 'APIs'],
          assessment: `Core portfolio project with ${currentProject.bullets.length} implementation points.`,
          critique: 'Requires explicit latency benchmarking, concurrent throughput metrics, and failure recovery details.',
        });
      }
      const rawName = line.replace(/^\d+[\.\)]\s*/, '').replace(/^[-•*]\s*/, '').split(/[|–\-:]/)[0].trim();
      const detectedTech = extractedSkills.filter((s) => line.toLowerCase().includes(s.toLowerCase()));
      currentProject = {
        name: rawName || 'Technical Project',
        tech: detectedTech,
        bullets: [],
      };
    } else if (currentProject && (line.startsWith('-') || line.startsWith('•') || line.startsWith('*') || line.length > 20)) {
      const cleanBullet = line.replace(/^[-•*]\s*/, '').trim();
      if (cleanBullet.length > 15) {
        currentProject.bullets.push(cleanBullet);
        projectBulletsMap.push(cleanBullet);
      }
    }
  }

  if (currentProject && detectedProjects.length < 5) {
    detectedProjects.push({
      name: currentProject.name,
      techStack: currentProject.tech.length > 0 ? currentProject.tech : ['Full-Stack', 'APIs'],
      assessment: `Core portfolio project with ${currentProject.bullets.length} implementation points.`,
      critique: 'Requires explicit latency benchmarking, concurrent throughput metrics, and failure recovery details.',
    });
  }

  if (detectedProjects.length === 0) {
    detectedProjects.push(
      {
        name: 'Full-Stack Web Application System',
        techStack: extractedSkills.slice(0, 3),
        assessment: 'General software engineering implementation listed on profile.',
        critique: 'Requires explicit latency benchmarking, concurrent user stress-testing, and architecture diagrams.',
      },
      {
        name: 'Algorithms & Realtime Data Engine',
        techStack: extractedSkills.slice(2, 5),
        assessment: 'Problem-solving and algorithmic component.',
        critique: 'Lacks details on edge case handling, space/time bounds, and fault-tolerance.',
      }
    );
  }

  // 6. Deep Feedback: In-Depth Lacking Areas Analysis (Where the candidate is lacking)
  const lackingAreas: ResumeWeaknessItem[] = [];

  // Check 1: Quantitative Metrics deficiency (the #1 recruiter filter)
  const numbersMatches = clean.match(/\b\d+(\.\d+)?%|\b\d+k|\b\d+ms|\b\d+x|\b\d{2,}\b/gi) || [];
  const numbersCount = numbersMatches.length;
  const firstProjectBullet = projectBulletsMap[0] || lines.find((l) => l.toLowerCase().includes('developed') || l.toLowerCase().includes('built')) || 'Built a web dashboard using React and Express';

  if (numbersCount < 4) {
    lackingAreas.push({
      id: 'lack-quant',
      category: 'Quantification',
      severity: 'Critical',
      title: 'Severe Lack of Measurable Impact & Hard Metrics',
      description: `Only ${numbersCount} quantitative reference(s) detected across your entire resume. In campus placement drives and ATS resume parsers, unquantified bullets are flagged as passive activity logs rather than verified engineering outcomes. Top tech recruiters look for numbers like: "% latency reduction", "requests per second", "database queries optimized", or "daily active users".`,
      currentExcerpt: firstProjectBullet,
      improvedVersion: `Refactor to Google XYZ format: "Architected scalable service using ${extractedSkills.slice(0, 2).join(' & ')}, reducing p99 API response time by 42% and sustaining 2,500+ daily concurrent operations."`,
      whyItMatters: 'Recruiters cannot gauge the scale or performance bar of your work without numbers. Bullets without metrics receive 60% lower interview callback rates.',
    });
  }

  // Check 2: Missing Essential Frameworks / Tools for the Target Role
  if (missingSkillsForRole.length > 0) {
    lackingAreas.push({
      id: 'lack-skills',
      category: 'Missing Skills',
      severity: 'High',
      title: `Missing Industry-Standard Technologies for ${recommendedRole}`,
      description: `Your resume currently lacks explicit mentions of core ecosystem tools expected for ${recommendedRole}: ${missingSkillsForRole.join(', ')}. Automated ATS filters reject applications that fail keyword thresholds for these standard requirements.`,
      currentExcerpt: `Current Skills: ${extractedSkills.slice(0, 6).join(', ')}`,
      improvedVersion: `Add a dedicated 'Infrastructure & DevOps' line: "Tools & Testing: ${missingSkillsForRole.slice(0, 4).join(', ')}, Git, CI/CD, Postman."`,
      whyItMatters: 'Hiring managers filter out entry-level applicants whose skillsets seem purely theoretical or missing production standards like databases, Docker, or automated testing.',
    });
  }

  // Check 3: Passive or Subordinate Action Verbs
  const weakVerbs = ['helped', 'worked on', 'assisted', 'responsible for', 'involved in', 'participated', 'did', 'used'];
  const weakLine = lines.find((l) => weakVerbs.some((wv) => new RegExp(`\\b${wv}\\b`, 'i').test(l)));
  
  if (weakLine || lines.some((l) => l.toLowerCase().startsWith('worked on') || l.toLowerCase().startsWith('assisted'))) {
    lackingAreas.push({
      id: 'lack-verbs',
      category: 'Action Verbs',
      severity: 'High',
      title: 'Passive Phrasing & Weak Ownership Vocabulary',
      description: `Detected subordinate phrasing (such as "${weakLine?.slice(0, 45) || 'worked on / helped'}..."). This language signals secondary assistance rather than full engineering ownership.`,
      currentExcerpt: weakLine || 'Worked on database queries and assisted team with frontend styling.',
      improvedVersion: 'Spearheaded backend indexing strategy in PostgreSQL and architected reusable React component library, accelerating sprint feature delivery by 25%.',
      whyItMatters: 'Interviewers seek self-driven builders who design, test, and ship features independently. Power action verbs ("Architected", "Engineered", "Optimized", "Spearheaded") establish leadership and competence.',
    });
  }

  // Check 4: Project Depth & Architecture Rigor Gaps
  const hasArchitectureDetails =
    lowerResume.includes('cache') ||
    lowerResume.includes('redis') ||
    lowerResume.includes('docker') ||
    lowerResume.includes('concurrency') ||
    lowerResume.includes('websocket') ||
    lowerResume.includes('microservice') ||
    lowerResume.includes('index') ||
    lowerResume.includes('load balance');

  if (!hasArchitectureDetails) {
    lackingAreas.push({
      id: 'lack-architecture',
      category: 'Project Depth',
      severity: 'Critical',
      title: 'Projects Lack Architectural Rigor & Distributed Systems Concepts',
      description: 'Your project bullet points describe functionality from a basic user perspective (CRUD operations), but completely omit engineering hurdles: caching tiers, concurrency control, database connection pooling, error boundaries, and race conditions.',
      currentExcerpt: projectBulletsMap[1] || 'Created an application with user authentication and database storage.',
      improvedVersion: 'Configured Redis LRU caching layer and connection pooling, slashing database read contention by 45% during peak authentication spikes.',
      whyItMatters: 'In technical interview rounds, 80% of questions probe architecture trade-offs and edge cases. Without these in your resume, interviewers assume tutorial-level projects.',
    });
  }

  // Check 5: Automated Testing & CI/CD Gaps
  const hasTesting =
    lowerResume.includes('test') ||
    lowerResume.includes('jest') ||
    lowerResume.includes('pytest') ||
    lowerResume.includes('cypress') ||
    lowerResume.includes('playwright') ||
    lowerResume.includes('ci/cd') ||
    lowerResume.includes('github actions');

  if (!hasTesting) {
    lackingAreas.push({
      id: 'lack-testing',
      category: 'Testing & Reliability',
      severity: 'High',
      title: 'Zero Automated Testing or CI/CD Automation Mentioned',
      description: 'No automated testing frameworks (Jest, PyTest, Cypress) or CI/CD pipelines detected. Production engineering standards require unit/integration test coverage and automated build validation.',
      currentExcerpt: projectBulletsMap[2] || 'Tested the application manually and deployed on server.',
      improvedVersion: 'Authored 40+ unit and integration tests using Jest/Playwright with GitHub Actions CI pipeline, achieving 85% branch test coverage.',
      whyItMatters: 'Enterprise software companies prioritize test-driven development. Demonstrating automated test coverage sets you apart from 85% of other college graduates.',
    });
  }

  // Check 6: Live Hyperlinks & Verifiable Proof
  const hasLinks = lowerResume.includes('github.com') || lowerResume.includes('http') || lowerResume.includes('vercel.app') || lowerResume.includes('netlify.app');
  if (!hasLinks) {
    lackingAreas.push({
      id: 'lack-links',
      category: 'Formatting/ATS',
      severity: 'Medium',
      title: 'Missing Live Deployed Links & Public GitHub Repositories',
      description: 'No clickable GitHub repository URLs or live deployed demo links detected. Recruiters prefer verifiable proof of code quality over unverifiable claims.',
      currentExcerpt: 'Project listed with no repository or live demo URL link.',
      improvedVersion: 'Format projects with live demo badges: [Live Demo: app.domain.com | GitHub: github.com/username/repo].',
      whyItMatters: 'Candidates who showcase live, accessible deployments receive immediate recruiter validation.',
    });
  }

  // 7. Bullet Point Improvements (Before & After Rewrites)
  const bulletPointImprovements: ResumeBulletImprovement[] = [
    {
      id: 'b-1',
      original: lines.find((l) => l.length > 25 && l.length < 120 && (l.includes('React') || l.includes('web') || l.includes('app'))) ||
        'Developed a responsive frontend application with React and Tailwind CSS for users to book sessions.',
      improved: 'Architected responsive single-page portal with React and Tailwind CSS, slashing initial bundle size by 34% via code-splitting and boosting Lighthouse performance score to 98/100.',
      critique: 'Original describes generic coding activity. Rewrite emphasizes architectural decisions, bundle optimization metrics, and measurable page performance.',
      impactGain: '+25% ATS Score & High Interviewer Engagement',
    },
    {
      id: 'b-2',
      original: lines.find((l) => l.length > 25 && l.length < 120 && (l.includes('API') || l.includes('backend') || l.includes('database'))) ||
        'Created REST APIs using Node.js and Express connected to MongoDB database for saving data.',
      improved: 'Engineered high-throughput RESTful API suite in Node.js/Express with MongoDB indexing, handling 500+ requests/sec with p95 response times under 45ms.',
      critique: 'Original lacks scale and speed context. Rewrite highlights throughput (RPS), p95 latency bounds, and database indexing.',
      impactGain: '+30% Technical Credibility',
    },
    {
      id: 'b-3',
      original: lines.find((l) => l.length > 20 && (l.includes('team') || l.includes('git') || l.includes('tested'))) ||
        'Tested the application and fixed various bugs reported by users during testing.',
      improved: 'Implemented end-to-end automated test suites using Jest & Playwright, achieving 88% branch coverage and cutting regression incidents by 40% prior to staging deployment.',
      critique: 'Original is passive and reactive. Rewrite demonstrates professional CI/CD engineering standards and quantitative bug reduction.',
      impactGain: '+20% Seniority Signal',
    },
  ];

  // 8. ATS Score Calculation
  const quantScore = Math.min(100, Math.max(30, numbersCount * 18));
  const skillScore = Math.min(100, Math.max(40, extractedSkills.length * 10 - missingSkillsForRole.length * 8));
  const depthScore = hasArchitectureDetails ? 85 : 55;
  const clarityScore = hasLinks ? 88 : 65;
  const atsScore = Math.round((quantScore * 0.35) + (skillScore * 0.3) + (depthScore * 0.2) + (clarityScore * 0.15));

  // 9. Generate Tailored Interview Questions based specifically on this resume
  const firstProjectName = detectedProjects[0]?.name || 'Flagship Engineering Project';
  const secondProjectName = detectedProjects[1]?.name || 'Data and Systems Project';
  const topSkill1 = extractedSkills[0] || 'TypeScript';
  const topSkill2 = extractedSkills[1] || 'React';
  const topSkill3 = extractedSkills[2] || 'Node.js';

  const tailoredQuestions: ResumeQuestionItem[] = [
    {
      id: 'rq-1',
      category: 'Project Deep Dive',
      question: `On your resume, you listed "${firstProjectName}". Could you walk me through the system architecture, how data flows through it end-to-end, and the single toughest engineering hurdle you solved during development?`,
      contextOrReason: `Triggered by flagship project "${firstProjectName}" on resume.`,
      stage: 'resume',
      hint: 'Detail the problem, your exact architectural contribution, trade-offs between technologies, and concrete business/user impact.',
      expectedKeywords: ['architecture', 'trade-offs', 'latency', 'database schema', 'bottleneck', 'testing'],
    },
    {
      id: 'rq-2',
      category: 'Skill Verification',
      question: `You highlighted proficiency in ${topSkill1} and ${topSkill2}. In production applications, how do you handle state consistency, asynchronous race conditions, and memory leaks when scaling these technologies?`,
      contextOrReason: `Validating claimed competencies: ${topSkill1} & ${topSkill2}.`,
      stage: 'technical',
      hint: 'Give concrete code examples: cleanup in useEffect/listeners, immutability, optimistic UI updates, or connection pools.',
      expectedKeywords: ['event loop', 'asynchronous', 'memory leaks', 'closures', 'caching', 'optimistic updates'],
    },
    {
      id: 'rq-3',
      category: 'Addressing Weakness',
      question: `Looking at your project description for "${secondProjectName}", what specific performance benchmarks did you run? What was the throughput or latency before versus after your optimizations?`,
      contextOrReason: `Challenging lack of quantitative metrics on resume project "${secondProjectName}".`,
      stage: 'resume',
      hint: 'State concrete numbers (e.g. latency in ms, cache hit rates, memory footprint) and describe how you profiled the application.',
      expectedKeywords: ['benchmarking', 'profiling', 'latency', 'metrics', 'cache hit rate', 'load testing'],
    },
    {
      id: 'rq-4',
      category: 'Project Deep Dive',
      question: `If 50,000 users simultaneously accessed your "${firstProjectName}" project during a viral launch, what component would fail first, and how would you redesign the architecture with caching and queuing to survive?`,
      contextOrReason: `Challenging project scalability and system boundaries.`,
      stage: 'system_design',
      hint: 'Break down database connection exhaustion, introduce Redis caching, rate limiting, and asynchronous background worker queues.',
      expectedKeywords: ['connection pool', 'Redis', 'rate limiting', 'queue/Kafka', 'load balancer', 'horizontal scaling'],
    },
    {
      id: 'rq-5',
      category: 'Behavioral',
      question: `In your experience building projects, describe a situation where a technical requirement changed right before a deadline, or where you had to compromise on an architectural ideal to ship on time. How did you decide?`,
      contextOrReason: `Evaluating pragmatic engineering judgment and timeline delivery.`,
      stage: 'behavioral',
      hint: 'Use the STAR format (Situation, Task, Action, Result). Emphasize communication, risk analysis, and fast iterative delivery.',
      expectedKeywords: ['STAR method', 'trade-off', 'stakeholder communication', 'prioritization', 'technical debt'],
    },
  ];

  const overallCritique = `Your resume demonstrates good fundamental technical exposure with ${extractedSkills.length} identified competencies. However, it currently scores ${atsScore}/100 on our Technical Screening Index primarily due to ${
    lackingAreas[0]?.title || 'unquantified bullet points'
  }. Recruiters reviewing hundreds of campus profiles look for proof of scale and ownership. Addressing the ${lackingAreas.length} flagged shortcoming areas below will significantly elevate your interview callback rate.`;

  const actionableNextSteps = [
    `Quantify every project bullet point with at least 1 concrete metric (% speedup, volume, RPS, users served).`,
    `Add missing high-demand ecosystem tools (${missingSkillsForRole.slice(0, 3).join(', ') || 'Docker, CI/CD, Redis'}) to your skills section.`,
    `Replace passive verbs ("helped with", "worked on") with power engineering verbs ("Architected", "Engineered", "Optimized", "Spearheaded").`,
    `Add live production demo URLs and public GitHub repository links next to each project title.`,
    `Practice the 5 tailored interview questions generated above to defend your resume claims confidently.`,
  ];

  return {
    candidateName,
    recommendedRole,
    summary: `Software developer with proficiencies across ${extractedSkills.slice(0, 5).join(', ')}. Target alignment with ${recommendedRole} roles.`,
    atsScore,
    atsScoreBreakdown: {
      quantification: quantScore,
      skillRelevance: skillScore,
      depthAndImpact: depthScore,
      clarityAndFormat: clarityScore,
    },
    extractedSkills,
    missingSkillsForRole,
    projectsDetected: detectedProjects,
    lackingAreas,
    bulletPointImprovements,
    tailoredQuestions,
    overallCritique,
    actionableNextSteps,
  };
}

/**
 * Creates an InterviewSession primed with the resume's tailored questions
 */
export function createResumeInterviewSession(
  analysis: ResumeDeepAnalysis,
  resumeText: string,
  role?: string,
  company: string = 'Top Tech Recruiter'
): InterviewSession {
  const targetRole = role || analysis.recommendedRole || 'Software Development Engineer (SDE-1)';

  return {
    id: 'sess-resume-' + Date.now(),
    mode: 'full',
    title: `Resume Deep-Dive: ${targetRole}`,
    role: targetRole,
    company,
    difficulty: 'Intermediate',
    interviewer: INTERVIEWERS[0],
    topics: ['Resume', 'Technical', 'System Design', 'Behavioral'],
    resumeText,
    candidateSkills: analysis.extractedSkills,
    createdAt: Date.now(),
    status: 'in_progress',
    totalQuestions: analysis.tailoredQuestions.length,
    permissionsApproved: true,
    isResumeBased: true,
    resumeQuestions: analysis.tailoredQuestions,
    resumeAnalysis: analysis,
  };
}
