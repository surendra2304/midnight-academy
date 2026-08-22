import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { DifficultyTag, PageShell, SectionHeading, StatusTag, Tag } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { scoreTextClass } from "@/lib/mock-data";
import { formatToIST } from "@/lib/format";
import { listAdminTests } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/tests/")({
  head: () => ({
    meta: [
      { title: "Tests — Midnight Academy Admin" },
      {
        name: "description",
        content:
          "Every comprehension test you have created, with status, participation and averages.",
      },
      { property: "og:title", content: "Tests — Midnight Academy Admin" },
      {
        property: "og:description",
        content: "Manage draft, active, paused and completed comprehension tests.",
      },
    ],
  }),
  component: AdminTests,
});

type TestItem = {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  status: string;
  code: string | null;
  questions: number;
  secondsPerQuestion: number;
  created: string;
  participants: number;
  average: number;
};

function AdminTests() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await listAdminTests();
        setTests(res as TestItem[]);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your tests...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SectionHeading
        title="Tests"
        subtitle={`${tests.length} tests · open one to see per-question analytics.`}
        action={
          <Button asChild>
            <Link to="/admin/create">
              <Plus className="size-4" /> Create Test
            </Link>
          </Button>
        }
      />
      {tests.length === 0 ? (
        <div className="panel p-10 text-center">
          <h3 className="text-base font-semibold text-foreground">No tests yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first comprehension test to begin assessing student reading accuracy.
          </p>
          <Button asChild className="mt-5">
            <Link to="/admin/create">Create Test</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tests.map((t) => (
            <Link
              key={t.id}
              to="/admin/tests/$testId"
              params={{ testId: t.id }}
              className="panel flex flex-col p-5 transition-colors hover:border-border-strong"
            >
              <div className="flex items-start justify-between gap-3">
                <Tag tone="primary">{t.category}</Tag>
                <StatusTag status={t.status as "draft" | "active" | "completed"} />
              </div>
              <h3 className="mt-4 text-base font-semibold leading-snug text-foreground">
                {t.name}
              </h3>
              <p className="mt-1.5 font-mono text-xs text-primary">{t.code || "Draft (No Code)"}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <DifficultyTag difficulty={t.difficulty as "Easy" | "Medium" | "Hard"} />
                <Tag>{t.questions} questions</Tag>
                <Tag>{t.secondsPerQuestion}s each</Tag>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                <span>{t.participants} participants</span>
                <span className={`font-bold ${scoreTextClass(t.average)}`}>
                  {t.average ? `${t.average}% avg` : "No attempts"}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Created {formatToIST(t.created)}</p>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
