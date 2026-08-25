import {
  BatteryCharging,
  CircleCheck,
  HeartPulse,
  MoonStar,
  Target,
  Zap,
} from "lucide-react";

const metrics = [
  {
    label: "Check-in Completion",
    value: "92%",
    detail: "92 of 100 today",
    icon: CircleCheck,
    iconBox: "bg-violet-50",
    iconColor: "text-violet-600",
    line: "bg-violet-500",
  },
  {
    label: "Avg RPE",
    value: "6.4 /10",
    detail: "↓ 0.6 vs last 7 days",
    icon: Zap,
    iconBox: "bg-orange-50",
    iconColor: "text-orange-500",
    line: "bg-orange-500",
  },
  {
    label: "Session Goal Achieved",
    value: "78%",
    detail: "↑ 4% vs last 4 weeks",
    icon: Target,
    iconBox: "bg-green-50",
    iconColor: "text-green-600",
    line: "bg-green-500",
  },
  {
    label: "Sleep Quality",
    value: "3.6 /5",
    detail: "↑ 0.3 vs last 4 weeks",
    icon: MoonStar,
    iconBox: "bg-blue-50",
    iconColor: "text-blue-600",
    line: "bg-blue-500",
  },
  {
    label: "Pain Reports",
    value: "4",
    detail: "↓ 1 vs last 7 days",
    icon: HeartPulse,
    iconBox: "bg-red-50",
    iconColor: "text-red-500",
    line: "bg-red-500",
  },
  {
    label: "Energy Level",
    value: "3.8 /5",
    detail: "↑ 0.2 vs last 4 weeks",
    icon: BatteryCharging,
    iconBox: "bg-green-50",
    iconColor: "text-green-600",
    line: "bg-green-500",
  },
];

export function AnalysisSummaryCards() {
  return (
    <div className="grid grid-cols-6 gap-2.5">
      {metrics.map(
        ({
          label,
          value,
          detail,
          icon: Icon,
          iconBox,
          iconColor,
          line,
        }) => (
          <section
            key={label}
            className="min-w-0 rounded-2xl border border-border bg-white p-3 shadow-sm"
          >
            <div className="flex items-start gap-2.5">
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${iconBox}`}
              >
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>

              <div className="min-w-0">
                <p className="text-[8px] font-semibold leading-tight text-muted-foreground">
                  {label}
                </p>

                <p className="mt-1 text-lg font-bold tracking-tight">
                  {value}
                </p>

                <p className={`mt-1 text-[8px] font-medium ${iconColor}`}>
                  {detail}
                </p>
              </div>
            </div>

            <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
              <div className={`h-full w-[72%] rounded-full ${line}`} />
            </div>
          </section>
        ),
      )}
    </div>
  );
}
