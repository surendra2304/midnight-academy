/**
 * Unified TOEFL Score Report & Review Experience
 * Answers: What did I score? Why did I score it? What should I do next?
 */

import React, { useState } from 'react';
import { Award, Target, TrendingUp, Sparkles, Filter, CheckCircle2, XCircle, ArrowRight, BookOpen, Volume2, Mic, FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioPlayer } from '@/components/test-runner/listening/AudioPlayer';

export interface UnifiedScoreReportProps {
  reportData: {
    attempt: {
      id: string;
      tests?: { name: string; category: string; difficulty: string };
      percentage_score: number | null;
      completed_at: string | null;
    };
    report: {
      overall_band: number;
      reading_band: number;
      listening_band: number;
      writing_band: number;
      speaking_band: number;
      comparable_score: number;
      summary?: string;
    } | null;
    targetScore?: number;
    responses: Array<{
      id: string;
      raw_answer: string | null;
      is_correct: boolean | null;
      score: number | null;
      time_spent_ms: number;
      content_items: {
        id: string;
        section_type: string;
        item_type: string;
        difficulty: string;
        skill_tags: string[];
        payload: Record<string, unknown>;
      };
      options: Array<{
        option_key: string;
        option_text: string;
        is_correct: boolean;
        distractor_rationale?: string | null;
      }>;
      evaluation?: {
        score_band: number;
        traits: Record<string, number>;
        strengths: string[];
        issues: string[];
        corrections: Array<{ original: string; improved: string; explanation: string }>;
        improved_response?: string;
        next_actions: string[];
      } | null;
    }>;
    recommendations?: Array<{
      id: string;
      reason: string;
      priority: number;
    }>;
  };
}

