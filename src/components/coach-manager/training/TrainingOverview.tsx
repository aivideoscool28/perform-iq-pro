import {
  CalendarDays,
  Clock3,
  Dumbbell,
  Gauge,
  MapPin,
  Pencil,
  Users,
} from "lucide-react";

import type { CoachTrainingSession } from "@/lib/coach-training.functions";

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
];

type TrainingOverviewProps = {
  session: CoachTrainingSession | null;
  loading: boolean;
  onEdit: () => void;
};

const fallbackExercises = [
  {
    name: "Dynamic Warm-up",
    details: "12 min",
    rest: "",
  },
  {
    name: "Block Starts",
    details: "4 × 20 m",
    rest: "3 min recovery",
  },
  {
    name: "Acceleration",
    details: "4 × 30 m",
    rest: "4 min recovery",
  },
  {
    name: "Flying Sprint",
    details: "3 × Flying 30 m",
    rest: "5 min recovery",
  },
  {
    name: "Mobility + Stretch",
    details: "10 min",
    rest: "",
  },
];

export function TrainingOverview({
  session,
  loading,
  onEdit,
}: TrainingOverviewProps) {
  const exercises =
    session?.exercises.length
      ? session.exercises
      : fallbackExercises;

  const title =
    session?.title ?? "Acceleration";

  const group =
    session?.group_name ??
    "Sprint / Hurdles U20";

  const start =
    session?.start_time?.slice(0, 5) ??
    "18:00";

  const end =
    session?.end_time?.slice(0, 5) ??
    "19:30";

  const location =
    session?.location ?? "Track";

  const duration =
    session?.duration_minutes ?? 90;

  const intensity =
    session?.intensity ?? "High";

  return (
    <div className="space-y-3">
      <div className="grid max-w-[520px] grid-cols-2 gap-2.5">
        {metrics.map(
          ({
            label,
            value,
            detail,
            icon: Icon,
            iconBox,
            iconColor,
            detailColor,
          }) => (
            <section
              key={label}
              className="rounded-2xl border border-border bg-white px-3 py-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${iconBox}`}
                >
                  <Icon
                    className={`h-5 w-5 ${iconColor}`}
                  />
                </div>

                <div>
                  <p className="text-[9px] font-semibold text-muted-foreground">
                    {label}
                  </p>

                  <p className="mt-0.5 text-xl font-bold">
                    {value}
                  </p>

                  <p
                    className={`text-[9px] font-medium ${detailColor}`}
                  >
                    {detail}
                  </p>
                </div>
              </div>
            </section>
          ),
        )}
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
                {loading
                  ? "Loading..."
                  : title}
              </h2>

              <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                <span>{group}</span>

                <span className="flex items-center gap-1">
                  <Clock3 className="h-3 w-3" />
                  {start} – {end}
                </span>

                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {location}
                </span>
              </div>

              <div className="mt-2 flex gap-2">
                <span className="rounded-lg border border-border px-2 py-1 text-[9px] font-medium">
                  {duration} min
                </span>

                <span className="rounded-lg border border-border px-2 py-1 text-[9px] font-medium text-orange-600">
                  {intensity} Intensity
                </span>

                {!session && (
                  <span className="rounded-lg border border-dashed border-border px-2 py-1 text-[9px] text-muted-foreground">
                    Demo until first save
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-600"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Training
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          {exercises.map(
            (exercise, index) => (
              <div
                key={`${exercise.name}-${index}`}
                className={[
                  "grid grid-cols-[32px_1fr_1fr_auto] items-center gap-3 px-3 py-2",
                  index !==
                  exercises.length - 1
                    ? "border-b border-border/70"
                    : "",
                ].join(" ")}
              >
                <div className="grid h-6 w-6 place-items-center rounded-full bg-orange-50 text-orange-500">
                  <Dumbbell className="h-3 w-3" />
                </div>

                <p className="text-[10px] font-semibold">
                  {exercise.name}
                </p>

                <p className="text-[10px] text-muted-foreground">
                  {exercise.details || "—"}
                </p>

                <p className="text-[9px] text-muted-foreground">
                  {exercise.rest || ""}
                </p>
              </div>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
