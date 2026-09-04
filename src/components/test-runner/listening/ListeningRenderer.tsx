/**
 * TestGlider 1:1 Listening Question Renderer (Screen 10 & 11)
 * Features centered "Choose the best response.", student portrait photo, vertical divider,
 * circular radio options, and natural voice audio playback.
 */

import React from "react";
import type { ClientContentItem } from "@/lib/tests/session-state";
import { AudioPlayer } from "./AudioPlayer";
import { Flag, ChevronUp, ChevronDown } from "lucide-react";
import type { AudioInteractionLog } from "@/lib/audio/audio-service";

export interface ListeningRendererProps {
  item: ClientContentItem;
  currentAnswer: string | null;
  isFlagged?: boolean;
  onAnswerChange: (rawAnswer: string, normalizedAnswer?: Record<string, unknown>) => void;
  onToggleFlag?: () => void;
  onNext?: () => void;
  disabled?: boolean;
}

export function ListeningRenderer({
  item,
  currentAnswer,
  isFlagged = false,
  onAnswerChange,
  onToggleFlag,
  onNext,
  disabled = false,
}: ListeningRendererProps) {
  const audioUrl = item.payload?.audioUrl as string | undefined;

  const title =
    (item.payload?.title as string) ||
    (item.payload?.context as string) ||
    "Choose the best response.";

  const prompt =
    (item.payload?.prompt as string) ||
    (item.payload?.questionText as string) ||
    "Choose the best response.";

  const speechText =
    (item.payload?.stimulusText as string) ||
    (item.payload?.transcript as string) ||
    (item.payload?.conversation as string) ||
    (item.payload?.lectureText as string) ||
    (item.payload?.announcementText as string) ||
    (item.payload?.prompt as string) ||
    "";

  const isChooseResponse =
    item.itemType === "listen_choose_response" ||
    title.toLowerCase().includes("choose the best response");

  const hasStudentPhoto =
    isChooseResponse ||
    Boolean(item.payload?.imageUrl) ||
    Boolean(item.payload?.hasStudentImage);

  const studentImageUrl =
    (item.payload?.imageUrl as string) || "/images/student-female-listening.png";

  const handleAudioInteraction = React.useCallback(
    (log: AudioInteractionLog) => {
      onAnswerChange(currentAnswer || "", {
        audioStats: log,
        selectedKey: currentAnswer,
      });
    },
    [currentAnswer, onAnswerChange],
  );

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Centered Heading (TestGlider Screen 10) */}
      <div className="text-center pt-2">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {prompt.includes("Choose the best") ? "Choose the best response." : prompt}
        </h2>
        {prompt !== "Choose the best response." && prompt !== title ? (
          <p className="text-xs text-slate-500 mt-1">{title}</p>
        ) : null}
      </div>

      {/* Main Two-Column Split Container with Vertical Divider */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-8 px-4 lg:px-12 py-4">
        {/* Left Column: Student Photo & Audio Stimulus */}
        <div className="flex flex-col items-center justify-center space-y-6">
          {hasStudentPhoto ? (
            <div className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-white p-2">
              <img
                src={studentImageUrl}
                alt="Student Prompt"
                className="max-h-[420px] w-auto object-contain transition-transform"
              />
            </div>
          ) : (
            <div className="flex h-72 w-full max-w-md items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
              Audio stimulus for academic talk / lecture
            </div>
          )}

          {/* Audio Player */}
          <div className="w-full max-w-md">
            <AudioPlayer
              key={item.id}
              audioUrl={audioUrl}
              speechText={speechText}
              gender={hasStudentPhoto ? "female" : "auto"}
              maxPlays={2}
              onInteractionChange={handleAudioInteraction}
              disabled={disabled}
            />
          </div>
        </div>

        {/* Center: Vertical Divider Bar with Up/Down Arrows */}
        <div className="hidden md:flex flex-col items-center justify-center gap-2 text-slate-300">
          <ChevronUp className="size-4 text-slate-400" />
          <div className="h-96 w-1 rounded-full bg-slate-200" />
          <ChevronDown className="size-4 text-slate-400" />
        </div>

        {/* Right Column: Radio Button Choices */}
        <div className="flex flex-col justify-center space-y-4 max-w-lg">
          <div className="space-y-3.5">
            {item.options.map((opt) => {
              const isSelected =
                currentAnswer?.trim().toUpperCase() === opt.optionKey.toUpperCase();

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onAnswerChange(opt.optionKey, { selectedKey: opt.optionKey })}
                  className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-[#0f3b82] bg-blue-50/50 text-[#0f3b82] font-semibold shadow-xs"
                      : "border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-700"
                  }`}
                >
                  {/* TestGlider Radio Circle */}
                  <div
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      isSelected
                        ? "border-[#0f3b82] bg-[#0f3b82]"
                        : "border-slate-300 bg-white group-hover:border-slate-400"
                    }`}
                  >
                    {isSelected && <div className="size-2 rounded-full bg-white" />}
                  </div>

                  <span className="text-sm leading-relaxed">{opt.optionText}</span>
                </button>
              );
            })}
          </div>

          {/* Action Row: Flag & Next Question */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {onToggleFlag ? (
              <button
                type="button"
                onClick={onToggleFlag}
                disabled={disabled}
                className={`flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  isFlagged ? "text-amber-600" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <Flag className="size-3.5" />
                {isFlagged ? "Flagged for Review" : "Flag Question"}
              </button>
            ) : (
              <div />
            )}

            {onNext && (
              <button
                type="button"
                onClick={onNext}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#0f3b82] hover:bg-blue-700 text-white font-bold px-6 py-2 text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Next &gt;
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
