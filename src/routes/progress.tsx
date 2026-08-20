import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { ScoreBars, ScoreTrend } from "@/components/charts";
import { ComprehensionBreakdown } from "@/components/comprehension";
import { EmptyState, PageShell, Panel, SectionHeading, StatCard } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { scoreTextClass } from "@/lib/mock-data";
import { getStudentDashboardData, type StudentAnalytics } from "@/lib/student.functions";

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
  const [data, setData] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getStudentDashboardData();
        setData(res);
      } catch {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen">
        <AppNav />
        <PageShell>
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your analytics...</p>
          </div>
        </PageShell>
      </div>
    );
  }

  const categoryPerf = data?.categoryPerformance || [];
  const strongest = categoryPerf.length > 0 ? categoryPerf[0] : null;
  const weakest = categoryPerf.length > 0 ? categoryPerf[categoryPerf.length - 1] : null;

  if (!data || data.stats.evaluatedCount === 0) {
    return (
      <div className="min-h-screen">
        <AppNav />
        <PageShell>
          <SectionHeading
            title="Progress & Analytics"
            subtitle="How your understanding moves across attempts, axes and subjects."
          />
          <EmptyState
            title="No evaluated tests yet"
            description="Complete and submit your first test to unlock your comprehension trends and category analytics."
            action={
              <Button asChild>
                <Link to="/test">Take Your First Test</Link>
              </Button>
            }
          />
        </PageShell>
      </div>
    );
  }

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
          <StatCard label="Attempts" value={data.stats.testsTaken} />
          <StatCard
            label="Average"
            value={`${data.stats.averageUnderstanding}%`}
            hint={`Across ${data.stats.evaluatedCount} evaluations`}
          />
          <StatCard
            label="Strongest Subject"
            value={
              strongest ? (
                <span className={scoreTextClass(strongest.score)}>{strongest.category}</span>
              ) : (
                "N/A"
              )
            }
            hint={strongest ? `${strongest.score}% average` : "Take more tests"}
          />
          <StatCard
            label="Weakest Subject"
            value={
              weakest ? (
                <span className={scoreTextClass(weakest.score)}>{weakest.category}</span>
              ) : (
                "N/A"
              )
            }
            hint={weakest ? `${weakest.score}% average` : "Take more tests"}
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <Panel>
            <SectionHeading
              title="Understanding Score Over Time"
              subtitle={`All ${data.progressSeries.length} evaluated attempts, oldest to newest.`}
            />
            <ScoreTrend data={data.progressSeries} height={300} />
          </Panel>
          <Panel>
            <SectionHeading title="Current Profile" subtitle="Your real five-axis breakdown." />
            <ComprehensionBreakdown axes={data.axes} variant="bars" highlight={data.weakestAxis} />
          </Panel>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Panel>
            <SectionHeading
              title="Performance by Category"
              subtitle="Where your reading is reliable, and where it slips."
            />
            {categoryPerf.length > 0 ? (
              <ScoreBars
                data={categoryPerf as unknown as Record<string, string | number>[]}
                xKey="category"
                height={320}
              />
            ) : (
              <p className="p-8 text-center text-sm text-muted-foreground">
                Take tests across different categories to see subject comparisons.
              </p>
            )}
          </Panel>
          <Panel>
            <SectionHeading
              title="Insights & Recommendations"
              subtitle="Rule-based insights derived from your real test scores."
            />
            <div className="space-y-4 text-sm leading-relaxed">
              <div className="rounded-xl border border-border bg-surface-2/40 p-4">
                <p className="font-semibold text-success">Strength Identified</p>
                <p className="mt-1 text-muted-foreground">{data.insights.strength}</p>
              </div>
              <div className="rounded-xl border border-border bg-surface-2/40 p-4">
                <p className="font-semibold text-warning">Area for Focus</p>
                <p className="mt-1 text-muted-foreground">{data.insights.weakness}</p>
              </div>
              <div className="rounded-xl border border-primary/25 bg-primary/8 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Recommendation
                </p>
                <p className="mt-1 text-muted-foreground">{data.insights.recommendation}</p>
              </div>
            </div>
          </Panel>
        </div>
      </PageShell>
    </div>
  );
}
