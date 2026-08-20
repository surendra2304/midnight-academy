import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/error")({
  validateSearch: (search: Record<string, unknown>) => ({
    message: typeof search["message"] === "string" ? search["message"] : undefined,
  }),
  component: AuthErrorPage,
});

function AuthErrorPage() {
  const search = useSearch({ from: "/auth/error" });
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-2xl font-bold text-destructive">Authentication Error</h1>
      <p className="mt-2 text-muted-foreground">
        {search.message || "An unknown error occurred during sign in."}
      </p>
      <button
        onClick={() => navigate({ to: "/auth" })}
        className="mt-6 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
      >
        Return to Sign In
      </button>
    </div>
  );
}
