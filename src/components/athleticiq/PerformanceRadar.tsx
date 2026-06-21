import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

const AXES = ["Sprint", "Kraft", "Power", "Ausdauer", "Mobilität", "Reaktivität"];

interface Props {
  /** 0..100 per axis, in the same order as AXES. Defaults to all zero. */
  values?: number[];
}

export function PerformanceRadar({ values }: Props) {
  const data = AXES.map((axis, i) => ({
    axis,
    value: values?.[i] ?? 0,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          />
          <Radar
            dataKey="value"
            stroke="var(--accent)"
            strokeWidth={2}
            fill="var(--accent)"
            fillOpacity={0.18}
            isAnimationActive
            domain={[0, 100]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
