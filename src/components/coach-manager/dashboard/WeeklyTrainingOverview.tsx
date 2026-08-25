import { Link } from "@tanstack/react-router";

import type {
  CoachTrainingSession,
} from "@/lib/coach-training.functions";

type WeeklyTrainingOverviewProps = {
  sessions: CoachTrainingSession[];
  loading: boolean;
};

function dayLabel(dateValue: string) {
  const date = new Date(`${dateValue}T12:00:00`);

  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(date);
}

function formatTime(
  start: string | null,
  end: string | null,
) {
  const startTime =
    start?.slice(0, 5) ?? null;

  const endTime =
    end?.slice(0, 5) ?? null;

  if (startTime && endTime) {
    return `${startTime} – ${endTime}`;
  }

  if (startTime) {
    return startTime;
  }

  return "Time not set";
}

export function WeeklyTrainingOverview({
  sessions,
  loading,
}: WeeklyTrainingOverviewProps) {
  const visibleSessions =
    sessions
      .filter(
        (session) =>
          session.status !== "cancelled",
      )
      .slice(0, 5);

  return (
    <section className="h-full rounded-2xl border border-border bg-background p-3 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-muted-foreground">
          This Week
        </p>

        <h3 className="mt-1 text-base font-bold">
          Upcoming sessions
        </h3>
      </div>

      <div className="mt-3 space-y-2">
        {loading &&
          Array.from({
            length: 3,
          }).map((_, index) => (
            <div
              key={index}
              className="h-[58px] animate-pulse rounded-xl bg-muted/30"
            />
          ))}

        {!loading &&
          visibleSessions.map(
            (session) => {
              const statusStyle =
                session.status ===
                "published"
                  ? "bg-emerald-50 text-emerald-700"
                  : session.status ===
                      "draft"
                    ? "bg-slate-100 text-slate-600"
                    : "bg-blue-50 text-blue-700";

              return (
                <div
                  key={session.id}
                  className="rounded-xl border border-border/70 bg-muted/15 px-3 py-2"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-8 shrink-0 text-xs font-bold text-muted-foreground">
                      {dayLabel(
                        session.session_date,
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">
                        {session.title}
                      </p>

                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="truncate text-[10px] text-muted-foreground">
                          {formatTime(
                            session.start_time,
                            session.end_time,
                          )}
                        </p>

                        <div className="flex shrink-0 items-center gap-1">
                          {session.discipline && (
                            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[8px] font-semibold text-orange-600">
                              {
                                session.discipline
                              }
                            </span>
                          )}

                          <span
                            className={`rounded-full px-2 py-0.5 text-[8px] font-semibold capitalize ${statusStyle}`}
                          >
                            {session.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            },
          )}

        {!loading &&
          visibleSessions.length === 0 && (
            <div className="rounded-xl border border-dashed border-border px-3 py-5 text-center">
              <p className="text-[10px] font-semibold">
                No upcoming sessions this week
              </p>

              <p className="mt-1 text-[9px] text-muted-foreground">
                Create a training session to add it here.
              </p>
            </div>
          )}
      </div>

      <Link
        to="/coach-manager/training"
        className="mt-3 inline-block text-xs font-semibold text-orange-600"
      >
        Go to Training Plan →
      </Link>
    </section>
  );
}
