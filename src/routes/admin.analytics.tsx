import { createFileRoute } from "@tanstack/react-router";
import { AxisTrend, ScoreBars } from "@/components/charts";
import { ComprehensionBreakdown } from "@/components/comprehension";
import { PageShell, Panel, SectionHeading, StatCard } from "@/components/kit";
import {
  axisTrend,
  categoryPerformance,
  perQuestionDifficulty,
  studentAxes,
  testPerformance,
} from "@/lib/mock-data";

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

function Analytics() {
  return (
    <PageShell>
      <SectionHeading
        title="Analytics"
        subtitle="Cohort comprehension, using the same five axes students see."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Cohort Average" value="74%" hint="All active tests" />
        <StatCard label="Weakest Axis" value="Constraints" hint="61% cohort average" />
        <StatCard label="Strongest Axis" value="Objective" hint="86% cohort average" />
        <StatCard label="Attempts This Month" value="486" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Panel>
          <SectionHeading title="Cohort Comprehension Profile" />
          <ComprehensionBreakdown axes={studentAxes} highlight="constraint" />
        </Panel>
        <Panel>
          <SectionHeading title="Axis Trend" subtitle="Month over month, all students." />
          <AxisTrend data={axisTrend as unknown as Record<string, string | number>[]} height={280} />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel>
          <SectionHeading title="Performance by Category" />
          <ScoreBars
            data={categoryPerformance as unknown as Record<string, string | number>[]}
            xKey="category"
            height={300}
          />
        </Panel>
        <Panel>
          <SectionHeading title="Average Score by Test" />
          <ScoreBars
            data={testPerformance as unknown as Record<string, string | number>[]}
            xKey="name"
            layout="horizontal"
            height={300}
          />
        </Panel>
      </div>

      <Panel className="mt-6">
        <SectionHeading
          title="Hardest Questions to Understand"
          subtitle="Lowest average comprehension score per question position."
        />
        <ScoreBars
          data={perQuestionDifficulty as unknown as Record<string, string | number>[]}
          xKey="q"
          layout="horizontal"
          height={280}
        />
      </Panel>
    </PageShell>
  );
}
