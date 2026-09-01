/**
 * Generic Test Runner Shell Component
 * Demonstrates the UI-independent engine with reading-style items, navigation, timer, and autosave.
 */

import React from 'react';
import { useAttemptSession, type UseAttemptSessionProps } from '@/lib/tests/use-attempt-session';
import { Clock, Flag, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TestRunnerShell(props: UseAttemptSessionProps) {
  const {
    blueprint,
    state,
    currentSection,
    currentItem,
    currentResponse,
    isSaving,
    handleAnswerChange,
    handleToggleFlag,
    handleNavigateItem,
    handleAdvanceSection,
    handleFinalize,
  } = useAttemptSession(props);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isLastSection = state.currentSectionIndex >= blueprint.sections.length - 1;
  const isLastItem = currentSection ? state.currentItemIndex >= currentSection.items.length - 1 : false;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Header */}
      <header className="flex h-16 items-center justify-between border-b border-border bg-card/50 px-6 backdrop-blur">
        <div>
          <h1 className="text-base font-bold text-foreground">{blueprint.name}</h1>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Section {state.currentSectionIndex + 1} of {blueprint.sections.length}: {currentSection?.sectionType}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {isSaving ? <span className="text-xs text-muted-foreground animate-pulse">Saving...</span> : null}

          {currentSection?.isTimed ? (
            <div className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold ${
              state.sectionRemainingSeconds < 120
                ? 'border-destructive/40 bg-destructive/10 text-destructive'
                : 'border-border bg-surface-2/40 text-foreground'
            }`}>
              <Clock className="size-4" />
              <span>{formatTimer(state.sectionRemainingSeconds)}</span>
            </div>
          ) : (
            <span className="rounded-lg border border-border bg-surface-2/40 px-3 py-1.5 text-xs text-muted-foreground">
              Untimed Practice
            </span>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={isLastSection ? handleFinalize : handleAdvanceSection}
          >
            {isLastSection ? 'Submit Test' : 'Next Section'}
          </Button>
        </div>
      </header>

      {/* Main Runner Body */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 gap-6 p-6">
        {/* Left Side: Passage / Payload / Stimulus */}
        <section className="flex-1 rounded-xl border border-border bg-card/30 p-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              {currentItem?.itemType?.replace(/_/g, ' ')}
            </span>
            <button
              type="button"
              onClick={handleToggleFlag}
              className={`flex items-center gap-1 text-xs font-semibold ${
                currentResponse?.isFlagged ? 'text-warning' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Flag className="size-3.5" />
              {currentResponse?.isFlagged ? 'Flagged for Review' : 'Flag Question'}
            </button>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p className="text-sm leading-relaxed text-foreground/90">
              {(currentItem?.payload?.passage as string) ||
                (currentItem?.payload?.prompt as string) ||
                (currentItem?.payload?.questionText as string) ||
                'Reading passage content.'}
            </p>
          </div>
        </section>

        {/* Right Side: Options / Response Input */}
        <section className="flex w-full max-w-md flex-col justify-between rounded-xl border border-border bg-card/30 p-6">
          <div>
            <h2 className="text-sm font-bold text-foreground">Question {state.currentItemIndex + 1}</h2>
            <p className="mt-2 text-sm text-foreground/80">
              {(currentItem?.payload?.prompt as string) || 'Select the correct option below:'}
            </p>

            {/* Render Multiple Choice Options */}
            {currentItem?.options && currentItem.options.length > 0 ? (
              <div className="mt-4 space-y-2.5">
                {currentItem.options.map((opt) => {
                  const isSelected = currentResponse?.rawAnswer === opt.optionKey;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleAnswerChange(opt.optionKey)}
                      className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left text-sm transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border hover:border-primary/40 text-foreground'
                      }`}
                    >
                      <span className={`flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'border border-border bg-surface-2'
                      }`}>
                        {opt.optionKey}
                      </span>
                      <span>{opt.optionText}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={currentResponse?.rawAnswer || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Write your response here..."
                rows={6}
                className="mt-4 w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            )}
          </div>

          {/* Bottom Item Navigator */}
          <div className="mt-6 border-t border-border pt-4">
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              {currentSection?.items.map((it, idx) => {
                const resp = state.responses[it.id];
                const isCurrent = idx === state.currentItemIndex;
                const isAnswered = resp?.isAnswered;
                const isFlagged = resp?.isFlagged;

                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => handleNavigateItem(idx)}
                    className={`relative flex size-7 items-center justify-center rounded text-xs font-semibold transition-all ${
                      isCurrent
                        ? 'border-2 border-primary bg-primary text-primary-foreground'
                        : isAnswered
                        ? 'border border-primary/40 bg-primary/15 text-primary'
                        : 'border border-border bg-surface-2 text-muted-foreground'
                    }`}
                  >
                    {idx + 1}
                    {isFlagged ? (
                      <span className="absolute -top-1 -right-1 size-2 rounded-full bg-warning" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={state.currentItemIndex === 0}
                onClick={() => handleNavigateItem(state.currentItemIndex - 1)}
              >
                Previous
              </Button>

              <Button
                size="sm"
                disabled={isLastItem}
                onClick={() => handleNavigateItem(state.currentItemIndex + 1)}
              >
                Next Item <ChevronRight className="ml-1 size-3.5" />
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
