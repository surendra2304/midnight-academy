import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Sparkles, Target, ArrowRight } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { PageShell } from "@/components/kit";
import { getStudentPracticeQueue } from "@/lib/recommendations/recommendations.functions";
import { PracticeQueueView } from "@/components/test-runner/PracticeQueueView";
import type { RecommendationItem } from "@/lib/recommendations/recommendation-engine";

export const Route = createFileRoute("/practice")({
  beforeLoad: ({ location }) => requireAuth({ role: "STUDENT", location }),
  head: () => ({
    meta: [
      { title: "Targeted Practice Queue — Midnight Academy" },
      {
        name: "description",
        content:
          "Personalized practice queue generated from your diagnosed English skill weakness profile.",
      },
    ],
  }),
  component: PracticePage,
});

const TASK_CARDS = [
  {
    type: "complete_words",
    name: "Complete the Words",
    sec: "reading",
    count: 20,
    diff: "8L / 8M / 4U",
    skill: "Morphology & Syntax",
  },
  {
    type: "read_daily_life",
    name: "Read in Daily Life",
    sec: "reading",
    count: 18,
    diff: "8L / 7M / 3U",
    skill: "Notices & Pragmatics",
  },
  {
    type: "read_academic",
    name: "Read an Academic Passage",
    sec: "reading",
    count: 22,
    diff: "8L / 10M / 4U",
    skill: "Inference & Mapping",
  },
  {
    type: "listen_choose_response",
    name: "Listen & Choose Response",
    sec: "listening",
    count: 25,
    diff: "10L / 10M / 5U",
    skill: "Pragmatics & Intent",
  },
  {
    type: "listen_conversation",
    name: "Campus Conversation",
    sec: "listening",
    count: 18,
    diff: "7L / 8M / 3U",
    skill: "Problem-Solution",
  },
  {
    type: "listen_announcement",
    name: "Campus Announcement",
    sec: "listening",
    count: 16,
    diff: "7L / 6M / 3U",
    skill: "Public Broadcast",
  },
  {
    type: "listen_academic_talk",
    name: "Academic Lecture Talk",
    sec: "listening",
    count: 20,
    diff: "8L / 8M / 4U",
    skill: "Lecture Hierarchy",
  },
  {
    type: "build_sentence",
    name: "Build a Sentence",
    sec: "writing",
    count: 24,
    diff: "10L / 10M / 4U",
    skill: "Clause Syntax",
  },
  {
    type: "write_email",
    name: "Write an Email",
    sec: "writing",
    count: 16,
    diff: "6L / 7M / 3U",
    skill: "Academic Etiquette",
  },
  {
    type: "academic_discussion",
    name: "Academic Discussion",
    sec: "writing",
    count: 18,
    diff: "7L / 7M / 4U",
    skill: "Peer Argumentation",
  },
  {
    type: "listen_repeat",
    name: "Listen and Repeat",
    sec: "speaking",
    count: 30,
    diff: "12L / 12M / 6U",
    skill: "Acoustic Memory",
  },
  {
    type: "take_interview",
    name: "Take an Interview",
    sec: "speaking",
    count: 18,
    diff: "7L / 8M / 3U",
    skill: "PEEL Spontaneity",
  },
];

function PracticePage() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQueue() {
      try {
        const res = await getStudentPracticeQueue();
        if (res?.queue) {
          setQueue(res.queue);
        }
      } catch (err) {
        console.error("Failed to load practice queue:", err);
      } finally {
        setLoading(false);
      }
    }
    loadQueue();
  }, []);

  const handleLaunchTask = (taskType: string) => {
    navigate({
      to: "/practice/$taskType",
      params: { taskType },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppNav />
        <PageShell>
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading personalized practice queue...</p>
          </div>
        </PageShell>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />
      <PageShell>
        <div className="space-y-6 pb-16">
          <div className="border-b border-border pb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Adaptive Diagnostic Practice
            </span>
            <h1 className="text-2xl font-black text-foreground lg:text-3xl mt-1">
              Weakness-Targeted Practice Exercises
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              High-value practice items specifically matched to your lowest-accuracy skills and
              repeated error patterns.
            </p>
          </div>

          {/* Task-Type Practice Bank Grid (All 12 Task Types with Direct Launch) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  Skill-Builder Bank
                </span>
                <h2 className="text-lg font-bold text-foreground">
                  Practice by Specific Task Type
                </h2>
              </div>
              <span className="text-xs text-muted-foreground">15+ Items Available per Task</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TASK_CARDS.map((task) => (
                <div
                  key={task.type}
                  className="rounded-2xl border border-border bg-card/60 p-4 flex flex-col justify-between space-y-3 hover:border-primary/40 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-bold text-primary uppercase">
                        {task.sec}
                      </span>
                      <span className="text-[11px] font-bold text-foreground">
                        {task.count} Items
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground pt-1">{task.name}</h3>
                    <p className="text-[11px] text-muted-foreground">Focus: {task.skill}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[10px] text-muted-foreground font-medium">
                    <span>
                      Spread: <strong>{task.diff}</strong>
                    </span>
                    <button
                      onClick={() => handleLaunchTask(task.type)}
                      className="font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Practice <ArrowRight className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <PracticeQueueView
            queue={queue}
            onLaunchPractice={() => handleLaunchTask("read_academic")}
          />
        </div>
      </PageShell>
    </div>
  );
}
