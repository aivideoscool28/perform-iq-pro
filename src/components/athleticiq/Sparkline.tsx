import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface Props {
  data: number[];
  /** Accepts any CSS color. Defaults to the foreground ink token. */
  color?: string;
  height?: number;
}

export function Sparkline({ data, color = "var(--foreground)", height = 50 }: Props) {
  const chartData = data.map((v, i) => ({ i, v }));
  const id = `spark-${color.replace(/\W/g, "")}`;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.75}
            fill={`url(#${id})`}
            isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
