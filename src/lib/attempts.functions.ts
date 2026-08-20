import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const startAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ code: z.string().min(1).max(24) }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { normalizeCode } = await import("./attempts.server");
    const code = normalizeCode(data.code);

    const { data: test } = await supabaseAdmin
      .from("tests")
      .select("id, name, category, difficulty, status, expires_at, seconds_per_question, response_seconds")
      .eq("code", code)
      .maybeSingle();

    if (!test) return { error: "invalid" as const };
    if (test.status !== "active") return { error: "closed" as const };
    if (test.expires_at && new Date(test.expires_at).getTime() < Date.now()) {
      return { error: "expired" as const };
    }

    const { count } = await supabaseAdmin
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("test_id", test.id)
      .eq("approved", true);
    const total = count ?? 0;
    if (total === 0) return { error: "empty" as const };

    const { data: existing } = await supabaseAdmin
      .from("attempts")
      .select("id, status")
      .eq("test_id", test.id)
      .eq("student_id", context.userId)
      .maybeSingle();

    if (existing && existing.status !== "in_progress") {
      return { error: "completed" as const, attemptId: existing.id };
    }

    let attemptId = existing?.id;
    if (!attemptId) {
      const { data: created, error } = await supabaseAdmin
        .from("attempts")
        .insert({ test_id: test.id, student_id: context.userId })
        .select("id")
        .single();
      if (error || !created) throw new Error("Could not start this test. Please try again.");
      attemptId = created.id;
    }

    const { count: answered } = await supabaseAdmin
      .from("attempt_answers")
      .select("id", { count: "exact", head: true })
      .eq("attempt_id", attemptId)
      .not("submitted_at", "is", null);

    return {
      attemptId,
      answered: answered ?? 0,
      total,
      test: {
        name: test.name,
        category: test.category,
        difficulty: test.difficulty,
        code,
        secondsPerQuestion: test.seconds_per_question,
        responseSeconds: test.response_seconds,
      },
    };
  });

export const revealQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ attemptId: z.string().uuid(), position: z.number().int().min(0) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: attempt } = await supabaseAdmin
      .from("attempts")
      .select("id, test_id, student_id, status")
      .eq("id", data.attemptId)
      .maybeSingle();
    if (!attempt || attempt.student_id !== context.userId) throw new Error("Attempt not found.");
    if (attempt.status !== "in_progress") return { state: "finished" as const };

    const { data: questions } = await supabaseAdmin
      .from("questions")
      .select("id, text, category, topic, difficulty")
      .eq("test_id", attempt.test_id)
      .eq("approved", true)
      .order("position", { ascending: true });

    const question = questions?.[data.position];
    if (!question) return { state: "finished" as const };

    const { data: answer } = await supabaseAdmin
      .from("attempt_answers")
      .select("id, revealed_at, submitted_at")
      .eq("attempt_id", attempt.id)
      .eq("question_id", question.id)
      .maybeSingle();

    if (answer?.submitted_at) return { state: "submitted" as const };
    // Already read once — the question is consumed for this attempt and is never
    // sent to the browser again.
    if (answer?.revealed_at) {
      return {
        state: "consumed" as const,
        meta: { topic: question.topic, difficulty: question.difficulty, category: question.category },
      };
    }

    await supabaseAdmin.from("attempt_answers").insert({
      attempt_id: attempt.id,
      question_id: question.id,
      position: data.position,
      revealed_at: new Date().toISOString(),
    });

    return {
      state: "ready" as const,
      question: {
        text: question.text,
        topic: question.topic,
        difficulty: question.difficulty,
        category: question.category,
      },
    };
  });

export const submitAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        attemptId: z.string().uuid(),
        position: z.number().int().min(0),
        response: z.string().max(6000),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: attempt } = await supabaseAdmin
      .from("attempts")
      .select("id, student_id, status")
      .eq("id", data.attemptId)
      .maybeSingle();
    if (!attempt || attempt.student_id !== context.userId) throw new Error("Attempt not found.");
    if (attempt.status !== "in_progress") return { ok: true };

    const { error } = await supabaseAdmin
      .from("attempt_answers")
      .update({ response: data.response, submitted_at: new Date().toISOString() })
      .eq("attempt_id", attempt.id)
      .eq("position", data.position)
      .is("submitted_at", null);
    if (error) throw new Error("Could not save your response.");
    return { ok: true };
  });

export const recordBlur = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ attemptId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: attempt } = await supabaseAdmin
      .from("attempts")
      .select("id, student_id, blur_count")
      .eq("id", data.attemptId)
      .maybeSingle();
    if (!attempt || attempt.student_id !== context.userId) return { ok: false };
    await supabaseAdmin
      .from("attempts")
      .update({ blur_count: (attempt.blur_count ?? 0) + 1 })
      .eq("id", attempt.id);
    return { ok: true, blurCount: (attempt.blur_count ?? 0) + 1 };
  });

