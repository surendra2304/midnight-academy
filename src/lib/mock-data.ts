export type Category =
  "DSA" | "Aptitude" | "DBMS" | "Operating Systems" | "Computer Networks" | "OOP" | "Programming";

export const CATEGORIES: Category[] = [
  "DSA",
  "Aptitude",
  "DBMS",
  "Operating Systems",
  "Computer Networks",
  "OOP",
  "Programming",
];

export type Difficulty = "Easy" | "Medium" | "Hard";

/** The 5 comprehension axes — the single source of truth for the shared component. */
export const AXIS_KEYS = ["objective", "constraint", "io", "concept", "interpretation"] as const;

export type AxisKey = (typeof AXIS_KEYS)[number];

/**
 * Axis display names describe passage-recall reading skills.
 * The internal keys stay stable for stored data.
 */
export const AXIS_LABELS: Record<AxisKey, string> = {
  objective: "Objective Grasp — the main point of the passage",
  constraint: "Detail Capture — limits, keywords & data points",
  io: "Fact Recall — inputs, outputs & relationships",
  concept: "Concept Identification — underlying technical ideas",
  interpretation: "Clear Expression — restate in your own words",
};

export const AXIS_SHORT: Record<AxisKey, string> = {
  objective: "Objective",
  constraint: "Details",
  io: "Recall",
  concept: "Concepts",
  interpretation: "Expression",
};

export type AxisScores = Record<AxisKey, number>;

export const studentProfile = {
  name: "Alex Mehta",
  initials: "AM",
  email: "alex.mehta@university.edu",
  institution: "Northline Institute of Technology",
  year: "3rd Year · Computer Science",
};

export const studentStats = {
  testsTaken: 14,
  averageUnderstanding: 78,
  bestScore: 92,
  streak: 6,
};

export const studentAxes: AxisScores = {
  objective: 86,
  constraint: 61,
  io: 74,
  concept: 82,
  interpretation: 69,
};

export const aiInsight = {
  strength:
    "You consistently identify what a problem is asking for and name the right underlying concept.",
  weakness:
    "Your explanations skip stated limits — input bounds, memory ceilings and edge conditions — in 6 of your last 8 attempts.",
  recommendation:
    "Spend your next two sessions on constraint-heavy DSA and Operating Systems questions. Before writing, list every number and limit mentioned in the question.",
  weakAxis: "constraint" as AxisKey,
};

export type Attempt = {
  id: string;
  name: string;
  category: Category;
  questions: number;
  score: number;
  date: string;
  status: "Completed" | "Evaluated" | "In Review";
};

export const attempts: Attempt[] = [
  {
    id: "at-114",
    name: "Arrays & Two Pointers — Comprehension",
    category: "DSA",
    questions: 10,
    score: 84,
    date: "2026-08-10",
    status: "Evaluated",
  },
  {
    id: "at-113",
    name: "Deadlocks & Scheduling",
    category: "Operating Systems",
    questions: 8,
    score: 63,
    date: "2026-08-07",
    status: "Evaluated",
  },
  {
    id: "at-112",
    name: "Normalization & Keys",
    category: "DBMS",
    questions: 10,
    score: 92,
    date: "2026-08-04",
    status: "Evaluated",
  },
  {
    id: "at-111",
    name: "Time, Speed & Work",
    category: "Aptitude",
    questions: 12,
    score: 71,
    date: "2026-07-31",
    status: "Evaluated",
  },
  {
    id: "at-110",
    name: "TCP Flow Control",
    category: "Computer Networks",
    questions: 8,
    score: 66,
    date: "2026-07-28",
    status: "Evaluated",
  },
  {
    id: "at-109",
    name: "Inheritance & Polymorphism",
    category: "OOP",
    questions: 10,
    score: 80,
    date: "2026-07-24",
    status: "Evaluated",
  },
  {
    id: "at-108",
    name: "Recursion Reading Drill",
    category: "DSA",
    questions: 10,
    score: 74,
    date: "2026-07-20",
    status: "Evaluated",
  },
  {
    id: "at-107",
    name: "Pointers & Memory",
    category: "Programming",
    questions: 8,
    score: 69,
    date: "2026-07-16",
    status: "Evaluated",
  },
];

