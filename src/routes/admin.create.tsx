import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, FileText, FileType2, Loader2, PencilLine, Trash2 } from "lucide-react";
import { PageShell, Panel, SectionHeading, Tag } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, testQuestions, questionBank } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/create")({
  head: () => ({
    meta: [
      { title: "Create Test — Midnight Academy Admin" },
      {
        name: "description",
        content:
          "Define a test, import questions from PDF or TXT, review AI-detected concepts and constraints, then publish a test code.",
      },
      { property: "og:title", content: "Create Test — Midnight Academy Admin" },
      {
        property: "og:description",
        content: "A guided flow from test details to a shareable test code.",
      },
    ],
  }),
  component: CreateTest,
});

const uploadStages = [
  "Extracting content",
  "Detecting questions",
  "Identifying concepts",
  "Detecting constraints",
  "Preparing reference answers",
];

const steps = ["Test Details", "Question Source", "Review Questions", "Publish"];

function CreateTest() {
  const [step, setStep] = useState(0);

  return (
    <PageShell className="max-w-[1000px]">
      <SectionHeading title="Create Test" subtitle="Four steps from a blank test to a shareable code." />
      <ol className="mb-8 flex flex-wrap gap-2">
        {steps.map((s, i) => (
          <li
            key={s}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold",
              i === step
                ? "border-primary/55 bg-primary/10 text-primary"
                : i < step
                  ? "border-success/40 bg-success/8 text-success"
                  : "border-border text-muted-foreground",
            )}
          >
            {i < step ? <Check className="size-3.5" /> : <span>{i + 1}</span>} {s}
          </li>
        ))}
      </ol>

      {step === 0 ? <Details onNext={() => setStep(1)} /> : null}
      {step === 1 ? <Source onNext={() => setStep(2)} /> : null}
      {step === 2 ? <Review onNext={() => setStep(3)} /> : null}
      {step === 3 ? <Publish /> : null}
    </PageShell>
  );
}

function Details({ onNext }: { onNext: () => void }) {
  return (
    <Panel>
      <h2 className="text-base font-semibold text-foreground">Test Details</h2>
      <form
        className="mt-5 grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
      >
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="tname">Test name</Label>
          <Input id="tname" placeholder="Arrays & Two Pointers — Comprehension" required />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select defaultValue="DSA">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Select defaultValue="Medium">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Easy", "Medium", "Hard"].map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="qcount">Number of questions</Label>
          <Input id="qcount" type="number" defaultValue={10} min={1} max={50} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="qtime">Time per question (seconds)</Label>
          <Input id="qtime" type="number" defaultValue={45} min={10} max={300} />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" size="lg">
            Continue
          </Button>
        </div>
      </form>
    </Panel>
  );
}

function Source({ onNext }: { onNext: () => void }) {
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!processing) return;
    if (stage >= uploadStages.length) {
      const t = setTimeout(onNext, 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStage((s) => s + 1), 800);
    return () => clearTimeout(t);
  }, [processing, stage, onNext]);

  if (processing) {
    return (
      <Panel>
        <div className="flex items-center gap-3">
          <Loader2 className="size-5 animate-spin text-primary" />
          <h2 className="text-base font-semibold text-foreground">Analyzing your questions...</h2>
        </div>
        <ul className="mt-6 space-y-3">
          {uploadStages.map((label, i) => (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full border text-[10px]",
                  i < stage
                    ? "border-success/45 bg-success/12 text-success"
                    : i === stage
                      ? "border-primary/50 bg-primary/12 text-primary"
                      : "border-border text-muted-foreground",
                )}
              >
                {i < stage ? <Check className="size-3" /> : i + 1}
              </span>
              <span className={i <= stage ? "text-foreground" : "text-muted-foreground"}>{label}</span>
            </li>
          ))}
        </ul>
      </Panel>
    );
  }

  return (
    <Panel>
      <h2 className="text-base font-semibold text-foreground">Add Questions</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Import a question paper and let AI detect concepts, constraints and reference answers.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          { icon: FileText, title: "Upload PDF", body: "Import questions from a PDF" },
          { icon: FileType2, title: "Upload TXT", body: "Import questions from a text file" },
        ].map((o) => (
          <button
            key={o.title}
            type="button"
            onClick={() => setProcessing(true)}
            className="rounded-xl border border-dashed border-border-strong bg-surface-2/40 p-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/6"
          >
            <o.icon className="mx-auto size-6 text-primary" />
            <span className="mt-4 block text-sm font-semibold text-foreground">{o.title}</span>
            <span className="mt-1 block text-xs text-muted-foreground">{o.body}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onNext}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border p-4 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <PencilLine className="size-4" /> Create Manually
      </button>
      <p className="mt-4 text-xs text-muted-foreground">
        Or reuse approved questions from the{" "}
        <Link to="/admin/question-bank" className="text-primary hover:underline">
          question bank
        </Link>{" "}
        ({questionBank.length} available).
      </p>
    </Panel>
  );
}

