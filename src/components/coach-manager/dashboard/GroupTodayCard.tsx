import { Activity, CircleAlert, HeartPulse, Users } from "lucide-react";

const stats = [
  {
    label: "Athletes",
    value: "12",
    icon: Users,
    circle: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
  },
  {
    label: "Check-ins",
    value: "9",
    icon: Activity,
    circle: "bg-violet-50 border-violet-200",
    iconColor: "text-violet-500",
  },
  {
    label: "Recovery",
    value: "2",
    icon: HeartPulse,
    circle: "bg-orange-50 border-orange-200",
    iconColor: "text-orange-500",
  },
  {
    label: "Questions",
    value: "1",
    icon: CircleAlert,
    circle: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-500",
  },
];

export function GroupTodayCard() {
  return (
    <section className="rounded-2xl border border-border bg-background p-3 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">
            My Group Today
          </p>
          <h3 className="mt-1 text-base font-bold">
            Sprint / Hurdles
          </h3>
        </div>

        <button
          type="button"
          className="text-xs font-semibold text-orange-600"
        >
          Open Group Overview →
        </button>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {stats.map(({ label, value, icon: Icon, circle, iconColor }) => (
          <div
            key={label}
            className="flex flex-col items-center text-center"
          >
            <div
              className={`grid h-10 w-10 place-items-center rounded-full border ${circle}`}
            >
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>

            <p className="mt-2 text-xl font-bold">
              {value}
            </p>

            <p className="text-[10px] text-muted-foreground">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