export const finishAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ attemptId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { evaluateAttempt } = await import("./attempts.server");

    const { data: attempt } = await supabaseAdmin
      .from("attempts")
      .select("id, test_id, student_id, status")
      .eq("id", data.attemptId)
      .maybeSingle();
    if (!attempt || attempt.student_id !== context.userId) throw new Error("Attempt not found.");
    if (attempt.status === "evaluated") return { attemptId: attempt.id };

    await supabaseAdmin.from("attempts").update({ status: "evaluating" }).eq("id", attempt.id);

    const { data: answers } = await supabaseAdmin
      .from("attempt_answers")
      .select("id, question_id, position, response")
      .eq("attempt_id", attempt.id)
      .order("position", { ascending: true });

    const { data: questions } = await supabaseAdmin
      .from("questions")
      .select("id, text, concepts, constraints, reference_answer")
      .eq("test_id", attempt.test_id);

    const questionMap = new Map((questions ?? []).map((q) => [q.id, q]));

    try {
      const { scored, axes, overall } = await evaluateAttempt(answers ?? [], questionMap);

      await Promise.all(
        scored.map((item) =>
          supabaseAdmin
            .from("attempt_answers")
            .update({
              score: item.score,
              feedback: item.feedback,
              missed_concepts: item.missedConcepts,
              missed_constraints: item.missedConstraints,
            })
            .eq("id", item.id),
        ),
      );

      await supabaseAdmin
        .from("attempts")
        .update({
          status: "evaluated",
          score: overall,
          axes,
          completed_at: new Date().toISOString(),
        })
        .eq("id", attempt.id);

      return { attemptId: attempt.id };
    } catch (error) {
      await supabaseAdmin.from("attempts").update({ status: "in_progress" }).eq("id", attempt.id);
      throw error;
    }
  });

export const getResult = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ attemptId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: attempt } = await supabaseAdmin
      .from("attempts")
      .select(
        "id, test_id, student_id, status, score, axes, blur_count, started_at, completed_at, tests(name, category, difficulty, code)",
      )
      .eq("id", data.attemptId)
      .maybeSingle();

    if (!attempt) throw new Error("Attempt not found.");

    const isOwner = attempt.student_id === context.userId;
    if (!isOwner) {
      const { data: test } = await supabaseAdmin
        .from("tests")
        .select("owner_id")
        .eq("id", attempt.test_id)
        .maybeSingle();
      if (test?.owner_id !== context.userId) throw new Error("Attempt not found.");
    }

    const { data: answers } = await supabaseAdmin
      .from("attempt_answers")
      .select(
        "id, position, response, score, feedback, missed_concepts, missed_constraints, flagged, questions(text, topic, difficulty, concepts, constraints, reference_answer)",
      )
      .eq("attempt_id", attempt.id)
      .order("position", { ascending: true });

    return {
      id: attempt.id,
      status: attempt.status,
      score: attempt.score,
      axes: attempt.axes as Record<string, number> | null,
      blurCount: attempt.blur_count,
      completedAt: attempt.completed_at,
      test: attempt.tests,
      answers: (answers ?? []).map((a) => ({
        id: a.id,
        position: a.position,
        response: a.response,
        score: a.score === null ? null : Number(a.score),
        feedback: a.feedback,
        missedConcepts: a.missed_concepts,
        missedConstraints: a.missed_constraints,
        flagged: a.flagged,
        question: a.questions,
      })),
    };
  });

export const flagEvaluation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ answerId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("attempt_answers")
      .update({ flagged: true })
      .eq("id", data.answerId);
    if (error) throw new Error("Could not flag this evaluation.");
    return { ok: true };
  });

export const getStudentOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: attempts } = await context.supabase
      .from("attempts")
      .select("id, score, axes, status, started_at, completed_at, tests(name, category, difficulty)")
      .eq("student_id", context.userId)
      .order("started_at", { ascending: false });

    const { data: profile } = await context.supabase
      .from("profiles")
      .select("full_name, email, institution, year, onboarded")
      .eq("id", context.userId)
      .maybeSingle();

    return {
      profile: profile ?? null,
      attempts: (attempts ?? []).map((a) => ({
        id: a.id,
        score: a.score,
        axes: a.axes as Record<string, number> | null,
        status: a.status,
        startedAt: a.started_at,
        completedAt: a.completed_at,
        test: a.tests,
      })),
    };
  });
