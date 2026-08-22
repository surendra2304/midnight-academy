import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AxisKey, AxisScores } from "./mock-data";
import { AXIS_KEYS } from "./mock-data";
import { weakestAxis, strongestAxis } from "./axes";

export type StudentAnalytics = {
  profile: {
    fullName: string;
    email: string;
    institution: string | null;
    year: string | null;
    onboarded: boolean;
    codeNumber: string | null;
    branch: string | null;
  };
  stats: {
    testsTaken: number;
    evaluatedCount: number;
    averageUnderstanding: number;
    bestScore: number;
    streak: number;
  };
  axes: AxisScores;
  weakestAxis: AxisKey;
  strongestAxis: AxisKey;
  insights: {
    strength: string;
    weakness: string;
    recommendation: string;
    weakAxis: AxisKey;
  };
  recentAttempts: Array<{
    id: string;
    testName: string;
    category: string;
    difficulty: string;
    score: number | null;
    status: string;
    date: string;
    questionsCount: number;
    testCode: string;
  }>;
  progressSeries: Array<{
    label: string;
    score: number;
    date: string;
  }>;
  categoryPerformance: Array<{
    category: string;
    score: number;
    attemptsCount: number;
  }>;
};

const DEFAULT_AXES: AxisScores = {
  objective: 0,
  constraint: 0,
  io: 0,
  concept: 0,
  interpretation: 0,
};

export const getStudentDashboardData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StudentAnalytics> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1 & 2. Fetch Student Profile and Attempts concurrently
    const [{ data: profileRow }, { data: attempts }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("full_name, email, institution, year, onboarded, code_number, branch")
        .eq("id", context.userId)
        .maybeSingle(),
      supabaseAdmin
        .from("attempts")
        .select(
          "id, test_id, status, score, axes, started_at, completed_at, tests(name, category, difficulty, code, question_count)",
        )
        .eq("student_id", context.userId)
        .order("started_at", { ascending: false }),
    ]);

    const profile = {
      fullName: profileRow?.full_name || "Student",
      email: profileRow?.email || "",
      institution: profileRow?.institution || null,
      year: profileRow?.year || null,
      onboarded: profileRow?.onboarded ?? false,
      codeNumber: profileRow?.code_number || null,
      branch: profileRow?.branch || null,
    };

    const allAttempts = attempts ?? [];
    const evaluated = allAttempts.filter((a) => a.status === "evaluated" && a.score !== null);

    // 3. Compute stats
    const testsTaken = allAttempts.length;
    const evaluatedCount = evaluated.length;
    const scores = evaluated.map((a) => Number(a.score));
    const averageUnderstanding =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

    // Calculate streak (consecutive days with completed attempts)
    let streak = 0;
    if (evaluated.length > 0) {
      const dates = Array.from(
        new Set(
          evaluated
            .map((a) =>
              a.completed_at ? new Date(a.completed_at).toISOString().split("T")[0] : null,
            )
            .filter((d): d is string => Boolean(d)),
        ),
      ).sort((a, b) => b.localeCompare(a));

      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      if (dates.length > 0 && (dates[0] === today || dates[0] === yesterday)) {
        streak = 1;
        let prevStr = dates[0];
        for (let i = 1; i < dates.length; i++) {
          const currStr = dates[i];
          if (!prevStr || !currStr) break;
          const prev = new Date(prevStr);
          const curr = new Date(currStr);
          const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 3600 * 24));
          if (diffDays === 1) {
            streak++;
            prevStr = currStr;
          } else {
            break;
          }
        }
      }
    }

    // 4. Compute aggregate comprehension profile axes
    const aggregateAxes: AxisScores = { ...DEFAULT_AXES };
    if (evaluated.length > 0) {
      for (const key of AXIS_KEYS) {
        const values: number[] = [];
        for (const a of evaluated) {
          const aAxes = a.axes as Record<string, number> | null;
          if (aAxes && typeof aAxes[key] === "number") {
            values.push(aAxes[key]);
          }
        }
        aggregateAxes[key] =
          values.length > 0 ? Math.round(values.reduce((s, v) => s + v, 0) / values.length) : 0;
      }
    }

    const weak = weakestAxis(aggregateAxes);
    const strong = strongestAxis(aggregateAxes);

    // 5. Generate deterministic, real data-driven insights
    const axisLabels: Record<AxisKey, string> = {
      objective: "Core Objective Identification",
      constraint: "Boundary Constraints & Limits",
      io: "Input/Output & Data Types",
      concept: "Underlying Technical Concepts",
      interpretation: "Scenario Comprehension",
    };

    const insights = {
      strength:
        evaluated.length > 0
          ? `Reliable at capturing ${axisLabels[strong]} (${aggregateAxes[strong]}% avg).`
          : "Complete your first evaluation to discover your strongest reading axis.",
      weakness:
        evaluated.length > 0
          ? `Frequent oversights in ${axisLabels[weak]} (${aggregateAxes[weak]}% avg).`
          : "Take a test to identify potential reading blindspots.",
      recommendation:
        evaluated.length > 0
          ? `Focus on identifying ${axisLabels[weak].toLowerCase()} before formulating explanations.`
          : "Start by entering a test code or practicing with foundational sets.",
      weakAxis: weak,
    };

    // 6. Recent attempts formatted
    const recentAttempts = allAttempts.map((a) => {
      const test = a.tests as {
        name?: string;
        category?: string;
        difficulty?: string;
        code?: string;
        question_count?: number;
      } | null;
      return {
        id: a.id,
        testName: test?.name || "Unknown Test",
        category: test?.category || "Unknown",
        difficulty: test?.difficulty || "Medium",
        score: a.score !== null ? Number(a.score) : null,
        status: a.status,
        date: a.started_at,
        questionsCount: test?.question_count || 0,
        testCode: test?.code || "",
      };
    });

    // 7. Progress Series (chronological order)
    const progressSeries = [...evaluated]
      .sort((a, b) => (a.completed_at || "").localeCompare(b.completed_at || ""))
      .map((a, i) => {
        const test = a.tests as { name?: string } | null;
        return {
          label: test?.name || `Attempt ${i + 1}`,
          score: Number(a.score),
          date: a.completed_at || a.started_at,
        };
      });

    // 8. Category performance aggregation
    const categoryMap = new Map<string, { total: number; count: number }>();
    for (const a of evaluated) {
      const test = a.tests as { category?: string } | null;
      const cat = test?.category || "General";
      const current = categoryMap.get(cat) || { total: 0, count: 0 };
      categoryMap.set(cat, {
        total: current.total + Number(a.score),
        count: current.count + 1,
      });
    }

    const categoryPerformance = Array.from(categoryMap.entries()).map(([cat, data]) => ({
      category: cat,
      score: Math.round(data.total / data.count),
      attemptsCount: data.count,
    }));

    return {
      profile,
      stats: {
        testsTaken,
        evaluatedCount,
        averageUnderstanding,
        bestScore,
        streak,
      },
      axes: aggregateAxes,
      weakestAxis: weak,
      strongestAxis: strong,
      insights,
      recentAttempts,
      progressSeries,
      categoryPerformance,
    };
  });

