import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, EyeOff, Loader2, RotateCcw } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { ComprehensionBreakdown } from "@/components/comprehension";
import { PageShell, Panel, SectionHeading, Tag } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getPracticeQuestions, evaluatePracticeAnswer } from "@/lib/practice.functions";

export const Route = createFileRoute("/practice/run")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  validateSearch: (search: Record<string, unknown>): { category?: string | undefined } => ({
    category: typeof search["category"] === "string" ? search["category"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Practice Session — Midnight Academy" },
      {
        name: "description",
        content:
          "Open comprehension practice — read, recall and express, with instant AI feedback.",
      },
    ],
  }),
  component: PracticeRun,
});

type PracticeQuestion = { id: string; text: string; topic: string; difficulty: string };
type PracticeResult =
  Awaited<ReturnType<typeof evaluatePracticeAnswer>> extends never
    ? never
    : {
        score: number;
        feedback: string;
        missedConcepts: string[];
        missedConstraints: string[];
        axisScores: Record<string, number>;
        referenceAnswer: string;
        questionText: string;
      };

const READ_SECONDS = 25;

function PracticeRun() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const category = search.category ?? "DSA";

  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"reading" | "writing" | "result">("reading");
  const [countdown, setCountdown] = useState(READ_SECONDS);
  const [response, setResponse] = useState("");
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getPracticeQuestions({ data: { category, count: 3 } });
        if (cancelled) return;
        if (!res.available || res.questions.length === 0) {
          toast.error(
            `No approved practice questions in ${category} yet. Ask your instructor to approve some.`,
          );
          navigate({ to: "/practice" });
          return;
        }
        setQuestions(res.questions);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not load practice questions");
        navigate({ to: "/practice" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category, navigate]);

  // Reading countdown — when it hits zero the passage disappears
  useEffect(() => {
    if (phase !== "reading") return;
    if (countdown <= 0) {
      setPhase("writing");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const question = questions[index];

  const startQuestion = (i: number) => {
    setIndex(i);
    setPhase("reading");
    setCountdown(READ_SECONDS);
    setResponse("");
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!question) return;
    if (!response.trim()) {
      toast.error("Write what you understood before submitting.");
      return;
    }
    setEvaluating(true);
    try {
      const res = await evaluatePracticeAnswer({
        data: { questionId: question.id, response },
      });
      setResult(res as PracticeResult);
      setPhase("result");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Evaluation failed. Try again.");
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <AppNav />
        <PageShell>
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading practice passages...</p>
          </div>
        </PageShell>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppNav />
      <PageShell className="max-w-[900px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">
              Open Practice · {category}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Passage {index + 1} of {questions.length} — not graded, practice as many times as you
              like.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/practice">
              <ArrowLeft className="size-4" /> Exit
            </Link>
          </Button>
        </div>

        {phase === "reading" && question && (
          <Panel className="mt-6">
            <div className="flex items-center justify-between">
              <SectionHeading
                title="Read the passage"
                subtitle="It will disappear when the timer ends."
              />
              <span className="rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 font-mono text-lg font-bold text-primary">
                {countdown}s
              </span>
            </div>
            <p className="mt-5 text-base leading-relaxed text-foreground">{question.text}</p>
          </Panel>
        )}

        {phase === "writing" && question && (
          <Panel className="mt-6">
            <div className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
              <EyeOff className="size-4 shrink-0" />
              <span>The passage is hidden. Write what you understood — in your own words.</span>
            </div>
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Describe the objective, the stated limits, the inputs and outputs, and the underlying ideas..."
              className="mt-4 min-h-[220px] text-sm leading-relaxed"
              autoFocus
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <Button size="lg" onClick={handleSubmit} disabled={evaluating}>
                {evaluating ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Evaluating...
                  </>
                ) : (
                  "Submit for AI Feedback"
                )}
              </Button>
              <Button variant="ghost" size="lg" onClick={() => startQuestion(index)}>
                <RotateCcw className="mr-2 size-4" /> Show passage again
              </Button>
            </div>
          </Panel>
        )}

        {phase === "result" && result && question && (
          <>
            <Panel className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SectionHeading
                  title="Your Evaluation"
                  subtitle="Score, feedback and the original passage for comparison."
                />
                <span className="text-3xl font-extrabold text-primary">
                  {Math.round(result.score * 10)}%
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {result.feedback}
              </p>
              <div className="mt-5">
                <ComprehensionBreakdown axes={result.axisScores as never} variant="bars" />
              </div>
              {(result.missedConcepts.length > 0 || result.missedConstraints.length > 0) && (
                <div className="mt-5 space-y-2">
                  {result.missedConcepts.length > 0 && (
                    <div className="rounded-lg border border-warning/35 bg-warning/8 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-warning">
                        Concepts you missed
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {result.missedConcepts.join(" · ")}
                      </p>
                    </div>
                  )}
                  {result.missedConstraints.length > 0 && (
                    <div className="rounded-lg border border-warning/35 bg-warning/8 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-warning">
                        Constraints you missed
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {result.missedConstraints.join(" · ")}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Panel>

            <Panel className="mt-6">
              <SectionHeading title="Original passage" subtitle="Compare with what you wrote." />
              <p className="mt-4 text-sm leading-relaxed text-foreground">{result.questionText}</p>
              <div className="mt-4 rounded-lg border border-border bg-surface-2/40 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Reference understanding
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {result.referenceAnswer || "No reference answer recorded for this question."}
                </p>
              </div>
            </Panel>

            <div className="mt-6 flex flex-wrap gap-3">
              {index + 1 < questions.length ? (
                <Button size="lg" onClick={() => startQuestion(index + 1)}>
                  Next Passage <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button size="lg" onClick={() => startQuestion(0)}>
                  <RotateCcw className="size-4" /> Practice Again
                </Button>
              )}
              <Button asChild variant="outline" size="lg">
                <Link to="/practice">Back to Practice Library</Link>
              </Button>
            </div>
          </>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          <CheckCircle2 className="mr-1 inline size-3.5" />
          Practice sessions are private and never affect your official test scores.
        </p>
      </PageShell>
    </div>
  );
}
