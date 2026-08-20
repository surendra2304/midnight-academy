import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase client automatically processes hash and query params on getSession
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          setError(sessionError.message);
          return;
        }

        if (!session?.user) {
          // If session is not immediately ready, check if user exists
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();
          if (userError || !user) {
            setError("Could not complete authentication. Please try signing in again.");
            return;
          }
        }

        const userId = session?.user?.id;
        if (!userId) {
          navigate({ to: "/dashboard" });
          return;
        }

        // Check role in user_roles table
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();

        const role = roleRow?.role;
        if (role === "admin") {
          navigate({ to: "/admin" });
        } else {
          navigate({ to: "/onboarding" });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to complete authentication";
        setError(message);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-destructive">Authentication Error</h1>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <button
          onClick={() => navigate({ to: "/auth" })}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Return to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
