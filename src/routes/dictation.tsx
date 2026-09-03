import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Headphones, Loader2, Sparkles, Volume2 } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { PageShell } from "@/components/kit";
import { DictationPlayer } from "@/components/dictation/DictationPlayer";
import { getDictationItems, type DictationItem } from "@/lib/dictation/dictation.functions";

export const Route = createFileRoute("/dictation")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  head: () => ({
    meta: [
      { title: "Dictation Practice — Midnight Academy" },
      {
        name: "description",
        content:
          "Enhance your English listening comprehension and transcription accuracy with word-by-word diffs and AI phonetic coaching.",
      },
    ],
  }),
  component: DictationPage,
});

function DictationPage() {
  const [items, setItems] = useState<DictationItem[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "all" | "lower" | "middle" | "upper"
  >("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getDictationItems({
          data: {
            difficulty: selectedDifficulty,
            limit: 30,
          },
        });
        setItems(res || []);
      } catch (err) {
        console.error("Failed to load dictation items:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedDifficulty]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />
      <PageShell>
        <div className="space-y-8 pb-16">
          {/* Header Banner */}
          <div className="rounded-3xl border border-border bg-gradient-to-r from-card/80 via-card/50 to-card/80 p-8 shadow-sm flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary uppercase">
                <Sparkles className="size-3.5" /> Listening Skill Building
              </div>
              <h1 className="text-3xl font-black tracking-tight text-foreground lg:text-4xl">
                Sentence Dictation Practice
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Listen to academic lectures and campus announcements, transcribe verbatim, and
                receive instant word-level diff analysis with AI phonetic insights.
              </p>
            </div>

            {/* Difficulty Filter Tabs */}
            <div className="flex items-center gap-2 bg-surface-2/60 border border-border p-1.5 rounded-2xl">
              {[
                { id: "all", label: "All Levels" },
                { id: "lower", label: "Foundational" },
                { id: "middle", label: "Intermediate" },
                { id: "upper", label: "Advanced" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedDifficulty(tab.id as typeof selectedDifficulty)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    selectedDifficulty === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Player */}
          {loading ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Loading dictation exercises...</p>
            </div>
          ) : (
            <DictationPlayer items={items} />
          )}
        </div>
      </PageShell>
    </div>
  );
}
