import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  FileCheck,
  Globe,
  Headphones,
  Mic,
  PenTool,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { Logo, Wordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/app-nav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Midnight Academy — Standardized Academic English Assessment" },
      {
        name: "description",
        content:
          "Master standardized English proficiency with multistage adaptive mocks, deterministic answer analytics, and rubric-calibrated AI speaking & writing evaluations.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppNav />

      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-border py-20 px-6 lg:py-28">
        <div className="mx-auto max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-wider">
            <Sparkles className="size-3.5" /> Multistage Adaptive Examination Architecture
          </div>

          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Prepare with Precision. <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Target Your Dream Band.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed">
            Experience complete full-length adaptive mocks across Reading, Listening, Writing, and
            Speaking with instant deterministic scoring, rubric-calibrated AI evaluation, and
            actionable weakness diagnostics.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              asChild
              size="lg"
              className="font-bold text-sm px-8 shadow-xl shadow-primary/20"
            >
              <Link to="/test">
                <Play className="size-4 mr-2 fill-current" /> Start Assessment
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-bold text-sm">
              <Link to="/dashboard">
                Go to Student Dashboard <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* 4 Skill Cards */}
      <section className="py-20 px-6 bg-surface-2/20">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              Comprehensive 4-Section Preparation
            </h2>
            <p className="text-xs text-muted-foreground">
              Every task type modeled strictly on official 2026 ETS benchmarks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-3 shadow-md">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                📖
              </div>
              <h3 className="text-base font-bold text-foreground">Reading</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Adaptive cloze passages, daily life practical comprehension, and academic synthesis
                questions with distractor rationales.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-3 shadow-md">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                🎧
              </div>
              <h3 className="text-base font-bold text-foreground">Listening</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Audio-first campus conversations, institutional announcements, and academic lectures
                with sealed active transcripts.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-3 shadow-md">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                ✍️
              </div>
              <h3 className="text-base font-bold text-foreground">Writing</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Deterministic syntax ordering, email register fulfillment, and academic discussion
                contributions evaluated via versioned rubrics.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-3 shadow-md">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                🎙️
              </div>
              <h3 className="text-base font-bold text-foreground">Speaking</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Real-time microphone recording, repetition fluency, and spoken interview evaluation
                across 5 traits with coaching feedback.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
