import { Link } from "@tanstack/react-router";
import {
  Clock,
  Dumbbell,
  MapPin,
  Users,
} from "lucide-react";

import type {
  CoachTrainingSession,
} from "@/lib/coach-training.functions";

type TodaysTrainingCardProps = {
  session: CoachTrainingSession | null;
  loading: boolean;
};

export function TodaysTrainingCard({
  session,
  loading,
}: TodaysTrainingCardProps) {
  if (loading) {
    return (
      <section className="w-full rounded-3xl border border-orange-100 bg-white px-6 py-4 shadow-sm">
        <div className="flex min-h-[110px] items-center justify-center">
          <p className="text-xs font-semibold text-muted-foreground">
            Loading today's training...
          </p>
        </div>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="w-full rounded-3xl border border-orange-100 bg-white px-6 py-4 shadow-sm">
        <div className="flex min-h-[110px] items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-orange-50">
              <Dumbbell className="h-7 w-7 text-orange-500" />
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500">
                Today
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight">
                No training planned today
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Create today's session or plan a future training.
              </p>
            </div>
          </div>

          <Link
            to="/coach-manager/training"
            search={{ view: undefined }}
            className="rounded-xl border border-orange-400 bg-white px-6 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
          >
            Go to Training →
          </Link>
        </div>
      </section>
    );
  }

  const exercises =
    session.exercises
      .filter((exercise) => exercise.name?.trim())
      .slice(0, 3);

  const start =
    session.start_time?.slice(0, 5) ?? null;

  const end =
    session.end_time?.slice(0, 5) ?? null;

  const time =
    start && end
      ? `${start} – ${end}`
      : start ?? null;

  const statusStyle =
    session.status === "published"
      ? "bg-emerald-50 text-emerald-700"
      : session.status === "draft"
        ? "bg-slate-100 text-slate-600"
        : session.status === "completed"
          ? "bg-blue-50 text-blue-700"
          : "bg-red-50 text-red-700";

  return (
    <section className="w-full rounded-3xl border border-orange-100 bg-white px-6 py-4 shadow-sm">
      <div className="grid grid-cols-[1.15fr_1.35fr_0.7fr] items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-orange-50">
            <Dumbbell className="h-7 w-7 text-orange-500" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500">
                Today
                {start ? ` · ${start}` : ""}
              </p>

              <span
                className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${statusStyle}`}
              >
                {session.status}
              </span>
            </div>

            <h2 className="mt-1 truncate text-2xl font-bold tracking-tight">
              {session.title}
            </h2>

            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {session.group_name && (
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {session.group_name}
                </span>
              )}

              {session.duration_minutes !== null && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {session.duration_minutes} min
                </span>
              )}

              {session.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {session.location}
                </span>
              )}
            </div>

            {time && (
              <p className="mt-1 text-[10px] text-muted-foreground">
                {time}
              </p>
            )}
          </div>
        </div>

        <div className="border-l border-orange-100 pl-6">
          {exercises.length > 0 ? (
            <div className="space-y-2 text-sm font-medium">
              {exercises.map((exercise, index) => (
                <div
                  key={`${exercise.name}-${index}`}
                  className="flex items-center gap-3"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-orange-200" />

                  <span className="min-w-0 truncate">
                    {exercise.details
                      ? `${exercise.details} ${exercise.name}`
                      : exercise.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No exercises added yet.
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Link
            to="/coach-manager/training"
            search={{ view: undefined }}
            className="rounded-xl border border-orange-400 bg-white px-6 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
          >
            View Training →
          </Link>
        </div>
      </div>
    </section>
  );
}




