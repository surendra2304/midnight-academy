import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Flag, Loader2 } from "lucide-react";
import { EmptyState, PageShell, Panel, SectionHeading, Tag } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { scoreTextClass } from "@/lib/mock-data";
import { listFlaggedEvaluations, resolveFlag } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/review")({
  head: () => ({
    meta: [
      { title: "Evaluation Review Queue — Midnight Academy Admin" },
      {
        name: "description",
        content:
          "Flagged AI evaluations awaiting instructor confirmation or an overridden score with a note.",
      },
      { property: "og:title", content: "Evaluation Review Queue — Midnight Academy Admin" },
      {
        property: "og:description",
        content: "Confirm or override AI comprehension scores students have flagged.",
      },
    ],
  }),
  component: ReviewQueue,
});

type FlagItem = {
  id: string;
  attemptId: string;
  student: string;
  test: string;
  aiScore: number;
  submitted: string;
  questionText: string;
  studentAnswer: string;
  aiFeedback: string;
  reason: string;
};

function ReviewQueue() {
  const [items, setItems] = useState<FlagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [scoreOverrides, setScoreOverrides] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      try {
        const res = await listFlaggedEvaluations();
        setItems(res as FlagItem[]);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleResolve = async (item: FlagItem, override: boolean) => {
    setResolvingId(item.id);
    try {
      const score = override ? (scoreOverrides[item.id] ?? item.aiScore) : item.aiScore;
      const feedback = notes[item.id]?.trim() || item.aiFeedback;

      await resolveFlag({
        data: {
          answerId: item.id,
          score,
          feedback,
        },
      });

      setItems((list) => list.filter((f) => f.id !== item.id));
      toast.success(override ? "Score overridden and note saved" : "AI evaluation confirmed");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to resolve flag";
      toast.error(message);
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) {
    return (
      <PageShell className="max-w-[1000px]">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading evaluation review queue...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className="max-w-[1000px]">
      <SectionHeading
        title="Evaluation Review Queue"
        subtitle={`${items.length} flagged evaluations awaiting your decision.`}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<Check className="size-5" />}
          title="Queue is clear"
          description="Every flagged evaluation has been reviewed. New flags from students will appear here automatically."
        />
      ) : (
        <div className="space-y-5">
          {items.map((f) => (
            <Panel key={f.id}>
              <div className="flex flex-wrap items-center gap-2">
                <Flag className="size-3.5 text-warning" />
                <span className="text-sm font-semibold text-foreground">{f.student}</span>
                <Tag>{f.test}</Tag>
                <span className={`ml-auto text-sm font-bold ${scoreTextClass(f.aiScore * 10)}`}>
                  AI score {f.aiScore}/10
                </span>
                <span className="text-xs text-muted-foreground">{f.submitted}</span>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-border p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Question
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {f.questionText || "Question statement"}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-surface-2/40 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground">
                    Student understanding
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground">
                    {f.studentAnswer || "(No answer recorded)"}
                  </p>
                </div>
                <div className="rounded-xl border border-primary/25 bg-primary/6 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                    AI feedback
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {f.aiFeedback}
                  </p>
                  <p className="mt-3 text-xs text-warning">{f.reason}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-end gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Override score
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={scoreOverrides[f.id] ?? f.aiScore}
                    onChange={(e) =>
                      setScoreOverrides((prev) => ({ ...prev, [f.id]: Number(e.target.value) }))
                    }
                    className="w-24"
                    disabled={resolvingId === f.id}
                  />
                </div>
                <div className="min-w-[240px] flex-1">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Note to student
                  </label>
                  <Input
                    value={notes[f.id] ?? ""}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [f.id]: e.target.value }))}
                    placeholder="Optional explanation of your decision"
                    disabled={resolvingId === f.id}
                  />
                </div>
                <Button onClick={() => handleResolve(f, true)} disabled={resolvingId === f.id}>
                  {resolvingId === f.id ? <Loader2 className="size-4 animate-spin" /> : "Override"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleResolve(f, false)}
                  disabled={resolvingId === f.id}
                >
                  Confirm AI score
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </PageShell>
  );
}
