/**
 * Timed Writing Editor for Email & Academic Discussion
 * Shows scenario/discussion board on left and timed response editor on right with live word count.
 */

import React from 'react';
import type { ClientContentItem } from '@/lib/tests/session-state';
import { Mail, MessageSquare, AlertCircle } from 'lucide-react';

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
  const isEmail = item.itemType === 'write_email';
  const title = (item.payload?.title as string) || (isEmail ? 'Write an Email' : 'Academic Discussion');
  const prompt = (item.payload?.prompt as string) || '';
  const context = (item.payload?.context as string) || '';
  const recipient = (item.payload?.recipient as string) || (isEmail ? 'Professor / Campus Office' : '');

  // Discussion posts (if Academic Discussion)
  const discussionPosts = (item.payload?.discussionPosts as Array<{ author: string; avatar?: string; text: string }>) || [];

  const wordCount = (currentAnswer || '').trim().split(/\s+/).filter(Boolean).length;

  const handleChange = (text: string) => {
    onAnswerChange(text, {
      text,
      wordCount: text.trim().split(/\s+/).filter(Boolean).length,
    });
  };

  return (
    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left Column: Context / Discussion Board */}
      <section className="flex flex-col rounded-xl border border-border bg-card/40 p-6 overflow-y-auto max-h-[calc(100vh-170px)] space-y-4">
        <div className="border-b border-border pb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            {isEmail ? <Mail className="size-4" /> : <MessageSquare className="size-4" />}
            {item.itemType.replace(/_/g, ' ')}
          </span>
          {recipient ? <span className="text-xs text-muted-foreground">To: <strong>{recipient}</strong></span> : null}
        </div>

        <h3 className="text-base font-bold text-foreground">{title}</h3>

        {context ? (
          <div className="rounded-lg bg-surface-2/40 border border-border/60 p-4 text-xs text-foreground/85 leading-relaxed whitespace-pre-line">
            {context}
          </div>
        ) : null}

        {/* Academic Discussion Classmate Posts */}
        {discussionPosts.length > 0 ? (
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Class Discussion:</span>
            {discussionPosts.map((post, idx) => (
              <div key={idx} className="rounded-lg border border-border/80 bg-background/50 p-4 space-y-1">
                <p className="text-xs font-bold text-primary">{post.author}</p>
                <p className="text-xs text-foreground/90 leading-relaxed">{post.text}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs space-y-1">
          <p className="font-bold text-primary uppercase text-[10px]">Task Instructions:</p>
          <p className="text-foreground/90 leading-relaxed">{prompt}</p>
        </div>
      </section>

      {/* Right Column: Writing Editor & Word Counter */}
      <section className="flex flex-col justify-between rounded-xl border border-border bg-card/40 p-6">
        <div className="flex-1 flex flex-col">
          <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your Response
            </span>
            <span className={`text-xs font-semibold ${wordCount < 50 ? 'text-muted-foreground' : 'text-primary'}`}>
              Word Count: <strong>{wordCount}</strong>
            </span>
          </div>

          <textarea
            value={currentAnswer || ''}
            disabled={disabled}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={isEmail ? 'Dear Professor...\n\nI am writing to...' : 'In my opinion, ...'}
            rows={14}
            className="w-full flex-1 rounded-lg border border-border bg-background p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Target length: {isEmail ? '80–120 words' : '100+ words'}</span>
          <span>Autosaves continuously</span>
        </div>
      </section>
    </div>
  );
}
