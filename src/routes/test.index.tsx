import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
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
  AlertCircle,
} from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { PageShell } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { getPublishedTests } from "@/lib/practice.functions";
import { startToeflAttempt } from "@/lib/tests/engine.functions";
import { toast } from "sonner";
import type { ToeflSectionType, ToeflExamMode } from "@/types/toefl";

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

export interface PublishedTestItem {
  id: string;
  testVersionId: string;
  name: string;
  category: string;
  difficulty: string;
  code: string | null;
  questionCount: number;
  sections: Array<{
    id: string;
    sectionType: ToeflSectionType;
    sectionOrder: number;
    timingSeconds: number;
  }>;
}

function TestCatalog() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<PublishedTestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "full" | "reading" | "listening" | "writing" | "speaking">("all");

  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await getPublishedTests();
        setTests((res as PublishedTestItem[]) || []);
      } catch (err) {
        console.error("Failed to load catalog:", err);
        toast.error("Could not load test catalog. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const handleStartTest = async (
    testVersionId: string,
    examMode: ToeflExamMode = "full",
    sectionTypeFilter?: ToeflSectionType
  ) => {
    if (!testVersionId) {
      toast.error("Selected test blueprint is not available.");
      return;
    }

    try {
      const buttonKey = `${testVersionId}-${examMode}-${sectionTypeFilter || "all"}`;
      setStartingId(buttonKey);

      const res = await startToeflAttempt({
        data: {
          testVersionId,
          examMode,
          sectionTypeFilter,
          allowRetake: true,
        },
      });

      const attemptId = (res as any)?.snapshot?.attemptId || (res as any)?.attemptId;

      if (attemptId) {
        navigate({ to: "/test/run", search: { attemptId } });
      } else {
        toast.error("Failed to initialize test session. Please try again.");
      }
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || "Failed to start assessment";
      console.error("Test start failure:", err);
      toast.error(`Start Error: ${errorMsg}`);
    } finally {
      setStartingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppNav />
        <PageShell>
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading published standardized mock tests...</p>
          </div>
        </PageShell>
      </div>
    );
  }

  // Filter tests based on active tab
  const filteredTests = tests.filter((t) => {
    if (activeTab === "all") return true;
    if (activeTab === "full") return t.sections.length >= 4 || t.category.toLowerCase().includes("mock");
    return t.sections.some((s) => s.sectionType === activeTab);
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />
      <PageShell>
        <div className="space-y-10 pb-16">
          {/* Header Banner */}
          <div className="rounded-3xl border border-border bg-card/60 p-8 shadow-sm lg:p-10 flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary uppercase">
                <Sparkles className="size-3.5" /> Published Standardized Tests
              </div>
              <h1 className="text-3xl font-black tracking-tight text-foreground lg:text-4xl">
                Mock Tests & Section Practice
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Take complete full-length multistage adaptive mock exams or practice individual sections with instant AI rubric evaluation and precision band predictions.
              </p>
            </div>

            {/* Stats Counter */}
            <div className="flex items-center gap-4">
              <div className="rounded-2xl border border-border bg-background/80 px-5 py-3.5 text-center min-w-[120px]">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Published Tests</p>
                <p className="text-xl font-black text-foreground">{tests.length}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/80 px-5 py-3.5 text-center min-w-[120px]">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">AI Evaluation</p>
                <p className="text-xl font-black text-primary">Instant</p>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
            {[
              { id: "all", label: "All Tests", icon: Layers },
              { id: "full", label: "Full Mocks (4 Sections)", icon: Zap },
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

          {/* Empty State if No Tests in DB */}
          {tests.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card/40 p-12 text-center space-y-4">
              <AlertCircle className="mx-auto size-12 text-muted-foreground/60" />
              <h3 className="text-lg font-bold text-foreground">No Published Tests Available Yet</h3>
              <p className="mx-auto max-w-md text-xs text-muted-foreground leading-relaxed">
                New standardized blueprints are currently being drafted and calibrated by instructors. Please check back shortly or explore practice drills.
              </p>
              <Button asChild variant="outline">
                <Link to="/practice">Explore Practice Queue</Link>
              </Button>
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card/40 p-10 text-center space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">
                No tests match the selected filter ({activeTab}).
              </p>
              <Button size="sm" variant="ghost" onClick={() => setActiveTab("all")}>
                Reset Filter
              </Button>
            </div>
          ) : (
            /* Data-Driven Test Cards */
            <div className="space-y-6">
              {filteredTests.map((test, tIdx) => {
                const hasReading = test.sections.some((s) => s.sectionType === "reading");
                const hasListening = test.sections.some((s) => s.sectionType === "listening");
                const hasWriting = test.sections.some((s) => s.sectionType === "writing");
                const hasSpeaking = test.sections.some((s) => s.sectionType === "speaking");
                const isFullMock = test.sections.length >= 4 || test.category.toLowerCase().includes("mock");

                const fullButtonKey = `${test.testVersionId}-full-all`;

                return (
                  <div
                    key={test.testVersionId}
                    className="rounded-3xl border border-border bg-card/40 p-6 lg:p-8 shadow-sm space-y-6 transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    {/* Top Info Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-2xl bg-gradient-to-tr from-primary/20 via-accent/20 to-primary/10 flex items-center justify-center font-black text-primary text-lg">
                          0{tIdx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black text-foreground">{test.name}</h3>
                            <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                              {test.difficulty}
                            </span>
                            {test.code && (
                              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                                {test.code}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {isFullMock ? "Complete 4-Section Standardized Adaptive Mock Exam" : `${test.category} Practice Assessment`}
                          </p>
                        </div>
                      </div>

                      {/* Primary Action Button */}
                      {(activeTab === "all" || activeTab === "full") && (
                        <Button
                          size="sm"
                          className="font-bold px-6 shadow-md shadow-primary/20"
                          disabled={startingId === fullButtonKey}
                          onClick={() => handleStartTest(test.testVersionId, isFullMock ? "full" : "section")}
                        >
                          {startingId === fullButtonKey ? (
                            <>
                              <Loader2 className="size-3.5 mr-1.5 animate-spin" /> Preparing Exam...
                            </>
                          ) : (
                            <>
                              <Play className="size-3.5 mr-1.5 fill-current" />
                              {isFullMock ? "Start Full Mock (90m)" : "Start Assessment"}
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Section Breakdown Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                      {/* Reading Section Card */}
                      <div
                        className={`rounded-2xl border border-white/5 bg-surface-2/60 p-4 space-y-3 transition-all hover:border-blue-500/30 hover:bg-surface-2 ${
                          !hasReading ? "opacity-30" : activeTab !== "all" && activeTab !== "reading" ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                            <span className="size-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                              <BookOpen className="size-3.5 text-blue-400" />
                            </span>
                            Reading
                          </div>
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            {test.sections.find((s) => s.sectionType === "reading")
                              ? `${Math.round((test.sections.find((s) => s.sectionType === "reading")!.timingSeconds || 1500) / 60)} Mins`
                              : "N/A"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Cloze passages & academic texts</p>
                        <Button
                          size="xs"
                          variant="outline"
                          className="w-full text-xs font-bold border-blue-500/30 text-blue-400 bg-blue-500/5 hover:bg-blue-500/15 hover:border-blue-400"
                          disabled={!hasReading || startingId === `${test.testVersionId}-section-reading`}
                          onClick={() => handleStartTest(test.testVersionId, "section", "reading")}
                        >
                          {startingId === `${test.testVersionId}-section-reading` ? (
                            <>
                              <Loader2 className="size-3 mr-1 animate-spin" /> Launching...
                            </>
                          ) : (
                            "Practice Reading"
                          )}
                        </Button>
                      </div>

                      {/* Listening Section Card */}
                      <div
                        className={`rounded-2xl border border-white/5 bg-surface-2/60 p-4 space-y-3 transition-all hover:border-emerald-500/30 hover:bg-surface-2 ${
                          !hasListening ? "opacity-30" : activeTab !== "all" && activeTab !== "listening" ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                            <span className="size-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                              <Headphones className="size-3.5 text-emerald-400" />
                            </span>
                            Listening
                          </div>
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            {test.sections.find((s) => s.sectionType === "listening")
                              ? `${Math.round((test.sections.find((s) => s.sectionType === "listening")!.timingSeconds || 1200) / 60)} Mins`
                              : "N/A"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Conversations & academic talks</p>
                        <Button
                          size="xs"
                          variant="outline"
                          className="w-full text-xs font-bold border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/15 hover:border-emerald-400"
                          disabled={!hasListening || startingId === `${test.testVersionId}-section-listening`}
                          onClick={() => handleStartTest(test.testVersionId, "section", "listening")}
                        >
                          {startingId === `${test.testVersionId}-section-listening` ? (
                            <>
                              <Loader2 className="size-3 mr-1 animate-spin" /> Launching...
                            </>
                          ) : (
                            "Practice Listening"
                          )}
                        </Button>
                      </div>

                      {/* Writing Section Card */}
                      <div
                        className={`rounded-2xl border border-white/5 bg-surface-2/60 p-4 space-y-3 transition-all hover:border-purple-500/30 hover:bg-surface-2 ${
                          !hasWriting ? "opacity-30" : activeTab !== "all" && activeTab !== "writing" ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                            <span className="size-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                              <PenTool className="size-3.5 text-purple-400" />
                            </span>
                            Writing
                          </div>
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            {test.sections.find((s) => s.sectionType === "writing")
                              ? `${Math.round((test.sections.find((s) => s.sectionType === "writing")!.timingSeconds || 1500) / 60)} Mins`
                              : "N/A"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Email & academic discussion</p>
                        <Button
                          size="xs"
                          variant="outline"
                          className="w-full text-xs font-bold border-purple-500/30 text-purple-400 bg-purple-500/5 hover:bg-purple-500/15 hover:border-purple-400"
                          disabled={!hasWriting || startingId === `${test.testVersionId}-section-writing`}
                          onClick={() => handleStartTest(test.testVersionId, "section", "writing")}
                        >
                          {startingId === `${test.testVersionId}-section-writing` ? (
                            <>
                              <Loader2 className="size-3 mr-1 animate-spin" /> Launching...
                            </>
                          ) : (
                            "Practice Writing"
                          )}
                        </Button>
                      </div>

                      {/* Speaking Section Card */}
                      <div
                        className={`rounded-2xl border border-white/5 bg-surface-2/60 p-4 space-y-3 transition-all hover:border-amber-500/30 hover:bg-surface-2 ${
                          !hasSpeaking ? "opacity-30" : activeTab !== "all" && activeTab !== "speaking" ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                            <span className="size-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                              <Mic className="size-3.5 text-amber-400" />
                            </span>
                            Speaking
                          </div>
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            {test.sections.find((s) => s.sectionType === "speaking")
                              ? `${Math.round((test.sections.find((s) => s.sectionType === "speaking")!.timingSeconds || 480) / 60)} Mins`
                              : "N/A"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Repetition & interview speech</p>
                        <Button
                          size="xs"
                          variant="outline"
                          className="w-full text-xs font-bold border-amber-500/30 text-amber-400 bg-amber-500/5 hover:bg-amber-500/15 hover:border-amber-400"
                          disabled={!hasSpeaking || startingId === `${test.testVersionId}-section-speaking`}
                          onClick={() => handleStartTest(test.testVersionId, "section", "speaking")}
                        >
                          {startingId === `${test.testVersionId}-section-speaking` ? (
                            <>
                              <Loader2 className="size-3 mr-1 animate-spin" /> Launching...
                            </>
                          ) : (
                            "Practice Speaking"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PageShell>
    </div>
  );
}
