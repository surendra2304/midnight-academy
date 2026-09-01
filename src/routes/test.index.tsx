import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  Headphones,
  Layers,
  Loader2,
  Mic,
  PenTool,
  Play,
  Sparkles,
  Zap,
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
      { title: "Standardized English Mock Tests — Midnight Academy" },
      {
        name: "description",
        content:
          "Take full-length standardized adaptive mock exams and section practice tests with instant AI scoring.",
      },
    ],
  }),
  component: TestCatalog,
});

interface MockSeries {
  id: string;
  name: string;
  theme: string;
  badgeColor: string;
  isFree: boolean;
  fullMockTestId?: string;
  sectionTests: {
    readingId?: string;
    listeningId?: string;
    writingId?: string;
    speakingId?: string;
  };
}

function TestCatalog() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<
    Array<{
      id: string;
      testVersionId: string;
      name: string;
      category: string;
      difficulty: string;
      code: string | null;
      questionCount: number;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "full" | "reading" | "listening" | "writing" | "speaking">("all");

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

  const handleStartTest = async (testVersionId?: string) => {
    const targetVersionId = testVersionId || tests[0]?.testVersionId;
    if (!targetVersionId) {
      toast.error("Test blueprint is being prepared. Please try again in a moment.");
      return;
    }

    try {
      setStartingId(targetVersionId);
      const res = await startToeflAttempt({
        data: {
          testVersionId: targetVersionId,
          examMode: "full",
          allowRetake: true,
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

  const readingTest = tests.find((t) => t.category?.toLowerCase() === "reading")?.testVersionId || tests[0]?.testVersionId;
  const listeningTest = tests.find((t) => t.category?.toLowerCase() === "listening")?.testVersionId || tests[0]?.testVersionId;
  const writingTest = tests.find((t) => t.category?.toLowerCase() === "writing")?.testVersionId || tests[0]?.testVersionId;
  const speakingTest = tests.find((t) => t.category?.toLowerCase() === "speaking")?.testVersionId || tests[0]?.testVersionId;
  const fullMockTest = tests.find((t) => t.category?.toLowerCase().includes("mock") || t.name?.includes("Full"))?.testVersionId || tests[0]?.testVersionId;

  // Group tests by Series (Mock Packs)
  const seriesList: MockSeries[] = [
    {
      id: "series-alpha",
      name: "Lunar Series 01",
      theme: "Standard Academic Benchmark",
      badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      isFree: true,
      fullMockTestId: fullMockTest,
      sectionTests: {
        readingId: readingTest,
        listeningId: listeningTest,
        writingId: writingTest,
        speakingId: speakingTest,
      },
    },
    {
      id: "series-beta",
      name: "Solar Series 02",
      theme: "Upper Difficulty Multistage",
      badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      isFree: false,
      fullMockTestId: tests.filter((t) => t.category?.toLowerCase().includes("mock"))[1]?.testVersionId || fullMockTest,
      sectionTests: {
        readingId: readingTest,
        listeningId: listeningTest,
        writingId: writingTest,
        speakingId: speakingTest,
      },
    },
    {
      id: "series-gamma",
      name: "Nebula Series 03",
      theme: "Intensive Diagnostic Calibration",
      badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      isFree: false,
      fullMockTestId: fullMockTest,
      sectionTests: {
        readingId: readingTest,
        listeningId: listeningTest,
        writingId: writingTest,
        speakingId: speakingTest,
      },
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppNav />
        <PageShell>
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading standardized mock test series...</p>
          </div>
        </PageShell>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />
      <PageShell>
        <div className="space-y-10 pb-16">
          {/* Header Banner */}
          <div className="rounded-3xl border border-border bg-card/60 p-8 shadow-sm lg:p-10 flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary uppercase">
                <Sparkles className="size-3.5" /> Complete Standardized Mock Tests
              </div>
              <h1 className="text-3xl font-black tracking-tight text-foreground lg:text-4xl">
                Mock Tests & Section Practice
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Take complete full-length multistage adaptive mock exams or practice individual sections with instant AI rubric evaluation and precision band predictions.
              </p>
            </div>

            {/* Quick Stats Summary */}
            <div className="flex items-center gap-4">
              <div className="rounded-2xl border border-border bg-background/80 px-5 py-3.5 text-center">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Available Mocks</p>
                <p className="text-xl font-black text-foreground">{tests.length || 6}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/80 px-5 py-3.5 text-center">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">AI Evaluation</p>
                <p className="text-xl font-black text-primary">Instant</p>
              </div>
            </div>
          </div>

          {/* Section Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
            {[
              { id: "all", label: "All Mock Series", icon: Layers },
              { id: "full", label: "Full Tests (4 Sections)", icon: Zap },
              { id: "reading", label: "Reading Section", icon: BookOpen },
              { id: "listening", label: "Listening Section", icon: Headphones },
              { id: "writing", label: "Writing Section", icon: PenTool },
              { id: "speaking", label: "Speaking Section", icon: Mic },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "border border-border bg-card/40 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Series & Test Pack Cards */}
          <div className="space-y-6">
            {seriesList.map((series, sIdx) => {
              return (
                <div
                  key={series.id}
                  className="rounded-3xl border border-border bg-card/40 p-6 lg:p-8 shadow-sm space-y-6 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  {/* Series Top Info */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-2xl bg-gradient-to-tr from-primary/20 via-accent/20 to-primary/10 flex items-center justify-center font-black text-primary text-lg">
                        0{sIdx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-foreground">{series.name}</h3>
                          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${series.badgeColor}`}>
                            {series.isFree ? "Free Practice" : "Standard"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{series.theme}</p>
                      </div>
                    </div>

                    {/* Primary Full Mock Action */}
                    {series.fullMockTestId && (activeTab === "all" || activeTab === "full") && (
                      <Button
                        size="sm"
                        className="font-bold px-6 shadow-md shadow-primary/20"
                        disabled={startingId === series.fullMockTestId}
                        onClick={() => handleStartTest(series.fullMockTestId!)}
                      >
                        {startingId === series.fullMockTestId ? (
                          <>
                            <Loader2 className="size-3.5 mr-1.5 animate-spin" /> Preparing Exam...
                          </>
                        ) : (
                          <>
                            <Play className="size-3.5 mr-1.5 fill-current" /> Start Full Mock (90m)
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Section Test Breakdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                    {/* Reading */}
                    <div
                      className={`rounded-2xl border border-border/80 bg-background/60 p-4 space-y-3 ${
                        activeTab !== "all" && activeTab !== "reading" ? "opacity-40" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                          <BookOpen className="size-4 text-blue-500" /> Reading
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold">25 Mins</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">Cloze passage & academic comprehension</p>
                      <Button
                        size="xs"
                        variant="secondary"
                        className="w-full text-xs font-bold"
                        disabled={!series.sectionTests.readingId || startingId === series.sectionTests.readingId}
                        onClick={() => series.sectionTests.readingId && handleStartTest(series.sectionTests.readingId)}
                      >
                        Practice Reading
                      </Button>
                    </div>

                    {/* Listening */}
                    <div
                      className={`rounded-2xl border border-border/80 bg-background/60 p-4 space-y-3 ${
                        activeTab !== "all" && activeTab !== "listening" ? "opacity-40" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                          <Headphones className="size-4 text-emerald-500" /> Listening
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold">20 Mins</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">Conversations, talks & announcements</p>
                      <Button
                        size="xs"
                        variant="secondary"
                        className="w-full text-xs font-bold"
                        disabled={!series.sectionTests.listeningId || startingId === series.sectionTests.listeningId}
                        onClick={() => series.sectionTests.listeningId && handleStartTest(series.sectionTests.listeningId)}
                      >
                        Practice Listening
                      </Button>
                    </div>

                    {/* Writing */}
                    <div
                      className={`rounded-2xl border border-border/80 bg-background/60 p-4 space-y-3 ${
                        activeTab !== "all" && activeTab !== "writing" ? "opacity-40" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                          <PenTool className="size-4 text-purple-500" /> Writing
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold">25 Mins</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">Sentence syntax, email & discussion</p>
                      <Button
                        size="xs"
                        variant="secondary"
                        className="w-full text-xs font-bold"
                        disabled={!series.sectionTests.writingId || startingId === series.sectionTests.writingId}
                        onClick={() => series.sectionTests.writingId && handleStartTest(series.sectionTests.writingId)}
                      >
                        Practice Writing
                      </Button>
                    </div>

                    {/* Speaking */}
                    <div
                      className={`rounded-2xl border border-border/80 bg-background/60 p-4 space-y-3 ${
                        activeTab !== "all" && activeTab !== "speaking" ? "opacity-40" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                          <Mic className="size-4 text-rose-500" /> Speaking
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold">15 Mins</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">Repetition fluency & spoken interview</p>
                      <Button
                        size="xs"
                        variant="secondary"
                        className="w-full text-xs font-bold"
                        disabled={!series.sectionTests.speakingId || startingId === series.sectionTests.speakingId}
                        onClick={() => series.sectionTests.speakingId && handleStartTest(series.sectionTests.speakingId)}
                      >
                        Practice Speaking
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PageShell>
    </div>
  );
}
