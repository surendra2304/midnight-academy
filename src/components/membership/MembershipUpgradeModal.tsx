/**
 * Membership Plan & Quota Card Component
 * Displays remaining monthly/daily quotas, feature comparison, and upgrade CTA.
 */

import React, { useState } from 'react';
import {
  Check,
  Crown,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  Infinity as InfinityIcon,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { requestMembershipUpgrade } from '@/lib/membership/membership.functions';
import { toast } from 'sonner';

export interface MembershipCardProps {
  currentTier: 'free' | 'member';
  quotas: {
    fullMocks: { remainingQuota: number; maxQuota: number };
    sectionTests: { remainingQuota: number; maxQuota: number };
    practiceQuestions: { remainingQuota: number; maxQuota: number };
    aiEvaluations: { remainingQuota: number; maxQuota: number };
  };
  onUpgradeSuccess?: () => void;
}

export function MembershipCard({ currentTier, quotas, onUpgradeSuccess }: MembershipCardProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      await requestMembershipUpgrade();
      toast.success('Successfully upgraded to Midnight Academy Member Tier!');
      if (onUpgradeSuccess) onUpgradeSuccess();
    } catch {
      toast.error('Failed to process upgrade request.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const isMember = currentTier === 'member';

  return (
    <div className="rounded-3xl border border-border bg-card/60 p-6 md:p-8 space-y-6 shadow-sm">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                isMember
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-primary/10 text-primary border-primary/20'
              }`}
            >
              {isMember ? 'Midnight Academy Member' : 'Free Starter Plan'}
            </span>
            {isMember ? <Crown className="size-4 text-amber-400" /> : null}
          </div>
          <h3 className="text-xl font-black text-foreground">
            {isMember ? 'Unlimited Member Access' : 'Monthly Usage & Quotas'}
          </h3>
        </div>

        {!isMember ? (
          <Button
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black shadow-md shadow-amber-500/20"
          >
            {isUpgrading ? (
              <Loader2 className="size-4 animate-spin mr-1.5" />
            ) : (
              <Sparkles className="size-4 mr-1.5" />
            )}
            Upgrade to Member (Unlimited)
          </Button>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
            <ShieldCheck className="size-4" /> All Features Unlocked
          </span>
        )}
      </div>

      {/* Quota Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface-2/40 border border-border/80 text-center space-y-1">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Full Mock Exams</p>
          <p className="text-xl font-black text-primary">
            {isMember ? (
              <InfinityIcon className="size-5 mx-auto" />
            ) : (
              `${quotas.fullMocks.remainingQuota} / ${quotas.fullMocks.maxQuota}`
            )}
          </p>
          <p className="text-[10px] text-muted-foreground">{isMember ? 'Unlimited' : 'per month'}</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-2/40 border border-border/80 text-center space-y-1">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Section Tests</p>
          <p className="text-xl font-black text-primary">
            {isMember ? (
              <InfinityIcon className="size-5 mx-auto" />
            ) : (
              `${quotas.sectionTests.remainingQuota} / ${quotas.sectionTests.maxQuota}`
            )}
          </p>
          <p className="text-[10px] text-muted-foreground">{isMember ? 'Unlimited' : 'per month'}</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-2/40 border border-border/80 text-center space-y-1">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Practice Drills</p>
          <p className="text-xl font-black text-primary">
            {isMember ? (
              <InfinityIcon className="size-5 mx-auto" />
            ) : (
              `${quotas.practiceQuestions.remainingQuota} / ${quotas.practiceQuestions.maxQuota}`
            )}
          </p>
          <p className="text-[10px] text-muted-foreground">{isMember ? 'Unlimited' : 'per day'}</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-2/40 border border-border/80 text-center space-y-1">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">AI Evaluations</p>
          <p className="text-xl font-black text-primary">
            {isMember ? (
              <InfinityIcon className="size-5 mx-auto" />
            ) : (
              `${quotas.aiEvaluations.remainingQuota} / ${quotas.aiEvaluations.maxQuota}`
            )}
          </p>
          <p className="text-[10px] text-muted-foreground">{isMember ? 'Unlimited' : 'per day'}</p>
        </div>
      </div>
    </div>
  );
}
