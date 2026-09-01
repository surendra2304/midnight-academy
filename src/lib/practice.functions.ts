/**
 * Practice & Test Catalog Server Functions
 * Fetches published test blueprints and section details from Supabase with robust fallback series.
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

// Built-in Standardized 2026 Test Blueprints (guaranteed playable out-of-the-box)
export const DEFAULT_MOCK_SERIES: PublishedTestItem[] = [
  {
    id: "f1000000-0000-0000-0000-000000000000",
    testVersionId: "f2000000-0000-0000-0000-000000000000",
    name: "Lunar Series 01: Official Diagnostic Benchmark",
    category: "Full Mock",
    difficulty: "Medium",
    code: "MA-LUNAR-01",
    questionCount: 12,
    sections: [
      { id: "f3000000-0000-0000-0000-000000000010", sectionType: "reading", sectionOrder: 0, timingSeconds: 1800 },
      { id: "f3000000-0000-0000-0000-000000000020", sectionType: "listening", sectionOrder: 1, timingSeconds: 1740 },
      { id: "f3000000-0000-0000-0000-000000000030", sectionType: "writing", sectionOrder: 2, timingSeconds: 1380 },
      { id: "f3000000-0000-0000-0000-000000000040", sectionType: "speaking", sectionOrder: 3, timingSeconds: 480 },
    ],
  },
  {
    id: "f1000000-0000-0000-0000-000000000002",
    testVersionId: "f2000000-0000-0000-0000-000000000002",
    name: "Solar Series 02: Advanced Adaptive Assessment",
    category: "Full Mock",
    difficulty: "Hard",
    code: "MA-SOLAR-02",
    questionCount: 12,
    sections: [
      { id: "f3000000-0000-0000-0000-000000000012", sectionType: "reading", sectionOrder: 0, timingSeconds: 1800 },
      { id: "f3000000-0000-0000-0000-000000000022", sectionType: "listening", sectionOrder: 1, timingSeconds: 1740 },
      { id: "f3000000-0000-0000-0000-000000000032", sectionType: "writing", sectionOrder: 2, timingSeconds: 1380 },
      { id: "f3000000-0000-0000-0000-000000000042", sectionType: "speaking", sectionOrder: 3, timingSeconds: 480 },
    ],
  },
  {
    id: "f1000000-0000-0000-0000-000000000003",
    testVersionId: "f2000000-0000-0000-0000-000000000003",
    name: "Nebula Series 03: Natural Sciences Focus",
    category: "Full Mock",
    difficulty: "Medium",
    code: "MA-NEBULA-03",
    questionCount: 12,
    sections: [
      { id: "f3000000-0000-0000-0000-000000000013", sectionType: "reading", sectionOrder: 0, timingSeconds: 1800 },
      { id: "f3000000-0000-0000-0000-000000000023", sectionType: "listening", sectionOrder: 1, timingSeconds: 1740 },
      { id: "f3000000-0000-0000-0000-000000000033", sectionType: "writing", sectionOrder: 2, timingSeconds: 1380 },
      { id: "f3000000-0000-0000-0000-000000000043", sectionType: "speaking", sectionOrder: 3, timingSeconds: 480 },
    ],
  },
  {
    id: "f1000000-0000-0000-0000-000000000004",
    testVersionId: "f2000000-0000-0000-0000-000000000004",
    name: "Eclipse Series 04: Social Sciences & Pragmatics",
    category: "Full Mock",
    difficulty: "Hard",
    code: "MA-ECLIPSE-04",
    questionCount: 12,
    sections: [
      { id: "f3000000-0000-0000-0000-000000000014", sectionType: "reading", sectionOrder: 0, timingSeconds: 1800 },
      { id: "f3000000-0000-0000-0000-000000000024", sectionType: "listening", sectionOrder: 1, timingSeconds: 1740 },
      { id: "f3000000-0000-0000-0000-000000000034", sectionType: "writing", sectionOrder: 2, timingSeconds: 1380 },
      { id: "f3000000-0000-0000-0000-000000000044", sectionType: "speaking", sectionOrder: 3, timingSeconds: 480 },
    ],
  },
  {
    id: "f1000000-0000-0000-0000-000000000005",
    testVersionId: "f2000000-0000-0000-0000-000000000005",
    name: "Polaris Series 05: Speed & Efficiency Calibration",
    category: "Full Mock",
    difficulty: "Medium",
    code: "MA-POLARIS-05",
    questionCount: 12,
    sections: [
      { id: "f3000000-0000-0000-0000-000000000015", sectionType: "reading", sectionOrder: 0, timingSeconds: 1800 },
      { id: "f3000000-0000-0000-0000-000000000025", sectionType: "listening", sectionOrder: 1, timingSeconds: 1740 },
      { id: "f3000000-0000-0000-0000-000000000035", sectionType: "writing", sectionOrder: 2, timingSeconds: 1380 },
      { id: "f3000000-0000-0000-0000-000000000045", sectionType: "speaking", sectionOrder: 3, timingSeconds: 480 },
    ],
  },
  {
    id: "f1000000-0000-0000-0000-000000000006",
    testVersionId: "f2000000-0000-0000-0000-000000000006",
    name: "Aurora Series 06: Band 6.0 Mastery Benchmark",
    category: "Full Mock",
    difficulty: "Hard",
    code: "MA-AURORA-06",
    questionCount: 12,
    sections: [
      { id: "f3000000-0000-0000-0000-000000000016", sectionType: "reading", sectionOrder: 0, timingSeconds: 1800 },
      { id: "f3000000-0000-0000-0000-000000000026", sectionType: "listening", sectionOrder: 1, timingSeconds: 1740 },
      { id: "f3000000-0000-0000-0000-000000000036", sectionType: "writing", sectionOrder: 2, timingSeconds: 1380 },
      { id: "f3000000-0000-0000-0000-000000000046", sectionType: "speaking", sectionOrder: 3, timingSeconds: 480 },
    ],
  },
];

/**
 * Fetch all published TOEFL tests and series for the student catalog.
 */
export const getPublishedTests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // Fetch published test versions from DB
      const { data: publishedVersions, error } = await supabaseAdmin
        .from("test_versions")
        .select("id, test_id, blueprint_version, status, tests(id, name, category, difficulty, code, question_count), sections(id, section_type, section_order, timing_seconds)")
        .eq("status", "published");

      if (error || !publishedVersions || publishedVersions.length === 0) {
        return DEFAULT_MOCK_SERIES;
      }

      const dbTests = (publishedVersions || [])
        .map((v) => {
          const t = v.tests as unknown as {
            id: string;
            name: string;
            category: string;
            difficulty: string;
            code: string | null;
            question_count: number;
          };
          if (!t) return null;

          const rawSections = (v.sections as unknown as Array<{
            id: string;
            section_type: "reading" | "listening" | "writing" | "speaking";
            section_order: number;
            timing_seconds: number;
          }>) || [];

          const sections = [...rawSections].sort((a, b) => a.section_order - b.section_order);

          return {
            id: t.id,
            testVersionId: v.id,
            name: t.name,
            category: t.category || "Full Mock",
            difficulty: t.difficulty || "Medium",
            code: t.code,
            questionCount: t.question_count || 12,
            sections: sections.map((s) => ({
              id: s.id,
              sectionType: s.section_type,
              sectionOrder: s.section_order,
              timingSeconds: s.timing_seconds || 1800,
            })),
          };
        })
        .filter(Boolean);

      return dbTests.length > 0 ? (dbTests as PublishedTestItem[]) : DEFAULT_MOCK_SERIES;
    } catch {
      return DEFAULT_MOCK_SERIES;
    }
  });
