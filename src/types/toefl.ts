/**
 * TOEFL 2026 Domain Model - TypeScript Schema & Domain Types
 * Aligned with ETS 2026 Test Specification and Midnight Academy Architecture.
 */

// ============================================================================
// 1. Core Enums
// ============================================================================

export type ToeflSectionType = 'reading' | 'listening' | 'writing' | 'speaking';

export type ToeflBlueprintStatus = 'draft' | 'review' | 'published' | 'retired';

export type ToeflDifficultyBand = 'lower' | 'middle' | 'upper';

export type ToeflExamMode = 'full' | 'section' | 'practice' | 'diagnostic';

export type ToeflAttemptSectionStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

export type ToeflItemType =
  // Reading
  | 'complete_words'
  | 'read_daily_life'
  | 'read_academic'
  // Listening
  | 'listen_choose_response'
  | 'listen_conversation'
  | 'listen_announcement'
  | 'listen_academic_talk'
  | 'dictation'
  // Writing
  | 'build_sentence'
  | 'write_email'
  | 'academic_discussion'
  // Speaking
  | 'listen_repeat'
  | 'take_interview'
  | 'shadowing';

// ============================================================================
// 2. Blueprint & Content Entities
// ============================================================================

export interface TestVersion {
  id: string;
  testId: string;
  blueprintVersion: string;
  scoringVersion: string;
  status: ToeflBlueprintStatus;
  config: Record<string, unknown>;
  scoringConfig: Record<string, unknown>;
  publishedAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  testVersionId: string;
  sectionType: ToeflSectionType;
  sectionOrder: number;
  timingSeconds: number;
  instructions: string;
  config: Record<string, unknown>;
  createdAt: string;
}

export interface Module {
  id: string;
  sectionId: string;
  stageIndex: number;
  difficultyBand: ToeflDifficultyBand;
  routingRule: {
    minScoreForUpper?: number;
    maxScoreForLower?: number;
    targetModuleId?: string;
    [key: string]: unknown;
  };
  moduleOrder: number;
  createdAt: string;
}

export interface ContentItem {
  id: string;
  moduleId: string | null;
  sectionType: ToeflSectionType;
  itemType: ToeflItemType;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  skillTags: string[];
  payload: {
    prompt?: string;
    passage?: string;
    context?: string;
    audioUrl?: string;
    imageUrl?: string;
    conversationContext?: string;
    questionText?: string;
    wordBank?: string[];
    [key: string]: unknown;
  };
  itemOrder: number;
  createdAt: string;
  // Note: Answer keys and options are separated to guarantee security
}

