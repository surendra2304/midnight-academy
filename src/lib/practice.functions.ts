import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Open practice: any signed-in student can drill passages from the approved
 * question bank by category — no test code needed, unlimited attempts, nothing
 * is persisted or graded into official test scores.
 */
export const getPracticeQuestions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z
      .object({
        category: z.string().min(2).max(60),
        count: z.number().int().min(1).max(5).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: questions } = await supabaseAdmin
      .from("questions")
      .select("id, text, topic, difficulty, category")
      .eq("approved", true)
      .eq("category", data.category)
      .limit(50);

    const pool = questions ?? [];
    if (pool.length === 0) {
      return { questions: [], available: false as const };
    }

    // Shuffle and take up to `count` (default 3)
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, data.count ?? 3);

    return {
      available: true as const,
      questions: picked.map((q) => ({
        id: q.id,
        text: q.text,
        topic: q.topic,
        difficulty: q.difficulty,
      })),
    };
  });

/**
 * Evaluate one practice answer with the same AI evaluator used for real tests.
 * Returns the full breakdown plus the reference answer so the student learns.
 */
export const evaluatePracticeAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z
      .object({
        questionId: z.string().uuid(),
        response: z.string().max(6000),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { evaluateAnswer } = await import("./evaluate.server");

    const { data: question } = await supabaseAdmin
      .from("questions")
      .select("id, text, concepts, constraints, reference_answer")
      .eq("id", data.questionId)
      .eq("approved", true)
      .maybeSingle();

    if (!question) throw new Error("Practice question not found.");

    const result = await evaluateAnswer({
      questionText: question.text,
      referenceAnswer: question.reference_answer ?? "",
      concepts: question.concepts ?? [],
      constraints: question.constraints ?? [],
      response: data.response,
    });

    return {
      score: result.score,
      feedback: result.feedback,
      missedConcepts: result.missedConcepts,
      missedConstraints: result.missedConstraints,
      axisScores: result.axisScores,
      referenceAnswer: question.reference_answer ?? "",
      questionText: question.text,
    };
  });
