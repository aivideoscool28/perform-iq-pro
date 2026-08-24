import type { CoachAthlete } from "@/hooks/useCoachAthletes";

import {
  useCoachUpcomingTraining,
} from "@/hooks/coach-manager/useCoachUpcomingTraining";
import { Link } from "@tanstack/react-router";

import {
  CalendarDays,
  Dumbbell,
  Gauge,
  HeartPulse,
  Trophy,
  Zap,
} from "lucide-react";

const week = [
  {
    day: "Mon 13",
    title: "Acceleration",
    group: "Sprint / Hurdles U20",
    time: "18:00",
    dot: "bg-orange-500",
    text: "text-orange-600",
  },
  {
    day: "Tue 14",
    title: "Speed Endurance",
    group: "Sprints U18",
    time: "17:00",
    dot: "bg-blue-500",
    text: "text-blue-600",
  },
  {
    day: "Wed 15",
    title: "Hurdle Technique",
    group: "Sprint / Hurdles U20",
    time: "18:00",
    dot: "bg-violet-500",
    text: "text-violet-600",
  },
  {
    day: "Thu 16",
    title: "Max Velocity",
    group: "Sprints U18",
    time: "17:00",
    dot: "bg-blue-500",
    text: "text-blue-600",
  },
  {
    day: "Fri 17",
    title: "Speed + Plyometrics",
    group: "Sprint / Hurdles U20",
    time: "18:00",
    dot: "bg-orange-500",
    text: "text-orange-600",
  },
];

const recent = [
  {
    name: "Acceleration",
    group: "Sprint / Hurdles U20",
    date: "Today",
    icon: Gauge,
    badge: "bg-orange-500 text-white",
  },
  {
    name: "Speed Endurance",
    group: "Sprints U18",
    date: "Yesterday",
    icon: Zap,
    badge: "bg-blue-500 text-white",
  },
  {
    name: "Plyometrics + Strength",
    group: "Jumps U18",
    date: "2 days ago",
    icon: Dumbbell,
    badge: "bg-violet-500 text-white",
  },
];

export function TrainingSidebar({
  mode = "today",
  athletes,
  onOpenCalendar,
  onOpenIndividualPlans,
}: {
  mode?: "today" | "history";
  athletes: CoachAthlete[];
  onOpenCalendar?: () => void;
  onOpenIndividualPlans?: (athleteId?: string) => void;
}) {
  const {
    sessions: upcomingSessions,
    loading: upcomingLoading,
    error: upcomingError,
  } = useCoachUpcomingTraining();

  const individualPlans = athletes.map((athlete) => ({
    id: athlete.id,
    initials: athlete.display_name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join(""),
    name: athlete.display_name,
    plan: "Training plan connection pending",
    time: "Linked athlete",
    badge: "bg-slate-50 text-slate-600",
    icon: Gauge,
  }));
  if (mode === "history") {
    return (
      <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold">
              Training History
            </h3>

            <p className="mt-1 text-[10px] text-muted-foreground">
              Review previous sessions and reuse them when useful.
            </p>
          </div>

          <button
            type="button"
            className="text-[9px] font-semibold text-orange-600"
          >
            View all →
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {recent.map((training) => {
            const Icon = training.icon;

            return (
              <button
                key={training.name}
                type="button"
                className="flex w-full items-center gap-3 rounded-xl border border-border/70 px-3 py-3 text-left transition hover:bg-muted/20"
              >
                <div
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${training.badge}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold">
                    {training.name}
                  </p>

                  <p className="mt-0.5 text-[9px] text-muted-foreground">
                    {training.group}
                  </p>
                </div>

                <p className="text-[8px] text-muted-foreground">
                  {training.date}
                </p>

                <span className="text-muted-foreground">→</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="mt-3 rounded-xl border border-border px-3 py-2 text-[9px] font-semibold"
        >
          Browse full training history →
        </button>
      </section>
    );
  }

  return (
    <aside className="space-y-3">
      <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold">Upcoming Training</h3>

          <div className="grid h-7 w-7 place-items-center rounded-lg bg-orange-50">
            <CalendarDays className="h-3.5 w-3.5 text-orange-500" />
          </div>
        </div>

        <div className="mt-2">
          {upcomingLoading &&
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="mb-1 h-11 animate-pulse rounded-lg bg-muted/40"
              />
            ))}

          {!upcomingLoading &&
            upcomingSessions.map((session, index) => {
              const sessionDate = new Date(
                `${session.session_date}T12:00:00`,
              );

              const dayLabel =
                sessionDate.toLocaleDateString(
                  "en-GB",
                  {
                    weekday: "short",
                    day: "2-digit",
                  },
                );

              return (
                <button
                  key={session.id}
                  type="button"
                  className={[
                    "grid w-full grid-cols-[46px_10px_1fr_auto] items-center gap-2 px-1 py-2 text-left transition hover:bg-muted/20",
                    index !== upcomingSessions.length - 1
                      ? "border-b border-border/60"
                      : "",
                  ].join(" ")}
                >
                  <p className="text-[8px] font-semibold text-muted-foreground">
                    {dayLabel}
                  </p>

                  <span className="h-2 w-2 rounded-full bg-orange-500" />

                  <div className="min-w-0">
                    <p className="truncate text-[9px] font-semibold">
                      {session.title}
                    </p>

                    <p className="truncate text-[8px] text-muted-foreground">
                      {session.group_name ?? "No group"}
                    </p>
                  </div>

                  <p className="text-[8px] font-semibold text-orange-600">
                    {session.start_time
                      ? session.start_time.slice(0, 5)
                      : "—"}
                  </p>
                </button>
              );
            })}

          {!upcomingLoading &&
            upcomingSessions.length === 0 && (
              <div className="py-4 text-center">
                <p className="text-[9px] font-semibold">
                  No upcoming training
                </p>

                <p className="mt-1 text-[8px] text-muted-foreground">
                  Create a future session to see it here.
                </p>
              </div>
            )}

          {upcomingError && (
            <p className="py-2 text-[8px] font-semibold text-red-600">
              {upcomingError}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenCalendar}
          className="mt-2 text-[9px] font-semibold text-orange-600"
        >
          View full calendar →
        </button>
      </section>

      <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-orange-50">
              <Trophy className="h-3.5 w-3.5 text-orange-500" />
            </div>

            <h3 className="text-xs font-bold">
              Individual Training Plans
            </h3>
          </div>

          <button
            type="button"
            onClick={() => onOpenIndividualPlans?.()}
            className="text-[8px] font-semibold text-orange-600"
          >
            View all →
          </button>
        </div>

        <div className="mt-2 space-y-1">
          {individualPlans.map((plan) => {
            const Icon = plan.icon;

            return (
              <button
                key={plan.id}
                type="button"
                onClick={() =>
                  onOpenIndividualPlans?.(plan.id)
                }
                className="flex w-full items-center gap-2 rounded-xl px-1.5 py-2 text-left transition hover:bg-muted/20"
              >
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-orange-50 text-[8px] font-bold text-orange-600">
                  {plan.initials}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-semibold">
                    {plan.name}
                  </p>

                  <p className="text-[8px] text-muted-foreground">
                    {plan.plan}
                  </p>
                </div>

                <p className="text-[7px] text-muted-foreground">
                  {plan.time}
                </p>

                <div
                  className={`grid h-6 w-6 place-items-center rounded-lg ${plan.badge}`}
                >
                  <Icon className="h-3 w-3" />
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </aside>
  );
}












