import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Check,
  X,
  FileText,
  BarChart2,
  Sparkles,
  Loader2,
  Play,
  LayoutGrid,
  BookOpen,
  Volume2,
  Mic,
  PenTool,
  Globe2,
} from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { TestGliderSubNav } from "@/components/TestGliderSubNav";
import { Button } from "@/components/ui/button";
import { getPublishedTests } from "@/lib/practice.functions";
import { startToeflAttempt } from "@/lib/tests/engine.functions";
import { toast } from "sonner";
import { ALL_TESTGLIDER_BLUEPRINTS, ALL_TESTGLIDER_QUESTION_ITEMS } from "@/data/testglider-2026-catalog";
import { toDeterministicUuid } from "@/data/tests/types";
import type { ToeflSectionType, ToeflExamMode } from "@/types/toefl";

const INITIAL_PUBLISHED_TESTS: PublishedTestItem[] = ALL_TESTGLIDER_BLUEPRINTS.map((bp) => {
  const planetUpper = (bp.blueprint_Json.planetName || "MOON").toUpperCase();
  const count = ALL_TESTGLIDER_QUESTION_ITEMS.filter((it) => it.blueprint_Id === bp.id).length;
  return {
    id: bp.id,
    testVersionId: bp.id,
    name: bp.title,
    category: "Full Mock",
    difficulty: bp.blueprint_Json.difficultyLabel || "Medium",
    code: `TOEFL-MOCK-${planetUpper}`,
    questionCount: count || 48,
    sections: [
      {
        id: toDeterministicUuid(`${bp.id}-section-reading`),
        sectionType: "reading",
        sectionOrder: 0,
        timingSeconds: 1800,
      },
      {
        id: toDeterministicUuid(`${bp.id}-section-listening`),
        sectionType: "listening",
        sectionOrder: 1,
        timingSeconds: 1740,
      },
      {
        id: toDeterministicUuid(`${bp.id}-section-writing`),
        sectionType: "writing",
        sectionOrder: 2,
        timingSeconds: 1380,
      },
      {
        id: toDeterministicUuid(`${bp.id}-section-speaking`),
        sectionType: "speaking",
        sectionOrder: 3,
        timingSeconds: 480,
      },
    ],
  };
});

