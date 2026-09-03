/**
 * End-to-End Orchestrated Evaluation Pipeline Service (Server-Only)
 * Pipeline: Finalize -> Deterministic Scoring (Reading, Listening, Build Sentence)
 *           -> Audio Transcription (Speaking)
 *           -> AI Evaluation (Writing & Speaking)
 *           -> Score Report Aggregation & Persistence.
 *
 * Never fabricates AI scores on failure.
 */

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { readingScoringService } from "@/lib/scoring/reading-scoring";
import { sentenceScoringService } from "@/lib/scoring/sentence-scoring";
import { evaluationService } from "@/lib/evaluation/evaluation-service.server";
import { speakingEvaluationService } from "@/lib/evaluation/speaking-evaluation.server";
import { speechToTextProvider } from "@/lib/speaking/transcription-service.server";
import { bandToComparable120 } from "@/types/toefl";
import type { ToeflItemType, ToeflSectionType } from "@/types/toefl";

export interface SectionScoreSummary {
  sectionType: ToeflSectionType;
  rawScore: number;
  maxScore: number;
  bandScore: number; // 1.0 - 6.0 in half-point increments
}

export class MockEvaluationPipelineService {
  async processAttemptEvaluation(attemptId: string) {
    console.log(`[EvaluationPipeline] Starting evaluation for attempt: ${attemptId}`);

    // 1. Fetch Attempt & Student Info
    const { data: attempt, error: aErr } = await supabaseAdmin
      .from("attempts")
      .select(
        "id, test_id, test_version_id, student_id, exam_mode, selected_section_type, tests(name)",
      )
      .eq("id", attemptId)
      .single();

    if (aErr || !attempt) {
      throw new Error(`Attempt ${attemptId} not found`);
    }

    // 2. Fetch all attempt_sections and responses
    const { data: attemptSections, error: secErr } = await supabaseAdmin
      .from("attempt_sections")
      .select("id, section_id, status, sections(id, section_type, section_order)")
      .eq("attempt_id", attemptId);

    if (secErr || !attemptSections || attemptSections.length === 0) {
      throw new Error(`Attempt ${attemptId} has no sections to evaluate.`);
    }

    const attemptSecIds = attemptSections.map((s) => s.id);

    const { data: responses, error: respErr } = await supabaseAdmin
      .from("responses")
      .select(
        "id, attempt_section_id, content_item_id, student_id, raw_answer, normalized_answer, content_items(id, section_type, item_type, difficulty, payload)",
      )
      .in("attempt_section_id", attemptSecIds);

    if (respErr) {
      throw new Error(`Failed to load attempt responses: ${respErr.message}`);
    }

    const contentItemIds = (responses ?? []).map((r) => r.content_item_id);

    const { data: allOptions } = await supabaseAdmin
      .from("question_options")
      .select("id, content_item_id, option_key, option_text, is_correct, distractor_rationale")
      .in(
        "content_item_id",
        contentItemIds.length > 0 ? contentItemIds : ["00000000-0000-0000-0000-000000000000"],
      );

    const optionsByItem = new Map<string, typeof allOptions>();
    for (const opt of allOptions ?? []) {
      const list = optionsByItem.get(opt.content_item_id) ?? [];
      list.push(opt);
      optionsByItem.set(opt.content_item_id, list);
    }

    // 3. Process Item by Item
    const sectionSummaries: Record<ToeflSectionType, SectionScoreSummary> = {
      reading: { sectionType: "reading", rawScore: 0, maxScore: 0, bandScore: 1.0 },
      listening: { sectionType: "listening", rawScore: 0, maxScore: 0, bandScore: 1.0 },
      writing: { sectionType: "writing", rawScore: 0, maxScore: 0, bandScore: 1.0 },
      speaking: { sectionType: "speaking", rawScore: 0, maxScore: 0, bandScore: 1.0 },
    };

    const sectionBands: Record<ToeflSectionType, number[]> = {
      reading: [],
      listening: [],
      writing: [],
      speaking: [],
    };

    for (const resp of responses ?? []) {
      const rawItem = (
        resp as unknown as {
          content_items: {
            id: string;
            section_type: ToeflSectionType;
            item_type: ToeflItemType;
            payload: Record<string, unknown>;
          };
        }
      ).content_items;

      if (!rawItem) continue;

      const itemType = rawItem.item_type;
      const secType = rawItem.section_type;
      const itemOpts = optionsByItem.get(rawItem.id) ?? [];
      const normAnswer = (resp.normalized_answer as Record<string, unknown>) ?? {};

      // A. Deterministic Reading & Listening Items
      if (
        itemType === "read_daily_life" ||
        itemType === "read_academic" ||
        itemType === "complete_words" ||
        itemType === "listen_choose_response" ||
        itemType === "listen_conversation" ||
        itemType === "listen_announcement" ||
        itemType === "listen_academic_talk"
      ) {
        const itemPayload = (rawItem.payload as Record<string, unknown>) ?? {};
        const scoreRes = readingScoringService.scoreItem(resp.raw_answer, {
          itemType,
          options: itemOpts.map((o) => ({
            optionKey: o.option_key,
            optionText: o.option_text,
            isCorrect: o.is_correct,
            distractorRationale: o.distractor_rationale,
          })),
          blanks: (itemPayload["blanks"] as any[]) ?? undefined,
          acceptedAnswers: (itemPayload["acceptedAnswers"] as string[]) ?? undefined,
        });

        await supabaseAdmin
          .from("responses")
          .update({
            is_correct: scoreRes.isCorrect,
            score: scoreRes.score,
          })
          .eq("id", resp.id);

        sectionSummaries[secType].rawScore += scoreRes.earnedPoints;
        sectionSummaries[secType].maxScore += scoreRes.maxPoints;
      }
      // B. Build Sentence (Writing Deterministic)
      else if (itemType === "build_sentence") {
        const itemPayload = rawItem.payload ?? {};
        const sentScore = sentenceScoringService.scoreResponse(resp.raw_answer, {
          acceptedSequences: (itemPayload["acceptedSequences"] as string[][]) ?? [
            (itemPayload["wordBank"] as string[]) ?? [],
          ],
          wordBank: (itemPayload["wordBank"] as string[]) ?? [],
        });

        await supabaseAdmin
          .from("responses")
          .update({
            is_correct: sentScore.isCorrect,
            score: sentScore.score,
          })
          .eq("id", resp.id);

        sectionSummaries[secType].rawScore += sentScore.earnedPoints;
        sectionSummaries[secType].maxScore += sentScore.maxPoints;
        sectionBands[secType].push(sentScore.isCorrect ? 6.0 : 1.0);
      }
      // C. AI-Evaluated Writing Tasks (Write an Email, Academic Discussion)
      else if (itemType === "write_email" || itemType === "academic_discussion") {
        const itemPayload = rawItem.payload ?? {};
        const evalResult = await evaluationService.evaluateWriting({
          taskType: itemType,
          promptText: (itemPayload["prompt"] as string) ?? (itemPayload["title"] as string) ?? "",
          contextData: itemPayload,
          studentResponse: resp.raw_answer ?? "",
          referenceModelAnswer: itemPayload["modelAnswer"] as string | undefined,
        });

        await supabaseAdmin.from("evaluations").insert({
          response_id: resp.id,
          score_band: evalResult.score_band,
          task_score: evalResult.task_score,
          traits: evalResult.traits,
          strengths: evalResult.strengths,
          issues: evalResult.issues,
          corrections: evalResult.corrections,
          next_actions: evalResult.next_actions,
          confidence: evalResult.confidence,
          rubric_version: evalResult.rubric_version,
          model_id: evalResult.model,
        });

        await supabaseAdmin
          .from("responses")
          .update({ score: evalResult.task_score / 100 })
          .eq("id", resp.id);

        sectionBands[secType].push(evalResult.score_band);
      }
      // D. AI-Evaluated Speaking Tasks (Listen & Repeat, Interview)
      else if (itemType === "listen_repeat" || itemType === "take_interview") {
        const itemPayload = rawItem.payload ?? {};

        // Obtain real audio and transcribe
        let transcript = "";
        const storagePath = normAnswer.storagePath as string | undefined;
        let audioBase64 = normAnswer.audioBase64 as string | undefined;

        if (storagePath) {
          try {
            const { data: fileData, error: dlErr } = await supabaseAdmin.storage
              .from("speaking-recordings")
              .download(storagePath);

            if (!dlErr && fileData) {
              const arrayBuffer = await fileData.arrayBuffer();
              audioBase64 = Buffer.from(arrayBuffer).toString("base64");
            }
          } catch (dlErr) {
            console.warn(`Could not download audio from storage path ${storagePath}:`, dlErr);
          }
        }

        if (audioBase64) {
          try {
            const trResult = await speechToTextProvider.transcribe({
              audioBase64,
              mimeType: (normAnswer.mimeType as string) ?? "audio/webm",
              taskType: itemType,
            });
            transcript = trResult.transcript;
          } catch (trErr) {
            console.error(`Transcription failed for response ${resp.id}:`, trErr);
            throw new Error(
              `Speaking transcription failed: ${(trErr as Error)?.message || "Audio processing error"}`,
            );
          }
        } else if (
          resp.raw_answer &&
          !resp.raw_answer.startsWith("recorded-audio-") &&
          !resp.raw_answer.includes("/")
        ) {
          // If raw_answer is actual user text (e.g. mock or text input)
          transcript = resp.raw_answer;
        }

        const evalResult = await speakingEvaluationService.evaluateSpeaking({
          taskType: itemType,
          promptText:
            (itemPayload["prompt"] as string) ?? (itemPayload["questionText"] as string) ?? "",
          transcript,
          audioDurationSeconds: (normAnswer.durationSeconds as number) ?? undefined,
          referenceModelAnswer: itemPayload["modelAnswer"] as string | undefined,
        });

        await supabaseAdmin.from("evaluations").insert({
          response_id: resp.id,
          score_band: evalResult.score_band,
          task_score: evalResult.task_score,
          traits: evalResult.traits,
          strengths: evalResult.strengths,
          issues: evalResult.issues,
          corrections: evalResult.corrections,
          next_actions: evalResult.next_actions,
          confidence: evalResult.confidence,
          rubric_version: evalResult.rubric_version,
          model_id: evalResult.model,
        });

        await supabaseAdmin
          .from("responses")
          .update({ score: evalResult.task_score / 100 })
          .eq("id", resp.id);

        sectionBands[secType].push(evalResult.score_band);
      }
    }

    // 4. Compute 1.0 - 6.0 Band Scores per Section
    const rdRatio =
      sectionSummaries.reading.maxScore > 0
        ? sectionSummaries.reading.rawScore / sectionSummaries.reading.maxScore
        : 0;
    sectionSummaries.reading.bandScore = Math.max(
      1.0,
      Math.min(6.0, Math.round((1.0 + rdRatio * 5.0) * 2) / 2),
    );

    const lsRatio =
      sectionSummaries.listening.maxScore > 0
        ? sectionSummaries.listening.rawScore / sectionSummaries.listening.maxScore
        : 0;
    sectionSummaries.listening.bandScore = Math.max(
      1.0,
      Math.min(6.0, Math.round((1.0 + lsRatio * 5.0) * 2) / 2),
    );

    const wrBands = sectionBands.writing;
    sectionSummaries.writing.bandScore =
      wrBands.length > 0
        ? Math.round((wrBands.reduce((a, b) => a + b, 0) / wrBands.length) * 2) / 2
        : 1.0;

    const spBands = sectionBands.speaking;
    sectionSummaries.speaking.bandScore =
      spBands.length > 0
        ? Math.round((spBands.reduce((a, b) => a + b, 0) / spBands.length) * 2) / 2
        : 1.0;

    // 5. Update attempt_sections with scores
    for (const sec of attemptSections) {
      const secType = (sec.sections as { section_type: ToeflSectionType } | null)?.section_type;
      if (!secType) continue;

      const summary = sectionSummaries[secType];
      await supabaseAdmin
        .from("attempt_sections")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          raw_score: summary.rawScore,
          section_band: summary.bandScore,
        })
        .eq("id", sec.id);
    }

    // 6. Overall Band and 0-120 Comparison Score
    const activeSectionTypes = attemptSections
      .map((s) => (s.sections as { section_type: ToeflSectionType } | null)?.section_type)
      .filter((t): t is ToeflSectionType => Boolean(t));

    const activeBands = activeSectionTypes.map((t) => sectionSummaries[t].bandScore);
    const overallBand =
      activeBands.length > 0
        ? Math.round((activeBands.reduce((a, b) => a + b, 0) / activeBands.length) * 2) / 2
        : 1.0;

    const comparableScore = bandToComparable120(overallBand);

    // 7. Upsert Score Report
    await supabaseAdmin.from("score_reports").upsert(
      {
        attempt_id: attemptId,
        student_id: attempt.student_id,
        overall_band: overallBand,
        reading_band: sectionSummaries.reading.bandScore,
        listening_band: sectionSummaries.listening.bandScore,
        writing_band: sectionSummaries.writing.bandScore,
        speaking_band: sectionSummaries.speaking.bandScore,
        comparable_score: comparableScore,
        target_score: 5.0,
        target_gap: Math.max(0, 5.0 - overallBand),
        summary: `Assessment finalized. Overall Band: ${overallBand.toFixed(1)} / 6.0 (Estimated 0-120 TOEFL Score: ${comparableScore}).`,
        skill_breakdown: JSON.parse(
          JSON.stringify({
            reading: sectionSummaries.reading,
            listening: sectionSummaries.listening,
            writing: sectionSummaries.writing,
            speaking: sectionSummaries.speaking,
          }),
        ),
        generated_at: new Date().toISOString(),
      },
      { onConflict: "attempt_id" },
    );

    // 8. Update Attempt to Evaluated and Completed
    const { error: upErr } = await supabaseAdmin
      .from("attempts")
      .update({
        status: "evaluated",
        evaluation_status: "completed",
        score: Math.round(comparableScore),
        completed_at: new Date().toISOString(),
      })
      .eq("id", attemptId);

    if (upErr) {
      console.error("[EvaluationPipeline] Failed to update attempt to evaluated:", upErr);
      throw new Error(`Failed to update attempt to evaluated: ${upErr.message}`);
    }

    console.log(
      `[EvaluationPipeline] Attempt ${attemptId} successfully evaluated. Overall: ${overallBand}`,
    );
  }
}

export const mockEvaluationPipelineService = new MockEvaluationPipelineService();
