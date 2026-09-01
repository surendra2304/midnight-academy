import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Sparkles, Target } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { PageShell } from "@/components/kit";
import { getStudentPracticeQueue } from "@/lib/recommendations/recommendations.functions";
import { PracticeQueueView } from "@/components/test-runner/PracticeQueueView";
import type { RecommendationItem } from "@/lib/recommendations/recommendation-engine";

export const Route = createFileRoute("/practice")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  head: () => ({
    meta: [
      { title: "Targeted Practice Queue — Midnight Academy" },
      {
        name: "description",
        content: "Personalized practice queue generated from your diagnosed English skill weakness profile.",
      },
    ],
  }),
  component: PracticePage,
});

function PracticePage() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQueue() {
      try {
        const res = await getStudentPracticeQueue();
        if (res?.queue) {
          setQueue(res.queue);
        }
      } catch (err) {
        console.error("Failed to load practice queue:", err);
      } finally {
        setLoading(false);
      }
    }
    loadQueue();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppNav />
        <PageShell>
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading personalized practice queue...</p>
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
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Adaptive Diagnostic Practice</span>
            <h1 className="text-2xl font-black text-foreground lg:text-3xl mt-1">Weakness-Targeted Practice Exercises</h1>
            <p className="text-xs text-muted-foreground mt-1">
              High-value practice items specifically matched to your lowest-accuracy skills and repeated error patterns.
            </p>
          </div>

          <PracticeQueueView
            queue={queue}
            onLaunchPractice={() => navigate({ to: "/test" })}
          />
        </div>
      </PageShell>
    </div>
  );
}
