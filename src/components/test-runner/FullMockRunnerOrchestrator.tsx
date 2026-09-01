/**
 * Full TOEFL Mock Test Runner Orchestrator
 * Sequences Reading -> Listening -> Writing -> Speaking with pre-test hardware checks, section locks, and final result submission.
 */

import React, { useState } from 'react';
import { useAttemptSession, type UseAttemptSessionProps } from '@/lib/tests/use-attempt-session';
import { SplitReadingRenderer } from './reading/SplitReadingRenderer';
import { CompleteWordsRenderer } from './reading/CompleteWordsRenderer';
import { ListeningRenderer } from './listening/ListeningRenderer';
import { BuildSentenceRenderer } from './writing/BuildSentenceRenderer';
import { WritingEditorRenderer } from './writing/WritingEditorRenderer';
import { SpeakingRecorder } from './speaking/SpeakingRecorder';
import { Clock, CheckCircle2, ChevronRight, Mic, Volume2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FullMockRunnerOrchestrator(props: UseAttemptSessionProps) {
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

  const [hasStartedMock, setHasStartedMock] = useState(false);
  const [micCheckPassed, setMicCheckPassed] = useState(false);
  const [audioCheckPassed, setAudioCheckPassed] = useState(false);

  // 1. Pre-Test Instructions & Hardware Check Screen
  if (!hasStartedMock) {
    return (
      <div className="mx-auto flex min-h-[85vh] max-w-4xl flex-col justify-center p-6 space-y-6">
        <div className="rounded-2xl border border-border bg-card/50 p-8 shadow-xl space-y-6">
          <div className="border-b border-border pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Official 2026 Format Assessment</span>
            <h1 className="text-2xl font-extrabold text-foreground mt-1">{blueprint.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              4-Section Full Examination (Reading → Listening → Writing → Speaking)
            </p>
          </div>

          {/* Section Sequence & Timings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border bg-surface-2/40 p-4 text-center">
              <span className="text-xs font-bold text-primary uppercase">1. Reading</span>
              <p className="text-xs text-muted-foreground mt-1">30 Minutes</p>
              <p className="text-[10px] text-muted-foreground">Passages & Cloze</p>
            </div>
            <div className="rounded-xl border border-border bg-surface-2/40 p-4 text-center">
              <span className="text-xs font-bold text-primary uppercase">2. Listening</span>
              <p className="text-xs text-muted-foreground mt-1">29 Minutes</p>
              <p className="text-[10px] text-muted-foreground">Audio & Talks</p>
            </div>
            <div className="rounded-xl border border-border bg-surface-2/40 p-4 text-center">
              <span className="text-xs font-bold text-primary uppercase">3. Writing</span>
              <p className="text-xs text-muted-foreground mt-1">23 Minutes</p>
              <p className="text-[10px] text-muted-foreground">Email & Discussion</p>
            </div>
            <div className="rounded-xl border border-border bg-surface-2/40 p-4 text-center">
              <span className="text-xs font-bold text-primary uppercase">4. Speaking</span>
              <p className="text-xs text-muted-foreground mt-1">8 Minutes</p>
              <p className="text-[10px] text-muted-foreground">Interview & Repetition</p>
            </div>
          </div>

          {/* Hardware Checks */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Hardware & Environment Verification</h3>

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-3">
              <div className="flex items-center gap-3">
                <Volume2 className="size-5 text-primary" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Audio Playback Check</p>
                  <p className="text-[11px] text-muted-foreground">Ensure headphones or speakers are functioning.</p>
                </div>
              </div>
              <Button
                size="sm"
                variant={audioCheckPassed ? 'outline' : 'secondary'}
                onClick={() => setAudioCheckPassed(true)}
              >
                {audioCheckPassed ? <CheckCircle2 className="size-3.5 mr-1 text-success" /> : null}
                {audioCheckPassed ? 'Verified' : 'Test Audio'}
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Mic className="size-5 text-primary" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Microphone Access Check</p>
                  <p className="text-[11px] text-muted-foreground">Required for the Speaking section responses.</p>
                </div>
              </div>
              <Button
                size="sm"
                variant={micCheckPassed ? 'outline' : 'secondary'}
                onClick={() => setMicCheckPassed(true)}
              >
                {micCheckPassed ? <CheckCircle2 className="size-3.5 mr-1 text-success" /> : null}
                {micCheckPassed ? 'Verified' : 'Check Mic'}
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button size="lg" onClick={() => setHasStartedMock(true)}>
              Begin Examination <ChevronRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Active Mock Runner
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isLastSection = state.currentSectionIndex >= blueprint.sections.length - 1;
  const isLastItem = currentSection ? state.currentItemIndex >= currentSection.items.length - 1 : false;

  // Render Section-specific Item Component
  const renderItemStimulus = () => {
    if (!currentItem) return null;

    if (currentItem.itemType === 'complete_words') {
      return (
        <CompleteWordsRenderer
          item={currentItem}
          currentAnswer={currentResponse?.rawAnswer || null}
          onAnswerChange={handleAnswerChange}
        />
      );
    }

    if (currentItem.itemType === 'read_daily_life' || currentItem.itemType === 'read_academic') {
      return (
        <SplitReadingRenderer
          item={currentItem}
          currentAnswer={currentResponse?.rawAnswer || null}
          isFlagged={currentResponse?.isFlagged}
          onAnswerChange={handleAnswerChange}
          onToggleFlag={handleToggleFlag}
        />
      );
    }

    if (
      currentItem.itemType === 'listen_choose_response' ||
      currentItem.itemType === 'listen_conversation' ||
      currentItem.itemType === 'listen_announcement' ||
      currentItem.itemType === 'listen_academic_talk'
    ) {
      return (
        <ListeningRenderer
          item={currentItem}
          currentAnswer={currentResponse?.rawAnswer || null}
          isFlagged={currentResponse?.isFlagged}
          onAnswerChange={handleAnswerChange}
          onToggleFlag={handleToggleFlag}
        />
      );
    }

    if (currentItem.itemType === 'build_sentence') {
      return (
        <BuildSentenceRenderer
          item={currentItem}
          currentAnswer={currentResponse?.rawAnswer || null}
          onAnswerChange={handleAnswerChange}
        />
      );
    }

    if (currentItem.itemType === 'write_email' || currentItem.itemType === 'academic_discussion') {
      return (
        <WritingEditorRenderer
          item={currentItem}
          currentAnswer={currentResponse?.rawAnswer || null}
          onAnswerChange={handleAnswerChange}
        />
      );
    }

    if (currentItem.itemType === 'listen_repeat' || currentItem.itemType === 'take_interview') {
      return (
        <SpeakingRecorder
          item={currentItem}
          currentAnswer={currentResponse?.rawAnswer || null}
          onAnswerChange={handleAnswerChange}
        />
      );
    }

    return <div>Unsupported item type</div>;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-border bg-card/60 px-6 backdrop-blur">
        <div>
          <h1 className="text-sm font-bold text-foreground">{blueprint.name}</h1>
          <p className="text-xs uppercase tracking-wider text-primary font-semibold">
            Section {state.currentSectionIndex + 1} of {blueprint.sections.length}: {currentSection?.sectionType}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {isSaving ? <span className="text-xs text-muted-foreground animate-pulse">Autosaving...</span> : null}

          {currentSection?.isTimed ? (
            <div className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold ${
              state.sectionRemainingSeconds < 120
                ? 'border-destructive/40 bg-destructive/10 text-destructive'
                : 'border-border bg-surface-2/40 text-foreground'
            }`}>
              <Clock className="size-4" />
              <span>{formatTimer(state.sectionRemainingSeconds)}</span>
            </div>
          ) : null}

          <Button
            size="sm"
            variant="outline"
            onClick={isLastSection ? handleFinalize : handleAdvanceSection}
          >
            {isLastSection ? 'Submit & Finalize Mock' : 'Next Section'}
          </Button>
        </div>
      </header>

      {/* Main Section Content Area */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col p-6 space-y-6">
        <div className="flex-1">{renderItemStimulus()}</div>

        {/* Item Navigation Footer */}
        {currentSection && currentSection.items.length > 1 ? (
          <footer className="flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-2">
              {currentSection.items.map((it, idx) => {
                const resp = state.responses[it.id];
                const isCurrent = idx === state.currentItemIndex;
                const isAnswered = resp?.isAnswered;

                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => handleNavigateItem(idx)}
                    className={`size-8 rounded-lg text-xs font-bold transition-all ${
                      isCurrent
                        ? 'border-2 border-primary bg-primary text-primary-foreground'
                        : isAnswered
                        ? 'border border-primary/40 bg-primary/10 text-primary'
                        : 'border border-border bg-surface-2 text-muted-foreground'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
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
          </footer>
        ) : null}
      </main>
    </div>
  );
}
