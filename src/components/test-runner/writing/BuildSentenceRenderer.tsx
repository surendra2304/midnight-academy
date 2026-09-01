/**
 * Build a Sentence Item Renderer
 * Interactive click-to-place and re-orderable word chip interface.
 */

import React, { useState, useEffect } from 'react';
import type { ClientContentItem } from '@/lib/tests/session-state';
import { RotateCcw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface BuildSentenceRendererProps {
  item: ClientContentItem;
  currentAnswer: string | null;
  onAnswerChange: (rawAnswer: string, normalizedAnswer?: Record<string, unknown>) => void;
  disabled?: boolean;
}

export function BuildSentenceRenderer({
  item,
  currentAnswer,
  onAnswerChange,
  disabled = false,
}: BuildSentenceRendererProps) {
  const wordBank: string[] = (item.payload?.wordBank as string[]) || (item.payload?.words as string[]) || [];

  const [placedWords, setPlacedWords] = useState<string[]>(() => {
    if (!currentAnswer) return [];
    try {
      const parsed = JSON.parse(currentAnswer);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return currentAnswer ? currentAnswer.split(' ') : [];
    }
  });

  const [availableWords, setAvailableWords] = useState<string[]>(() => {
    return wordBank.filter((w) => !placedWords.includes(w));
  });

  useEffect(() => {
    if (!currentAnswer) {
      setPlacedWords([]);
      setAvailableWords(wordBank);
    }
  }, [currentAnswer, wordBank]);

  const handleAddWord = (word: string, indexInAvailable: number) => {
    if (disabled) return;
    const nextPlaced = [...placedWords, word];
    const nextAvail = availableWords.filter((_, idx) => idx !== indexInAvailable);

    setPlacedWords(nextPlaced);
    setAvailableWords(nextAvail);

    onAnswerChange(JSON.stringify(nextPlaced), {
      words: nextPlaced,
      assembledSentence: nextPlaced.join(' '),
    });
  };

  const handleRemoveWord = (indexInPlaced: number) => {
    if (disabled) return;
    const word = placedWords[indexInPlaced];
    const nextPlaced = placedWords.filter((_, idx) => idx !== indexInPlaced);
    const nextAvail = [...availableWords, word];

    setPlacedWords(nextPlaced);
    setAvailableWords(nextAvail);

    onAnswerChange(JSON.stringify(nextPlaced), {
      words: nextPlaced,
      assembledSentence: nextPlaced.join(' '),
    });
  };

  const handleReset = () => {
    if (disabled) return;
    setPlacedWords([]);
    setAvailableWords(wordBank);
    onAnswerChange(JSON.stringify([]), { words: [], assembledSentence: '' });
  };

  const promptText = (item.payload?.prompt as string) || 'Build a grammatically correct sentence using the words below:';

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card/40 p-6 space-y-4">
        <div className="border-b border-border pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Build a Sentence</span>
          <p className="mt-1 text-sm font-medium text-foreground">{promptText}</p>
        </div>

        {/* Assembled Sentence Zone */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Your Sentence (Click words to remove):</span>
            {placedWords.length > 0 && !disabled ? (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3" /> Reset
              </button>
            ) : null}
          </div>

          <div className="min-h-16 flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-primary/40 bg-background/60 p-4">
            {placedWords.length === 0 ? (
              <span className="text-xs text-muted-foreground italic">
                Click the word tiles below in sequence to form your sentence.
              </span>
            ) : (
              placedWords.map((word, idx) => (
                <button
                  key={`${word}-${idx}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleRemoveWord(idx)}
                  className="rounded-md border border-primary bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-transform hover:scale-95 shadow-sm"
                >
                  {word}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Word Bank Pool */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Word Bank:</span>
          <div className="flex flex-wrap items-center gap-2">
            {availableWords.map((word, idx) => (
              <button
                key={`${word}-${idx}`}
                type="button"
                disabled={disabled}
                onClick={() => handleAddWord(word, idx)}
                className="rounded-md border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground transition-transform hover:border-primary hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
