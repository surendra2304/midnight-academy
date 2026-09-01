import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  ChevronRight,
  Filter,
  History as HistoryIcon,
  Layers,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { PageShell } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { getStudentAnalyticsDashboard } from "@/lib/analytics/analytics.functions";
import type { StudentWeaknessProfile } from "@/lib/analytics/analytics-engine";

export const Route = createFileRoute("/history")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  head: () => ({
    meta: [
      { title: "Test Records & Score Progression — Midnight Academy" },
      {
        name: "description",
        content: "Track every completed and in-progress TOEFL mock test attempt, score trajectories, comparable 0-120 scales, and question reviews.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentWeaknessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<"all" | "full" | "section" | "practice">("all");
  const [selectedSection, setSelectedSection] = useState<"all" | "reading" | "listening" | "writing" | "speaking">("all");

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await getStudentAnalyticsDashboard();
        if (res?.profile) {
          setProfile(res.profile);
        }
      } catch (err) {
        console.error("Failed to load attempt history:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppNav />
        <PageShell>
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your examination records & score trajectories...</p>
          </div>
        </PageShell>
      </div>
    );
  }

  const trends = profile?.longitudinalTrends || [];

  // Summary statistics
  const bestBand = profile?.bestOverallBand || 0;
  const avgBand = profile?.averageOverallBand || 0;
  const latestBand = profile?.latestOverallBand || 0;
  const estimatedScaledScore = Math.round((latestBand / 6.0) * 120);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />
      <PageShell>
        <div className="space-y-8 pb-16">
          {/* Header Banner */}
          <div className="rounded-3xl border border-border bg-gradient-to-r from-card/80 via-card/50 to-card/80 p-8 shadow-sm flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary uppercase">
                <Sparkles className="size-3.5" /> Permanent Test Records & Trajectory
              </div>
              <h1 className="text-3xl font-black tracking-tight text-foreground lg:text-4xl">
                Test Records & Performance History
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Review complete attempt histories, revisit question explanations, inspect comparable 0–120 estimated scales, and track longitudinal score growth.
              </p>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-surface-2/50 border border-border/80 text-center min-w-[110px]">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Latest Band</span>
                <p className="text-2xl font-black text-primary mt-0.5">{latestBand.toFixed(1)}</p>
                <span className="text-[10px] text-muted-foreground">~{estimatedScaledScore}/120 (est.)</span>
              </div>
              <div className="p-4 rounded-2xl bg-surface-2/50 border border-border/80 text-center min-w-[110px]">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Best Band</span>
                <p className="text-2xl font-black text-emerald-400 mt-0.5">{bestBand.toFixed(1)}</p>
                <span className="text-[10px] text-muted-foreground">All-Time Peak</span>
              </div>
              <div className="p-4 rounded-2xl bg-surface-2/50 border border-border/80 text-center min-w-[110px]">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Average</span>
                <p className="text-2xl font-black text-foreground mt-0.5">{avgBand.toFixed(1)}</p>
                <span className="text-[10px] text-muted-foreground">Across Attempts</span>
              </div>
            </div>
          </div>

          {/* Score Trajectory Graph */}
          {trends.length > 1 && (
            <div className="rounded-3xl border border-border bg-card/60 p-6 md:p-8 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Score Band Progression Over Time</h3>
                </div>
                <span className="text-xs text-muted-foreground">{trends.length} Attempts Recorded</span>
              </div>

              <div className="h-44 w-full flex items-end gap-3 pt-6 border-b border-border/60 pb-3">
                {trends.map((point, idx) => {
                  const heightPercent = Math.min(100, Math.max(15, (point.overallBand / 6.0) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                      <span className="text-[10px] font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        {point.overallBand.toFixed(1)}
                      </span>
                      <div
                        className="w-full bg-gradient-to-t from-primary/70 to-primary rounded-t-lg transition-all group-hover:scale-y-105"
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="text-[9px] text-muted-foreground truncate w-full text-center mt-1">
                        {point.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 bg-surface-2/60 border border-border p-1 rounded-2xl">
              {[
                { id: "all", label: "All Modes" },
                { id: "full", label: "Full Mocks" },
                { id: "section", label: "Section Practice" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedMode(tab.id as typeof selectedMode)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedMode === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-muted-foreground font-semibold">
              Showing {trends.length} Assessment Record{trends.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Attempts Record Cards */}
          {trends.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card/40 p-12 text-center space-y-4">
              <HistoryIcon className="mx-auto size-12 text-primary/60" />
              <h3 className="text-lg font-bold text-foreground">No Completed Tests Yet</h3>
              <p className="mx-auto max-w-md text-xs text-muted-foreground leading-relaxed">
                Take your first official TOEFL mock test or section assessment to build your permanent record and track your score trajectory.
              </p>
              <Button asChild className="font-bold">
                <Link to="/test">Browse Mock Test Catalog</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {trends.map((t, idx) => {
                const scaled = Math.round((t.overallBand / 6.0) * 120);
                return (
                  <article
                    key={t.attemptId}
                    className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-border bg-card/50 p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase">
                          Attempt #{trends.length - idx} • Full Mock Exam
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-foreground">
                        Standardized 2026 Adaptive Assessment
                      </h3>

                      {/* 4 Section Band Chips */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <span className="rounded-lg bg-surface-2 px-2.5 py-1 text-muted-foreground">
                          Reading: <strong className="text-foreground">{t.readingBand.toFixed(1)}</strong>
                        </span>
                        <span className="rounded-lg bg-surface-2 px-2.5 py-1 text-muted-foreground">
                          Listening: <strong className="text-foreground">{t.listeningBand.toFixed(1)}</strong>
                        </span>
                        <span className="rounded-lg bg-surface-2 px-2.5 py-1 text-muted-foreground">
                          Writing: <strong className="text-foreground">{t.writingBand.toFixed(1)}</strong>
                        </span>
                        <span className="rounded-lg bg-surface-2 px-2.5 py-1 text-muted-foreground">
                          Speaking: <strong className="text-foreground">{t.speakingBand.toFixed(1)}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Overall Band & 0-120 Estimated Scale */}
                      <div className="rounded-2xl border border-primary/30 bg-primary/5 px-5 py-3 text-center min-w-[120px]">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Overall Band</p>
                        <p className="text-2xl font-black text-primary">{t.overallBand.toFixed(1)}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">~{scaled}/120 (est.)</p>
                      </div>

                      {/* Re-Open Full Report */}
                      <Button asChild size="sm" className="font-bold px-4">
                        <Link to={`/result/${t.attemptId}`}>
                          View Report <ChevronRight className="size-3.5 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </PageShell>
    </div>
  );
}
