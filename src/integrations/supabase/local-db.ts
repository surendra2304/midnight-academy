/**
 * Self-contained Local Database & Supabase-compatible Query Engine for Midnight Academy.
 * Pre-seeded with all 8 Official TOEFL 2026 TestGlider Mock Tests (Moon, Mars, Venus,
 * Jupiter, Saturn, Mercury, Neptune, Uranus) from:
 * - Video: https://youtu.be/5giZh7nDyfk
 * - Playlist: https://youtube.com/playlist?list=PLoDNaUsnugSqgJGJKo59X49nkQbwcksMV
 *
 * Supports both the TOEFL 2026 normalized tables (`tests`, `test_versions`, `sections`,
 * `modules`, `content_items`, `question_options`, `attempts`, `attempt_sections`,
 * `responses`, `evaluations`, `score_reports`, `recommendations`) and legacy/practice
 * tables (`test_blueprints`, `toefl_question_items`, `questions`, `attempt_answers`, etc.).
 */

import {
  ALL_TESTGLIDER_BLUEPRINTS,
  ALL_TESTGLIDER_QUESTION_ITEMS,
  SEED_COMPREHENSION_QUESTIONS,
  SEED_DICTATION_PASSAGES,
  SEED_LESSONS,
  SEED_SHADOWING_DRILLS,
  SEED_VOCABULARY_WORDS,
} from "@/data/testglider-2026-catalog";
import { toDeterministicUuid } from "@/data/tests/types";

export const DEFAULT_LOCAL_USER_ID = "00000000-0000-4000-8000-000000000001";
export const DEFAULT_ADMIN_USER_ID = "00000000-0000-4000-8000-000000000002";

export const DEFAULT_LOCAL_USER = {
  id: DEFAULT_LOCAL_USER_ID,
  aud: "authenticated",
  role: "authenticated",
  email: "student@midnight.academy",
  email_confirmed_at: "2026-09-01T00:00:00.000Z",
  phone: "",
  confirmed_at: "2026-09-01T00:00:00.000Z",
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {
    provider: "email",
    providers: ["email"],
    role: "student",
  },
  user_metadata: {
    full_name: "TOEFL Test Taker",
    role: "student",
    membership_tier: "member",
  },
  identities: [],
  created_at: "2026-09-01T00:00:00.000Z",
  updated_at: new Date().toISOString(),
};

export const DEFAULT_ADMIN_USER = {
  id: DEFAULT_ADMIN_USER_ID,
  aud: "authenticated",
  role: "authenticated",
  email: "admin@midnight.academy",
  email_confirmed_at: "2026-09-01T00:00:00.000Z",
  phone: "",
  confirmed_at: "2026-09-01T00:00:00.000Z",
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {
    provider: "email",
    providers: ["email"],
    role: "admin",
  },
  user_metadata: {
    full_name: "Course Instructor",
    role: "admin",
    membership_tier: "member",
  },
  identities: [],
  created_at: "2026-09-01T00:00:00.000Z",
  updated_at: new Date().toISOString(),
};

interface LocalDatabaseStore {
  tables: Record<string, Array<Record<string, any>>>;
  users: Array<typeof DEFAULT_LOCAL_USER>;
  storageBlobs: Record<string, string>;
}

function getFieldCI(row: Record<string, any>, col: string): any {
  if (!row || typeof row !== "object") return undefined;
  if (col in row) return row[col];
  const lower = col.toLowerCase();
  for (const k of Object.keys(row)) {
    if (k.toLowerCase() === lower) {
      return row[k];
    }
  }
  return undefined;
}

