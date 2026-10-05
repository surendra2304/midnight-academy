/**
 * Production TOEFL test catalog.
 * IMPORTANT: published production catalog must fail closed.
 * No synthetic/fallback assessments are allowed in production.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface PublishedTestItem {
  id: string;
  testVersionId: string;
  name: string;
  category: string;
  difficulty: string;
  code: string | null;
  questionCount: number;
  description: string | null;
  sections: Array<{
    id: string;
    sectionType: "reading" | "listening" | "writing" | "speaking";
    sectionOrder: number;
    timingSeconds: number;
  }>;
}

export const getPublishedTests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: versions, error } = await supabaseAdmin
      .from("test_versions")
      .select(
        "id, test_id, blueprint_version, status, tests(id, name, category, difficulty, code, question_count, description), sections(id, section_type, section_order, timing_seconds)",
      )
      .eq("status", "published");

    if (error) {
      throw new Error(`Failed to load published test catalog: ${error.message}`);
    }

    const rows = (versions ?? [])
      .map((version) => {
        const test = version.tests as unknown as {
          id: string;
          name: string;
          category: string | null;
          difficulty: string | null;
          code: string | null;
          question_count: number | null;
          description: string | null;
        } | null;

        const sections =
          (version.sections as unknown as Array<{
            id: string;
            section_type: "reading" | "listening" | "writing" | "speaking";
            section_order: number;
            timing_seconds: number;
          }>) ?? [];

        if (!test || sections.length === 0) return null;

        return {
          id: test.id,
          testVersionId: version.id,
          name: test.name,
          category: test.category ?? "Assessment",
          difficulty: test.difficulty ?? "Middle",
          code: test.code,
          questionCount: test.question_count ?? 0,
          description: test.description,
          sections: sections
            .sort((a, b) => a.section_order - b.section_order)
            .map((section) => ({
              id: section.id,
              sectionType: section.section_type,
              sectionOrder: section.section_order,
              timingSeconds: section.timing_seconds,
            })),
        } satisfies PublishedTestItem;
      })
      .filter((value): value is PublishedTestItem => Boolean(value));

    if (rows.length === 0) {
      return [];
    }

    return rows;
  });

export interface ToeflAttemptActivity {
  id: string;
  testVersionId: string | null;
  testName: string;
  examMode: string | null;
  selectedSectionType: "reading" | "listening" | "writing" | "speaking" | null;
  status: string;
  startedAt: string;
  completedAt: string | null;
  report: {
    overallBand: number | null;
    comparableScore: number | null;
    readingBand: number | null;
    listeningBand: number | null;
    writingBand: number | null;
    speakingBand: number | null;
  } | null;
}

/** Returns only the authenticated student's attempts and persisted score reports. */
export const getMyToeflAttemptActivity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ToeflAttemptActivity[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: attempts, error: attemptsError } = await supabaseAdmin
      .from("attempts")
      .select(
        "id, test_version_id, exam_mode, selected_section_type, status, started_at, completed_at, tests(name)",
      )
      .eq("student_id", context.userId)
      .order("started_at", { ascending: false })
      .limit(40);

    if (attemptsError) {
      throw new Error(`Failed to load your TOEFL practice history: ${attemptsError.message}`);
    }

    const attemptIds = (attempts ?? []).map((attempt) => attempt.id);
    const reportsQuery = attemptIds.length
      ? await supabaseAdmin
          .from("score_reports")
          .select(
            "attempt_id, overall_band, comparable_score, reading_band, listening_band, writing_band, speaking_band, skill_breakdown",
          )
          .in("attempt_id", attemptIds)
      : { data: [], error: null };

    if (reportsQuery.error) {
      throw new Error(`Failed to load your TOEFL score history: ${reportsQuery.error.message}`);
    }

    const reportByAttemptId = new Map(
      (reportsQuery.data ?? []).map((report) => [report.attempt_id, report]),
    );

    return (attempts ?? []).map((attempt) => {
      const test = attempt.tests as unknown as { name?: string } | null;
      const report = reportByAttemptId.get(attempt.id);
      const scoringMetadata =
        report?.skill_breakdown && typeof report.skill_breakdown === "object"
          ? (report.skill_breakdown as Record<string, unknown>)
          : null;
      const hasFullScoreCoverage = scoringMetadata?.["hasFullScoreCoverage"] === true;
      return {
        id: attempt.id,
        testVersionId: attempt.test_version_id,
        testName: test?.name ?? "TOEFL practice test",
        examMode: attempt.exam_mode,
        selectedSectionType: attempt.selected_section_type,
        status: attempt.status,
        startedAt: attempt.started_at,
        completedAt: attempt.completed_at,
        report: report
          ? {
              overallBand:
                typeof report.overall_band === "number" ? Number(report.overall_band) : null,
              comparableScore:
                hasFullScoreCoverage && typeof report.comparable_score === "number"
                  ? Number(report.comparable_score)
                  : null,
              readingBand:
                typeof report.reading_band === "number" ? Number(report.reading_band) : null,
              listeningBand:
                typeof report.listening_band === "number" ? Number(report.listening_band) : null,
              writingBand:
                typeof report.writing_band === "number" ? Number(report.writing_band) : null,
              speakingBand:
                typeof report.speaking_band === "number" ? Number(report.speaking_band) : null,
            }
          : null,
      };
    });
  });