export const progressSeries = [
  { label: "Attempt 1", score: 54 },
  { label: "Attempt 2", score: 58 },
  { label: "Attempt 3", score: 57 },
  { label: "Attempt 4", score: 65 },
  { label: "Attempt 5", score: 69 },
  { label: "Attempt 6", score: 66 },
  { label: "Attempt 7", score: 74 },
  { label: "Attempt 8", score: 71 },
  { label: "Attempt 9", score: 80 },
  { label: "Attempt 10", score: 78 },
  { label: "Attempt 11", score: 84 },
  { label: "Attempt 12", score: 82 },
  { label: "Attempt 13", score: 88 },
  { label: "Attempt 14", score: 92 },
];

export const axisTrend = [
  { label: "May", objective: 62, constraint: 40, io: 55, concept: 58, interpretation: 48 },
  { label: "Jun", objective: 70, constraint: 46, io: 60, concept: 66, interpretation: 55 },
  { label: "Jul", objective: 78, constraint: 52, io: 68, concept: 74, interpretation: 61 },
  { label: "Aug", objective: 86, constraint: 61, io: 74, concept: 82, interpretation: 69 },
];

export const categoryPerformance: { category: Category; score: number; attempts: number }[] = [
  { category: "DBMS", score: 90, attempts: 3 },
  { category: "DSA", score: 81, attempts: 4 },
  { category: "OOP", score: 80, attempts: 2 },
  { category: "Aptitude", score: 72, attempts: 2 },
  { category: "Programming", score: 69, attempts: 1 },
  { category: "Computer Networks", score: 66, attempts: 1 },
  { category: "Operating Systems", score: 61, attempts: 1 },
];

export type PracticeSet = {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  questions: number;
  minutes: number;
  focus: string;
  recommended?: boolean;
};

export const practiceSets: PracticeSet[] = [
  {
    id: "ps-1",
    title: "Constraint Reading: Array Limits",
    category: "DSA",
    difficulty: "Medium",
    questions: 8,
    minutes: 12,
    focus: "Constraint Recognition",
    recommended: true,
  },
  {
    id: "ps-2",
    title: "Deadlock Conditions — What Is Actually Asked",
    category: "Operating Systems",
    difficulty: "Hard",
    questions: 6,
    minutes: 10,
    focus: "Problem Interpretation",
    recommended: true,
  },
  {
    id: "ps-3",
    title: "Subnetting Question Anatomy",
    category: "Computer Networks",
    difficulty: "Medium",
    questions: 8,
    minutes: 14,
    focus: "Input/Output Understanding",
    recommended: true,
  },
  {
    id: "ps-4",
    title: "Normalization Wording Traps",
    category: "DBMS",
    difficulty: "Medium",
    questions: 10,
    minutes: 15,
    focus: "Concept Identification",
    recommended: true,
  },
  {
    id: "ps-5",
    title: "Graph Traversal Objectives",
    category: "DSA",
    difficulty: "Hard",
    questions: 10,
    minutes: 18,
    focus: "Objective Understanding",
  },
  {
    id: "ps-6",
    title: "Percentages & Ratio Phrasing",
    category: "Aptitude",
    difficulty: "Easy",
    questions: 12,
    minutes: 12,
    focus: "Problem Interpretation",
  },
  {
    id: "ps-7",
    title: "Abstract Classes vs Interfaces",
    category: "OOP",
    difficulty: "Easy",
    questions: 8,
    minutes: 10,
    focus: "Concept Identification",
  },
  {
    id: "ps-8",
    title: "Pointer Semantics in Question Stems",
    category: "Programming",
    difficulty: "Hard",
    questions: 8,
    minutes: 14,
    focus: "Input/Output Understanding",
  },
  {
    id: "ps-9",
    title: "Paging & Segmentation Vocabulary",
    category: "Operating Systems",
    difficulty: "Medium",
    questions: 8,
    minutes: 12,
    focus: "Concept Identification",
  },
  {
    id: "ps-10",
    title: "Transactions & Isolation Levels",
    category: "DBMS",
    difficulty: "Hard",
    questions: 10,
    minutes: 16,
    focus: "Constraint Recognition",
  },
];

