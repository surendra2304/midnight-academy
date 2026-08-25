import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const startAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z
      .object({
        code: z.string().min(1).max(24),
        allowRetake: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { normalizeCode } = await import("./attempts.server");
    const code = normalizeCode(data.code);

    const { data: test } = await supabaseAdmin
      .from("tests")
      .select(
        "id, name, category, difficulty, status, expires_at, seconds_per_question, response_seconds, is_practice",
      )
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
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Practice tests (or when allowRetake is true) can always be retaken fresh
    const canRetake = test.is_practice || data.allowRetake;

    if (existing && existing.status !== "in_progress" && !canRetake) {
      return { error: "completed" as const, attemptId: existing.id };
    }

    let attemptId = existing?.status === "in_progress" ? existing.id : undefined;
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
        id: test.id,
        name: test.name,
        category: test.category,
        difficulty: test.difficulty,
        code,
        secondsPerQuestion: test.seconds_per_question,
        responseSeconds: test.response_seconds,
      },
    };
  });

export const getAttemptState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ attemptId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: attempt } = await supabaseAdmin
      .from("attempts")
      .select(
        "id, test_id, student_id, status, blur_count, tests(name, category, difficulty, seconds_per_question, response_seconds)",
      )
      .eq("id", data.attemptId)
      .maybeSingle();

    if (!attempt || attempt.student_id !== context.userId) {
      throw new Error("Attempt not found or unauthorized.");
    }

    const { count } = await supabaseAdmin
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("test_id", attempt.test_id)
      .eq("approved", true);
    const total = count ?? 0;

    const { data: answers } = await supabaseAdmin
      .from("attempt_answers")
      .select("position, revealed_at, submitted_at")
      .eq("attempt_id", attempt.id)
      .order("position", { ascending: true });

    // Determine current unsubmitted position
    const answeredPositions = new Set(
      (answers ?? []).filter((a) => a.submitted_at !== null).map((a) => a.position),
    );

    let currentIndex = 0;
    for (let i = 0; i < total; i++) {
      if (!answeredPositions.has(i)) {
        currentIndex = i;
        break;
      }
      currentIndex = i + 1;
    }

    const currentAnswer = (answers ?? []).find((a) => a.position === currentIndex);

    return {
      attemptId: attempt.id,
      status: attempt.status,
      total,
      currentIndex,
      blurCount: attempt.blur_count,
      currentAnswer: currentAnswer
        ? {
            revealedAt: currentAnswer.revealed_at,
            submittedAt: currentAnswer.submitted_at,
          }
        : null,
      test: attempt.tests,
    };
  });

