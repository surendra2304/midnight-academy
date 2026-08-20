import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { DifficultyTag, PageShell, Panel, SectionHeading, Tag } from "@/components/kit";
import { Input } from "@/components/ui/input";
import { questionBank } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/question-bank")({
  head: () => ({
    meta: [
      { title: "Question Bank — Midnight Academy Admin" },
      {
        name: "description",
        content:
          "A tagged, searchable library of approved technical questions with concepts, constraints and reference answers.",
      },
      { property: "og:title", content: "Question Bank — Midnight Academy Admin" },
      {
        property: "og:description",
        content: "Reuse approved questions instead of re-uploading papers.",
      },
    ],
  }),
  component: QuestionBank,
});

function QuestionBank() {
  const [q, setQ] = useState("");
  const items = questionBank.filter((item) =>
    `${item.text} ${item.category} ${item.topic} ${item.difficulty}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  return (
    <PageShell>
      <SectionHeading
        title="Question Bank"
        subtitle={`${questionBank.length} approved questions, reusable across any test.`}
      />
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by category, topic or difficulty"
          className="pl-9"
        />
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <Panel key={item.id}>
            <div className="flex flex-wrap items-center gap-2">
              <Tag tone="primary">{item.category}</Tag>
              <Tag>{item.topic}</Tag>
              <DifficultyTag difficulty={item.difficulty} />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-foreground">{item.text}</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Concepts
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{item.concepts.join(" · ")}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-warning">
                  Constraints
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{item.constraints.join(" · ")}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-success">
                  Actual answer
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
              </div>
            </div>
          </Panel>
        ))}
        {items.length === 0 ? (
          <p className="panel-quiet p-10 text-center text-sm text-muted-foreground">
            No questions match that search.
          </p>
        ) : null}
      </div>
    </PageShell>
  );
}
