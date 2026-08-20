import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { DifficultyTag, PageShell, Panel, SectionHeading, Tag } from "@/components/kit";
import { Input } from "@/components/ui/input";
import type { Difficulty } from "@/lib/mock-data";
import { listQuestionBank } from "@/lib/admin.functions";

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

type QuestionBankItem = {
  id: string;
  text: string;
  category: string;
  topic: string;
  difficulty: Difficulty;
  concepts: string[];
  constraints: string[];
  answer: string;
};

function QuestionBank() {
  const [items, setItems] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await listQuestionBank();
        setItems(res as QuestionBankItem[]);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = items.filter((item) =>
    `${item.text} ${item.category} ${item.topic} ${item.difficulty}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  return (
    <PageShell>
      <SectionHeading
        title="Question Bank"
        subtitle={`${items.length} approved questions across all your published tests.`}
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

      {loading ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading approved question bank...</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filtered.map((item) => (
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
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.concepts?.length ? item.concepts.join(" · ") : "None specified"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-warning">
                    Constraints
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.constraints?.length ? item.constraints.join(" · ") : "None specified"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-success">
                    Reference answer
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.answer || "None specified"}
                  </p>
                </div>
              </div>
            </Panel>
          ))}
          {filtered.length === 0 ? (
            <p className="panel-quiet p-10 text-center text-sm text-muted-foreground">
              {items.length === 0
                ? "No approved questions found in the database. Draft and approve questions in test builder first."
                : "No questions match that search query."}
            </p>
          ) : null}
        </div>
      )}
    </PageShell>
  );
}
