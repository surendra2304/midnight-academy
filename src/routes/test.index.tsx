import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Clock3,
  FileText,
  Headphones,
  Loader2,
  Mic,
  PenTool,
  Play,
  Search,
  Target,
} from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { TestGliderSubNav } from "@/components/TestGliderSubNav";
import { Button } from "@/components/ui/button";
import {
  getMyToeflAttemptActivity,
  getPublishedTests,
  type PublishedTestItem,
  type ToeflAttemptActivity,
} from "@/lib/practice.functions";
import { startToeflAttempt } from "@/lib/tests/engine.functions";
import { toast } from "sonner";
import type { ToeflExamMode, ToeflSectionType } from "@/types/toefl";

export const Route = createFileRoute("/test/")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  head: () => ({
    meta: [
      { title: "TOEFL Mock Tests | Midnight Academy" },
      {
        name: "description",
        content:
          "Take TOEFL-style practice tests, focus on one section, and review saved score reports and feedback.",
      },
    ],
  }),
  component: TestCatalog,
});

const PLANET_ORDER = ["moon", "mars", "venus", "jupiter", "saturn", "mercury", "neptune", "uranus"];
const SECTION_CHOICES = [
  { type: "reading", label: "Reading", Icon: BookOpen },
  { type: "listening", label: "Listening", Icon: Headphones },
  { type: "writing", label: "Writing", Icon: PenTool },
  { type: "speaking", label: "Speaking", Icon: Mic },
] as const;
const PLANET_GRADIENTS: Record<string, string> = {
  moon: "from-slate-200 via-slate-400 to-slate-600",
  mars: "from-orange-300 via-red-500 to-rose-800",
  venus: "from-amber-200 via-yellow-500 to-amber-700",
  jupiter: "from-amber-300 via-orange-500 to-stone-700",
  saturn: "from-yellow-200 via-amber-400 to-yellow-700",
  mercury: "from-zinc-300 via-stone-500 to-neutral-800",
  neptune: "from-sky-300 via-blue-600 to-indigo-900",
  uranus: "from-cyan-200 via-teal-400 to-cyan-700",
};

function testLabel(name: string) {
  return name.split("|")[0]?.trim() || name;
}