export type TestQuestion = {
  id: string;
  text: string;
  category: Category;
  topic: string;
  difficulty: Difficulty;
  concepts: string[];
  constraints: string[];
  answer: string;
};

export const sampleTest = {
  code: "DSA-X7K29",
  name: "Arrays & Two Pointers — Comprehension",
  category: "DSA" as Category,
  difficulty: "Medium" as Difficulty,
  secondsPerQuestion: 45,
  responseSeconds: 120,
};

export const testQuestions: TestQuestion[] = [
  {
    id: "q1",
    text: "Given an array of n distinct integers sorted in ascending order and a target value t, determine whether two elements exist whose sum equals t. You may not use extra space beyond O(1), and your solution must run in O(n) time. Return the 1-based indices of the pair, or an empty result if no such pair exists.",
    category: "DSA",
    topic: "Arrays / Two Pointers",
    difficulty: "Medium",
    concepts: ["Two pointer technique", "Sorted array invariant", "Index vs value distinction"],
    constraints: ["O(1) extra space", "O(n) time", "Distinct integers", "1-based indices returned"],
    answer:
      "Walk two pointers inward from both ends of the sorted array. If the sum of the pair exceeds t, move the right pointer left; if it is smaller, move the left pointer right. Stop when the pointers meet. Return the 1-based indices of the matching pair, or an empty result. This satisfies O(n) time with O(1) auxiliary space.",
  },
  {
    id: "q2",
    text: "A process holds resource R1 and requests R2, while a second process holds R2 and requests R1. Identify which of the four necessary conditions for deadlock are demonstrated by this scenario, and state which single condition, if removed, would break the deadlock without terminating either process.",
    category: "Operating Systems",
    topic: "Deadlocks",
    difficulty: "Hard",
    concepts: ["Coffman conditions", "Circular wait", "Hold and wait", "Deadlock prevention"],
    constraints: [
      "Neither process may be terminated",
      "Must name exactly one condition to remove",
      "Scenario has only two processes and two resources",
    ],
    answer:
      "All four Coffman conditions are present: mutual exclusion, hold and wait, no preemption and circular wait. Removing circular wait — for example by enforcing a global ordering on resource acquisition — breaks the deadlock without terminating either process.",
  },
  {
    id: "q3",
    text: "A relation R(A, B, C, D) has the functional dependencies A → B, B → C and C → D. State the highest normal form R currently satisfies, and explain what must change for R to reach 3NF. Assume A is the only candidate key.",
    category: "DBMS",
    topic: "Normalization",
    difficulty: "Medium",
    concepts: ["Transitive dependency", "Candidate key", "Normal forms", "Decomposition"],
    constraints: [
      "A is the only candidate key",
      "Must name the current normal form",
      "Only the given FDs apply",
    ],
    answer:
      "R is in 2NF but not 3NF, because B → C and C → D are transitive dependencies on the non-prime attributes B and C. Decomposing into R1(A, B), R2(B, C) and R3(C, D) removes the transitive dependencies and puts every relation in 3NF.",
  },
];

/** Per-question evaluation shown on the result screen. */
export type QuestionResult = {
  questionId: string;
  score: number;
  studentUnderstanding: string;
  feedback: string;
  missed: string[];
};

