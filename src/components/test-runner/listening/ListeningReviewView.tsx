/**
 * Listening Answer Review Component
 * Displays selected answer, correct key, rationale, skill tags, time spent, and full audio transcript.
 */

import React, { useState } from 'react';
import type { ClientContentItem } from '@/lib/tests/session-state';
import { CheckCircle2, XCircle, Tag, Volume2, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';

export interface ListeningReviewItemData {
  item: ClientContentItem;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  score: number;
  timeSpentSeconds?: number;
  rationale?: string;
  distractorRationale?: string | null;
  transcript?: string | null;
  audioUrl?: string;
}

export interface ListeningReviewViewProps {
  items: ListeningReviewItemData[];
  overallScorePercent: number;
  totalTimeSpentSeconds?: number;
}

export function ListeningReviewView({
  items,
  overallScorePercent,
  totalTimeSpentSeconds = 0,
}: ListeningReviewViewProps) {
  const [openTranscripts, setOpenTranscripts] = useState<Record<string, boolean>>({});

  const toggleTranscript = (id: string) => {
    setOpenTranscripts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const correctCount = items.filter((it) => it.isCorrect).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="rounded-xl border border-border bg-card/60 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Listening Section Review</span>
          <h2 className="text-xl font-extrabold text-foreground mt-1">Detailed Answer Review</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Replay audio tracks, read complete spoken transcripts, and review question explanations.
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

      {/* Review Cards */}
      <div className="space-y-6">
        {items.map((review, idx) => {
          const { item, selectedAnswer, correctAnswer, isCorrect, rationale, distractorRationale, transcript, audioUrl } = review;
          const isTranscriptOpen = openTranscripts[item.id] ?? false;

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

                <div>
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

              {/* Audio Playback In Review */}
              {audioUrl ? (
                <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                  <AudioPlayer audioUrl={audioUrl} maxPlays={99} />
                </div>
              ) : null}

              {/* Spoken Transcript Accordion */}
              {transcript ? (
                <div className="rounded-lg border border-border/60 bg-background/30 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleTranscript(item.id)}
                    className="flex w-full items-center justify-between p-3.5 text-xs font-semibold text-foreground hover:bg-surface-2/50 transition-colors"
                  >
                    <span className="flex items-center gap-1.5 text-primary">
                      <FileText className="size-3.5" /> Spoken Audio Transcript
                    </span>
                    {isTranscriptOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </button>

                  {isTranscriptOpen ? (
                    <div className="border-t border-border/50 p-4 text-xs text-foreground/85 leading-relaxed whitespace-pre-line bg-card/20 font-mono">
                      {transcript}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Question Prompt */}
              <div className="text-sm leading-relaxed text-foreground/90 bg-background/50 p-4 rounded-lg border border-border/50">
                <p className="font-semibold">{(item.payload?.prompt as string) || (item.payload?.questionText as string)}</p>
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

              {/* Rationale */}
              {rationale || distractorRationale ? (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs space-y-1.5">
                  <p className="font-bold text-primary uppercase text-[10px]">Explanation & Key Rationale:</p>
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
