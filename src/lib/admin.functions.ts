import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const questionInput = z.object({
  id: z.string().uuid(),
  text: z.string().min(10),
  topic: z.string().max(120),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  concepts: z.array(z.string()).max(20),
  constraints: z.array(z.string()).max(20),
  referenceAnswer: z.string().max(4000),
});

export const listAdminTests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin, average } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);

    const { data: tests } = await context.supabase
      .from("tests")
      .select(
        "id, name, category, difficulty, status, code, question_count, created_at, attempts(score, status)",
      )
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false });

    return (tests ?? []).map((test) => {
      const scores = (test.attempts ?? [])
        .map((a) => a.score)
        .filter((s): s is number => typeof s === "number");
      return {
        id: test.id,
        name: test.name,
        category: test.category,
        difficulty: test.difficulty,
        status: test.status,
        code: test.code,
        questionCount: test.question_count,
        createdAt: test.created_at,
        participants: test.attempts?.length ?? 0,
        averageScore: average(scores),
      };
    });
  });

export const getAdminTest = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ testId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin, average } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);

    const { data: test } = await context.supabase
      .from("tests")
      .select("*")
      .eq("id", data.testId)
      .maybeSingle();
    if (!test) throw new Error("Test not found.");

    const { data: questions } = await context.supabase
      .from("questions")
      .select("*")
      .eq("test_id", test.id)
      .order("position", { ascending: true });

    const { data: attempts } = await context.supabase
      .from("attempts")
      .select("id, student_id, score, status, blur_count, started_at, completed_at")
      .eq("test_id", test.id)
      .order("score", { ascending: false, nullsFirst: false });

    const studentIds = (attempts ?? []).map((a) => a.student_id);
    const { data: profiles } = studentIds.length
      ? await context.supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", studentIds)
      : { data: [] };
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    const { data: answers } = await context.supabase
      .from("attempt_answers")
      .select("position, score, attempts!inner(test_id)")
      .eq("attempts.test_id", test.id);

    const byPosition = new Map<number, number[]>();
    for (const answer of answers ?? []) {
      if (answer.score === null) continue;
      const list = byPosition.get(answer.position) ?? [];
      list.push(Number(answer.score) * 10);
      byPosition.set(answer.position, list);
    }

    return {
      test: {
        id: test.id,
        name: test.name,
        category: test.category,
        difficulty: test.difficulty,
        status: test.status,
        code: test.code,
        secondsPerQuestion: test.seconds_per_question,
        responseSeconds: test.response_seconds,
        createdAt: test.created_at,
      },
      questions: (questions ?? []).map((q) => ({
        id: q.id,
        position: q.position,
        text: q.text,
        topic: q.topic,
        difficulty: q.difficulty,
        concepts: q.concepts,
        constraints: q.constraints,
        referenceAnswer: q.reference_answer,
        approved: q.approved,
      })),
      participants: (attempts ?? []).map((a) => ({
        id: a.id,
        name: profileMap.get(a.student_id)?.full_name || "Unnamed student",
        email: profileMap.get(a.student_id)?.email ?? "",
        score: a.score,
        status: a.status,
        blurCount: a.blur_count,
        completedAt: a.completed_at,
      })),
      averageScore: average(
        (attempts ?? []).map((a) => a.score).filter((s): s is number => typeof s === "number"),
      ),
      perQuestion: [...byPosition.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([position, scores]) => ({ q: `Q${position + 1}`, score: average(scores) })),
    };
  });

export const draftTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        name: z.string().min(3).max(160),
        category: z.string().min(2).max(60),
        difficulty: z.enum(["Easy", "Medium", "Hard"]),
        secondsPerQuestion: z.number().int().min(15).max(300),
        responseSeconds: z.number().int().min(30).max(900),
        source: z.string().min(20).max(40000),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, splitQuestions } = await import("./admin.server");
    const { draftQuestions } = await import("./evaluate.server");
    await assertAdmin(context.supabase, context.userId);

    const rawQuestions = splitQuestions(data.source);
    if (!rawQuestions.length) throw new Error("No questions could be read from that source.");

    const drafted = await draftQuestions(data.category, rawQuestions);

    const { data: test, error } = await context.supabase
      .from("tests")
      .insert({
        owner_id: context.userId,
        name: data.name,
        category: data.category,
        difficulty: data.difficulty,
        question_count: drafted.length,
        seconds_per_question: data.secondsPerQuestion,
        response_seconds: data.responseSeconds,
        status: "draft",
      })
      .select("id")
      .single();
    if (error || !test) throw new Error("Could not create the test.");

    const { error: insertError } = await context.supabase.from("questions").insert(
      drafted.map((q, index) => ({
        test_id: test.id,
        position: index,
        text: q.text,
        category: data.category,
        topic: q.topic,
        difficulty: q.difficulty,
        concepts: q.concepts,
        constraints: q.constraints,
        reference_answer: q.referenceAnswer,
        approved: false,
      })),
    );
    if (insertError) throw new Error("Could not save the drafted questions.");

    return { testId: test.id, count: drafted.length };
  });

