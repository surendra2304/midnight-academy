import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock,
  Filter,
  Headphones,
  Loader2,
  Mic,
  PenTool,
  Play,
  Sparkles,
} from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { PageShell } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { getPublishedTests } from "@/lib/practice.functions";
import { startToeflAttempt } from "@/lib/tests/engine.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/test/")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  head: () => ({
    meta: [
      { title: "TOEFL Test Catalog — Midnight Academy" },
      {
        name: "description",
        content: "Select an official 2026 format TOEFL mock test or targeted section exam.",
      },
    ],
  }),
  component: TestCatalog,
});

function TestCatalog() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<
    Array<{
      id: string;
      name: string;
      category: string;
      difficulty: string;
      code: string | null;
      questionCount: number;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await getPublishedTests();
        setTests(res || []);
      } catch (err) {
        console.error("Failed to load catalog:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const handleStartTest = async (testId: string) => {
    try {
      setStartingId(testId);
      const res = await startToeflAttempt({
        data: {
          testId,
          examMode: "full",
          isTimed: true,
        },
      });

      if (res?.attemptId) {
        navigate({ to: "/test/run", search: { attemptId: res.attemptId } });
      }
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Failed to start assessment");
    } finally {
      setStartingId(null);
    }
  };

  const filteredTests = tests.filter((t) => {
    if (filter === "all") return true;
    return t.category.toLowerCase().includes(filter.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppNav />
        <PageShell>
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading TOEFL test catalog...</p>
          </div>
        </PageShell>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />
      <PageShell>
        <div className="space-y-8 pb-16">
          {/* Catalog Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">ETS 2026 Examination Blueprint</span>
              <h1 className="text-2xl font-black text-foreground lg:text-3xl mt-1">Official Test Catalog</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Full-length adaptive mock exams and targeted skill section assessments.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: "All Tests" },
                { id: "mock", label: "Full Mocks" },
                { id: "reading", label: "Reading" },
                { id: "listening", label: "Listening" },
                { id: "writing", label: "Writing" },
                { id: "speaking", label: "Speaking" },
              ].map((f) => (
                <Button
                  key={f.id}
                  size="sm"
                  variant={filter === f.id ? "default" : "outline"}
                  onClick={() => setFilter(f.id)}
                  className="text-xs"
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Test Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((t) => {
              const isFullMock = t.category.toLowerCase().includes("mock");

              return (
                <article
                  key={t.id}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-card/50 p-6 shadow-md transition-all hover:border-primary/50 hover:shadow-lg space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                        {t.category}
                      </span>
                      <span className="rounded bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {t.difficulty}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-foreground leading-snug">{t.name}</h3>
                      {t.code ? (
                        <p className="text-[11px] font-mono text-muted-foreground mt-1">Code: {t.code}</p>
                      ) : null}
                    </div>

                    <div className="rounded-xl border border-border/80 bg-background/60 p-3.5 space-y-1.5 text-xs text-muted-foreground">
                      {isFullMock ? (
                        <>
                          <p className="flex items-center gap-2 text-foreground/90 font-medium">
                            <Clock className="size-3.5 text-primary" /> 90 Minutes Total Duration
                          </p>
                          <p className="text-[11px]">4 Sections (Reading → Listening → Writing → Speaking)</p>
                        </>
                      ) : (
                        <p className="flex items-center gap-2 text-foreground/90 font-medium">
                          <BookOpen className="size-3.5 text-primary" /> Single Skill Targeted Blueprint
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Button
                      size="sm"
                      className="w-full font-bold"
                      disabled={startingId === t.id}
                      onClick={() => handleStartTest(t.id)}
                    >
                      {startingId === t.id ? (
                        <>
                          <Loader2 className="size-3.5 mr-1.5 animate-spin" /> Preparing Exam...
                        </>
                      ) : (
                        <>
                          <Play className="size-3.5 mr-1.5 fill-current" /> Start Examination
                        </>
                      )}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </PageShell>
    </div>
  );
}
