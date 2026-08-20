import { AXIS_KEYS, AXIS_LABELS, AXIS_SHORT, type AxisKey, type AxisScores } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

function toneClass(score: number) {
  if (score >= 80) return "bg-success";
  if (score >= 65) return "bg-primary";
  return "bg-warning";
}

/**
 * THE shared 5-axis comprehension breakdown.
 * Reused identically on the student dashboard, result screen and admin analytics.
 */
export function ComprehensionBreakdown({
  axes,
  variant = "full",
  highlight,
  className,
}: {
  axes: AxisScores;
  variant?: "full" | "bars" | undefined;
  highlight?: AxisKey | undefined;
  className?: string | undefined;
}) {
  const data = AXIS_KEYS.map((key) => ({
    axis: AXIS_SHORT[key],
    value: axes[key],
  }));

  return (
    <div
      className={cn(
        "grid gap-8",
        variant === "full" && "lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-center",
        className,
      )}
    >
      {variant === "full" ? (
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius="72%">
              <PolarGrid stroke="var(--color-border)" />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                dataKey="value"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="var(--color-primary)"
                fillOpacity={0.18}
                animationDuration={900}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      ) : null}

      <ul className="space-y-4">
        {AXIS_KEYS.map((key) => {
          const score = axes[key];
          const isWeak = highlight ? key === highlight : score < 65;
          return (
            <li key={key}>
              <div className="flex items-baseline justify-between gap-4">
                <span
                  className={cn(
                    "text-sm",
                    isWeak ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  {AXIS_LABELS[key]}
                  {isWeak ? (
                    <span className="ml-2 rounded-full border border-warning/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning">
                      focus
                    </span>
                  ) : null}
                </span>
                <span className="text-sm font-semibold tabular-nums text-foreground">{score}</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-700",
                    toneClass(score),
                  )}
                  style={{ width: `${score}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
