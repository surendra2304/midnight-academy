import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { ScoreBars } from "@/components/charts";
import { PageShell, Panel, SectionHeading, StatCard, StatusTag, Tag } from "@/components/kit";
import { Button } from "@/components/ui/button";
import {
  adminActivity,
  adminStats,
  adminTests,
  scoreTextClass,
  testPerformance,
} from "@/lib/mock-data";

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

function AdminDashboard() {
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
        <StatCard label="Total Tests" value={adminStats.totalTests} />
        <StatCard label="Active Tests" value={adminStats.activeTests} hint="Accepting attempts" />
        <StatCard label="Total Students" value={adminStats.totalStudents} />
        <StatCard label="Completed Attempts" value={adminStats.completedAttempts} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel>
          <SectionHeading title="Test Performance" subtitle="Average comprehension score by test." />
          <ScoreBars
            data={testPerformance as unknown as Record<string, string | number>[]}
            xKey="name"
            layout="horizontal"
            height={280}
          />
        </Panel>
        <Panel>
          <SectionHeading title="Recent Activity" />
          <ul className="space-y-4">
            {adminActivity.map((a) => (
              <li key={a.text} className="border-b border-border pb-4 last:border-0 last:pb-0">
                <p className="text-sm text-foreground">{a.text}</p>
                <p className="mt-1 text-xs text-muted-foreground">{a.meta}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <section className="mt-10">
        <SectionHeading
          title="Recent Tests"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/tests">View all</Link>
            </Button>
          }
        />
        <div className="panel divide-y divide-border overflow-hidden p-0">
          {adminTests.map((t) => (
            <Link
              key={t.id}
              to="/admin/tests/$testId"
              params={{ testId: t.id }}
              className="grid grid-cols-2 items-center gap-3 px-5 py-4 transition-colors hover:bg-surface-2/60 lg:grid-cols-[minmax(0,2.2fr)_repeat(5,minmax(0,1fr))]"
            >
              <span className="col-span-2 text-sm font-semibold text-foreground lg:col-span-1">
                {t.name}
              </span>
              <Tag>{t.category}</Tag>
              <span className="text-sm text-muted-foreground">{t.questions} questions</span>
              <span className="text-sm text-muted-foreground">{t.participants} students</span>
              <span className={`text-sm font-bold ${scoreTextClass(t.average)}`}>
                {t.average ? `${t.average}%` : "—"}
              </span>
              <span className="flex items-center justify-between gap-3">
                <StatusTag status={t.status} />
                <span className="text-xs text-primary">Manage</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
