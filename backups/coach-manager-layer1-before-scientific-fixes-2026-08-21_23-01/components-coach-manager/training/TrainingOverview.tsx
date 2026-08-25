import {
  Activity,
  CalendarDays,
  Clock3,
  Dumbbell,
  Gauge,
  MapPin,
  Pencil,
  Users,
} from "lucide-react";

const metrics = [
  {
    label: "Sessions this week",
    value: "12",
    detail: "Across 4 groups",
    icon: CalendarDays,
    iconBox: "bg-orange-50",
    iconColor: "text-orange-500",
    detailColor: "text-orange-600",
  },
  {
    label: "Athletes trained",
    value: "94",
    detail: "Of 100 athletes",
    icon: Users,
    iconBox: "bg-blue-50",
    iconColor: "text-blue-600",
    detailColor: "text-blue-600",
  },
  {
    label: "Training load (7d)",
    value: "6,420",
    detail: "Moderate",
    icon: Dumbbell,
    iconBox: "bg-green-50",
    iconColor: "text-green-600",
    detailColor: "text-green-600",
  },
  {
    label: "High intensity (7d)",
    value: "18%",
    detail: "Optimal range",
    icon: Activity,
    iconBox: "bg-red-50",
    iconColor: "text-red-500",
    detailColor: "text-red-500",
  },
];

const exercises = [
  {
    name: "Warm-up",
    detail: "Dynamic Warm-up",
    amount: "12 min",
    badge: "bg-orange-50 text-orange-500",
  },
  {
    name: "Block Starts",
    detail: "4 × 20 m",
    amount: "3 min recovery",
    badge: "bg-blue-50 text-blue-600",
  },
  {
    name: "Acceleration",
    detail: "4 × 30 m",
    amount: "4 min recovery",
    badge: "bg-green-50 text-green-600",
  },
  {
    name: "Flying Sprint",
    detail: "3 × Flying 30 m",
    amount: "5 min recovery",
    badge: "bg-violet-50 text-violet-600",
  },
  {
    name: "Cool Down",
    detail: "Mobility + Stretch",
    amount: "10 min",
    badge: "bg-cyan-50 text-cyan-600",
  },
];

export function TrainingOverview() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2.5">
        {metrics.map(({ label, value, detail, icon: Icon, iconBox, iconColor, detailColor }) => (
          <section
            key={label}
            className="rounded-2xl border border-border bg-white px-3 py-3 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${iconBox}`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-semibold text-muted-foreground">
                  {label}
                </p>

                <p className="mt-0.5 text-xl font-bold tracking-tight">
                  {value}
                </p>

                <p className={`text-[9px] font-medium ${detailColor}`}>
                  {detail}
                </p>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-orange-500 text-white">
              <Gauge className="h-6 w-6" />
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-orange-500">
                Today's Training
              </p>

              <h2 className="mt-0.5 text-xl font-bold">
                Acceleration
              </h2>

              <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                <span>Sprint / Hurdles U20</span>

                <span className="flex items-center gap-1">
                  <Clock3 className="h-3 w-3" />
                  18:00 – 19:30
                </span>

                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Track
                </span>
              </div>

              <div className="mt-2 flex gap-2">
                <span className="rounded-lg border border-border px-2 py-1 text-[9px] font-medium">
                  24 athletes
                </span>

                <span className="rounded-lg border border-border px-2 py-1 text-[9px] font-medium">
                  90 min
                </span>

                <span className="rounded-lg border border-border px-2 py-1 text-[9px] font-medium text-orange-600">
                  High Intensity
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-600"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Training
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          {exercises.map((exercise, index) => (
            <div
              key={exercise.name}
              className={[
                "grid grid-cols-[32px_1fr_1fr_auto_auto] items-center gap-3 px-3 py-2",
                index !== exercises.length - 1 ? "border-b border-border/70" : "",
              ].join(" ")}
            >
              <div className={`grid h-6 w-6 place-items-center rounded-full ${exercise.badge}`}>
                <Dumbbell className="h-3 w-3" />
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={[
                    "h-1.5 w-1.5 rounded-full",
                    index === 0
                      ? "bg-orange-400"
                      : index === 1
                        ? "bg-blue-500"
                        : index === 2
                          ? "bg-green-500"
                          : index === 3
                            ? "bg-violet-500"
                            : "bg-cyan-500",
                  ].join(" ")}
                />

                <p className="text-[10px] font-semibold">
                  {exercise.name}
                </p>
              </div>

              <p className="text-[10px] text-muted-foreground">
                {exercise.detail}
              </p>

              <p className="text-[9px] text-muted-foreground">
                {exercise.amount}
              </p>

              <button type="button" className="text-muted-foreground">
                •••
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

