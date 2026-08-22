import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, ArrowRight, Flag, LayoutDashboard, Loader2, RefreshCw } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { ComprehensionBreakdown } from "@/components/comprehension";
import { CountUp, PageShell, Panel, SectionHeading, Tag } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { flagEvaluation, getResult, processAttemptEvaluation } from "@/lib/attempts.functions";
import { scoreTextClass } from "@/lib/mock-data";

export const Route = createFileRoute("/result/$attemptId")({
  beforeLoad: ({ location }) => requireAuth({ location }),
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

type ResultData = {
  id: string;
  status: string;
  score: number | null;
  axes: Record<string, number> | null;
  blurCount: number;
  completedAt: string | null;
  test: {
    name: string;
    category: string;
    difficulty: string;
    code: string | null;
  } | null;
  answers: Array<{
    id: string;
    position: number;
    response: string;
    score: number | null;
    feedback: string | null;
    missedConcepts: string[];
    missedConstraints: string[];
    flagged: boolean;
    question: {
      text: string;
      topic: string;
      difficulty: string;
      concepts: string[];
      constraints: string[];
      reference_answer: string;
    } | null;
  }>;
};

function ResultPage() {
  const { attemptId } = useParams({ from: "/result/$attemptId" });
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flaggingIds, setFlaggingIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function waitForEvaluation() {
      setLoading(true);
      setError(null);
      try {
        let res = (await getResult({ data: { attemptId } })) as ResultData;

        // Kick the heavy AI evaluation here (off the submit request) and poll
        // until it finishes. processAttemptEvaluation skips evaluated attempts,
        // so repeated calls are safe.
        let attempts = 0;
        while (res.status !== "evaluated" && attempts < 12 && !cancelled) {
          if (attempts === 0) {
            setData(res);
            setLoading(false);
          }
          try {
            await processAttemptEvaluation({ data: { attemptId } });
          } catch {
            // transient failure — keep polling
          }
          await new Promise((r) => setTimeout(r, 5000));
          res = (await getResult({ data: { attemptId } })) as ResultData;
          if (res.status === "evaluated" && !cancelled) setData(res);
          attempts += 1;
        }

        if (cancelled) return;
        if (res.status !== "evaluated") {
          setError(
            "Evaluation is still in progress. Refresh this page in a moment to see your results.",
          );
          setData(res);
        } else {
          setData(res);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load test results";
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    waitForEvaluation();
    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  const handleFlagAnswer = async (answerId: string) => {
    setFlaggingIds((ids) => [...ids, answerId]);
    try {
      await flagEvaluation({ data: { answerId } });
      toast.success("Evaluation flagged for instructor review");
      setData((prev) =>
        prev
          ? {
              ...prev,
              answers: prev.answers.map((a) => (a.id === answerId ? { ...a, flagged: true } : a)),
            }
          : prev,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not flag evaluation";
      toast.error(message);
    } finally {
      setFlaggingIds((ids) => ids.filter((id) => id !== answerId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <AppNav />
        <PageShell>
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading test evaluation...</p>
          </div>
        </PageShell>
      </div>
    );
  }

  if (data && data.status !== "evaluated" && !loading) {
    return (
      <div className="min-h-screen">
        <AppNav />
        <PageShell>
          <div className="panel my-12 p-10 text-center">
            <Loader2 className="mx-auto size-10 animate-spin text-primary" />
            <h1 className="mt-6 text-xl font-bold text-foreground">Evaluating your answers...</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The AI evaluator is reviewing your responses across the five reading axes. This
              usually takes less than a minute — this page updates automatically.
            </p>
          </div>
        </PageShell>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen">
        <AppNav />
        <PageShell>
          <div className="panel my-12 p-8 text-center">
            <AlertCircle className="mx-auto size-8 text-destructive" />
            <h1 className="mt-4 text-xl font-bold text-foreground">Result Not Available</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {error || "Could not retrieve the evaluation for this attempt."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="size-4" /> Go to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </PageShell>
      </div>
    );
  }

  const stillEvaluating = data.status !== "evaluated";

  const overallScore = data.score ?? 0;
  const axesScores = {
    objective: data.axes?.["objective"] ?? 0,
    constraint: data.axes?.["constraint"] ?? 0,
    io: data.axes?.["io"] ?? 0,
    concept: data.axes?.["concept"] ?? 0,
    interpretation: data.axes?.["interpretation"] ?? 0,
  };

  // Collect all missed items across questions
  const allMissedConcepts = Array.from(
    new Set(data.answers.flatMap((a) => a.missedConcepts || [])),
  );
  const allMissedConstraints = Array.from(
    new Set(data.answers.flatMap((a) => a.missedConstraints || [])),
  );

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
            <CountUp value={overallScore} suffix="%" />
          </p>
          <p className="mt-3 text-sm text-muted-foreground">Technical Comprehension Score</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {data.test?.name || "Comprehension Assessment"} · {data.answers.length} questions
          </p>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <Panel>
            <SectionHeading
              title="Comprehension Breakdown"
              subtitle="The five core axes of technical question reading."
            />
            <ComprehensionBreakdown axes={axesScores} />
          </Panel>
          <div className="space-y-6">
            <Panel>
              <h2 className="text-base font-semibold text-foreground">Assessment Summary</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {overallScore >= 80
                  ? "Excellent technical comprehension! You reliably captured primary objectives, constraints and expected data formats across problem statements."
                  : overallScore >= 60
                    ? "Good overall comprehension with occasional oversights in boundary constraints or underlying technical concepts."
                    : "You are attempting to solve before fully digesting constraints and problem objectives. Focus on identifying stated limits before drafting explanations."}
              </p>
            </Panel>
            <Panel>
              <h2 className="text-base font-semibold text-foreground">What You Missed</h2>
              {allMissedConcepts.length === 0 && allMissedConstraints.length === 0 ? (
                <p className="mt-3 text-sm text-success">
                  Outstanding — you captured all identified concepts and constraints accurately!
                </p>
              ) : (
                <ul className="mt-3 space-y-2.5">
                  {allMissedConstraints.map((c) => (
                    <li
                      key={`c-${c}`}
                      className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" />
                      <span className="font-semibold text-warning">Constraint: </span> {c}
                    </li>
                  ))}
                  {allMissedConcepts.map((m) => (
                    <li
                      key={`m-${m}`}
                      className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="font-semibold text-primary">Concept: </span> {m}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </div>

        <section className="mt-10">
          <SectionHeading
            title="Actual Answers"
            subtitle="Your understanding, the AI evaluation, and the correct reference answer — kept clearly apart."
          />
          <div className="space-y-5">
            {data.answers.map((a, i) => {
              const isFlagged = a.flagged;
              const isFlagging = flaggingIds.includes(a.id);
              const scoreTen = a.score !== null ? Number(a.score) : 0;

              return (
                <article key={a.id} className="panel overflow-hidden p-0">
                  <header className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
                    <span className="text-sm font-bold text-foreground">
                      Question {String(i + 1).padStart(2, "0")}
                    </span>
                    {a.question?.topic ? <Tag tone="primary">{a.question.topic}</Tag> : null}
                    <span className={`ml-auto text-sm font-bold ${scoreTextClass(scoreTen * 10)}`}>
                      {scoreTen}/10
                    </span>
                    <button
                      type="button"
                      onClick={() => handleFlagAnswer(a.id)}
                      disabled={isFlagged || isFlagging}
                      className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
                    >
                      <Flag className="size-3.5" />
                      {isFlagging ? "Flagging..." : isFlagged ? "Flagged" : "Flag this evaluation"}
                    </button>
                  </header>

                  <div className="grid gap-0 lg:grid-cols-3">
                    <div className="border-b border-border p-5 lg:border-b-0 lg:border-r">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Your understanding
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-foreground">
                        {a.response || "(No answer submitted)"}
                      </p>
                      {a.missedConstraints.length > 0 || a.missedConcepts.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {a.missedConstraints.map((c) => (
                            <Tag key={c} tone="warning">
                              missed constraint: {c}
                            </Tag>
                          ))}
                          {a.missedConcepts.map((m) => (
                            <Tag key={m} tone="primary">
                              missed concept: {m}
                            </Tag>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="border-b border-border bg-surface-2/40 p-5 lg:border-b-0 lg:border-r">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                        AI evaluation
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {a.feedback || "Comprehension processed successfully."}
                      </p>
                    </div>
                    <div className="bg-success/6 p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-success">
                        Reference understanding
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {a.question?.reference_answer || "No reference answer available."}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

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
