import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
  Loader2,
  RotateCcw,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { PageShell } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { FlashcardPlayer } from "@/components/vocabulary/FlashcardPlayer";
import { VocabQuizPlayer } from "@/components/vocabulary/VocabQuizPlayer";
import {
  getVocabLists,
  getVocabWordsByList,
  getDailyReviewQueue,
  getVocabQuiz,
  type VocabList,
  type VocabWord,
  type QuizQuestion,
} from "@/lib/vocabulary/vocabulary.functions";

export const Route = createFileRoute("/vocabulary")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  head: () => ({
    meta: [
      { title: "TOEFL Vocabulary Mastery — Midnight Academy" },
      {
        name: "description",
        content:
          "Master high-frequency TOEFL academic vocabulary with SM-2 spaced repetition flashcards, contextual quizzes, and daily review queues.",
      },
    ],
  }),
  component: VocabularyPage,
});

function VocabularyPage() {
  const [lists, setLists] = useState<VocabList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<"catalog" | "flashcards" | "quiz">("catalog");
  const [words, setWords] = useState<VocabWord[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadOverview() {
      try {
        const [lRes, qRes] = await Promise.all([getVocabLists(), getDailyReviewQueue()]);
        setLists((lRes as any) || []);
        setDueCount(qRes?.dueCount || 0);
      } catch (err) {
        console.error("Failed to load vocab lists:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, []);

  const handleStartFlashcards = async (listId: string, dueOnly = false) => {
    setLoading(true);
    try {
      const wRes = await getVocabWordsByList({ data: { listId, dueOnly } });
      setWords((wRes as any) || []);
      setActiveListId(listId);
      setActiveMode("flashcards");
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async (listId: string) => {
    setLoading(true);
    try {
      const qRes = await getVocabQuiz({ data: { listId, count: 10 } });
      setQuizQuestions((qRes as any) || []);
      setActiveListId(listId);
      setActiveMode("quiz");
    } finally {
      setLoading(false);
    }
  };

  const filteredLists = lists.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />
      <PageShell>
        <div className="space-y-8 pb-16">
          {/* Header Banner */}
          <div className="rounded-3xl border border-border bg-gradient-to-r from-card/80 via-card/50 to-card/80 p-8 shadow-sm flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary uppercase">
                <Sparkles className="size-3.5" /> Spaced Repetition Vocabulary
              </div>
              <h1 className="text-3xl font-black tracking-tight text-foreground lg:text-4xl">
                TOEFL Academic Word Lists
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Retain 250+ essential academic, campus, and scientific words using SM-2 spaced
                repetition flashcards and context fill-in quizzes.
              </p>
            </div>

            {/* Daily Review Quick Callout */}
            <div className="rounded-2xl border border-border bg-background/80 p-5 space-y-2 text-center min-w-[200px]">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">
                Due for Review Today
              </span>
              <p className="text-2xl font-black text-primary">{dueCount} Words</p>
              <Button
                size="sm"
                className="w-full font-bold text-xs"
                onClick={() => lists[0] && handleStartFlashcards(lists[0].id, true)}
              >
                Review Daily Queue
              </Button>
            </div>
          </div>

          {/* Mode Switcher / Back Button */}
          {activeMode !== "catalog" ? (
            <div className="flex items-center justify-between border-b border-border pb-4">
              <Button variant="outline" size="sm" onClick={() => setActiveMode("catalog")}>
                ← Back to Word Lists
              </Button>
              <span className="text-xs font-bold text-primary uppercase">
                {activeMode === "flashcards" ? "Flashcard Practice" : "Context Quiz Drill"}
              </span>
            </div>
          ) : null}

          {/* View Modes */}
          {loading ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Loading vocabulary resources...</p>
            </div>
          ) : activeMode === "flashcards" ? (
            <FlashcardPlayer words={words} onComplete={() => setActiveMode("catalog")} />
          ) : activeMode === "quiz" ? (
            <VocabQuizPlayer
              questions={quizQuestions}
              onComplete={() => setActiveMode("catalog")}
            />
          ) : (
            <div className="space-y-6">
              {/* Search & Filter */}
              <div className="relative max-w-md">
                <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search word lists, topics, or domains..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border bg-card/60 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Word List Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLists.map((list) => (
                  <div
                    key={list.id}
                    className="rounded-3xl border border-border bg-card/50 p-6 shadow-sm flex flex-col justify-between space-y-6 hover:border-primary/40 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase">
                          {list.category.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-muted-foreground font-semibold">
                          50 Words
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-foreground">{list.name}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {list.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="flex-1 font-bold text-xs"
                          onClick={() => handleStartFlashcards(list.id)}
                        >
                          <BookOpen className="size-3.5 mr-1" /> Flashcards
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 font-bold text-xs"
                          onClick={() => handleStartQuiz(list.id)}
                        >
                          <Zap className="size-3.5 mr-1" /> Quiz Drill
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PageShell>
    </div>
  );
}
