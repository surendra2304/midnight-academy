/**
 * Membership Plan & Quota Card Component
 * Displays remaining monthly/daily quotas, feature comparison, and upgrade CTA.
 */

import React from "react";
import {
  Sparkles,
  ShieldCheck,
  Infinity as InfinityIcon,
} from "lucide-react";

export interface MembershipCardProps {
  currentTier: "free" | "member";
  quotas: {
    fullMocks: { remainingQuota: number; maxQuota: number };
    sectionTests: { remainingQuota: number; maxQuota: number };
    practiceQuestions: { remainingQuota: number; maxQuota: number };
    aiEvaluations: { remainingQuota: number; maxQuota: number };
  };
  onUpgradeSuccess?: () => void;
}

export function MembershipCard({ quotas }: MembershipCardProps) {

  return (
    <div className="rounded-3xl border border-border bg-card/60 p-6 md:p-8 space-y-6 shadow-sm">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
              Academic Access
            </span>
            <Sparkles className="size-4 text-blue-500" />
          </div>
          <h3 className="text-xl font-black text-foreground">
            Standardized TOEFL Examination Portal
          </h3>
          <p className="text-xs text-muted-foreground">
            Complete full-length mock tests, natural voice synthesis, and rubric-calibrated AI evaluations.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-xl shadow-xs">
          <ShieldCheck className="size-4" /> All Features Active
        </span>
      </div>

      {/* Quota Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface-2/40 border border-border/80 text-center space-y-1">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Full Mock Exams</p>
          <p className="text-xl font-black text-primary">
            <InfinityIcon className="size-5 mx-auto text-blue-600 dark:text-blue-400" />
          </p>
          <p className="text-[10px] text-muted-foreground font-semibold">Unlimited</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-2/40 border border-border/80 text-center space-y-1">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Section Tests</p>
          <p className="text-xl font-black text-primary">
            <InfinityIcon className="size-5 mx-auto text-blue-600 dark:text-blue-400" />
          </p>
          <p className="text-[10px] text-muted-foreground font-semibold">Unlimited</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-2/40 border border-border/80 text-center space-y-1">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Practice Drills</p>
          <p className="text-xl font-black text-primary">
            <InfinityIcon className="size-5 mx-auto text-blue-600 dark:text-blue-400" />
          </p>
          <p className="text-[10px] text-muted-foreground font-semibold">Unlimited</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-2/40 border border-border/80 text-center space-y-1">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">AI Evaluations</p>
          <p className="text-xl font-black text-primary">
            <InfinityIcon className="size-5 mx-auto text-blue-600 dark:text-blue-400" />
          </p>
          <p className="text-[10px] text-muted-foreground font-semibold">Unlimited</p>
        </div>
      </div>
    </div>
  );
}
