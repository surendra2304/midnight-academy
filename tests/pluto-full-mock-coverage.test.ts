/**
 * Regression coverage for the Pluto full mock (Test 9) added to the
 * original content bank. Verifies catalog registration, section coverage,
 * answer-key well-formedness for every task type, and that Pluto content
 * flows through the real attempt + evaluation pipeline. All content is
 * authored in-repo; nothing here reproduces third-party test material.
 */
import { describe, it, expect } from "vitest";
import { z } from "zod";
import { createLocalSupabaseClient } from "../src/integrations/supabase/local-db";
import { attemptSessionService } from "../src/lib/tests/session-service.server";
import {
  ALL_TESTGLIDER_BLUEPRINTS,
  ALL_TESTGLIDER_QUESTION_ITEMS,
} from "../src/data/testglider-2026-catalog";
import { PLUTO_BLUEPRINT, PLUTO_BLUEPRINT_ID, PLUTO_ITEMS } from "../src/data/tests/test-9-pluto";

const uuidSchema = z.string().uuid();

const SCORED_TASK_TYPES = new Set([
  // Deterministic reading/listening + writing (mock-pipeline branch A/B)
  "read_daily_life",
  "read_academic",
  "complete_words",
  "listen_choose_response",
  "listen_conversation",
  "listen_announcement",
  "listen_academic_talk",
  "build_sentence",
  // AI-evaluated writing (branch C) and speaking (branch D)
  "write_email",
  "academic_discussion",
  "listen_repeat",
  "take_interview",
]);

const optionsSchema = z.object({
  id: z.enum(["A", "B", "C", "D"]),
  text: z.string().min(1),
});

