/**
 * TestGlider 1:1 Split-view Reading Passage + Question Panel
 * Supports:
 * 1. Dark Teal Box for Emails (Marketing Coordinator, Elevator Maintenance) - Matches q21.jpg & Screen 4
 * 2. Dark Smartphone Bezel Frame for Text Chains (Sanjay, Emily, Carlos, Yuki) - Matches ts_750.jpg & Screen 5
 * 3. Academic Passages (The Power of Music) - Matches Screen 6 & 7
 * 4. Borderless circular radio choices with bold text selection matching authentic exams
 */

import React from "react";
import type { ClientContentItem } from "@/lib/tests/session-state";
import { Flag, ChevronUp, ChevronDown } from "lucide-react";

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
  const rawPassage = (payload.passage as string) || (payload.context as string) || "";
  const questionPrompt =
    (payload.prompt as string) ||
    (payload.questionText as string) ||
    "Choose the best answer:";

  const isEmail =
    payload.format === "email" ||
    payload.contextType === "email" ||
    Boolean(payload.emailHeader) ||
    Boolean(payload.email) ||
    passageTitle.toLowerCase().includes("email") ||
    rawPassage.includes("Subject:") ||
    rawPassage.includes("Dear ");

  // Extract Email Headers if embedded in text
  const emailHeaderData = React.useMemo(() => {
    const headerObj = (payload.emailHeader || payload.email || {}) as {
      date?: string;
      subject?: string;
      to?: string;
      from?: string;
    };

    let date = headerObj.date;
    let subject = headerObj.subject;
    let to = headerObj.to;
    let from = headerObj.from;
    let body = rawPassage;

    // If passage contains Date: or Subject: at beginning, parse them out
    const lines = rawPassage.split("\n");
    const cleanLines: string[] = [];
    let inHeader = true;

    for (const line of lines) {
      const trimmed = line.trim();
      if (inHeader) {
        if (trimmed.startsWith("Date:")) {
          date = trimmed.replace("Date:", "").trim();
          continue;
        }
        if (trimmed.startsWith("Subject:")) {
          subject = trimmed.replace("Subject:", "").trim();
          continue;
        }
        if (trimmed.startsWith("To:")) {
          to = trimmed.replace("To:", "").trim();
          continue;
        }
        if (trimmed.startsWith("From:")) {
          from = trimmed.replace("From:", "").trim();
          continue;
        }
        if (trimmed === "") {
          inHeader = false;
          continue;
        }
        inHeader = false;
      }
      cleanLines.push(line);
    }

    return {
      date,
      subject,
      to,
      from,
      body: cleanLines.join("\n").trim() || rawPassage,
    };
  }, [payload, rawPassage]);

  const isChat =
    payload.format === "chat" ||
    Boolean(payload.chatMessages) ||
    passageTitle.toLowerCase().includes("text chain");

  const chatMessages =
    (payload.chatMessages as Array<{ sender: string; time: string; text: string }>) || [];

  return (
    <div className="flex flex-col h-full space-y-4 max-w-6xl mx-auto w-full">
      {/* Centered Heading (TestGlider Screen 4 & 5 & q21.jpg) */}
      <div className="text-center pt-1">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          {isEmail ? "Read an email." : isChat ? "Read a text chain." : passageTitle}
        </h2>
      </div>

      {/* Main Two-Column Split with Vertical Divider */}
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_auto_1fr] items-start gap-8 px-2 lg:px-6 py-2">
        {/* Left Column: Passage / Email / Smartphone */}
        <div className="flex flex-col justify-start">
          {/* 1. Authentic Dark Teal Email Container (Matches q21.jpg & Screen 4) */}
          {isEmail && !isChat ? (
            <div className="w-full max-w-lg mx-auto bg-[#236371] p-3 rounded-md shadow-md space-y-2 border border-[#1b4e5a]">
              {/* Header Box */}
              <div className="border border-[#1b4e5a] bg-white rounded-xs divide-y divide-[#236371]/30 text-xs">
                {emailHeaderData.to && (
                  <div className="grid grid-cols-[70px_1fr] px-3 py-1.5 font-medium text-slate-800">
                    <span className="font-bold text-slate-600">To:</span>
                    <span>{emailHeaderData.to}</span>
                  </div>
                )}
                {emailHeaderData.from && (
                  <div className="grid grid-cols-[70px_1fr] px-3 py-1.5 font-medium text-slate-800">
                    <span className="font-bold text-slate-600">From:</span>
                    <span>{emailHeaderData.from}</span>
                  </div>
                )}
                {emailHeaderData.date && (
                  <div className="grid grid-cols-[70px_1fr] px-3 py-1.5 font-medium text-slate-800">
                    <span className="font-bold text-slate-600">Date:</span>
                    <span>{emailHeaderData.date}</span>
                  </div>
                )}
                {emailHeaderData.subject && (
                  <div className="grid grid-cols-[70px_1fr] px-3 py-1.5 font-medium text-slate-800">
                    <span className="font-bold text-slate-600">Subject:</span>
                    <span className="font-bold text-slate-900">{emailHeaderData.subject}</span>
                  </div>
                )}
              </div>

              {/* Email Body Card */}
              <div className="bg-white rounded-xs p-4 text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-line border border-[#1b4e5a] min-h-[220px]">
                {emailHeaderData.body}
              </div>
            </div>
          ) : isChat ? (
            /* 2. Dark Smartphone Bezel Frame (Matches ts_750.jpg & Screen 5) */
            <div className="w-full max-w-sm mx-auto rounded-[36px] bg-[#1e2530] p-4 shadow-xl border border-slate-700">
              {/* Top Speaker Slit */}
              <div className="mx-auto mb-3 flex items-center justify-center gap-2">
                <div className="size-1.5 rounded-full bg-[#168a96]" />
                <div className="h-1 w-12 rounded-full bg-[#168a96]/80" />
              </div>

              {/* Inner Smartphone Screen */}
              <div className="rounded-[22px] bg-[#eef3f7] p-4 space-y-3 overflow-y-auto max-h-[350px] text-xs shadow-inner">
                {chatMessages.length > 0 ? (
                  chatMessages.map((msg, idx) => (
                    <div key={idx} className="space-y-0.5 border-b border-slate-200/80 pb-2 last:border-0">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{msg.sender}</span>
                        <span className="text-[11px] font-normal text-slate-500 font-mono">({msg.time})</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed text-[12px]">{msg.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-800 whitespace-pre-line leading-relaxed text-xs sm:text-sm">
                    {rawPassage}
                  </div>
                )}
              </div>

              {/* Bottom Circular Home Button with Teal Accent (Matches ts_750.jpg) */}
              <div className="mx-auto mt-3 size-7 rounded-full border-2 border-[#168a96] bg-[#141b24] shadow-xs flex items-center justify-center">
                <div className="size-2.5 rounded-full bg-[#168a96]" />
              </div>
            </div>
          ) : (
            /* 3. Academic Passage (Screen 6 & 7) */
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs max-h-[420px] overflow-y-auto space-y-4">
              <h3 className="text-lg font-black text-slate-900">{passageTitle}</h3>
              <div className="text-sm leading-relaxed text-slate-800 whitespace-pre-line">
                {rawPassage}
              </div>
            </div>
          )}
        </div>

        {/* Center: Thin Vertical Divider Bar (Matches ts_750.jpg & q21.jpg) */}
        <div className="hidden md:flex flex-col items-center justify-center py-8">
          <div className="h-72 w-0.5 rounded-full bg-slate-300" />
        </div>

        {/* Right Column: Comprehension Question & Authentic Borderless Radio Choices */}
        <div className="flex flex-col justify-start space-y-5 max-w-lg">
          <h3 className="text-base font-bold text-slate-900 leading-relaxed">
            {questionPrompt}
          </h3>

          {/* Borderless Radio Choices (Matches q21.jpg & ts_750.jpg) */}
          <div className="space-y-4">
            {item.options.map((opt) => {
              const isSelected =
                currentAnswer?.trim().toUpperCase() === opt.optionKey.toUpperCase();

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onAnswerChange(opt.optionKey, { selectedKey: opt.optionKey })}
                  className="group flex w-full items-start gap-3.5 text-left py-1.5 px-1 rounded-lg hover:bg-white/40 transition-colors cursor-pointer"
                >
                  {/* TestGlider Circular Radio */}
                  <div
                    className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      isSelected
                        ? "border-[#0f3b82] bg-white"
                        : "border-slate-400 bg-white group-hover:border-slate-600"
                    }`}
                  >
                    {isSelected && <div className="size-2.5 rounded-full bg-[#0f3b82]" />}
                  </div>

                  <span
                    className={`text-sm leading-relaxed ${
                      isSelected
                        ? "font-bold text-slate-900"
                        : "font-normal text-slate-800 group-hover:text-slate-900"
                    }`}
                  >
                    {opt.optionText}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Flag Question */}
          {onToggleFlag && (
            <div className="flex justify-end pt-4">
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
