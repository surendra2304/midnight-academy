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

  // Dynamic speaker rotation matching diverse high-res studio photos and voice genders
  const speaker = React.useMemo(() => {
    if (item.payload?.imageUrl) {
      return {
        imageUrl: item.payload.imageUrl as string,
        gender: (item.payload.speakerGender as "female" | "male") || "female",
        alt: "Speaker",
      };
    }

    const firstSpeakerLine = speechText.split("\n")[0]?.toLowerCase() || "";
    if (
      firstSpeakerLine.startsWith("man:") ||
      firstSpeakerLine.startsWith("male:") ||
      firstSpeakerLine.startsWith("mr.") ||
      firstSpeakerLine.startsWith("dr. king")
    ) {
      return {
        imageUrl: "/images/speakers/student-male-1.jpg",
        gender: "male" as const,
        alt: "Male Student",
      };
    }

    if (
      firstSpeakerLine.includes("professor") &&
      !firstSpeakerLine.includes("ms.") &&
      !firstSpeakerLine.includes("mrs.")
    ) {
      return {
        imageUrl: "/images/speakers/professor-male.jpg",
        gender: "male" as const,
        alt: "Male Professor",
      };
    }

    // Default rotation across questions: alternating Female Student, Male Student, Female Professor, Male Professor
    const idx = item.itemOrder ?? 0;
    const roster = [
      { imageUrl: "/images/speakers/student-female-1.jpg", gender: "female" as const, alt: "Female Student" },
      { imageUrl: "/images/speakers/student-male-1.jpg", gender: "male" as const, alt: "Male Student" },
      { imageUrl: "/images/speakers/professor-female.jpg", gender: "female" as const, alt: "Female Professor" },
      { imageUrl: "/images/speakers/professor-male.jpg", gender: "male" as const, alt: "Male Professor" },
    ];

    return roster[Math.abs(idx) % roster.length]!;
  }, [item.itemOrder, item.payload?.imageUrl, item.payload?.speakerGender, speechText]);

  const hasStudentPhoto =
    isChooseResponse ||
    Boolean(item.payload?.imageUrl) ||
    Boolean(item.payload?.hasStudentImage) ||
    true; // TestGlider displays speaker stimulus across listening items

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
    <div className="flex flex-col h-full space-y-4">
      {/* Centered Heading (TestGlider Screen 10) */}
      <div className="text-center pt-1">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {prompt.includes("Choose the best") ? "Choose the best response." : prompt}
        </h2>
        {prompt !== "Choose the best response." && prompt !== title ? (
          <p className="text-xs text-slate-500 mt-1">{title}</p>
        ) : null}
      </div>

      {/* Main Two-Column Split Container with Vertical Divider (Constrained to prevent vertical scrolling) */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-8 px-4 lg:px-12 py-2">
        {/* Left Column: Speaker Portrait & Audio Stimulus */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-white p-2 border border-slate-100 shadow-xs">
            <img
              src={speaker.imageUrl}
              alt={speaker.alt}
              className="max-h-[250px] w-auto object-contain rounded-xl transition-transform"
            />
          </div>

          {/* Audio Player (Autoplays once, natural voice matching gender) */}
          <div className="w-full max-w-md">
            <AudioPlayer
              key={item.id}
              audioUrl={audioUrl}
              speechText={speechText}
              gender={speaker.gender}
              maxPlays={1}
              onInteractionChange={handleAudioInteraction}
              disabled={disabled}
            />
          </div>
        </div>

        {/* Center: Vertical Divider Bar with Up/Down Arrows */}
        <div className="hidden md:flex flex-col items-center justify-center gap-2 text-slate-300">
          <ChevronUp className="size-4 text-slate-400" />
          <div className="h-64 w-1 rounded-full bg-slate-200" />
          <ChevronDown className="size-4 text-slate-400" />
        </div>

        {/* Right Column: Radio Button Choices */}
        <div className="flex flex-col justify-center space-y-4 max-w-lg">
          <div className="space-y-3">
            {item.options.map((opt) => {
              const isSelected =
                currentAnswer?.trim().toUpperCase() === opt.optionKey.toUpperCase();

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onAnswerChange(opt.optionKey, { selectedKey: opt.optionKey })}
                  className={`group flex w-full items-center gap-4 rounded-2xl border p-3.5 text-left transition-all ${
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

          {/* Action Row: Flag Question Only (No duplicate Next button) */}
          {onToggleFlag && (
            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
