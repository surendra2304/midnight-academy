import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50/70 shadow-xs",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" className="size-5">
        <defs>
          <linearGradient id="ma-logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
        <path
          d="M6 26.5V5.5l10 10.5 10-10.5v21l-10-6.5L6 26.5Z"
          fill="none"
          stroke="url(#ma-logo-grad)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M27.4 12.6a5.6 5.6 0 1 1-6.2-6.4 4.4 4.4 0 0 0 6.2 6.4Z"
          fill="url(#ma-logo-grad)"
          opacity="0.9"
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
