import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Flag, LayoutDashboard } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { ComprehensionBreakdown } from "@/components/comprehension";
import { CountUp, PageShell, Panel, SectionHeading, Tag } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { sampleResult, sampleTest, scoreTextClass, testQuestions } from "@/lib/mock-data";

export const Route = createFileRoute("/result/$attemptId")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  head: () => ({
    meta: [
      { title: "Test Result — Midnight Academy" },
      {
        name: "description",
        content:
          "Your technical comprehension score, the concepts you missed and the actual answers for every question.",
      },
      { property: "og:title", content: "Test Result — Midnight Academy" },
      {
        property: "og:description",
        content: "Understanding score, five-axis breakdown and AI feedback for your attempt.",
      },
    ],
  }),
  component: ResultPage,
});

function ResultPage() {
  const [flagged, setFlagged] = useState<string[]>([]);

  return (
    <div className="min-h-screen">
      <AppNav />
      <PageShell>
        <section className="panel grid-backdrop p-7 text-center lg:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Test Complete
          </p>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl">
            Here's how well you understood the problems.
          </h1>
          <p className="mt-8 text-6xl font-extrabold text-gradient lg:text-7xl">
            <CountUp value={sampleResult.overall} suffix="%" />
          </p>
          <p className="mt-3 text-sm text-muted-foreground">Technical Comprehension Score</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {sampleTest.name} · {testQuestions.length} questions
          </p>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <Panel>
            <SectionHeading title="Comprehension Breakdown" subtitle="The same five axes you track on your dashboard." />
            <ComprehensionBreakdown axes={sampleResult.axes} />
          </Panel>
          <div className="space-y-6">
            <Panel>
              <h2 className="text-base font-semibold text-foreground">AI Overview</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {sampleResult.overview}
              </p>
            </Panel>
            <Panel>
              <h2 className="text-base font-semibold text-foreground">What You Missed</h2>
              <ul className="mt-3 space-y-2.5">
                {sampleResult.missed.map((m) => (
                  <li key={m} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" />
                    {m}
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>

        <Panel className="mt-6 border-primary/25 bg-primary/6">
          <h2 className="text-base font-semibold text-foreground">AI Feedback</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{sampleResult.feedback}</p>
        </Panel>

        <section className="mt-10">
          <SectionHeading
            title="Actual Answers"
            subtitle="Your understanding, the evaluation, and the correct answer — kept clearly apart."
          />
          <div className="space-y-5">
            {sampleResult.perQuestion.map((r, i) => {
              const q = testQuestions.find((t) => t.id === r.questionId)!;
              const isFlagged = flagged.includes(r.questionId);
              return (
                <article key={r.questionId} className="panel overflow-hidden p-0">
                  <header className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
                    <span className="text-sm font-bold text-foreground">
                      Question {String(i + 1).padStart(2, "0")}
                    </span>
                    <Tag tone="primary">{q.category}</Tag>
                    <span className={`ml-auto text-sm font-bold ${scoreTextClass(r.score * 10)}`}>
                      {r.score}/10
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFlagged((f) => [...f, r.questionId]);
                        toast.success("Evaluation flagged for instructor review");
                      }}
                      disabled={isFlagged}
                      className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
                    >
                      <Flag className="size-3.5" /> {isFlagged ? "Flagged" : "Flag this evaluation"}
                    </button>
                  </header>

                  <div className="grid gap-0 lg:grid-cols-3">
                    <div className="border-b border-border p-5 lg:border-b-0 lg:border-r">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Your understanding
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-foreground">
                        {r.studentUnderstanding}
                      </p>
                      {r.missed.length ? (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {r.missed.map((m) => (
                            <Tag key={m} tone="warning">
                              missed: {m}
                            </Tag>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="border-b border-border bg-surface-2/40 p-5 lg:border-b-0 lg:border-r">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                        AI evaluation
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.feedback}</p>
                    </div>
                    <div className="bg-success/6 p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-success">
                        Actual answer
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{q.answer}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <Panel className="mt-10">
          <h2 className="text-base font-semibold text-foreground">Recommended Next Steps</h2>
          <ol className="mt-4 space-y-3">
            {sampleResult.nextSteps.map((s, i) => (
              <li key={s} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary/12 text-[11px] font-bold text-primary">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </Panel>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/practice">
              Practice Weak Areas <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/dashboard">
              <LayoutDashboard className="size-4" /> Back to Dashboard
            </Link>
          </Button>
        </div>
      </PageShell>
    </div>
  );
}
