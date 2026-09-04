import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Calendar,
  Briefcase,
  Puzzle,
  ClipboardList,
  PlaySquare,
  Mic,
  AudioLines,
  Check,
  X,
  FileText,
  BarChart2,
  Sparkles,
  Loader2,
  Play,
  LayoutGrid,
} from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { Button } from "@/components/ui/button";
import { getPublishedTests } from "@/lib/practice.functions";
import { startToeflAttempt } from "@/lib/tests/engine.functions";
import { toast } from "sonner";
import type { ToeflSectionType, ToeflExamMode } from "@/types/toefl";

export const Route = createFileRoute("/test/")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  head: () => ({
    meta: [
      { title: "TOEFL Practice & Mock Tests — TestGlider" },
      {
        name: "description",
        content:
          "Official TOEFL Full-Length Mock Exams and Single Section Mode practice with instant AI grading.",
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

const DEFAULT_MOON_VERSION_ID = "f2000000-0000-0000-0000-000000000000";

function TestCatalog() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<PublishedTestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState("mock-tests");

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

  const moonTest =
    tests.find(
      (t) =>
        t.name.toLowerCase().includes("moon") ||
        t.category.toLowerCase().includes("mock") ||
        t.sections.length >= 4,
    ) || tests[0];

  const moonVersionId = moonTest?.testVersionId || DEFAULT_MOON_VERSION_ID;

  const readingTest =
    tests.find(
      (t) =>
        t.category.toLowerCase() === "reading" ||
        t.sections.some((s) => s.sectionType === "reading"),
    ) || moonTest;

  const listeningTest =
    tests.find(
      (t) =>
        t.category.toLowerCase() === "listening" ||
        t.sections.some((s) => s.sectionType === "listening"),
    ) || moonTest;

  const writingTest =
    tests.find(
      (t) =>
        t.category.toLowerCase() === "writing" ||
        t.sections.some((s) => s.sectionType === "writing"),
    ) || moonTest;

  const speakingTest =
    tests.find(
      (t) =>
        t.category.toLowerCase() === "speaking" ||
        t.sections.some((s) => s.sectionType === "speaking"),
    ) || moonTest;

  const handleStartTest = async (
    testVersionId: string,
    examMode: ToeflExamMode = "full",
    sectionTypeFilter?: ToeflSectionType,
  ) => {
    const targetVersionId = testVersionId || moonVersionId;

    try {
      const buttonKey = `${targetVersionId}-${examMode}-${sectionTypeFilter || "all"}`;
      setStartingId(buttonKey);

      const res = await startToeflAttempt({
        data: {
          testVersionId: targetVersionId,
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
      setShowModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900">
        <AppNav />
        <div className="flex min-h-[70vh] flex-col items-center justify-center select-none">
          <div className="relative size-16">
            <div className="size-16 rounded-full border-4 border-slate-200" />
            <div className="absolute top-0 left-0 size-16 rounded-full border-4 border-transparent border-t-[#204482] animate-spin" />
          </div>
          <p className="mt-6 text-xl font-light tracking-wide text-slate-700">
            please wait while we load your exam
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <AppNav />

      {/* TestGlider 7-Category Tab Navigation */}
      <div className="border-b border-slate-200 bg-white shadow-xs select-none">
        <div className="mx-auto flex max-w-6xl items-center justify-start gap-8 px-6 py-3 overflow-x-auto no-scrollbar">
          {[
            { id: "study-center", label: "Study Center", icon: Calendar, to: "/dashboard" },
            { id: "mock-tests", label: "Mock Tests", icon: Briefcase, to: "/test" },
            { id: "practice-questions", label: "Practice Questions", icon: Puzzle, to: "/practice" },
            { id: "test-records", label: "Test Records", icon: ClipboardList, to: "/history" },
            { id: "lessons", label: "Lessons", icon: PlaySquare, to: "/lessons" },
            { id: "shadowing", label: "Shadowing", icon: Mic, to: "/shadowing" },
            { id: "dictation", label: "Dictation", icon: AudioLines, to: "/dictation" },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeNavTab;
            return (
              <Link
                key={tab.id}
                to={tab.to}
                onClick={() => setActiveNavTab(tab.id)}
                className={`flex flex-col items-center gap-1.5 transition-all text-xs font-semibold py-1 px-3 ${
                  isActive
                    ? "text-[#1d4ed8]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <div
                  className={`flex size-11 items-center justify-center rounded-2xl transition-all ${
                    isActive
                      ? "bg-[#eaf1fb] text-[#1d4ed8] shadow-xs"
                      : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="size-5" />
                </div>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-10">
        {/* Section 1: TestGlider vs. Actual Score */}
        <section className="space-y-4">
          <h2 className="text-xl font-black tracking-tight text-slate-900">
            TestGlider vs. Actual Score
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Chart 1: TG 4 Scorers */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800">
                Real Scores for TG 4 Scorers
              </h3>
              <div className="relative h-44 w-full flex items-end justify-between px-2 pt-8 pb-4 border-b border-slate-200">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-6 rounded-t-sm bg-transparent h-0" />
                </div>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-6 rounded-t-sm bg-transparent h-0" />
                </div>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-6 rounded-t-sm bg-blue-500 h-[8%]" />
                </div>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-6 rounded-t-sm bg-blue-500 h-[20%]" />
                </div>
                <div className="flex flex-col items-center gap-1 flex-1 relative">
                  <span className="absolute -top-6 text-[11px] font-extrabold text-blue-600">
                    66.7%
                  </span>
                  <div className="w-7 rounded-t-sm bg-blue-600 h-[80%]" />
                </div>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-6 rounded-t-sm bg-blue-500 h-[26%]" />
                </div>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-6 rounded-t-sm bg-transparent h-0" />
                </div>
              </div>
              <div className="flex justify-between px-2 text-[11px] font-semibold text-slate-400">
                <span className="flex-1 text-center">3</span>
                <span className="flex-1 text-center">3.5</span>
                <span className="flex-1 text-center">4</span>
                <span className="flex-1 text-center">4.5</span>
                <span className="flex-1 text-center font-bold text-slate-700">5</span>
                <span className="flex-1 text-center">5.5</span>
                <span className="flex-1 text-center">6</span>
              </div>
            </div>

            {/* Chart 2: TG 4.5 Scorers */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800">
                Real Scores for TG 4.5 Scorers
              </h3>
              <div className="relative h-44 w-full flex items-end justify-between px-2 pt-8 pb-4 border-b border-slate-200">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-6 rounded-t-sm bg-transparent h-0" />
                </div>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-6 rounded-t-sm bg-transparent h-0" />
                </div>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-6 rounded-t-sm bg-transparent h-0" />
                </div>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-6 rounded-t-sm bg-blue-500 h-[22%]" />
                </div>
                <div className="flex flex-col items-center gap-1 flex-1 relative">
                  <span className="absolute -top-6 text-[11px] font-extrabold text-blue-600">
                    47.6%
                  </span>
                  <div className="w-7 rounded-t-sm bg-blue-600 h-[60%]" />
                </div>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-6 rounded-t-sm bg-blue-500 h-[36%]" />
                </div>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-6 rounded-t-sm bg-blue-500 h-[10%]" />
                </div>
              </div>
              <div className="flex justify-between px-2 text-[11px] font-semibold text-slate-400">
                <span className="flex-1 text-center">3</span>
                <span className="flex-1 text-center">3.5</span>
                <span className="flex-1 text-center">4</span>
                <span className="flex-1 text-center">4.5</span>
                <span className="flex-1 text-center font-bold text-slate-700">5</span>
                <span className="flex-1 text-center">5.5</span>
                <span className="flex-1 text-center">6</span>
              </div>
            </div>

            {/* Chart 3: TG 5 Scorers */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800">
                Real Scores for TG 5 Scorers
              </h3>
              <div className="relative h-44 w-full flex items-end justify-between px-2 pt-8 pb-4 border-b border-slate-200">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-6 rounded-t-sm bg-transparent h-0" />
                </div>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-6 rounded-t-sm bg-transparent h-0" />
                </div>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-6 rounded-t-sm bg-transparent h-0" />
                </div>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-6 rounded-t-sm bg-blue-500 h-[8%]" />
                </div>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-6 rounded-t-sm bg-blue-500 h-[40%]" />
                </div>
                <div className="flex flex-col items-center gap-1 flex-1 relative">
                  <span className="absolute -top-6 text-[11px] font-extrabold text-blue-600">
                    56%
                  </span>
                  <div className="w-7 rounded-t-sm bg-blue-600 h-[70%]" />
                </div>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-6 rounded-t-sm bg-blue-500 h-[12%]" />
                </div>
              </div>
              <div className="flex justify-between px-2 text-[11px] font-semibold text-slate-400">
                <span className="flex-1 text-center">3</span>
                <span className="flex-1 text-center">3.5</span>
                <span className="flex-1 text-center">4</span>
                <span className="flex-1 text-center">4.5</span>
                <span className="flex-1 text-center">5</span>
                <span className="flex-1 text-center font-bold text-slate-700">5.5</span>
                <span className="flex-1 text-center">6</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Tests in Progress */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-700">
              In Progress
            </span>
            <h2 className="text-xl font-black text-slate-900">Tests in progress</h2>
          </div>

          {/* Moon Full Test Card */}
          <div
            onClick={() => setShowModal(true)}
            className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xs transition-all hover:border-blue-400 hover:shadow-md cursor-pointer"
          >
            <div className="space-y-3 max-w-md">
              <span className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                Moon
              </span>
              <p className="text-sm font-semibold text-slate-500">Full test</p>
              <div className="pt-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(true);
                  }}
                  className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-2.5 text-xs shadow-xs"
                >
                  <Play className="size-3 mr-1.5 fill-current" /> Start Full Test
                </Button>
              </div>
            </div>

            <div className="pr-4 shrink-0">
              <img
                src="/images/testglider-moon.png"
                alt="Moon Full Test"
                className="size-28 object-contain transition-transform group-hover:scale-105"
              />
            </div>
          </div>
        </section>

        {/* Center Pill: Scores in under 1 min */}
        <div className="flex justify-center pt-2">
          <div className="rounded-full border border-slate-200/80 bg-slate-100/90 px-6 py-2 text-xs font-semibold text-slate-600 shadow-xs">
            Scores in under 1 min. Fully automated AI grading
          </div>
        </div>

        {/* Section 3: Single Section Mode */}
        <section className="space-y-4 pt-2">
          <div>
            <h2 className="text-xl font-black text-slate-900">Single Section Mode</h2>
            <p className="text-xs font-medium text-slate-500">
              Take only the section you want to focus on.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Reading Section Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Reading</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Take only the Reading section of the Moon Mock
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-xl border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100 font-bold text-xs"
                disabled={startingId === `${readingTest?.testVersionId}-section-reading`}
                onClick={() =>
                  handleStartTest(
                    readingTest?.testVersionId || moonVersionId,
                    "section",
                    "reading",
                  )
                }
              >
                {startingId === `${readingTest?.testVersionId}-section-reading` ? (
                  <>
                    <Loader2 className="size-3 mr-1 animate-spin" /> Starting...
                  </>
                ) : (
                  "Practice Reading"
                )}
              </Button>
            </div>

            {/* Listening Section Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Listening</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Take only the Listening section of the Moon Mock
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-xl border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100 font-bold text-xs"
                disabled={startingId === `${listeningTest?.testVersionId}-section-listening`}
                onClick={() =>
                  handleStartTest(
                    listeningTest?.testVersionId || moonVersionId,
                    "section",
                    "listening",
                  )
                }
              >
                {startingId === `${listeningTest?.testVersionId}-section-listening` ? (
                  <>
                    <Loader2 className="size-3 mr-1 animate-spin" /> Starting...
                  </>
                ) : (
                  "Practice Listening"
                )}
              </Button>
            </div>

            {/* Writing Section Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Writing</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Take only the Writing section of the Moon Mock
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-xl border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100 font-bold text-xs"
                disabled={startingId === `${writingTest?.testVersionId}-section-writing`}
                onClick={() =>
                  handleStartTest(
                    writingTest?.testVersionId || moonVersionId,
                    "section",
                    "writing",
                  )
                }
              >
                {startingId === `${writingTest?.testVersionId}-section-writing` ? (
                  <>
                    <Loader2 className="size-3 mr-1 animate-spin" /> Starting...
                  </>
                ) : (
                  "Practice Writing"
                )}
              </Button>
            </div>

            {/* Speaking Section Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Speaking</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Take only the Speaking section of the Moon Mock
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-xl border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100 font-bold text-xs"
                disabled={startingId === `${speakingTest?.testVersionId}-section-speaking`}
                onClick={() =>
                  handleStartTest(
                    speakingTest?.testVersionId || moonVersionId,
                    "section",
                    "speaking",
                  )
                }
              >
                {startingId === `${speakingTest?.testVersionId}-section-speaking` ? (
                  <>
                    <Loader2 className="size-3 mr-1 animate-spin" /> Starting...
                  </>
                ) : (
                  "Practice Speaking"
                )}
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* 'What is included?' Modal — 100% Free Forever */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl space-y-6">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center justify-between pr-8">
              <h3 className="text-lg font-bold text-slate-900">What is included?</h3>
            </div>

            {/* Features Table */}
            <div className="space-y-3 text-xs font-semibold">
              <div className="grid grid-cols-[1fr_130px] items-center pb-2 border-b border-slate-100 text-slate-500">
                <span>Features</span>
                <span className="text-center font-bold text-blue-600">Included</span>
              </div>

              {/* Row 1: Test Attempts */}
              <div className="grid grid-cols-[1fr_130px] items-center py-2 border-b border-slate-50">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <FileText className="size-4 text-slate-500" />
                  <span>Test Attempts</span>
                </div>
                <span className="text-center font-bold text-blue-600">Unlimited</span>
              </div>

              {/* Row 2: View Total Score */}
              <div className="grid grid-cols-[1fr_130px] items-center py-2 border-b border-slate-50">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <BarChart2 className="size-4 text-slate-500" />
                  <span>View Total Score</span>
                </div>
                <div className="flex justify-center items-center gap-1 text-blue-600 font-bold">
                  <Check className="size-4 stroke-[2.5]" /> Included
                </div>
              </div>

              {/* Row 3: View Section Scores */}
              <div className="grid grid-cols-[1fr_130px] items-center py-2 border-b border-slate-50">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <LayoutGrid className="size-4 text-slate-500" />
                  <span>View Section Scores</span>
                </div>
                <div className="flex justify-center items-center gap-1 text-blue-600 font-bold">
                  <Check className="size-4 stroke-[2.5]" /> Included
                </div>
              </div>

              {/* Row 4: View Explanations */}
              <div className="grid grid-cols-[1fr_130px] items-center py-2 border-b border-slate-50">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Sparkles className="size-4 text-slate-500" />
                  <span>View Explanations</span>
                </div>
                <div className="flex justify-center items-center gap-1 text-blue-600 font-bold">
                  <Check className="size-4 stroke-[2.5]" /> Included
                </div>
              </div>

              {/* Row 5: AI Evaluation */}
              <div className="grid grid-cols-[1fr_130px] items-center py-2">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Check className="size-4 text-slate-500" />
                  <span>AI Rubric Scoring</span>
                </div>
                <div className="flex justify-center items-center gap-1 text-blue-600 font-bold">
                  <Check className="size-4 stroke-[2.5]" /> Included
                </div>
              </div>
            </div>

            {/* Bottom Actions: Launch Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={Boolean(startingId)}
                onClick={() => handleStartTest(moonVersionId, "full")}
                className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {startingId ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-1" /> Launching Exam...
                  </>
                ) : (
                  <>
                    <Play className="size-3.5 fill-current text-white" /> Start Test
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
