import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Archive, Copy, Loader2, Pause, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ScoreBars } from "@/components/charts";
import {
  DifficultyTag,
  PageShell,
  Panel,
  SectionHeading,
  StatCard,
  StatusTag,
  Tag,
} from "@/components/kit";
import { Button } from "@/components/ui/button";
import { scoreTextClass } from "@/lib/mock-data";
import { formatToIST } from "@/lib/format";
import { deleteQuestion, deleteTest, getAdminTest, setTestStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/tests/$testId")({
  head: () => ({
    meta: [
      { title: "Test Detail — Midnight Academy Admin" },
      {
        name: "description",
        content:
          "Per-question comprehension analytics, participant scores and management actions for a single test.",
      },
      { property: "og:title", content: "Test Detail — Midnight Academy Admin" },
      {
        property: "og:description",
        content: "See exactly which question students misread most.",
      },
    ],
  }),
  component: TestDetail,
});

type TestDetailData = {
  test: {
    id: string;
    name: string;
    category: string;
    difficulty: string;
    status: string;
    code: string | null;
    questions: number;
    secondsPerQuestion: number;
    responseSeconds: number;
    created: string;
    participants: number;
    average: number;
  };
  questions: Array<{
    id: string;
    position: number;
    text: string;
    topic: string;
    difficulty: string;
    concepts: string[];
    constraints: string[];
    referenceAnswer: string;
    approved: boolean;
  }>;
  participants: Array<{
    id: string;
    attemptId: string;
    name: string;
    initials: string;
    email: string;
    score: number;
    codeNumber?: string;
    status: string;
    blurCount: number;
    completedAt: string | null;
  }>;
  perQuestionDifficulty: Array<{
    q: string;
    score: number;
  }>;
};

