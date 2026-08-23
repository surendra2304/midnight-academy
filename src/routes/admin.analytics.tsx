import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AxisTrend, ScoreBars } from "@/components/charts";
import { ComprehensionBreakdown } from "@/components/comprehension";
import { PageShell, Panel, SectionHeading, StatCard } from "@/components/kit";
import { getCohortAnalytics } from "@/lib/admin.functions";
import { AXIS_SHORT, type AxisScores } from "@/lib/mock-data";
import { weakestAxis, strongestAxis } from "@/lib/axes";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Midnight Academy Admin" },
      {
        name: "description",
        content:
          "Cohort-level comprehension analytics: five-axis averages, per-category performance and per-question difficulty.",
      },
      { property: "og:title", content: "Analytics — Midnight Academy Admin" },
      {
        property: "og:description",
        content: "See where your cohort misreads questions most often.",
      },
    ],
  }),
  component: Analytics,
});

type CohortData = {
  attempts: number;
  cohortAverage: number;
  axes: Record<string, number>;
  categoryPerformance: Array<{
    category: string;
    score: number;
    attempts: number;
  }>;
  testPerformance: Array<{
    name: string;
    score: number;
  }>;
  perQuestionDifficulty: Array<{
    q: string;
    score: number;
  }>;
};

function Analytics() {
  const [data, setData] = useState<CohortData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getCohortAnalytics();
        setData(res as CohortData);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading cohort analytics...</p>
        </div>
      </PageShell>
    );
  }

  const {
    attempts = 0,
    cohortAverage = 0,
    axes = { objective: 0, constraint: 0, io: 0, concept: 0, interpretation: 0 },
    categoryPerformance = [],
    testPerformance = [],
    perQuestionDifficulty = [],
  } = data || {};

  const hasEvaluations = attempts > 0;
  const currentAxes: AxisScores = {
    objective: axes["objective"] ?? 0,
    constraint: axes["constraint"] ?? 0,
    io: axes["io"] ?? 0,
    concept: axes["concept"] ?? 0,
    interpretation: axes["interpretation"] ?? 0,
  };

  const worst = hasEvaluations ? weakestAxis(currentAxes) : null;
  const best = hasEvaluations ? strongestAxis(currentAxes) : null;

  return (
    <PageShell>
      <SectionHeading
        title="Analytics"
        subtitle="Cohort comprehension, using the same five axes students see."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Cohort Average"
          value={`${cohortAverage}%`}
          hint="Across all evaluated attempts"
        />
        <StatCard
          label="Weakest Axis"
          value={worst ? AXIS_SHORT[worst] : "—"}
          hint={worst ? `${currentAxes[worst]}% cohort average` : "No evaluations yet"}
        />
        <StatCard
          label="Strongest Axis"
          value={best ? AXIS_SHORT[best] : "—"}
          hint={best ? `${currentAxes[best]}% cohort average` : "No evaluations yet"}
        />
        <StatCard label="Total Attempts" value={attempts} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Panel>
          <SectionHeading title="Cohort Comprehension Profile" />
          <ComprehensionBreakdown axes={currentAxes} highlight={worst ?? undefined} />
        </Panel>
        <Panel>
          <SectionHeading title="Category Performance" subtitle="Comprehension score by subject." />
          {categoryPerformance.length > 0 ? (
            <ScoreBars
              data={categoryPerformance as unknown as Record<string, string | number>[]}
              xKey="category"
              height={280}
            />
          ) : (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No category evaluations recorded yet.
            </p>
          )}
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel>
          <SectionHeading title="Average Score by Test" />
          {testPerformance.length > 0 ? (
            <ScoreBars
              data={testPerformance as unknown as Record<string, string | number>[]}
              xKey="name"
              layout="horizontal"
              height={300}
            />
          ) : (
            <p className="p-8 text-center text-sm text-muted-foreground">
              Publish tests and collect attempts to view scores.
            </p>
          )}
        </Panel>
        <Panel>
          <SectionHeading
            title="Hardest Questions to Understand"
            subtitle="Lowest average comprehension score per question position."
          />
          {perQuestionDifficulty.length > 0 ? (
            <ScoreBars
              data={perQuestionDifficulty as unknown as Record<string, string | number>[]}
              xKey="q"
              layout="horizontal"
              height={300}
            />
          ) : (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No question metrics available yet.
            </p>
          )}
        </Panel>
      </div>
    </PageShell>
  );
}
