import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Headphones,
  Loader2,
  Mic,
  PenTool,
  Search,
  Sparkles,
} from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { PageShell } from "@/components/kit";
import { getLessons, type LessonItem } from "@/lib/lessons/lessons.functions";

export const Route = createFileRoute("/lessons/")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  head: () => ({
    meta: [
      { title: "TOEFL Strategy Guides & Lessons — Midnight Academy" },
      {
        name: "description",
        content: "Master all 12 TOEFL 2026 task types with in-depth strategy guides, timing benchmarks, scoring secrets, and masterclasses.",
      },
    ],
  }),
  component: LessonsIndexPage,
});

function LessonsIndexPage() {
  const [lessons, setLessons] = useState<(LessonItem & { isCompleted: boolean })[]>([]);
  const [selectedSection, setSelectedSection] = useState<"all" | "reading" | "listening" | "writing" | "speaking">("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getLessons({ data: { section: selectedSection } });
        setLessons((res as any) || []);
      } catch (err) {
        console.error("Failed to load lessons:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedSection]);

  const filteredLessons = lessons.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedCount = lessons.filter((l) => l.isCompleted).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />
      <PageShell>
        <div className="space-y-8 pb-16">
          {/* Hero Banner */}
          <div className="rounded-3xl border border-border bg-gradient-to-r from-card/80 via-card/50 to-card/80 p-8 shadow-sm flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary uppercase">
                <Sparkles className="size-3.5" /> Strategy & Masterclass Curriculum
              </div>
              <h1 className="text-3xl font-black tracking-tight text-foreground lg:text-4xl">
                TOEFL Task Strategy Guides
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Step-by-step masterclasses covering every 2026 task type, time management formulas, scoring rubrics, and high-frequency distractor traps.
              </p>
            </div>

            {/* Completion Stat */}
            <div className="rounded-2xl border border-border bg-background/80 p-5 text-center min-w-[180px]">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Guides Completed</span>
              <p className="text-2xl font-black text-primary mt-0.5">{completedCount} / {lessons.length}</p>
              <div className="w-full bg-surface-2 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all"
                  style={{ width: `${lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Section Filter & Search */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 bg-surface-2/60 border border-border p-1.5 rounded-2xl">
              {[
                { id: "all", label: "All Guides" },
                { id: "reading", label: "Reading" },
                { id: "listening", label: "Listening" },
                { id: "writing", label: "Writing" },
                { id: "speaking", label: "Speaking" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedSection(tab.id as typeof selectedSection)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    selectedSection === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search strategies & lessons..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl border border-border bg-card/60 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Lessons Grid */}
          {loading ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Loading curriculum...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  to={`/lessons/${lesson.slug}`}
                  className="rounded-3xl border border-border bg-card/50 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-primary/40 hover:scale-[1.01] transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase">
                        {lesson.section}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-semibold">
                        <Clock className="size-3.5" />
                        <span>{lesson.estimatedMinutes} mins</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {lesson.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs font-semibold">
                    <span className="text-primary group-hover:underline">Read Strategy Guide →</span>
                    {lesson.isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                        <CheckCircle2 className="size-3.5" /> Completed
                      </span>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PageShell>
    </div>
  );
}
