/**
 * Speaking Review & Coaching View
 * Visualizes audio playback, transcription, 1.0–6.0 band score, 5 trait dimensions, corrections, and model response.
 */

import React from 'react';
import type { ClientContentItem } from '@/lib/tests/session-state';
import type { StructuredEvaluationResult } from '@/lib/evaluation/evaluation-service.server';
import { Award, Mic, Sparkles, ArrowRight, FileText, Activity } from 'lucide-react';
import { AudioPlayer } from '../listening/AudioPlayer';

export interface SpeakingReviewItemData {
  item: ClientContentItem;
  audioUrl?: string;
  transcript?: string;
  evaluation?: StructuredEvaluationResult;
  modelAnswer?: string;
}

export interface SpeakingReviewViewProps {
  reviews: SpeakingReviewItemData[];
}

export function SpeakingReviewView({ reviews }: SpeakingReviewViewProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="rounded-xl border border-border bg-card/60 p-6">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">Speaking Section Feedback</span>
        <h2 className="text-xl font-extrabold text-foreground mt-1">AI Rubric Evaluation & Speech Coaching</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Review your 1.0–6.0 spoken band score, delivery/fluency traits, spoken transcript, and model response.
        </p>
      </section>

      <div className="space-y-8">
        {reviews.map((rev, idx) => {
          const { item, audioUrl, transcript, evaluation, modelAnswer } = rev;

          return (
            <article key={item.id} className="rounded-xl border border-border bg-card/40 p-6 space-y-6">
              {/* Header */}
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">Task {idx + 1}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs font-semibold text-primary uppercase">{item.itemType.replace(/_/g, ' ')}</span>
                  </div>
                  <h3 className="text-base font-bold text-foreground mt-1">
                    {(item.payload?.prompt as string) || (item.payload?.questionText as string)}
                  </h3>
                </div>

                {evaluation ? (
                  <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2">
                    <Award className="size-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">Speaking Band Score</p>
                      <p className="text-base font-black text-primary">{evaluation.score_band.toFixed(1)} / 6.0</p>
                    </div>
                  </div>
                ) : null}
              </header>

              {/* 5 Speaking Trait Dimensions */}
              {evaluation?.traits ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="rounded-lg border border-border bg-surface-2/30 p-3 text-center">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Task Fulfillment</p>
                    <p className="text-base font-extrabold text-foreground">{evaluation.traits.task_fulfillment?.toFixed(1) || '—'}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-surface-2/30 p-3 text-center">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Organization</p>
                    <p className="text-base font-extrabold text-foreground">{evaluation.traits.organization?.toFixed(1) || '—'}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-surface-2/30 p-3 text-center">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Language Use</p>
                    <p className="text-base font-extrabold text-foreground">{evaluation.traits.language_use?.toFixed(1) || '—'}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-surface-2/30 p-3 text-center">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Delivery & Fluency</p>
                    <p className="text-base font-extrabold text-foreground">{evaluation.traits.delivery?.toFixed(1) || '—'}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-surface-2/30 p-3 text-center">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Pronunciation</p>
                    <p className="text-base font-extrabold text-foreground">{evaluation.traits.pronunciation?.toFixed(1) || '—'}</p>
                  </div>
                </div>
              ) : null}

              {/* Audio Playback & Spoken Transcript */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Audio Recording */}
                <div className="rounded-lg border border-border bg-background/50 p-4 space-y-2">
                  <span className="font-bold text-muted-foreground uppercase text-[10px]">Your Spoken Recording:</span>
                  {audioUrl ? (
                    <AudioPlayer audioUrl={audioUrl} maxPlays={99} />
                  ) : (
                    <p className="text-muted-foreground italic">Audio recording uploaded.</p>
                  )}
                </div>

                {/* Transcript */}
                <div className="rounded-lg border border-border bg-background/50 p-4 space-y-2">
                  <span className="flex items-center gap-1 font-bold text-muted-foreground uppercase text-[10px]">
                    <FileText className="size-3" /> Transcribed Speech:
                  </span>
                  <p className="text-foreground/90 whitespace-pre-line leading-relaxed font-mono">
                    {transcript || 'Speech transcription processed.'}
                  </p>
                </div>
              </div>

              {/* Model Response */}
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2 text-xs">
                <span className="flex items-center gap-1 font-bold text-primary uppercase text-[10px]">
                  <Sparkles className="size-3" /> Model Spoken Response Example:
                </span>
                <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
                  {evaluation?.improved_response || modelAnswer || 'Example response available.'}
                </p>
              </div>

              {/* Strengths & Practice Recommendations */}
              {evaluation?.strengths || evaluation?.next_actions ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {evaluation?.strengths && evaluation.strengths.length > 0 ? (
                    <div className="rounded-lg border border-success/30 bg-success/5 p-4 space-y-1.5">
                      <span className="font-bold text-success uppercase text-[10px]">Speech Strengths:</span>
                      <ul className="list-disc list-inside space-y-1 text-foreground/90">
                        {evaluation.strengths.map((str, sIdx) => (
                          <li key={sIdx}>{str}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {evaluation?.next_actions && evaluation.next_actions.length > 0 ? (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-1.5">
                      <span className="font-bold text-primary uppercase text-[10px]">Delivery & Fluency Coaching:</span>
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
