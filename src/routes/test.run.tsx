import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { resumeToeflAttempt } from "@/lib/tests/engine.functions";
import { FullMockRunnerOrchestrator } from "@/components/test-runner/FullMockRunnerOrchestrator";
import type { HydratedBlueprint, SessionState } from "@/types/toefl";
import { toast } from "sonner";

export const Route = createFileRoute("/test/run")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  validateSearch: (search: Record<string, unknown>): { attemptId?: string | undefined } => ({
    attemptId: typeof search["attemptId"] === "string" ? search["attemptId"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "TOEFL Examination — Midnight Academy" },
      {
        name: "description",
        content: "Official TOEFL iBT 2026 Examination Runner.",
      },
    ],
  }),
  component: RunTest,
});

function RunTest() {
  const { attemptId } = useSearch({ from: "/test/run" });
  const navigate = useNavigate();
  const [blueprint, setBlueprint] = useState<HydratedBlueprint | null>(null);
  const [initialState, setInitialState] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) {
      navigate({ to: "/test" });
      return;
    }

    async function hydrate() {
      try {
        const res = await resumeToeflAttempt({ data: { attemptId: attemptId! } });
        if (res?.blueprint && res?.state) {
          setBlueprint(res.blueprint);
          setInitialState(res.state);
        }
      } catch (err: unknown) {
        toast.error((err as Error)?.message || "Failed to resume session");
        navigate({ to: "/test" });
      } finally {
        setLoading(false);
      }
    }

    hydrate();
  }, [attemptId, navigate]);

  if (loading || !blueprint || !initialState) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading test blueprint & assets...</p>
      </div>
    );
  }

  return (
    <FullMockRunnerOrchestrator
      attemptId={attemptId!}
      blueprint={blueprint}
      initialState={initialState}
      onFinish={() => navigate({ to: `/result/${attemptId}` })}
    />
  );
}
