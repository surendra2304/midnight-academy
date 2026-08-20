import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, ShieldCheck } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

import { requireUnauth } from "@/lib/auth-guard";

export const Route = createFileRoute("/auth")({
  beforeLoad: ({ location }) => requireUnauth({ location }),
  head: () => ({
    meta: [
      { title: "Sign in — Midnight Academy" },
      {
        name: "description",
        content:
          "Choose your workspace and sign in to Midnight Academy as a student or an instructor.",
      },
      { property: "og:title", content: "Sign in — Midnight Academy" },
      {
        property: "og:description",
        content: "Student and instructor access to technical comprehension training.",
      },
    ],
  }),
  component: AuthPage,
});

const roles = [
  {
    id: "student" as const,
    title: "Student",
    body: "Practice and improve your technical question understanding",
    icon: GraduationCap,
  },
  {
    id: "admin" as const,
    title: "Admin",
    body: "Create, manage and evaluate technical tests",
    icon: ShieldCheck,
  },
];

function AuthPage() {
  const [role, setRole] = useState<"student" | "admin">("student");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      let res;
      if (isLogin) {
        res = await login({ email, password });
      } else {
        res = await register({ email, password, fullName: email.split("@")[0] });
      }
      
      const returnedRole = res?.user?.role;
      if (returnedRole === "ADMIN") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/onboarding" });
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env['VITE_API_URL'] || "http://localhost:3000"}/auth/google`;
  };

  return (
    <main className="grid-backdrop flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Wordmark />
        </div>

        <div className="panel mt-8 p-6 lg:p-8">
          <h1 className="text-xl font-bold text-foreground">Welcome to Midnight Academy</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Choose your workspace.</p>

          <div className="mt-6 grid gap-3">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                  role === r.id
                    ? "border-primary/60 bg-primary/8"
                    : "border-border bg-surface-2/50 hover:border-border-strong",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-8 place-items-center rounded-lg",
                    role === r.id ? "bg-primary/15 text-primary" : "bg-surface text-muted-foreground",
                  )}
                >
                  <r.icon className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{r.title}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                    {r.body}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@university.edu" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" required />
            </div>
            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <Checkbox id="remember" defaultChecked /> Remember me
                </label>
                <a href="#reset" className="text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {isLogin ? "Continue" : "Sign Up"}
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              size="lg" 
              onClick={handleGoogleLogin}
            >
              <svg className="mr-2 size-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Have a test code instead?{" "}
          <Link to="/test" className="text-primary hover:underline">
            Enter your test
          </Link>
        </p>
      </div>
    </main>
  );
}

