import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-border-strong bg-surface-2",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" className="size-5">
        <defs>
          <linearGradient id="ma-logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.82 0.13 226)" />
            <stop offset="100%" stopColor="oklch(0.7 0.13 295)" />
          </linearGradient>
        </defs>
        <path
          d="M4 25V8.5c0-.8 1-1.2 1.5-.5L12 17l6.5-9c.5-.7 1.5-.3 1.5.5V25"
          fill="none"
          stroke="url(#ma-logo-grad)"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M27.4 12.6a5.6 5.6 0 1 1-6.2-6.4 4.4 4.4 0 0 0 6.2 6.4Z"
          fill="url(#ma-logo-grad)"
          opacity="0.85"
        />
      </svg>
    </span>
  );
}

export function Wordmark({
  className,
  suffix,
}: {
  className?: string | undefined;
  suffix?: string | undefined;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Logo />
      <span className="flex items-baseline gap-1.5">
        <span className="text-[15px] font-extrabold tracking-tight text-foreground">
          Midnight Academy
        </span>
        {suffix ? (
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            {suffix}
          </span>
        ) : null}
      </span>
    </span>
  );
}