function createInitialStore(): LocalDatabaseStore {
  const testsTable: Array<Record<string, any>> = [];
  const testVersionsTable: Array<Record<string, any>> = [];
  const sectionsTable: Array<Record<string, any>> = [];
  const modulesTable: Array<Record<string, any>> = [];
  const contentItemsTable: Array<Record<string, any>> = [];
  const questionOptionsTable: Array<Record<string, any>> = [];
  const legacyQuestionsTable: Array<Record<string, any>> = [];

  for (const bp of ALL_TESTGLIDER_BLUEPRINTS) {
    const bpItems = ALL_TESTGLIDER_QUESTION_ITEMS.filter(
      (item) => item.blueprint_Id === bp.id,
    );
    const planetUpper = (bp.blueprint_Json.planetName || bp.slug || "MOON").toUpperCase();

    // 1. `tests` row
    testsTable.push({
      id: bp.id,
      owner_id: DEFAULT_ADMIN_USER_ID,
      name: bp.title,
      category: "Full Mock",
      difficulty: bp.blueprint_Json.difficultyLabel || "Medium",
      question_count: bpItems.length,
      seconds_per_question: 90,
      response_seconds: 60,
      status: "active",
      code: `TOEFL-MOCK-${planetUpper}`,
      is_practice: true,
      expires_at: null,
      description: bp.description,
      planet_name: bp.blueprint_Json.planetName,
      video_url: bp.blueprint_Json.videoUrl,
      video_id: bp.blueprint_Json.videoId,
      playlist_url: bp.blueprint_Json.playlistUrl,
      created_at: bp.created_At,
    });

    // 2. `test_versions` row
    testVersionsTable.push({
      id: bp.id,
      test_id: bp.id,
      blueprint_version: "2026.1",
      scoring_version: "2026.1",
      status: "published",
      published_at: bp.created_At,
      created_by: DEFAULT_ADMIN_USER_ID,
      created_at: bp.created_At,
    });

    // 3. `sections` and `modules` rows (Reading, Listening, Writing, Speaking)
    const sectionDefs: Array<{
      sectionType: "reading" | "listening" | "writing" | "speaking";
      sectionOrder: number;
      timingSeconds: number;
      instructions: string;
    }> = [
      {
        sectionType: "reading",
        sectionOrder: 0,
        timingSeconds: 1800,
        instructions:
          "Reading Section: Complete the words in academic paragraphs, read daily life emails/notices/text chains, and answer academic reading comprehension questions.",
      },
      {
        sectionType: "listening",
        sectionOrder: 1,
        timingSeconds: 1740,
        instructions:
          "Listening Section: Listen to short conversational prompts, campus conversations, announcements, and academic lectures, then choose the best answer.",
      },
      {
        sectionType: "writing",
        sectionOrder: 2,
        timingSeconds: 1380,
        instructions:
          "Writing Section: Build grammatically accurate sentences from scrambled phrase chunks, write a structured email, and contribute to an academic discussion.",
      },
      {
        sectionType: "speaking",
        sectionOrder: 3,
        timingSeconds: 480,
        instructions:
          "Speaking Section: Listen and repeat 7 guided sentences accurately, then answer 4 spontaneous interview questions.",
      },
    ];

    for (const secDef of sectionDefs) {
      const blueprintSection = bp.blueprint_Json.sections.find(
        (section) => section.section === secDef.sectionType,
      );
      const sectionId = toDeterministicUuid(`${bp.id}-section-${secDef.sectionType}`);
      sectionsTable.push({
        id: sectionId,
        test_version_id: bp.id,
        section_type: secDef.sectionType,
        section_order: secDef.sectionOrder,
        timing_seconds: blueprintSection?.durationSeconds ?? secDef.timingSeconds,
        instructions: secDef.instructions,
        config: {
          isAdaptive: false,
          moduleCount: blueprintSection?.moduleCount ?? 1,
        },
        created_at: bp.created_At,
      });

      const secItems = bpItems.filter((it) => it.section === secDef.sectionType);
      const mod1Id = toDeterministicUuid(`${bp.id}-module-${secDef.sectionType}-1`);
      modulesTable.push({
        id: mod1Id,
        section_id: sectionId,
        stage_index: 1,
        difficulty_band: "middle",
        routing_rule: {},
        module_order: 0,
        created_at: bp.created_At,
      });

      const mod2Id = toDeterministicUuid(`${bp.id}-module-${secDef.sectionType}-2`);
      const hasSecondModule =
        (blueprintSection?.moduleCount ?? 1) > 1 || secItems.some((item) => item.module_Number === 2);
      if (hasSecondModule) {
        modulesTable.push({
          id: mod2Id,
          section_id: sectionId,
          stage_index: 2,
          difficulty_band: "upper",
          routing_rule: {},
          module_order: 1,
          created_at: bp.created_At,
        });
      }

      // 4. `content_items` and `question_options` for this section
      secItems.forEach((item, idx) => {
        const targetModId = item.module_Number === 2 ? mod2Id : mod1Id;
        const normalizedItemType =
          item.task_Type === "read_academic_passage" ? "read_academic" : item.task_Type;
        const difficultyLabel =
          item.difficulty_Band === "upper"
            ? "Hard"
            : item.difficulty_Band === "lower"
              ? "Easy"
              : "Medium";

        const mergedPayload: Record<string, any> = {
          ...structuredClone(item.prompt_Json),
          answerKey: structuredClone(item.answer_Key_Json),
          moduleNumber: item.module_Number,
          difficultyBand: item.difficulty_Band,
        };

        contentItemsTable.push({
          id: item.id,
          module_id: targetModId,
          section_type: secDef.sectionType,
          item_type: normalizedItemType,
          difficulty: difficultyLabel,
          skill_tags: [
            secDef.sectionType,
            normalizedItemType,
            item.difficulty_Band,
            bp.blueprint_Json.planetName,
          ],
          payload: mergedPayload,
          item_order: idx,
          created_at: item.created_At,
        });

        // Populate `question_options` for MCQ items
        const rawOptions = item.prompt_Json?.options as
          | Array<{ id: string; text: string }>
          | undefined;
        if (Array.isArray(rawOptions) && rawOptions.length > 0) {
          const correctKey = item.answer_Key_Json?.correctOptionId;
          const explanation = item.answer_Key_Json?.explanation || null;
          rawOptions.forEach((opt, optIdx) => {
            questionOptionsTable.push({
              id: toDeterministicUuid(`${item.id}-opt-${opt.id}`),
              content_item_id: item.id,
              option_key: opt.id,
              option_text: opt.text,
              is_correct: opt.id === correctKey,
              distractor_rationale: explanation,
              option_order: optIdx,
            });
          });
        }

        // Also populate legacy `questions` table
        legacyQuestionsTable.push({
          id: item.id,
          test_id: bp.id,
          position: idx,
          text:
            item.prompt_Json?.questionStem ||
            item.prompt_Json?.prompt ||
            item.stimulus_Text ||
            item.title,
          category: secDef.sectionType,
          topic: item.title,
          difficulty: difficultyLabel,
          approved: true,
          concepts: [secDef.sectionType, normalizedItemType],
          constraints: [],
          reference_answer:
            item.answer_Key_Json?.explanation ||
            item.answer_Key_Json?.sampleHighScoringResponse ||
            item.answer_Key_Json?.targetSentence ||
            "",
          created_at: item.created_At,
        });
      });
    }
  }

  return {
    tables: {
      // Normalized TOEFL 2026 Tables
      tests: testsTable,
      test_versions: testVersionsTable,
      sections: sectionsTable,
      modules: modulesTable,
      content_items: contentItemsTable,
      question_options: questionOptionsTable,
      attempts: [],
      attempt_sections: [],
      responses: [],
      evaluations: [],
      score_reports: [],
      recommendations: [],
      questions: legacyQuestionsTable,
      attempt_answers: [],
      notifications: [],

      // Additional / Legacy Catalog Tables
      test_blueprints: structuredClone(ALL_TESTGLIDER_BLUEPRINTS),
      toefl_question_items: structuredClone(ALL_TESTGLIDER_QUESTION_ITEMS),
      dictation_Passages: structuredClone(SEED_DICTATION_PASSAGES),
      shadowing_Drills: structuredClone(SEED_SHADOWING_DRILLS),
      vocabulary_Words: structuredClone(SEED_VOCABULARY_WORDS),
      strategy_Lessons: structuredClone(SEED_LESSONS),
      comprehension_Questions: structuredClone(SEED_COMPREHENSION_QUESTIONS),
      test_attempts: [],
      test_section_attempts: [],
      test_item_responses: [],
      writing_Evaluations: [],
      speaking_Recordings: [],
      dictation_Attempts: [],
      shadowing_Attempts: [],
      user_Flashcards: [],
      user_lesson_progress: [],
      user_Answers: [],
      user_Stats: [
        {
          id: "stats-default-1",
          user_id: DEFAULT_LOCAL_USER_ID,
          total_questions_answered: 0,
          correct_answers: 0,
          current_streak: 0,
          longest_streak: 0,
          total_study_minutes: 0,
          estimated_toefl_score: null,
          estimated_band_score: null,
          updated_at: new Date().toISOString(),
        },
      ],
      user_Progress: [],
      bookmarks: [],
      profiles: [
        {
          id: DEFAULT_LOCAL_USER_ID,
          email: DEFAULT_LOCAL_USER.email,
          full_name: "TOEFL Test Taker",
          full_Name: "TOEFL Test Taker",
          avatar_url: null,
          avatar_Url: null,
          role: "student",
          institution: "Midnight Academy",
          year: "2026",
          branch: "Computer Science",
          code_number: "TG20260001",
          onboarded: true,
          membership_tier: "member",
          membership_Tier: "member",
          target_band_score: 5.5,
          target_Band_Score: 5.5,
          target_toefl_score: 110,
          target_Toefl_Score: 110,
          dream_school: "Stanford University",
          dream_School: "Stanford University",
          study_streak: 4,
          study_Streak: 4,
          created_at: "2026-09-01T00:00:00.000Z",
          created_At: "2026-09-01T00:00:00.000Z",
          updated_at: "2026-09-01T00:00:00.000Z",
          updated_At: "2026-09-01T00:00:00.000Z",
        },
        {
          id: DEFAULT_ADMIN_USER_ID,
          email: DEFAULT_ADMIN_USER.email,
          full_name: "Course Instructor",
          full_Name: "Course Instructor",
          avatar_url: null,
          avatar_Url: null,
          role: "admin",
          institution: "Midnight Academy",
          onboarded: true,
          membership_tier: "member",
          membership_Tier: "member",
          created_at: "2026-09-01T00:00:00.000Z",
          updated_at: "2026-09-01T00:00:00.000Z",
        },
      ],
      user_roles: [
        {
          id: "role-default-student",
          user_id: DEFAULT_LOCAL_USER_ID,
          user_Id: DEFAULT_LOCAL_USER_ID,
          role: "student",
          created_at: "2026-09-01T00:00:00.000Z",
        },
        {
          id: "role-default-admin",
          user_id: DEFAULT_ADMIN_USER_ID,
          user_Id: DEFAULT_ADMIN_USER_ID,
          role: "admin",
          created_at: "2026-09-01T00:00:00.000Z",
        },
      ],
      otp_Verifications: [],
      audit_Logs: [],
      evaluation_Cache: [],
    },
    users: [structuredClone(DEFAULT_LOCAL_USER), structuredClone(DEFAULT_ADMIN_USER)],
    storageBlobs: {},
  };
}