export const Route = createFileRoute("/test/")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  head: () => ({
    meta: [
      { title: "TOEFL Practice & Mock Tests — TestGlider" },
      {
        name: "description",
        content:
          "Official TOEFL 2026 Full-Length Mock Exams (Moon, Mars, Venus, Jupiter, Saturn, Mercury, Neptune, Uranus) and Single Section Mode practice with instant AI grading.",
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

const DEFAULT_MOON_VERSION_ID = "f2000000-0000-4000-8000-000000000000";

const PLANET_THEMES: Record<
  string,
  {
    subtitle: string;
    badgeColor: string;
    orbGradient: string;
    ringColor?: string;
    description: string;
  }
> = {
  moon: {
    subtitle: "Mock Test #1 • Official 2026 Format",
    badgeColor: "bg-slate-100 text-slate-800 border-slate-300",
    orbGradient: "from-slate-200 via-slate-400 to-slate-600",
    description:
      "The Power of Music, Sin Taxes Discussion, Elevator Maintenance, Campus Café & Library Orientation",
  },
  mars: {
    subtitle: "Mock Test #2 • Official 2026 Format",
    badgeColor: "bg-orange-50 text-orange-800 border-orange-200",
    orbGradient: "from-orange-300 via-red-500 to-rose-800",
    description:
      "3D-Printed Coral Reefs, Roman Concrete, Remote Work Debate, Parking Permit & Gym Orientation",
  },
  venus: {
    subtitle: "Mock Test #3 • Official 2026 Format",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    orbGradient: "from-amber-200 via-yellow-500 to-amber-700",
    description:
      "Svalbard Global Seed Vault, Bioluminescence, Cashless Society Discussion & Botanical Garden Tour",
  },
  jupiter: {
    subtitle: "Mock Test #4 • Official 2026 Format",
    badgeColor: "bg-orange-50 text-amber-900 border-amber-300",
    orbGradient: "from-amber-300 via-orange-500 to-stone-700",
    ringColor: "border-amber-400/50",
    description:
      "Urban Heat Islands, Behavioral Economics & Decoy Effect, Mandatory Volunteering & Art Museum Tour",
  },
  saturn: {
    subtitle: "Mock Test #5 • Official 2026 Format",
    badgeColor: "bg-yellow-50 text-yellow-900 border-yellow-300",
    orbGradient: "from-yellow-200 via-amber-400 to-yellow-700",
    ringColor: "border-yellow-500/60",
    description:
      "Pando Aspen Clone, Rosetta Stone & Champollion, AI in Education Discussion & Chemistry Lab Safety",
  },
  mercury: {
    subtitle: "Mock Test #6 • Official 2026 Format",
    badgeColor: "bg-zinc-100 text-zinc-800 border-zinc-300",
    orbGradient: "from-zinc-300 via-stone-500 to-neutral-800",
    description:
      "Mycorrhizal Fungal Networks, Antikythera Mechanism, 4-Day Workweek Debate & Planetarium Show",
  },
  neptune: {
    subtitle: "Mock Test #7 • Official 2026 Format",
    badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
    orbGradient: "from-sky-300 via-blue-600 to-indigo-900",
    description:
      "Handmade Crafts & Blues Music, Centipedes vs. Millipedes, Phonofiddle, Chiaroscuro & Studying History",
  },
  uranus: {
    subtitle: "Mock Test #8 • Official 2026 Format",
    badgeColor: "bg-cyan-50 text-cyan-800 border-cyan-200",
    orbGradient: "from-cyan-200 via-teal-400 to-cyan-700",
    ringColor: "border-cyan-400/60",
    description:
      "Early Silent Cinema & Sleep Science, Yellowstone Wolves, Gut Microbiome, Spiral Jetty & Accounting Conference",
  },
};

function getPlanetMeta(name: string) {
  const lower = name.toLowerCase();
  for (const [key, meta] of Object.entries(PLANET_THEMES)) {
    if (lower.includes(key)) {
      return { key, ...meta };
    }
  }
  return {
    key: "moon",
    ...PLANET_THEMES.moon,
  };
}

function getShortPlanetName(name: string) {
  const part = name.split("|")[0]?.trim();
  return part || name;
}

export function TestCatalog() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<PublishedTestItem[]>(INITIAL_PUBLISHED_TESTS);
  const [loading, setLoading] = useState(false);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [selectedModalTest, setSelectedModalTest] = useState<PublishedTestItem | null>(null);
  const [selectedSectionTestId, setSelectedSectionTestId] = useState<string>(
    INITIAL_PUBLISHED_TESTS[0]?.testVersionId || DEFAULT_MOON_VERSION_ID,
  );

  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await getPublishedTests();
        const items = (res as PublishedTestItem[]) || [];
        if (items.length > 0) {
          setTests(items);
          setSelectedSectionTestId((prev) => prev || items[0].testVersionId);
        }
      } catch (err) {
        console.error("Failed to refresh catalog from server, using pre-seeded catalog:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const moonTest =
    tests.find((t) => t.name.toLowerCase().includes("moon")) || tests[0];

  const moonVersionId = moonTest?.testVersionId || DEFAULT_MOON_VERSION_ID;

  const activeSectionTest =
    tests.find((t) => t.testVersionId === selectedSectionTestId) || moonTest;

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

      const attemptId =
        (res as { snapshot?: { attemptId?: string }; attemptId?: string })?.snapshot
          ?.attemptId ||
        (res as { attemptId?: string })?.attemptId;

      if (attemptId) {
        try {
          if (typeof sessionStorage !== "undefined") {
            sessionStorage.setItem(`tg_session_${attemptId}`, JSON.stringify(res));
          }
        } catch {
          // ignore storage quota errors
        }
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
      setSelectedModalTest(null);
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
      <TestGliderSubNav />

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-12">
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

        {/* Section 2: Featured Test in Progress (Moon Full Test) */}
        {moonTest && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-700">
                Featured 2026 Exam
              </span>
              <h2 className="text-xl font-black text-slate-900">Tests in progress</h2>
            </div>

            <div
              onClick={() => setSelectedModalTest(moonTest)}
              className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xs transition-all hover:border-blue-400 hover:shadow-md cursor-pointer"
            >
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    Moon
                  </span>
                  <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                    Full Test • {moonTest.questionCount || 54} Items
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  {PLANET_THEMES.moon.description}
                </p>
                <div className="pt-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedModalTest(moonTest);
                    }}
                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-2.5 text-xs shadow-xs cursor-pointer"
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
        )}

        {/* Center Pill: Scores in under 1 min */}
        <div className="flex justify-center">
          <div className="rounded-full border border-slate-200/80 bg-slate-100/90 px-6 py-2 text-xs font-semibold text-slate-600 shadow-xs">
            Scores in under 1 min • All 8 Complete 2026 Mock Tests • Automated AI Rubric Grading
          </div>
        </div>

        {/* Section 3: Complete TOEFL 2026 Planetary Mock Test Series (All 8 Tests) */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Globe2 className="size-5 text-[#0f3b82]" />
                <h2 className="text-xl font-black text-slate-900">
                  Official 2026 Full-Length Mock Test Series ({tests.length} Complete Exams)
                </h2>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Every mock exam includes Reading (Modules 1 &amp; 2), Listening (Modules 1 &amp;
                2), Writing (Build a Sentence, Email &amp; Academic Discussion), and Speaking
                (Listen &amp; Repeat + Interview).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tests.map((testItem, idx) => {
              const planet = getPlanetMeta(testItem.name);
              const shortName = getShortPlanetName(testItem.name);
              const isStartingFull = startingId === `${testItem.testVersionId}-full-all`;

              return (
                <div
                  key={testItem.testVersionId}
                  onClick={() => setSelectedModalTest(testItem)}
                  className="group relative flex items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all hover:border-blue-400 hover:shadow-md cursor-pointer"
                >
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${planet.badgeColor}`}
                      >
                        Set #{idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {testItem.questionCount || 48} Questions • 4 Sections
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {shortName}{" "}
                      <span className="text-sm font-semibold text-slate-400">
                        | Full Mock Test
                      </span>
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {planet.description}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        disabled={Boolean(startingId)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModalTest(testItem);
                        }}
                        className="rounded-full bg-[#0f3b82] hover:bg-[#154694] text-white font-bold px-5 text-xs cursor-pointer"
                      >
                        {isStartingFull ? (
                          <>
                            <Loader2 className="size-3 mr-1.5 animate-spin" /> Launching...
                          </>
                        ) : (
                          <>
                            <Play className="size-3 mr-1.5 fill-current" /> Start Full Test
                          </>
                        )}
                      </Button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSectionTestId(testItem.testVersionId);
                          const el = document.getElementById("single-section-mode");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-1.5 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
                      >
                        Section Mode
                      </button>
                    </div>
                  </div>

                  {/* Planetary Illustration */}
                  <div className="shrink-0 flex items-center justify-center pr-2">
                    {planet.key === "moon" ? (
                      <img
                        src="/images/testglider-moon.png"
                        alt={shortName}
                        className="size-20 object-contain transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="relative flex items-center justify-center size-20">
                        {planet.ringColor && (
                          <div
                            className={`absolute w-24 h-7 rounded-full border-4 ${planet.ringColor} -rotate-12 pointer-events-none`}
                          />
                        )}
                        <div
                          className={`size-16 rounded-full bg-gradient-to-br ${planet.orbGradient} shadow-inner transition-transform group-hover:scale-105 flex items-center justify-center`}
                        >
                          <div className="size-12 rounded-full bg-white/10 backdrop-blur-[1px]" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 4: Single Section Mode */}
        <section id="single-section-mode" className="space-y-5 pt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Single Section Mode</h2>
              <p className="text-xs font-medium text-slate-500">
                Take only the section you want to focus on from any of the 8 mock tests.
              </p>
            </div>

            {/* Planetary Mock Selector Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs">
              {tests.map((t) => {
                const shortName = getShortPlanetName(t.name);
                const isSelected = activeSectionTest?.testVersionId === t.testVersionId;
                return (
                  <button
                    key={t.testVersionId}
                    type="button"
                    onClick={() => setSelectedSectionTestId(t.testVersionId)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#0f3b82] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {shortName}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Reading Section Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Reading</h3>
                  <BookOpen className="size-4 text-[#0f3b82]" />
                </div>
                <p className="text-xs text-slate-500">
                  Take only the Reading section of the{" "}
                  <strong className="text-slate-800">
                    {getShortPlanetName(activeSectionTest?.name || "Moon")}
                  </strong>{" "}
                  Mock
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-xl border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100 font-bold text-xs cursor-pointer"
                disabled={
                  startingId === `${activeSectionTest?.testVersionId}-section-reading`
                }
                onClick={() =>
                  handleStartTest(
                    activeSectionTest?.testVersionId || moonVersionId,
                    "section",
                    "reading",
                  )
                }
              >
                {startingId === `${activeSectionTest?.testVersionId}-section-reading` ? (
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Listening</h3>
                  <Volume2 className="size-4 text-[#0f3b82]" />
                </div>
                <p className="text-xs text-slate-500">
                  Take only the Listening section of the{" "}
                  <strong className="text-slate-800">
                    {getShortPlanetName(activeSectionTest?.name || "Moon")}
                  </strong>{" "}
                  Mock
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-xl border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100 font-bold text-xs cursor-pointer"
                disabled={
                  startingId === `${activeSectionTest?.testVersionId}-section-listening`
                }
                onClick={() =>
                  handleStartTest(
                    activeSectionTest?.testVersionId || moonVersionId,
                    "section",
                    "listening",
                  )
                }
              >
                {startingId === `${activeSectionTest?.testVersionId}-section-listening` ? (
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Writing</h3>
                  <PenTool className="size-4 text-[#0f3b82]" />
                </div>
                <p className="text-xs text-slate-500">
                  Take only the Writing section of the{" "}
                  <strong className="text-slate-800">
                    {getShortPlanetName(activeSectionTest?.name || "Moon")}
                  </strong>{" "}
                  Mock
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-xl border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100 font-bold text-xs cursor-pointer"
                disabled={
                  startingId === `${activeSectionTest?.testVersionId}-section-writing`
                }
                onClick={() =>
                  handleStartTest(
                    activeSectionTest?.testVersionId || moonVersionId,
                    "section",
                    "writing",
                  )
                }
              >
                {startingId === `${activeSectionTest?.testVersionId}-section-writing` ? (
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Speaking</h3>
                  <Mic className="size-4 text-[#0f3b82]" />
                </div>
                <p className="text-xs text-slate-500">
                  Take only the Speaking section of the{" "}
                  <strong className="text-slate-800">
                    {getShortPlanetName(activeSectionTest?.name || "Moon")}
                  </strong>{" "}
                  Mock
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-xl border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100 font-bold text-xs cursor-pointer"
                disabled={
                  startingId === `${activeSectionTest?.testVersionId}-section-speaking`
                }
                onClick={() =>
                  handleStartTest(
                    activeSectionTest?.testVersionId || moonVersionId,
                    "section",
                    "speaking",
                  )
                }
              >
                {startingId === `${activeSectionTest?.testVersionId}-section-speaking` ? (
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

      {/* 'What is included?' Modal */}
      {selectedModalTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl space-y-6">
            <button
              onClick={() => setSelectedModalTest(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="space-y-1 pr-8">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f3b82]">
                {selectedModalTest.name}
              </span>
              <h3 className="text-lg font-bold text-slate-900">What is included?</h3>
            </div>

            {/* Features Table */}
            <div className="space-y-3 text-xs font-semibold">
              <div className="grid grid-cols-[1fr_130px] items-center pb-2 border-b border-slate-100 text-slate-500">
                <span>Features</span>
                <span className="text-center font-bold text-blue-600">Included</span>
              </div>

              <div className="grid grid-cols-[1fr_130px] items-center py-2 border-b border-slate-50">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <FileText className="size-4 text-slate-500" />
                  <span>Test Attempts</span>
                </div>
                <span className="text-center font-bold text-blue-600">Unlimited</span>
              </div>

              <div className="grid grid-cols-[1fr_130px] items-center py-2 border-b border-slate-50">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <BarChart2 className="size-4 text-slate-500" />
                  <span>View Total Score (1.0–6.0)</span>
                </div>
                <div className="flex justify-center items-center gap-1 text-blue-600 font-bold">
                  <Check className="size-4 stroke-[2.5]" /> Included
                </div>
              </div>

              <div className="grid grid-cols-[1fr_130px] items-center py-2 border-b border-slate-50">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <LayoutGrid className="size-4 text-slate-500" />
                  <span>View Section Scores</span>
                </div>
                <div className="flex justify-center items-center gap-1 text-blue-600 font-bold">
                  <Check className="size-4 stroke-[2.5]" /> Included
                </div>
              </div>

              <div className="grid grid-cols-[1fr_130px] items-center py-2 border-b border-slate-50">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Sparkles className="size-4 text-slate-500" />
                  <span>Answer Key &amp; Explanations</span>
                </div>
                <div className="flex justify-center items-center gap-1 text-blue-600 font-bold">
                  <Check className="size-4 stroke-[2.5]" /> Included
                </div>
              </div>

              <div className="grid grid-cols-[1fr_130px] items-center py-2">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Check className="size-4 text-slate-500" />
                  <span>AI Writing &amp; Speaking Grading</span>
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
                onClick={() => handleStartTest(selectedModalTest.testVersionId, "full")}
                className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {startingId ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-1" /> Launching Exam...
                  </>
                ) : (
                  <>
                    <Play className="size-3.5 fill-current text-white" /> Start{" "}
                    {getShortPlanetName(selectedModalTest.name)} Full Test
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
