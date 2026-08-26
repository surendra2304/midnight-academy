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
  LabelList,
} from "recharts";
import { AXIS_KEYS, AXIS_SHORT } from "@/lib/mock-data";

const axisStyle = {
  tick: { fill: "#64748b", fontSize: 11 },
  stroke: "#e2e8f0",
};

const tooltipProps = {
  contentStyle: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#0f172a",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    padding: "8px 12px",
  },
  itemStyle: { color: "#2563eb", fontWeight: 600 },
  labelStyle: { color: "#64748b", marginBottom: "4px", fontWeight: 500 },
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
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={axisStyle.tick} stroke={axisStyle.stroke} />
          <YAxis domain={[0, 100]} tick={axisStyle.tick} stroke={axisStyle.stroke} />
          <Tooltip {...tooltipProps} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#2563eb"
            strokeWidth={2.5}
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
    "#2563eb",
    "#6366f1",
    "#16a34a",
    "#d97706",
    "#dc2626",
  ];
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
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
      ? "#16a34a"
      : score >= 65
        ? "#2563eb"
        : "#d97706";

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={layout === "vertical" ? "vertical" : "horizontal"}
          margin={{ top: 20, right: 40, bottom: 4, left: layout === "vertical" ? 8 : 4 }}
        >
          <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
          {layout === "vertical" ? (
            <>
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={axisStyle.tick}
                stroke={axisStyle.stroke}
              />
              <YAxis
                type="category"
                dataKey={xKey}
                width={150}
                tick={{ ...axisStyle.tick, fontSize: 11 }}
                stroke={axisStyle.stroke}
                tickFormatter={(v: string) =>
                  typeof v === "string" && v.length > 24 ? `${v.slice(0, 23)}…` : v
                }
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={xKey}
                tick={{ ...axisStyle.tick, fontSize: 11 }}
                stroke={axisStyle.stroke}
                interval={0}
                angle={-18}
                textAnchor="end"
                height={56}
                tickFormatter={(v: string) =>
                  typeof v === "string" && v.length > 18 ? `${v.slice(0, 17)}…` : v
                }
              />
              <YAxis domain={[0, 100]} tick={axisStyle.tick} stroke={axisStyle.stroke} />
            </>
          )}
          <Tooltip {...tooltipProps} cursor={{ fill: "#f1f5f9", opacity: 0.7 }} />
          <Bar dataKey="score" radius={4} animationDuration={800} maxBarSize={42}>
            <LabelList
              dataKey="score"
              position={layout === "vertical" ? "right" : "top"}
              formatter={(v: number) => (v === 0 || v ? `${v}%` : "")}
              style={{ fill: "#334155", fontSize: 11, fontWeight: 700 }}
            />
            {data.map((d, i) => (
              <Cell key={i} fill={barColor(Number(d["score"]))} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
