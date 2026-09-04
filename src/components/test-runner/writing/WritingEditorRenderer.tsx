/**
 * TestGlider 1:1 Writing Item Renderer
 * Supports Academic Discussion (Professor Takata, Mikhail, Kaitlyn) & Email Writing with Cut/Paste/Undo/Redo toolbar and word count toggle.
 */

import React, { useState, useRef } from "react";
import type { ClientContentItem } from "@/lib/tests/session-state";
import { Mail, MessageSquare, Eye, EyeOff, Scissors, Clipboard, Undo, Redo, User } from "lucide-react";

export interface WritingEditorRendererProps {
  item: ClientContentItem;
  currentAnswer: string | null;
  onAnswerChange: (rawAnswer: string, normalizedAnswer?: Record<string, unknown>) => void;
  disabled?: boolean;
}

export function WritingEditorRenderer({
  item,
  currentAnswer,
  onAnswerChange,
  disabled = false,
}: WritingEditorRendererProps) {
  const isEmail = item.itemType === "write_email";
  const payload = (item.payload || {}) as Record<string, unknown>;
  const title =
    (payload.title as string) || (isEmail ? "Write an Email" : "Academic Discussion");
  const prompt = (payload.prompt as string) || "";
  const recipient =
    (payload.recipient as string) || (isEmail ? "Professor / Campus Office" : "");

  const professorData = (payload.professor as {
    name?: string;
    avatar?: string;
    text?: string;
  }) || {
    name: "Professor Takata",
    avatar: "PT",
    text:
      "Today we are going to cover the topic of sin taxes. These are taxes that the government adds to products, goods, or services that are harmful to individuals or society as a whole. Recently, these taxes have been applied to sugary drinks, fast food, and junk foods. Proponents say these taxes could discourage people from consuming such items and reduce health issues like obesity. Critics argue that these taxes unfairly target low-income consumers who cannot afford healthier foods. Which opinion do you agree with and why?",
  };

  const discussionPosts =
    (payload.discussionPosts as Array<{ author: string; avatar?: string; text: string }>) || [
      {
        author: "Mikhail",
        avatar: "M",
        text:
          "I do not agree with applying sin taxes to unhealthy food items. As the professor mentioned, these taxes may unfairly affect poor people who rely on those foods. There are areas in the United States called food deserts where many people without cars live too far from a supermarket to walk there. So, they often have to eat fast food and junk food just to have any kind of food. Their diets aren't healthy, but they have to eat what is available. Sin taxes would really hurt these people.",
      },
      {
        author: "Kaitlyn",
        avatar: "K",
        text:
          "I definitely support adding taxes to unhealthy products. Fast food and junk food often contain high amounts of sugar, fat, and salt, which can cause many health problems including heart disease and obesity. Taxes will discourage people from buying them, and the money from these taxes can be used by the government to help people with those problems. They could also provide incentives to supermarkets to move into food deserts and sell healthier foods.",
      },
    ];

  const [showWordCount, setShowWordCount] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const historyRef = useRef<string[]>([currentAnswer || ""]);
  const historyIndexRef = useRef<number>(0);

  const wordCount = (currentAnswer || "").trim().split(/\s+/).filter(Boolean).length;

  const handleChange = (text: string) => {
    // Record undo history
    if (text !== historyRef.current[historyIndexRef.current]) {
      const nextHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
      nextHistory.push(text);
      if (nextHistory.length > 50) nextHistory.shift();
      historyRef.current = nextHistory;
      historyIndexRef.current = nextHistory.length - 1;
    }

    onAnswerChange(text, {
      text,
      wordCount: text.trim().split(/\s+/).filter(Boolean).length,
    });
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const prev = historyRef.current[historyIndexRef.current] || "";
      onAnswerChange(prev, {
        text: prev,
        wordCount: prev.trim().split(/\s+/).filter(Boolean).length,
      });
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const next = historyRef.current[historyIndexRef.current] || "";
      onAnswerChange(next, {
        text: next,
        wordCount: next.trim().split(/\s+/).filter(Boolean).length,
      });
    }
  };

  const handleCut = async () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start === end) return;
    const selText = el.value.substring(start, end);
    try {
      await navigator.clipboard.writeText(selText);
    } catch {
      // fallback
    }
    const newText = el.value.substring(0, start) + el.value.substring(end);
    handleChange(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start;
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handlePaste = async () => {
    const el = textareaRef.current;
    if (!el) return;
    try {
      const clipText = await navigator.clipboard.readText();
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newText = el.value.substring(0, start) + clipText + el.value.substring(end);
      handleChange(newText);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
            start + clipText.length;
          textareaRef.current.focus();
        }
      }, 0);
    } catch {
      // clipboard read blocked by browser security
    }
  };

  return (
    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left Column: Context / Discussion Board */}
      <section className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm overflow-y-auto max-h-[calc(100vh-170px)] space-y-5">
        {/* Task Instructions */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs space-y-2 text-slate-800">
          <p className="font-bold text-slate-900 text-sm">
            {isEmail
              ? "Your task: Write an Email"
              : "Your professor is teaching a class on economics. Write a post responding to the professor's question."}
          </p>
          <div className="text-slate-600 leading-relaxed whitespace-pre-line text-xs">
            {prompt ||
              "In your response, you should do the following.\n• Express and support your opinion.\n• Make a contribution to the discussion in your own words.\nAn effective response will contain at least 100 words."}
          </div>
        </div>

        {/* Professor Card */}
        {!isEmail && professorData && (
          <div className="flex items-start gap-3.5 rounded-xl border border-blue-200/80 bg-blue-50/40 p-4 shadow-sm">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0f3b82] text-xs font-bold text-white shadow-sm">
              {professorData.avatar || "PT"}
            </div>
            <div className="space-y-1 text-xs">
              <span className="font-bold text-[#0f3b82] text-sm">
                {professorData.name || "Professor Takata"}
              </span>
              <p className="text-slate-800 leading-relaxed text-xs pt-0.5">
                {professorData.text}
              </p>
            </div>
          </div>
        )}

        {/* Discussion Student Posts */}
        {!isEmail && discussionPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {discussionPosts.map((post, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/90 p-4 space-y-2 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-700">
                    {post.avatar || post.author[0]}
                  </div>
                  <span className="font-bold text-slate-900 text-xs">{post.author}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed line-clamp-12">
                  {post.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Email Context (if email task) */}
        {isEmail && (
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-1.5">
              <span className="text-[#0f3b82] font-bold">Recipient:</span> {recipient}
            </div>
            <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line px-1">
              {(payload.context as string) || ""}
            </div>
          </div>
        )}
      </section>

      {/* Right Column: Writing Editor & TestGlider Toolbar */}
      <section className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex-1 flex flex-col">
          {/* TestGlider Toolbar: [Cut] [Paste] [Undo] [Redo] | Hide Word Count : X */}
          <div className="mb-3 flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCut}
                disabled={disabled}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs active:bg-slate-100"
              >
                <Scissors className="size-3" /> Cut
              </button>
              <button
                type="button"
                onClick={handlePaste}
                disabled={disabled}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs active:bg-slate-100"
              >
                <Clipboard className="size-3" /> Paste
              </button>
              <button
                type="button"
                onClick={handleUndo}
                disabled={disabled}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs active:bg-slate-100"
              >
                <Undo className="size-3" /> Undo
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={disabled}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs active:bg-slate-100"
              >
                <Redo className="size-3" /> Redo
              </button>
            </div>

            {/* Word Count / Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => setShowWordCount((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                {showWordCount ? (
                  <>
                    <EyeOff className="size-3.5 text-slate-400" />
                    <span>Hide Word Count : <strong>{wordCount}</strong></span>
                  </>
                ) : (
                  <>
                    <Eye className="size-3.5 text-slate-400" />
                    <span>Show Word Count</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={currentAnswer || ""}
            disabled={disabled}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={
              isEmail
                ? "Dear Professor...\n\nI am writing to..."
                : "In my opinion, I definitely support..."
            }
            rows={14}
            className="w-full flex-1 rounded-xl border border-slate-200 bg-slate-50/40 p-4 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-[#0f3b82] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0f3b82] resize-none shadow-inner"
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Target length: {isEmail ? "80–120 words" : "100+ words"}</span>
          <span className="font-medium text-emerald-600">Continuous Autosave Active ✓</span>
        </div>
      </section>
    </div>
  );
}
