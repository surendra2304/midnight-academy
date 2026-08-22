import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  Copy,
  FileText,
  FileType2,
  Loader2,
  PencilLine,
  Trash2,
} from "lucide-react";
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
import { CATEGORIES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { draftTest, publishTest, saveQuestions } from "@/lib/admin.functions";

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

type QuestionDraft = {
  id: string;
  position: number;
  text: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  concepts: string[];
  constraints: string[];
  referenceAnswer: string;
  approved: boolean;
};

type TestConfig = {
  name: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  secondsPerQuestion: number;
  responseSeconds: number;
  testId?: string;
  code?: string;
};

const steps = ["Test Details", "Question Source", "Review Questions", "Publish"];

function CreateTest() {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<TestConfig>({
    name: "Arrays & Technical Comprehension",
    category: "DSA",
    difficulty: "Medium",
    secondsPerQuestion: 25,
    responseSeconds: 90,
  });
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);

  return (
    <PageShell className="max-w-[1000px]">
      <SectionHeading
        title="Create Test"
        subtitle="TCS NQT Passage Recall format — students read each passage briefly, then rewrite it from memory."
      />
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

      {step === 0 ? (
        <Details
          initial={config}
          onNext={(newConfig) => {
            setConfig((prev) => ({ ...prev, ...newConfig }));
            setStep(1);
          }}
        />
      ) : null}
      {step === 1 ? (
        <Source
          config={config}
          onDrafted={(testId, draftedQuestions) => {
            setConfig((prev) => ({ ...prev, testId }));
            setQuestions(draftedQuestions);
            setStep(2);
          }}
        />
      ) : null}
      {step === 2 ? (
        <Review
          testId={config.testId!}
          questions={questions}
          onQuestionsUpdated={(updated) => setQuestions(updated)}
          onNext={() => setStep(3)}
        />
      ) : null}
      {step === 3 ? (
        <Publish
          config={config}
          approvedCount={questions.filter((q) => q.approved).length}
          onPublished={(code) => setConfig((prev) => ({ ...prev, code }))}
        />
      ) : null}
    </PageShell>
  );
}

function Details({
  initial,
  onNext,
}: {
  initial: TestConfig;
  onNext: (config: Partial<TestConfig>) => void;
}) {
  const [name, setName] = useState(initial.name);
  const [category, setCategory] = useState(initial.category);
  const [difficulty, setDifficulty] = useState(initial.difficulty);
  const [time, setTime] = useState(initial.secondsPerQuestion);

  return (
    <Panel>
      <h2 className="text-base font-semibold text-foreground">Test Details</h2>
      <form
        className="mt-5 grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          onNext({
            name,
            category,
            difficulty,
            secondsPerQuestion: time,
          });
        }}
      >
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="tname">Test name</Label>
          <Input
            id="tname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Arrays & Two Pointers — Comprehension"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
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
          <Select
            value={difficulty}
            onValueChange={(val) => setDifficulty(val as "Easy" | "Medium" | "Hard")}
          >
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
          <Label htmlFor="qtime">Reading time per passage (seconds)</Label>
          <Input
            id="qtime"
            type="number"
            value={time}
            onChange={(e) => setTime(Number(e.target.value))}
            min={15}
            max={300}
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" size="lg" disabled={!name.trim()}>
            Next
          </Button>
        </div>
      </form>
    </Panel>
  );
}

