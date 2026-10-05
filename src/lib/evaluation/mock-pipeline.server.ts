/**
 * End-to-End Orchestrated Evaluation Pipeline Service (Server-Only)
 * Pipeline: Finalize -> Ensure All Section Items Have Response Rows
 *           -> Deterministic Scoring (Reading, Listening, Build Sentence)
 *           -> Audio Transcription (Speaking)
 *           -> AI / Rubric Evaluation (Writing & Speaking)
 *           -> Score Report Aggregation & Persistence.
 */

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";
import { readingScoringService } from "@/lib/scoring/reading-scoring";
import { sentenceScoringService } from "@/lib/scoring/sentence-scoring";
import { evaluationService } from "@/lib/evaluation/evaluation-service.server";
import { speakingEvaluationService } from "@/lib/evaluation/speaking-evaluation.server";
import { speechToTextProvider } from "@/lib/speaking/transcription-service.server";
import { bandToComparable120 } from "@/types/toefl";
import { hasFullToeflSectionCoverage } from "./score-coverage";
import type { ToeflItemType, ToeflSectionType } from "@/types/toefl";

export interface SectionScoreSummary {
  sectionType: ToeflSectionType;
  rawScore: number;
  maxScore: number;
  bandScore: number | null; // null means this section could not be scored
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

    // 2. Fetch all attempt_sections
    const { data: attemptSections, error: secErr } = await supabaseAdmin
      .from("attempt_sections")
      .select("id, section_id, status, sections(id, section_type, section_order)")
      .eq("attempt_id", attemptId);

    if (secErr || !attemptSections || attemptSections.length === 0) {
      throw new Error(`Attempt ${attemptId} has no sections to evaluate.`);
    }

    const attemptSecIds = attemptSections.map((s) => s.id);
    const sectionIds = attemptSections.map((s) => s.section_id);

    // Ensure all content_items in the attempt's sections have response records so unanswered items are also graded & shown in the review report
    const { data: modules } = await supabaseAdmin
      .from("modules")
      .select("id, section_id")
      .in("section_id", sectionIds);

    const moduleIds = (modules ?? []).map((m) => m.id);
    const moduleToSectionId = new Map<string, string>();
    for (const m of modules ?? []) {
      moduleToSectionId.set(m.id, m.section_id);
    }

    const sectionIdToAttemptSecId = new Map<string, string>();
    for (const as of attemptSections) {
      sectionIdToAttemptSecId.set(as.section_id, as.id);
    }

    if (moduleIds.length > 0) {
      const { data: allSectionItems } = await supabaseAdmin
        .from("content_items")
        .select("id, module_id, item_order")
        .in("module_id", moduleIds)
        .order("item_order", { ascending: true });

      const { data: existingResps } = await supabaseAdmin
        .from("responses")
        .select("id, content_item_id")
        .in("attempt_section_id", attemptSecIds);

      const answeredItemIds = new Set((existingResps ?? []).map((r) => r.content_item_id));

      const missingPayloads: Database["public"]["Tables"]["responses"]["Insert"][] = [];
      for (const item of allSectionItems ?? []) {
        if (!answeredItemIds.has(item.id) && item.module_id) {
          const secId = moduleToSectionId.get(item.module_id);
          const attSecId = secId ? sectionIdToAttemptSecId.get(secId) : undefined;
          if (attSecId) {
            missingPayloads.push({
              attempt_section_id: attSecId,
              content_item_id: item.id,
              student_id: attempt.student_id,
              raw_answer: null,
              normalized_answer: {},
              time_spent_ms: 0,
              flagged: false,
              answered_at: new Date().toISOString(),
            });
          }
        }
      }

      if (missingPayloads.length > 0) {
        await supabaseAdmin
          .from("responses")
          .upsert(missingPayloads, { onConflict: "attempt_section_id,content_item_id" });
      }
    }

    const { data: responses, error: respErr } = await supabaseAdmin
      .from("responses")
      .select(
        "id, attempt_section_id, content_item_id, student_id, raw_answer, normalized_answer, content_items(id, section_type, item_type, difficulty, payload, item_order)",
      )
      .in("attempt_section_id", attemptSecIds);

