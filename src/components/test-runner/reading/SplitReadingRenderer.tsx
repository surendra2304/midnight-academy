/**
 * TestGlider 1:1 Split-view Reading Passage + Question Panel
 * Supports:
 * 1. Deep Teal Container for Email (Millhouse Tower, Sakura Ramen) - Screen 4
 * 2. Dark Smartphone Frame for Text Chain (Innovation Convention) - Screen 5
 * 3. Academic Passages (Longevity) - Screen 6 & 7
 */

import React from "react";
import type { ClientContentItem } from "@/lib/tests/session-state";
import { Flag, Mail, MessageSquare, BookOpen, ChevronUp, ChevronDown } from "lucide-react";

export interface SplitReadingRendererProps {
  item: ClientContentItem;
  currentAnswer: string | null;
  isFlagged?: boolean;
  onAnswerChange: (rawAnswer: string, normalizedAnswer?: Record<string, unknown>) => void;
  onToggleFlag?: () => void;
  onNext?: () => void;
  disabled?: boolean;
}

export function SplitReadingRenderer({
  item,
  currentAnswer,
  isFlagged = false,
  onAnswerChange,
  onToggleFlag,
  onNext,
  disabled = false,
}: SplitReadingRendererProps) {
  const payload = (item.payload || {}) as Record<string, unknown>;
  const passageTitle =
    (payload.title as string) ||
    (item.sectionType === "reading" ? "Reading Passage" : "Text");
  const passageBody = (payload.passage as string) || (payload.context as string) || "";
  const questionPrompt =
    (payload.prompt as string) ||
    (payload.questionText as string) ||
    "Choose the best answer:";

  const isEmail =
    payload.format === "email" ||
    Boolean(payload.email) ||
    passageTitle.toLowerCase().includes("email") ||
    passageBody.includes("From:") ||
    passageBody.includes("Greetings");

  const emailData = (payload.email as {
    to?: string;
    from?: string;
    date?: string;
    subject?: string;
  }) || {
    to: "All tenants of Millhouse Tower",
    from: "bwrightson@MTowermail.com",
    date: "15/07/2025",
    subject: "Elevator Maintenance",
  };

  const isChat =
    payload.format === "chat" ||
    Boolean(payload.chatMessages) ||
    passageTitle.toLowerCase().includes("text chain");

  const chatMessages =
    (payload.chatMessages as Array<{ sender: string; time: string; text: string }>) || [];

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Centered Heading (TestGlider Screen 4 & 5) */}
      <div className="text-center pt-1">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {isEmail ? "Read an email." : isChat ? "Read a text chain." : passageTitle}
        </h2>
      </div>

      {/* Main Two-Column Split with Vertical Divider */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-start gap-8 px-4 lg:px-10 py-1">
        {/* Left Column: Passage / Email / Smartphone */}
        <div className="flex flex-col justify-start">
          {/* 1. Clean Professional Email Container */}
          {isEmail && !isChat ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 max-w-lg mx-auto w-full">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-1.5 text-slate-700">
                  <span className="font-bold text-slate-500 w-14 shrink-0">To:</span>
                  <span className="font-medium text-slate-900">{emailData.to || "All tenants of Millhouse Tower"}</span>
                </div>
                <div className="flex items-center gap-3 border-b border-slate-100 pb-1.5 text-slate-700">
                  <span className="font-bold text-slate-500 w-14 shrink-0">From:</span>
                  <span className="font-mono text-slate-800">{emailData.from || "bwrightson@MTowermail.com"}</span>
                </div>
                <div className="flex items-center gap-3 border-b border-slate-100 pb-1.5 text-slate-700">
                  <span className="font-bold text-slate-500 w-14 shrink-0">Date:</span>
                  <span className="text-slate-800">{emailData.date || "15/07/2025"}</span>
                </div>
                <div className="flex items-center gap-3 border-b border-slate-100 pb-1.5 text-slate-700">
                  <span className="font-bold text-slate-500 w-14 shrink-0">Subject:</span>
                  <span className="font-bold text-slate-900">{emailData.subject || "Elevator Maintenance"}</span>
                </div>
              </div>

              {/* Email Body Card: Clean text, zero inner scrollbar */}
              <div className="pt-2 text-sm leading-relaxed text-slate-800 whitespace-pre-line">
                {passageBody}
              </div>
            </div>
          ) : isChat ? (
            /* 2. Dark Smartphone Bezel Frame (Screen 5) */
            <div className="w-full max-w-sm mx-auto rounded-[32px] bg-slate-900 p-4 shadow-2xl border border-slate-700">
              {/* Top Speaker Slit */}
              <div className="mx-auto mb-2.5 h-1 w-12 rounded-full bg-slate-700" />

              {/* Inner Smartphone Screen */}
              <div className="rounded-[20px] bg-white p-3.5 space-y-2.5 overflow-y-auto max-h-[340px] text-xs shadow-inner">
                {chatMessages.length > 0 ? (
                  chatMessages.map((msg, idx) => (
                    <div key={idx} className="space-y-0.5 border-b border-slate-100 pb-2 last:border-0">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{msg.sender}</span>
                        <span className="text-[11px] font-normal text-slate-400 font-mono">({msg.time})</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-[12px]">{msg.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-800 whitespace-pre-line leading-relaxed">
                    {passageBody}
                  </div>
                )}
              </div>

              {/* Bottom Circular Home Button (Neutral slate theme, zero teal) */}
              <div className="mx-auto mt-2.5 size-7 rounded-full border border-slate-700 bg-slate-800 shadow-xs flex items-center justify-center">
                <div className="size-2.5 rounded-full bg-slate-600" />
              </div>
            </div>
          ) : (
            /* 3. Academic Passage (Screen 6 & 7) */
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs max-h-[380px] overflow-y-auto space-y-3">
              <h3 className="text-lg font-black text-slate-900">{passageTitle}</h3>
              <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {passageBody}
              </div>
            </div>
          )}
        </div>

        {/* Center: Vertical Divider Bar */}
        <div className="hidden md:flex flex-col items-center justify-center gap-2 text-slate-300">
          <ChevronUp className="size-4 text-slate-400" />
          <div className="h-64 w-1 rounded-full bg-slate-200" />
          <ChevronDown className="size-4 text-slate-400" />
        </div>

        {/* Right Column: Comprehension Question & Radio Choices */}
        <div className="flex flex-col justify-start space-y-5 max-w-lg">
          <h3 className="text-base font-bold text-slate-900 leading-relaxed">
            {questionPrompt}
          </h3>

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

          {/* Flag Question */}
          {onToggleFlag && (
            <div className="flex justify-end pt-2">
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
