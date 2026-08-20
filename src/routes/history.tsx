import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpDown, History as HistoryIcon } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { EmptyState, PageShell, SectionHeading, StatusTag, Tag } from "@/components/kit";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { attempts, CATEGORIES, formatDate, scoreTextClass } from "@/lib/mock-data";

export const Route = createFileRoute("/history")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  head: () => ({
    meta: [
      { title: "Attempt History — Midnight Academy" },
      {
        name: "description",
        content:
          "Every comprehension attempt you have made, filterable by category, score band and recency.",
      },
      { property: "og:title", content: "Attempt History — Midnight Academy" },
      {
        property: "og:description",
        content: "Open any past attempt to revisit its full AI evaluation.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [category, setCategory] = useState("all");
  const [band, setBand] = useState("all");
  const [sort, setSort] = useState("recent");

  const rows = attempts
    .filter((a) => category === "all" || a.category === category)
    .filter((a) =>
      band === "all"
        ? true
        : band === "high"
          ? a.score >= 80
          : band === "mid"
            ? a.score >= 65 && a.score < 80
            : a.score < 65,
    )
    .sort((a, b) =>
      sort === "recent"
        ? b.date.localeCompare(a.date)
        : sort === "oldest"
          ? a.date.localeCompare(b.date)
          : b.score - a.score,
    );

  return (
    <div className="min-h-screen">
      <AppNav />
      <PageShell>
        <SectionHeading
          title="Attempt History"
          subtitle={`${attempts.length} attempts recorded. Open any row for its full evaluation.`}
        />

        <div className="panel flex flex-wrap items-end gap-3 p-5">
          <div className="min-w-[180px]">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[180px]">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Score range
            </label>
            <Select value={band} onValueChange={setBand}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any score</SelectItem>
                <SelectItem value="high">80% and above</SelectItem>
                <SelectItem value="mid">65% – 79%</SelectItem>
                <SelectItem value="low">Below 65%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[180px]">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Sort
            </label>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most recent</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="score">Highest score</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            className="ml-auto"
            onClick={() => {
              setCategory("all");
              setBand("all");
              setSort("recent");
            }}
          >
            <ArrowUpDown className="size-4" /> Reset
          </Button>
        </div>

        {rows.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<HistoryIcon className="size-5" />}
              title="Nothing matches those filters"
              description="No attempt falls inside this category and score range. Widen the filters, or start a fresh practice set."
              action={
                <>
                  <Button variant="outline" onClick={() => { setCategory("all"); setBand("all"); }}>
                    Clear filters
                  </Button>
                  <Button asChild>
                    <Link to="/practice">Browse Practice</Link>
                  </Button>
                </>
              }
            />
          </div>
        ) : (
          <div className="panel mt-6 overflow-hidden p-0">
            <div className="hidden grid-cols-[minmax(0,2.4fr)_repeat(4,minmax(0,1fr))] gap-3 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground lg:grid">
              <span>Test</span>
              <span>Category</span>
              <span>Questions</span>
              <span>Score</span>
              <span>Date</span>
            </div>
            <div className="divide-y divide-border">
              {rows.map((a) => (
                <Link
                  key={a.id}
                  to="/result/$attemptId"
                  params={{ attemptId: a.id }}
                  className="grid grid-cols-2 items-center gap-3 px-5 py-4 transition-colors hover:bg-surface-2/60 lg:grid-cols-[minmax(0,2.4fr)_repeat(4,minmax(0,1fr))]"
                >
                  <span className="col-span-2 text-sm font-semibold text-foreground lg:col-span-1">
                    {a.name}
                  </span>
                  <Tag>{a.category}</Tag>
                  <span className="text-sm text-muted-foreground">{a.questions}</span>
                  <span className={`text-sm font-bold ${scoreTextClass(a.score)}`}>{a.score}%</span>
                  <span className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                    {formatDate(a.date)} <StatusTag status={a.status} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </PageShell>
    </div>
  );
}
