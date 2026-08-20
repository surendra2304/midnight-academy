import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS_KEYS, AXIS_SHORT } from "@/lib/mock-data";

const axisStyle = {
  tick: { fill: "var(--color-muted-foreground)", fontSize: 11 },
  stroke: "var(--color-border)",
};

const tooltipProps = {
  contentStyle: {
    background: "var(--color-popover)",
    border: "1px solid var(--color-border)",
    borderRadius: "10px",
    fontSize: "12px",
    color: "var(--color-foreground)",
  },
  labelStyle: { color: "var(--color-muted-foreground)" },
} as const;

export function ScoreTrend({
  data,
  height = 260,
}: {
  data: { label: string; score: number }[];
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="ma-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={axisStyle.tick} stroke={axisStyle.stroke} />
          <YAxis domain={[0, 100]} tick={axisStyle.tick} stroke={axisStyle.stroke} />
          <Tooltip {...tooltipProps} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#ma-area)"
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AxisTrend({
  data,
  height = 300,
}: {
  data: Record<string, string | number>[];
  height?: number;
}) {
  const colors = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
  ];
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={axisStyle.tick} stroke={axisStyle.stroke} />
          <YAxis domain={[0, 100]} tick={axisStyle.tick} stroke={axisStyle.stroke} />
          <Tooltip {...tooltipProps} />
          {AXIS_KEYS.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={AXIS_SHORT[key]}
              stroke={colors[i]}
              strokeWidth={2}
              dot={false}
              animationDuration={900}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScoreBars({
  data,
  xKey,
  height = 300,
  layout = "vertical",
}: {
  data: Record<string, string | number>[];
  xKey: string;
  height?: number;
  layout?: "vertical" | "horizontal";
}) {
  const barColor = (score: number) =>
    score >= 80
      ? "var(--color-success)"
      : score >= 65
        ? "var(--color-primary)"
        : "var(--color-warning)";

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={layout === "vertical" ? "vertical" : "horizontal"}
          margin={{ top: 8, right: 16, bottom: 0, left: layout === "vertical" ? 24 : -18 }}
        >
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
          {layout === "vertical" ? (
            <>
              <XAxis type="number" domain={[0, 100]} tick={axisStyle.tick} stroke={axisStyle.stroke} />
              <YAxis
                type="category"
                dataKey={xKey}
                width={140}
                tick={axisStyle.tick}
                stroke={axisStyle.stroke}
              />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={axisStyle.tick} stroke={axisStyle.stroke} />
              <YAxis domain={[0, 100]} tick={axisStyle.tick} stroke={axisStyle.stroke} />
            </>
          )}
          <Tooltip {...tooltipProps} cursor={{ fill: "var(--color-surface-2)", opacity: 0.4 }} />
          <Bar dataKey="score" radius={4} animationDuration={800}>
            {data.map((d, i) => (
              <Cell key={i} fill={barColor(Number(d["score"]))} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
