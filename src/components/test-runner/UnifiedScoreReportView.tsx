/**
 * Unified TOEFL Score Report & Review Experience
 * 1:1 Parity with TestGlider Summary Report (Screens 47-48)
 * "Moon | Full Test" Review and Diagnostic Item Analysis
 */

import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Award,
  Target,
  TrendingUp,
  Sparkles,
  Filter,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronLeft,
  BookOpen,
  Volume2,
  Mic,
  FileText,
  ChevronRight,
  AlertCircle,
  RotateCcw,
  Loader2,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/test-runner/listening/AudioPlayer";
import { retryToeflEvaluation } from "@/lib/tests/engine.functions";
import { toast } from "sonner";

export interface UnifiedScoreReportProps {
  reportData: {
    attempt: {
      id: string;
      tests?: { name: string; category: string; difficulty: string };
      percentage_score: number | null;
      completed_at: string | null;
      evaluation_status?: string | null;
    };
    report: {
      overall_band: number;
      reading_band: number;
      listening_band: number;
      writing_band: number;
      speaking_band: number;
      comparable_score: number;
      summary?: string;
    } | null;
    userEmail?: string;
    targetScore?: number;
    attemptSections?: Array<{
      id: string;
      section_id: string;
      status: string;
      raw_score: number;
      section_band: number;
      time_spent_seconds: number;
      sections?: { section_type: string; timing_seconds: number; section_order: number };
    }>;
    responses: Array<{
      id: string;
      raw_answer: string | null;
      audioPlayUrl?: string | null;
      is_correct: boolean | null;
      score: number | null;
      time_spent_ms: number;
      content_items: {
        id: string;
        section_type: string;
        item_type: string;
        difficulty: string;
        skill_tags: string[];
        payload: Record<string, unknown>;
      };
      options: Array<{
        option_key: string;
        option_text: string;
        is_correct: boolean;
        distractor_rationale?: string | null;
      }>;
      evaluation?: {
        score_band: number;
        traits: Record<string, number>;
        strengths: string[];
        issues: string[];
        corrections: Array<{ original: string; improved: string; explanation: string }>;
        improved_response?: string;
        next_actions: string[];
      } | null;
    }>;
    recommendations?: Array<{
      id: string;
      reason: string;
      priority: number;
    }>;
  };
}