function TestDetail() {
  const { testId } = useParams({ from: "/admin/tests/$testId" });
  const [data, setData] = useState<TestDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDeleteQuestion = async (questionId: string) => {
    setDeletingQuestionId(questionId);
    try {
      await deleteQuestion({ data: { questionId } });
      setData((prev) =>
        prev
          ? {
              ...prev,
              questions: prev.questions.filter((q) => q.id !== questionId),
              test: { ...prev.test, questions: prev.test.questions - 1 },
            }
          : prev,
      );
      toast.success("Question deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not delete the question");
    } finally {
      setDeletingQuestionId(null);
    }
  };

  const handleDeleteTest = async () => {
    if (
      !window.confirm(
        "Delete this test permanently? All its questions and student attempts will be removed. This cannot be undone.",
      )
    ) {
      return;
    }
    try {
      await deleteTest({ data: { testId } });
      toast.success("Test deleted");
      navigate({ to: "/admin/tests" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not delete the test");
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const res = await getAdminTest({ data: { testId } });
        setData(res as TestDetailData);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load test details";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [testId]);

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading test analytics...</p>
        </div>
      </PageShell>
    );
  }

  if (!data) {
    return (
      <PageShell>
        <div className="panel p-8 text-center">
          <h2 className="text-lg font-bold text-foreground">Test Not Found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Could not find details for this test ID.
          </p>
          <Button asChild className="mt-5">
            <Link to="/admin/tests">Back to Tests</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  const { test, participants, perQuestionDifficulty } = data;
  const weakest =
    perQuestionDifficulty.length > 0
      ? [...perQuestionDifficulty].sort((a, b) => a.score - b.score)[0]
      : null;

  const handleToggleStatus = async () => {
    const nextStatus = test.status === "active" ? "draft" : "active";
    try {
      await setTestStatus({ data: { testId: test.id, status: nextStatus } });
      setData((prev) => (prev ? { ...prev, test: { ...prev.test, status: nextStatus } } : prev));
      toast.success(`Test marked as ${nextStatus}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update test status";
      toast.error(message);
    }
  };

  const handleCopyCode = () => {
    if (test.code) {
      navigator.clipboard?.writeText(test.code);
      toast.success("Test code copied to clipboard");
    }
  };

  return (
    <PageShell>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <Link to="/admin/tests" className="text-xs text-muted-foreground hover:text-foreground">
            ← All tests
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl">
              {test.name}
            </h1>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Tag tone="primary">{test.category}</Tag>
            <DifficultyTag difficulty={test.difficulty as "Easy" | "Medium" | "Hard"} />
            {test.activeParticipants > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                </span>
                {test.activeParticipants} currently writing
              </span>
            ) : null}
            <StatusTag status={test.status as "draft" | "active" | "completed"} />
            {test.code ? (
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1 font-mono text-xs text-primary hover:underline"
              >
                <Copy className="size-3" /> {test.code}
              </button>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {test.code ? (
            <Button variant="outline" size="sm" onClick={handleCopyCode}>
              <Copy className="size-4" /> Copy Code
            </Button>
          ) : null}
          <Button variant="outline" size="sm" onClick={handleToggleStatus}>
            {test.status === "active" ? (
              <>
                <Pause className="size-4" /> Pause
              </>
            ) : (
              <>
                <Play className="size-4" /> Activate
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              try {
                await setTestStatus({ data: { testId: test.id, status: "completed" } });
                setData((prev) =>
                  prev ? { ...prev, test: { ...prev.test, status: "completed" } } : prev,
                );
                toast.success("Test archived");
              } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Failed to archive test";
                toast.error(message);
              }
            }}
          >
            <Archive className="size-4" /> Archive
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={handleDeleteTest}
          >
            <Trash2 className="size-4" /> Delete Test
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Questions"
          value={test.questions}
          hint={`${test.secondsPerQuestion}s read · ${test.responseSeconds || 90}s write`}
        />
        <StatCard label="Participants" value={participants.length} />
        <StatCard
          label="Average Score"
          value={
            <span className={test.average ? scoreTextClass(test.average) : "text-muted-foreground"}>
              {test.average ? `${test.average}%` : "No scores"}
            </span>
          }
        />
        <StatCard label="Created" value={formatToIST(test.created)} />
      </div>

      <Panel className="mt-6">
        <SectionHeading title="Questions" subtitle="All passages in this test." />
        {data.questions.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No questions left in this test.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {data.questions.map((q, i) => (
              <li key={q.id} className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Question {String(i + 1).padStart(2, "0")}
                    </span>
                    <Tag>{q.topic || "General"}</Tag>
                    <DifficultyTag difficulty={q.difficulty as "Easy" | "Medium" | "Hard"} />
                    {q.approved ? null : <Tag tone="warning">Not approved</Tag>}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground">
                    {q.text}
                  </p>
                  {(q.concepts?.length ?? 0) > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Concepts: {q.concepts.join(" · ")}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-destructive hover:text-destructive"
                  disabled={deletingQuestionId === q.id}
                  onClick={() => handleDeleteQuestion(q.id)}
                >
                  {deletingQuestionId === q.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel>
          <SectionHeading
            title="Per-Question Understanding"
            subtitle={
              weakest
                ? `Lowest: ${weakest.q} at ${weakest.score}% comprehension.`
                : "Awaiting participant attempts to calculate difficulty distribution."
            }
          />
          {perQuestionDifficulty.length > 0 ? (
            <ScoreBars
              data={perQuestionDifficulty as unknown as Record<string, string | number>[]}
              xKey="q"
              layout="horizontal"
              height={280}
            />
          ) : (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No question metrics available yet.
            </p>
          )}
        </Panel>
        <Panel>
          <SectionHeading title="Participants" subtitle="Individual comprehension scores." />
          {participants.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No students have attempted this test yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {participants.map((s) => (
                <li key={s.attemptId} className="flex items-center justify-between gap-3 py-3">
                  <Link
                    to="/admin/students/$studentId"
                    params={{ studentId: s.id }}
                    className="flex min-w-0 items-center gap-3 transition-colors hover:opacity-80"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/12 text-[11px] font-bold text-primary">
                      {s.initials}
                    </span>
                    <div className="min-w-0 truncate">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {s.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {s.codeNumber ? `${s.codeNumber} · ${s.email}` : s.email}
                      </span>
                      {s.completedAt ? (
                        <span className="block truncate text-[10px] text-muted-foreground/70">
                          {formatToIST(s.completedAt)}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold ${
                        s.score !== null ? scoreTextClass(s.score) : "text-muted-foreground"
                      }`}
                    >
                      {s.score !== null ? `${s.score}%` : "In Progress"}
                    </span>
                    {s.attemptId ? (
                      <Button asChild variant="outline" size="sm">
                        <Link to="/result/$attemptId" params={{ attemptId: s.attemptId }}>
                          Evaluation
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </PageShell>
  );
}
