import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  EyeOff,
  FileSearch,
  Gauge,
  LineChart,
  ShieldCheck,
  Sparkles,
  Timer,
} from "lucide-react";
import { Logo, Wordmark } from "@/components/brand";
import { ComprehensionBreakdown } from "@/components/comprehension";
import { Panel, Tag } from "@/components/kit";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CATEGORIES, studentAxes } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Midnight Academy — Don't Solve Yet. Understand First." },
      {
        name: "description",
        content:
          "Read, recall and express technical passages under exam conditions — AI-evaluated comprehension practice for B.Tech students of SRKR Engineering College, Bhimavaram.",
      },
      { property: "og:title", content: "Midnight Academy — Don't Solve Yet. Understand First." },
      {
        property: "og:description",
        content:
          "AI-powered technical question comprehension training. Read, understand, explain, improve.",
      },
    ],
  }),
  component: Landing,
});

const steps = [
  {
    n: "01",
    title: "Read",
    body: "A question appears for a limited time. Your only job is to understand it.",
    icon: Timer,
  },
  {
    n: "02",
    title: "Explain",
    body: "The question disappears. You describe what it asked, in your own words.",
    icon: Brain,
  },
  {
    n: "03",
    title: "Evaluate",
    body: "AI compares your interpretation against the objective, constraints and concepts.",
    icon: Gauge,
  },
  {
    n: "04",
    title: "Improve",
    body: "You get a comprehension score, what you missed, and where to drill next.",
    icon: LineChart,
  },
];

const pipeline = ["Question", "Think", "Explain", "AI Evaluation", "Improve"];

