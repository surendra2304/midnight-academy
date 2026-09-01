/**
 * Interactive Vocabulary Quiz Player
 * Supports Multiple-Choice definition matching & fill-in-the-blank drills with instant explanations.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { QuizQuestion } from '@/lib/vocabulary/vocabulary.functions';

export interface VocabQuizPlayerProps {
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
}

export function VocabQuizPlayer({ questions, onComplete }: VocabQuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const currentQ = questions[currentIndex];

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === currentQ.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (onComplete) {
      onComplete(score + (selectedOption === currentQ?.correctAnswer ? 1 : 0), questions.length);
    }
  };

  if (!currentQ) {
    const finalPercent = Math.round((score / questions.length) * 100);
    return (
      <div className="rounded-3xl border border-border bg-card/60 p-8 text-center space-y-5">
        <Trophy className="size-12 text-primary mx-auto" />
        <div>
          <h3 className="text-2xl font-black text-foreground">Quiz Complete!</h3>
          <p className="text-sm text-muted-foreground mt-1">
            You scored <strong>{score}</strong> out of {questions.length} ({finalPercent}%)
          </p>
        </div>
        <Button onClick={() => setCurrentIndex(0)}>Take Quiz Again</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-3xl border border-border bg-card/60 p-6 md:p-8 shadow-sm space-y-6">
        {/* Quiz Header */}
        <div className="flex items-center justify-between border-b border-border pb-3 text-xs font-semibold text-muted-foreground">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span className="text-primary font-bold">Score: {score}</span>
        </div>

        {/* Prompt */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
            {currentQ.type === 'definition_match' ? 'Definition Drill' : 'Context Sentence Drill'}
          </span>
          <h3 className="text-base md:text-lg font-bold text-foreground leading-relaxed">
            {currentQ.prompt}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            let optionStyles = 'border-border/80 bg-background/60 hover:bg-surface-2 hover:border-primary/40';

            if (isAnswered) {
              if (opt === currentQ.correctAnswer) {
                optionStyles = 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold';
              } else if (opt === selectedOption) {
                optionStyles = 'border-rose-500 bg-rose-500/10 text-rose-400 font-semibold';
              } else {
                optionStyles = 'opacity-40 border-border bg-background/30';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelect(opt)}
                className={`w-full rounded-2xl border p-4 text-left text-xs md:text-sm transition-all flex items-center justify-between ${optionStyles}`}
              >
                <span>{opt}</span>
                {isAnswered && opt === currentQ.correctAnswer ? (
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0 ml-2" />
                ) : isAnswered && opt === selectedOption ? (
                  <XCircle className="size-4 text-rose-400 shrink-0 ml-2" />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Explanation Banner */}
        {isAnswered ? (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs space-y-1 animate-in fade-in duration-300">
            <span className="font-bold text-primary uppercase text-[10px]">Explanation:</span>
            <p className="text-foreground/90 leading-relaxed">{currentQ.explanation}</p>
          </div>
        ) : null}

        {/* Action Button */}
        {isAnswered ? (
          <div className="flex justify-end pt-2">
            <Button onClick={handleNext} className="font-bold px-6">
              {currentIndex < questions.length - 1 ? 'Next Question' : 'View Summary'} <ArrowRight className="size-4 ml-1.5" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