export const saveQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        testId: z.string().uuid(),
        questions: z.array(questionInput).min(1).max(40),
        approve: z.boolean().default(false),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);

    for (const question of data.questions) {
      const { error } = await context.supabase
        .from("questions")
        .update({
          text: question.text,
          topic: question.topic,
          difficulty: question.difficulty,
          concepts: question.concepts,
          constraints: question.constraints,
          reference_answer: question.referenceAnswer,
          ...(data.approve ? { approved: true } : {}),
        })
        .eq("id", question.id)
        .eq("test_id", data.testId);
      if (error) throw new Error("Could not save the questions.");
    }
    return { ok: true };
  });

export const publishTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ testId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    const { generateCode } = await import("./attempts.server");
    await assertAdmin(context.supabase, context.userId);

    const { data: test } = await context.supabase
      .from("tests")
      .select("id, category, code, status")
      .eq("id", data.testId)
      .maybeSingle();
    if (!test) throw new Error("Test not found.");

    const { count } = await context.supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("test_id", test.id)
      .eq("approved", true);
    if (!count) throw new Error("Approve at least one question before publishing.");

    if (test.code && test.status === "active") return { code: test.code };

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const code = test.code ?? generateCode(test.category);
      const { error } = await context.supabase
        .from("tests")
        .update({ code, status: "active", question_count: count })
        .eq("id", test.id);
      if (!error) return { code };
      if (!error.message.includes("duplicate")) throw new Error("Could not publish the test.");
    }
    throw new Error("Could not generate a unique test code. Please try again.");
  });

export const setTestStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({ testId: z.string().uuid(), status: z.enum(["draft", "active", "completed"]) })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("tests")
      .update({ status: data.status })
      .eq("id", data.testId);
    if (error) throw new Error("Could not update the test.");
    return { ok: true };
  });

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin, average } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);

    const { data: tests } = await context.supabase
      .from("tests")
      .select("id, name, category, status, code, created_at, attempts(id, score, status, student_id)")
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false });

    const allAttempts = (tests ?? []).flatMap((t) =>
      (t.attempts ?? []).map((a) => ({ ...a, testName: t.name, category: t.category })),
    );
    const students = new Set(allAttempts.map((a) => a.student_id));
    const scores = allAttempts
      .map((a) => a.score)
      .filter((s): s is number => typeof s === "number");

    const { count: flagged } = await context.supabase
      .from("attempt_answers")
      .select("id", { count: "exact", head: true })
      .eq("flagged", true);

    return {
      totals: {
        tests: tests?.length ?? 0,
        activeTests: (tests ?? []).filter((t) => t.status === "active").length,
        students: students.size,
        attempts: allAttempts.length,
        averageScore: average(scores),
        flagged: flagged ?? 0,
      },
      recentTests: (tests ?? []).slice(0, 5).map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        status: t.status,
        code: t.code,
        participants: t.attempts?.length ?? 0,
        averageScore: average(
          (t.attempts ?? []).map((a) => a.score).filter((s): s is number => typeof s === "number"),
        ),
      })),
    };
  });

export const listAdminStudents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin, average } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);

    const { data: tests } = await context.supabase
      .from("tests")
      .select("id")
      .eq("owner_id", context.userId);
    const testIds = (tests ?? []).map((t) => t.id);
    if (!testIds.length) return [];

    const { data: attempts } = await context.supabase
      .from("attempts")
      .select("id, student_id, score, axes, status, completed_at")
      .in("test_id", testIds);

    const ids = [...new Set((attempts ?? []).map((a) => a.student_id))];
    const { data: profiles } = ids.length
      ? await context.supabase.from("profiles").select("id, full_name, email, institution").in("id", ids)
      : { data: [] };

    return (profiles ?? []).map((profile) => {
      const mine = (attempts ?? []).filter((a) => a.student_id === profile.id);
      const scores = mine.map((a) => a.score).filter((s): s is number => typeof s === "number");
      return {
        id: profile.id,
        name: profile.full_name || "Unnamed student",
        email: profile.email,
        institution: profile.institution,
        attempts: mine.length,
        averageScore: average(scores),
        lastActive:
          mine
            .map((a) => a.completed_at)
            .filter(Boolean)
            .sort()
            .pop() ?? null,
      };
    });
  });

