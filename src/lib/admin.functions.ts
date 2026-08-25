import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AxisKey } from "@/lib/mock-data";

const questionInput = z.object({
  id: z.string().uuid(),
  text: z.string().min(10),
  topic: z.string().max(120),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  concepts: z.array(z.string()).max(20),
  constraints: z.array(z.string()).max(20),
  referenceAnswer: z.string().max(4000),
  approved: z.boolean().optional(),
});

export const listAdminTests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin, average, autoFinalizeStaleAttempts } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);

    const { data: rawTests } = await context.supabase
      .from("tests")
      .select("id")
      .eq("owner_id", context.userId);
    if (rawTests?.length) {
      await autoFinalizeStaleAttempts(context.supabase, rawTests.map((t) => t.id));
    }

    const { data: tests } = await context.supabase
      .from("tests")
      .select(
        "id, name, category, difficulty, status, code, question_count, seconds_per_question, created_at, attempts(score, status)",
      )
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false });

    return (tests ?? []).map((test) => {
      const scores = (test.attempts ?? [])
        .map((a) => a.score)
        .filter((s): s is number => typeof s === "number");
      const activeParticipants = (test.attempts ?? []).filter(
        (a) => a.status === "in_progress",
      ).length;
      return {
        id: test.id,
        name: test.name,
        category: test.category,
        difficulty: test.difficulty,
        status: test.status,
        code: test.code,
        questions: test.question_count,
        secondsPerQuestion: test.seconds_per_question,
        created: test.created_at,
        participants: test.attempts?.length ?? 0,
        activeParticipants,
        average: average(scores),
      };
    });
  });

export const getAdminTest = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ testId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin, average, autoFinalizeStaleAttempts } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);

    await autoFinalizeStaleAttempts(context.supabase, [data.testId]);

    const { data: test } = await context.supabase
      .from("tests")
      .select("*")
      .eq("id", data.testId)
      .eq("owner_id", context.userId)
      .maybeSingle();

    if (!test) throw new Error("Test not found or unauthorized.");

    const [{ data: questions }, { data: attempts }, { data: answers }] = await Promise.all([
      context.supabase
        .from("questions")
        .select("*")
        .eq("test_id", test.id)
        .order("position", { ascending: true }),
      context.supabase
        .from("attempts")
        .select("id, student_id, score, status, blur_count, started_at, completed_at")
        .eq("test_id", test.id)
        .order("score", { ascending: false, nullsFirst: false }),
      context.supabase
        .from("attempt_answers")
        .select("position, score, attempts!inner(test_id)")
        .eq("attempts.test_id", test.id),
    ]);

    const studentIds = (attempts ?? []).map((a) => a.student_id);
    const { data: profiles } = studentIds.length
      ? await context.supabase
          .from("profiles")
          .select("id, full_name, email, code_number")
          .in("id", studentIds)
      : { data: [] };
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    const byPosition = new Map<number, number[]>();
    for (const answer of answers ?? []) {
      if (answer.score === null) continue;
      const list = byPosition.get(answer.position) ?? [];
      list.push(Number(answer.score) * 10);
      byPosition.set(answer.position, list);
    }

    // Order participants by the students college code / roll number
    const sortedAttempts = [...(attempts ?? [])].sort((x, y) => {
      const cx = profileMap.get(x.student_id)?.code_number ?? "";
      const cy = profileMap.get(y.student_id)?.code_number ?? "";
      if (cx && cy) return cx.localeCompare(cy, undefined, { numeric: true });
      if (cx) return -1;
      if (cy) return 1;
      return 0;
    });

    const activeParticipants = (attempts ?? []).filter(
      (a) => a.status === "in_progress",
    ).length;

    return {
      test: {
        id: test.id,
        name: test.name,
        category: test.category,
        difficulty: test.difficulty,
        status: test.status,
        code: test.code,
        questions: test.question_count,
        secondsPerQuestion: test.seconds_per_question,
        responseSeconds: test.response_seconds,
        created: test.created_at,
        participants: attempts?.length ?? 0,
        activeParticipants,
        average: average(
          (attempts ?? []).map((a) => a.score).filter((s): s is number => typeof s === "number"),
        ),
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
      participants: sortedAttempts.map((a) => {
        const prof = profileMap.get(a.student_id);
        const name = prof?.full_name || "Student";
        const initials = name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        return {
          id: a.student_id,
          attemptId: a.id,
          name,
          initials: initials || "ST",
          email: prof?.email ?? "",
          codeNumber: prof?.code_number ?? "",
          score: a.score !== null ? Number(a.score) : 0,
          status: a.status,
          blurCount: a.blur_count,
          completedAt: a.completed_at,
        };
      }),
      perQuestionDifficulty: [...byPosition.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([position, scores]) => ({ q: `Q${position + 1}`, score: average(scores) })),
    };
  });