function Source({
  config,
  onDrafted,
}: {
  config: TestConfig;
  onDrafted: (testId: string, questions: QuestionDraft[]) => void;
}) {
  const [sourceText, setSourceText] = useState("");
  const [drafting, setDrafting] = useState(false);

  const handleDraft = async (rawContent: string, useAi = true) => {
    if (rawContent.trim().length < 20) {
      toast.error("Please paste at least one full question statement.");
      return;
    }

    setDrafting(true);
    try {
      const res = await draftTest({
        data: {
          name: config.name,
          category: config.category,
          difficulty: config.difficulty,
          secondsPerQuestion: config.secondsPerQuestion,
          responseSeconds: config.responseSeconds,
          source: rawContent,
          useAi,
        },
      });

      const formatted: QuestionDraft[] = (res.questions || []).map((q, i) => ({
        id: q.id,
        position: q.position ?? i,
        text: q.text,
        topic: q.topic,
        difficulty: (q.difficulty as "Easy" | "Medium" | "Hard") || "Medium",
        concepts: q.concepts || [],
        constraints: q.constraints || [],
        referenceAnswer: q.reference_answer || "",
        approved: false,
      }));

      onDrafted(res.testId, formatted);
      toast.success(
        useAi
          ? `Successfully drafted ${res.count} questions`
          : `Created ${res.count} questions — review and fill in details`,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to draft questions";
      toast.error(message);
    } finally {
      setDrafting(false);
    }
  };

  if (drafting) {
    return (
      <Panel>
        <div className="flex items-center gap-3">
          <Loader2 className="size-5 animate-spin text-primary" />
          <h2 className="text-base font-semibold text-foreground">AI Drafting Questions...</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Analyzing problem statements, detecting explicit constraints, underlying concepts, and
          generating instructor reference answers.
        </p>
      </Panel>
    );
  }

  return (
    <Panel>
      <h2 className="text-base font-semibold text-foreground">Add Questions</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Paste your technical question statements below, then continue. AI will draft concepts,
        constraints, and reference answers automatically — or skip AI and fill them in yourself on
        the next step.
      </p>

      <div className="mt-6 space-y-4">
        <Textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder={`1. Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume each input would have exactly one solution.\n\n2. Given an integer array nums, find a subarray that has the largest product, and return the product. The test cases are generated so that the answer will fit in a 32-bit integer.`}
          className="min-h-[220px] font-mono text-sm leading-relaxed"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            onClick={() => handleDraft(sourceText, true)}
            disabled={sourceText.trim().length < 20 || drafting}
          >
            Draft with AI & Continue <ArrowRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleDraft(sourceText, false)}
            disabled={sourceText.trim().length < 20 || drafting}
          >
            Continue Without AI <ArrowRight className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => {
              const sample =
                "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nGiven the head of a singly linked list, reverse the list, and return the reversed list.";
              setSourceText(sample);
            }}
          >
            Load Sample Questions
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Tip: separate each question with a blank line. AI drafting usually takes a few seconds; if
          it is unavailable, "Continue Without AI" always works.
        </p>
      </div>
    </Panel>
  );
}

