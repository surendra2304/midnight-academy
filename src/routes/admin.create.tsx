import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  FileText,
  FileType2,
  Loader2,
  PencilLine,
  Plus,
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
        subtitle="Read-and-recall format — students read each passage briefly, then rewrite it from memory."
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

      {/* Steps stay mounted (hidden when inactive) so going back never loses state */}
      <div hidden={step !== 0}>
        <Details
          initial={config}
          onNext={(newConfig) => {
            setConfig((prev) => ({ ...prev, ...newConfig }));
            setStep(1);
          }}
        />
      </div>
      <div hidden={step !== 1}>
        <Source
          config={config}
          onBack={() => setStep(0)}
          onDrafted={(testId, draftedQuestions) => {
            setConfig((prev) => ({ ...prev, testId }));
            setQuestions(draftedQuestions);
            setStep(2);
          }}
        />
      </div>
      <div hidden={step !== 2}>
        <Review
          testId={config.testId ?? ""}
          questions={questions}
          onQuestionsUpdated={(updated) => setQuestions(updated)}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      </div>
      {step === 3 ? (
        <Publish
          config={config}
          approvedCount={questions.filter((q) => q.approved).length}
          onBack={() => setStep(2)}
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
  const [readingTime, setReadingTime] = useState(initial.secondsPerQuestion);
  const [responseTime, setResponseTime] = useState(initial.responseSeconds);

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
            secondsPerQuestion: readingTime,
            responseSeconds: responseTime,
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
            value={readingTime || ""}
            onChange={(e) => {
              const val = e.target.value === "" ? 0 : Number(e.target.value);
              setReadingTime(val);
            }}
            min={15}
            max={300}
          />
          <p className="text-xs text-muted-foreground">Time given to read the passage.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rtime">Writing time per answer (seconds)</Label>
          <Input
            id="rtime"
            type="number"
            value={responseTime || ""}
            onChange={(e) => {
              const val = e.target.value === "" ? 0 : Number(e.target.value);
              setResponseTime(val);
            }}
            min={15}
            max={600}
          />
          <p className="text-xs text-muted-foreground">Time given to write comprehension answer.</p>
        </div>
        <div className="sm:col-span-2">
          <Button
            type="submit"
            size="lg"
            disabled={!name.trim() || readingTime < 15 || responseTime < 15}
          >
            Next
          </Button>
        </div>
      </form>
    </Panel>
  );
}

