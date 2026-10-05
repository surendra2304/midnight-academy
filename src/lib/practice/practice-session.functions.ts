import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { readingScoringService } from "@/lib/scoring/reading-scoring";
import { sentenceScoringService } from "@/lib/scoring/sentence-scoring";
import { evaluationService } from "@/lib/evaluation/evaluation-service.server";
import { speakingEvaluationService } from "@/lib/evaluation/speaking-evaluation.server";
import { speechToTextProvider } from "@/lib/speaking/transcription-service.server";
import { sanitizeStudentPayload } from "@/lib/tests/blueprint-sanitizer";
import type { ToeflItemType, ToeflSectionType } from "@/types/toefl";
import type { JsonRecord } from "@/types/serializable";

const taskTypeSchema = z.enum([
  "complete_words",
  "read_daily_life",
  "read_academic",
  "listen_choose_response",
  "listen_conversation",
  "listen_announcement",
  "listen_academic_talk",
  "build_sentence",
  "write_email",
  "academic_discussion",
  "listen_repeat",
  "take_interview",
]);

export interface PracticeItemDetail {
  id: string;
  itemType: ToeflItemType;
  sectionType: ToeflSectionType;
  difficulty: string;
  skillTags: string[];
  payload: JsonRecord;
  options: Array<{
    id: string;
    optionKey: string;
    optionText: string;
    optionOrder: number;
  }>;
}

export const getPracticeTaskItems = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z
      .object({
        taskType: taskTypeSchema,
        difficulty: z.string().optional(),
        limit: z.number().int().positive().default(10),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    let query = supabaseAdmin
      .from("content_items")
      .select("id, item_type, section_type, difficulty, skill_tags, payload, item_order")
      .eq("item_type", data.taskType)
      .order("item_order", { ascending: true })
      .limit(data.limit);

    if (data.difficulty && data.difficulty !== "all") {
      query = query.ilike("difficulty", data.difficulty);
    }

    const { data: items, error } = await query;
    if (error) {
      throw new Error(`Failed to load practice items: ${error.message}`);
    }

    const itemIds = (items ?? []).map((i) => i.id);

    const { data: options, error: optionsError } = await supabaseAdmin
      .from("question_options")
      .select("id, content_item_id, option_key, option_text, option_order")
      .in(
        "content_item_id",
        itemIds.length > 0 ? itemIds : ["00000000-0000-0000-0000-000000000000"],
      )
      .order("option_order", { ascending: true });
    if (optionsError) {
      throw new Error(`Failed to load practice answer choices: ${optionsError.message}`);
    }

    const optionsByItem = new Map<
      string,
      Array<{ id: string; optionKey: string; optionText: string; optionOrder: number }>
    >();
    for (const opt of options ?? []) {
      const list = optionsByItem.get(opt.content_item_id) ?? [];
      list.push({
        id: opt.id,
        optionKey: opt.option_key,
        optionText: opt.option_text,
        optionOrder: opt.option_order,
      });
      optionsByItem.set(opt.content_item_id, list);
    }

    return (items ?? []).map((item) => ({
      id: item.id,
      itemType: item.item_type as ToeflItemType,
      sectionType: item.section_type as ToeflSectionType,
      difficulty: item.difficulty,
      skillTags: item.skill_tags ?? [],
      payload: sanitizeStudentPayload(item.payload),
      options: optionsByItem.get(item.id) ?? [],
    })) as unknown as PracticeItemDetail[];
  });