export const sampleResult = {
  overall: 82,
  axes: { objective: 88, constraint: 64, io: 79, concept: 86, interpretation: 74 } as AxisScores,
  overview:
    "You read the intent of each question accurately and named the right underlying technique almost every time. Your weakest habit is treating stated limits as background detail — in two of three questions you restated the goal but left out the bounds that decide which approach is valid.",
  missed: [
    "The O(1) extra-space limit in question 1, which rules out a hash-map approach",
    "That indices must be returned 1-based, not 0-based",
    "The instruction in question 2 to name exactly one condition to remove",
    "That A being the only candidate key is what makes the dependencies transitive in question 3",
  ],
  feedback:
    "A reliable next step: before writing your explanation, silently list every number, limit and output format the question mentions. You already understand the concepts — capturing the constraints alongside them is what will move your score into the 90s.",
  nextSteps: [
    "Run the 'Constraint Reading: Array Limits' practice set",
    "Re-read one Operating Systems question a day and list its explicit instructions",
    "Restate output format (type, indexing, ordering) in every explanation you write",
  ],
  perQuestion: [
    {
      questionId: "q1",
      score: 7,
      studentUnderstanding:
        "We need to find two numbers in a sorted array that add up to the target and return where they are.",
      feedback:
        "The objective is captured correctly and you noticed the array is sorted, which is the key signal here. You did not mention the O(1) space and O(n) time limits, or that the indices are 1-based — those constraints are what force the two-pointer approach rather than a hash map.",
      missed: ["O(1) extra space", "O(n) time", "1-based indices"],
    },
    {
      questionId: "q2",
      score: 8,
      studentUnderstanding:
        "It's asking which deadlock conditions are shown by two processes each holding what the other wants, and how to fix it.",
      feedback:
        "Strong interpretation — you recognised the circular wait pattern from the description. The question also constrains the answer: exactly one condition, and no process may be terminated. Naming that constraint would have made your understanding complete.",
      missed: ["Exactly one condition must be named", "Neither process may be terminated"],
    },
    {
      questionId: "q3",
      score: 9,
      studentUnderstanding:
        "Given the dependencies, say which normal form the relation is in now and what decomposition gets it to 3NF, knowing A is the only key.",
      feedback:
        "Excellent. You captured the objective, the given dependencies and the candidate-key assumption that makes the chain transitive. This is the level of detail to aim for on every question.",
      missed: [],
    },
  ] as QuestionResult[],
};

/* ---------------------------------- Admin ---------------------------------- */

export const adminStats = {
  totalTests: 24,
  activeTests: 7,
  totalStudents: 412,
  completedAttempts: 1863,
};

export type AdminTest = {
  id: string;
  name: string;
  code: string;
  category: Category;
  questions: number;
  participants: number;
  average: number;
  status: "Draft" | "Active" | "Completed" | "Paused";
  difficulty: Difficulty;
  secondsPerQuestion: number;
  created: string;
};

export const adminTests: AdminTest[] = [
  {
    id: "t-24",
    name: "Arrays & Two Pointers — Comprehension",
    code: "DSA-X7K29",
    category: "DSA",
    questions: 10,
    participants: 128,
    average: 79,
    status: "Active",
    difficulty: "Medium",
    secondsPerQuestion: 45,
    created: "2026-08-08",
  },
  {
    id: "t-23",
    name: "Deadlocks & Scheduling",
    code: "OS-M4P11",
    category: "Operating Systems",
    questions: 8,
    participants: 96,
    average: 61,
    status: "Active",
    difficulty: "Hard",
    secondsPerQuestion: 60,
    created: "2026-08-05",
  },
  {
    id: "t-22",
    name: "Normalization & Keys",
    code: "DB-Q9R47",
    category: "DBMS",
    questions: 10,
    participants: 143,
    average: 88,
    status: "Completed",
    difficulty: "Medium",
    secondsPerQuestion: 45,
    created: "2026-07-29",
  },
  {
    id: "t-21",
    name: "TCP Flow Control",
    code: "CN-T2L88",
    category: "Computer Networks",
    questions: 8,
    participants: 74,
    average: 65,
    status: "Paused",
    difficulty: "Hard",
    secondsPerQuestion: 60,
    created: "2026-07-22",
  },
  {
    id: "t-20",
    name: "Aptitude Reading Drill II",
    code: "AP-K1V05",
    category: "Aptitude",
    questions: 12,
    participants: 0,
    average: 0,
    status: "Draft",
    difficulty: "Easy",
    secondsPerQuestion: 30,
    created: "2026-07-19",
  },
];

