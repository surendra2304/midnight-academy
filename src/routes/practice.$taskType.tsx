import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  ChevronRight,
  Award,
  AlertCircle,
  Clock,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
} from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { PageShell } from "@/components/kit";
import { Button } from "@/components/ui/button";
import {
  getPracticeTaskItems,
  submitPracticeTaskAnswer,
  type PracticeItemDetail,
} from "@/lib/practice/practice-session.functions";
import { SplitReadingRenderer } from "@/components/test-runner/reading/SplitReadingRenderer";
import { CompleteWordsRenderer } from "@/components/test-runner/reading/CompleteWordsRenderer";
import { ListeningRenderer } from "@/components/test-runner/listening/ListeningRenderer";
import { BuildSentenceRenderer } from "@/components/test-runner/writing/BuildSentenceRenderer";
import { WritingEditorRenderer } from "@/components/test-runner/writing/WritingEditorRenderer";
import { SpeakingRecorder } from "@/components/test-runner/speaking/SpeakingRecorder";
import type { ToeflItemType } from "@/types/toefl";
import { toast } from "sonner";

export const Route = createFileRoute("/practice/$taskType")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  head: () => ({
    meta: [
      { title: "Task Practice — Midnight Academy" },
      {
        name: "description",
        content: "Focused TOEFL 2026 task-type practice with instant feedback and AI scoring.",
      },
    ],
  }),
  component: PracticeTaskPage,
});

const TASK_TITLES: Record<string, { title: string; section: string; icon: typeof BookOpen }> = {
  complete_words: { title: "Complete the Words", section: "Reading", icon: BookOpen },
  read_daily_life: { title: "Read in Daily Life", section: "Reading", icon: BookOpen },
  read_academic: { title: "Read an Academic Passage", section: "Reading", icon: BookOpen },
  listen_choose_response: {
    title: "Listen and Choose a Response",
    section: "Listening",
    icon: Headphones,
  },
  listen_conversation: { title: "Campus Conversation", section: "Listening", icon: Headphones },
  listen_announcement: { title: "Campus Announcement", section: "Listening", icon: Headphones },
  listen_academic_talk: { title: "Academic Talk", section: "Listening", icon: Headphones },
  build_sentence: { title: "Build a Sentence", section: "Writing", icon: PenTool },
  write_email: { title: "Write an Email", section: "Writing", icon: PenTool },
  academic_discussion: { title: "Academic Discussion", section: "Writing", icon: PenTool },
  listen_repeat: { title: "Listen and Repeat", section: "Speaking", icon: Mic },
  take_interview: { title: "Take an Interview", section: "Speaking", icon: Mic },
};

interface PracticeFeedback {
  type: "objective" | "ai" | "ai_evaluated";
  isCorrect?: boolean;
  score?: number;
  earnedPoints?: number;
  maxPoints?: number;
  correctOptionKey?: string | null;
  correctOptionText?: string | null;
  correctSequence?: string | null;
  distractorRationale?: string | null;
  scoreBand?: number;
  overallScore?: number;
  evaluation?: {
    score_band?: number;
    task_score?: number;
    rubric_version?: string;
    traits?: Record<string, number>;
    strengths?: string[];
    issues?: string[];
    corrections?: Array<{ original: string; improved: string; explanation: string }>;
    improved_response?: string;
  };
  transcript?: string;
}

