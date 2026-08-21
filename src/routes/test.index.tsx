import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Info,
  Loader2,
} from "lucide-react";
import { Wordmark } from "@/components/brand";
import { DifficultyTag, Tag } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { startAttempt } from "@/lib/attempts.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/test/")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  head: () => ({
    meta: [
      { title: "Enter Your Test — Midnight Academy" },
      {
        name: "description",
        content:
          "Enter your test code to begin a Midnight Academy technical comprehension assessment.",
      },
      { property: "og:title", content: "Enter Your Test — Midnight Academy" },
      {
        property: "og:description",
        content: "Read the instructions, then start your comprehension test.",
      },
    ],
  }),
  component: EnterTest,
});

const instructions = [
  "Each question is shown for a limited time. Read it carefully — your only task is to understand it.",
  "When the time ends, the question disappears and does not come back.",
  "You will then explain, in your own words, what the question was asking.",
  "Do not solve the question. Describe the objective, the constraints and the expected input and output.",
  "Copying and text selection are disabled while the question is on screen.",
  "Each test code allows one attempt. Submitting the final question ends the test.",
];

type Problem = "invalid" | "completed" | "closed" | "expired" | "empty" | null;

type VerifiedTestData = {
  attemptId: string;
  answered: number;
  total: number;
  test: {
    id: string;
    name: string;
    category: string;
    difficulty: string;
    code: string;
    secondsPerQuestion: number;
    responseSeconds: number;
  };
};

function EnterTest() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState<Problem>(null);
  const [existingAttemptId, setExistingAttemptId] = useState<string | null>(null);
  const [verifiedData, setVerifiedData] = useState<VerifiedTestData | null>(null);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = code.trim().toUpperCase();
    if (!value) return;

    setLoading(true);
    setProblem(null);

    try {
      const res = await startAttempt({ data: { code: value } });

      if ("error" in res) {
        if (res.error === "completed") {
          setProblem("completed");
          if ("attemptId" in res && typeof res.attemptId === "string") {
            setExistingAttemptId(res.attemptId);
          }
        } else if (res.error === "closed") {
          setProblem("closed");
        } else if (res.error === "expired") {
          setProblem("expired");
        } else if (res.error === "empty") {
          setProblem("empty");
        } else {
          setProblem("invalid");
        }
        return;
      }

      setVerifiedData(res as VerifiedTestData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to validate test code";
      toast.error(message);
      setProblem("invalid");
    } finally {
      setLoading(false);
    }
  }

  if (verifiedData) {
    return (
      <main className="min-h-screen">
        <header className="border-b border-border px-5 py-4 lg:px-8">
          <Wordmark />
        </header>
        <div className="mx-auto max-w-2xl px-5 py-14">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl">
            {verifiedData.test.name}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Tag tone="primary">{verifiedData.test.category}</Tag>
            <DifficultyTag
              difficulty={verifiedData.test.difficulty as "Easy" | "Medium" | "Hard"}
            />
            <Tag>{verifiedData.total} questions</Tag>
            <Tag>{verifiedData.test.secondsPerQuestion}s per question</Tag>
            {verifiedData.answered > 0 ? (
              <Tag tone="violet">{verifiedData.answered} answered</Tag>
            ) : null}
          </div>

          <section className="panel mt-8 p-6">
            <h2 className="text-base font-semibold text-foreground">Before You Begin</h2>
            <ol className="mt-5 space-y-4">
              {instructions.map((text, i) => (
                <li key={text} className="flex gap-3.5">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-primary/12 text-[11px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">{text}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex gap-3 rounded-xl border border-primary/25 bg-primary/8 p-4">
              <Info className="size-4 shrink-0 text-primary" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                This test evaluates how well you understand technical questions, not just whether
                you can solve them.
              </p>
            </div>
          </section>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="glow-ring"
              onClick={() => {
                navigate({
                  to: "/test/run",
                  search: { attemptId: verifiedData.attemptId },
                });
              }}
            >
              {verifiedData.answered > 0 ? "Resume Test" : "Start Test"}{" "}
              <ArrowRight className="size-4" />
            </Button>
            <Button variant="ghost" size="lg" onClick={() => setVerifiedData(null)}>
              Use a different code
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="grid-backdrop flex min-h-screen flex-col">
      <header className="border-b border-border px-5 py-4 lg:px-8">
        <Wordmark />
      </header>
      <div className="flex flex-1 items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">
          <h1 className="text-center text-2xl font-extrabold tracking-tight text-foreground">
            Enter Your Test
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Your instructor shares a code like <span className="text-foreground">DSA-X7K29</span>.
          </p>

          <form onSubmit={submit} className="panel mt-8 p-6">
            <label
              htmlFor="code"
              className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              Enter test code
            </label>
            <Input
              id="code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setProblem(null);
              }}
              placeholder="DSA-X7K29"
              className="mt-3 h-12 text-center text-lg font-bold uppercase tracking-[0.22em]"
              autoComplete="off"
              disabled={loading}
            />

            {problem === "invalid" ? (
              <ErrorNote
                icon={<AlertTriangle className="size-4 shrink-0 text-destructive" />}
                title="That code isn't valid"
                body="Check the code with your instructor — it may have been typed incorrectly or expired."
              />
            ) : null}
            {problem === "closed" ? (
              <ErrorNote
                icon={<CalendarClock className="size-4 shrink-0 text-warning" />}
                title="This test isn't open right now"
                body="The instructor has paused it. You'll be able to attempt it once the test window reopens."
                tone="warning"
              />
            ) : null}
            {problem === "expired" ? (
              <ErrorNote
                icon={<CalendarClock className="size-4 shrink-0 text-destructive" />}
                title="This test has expired"
                body="The deadline for this test has passed. Reach out to your instructor if you need an extension."
                tone="danger"
              />
            ) : null}
            {problem === "empty" ? (
              <ErrorNote
                icon={<AlertTriangle className="size-4 shrink-0 text-warning" />}
                title="This test has no questions yet"
                body="The instructor has not approved any questions for this test code yet."
                tone="warning"
              />
            ) : null}
            {problem === "completed" ? (
              <ErrorNote
                icon={<CheckCircle2 className="size-4 shrink-0 text-primary" />}
                title="You've already completed this test"
                body="Each code allows one attempt. You can revisit your evaluation instead."
                tone="primary"
                action={
                  existingAttemptId ? (
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={() =>
                        navigate({
                          to: "/result/$attemptId",
                          params: { attemptId: existingAttemptId },
                        })
                      }
                    >
                      View my result
                    </Button>
                  ) : null
                }
              />
            ) : null}

            <Button
              type="submit"
              size="lg"
              className="mt-6 w-full"
              disabled={loading || !code.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Verifying...
                </>
              ) : (
                "Continue"
              )}
            </Button>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              No code?{" "}
              <Link to="/practice" className="text-primary hover:underline">
                Browse the practice library
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

function ErrorNote({
  icon,
  title,
  body,
  tone = "danger",
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  tone?: "danger" | "warning" | "primary";
  action?: React.ReactNode;
}) {
  const border =
    tone === "danger"
      ? "border-destructive/35 bg-destructive/8"
      : tone === "warning"
        ? "border-warning/35 bg-warning/8"
        : "border-primary/30 bg-primary/8";
  return (
    <div role="alert" className={`mt-4 flex gap-3 rounded-xl border p-4 ${border}`}>
      {icon}
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
        {action}
      </div>
    </div>
  );
}