export interface ContentAsset {
  id: string;
  contentItemId: string | null;
  assetType: 'audio' | 'image' | 'transcript' | string;
  storagePath: string;
  mimeType: string;
  durationMs: number | null;
  checksum: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface QuestionOption {
  id: string;
  contentItemId: string;
  optionKey: string; // e.g. 'A', 'B', 'C', 'D'
  optionText: string;
  optionOrder: number;
  // Server-only fields (never exposed before answer submission):
  isCorrect?: boolean;
  distractorRationale?: string | null;
}

export interface RubricTrait {
  name: string; // e.g. 'task_fulfillment', 'organization', 'language_use', 'delivery'
  weight: number;
  description: string;
  maxScore: number;
}

export interface Rubric {
  id: string;
  rubricVersion: string;
  taskType: ToeflItemType;
  title: string;
  traits: RubricTrait[];
  bandDescriptors: Record<string, string>; // e.g. { '6.0': '...', '5.0': '...' }
  createdAt: string;
}

// ============================================================================
// 3. Attempt & Session Entities
// ============================================================================

export interface AttemptSection {
  id: string;
  attemptId: string;
  sectionId: string;
  status: ToeflAttemptSectionStatus;
  rawScore: number | null;
  sectionBand: number | null; // 1.0 - 6.0 in half-point increments
  timeSpentSeconds: number;
  startedAt: string | null;
  completedAt: string | null;
  metrics: {
    totalItems?: number;
    correctItems?: number;
    paceSecondsPerItem?: number;
    [key: string]: unknown;
  };
  createdAt: string;
}

export interface StudentResponse {
  id: string;
  attemptSectionId: string;
  contentItemId: string;
  studentId: string;
  rawAnswer: string | null; // e.g. selected option key, written text, or audio upload path
  normalizedAnswer: Record<string, unknown>;
  isCorrect: boolean | null;
  score: number | null;
  timeSpentMs: number;
  flagged: boolean;
  answeredAt: string;
}

export interface AiEvaluation {
  id: string;
  responseId: string;
  rubricId: string | null;
  scoreBand: number; // 1.0 to 6.0
  taskScore: number; // 0 to 100
  traits: {
    taskFulfillment?: number;
    organization?: number;
    languageUse?: number;
    delivery?: number;
    pronunciation?: number;
    [trait: string]: number | undefined;
  };
  strengths: string[];
  issues: string[];
  corrections: Array<{
    original: string;
    improved: string;
    explanation: string;
  }>;
  nextActions: string[];
  confidence: number;
  rubricVersion: string;
  promptVersion: string;
  modelId: string;
  responseHash: string | null;
  evaluatedAt: string;
}

// ============================================================================
// 4. Analytics, Reporting & Personalization
// ============================================================================

export interface ScoreReport {
  id: string;
  attemptId: string;
  studentId: string;
  overallBand: number; // 1.0 - 6.0 scale in 0.5 increments
  readingBand: number;
  listeningBand: number;
  writingBand: number;
  speakingBand: number;
  comparableScore: number; // 0 - 120 scale equivalent
  targetScore: number | null;
  targetGap: number | null;
  summary: string | null;
  skillBreakdown: {
    reading?: Record<string, number>;
    listening?: Record<string, number>;
    writing?: Record<string, number>;
    speaking?: Record<string, number>;
    [key: string]: unknown;
  };
  generatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  sectionType: ToeflSectionType;
  category: string; // e.g. 'Inference', 'Vocabulary', 'Paraphrasing', 'Grammar'
  description: string | null;
  parentId: string | null;
  createdAt: string;
}

export interface ResponseSkill {
  id: string;
  responseId: string;
  skillId: string;
  isProficient: boolean;
  score: number | null;
  createdAt: string;
}

export interface Recommendation {
  id: string;
  studentId: string;
  skillId: string | null;
  reason: string;
  priority: number; // 1 (Highest) to 5 (Lowest)
  targetItemIds: string[];
  isCompleted: boolean;
  createdAt: string;
}

export interface StudyPlan {
  id: string;
  studentId: string;
  targetOverallBand: number;
  targetDate: string | null;
  currentEstimatedBand: number | null;
  milestones: Array<{
    title: string;
    targetBand: number;
    completed: boolean;
    dueDate?: string;
  }>;
  planConfig: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ContentTag {
  id: string;
  name: string;
  tagType: 'topic' | 'difficulty' | 'domain' | 'skill';
  createdAt: string;
}

// ============================================================================
// 5. Score Conversion Helpers
// ============================================================================

/**
 * Maps a 1.0 - 6.0 TOEFL iBT band score to an estimated 0 - 120 comparable score.
 * Formula aligned with ETS 2026 transition reporting guidelines:
 * 6.0 -> 115-120
 * 5.5 -> 105-114
 * 5.0 -> 95-104
 * 4.5 -> 80-94
 * 4.0 -> 65-79
 * 3.5 -> 50-64
 * 3.0 -> 35-49
 * 2.5 -> 20-34
 * 2.0 -> 10-19
 * 1.5 -> 5-9
 * 1.0 -> 0-4
 */
export function bandToComparable120(band: number): number {
  const rounded = Math.round(band * 2) / 2; // clamp to 0.5 step
  if (rounded >= 6.0) return 120;
  if (rounded >= 5.5) return 110;
  if (rounded >= 5.0) return 100;
  if (rounded >= 4.5) return 88;
  if (rounded >= 4.0) return 72;
  if (rounded >= 3.5) return 57;
  if (rounded >= 3.0) return 42;
  if (rounded >= 2.5) return 27;
  if (rounded >= 2.0) return 15;
  if (rounded >= 1.5) return 8;
  return 0;
}