function PracticeTaskPage() {
  const params = useParams({ strict: false }) as { taskType?: string };
  const taskType = params.taskType || "read_academic";
  const [items, setItems] = useState<PracticeItemDetail[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);
  const [currentNormalized, setCurrentNormalized] = useState<Record<string, unknown>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<PracticeFeedback | null>(null);

  const taskInfo = TASK_TITLES[taskType] || {
    title: taskType.replace(/_/g, " "),
    section: "Practice",
    icon: Sparkles,
  };
  const Icon = taskInfo.icon;

  const loadItems = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    setCurrentAnswer(null);
    try {
      const data = await getPracticeTaskItems({
        data: {
          taskType: taskType as ToeflItemType,
          difficulty: selectedDifficulty !== "all" ? selectedDifficulty : undefined,
          limit: 15,
        },
      });
      setItems(data as PracticeItemDetail[]);
      setCurrentIndex(0);
    } catch (err: unknown) {
      toast.error(`Could not load practice items: ${(err as Error)?.message}`);
    } finally {
      setLoading(false);
    }
  }, [taskType, selectedDifficulty]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const currentItem = items[currentIndex];

  const handleAnswerChange = (raw: string, norm?: Record<string, unknown>) => {
    setCurrentAnswer(raw);
    if (norm) setCurrentNormalized(norm);
  };

  const handleSubmit = async () => {
    if (!currentItem) return;
    if (
      !currentAnswer &&
      currentItem.itemType !== "listen_repeat" &&
      currentItem.itemType !== "take_interview"
    ) {
      toast.error("Please answer the question before submitting.");
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await submitPracticeTaskAnswer({
        data: {
          contentItemId: currentItem.id,
          taskType: taskType as ToeflItemType,
          rawAnswer: currentAnswer,
          normalizedAnswer: currentNormalized,
          timeSpentMs: 0,
        },
      });
      setFeedback(res);
    } catch (err: unknown) {
      toast.error(`Evaluation failed: ${(err as Error)?.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setCurrentAnswer(null);
      setCurrentNormalized({});
      setFeedback(null);
    }
  };

  const handleRetry = () => {
    setCurrentAnswer(null);
    setCurrentNormalized({});
    setFeedback(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppNav />
        <PageShell>
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading {taskInfo.title} exercises...</p>
          </div>
        </PageShell>
      </div>
    );
  }

  if (items.length === 0 || !currentItem) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppNav />
        <PageShell>
          <div className="max-w-md mx-auto mt-16 rounded-3xl border border-border bg-card/60 p-8 text-center space-y-4">
            <AlertCircle className="size-10 text-muted-foreground mx-auto" />
            <h2 className="text-lg font-bold text-foreground">No Practice Items Available</h2>
            <p className="text-xs text-muted-foreground">
              There are currently no items for this task type under the selected difficulty.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/practice">
                <ArrowLeft className="size-3.5 mr-1" /> Back to Practice Queue
              </Link>
            </Button>
          </div>
        </PageShell>
      </div>
    );
  }

  // Convert PracticeItemDetail to format expected by item renderers
  const clientItem = {
    id: currentItem.id,
    moduleId: "practice-module",
    sectionType: currentItem.sectionType,
    itemType: currentItem.itemType,
    difficulty: currentItem.difficulty,
    skillTags: currentItem.skillTags,
    payload: currentItem.payload,
    options: currentItem.options,
    itemOrder: currentIndex,
  };

  const renderTask = () => {
    if (currentItem.itemType === "complete_words") {
      return (
        <CompleteWordsRenderer
          item={clientItem}
          currentAnswer={currentAnswer}
          onAnswerChange={handleAnswerChange}
          disabled={Boolean(feedback)}
        />
      );
    }

    if (currentItem.itemType === "read_daily_life" || currentItem.itemType === "read_academic") {
      return (
        <SplitReadingRenderer
          item={clientItem}
          currentAnswer={currentAnswer}
          isFlagged={false}
          onAnswerChange={handleAnswerChange}
          onToggleFlag={() => {}}
          disabled={Boolean(feedback)}
        />
      );
    }

    if (
      currentItem.itemType === "listen_choose_response" ||
      currentItem.itemType === "listen_conversation" ||
      currentItem.itemType === "listen_announcement" ||
      currentItem.itemType === "listen_academic_talk"
    ) {
      return (
        <ListeningRenderer
          item={clientItem}
          currentAnswer={currentAnswer}
          isFlagged={false}
          onAnswerChange={handleAnswerChange}
          onToggleFlag={() => {}}
          disabled={Boolean(feedback)}
        />
      );
    }

    if (currentItem.itemType === "build_sentence") {
      return (
        <BuildSentenceRenderer
          item={clientItem}
          currentAnswer={currentAnswer}
          onAnswerChange={handleAnswerChange}
          disabled={Boolean(feedback)}
        />
      );
    }

    if (currentItem.itemType === "write_email" || currentItem.itemType === "academic_discussion") {
      return (
        <WritingEditorRenderer
          item={clientItem}
          currentAnswer={currentAnswer}
          onAnswerChange={handleAnswerChange}
          disabled={Boolean(feedback)}
        />
      );
    }

    if (currentItem.itemType === "listen_repeat" || currentItem.itemType === "take_interview") {
      return (
        <SpeakingRecorder
          item={clientItem}
          currentAnswer={currentAnswer}
          onAnswerChange={handleAnswerChange}
          disabled={Boolean(feedback)}
          isExamMode={false}
        />
      );
    }

    return <div>Unsupported task type</div>;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />
      <PageShell>
        <div className="space-y-6 pb-16">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="sm">
                <Link to="/practice">
                  <ArrowLeft className="size-4 mr-1" /> Practice
                </Link>
              </Button>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <span className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Icon className="size-4" />
                </span>
                <div>
                  <h1 className="text-base font-bold text-foreground">{taskInfo.title}</h1>
                  <span className="text-[10px] uppercase font-bold text-primary">
                    {taskInfo.section}
                  </span>
                </div>
              </div>
            </div>

            {/* Difficulty Selector & Counter */}
            <div className="flex items-center gap-3">
              <div className="flex rounded-lg border border-border bg-card/60 p-0.5 text-xs">
                {["all", "Easy", "Medium", "Hard"].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-all ${
                      selectedDifficulty === diff
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {diff === "all" ? "All Levels" : diff}
                  </button>
                ))}
              </div>

              <div className="rounded-lg border border-border bg-card/60 px-3 py-1 text-xs font-bold">
                Item {currentIndex + 1} / {items.length}
              </div>
            </div>
          </div>

          {/* Main Task Area */}
          <div className="rounded-2xl border border-border bg-card/40 p-6 space-y-6">
            {renderTask()}

            {/* Action Bar */}
            {!feedback && (
              <div className="flex justify-end pt-4 border-t border-border">
                <Button
                  size="default"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="font-bold px-6 shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" /> Evaluating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4 mr-2" /> Submit & Check Answer
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Instant Feedback Panel */}
            {feedback && (
              <div className="space-y-4 pt-6 border-t border-border">
                {feedback.type === "objective" ? (
                  <div
                    className={`rounded-2xl border p-5 space-y-3 ${
                      feedback.isCorrect
                        ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                        : "border-destructive/30 bg-destructive/5 text-destructive"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        {feedback.isCorrect ? (
                          <>
                            <CheckCircle2 className="size-5 text-emerald-500" /> Correct Response!
                          </>
                        ) : (
                          <>
                            <XCircle className="size-5 text-destructive" /> Incorrect
                          </>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold">
                        Score: {feedback.earnedPoints} / {feedback.maxPoints} pts
                      </span>
                    </div>

                    {!feedback.isCorrect &&
                      (feedback.correctOptionKey || feedback.correctSequence) && (
                        <div className="rounded-xl bg-background/60 p-3 text-xs space-y-1 text-foreground">
                          <p className="font-bold text-muted-foreground uppercase text-[10px]">
                            Correct Answer:
                          </p>
                          <p className="font-semibold text-emerald-400">
                            {feedback.correctOptionKey
                              ? `${feedback.correctOptionKey}: ${feedback.correctOptionText}`
                              : feedback.correctSequence}
                          </p>
                        </div>
                      )}

                    {feedback.distractorRationale && (
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        <span className="font-bold text-foreground">Explanation: </span>
                        {feedback.distractorRationale}
                      </div>
                    )}
                  </div>
                ) : (
                  /* AI Evaluated Feedback (Writing & Speaking) */
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-lg">
                          {(feedback.evaluation?.score_band ?? 0).toFixed(1)}
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-sm">
                            Band {(feedback.evaluation?.score_band ?? 0).toFixed(1)} / 6.0
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Practice Score: {feedback.evaluation?.task_score ?? 0} / 100
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-surface-2 px-3 py-1 text-[11px] font-mono text-muted-foreground">
                        Rubric {feedback.evaluation?.rubric_version ?? "2026.1"}
                      </span>
                    </div>

                    {/* Spoken Transcript if speaking */}
                    {feedback.transcript && (
                      <div className="rounded-xl border border-border bg-background/60 p-3 space-y-1 text-xs">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">
                          Spoken Transcript (Recognized):
                        </p>
                        <p className="font-medium text-foreground italic">
                          "{feedback.transcript}"
                        </p>
                      </div>
                    )}

                    {/* Traits Breakdown */}
                    {feedback.evaluation?.traits && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {Object.entries(feedback.evaluation.traits).map(([trait, score]) => (
                          <div
                            key={trait}
                            className="rounded-xl border border-border bg-background/50 p-2.5 text-center"
                          >
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">
                              {trait.replace(/_/g, " ")}
                            </p>
                            <p className="text-sm font-black text-foreground">
                              {(score as number).toFixed(1)} / 6.0
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Strengths & Issues */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {Boolean(feedback.evaluation?.strengths?.length) && (
                        <div className="space-y-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                          <p className="font-bold text-emerald-400 uppercase text-[10px]">
                            Key Strengths:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {feedback.evaluation?.strengths?.map((s: string, i: number) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {Boolean(feedback.evaluation?.issues?.length) && (
                        <div className="space-y-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                          <p className="font-bold text-amber-400 uppercase text-[10px]">
                            Areas to Improve:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {feedback.evaluation?.issues?.map((issue: string, i: number) => (
                              <li key={i}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Corrections */}
                    {Boolean(feedback.evaluation?.corrections?.length) && (
                      <div className="space-y-2 rounded-xl border border-border bg-background/60 p-4 text-xs">
                        <p className="font-bold text-foreground uppercase text-[10px]">
                          Specific Phrasing Improvements:
                        </p>
                        <div className="space-y-2">
                          {feedback.evaluation?.corrections?.map((c, i: number) => (
                            <div
                              key={i}
                              className="space-y-1 border-b border-border/50 pb-2 last:border-0 last:pb-0"
                            >
                              <p className="line-through text-destructive">{c.original}</p>
                              <p className="text-emerald-400 font-semibold">{c.improved}</p>
                              <p className="text-muted-foreground text-[11px]">{c.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Navigation */}
                <div className="flex items-center justify-between pt-4">
                  <Button variant="outline" size="sm" onClick={handleRetry}>
                    <RotateCcw className="size-3.5 mr-1.5" /> Try Again
                  </Button>

                  {currentIndex < items.length - 1 ? (
                    <Button size="sm" onClick={handleNext}>
                      Next Item <ChevronRight className="size-3.5 ml-1.5" />
                    </Button>
                  ) : (
                    <Button asChild size="sm">
                      <Link to="/practice">Finish Practice</Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </PageShell>
    </div>
  );
}