function Review({
  testId,
  questions,
  onQuestionsUpdated,
  onNext,
}: {
  testId: string;
  questions: QuestionDraft[];
  onQuestionsUpdated: (updated: QuestionDraft[]) => void;
  onNext: () => void;
}) {
  const [saving, setSaving] = useState(false);

  const handleToggleApprove = (id: string) => {
    const updated = questions.map((q) => (q.id === id ? { ...q, approved: !q.approved } : q));
    onQuestionsUpdated(updated);
  };

  const handleApproveAll = () => {
    const updated = questions.map((q) => ({ ...q, approved: true }));
    onQuestionsUpdated(updated);
  };

  const handleSaveAndContinue = async () => {
    setSaving(true);
    try {
      await saveQuestions({
        data: {
          testId,
          questions: questions.map((q) => ({
            id: q.id,
            text: q.text,
            topic: q.topic,
            difficulty: q.difficulty,
            concepts: q.concepts,
            constraints: q.constraints,
            referenceAnswer: q.referenceAnswer,
            approved: q.approved,
          })),
        },
      });

      toast.success("Questions approved and saved");
      onNext();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save questions";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const approvedCount = questions.filter((q) => q.approved).length;

  return (
    <>
      <Panel className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Review Questions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {approvedCount} / {questions.length} Questions Approved — nothing is published until you
            approve it.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleApproveAll}>
            Approve All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onQuestionsUpdated(questions.map((q) => ({ ...q, approved: false })))}
          >
            Reset approvals
          </Button>
        </div>
      </Panel>

      <div className="space-y-5">
        {questions.map((q, i) => (
          <Panel key={q.id} className={q.approved ? "border-success/35" : undefined}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-foreground">
                Question {String(i + 1).padStart(2, "0")}
              </span>
              <Tag tone="primary">{q.topic || "General"}</Tag>
              <Tag tone="violet">{q.difficulty}</Tag>
              {q.approved ? <Tag tone="success">Approved</Tag> : null}
            </div>

            <Textarea
              value={q.text}
              onChange={(e) => {
                const text = e.target.value;
                onQuestionsUpdated(
                  questions.map((item) => (item.id === q.id ? { ...item, text } : item)),
                );
              }}
              className="mt-4 min-h-[110px] text-sm"
            />

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Expected concepts (one per line)
                </Label>
                <Textarea
                  value={q.concepts.join("\n")}
                  onChange={(e) => {
                    const concepts = e.target.value.split("\n").filter(Boolean);
                    onQuestionsUpdated(
                      questions.map((item) => (item.id === q.id ? { ...item, concepts } : item)),
                    );
                  }}
                  className="mt-2 min-h-[90px] text-sm"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Important constraints (one per line)
                </Label>
                <Textarea
                  value={q.constraints.join("\n")}
                  onChange={(e) => {
                    const constraints = e.target.value.split("\n").filter(Boolean);
                    onQuestionsUpdated(
                      questions.map((item) => (item.id === q.id ? { ...item, constraints } : item)),
                    );
                  }}
                  className="mt-2 min-h-[90px] text-sm"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Reference understanding
                </Label>
                <Textarea
                  value={q.referenceAnswer}
                  onChange={(e) => {
                    const referenceAnswer = e.target.value;
                    onQuestionsUpdated(
                      questions.map((item) =>
                        item.id === q.id ? { ...item, referenceAnswer } : item,
                      ),
                    );
                  }}
                  className="mt-2 min-h-[90px] text-sm"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={q.approved ? "outline" : "default"}
                onClick={() => handleToggleApprove(q.id)}
              >
                <Check className="size-4" /> {q.approved ? "Approved" : "Approve"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onQuestionsUpdated(questions.filter((item) => item.id !== q.id))}
                className="text-destructive"
              >
                <Trash2 className="size-4" /> Delete
              </Button>
            </div>
          </Panel>
        ))}
      </div>

      <Button
        size="lg"
        className="mt-6"
        disabled={approvedCount === 0 || saving}
        onClick={handleSaveAndContinue}
      >
        {saving ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" /> Saving...
          </>
        ) : (
          `Next (${approvedCount} Approved)`
        )}
      </Button>
    </>
  );
}

function Publish({
  config,
  approvedCount,
  onPublished,
}: {
  config: TestConfig;
  approvedCount: number;
  onPublished: (code: string) => void;
}) {
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePublish = async () => {
    if (!config.testId) return;
    setPublishing(true);
    try {
      const res = await publishTest({ data: { testId: config.testId } });
      onPublished(res.code);
      toast.success("Test published successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to publish test";
      toast.error(message);
    } finally {
      setPublishing(false);
    }
  };

  if (config.code) {
    return (
      <Panel className="grid-backdrop p-10 text-center">
        <Check className="mx-auto size-7 text-success" />
        <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-foreground">
          Test Published
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Share this code with students to let them join the test.
        </p>
        <p className="mt-8 font-mono text-4xl font-extrabold tracking-[0.18em] text-gradient">
          {config.code}
        </p>
        <Button
          size="lg"
          className="mx-auto mt-8"
          onClick={() => {
            navigator.clipboard?.writeText(config.code!);
            setCopied(true);
            toast.success("Test code copied to clipboard");
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
          ["Test Name", config.name],
          ["Questions", `${approvedCount} approved`],
          ["Category", config.category],
          ["Difficulty", config.difficulty],
          ["Reading time", `${config.secondsPerQuestion} seconds`],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-6 py-3">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-semibold text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
      <Button
        size="lg"
        className="mt-6"
        onClick={handlePublish}
        disabled={publishing || approvedCount === 0}
      >
        {publishing ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" /> Publishing...
          </>
        ) : (
          "Publish Test & Generate Code"
        )}
      </Button>
    </Panel>
  );
}
