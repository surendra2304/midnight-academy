/**
 * Unified TOEFL Score Report & Review Experience
 * Reference-inspired summary layout for independent TOEFL-style practice.
 * Supports eight independent TOEFL-style practice sets.
 */

import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Target,
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
  Loader2,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/test-runner/listening/AudioPlayer";
import { retryToeflEvaluation } from "@/lib/tests/engine.functions";
import { hasFullToeflSectionCoverage } from "@/lib/evaluation/score-coverage";
import { toast } from "sonner";

export interface UnifiedScoreReportProps {
  reportData: {
    attempt: {
      id: string;
      status: string;
      tests?: { name: string; category: string; difficulty: string };
      score: number | null;
      exam_mode?: string | null;
      selected_section_type?: string | null;
      started_at?: string;
      completed_at: string | null;
      evaluation_status?: string | null;
    };
    report: {
      overall_band: number | null;
      reading_band: number | null;
      listening_band: number | null;
      writing_band: number | null;
      speaking_band: number | null;
      comparable_score: number | null;
      summary?: string;
      skill_breakdown?: Record<string, unknown>;
    } | null;
    userEmail?: string;
    targetScore?: number | null;
    attemptSections?: Array<{
      id: string;
      section_id: string;
      status: string;
      raw_score: number;
      section_band: number | null;
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
        model_id?: string;
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

type ReportResponse = UnifiedScoreReportProps["reportData"]["responses"][number];

function getResponseScoreRatio(response: ReportResponse): number | null {
  if (typeof response.score === "number" && Number.isFinite(response.score)) {
    return Math.max(0, Math.min(1, response.score > 1 ? response.score / 100 : response.score));
  }
  if (typeof response.evaluation?.score_band === "number") {
    return Math.max(0, Math.min(1, response.evaluation.score_band / 6));
  }
  if (typeof response.is_correct === "boolean") return response.is_correct ? 1 : 0;
  return null;
}

function parseJsonStringArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((x) => String(x ?? ""));
      }
    } catch {
      // fall through
    }
  }
  return trimmed
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function UnifiedScoreReportView({ reportData }: UnifiedScoreReportProps) {
  const { attempt, report, userEmail = "Signed-in learner", responses } = reportData;

  const [activeSectionTab, setActiveSectionTab] = useState<string>("all");
  const [showIncorrectOnly, setShowIncorrectOnly] = useState(false);
  const [expandedTranscripts, setExpandedTranscripts] = useState<Record<string, boolean>>({});

  const attemptedSectionTypes = new Set(
    (reportData.attemptSections ?? [])
      .map((section) => section.sections?.section_type)
      .filter((section): section is string => Boolean(section)),
  );
  const scoredSectionTypes = new Set(
    (reportData.attemptSections ?? [])
      .filter((section) => typeof section.section_band === "number" && section.section_band >= 1)
      .map((section) => section.sections?.section_type)
      .filter((section): section is string => Boolean(section)),
  );
  const isSectionPractice =
    attempt.exam_mode === "section" ||
    Boolean(attempt.selected_section_type) ||
    attemptedSectionTypes.size === 1;
  const sectionPracticeName =
    attempt.selected_section_type ?? [...attemptedSectionTypes][0] ?? "Section";
  const sectionPracticeLabel =
    sectionPracticeName.charAt(0).toUpperCase() + sectionPracticeName.slice(1);
  const fullScoreCoverage = hasFullToeflSectionCoverage([...scoredSectionTypes]);
  const overallBand =
    report &&
    (isSectionPractice ? scoredSectionTypes.has(sectionPracticeName) : scoredSectionTypes.size > 0)
      ? report.overall_band
      : null;
  const comparable120 =
    !isSectionPractice && fullScoreCoverage && (report?.comparable_score ?? 0) > 0
      ? report!.comparable_score
      : null;

  const formattedDate =
    (attempt.completed_at ?? attempt.started_at)
      ? new Date(attempt.completed_at ?? attempt.started_at!).toLocaleDateString(undefined, {
          month: "long",
          day: "2-digit",
          year: "numeric",
        })
      : "Date unavailable";

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

  // Only show section scores that the evaluator actually produced.
  const sectionScore = (section: string, band: number | null | undefined) =>
    scoredSectionTypes.has(section) && typeof band === "number" && band >= 1
      ? band.toFixed(1)
      : "—";
  const sectionScores = {
    reading: sectionScore("reading", report?.reading_band),
    listening: sectionScore("listening", report?.listening_band),
    writing: sectionScore("writing", report?.writing_band),
    speaking: sectionScore("speaking", report?.speaking_band),
  };
  const unscoredSectionLabels = [...attemptedSectionTypes]
    .filter((section) => !scoredSectionTypes.has(section))
    .map((section) => section.charAt(0).toUpperCase() + section.slice(1));

  // Filter responses by tab
  const evaluationModels = responses
    .map((response) => response.evaluation?.model_id)
    .filter((model): model is string => Boolean(model));
  const hasAiEvaluation = evaluationModels.some((model) => /gemini|gpt-|claude/i.test(model));
  const hasRuleBasedEvaluation = evaluationModels.some((model) =>
    /^(?:midnight-|deterministic|testglider-(?:rubric|speaking)-evaluator)/i.test(model),
  );

  const filteredResponses = responses.filter((r) => {
    if (!r.content_items) return false;
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

  const savedRecommendations = [...(reportData.recommendations ?? [])]
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);
  const sectionResultTotals = new Map<string, { total: number; count: number }>();
  for (const response of responses) {
    const section = response.content_items?.section_type;
    const score = getResponseScoreRatio(response);
    if (!section || score === null) continue;
    const current = sectionResultTotals.get(section) ?? { total: 0, count: 0 };
    sectionResultTotals.set(section, { total: current.total + score, count: current.count + 1 });
  }
  const measuredSectionFocus = [...sectionResultTotals.entries()]
    .map(([section, result]) => ({ section, average: result.total / result.count }))
    .sort((a, b) => a.average - b.average)
    .slice(0, 3);

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto">
      {/* 1. TESTGLIDER TOP NAVIGATION: < All Records */}
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <Link
          to="/test"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <ChevronLeft className="size-4" /> All Mock Tests &amp; Records
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
              Midnight Academy · TOEFL Practice Review
            </span>
            <h1 className="text-3xl font-black tracking-tight text-foreground mt-1">
              SUMMARY REPORT
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{userEmail}</span>
              <span>•</span>
              <span className="font-bold text-foreground">
                {attempt.tests?.name || "TOEFL practice set"}
              </span>
              <span>•</span>
              <span className="inline-block px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-[#0f3b82] dark:text-blue-300 font-bold text-[11px]">
                2026 practice format
              </span>
              <span>•</span>
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* TestGlider Score Badge */}
          <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-xl border border-border">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                {isSectionPractice
                  ? `${sectionPracticeLabel} practice band`
                  : fullScoreCoverage
                    ? "Overall practice band"
                    : "Partial practice average"}
              </span>
              <span className="text-4xl font-black text-[#0f3b82] dark:text-blue-400">
                {overallBand === null ? "—" : overallBand.toFixed(1)}
              </span>
              <span className="text-xs font-semibold text-muted-foreground ml-1.5">out of 6.0</span>
            </div>
            <div className="h-10 w-px bg-border mx-1" />
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                {isSectionPractice
                  ? "Full-test comparison"
                  : fullScoreCoverage
                    ? "Practice comparison"
                    : "Comparison unavailable"}
              </span>
              <span className="text-2xl font-black text-foreground">
                {isSectionPractice || comparable120 === null ? "—" : `≈${comparable120}`}
              </span>
              <span className="ml-1 text-xs text-muted-foreground">
                {isSectionPractice
                  ? "full test required"
                  : fullScoreCoverage
                    ? "/ 120"
                    : "all four sections required"}
              </span>
            </div>
          </div>
        </div>

        {/* Score-processing status */}
        {attempt.status !== "evaluated" &&
        attempt.evaluation_status !== "pending" &&
        attempt.evaluation_status !== "failed" ? (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-950 dark:bg-blue-950/30 dark:text-blue-200">
            Answer review is locked while this attempt is active. Submit the test and wait for
            scoring to finish before opening explanations.
          </div>
        ) : attempt.evaluation_status === "pending" ? (
          <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 dark:bg-amber-950/30 dark:text-amber-200">
            <div className="flex items-center gap-3">
              <Loader2 className="size-5 shrink-0 animate-spin text-amber-600" />
              <p className="font-medium">
                Your saved responses are being scored and the report is being prepared.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
              className="shrink-0 text-xs"
            >
              Refresh status
            </Button>
          </div>
        ) : attempt.evaluation_status === "failed" ? (
          <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-xs text-destructive">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-5 shrink-0 text-destructive" />
              <div>
                <p className="font-bold">Score processing did not finish</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Your submitted answers are still saved. You can retry report generation.
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
              {isRetrying ? "Retrying…" : "Retry scoring"}
            </Button>
          </div>
        ) : attempt.evaluation_status === "completed" && report ? (
          <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            <span>
              {isSectionPractice && !scoredSectionTypes.has(sectionPracticeName)
                ? `${sectionPracticeLabel} responses could not be scored, so the section band and full-test comparison are unavailable.`
                : !isSectionPractice && !fullScoreCoverage
                  ? `Partial practice estimate: ${scoredSectionTypes.size} of 4 sections were scored${unscoredSectionLabels.length ? `; unscored: ${unscoredSectionLabels.join(", ")}` : ""}. The full-test comparison is hidden until all four sections have valid scores.`
                  : hasAiEvaluation && hasRuleBasedEvaluation
                    ? "This report combines AI-assisted and rule-based practice feedback. Score comparisons are estimates, not official TOEFL results."
                    : hasAiEvaluation
                      ? "AI-assisted rubric feedback is included. Score comparisons are practice estimates, not official TOEFL results."
                      : hasRuleBasedEvaluation
                        ? "Open-response feedback uses deterministic practice rubrics, not AI scoring. Score comparisons are estimates, not official TOEFL results."
                        : "Objective items were scored; no open-response rubric feedback was recorded. Score comparisons are estimates, not official TOEFL results."}
            </span>
          </div>
        ) : null}

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
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Cloze, Daily Life &amp; Academic
            </p>
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
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Responses, Convos &amp; Lectures
            </p>
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
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Sentences, Email &amp; Discussion
            </p>
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
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Listen &amp; Repeat + Interview
            </p>
          </div>
        </div>
      </section>

      {/* 3. TESTGLIDER SECTION TABS STRIP */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { key: "all", label: `All Items (${responses.length})` },
              {
                key: "reading",
                label: `Reading (${responses.filter((r) => r.content_items?.section_type === "reading").length})`,
              },
              {
                key: "listening",
                label: `Listening (${responses.filter((r) => r.content_items?.section_type === "listening").length})`,
              },
              {
                key: "writing",
                label: `Writing (${responses.filter((r) => r.content_items?.section_type === "writing").length})`,
              },
              {
                key: "speaking",
                label: `Speaking (${responses.filter((r) => r.content_items?.section_type === "speaking").length})`,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSectionTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
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
        <div className="space-y-6">
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
              const payload = (item.payload || {}) as Record<string, unknown>;
              const answerKey = (payload.answerKey || {}) as Record<string, unknown>;

              const isCompleteWords = item.item_type === "complete_words";
              const isBuildSentence = item.item_type === "build_sentence";
              const isMcq = Boolean(r.options && r.options.length > 0);
              const isDeterministic = isMcq || isBuildSentence || isCompleteWords;

              const correctOpt = r.options.find((o) => o.is_correct);
              const selectedOpt = r.options.find(
                (o) =>
                  r.raw_answer && o.option_key.toUpperCase() === r.raw_answer.trim().toUpperCase(),
              );

              const explanationText =
                (payload.explanation as string) ||
                (answerKey.explanation as string) ||
                correctOpt?.distractor_rationale ||
                "";

              const modelResponseText =
                evalObj?.improved_response ||
                (payload.modelAnswer as string) ||
                (payload.sampleAnswer as string) ||
                (answerKey.sampleHighScoringResponse as string) ||
                (answerKey.targetSentence as string) ||
                "";

              // Email stimulus extraction
              const emailHeaderObj = (
                typeof payload.emailHeader === "object" && payload.emailHeader !== null
                  ? payload.emailHeader
                  : {}
              ) as Record<string, unknown>;

              const isEmailStimulus =
                payload.format === "email" ||
                payload.contextType === "email" ||
                Boolean(payload.emailHeader);

              const audioSpeechText =
                (payload.transcript as string) ||
                (payload.stimulusText as string) ||
                (payload.targetSentence as string) ||
                "";

              // Calculate word count for written essays
              const wordCount =
                r.raw_answer && !isBuildSentence
                  ? r.raw_answer.trim().split(/\s+/).filter(Boolean).length
                  : 0;

              return (
                <article
                  key={r.id}
                  className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-5"
                >
                  {/* Item Header */}
                  <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded bg-[#0f3b82]/10 text-[#0f3b82] dark:text-blue-300 text-xs font-bold uppercase">
                        {item.section_type}
                      </span>
                      <span className="text-sm font-black text-foreground">Question {idx + 1}</span>
                      <span className="text-xs text-muted-foreground font-medium capitalize">
                        {item.item_type.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div>
                      {isDeterministic ? (
                        r.is_correct ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="size-3.5" /> Correct
                            {isCompleteWords && typeof r.score === "number"
                              ? ` (${Math.round(r.score * 100)}%)`
                              : ""}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-rose-700 bg-rose-100 dark:bg-rose-950 dark:text-rose-300">
                            <XCircle className="size-3.5" />{" "}
                            {isCompleteWords && typeof r.score === "number" && r.score > 0
                              ? `Partial (${Math.round(r.score * 100)}%)`
                              : r.raw_answer
                                ? "Incorrect"
                                : "Unanswered"}
                          </span>
                        )
                      ) : evalObj && r.raw_answer?.trim() ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground">
                            Practice estimate:
                          </span>
                          <span className="text-base font-black text-[#0f3b82] dark:text-blue-400">
                            {evalObj.score_band.toFixed(1)} / 6.0
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {r.raw_answer ? "No rubric score available" : "No response submitted"}
                        </span>
                      )}
                    </div>
                  </header>

                  {/* PROMPT / PASSAGE STIMULUS */}
                  <div className="rounded-xl bg-muted/30 border border-border p-5 text-xs text-foreground/90 space-y-2.5">
                    {payload.title ? (
                      <h4 className="font-bold text-sm text-foreground">
                        {typeof payload.title === "string" ? payload.title : ""}
                      </h4>
                    ) : null}

                    {payload.prompt ? (
                      <p className="font-semibold text-foreground text-xs leading-relaxed whitespace-pre-line">
                        {typeof payload.prompt === "string" ? payload.prompt : ""}
                      </p>
                    ) : null}

                    {isEmailStimulus ? (
                      <div className="my-2 rounded-lg border border-teal-300 bg-teal-50/50 dark:bg-teal-950/20 p-4 font-mono text-[11px] space-y-1">
                        {emailHeaderObj.from ? (
                          <p>
                            <span className="font-bold text-teal-800 dark:text-teal-300">
                              From:
                            </span>{" "}
                            {String(emailHeaderObj.from)}
                          </p>
                        ) : null}
                        {emailHeaderObj.date ? (
                          <p>
                            <span className="font-bold text-teal-800 dark:text-teal-300">
                              Date:
                            </span>{" "}
                            {String(emailHeaderObj.date)}
                          </p>
                        ) : null}
                        {emailHeaderObj.subject ? (
                          <p>
                            <span className="font-bold text-teal-800 dark:text-teal-300">
                              Subject:
                            </span>{" "}
                            {String(emailHeaderObj.subject)}
                          </p>
                        ) : null}
                        {payload.passage ? (
                          <>
                            <hr className="my-2 border-teal-200 dark:border-teal-800" />
                            <p className="font-sans text-xs whitespace-pre-line text-foreground">
                              {String(payload.passage)}
                            </p>
                          </>
                        ) : null}
                      </div>
                    ) : payload.passage && !isCompleteWords ? (
                      <div className="my-2 rounded-lg border border-border bg-background p-4 text-xs leading-relaxed text-muted-foreground whitespace-pre-line max-h-56 overflow-y-auto">
                        {String(payload.passage)}
                      </div>
                    ) : null}

                    {/* Audio Stimulus for Listening & Speaking items */}
                    {(payload.audioUrl ||
                      (item.section_type === "listening" && audioSpeechText) ||
                      (item.section_type === "speaking" && audioSpeechText)) && (
                      <div className="pt-2 space-y-2">
                        <AudioPlayer
                          audioUrl={payload.audioUrl as string | undefined}
                          speechText={audioSpeechText}
                          maxPlays={99}
                          autoPlay={false}
                          allowControls={true}
                        />
                        {audioSpeechText ? (
                          <div>
                            <button
                              type="button"
                              onClick={() => toggleTranscript(r.id)}
                              className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                            >
                              {expandedTranscripts[r.id]
                                ? "Hide Audio Transcript"
                                : "View Audio Transcript"}
                            </button>
                            {expandedTranscripts[r.id] && (
                              <p className="mt-2 text-xs text-foreground bg-background p-3.5 rounded-lg border border-border leading-relaxed whitespace-pre-line">
                                {audioSpeechText}
                              </p>
                            )}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* SECTION & TASK SPECIFIC REVIEW */}

                  {/* 1. COMPLETE THE WORDS (10-Blank Cloze Breakdown) */}
                  {isCompleteWords && Array.isArray(payload.blanks) ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                        {(
                          payload.blanks as Array<{
                            blankIndex?: number;
                            index?: number;
                            prefix?: string;
                          }>
                        ).map((b, bIdx) => {
                          const userTokens = parseJsonStringArray(r.raw_answer);
                          const typed = (userTokens[bIdx] || "").trim();
                          const answerIndex = b.blankIndex ?? bIdx;
                          const expected = String(
                            (answerKey.correctAnswers as string[] | undefined)?.[answerIndex] ?? "",
                          ).trim();
                          const fullWord = `${b.prefix || ""}${expected}`;
                          const isBlankCorrect =
                            typed.toLowerCase() === expected.toLowerCase() ||
                            typed.toLowerCase() === fullWord.toLowerCase();

                          return (
                            <div
                              key={bIdx}
                              className={`rounded-xl border p-3 text-xs ${
                                isBlankCorrect
                                  ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20"
                                  : "border-rose-300 bg-rose-50/50 dark:bg-rose-950/20"
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                                <span>Blank #{bIdx + 1}</span>
                                {isBlankCorrect ? (
                                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                                ) : (
                                  <XCircle className="size-3.5 text-rose-600" />
                                )}
                              </div>
                              <p className="mt-1 font-bold text-foreground">
                                Correct:{" "}
                                <span className="text-emerald-700 dark:text-emerald-400">
                                  {fullWord}
                                </span>
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                Yours:{" "}
                                {typed ? (
                                  <span className="font-mono font-semibold text-foreground">
                                    {b.prefix || ""}
                                    {typed}
                                  </span>
                                ) : (
                                  <span className="italic">(blank)</span>
                                )}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      {explanationText && (
                        <div className="rounded-xl border border-blue-200 bg-blue-50/40 dark:bg-blue-950/20 p-4 text-xs text-foreground">
                          <span className="font-bold text-[#0f3b82] dark:text-blue-300">
                            Answer Key Explanation:{" "}
                          </span>
                          {explanationText}
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* 2. BUILD A SENTENCE REVIEW */}
                  {isBuildSentence ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div
                          className={`p-4 rounded-xl border ${
                            r.is_correct
                              ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20"
                              : "border-rose-300 bg-rose-50/50 dark:bg-rose-950/20"
                          }`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Your Assembled Sentence
                          </span>
                          <p className="mt-1.5 font-semibold text-foreground text-sm">
                            {(() => {
                              const chips = parseJsonStringArray(r.raw_answer);
                              if (chips.length > 0) {
                                const prefix = (payload.sentencePrefix as string) || "";
                                const punct = (payload.terminalPunctuation as string) || ".";
                                return `${prefix ? `${prefix} ` : ""}${chips.join(" ")}${punct}`;
                              }
                              return (
                                <span className="text-muted-foreground italic">
                                  (No sentence assembled)
                                </span>
                              );
                            })()}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            Model answer
                          </span>
                          <p className="mt-1.5 font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                            {(answerKey.targetSentence as string) ||
                              ((answerKey.acceptedSequences as string[][])?.[0] || []).join(" ")}
                          </p>
                          {explanationText && (
                            <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400/90 mt-1">
                              {explanationText}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* 3. OBJECTIVE MCQ RESPONSES (Reading & Listening) */}
                  {isMcq ? (
                    <div className="space-y-3">
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
                              selectedOpt ? (
                                `${selectedOpt.option_key}. ${selectedOpt.option_text}`
                              ) : (
                                r.raw_answer
                              )
                            ) : (
                              <span className="text-muted-foreground italic">
                                (No answer selected)
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            Correct Answer
                          </span>
                          <p className="mt-1 font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                            {correctOpt?.option_key ? `${correctOpt.option_key}. ` : ""}
                            {correctOpt?.option_text}
                          </p>
                          {explanationText ? (
                            <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400/90 mt-1.5 leading-relaxed">
                              {explanationText}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* 4. WRITING ESSAY SIDE-BY-SIDE COMPARISON (Write an Email & Academic Discussion) */}
                  {item.section_type === "writing" && !isBuildSentence && (
                    <div className="space-y-4 pt-2">
                      {/* Evaluated Traits */}
                      {evalObj?.traits && typeof evalObj.traits === "object" ? (
                        <div className="rounded-xl border border-border bg-background p-4 space-y-2.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Writing Rubric Trait Breakdown (1.0 – 6.0 Scale)
                          </span>
                          <div className="grid grid-cols-3 gap-3">
                            {Object.entries(evalObj.traits).map(([trait, val]) => (
                              <div key={trait} className="p-2.5 rounded-lg bg-muted/40 text-center">
                                <span className="text-[10px] uppercase font-semibold text-muted-foreground block truncate">
                                  {trait.replace(/_/g, " ")}
                                </span>
                                <span className="text-base font-black text-foreground mt-0.5 block">
                                  {typeof val === "number" ? val.toFixed(1) : String(val)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

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
                                  (No written response was submitted.)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* RIGHT: Corrected / Model Answer */}
                        <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/10 p-5 space-y-3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between border-b border-blue-200 dark:border-blue-900 pb-2.5">
                              <div className="flex items-center gap-2">
                                <Sparkles className="size-4 text-[#0f3b82] dark:text-blue-400" />
                                <h3 className="text-sm font-black text-[#0f3b82] dark:text-blue-400 uppercase tracking-wide">
                                  Example Response
                                </h3>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0f3b82]/10 text-[#0f3b82] dark:text-blue-300">
                                Example only
                              </span>
                            </div>
                            <div className="mt-3 text-xs leading-relaxed text-foreground/90 whitespace-pre-line font-serif">
                              {modelResponseText ||
                                "No example response was provided for this item."}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Line-by-line Corrections Breakdown */}
                      {evalObj?.corrections && evalObj.corrections.length > 0 ? (
                        <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Targeted Grammatical &amp; Stylistic Corrections
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

                  {/* 5. SPEAKING VOICE RECORDING & RUBRIC REVIEW */}
                  {item.section_type === "speaking" && (
                    <div className="space-y-4 pt-2">
                      {/* Audio Player for Student's Recorded Voice */}
                      <div className="rounded-xl border border-[#0f3b82]/20 bg-blue-50/20 dark:bg-blue-950/20 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mic className="size-4 text-[#0f3b82] dark:text-blue-400" />
                            <span className="text-xs font-bold text-foreground">
                              Your Spoken Response
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            {r.audioPlayUrl
                              ? "Playable recording"
                              : r.raw_answer
                                ? evalObj
                                  ? "Response scored"
                                  : "Response saved · score unavailable"
                                : "No response"}
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
                        ) : r.raw_answer &&
                          !r.raw_answer.startsWith("recorded-audio-") &&
                          !r.raw_answer.startsWith("data:audio/") &&
                          !r.raw_answer.startsWith("http://") &&
                          !r.raw_answer.startsWith("https://") ? (
                          <div className="rounded-lg border border-border bg-background p-3 text-xs text-foreground">
                            {r.raw_answer}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
                            <AlertCircle className="size-4 shrink-0 text-amber-600" />
                            <span>
                              {r.raw_answer
                                ? "A recording was submitted, but a playable recording link is unavailable."
                                : "No recording was submitted for this prompt."}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Evaluated Traits */}
                      {evalObj?.traits && typeof evalObj.traits === "object" ? (
                        <div className="rounded-xl border border-border bg-background p-4 space-y-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {evalObj.model_id &&
                            /^(?:midnight-|deterministic)/i.test(evalObj.model_id)
                              ? "Transcript-based estimate · pronunciation and delivery are not assessed"
                              : "Speaking practice rubric traits · not an official TOEFL score"}
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {Object.entries(evalObj.traits).map(([trait, val]) => (
                              <div key={trait} className="p-2.5 rounded-lg bg-muted/40 text-center">
                                <span className="text-[10px] uppercase font-semibold text-muted-foreground block truncate">
                                  {trait.replace(/_/g, " ")}
                                </span>
                                <span className="text-base font-black text-foreground mt-0.5 block">
                                  {typeof val === "number"
                                    ? val.toFixed(1)
                                    : typeof val === "string"
                                      ? val
                                      : ""}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {/* Polished Model Transcript */}
                      {modelResponseText ? (
                        <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/10 p-4 space-y-2 text-xs">
                          <span className="font-bold text-[#0f3b82] dark:text-blue-400 uppercase text-[10px] flex items-center gap-1.5">
                            <Sparkles className="size-3.5" /> Example Response
                          </span>
                          <p className="text-foreground/90 leading-relaxed font-serif">
                            {modelResponseText}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* NEXT ACTION RECOMMENDATIONS FOR THIS ITEM */}
                  {Array.isArray(evalObj?.next_actions) && evalObj.next_actions.length > 0 ? (
                    <div className="pt-2 border-t border-border/40 text-xs flex items-center gap-2 text-muted-foreground">
                      <Target className="size-3.5 text-primary shrink-0" />
                      <span>
                        <strong>Key Takeaway:</strong>{" "}
                        {typeof evalObj.next_actions[0] === "string"
                          ? evalObj.next_actions[0]
                          : JSON.stringify(evalObj.next_actions[0])}
                      </span>
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="border-b border-border/60 pb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#0f3b82] dark:text-blue-400">
            Next steps
          </span>
          <h2 className="mt-1 text-xl font-black text-foreground">Practice suggestions</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {savedRecommendations.length > 0
              ? "Saved study recommendations for your account."
              : measuredSectionFocus.length > 0
                ? "Suggested from the lower-scoring sections in this attempt; these are practice estimates."
                : "Complete and score more items to get a section focus based on your results."}
          </p>
        </div>

        {savedRecommendations.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-3">
            {savedRecommendations.map((recommendation, index) => (
              <article
                key={recommendation.id}
                className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-muted/20 p-5"
              >
                <div>
                  <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                    Priority {recommendation.priority || index + 1}
                  </span>
                  <p className="mt-3 text-sm leading-6 text-foreground">{recommendation.reason}</p>
                </div>
                <Button asChild size="sm" variant="outline" className="w-full text-xs">
                  <Link to="/test">
                    Open practice library <ChevronRight className="ml-1 size-3.5" />
                  </Link>
                </Button>
              </article>
            ))}
          </div>
        ) : measuredSectionFocus.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-3">
            {measuredSectionFocus.map(({ section, average }) => {
              const label = section.charAt(0).toUpperCase() + section.slice(1);
              return (
                <article
                  key={section}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-muted/20 p-5"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Current attempt
                    </span>
                    <h3 className="mt-2 text-base font-bold text-foreground">Review {label}</h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Scored items in this section averaged {Math.round(average * 100)}% on this
                      attempt.
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline" className="w-full text-xs">
                    <Link to="/test">
                      Practice {label} <ChevronRight className="ml-1 size-3.5" />
                    </Link>
                  </Button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
            No scored items are available for a section-based suggestion yet.
          </div>
        )}
      </section>
    </div>
  );
}