export const submitPracticeTaskAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z
      .object({
        contentItemId: z.string().uuid(),
        taskType: taskTypeSchema,
        rawAnswer: z.string().nullable(),
        normalizedAnswer: z.record(z.string(), z.unknown()).default({}),
        timeSpentMs: z.number().int().nonnegative().default(0),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { contentItemId, taskType, rawAnswer, normalizedAnswer, timeSpentMs } = data;
    const studentId = context.userId;

    const { data: item, error: itemErr } = await supabaseAdmin
      .from("content_items")
      .select("id, item_type, section_type, payload")
      .eq("id", contentItemId)
      .single();

    if (itemErr || !item) {
      throw new Error("Practice content item not found.");
    }
    if (item.item_type !== taskType) {
      throw new Error("The requested task type does not match this practice item.");
    }

    const { data: options, error: optionsError } = await supabaseAdmin
      .from("question_options")
      .select("id, option_key, option_text, is_correct, distractor_rationale")
      .eq("content_item_id", contentItemId);
    if (optionsError) {
      throw new Error(`Failed to load practice answer choices: ${optionsError.message}`);
    }

    const itemPayload = (item.payload as Record<string, unknown>) ?? {};

    // 1. Objective Reading & Listening Tasks
    if (
      taskType === "read_daily_life" ||
      taskType === "read_academic" ||
      taskType === "complete_words" ||
      taskType === "listen_choose_response" ||
      taskType === "listen_conversation" ||
      taskType === "listen_announcement" ||
      taskType === "listen_academic_talk"
    ) {
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
      const blanks = publicBlanks.map((blank, index) => {
        const blankIndex = Number(blank["blankIndex"] ?? index);
        const key =
          keyedBlanks.find((candidate) => Number(candidate["blankIndex"]) === blankIndex) ??
          keyedBlanks[index];
        const acceptedAnswers = Array.isArray(key?.["acceptedAnswers"])
          ? (key["acceptedAnswers"] as string[])
          : [correctAnswers[index], fullWords[index]].filter(
              (answer): answer is string => typeof answer === "string" && answer.length > 0,
            );
        return {
          blankIndex,
          acceptedAnswers,
          weight: Number(blank["weight"] ?? key?.["weight"] ?? 1),
        };
      });
      const scoreRes = readingScoringService.scoreItem(rawAnswer, {
        itemType: taskType,
        options: (options ?? []).map((o) => ({
          optionKey: o.option_key,
          optionText: o.option_text,
          isCorrect: o.is_correct,
          distractorRationale: o.distractor_rationale,
        })),
        ...(blanks.length ? { blanks } : {}),
        ...(Array.isArray(answerKey["acceptedAnswers"])
          ? { acceptedAnswers: answerKey["acceptedAnswers"] as string[] }
          : {}),
      });

      const correctOpt = (options ?? []).find((o) => o.is_correct);

      return {
        type: "objective" as const,
        isCorrect: scoreRes.isCorrect,
        score: scoreRes.score,
        earnedPoints: scoreRes.earnedPoints,
        maxPoints: scoreRes.maxPoints,
        correctOptionKey: correctOpt?.option_key ?? null,
        correctOptionText: correctOpt?.option_text ?? null,
        distractorRationale: scoreRes.distractorRationale ?? null,
        submittedAt: new Date().toISOString(),
      };
    }

    // 2. Build Sentence (Writing Deterministic)
    if (taskType === "build_sentence") {
      const answerKey = (itemPayload["answerKey"] as Record<string, unknown> | undefined) ?? {};
      const acceptedSequences = (answerKey["acceptedSequences"] as string[][] | undefined) ?? [];
      const sentScore = sentenceScoringService.scoreResponse(rawAnswer, {
        acceptedSequences,
        wordBank: (itemPayload["wordBank"] as string[]) ?? [],
      });

      return {
        type: "objective" as const,
        isCorrect: sentScore.isCorrect,
        score: sentScore.score,
        earnedPoints: sentScore.earnedPoints,
        maxPoints: sentScore.maxPoints,
        correctSequence:
          (
            (itemPayload["answerKey"] as Record<string, unknown> | undefined)?.[
              "acceptedSequences"
            ] as string[][] | undefined
          )?.[0]?.join(" ") ??
          ((itemPayload["answerKey"] as Record<string, unknown> | undefined)?.["targetSentence"] as
            string | undefined) ??
          "",
        submittedAt: new Date().toISOString(),
      };
    }

    // 3. Writing Tasks (Write an Email, Academic Discussion)
    if (taskType === "write_email" || taskType === "academic_discussion") {
      const answerKey = (itemPayload["answerKey"] as Record<string, unknown> | undefined) ?? {};
      const evalResult = await evaluationService.evaluateWriting({
        taskType,
        promptText: (itemPayload["prompt"] as string) ?? (itemPayload["title"] as string) ?? "",
        contextData: itemPayload,
        studentResponse: rawAnswer ?? "",
        referenceModelAnswer: answerKey["sampleHighScoringResponse"] as string | undefined,
      });

      return {
        type: "ai_evaluated" as const,
        evaluation: evalResult,
        submittedAt: new Date().toISOString(),
      };
    }

    // 4. Speaking Tasks (Listen & Repeat, Take an Interview)
    if (taskType === "listen_repeat" || taskType === "take_interview") {
      const answerKey = (itemPayload["answerKey"] as Record<string, unknown> | undefined) ?? {};
      const modelAnswer =
        (answerKey["sampleHighScoringResponse"] as string | undefined) ||
        (answerKey["targetSentence"] as string | undefined) ||
        "";
      let transcript = "";
      const storagePath = normalizedAnswer.storagePath as string | undefined;
      let audioBase64 = normalizedAnswer.audioBase64 as string | undefined;

      if (storagePath) {
        try {
          const { data: fileData } = await supabaseAdmin.storage
            .from("speaking-recordings")
            .download(storagePath);
          if (fileData) {
            const arrayBuf = await fileData.arrayBuffer();
            audioBase64 = Buffer.from(arrayBuf).toString("base64");
          }
        } catch (dlErr) {
          console.warn("Could not download audio from storage:", dlErr);
        }
      }

      if (audioBase64) {
        try {
          const trResult = await speechToTextProvider.transcribe({
            audioBase64,
            mimeType: (normalizedAnswer.mimeType as string) ?? "audio/webm",
            taskType,
          });
          transcript = trResult.transcript;
        } catch (trErr) {
          throw new Error(
            `Speech transcription failed: ${(trErr as Error)?.message || "Audio processing error"}`,
          );
        }
      } else if (
        rawAnswer &&
        !rawAnswer.startsWith("recorded-audio-") &&
        !rawAnswer.includes("/")
      ) {
        transcript = rawAnswer;
      }

      const evalResult = await speakingEvaluationService.evaluateSpeaking({
        taskType,
        promptText:
          (itemPayload["prompt"] as string) ?? (itemPayload["questionText"] as string) ?? "",
        transcript,
        audioDurationSeconds: (normalizedAnswer.durationSeconds as number) ?? undefined,
        referenceModelAnswer: modelAnswer,
      });

      return {
        type: "ai_evaluated" as const,
        transcript,
        evaluation: evalResult,
        submittedAt: new Date().toISOString(),
      };
    }

    throw new Error(`Unsupported task type: ${taskType}`);
  });
