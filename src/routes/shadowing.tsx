import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Mic, Sparkles } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { PageShell } from "@/components/kit";
import { ShadowingPlayer } from "@/components/shadowing/ShadowingPlayer";
import { getShadowingItems, type ShadowingItem } from "@/lib/shadowing/shadowing.functions";

export const Route = createFileRoute("/shadowing")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  head: () => ({
    meta: [
      { title: "Shadowing Practice — Midnight Academy" },
      {
        name: "description",
        content: "Master spoken English pronunciation, rhythm, and intelligibility with sentence-by-sentence oral shadowing and AI feedback.",
      },
    ],
  }),
  component: ShadowingPage,
});

function ShadowingPage() {
  const [items, setItems] = useState<ShadowingItem[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"all" | "lower" | "middle" | "upper">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getShadowingItems({
          data: {
            difficulty: selectedDifficulty,
            limit: 40,
          },
        });
        setItems(res || []);
      } catch (err) {
        console.error("Failed to load shadowing items:", err);
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
                <Sparkles className="size-3.5" /> Speaking & Pronunciation Practice
              </div>
              <h1 className="text-3xl font-black tracking-tight text-foreground lg:text-4xl">
                Oral Shadowing Practice
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Listen to native speech models, repeat sentence-by-sentence, and receive instant 4-trait scoring on pronunciation, rhythm, and word accuracy.
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

          {/* Interactive Shadowing Player */}
          {loading ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Loading shadowing sentences...</p>
            </div>
          ) : (
            <ShadowingPlayer items={items} />
          )}
        </div>
      </PageShell>
    </div>
  );
}
