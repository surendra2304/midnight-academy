/**
 * Interactive SRS Flashcard Player Component
 * Supports Flip card -> Reveal definition, synonyms & example -> SM-2 self grading (Again/Hard/Good/Easy).
 */

import React, { useState } from 'react';
import {
  Sparkles,
  RotateCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Volume2,
  Tag,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { VocabWord } from '@/lib/vocabulary/vocabulary.functions';
import { gradeFlashcard } from '@/lib/vocabulary/vocabulary.functions';
import { toast } from 'sonner';

export interface FlashcardPlayerProps {
  words: VocabWord[];
  onComplete?: () => void;
}

export function FlashcardPlayer({ words, onComplete }: FlashcardPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [studiedCount, setStudiedCount] = useState(0);

  const currentWord = words[currentIndex];

  const handleSpeak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  };

  const handleGrade = async (grade: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentWord) return;

    try {
      setIsGrading(true);
      await gradeFlashcard({
        data: {
          wordId: currentWord.id,
          grade,
        },
      });

      setStudiedCount((prev) => prev + 1);
      setIsFlipped(false);

      if (currentIndex < words.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else if (onComplete) {
        onComplete();
      }
    } catch {
      toast.error('Failed to save flashcard progress');
    } finally {
      setIsGrading(false);
    }
  };

  if (!currentWord) {
    return (
      <div className="rounded-3xl border border-border bg-card/60 p-8 text-center space-y-4">
        <Sparkles className="size-10 text-primary mx-auto" />
        <h3 className="text-xl font-bold text-foreground">Flashcard Review Complete!</h3>
        <p className="text-sm text-muted-foreground">You reviewed {studiedCount} words in this session.</p>
        <Button onClick={() => setCurrentIndex(0)}>Review Again</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Progress Counter */}
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
        <span>Word {currentIndex + 1} of {words.length}</span>
        <span className="text-primary font-bold">{studiedCount} Studied Today</span>
      </div>

      {/* Flip Flashcard */}
      <div
        onClick={() => !isFlipped && setIsFlipped(true)}
        className={`min-h-[320px] rounded-3xl border border-border bg-card/80 p-8 shadow-md transition-all flex flex-col justify-between cursor-pointer ${
          isFlipped ? 'border-primary/40 shadow-lg' : 'hover:border-primary/30 hover:scale-[1.01]'
        }`}
      >
        {/* Card Front / Top Info */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase">
              {currentWord.partOfSpeech}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSpeak(currentWord.word);
              }}
              className="text-muted-foreground hover:text-primary transition-colors p-1"
            >
              <Volume2 className="size-5" />
            </button>
          </div>

          <div className="text-center py-4 space-y-2">
            <h2 className="text-3xl font-black text-foreground">{currentWord.word}</h2>
            {!isFlipped ? (
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 pt-4">
                <RotateCw className="size-3.5 animate-pulse text-primary" /> Click card to reveal definition & example
              </p>
            ) : null}
          </div>
        </div>

        {/* Card Back / Revealed Definition */}
        {isFlipped ? (
          <div className="space-y-4 pt-2 border-t border-border/60 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Definition:</span>
              <p className="text-sm font-semibold text-foreground leading-relaxed">{currentWord.definition}</p>
            </div>

            <div className="space-y-1 rounded-xl bg-surface-2/40 border border-border/60 p-3 text-xs">
              <span className="font-bold text-primary uppercase text-[10px]">Example Sentence:</span>
              <p className="text-foreground/90 italic">"{currentWord.exampleSentence}"</p>
            </div>

            {currentWord.synonyms && currentWord.synonyms.length > 0 ? (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground/80">Synonyms:</span>
                <span>{currentWord.synonyms.join(', ')}</span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* SM-2 Self-Grading Bar */}
      {isFlipped ? (
        <div className="space-y-2 animate-in fade-in duration-300">
          <p className="text-center text-xs text-muted-foreground font-medium">How easily did you recall this word?</p>
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isGrading}
              onClick={() => handleGrade('again')}
              className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-bold"
            >
              Again (1d)
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isGrading}
              onClick={() => handleGrade('hard')}
              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-bold"
            >
              Hard (3d)
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isGrading}
              onClick={() => handleGrade('good')}
              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 font-bold"
            >
              Good (6d)
            </Button>
            <Button
              size="sm"
              disabled={isGrading}
              onClick={() => handleGrade('easy')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Easy (10d)
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