export const revealQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z.object({ attemptId: z.string().uuid(), position: z.number().int().min(0) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: attempt } = await supabaseAdmin
      .from("attempts")
      .select("id, test_id, student_id, status, tests(seconds_per_question)")
      .eq("id", data.attemptId)
      .maybeSingle();

    if (!attempt || attempt.student_id !== context.userId) {
      throw new Error("Attempt not found or unauthorized.");
    }
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

    const readingSeconds =
      (attempt.tests as { seconds_per_question?: number } | null)?.seconds_per_question ?? 45;

    // Already revealed previously
    if (answer?.revealed_at) {
      const revealedTime = new Date(answer.revealed_at).getTime();
      const elapsedSeconds = (Date.now() - revealedTime) / 1000;

      // If reading timer has expired, mark as consumed and do NOT return text
      if (elapsedSeconds >= readingSeconds) {
        return {
          state: "consumed" as const,
          meta: {
            topic: question.topic,
            difficulty: question.difficulty,
            category: question.category,
          },
        };
      }

      // Still within valid reading window (e.g. accidental browser reload during reading)
      const remainingSeconds = Math.max(1, Math.round(readingSeconds - elapsedSeconds));
      return {
        state: "ready" as const,
        remainingSeconds,
        question: {
          text: question.text,
          topic: question.topic,
          difficulty: question.difficulty,
          category: question.category,
        },
      };
    }

    // First time reveal
    const revealedAt = new Date().toISOString();
    const { error: revealError } = await supabaseAdmin.from("attempt_answers").insert({
      attempt_id: attempt.id,
      question_id: question.id,
      position: data.position,
      revealed_at: revealedAt,
    });
    if (revealError) throw new Error("Could not open this question. Please try again.");

    return {
      state: "ready" as const,
      remainingSeconds: readingSeconds,
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
  .validator((data) =>
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

    if (!attempt || attempt.student_id !== context.userId) {
      throw new Error("Attempt not found or unauthorized.");
    }
    const { error } = await supabaseAdmin
      .from("attempt_answers")
      .update({ response: data.response, submitted_at: new Date().toISOString() })
      .eq("attempt_id", attempt.id)
      .eq("position", data.position)
      .is("submitted_at", null);

    if (error) throw new Error("Could not save your response.");

    // Fire per-question evaluation asynchronously in background without blocking
    // the HTTP response so the UI immediately advances to the next question in milliseconds
    (async () => {
      try {
        const { data: answerRow } = await supabaseAdmin
          .from("attempt_answers")
          .select("id, question_id, response")
          .eq("attempt_id", attempt.id)
          .eq("position", data.position)
          .maybeSingle();

        if (answerRow?.question_id) {
          const { data: question } = await supabaseAdmin
            .from("questions")
            .select("text, concepts, constraints, reference_answer")
            .eq("id", answerRow.question_id)
            .maybeSingle();

          if (question) {
            const { evaluateAnswer } = await import("./evaluate.server");
            const evaluation = await evaluateAnswer({
              questionText: question.text,
              referenceAnswer: question.reference_answer,
              concepts: question.concepts || [],
              constraints: question.constraints || [],
              response: data.response,
            });

            await supabaseAdmin
              .from("attempt_answers")
              .update({
                score: evaluation.score,
                feedback: evaluation.feedback,
                missed_concepts: evaluation.missedConcepts,
                missed_constraints: evaluation.missedConstraints,
              })
              .eq("id", answerRow.id);
          }
        }
      } catch (evalErr) {
        console.warn("[submitAnswer] Background evaluation warning:", evalErr);
      }
    })();

    return { ok: true };
  });

export const recordBlur = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ attemptId: z.string().uuid() }).parse(data))
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
  .validator((data) => z.object({ attemptId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: attempt } = await supabaseAdmin
      .from("attempts")
      .select("id, student_id, status")
      .eq("id", data.attemptId)
      .maybeSingle();

    if (!attempt || attempt.student_id !== context.userId) {
      throw new Error("Attempt not found or unauthorized.");
    }
    if (attempt.status === "evaluated") return { attemptId: attempt.id, status: "evaluated" };

    // Mark as evaluating
    await supabaseAdmin
      .from("attempts")
      .update({ status: "evaluating", completed_at: new Date().toISOString() })
      .eq("id", attempt.id);

    // Run the remaining evaluation immediately
    try {
      const { evaluateAttempt } = await import("./attempts.server");
      const { data: answers } = await supabaseAdmin
        .from("attempt_answers")
        .select("id, question_id, position, response, score, feedback, missed_concepts, missed_constraints")
        .eq("attempt_id", attempt.id)
        .order("position", { ascending: true });

      const { data: questions } = await supabaseAdmin
        .from("questions")
        .select("id, text, concepts, constraints, reference_answer")
        .eq("test_id", attempt.test_id);

      const questionMap = new Map((questions ?? []).map((q) => [q.id, q]));
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

      return { attemptId: attempt.id, status: "evaluated" };
    } catch (evalErr) {
      console.warn("[finishAttempt] Immediate eval error, will fallback to result page:", evalErr);
      return { attemptId: attempt.id, status: "evaluating" };
    }
  });

/**
 * Processes the AI evaluation for one attempt. Authorised for the attempt's
 * student and for the instructor who owns the test. Safe to call repeatedly —
 * it skips attempts that are already evaluated, so clients can poll it.
 */
export const processAttemptEvaluation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ attemptId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { evaluateAttempt } = await import("./attempts.server");

    const { data: attempt } = await supabaseAdmin
      .from("attempts")
      .select("id, test_id, student_id, status, tests(name, owner_id)")
      .eq("id", data.attemptId)
      .maybeSingle();

    if (!attempt) throw new Error("Attempt not found.");
    if (attempt.status === "evaluated") return { attemptId: attempt.id, status: "evaluated" };

    const isStudent = attempt.student_id === context.userId;
    const isInstructor = attempt.tests?.owner_id === context.userId;
    if (!isStudent && !isInstructor) throw new Error("Attempt not found or unauthorized.");

    const { data: answers } = await supabaseAdmin
      .from("attempt_answers")
      .select("id, question_id, position, response, score, feedback, missed_concepts, missed_constraints")
      .eq("attempt_id", attempt.id)
      .order("position", { ascending: true });

    const { data: questions } = await supabaseAdmin
      .from("questions")
      .select("id, text, concepts, constraints, reference_answer")
      .eq("test_id", attempt.test_id);

    const questionMap = new Map((questions ?? []).map((q) => [q.id, q]));

    try {
      const { scored, axes, overall } = await evaluateAttempt(answers ?? [], questionMap);

      const answerUpdates = await Promise.all(
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
      const failedUpdate = answerUpdates.find((u) => u.error);
      if (failedUpdate?.error) {
        throw new Error(failedUpdate.error.message || "Could not save the evaluation scores.");
      }

      const { error: attemptUpdateError } = await supabaseAdmin
        .from("attempts")
        .update({
          status: "evaluated",
          score: overall,
          axes,
          completed_at: new Date().toISOString(),
        })
        .eq("id", attempt.id);
      if (attemptUpdateError) {
        throw new Error(attemptUpdateError.message || "Could not finalize the evaluation.");
      }

      // Notify student
      await supabaseAdmin.from("notifications").insert({
        user_id: attempt.student_id,
        title: "Evaluation Completed",
        message: `Your results for "${attempt.tests?.name ?? "Test"}" are ready.`,
        type: "evaluation",
        link: `/result/${attempt.id}`,
      });

      // Notify instructor
      if (attempt.tests?.owner_id) {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("full_name")
          .eq("id", attempt.student_id)
          .maybeSingle();

        await supabaseAdmin.from("notifications").insert({
          user_id: attempt.tests.owner_id,
          title: "New Student Submission",
          message: `${profile?.full_name || "A student"} has completed "${attempt.tests?.name ?? "Test"}".`,
          type: "system",
          link: `/admin/tests/${attempt.test_id}`,
        });
      }

      // Asynchronous email notification to student (non-blocking)
      (async () => {
        try {
          const { data: studentProfile } = await supabaseAdmin
            .from("profiles")
            .select("full_name, email")
            .eq("id", attempt.student_id)
            .maybeSingle();

          const { data: testData } = await supabaseAdmin
            .from("tests")
            .select("name")
            .eq("id", attempt.test_id)
            .maybeSingle();

          if (studentProfile?.email) {
            const { sendEmail, renderEvaluationCompletedEmail } = await import("./email.server");
            const appUrl = process.env["APP_URL"] || "https://midnight-academy-one.vercel.app";
            const html = renderEvaluationCompletedEmail({
              studentName: studentProfile.full_name || "Student",
              testName: testData?.name || "Comprehension Test",
              score: overall,
              attemptId: attempt.id,
              appUrl,
            });

            await sendEmail({
              to: studentProfile.email,
              subject: `Evaluation Ready: ${testData?.name || "Comprehension Test"} (${Math.round(overall)}%)`,
              html,
            });
          }
        } catch (mailErr) {
          console.warn(
            "[processAttemptEvaluation] Evaluation email dispatch notice:",
            mailErr instanceof Error ? mailErr.message : mailErr,
          );
        }
      })();

      return { attemptId: attempt.id, status: "evaluated" };
    } catch (error) {
      // Return the attempt to in_progress so the student is not stuck
      await supabaseAdmin.from("attempts").update({ status: "in_progress" }).eq("id", attempt.id);
      throw error;
    }
  });

