import {
  CalendarDays,
  Clock3,
  Dumbbell,
  Gauge,
  MapPin,
  Pencil,
  Plus,
  Send,
  Users,
} from "lucide-react";

import type {
  CoachTrainingSession,
} from "@/lib/coach-training.functions";

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
  publishing: boolean;
  publishError: string | null;
  publishedAthleteCount: number | null;
  onEdit: () => void;
  onPublish: () => void;
};

export function TrainingOverview({
  session,
  loading,
  publishing,
  publishError,
  publishedAthleteCount,
  onEdit,
  onPublish,
}: TrainingOverviewProps) {
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
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>

                <div>
                  <p className="text-[9px] font-semibold text-muted-foreground">
                    {label}
                  </p>

                  <p className="mt-0.5 text-xl font-bold">
                    {value}
                  </p>

                  <p className={`text-[9px] font-medium ${detailColor}`}>
                    {detail}
                  </p>
                </div>
              </div>
            </section>
          ),
        )}
      </div>

      <section className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
        {loading ? (
          <div className="flex min-h-[180px] items-center justify-center">
            <p className="text-xs font-semibold text-muted-foreground">
              Loading today's training...
            </p>
          </div>
        ) : !session ? (
          <div className="flex min-h-[180px] items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-orange-50 text-orange-500">
                <Gauge className="h-6 w-6" />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-orange-500">
                  Today's Training
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  No training created for today
                </h2>

                <p className="mt-1 max-w-md text-[10px] text-muted-foreground">
                  Create today's session or use the planning tools for a future date.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-600"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Training
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-orange-500 text-white">
                  <Gauge className="h-6 w-6" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-orange-500">
                      Today's Training
                    </p>

                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-[8px] font-bold uppercase",
                        session.status === "published"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600",
                      ].join(" ")}
                    >
                      {session.status === "published"
                        ? "Published"
                        : "Draft"}
                    </span>
                  </div>

                  <h2 className="mt-0.5 text-xl font-bold">
                    {session.title}
                  </h2>

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                    <span>
                      {session.group_name || "No group"}
                    </span>

                    {(session.start_time || session.end_time) && (
                      <span className="flex items-center gap-1">
                        <Clock3 className="h-3 w-3" />
                        {session.start_time?.slice(0, 5) || "—"}
                        {" – "}
                        {session.end_time?.slice(0, 5) || "—"}
                      </span>
                    )}

                    {session.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.location}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {session.duration_minutes !== null && (
                      <span className="rounded-lg border border-border px-2 py-1 text-[9px] font-medium">
                        {session.duration_minutes} min
                      </span>
                    )}

                    {session.intensity && (
                      <span className="rounded-lg border border-border px-2 py-1 text-[9px] font-medium text-orange-600">
                        {session.intensity} Intensity
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onEdit}
                    className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold transition hover:bg-muted/20"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Training
                  </button>

                  <button
                    type="button"
                    onClick={onPublish}
                    disabled={publishing}
                    className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />

                    {publishing
                      ? "Publishing..."
                      : session.status === "published"
                        ? "Update Athletes"
                        : "Publish to Athletes"}
                  </button>
                </div>

                {publishedAthleteCount !== null && (
                  <p className="text-[9px] font-semibold text-emerald-700">
                    Published to {publishedAthleteCount} athlete
                    {publishedAthleteCount === 1 ? "" : "s"}.
                  </p>
                )}

                {publishError && (
                  <p className="max-w-[320px] text-right text-[9px] font-semibold text-red-600">
                    {publishError}
                  </p>
                )}
              </div>
            </div>

            {session.exercises.length > 0 ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-border">
                {session.exercises.map(
                  (exercise, index) => (
                    <div
                      key={`${exercise.name}-${index}`}
                      className={[
                        "grid grid-cols-[32px_1fr_1fr_auto] items-center gap-3 px-3 py-2",
                        index !== session.exercises.length - 1
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
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-border p-4 text-center">
                <p className="text-[9px] text-muted-foreground">
                  No exercises have been added yet.
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
