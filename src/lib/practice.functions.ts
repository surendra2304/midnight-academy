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
        "id, test_id, blueprint_version, status, tests(id, name, category, difficulty, code, question_count), sections(id, section_type, section_order, timing_seconds)",
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
