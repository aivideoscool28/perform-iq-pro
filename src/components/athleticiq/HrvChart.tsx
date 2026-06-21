import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

const data = Array.from({ length: 14 }).map((_, i) => ({
  d: `${i + 1}`,
  v: 55 + Math.round(Math.sin(i / 1.7) * 14 + Math.random() * 8),
}));

export function HrvChart() {
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: -28 }}>
          <XAxis dataKey="d" stroke="oklch(0.55 0.03 250)" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="oklch(0.55 0.03 250)" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: "oklch(0.85 0.18 200 / 8%)" }}
            contentStyle={{
              background: "oklch(0.18 0.03 265 / 95%)",
              border: "1px solid oklch(0.32 0.03 265)",
              borderRadius: 10,
              fontSize: 12,
            }}
          />
          <Bar dataKey="v" radius={[6, 6, 2, 2]}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={d.v > 70 ? "oklch(0.88 0.22 145)" : d.v > 55 ? "oklch(0.85 0.18 200)" : "oklch(0.7 0.27 340)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
