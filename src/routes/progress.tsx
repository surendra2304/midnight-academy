import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { AxisTrend, ScoreBars, ScoreTrend } from "@/components/charts";
import { ComprehensionBreakdown } from "@/components/comprehension";
import { PageShell, Panel, SectionHeading, StatCard } from "@/components/kit";
import { Button } from "@/components/ui/button";
import {
  aiInsight,
  axisTrend,
  categoryPerformance,
  progressSeries,
  scoreTextClass,
  studentAxes,
  studentStats,
} from "@/lib/mock-data";

export const Route = createFileRoute("/progress")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  head: () => ({
    meta: [
      { title: "Progress & Analytics — Midnight Academy" },
      {
        name: "description",
        content:
          "Your five-axis comprehension trend over time, per-category performance and long-range score history.",
      },
      { property: "og:title", content: "Progress & Analytics — Midnight Academy" },
      {
        property: "og:description",
        content: "See exactly which part of question reading is improving and which is not.",
      },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const strongest = categoryPerformance[0]!;
  const weakest = categoryPerformance[categoryPerformance.length - 1]!;

  return (
    <div className="min-h-screen">
      <AppNav />
      <PageShell>
        <SectionHeading
          title="Progress & Analytics"
          subtitle="How your understanding has moved across attempts, axes and subjects."
          action={
            <Button asChild variant="outline">
              <Link to="/practice">
                Practice weak areas <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Attempts" value={studentStats.testsTaken} />
          <StatCard label="Average" value={`${studentStats.averageUnderstanding}%`} hint="Last 14 attempts" />
          <StatCard
            label="Strongest Subject"
            value={<span className={scoreTextClass(strongest.score)}>{strongest.category}</span>}
            hint={`${strongest.score}% average`}
          />
          <StatCard
            label="Weakest Subject"
            value={<span className={scoreTextClass(weakest.score)}>{weakest.category}</span>}
            hint={`${weakest.score}% average`}
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <Panel>
            <SectionHeading
              title="Understanding Score Over Time"
              subtitle="All 14 attempts, oldest to newest."
            />
            <ScoreTrend data={progressSeries} height={300} />
          </Panel>
          <Panel>
            <SectionHeading title="Current Profile" subtitle="Same five axes, everywhere." />
            <ComprehensionBreakdown axes={studentAxes} variant="bars" highlight={aiInsight.weakAxis} />
          </Panel>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Panel>
            <SectionHeading
              title="Axis Trend"
              subtitle="Each comprehension axis, month over month."
            />
            <AxisTrend data={axisTrend as unknown as Record<string, string | number>[]} />
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {[
                ["Objective", "var(--color-chart-1)"],
                ["Constraints", "var(--color-chart-2)"],
                ["Input/Output", "var(--color-chart-3)"],
                ["Concepts", "var(--color-chart-4)"],
                ["Interpretation", "var(--color-chart-5)"],
              ].map(([label, color]) => (
                <span key={label} className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: color as string }}
                  />
                  {label}
                </span>
              ))}
            </div>
          </Panel>
          <Panel>
            <SectionHeading
              title="Performance by Category"
              subtitle="Where your reading is reliable, and where it slips."
            />
            <ScoreBars
              data={categoryPerformance as unknown as Record<string, string | number>[]}
              xKey="category"
              height={320}
            />
          </Panel>
        </div>
      </PageShell>
    </div>
  );
}
