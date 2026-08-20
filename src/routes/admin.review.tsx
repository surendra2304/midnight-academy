import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Flag } from "lucide-react";
import { EmptyState, PageShell, Panel, SectionHeading, Tag } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { flaggedEvaluations, scoreTextClass } from "@/lib/mock-data";

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

function ReviewQueue() {
  const [resolved, setResolved] = useState<string[]>([]);
  const open = flaggedEvaluations.filter((f) => !resolved.includes(f.id));

  return (
    <PageShell className="max-w-[1000px]">
      <SectionHeading
        title="Evaluation Review Queue"
        subtitle={`${open.length} flagged evaluations awaiting your decision.`}
      />

      {open.length === 0 ? (
        <EmptyState
          icon={<Check className="size-5" />}
          title="Queue is clear"
          description="Every flagged evaluation has been reviewed. New flags from students will appear here automatically."
        />
      ) : (
        <div className="space-y-5">
          {open.map((f) => (
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
                    {f.questionText}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-surface-2/40 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground">
                    Student understanding
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground">{f.studentAnswer}</p>
                </div>
                <div className="rounded-xl border border-primary/25 bg-primary/6 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                    AI feedback
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.aiFeedback}</p>
                  <p className="mt-3 text-xs text-warning">Flag reason: {f.reason}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-end gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Override score
                  </label>
                  <Input type="number" min={0} max={10} defaultValue={f.aiScore} className="w-24" />
                </div>
                <div className="min-w-[240px] flex-1">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Note to student
                  </label>
                  <Input placeholder="Optional explanation of your decision" />
                </div>
                <Button
                  onClick={() => {
                    setResolved((r) => [...r, f.id]);
                    toast.success("Score overridden and note sent");
                  }}
                >
                  Override
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setResolved((r) => [...r, f.id]);
                    toast.success("AI evaluation confirmed");
                  }}
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
