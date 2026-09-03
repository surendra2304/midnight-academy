/**
 * Interactive Shadowing Player Component
 * Provides TTS audio playback -> Live speech recording / SpeechRecognition ->
 * Instant 4-trait evaluation + Word-level diff + Pronunciation coaching feedback.
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  Mic,
  Square,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Gauge,
  Tag,
  Loader2,
  Award,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ShadowingItem, ShadowingEvaluationResult } from "@/lib/shadowing/shadowing.functions";
import { submitShadowingAttempt } from "@/lib/shadowing/shadowing.functions";
import { toast } from "sonner";

export interface ShadowingPlayerProps {
  items: ShadowingItem[];
  onCompleteSession?: () => void;
}

export function ShadowingPlayer({ items, onCompleteSession }: ShadowingPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [speechTranscript, setSpeechTranscript] = useState<string>("");
  const [result, setResult] = useState<ShadowingEvaluationResult | null>(null);

  // Per-sentence best scores
  const [bestScores, setBestScores] = useState<Record<string, number>>({});

  const currentItem = items[currentIndex];
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Initialize SpeechRecognition if available in browser
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setSpeechTranscript(transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Audio Playback
  const handlePlayAudio = () => {
    if (!currentItem) return;

    if (!window.speechSynthesis) {
      toast.error("Web Speech API is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentItem.sentence);
    utterance.rate = playbackSpeed;
    utterance.lang = "en-US";

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  // Start Speaking / Shadowing Recording
  const handleStartRecording = () => {
    setSpeechTranscript("");
    setResult(null);
    setIsRecording(true);
    setRecordSeconds(0);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // Already started
      }
    }

    timerRef.current = setInterval(() => {
      setRecordSeconds((prev) => prev + 1);
    }, 1000);
  };

  // Stop Recording and Submit for AI Evaluation
  const handleStopAndEvaluate = async () => {
    if (!currentItem) return;
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }

    const transcriptToEvaluate = speechTranscript.trim() || currentItem.sentence;

    try {
      setIsEvaluating(true);
      const res = await submitShadowingAttempt({
        data: {
          itemId: currentItem.id,
          studentTranscript: transcriptToEvaluate,
          audioDurationSeconds: recordSeconds,
        },
      });

      setResult(res);

      // Track personal best
      setBestScores((prev) => {
        const currentBest = prev[currentItem.id] || 0;
        return {
          ...prev,
          [currentItem.id]: Math.max(currentBest, res.scoreBand),
        };
      });
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Evaluation failed. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextItem = () => {
    setResult(null);
    setSpeechTranscript("");
    setRecordSeconds(0);
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (onCompleteSession) {
      onCompleteSession();
    }
  };

  if (!currentItem) {
    return (
      <div className="rounded-2xl border border-border bg-card/60 p-8 text-center space-y-4">
        <Sparkles className="size-10 text-primary mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Shadowing Session Complete!</h2>
        <p className="text-sm text-muted-foreground">
          You have practiced all oral shadowing sentences in this set.
        </p>
        <Button onClick={() => setCurrentIndex(0)}>Restart Set</Button>
      </div>
    );
  }

  const personalBest = bestScores[currentItem.id] || null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-3xl border border-border bg-card/60 p-6 md:p-8 shadow-sm space-y-6">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase">
                Sentence {currentIndex + 1} of {items.length}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                Topic: {currentItem.topic}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {currentItem.contextNote || "Listen and shadow verbatim."}
            </p>
          </div>

          {/* Speed & Personal Best */}
          <div className="flex items-center gap-3">
            {personalBest ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                <Trophy className="size-3" /> Best: Band {personalBest.toFixed(1)}
              </span>
            ) : null}

            <div className="flex items-center gap-1.5 bg-surface-2/40 border border-border/80 rounded-xl px-2.5 py-1 text-xs">
              <Gauge className="size-3 text-muted-foreground" />
              {[0.8, 1.0, 1.2].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`rounded px-1.5 py-0.5 font-bold transition-all ${
                    playbackSpeed === spd
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 1: Listen to Model Speaker */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
            1. Model Speaker Audio
          </span>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-2/30 border border-border/70">
            <p className="text-sm font-semibold text-foreground/90 leading-relaxed pr-4">
              "{currentItem.sentence}"
            </p>
            <Button
              size="sm"
              variant={isPlaying ? "secondary" : "default"}
              onClick={handlePlayAudio}
              disabled={isPlaying || isRecording}
              className="shrink-0 font-bold"
            >
              <Volume2 className="size-4 mr-1.5" />
              {isPlaying ? "Playing..." : "Listen"}
            </Button>
          </div>
        </div>

        {/* Step 2: Record Shadowing Repetition */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
            2. Your Shadowing Speech
          </span>

          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-surface-2/20 to-surface-2/5 rounded-2xl border border-border/60 space-y-4">
            {!isRecording ? (
              <Button
                size="lg"
                onClick={handleStartRecording}
                disabled={isEvaluating || isPlaying}
                className="size-16 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/25 transition-all hover:scale-105"
              >
                <Mic className="size-7" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleStopAndEvaluate}
                className="size-16 rounded-2xl bg-slate-800 border-2 border-rose-500 text-rose-400 animate-pulse shadow-lg shadow-rose-500/30"
              >
                <Square className="size-6 fill-current" />
              </Button>
            )}

            <div className="text-center space-y-1">
              <p className="text-xs font-bold text-foreground">
                {isRecording
                  ? `Recording... (${recordSeconds}s) Click to Stop & Score`
                  : "Click Microphone to Repeat Sentence"}
              </p>
              {speechTranscript ? (
                <p className="text-xs text-muted-foreground italic max-w-lg bg-background/60 p-2.5 rounded-xl border border-border/50">
                  "{speechTranscript}"
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Step 3: Instant 4-Trait Feedback & Word Diff */}
        {isEvaluating ? (
          <div className="flex items-center justify-center gap-3 p-8 bg-card/30 rounded-2xl border border-border/80">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-sm font-semibold text-muted-foreground">
              Evaluating speech rhythm, pronunciation & accuracy...
            </p>
          </div>
        ) : result ? (
          <div className="space-y-5 rounded-2xl border border-border bg-card/50 p-6">
            {/* Score Band Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  Shadowing Evaluation
                </span>
                <h4 className="text-xl font-black text-foreground">
                  Score: Band <span className="text-primary">{result.scoreBand.toFixed(1)}</span> /
                  6.0
                </h4>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  Repetition Accuracy
                </span>
                <p className="text-lg font-black text-emerald-400">{result.wordAccuracyPercent}%</p>
              </div>
            </div>

            {/* 4 Rubric Traits */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-surface-2/40 border border-border/60 text-center">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">
                  Pronunciation
                </p>
                <p className="text-base font-black text-primary mt-0.5">
                  {result.traits.pronunciation.toFixed(1)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-surface-2/40 border border-border/60 text-center">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">
                  Rhythm & Pace
                </p>
                <p className="text-base font-black text-primary mt-0.5">
                  {result.traits.rhythm_and_pace.toFixed(1)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-surface-2/40 border border-border/60 text-center">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">
                  Intelligibility
                </p>
                <p className="text-base font-black text-primary mt-0.5">
                  {result.traits.intelligibility.toFixed(1)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-surface-2/40 border border-border/60 text-center">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">
                  Repetition Match
                </p>
                <p className="text-base font-black text-primary mt-0.5">
                  {result.traits.repetition_accuracy.toFixed(1)}
                </p>
              </div>
            </div>

            {/* Word-by-Word Diff */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Word-by-Word Repetition Breakdown
              </span>
              <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl bg-background/80 border border-border/80 text-sm leading-loose">
                {result.wordDiff.tokens.map((tok, tIdx) => {
                  if (tok.type === "correct") {
                    return (
                      <span
                        key={tIdx}
                        className="rounded bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 font-medium"
                      >
                        {tok.actual || tok.expected}
                      </span>
                    );
                  }
                  if (tok.type === "wrong") {
                    return (
                      <span
                        key={tIdx}
                        className="inline-flex items-center gap-1 rounded bg-rose-500/15 text-rose-400 px-1.5 py-0.5 font-medium"
                      >
                        <span className="line-through opacity-70">{tok.actual}</span>
                        <span className="text-emerald-400 underline">{tok.expected}</span>
                      </span>
                    );
                  }
                  if (tok.type === "missing") {
                    return (
                      <span
                        key={tIdx}
                        className="rounded bg-amber-500/15 text-amber-400 px-1.5 py-0.5 font-medium border border-dashed border-amber-500/40"
                      >
                        +{tok.expected}
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Pronunciation & Coaching Notes */}
            <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-primary">
                <Sparkles className="size-3.5" /> Pronunciation & Fluency Coaching
              </div>
              <ul className="space-y-1 text-foreground/90 list-disc list-inside">
                {result.pronunciationNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
              <p className="pt-1 text-primary font-medium">{result.coachingFeedback}</p>
            </div>
          </div>
        ) : null}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {currentItem.focusSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-surface-2 px-2 py-0.5 rounded-md"
              >
                <Tag className="size-3" /> {skill.replace(/_/g, " ")}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {result ? (
              <Button onClick={handleNextItem} className="font-bold px-6">
                Next Sentence <ArrowRight className="size-4 ml-1.5" />
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
