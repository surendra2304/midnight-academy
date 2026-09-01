/**
 * Reading Answer Review Component
 * Displays question prompt, selected answer, correct key, rationale, distractor explanation, difficulty, and skill tags.
 */

import React from 'react';
import type { ClientContentItem } from '@/lib/tests/session-state';
import { CheckCircle2, XCircle, Tag, Clock } from 'lucide-react';

export interface ReadingReviewItemData {
  item: ClientContentItem;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  score: number;
  timeSpentSeconds?: number;
  rationale?: string;
  distractorRationale?: string | null;
  optionsWithCorrectness?: Array<{
    optionKey: string;
    optionText: string;
    isCorrect: boolean;
    distractorRationale?: string;
  }>;
}

export interface ReadingReviewViewProps {
  items: ReadingReviewItemData[];
  overallScorePercent: number;
  totalTimeSpentSeconds?: number;
}

export function ReadingReviewView({
  items,
  overallScorePercent,
  totalTimeSpentSeconds = 0,
}: ReadingReviewViewProps) {
  const correctCount = items.filter((it) => it.isCorrect).length;

  return (
    <div className="space-y-8">
      {/* Top Review Header */}
      <section className="rounded-xl border border-border bg-card/60 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Reading Section Review</span>
          <h2 className="text-xl font-extrabold text-foreground mt-1">Detailed Answer Review</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Review every question, check correct solutions, and understand rationale for each distractor.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-black text-primary">{correctCount} / {items.length}</p>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase">Correct Items</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-foreground">{Math.round(overallScorePercent)}%</p>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase">Accuracy</p>
          </div>
          {totalTimeSpentSeconds > 0 ? (
            <div className="text-center">
              <p className="text-2xl font-black text-muted-foreground">{Math.round(totalTimeSpentSeconds / 60)}m</p>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">Time Spent</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* Questions Review List */}
      <div className="space-y-6">
        {items.map((review, idx) => {
          const { item, selectedAnswer, correctAnswer, isCorrect, rationale, distractorRationale } = review;

          return (
            <article key={item.id} className="rounded-xl border border-border bg-card/40 p-6 space-y-4">
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">Question {idx + 1}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs font-medium text-primary uppercase tracking-wide">
                    {item.itemType.replace(/_/g, ' ')}
                  </span>
                  <span className="rounded bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {item.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-success">
                      <CheckCircle2 className="size-4" /> Correct (+1.0)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-destructive">
                      <XCircle className="size-4" /> Incorrect (0.0)
                    </span>
                  )}
                </div>
              </header>

              {/* Passage / Question Prompt */}
              <div className="text-sm leading-relaxed text-foreground/90 bg-background/50 p-4 rounded-lg border border-border/50">
                <p className="font-semibold mb-2">{(item.payload?.prompt as string) || (item.payload?.questionText as string)}</p>
                {item.payload?.passage ? (
                  <p className="text-xs text-muted-foreground mt-2 border-t border-border/40 pt-2 whitespace-pre-line">
                    {item.payload.passage as string}
                  </p>
                ) : null}
              </div>

              {/* Answer comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className={`p-3 rounded-lg border ${
                  isCorrect ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'
                }`}>
                  <span className="font-bold text-muted-foreground uppercase text-[10px]">Your Answer:</span>
                  <p className="mt-1 font-semibold text-foreground">{selectedAnswer || '(No response submitted)'}</p>
                </div>

                <div className="p-3 rounded-lg border border-success/30 bg-success/5">
                  <span className="font-bold text-success uppercase text-[10px]">Correct Key:</span>
                  <p className="mt-1 font-semibold text-success">{correctAnswer}</p>
                </div>
              </div>

              {/* Rationale & Distractor Analysis */}
              {rationale || distractorRationale ? (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs space-y-1.5">
                  <p className="font-bold text-primary uppercase text-[10px]">Explanation & Rationale:</p>
                  {rationale ? <p className="text-foreground/90 leading-relaxed">{rationale}</p> : null}
                  {distractorRationale && !isCorrect ? (
                    <p className="text-warning leading-relaxed mt-1"><span className="font-bold">Distractor Note:</span> {distractorRationale}</p>
                  ) : null}
                </div>
              ) : null}

              {/* Skill Tags */}
              {item.skillTags && item.skillTags.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <Tag className="size-3 text-muted-foreground" />
                  {item.skillTags.map((tag) => (
                    <span key={tag} className="rounded-md border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
