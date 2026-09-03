/**
 * Listening Item Renderer
 * Supports Listen and Choose a Response, Conversation, Announcement, and Academic Talk.
 * Ensures the transcript is never leaked to the student during the active test session.
 */

import React from "react";
import type { ClientContentItem } from "@/lib/tests/session-state";
import { AudioPlayer } from "./AudioPlayer";
import { Flag, Headphones } from "lucide-react";
import type { AudioInteractionLog } from "@/lib/audio/audio-service";

export interface ListeningRendererProps {
  item: ClientContentItem;
  currentAnswer: string | null;
  isFlagged?: boolean;
  onAnswerChange: (rawAnswer: string, normalizedAnswer?: Record<string, unknown>) => void;
  onToggleFlag?: () => void;
  disabled?: boolean;
}

export function ListeningRenderer({
  item,
  currentAnswer,
  isFlagged = false,
  onAnswerChange,
  onToggleFlag,
  disabled = false,
}: ListeningRendererProps) {
  const audioUrl =
    (item.payload?.audioUrl as string) ||
    "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3"; // Fallback demo audio

  const title =
    (item.payload?.title as string) || (item.payload?.context as string) || "Listening Passage";
  const prompt =
    (item.payload?.prompt as string) ||
    (item.payload?.questionText as string) ||
    "Choose the best answer based on what you heard:";

  const speechText =
    (item.payload?.stimulusText as string) ||
    (item.payload?.transcript as string) ||
    (item.payload?.conversation as string) ||
    (item.payload?.lectureText as string) ||
    (item.payload?.announcementText as string) ||
    (item.payload?.prompt as string) ||
    "";

  const handleAudioInteraction = React.useCallback(
    (log: AudioInteractionLog) => {
      // Merge audio interaction stats into normalizedAnswer
      onAnswerChange(currentAnswer || "", {
        audioStats: log,
        selectedKey: currentAnswer,
      });
    },
    [currentAnswer, onAnswerChange],
  );

  return (
    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left Panel: Audio Stimulus & Instructions */}
      <section className="flex flex-col justify-between rounded-xl border border-border bg-card/40 p-6 space-y-6">
        <div>
          <div className="mb-4 border-b border-border pb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Headphones className="size-4" /> {item.itemType.replace(/_/g, " ")}
            </span>
          </div>

          <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Listen carefully to the audio track. You may listen up to the allowed replay limit
            before answering the question.
          </p>

          <div className="mt-6">
            <AudioPlayer
              key={item.id}
              audioUrl={audioUrl}
              speechText={speechText}
              maxPlays={2}
              onInteractionChange={handleAudioInteraction}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground leading-relaxed">
          <strong className="text-primary font-semibold">Note:</strong> Test security policy
          prevents transcripts from displaying during live examination. The full audio transcript
          will be available in your review report after submission.
        </div>
      </section>

      {/* Right Panel: Question Prompt & Options */}
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
                  isFlagged ? "text-warning" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Flag className="size-3.5" />
                {isFlagged ? "Flagged" : "Flag Question"}
              </button>
            ) : null}
          </div>

          <p className="text-sm font-medium text-foreground leading-relaxed">{prompt}</p>

          {/* Options */}
          <div className="mt-5 space-y-2.5">
            {item.options.map((opt) => {
              const isSelected =
                currentAnswer?.trim().toUpperCase() === opt.optionKey.toUpperCase();

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onAnswerChange(opt.optionKey, { selectedKey: opt.optionKey })}
                  className={`flex w-full items-start gap-3 rounded-lg border p-3.5 text-left text-sm transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary font-medium shadow-sm"
                      : "border-border bg-background/50 hover:border-primary/40 text-foreground"
                  }`}
                >
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-surface-2 text-muted-foreground"
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
