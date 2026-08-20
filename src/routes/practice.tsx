import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, Search } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { DifficultyTag, PageShell, SectionHeading, Tag } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CATEGORIES,
  practiceSets,
  type Category,
  type Difficulty,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/practice")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  head: () => ({
    meta: [
      { title: "Practice Library — Midnight Academy" },
      {
        name: "description",
        content:
          "Browse self-serve comprehension practice sets across DSA, Aptitude, DBMS, OS, Networks, OOP and Programming.",
      },
      { property: "og:title", content: "Practice Library — Midnight Academy" },
      {
        property: "og:description",
        content: "Open practice sets, filterable by category and difficulty. No test code needed.",
      },
    ],
  }),
  component: PracticeLibrary,
});

const difficulties: Difficulty[] = ["Easy", "Medium", "Hard"];

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-primary/60 bg-primary/10 font-semibold text-primary"
          : "border-border bg-surface text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function PracticeLibrary() {
  const [category, setCategory] = useState<Category | "All">("All");
  const [difficulty, setDifficulty] = useState<Difficulty | "All">("All");
  const [query, setQuery] = useState("");

  const sets = practiceSets.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      (difficulty === "All" || p.difficulty === difficulty) &&
      p.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="min-h-screen">
      <AppNav />
      <PageShell>
        <SectionHeading
          title="Practice Library"
          subtitle="Open practice sets you can start right now — no test code required."
        />

        <div className="panel p-5">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search practice sets"
              className="pl-9"
            />
          </div>
          <div className="mt-5 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Chip active={category === "All"} onClick={() => setCategory("All")}>
                All categories
              </Chip>
              {CATEGORIES.map((c) => (
                <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                  {c}
                </Chip>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip active={difficulty === "All"} onClick={() => setDifficulty("All")}>
                Any difficulty
              </Chip>
              {difficulties.map((d) => (
                <Chip key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>
                  {d}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        {sets.length === 0 ? (
          <div className="panel-quiet mt-6 p-10 text-center">
            <p className="text-sm font-semibold text-foreground">No sets match those filters</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try clearing the difficulty filter or picking another category.
            </p>
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => {
                setCategory("All");
                setDifficulty("All");
                setQuery("");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sets.map((p) => (
              <article key={p.id} className="panel flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <Tag tone="primary">{p.category}</Tag>
                  <DifficultyTag difficulty={p.difficulty} />
                </div>
                <h3 className="mt-4 text-base font-semibold leading-snug text-foreground">
                  {p.title}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">Builds {p.focus}</p>
                <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{p.questions} questions</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5" /> ~{p.minutes} min
                  </span>
                </div>
                <Button asChild className="mt-5 w-full">
                  <Link to="/test/run">Start</Link>
                </Button>
              </article>
            ))}
          </div>
        )}
      </PageShell>
    </div>
  );
}