function Review({ onNext }: { onNext: () => void }) {
  const [approved, setApproved] = useState<string[]>([]);
  const [deleted, setDeleted] = useState<string[]>([]);
  const visible = testQuestions.filter((q) => !deleted.includes(q.id));

  return (
    <>
      <Panel className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Review Questions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {approved.length} / {visible.length} Questions Approved — nothing is published until you
            approve it.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setApproved(visible.map((q) => q.id))}>
            Approve All
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setApproved([])}>
            Reset approvals
          </Button>
        </div>
      </Panel>

      <div className="space-y-5">
        {visible.map((q, i) => {
          const isApproved = approved.includes(q.id);
          return (
            <Panel key={q.id} className={isApproved ? "border-success/35" : undefined}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  Question {String(i + 1).padStart(2, "0")}
                </span>
                <Tag tone="primary">{q.category}</Tag>
                <Tag>{q.topic}</Tag>
                <Tag tone="violet">{q.difficulty}</Tag>
                {isApproved ? <Tag tone="success">Approved</Tag> : null}
              </div>
              <Textarea defaultValue={q.text} className="mt-4 min-h-[110px] text-sm" />
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Expected concepts
                  </Label>
                  <Textarea defaultValue={q.concepts.join("\n")} className="mt-2 min-h-[90px] text-sm" />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Important constraints
                  </Label>
                  <Textarea
                    defaultValue={q.constraints.join("\n")}
                    className="mt-2 min-h-[90px] text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Actual answer
                  </Label>
                  <Textarea defaultValue={q.answer} className="mt-2 min-h-[90px] text-sm" />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => toast.success("Changes saved")}>
                  <PencilLine className="size-4" /> Edit
                </Button>
                <Button
                  size="sm"
                  disabled={isApproved}
                  onClick={() => setApproved((a) => [...a, q.id])}
                >
                  <Check className="size-4" /> Approve
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleted((d) => [...d, q.id])}
                  className="text-destructive"
                >
                  <Trash2 className="size-4" /> Delete
                </Button>
              </div>
            </Panel>
          );
        })}
      </div>

      <Button
        size="lg"
        className="mt-6"
        disabled={approved.length === 0}
        onClick={onNext}
      >
        Continue
      </Button>
    </>
  );
}

function Publish() {
  const [published, setPublished] = useState(false);
  const [copied, setCopied] = useState(false);
  const code = "DSA-X7K29";

  if (published) {
    return (
      <Panel className="grid-backdrop p-10 text-center">
        <Check className="mx-auto size-7 text-success" />
        <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-foreground">Test Published</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Share this code with students to let them join the test.
        </p>
        <p className="mt-8 font-mono text-4xl font-extrabold tracking-[0.18em] text-gradient">{code}</p>
        <Button
          size="lg"
          className="mx-auto mt-8"
          onClick={() => {
            navigator.clipboard?.writeText(code);
            setCopied(true);
            toast.success("Test code copied");
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied!" : "Copy Test Code"}
        </Button>
        <div className="mt-6">
          <Button asChild variant="ghost">
            <Link to="/admin/tests">Go to tests</Link>
          </Button>
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <h2 className="text-base font-semibold text-foreground">Publish Test</h2>
      <dl className="mt-5 divide-y divide-border text-sm">
        {[
          ["Test Name", "Arrays & Two Pointers — Comprehension"],
          ["Questions", "3 approved"],
          ["Category", "DSA"],
          ["Difficulty", "Medium"],
          ["Time per question", "45 seconds"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-6 py-3">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-semibold text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
      <Button size="lg" className="mt-6" onClick={() => setPublished(true)}>
        Publish Test
      </Button>
    </Panel>
  );
}
