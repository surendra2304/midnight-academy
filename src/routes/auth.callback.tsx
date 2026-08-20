import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiClient, setAccessToken } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const search: any = useSearch({ from: "/auth/callback" });
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const exchangeCode = async () => {
      const code = search.code;
      if (!code) {
        setError("No exchange code provided");
        return;
      }

      try {
        const res = await apiClient("/auth/google/exchange", {
          method: "POST",
          body: JSON.stringify({ code }),
        });
        
        setAccessToken(res.accessToken);
        localStorage.setItem("refreshToken", res.refreshToken);
        
        // Let the app re-hydrate session globally (we can also manually trigger it, 
        // but simplest is just redirecting and let useAuth fetch /me or we can 
        // rely on res.user since the backend returns it).
        // Let's redirect based on role:
        const returnedRole = res?.user?.role;
        window.location.href = returnedRole === "ADMIN" ? "/admin" : "/onboarding";
      } catch (err: any) {
        setError(err.message || "Failed to exchange code");
      }
    };
    exchangeCode();
  }, [search.code, navigate]);

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