export function UnifiedScoreReportView({ reportData }: UnifiedScoreReportProps) {
  const { attempt, report, targetScore = 5.0, responses, recommendations = [] } = reportData;

  const [activeSectionFilter, setActiveSectionFilter] = useState<string>('all');
  const [showIncorrectOnly, setShowIncorrectOnly] = useState(false);

  const overallBand = report?.overall_band || 1.0;
  const comparable120 = report?.comparable_score || 0;
  const targetGap = (overallBand - targetScore).toFixed(1);

  // Filter responses
  const filteredResponses = responses.filter((r) => {
    if (activeSectionFilter !== 'all' && r.content_items.section_type !== activeSectionFilter) {
      return false;
    }
    if (showIncorrectOnly && r.is_correct !== false && (!r.evaluation || r.evaluation.score_band >= 5.0)) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-10">
      {/* 1. TOP SCORE HERO: What did I score? */}
      <section className="rounded-2xl border border-border bg-gradient-to-b from-card/80 to-card/40 p-8 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-border/60 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Standardized Performance & AI Evaluation Report</span>
            <h1 className="text-2xl font-black text-foreground mt-1">{attempt.tests?.name || 'Standardized Mock Assessment'}</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Evaluated on Official 1.0–6.0 Band Scale & Comparative 0–120 Benchmark Model
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-xl border border-primary/40 bg-primary/10 px-5 py-3 text-center">
              <p className="text-[11px] font-bold text-muted-foreground uppercase">Overall Band</p>
              <p className="text-3xl font-black text-primary">{overallBand.toFixed(1)} <span className="text-sm font-semibold text-muted-foreground">/ 6.0</span></p>
            </div>

            <div className="rounded-xl border border-border bg-surface-2/40 px-5 py-3 text-center">
              <p className="text-[11px] font-bold text-muted-foreground uppercase">Estimated 0–120 Score</p>
              <p className="text-3xl font-black text-foreground">~{comparable120} <span className="text-sm font-semibold text-muted-foreground">/ 120</span></p>
            </div>
          </div>
        </div>

        {/* Target Gap & 4-Section Breakdown Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="rounded-xl border border-border bg-background/50 p-4">
            <span className="text-xs font-bold text-muted-foreground uppercase">Reading</span>
            <p className="text-xl font-extrabold text-foreground mt-1">{report?.reading_band?.toFixed(1) || '—'} / 6.0</p>
            <p className="text-[10px] text-muted-foreground">Passage Comprehension</p>
          </div>

          <div className="rounded-xl border border-border bg-background/50 p-4">
            <span className="text-xs font-bold text-muted-foreground uppercase">Listening</span>
            <p className="text-xl font-extrabold text-foreground mt-1">{report?.listening_band?.toFixed(1) || '—'} / 6.0</p>
            <p className="text-[10px] text-muted-foreground">Audio & Conversations</p>
          </div>

          <div className="rounded-xl border border-border bg-background/50 p-4">
            <span className="text-xs font-bold text-muted-foreground uppercase">Writing</span>
            <p className="text-xl font-extrabold text-foreground mt-1">{report?.writing_band?.toFixed(1) || '—'} / 6.0</p>
            <p className="text-[10px] text-muted-foreground">Email & Discussion</p>
          </div>

          <div className="rounded-xl border border-border bg-background/50 p-4">
            <span className="text-xs font-bold text-muted-foreground uppercase">Speaking</span>
            <p className="text-xl font-extrabold text-foreground mt-1">{report?.speaking_band?.toFixed(1) || '—'} / 6.0</p>
            <p className="text-[10px] text-muted-foreground">Interview & Fluency</p>
          </div>
        </div>

        {/* Target Gap Alert */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-primary" />
            <span>Target Goal: <strong>{targetScore.toFixed(1)} Band</strong></span>
          </div>
          <span className={`font-bold ${Number(targetGap) >= 0 ? 'text-success' : 'text-warning'}`}>
            {Number(targetGap) >= 0 ? `Goal Achieved (+${targetGap} Band)` : `Target Gap: ${targetGap} Band`}
          </span>
        </div>
      </section>

      {/* 2. WHY DID I SCORE IT? - Comprehensive Item Reviews */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Diagnostic Item-by-Item Review</h2>
            <p className="text-xs text-muted-foreground">Revisit every prompt, understand correct solutions, and inspect AI corrections.</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {['all', 'reading', 'listening', 'writing', 'speaking'].map((sec) => (
              <Button
                key={sec}
                size="sm"
                variant={activeSectionFilter === sec ? 'default' : 'outline'}
                onClick={() => setActiveSectionFilter(sec)}
                className="capitalize text-xs"
              >
                {sec}
              </Button>
            ))}

            <Button
              size="sm"
              variant={showIncorrectOnly ? 'destructive' : 'outline'}
              onClick={() => setShowIncorrectOnly(!showIncorrectOnly)}
              className="text-xs ml-2"
            >
              {showIncorrectOnly ? 'Showing Weak Items' : 'Filter Incorrect'}
            </Button>
          </div>
        </div>

        {/* Item Cards List */}
        <div className="space-y-6">
          {filteredResponses.map((r, idx) => {
            const item = r.content_items;
            const evalObj = r.evaluation;
            const isDeterministic = Boolean(r.options && r.options.length > 0) || item.item_type === 'build_sentence';
            const correctOpt = r.options.find((o) => o.is_correct);

            return (
              <article key={r.id} className="rounded-xl border border-border bg-card/40 p-6 space-y-4">
                <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">Item {idx + 1}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs font-semibold text-primary uppercase">{item.item_type.replace(/_/g, ' ')}</span>
                    <span className="rounded bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{item.difficulty}</span>
                  </div>

                  <div>
                    {isDeterministic ? (
                      r.is_correct ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-success"><CheckCircle2 className="size-4" /> Correct</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-destructive"><XCircle className="size-4" /> Incorrect</span>
                      )
                    ) : evalObj ? (
                      <span className="text-xs font-black text-primary">Band {evalObj.score_band.toFixed(1)} / 6.0</span>
                    ) : null}
                  </div>
                </header>

                {/* Stimulus / Prompt */}
                <div className="rounded-lg bg-background/50 border border-border/60 p-4 text-xs text-foreground/90 space-y-1">
                  <p className="font-semibold">{(item.payload?.prompt as string) || (item.payload?.title as string)}</p>
                  {item.payload?.passage ? <p className="text-muted-foreground whitespace-pre-line mt-2">{item.payload.passage as string}</p> : null}
                </div>

                {/* Objective MCQ comparison */}
                {r.options && r.options.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className={`p-3 rounded-lg border ${r.is_correct ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'}`}>
                      <span className="font-bold text-muted-foreground uppercase text-[10px]">Your Selection:</span>
                      <p className="mt-1 font-semibold">{r.raw_answer || '(No selection)'}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-success/30 bg-success/5">
                      <span className="font-bold text-success uppercase text-[10px]">Correct Key:</span>
                      <p className="mt-1 font-semibold text-success">{correctOpt?.option_key}: {correctOpt?.option_text}</p>
                    </div>
                  </div>
                ) : null}

                {/* AI Evaluation Breakdown */}
                {evalObj ? (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="rounded-lg border border-border bg-background/60 p-4 space-y-2">
                        <span className="font-bold text-muted-foreground uppercase text-[10px]">Your Submission:</span>
                        <p className="whitespace-pre-line text-foreground/90">{r.raw_answer || '(No submission)'}</p>
                      </div>
                      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2">
                        <span className="flex items-center gap-1 font-bold text-primary uppercase text-[10px]"><Sparkles className="size-3" /> Polished Response:</span>
                        <p className="whitespace-pre-line text-foreground/90">{evalObj.improved_response || 'Model response available.'}</p>
                      </div>
                    </div>

                    {/* Corrections */}
                    {evalObj.corrections && evalObj.corrections.length > 0 ? (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase">Key Corrections:</span>
                        {evalObj.corrections.map((c, ci) => (
                          <div key={ci} className="rounded-lg border border-border/80 bg-background/60 p-3 text-xs space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="line-through text-destructive">{c.original}</span>
                              <ArrowRight className="size-3 text-muted-foreground" />
                              <span className="font-bold text-success">{c.improved}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">{c.explanation}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      {/* 3. WHAT SHOULD I DO NEXT? - Priority Recommendations */}
      <section className="rounded-2xl border border-border bg-card/50 p-8 shadow-xl space-y-4">
        <div className="border-b border-border/60 pb-3 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Personalized Action Queue</span>
            <h2 className="text-lg font-bold text-foreground mt-1">Recommended Practice for Your Target Gap</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-2">
            <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">Priority 1</span>
            <h4 className="text-sm font-bold text-foreground">Inference & Academic Reading</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Strengthen paragraph synthesis and pronoun reference comprehension.</p>
            <Button size="sm" variant="outline" className="w-full mt-2">Practice 5 Items <ChevronRight className="size-3.5 ml-1" /></Button>
          </div>

          <div className="rounded-xl border border-border bg-surface-2/40 p-5 space-y-2">
            <span className="rounded bg-surface-2 px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">Priority 2</span>
            <h4 className="text-sm font-bold text-foreground">Email Register & Prepositions</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Review formal opening salutations and dependent preposition structures.</p>
            <Button size="sm" variant="outline" className="w-full mt-2">Practice Email <ChevronRight className="size-3.5 ml-1" /></Button>
          </div>

          <div className="rounded-xl border border-border bg-surface-2/40 p-5 space-y-2">
            <span className="rounded bg-surface-2 px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">Priority 3</span>
            <h4 className="text-sm font-bold text-foreground">Speaking Fluency & Pacing</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Practice 45-second interview responses focusing on seamless idea transitions.</p>
            <Button size="sm" variant="outline" className="w-full mt-2">Practice Speaking <ChevronRight className="size-3.5 ml-1" /></Button>
          </div>
        </div>
      </section>
    </div>
  );
}