const PERSIST_FILE_PATH = "/tmp/midnight-academy-local-db-v4.json";

function isNodeRuntime(): boolean {
  return (
    typeof process !== "undefined" &&
    Boolean(process.versions && process.versions.node) &&
    typeof window === "undefined"
  );
}

function isVitestRuntime(): boolean {
  return (
    typeof process !== "undefined" &&
    Boolean(process.env?.VITEST || process.env?.NODE_ENV === "test")
  );
}

declare global {
  // eslint-disable-next-line no-var
  var __MIDNIGHT_LOCAL_DB_STORE__: LocalDatabaseStore | undefined;
}

function loadStoreFromDisk(store: LocalDatabaseStore): void {
  if (!isNodeRuntime() || isVitestRuntime()) return;
  try {
    const fs = (process as any).getBuiltinModule?.("node:fs");
    if (!fs || !fs.existsSync(PERSIST_FILE_PATH)) return;
    const raw = fs.readFileSync(PERSIST_FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalDatabaseStore>;
    if (parsed && parsed.tables) {
      const runtimeTables = [
        "attempts",
        "attempt_sections",
        "responses",
        "evaluations",
        "score_reports",
        "recommendations",
        "attempt_answers",
        "notifications",
        "test_attempts",
        "test_section_attempts",
        "test_item_responses",
        "writing_Evaluations",
        "speaking_Recordings",
        "dictation_Attempts",
        "shadowing_Attempts",
        "user_Flashcards",
        "user_lesson_progress",
        "user_Answers",
        "user_Stats",
        "user_Progress",
        "bookmarks",
        "otp_Verifications",
        "audit_Logs",
        "evaluation_Cache",
      ];
      for (const tbl of runtimeTables) {
        if (Array.isArray(parsed.tables[tbl]) && parsed.tables[tbl].length > 0) {
          store.tables[tbl] = parsed.tables[tbl];
        }
      }
      if (parsed.storageBlobs && typeof parsed.storageBlobs === "object") {
        store.storageBlobs = { ...store.storageBlobs, ...parsed.storageBlobs };
      }
    }
  } catch {
    // Ignore disk read errors
  }
}

function saveStoreToDisk(store: LocalDatabaseStore): void {
  if (!isNodeRuntime() || isVitestRuntime()) return;
  try {
    const fs = (process as any).getBuiltinModule?.("node:fs");
    if (!fs) return;
    fs.writeFileSync(PERSIST_FILE_PATH, JSON.stringify(store), "utf8");
  } catch {
    // Ignore disk write errors
  }
}

export function getLocalStore(): LocalDatabaseStore {
  if (!globalThis.__MIDNIGHT_LOCAL_DB_STORE__) {
    const store = createInitialStore();
    loadStoreFromDisk(store);
    globalThis.__MIDNIGHT_LOCAL_DB_STORE__ = store;
  } else if (isNodeRuntime() && !isVitestRuntime()) {
    loadStoreFromDisk(globalThis.__MIDNIGHT_LOCAL_DB_STORE__);
  }
  return globalThis.__MIDNIGHT_LOCAL_DB_STORE__;
}

function enrichJoinedRow(
  tableName: string,
  row: Record<string, any>,
  selectQuery: string,
  store: LocalDatabaseStore,
): Record<string, any> {
  const result = { ...row };
  const s = selectQuery || "*";
  const lowerTable = tableName.toLowerCase();

  // 1. `test_versions` joins: `tests(...)`, `sections(...)`
  if (lowerTable === "test_versions") {
    if (s.includes("tests")) {
      const testRow = (store.tables.tests ?? []).find(
        (t) => t.id === getFieldCI(row, "test_id"),
      );
      result.tests = testRow ? structuredClone(testRow) : null;
    }
    if (s.includes("sections")) {
      const secs = (store.tables.sections ?? [])
        .filter((sec) => getFieldCI(sec, "test_version_id") === row.id)
        .sort((a, b) => (a.section_order ?? 0) - (b.section_order ?? 0));
      result.sections = structuredClone(secs);
    }
  }

  // 2. `attempts` joins: `tests(...)`
  if (lowerTable === "attempts") {
    if (s.includes("tests")) {
      const testRow = (store.tables.tests ?? []).find(
        (t) => t.id === getFieldCI(row, "test_id"),
      );
      result.tests = testRow ? structuredClone(testRow) : null;
    }
  }

  // 3. `attempt_sections` joins: `sections(...)`
  if (lowerTable === "attempt_sections") {
    if (s.includes("sections")) {
      const secRow = (store.tables.sections ?? []).find(
        (sec) => sec.id === getFieldCI(row, "section_id"),
      );
      result.sections = secRow ? structuredClone(secRow) : null;
    }
  }

  // 4. `responses` joins: `content_items(...)`, `attempt_sections(...)`
  if (lowerTable === "responses") {
    if (s.includes("content_items")) {
      const itemRow = (store.tables.content_items ?? []).find(
        (ci) => ci.id === getFieldCI(row, "content_item_id"),
      );
      result.content_items = itemRow ? structuredClone(itemRow) : null;
    }
    if (s.includes("attempt_sections")) {
      const attSecRow = (store.tables.attempt_sections ?? []).find(
        (as) => as.id === getFieldCI(row, "attempt_section_id"),
      );
      result.attempt_sections = attSecRow ? structuredClone(attSecRow) : null;
    }
  }

  // 5. `attempt_answers` joins: `questions(...)`, `attempts(...)`
  if (lowerTable === "attempt_answers") {
    if (s.includes("questions")) {
      const qRow = (store.tables.questions ?? []).find(
        (q) => q.id === getFieldCI(row, "question_id"),
      );
      result.questions = qRow ? structuredClone(qRow) : null;
    }
    if (s.includes("attempts")) {
      const attRow = (store.tables.attempts ?? []).find(
        (a) => a.id === getFieldCI(row, "attempt_id"),
      );
      if (attRow) {
        const testRow = (store.tables.tests ?? []).find(
          (t) => t.id === getFieldCI(attRow, "test_id"),
        );
        result.attempts = {
          ...structuredClone(attRow),
          tests: testRow ? structuredClone(testRow) : null,
        };
      } else {
        result.attempts = null;
      }
    }
  }

  // 6. Legacy tables joins
  if (lowerTable === "test_attempts") {
    if (s.includes("test_section_attempts") || s.includes("test_section_Attempt")) {
      const sections = (store.tables.test_section_attempts ?? []).filter(
        (sec) => getFieldCI(sec, "attempt_Id") === row.id,
      );
      result.test_section_Attempt = structuredClone(sections);
      result.test_section_attempts = structuredClone(sections);
    }
    if (s.includes("test_blueprints") || s.includes("test_Blueprint")) {
      const bp = (store.tables.test_blueprints ?? []).find(
        (b) => b.id === getFieldCI(row, "blueprint_Id"),
      );
      result.test_Blueprint = bp ? structuredClone(bp) : null;
      result.test_blueprints = bp ? structuredClone(bp) : null;
    }
  }

  if (lowerTable === "test_item_responses") {
    if (s.includes("toefl_question_items") || s.includes("question_Item")) {
      const qItem = (store.tables.toefl_question_items ?? []).find(
        (q) => q.id === getFieldCI(row, "question_Item_Id"),
      );
      result.question_Item = qItem ? structuredClone(qItem) : null;
      result.toefl_question_items = qItem ? structuredClone(qItem) : null;
    }
  }

  if (lowerTable === "user_flashcards") {
    if (s.includes("vocabulary_words") || s.includes("vocabulary_Word")) {
      const word = (store.tables.vocabulary_Words ?? []).find(
        (w) => w.id === getFieldCI(row, "word_Id"),
      );
      result.vocabulary_Word = word ? structuredClone(word) : null;
      result.vocabulary_words = word ? structuredClone(word) : null;
    }
  }

  if (lowerTable === "user_answers" || lowerTable === "bookmarks") {
    if (
      s.includes("comprehension_Questions") ||
      s.includes("comprehension_questions")
    ) {
      const q = (store.tables.comprehension_Questions ?? []).find(
        (item) => item.id === getFieldCI(row, "question_id"),
      );
      result.comprehension_Questions = q ? structuredClone(q) : null;
      result.comprehension_questions = q ? structuredClone(q) : null;
    }
  }

  return result;
}

type FilterFn = (row: Record<string, any>) => boolean;

class LocalQueryBuilder implements PromiseLike<any> {
  private tableName: string;
  private operation: "select" | "insert" | "upsert" | "update" | "delete" =
    "select";
  private selectColumns = "*";
  private selectOptions?: { count?: "exact" | "planned" | "estimated"; head?: boolean };
  private filters: FilterFn[] = [];
  private orderSpecs: Array<{ column: string; ascending: boolean }> = [];
  private limitCount?: number;
  private rangeSpec?: { from: number; to: number };
  private singleMode: "none" | "single" | "maybeSingle" = "none";
  private payload: any = null;
  private upsertOptions?: { onConflict?: string };

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  private getTable(store: LocalDatabaseStore): Array<Record<string, any>> {
    if (this.tableName in store.tables) {
      return store.tables[this.tableName]!;
    }
    const lower = this.tableName.toLowerCase();
    for (const key of Object.keys(store.tables)) {
      if (key.toLowerCase() === lower) {
        return store.tables[key]!;
      }
    }
    store.tables[this.tableName] = [];
    return store.tables[this.tableName]!;
  }

  private setTable(
    store: LocalDatabaseStore,
    rows: Array<Record<string, any>>,
  ): void {
    const lower = this.tableName.toLowerCase();
    for (const key of Object.keys(store.tables)) {
      if (key.toLowerCase() === lower) {
        store.tables[key] = rows;
        return;
      }
    }
    store.tables[this.tableName] = rows;
  }

  select(
    columns = "*",
    options?: { count?: "exact" | "planned" | "estimated"; head?: boolean },
  ): this {
    this.selectColumns = columns;
    if (options) {
      this.selectOptions = options;
    }
    return this;
  }

  insert(values: any): this {
    this.operation = "insert";
    this.payload = values;
    return this;
  }

  upsert(values: any, options?: { onConflict?: string }): this {
    this.operation = "upsert";
    this.payload = values;
    if (options) {
      this.upsertOptions = options;
    }
    return this;
  }

  update(values: any): this {
    this.operation = "update";
    this.payload = values;
    return this;
  }

  delete(): this {
    this.operation = "delete";
    return this;
  }

  eq(column: string, value: any): this {
    this.filters.push((row) => getFieldCI(row, column) === value);
    return this;
  }

  neq(column: string, value: any): this {
    this.filters.push((row) => getFieldCI(row, column) !== value);
    return this;
  }

  gt(column: string, value: any): this {
    this.filters.push((row) => getFieldCI(row, column) > value);
    return this;
  }

  gte(column: string, value: any): this {
    this.filters.push((row) => getFieldCI(row, column) >= value);
    return this;
  }

  lt(column: string, value: any): this {
    this.filters.push((row) => getFieldCI(row, column) < value);
    return this;
  }

  lte(column: string, value: any): this {
    this.filters.push((row) => getFieldCI(row, column) <= value);
    return this;
  }

  like(column: string, pattern: string): this {
    const regex = new RegExp(
      "^" + pattern.replace(/%/g, ".*").replace(/_/g, ".") + "$",
    );
    this.filters.push((row) => regex.test(String(getFieldCI(row, column) ?? "")));
    return this;
  }

  ilike(column: string, pattern: string): this {
    const regex = new RegExp(
      "^" + pattern.replace(/%/g, ".*").replace(/_/g, ".") + "$",
      "i",
    );
    this.filters.push((row) => regex.test(String(getFieldCI(row, column) ?? "")));
    return this;
  }

  is(column: string, value: any): this {
    this.filters.push((row) => {
      const v = getFieldCI(row, column);
      if (value === null) return v === null || v === undefined;
      return v === value;
    });
    return this;
  }

  in(column: string, values: any[]): this {
    const set = new Set(values);
    this.filters.push((row) => set.has(getFieldCI(row, column)));
    return this;
  }

  contains(column: string, value: any): this {
    this.filters.push((row) => {
      const field = getFieldCI(row, column);
      if (Array.isArray(field) && Array.isArray(value)) {
        return value.every((v) => field.includes(v));
      }
      return false;
    });
    return this;
  }

  not(column: string, operator: string, value: any): this {
    if (operator === "is") {
      this.filters.push((row) => {
        const v = getFieldCI(row, column);
        if (value === null) return v !== null && v !== undefined;
        return v !== value;
      });
    } else if (operator === "eq") {
      this.filters.push((row) => getFieldCI(row, column) !== value);
    } else if (operator === "in" && Array.isArray(value)) {
      const set = new Set(value);
      this.filters.push((row) => !set.has(getFieldCI(row, column)));
    }
    return this;
  }

  or(orFilterString: string): this {
    const clauses = orFilterString.split(",").map((c) => c.trim());
    this.filters.push((row) =>
      clauses.some((clause) => {
        const parts = clause.split(".");
        if (parts.length < 3) return true;
        const [col, op, ...rest] = parts;
        const valStr = rest.join(".");
        const rowVal = getFieldCI(row, col!);
        if (op === "eq") return String(rowVal) === valStr;
        if (op === "ilike") {
          const regex = new RegExp(
            "^" + valStr.replace(/%/g, ".*").replace(/_/g, ".") + "$",
            "i",
          );
          return regex.test(String(rowVal ?? ""));
        }
        return true;
      }),
    );
    return this;
  }

  order(
    column: string,
    options?: { ascending?: boolean; nullsFirst?: boolean },
  ): this {
    this.orderSpecs.push({
      column,
      ascending: options?.ascending ?? true,
    });
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  range(from: number, to: number): this {
    this.rangeSpec = { from, to };
    return this;
  }

  single(): this {
    this.singleMode = "single";
    return this;
  }

  maybeSingle(): this {
    this.singleMode = "maybeSingle";
    return this;
  }

  private normalizeInsertedRow(raw: Record<string, any>): Record<string, any> {
    const now = new Date().toISOString();
    const row: Record<string, any> = {
      id:
        raw.id ??
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : toDeterministicUuid(`row-${Date.now()}-${Math.random()}`)),
      created_at: raw.created_at ?? raw.created_At ?? now,
      created_At: raw.created_At ?? raw.created_at ?? now,
      ...structuredClone(raw),
    };
    return row;
  }

  private execute(): { data: any; error: any; count?: number | null } {
    const store = getLocalStore();
    const table = this.getTable(store);

    const matchesFilters = (row: Record<string, any>) =>
      this.filters.every((fn) => fn(row));

    let resultRows: Array<Record<string, any>> = [];

    if (this.operation === "select") {
      resultRows = table.filter(matchesFilters);
    } else if (this.operation === "insert") {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload];
      const inserted = items.map((item) => this.normalizeInsertedRow(item));
      table.push(...inserted);
      saveStoreToDisk(store);
      resultRows = inserted;
    } else if (this.operation === "upsert") {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload];
      const conflictCols = (this.upsertOptions?.onConflict || "id")
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const upserted: Array<Record<string, any>> = [];
      for (const item of items) {
        const existingIdx = table.findIndex((row) =>
          conflictCols.every((col) => {
            const a = getFieldCI(row, col);
            const b = getFieldCI(item, col);
            return a !== undefined && b !== undefined && a === b;
          }),
        );
        if (existingIdx >= 0) {
          const updated = {
            ...table[existingIdx],
            ...structuredClone(item),
            updated_at: new Date().toISOString(),
          };
          table[existingIdx] = updated;
          upserted.push(updated);
        } else {
          const created = this.normalizeInsertedRow(item);
          table.push(created);
          upserted.push(created);
        }
      }
      saveStoreToDisk(store);
      resultRows = upserted;
    } else if (this.operation === "update") {
      const updated: Array<Record<string, any>> = [];
      for (let i = 0; i < table.length; i++) {
        if (matchesFilters(table[i]!)) {
          table[i] = {
            ...table[i],
            ...structuredClone(this.payload),
            updated_at: new Date().toISOString(),
          };
          updated.push(table[i]!);
        }
      }
      saveStoreToDisk(store);
      resultRows = updated;
    } else if (this.operation === "delete") {
      const kept: Array<Record<string, any>> = [];
      const deleted: Array<Record<string, any>> = [];
      for (const row of table) {
        if (matchesFilters(row)) {
          deleted.push(row);
        } else {
          kept.push(row);
        }
      }
      this.setTable(store, kept);
      saveStoreToDisk(store);
      resultRows = deleted;
    }

    const totalMatchedCount = resultRows.length;

    // Apply ordering
    if (this.orderSpecs.length > 0) {
      resultRows = [...resultRows].sort((a, b) => {
        for (const spec of this.orderSpecs) {
          const va = getFieldCI(a, spec.column);
          const vb = getFieldCI(b, spec.column);
          if (va === vb) continue;
          if (va === undefined || va === null) return spec.ascending ? 1 : -1;
          if (vb === undefined || vb === null) return spec.ascending ? -1 : 1;
          const cmp = va < vb ? -1 : 1;
          return spec.ascending ? cmp : -cmp;
        }
        return 0;
      });
    }

    // Apply range / limit
    if (this.rangeSpec) {
      resultRows = resultRows.slice(
        this.rangeSpec.from,
        this.rangeSpec.to + 1,
      );
    } else if (typeof this.limitCount === "number") {
      resultRows = resultRows.slice(0, this.limitCount);
    }

    // Enrich joins
    const enriched = resultRows.map((r) =>
      enrichJoinedRow(this.tableName, r, this.selectColumns, store),
    );

    if (this.selectOptions?.head) {
      return {
        data: null,
        error: null,
        count: totalMatchedCount,
      };
    }

    if (this.singleMode === "single") {
      if (enriched.length === 0) {
        return {
          data: null,
          error: {
            message: `Row not found in ${this.tableName}`,
            code: "PGRST116",
          },
          count: 0,
        };
      }
      return {
        data: structuredClone(enriched[0]),
        error: null,
        count: totalMatchedCount,
      };
    }

    if (this.singleMode === "maybeSingle") {
      return {
        data: enriched.length > 0 ? structuredClone(enriched[0]) : null,
        error: null,
        count: totalMatchedCount,
      };
    }

    return {
      data: structuredClone(enriched),
      error: null,
      count: totalMatchedCount,
    };
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?:
      | ((value: { data: any; error: any; count?: number | null }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    try {
      const res = this.execute();
      return Promise.resolve(res).then(onfulfilled, onrejected);
    } catch (err) {
      return Promise.reject(err).then(onfulfilled, onrejected);
    }
  }
}

export function createLocalSupabaseClient(): any {
  const sessionObj = {
    access_token: "local-dev-access-token",
    refresh_token: "local-dev-refresh-token",
    expires_in: 86400 * 30,
    expires_at: Math.floor(Date.now() / 1000) + 86400 * 30,
    token_type: "bearer",
    user: DEFAULT_LOCAL_USER,
  };

  return {
    from(tableName: string) {
      return new LocalQueryBuilder(tableName);
    },
    rpc(fnName: string, _args?: Record<string, any>) {
      return Promise.resolve({ data: { ok: true, fn: fnName }, error: null });
    },
    storage: {
      from(bucket: string) {
        return {
          async upload(path: string, fileBody: any, options?: { contentType?: string }) {
            const store = getLocalStore();
            const key = `${bucket}/${path}`;
            try {
              if (typeof fileBody === "string") {
                store.storageBlobs[key] = fileBody;
              } else if (
                typeof Buffer !== "undefined" &&
                Buffer.isBuffer(fileBody)
              ) {
                const mime = options?.contentType || "audio/webm";
                store.storageBlobs[key] = `data:${mime};base64,${fileBody.toString("base64")}`;
              } else if (fileBody instanceof Uint8Array) {
                const mime = options?.contentType || "audio/webm";
                const b64 =
                  typeof Buffer !== "undefined"
                    ? Buffer.from(fileBody).toString("base64")
                    : "";
                store.storageBlobs[key] = `data:${mime};base64,${b64}`;
              } else {
                store.storageBlobs[key] = `data:audio/webm;base64,`;
              }
              saveStoreToDisk(store);
            } catch {
              // ignore
            }
            return {
              data: { path, id: key, fullPath: key },
              error: null,
            };
          },
          getPublicUrl(path: string) {
            const store = getLocalStore();
            const key = `${bucket}/${path}`;
            const dataUrl = store.storageBlobs[key];
            return {
              data: {
                publicUrl: dataUrl || `/api/local-storage/${bucket}/${path}`,
              },
            };
          },
          async createSignedUrl(path: string, _expiresIn: number) {
            const store = getLocalStore();
            const key = `${bucket}/${path}`;
            const dataUrl = store.storageBlobs[key];
            return {
              data: {
                signedUrl: dataUrl || `/api/local-storage/${bucket}/${path}`,
              },
              error: null,
            };
          },
          async download(path: string) {
            const store = getLocalStore();
            const key = `${bucket}/${path}`;
            const dataUrl = store.storageBlobs[key] || "";
            const base64Part = dataUrl.includes(",") ? dataUrl.split(",", 2)[1]! : "";
            const bytes =
              typeof Buffer !== "undefined" && base64Part
                ? Buffer.from(base64Part, "base64")
                : new Uint8Array(0);
            return {
              data: new Blob([bytes], { type: "audio/webm" }),
              error: null,
            };
          },
          async remove(paths: string[]) {
            const store = getLocalStore();
            for (const p of paths) {
              delete store.storageBlobs[`${bucket}/${p}`];
            }
            saveStoreToDisk(store);
            return { data: paths, error: null };
          },
        };
      },
    },
    auth: {
      async getUser(_jwt?: string) {
        return { data: { user: DEFAULT_LOCAL_USER }, error: null };
      },
      async getSession() {
        return { data: { session: sessionObj }, error: null };
      },
      async signInWithPassword({ email }: { email: string; password?: string }) {
        const store = getLocalStore();
        let found = store.users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase(),
        );
        if (!found) {
          found = {
            ...structuredClone(DEFAULT_LOCAL_USER),
            email,
            user_metadata: {
              ...DEFAULT_LOCAL_USER.user_metadata,
              full_name: email.split("@")[0] || "Student",
            },
          };
          store.users.push(found);
        }
        return {
          data: {
            user: found,
            session: { ...sessionObj, user: found },
          },
          error: null,
        };
      },
      async signUp({
        email,
        options,
      }: {
        email: string;
        password?: string;
        options?: { data?: Record<string, any> };
      }) {
        const store = getLocalStore();
        const newUser = {
          ...structuredClone(DEFAULT_LOCAL_USER),
          id:
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : toDeterministicUuid(`user-${email}-${Date.now()}`),
          email,
          user_metadata: {
            ...DEFAULT_LOCAL_USER.user_metadata,
            ...(options?.data || {}),
          },
        };
        store.users.push(newUser);
        store.tables.profiles!.push({
          id: newUser.id,
          email: newUser.email,
          full_name: options?.data?.full_name || email.split("@")[0] || "Student",
          role: options?.data?.role || "student",
          membership_tier: "member",
          onboarded: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        store.tables.user_roles!.push({
          id: toDeterministicUuid(`role-${newUser.id}`),
          user_id: newUser.id,
          role: options?.data?.role || "student",
          created_at: new Date().toISOString(),
        });
        saveStoreToDisk(store);
        return {
          data: {
            user: newUser,
            session: { ...sessionObj, user: newUser },
          },
          error: null,
        };
      },
      async signOut() {
        return { error: null };
      },
      async signInWithOAuth() {
        return { data: { provider: "google", url: "/test" }, error: null };
      },
      async signInWithOtp() {
        return { data: { user: null, session: null }, error: null };
      },
      onAuthStateChange(callback: (event: string, session: any) => void) {
        if (typeof window !== "undefined") {
          setTimeout(() => {
            try {
              callback("INITIAL_SESSION", sessionObj);
            } catch {
              // ignore
            }
          }, 0);
        }
        return {
          data: {
            subscription: {
              unsubscribe: () => {},
            },
          },
        };
      },
      admin: {
        async listUsers() {
          const store = getLocalStore();
          return { data: { users: store.users }, error: null };
        },
        async getUserById(uid: string) {
          const store = getLocalStore();
          const u =
            store.users.find((user) => user.id === uid) || DEFAULT_LOCAL_USER;
          return { data: { user: u }, error: null };
        },
        async createUser(attrs: Record<string, any>) {
          const store = getLocalStore();
          const created = {
            ...structuredClone(DEFAULT_LOCAL_USER),
            id:
              typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : toDeterministicUuid(`admin-created-${Date.now()}`),
            email: attrs.email || "user@midnight.academy",
            user_metadata: {
              ...DEFAULT_LOCAL_USER.user_metadata,
              ...(attrs.user_metadata || {}),
            },
          };
          store.users.push(created);
          saveStoreToDisk(store);
          return { data: { user: created }, error: null };
        },
        async updateUserById(uid: string, attrs: Record<string, any>) {
          const store = getLocalStore();
          const idx = store.users.findIndex((u) => u.id === uid);
          if (idx >= 0) {
            store.users[idx] = {
              ...store.users[idx]!,
              ...attrs,
              user_metadata: {
                ...store.users[idx]!.user_metadata,
                ...(attrs.user_metadata || {}),
              },
            };
            saveStoreToDisk(store);
            return { data: { user: store.users[idx] }, error: null };
          }
          return { data: { user: DEFAULT_LOCAL_USER }, error: null };
        },
      },
    },
  };
}
