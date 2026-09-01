import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarClock, ChevronRight, History as HistoryIcon, Loader2, Sparkles, Trophy } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { PageShell } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { getStudentAnalyticsDashboard } from "@/lib/analytics/analytics.functions";
import type { StudentWeaknessProfile } from "@/lib/analytics/analytics-engine";

export const Route = createFileRoute("/history")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  head: () => ({
    meta: [
      { title: "TOEFL Score History — Midnight Academy" },
      {
        name: "description",
        content: "View all completed TOEFL mock tests, section assessments, and score reports over time.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [profile, setProfile] = useState<StudentWeaknessProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
            <p className="text-sm text-muted-foreground">Loading your examination history...</p>
          </div>
        </PageShell>
      </div>
    );
  }

  const trends = profile?.longitudinalTrends || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />
      <PageShell>
        <div className="space-y-8 pb-16">
          <div className="border-b border-border pb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Attempt Records</span>
            <h1 className="text-2xl font-black text-foreground lg:text-3xl mt-1">Official Assessment History</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Revisit your past score reports, band breakdowns, and question reviews.
            </p>
          </div>

          {trends.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card/40 p-12 text-center space-y-4">
              <HistoryIcon className="mx-auto size-12 text-primary/60" />
              <h3 className="text-lg font-bold text-foreground">No Completed Tests Yet</h3>
              <p className="mx-auto max-w-md text-xs text-muted-foreground">
                Take your first official TOEFL mock test or section assessment to build your permanent record and track your score trajectory.
              </p>
              <Button asChild className="font-bold">
                <Link to="/test">Browse Test Catalog</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {trends.map((t, idx) => (
                <article
                  key={t.attemptId}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/50 p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                        Attempt #{trends.length - idx}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-foreground">TOEFL iBT Official Assessment</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                      <span>Reading: <strong>{t.readingBand.toFixed(1)}</strong></span>
                      <span>·</span>
                      <span>Listening: <strong>{t.listeningBand.toFixed(1)}</strong></span>
                      <span>·</span>
                      <span>Writing: <strong>{t.writingBand.toFixed(1)}</strong></span>
                      <span>·</span>
                      <span>Speaking: <strong>{t.speakingBand.toFixed(1)}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-center">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Overall Band</p>
                      <p className="text-2xl font-black text-primary">{t.overallBand.toFixed(1)}</p>
                    </div>

                    <Button asChild size="sm" variant="outline" className="font-bold">
                      <Link to={`/result/${t.attemptId}`}>
                        View Report <ChevronRight className="size-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </PageShell>
    </div>
  );
}
