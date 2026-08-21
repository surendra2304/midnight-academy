import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/lib/mock-data";

export function PageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1400px] px-5 py-10 lg:px-8 lg:py-14", className)}>
      {children}
    </div>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string | undefined;
  action?: ReactNode | undefined;
  className?: string | undefined;
}) {
  return (
    <div className={cn("mb-5 flex flex-wrap items-end justify-between gap-3", className)}>
      <div>
        <h2 className="text-lg font-bold text-foreground lg:text-xl">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  children,
  className,
  quiet,
}: {
  children: ReactNode;
  className?: string | undefined;
  quiet?: boolean | undefined;
}) {
  return (
    <section className={cn(quiet ? "panel-quiet" : "panel", "p-5 lg:p-6", className)}>
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string | undefined;
}) {
  return (
    <div className="panel p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-3xl font-extrabold tabular-nums text-foreground">{value}</p>
      {hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function Tag({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "primary" | "violet" | "success" | "warning" | "danger";
  className?: string | undefined;
}) {
  const tones: Record<string, string> = {
    neutral: "border-border text-muted-foreground",
    primary: "border-primary/35 text-primary",
    violet: "border-violet/35 text-violet",
    success: "border-success/35 text-success",
    warning: "border-warning/35 text-warning",
    danger: "border-destructive/35 text-destructive",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DifficultyTag({ difficulty }: { difficulty: Difficulty }) {
  return (
    <Tag tone={difficulty === "Easy" ? "success" : difficulty === "Medium" ? "warning" : "danger"}>
      {difficulty}
    </Tag>
  );
}

export function StatusTag({ status }: { status: string }) {
  const norm = (status || "").toLowerCase();
  const tone =
    norm === "active"
      ? "success"
      : norm === "draft"
        ? "neutral"
        : norm === "paused"
          ? "warning"
          : norm === "in_progress"
            ? "violet"
            : norm === "completed" || norm === "evaluated"
              ? "primary"
              : "neutral";

  const label =
    norm === "in_progress"
      ? "In Progress"
      : norm === "evaluated"
        ? "Evaluated"
        : status
          ? status.charAt(0).toUpperCase() + status.slice(1)
          : "—";

  return <Tag tone={tone as never}>{label}</Tag>;
}

export function CountUp({
  value,
  suffix = "",
  duration = 1100,
  className,
}: {
  value: number;
  suffix?: string | undefined;
  duration?: number | undefined;
  className?: string | undefined;
}) {
  const [display, setDisplay] = useState(0);
  const frame = useRef<number | null>(null);
  const animated = useRef(false);

  useEffect(() => {
    // Animate from zero exactly once — later value changes (or re-renders) snap.
    if (animated.current) {
      setDisplay(value);
      return;
    }
    animated.current = true;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplay(value);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [value, duration]);

  return (
    <span className={cn("tabular-nums", className)}>
      {display}
      {suffix}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode | undefined;
  icon?: ReactNode | undefined;
}) {
  return (
    <div className="panel-quiet flex flex-col items-center px-6 py-14 text-center">
      {icon ? (
        <span className="mb-4 grid size-11 place-items-center rounded-xl border border-border bg-surface-2 text-primary">
          {icon}
        </span>
      ) : null}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}