describe("Pluto full mock — catalog registration", () => {
  it("is published in the catalog with a unique slug and id", () => {
    expect(ALL_TESTGLIDER_BLUEPRINTS).toHaveLength(9);
    expect(ALL_TESTGLIDER_BLUEPRINTS.map((b) => b.id)).toContain(PLUTO_BLUEPRINT_ID);
    expect(PLUTO_BLUEPRINT.is_Published).toBe(true);
    const slugs = ALL_TESTGLIDER_BLUEPRINTS.map((b) => b.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(uuidSchema.safeParse(PLUTO_BLUEPRINT_ID).success).toBe(true);
  });

  it("declares four timed sections whose item counts match the bank", () => {
    const sections = PLUTO_BLUEPRINT.blueprint_Json.sections;
    expect(sections.map((s) => s.section)).toEqual(["reading", "listening", "writing", "speaking"]);
    const total = sections.reduce((sum, s) => sum + s.questionCount, 0);
    expect(total).toBe(PLUTO_ITEMS.length);
    expect(PLUTO_ITEMS.length).toBeGreaterThanOrEqual(50);
    expect(PLUTO_BLUEPRINT.total_Duration_Seconds).toBe(
      sections.reduce((sum, s) => sum + s.durationSeconds, 0),
    );
  });

  it("has globally unique item ids and every item belongs to the Pluto blueprint", () => {
    const allIds = ALL_TESTGLIDER_QUESTION_ITEMS.map((i) => i.id);
    expect(new Set(allIds).size).toBe(allIds.length);
    for (const item of PLUTO_ITEMS) {
      expect(item.blueprint_Id).toBe(PLUTO_BLUEPRINT_ID);
      expect(uuidSchema.safeParse(item.id).success).toBe(true);
    }
  });
});

describe("Pluto full mock — content & answer-key contracts", () => {
  it("covers all four sections with task types the evaluation pipeline can score", () => {
    const bySection = new Map<string, number>();
    for (const item of PLUTO_ITEMS) {
      bySection.set(item.section, (bySection.get(item.section) ?? 0) + 1);
      expect(SCORED_TASK_TYPES.has(item.task_Type)).toBe(true);
    }
    expect([...bySection.keys()].sort()).toEqual(["listening", "reading", "speaking", "writing"]);
    expect(bySection.get("reading")).toBeGreaterThanOrEqual(10);
    expect(bySection.get("listening")).toBeGreaterThanOrEqual(10);
    expect(bySection.get("writing")).toBeGreaterThanOrEqual(10);
    expect(bySection.get("speaking")).toBeGreaterThanOrEqual(10);
  });

  it("every multiple-choice item exposes four unique options keyed to a valid correct id", () => {
    const mcqTypes = new Set([
      "read_daily_life",
      "read_academic",
      "listen_choose_response",
      "listen_conversation",
      "listen_announcement",
      "listen_academic_talk",
    ]);
    let count = 0;
    for (const item of PLUTO_ITEMS) {
      if (!mcqTypes.has(item.task_Type)) continue;
      count++;
      const options = z.array(optionsSchema).parse(item.prompt_Json["options"]);
      expect(options).toHaveLength(4);
      expect(new Set(options.map((o) => o.text)).size).toBe(4);
      const correct = item.answer_Key_Json["correctOptionId"];
      expect(["A", "B", "C", "D"]).toContain(correct);
      expect(typeof item.answer_Key_Json["explanation"]).toBe("string");
    }
    expect(count).toBeGreaterThanOrEqual(25);
  });

  it("complete-words items align passage placeholders, blanks, and accepted answers", () => {
    const clozes = PLUTO_ITEMS.filter((item) => item.task_Type === "complete_words");
    expect(clozes.length).toBeGreaterThanOrEqual(2);
    for (const item of clozes) {
      const blanks = item.prompt_Json["blanks"] as Array<Record<string, unknown>>;
      const placeholderCount =
        (item.prompt_Json["passage"] as string).match(/\[\d+\]/g)?.length ?? 0;
      expect(blanks.length).toBeGreaterThanOrEqual(10);
      expect(placeholderCount).toBeGreaterThanOrEqual(blanks.length);
      const keyed = item.answer_Key_Json["blanks"] as Array<Record<string, unknown>>;
      const correctAnswers = item.answer_Key_Json["correctAnswers"] as string[];
      expect(keyed).toHaveLength(blanks.length);
      expect(correctAnswers).toHaveLength(blanks.length);
      for (const key of keyed) {
        const accepted = key["acceptedAnswers"] as string[];
        expect(accepted.length).toBeGreaterThanOrEqual(1);
        expect(accepted[0]!.length).toBeGreaterThanOrEqual(2);
      }
      expect(item.points_Value).toBe(blanks.length);
    }
  });

  it("build-a-sentence word banks can reconstruct the target sentence", () => {
    const sentences = PLUTO_ITEMS.filter((item) => item.task_Type === "build_sentence");
    expect(sentences).toHaveLength(10);
    for (const item of sentences) {
      const wordBank = item.prompt_Json["wordBank"] as string[];
      const ordered = item.answer_Key_Json["orderedChips"] as string[];
      expect(ordered.length).toBeGreaterThanOrEqual(5);
      // Every chip in the accepted sequence must come from the bank.
      for (const chip of ordered) expect(wordBank).toContain(chip);
      const target = item.answer_Key_Json["targetSentence"] as string;
      expect(ordered.join(" ").toLowerCase()).toBe(
        target
          .trim()
          .replace(/[.?!]+$/, "")
          .trim()
          .toLowerCase(),
      );
    }
  });

  it("constructed-response items ship rubric-compatible keys (no unscorable task)", () => {
    for (const item of PLUTO_ITEMS) {
      if (item.task_Type === "write_email" || item.task_Type === "academic_discussion") {
        const sample = item.answer_Key_Json["sampleHighScoringResponse"] as string;
        expect(sample.length).toBeGreaterThan(150);
        expect(item.prompt_Json["prompt"]).toContain("•");
      }
      if (item.task_Type === "listen_repeat" || item.task_Type === "take_interview") {
        const phrases = item.answer_Key_Json["expectedKeyPhrases"] as string[];
        expect(phrases.length).toBeGreaterThanOrEqual(1);
        expect(
          item.prompt_Json["responseLimitSeconds"] ?? item.prompt_Json["responseSecondsPerTurn"],
        ).toBeGreaterThan(0);
      }
    }
  });
});

describe("Pluto full mock — end-to-end through the real pipeline", () => {
  it("seeds into the local db and scores a full listening attempt with a generated report", async () => {
    const supabase = createLocalSupabaseClient();
    const { data: seeded } = await supabase
      .from("test_blueprints")
      .select("id, title")
      .eq("id", PLUTO_BLUEPRINT_ID)
      .maybeSingle();
    expect(seeded?.title).toBe("Pluto | Full Test");

    const studentId = "00000000-0000-4000-8000-000000000001";
    const { blueprint, snapshot } = await attemptSessionService.startAttempt({
      studentId,
      testVersionId: PLUTO_BLUEPRINT_ID,
      examMode: "section",
      sectionTypeFilter: "listening",
      allowRetake: true,
    });
    expect(blueprint.sections).toHaveLength(1);
    const items = blueprint.sections[0].items;
    expect(items.length).toBe(16);

    for (const item of items) {
      const seed = ALL_TESTGLIDER_QUESTION_ITEMS.find((row) => row.id === item.id);
      const correct = seed?.answer_Key_Json["correctOptionId"] as string | undefined;
      expect(correct).toBeTruthy();
      await attemptSessionService.saveResponse({
        attemptId: snapshot.attemptId,
        studentId,
        contentItemId: item.id,
        // Reading-scoring treats the trimmed raw answer itself as the option key.
        rawAnswer: correct!,
        timeSpentMs: 5000,
      });
    }

    const finRes = await attemptSessionService.finalizeAttempt(snapshot.attemptId, studentId);
    expect(finRes.status).toBe("evaluated");

    const { data: report } = await supabase
      .from("score_reports")
      .select("*")
      .eq("attempt_id", snapshot.attemptId)
      .maybeSingle();
    expect(report).toBeTruthy();
    expect(report!.listening_band).toBeGreaterThanOrEqual(1.0);

    const { data: attemptSec } = await supabase
      .from("attempt_sections")
      .select("id")
      .eq("attempt_id", snapshot.attemptId);
    const secIds = (attemptSec ?? []).map((section) => section.id);
    const { data: responses } = await supabase
      .from("responses")
      .select("is_correct, score")
      .in("attempt_section_id", secIds);
    expect(responses).toHaveLength(items.length);
    for (const response of responses!) {
      expect(response.is_correct).toBe(true);
      expect(response.score).toBe(1);
    }
  });
});
