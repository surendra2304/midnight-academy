/**
 * Complete the Words (Cloze) Item Renderer
 * Supports per-blank typing and live token array construction.
 */

import React, { useState, useEffect } from "react";
import type { ClientContentItem } from "@/lib/tests/session-state";

export interface CompleteWordsRendererProps {
  item: ClientContentItem;
  currentAnswer: string | null;
  onAnswerChange: (rawAnswer: string, normalizedAnswer?: Record<string, unknown>) => void;
  disabled?: boolean;
}

export function CompleteWordsRenderer({
  item,
  currentAnswer,
  onAnswerChange,
  disabled = false,
}: CompleteWordsRendererProps) {
  const passageTemplate =
    (item.payload?.passage as string) || (item.payload?.prompt as string) || "";
  const blanks = (item.payload?.blanks as Array<{ blankIndex: number; hint?: string }>) || [];

  // Parse existing answers if already saved
  const [tokens, setTokens] = useState<string[]>(() => {
    if (!currentAnswer) return [];
    try {
      const parsed = JSON.parse(currentAnswer);
      return Array.isArray(parsed) ? parsed : [currentAnswer];
    } catch {
      return [currentAnswer];
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
      // Ignore
    }
  }, [currentAnswer]);

  const handleBlankChange = (index: number, value: string) => {
    const updated = [...tokens];
    updated[index] = value;
    setTokens(updated);
    onAnswerChange(JSON.stringify(updated), { tokens: updated });
  };

  // Render passage with interactive input slots for blanks
  // Format convention: [0], [1], [2] in template string denotes blank slot
  const parts = passageTemplate.split(/(\[\d+\])/g);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs text-primary font-medium">
        Instructions: Complete the missing words in the passage below by typing your answers in the
        corresponding numbered fields.
      </div>

      <div className="leading-relaxed text-sm text-foreground/90 bg-card/40 p-6 rounded-xl border border-border">
        {parts.map((part, i) => {
          const match = part.match(/\[(\d+)\]/);
          if (match && match[1]) {
            const blankIdx = parseInt(match[1], 10);
            const val = tokens[blankIdx] ?? "";
            const hint = blanks.find((b) => b.blankIndex === blankIdx)?.hint;

            return (
              <span key={i} className="inline-flex items-center mx-1 my-1">
                <input
                  type="text"
                  value={val}
                  disabled={disabled}
                  placeholder={hint || `(${blankIdx + 1})`}
                  onChange={(e) => handleBlankChange(blankIdx, e.target.value)}
                  className="w-28 rounded-md border border-primary/40 bg-background px-2.5 py-1 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                />
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
    </div>
  );
}
