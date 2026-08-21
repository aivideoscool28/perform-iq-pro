import {
  AlertTriangle,
  CircleCheck,
  HeartPulse,
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
    label: "Check-in Coverage",
    value: "92%",
    detail: "92 of 100 today",
    icon: CircleCheck,
    box: "border-blue-100 bg-white",
    iconBox: "bg-blue-50",
    iconColor: "text-blue-600",
    detailColor: "text-blue-600",
  },
  {
    label: "Review Today",
    value: "3",
    detail: "Meaningful changes to inspect",
    icon: AlertTriangle,
    box: "border-orange-100 bg-white",
    iconBox: "bg-orange-50",
    iconColor: "text-orange-600",
    detailColor: "text-orange-600",
  },
  {
    label: "Pain Reports",
    value: "4",
    detail: "Athlete-reported · last 7 days",
    icon: HeartPulse,
    box: "border-red-100 bg-white",
    iconBox: "bg-red-50",
    iconColor: "text-red-500",
    detailColor: "text-red-600",
  },
];

export function AthletesSummaryCards() {
  return (
    <div className="grid grid-cols-4 gap-2.5">
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
            <div className="flex items-center gap-3">
              <div
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${iconBox}`}
              >
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-semibold leading-tight text-muted-foreground">
                  {label}
                </p>

                <p className="mt-1 text-xl font-bold tracking-tight">
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