function testOrder(name: string) {
  const lower = name.toLowerCase();
  const index = PLANET_ORDER.findIndex((planet) => lower.includes(planet));
  return index < 0 ? PLANET_ORDER.length : index;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Date unavailable";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(seconds: number) {
  if (!seconds) return "Time not set";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

function TestCatalog() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<PublishedTestItem[]>([]);
  const [activity, setActivity] = useState<ToeflAttemptActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [selectedSectionTestId, setSelectedSectionTestId] = useState("");
  const [selectedSection, setSelectedSection] = useState<ToeflSectionType>("reading");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const [catalogResult, activityResult] = await Promise.allSettled([
        getPublishedTests(),
        getMyToeflAttemptActivity(),
      ]);
      if (!active) return;

      if (catalogResult.status === "fulfilled") {
        const ordered = [...catalogResult.value].sort(
          (a, b) => testOrder(a.name) - testOrder(b.name) || a.name.localeCompare(b.name),
        );
        setTests(ordered);
        if (ordered[0]) setSelectedSectionTestId(ordered[0].testVersionId);
      } else {
        const message =
          catalogResult.reason instanceof Error
            ? catalogResult.reason.message
            : "Could not load the published practice catalog.";
        setCatalogError(message);
        toast.error("Could not load the mock tests. Please try again.");
      }

      if (activityResult.status === "fulfilled") {
        setActivity(activityResult.value);
      } else {
        setActivityError(
          activityResult.reason instanceof Error
            ? activityResult.reason.message
            : "Could not load your saved score history.",
        );
      }
      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const filteredTests = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return tests;
    return tests.filter((test) =>
      `${test.name} ${test.description ?? ""} ${test.category}`.toLowerCase().includes(query),
    );
  }, [tests, searchTerm]);

  const selectedSectionTest =
    tests.find((test) => test.testVersionId === selectedSectionTestId) ?? tests[0];
  const completedAttempts = activity.filter(
    (attempt) => attempt.status === "evaluated" && attempt.report !== null,
  );
  const fullTestAttempts = completedAttempts.filter(
    (attempt) =>
      attempt.examMode !== "section" &&
      !attempt.selectedSectionType &&
      typeof attempt.report?.comparableScore === "number",
  );
  const activeAttempts = activity.filter((attempt) => attempt.status === "in_progress");
  const scoringAttempts = activity.filter((attempt) => attempt.status === "evaluating");
  const bestScore = fullTestAttempts.reduce<number | null>((best, attempt) => {
    const score = attempt.report?.comparableScore;
    return typeof score === "number" && (best === null || score > best) ? score : best;
  }, null);
  const chartAttempts = [...fullTestAttempts].reverse().slice(-6);

  const startTest = async (
    testVersionId: string,
    examMode: ToeflExamMode = "full",
    sectionTypeFilter?: ToeflSectionType,
  ) => {
    if (!testVersionId || startingId) return;
    const key = `${testVersionId}-${examMode}-${sectionTypeFilter ?? "all"}`;
    setStartingId(key);
    try {
      const response = await startToeflAttempt({
        data: { testVersionId, examMode, sectionTypeFilter, allowRetake: true },
      });
      const result = response as { snapshot?: { attemptId?: string }; attemptId?: string };
      const attemptId = result.snapshot?.attemptId ?? result.attemptId;
      if (!attemptId)
        throw new Error("The test session could not be initialized. Please try again.");
      await navigate({ to: "/test/run", search: { attemptId } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start this test.");
    } finally {
      setStartingId(null);
    }
  };

  const resumeTest = (attemptId: string) => {
    void navigate({ to: "/test/run", search: { attemptId } });
  };

  const chooseSectionTest = (test: PublishedTestItem) => {
    setSelectedSectionTestId(test.testVersionId);
    document.getElementById("section-practice")?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <AppNav />
        <TestGliderSubNav />
        <main className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center gap-4 px-6">
          <Loader2 className="size-9 animate-spin text-blue-700" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-600">Loading your practice center…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <AppNav />
      <TestGliderSubNav />
      <main className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              Midnight Academy · TOEFL practice
            </p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Mock tests &amp; score insights
            </h1>
            <p className="text-sm leading-6 text-slate-600 sm:text-base">
              Choose a practice set or focus on one skill. Attempts save as you go, and completed
              reports stay tied to your account.
            </p>
          </div>
          <Link
            to="/history"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800 hover:text-blue-950"
          >
            View test records <ArrowRight className="size-4" />
          </Link>
        </header>

        {catalogError ? (
          <section
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900"
          >
            <p className="font-bold">The practice catalog could not be loaded.</p>
            <p className="mt-1 text-rose-800">{catalogError}</p>
          </section>
        ) : null}

        <section aria-label="Your TOEFL practice summary" className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Practice sets"
            value={String(tests.length)}
            detail="Published for your account"
            icon={<FileText className="size-5" />}
          />
          <SummaryCard
            label="Completed reports"
            value={String(completedAttempts.length)}
            detail="From your saved attempts"
            icon={<Activity className="size-5" />}
          />
          <SummaryCard
            label="Best full-test comparison"
            value={bestScore === null ? "—" : String(bestScore)}
            detail={
              bestScore === null
                ? "Complete a full test to see a comparison"
                : "Practice estimate · out of 120"
            }
            icon={<Target className="size-5" />}
          />
        </section>

        {activityError ? (
          <div
            role="status"
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          >
            Saved score history could not be loaded: {activityError}
          </div>
        ) : null}

        {activeAttempts.length > 0 ? (
          <section aria-labelledby="resume-heading" className="space-y-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Saved session
              </p>
              <h2 id="resume-heading" className="text-xl font-bold tracking-tight">
                Pick up where you left off
              </h2>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {activeAttempts.slice(0, 4).map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-bold">{attempt.testName}</p>
                    <p className="mt-1 text-xs capitalize text-slate-500">
                      Started {formatDate(attempt.startedAt)}
                      {attempt.selectedSectionType
                        ? ` · ${attempt.selectedSectionType} practice`
                        : " · Full test"}
                    </p>
                  </div>
                  <Button onClick={() => resumeTest(attempt.id)} className="shrink-0">
                    Continue test <ArrowRight className="ml-2 size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {scoringAttempts.length > 0 ? (
          <div
            role="status"
            className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950"
          >
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            <span>
              {scoringAttempts.length === 1
                ? "One submitted attempt is still being scored."
                : `${scoringAttempts.length} submitted attempts are still being scored.`}{" "}
              Your report will appear here when ready.
            </span>
          </div>
        ) : null}

        <section
          aria-labelledby="score-trend-heading"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Progress</p>
              <h2 id="score-trend-heading" className="text-xl font-bold tracking-tight">
                Your recent score trend
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Comparison scores are practice estimates, not official TOEFL scores.
            </p>
          </div>
          {chartAttempts.length > 0 ? (
            <div className="mt-6">
              <div className="flex h-44 items-end gap-3 border-b border-slate-200 px-2 pb-2">
                {chartAttempts.map((attempt) => {
                  const score = attempt.report?.comparableScore ?? 0;
                  const height = Math.max(2, Math.min(100, (score / 120) * 100));
                  return (
                    <div
                      key={attempt.id}
                      className="flex h-full min-w-0 flex-1 flex-col justify-end"
                    >
                      <span className="mb-1 text-center text-xs font-bold text-slate-700">
                        {score}
                      </span>
                      <div
                        className="mx-auto w-full max-w-12 rounded-t-lg bg-gradient-to-t from-blue-800 to-sky-500"
                        style={{ height: `${height}%` }}
                        title={`${attempt.testName}: ${score} out of 120`}
                        aria-label={`${attempt.testName}: ${score} out of 120`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 grid grid-cols-6 gap-3 px-2">
                {chartAttempts.map((attempt) => (
                  <Link
                    key={attempt.id}
                    to="/result/$attemptId"
                    params={{ attemptId: attempt.id }}
                    className="truncate text-center text-[11px] font-medium text-slate-500 hover:text-blue-800"
                    title={attempt.testName}
                  >
                    {testLabel(attempt.testName)}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
              <p className="text-sm font-semibold text-slate-700">
                Your score trend will show here.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Finish a practice test and its saved report will appear in this chart.
              </p>
            </div>
          )}
        </section>

        <section aria-labelledby="catalog-heading" className="space-y-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Practice library
              </p>
              <h2 id="catalog-heading" className="text-2xl font-black tracking-tight">
                Choose a mock test
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {tests.length} published {tests.length === 1 ? "set" : "sets"} · independent
                TOEFL-style practice content
              </p>
            </div>
            <label className="relative block w-full md:max-w-xs">
              <span className="sr-only">Search practice sets</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search tests or topics"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>

          {filteredTests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
              <p className="font-semibold text-slate-800">
                {tests.length
                  ? "No tests match that search."
                  : "No published practice tests are available yet."}
              </p>
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="mt-2 text-sm font-semibold text-blue-700 hover:underline"
                >
                  Clear search
                </button>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredTests.map((test, index) => {
                const planet =
                  PLANET_ORDER.find((name) => test.name.toLowerCase().includes(name)) ?? "moon";
                const testAttempts = activity.filter(
                  (attempt) => attempt.testVersionId === test.testVersionId,
                );
                const scores = testAttempts
                  .filter(
                    (attempt) =>
                      attempt.status === "evaluated" &&
                      attempt.examMode !== "section" &&
                      !attempt.selectedSectionType,
                  )
                  .map((attempt) => attempt.report?.comparableScore)
                  .filter((score): score is number => typeof score === "number");
                const bestTestScore = scores.length ? Math.max(...scores) : null;
                const lastAttempt = testAttempts[0];
                const busy = startingId === `${test.testVersionId}-full-all`;
                const totalSeconds = test.sections.reduce(
                  (total, section) => total + section.timingSeconds,
                  0,
                );
                return (
                  <article
                    key={test.testVersionId}
                    className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md sm:flex-row sm:items-center sm:p-6"
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <div
                        className="relative mt-1 flex size-14 shrink-0 items-center justify-center"
                        aria-hidden="true"
                      >
                        <div
                          className={`size-12 rounded-full bg-gradient-to-br ${PLANET_GRADIENTS[planet] ?? PLANET_GRADIENTS.moon} shadow-inner`}
                        />
                        {planet === "saturn" || planet === "jupiter" ? (
                          <div className="pointer-events-none absolute h-4 w-16 -rotate-12 rounded-full border-2 border-amber-300/70" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Set {index + 1}
                          </span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs font-medium text-slate-500">
                            {test.questionCount} items
                          </span>
                          {totalSeconds > 0 ? (
                            <>
                              <span className="text-xs text-slate-400">·</span>
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                                <Clock3 className="size-3.5" />
                                {formatDuration(totalSeconds)}
                              </span>
                            </>
                          ) : null}
                        </div>
                        <h3 className="mt-1 text-xl font-extrabold tracking-tight text-slate-950">
                          {testLabel(test.name)}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">
                          {test.description ||
                            "A TOEFL-style practice set covering the core skills."}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {test.sections.map((section) => (
                            <span
                              key={section.id}
                              className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-600"
                            >
                              {section.sectionType}
                            </span>
                          ))}
                        </div>
                        {bestTestScore !== null ? (
                          <p className="mt-3 text-xs font-semibold text-slate-600">
                            Best practice comparison:{" "}
                            <span className="text-blue-800">{bestTestScore}/120</span>
                          </p>
                        ) : lastAttempt ? (
                          <p className="mt-3 text-xs font-medium capitalize text-slate-500">
                            Last attempt: {formatDate(lastAttempt.startedAt)} ·{" "}
                            {lastAttempt.status.replaceAll("_", " ")}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:w-40">
                      <Button
                        onClick={() => void startTest(test.testVersionId, "full")}
                        disabled={Boolean(startingId)}
                        className="w-full"
                      >
                        {busy ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <Play className="mr-2 size-4 fill-current" />
                        )}
                        {busy ? "Starting…" : "Start full test"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => chooseSectionTest(test)}
                        className="w-full"
                      >
                        Practice a section <ArrowRight className="ml-2 size-4" />
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section
          id="section-practice"
          aria-labelledby="section-practice-heading"
          className="scroll-mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Focused practice
            </p>
            <h2 id="section-practice-heading" className="text-2xl font-black tracking-tight">
              Practice one section
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Pick a set and skill to launch a timed, saved section attempt.
            </p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_2fr]">
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              <span>Practice set</span>
              <select
                value={selectedSectionTest?.testVersionId ?? ""}
                onChange={(event) => setSelectedSectionTestId(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {tests.map((test) => (
                  <option key={test.testVersionId} value={test.testVersionId}>
                    {testLabel(test.name)}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SECTION_CHOICES.map(({ type, label, Icon }) => {
                const available = selectedSectionTest?.sections.some(
                  (section) => section.sectionType === type,
                );
                const selected = selectedSection === type;
                return (
                  <button
                    key={type}
                    type="button"
                    disabled={!available}
                    onClick={() => setSelectedSection(type)}
                    className={`flex min-h-16 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-bold transition ${selected ? "border-blue-700 bg-blue-50 text-blue-900 ring-1 ring-blue-700" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50"} disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    <Icon className="size-4" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">
              {selectedSectionTest ? (
                <>
                  <span className="font-semibold text-slate-900">
                    {testLabel(selectedSectionTest.name)}
                  </span>
                  {" · "}
                  {SECTION_CHOICES.find((section) => section.type === selectedSection)?.label}
                  {" · "}
                  {formatDuration(
                    selectedSectionTest.sections.find(
                      (section) => section.sectionType === selectedSection,
                    )?.timingSeconds ?? 0,
                  )}
                </>
              ) : (
                "Choose a published test to begin."
              )}
            </div>
            <Button
              disabled={
                !selectedSectionTest ||
                !selectedSectionTest.sections.some(
                  (section) => section.sectionType === selectedSection,
                ) ||
                Boolean(startingId)
              }
              onClick={() => {
                if (selectedSectionTest)
                  void startTest(selectedSectionTest.testVersionId, "section", selectedSection);
              }}
            >
              {startingId?.includes(`-${selectedSection}-`) ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Play className="mr-2 size-4 fill-current" />
              )}
              Start{" "}
              {SECTION_CHOICES.find((section) => section.type === selectedSection)?.label ??
                "Reading"}
            </Button>
          </div>
        </section>

        <footer className="flex items-center justify-center gap-2 pb-4 text-center text-xs text-slate-500">
          <Clock3 className="size-3.5" /> Practice score comparisons are estimates; TOEFL and ETS
          are trademarks of their respective owners.
        </footer>
      </main>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        <span className="text-blue-700">{icon}</span>
      </div>
      <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}
