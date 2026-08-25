import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { ScoreBars } from "@/components/charts";
import { PageShell, Panel, SectionHeading, StatCard, StatusTag, Tag } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { scoreTextClass } from "@/lib/mock-data";
import { formatToIST } from "@/lib/format";
import { getAdminOverview } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Midnight Academy" },
      {
        name: "description",
        content:
          "Create and manage technical comprehension assessments, and see how accurately your students read questions.",
      },
      { property: "og:title", content: "Admin Dashboard — Midnight Academy" },
      {
        property: "og:description",
        content: "Instructor overview of tests, participation and comprehension scores.",
      },
    ],
  }),
  component: AdminDashboard,
});

type OverviewData = {
  totals: {
    tests: number;
    activeTests: number;
    students: number;
    attempts: number;
    averageScore: number;
    flagged: number;
  };
  testPerformance: Array<{
    name: string;
    score: number;
    participants: number;
  }>;
  recentTests: Array<{
    id: string;
    name: string;
    category: string;
    status: string;
    code: string | null;
    questions: number;
    participants: number;
    activeParticipants: number;
    average: number;
  }>;
  recentSubmissions: Array<{
    attemptId: string;
    studentName: string;
    testName: string;
    score: number | null;
    status: string;
    completedAt: string | null;
  }>;
};

function AdminDashboard() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getAdminOverview();
        setData(res as OverviewData);
      } catch {
        // Fallback gracefully
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
          <p className="text-sm text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </PageShell>
    );
  }

  const totals = data?.totals || {
    tests: 0,
    activeTests: 0,
    students: 0,
    attempts: 0,
    averageScore: 0,
    flagged: 0,
  };
  const testPerf = data?.testPerformance || [];
  const recentTests = data?.recentTests || [];
  const recentSubmissions = data?.recentSubmissions || [];

  return (
    <PageShell>
      <section className="panel grid-backdrop flex flex-wrap items-center justify-between gap-6 p-7 lg:p-9">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create meaningful technical comprehension assessments.
          </p>
        </div>
        <Button asChild size="lg" className="glow-ring">
          <Link to="/admin/create">
            <Plus className="size-4" /> Create Test
          </Link>
        </Button>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Tests" value={totals.tests} />
        <StatCard label="Active Tests" value={totals.activeTests} hint="Accepting attempts" />
        <StatCard label="Total Students" value={totals.students} />
        <StatCard
          label="Completed Attempts"
          value={totals.attempts}
          hint={totals.averageScore > 0 ? `${totals.averageScore}% avg score` : undefined}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel>
          <SectionHeading
            title="Test Performance"
            subtitle="Average comprehension score by test."
          />
          {testPerf.length > 0 ? (
            <ScoreBars
              data={testPerf as unknown as Record<string, string | number>[]}
              xKey="name"
              layout="horizontal"
              height={280}
            />
          ) : (
            <p className="p-8 text-center text-sm text-muted-foreground">
              Create and publish tests to view student performance.
            </p>
          )}
        </Panel>
        <Panel>
          <SectionHeading title="Highlights" />
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-surface-2/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Average Comprehension
              </p>
              <p className="mt-1 text-2xl font-extrabold text-foreground">{totals.averageScore}%</p>
              <p className="mt-1 text-xs text-muted-foreground">Across all cohort submissions.</p>
            </div>
          </div>
        </Panel>
      </div>

      <section className="mt-10">
        <SectionHeading
          title="Recent Student Submissions"
          subtitle="Latest test attempts by your students."
        />
        {recentSubmissions.length === 0 ? (
          <div className="panel p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No student submissions yet. Share a test code so students can join.
            </p>
          </div>
        ) : (
          <div className="panel divide-y divide-border overflow-hidden p-0">
            {recentSubmissions.map((s) => (
              <Link
                key={s.attemptId}
                to="/result/$attemptId"
                params={{ attemptId: s.attemptId }}
                className="grid grid-cols-2 items-center gap-3 px-5 py-4 transition-colors hover:bg-surface-2/60 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]"
              >
                <span className="text-sm font-semibold text-foreground">{s.studentName}</span>
                <span className="col-span-2 text-sm text-muted-foreground lg:col-span-1">
                  {s.testName}
                </span>
                <span
                  className={`text-sm font-bold ${
                    s.score !== null ? scoreTextClass(s.score) : "text-muted-foreground"
                  }`}
                >
                  {s.score !== null ? `${s.score}%` : "Evaluating"}
                </span>
                <span className="flex items-center justify-end text-xs text-muted-foreground">
                  {s.completedAt ? formatToIST(s.completedAt) : "In progress"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <SectionHeading
          title="Recent Tests"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/tests">View all</Link>
            </Button>
          }
        />
        {recentTests.length === 0 ? (
          <div className="panel p-8 text-center">
            <p className="text-sm text-muted-foreground">No tests created yet.</p>
            <Button asChild className="mt-4">
              <Link to="/admin/create">Create your first test</Link>
            </Button>
          </div>
        ) : (
          <div className="panel divide-y divide-border overflow-hidden p-0">
            {recentTests.map((t) => (
              <Link
                key={t.id}
                to="/admin/tests/$testId"
                params={{ testId: t.id }}
                className="grid grid-cols-2 items-center gap-3 px-5 py-4 transition-colors hover:bg-surface-2/60 lg:grid-cols-[minmax(0,2.2fr)_repeat(5,minmax(0,1fr))]"
              >
                <div className="col-span-2 flex flex-wrap items-center gap-2 lg:col-span-1">
                  <span className="text-sm font-semibold text-foreground">{t.name}</span>
                </div>
                <Tag>{t.category}</Tag>
                <span className="text-sm text-muted-foreground">{t.questions} questions</span>
                <span className="text-sm text-muted-foreground">{t.participants} students</span>
                <span className={`text-sm font-bold ${scoreTextClass(t.average)}`}>
                  {t.participants > 0 ? `${t.average}%` : "—"}
                </span>
                <span className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {t.activeParticipants > 0 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="relative flex size-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                        </span>
                        {t.activeParticipants} writing
                      </span>
                    ) : null}
                    <StatusTag status={t.status as "draft" | "active" | "completed"} />
                  </div>
                  <span className="text-xs text-primary">Manage</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