export const updateStudentProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z
      .object({
        fullName: z.string().min(1).max(100),
        year: z.string().max(80).optional(),
        branch: z.string().max(60).optional(),
        regdNumber: z
          .string()
          .regex(/^[A-Za-z0-9]{10}$/, "Registration number must be exactly 10 characters.")
          .optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const updatePayload: {
      full_name: string;
      year?: string;
      branch?: string;
      code_number?: string;
    } = {
      full_name: data.fullName,
    };
    if (data.year !== undefined) {
      updatePayload.year = data.year;
    }
    if (data.branch !== undefined) {
      updatePayload.branch = data.branch;
    }
    if (data.regdNumber !== undefined) {
      updatePayload.code_number = data.regdNumber.trim().toUpperCase();
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update(updatePayload)
      .eq("id", context.userId);

    if (error) throw new Error("Could not update profile.");
    return { ok: true };
  });

export const listPracticeSets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: tests } = await context.supabase
      .from("tests")
      .select("id, name, category, difficulty, question_count, seconds_per_question, code")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    return (tests ?? []).map((t) => ({
      id: t.id,
      title: t.name,
      category: t.category,
      difficulty: t.difficulty,
      questions: t.question_count,
      secondsPerQuestion: t.seconds_per_question,
      code: t.code,
      focus: `${t.category} technical comprehension`,
      minutes: Math.ceil((t.question_count * (t.seconds_per_question + 120)) / 60),
    }));
  });