export function UnifiedScoreReportView({ reportData }: UnifiedScoreReportProps) {
  const {
    attempt,
    report,
    userEmail = "surendrabtech12321@gmail.com",
    targetScore = 5.0,
    responses,
    recommendations = [],
  } = reportData;

  const [activeSectionTab, setActiveSectionTab] = useState<string>("all");
  const [showIncorrectOnly, setShowIncorrectOnly] = useState(false);
  const [expandedTranscripts, setExpandedTranscripts] = useState<Record<string, boolean>>({});

  const overallBand = report?.overall_band || 1.0;
  const comparable120 = report?.comparable_score || 0;
  const targetGap = (overallBand - targetScore).toFixed(1);

  const formattedDate = attempt.completed_at
    ? new Date(attempt.completed_at).toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
      });

  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetryEvaluation = async () => {
    setIsRetrying(true);
    try {
      await retryToeflEvaluation({ data: { attemptId: attempt.id } });
      toast.success("Evaluation retry initiated. Reloading score report...");
      window.location.reload();
    } catch (err: unknown) {
      toast.error(`Evaluation retry failed: ${(err as Error)?.message}`);
    } finally {
      setIsRetrying(false);
    }
  };

  const toggleTranscript = (itemId: string) => {
    setExpandedTranscripts((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Section score lookup
  const sectionScores = {
    reading: report?.reading_band ? report.reading_band.toFixed(1) : "—",
    listening: report?.listening_band ? report.listening_band.toFixed(1) : "—",
    writing: report?.writing_band ? report.writing_band.toFixed(1) : "—",
    speaking: report?.speaking_band ? report.speaking_band.toFixed(1) : "—",
  };

  // Filter responses by tab
  const filteredResponses = responses.filter((r) => {
    if (activeSectionTab !== "all" && r.content_items.section_type !== activeSectionTab) {
      return false;
    }
    if (
      showIncorrectOnly &&
      r.is_correct !== false &&
      (!r.evaluation || r.evaluation.score_band >= 5.0)
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto">
      {/* 1. TESTGLIDER TOP NAVIGATION: < All Records */}
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <Link
          to="/test"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <ChevronLeft className="size-4" /> All Records
        </Link>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Score report link copied to clipboard!");
              }
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <Share2 className="size-3.5 mr-1" /> Share Report
          </Button>
          <Button asChild size="sm" className="bg-[#0f3b82] hover:bg-[#0c2f68] text-white">
            <Link to="/test">Take Another Test</Link>
          </Button>
        </div>
      </div>

      {/* 2. TESTGLIDER SUMMARY REPORT HEADER (Screen 48) */}
      <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/60">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#0f3b82] dark:text-blue-400">
              Midnight Academy Standardized Exam Review
            </span>
            <h1 className="text-3xl font-black tracking-tight text-foreground mt-1">
              SUMMARY REPORT
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{userEmail}</span>
              <span>•</span>
              <span className="font-medium text-foreground">
                {attempt.tests?.name || "Moon | Full Test"}
              </span>
              <span>•</span>
              <span className="inline-block px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-[#0f3b82] dark:text-blue-300 font-bold text-[11px]">
                Free
              </span>
              <span>•</span>
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* TestGlider Score Badge */}
          <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-xl border border-border">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                Overall Band Score
              </span>
              <span className="text-4xl font-black text-[#0f3b82] dark:text-blue-400">
                {overallBand.toFixed(1)}
              </span>
              <span className="text-xs font-semibold text-muted-foreground ml-1.5">
                out of 6.0
              </span>
            </div>
            <div className="h-10 w-px bg-border mx-1" />
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                Benchmark 0–120
              </span>
              <span className="text-2xl font-black text-foreground">
                ~{comparable120}
              </span>
              <span className="text-xs text-muted-foreground ml-1">/ 120</span>
            </div>
          </div>
        </div>

        {/* AI Grading Status Notice (Screen 48 exact copy) */}
        {attempt.evaluation_status === "pending" ? (
          <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-4 flex items-center justify-between gap-4 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-3">
              <Loader2 className="size-5 animate-spin text-amber-600 shrink-0" />
              <p className="font-medium">
                Our AI is carefully grading your writing and speaking responses. Please wait a
                moment.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
              className="text-xs shrink-0"
            >
              Refresh Status
            </Button>
          </div>
        ) : attempt.evaluation_status === "failed" ? (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-center justify-between gap-4 text-xs text-destructive">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-5 text-destructive shrink-0" />
              <div>
                <p className="font-bold">Evaluation Notice</p>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  AI grading experienced a timeout. Your submitted answers are fully intact.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={isRetrying}
              onClick={handleRetryEvaluation}
              className="border-destructive/40 hover:bg-destructive/20"
            >
              {isRetrying ? "Retrying..." : "Retry Evaluation"}
            </Button>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
            <span>AI assessment complete. All responses and traits calibrated against official rubric.</span>
          </div>
        )}

        {/* Section Score Breakdown Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div
            onClick={() => setActiveSectionTab("reading")}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${
              activeSectionTab === "reading"
                ? "border-[#0f3b82] bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-[#0f3b82]"
                : "border-border hover:bg-muted/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-muted-foreground">Reading</span>
              <BookOpen className="size-4 text-[#0f3b82] dark:text-blue-400" />
            </div>
            <p className="text-2xl font-black text-foreground mt-2">
              {sectionScores.reading}{" "}
              <span className="text-xs font-normal text-muted-foreground">/ 6.0</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Passage & Vocabulary</p>
          </div>

          <div
            onClick={() => setActiveSectionTab("listening")}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${
              activeSectionTab === "listening"
                ? "border-[#0f3b82] bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-[#0f3b82]"
                : "border-border hover:bg-muted/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-muted-foreground">Listening</span>
              <Volume2 className="size-4 text-[#0f3b82] dark:text-blue-400" />
            </div>
            <p className="text-2xl font-black text-foreground mt-2">
              {sectionScores.listening}{" "}
              <span className="text-xs font-normal text-muted-foreground">/ 6.0</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Audio & Lecture Talk</p>
          </div>

          <div
            onClick={() => setActiveSectionTab("writing")}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${
              activeSectionTab === "writing"
                ? "border-[#0f3b82] bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-[#0f3b82]"
                : "border-border hover:bg-muted/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-muted-foreground">Writing</span>
              <FileText className="size-4 text-[#0f3b82] dark:text-blue-400" />
            </div>
            <p className="text-2xl font-black text-foreground mt-2">
              {sectionScores.writing}{" "}
              <span className="text-xs font-normal text-muted-foreground">/ 6.0</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Discussion & Sentences</p>
          </div>

          <div
            onClick={() => setActiveSectionTab("speaking")}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${
              activeSectionTab === "speaking"
                ? "border-[#0f3b82] bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-[#0f3b82]"
                : "border-border hover:bg-muted/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-muted-foreground">Speaking</span>
              <Mic className="size-4 text-[#0f3b82] dark:text-blue-400" />
            </div>
            <p className="text-2xl font-black text-foreground mt-2">
              {sectionScores.speaking}{" "}
              <span className="text-xs font-normal text-muted-foreground">/ 6.0</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Interview & Repeat</p>
          </div>
        </div>
      </section>

      {/* 3. TESTGLIDER SECTION TABS STRIP (Screen 48: Reading | Listening | Writing | Speaking) */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { key: "all", label: "All Items" },
              { key: "reading", label: "Reading" },
              { key: "listening", label: "Listening" },
              { key: "writing", label: "Writing" },
              { key: "speaking", label: "Speaking" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSectionTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors capitalize ${
                  activeSectionTab === tab.key
                    ? "bg-[#0f3b82] text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant={showIncorrectOnly ? "destructive" : "outline"}
            onClick={() => setShowIncorrectOnly(!showIncorrectOnly)}
            className="text-xs"
          >
            <Filter className="size-3.5 mr-1" />
            {showIncorrectOnly ? "Showing Needs Improvement" : "Filter Weak Items"}
          </Button>
        </div>

        {/* 4. ITEM REVIEWS CONTAINER */}
        <div className="space-y-8">
          {filteredResponses.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl">
              <p className="text-sm font-semibold text-muted-foreground">
                No items found for the selected filter.
              </p>
            </div>
          ) : (
            filteredResponses.map((r, idx) => {
              const item = r.content_items;
              const evalObj = r.evaluation;
              const isDeterministic =
                Boolean(r.options && r.options.length > 0) || item.item_type === "build_sentence";
              const correctOpt = r.options.find((o) => o.is_correct);
              const payload = (item.payload || {}) as Record<string, unknown>;

              // Calculate word count for written responses
              const wordCount = r.raw_answer
                ? r.raw_answer.trim().split(/\s+/).filter(Boolean).length
                : 0;

              return (
                <article
                  key={r.id}
                  className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-6"
                >
                  {/* Item Header */}
                  <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded bg-[#0f3b82]/10 text-[#0f3b82] dark:text-blue-300 text-xs font-bold uppercase">
                        {item.section_type}
                      </span>
                      <span className="text-sm font-black text-foreground">
                        Question {idx + 1}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium capitalize">
                        {item.item_type.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div>
                      {isDeterministic ? (
                        r.is_correct ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="size-3.5" /> Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-rose-700 bg-rose-100 dark:bg-rose-950 dark:text-rose-300">
                            <XCircle className="size-3.5" /> Incorrect
                          </span>
                        )
                      ) : evalObj ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground">Band Score:</span>
                          <span className="text-base font-black text-[#0f3b82] dark:text-blue-400">
                            {evalObj.score_band.toFixed(1)} / 6.0
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Evaluating...</span>
                      )}
                    </div>
                  </header>

                  {/* PROMPT / PASSAGE STIMULUS */}
                  <div className="rounded-xl bg-muted/30 border border-border p-5 text-xs text-foreground/90 space-y-2">
                    {payload.title ? (
                      <h4 className="font-bold text-sm text-foreground">{payload.title as string}</h4>
                    ) : null}

                    {payload.prompt ? (
                      <p className="font-semibold text-foreground text-xs leading-relaxed">
                        {payload.prompt as string}
                      </p>
                    ) : null}

                    {/* Email Stimulus Renderer */}
                    {payload.email ? (
                      <div className="my-3 rounded-lg border border-teal-300 bg-teal-50/50 dark:bg-teal-950/20 p-4 font-mono text-[11px] space-y-1">
                        {Boolean(payload.to) && (
                          <p>
                            <span className="font-bold text-teal-800 dark:text-teal-300">To:</span>{" "}
                            {payload.to as string}
                          </p>
                        )}
                        {Boolean(payload.from) && (
                          <p>
                            <span className="font-bold text-teal-800 dark:text-teal-300">From:</span>{" "}
                            {payload.from as string}
                          </p>
                        )}
                        {Boolean(payload.date) && (
                          <p>
                            <span className="font-bold text-teal-800 dark:text-teal-300">Date:</span>{" "}
                            {payload.date as string}
                          </p>
                        )}
                        {Boolean(payload.subject) && (
                          <p>
                            <span className="font-bold text-teal-800 dark:text-teal-300">
                              Subject:
                            </span>{" "}
                            {payload.subject as string}
                          </p>
                        )}
                        <hr className="my-2 border-teal-200 dark:border-teal-800" />
                        <p className="font-sans text-xs whitespace-pre-line text-foreground">
                          {payload.email as string}
                        </p>
                      </div>
                    ) : null}

                    {/* Academic Passage Stimulus */}
                    {payload.passage ? (
                      <div className="my-3 rounded-lg border border-border bg-background p-4 text-xs leading-relaxed text-muted-foreground whitespace-pre-line max-h-60 overflow-y-auto">
                        {payload.passage as string}
                      </div>
                    ) : null}

                    {/* Audio Stimulus for Listening items */}
                    {payload.audioUrl ? (
                      <div className="pt-2">
                        <AudioPlayer
                          audioUrl={payload.audioUrl as string}
                          speechText={(payload.transcript as string) || (payload.prompt as string)}
                          maxPlays={99}
                        />
                        {payload.transcript ? (
                          <div className="mt-2">
                            <button
                              onClick={() => toggleTranscript(r.id)}
                              className="text-[11px] font-semibold text-primary hover:underline"
                            >
                              {expandedTranscripts[r.id]
                                ? "Hide Audio Transcript"
                                : "View Audio Transcript"}
                            </button>
                            {expandedTranscripts[r.id] && (
                              <p className="mt-2 text-[11px] text-muted-foreground bg-background p-3 rounded border border-border leading-relaxed whitespace-pre-line">
                                {payload.transcript as string}
                              </p>
                            )}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  {/* SECTION SPECIFIC REVIEW */}

                  {/* 1. OBJECTIVE MCQ RESPONSES */}
                  {r.options && r.options.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div
                        className={`p-4 rounded-xl border ${
                          r.is_correct
                            ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20"
                            : "border-rose-300 bg-rose-50/50 dark:bg-rose-950/20"
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Your Answer
                        </span>
                        <p className="mt-1 font-semibold text-foreground text-sm">
                          {r.raw_answer ? (
                            r.raw_answer
                          ) : (
                            <span className="text-muted-foreground italic">(No answer selected)</span>
                          )}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          Correct Answer
                        </span>
                        <p className="mt-1 font-semibold text-emerald-800 dark:text-emerald-300 text-sm">
                          {correctOpt?.option_key ? `${correctOpt.option_key}. ` : ""}
                          {correctOpt?.option_text}
                        </p>
                        {correctOpt?.distractor_rationale ? (
                          <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-1">
                            {correctOpt.distractor_rationale}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {/* 2. WRITING SIDE-BY-SIDE COMPARISON (Exact TestGlider Screen 47) */}
                  {item.section_type === "writing" && (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* LEFT: My Answer */}
                        <div className="rounded-xl border border-border bg-background p-5 space-y-3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                              <h3 className="text-sm font-black text-foreground uppercase tracking-wide">
                                My Answer
                              </h3>
                              <span className="text-[11px] font-semibold text-muted-foreground">
                                {wordCount} words
                              </span>
                            </div>
                            <div className="mt-3 text-xs leading-relaxed text-foreground/90 whitespace-pre-line font-serif">
                              {r.raw_answer || (
                                <span className="italic text-muted-foreground">
                                  (No essay submitted)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* RIGHT: Corrected Answer (TestGlider Screen 47) */}
                        <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/10 p-5 space-y-3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between border-b border-blue-200 dark:border-blue-900 pb-2.5">
                              <div className="flex items-center gap-2">
                                <Sparkles className="size-4 text-[#0f3b82] dark:text-blue-400" />
                                <h3 className="text-sm font-black text-[#0f3b82] dark:text-blue-400 uppercase tracking-wide">
                                  Corrected Answer
                                </h3>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0f3b82]/10 text-[#0f3b82] dark:text-blue-300">
                                AI Enhanced
                              </span>
                            </div>
                            <div className="mt-3 text-xs leading-relaxed text-foreground/90 whitespace-pre-line font-serif">
                              {evalObj?.improved_response ||
                                "Model correction is being generated based on ETS TOEFL scoring criteria."}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Line-by-line Corrections Breakdown */}
                      {evalObj?.corrections && evalObj.corrections.length > 0 ? (
                        <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Targeted Grammatical & Stylistic Corrections
                          </h4>
                          <div className="space-y-2">
                            {evalObj.corrections.map((c, ci) => (
                              <div
                                key={ci}
                                className="rounded-lg border border-border bg-background p-3 text-xs space-y-1"
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="line-through text-rose-600 dark:text-rose-400 font-mono">
                                    {c.original}
                                  </span>
                                  <ArrowRight className="size-3.5 text-muted-foreground" />
                                  <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                                    {c.improved}
                                  </span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                  {c.explanation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* 3. SPEAKING VOICE RECORDING & RUBRIC REVIEW */}
                  {item.section_type === "speaking" && (
                    <div className="space-y-5 pt-2">
                      {/* Audio Player for Student's Recorded Voice */}
                      <div className="rounded-xl border border-[#0f3b82]/20 bg-blue-50/20 dark:bg-blue-950/20 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mic className="size-4 text-[#0f3b82] dark:text-blue-400" />
                            <span className="text-xs font-bold text-foreground">
                              Your Voice Recording
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            {r.audioPlayUrl ? "Playable Audio" : "Speech Captured"}
                          </span>
                        </div>

                        {r.audioPlayUrl ? (
                          <div className="pt-1">
                            <audio controls className="w-full h-9">
                              <source src={r.audioPlayUrl} type="audio/webm" />
                              <source src={r.audioPlayUrl} type="audio/mp4" />
                              Your browser does not support audio playback.
                            </audio>
                          </div>
                        ) : (
                          <div className="rounded-lg bg-background p-3 border border-border text-xs text-muted-foreground flex items-center gap-2">
                            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                            <span>Speech recording captured and evaluated.</span>
                          </div>
                        )}
                      </div>

                      {/* Evaluated Traits */}
                      {evalObj?.traits ? (
                        <div className="rounded-xl border border-border bg-background p-4 space-y-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Rubric Breakdown (Pronunciation, Fluency & Grammar)
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {Object.entries(evalObj.traits).map(([trait, val]) => (
                              <div key={trait} className="p-2.5 rounded-lg bg-muted/40 text-center">
                                <span className="text-[10px] uppercase font-semibold text-muted-foreground block truncate">
                                  {trait.replace(/_/g, " ")}
                                </span>
                                <span className="text-base font-black text-foreground mt-0.5 block">
                                  {typeof val === "number" ? val.toFixed(1) : val}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {/* Polished Model Transcript */}
                      {evalObj?.improved_response ? (
                        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2 text-xs">
                          <span className="font-bold text-primary uppercase text-[10px] flex items-center gap-1.5">
                            <Sparkles className="size-3" /> Model Response
                          </span>
                          <p className="text-foreground/90 leading-relaxed font-serif">
                            {evalObj.improved_response}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* NEXT ACTION RECOMMENDATIONS FOR THIS ITEM */}
                  {evalObj?.next_actions && evalObj.next_actions.length > 0 ? (
                    <div className="pt-2 border-t border-border/40 text-xs flex items-center gap-2 text-muted-foreground">
                      <Target className="size-3.5 text-primary shrink-0" />
                      <span>
                        <strong>Key Takeaway:</strong> {evalObj.next_actions[0]}
                      </span>
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* 5. TESTGLIDER PERSONALIZED RECOMMENDATIONS & NEXT STEPS */}
      <section className="rounded-2xl border border-border bg-card p-8 shadow-sm space-y-5">
        <div className="border-b border-border/60 pb-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0f3b82] dark:text-blue-400">
              Personalized Improvement Plan
            </span>
            <h2 className="text-xl font-black text-foreground mt-1">
              Recommended Focus Areas for Target Score
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/20 dark:bg-blue-950/10 p-5 space-y-2 flex flex-col justify-between">
            <div>
              <span className="rounded bg-[#0f3b82]/10 text-[#0f3b82] dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold uppercase">
                Priority 1
              </span>
              <h4 className="text-sm font-bold text-foreground mt-2">
                Inference & Academic Reading
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                Strengthen paragraph synthesis, pronoun reference comprehension, and scientific
                context clues.
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="w-full mt-4 text-xs">
              <Link to="/test">
                Practice Reading <ChevronRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-2 flex flex-col justify-between">
            <div>
              <span className="rounded bg-muted text-muted-foreground px-2 py-0.5 text-[10px] font-bold uppercase">
                Priority 2
              </span>
              <h4 className="text-sm font-bold text-foreground mt-2">
                Academic Discussion Expansion
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                Expand complex subordinate clauses and counter-argument synthesis in writing tasks.
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="w-full mt-4 text-xs">
              <Link to="/test">
                Practice Writing <ChevronRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-2 flex flex-col justify-between">
            <div>
              <span className="rounded bg-muted text-muted-foreground px-2 py-0.5 text-[10px] font-bold uppercase">
                Priority 3
              </span>
              <h4 className="text-sm font-bold text-foreground mt-2">
                Speaking Fluency & Natural Pacing
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                Practice immediate 7-second response initiation and coherent transitional signposts.
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="w-full mt-4 text-xs">
              <Link to="/test">
                Practice Speaking <ChevronRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
