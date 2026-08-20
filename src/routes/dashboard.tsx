import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb, Play, Sparkles } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { ComprehensionBreakdown } from "@/components/comprehension";
import {
  EmptyState,
  PageShell,
  Panel,
  SectionHeading,
  StatCard,
  StatusTag,
  Tag,
} from "@/components/kit";
import { ScoreTrend } from "@/components/charts";
import { Button } from "@/components/ui/button";
import {
  aiInsight,
  attempts,
  formatDate,
  practiceSets,
  progressSeries,
  scoreTextClass,
  studentAxes,
  studentProfile,
  studentStats,
} from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  head: () => ({
    meta: [
      { title: "Dashboard — Midnight Academy" },
      {
        name: "description",
        content:
          "Your comprehension profile, AI insights, recent tests and recommended practice sets.",
      },
      { property: "og:title", content: "Dashboard — Midnight Academy" },
      {
        property: "og:description",
        content: "Track how accurately you understand technical questions over time.",
      },
    ],
  }),
  component: Dashboard,
});

/** Flip to true to preview the first-time (zero tests) dashboard. */
const IS_NEW_STUDENT = false;

function Dashboard() {
  const recent = attempts.slice(0, 4);
  const recommended = practiceSets.filter((p) => p.recommended).slice(0, 4);

  return (
    <div className="min-h-screen">
      <AppNav />
      <PageShell>
        {/* Hero */}
        <section className="panel grid-backdrop flex flex-wrap items-center justify-between gap-6 p-7 lg:p-9">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl">
              Good evening, {studentProfile.name.split(" ")[0]}.
            </h1>
            <p className="mt-2 text-muted-foreground">
              Ready to sharpen the way you understand problems?
            </p>
          </div>
          <Button asChild size="lg" className="glow-ring">
            <Link to="/test">
              <Play className="size-4" /> Take Test
            </Link>
          </Button>
        </section>

        {IS_NEW_STUDENT ? (
          <div className="mt-10">
            <EmptyState
              icon={<Sparkles className="size-5" />}
              title="No attempts yet — let's get your baseline"
              description="Take your first comprehension test to unlock your five-axis profile, AI insights and progress tracking. It takes about ten minutes."
              action={
                <>
                  <Button asChild>
                    <Link to="/test">Take Test</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/practice">Browse Practice</Link>
                  </Button>
                </>
              }
            />
          </div>
        ) : (
          <>
            {/* Performance overview */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Tests Taken" value={studentStats.testsTaken} hint="Across 7 categories" />
              <StatCard
                label="Average Understanding"
                value={`${studentStats.averageUnderstanding}%`}
                hint="+6 vs last month"
              />
              <StatCard label="Best Score" value={`${studentStats.bestScore}%`} hint="Normalization & Keys" />
              <StatCard label="Current Streak" value={`${studentStats.streak} days`} hint="Keep it going" />
            </div>

            <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
              <Panel>
                <SectionHeading
                  title="Your Comprehension Profile"
                  subtitle="Five axes of technical question understanding."
                  action={
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/progress">
                        Full analytics <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  }
                />
                <ComprehensionBreakdown axes={studentAxes} highlight={aiInsight.weakAxis} />
              </Panel>

              <Panel>
                <div className="flex items-center gap-2">
                  <Lightbulb className="size-4 text-violet" />
                  <h2 className="text-lg font-bold text-foreground">AI Insights</h2>
                </div>
                <div className="mt-5 space-y-4 text-sm leading-relaxed">
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-success">Strength · </span>
                    {aiInsight.strength}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-warning">Watch · </span>
                    {aiInsight.weakness}
                  </p>
                  <div className="rounded-xl border border-primary/25 bg-primary/8 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                      Recommendation
                    </p>
                    <p className="mt-2 text-muted-foreground">{aiInsight.recommendation}</p>
                  </div>
                </div>
                <Button asChild className="mt-6 w-full">
                  <Link to="/practice">Practice Weak Area</Link>
                </Button>
              </Panel>
            </div>

            {/* Recent tests */}
            <section className="mt-10">
              <SectionHeading
                title="Recent Tests"
                action={
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/history">
                      View all <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                }
              />
              <div className="panel divide-y divide-border overflow-hidden p-0">
                {recent.map((a) => (
                  <Link
                    key={a.id}
                    to="/result/$attemptId"
                    params={{ attemptId: a.id }}
                    className="grid grid-cols-2 items-center gap-3 px-5 py-4 transition-colors hover:bg-surface-2/60 lg:grid-cols-[minmax(0,2.2fr)_repeat(4,minmax(0,1fr))]"
                  >
                    <span className="col-span-2 text-sm font-semibold text-foreground lg:col-span-1">
                      {a.name}
                    </span>
                    <Tag>{a.category}</Tag>
                    <span className="text-sm text-muted-foreground">{a.questions} questions</span>
                    <span className={`text-sm font-bold ${scoreTextClass(a.score)}`}>{a.score}%</span>
                    <span className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                      {formatDate(a.date)} <StatusTag status={a.status} />
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Progress + recommendations */}
            <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <Panel>
                <SectionHeading title="Progress Over Time" subtitle="Understanding score per attempt." />
                <ScoreTrend data={progressSeries.slice(-10)} />
              </Panel>

              <section>
                <SectionHeading
                  title="Recommended For You"
                  subtitle="Chosen from your weakest axes."
                />
                <div className="space-y-3">
                  {recommended.map((p) => (
                    <Link
                      key={p.id}
                      to="/practice"
                      className="panel-quiet block p-4 transition-colors hover:border-border-strong"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-sm font-semibold text-foreground">{p.title}</span>
                        <Tag tone="violet">{p.difficulty}</Tag>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {p.category} · {p.questions} questions · ~{p.minutes} min · builds {p.focus}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </PageShell>
    </div>
  );
}
