import {
  Activity,
  CircleCheck,
  Dumbbell,
  HeartPulse,
  TrendingUp,
  Users,
} from "lucide-react";

const metrics = [
  {
    label: "Total Athletes",
    value: "100",
    detail: "100 active",
    icon: Users,
    box: "border-slate-200 bg-white",
    iconBox: "bg-slate-900",
    iconColor: "text-white",
    detailColor: "text-green-600",
  },
  {
    label: "Check-in Completion",
    value: "92%",
    detail: "92 of 100 today",
    icon: CircleCheck,
    box: "border-blue-100 bg-white",
    iconBox: "bg-blue-50",
    iconColor: "text-blue-600",
    detailColor: "text-blue-600",
  },
  {
    label: "Team Readiness",
    value: "Good",
    detail: "Stable today",
    icon: Activity,
    box: "border-violet-100 bg-white",
    iconBox: "bg-violet-50",
    iconColor: "text-violet-600",
    detailColor: "text-violet-600",
  },
  {
    label: "Team Trend",
    value: "Improving",
    detail: "Last 7 days",
    icon: TrendingUp,
    box: "border-green-100 bg-white",
    iconBox: "bg-green-50",
    iconColor: "text-green-600",
    detailColor: "text-green-600",
  },
  {
    label: "Training Load",
    value: "6,420",
    detail: "Last 7 days",
    icon: Dumbbell,
    box: "border-orange-100 bg-white",
    iconBox: "bg-orange-50",
    iconColor: "text-orange-500",
    detailColor: "text-orange-600",
  },
  {
    label: "Pain Reports",
    value: "4",
    detail: "Last 7 days",
    icon: HeartPulse,
    box: "border-red-100 bg-white",
    iconBox: "bg-red-50",
    iconColor: "text-red-500",
    detailColor: "text-red-600",
  },
];

export function AthletesSummaryCards() {
  return (
    <div className="grid grid-cols-6 gap-2.5">
      {metrics.map(
        ({
          label,
          value,
          detail,
          icon: Icon,
          box,
          iconBox,
          iconColor,
          detailColor,
        }) => (
          <section
            key={label}
            className={`min-w-0 rounded-2xl border px-3 py-3 shadow-sm ${box}`}
          >
            <div className="flex items-start gap-2.5">
              <div
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${iconBox}`}
              >
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-semibold leading-tight text-muted-foreground">
                  {label}
                </p>

                <p
                  className={[
                    "mt-1 font-bold tracking-tight",
                    value.length > 7 ? "text-lg" : "text-xl",
                  ].join(" ")}
                >
                  {value}
                </p>

                <p
                  className={`mt-0.5 text-[9px] font-medium leading-tight ${detailColor}`}
                >
                  {detail}
                </p>
              </div>
            </div>
          </section>
        ),
      )}
    </div>
  );
}