export const adminActivity = [
  { text: "You created “Aptitude Reading Drill II”", meta: "Draft · 2 hours ago" },
  { text: "18 students completed “Arrays & Two Pointers — Comprehension”", meta: "Today" },
  { text: "“Normalization & Keys” was closed automatically", meta: "Yesterday" },
  { text: "3 evaluations were flagged for review", meta: "2 days ago" },
  { text: "You published “Deadlocks & Scheduling”", meta: "5 days ago" },
];

export type AdminStudent = {
  id: string;
  name: string;
  initials: string;
  email: string;
  attempts: number;
  average: number;
  weakest: AxisKey;
  lastActive: string;
};

export const adminStudents: AdminStudent[] = [
  {
    id: "s-1",
    name: "Alex Mehta",
    initials: "AM",
    email: "alex.mehta@university.edu",
    attempts: 14,
    average: 78,
    weakest: "constraint",
    lastActive: "Today",
  },
  {
    id: "s-2",
    name: "Priya Nair",
    initials: "PN",
    email: "priya.nair@university.edu",
    attempts: 17,
    average: 88,
    weakest: "io",
    lastActive: "Today",
  },
  {
    id: "s-3",
    name: "Daniel Okoro",
    initials: "DO",
    email: "daniel.okoro@university.edu",
    attempts: 9,
    average: 64,
    weakest: "interpretation",
    lastActive: "Yesterday",
  },
  {
    id: "s-4",
    name: "Hana Sato",
    initials: "HS",
    email: "hana.sato@university.edu",
    attempts: 12,
    average: 81,
    weakest: "constraint",
    lastActive: "2 days ago",
  },
  {
    id: "s-5",
    name: "Marcus Reid",
    initials: "MR",
    email: "marcus.reid@university.edu",
    attempts: 6,
    average: 57,
    weakest: "concept",
    lastActive: "4 days ago",
  },
  {
    id: "s-6",
    name: "Leila Haddad",
    initials: "LH",
    email: "leila.haddad@university.edu",
    attempts: 15,
    average: 84,
    weakest: "interpretation",
    lastActive: "Today",
  },
];

export const questionBank: TestQuestion[] = [
  ...testQuestions,
  {
    id: "qb-4",
    text: "Two trains leave stations 300 km apart at the same moment and travel toward each other at 60 km/h and 90 km/h. Ignoring train length, determine how far from the first station they meet. State your answer in kilometres.",
    category: "Aptitude",
    topic: "Time, Speed & Distance",
    difficulty: "Easy",
    concepts: ["Relative speed", "Uniform motion", "Unit consistency"],
    constraints: [
      "Train length ignored",
      "Answer required in kilometres",
      "Both start simultaneously",
    ],
    answer:
      "Relative speed is 150 km/h, so they meet after 2 hours. The first train covers 60 × 2 = 120 km, so they meet 120 km from the first station.",
  },
  {
    id: "qb-5",
    text: "Explain what distinguishes an abstract class from an interface in a single-inheritance language, and state which one you must use when shared implementation state is required.",
    category: "OOP",
    topic: "Abstraction",
    difficulty: "Easy",
    concepts: ["Abstraction", "Single inheritance", "Shared state"],
    constraints: ["Single-inheritance language assumed", "Must pick exactly one construct"],
    answer:
      "An abstract class can hold fields and concrete methods but may be inherited only once; an interface declares a contract and can be implemented many times but carries no instance state. Shared implementation state requires an abstract class.",
  },
  {
    id: "qb-6",
    text: "A sender using TCP has a congestion window of 8 segments when three duplicate ACKs arrive. Describe what the sender must do next and what the window size becomes, assuming TCP Reno.",
    category: "Computer Networks",
    topic: "Congestion Control",
    difficulty: "Medium",
    concepts: ["Fast retransmit", "Fast recovery", "Congestion window"],
    constraints: [
      "TCP Reno assumed",
      "Exactly three duplicate ACKs",
      "Initial window of 8 segments",
    ],
    answer:
      "Three duplicate ACKs trigger fast retransmit: the sender resends the missing segment immediately, halves the congestion window to 4 segments, sets that as the new ssthresh and enters fast recovery rather than slow start.",
  },
];

