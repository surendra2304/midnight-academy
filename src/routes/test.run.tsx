import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { resumeToeflAttempt } from "@/lib/tests/engine.functions";
import { FullMockRunnerOrchestrator } from "@/components/test-runner/FullMockRunnerOrchestrator";
import type { ClientTestBlueprint, SessionSnapshot } from "@/lib/tests/session-state";
import { toast } from "sonner";

export const Route = createFileRoute("/test/run")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  validateSearch: (search: Record<string, unknown>): { attemptId?: string | undefined } => ({
    attemptId: typeof search["attemptId"] === "string" ? search["attemptId"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Standardized Examination — Midnight Academy" },
      {
        name: "description",
        content: "Official Standardized Multistage Adaptive Examination Runner.",
      },
    ],
  }),
  component: RunTest,
});

function RunTest() {
  const { attemptId } = useSearch({ from: "/test/run" });
  const navigate = useNavigate();
  const [blueprint, setBlueprint] = useState<ClientTestBlueprint | null>(null);
  const [initialState, setInitialState] = useState<SessionSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId) {
      navigate({ to: "/test" });
      return;
    }

    async function hydrate() {
      try {
        const res = await resumeToeflAttempt({ data: { attemptId: attemptId! } });
        const resolvedBlueprint = (res as any)?.blueprint;
        const resolvedState = (res as any)?.snapshot || (res as any)?.state;
        if (resolvedBlueprint && resolvedState) {
          setBlueprint(resolvedBlueprint);
          setInitialState(resolvedState);
        } else {
          setErrorMsg("Test session data was incomplete. Please return to catalog.");
        }
      } catch (err: unknown) {
        setErrorMsg((err as Error)?.message || "Failed to resume session");
      } finally {
        setLoading(false);
      }
    }

    hydrate();
  }, [attemptId, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white text-slate-900 select-none">
        <div className="relative size-20">
          <div className="size-20 rounded-full border-4 border-slate-200" />
          <div className="absolute top-0 left-0 size-20 rounded-full border-4 border-transparent border-t-[#204482] animate-spin" />
        </div>
        <p className="mt-8 text-2xl font-light tracking-wide text-slate-800">
          please wait while we load your exam
        </p>
      </div>
    );
  }

  if (errorMsg || !blueprint || !initialState) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-6">
        <div className="max-w-md w-full rounded-2xl border border-destructive/20 bg-card p-8 text-center space-y-4">
          <p className="text-base font-bold text-foreground">Session Initialization Issue</p>
          <p className="text-xs text-muted-foreground">
            {errorMsg || "Unable to load test session."}
          </p>
          <button
            onClick={() => navigate({ to: "/test" })}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
          >
            Return to Test Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <FullMockRunnerOrchestrator
      initialBlueprint={blueprint}
      initialSnapshot={initialState}
      onFinalized={() => navigate({ to: `/result/${attemptId}` })}
    />
  );
}
