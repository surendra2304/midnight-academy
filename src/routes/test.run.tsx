import { requireAuth } from "@/lib/auth-guard";
import Onboarding from "@/routes/onboarding";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Check, EyeOff, Loader2, RefreshCw, Timer } from "lucide-react";
import { DifficultyTag, Tag } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  finishAttempt,
  getAttemptState,
  recordBlur,
  revealQuestion,
  submitAnswer,
} from "@/lib/attempts.functions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/test/run")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  validateSearch: (search: Record<string, unknown>): { attemptId?: string | undefined } => ({
    attemptId: typeof search["attemptId"] === "string" ? search["attemptId"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Comprehension Test — Midnight Academy" },
      {
        name: "description",
        content:
          "Read each technical question within the time limit, then explain what you understood once it disappears.",
      },
      { property: "og:title", content: "Comprehension Test — Midnight Academy" },
      {
        property: "og:description",
        content: "A distraction-free comprehension test: read, then explain.",
      },
    ],
  }),
  component: RunTest,
});

type Stage = "read" | "respond" | "evaluating" | "error";

type QuestionPayload = {
  text?: string;
  topic?: string;
  difficulty?: string;
  category?: string;
};

type AttemptMeta = {
  name: string;
  category: string;
  difficulty: string;
  secondsPerQuestion: number;
  responseSeconds: number;
};

const DRAFT_KEY_PREFIX = "ma-draft-";

const loadingStages = [
  "Understanding your responses",
  "Checking key concepts",
  "Detecting missed constraints",
  "Comparing interpretations",
  "Preparing your feedback",
];

