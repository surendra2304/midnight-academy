import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, BookOpen, Clock, Loader2, Layers } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { DifficultyTag, PageShell, Tag } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { CATEGORIES, type Difficulty } from "@/lib/mock-data";
import { startAttempt } from "@/lib/attempts.functions";
import { listPracticeTests } from "@/lib/practice.functions";

export const Route = createFileRoute("/practice")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  head: () => ({
    meta: [
      { title: "Practice Library — Midnight Academy" },
      {
        name: "description",
        content:
          "Structured comprehension practice tests across DSA, DBMS, OS, Networks, OOP and Aptitude — no test code needed.",
      },
      { property: "og:title", content: "Practice Library — Midnight Academy" },
      {
        property: "og:description",
        content: "Predefined practice tests with AI evaluation. Take them any time.",
      },
    ],
  }),
  component: PracticeLibrary,
});

type PracticeTest = {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  questions: number;
  secondsPerQuestion: number;
  responseSeconds: number;
  code: string;
};

function estimateMinutes(t: PracticeTest): number {
  const perQuestion = t.secondsPerQuestion + t.responseSeconds;
  return Math.max(1, Math.round((t.questions * perQuestion) / 60));
}

function PracticeLibrary() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<PracticeTest[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingCode, setStartingCode] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await listPracticeTests();
        if (!cancelled) setTests(res as PracticeTest[]);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not load practice tests");
        if (!cancelled) setTests([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => (tests ?? []).filter((t) => activeCategory === "All" || t.category === activeCategory),
    [tests, activeCategory],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, PracticeTest[]>();
    for (const t of filtered) {
      map.set(t.category, [...(map.get(t.category) ?? []), t]);
    }
    const ordered: Array<[string, PracticeTest[]]> = [];
    for (const c of CATEGORIES) {
      const list = map.get(c);
      if (list) ordered.push([c, list]);
    }
    for (const [c, list] of map) {
      if (!CATEGORIES.includes(c as (typeof CATEGORIES)[number])) ordered.push([c, list]);
    }
    return ordered;
  }, [filtered]);

  const handleStart = async (code: string) => {
    setStartingCode(code);
    try {
      const res = await startAttempt({ data: { code, allowRetake: true } });
      if ("error" in res) {
        if (res.error === "completed" && "attemptId" in res && typeof res.attemptId === "string") {
          navigate({ to: "/result/$attemptId", params: { attemptId: res.attemptId } });
        } else {
          toast.error("This practice test is not available right now. Please try another.");
        }
        return;
      }
      navigate({ to: "/test/run", search: { attemptId: res.attemptId } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start the practice test");
    } finally {
      setStartingCode(null);
    }
  };

  return (
    <div className="min-h-screen">
      <AppNav />
      <PageShell>
        <section className="panel grid-backdrop flex flex-wrap items-center justify-between gap-6 p-7 lg:p-9">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl">
              Practice Library
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground lg:text-base">
              Structured comprehension tests ready when you are — no code needed. Read each passage
              under the timer, rewrite it from memory, and get the same AI evaluation used in real
              tests.
            </p>
          </div>
          <div className="rounded-xl border border-primary/25 bg-primary/8 px-6 py-4 text-center">
            <p className="text-3xl font-extrabold text-primary">{tests?.length ?? "—"}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Practice tests
            </p>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-2">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCategory(c)}
              className={
                "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors " +
                (activeCategory === c
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground")
              }
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading the practice library...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="panel-quiet mt-8 p-10 text-center">
            <p className="text-sm font-semibold text-foreground">No practice tests available yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please check back soon — the library is being prepared.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-12">
            {grouped.map(([category, list]) => (
              <section key={category}>
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                    <BookOpen className="size-4" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-foreground">{category}</h2>
                    <p className="text-xs text-muted-foreground">
                      {list.length} practice {list.length === 1 ? "test" : "tests"} · read, recall,
                      express
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {list.map((t) => (
                    <article
                      key={t.id}
                      className="panel flex flex-col p-5 transition-colors hover:border-primary/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <Tag tone="primary">{t.category}</Tag>
                        <DifficultyTag difficulty={t.difficulty as Difficulty} />
                      </div>
                      <h3 className="mt-4 text-base font-semibold leading-snug text-foreground">
                        {t.name}
                      </h3>

                      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Layers className="size-3.5" /> {t.questions} passages
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-3.5" /> ~{estimateMinutes(t)} min
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="size-3.5" /> {t.secondsPerQuestion}s read ·{" "}
                          {t.responseSeconds || 90}s write
                        </span>
                      </div>

                      <Button
                        className="mt-5 w-full"
                        disabled={startingCode === t.code}
                        onClick={() => handleStart(t.code)}
                      >
                        {startingCode === t.code ? (
                          <>
                            <Loader2 className="mr-2 size-4 animate-spin" /> Preparing...
                          </>
                        ) : (
                          <>
                            Start Practice <ArrowRight className="size-4" />
                          </>
                        )}
                      </Button>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <p className="mt-12 text-center text-xs text-muted-foreground">
          Practice attempts appear in your history with full AI feedback — a safe place to build the
          reading habit before the real test.
        </p>
      </PageShell>
    </div>
  );
}
