import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { PageShell } from "@/components/kit";
import { getStudentAnalyticsDashboard } from "@/lib/analytics/analytics.functions";
import { AnalyticsDashboardView } from "@/components/test-runner/AnalyticsDashboardView";
import type { StudentWeaknessProfile } from "@/lib/analytics/analytics-engine";

export const Route = createFileRoute("/progress")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  head: () => ({
    meta: [
      { title: "Skill Analytics & Progress — Midnight Academy" },
      {
        name: "description",
        content: "Detailed 4-section performance breakdown, task-type timing efficiency, and weakness diagnostics.",
      },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const [profile, setProfile] = useState<StudentWeaknessProfile | null>(null);
  const [targetBand, setTargetBand] = useState<number>(5.0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getStudentAnalyticsDashboard();
        if (res?.profile) {
          setProfile(res.profile);
          setTargetBand(res.targetBand || 5.0);
        }
      } catch (err) {
        console.error("Failed to load skill analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppNav />
        <PageShell>
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your TOEFL skill analytics & trends...</p>
          </div>
        </PageShell>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />
      <PageShell>
        <div className="space-y-6 pb-16">
          <div className="border-b border-border pb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Diagnostic Performance Analytics</span>
            <h1 className="text-2xl font-black text-foreground lg:text-3xl mt-1">TOEFL Skill Radar & Longitudinal Trends</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Rule-based skill accuracy metrics, error pattern classifications, and ETS benchmark diagnostics.
            </p>
          </div>

          {profile ? (
            <AnalyticsDashboardView profile={profile} targetBand={targetBand} />
          ) : null}
        </div>
      </PageShell>
    </div>
  );
}