export const draftTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z
      .object({
        name: z.string().min(3).max(160),
        category: z.string().min(2).max(60),
        difficulty: z.enum(["Easy", "Medium", "Hard"]),
        secondsPerQuestion: z.number().int().min(15).max(300),
        responseSeconds: z.number().int().min(30).max(900),
        source: z.string().min(20).max(40000),
        useAi: z.boolean().optional().default(true),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, splitQuestions } = await import("./admin.server");
    const { draftQuestions } = await import("./evaluate.server");
    await assertAdmin(context.supabase, context.userId);

    const rawQuestions = splitQuestions(data.source);
    if (!rawQuestions.length) throw new Error("No questions could be read from that source.");

    const drafted = data.useAi
      ? await draftQuestions(data.category, rawQuestions)
      : rawQuestions.map((text) => ({
          text: text.trim(),
          topic: "",
          difficulty: "Medium" as string,
          concepts: [],
          constraints: [],
          referenceAnswer: "",
        }));

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

    const { data: insertedQuestions, error: insertError } = await context.supabase
      .from("questions")
      .insert(
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
      )
      .select(
        "id, position, text, topic, difficulty, concepts, constraints, reference_answer, approved",
      );

    if (insertError) throw new Error("Could not save the drafted questions.");

    return {
      testId: test.id,
      count: drafted.length,
      questions: insertedQuestions || [],
    };
  });

export const saveQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
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

    // Verify test ownership
    const { data: test } = await context.supabase
      .from("tests")
      .select("id")
      .eq("id", data.testId)
      .eq("owner_id", context.userId)
      .maybeSingle();
    if (!test) throw new Error("Test not found or unauthorized.");

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
          ...(question.approved !== undefined ? { approved: question.approved } : {}),
        })
        .eq("id", question.id)
        .eq("test_id", data.testId);
      if (error) throw new Error("Could not save the questions.");
    }
    return { ok: true };
  });

export const publishTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ testId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    const { generateCode } = await import("./attempts.server");
    await assertAdmin(context.supabase, context.userId);

    const { data: test } = await context.supabase
      .from("tests")
      .select("id, category, code, status")
      .eq("id", data.testId)
      .eq("owner_id", context.userId)
      .maybeSingle();
    if (!test) throw new Error("Test not found or unauthorized.");

    const { count } = await context.supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("test_id", test.id)
      .eq("approved", true);
    if (!count || count === 0) throw new Error("Approve at least one question before publishing.");

    if (test.code && test.status === "active") return { code: test.code };

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const code = test.code ?? generateCode(test.category);
      const { error } = await context.supabase
        .from("tests")
        .update({ code, status: "active", question_count: count })
        .eq("id", test.id);
      if (!error) {
        await context.supabase.from("notifications").insert({
          user_id: context.userId,
          title: "Test Published",
          message: `Test code is ${code}.`,
          type: "system",
          link: `/admin/tests/${test.id}`,
        });
        return { code };
      }
      if (!error.message.includes("duplicate")) throw new Error("Could not publish the test.");
    }
    throw new Error("Could not generate a unique test code. Please try again.");
  });

