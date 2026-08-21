import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, Mail, RefreshCw } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { requireUnauth } from "@/lib/auth-guard";
import {
  completeRegistrationWithPassword,
  requestRegistrationOtp,
  verifyRegistrationOtp,
} from "@/lib/auth.functions";

export const Route = createFileRoute("/auth")({
  beforeLoad: ({ location }) => requireUnauth({ location }),
  head: () => ({
    meta: [
      { title: "Sign in — Midnight Academy" },
      {
        name: "description",
        content: "Sign in to Midnight Academy to access technical comprehension training.",
      },
      { property: "og:title", content: "Sign in — Midnight Academy" },
      {
        property: "og:description",
        content: "Access technical comprehension training.",
      },
    ],
  }),
  component: AuthPage,
});

type SignupStep = "email" | "otp" | "password" | "done";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Signup multi-step states
  const [signupStep, setSignupStep] = useState<SignupStep>("email");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupOtp, setSignupOtp] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState("");
  const [signupRole, setSignupRole] = useState<"student" | "admin">("student");
  const [fullName, setFullName] = useState("");
  const [studyYear, setStudyYear] = useState("");
  const [branch, setBranch] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();
  const { login, signInWithGoogle } = useAuth();

  // Cooldown countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Handle Login form
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await login({ email, password });
      const returnedRole = res?.user?.role;
      if (returnedRole === "ADMIN") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!signupEmail.trim()) return;

    setLoading(true);
    try {
      const res = await requestRegistrationOtp({ data: { email: signupEmail.trim() } });

      if ("error" in res) {
        toast.error(res.message);
        return;
      }

      toast.success("Verification code sent! Check your inbox.");
      setSignupStep("otp");
      setResendCooldown(res.resendInSeconds || 60);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send verification code";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (signupOtp.trim().length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyRegistrationOtp({
        data: {
          email: signupEmail.trim(),
          otp: signupOtp.trim(),
        },
      });

      if ("error" in res) {
        toast.error(res.message);
        return;
      }

      setVerificationToken(res.verificationToken);
      setSignupStep("password");
      toast.success("Email verified successfully! Now create your password.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set Password & Create Account
  const handleCreatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (signupPassword !== signupPasswordConfirm) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    setLoading(true);
    try {
      await completeRegistrationWithPassword({
        data: {
          email: signupEmail.trim(),
          verificationToken,
          password: signupPassword,
          fullName: fullName.trim(),
          role: signupRole,
          year: studyYear || undefined,
          branch: branch || undefined,
        },
      });

      // Automatically sign in the user
      await login({ email: signupEmail.trim(), password: signupPassword });
      toast.success("Account created successfully!");

      if (signupRole === "admin") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create account";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google login failed";
      toast.error(message);
    }
  };

  return (
    <main className="grid-backdrop flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Wordmark />
        </div>

        <div className="panel mt-8 p-6 lg:p-8">
          <h1 className="text-xl font-bold text-foreground">Welcome to Midnight Academy</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {isLogin
              ? "Sign in to access your technical training."
              : signupStep === "email"
                ? "Create a new verified account."
                : signupStep === "otp"
                  ? "Enter the verification code sent to your email."
                  : "Create a secure password."}
          </p>

          {/* 1. Login View */}
          {isLogin ? (
            <form className="mt-6 space-y-4" onSubmit={handleLogin}>
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="you@university.edu"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <Checkbox id="remember" defaultChecked /> Remember me
                </label>
                <a href="#reset" className="text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Signing in..." : "Continue"}
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
          ) : (
            /* 2. Signup Multi-Step OTP Flow */
            <div className="mt-6">
              {signupStep === "email" && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label>I am a</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(
                        [
                          {
                            value: "student",
                            title: "Student",
                            desc: "Take tests and get AI feedback",
                          },
                          {
                            value: "admin",
                            title: "Teacher",
                            desc: "Create tests and review students",
                          },
                        ] as const
                      ).map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setSignupRole(r.value)}
                          className={cn(
                            "rounded-lg border p-3 text-left transition-colors",
                            signupRole === r.value
                              ? "border-primary/60 bg-primary/10"
                              : "border-border hover:border-border-strong",
                          )}
                        >
                          <span className="block text-sm font-semibold text-foreground">
                            {r.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {r.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Enter your Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@university.edu"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                      We will send a 6-digit verification code to confirm your email.
                    </p>
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? "Sending code..." : "Send Verification Code"}
                  </Button>
                </form>
              )}

              {signupStep === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="rounded-lg border border-border bg-surface-2/40 p-3 text-sm">
                    <span className="text-muted-foreground">Code sent to: </span>
                    <strong className="text-foreground">{signupEmail}</strong>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-otp">6-Digit Verification Code</Label>
                    <Input
                      id="signup-otp"
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={signupOtp}
                      onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, ""))}
                      className="text-center font-mono text-2xl tracking-[0.3em]"
                      required
                      autoFocus
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading || signupOtp.length !== 6}
                  >
                    {loading ? "Verifying..." : "Verify Code"}
                  </Button>

                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setSignupStep("email")}
                      className="inline-flex items-center text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="mr-1 size-3" /> Change email
                    </button>

                    <button
                      type="button"
                      disabled={resendCooldown > 0 || loading}
                      onClick={() =>
                        requestRegistrationOtp({ data: { email: signupEmail.trim() } })
                          .then((r) => {
                            if ("error" in r) {
                              toast.error(r.message);
                            } else {
                              toast.success("New code sent!");
                              setResendCooldown(r.resendInSeconds || 60);
                            }
                          })
                          .catch(() => toast.error("Could not resend code"))
                      }
                      className="inline-flex items-center text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                    >
                      <RefreshCw className="mr-1 size-3" />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                    </button>
                  </div>
                </form>
              )}

              {signupStep === "password" && (
                <form onSubmit={handleCreatePassword} className="space-y-4">
                  <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-xs text-primary">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>Email verified! Tell us about you and choose a password.</span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input
                      id="full-name"
                      type="text"
                      placeholder="e.g. Surendra Kumar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  {signupRole === "student" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="study-year">B.Tech Year</Label>
                        <Select value={studyYear} onValueChange={setStudyYear}>
                          <SelectTrigger id="study-year">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            {["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduated"].map(
                              (y) => (
                                <SelectItem key={y} value={y}>
                                  {y}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="branch">Branch</Label>
                        <Select value={branch} onValueChange={setBranch}>
                          <SelectTrigger id="branch">
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "CSE",
                              "IT",
                              "ECE",
                              "EEE",
                              "Mechanical",
                              "Civil",
                              "AI & ML",
                              "Other",
                            ].map((b) => (
                              <SelectItem key={b} value={b}>
                                {b}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="create-password">Create Password</Label>
                    <Input
                      id="create-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPasswordConfirm}
                      onChange={(e) => setSignupPasswordConfirm(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading || signupPassword.length < 6 || !fullName.trim()}
                  >
                    {loading ? "Creating Account..." : "Create Account & Sign In"}
                  </Button>
                </form>
              )}
            </div>
          )}

          <div className="mt-6 text-center text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setSignupStep("email");
                setSignupOtp("");
                setSignupPassword("");
                setSignupPasswordConfirm("");
              }}
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
