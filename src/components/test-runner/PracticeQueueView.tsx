/**
 * Personalized Practice Queue UI Component
 * Renders prioritized practice cards explaining WHY each item is recommended with its evidence trail.
 */

import React from 'react';
import type { RecommendationItem } from '@/lib/recommendations/recommendation-engine';
import { Target, Play, Sparkles, AlertCircle, ArrowRight, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';

export interface PracticeQueueViewProps {
  queue: RecommendationItem[];
  onLaunchPractice?: (contentItemId: string) => void;
}

export function PracticeQueueView({ queue, onLaunchPractice }: PracticeQueueViewProps) {
  if (queue.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card/40 p-6 text-center text-xs text-muted-foreground">
        No active practice items queued. Complete a diagnostic test to generate tailored recommendations.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Personalized Practice Queue</h3>
        </div>
        <span className="text-xs text-muted-foreground font-medium">{queue.length} Targeted Exercises</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {queue.map((rec) => (
          <article
            key={rec.id}
            className="flex flex-col justify-between rounded-xl border border-border/80 bg-card/50 p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md space-y-4"
          >
            <div className="space-y-3">
              {/* Card Header & Priority Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                    rec.priority === 1
                      ? 'bg-destructive/15 text-destructive border border-destructive/30'
                      : rec.priority === 2
                      ? 'bg-warning/15 text-warning border border-warning/30'
                      : 'bg-surface-2 text-muted-foreground border border-border'
                  }`}
                >
                  Priority {rec.priority}
                </span>

                <span className="text-[11px] font-semibold uppercase text-primary tracking-wide">
                  {rec.sectionType}
                </span>
              </div>

              {/* Task Type & Target Skill */}
              <div>
                <h4 className="text-sm font-bold text-foreground capitalize">
                  {rec.itemType.replace(/_/g, ' ')}
                </h4>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Tag className="size-3" />
                  <span>Target: <strong>{rec.targetSkill}</strong></span>
                </div>
              </div>

              {/* Explainable Rationale Box */}
              <p className="text-xs leading-relaxed text-foreground/80 bg-background/60 p-3 rounded-lg border border-border/60">
                {rec.reason}
              </p>
            </div>

            {/* Launch Action Button */}
            <div className="pt-2 border-t border-border/50">
              <Button
                size="sm"
                className="w-full text-xs font-semibold"
                onClick={() => onLaunchPractice && onLaunchPractice(rec.contentItemId)}
              >
                <Play className="size-3 mr-1.5 fill-current" /> Practice Item
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