export const getResult = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ attemptId: z.string().uuid() }).parse(data))
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

    const { data: studentProfile } = await supabaseAdmin
      .from("profiles")
      .select("full_name, code_number")
      .eq("id", attempt.student_id)
      .maybeSingle();

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
        "id, position, response, score, feedback, missed_concepts, missed_constraints, flagged, manual_score, manual_feedback, questions(text, topic, difficulty, concepts, constraints, reference_answer)",
      )
      .eq("attempt_id", attempt.id)
      .order("position", { ascending: true });

    return {
      id: attempt.id,
      status: attempt.status,
      student: {
        id: attempt.student_id,
        name: studentProfile?.full_name || "Student",
        codeNumber: studentProfile?.code_number ?? null,
      },
      score: attempt.score,
      axes: attempt.axes as Record<string, number> | null,
      blurCount: attempt.blur_count,
      completedAt: attempt.completed_at,
      test: attempt.tests ? { ...attempt.tests, id: attempt.test_id } : null,
      answers: (answers ?? []).map((a) => ({
        id: a.id,
        position: a.position,
        response: a.response,
        score: a.score === null ? null : Number(a.score),
        feedback: a.feedback,
        missedConcepts: a.missed_concepts,
        missedConstraints: a.missed_constraints,
        flagged: a.flagged,
        manualScore: a.manual_score === null ? null : Number(a.manual_score),
        manualFeedback: a.manual_feedback,
        question: a.questions,
      })),
    };
  });

export const flagEvaluation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ answerId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Verify the caller is the attempt's student OR the instructor who owns
    // the test (previously instructors got a 403 because only the student path
    // was authorised).
    const { data: answer } = await supabaseAdmin
      .from("attempt_answers")
      .select("id, attempts!inner(student_id, tests!inner(owner_id))")
      .eq("id", data.answerId)
      .maybeSingle();

    const isStudent = answer?.attempts?.student_id === context.userId;
    const isInstructor = answer?.attempts?.tests?.owner_id === context.userId;
    if (!answer || (!isStudent && !isInstructor)) {
      throw new Error("Answer not found or unauthorized.");
    }

    const { error } = await supabaseAdmin
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
      .select(
        "id, score, axes, status, started_at, completed_at, tests(name, category, difficulty)",
      )
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

/**
 * Saves an instructor's manual review (override score + feedback) for one
 * answer. Only the instructor who owns the test may review.
 */
export const saveManualReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z
      .object({
        answerId: z.string().uuid(),
        manualScore: z.number().int().min(0).max(10),
        manualFeedback: z.string().max(2000),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: answer } = await supabaseAdmin
      .from("attempt_answers")
      .select("id, attempts!inner(tests!inner(owner_id))")
      .eq("id", data.answerId)
      .maybeSingle();

    if (!answer || answer.attempts?.tests?.owner_id !== context.userId) {
      throw new Error("Only the instructor who owns this test can review answers.");
    }

    const { error } = await supabaseAdmin
      .from("attempt_answers")
      .update({
        manual_score: data.manualScore,
        manual_feedback: data.manualFeedback.trim() || null,
      })
      .eq("id", data.answerId);
    if (error) {
      throw new Error(error.message || "Could not save the review.");
    }
    return { ok: true };
  });
