/**
 * Writing Review & AI Evaluation View
 * Displays 1.0 - 6.0 score band, trait scores, strengths, weaknesses, inline corrections, and model answer comparison.
 */

import React from "react";
import type { ClientContentItem } from "@/lib/tests/session-state";
import type { StructuredEvaluationResult } from "@/lib/evaluation/evaluation-service.server";
import { CheckCircle2, AlertCircle, Sparkles, BookOpen, ArrowRight, Award } from "lucide-react";

export interface WritingReviewItemData {
  item: ClientContentItem;
  studentResponse: string;
  evaluation?: StructuredEvaluationResult;
  modelAnswer?: string;
  isDeterministic?: boolean;
  deterministicScore?: number;
  deterministicFeedback?: string;
}

export interface WritingReviewViewProps {
  reviews: WritingReviewItemData[];
}

export function WritingReviewView({ reviews }: WritingReviewViewProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="rounded-xl border border-border bg-card/60 p-6">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Writing Section Feedback
        </span>
        <h2 className="text-xl font-extrabold text-foreground mt-1">
          AI Rubric Evaluation & Corrections
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Review your 1.0–6.0 score bands, trait breakdown, grammatical corrections, and model
          response.
        </p>
      </section>

      <div className="space-y-8">
        {reviews.map((rev, idx) => {
          const {
            item,
            studentResponse,
            evaluation,
            modelAnswer,
            isDeterministic,
            deterministicScore,
            deterministicFeedback,
          } = rev;

          return (
            <article
              key={item.id}
              className="rounded-xl border border-border bg-card/40 p-6 space-y-6"
            >
              {/* Task Header */}
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">Task {idx + 1}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs font-semibold text-primary uppercase">
                      {item.itemType.replace(/_/g, " ")}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground mt-1">
                    {(item.payload?.title as string) || (item.payload?.prompt as string)}
                  </h3>
                </div>

                {/* Score Band Badge */}
                {isDeterministic ? (
                  <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2">
                    <Award className="size-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">Objective Score</p>
                      <p className="text-base font-black text-primary">
                        {deterministicScore === 1.0 ? "100%" : "0%"}
                      </p>
                    </div>
                  </div>
                ) : evaluation ? (
                  <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2">
                    <Award className="size-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">
                        TOEFL Band Score
                      </p>
                      <p className="text-base font-black text-primary">
                        {evaluation.score_band.toFixed(1)} / 6.0
                      </p>
                    </div>
                  </div>
                ) : null}
              </header>

              {/* Trait breakdown (for AI-evaluated tasks) */}
              {evaluation?.traits ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border bg-surface-2/30 p-3 text-center">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase">
                      Task Fulfillment
                    </p>
                    <p className="text-lg font-extrabold text-foreground">
                      {evaluation.traits.task_fulfillment?.toFixed(1) || "—"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-surface-2/30 p-3 text-center">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase">
                      Organization
                    </p>
                    <p className="text-lg font-extrabold text-foreground">
                      {evaluation.traits.organization?.toFixed(1) || "—"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-surface-2/30 p-3 text-center">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase">
                      Language Use
                    </p>
                    <p className="text-lg font-extrabold text-foreground">
                      {evaluation.traits.language_use?.toFixed(1) || "—"}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Side-by-Side: Student Submission vs Improved/Model Response */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                {/* Original */}
                <div className="rounded-lg border border-border bg-background/50 p-4 space-y-2">
                  <span className="font-bold text-muted-foreground uppercase text-[10px]">
                    Your Submission:
                  </span>
                  <p className="text-foreground/90 whitespace-pre-line">
                    {studentResponse || "(No response submitted)"}
                  </p>
                  {deterministicFeedback ? (
                    <p className="text-muted-foreground italic border-t border-border/50 pt-2">
                      {deterministicFeedback}
                    </p>
                  ) : null}
                </div>

                {/* Improved / Model */}
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2">
                  <span className="flex items-center gap-1 font-bold text-primary uppercase text-[10px]">
                    <Sparkles className="size-3" /> Polished Response:
                  </span>
                  <p className="text-foreground/90 whitespace-pre-line">
                    {evaluation?.improved_response || modelAnswer || "Model response available."}
                  </p>
                </div>
              </div>

              {/* Actionable Grammar & Style Corrections */}
              {evaluation?.corrections && evaluation.corrections.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Specific Corrections & Alternatives:
                  </h4>
                  <div className="space-y-2">
                    {evaluation.corrections.map((corr, cIdx) => (
                      <div
                        key={cIdx}
                        className="rounded-lg border border-border/80 bg-background/60 p-3 text-xs space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="line-through text-destructive font-medium">
                            {corr.original}
                          </span>
                          <ArrowRight className="size-3 text-muted-foreground" />
                          <span className="font-bold text-success">{corr.improved}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{corr.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Strengths & Next Actions */}
              {evaluation?.strengths || evaluation?.next_actions ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {evaluation?.strengths && evaluation.strengths.length > 0 ? (
                    <div className="rounded-lg border border-success/30 bg-success/5 p-4 space-y-1.5">
                      <span className="font-bold text-success uppercase text-[10px]">
                        Strengths:
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-foreground/90">
                        {evaluation.strengths.map((str, sIdx) => (
                          <li key={sIdx}>{str}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {evaluation?.next_actions && evaluation.next_actions.length > 0 ? (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-1.5">
                      <span className="font-bold text-primary uppercase text-[10px]">
                        Recommended Practice:
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-foreground/90">
                        {evaluation.next_actions.map((act, aIdx) => (
                          <li key={aIdx}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