export const setTestStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
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
      .eq("id", data.testId)
      .eq("owner_id", context.userId);

    if (error) throw new Error("Could not update the test.");
    return { ok: true };
  });

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin, average, autoFinalizeStaleAttempts } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);

    const { data: rawTests } = await context.supabase
      .from("tests")
      .select("id")
      .eq("owner_id", context.userId);
    if (rawTests?.length) {
      await autoFinalizeStaleAttempts(context.supabase, rawTests.map((t) => t.id));
    }

    const [{ data: tests }, { count: flagged }] = await Promise.all([
      context.supabase
        .from("tests")
        .select(
          "id, name, category, status, code, question_count, seconds_per_question, created_at, attempts(id, score, status, student_id, completed_at)",
        )
        .eq("owner_id", context.userId)
        .order("created_at", { ascending: false }),
      context.supabase
        .from("attempt_answers")
        .select("id, attempts!inner(tests!inner(owner_id))", { count: "exact", head: true })
        .eq("flagged", true)
        .eq("attempts.tests.owner_id", context.userId),
    ]);

    const allAttempts = (tests ?? []).flatMap((t) =>
      (t.attempts ?? []).map((a) => ({ ...a, testName: t.name, category: t.category })),
    );
    const students = new Set(allAttempts.map((a) => a.student_id));
    const scores = allAttempts
      .map((a) => a.score)
      .filter((s): s is number => typeof s === "number");

    // Recent student submissions across this instructor's tests
    const recentRaw = [...allAttempts]
      .sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""))
      .slice(0, 5);
    const recentIds = [...new Set(recentRaw.map((a) => a.student_id))];
    const { data: recentProfiles } = recentIds.length
      ? await context.supabase.from("profiles").select("id, full_name").in("id", recentIds)
      : { data: [] };
    const nameMap = new Map((recentProfiles ?? []).map((p) => [p.id, p.full_name]));
    const recentSubmissions = recentRaw.map((a) => ({
      attemptId: a.id,
      studentName: nameMap.get(a.student_id) || "Student",
      testName: a.testName,
      score: typeof a.score === "number" ? a.score : null,
      status: a.status,
      completedAt: a.completed_at,
    }));

    const testPerformance = (tests ?? []).map((t) => {
      const tScores = (t.attempts ?? [])
        .map((a) => a.score)
        .filter((s): s is number => typeof s === "number");
      return {
        name: t.name,
        score: average(tScores),
        participants: t.attempts?.length ?? 0,
      };
    });

    return {
      totals: {
        tests: tests?.length ?? 0,
        activeTests: (tests ?? []).filter((t) => t.status === "active").length,
        students: students.size,
        attempts: allAttempts.length,
        averageScore: average(scores),
        flagged: flagged ?? 0,
      },
      testPerformance,
      recentSubmissions,
      recentTests: (tests ?? []).slice(0, 5).map((t) => {
        const tScores = (t.attempts ?? [])
          .map((a) => a.score)
          .filter((s): s is number => typeof s === "number");
        const activeParticipants = (t.attempts ?? []).filter(
          (a) => a.status === "in_progress",
        ).length;
        return {
          id: t.id,
          name: t.name,
          category: t.category,
          status: t.status,
          code: t.code,
          questions: t.question_count,
          participants: t.attempts?.length ?? 0,
          activeParticipants,
          average: average(tScores),
        };
      }),
    };
  });

export const listAdminStudents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin, average, weakestAxis } = await import("./admin.server");
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
      ? await context.supabase
          .from("profiles")
          .select("id, full_name, email, institution")
          .in("id", ids)
      : { data: [] };

    return (profiles ?? []).map((profile) => {
      const mine = (attempts ?? []).filter((a) => a.student_id === profile.id);
      const scores = mine.map((a) => a.score).filter((s): s is number => typeof s === "number");
      const name = profile.full_name || "Student";
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      return {
        id: profile.id,
        name,
        initials: initials || "ST",
        email: profile.email,
        institution: profile.institution,
        attempts: mine.length,
        average: average(scores),
        weakest: weakestAxis(mine) as AxisKey | null,
        lastActive:
          mine
            .map((a) => a.completed_at)
            .filter(Boolean)
            .sort()
            .pop() ?? "Recently",
      };
    });
  });

