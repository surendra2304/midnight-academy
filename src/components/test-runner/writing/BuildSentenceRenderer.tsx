/**
 * TestGlider 1:1 Build a Sentence Item Renderer
 * Matches writing_sentence_3320s.jpg from authentic exam recording:
 * - Centered title: "Make an appropriate sentence."
 * - Conversational partner avatar with teal ring and dialogue prompt
 * - User avatar with teal ring, sentence prefix, and underline blank slots
 * - Clickable word bank pool with click-to-place and click-to-remove mechanics
 */

import React, { useState, useEffect } from "react";
import type { ClientContentItem } from "@/lib/tests/session-state";
import { RotateCcw } from "lucide-react";

export interface BuildSentenceRendererProps {
  item: ClientContentItem;
  currentAnswer: string | null;
  onAnswerChange: (rawAnswer: string, normalizedAnswer?: Record<string, unknown>) => void;
  onNext?: () => void;
  nextLabel?: string;
  disabled?: boolean;
}

export function BuildSentenceRenderer({
  item,
  currentAnswer,
  onAnswerChange,
  onNext,
  nextLabel,
  disabled = false,
}: BuildSentenceRendererProps) {
  const payload = (item.payload || {}) as Record<string, unknown>;
  const wordBank: string[] =
    (payload.wordBank as string[]) || (payload.words as string[]) || [];

  const partnerDialogue =
    (payload.prompt as string) ||
    (payload.partnerDialogue as string) ||
    (payload.contextPrompt as string) ||
    "Were you able to complete the project on time?";

  const sentencePrefix =
    (payload.sentencePrefix as string) ||
    (payload.prefix as string) ||
    "";

  const targetSentence = (payload.targetSentence as string) || "";
  const terminalPunctuation =
    (payload.terminalPunctuation as string) ||
    (targetSentence.trim().endsWith("?")
      ? "?"
      : targetSentence.trim().endsWith("!")
        ? "!"
        : ".");

  const acceptedSeqs = payload.acceptedSequences as string[][] | undefined;

  // Use explicit slotCount or ordered phrase sequence length so multi-word phrase chips match slot count 1:1
  const totalSlots =
    (payload.slotCount as number) ||
    (Array.isArray(acceptedSeqs) &&
    Array.isArray(acceptedSeqs[0]) &&
    acceptedSeqs[0].length > 0
      ? acceptedSeqs[0].length
      : wordBank.length > 0
        ? wordBank.length
        : 4);

  const [placedWords, setPlacedWords] = useState<string[]>(() => {
    if (!currentAnswer) return [];
    try {
      const parsed = JSON.parse(currentAnswer);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return currentAnswer ? currentAnswer.split(" ") : [];
    }
  });

  useEffect(() => {
    if (!currentAnswer) {
      setPlacedWords([]);
    }
  }, [currentAnswer]);

  const handleAddWord = (word: string) => {
    if (disabled || placedWords.length >= totalSlots) return;
    const nextPlaced = [...placedWords, word];
    setPlacedWords(nextPlaced);

    const fullSentence = `${sentencePrefix ? `${sentencePrefix} ` : ""}${nextPlaced.join(" ")}${terminalPunctuation}`;
    onAnswerChange(JSON.stringify(nextPlaced), {
      words: nextPlaced,
      assembledSentence: fullSentence,
    });
  };

  const handleRemoveWord = (indexInPlaced: number) => {
    if (disabled) return;
    const nextPlaced = placedWords.filter((_, idx) => idx !== indexInPlaced);
    setPlacedWords(nextPlaced);

    const fullSentence = `${sentencePrefix ? `${sentencePrefix} ` : ""}${nextPlaced.join(" ")}${terminalPunctuation}`;
    onAnswerChange(JSON.stringify(nextPlaced), {
      words: nextPlaced,
      assembledSentence: fullSentence,
    });
  };

  const handleReset = () => {
    if (disabled) return;
    setPlacedWords([]);
    onAnswerChange(JSON.stringify([]), { words: [], assembledSentence: "" });
  };

  // Check how many occurrences of each word are placed vs available
  const getWordPlacedCount = (w: string) => placedWords.filter((pw) => pw === w).length;
  const getWordBankCount = (w: string) => wordBank.filter((bw) => bw === w).length;

  return (
    <div className="flex flex-col h-full justify-center space-y-10 max-w-4xl mx-auto w-full px-4 py-6">
      {/* Centered Heading (Matches writing_sentence_3320s.jpg) */}
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          Make an appropriate sentence.
        </h2>
      </div>

      {/* Main Conversation Container */}
      <div className="space-y-8 pl-4 sm:pl-12 bg-white/50 rounded-2xl border border-blue-100/70 p-6 sm:p-8 shadow-xs">
        {/* Row 1: Conversation Partner Prompt */}
        <div className="flex items-center gap-5">
          <div className="size-16 rounded-full border-[3px] border-[#107074] overflow-hidden shrink-0 shadow-xs bg-slate-100">
            <img
              src="/images/speakers/student-female-1.jpg"
              alt="Dialogue Partner"
              className="size-full object-cover"
            />
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
            {partnerDialogue}
          </p>
        </div>

        {/* Row 2: User Response with Underline Blank Slots */}
        <div className="flex items-center gap-5">
          <div className="size-16 rounded-full border-[3px] border-[#107074] overflow-hidden shrink-0 shadow-xs bg-slate-100">
            <img
              src="/images/speakers/student-female-listening.png"
              alt="Test Taker"
              className="size-full object-cover"
            />
          </div>

          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-3 text-base sm:text-lg font-bold text-slate-900">
            {sentencePrefix ? (
              <span className="font-semibold text-slate-800">{sentencePrefix}</span>
            ) : null}

            {/* Underline Slots */}
            {Array.from({ length: totalSlots }).map((_, slotIdx) => {
              const filledWord = placedWords[slotIdx];
              return (
                <span
                  key={slotIdx}
                  onClick={() => {
                    if (filledWord) handleRemoveWord(slotIdx);
                  }}
                  title={filledWord ? "Click to return phrase to bank" : "Empty slot"}
                  className={`inline-flex items-center justify-center min-w-[95px] px-3 py-1 border-b-2 transition-all cursor-pointer select-none rounded-t-md ${
                    filledWord
                      ? "border-[#0f3b82] bg-blue-50/70 text-slate-900 font-bold hover:text-rose-600 hover:border-rose-400"
                      : "border-slate-500 text-transparent hover:border-slate-800 bg-slate-100/50"
                  }`}
                >
                  {filledWord || "—"}
                </span>
              );
            })}

            <span className="font-bold text-slate-900">{terminalPunctuation}</span>
          </div>
        </div>
      </div>

      {/* Row 3: Word Bank Pool (Matches writing_sentence_3320s.jpg) */}
      <div className="flex flex-col items-center space-y-4 pt-2">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {wordBank.map((word, idx) => {
            const placedCount = getWordPlacedCount(word);
            const bankCount = getWordBankCount(word);
            const isUsed = placedCount >= bankCount;

            return (
              <button
                key={`${word}-${idx}`}
                type="button"
                disabled={disabled || isUsed}
                onClick={() => handleAddWord(word)}
                className={`text-base sm:text-lg font-semibold transition-all px-4 py-2 rounded-xl border select-none ${
                  isUsed
                    ? "opacity-25 pointer-events-none border-slate-200 bg-slate-100 text-slate-400"
                    : "border-slate-300 bg-white text-slate-800 shadow-xs hover:border-[#0f3b82] hover:text-[#0f3b82] hover:bg-blue-50/40 active:scale-95 cursor-pointer"
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>

        {/* Reset Action */}
        {placedWords.length > 0 && !disabled && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors pt-2 cursor-pointer"
          >
            <RotateCcw className="size-3.5" /> Reset Sentence
          </button>
        )}
      </div>

      {onNext && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onNext}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#0f3b82] hover:bg-[#154694] px-8 py-2.5 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
          >
            {nextLabel || "Next >"}
          </button>
        </div>
      )}
    </div>
  );
}
