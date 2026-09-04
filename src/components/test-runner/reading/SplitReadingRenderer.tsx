/**
 * TestGlider 1:1 Split-view Reading Passage + Question Panel
 * Supports Email (Millhouse Tower, Sakura Ramen), Text Chain (Innovation Convention), and Academic Passages (Longevity).
 */

import React from "react";
import type { ClientContentItem } from "@/lib/tests/session-state";
import { Flag, Mail, MessageSquare, BookOpen } from "lucide-react";

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
    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left Panel: Passage Canvas */}
      <section className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm overflow-y-auto max-h-[calc(100vh-170px)]">
        <div className="mb-4 border-b border-slate-100 pb-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0f3b82] flex items-center gap-1.5">
            {isEmail ? (
              <Mail className="size-3.5" />
            ) : isChat ? (
              <MessageSquare className="size-3.5" />
            ) : (
              <BookOpen className="size-3.5" />
            )}
            {passageTitle}
          </span>
        </div>

        {/* 1. Email Format */}
        {isEmail && !isChat ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-teal-300/80 bg-teal-50/50 p-4 space-y-1.5 text-xs text-slate-800 shadow-inner">
              <div className="grid grid-cols-[60px_1fr] gap-1">
                <span className="font-bold text-teal-900">To:</span>
                <span className="text-slate-900">{emailData.to || "Recipient"}</span>
              </div>
              <div className="grid grid-cols-[60px_1fr] gap-1">
                <span className="font-bold text-teal-900">From:</span>
                <span className="font-mono text-slate-900">{emailData.from || "Sender"}</span>
              </div>
              <div className="grid grid-cols-[60px_1fr] gap-1">
                <span className="font-bold text-teal-900">Date:</span>
                <span className="text-slate-900">{emailData.date || "Date"}</span>
              </div>
              <div className="grid grid-cols-[60px_1fr] gap-1">
                <span className="font-bold text-teal-900">Subject:</span>
                <span className="font-bold text-slate-900">{emailData.subject || "Subject"}</span>
              </div>
            </div>

            <div className="text-sm leading-relaxed text-slate-800 whitespace-pre-line px-1">
              {passageBody}
            </div>
          </div>
        ) : isChat ? (
          /* 2. Chat Text Chain Format */
          <div className="space-y-3">
            {chatMessages.length > 0 ? (
              chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-1 shadow-sm transition-all hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#0f3b82] font-bold">{msg.sender}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{msg.time}</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed">{msg.text}</p>
                </div>
              ))
            ) : (
              <div className="text-sm leading-relaxed text-slate-800 whitespace-pre-line">
                {passageBody}
              </div>
            )}
          </div>
        ) : (
          /* 3. Academic Article Format */
          <div className="space-y-4 px-1">
            <h2 className="text-xl font-extrabold text-slate-900">{passageTitle}</h2>
            <div className="text-sm leading-relaxed text-slate-800 whitespace-pre-line">
              {passageBody}
            </div>
          </div>
        )}
      </section>

      {/* Right Panel: Comprehension Question & Options */}
      <section className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Comprehension Question
            </span>
            {onToggleFlag ? (
              <button
                type="button"
                onClick={onToggleFlag}
                disabled={disabled}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                  isFlagged ? "text-amber-600 font-bold" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <Flag className="size-3.5" />
                {isFlagged ? "Flagged" : "Flag Question"}
              </button>
            ) : null}
          </div>

          <h3 className="text-base font-bold text-slate-900 leading-relaxed mb-6">
            {questionPrompt}
          </h3>

          {/* TestGlider Circular Radio Options */}
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
                  className={`flex w-full items-start gap-3.5 rounded-xl border p-4 text-left text-sm transition-all ${
                    isSelected
                      ? "border-[#0f3b82] bg-blue-50/60 text-[#0f3b82] font-semibold shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 text-slate-800"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      isSelected
                        ? "border-[#0f3b82] bg-[#0f3b82]"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected ? <div className="size-2 rounded-full bg-white" /> : null}
                  </div>
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