export const getAdminStudent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ studentId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin, average, weakestAxis } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);

    const { data: profile } = await context.supabase
      .from("profiles")
      .select("id, full_name, email, institution, year, branch, code_number")
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
      .select("id, test_id, score, axes, status, blur_count, completed_at, started_at")
      .eq("student_id", data.studentId)
      .in("test_id", [...testMap.keys()])
      .order("completed_at", { ascending: false, nullsFirst: false });

    const scores = (attempts ?? [])
      .map((a) => a.score)
      .filter((s): s is number => typeof s === "number");

    const name = profile.full_name || "Student";
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return {
      student: {
        id: profile.id,
        name,
        initials: initials || "ST",
        email: profile.email,
        institution: profile.institution,
        year: profile.year,
        branch: profile.branch,
        codeNumber: profile.code_number,
        attempts: attempts?.length ?? 0,
        average: average(scores),
        weakest: weakestAxis(attempts ?? []) as AxisKey | null,
        lastActive: attempts?.[0]?.completed_at ?? "Recently",
      },
      attempts: (attempts ?? []).map((a) => ({
        id: a.id,
        name: testMap.get(a.test_id)?.name ?? "Test",
        category: testMap.get(a.test_id)?.category ?? "General",
        score: a.score !== null ? Number(a.score) : 0,
        status: a.status,
        date: a.completed_at || a.started_at,
      })),
    };
  });

export const getCohortAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin, average, weakestAxis } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);

    const { data: tests } = await context.supabase
      .from("tests")
      .select("id, name, category")
      .eq("owner_id", context.userId);
    const testIds = (tests ?? []).map((t) => t.id);

    const [{ data: attempts }, { data: answers }] = testIds.length
      ? await Promise.all([
          context.supabase
            .from("attempts")
            .select("id, test_id, score, axes, completed_at")
            .in("test_id", testIds)
            .eq("status", "evaluated"),
          context.supabase
            .from("attempt_answers")
            .select("position, score, attempts!inner(test_id)")
            .in("attempts.test_id", testIds),
        ])
      : [{ data: [] }, { data: [] }];

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
        .map(([category, scores]) => ({
          category,
          score: average(scores),
          attempts: scores.length,
        }))
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

export const deleteQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ questionId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);

    const { data: question } = await context.supabase
      .from("questions")
      .select("id, test_id, tests!inner(owner_id)")
      .eq("id", data.questionId)
      .maybeSingle();

    const owner =
      (question as { tests?: Array<{ owner_id: string }> } | null)?.tests?.[0]?.owner_id ??
      (question as { tests?: { owner_id: string } } | null)?.tests?.owner_id;
    if (!question || owner !== context.userId) {
      throw new Error("Question not found or unauthorized.");
    }

    const { error } = await context.supabase.from("questions").delete().eq("id", data.questionId);
    if (error) throw new Error(error.message || "Could not delete the question.");

    // Keep the stored question_count in sync
    const { count } = await context.supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("test_id", question.test_id);
    await context.supabase
      .from("tests")
      .update({ question_count: count ?? 0 })
      .eq("id", question.test_id);

    return { ok: true };
  });

/** Deletes an entire instructor-owned test (questions and attempts cascade). */
export const deleteTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ testId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);

    const { data: test } = await context.supabase
      .from("tests")
      .select("id")
      .eq("id", data.testId)
      .eq("owner_id", context.userId)
      .maybeSingle();
    if (!test) throw new Error("Test not found or unauthorized.");

    const { error } = await context.supabase.from("tests").delete().eq("id", data.testId);
    if (error) throw new Error(error.message || "Could not delete the test.");
    return { ok: true };
  });