export type FlaggedEvaluation = {
  id: string;
  student: string;
  test: string;
  questionText: string;
  studentAnswer: string;
  aiScore: number;
  aiFeedback: string;
  reason: string;
  submitted: string;
};

export const flaggedEvaluations: FlaggedEvaluation[] = [
  {
    id: "f-1",
    student: "Daniel Okoro",
    test: "Deadlocks & Scheduling",
    questionText:
      "A process holds resource R1 and requests R2, while a second process holds R2 and requests R1. Identify which of the four necessary conditions for deadlock are demonstrated...",
    studentAnswer:
      "It wants me to list the deadlock conditions in this situation and pick one to remove so both processes keep running.",
    aiScore: 5,
    aiFeedback: "Objective partially captured; constraints not acknowledged.",
    reason: "Student says the constraint about not terminating processes was covered.",
    submitted: "2 days ago",
  },
  {
    id: "f-2",
    student: "Marcus Reid",
    test: "Arrays & Two Pointers — Comprehension",
    questionText:
      "Given an array of n distinct integers sorted in ascending order and a target value t, determine whether two elements exist whose sum equals t...",
    studentAnswer:
      "Find a pair summing to the target in a sorted array, in linear time without extra memory, returning positions starting at 1.",
    aiScore: 6,
    aiFeedback: "Constraints listed but objective stated imprecisely.",
    reason: "Student believes all constraints and the objective were stated.",
    submitted: "3 days ago",
  },
  {
    id: "f-3",
    student: "Hana Sato",
    test: "Normalization & Keys",
    questionText:
      "A relation R(A, B, C, D) has the functional dependencies A → B, B → C and C → D. State the highest normal form...",
    studentAnswer:
      "Say which normal form it's in and what decomposition reaches 3NF, given A is the only candidate key.",
    aiScore: 7,
    aiFeedback: "Good coverage; transitive dependency not named explicitly.",
    reason: "Student argues naming the dependency chain was implied.",
    submitted: "5 days ago",
  },
];

export const testPerformance = adminTests
  .filter((t) => t.participants > 0)
  .map((t) => ({ name: t.code, score: t.average }));

export const perQuestionDifficulty = [
  { q: "Q1", score: 84 },
  { q: "Q2", score: 71 },
  { q: "Q3", score: 88 },
  { q: "Q4", score: 52 },
  { q: "Q5", score: 79 },
  { q: "Q6", score: 66 },
  { q: "Q7", score: 91 },
  { q: "Q8", score: 74 },
  { q: "Q9", score: 61 },
  { q: "Q10", score: 83 },
];

export function scoreTone(score: number): "success" | "warning" | "destructive" {
  if (score >= 80) return "success";
  if (score >= 65) return "warning";
  return "destructive";
}

export function scoreTextClass(score: number) {
  const tone = scoreTone(score);
  return tone === "success"
    ? "text-success"
    : tone === "warning"
      ? "text-warning"
      : "text-destructive";
}

export function formatDate(iso: string) {
  // All dates across the app render in Indian Standard Time
  return new Date(iso).toLocaleDateString("en-GB", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
