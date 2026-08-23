import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpDown, History as HistoryIcon, Loader2 } from "lucide-react";
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
import { CATEGORIES, scoreTextClass } from "@/lib/mock-data";
import { formatToIST } from "@/lib/format";
import { getStudentDashboardData, type StudentAnalytics } from "@/lib/student.functions";

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
  const [data, setData] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [band, setBand] = useState("all");
  const [sort, setSort] = useState("recent");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getStudentDashboardData();
        setData(res);
      } catch {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen">
        <AppNav />
        <PageShell>
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your attempt history...</p>
          </div>
        </PageShell>
      </div>
    );
  }

  const allAttempts = data?.recentAttempts || [];

  const rows = allAttempts
    .filter((a) => category === "all" || a.category === category)
    .filter((a) => {
      if (band === "all") return true;
      if (a.score === null) return band === "in_progress";
      if (band === "high") return a.score >= 80;
      if (band === "mid") return a.score >= 65 && a.score < 80;
      if (band === "low") return a.score < 65;
      return true;
    })
    .sort((a, b) => {
      if (sort === "recent") return b.date.localeCompare(a.date);
      if (sort === "oldest") return a.date.localeCompare(b.date);
      const scoreA = a.score ?? -1;
      const scoreB = b.score ?? -1;
      return scoreB - scoreA;
    });

  return (
    <div className="min-h-screen">
      <AppNav />
      <PageShell>
        <SectionHeading
          title="Attempt History"
          subtitle={`${allAttempts.length} attempts recorded. Open any row for its full evaluation.`}
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
              title="No attempts found"
              description="No attempt matches the selected filters. Take a test or widen your filters."
              action={
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCategory("all");
                      setBand("all");
                    }}
                  >
                    Clear filters
                  </Button>
                  <Button asChild>
                    <Link to="/test">Take Test</Link>
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
              <span>Difficulty</span>
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
                    {a.testName}
                  </span>
                  <Tag>{a.category}</Tag>
                  <span className="text-sm text-muted-foreground">{a.difficulty}</span>
                  <span
                    className={`text-sm font-bold ${
                      a.score !== null ? scoreTextClass(a.score) : "text-muted-foreground"
                    }`}
                  >
                    {a.score !== null ? `${a.score}%` : "In Progress"}
                  </span>
                  <span className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                    {formatToIST(a.date)}{" "}
                    <StatusTag status={a.status as "in_progress" | "evaluated"} />
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
