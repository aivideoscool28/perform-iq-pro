import {
  CalendarDays,
  Clock3,
  MapPin,
} from "lucide-react";

import {
  useCoachUpcomingTraining,
} from "@/hooks/coach-manager/useCoachUpcomingTraining";

function formatDate(
  value: string,
) {
  return new Date(
    `${value}T12:00:00`,
  ).toLocaleDateString(
    "en-GB",
    {
      weekday:
        "short",
      day:
        "2-digit",
      month:
        "short",
    },
  );
}

export function UpcomingTraining() {
  const {
    sessions,
    loading,
    error,
  } =
    useCoachUpcomingTraining();

  return (
    <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-orange-50">
          <CalendarDays className="h-4 w-4 text-orange-500" />
        </div>

        <div>
          <h3 className="text-xs font-bold">
            Upcoming Training
          </h3>

          <p className="text-[9px] text-muted-foreground">
            Your next planned sessions.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3">
          <p className="text-[9px] font-semibold text-red-700">
            {error}
          </p>
        </div>
      )}

      <div className="mt-3 space-y-2">
        {loading &&
          Array.from({
            length: 3,
          }).map(
            (_, index) => (
              <div
                key={
                  index
                }
                className="h-14 animate-pulse rounded-xl bg-muted/40"
              />
            ),
          )}

        {!loading &&
          sessions.map(
            (session) => (
              <div
                key={
                  session.id
                }
                className="rounded-xl border border-border px-3 py-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold">
                      {
                        session.title
                      }
                    </p>

                    <p className="mt-0.5 text-[8px] text-muted-foreground">
                      {
                        session.group_name ??
                        "No group"
                      }
                    </p>
                  </div>

                  <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[7px] font-semibold text-orange-600">
                    {formatDate(
                      session.session_date,
                    )}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-3 text-[8px] text-muted-foreground">
                  {session.start_time && (
                    <span className="flex items-center gap-1">
                      <Clock3 className="h-3 w-3" />

                      {
                        session.start_time.slice(
                          0,
                          5,
                        )
                      }
                    </span>
                  )}

                  {session.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />

                      {
                        session.location
                      }
                    </span>
                  )}
                </div>
              </div>
            ),
          )}

        {!loading &&
          sessions.length ===
            0 && (
            <div className="rounded-xl border border-dashed border-border p-4 text-center">
              <p className="text-[9px] font-semibold">
                No upcoming training
              </p>

              <p className="mt-1 text-[8px] text-muted-foreground">
                Create a session to see it here.
              </p>
            </div>
          )}
      </div>
    </section>
  );
}