function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 lg:px-8">
        <Link to="/">
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            How It Works
          </a>
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#about" className="transition-colors hover:text-foreground">
            About
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth" search={{ tab: "login" }}>
              Login
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/auth" search={{ tab: "signup" }}>
              Get Started
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Landing() {
  return (
    <div className="min-h-screen">
      <TopNav />

      {/* Hero */}
      <section className="grid-backdrop border-b border-border">
        <div className="mx-auto grid max-w-[1400px] gap-14 px-5 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:items-center lg:px-8 lg:py-28">
          <div className="animate-fade-up">
            <Tag tone="primary">
              Read · Recall · Express — Placement Readiness for SRKR Engineering College
            </Tag>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Don't Solve Yet.
              <br />
              <span className="text-gradient">Understand First.</span>
            </h1>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-4 py-1.5 text-sm font-semibold text-primary">
              SRKR Engineering College · Bhimavaram
            </p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg">
              Built for B.Tech students of SRKR Engineering College, Bhimavaram. Read a technical
              passage under a strict timer, rewrite it from memory, and get AI feedback on how well
              you grasped the objective, absorbed the details, recalled the facts and expressed it
              in your own words — the reading skills placement tests look for.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth" search={{ tab: "signup" }}>
                  Start Learning <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>
            <p className="mt-8 text-xs text-muted-foreground">
              Built for DSA · Aptitude · DBMS · OS · Networks · OOP · Programming
            </p>
          </div>

          {/* Product-style pipeline visual */}
          <div className="panel glow-ring relative overflow-hidden p-6 lg:p-7">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Comprehension loop
              </span>
              <Logo className="size-7" />
            </div>
            <ol className="mt-6 space-y-3">
              {pipeline.map((label, i) => (
                <li
                  key={label}
                  className="animate-fade-up flex items-center gap-4 rounded-xl border border-border bg-surface-2/70 px-4 py-3.5"
                  style={{ animationDelay: `${i * 110}ms` }}
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/12 text-[11px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">{label}</span>
                  <span className="ml-auto h-1 w-16 overflow-hidden rounded-full bg-surface sm:w-24">
                    <span
                      className="animate-pulse-soft block h-full rounded-full bg-linear-to-r from-primary to-violet"
                      style={{
                        width: `${[100, 82, 68, 90, 74][i]}%`,
                        animationDelay: `${i * 260}ms`,
                      }}
                    />
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/8 px-4 py-3">
              <EyeOff className="size-4 shrink-0 text-primary" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                The question is hidden the moment your reading time ends — you explain from
                understanding, not from re-reading.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section id="features" className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-5 py-20 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-foreground lg:text-3xl">
              Why Question Understanding Matters
            </h2>
            <p className="mt-4 text-muted-foreground">
              Most students don't lose marks because they don't know the concept. They lose marks
              because they answered a slightly different question than the one on the page.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Misread requirements", "The goal was subtly different from what was solved."],
              [
                "Ignored constraints",
                "Time, space and input bounds decide which approach is valid.",
              ],
              ["Unfamiliar terminology", "One unread technical term changes the entire problem."],
              ["Input/output expectations", "Wrong format, wrong indexing, wrong return type."],
              ["Missed edge conditions", "The single case the question was really testing."],
              ["Assumed the pattern", "Recognised a familiar shape and stopped reading."],
            ].map(([title, body]) => (
              <div key={title} className="panel-quiet p-5">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-b border-border bg-surface/40">
        <div className="mx-auto max-w-[1400px] px-5 py-20 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground lg:text-3xl">
            How Midnight Academy Works
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="panel p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-[0.2em] text-primary">{s.n}</span>
                  <s.icon className="size-4 text-muted-foreground" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for technical thinking */}
      <section id="about" className="border-b border-border">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground lg:text-3xl">
              Built for Technical Thinking
            </h2>
            <p className="mt-4 max-w-lg text-muted-foreground">
              Midnight Academy is not an English platform and not a quiz app. Every question is a
              real technical problem statement, and every evaluation is about interpretation — never
              about grammar.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <span
                  key={c}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          <Panel>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Your Thinking. Measured.
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Five axes, tracked on every attempt.
                </p>
              </div>
              <Sparkles className="size-4 text-violet" />
            </div>
            <div className="mt-6">
              <ComprehensionBreakdown axes={studentAxes} variant="bars" />
            </div>
          </Panel>
        </div>
      </section>

      {/* Integrity FAQ */}
      <section className="border-b border-border bg-surface/40">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-20 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:px-8">
          <div>
            <ShieldCheck className="size-5 text-success" />
            <h2 className="mt-4 text-2xl font-bold text-foreground lg:text-3xl">
              Is this cheating-proof?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Instructors ask this first. The mechanic itself is the safeguard — there is no answer
              to look up, because the student is graded on their own interpretation.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {(
              [
                [
                  "Can a student just copy the question elsewhere?",
                  "Copy and text selection are disabled on the live question, and the question is removed from the DOM the instant reading time ends — it is never present while the student writes.",
                ],
                [
                  "What stops a second attempt with the same code?",
                  "A test code is one attempt per student. Reusing a completed code routes the student to their existing result instead of a new attempt.",
                ],
                [
                  "Can an AI assistant write the explanation?",
                  "There is no correct text to generate — the score reflects whether the student's own restatement matched the objective, constraints and concepts of a question the assistant never saw.",
                ],
                [
                  "Do you monitor the student?",
                  "No camera, no keystroke surveillance. Tab-switching and window blur during the reading stage are logged quietly for the instructor's integrity view, and never shown to shame the student.",
                ],
                [
                  "What if the AI scores a student unfairly?",
                  "Students can flag any evaluation. Flags land in an instructor review queue where the score can be confirmed or overridden with a note.",
                ],
              ] as [string, string][]
            ).map(([q, a]) => (
              <AccordionItem key={q} value={q}>
                <AccordionTrigger className="text-left text-sm font-semibold">{q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="grid-backdrop border-b border-border">
        <div className="mx-auto max-w-[1400px] px-5 py-24 text-center lg:px-8">
          <FileSearch className="mx-auto size-6 text-primary" />
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">
            Train Your Understanding.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Ten minutes a day changes how you read a problem statement for the rest of your career.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth">
                Start Learning <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/test">I have a test code</Link>
            </Button>
          </div>
          <ul className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            {[
              "No setup required",
              "Works for any technical subject",
              "Instructor dashboards included",
            ].map((i) => (
              <li key={i} className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-success" /> {i}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="mx-auto max-w-[1400px] px-5 py-12 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <Wordmark />
            <p className="mt-3 text-sm text-muted-foreground">
              Read. Understand. Explain. Improve.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground">
              How It Works
            </a>
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#about" className="hover:text-foreground">
              About
            </a>
            <Link to="/auth" className="hover:text-foreground">
              Login
            </Link>
            <Link to="/admin" className="hover:text-foreground">
              For Instructors
            </Link>
          </nav>
        </div>
        <p className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          © 2026 Midnight Academy. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
