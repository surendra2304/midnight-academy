import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { authStore } from "@/lib/auth-store";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const handleAuthCallback = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          if (active) setError(sessionError.message);
          return;
        }

        const user = session?.user;
        if (!user) {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError || !userData?.user) {
            if (active) setError("Could not complete authentication. Please try signing in again.");
            return;
          }
        }

        const activeUser = session?.user || (await supabase.auth.getUser()).data.user;
        if (!activeUser) {
          if (active) setError("Session could not be established.");
          return;
        }

        // Decide whether this Google identity already has an account.
        // If they have a role in user_roles, they are an existing user and sign straight in.
        // If they have NO role, they are a first-time user and must complete registration.
        let hasAccount = false;
        let googleEmail: string | null = activeUser.email ?? null;
        let googleName: string | null =
          typeof activeUser.user_metadata?.["full_name"] === "string"
            ? activeUser.user_metadata["full_name"]
            : null;

        try {
          const { getOAuthAccountStatus } = await import("@/lib/auth.functions");
          const status = await getOAuthAccountStatus();
          hasAccount = status.hasAccount;
          if (status.email) googleEmail = status.email;
          if (status.fullName) googleName = status.fullName;
        } catch (fnErr) {
          console.warn(
            "[AuthCallback] serverFn getOAuthAccountStatus failed, checking client Supabase:",
            fnErr,
          );
          // Direct client fallback to check user_roles
          const { data: roleRows } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", activeUser.id);
          hasAccount = (roleRows && roleRows.length > 0) ?? false;
        }

        if (!active) return;

        if (!hasAccount) {
          navigate({
            to: "/auth",
            search: {
              flow: "google-new",
              email: googleEmail ?? undefined,
              name: googleName ?? undefined,
            },
          });
          return;
        }

        // Synchronize auth-store with authoritative server role
        await authStore.restoreSession();
        if (authStore.isLoading()) await authStore.whenSettled();
        const storedUser = authStore.getUser();

        // The identity has roles server-side but the client could not resolve
        // them. Never dump this user on a guarded page (that bounces to the
        // login form); send them back into the signup continuation instead.
        if (!storedUser) {
          navigate({
            to: "/auth",
            search: {
              flow: "google-new",
              email: googleEmail ?? undefined,
              name: googleName ?? undefined,
            },
          });
          return;
        }

        if (storedUser.role === "ADMIN") {
          navigate({ to: "/admin" });
        } else {
          navigate({ to: "/dashboard" });
        }
      } catch (err: unknown) {
        if (active) {
          const message = err instanceof Error ? err.message : "Failed to complete authentication";
          setError(message);
        }
      }
    };

    handleAuthCallback();

    return () => {
      active = false;
    };
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
