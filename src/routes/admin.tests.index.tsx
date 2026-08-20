import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { DifficultyTag, PageShell, SectionHeading, StatusTag, Tag } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { adminTests, formatDate, scoreTextClass } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/tests/")({
  head: () => ({
    meta: [
      { title: "Tests — Midnight Academy Admin" },
      {
        name: "description",
        content: "Every comprehension test you have created, with status, participation and averages.",
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

function AdminTests() {
  return (
    <PageShell>
      <SectionHeading
        title="Tests"
        subtitle={`${adminTests.length} tests · open one to see per-question analytics.`}
        action={
          <Button asChild>
            <Link to="/admin/create">
              <Plus className="size-4" /> Create Test
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {adminTests.map((t) => (
          <Link
            key={t.id}
            to="/admin/tests/$testId"
            params={{ testId: t.id }}
            className="panel flex flex-col p-5 transition-colors hover:border-border-strong"
          >
            <div className="flex items-start justify-between gap-3">
              <Tag tone="primary">{t.category}</Tag>
              <StatusTag status={t.status} />
            </div>
            <h3 className="mt-4 text-base font-semibold leading-snug text-foreground">{t.name}</h3>
            <p className="mt-1.5 font-mono text-xs text-primary">{t.code}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <DifficultyTag difficulty={t.difficulty} />
              <Tag>{t.questions} questions</Tag>
              <Tag>{t.secondsPerQuestion}s each</Tag>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
              <span>{t.participants} participants</span>
              <span className={`font-bold ${scoreTextClass(t.average)}`}>
                {t.average ? `${t.average}% avg` : "No attempts"}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Created {formatDate(t.created)}</p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
