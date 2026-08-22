import { useState } from "react";
import { ArrowRight, Brain, EyeOff, Gauge } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Onboarding slides data
const slides = [
  {
    icon: EyeOff,
    title: "The question will disappear. That's the point.",
    body: "You get a limited window to read and understand the problem. When the timer ends, the question is removed — it is not a glitch, and it will not come back.",
  },
  {
    icon: Brain,
    title: "Then you explain it in your own words.",
    body: "No solving. No code. Just describe what the question was asking: the objective, the limits, the expected input and output.",
  },
  {
    icon: Gauge,
    title: "AI scores your understanding, not your English.",
    body: "You receive a score across five reading axes — objective, details, recall and expression — plus the concepts and constraints you missed, and the actual answer, so you learn where your reading went wrong.",
  },
];

function Onboarding({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  const [step, setStep] = useState(0);
  const slide = slides[step]!;
  const last = step === slides.length - 1;

  return (
    <main className="grid-backdrop flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-lg">
        <div className="flex justify-center">
          <Wordmark />
        </div>
        <div className="panel mt-8 p-7 lg:p-9">
          <span className="grid size-10 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
            <slide.icon className="size-5" />
          </span>
          <h1 className="animate-fade-up mt-6 text-2xl font-bold leading-snug text-foreground lg:text-3xl">
            {slide.title}
          </h1>
          <p className="animate-fade-up mt-4 text-sm leading-relaxed text-muted-foreground">
            {slide.body}
          </p>
          <div className="mt-9 flex items-center justify-between fixed-nav">
            <div className="flex gap-1.5">
              {slides.map((s, i) => (
                <span
                  key={s.title}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === step ? "w-7 bg-primary" : "w-1.5 bg-border-strong",
                  )}
                />
              ))}
            </div>
            {last ? (
              <Button onClick={onComplete}>Start Test</Button>
            ) : (
              <Button onClick={() => setStep((s) => s + 1)}>
                Next <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <button
            onClick={(e) => {
              e.preventDefault();
              onSkip();
            }}
            className="hover:text-foreground cursor-pointer"
          >
            Skip for now
          </button>
        </p>
      </div>
    </main>
  );
}

export default Onboarding;