    if (respErr) {
      throw new Error(`Failed to load attempt responses: ${respErr.message}`);
    }

    // Re-evaluation (retry after a failed/stale scoring run) must be idempotent:
    // clear any prior constructed-response evaluations for this attempt's
    // responses so each response carries exactly one fresh feedback row.
    const attemptRespIds = (responses ?? []).map((r) => r.id);
    if (attemptRespIds.length > 0) {
      const { error: staleDelErr } = await supabaseAdmin
        .from("evaluations")
        .delete()
        .in("response_id", attemptRespIds);
      if (staleDelErr) {
        console.warn(
          "[EvaluationPipeline] Could not clear stale evaluations:",
          staleDelErr.message,
        );
      }
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
      reading: { sectionType: "reading", rawScore: 0, maxScore: 0, bandScore: null },
      listening: { sectionType: "listening", rawScore: 0, maxScore: 0, bandScore: null },
      writing: { sectionType: "writing", rawScore: 0, maxScore: 0, bandScore: null },
      speaking: { sectionType: "speaking", rawScore: 0, maxScore: 0, bandScore: null },
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
        const answerKey = (itemPayload["answerKey"] as Record<string, unknown> | undefined) ?? {};
        const publicBlanks = Array.isArray(itemPayload["blanks"])
          ? (itemPayload["blanks"] as Array<Record<string, unknown>>)
          : [];
        const keyedBlanks = Array.isArray(answerKey["blanks"])
          ? (answerKey["blanks"] as Array<Record<string, unknown>>)
          : [];
        const correctAnswers = Array.isArray(answerKey["correctAnswers"])
          ? (answerKey["correctAnswers"] as string[])
          : [];
        const fullWords = Array.isArray(answerKey["fullWords"])
          ? (answerKey["fullWords"] as string[])
          : [];
        const blanksList = publicBlanks.map((blank, index) => {
          const blankIndex = Number(blank["blankIndex"] ?? index);
          const key =
            keyedBlanks.find((candidate) => Number(candidate["blankIndex"]) === blankIndex) ??
            keyedBlanks[index];
          const keyedAnswers = Array.isArray(key?.["acceptedAnswers"])
            ? (key["acceptedAnswers"] as string[])
            : [];
          const fallbackAnswers = [correctAnswers[index], fullWords[index]].filter(
            (answer): answer is string => typeof answer === "string" && answer.length > 0,
          );
          return {
            blankIndex,
            acceptedAnswers: keyedAnswers.length > 0 ? keyedAnswers : fallbackAnswers,
            weight: Number(blank["weight"] ?? key?.["weight"] ?? 1),
          };
        });
        const scoreRes = readingScoringService.scoreItem(resp.raw_answer, {
          itemType,
          options: itemOpts.map((o) => ({
            optionKey: o.option_key,
            optionText: o.option_text,
            isCorrect: o.is_correct,
            distractorRationale: o.distractor_rationale,
          })),
          ...(blanksList.length > 0 ? { blanks: blanksList } : {}),
          acceptedAnswers: (answerKey["acceptedAnswers"] as string[]) ?? undefined,
        });

        // For complete_words when unanswered, ensure maxPoints reflects number of blanks
        const effectiveMaxPoints =
          itemType === "complete_words" && Array.isArray(blanksList) && blanksList.length > 0
            ? blanksList.length
            : scoreRes.maxPoints;

        await supabaseAdmin
          .from("responses")
          .update({
            is_correct: scoreRes.isCorrect,
            score: scoreRes.score,
          })
          .eq("id", resp.id);

        sectionSummaries[secType].rawScore += scoreRes.earnedPoints;
        sectionSummaries[secType].maxScore += effectiveMaxPoints;
      }
      // B. Build Sentence (Writing Deterministic)
      else if (itemType === "build_sentence") {
        const itemPayload = (rawItem.payload as Record<string, unknown>) ?? {};
        const answerKey = (itemPayload["answerKey"] as Record<string, unknown> | undefined) ?? {};
        const sentScore = sentenceScoringService.scoreResponse(resp.raw_answer, {
          acceptedSequences: (answerKey["acceptedSequences"] as string[][]) ?? [],
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
        // Build-a-Sentence partial credit (0.5) maps to a middle band instead of
        // collapsing to the floor, so the writing band reflects near-correct grammar.
        sectionBands[secType].push(sentScore.isCorrect ? 6.0 : sentScore.score >= 0.4 ? 3.5 : 1.0);
      }
      // C. AI-Evaluated Writing Tasks (Write an Email, Academic Discussion)
      else if (itemType === "write_email" || itemType === "academic_discussion") {
        const itemPayload = rawItem.payload ?? {};
        const modelAns =
          (itemPayload["modelAnswer"] as string | undefined) ||
          (itemPayload["sampleAnswer"] as string | undefined) ||
          ((itemPayload["answerKey"] as Record<string, unknown> | undefined)?.[
            "sampleHighScoringResponse"
          ] as string | undefined);

        const evalResult = await evaluationService.evaluateWriting({
          taskType: itemType,
          promptText: (itemPayload["prompt"] as string) ?? (itemPayload["title"] as string) ?? "",
          contextData: itemPayload,
          studentResponse: resp.raw_answer ?? "",
          referenceModelAnswer: modelAns,
        });

        await supabaseAdmin.from("evaluations").insert({
          response_id: resp.id,
          score_band: evalResult.score_band,
          task_score: evalResult.task_score,
          traits: evalResult.traits,
          strengths: evalResult.strengths,
          issues: evalResult.issues,
          corrections: evalResult.corrections,
          improved_response: evalResult.improved_response || modelAns || "",
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
        const modelAns =
          (itemPayload["modelAnswer"] as string | undefined) ||
          (itemPayload["sampleAnswer"] as string | undefined) ||
          (itemPayload["targetSentence"] as string | undefined) ||
          ((itemPayload["answerKey"] as Record<string, unknown> | undefined)?.[
            "sampleHighScoringResponse"
          ] as string | undefined);

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
              if (arrayBuffer.byteLength > 0) {
                audioBase64 = Buffer.from(arrayBuffer).toString("base64");
              }
            }
          } catch (dlErr) {
            console.warn(`Could not download audio from storage path ${storagePath}:`, dlErr);
          }
        }

        if (!audioBase64 && resp.raw_answer?.startsWith("data:audio/")) {
          audioBase64 = resp.raw_answer;
        }
        if (
          !audioBase64 &&
          !storagePath &&
          typeof normAnswer.mimeType === "string" &&
          normAnswer.mimeType.startsWith("audio/") &&
          resp.raw_answer &&
          !resp.raw_answer.startsWith("recorded-audio-") &&
          !resp.raw_answer.includes("/")
        ) {
          audioBase64 = resp.raw_answer;
        }

        let transcriptionUnavailable = false;
        if (audioBase64) {
          try {
            const trResult = await speechToTextProvider.transcribe({
              audioBase64,
              mimeType: (normAnswer.mimeType as string) ?? "audio/webm",
              taskType: itemType,
            });
            transcript = trResult.transcript.trim();
            transcriptionUnavailable = transcript.length === 0;
          } catch (error) {
            console.warn(
              `[EvaluationPipeline] Speech transcription unavailable for response ${resp.id}:`,
              error instanceof Error ? error.message : error,
            );
            transcriptionUnavailable = true;
          }
        } else if (resp.raw_answer) {
          const rawAnswer = resp.raw_answer.trim();
          const isTextEntry = normAnswer.mimeType === "text/plain";
          const looksLikeAudioReference =
            rawAnswer.startsWith("recorded-audio-") ||
            rawAnswer.startsWith("http://") ||
            rawAnswer.startsWith("https://") ||
            rawAnswer.startsWith("data:audio/") ||
            rawAnswer.includes("/");
          if (isTextEntry || !looksLikeAudioReference) {
            transcript = rawAnswer;
          } else {
            transcriptionUnavailable = true;
          }
        }

        // A saved recording without a transcript cannot receive a defensible
        // transcript-based score. Keep the report, but leave this item unscored.
        if (transcriptionUnavailable) continue;

        const evalResult = await speakingEvaluationService.evaluateSpeaking({
          taskType: itemType,
          promptText:
            (itemPayload["prompt"] as string) ??
            (itemPayload["questionText"] as string) ??
            (itemPayload["targetSentence"] as string) ??
            "",
          transcript,
          audioDurationSeconds: (normAnswer.durationSeconds as number) ?? undefined,
          referenceModelAnswer: modelAns,
        });

        await supabaseAdmin.from("evaluations").insert({
          response_id: resp.id,
          score_band: evalResult.score_band,
          task_score: evalResult.task_score,
          traits: evalResult.traits,
          strengths: evalResult.strengths,
          issues: evalResult.issues,
          corrections: evalResult.corrections,
          improved_response: evalResult.improved_response || modelAns || "",
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
        : null;
    if (rdRatio !== null) {
      sectionSummaries.reading.bandScore = Math.max(
        1.0,
        Math.min(6.0, Math.round((1.0 + rdRatio * 5.0) * 2) / 2),
      );
    }

    const lsRatio =
      sectionSummaries.listening.maxScore > 0
        ? sectionSummaries.listening.rawScore / sectionSummaries.listening.maxScore
        : null;
    if (lsRatio !== null) {
      sectionSummaries.listening.bandScore = Math.max(
        1.0,
        Math.min(6.0, Math.round((1.0 + lsRatio * 5.0) * 2) / 2),
      );
    }

    const wrBands = sectionBands.writing;
    if (wrBands.length > 0) {
      sectionSummaries.writing.bandScore =
        Math.round((wrBands.reduce((a, b) => a + b, 0) / wrBands.length) * 2) / 2;
    }

    const expectedSpeakingResponses = (responses ?? []).filter((response) => {
      const contentItem = (
        response as unknown as { content_items: { section_type?: string } | null }
      ).content_items;
      return contentItem?.section_type === "speaking";
    }).length;
    const spBands = sectionBands.speaking;
    if (expectedSpeakingResponses > 0 && spBands.length === expectedSpeakingResponses) {
      sectionSummaries.speaking.bandScore =
        Math.round((spBands.reduce((a, b) => a + b, 0) / spBands.length) * 2) / 2;
    }

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

    const activeBands = activeSectionTypes
      .map((type) => sectionSummaries[type].bandScore)
      .filter((band): band is number => band !== null);
    const scoredSectionTypes = activeSectionTypes.filter(
      (type) => sectionSummaries[type].bandScore !== null,
    );
    const overallBand =
      activeBands.length > 0
        ? Math.round((activeBands.reduce((a, b) => a + b, 0) / activeBands.length) * 2) / 2
        : null;
    const hasFullScoreCoverage = hasFullToeflSectionCoverage(scoredSectionTypes);
    const comparableScore =
      hasFullScoreCoverage && overallBand !== null ? bandToComparable120(overallBand) : null;
    const reportSummary = hasFullScoreCoverage
      ? `Practice estimate based on all four scored sections: ${overallBand?.toFixed(1)} / 6.0 (comparison ${comparableScore} / 120).`
      : `Practice report includes ${scoredSectionTypes.length} of ${activeSectionTypes.length} scored sections. Full-test comparison is unavailable.`;

    // 7. Upsert Score Report. Unscored sections remain NULL; the client can
    // distinguish unavailable scores from the TOEFL scale's minimum band.
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
        target_score: null,
        target_gap: null,
        summary: reportSummary,
        skill_breakdown: JSON.parse(
          JSON.stringify({
            reading: sectionSummaries.reading,
            listening: sectionSummaries.listening,
            writing: sectionSummaries.writing,
            speaking: sectionSummaries.speaking,
            scoredSectionTypes,
            hasFullScoreCoverage,
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
        score: comparableScore === null ? null : Math.round(comparableScore),
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
