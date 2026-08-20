import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Archive, Copy, Pause, Pencil } from "lucide-react";
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
import {
  adminStudents,
  adminTests,
  formatDate,
  perQuestionDifficulty,
  scoreTextClass,
} from "@/lib/mock-data";

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

function TestDetail() {
  const { testId } = useParams({ from: "/admin/tests/$testId" });
  const test = adminTests.find((t) => t.id === testId) ?? adminTests[0]!;
  const weakest = [...perQuestionDifficulty].sort((a, b) => a.score - b.score)[0]!;

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
            <DifficultyTag difficulty={test.difficulty} />
            <StatusTag status={test.status} />
            <span className="font-mono text-xs text-primary">{test.code}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Opened editor")}>
            <Pencil className="size-4" /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Test duplicated as draft")}
          >
            <Copy className="size-4" /> Duplicate
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success("Test paused")}>
            <Pause className="size-4" /> Pause
          </Button>
          <Button variant="ghost" size="sm" onClick={() => toast.success("Test archived")}>
            <Archive className="size-4" /> Archive
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Questions" value={test.questions} hint={`${test.secondsPerQuestion}s each`} />
        <StatCard label="Participants" value={test.participants} />
        <StatCard
          label="Average Score"
          value={<span className={scoreTextClass(test.average)}>{test.average}%</span>}
        />
        <StatCard label="Created" value={formatDate(test.created)} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel>
          <SectionHeading
            title="Per-Question Understanding"
            subtitle={`Lowest: ${weakest.q} at ${weakest.score}% — most students misread this one.`}
          />
          <ScoreBars
            data={perQuestionDifficulty as unknown as Record<string, string | number>[]}
            xKey="q"
            layout="horizontal"
            height={280}
          />
        </Panel>
        <Panel>
          <SectionHeading title="Participants" subtitle="Individual comprehension scores." />
          <ul className="divide-y divide-border">
            {adminStudents.map((s) => (
              <li key={s.id}>
                <Link
                  to="/admin/students/$studentId"
                  params={{ studentId: s.id }}
                  className="flex items-center gap-3 py-3 transition-colors hover:opacity-80"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-primary/12 text-[11px] font-bold text-primary">
                    {s.initials}
                  </span>
                  <span className="text-sm text-foreground">{s.name}</span>
                  <span className={`ml-auto text-sm font-bold ${scoreTextClass(s.average)}`}>
                    {s.average}%
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </PageShell>
  );
}