function Source({
  config,
  onBack,
  onDrafted,
}: {
  config: TestConfig;
  onBack: () => void;
  onDrafted: (testId: string, questions: QuestionDraft[]) => void;
}) {
  const [sourceText, setSourceText] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<number | null>(null);
  // Once a PDF is parsed (or questions are split), they are shown as editable boxes
  const [extracted, setExtracted] = useState<string[] | null>(null);

  const handleDraft = async (questions: string[], useAi = true) => {
    const rawContent = questions.join("\n\n");
    if (rawContent.trim().length < 20) {
      toast.error("Add at least one full question statement.");
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

  // --- PDF upload ---
  const handlePdfUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please choose a PDF file.");
      return;
    }
    setParsing(true);
    try {
      const pdfjs = await import("pdfjs-dist");
      const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

      const buffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
      const pages: string[] = [];
      const pagesNeedingOcr: number[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => ("str" in item ? (item as { str: string }).str : ""))
          .join(" ");
        if (pageText.replace(/\s/g, "").length < 20) {
          pagesNeedingOcr.push(i);
          pages.push("");
        } else {
          pages.push(pageText);
        }
      }

      // Scanned PDFs have no embedded text — run OCR on those pages in-browser
      if (pagesNeedingOcr.length > 0) {
        const { default: Tesseract } = await import("tesseract.js");
        let done = 0;
        for (const pageNum of pagesNeedingOcr) {
          const page = await pdf.getPage(pageNum);
          const baseViewport = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: 1400 / baseViewport.width });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;
          const result = await Tesseract.recognize(canvas, "eng");
          pages[pageNum - 1] = result.data.text ?? "";
          done += 1;
          setOcrProgress(Math.round((done / pagesNeedingOcr.length) * 100));
        }
        setOcrProgress(null);
      }
      const text = pages
        .join("\n")
        .replace(/\s+/g, " ")
        .replace(/ (\d+\.|Q\d+)/g, "\n\n$1");
      const questions = splitIntoQuestions(text);
      if (questions.length === 0) {
        toast.error("No questions could be read from that PDF. Try copying them as text instead.");
      } else {
        setExtracted(questions);
        toast.success(`${questions.length} questions read from the PDF. Review them below.`);
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? `Could not read the PDF: ${err.message}` : "Could not read the PDF.",
      );
    } finally {
      setParsing(false);
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

  // --- Uploaded/extracted questions as editable boxes ---
  if (extracted) {
    const update = (i: number, text: string) =>
      setExtracted(extracted.map((q, idx) => (idx === i ? text : q)));
    const remove = (i: number) => {
      const next = extracted.filter((_, idx) => idx !== i);
      setExtracted(next.length > 0 ? next : null);
    };

    return (
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">
            Questions from PDF ({extracted.length})
          </h2>
          <Button variant="ghost" size="sm" onClick={() => setExtracted(null)}>
            <Trash2 className="size-4" /> Discard & re-upload
          </Button>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Edit or remove any question, or add more below. Then continue — AI will fill in concepts,
          constraints and reference answers for your review.
        </p>

        <div className="mt-6 space-y-4">
          {extracted.map((q, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface-2/30 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Question {i + 1}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => remove(i)}
                >
                  <Trash2 className="size-4" /> Remove
                </Button>
              </div>
              <Textarea
                value={q}
                onChange={(e) => update(i, e.target.value)}
                className="min-h-[90px] text-sm leading-relaxed"
              />
            </div>
          ))}

          <Button
            variant="outline"
            onClick={() => setExtracted([...extracted, ""])}
            disabled={extracted.length >= 25}
          >
            <Plus className="size-4" /> Add Question
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={() => handleDraft(extracted, true)} disabled={drafting}>
            Draft with AI & Continue <ArrowRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleDraft(extracted, false)}
            disabled={drafting}
          >
            Continue Without AI <ArrowRight className="size-4" />
          </Button>
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">Add Questions</h2>
        <Button variant="outline" size="sm" onClick={onBack} disabled={parsing}>
          <ArrowLeft className="size-4" /> Back to Details
        </Button>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Upload a PDF with your questions — or paste them below. You can edit, remove or add more
        after reading them in.
      </p>

      <div className="mt-6 space-y-4">
        <div className="rounded-xl border border-dashed border-border-strong bg-surface-2/30 p-6 text-center">
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) handlePdfUpload(file);
            }}
          />
          <Button asChild variant="outline" size="lg" disabled={parsing}>
            <label htmlFor="pdf-upload" className="cursor-pointer">
              {parsing ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {ocrProgress !== null ? `Running OCR... ${ocrProgress}%` : "Reading PDF..."}
                </>
              ) : (
                <>
                  <FileText className="mr-2 size-4" /> Upload Question PDF
                </>
              )}
            </label>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Text PDFs read instantly; scanned pages are read with in-browser OCR automatically.
          </p>
        </div>

        <div className="relative py-1 text-center">
          <span className="relative z-10 bg-background px-3 text-xs uppercase tracking-wider text-muted-foreground">
            or paste manually
          </span>
          <span className="absolute left-0 right-0 top-1/2 border-t" />
        </div>

        <Textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder={`1. Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume each input would have exactly one solution.\n\n2. Given an integer array nums, find a subarray that has the largest product, and return the product.`}
          className="min-h-[160px] font-mono text-sm leading-relaxed"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            onClick={() => handleDraft(splitIntoQuestions(sourceText), true)}
            disabled={sourceText.trim().length < 20 || drafting}
          >
            Draft with AI & Continue <ArrowRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleDraft(splitIntoQuestions(sourceText), false)}
            disabled={sourceText.trim().length < 20 || drafting}
          >
            Continue Without AI <ArrowRight className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => {
              const sample = `1. Given an array of numbers and a target sum, find the two numbers that add up to the target. Explain what inputs you receive and what indices you must return.

2. Given a string containing brackets like '(', ')', '{', '}', determine if the brackets are closed in the correct order. Explain how a stack helps check valid pairs.

3. Given an integer array with positive and negative values, find the contiguous subarray that gives the maximum sum. Describe how you keep track of the running sum.`;
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

/**
 * Splits raw text (pasted or extracted from a PDF) into individual questions.
 * Mirrors the server-side logic so the instructor sees the same split.
 */
function splitIntoQuestions(raw: string): string[] {
  const cleaned = raw
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n");
  const byNumber = cleaned
    .split(/(?=\n?\s*(?:Q?\d+[).:]\s))/g)
    .map((chunk) => chunk.replace(/^\s*Q?\d+[).:]\s*/i, "").trim())
    .filter((chunk) => chunk.length > 20);
  if (byNumber.length > 1) return byNumber.slice(0, 25);
  const byBlank = cleaned
    .split(/\n\s*\n/)
    .map((chunk) => chunk.replace(/^\s*(?:Q?\d+[).:]|[-*])\s*/i, "").trim())
    .filter((chunk) => chunk.length > 20);
  if (byBlank.length > 1) return byBlank.slice(0, 25);
  const one = cleaned.trim();
  return one.length > 20 ? [one] : [];
}

function Review({
  testId,
  questions,
  onQuestionsUpdated,
  onBack,
  onNext,
}: {
  testId: string;
  questions: QuestionDraft[];
  onQuestionsUpdated: (updated: QuestionDraft[]) => void;
  onBack: () => void;
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

      {questions.length === 0 ? (
        <div className="mt-6 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
          No questions to review. Please go back and add questions.
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button variant="outline" size="lg" onClick={onBack} disabled={saving}>
          <ArrowLeft className="size-4" /> Back to Questions
        </Button>
        <Button
          size="lg"
          disabled={approvedCount === 0 || saving || questions.length === 0}
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
      </div>
    </>
  );
}

function Publish({
  config,
  approvedCount,
  onBack,
  onPublished,
}: {
  config: TestConfig;
  approvedCount: number;
  onBack: () => void;
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
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button variant="outline" size="lg" onClick={onBack} disabled={publishing}>
          <ArrowLeft className="size-4" /> Back to Review
        </Button>
        <Button size="lg" onClick={handlePublish} disabled={publishing || approvedCount === 0}>
          {publishing ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Publishing...
            </>
          ) : (
            "Publish Test & Generate Code"
          )}
        </Button>
      </div>
    </Panel>
  );
}
