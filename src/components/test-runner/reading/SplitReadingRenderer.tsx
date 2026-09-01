/**
 * Split-view Reading Passage + Question Panel
 * Used for Read in Daily Life & Read an Academic Passage
 */

import React from 'react';
import type { ClientContentItem } from '@/lib/tests/session-state';
import { Flag } from 'lucide-react';

export interface SplitReadingRendererProps {
  item: ClientContentItem;
  currentAnswer: string | null;
  isFlagged?: boolean;
  onAnswerChange: (rawAnswer: string, normalizedAnswer?: Record<string, unknown>) => void;
  onToggleFlag?: () => void;
  disabled?: boolean;
}

export function SplitReadingRenderer({
  item,
  currentAnswer,
  isFlagged = false,
  onAnswerChange,
  onToggleFlag,
  disabled = false,
}: SplitReadingRendererProps) {
  const passageTitle = (item.payload?.title as string) || (item.sectionType === 'reading' ? 'Reading Passage' : 'Text');
  const passageBody = (item.payload?.passage as string) || (item.payload?.context as string) || '';
  const questionPrompt = (item.payload?.prompt as string) || (item.payload?.questionText as string) || 'Choose the best answer:';

  return (
    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left Panel: Scrollable Passage */}
      <section className="flex flex-col rounded-xl border border-border bg-card/40 p-6 overflow-y-auto max-h-[calc(100vh-170px)]">
        <div className="mb-4 border-b border-border pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            {item.itemType === 'read_daily_life' ? 'Read in Daily Life' : 'Academic Reading Passage'}
          </span>
          <h3 className="mt-1 text-base font-bold text-foreground">{passageTitle}</h3>
        </div>

        <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
          {passageBody}
        </div>
      </section>

      {/* Right Panel: Comprehension Question & Options */}
      <section className="flex flex-col justify-between rounded-xl border border-border bg-card/40 p-6">
        <div>
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Comprehension Question
            </span>
            {onToggleFlag ? (
              <button
                type="button"
                onClick={onToggleFlag}
                disabled={disabled}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                  isFlagged ? 'text-warning' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Flag className="size-3.5" />
                {isFlagged ? 'Flagged' : 'Flag Question'}
              </button>
            ) : null}
          </div>

          <p className="text-sm font-medium text-foreground leading-relaxed">{questionPrompt}</p>

          {/* Options */}
          <div className="mt-5 space-y-2.5">
            {item.options.map((opt) => {
              const isSelected = currentAnswer?.trim().toUpperCase() === opt.optionKey.toUpperCase();

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onAnswerChange(opt.optionKey, { selectedKey: opt.optionKey })}
                  className={`flex w-full items-start gap-3 rounded-lg border p-3.5 text-left text-sm transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary font-medium shadow-sm'
                      : 'border-border bg-background/50 hover:border-primary/40 text-foreground'
                  }`}
                >
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border bg-surface-2 text-muted-foreground'
                    }`}
                  >
                    {opt.optionKey}
                  </span>
                  <span className="leading-snug">{opt.optionText}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
