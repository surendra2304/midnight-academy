import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Clock, Loader2, Play, Sparkles, Target, Trophy } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { PageShell } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { getStudentAnalyticsDashboard } from "@/lib/analytics/analytics.functions";
import { getStudentPracticeQueue } from "@/lib/recommendations/recommendations.functions";
import { AnalyticsDashboardView } from "@/components/test-runner/AnalyticsDashboardView";
import { PracticeQueueView } from "@/components/test-runner/PracticeQueueView";
import type { StudentWeaknessProfile } from "@/lib/analytics/analytics-engine";
import type { RecommendationItem } from "@/lib/recommendations/recommendation-engine";

import { getUserMembership } from "@/lib/membership/membership.functions";
import { MembershipCard } from "@/components/membership/MembershipUpgradeModal";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  head: () => ({
    meta: [
      { title: "English Proficiency Dashboard — Midnight Academy" },
      {
        name: "description",
        content: "Track your standardized band score, 4-section performance, diagnostic weakness areas, and personalized practice queue.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentWeaknessProfile | null>(null);
  const [targetBand, setTargetBand] = useState<number>(5.0);
  const [queue, setQueue] = useState<RecommendationItem[]>([]);
  const [membership, setMembership] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [analyticsRes, queueRes, memRes] = await Promise.all([
          getStudentAnalyticsDashboard(),
          getStudentPracticeQueue(),
          getUserMembership(),
        ]);
        if (analyticsRes?.profile) {
          setProfile(analyticsRes.profile);
          setTargetBand(analyticsRes.targetBand || 5.0);
        }
        if (queueRes?.queue) {
          setQueue(queueRes.queue);
        }
        if (memRes) {
          setMembership(memRes);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppNav />
        <PageShell>
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your examination dashboard & analytics...</p>
          </div>
        </PageShell>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />
      <PageShell>
        <div className="space-y-10 pb-16">
          {/* Membership & Usage Quotas */}
          {membership ? (
            <MembershipCard
              currentTier={membership.tier}
              quotas={membership.quotas}
              onUpgradeSuccess={() => {
                setMembership((prev: any) => ({ ...prev, tier: "member", isUnlimited: true }));
              }}
            />
          ) : null}

          {/* Quick Start Card Banner */}
          <section className="rounded-2xl border border-border bg-gradient-to-r from-card/80 via-card/50 to-card/80 p-8 shadow-lg flex flex-wrap items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Standardized Examination Hub</span>
              <h1 className="text-2xl font-black text-foreground lg:text-3xl mt-1">
                Student Learning Center
              </h1>
              <p className="mt-1 text-xs text-muted-foreground max-w-xl leading-relaxed">
                Take full-length adaptive mocks, target section exams, or strengthen specific weak skills with diagnostic instant feedback.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="font-bold shadow-lg shadow-primary/20">
                <Link to="/test">
                  <Play className="size-4 mr-1.5 fill-current" /> Browse Test Catalog
                </Link>
              </Button>
            </div>
          </section>

          {/* 1. Personalized Weakness-Driven Practice Queue */}
          {queue.length > 0 ? (
            <PracticeQueueView
              queue={queue}
              onLaunchPractice={() => navigate({ to: "/test" })}
            />
          ) : null}

          {/* 2. Deterministic Analytics & Weakness Diagnostics */}
          {profile ? (
            <AnalyticsDashboardView profile={profile} targetBand={targetBand} />
          ) : null}
        </div>
      </PageShell>
    </div>
  );
}
