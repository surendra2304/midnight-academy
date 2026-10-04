import { describe, it, expect } from "vitest";
import { createLocalSupabaseClient } from "../src/integrations/supabase/local-db";
import { attemptSessionService } from "../src/lib/tests/session-service.server";
import { ALL_TESTGLIDER_BLUEPRINTS } from "../src/data/testglider-2026-catalog";
import { sentenceScoringService } from "../src/lib/scoring/sentence-scoring";
import { evaluationService } from "../src/lib/evaluation/evaluation-service.server";
import { speakingEvaluationService } from "../src/lib/evaluation/speaking-evaluation.server";
import { z } from "zod";

const uuidSchema = z.string().uuid();

describe("TestGlider 2026 Complete Mock Tests & Evaluation Pipeline", () => {
  it("seeds all 8 complete TestGlider 2026 mock tests with valid UUIDs and 4 sections each", async () => {
    expect(ALL_TESTGLIDER_BLUEPRINTS).toHaveLength(8);

    const supabase = createLocalSupabaseClient();
    const { data: versions, error } = await supabase
      .from("test_versions")
      .select(
        "id, test_id, status, tests(id, name, category, difficulty, code, question_count), sections(id, section_type, section_order, timing_seconds)",
      )
      .eq("status", "published");

    expect(error).toBeNull();
    expect(versions).toBeDefined();
    expect(versions!.length).toBeGreaterThanOrEqual(8);

    for (const v of versions!) {
      expect(uuidSchema.safeParse(v.id).success).toBe(true);
      const testObj = v.tests as unknown as { id: string; name: string; question_count: number };
      expect(testObj).toBeTruthy();
      expect(testObj.question_count).toBeGreaterThanOrEqual(30);
      const secs = v.sections as unknown as Array<{ id: string; section_type: string }>;
      expect(secs).toHaveLength(4);
      expect(secs.map((s) => s.section_type).sort()).toEqual([
        "listening",
        "reading",
        "speaking",
        "writing",
      ]);
    }

    // Verify all content_items have RFC 4122 v4 UUIDs so Zod .uuid() validators accept them
    const { data: items } = await supabase.from("content_items").select("id, item_type, payload");
    expect(items).toBeDefined();
    expect(items!.length).toBeGreaterThanOrEqual(300);
    for (const item of items!) {
      expect(uuidSchema.safeParse(item.id).success).toBe(true);
    }
  });

  it("scores Build a Sentence multi-word JSON array sequences accurately", () => {
    const res1 = sentenceScoringService.scoreResponse(
      JSON.stringify(["Do you know", "how long", "the intermission", "is"]),
      {
        acceptedSequences: [["Do you know", "how long", "the intermission", "is?"]],
        wordBank: ["Do you know", "how long", "the intermission", "is"],
      },
    );
    expect(res1.isCorrect).toBe(true);
    expect(res1.score).toBe(1);

    const res2 = sentenceScoringService.scoreResponse(
      JSON.stringify([
        "The library",
        "that has",
        "private study rooms",
        "is the best",
      ]),
      {
        acceptedSequences: [["The library that has private study rooms is the best."]],
      },
    );
    expect(res2.isCorrect).toBe(true);
    expect(res2.score).toBe(1);
  });

  it("evaluates Writing and Speaking responses with calibrated TOEFL 2026 rubric when Gemini API key is absent", async () => {
    const writingEval = await evaluationService.evaluateWriting({
      taskType: "academic_discussion",
      promptText: "Should governments apply sin taxes to sugary drinks and fast food?",
      studentResponse:
        "In my opinion, I strongly support applying sin taxes to unhealthy food items. For example, sugary beverages and ultra-processed fast food contribute directly to rising rates of diabetes and cardiovascular disease. Furthermore, revenue generated from these taxes can fund subsidies for fresh produce in underserved neighborhoods. Therefore, sin taxes create both a financial disincentive and a sustainable public health resource.",
    });

    expect(writingEval.score_band).toBeGreaterThanOrEqual(4.0);
    expect(writingEval.score_band).toBeLessThanOrEqual(6.0);
    expect(writingEval.traits.task_fulfillment).toBeGreaterThanOrEqual(3.5);
    expect(writingEval.strengths.length).toBeGreaterThan(0);
    expect(writingEval.improved_response.length).toBeGreaterThan(30);

    const speakingEval = await speakingEvaluationService.evaluateSpeaking({
      taskType: "listen_repeat",
      promptText: "Measure each piece carefully before you cut.",
      targetSentence: "Measure each piece carefully before you cut.",
      transcript: "Measure each piece carefully before you cut.",
      durationSeconds: 7,
    });

    expect(speakingEval.score_band).toBeGreaterThanOrEqual(5.5);
    expect(speakingEval.traits.delivery).toBeGreaterThanOrEqual(5.5);
  });

  it("runs a complete TestGlider attempt end-to-end (start -> answer -> finalize -> AI evaluation -> score report)", async () => {
    const supabase = createLocalSupabaseClient();
    const studentId = "00000000-0000-4000-8000-000000000001";
    const moonVersionId = ALL_TESTGLIDER_BLUEPRINTS[0].id;

    // Start single-section Reading attempt on Moon
    const { blueprint, snapshot } = await attemptSessionService.startAttempt({
      studentId,
      testVersionId: moonVersionId,
      examMode: "section",
      sectionTypeFilter: "reading",
      allowRetake: true,
    });

    expect(snapshot.attemptId).toBeTruthy();
    expect(blueprint.sections).toHaveLength(1);
    const readingItems = blueprint.sections[0].items;
    expect(readingItems.length).toBeGreaterThan(0);

    // Answer the first item (Complete the Words cloze) with the official answers
    const firstItem = readingItems[0];
    const blanks = (firstItem.payload.blanks as Array<{ answer: string }>) || [];
    const correctTokens = blanks.map((b) => b.answer);

    const saveRes = await attemptSessionService.saveResponse({
      attemptId: snapshot.attemptId,
      studentId,
      contentItemId: firstItem.id,
      rawAnswer: JSON.stringify(correctTokens),
      timeSpentMs: 12000,
    });
    expect(saveRes.responseId).toBeTruthy();

    // Finalize attempt -> runs mockEvaluationPipelineService
    const finRes = await attemptSessionService.finalizeAttempt(snapshot.attemptId, studentId);
    expect(finRes.status).toBe("evaluated");

    // Verify score_reports and responses were persisted
    const { data: report } = await supabase
      .from("score_reports")
      .select("*")
      .eq("attempt_id", snapshot.attemptId)
      .maybeSingle();
    expect(report).toBeTruthy();
    expect(report!.overall_band).toBeGreaterThanOrEqual(1.0);
    expect(report!.reading_band).toBeGreaterThanOrEqual(1.0);

    const { data: attemptSec } = await supabase
      .from("attempt_sections")
      .select("id")
      .eq("attempt_id", snapshot.attemptId);
    const secIds = (attemptSec ?? []).map((s: any) => s.id);

    const { data: responses } = await supabase
      .from("responses")
      .select("id, is_correct, score, content_item_id, content_items(id, section_type, item_type)")
      .in("attempt_section_id", secIds);
    expect(responses).toBeTruthy();
    expect(responses!.length).toBeGreaterThanOrEqual(readingItems.length);

    const clozeResp = responses!.find((r: any) => r.content_item_id === firstItem.id);
    expect(clozeResp).toBeTruthy();
    expect(clozeResp!.is_correct).toBe(true);
    expect(clozeResp!.score).toBe(1);
  });
});
