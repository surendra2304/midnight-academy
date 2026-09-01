/**
 * Interactive Dictation Player & Word-Diff Visualizer
 * Provides browser Web Speech API / TTS sentence playback, replay limits,
 * live typing input, color-coded word-diff highlighting, and AI phonetic explanations.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  HelpCircle,
  VolumeX,
  Gauge,
  Tag,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DictationItem, DictationSubmissionResult } from '@/lib/dictation/dictation.functions';
import { submitDictationAttempt } from '@/lib/dictation/dictation.functions';
import { toast } from 'sonner';

export interface DictationPlayerProps {
  items: DictationItem[];
  onCompleteSession?: () => void;
}

export function DictationPlayer({ items, onCompleteSession }: DictationPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [playCount, setPlayCount] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<DictationSubmissionResult | null>(null);

  const currentItem = items[currentIndex];
  const maxPlays = 3;
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Audio Playback via SpeechSynthesis API
  const handlePlayAudio = () => {
    if (!currentItem) return;

    if (!window.speechSynthesis) {
      toast.error('Web Speech API is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentItem.sentence);
    utterance.rate = playbackSpeed;
    utterance.lang = 'en-US';

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      setPlayCount((prev) => prev + 1);
    };
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  // Keyboard shortcut: Ctrl+Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!result) {
        handleSubmit();
      } else {
        handleNextItem();
      }
    }
  };

  const handleSubmit = async () => {
    if (!currentItem) return;
    if (!typedText.trim()) {
      toast.error('Please type what you heard before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await submitDictationAttempt({
        data: {
          itemId: currentItem.id,
          studentAnswer: typedText,
          requestAiExplanation: true,
        },
      });
      setResult(res);
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to evaluate response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextItem = () => {
    setResult(null);
    setTypedText('');
    setPlayCount(0);
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else if (onCompleteSession) {
      onCompleteSession();
    }
  };

  if (!currentItem) {
    return (
      <div className="rounded-2xl border border-border bg-card/60 p-8 text-center space-y-4">
        <Sparkles className="size-10 text-primary mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Session Complete!</h2>
        <p className="text-sm text-muted-foreground">You have finished all dictation practice exercises in this set.</p>
        <Button onClick={() => setCurrentIndex(0)}>Restart Set</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Exercise Card */}
      <div className="rounded-3xl border border-border bg-card/60 p-6 md:p-8 shadow-sm space-y-6">
        {/* Card Header & Track Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase">
                Sentence {currentIndex + 1} of {items.length}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">Topic: {currentItem.topic}</span>
            </div>
            <p className="text-xs text-muted-foreground">{currentItem.contextNote || 'Listen carefully and type verbatim.'}</p>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-2 bg-surface-2/40 border border-border/80 rounded-xl px-3 py-1.5 text-xs">
            <Gauge className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground font-medium">Speed:</span>
            {[0.8, 1.0, 1.2].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setPlaybackSpeed(spd)}
                className={`rounded-lg px-2 py-0.5 font-bold transition-all ${
                  playbackSpeed === spd
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Audio Player Action */}
        <div className="flex flex-col items-center justify-center py-6 bg-gradient-to-b from-surface-2/30 to-surface-2/10 rounded-2xl border border-border/60 space-y-4">
          <button
            type="button"
            onClick={handlePlayAudio}
            disabled={isPlaying || playCount >= maxPlays}
            className={`size-18 rounded-2xl flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-primary text-primary-foreground animate-pulse shadow-lg shadow-primary/30'
                : playCount >= maxPlays
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:scale-105 shadow-md shadow-primary/25'
            }`}
          >
            {isPlaying ? (
              <Volume2 className="size-8" />
            ) : playCount >= maxPlays ? (
              <VolumeX className="size-8" />
            ) : (
              <Play className="size-8 ml-1 fill-current" />
            )}
          </button>

          <div className="text-center space-y-1">
            <p className="text-sm font-bold text-foreground">
              {isPlaying ? 'Playing Audio...' : playCount >= maxPlays ? 'Replay Limit Reached' : 'Click to Listen'}
            </p>
            <p className="text-xs text-muted-foreground">
              Replays used: <strong>{playCount}</strong> / {maxPlays}
            </p>
          </div>
        </div>

        {/* Typing Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Your Transcription
          </label>
          <textarea
            ref={inputRef}
            rows={3}
            disabled={Boolean(result) || isSubmitting}
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type exactly what you hear in the audio..."
            className="w-full rounded-2xl border border-border bg-background p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        {/* Word Diff Result & AI Feedback */}
        {result ? (
          <div className="space-y-4 rounded-2xl border border-border bg-card/40 p-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                {result.score.isPerfectMatch ? (
                  <CheckCircle2 className="size-5 text-emerald-500" />
                ) : (
                  <Sparkles className="size-5 text-primary" />
                )}
                <h4 className="text-sm font-bold text-foreground">
                  Accuracy: <span className="text-primary font-black">{result.score.accuracyPercent}%</span>
                </h4>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Correct: <strong className="text-emerald-500">{result.score.correctWordCount}</strong></span>
                <span>Missing: <strong className="text-amber-500">{result.score.missingWordCount}</strong></span>
                <span>Wrong: <strong className="text-rose-500">{result.score.wrongWordCount}</strong></span>
              </div>
            </div>

            {/* Visual Word-by-Word Diff */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Word-by-Word Breakdown
              </span>
              <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl bg-background/80 border border-border/80 text-sm leading-loose">
                {result.score.tokens.map((tok, tIdx) => {
                  if (tok.type === 'correct') {
                    return (
                      <span
                        key={tIdx}
                        className={`rounded px-1.5 py-0.5 font-medium ${
                          tok.isHomophone
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : 'bg-emerald-500/15 text-emerald-400'
                        }`}
                      >
                        {tok.actual || tok.expected}
                      </span>
                    );
                  }
                  if (tok.type === 'wrong') {
                    return (
                      <span key={tIdx} className="inline-flex items-center gap-1 rounded bg-rose-500/15 text-rose-400 px-1.5 py-0.5 font-medium">
                        <span className="line-through opacity-70">{tok.actual}</span>
                        <span className="text-emerald-400 underline">{tok.expected}</span>
                      </span>
                    );
                  }
                  if (tok.type === 'missing') {
                    return (
                      <span key={tIdx} className="rounded bg-amber-500/15 text-amber-400 px-1.5 py-0.5 font-medium border border-dashed border-amber-500/40">
                        +{tok.expected}
                      </span>
                    );
                  }
                  if (tok.type === 'extra') {
                    return (
                      <span key={tIdx} className="rounded bg-rose-500/15 text-rose-400 line-through px-1.5 py-0.5">
                        {tok.actual}
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Reference Sentence */}
            <div className="space-y-1 rounded-xl bg-surface-2/40 border border-border/60 p-3.5 text-xs">
              <span className="font-bold text-muted-foreground uppercase text-[10px]">Reference Transcript:</span>
              <p className="text-foreground font-medium">{result.referenceSentence}</p>
            </div>

            {/* AI Phonetic & Listening Explanation */}
            {result.aiExplanation ? (
              <div className="space-y-1 rounded-xl border border-primary/25 bg-primary/5 p-4 text-xs">
                <div className="flex items-center gap-1.5 text-primary font-bold">
                  <Sparkles className="size-3.5" />
                  <span>Phonetic & Listening Coach Insight</span>
                </div>
                <p className="text-foreground/90 leading-relaxed">{result.aiExplanation}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {currentItem.skillTags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-surface-2 px-2 py-0.5 rounded-md">
                <Tag className="size-3" /> {tag.replace(/_/g, ' ')}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {!result ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !typedText.trim()}
                className="font-bold px-6 shadow-md shadow-primary/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 mr-1.5 animate-spin" /> Evaluating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5 mr-1.5" /> Check Sentence
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNextItem} className="font-bold px-6">
                Next Sentence <ArrowRight className="size-4 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
