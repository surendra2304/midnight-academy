/**
 * TestGlider 1:1 Complete the Words (Cloze) Item Renderer
 * Matches reading_m1_cloze_100s.jpg from authentic exam recording:
 * - Centered title: "Fill in the missing letters in the paragraph."
 * - Compact shaded input boxes attached seamlessly to word prefixes without wrapping
 * - Dynamic letter-width sizing and automatic focus advancement as the student types
 */

import React, { useState, useEffect, useRef } from "react";
import type { ClientContentItem } from "@/lib/tests/session-state";

export interface CompleteWordsRendererProps {
  item: ClientContentItem;
  currentAnswer: string | null;
  onAnswerChange: (rawAnswer: string, normalizedAnswer?: Record<string, unknown>) => void;
  disabled?: boolean;
}

interface BlankMeta {
  blankIndex: number;
  prefix?: string;
  answer?: string;
  hint?: string;
}

export function CompleteWordsRenderer({
  item,
  currentAnswer,
  onAnswerChange,
  disabled = false,
}: CompleteWordsRendererProps) {
  const passageTemplate =
    (item.payload?.passage as string) || (item.payload?.prompt as string) || "";
  const blanks = (item.payload?.blanks as BlankMeta[]) || [];
  const correctTokens = (item.payload?.correctTokens as string[]) || [];

  // Parse existing answers if already saved
  const [tokens, setTokens] = useState<string[]>(() => {
    if (!currentAnswer) return [];
    try {
      const parsed = JSON.parse(currentAnswer);
      return Array.isArray(parsed) ? parsed : [currentAnswer];
    } catch {
      return currentAnswer.split(",").map((s) => s.trim());
    }
  });

  useEffect(() => {
    if (!currentAnswer) {
      setTokens([]);
      return;
    }
    try {
      const parsed = JSON.parse(currentAnswer);
      if (Array.isArray(parsed)) setTokens(parsed);
    } catch {
      setTokens(currentAnswer.split(",").map((s) => s.trim()));
    }
  }, [currentAnswer]);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleBlankChange = (index: number, value: string) => {
    if (disabled) return;
    const sanitized = value.replace(/[^a-zA-Z]/g, "").toLowerCase();
    const updated = [...tokens];
    updated[index] = sanitized;
    setTokens(updated);
    onAnswerChange(JSON.stringify(updated), {
      tokens: updated,
      blanks: updated,
    });

    // Auto-advance to next blank when expected length is reached
    const expected =
      blanks[index]?.answer ||
      correctTokens[index] ||
      blanks[index]?.hint ||
      "";
    const targetLen = expected.length;
    if (targetLen > 0 && sanitized.length >= targetLen && index < blanks.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !tokens[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < blanks.length - 1) {
      const input = inputRefs.current[index];
      if (input && input.selectionStart === input.value.length) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      const input = inputRefs.current[index];
      if (input && input.selectionStart === 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "Enter" && index < blanks.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const getInputWidthClass = (expectedLen: number) => {
    if (expectedLen <= 1) return "w-6";
    if (expectedLen === 2) return "w-8";
    if (expectedLen === 3) return "w-11";
    if (expectedLen === 4) return "w-14";
    if (expectedLen === 5) return "w-16";
    if (expectedLen === 6) return "w-20";
    return "w-24";
  };

  // Split passageTemplate by [0], [1], etc. and assemble prefix + input pairs
  const rawParts = passageTemplate.split(/(\[\d+\])/g);

  // Pre-process parts so prefix is cleanly paired with the input box
  const renderedElements: React.ReactNode[] = [];
  let pendingPreText = "";

  for (let i = 0; i < rawParts.length; i++) {
    const part = rawParts[i] ?? "";
    const match = part.match(/^\[(\d+)\]$/);

    if (match && match[1]) {
      const blankIdx = parseInt(match[1], 10);
      const blankData = blanks.find((b) => b.blankIndex === blankIdx) || blanks[blankIdx];
      const expectedAnswer =
        blankData?.answer ||
        correctTokens[blankIdx] ||
        blankData?.hint ||
        "";
      const expectedLen = expectedAnswer.length || 3;
      const explicitPrefix = blankData?.prefix;

      // Extract prefix from pendingPreText
      let prefixToRender = explicitPrefix || "";
      let textBeforePrefix = pendingPreText;

      if (prefixToRender && pendingPreText.endsWith(prefixToRender)) {
        textBeforePrefix = pendingPreText.slice(0, pendingPreText.length - prefixToRender.length);
      } else if (!prefixToRender) {
        // Fallback: extract letters immediately preceding [blankIdx]
        const trailingWordMatch = pendingPreText.match(/([a-zA-Z]+)$/);
        if (trailingWordMatch && trailingWordMatch[1]) {
          prefixToRender = trailingWordMatch[1];
          textBeforePrefix = pendingPreText.slice(0, pendingPreText.length - prefixToRender.length);
        }
      }

      // Append text before prefix
      if (textBeforePrefix) {
        renderedElements.push(
          <span key={`text-${i}`} className="whitespace-pre-wrap">
            {textBeforePrefix}
          </span>,
        );
      }

      // Render prefix + shaded input together in an unbroken inline-flex token
      const val = tokens[blankIdx] ?? "";
      const widthClass = getInputWidthClass(expectedLen);

      renderedElements.push(
        <span
          key={`blank-${blankIdx}`}
          className="inline-flex items-baseline align-baseline whitespace-nowrap mx-0.5"
        >
          {prefixToRender && (
            <span className="font-normal text-slate-900 select-none">{prefixToRender}</span>
          )}
          <input
            ref={(el) => {
              inputRefs.current[blankIdx] = el;
            }}
            type="text"
            value={val}
            disabled={disabled}
            maxLength={Math.max(expectedLen + 2, 10)}
            onChange={(e) => handleBlankChange(blankIdx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(blankIdx, e)}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            className={`${widthClass} h-6.5 rounded-xs border border-[#8ba1b3] bg-[#9fb4c7]/40 px-1 py-0.5 text-center text-sm font-semibold text-slate-900 outline-none transition-all focus:border-[#0f3b82] focus:bg-white focus:ring-1 focus:ring-[#0f3b82] disabled:opacity-60`}
          />
        </span>,
      );

      pendingPreText = "";
    } else {
      pendingPreText += part;
    }
  }

  // Trailing text if any
  if (pendingPreText) {
    renderedElements.push(
      <span key="trailing-text" className="whitespace-pre-wrap">
        {pendingPreText}
      </span>,
    );
  }

  return (
    <div className="flex flex-col h-full justify-center space-y-8 max-w-4xl mx-auto px-4 py-6">
      {/* Centered Title (Matches reading_m1_cloze_100s.jpg) */}
      <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center">
        Fill in the missing letters in the paragraph.
      </h2>

      {/* Paragraph Container with Shaded Cloze Slots */}
      <div className="text-base sm:text-lg leading-[2.4] font-normal text-slate-900 text-left bg-white/40 p-8 sm:p-10 rounded-2xl shadow-xs border border-blue-100/60">
        {renderedElements}
      </div>
    </div>
  );
}
