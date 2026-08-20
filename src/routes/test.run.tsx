import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, EyeOff, Loader2, Timer } from "lucide-react";
import { DifficultyTag, Tag } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sampleTest, testQuestions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/test/run")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
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

type Stage = "read" | "respond" | "evaluating";

const DRAFT_KEY = "ma-draft";
const STAGE_KEY = "ma-stage";

const loadingStages = [
  "Understanding your responses",
  "Checking key concepts",
  "Detecting missed constraints",
  "Comparing interpretations",
  "Preparing your feedback",
];

function RunTest() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<Stage>("read");
  const [remaining, setRemaining] = useState(sampleTest.secondsPerQuestion);
  const [draft, setDraft] = useState("");
  const [blurs, setBlurs] = useState(0);
  const restored = useRef(false);

  const question = testQuestions[index]!;
  const total = testQuestions.length;

  /* Recover a draft (and the respond stage) after refresh — never the question. */
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const savedStage = sessionStorage.getItem(STAGE_KEY);
      const saved = sessionStorage.getItem(DRAFT_KEY);
      if (savedStage) {
        const [s, i] = savedStage.split(":");
        if (s === "respond") {
          setStage("respond");
          setIndex(Number(i) || 0);
          if (saved) setDraft(saved);
        }
      }
    } catch {
      /* storage unavailable — start clean */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STAGE_KEY, `${stage}:${index}`);
      if (stage === "respond") sessionStorage.setItem(DRAFT_KEY, draft);
    } catch {
      /* ignore */
    }
  }, [stage, index, draft]);

  /* Reading timer */
  useEffect(() => {
    if (stage !== "read") return;
    setRemaining(sampleTest.secondsPerQuestion);
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          setStage("respond");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [stage, index]);

  /* Quiet integrity signal: window blur / tab switch during reading */
  useEffect(() => {
    if (stage !== "read") return;
    const onBlur = () => setBlurs((b) => b + 1);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onBlur);
    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onBlur);
    };
  }, [stage]);

  const submitUnderstanding = useCallback(() => {
    setDraft("");
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    if (index + 1 < total) {
      setIndex((i) => i + 1);
      setStage("read");
    } else {
      setStage("evaluating");
    }
  }, [index, total]);

  if (stage === "evaluating") {
    return <Evaluating onDone={() => navigate({ to: "/result/$attemptId", params: { attemptId: "latest" } })} />;
  }

  const progress = ((index + (stage === "respond" ? 0.5 : 0)) / total) * 100;
  const lowTime = remaining <= 10;

  return (
    <main className="flex min-h-screen flex-col bg-background" data-blurs={blurs}>
      <header className="border-b border-border px-5 py-4 lg:px-8">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            Midnight Academy
          </span>
          <span className="ml-auto text-xs font-semibold text-foreground">
            Question {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          {stage === "read" ? (
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-sm font-bold tabular-nums",
                lowTime
                  ? "border-destructive/45 bg-destructive/10 text-destructive"
                  : "border-border bg-surface text-foreground",
              )}
            >
              <Timer className="size-3.5" />
              00:{String(remaining).padStart(2, "0")}
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
        {stage === "read" ? (
          <>
            <div className="panel animate-fade-up select-none p-6 lg:p-8" onCopy={(e) => e.preventDefault()}>
              <div className="flex flex-wrap items-center gap-2">
                <Tag tone="primary">
                  {question.category} / {question.topic.split(" / ").pop()}
                </Tag>
                <DifficultyTag difficulty={question.difficulty} />
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
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Describe what you think the question is asking..."
              className="mt-6 min-h-[220px] resize-none text-base leading-relaxed"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{draft.length} characters</span>
              <span>Response time is untimed for this test</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" onClick={submitUnderstanding} disabled={draft.trim().length < 10}>
                Submit Understanding
              </Button>
              <Button size="lg" variant="ghost" onClick={() => setDraft("")}>
                Clear
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function Evaluating({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= loadingStages.length) {
      const t = setTimeout(onDone, 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 850);
    return () => clearTimeout(t);
  }, [step, onDone]);

  const done = step >= loadingStages.length;

  return (
    <main className="grid-backdrop flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-md text-center">
        <Loader2 className={cn("mx-auto size-6 text-primary", !done && "animate-spin")} />
        <h1 className="mt-6 text-xl font-bold text-foreground">
          {done ? "Your results are ready." : "Analyzing your understanding..."}
        </h1>
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
                {i < step ? <Check className="size-3" /> : <span className="text-[10px]">{i + 1}</span>}
              </span>
              <span className={i <= step ? "text-foreground" : "text-muted-foreground"}>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
