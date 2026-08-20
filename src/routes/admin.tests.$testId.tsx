import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Archive, Copy, Loader2, Pause, Play } from "lucide-react";
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
import { formatDate, scoreTextClass } from "@/lib/mock-data";
import { getAdminTest, setTestStatus } from "@/lib/admin.functions";

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
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl">
            {test.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Tag tone="primary">{test.category}</Tag>
            <DifficultyTag difficulty={test.difficulty as "Easy" | "Medium" | "Hard"} />
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
              await setTestStatus({ data: { testId: test.id, status: "completed" } });
              toast.success("Test archived");
            }}
          >
            <Archive className="size-4" /> Archive
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Questions"
          value={test.questions}
          hint={`${test.secondsPerQuestion}s reading`}
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
        <StatCard label="Created" value={formatDate(test.created)} />
      </div>

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
                <li key={s.attemptId}>
                  <Link
                    to="/admin/students/$studentId"
                    params={{ studentId: s.id }}
                    className="flex items-center gap-3 py-3 transition-colors hover:opacity-80"
                  >
                    <span className="grid size-8 place-items-center rounded-full bg-primary/12 text-[11px] font-bold text-primary">
                      {s.initials}
                    </span>
                    <div>
                      <span className="block text-sm font-semibold text-foreground">{s.name}</span>
                      <span className="block text-xs text-muted-foreground">{s.email}</span>
                    </div>
                    <span
                      className={`ml-auto text-sm font-bold ${
                        s.score ? scoreTextClass(s.score) : "text-muted-foreground"
                      }`}
                    >
                      {s.score ? `${s.score}%` : "In Progress"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </PageShell>
  );
}