export const getAdminStudent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ studentId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin, average } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);

    const { data: profile } = await context.supabase
      .from("profiles")
      .select("id, full_name, email, institution, year")
      .eq("id", data.studentId)
      .maybeSingle();
    if (!profile) throw new Error("Student not found.");

    const { data: tests } = await context.supabase
      .from("tests")
      .select("id, name, category")
      .eq("owner_id", context.userId);
    const testMap = new Map((tests ?? []).map((t) => [t.id, t]));

    const { data: attempts } = await context.supabase
      .from("attempts")
      .select("id, test_id, score, axes, status, blur_count, completed_at")
      .eq("student_id", data.studentId)
      .in("test_id", [...testMap.keys()])
      .order("completed_at", { ascending: false, nullsFirst: false });

    const scores = (attempts ?? [])
      .map((a) => a.score)
      .filter((s): s is number => typeof s === "number");

    return {
      profile: {
        id: profile.id,
        name: profile.full_name || "Unnamed student",
        email: profile.email,
        institution: profile.institution,
        year: profile.year,
      },
      averageScore: average(scores),
      attempts: (attempts ?? []).map((a) => ({
        id: a.id,
        testName: testMap.get(a.test_id)?.name ?? "Test",
        category: testMap.get(a.test_id)?.category ?? "",
        score: a.score,
        status: a.status,
        blurCount: a.blur_count,
        axes: a.axes as Record<string, number> | null,
        completedAt: a.completed_at,
      })),
    };
  });

export const getCohortAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin, average } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);

    const { data: tests } = await context.supabase
      .from("tests")
      .select("id, name, category")
      .eq("owner_id", context.userId);
    const testIds = (tests ?? []).map((t) => t.id);

    const { data: attempts } = testIds.length
      ? await context.supabase
          .from("attempts")
          .select("id, test_id, score, axes, completed_at")
          .in("test_id", testIds)
          .eq("status", "evaluated")
      : { data: [] };

    const { data: answers } = testIds.length
      ? await context.supabase
          .from("attempt_answers")
          .select("position, score, attempts!inner(test_id)")
          .in("attempts.test_id", testIds)
      : { data: [] };

    const axisKeys = ["objective", "constraint", "io", "concept", "interpretation"] as const;
    const axes = axisKeys.reduce(
      (acc, key) => {
        acc[key] = average(
          (attempts ?? [])
            .map((a) => (a.axes as Record<string, number> | null)?.[key])
            .filter((v): v is number => typeof v === "number"),
        );
        return acc;
      },
      {} as Record<(typeof axisKeys)[number], number>,
    );

    const byCategory = new Map<string, number[]>();
    const byTest = new Map<string, number[]>();
    for (const attempt of attempts ?? []) {
      if (typeof attempt.score !== "number") continue;
      const test = (tests ?? []).find((t) => t.id === attempt.test_id);
      if (!test) continue;
      byCategory.set(test.category, [...(byCategory.get(test.category) ?? []), attempt.score]);
      byTest.set(test.name, [...(byTest.get(test.name) ?? []), attempt.score]);
    }

    const byPosition = new Map<number, number[]>();
    for (const answer of answers ?? []) {
      if (answer.score === null) continue;
      byPosition.set(answer.position, [
        ...(byPosition.get(answer.position) ?? []),
        Number(answer.score) * 10,
      ]);
    }

    return {
      attempts: attempts?.length ?? 0,
      cohortAverage: average(
        (attempts ?? []).map((a) => a.score).filter((s): s is number => typeof s === "number"),
      ),
      axes,
      categoryPerformance: [...byCategory.entries()]
        .map(([category, scores]) => ({ category, score: average(scores), attempts: scores.length }))
        .sort((a, b) => b.score - a.score),
      testPerformance: [...byTest.entries()].map(([name, scores]) => ({
        name,
        score: average(scores),
      })),
      perQuestionDifficulty: [...byPosition.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([position, scores]) => ({ q: `Q${position + 1}`, score: average(scores) })),
    };
  });

export const listFlaggedEvaluations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);

    const { data: answers } = await context.supabase
      .from("attempt_answers")
      .select(
        "id, response, score, feedback, missed_concepts, missed_constraints, position, attempt_id, questions(text, reference_answer, concepts, constraints), attempts!inner(student_id, test_id, tests!inner(name, owner_id))",
      )
      .eq("flagged", true)
      .eq("attempts.tests.owner_id", context.userId);

    const studentIds = [...new Set((answers ?? []).map((a) => a.attempts?.student_id))].filter(
      (id): id is string => Boolean(id),
    );
    const { data: profiles } = studentIds.length
      ? await context.supabase.from("profiles").select("id, full_name").in("id", studentIds)
      : { data: [] };
    const names = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

    return (answers ?? []).map((a) => ({
      id: a.id,
      attemptId: a.attempt_id,
      position: a.position,
      response: a.response,
      score: a.score === null ? null : Number(a.score),
      feedback: a.feedback,
      missedConcepts: a.missed_concepts,
      missedConstraints: a.missed_constraints,
      question: a.questions,
      testName: a.attempts?.tests?.name ?? "Test",
      studentName: names.get(a.attempts?.student_id ?? "") || "Unnamed student",
    }));
  });

export const resolveFlag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        answerId: z.string().uuid(),
        score: z.number().min(0).max(10).optional(),
        feedback: z.string().max(2000).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);

    const { error } = await context.supabase
      .from("attempt_answers")
      .update({
        flagged: false,
        ...(data.score === undefined ? {} : { score: data.score }),
        ...(data.feedback === undefined ? {} : { feedback: data.feedback }),
      })
      .eq("id", data.answerId);
    if (error) throw new Error("Could not resolve this flag.");
    return { ok: true };
  });