function RunTest() {
  const search = useSearch({ from: "/test/run" });
  const attemptId = search.attemptId;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [total, setTotal] = useState(0);
  const [stage, setStage] = useState<Stage>("read");
  const [remaining, setRemaining] = useState(45);
  const [responseRemaining, setResponseRemaining] = useState(90);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [question, setQuestion] = useState<QuestionPayload | null>(null);
  const [testMeta, setTestMeta] = useState<AttemptMeta | null>(null);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);
  const initialFetchDone = useRef(false);

  const draftStorageKey = attemptId ? `${DRAFT_KEY_PREFIX}${attemptId}-${index}` : "";

  // 1. Initial attempt initialization & question fetch
  const loadQuestionForPosition = useCallback(async (initialPos: number, attId: string) => {
    setLoading(true);
    let currentPos = initialPos;
    try {
      while (true) {
        const res = await revealQuestion({ data: { attemptId: attId, position: currentPos } });

        if (res.state === "finished") {
          setStage("evaluating");
          break;
        }

        if (res.state === "submitted") {
          currentPos++;
          setIndex(currentPos);
          continue;
        }

        if (res.state === "consumed") {
          setQuestion(res.meta ?? null);
          setStage("respond");
          setResponseRemaining(testMeta?.responseSeconds || 90);
          const savedDraft =
            sessionStorage.getItem(`${DRAFT_KEY_PREFIX}${attId}-${currentPos}`) || "";
          setDraft(savedDraft);
          break;
        }

        // Ready to read
        setQuestion(res.question);
        setRemaining(res.remainingSeconds || 45);
        setResponseRemaining(testMeta?.responseSeconds || 90);
        setStage("read");
        break;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load question";
      toast.error(message);
      setStage("error");
    } finally {
      setLoading(false);
    }
  }, [testMeta?.responseSeconds]);

  useEffect(() => {
    if (!attemptId) {
      toast.error("No active test attempt found. Please enter a valid test code.");
      navigate({ to: "/test" });
      return;
    }

    if (initialFetchDone.current) return;
    initialFetchDone.current = true;

    async function init() {
      try {
        const state = await getAttemptState({ data: { attemptId: attemptId! } });

        if (state.status === "evaluated") {
          navigate({ to: "/result/$attemptId", params: { attemptId: attemptId! } });
          return;
        }

        setTotal(state.total);
        setIndex(state.currentIndex);
        if (state.test) {
          setTestMeta({
            name: state.test.name,
            category: state.test.category,
            difficulty: state.test.difficulty,
            secondsPerQuestion: state.test.seconds_per_question,
            responseSeconds: state.test.response_seconds,
          });
        }

        if (state.status === "evaluating" || state.currentIndex >= state.total) {
          setLoading(false);
          setStage("evaluating");
        } else if (state.currentIndex > 0) {
          // Mid-test resumption after browser reload
          setShowOnboarding(false);
          await loadQuestionForPosition(state.currentIndex, attemptId!);
        } else {
          // Show onboarding before starting the first question
          setShowOnboarding(true);
          setLoading(false);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to initialize test attempt";
        toast.error(message);
        navigate({ to: "/test" });
      }
    }

    init();
  }, [attemptId, navigate, loadQuestionForPosition]);

  // 2. Draft recovery & session storage sync during respond stage
  useEffect(() => {
    if (stage === "respond" && draftStorageKey) {
      sessionStorage.setItem(draftStorageKey, draft);
    }
  }, [stage, draft, draftStorageKey]);

  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const submittingRef = useRef(false);
  useEffect(() => {
    submittingRef.current = submitting;
  }, [submitting]);

  // 5. Submit response (autoSubmit boolean allows empty or short answers when timer expires)
  const handleSubmitUnderstanding = async (isAutoSubmit = false) => {
    if (!attemptId || submittingRef.current) return;

    const currentDraft = draftRef.current.trim();
    if (!isAutoSubmit && currentDraft.length < 10) {
      toast.error("Please write at least a sentence explaining what the passage asks for.");
      return;
    }

    setSubmitting(true);
    submittingRef.current = true;
    try {
      await submitAnswer({
        data: {
          attemptId,
          position: index,
          response: currentDraft || "(No response submitted before time expired)",
        },
      });

      // Clear draft for this position
      if (draftStorageKey) {
        sessionStorage.removeItem(draftStorageKey);
      }
      setDraft("");
      draftRef.current = "";

      const nextIndex = index + 1;
      if (nextIndex < total) {
        setIndex(nextIndex);
        await loadQuestionForPosition(nextIndex, attemptId);
      } else {
        setStage("evaluating");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit response";
      toast.error(message);
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  // 3. Reading and Writing timers
  useEffect(() => {
    if (loading || showOnboarding) return;

    if (stage === "read") {
      const id = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(id);
            setStage("respond");
            setResponseRemaining(testMeta?.responseSeconds || 90);
            return 0;
          }
          return r - 1;
        });
      }, 1000);

      return () => clearInterval(id);
    }

    if (stage === "respond") {
      const id = setInterval(() => {
        setResponseRemaining((r) => {
          if (r <= 1) {
            clearInterval(id);
            // Auto submit when response timer runs out
            handleSubmitUnderstanding(true);
            return 0;
          }
          return r - 1;
        });
      }, 1000);

      return () => clearInterval(id);
    }
  }, [stage, loading, showOnboarding, testMeta?.responseSeconds, attemptId, index, total]);

  // 6. Handle Attempt Evaluation completion
  const triggerFinishAttempt = useCallback(async () => {
    if (!attemptId) return;
    setEvalError(null);
    try {
      const res = await finishAttempt({ data: { attemptId } });
      navigate({ to: "/result/$attemptId", params: { attemptId: res.attemptId } });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "AI evaluation failed or took too long to respond.";
      setEvalError(message);
    }
  }, [attemptId, navigate]);

  useEffect(() => {
    if (stage === "evaluating") {
      triggerFinishAttempt();
    }
  }, [stage, triggerFinishAttempt]);

  if (loading) {
    return (
      <main className="grid-backdrop flex min-h-screen items-center justify-center px-5">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Preparing question...</p>
        </div>
      </main>
    );
  }

  if (stage === "evaluating") {
    return <Evaluating error={evalError} onRetry={triggerFinishAttempt} />;
  }

  if (stage === "error") {
    return (
      <main className="grid-backdrop flex min-h-screen items-center justify-center px-5">
        <div className="panel max-w-md p-6 text-center">
          <AlertCircle className="mx-auto size-8 text-destructive" />
          <h2 className="mt-4 text-lg font-bold text-foreground">Something went wrong</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We were unable to load the current test question.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => attemptId && loadQuestionForPosition(index, attemptId)}>
              <RefreshCw className="mr-2 size-4" /> Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/test" })}>
              Back to Test Codes
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const progress = ((index + (stage === "respond" ? 0.5 : 0)) / Math.max(1, total)) * 100;
  const lowTime = remaining <= 10;

  if (showOnboarding) {
    return (
      <Onboarding
        onComplete={async () => {
          setShowOnboarding(false);
          await loadQuestionForPosition(index, attemptId!);
        }}
        onSkip={async () => {
          setShowOnboarding(false);
          await loadQuestionForPosition(index, attemptId!);
        }}
      />
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border px-5 py-4 lg:px-8">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            {testMeta?.name || "Midnight Academy"}
          </span>
          <span className="ml-auto text-xs font-semibold text-foreground">
            Question {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          {stage === "read" ? (
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-sm font-bold tabular-nums",
                remaining <= 10
                  ? "border-destructive/45 bg-destructive/10 text-destructive"
                  : "border-border bg-surface text-foreground",
              )}
            >
              <Timer className="size-3.5" />
              Read: 00:{String(remaining).padStart(2, "0")}
            </span>
          ) : stage === "respond" ? (
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-sm font-bold tabular-nums",
                responseRemaining <= 15
                  ? "border-destructive/45 bg-destructive/10 text-destructive"
                  : "border-border bg-surface text-foreground",
              )}
            >
              <Timer className="size-3.5" />
              Write: {Math.floor(responseRemaining / 60)}:
              {String(responseRemaining % 60).padStart(2, "0")}
            </span>
          ) : null}
        </div>
        <div className="mx-auto mt-3 h-1 w-full max-w-3xl overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-linear-to-r from-primary to-violet transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-12">
        {stage === "read" && question?.text ? (
          <>
            <div
              className="panel animate-fade-up select-none p-6 lg:p-8"
              onCopy={(e) => e.preventDefault()}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Tag tone="primary">
                  {question.category} {question.topic ? `/ ${question.topic}` : ""}
                </Tag>
                {question.difficulty ? (
                  <DifficultyTag difficulty={question.difficulty as "Easy" | "Medium" | "Hard"} />
                ) : null}
              </div>
              <p className="mt-6 text-lg leading-relaxed text-foreground lg:text-xl">
                {question.text}
              </p>
            </div>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              You have limited time to understand this question.
            </p>
            <div className="mt-5 flex justify-center">
              <Button size="lg" className="glow-ring" onClick={() => setStage("respond")}>
                I Understand
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs text-muted-foreground">
                <EyeOff className="size-3.5" /> Question hidden
              </span>
              <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl">
                What did you understand?
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Explain the question in your own words. Do not solve it.
              </p>
            </div>
            <Textarea
              id="student-response"
              aria-label="Explain what you understood about the question"
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Describe what you think the question is asking: the objective, the constraints, and the expected input/output..."
              className="mt-6 min-h-[220px] resize-none text-base leading-relaxed"
              disabled={submitting}
            />
            <div
              className="mt-2 flex items-center justify-between text-xs text-muted-foreground"
              aria-live="polite"
            >
              <span>{draft.length} characters</span>
              <span>
                {draft.trim().length < 10 ? "Write at least 10 characters" : "Ready to submit"}
              </span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={handleSubmitUnderstanding}
                disabled={draft.trim().length < 10 || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Submitting...
                  </>
                ) : index + 1 === total ? (
                  "Submit Final Understanding"
                ) : (
                  "Submit Understanding"
                )}
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => setDraft("")}
                disabled={submitting || !draft}
              >
                Clear
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function Evaluating({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (error) return;
    const t = setInterval(() => {
      setStep((s) => (s < loadingStages.length - 1 ? s + 1 : s));
    }, 2200);
    return () => clearInterval(t);
  }, [error]);

  if (error) {
    return (
      <main className="grid-backdrop flex min-h-screen items-center justify-center px-5">
        <div className="panel max-w-md p-7 text-center">
          <AlertCircle className="mx-auto size-8 text-destructive" />
          <h1 className="mt-4 text-xl font-bold text-foreground">Evaluation Processing Note</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{error}</p>
          <div className="mt-6">
            <Button size="lg" onClick={onRetry}>
              <RefreshCw className="mr-2 size-4" /> Retry Evaluation
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="grid-backdrop flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-md text-center">
        <Loader2 className="mx-auto size-7 animate-spin text-primary" />
        <h1 className="mt-6 text-xl font-bold text-foreground">Evaluating your comprehension...</h1>
        <p className="mt-2 text-xs text-muted-foreground">
          AI is analyzing your interpretations across the five comprehension axes.
        </p>
        <ul className="panel mt-8 space-y-3 p-5 text-left">
          {loadingStages.map((label, i) => (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full border",
                  i < step
                    ? "border-success/45 bg-success/12 text-success"
                    : i === step
                      ? "border-primary/50 bg-primary/12 text-primary"
                      : "border-border text-muted-foreground",
                )}
              >
                {i < step ? (
                  <Check className="size-3" />
                ) : (
                  <span className="text-[10px]">{i + 1}</span>
                )}
              </span>
              <span className={i <= step ? "text-foreground" : "text-muted-foreground"}>
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
