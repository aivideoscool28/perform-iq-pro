import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { day: "Mo", form: 72, load: 55, hrv: 68 },
  { day: "Di", form: 78, load: 70, hrv: 72 },
  { day: "Mi", form: 65, load: 85, hrv: 62 },
  { day: "Do", form: 82, load: 60, hrv: 75 },
  { day: "Fr", form: 88, load: 75, hrv: 80 },
  { day: "Sa", form: 84, load: 90, hrv: 78 },
  { day: "So", form: 90, load: 40, hrv: 86 },
];

const INK = "var(--foreground)";
const ACCENT = "var(--accent)";
const MUTED = "var(--muted-foreground)";

export function PerformanceChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="gForm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity={0.32} />
              <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gLoad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={INK} stopOpacity={0.18} />
              <stop offset="100%" stopColor={INK} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gHrv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={MUTED} stopOpacity={0.18} />
              <stop offset="100%" stopColor={MUTED} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="day" stroke={MUTED} fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke={MUTED} fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ stroke: "var(--border)" }}
            contentStyle={{
              background: "var(--popover)",
              color: "var(--popover-foreground)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              fontSize: 12,
              boxShadow: "0 4px 14px -4px rgb(0 0 0 / 0.08)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8, color: "var(--muted-foreground)" }} iconType="circle" />
          <Area type="monotone" dataKey="form" name="Tagesform" stroke={ACCENT} strokeWidth={2.25} fill="url(#gForm)" />
          <Area type="monotone" dataKey="load" name="Belastung" stroke={INK} strokeWidth={2} fill="url(#gLoad)" />
          <Area type="monotone" dataKey="hrv" name="HRV" stroke={MUTED} strokeWidth={1.75} strokeDasharray="4 3" fill="url(#gHrv)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
