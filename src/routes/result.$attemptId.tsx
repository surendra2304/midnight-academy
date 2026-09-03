import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { PageShell } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { getToeflScoreReport } from "@/lib/evaluation/report.functions";
import { UnifiedScoreReportView } from "@/components/test-runner/UnifiedScoreReportView";

export const Route = createFileRoute("/result/$attemptId")({
  beforeLoad: ({ location }) => requireAuth({ location }),
  head: () => ({
    meta: [
      { title: "Standardized Score Report — Midnight Academy" },
      {
        name: "description",
        content:
          "Detailed official band scores, diagnostic item review, and personalized recommendations.",
      },
    ],
  }),
  component: ResultPage,
});

function ResultPage() {
  const { attemptId } = useParams({ from: "/result/$attemptId" });
  const [reportData, setReportData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await getToeflScoreReport({ data: { attemptId } });
        setReportData(res);
      } catch (err: unknown) {
        setError((err as Error)?.message || "Failed to load score report");
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppNav />
        <PageShell>
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Hydrating score report & evaluations...</p>
          </div>
        </PageShell>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppNav />
        <PageShell>
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-4 max-w-lg mx-auto mt-12">
            <p className="text-sm text-destructive font-bold">
              {error || "Unable to load score report."}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard">
                <ArrowLeft className="size-3.5 mr-1" /> Return to Dashboard
              </Link>
            </Button>
          </div>
        </PageShell>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />
      <PageShell>
        <div className="pb-16 pt-4">
          <UnifiedScoreReportView
            reportData={reportData as Parameters<typeof UnifiedScoreReportView>[0]["reportData"]}
          />
        </div>
      </PageShell>
    </div>
  );
}
