import { CheckCircle2, Clock3 } from "lucide-react";
import type { PlannedWorkout } from "@/lib/planned-workouts.functions";

type WeeklyCalendarProps = {
  weekDays: Date[];
  workoutForDate: (date: Date) => PlannedWorkout | undefined;
  onSelectWorkout: (workout: PlannedWorkout) => void;
  hasRealWorkouts: boolean;
  isLoading: boolean;
  toDateString: (date: Date) => string;
};

export function WeeklyCalendar({
  weekDays,
  workoutForDate,
  onSelectWorkout,
  hasRealWorkouts,
  isLoading,
  toDateString,
}: WeeklyCalendarProps) {
  return (
    <section className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="grid w-max grid-cols-[repeat(7,145px)] gap-3">
        {weekDays.map((date) => {
          const workout = workoutForDate(date);

          const isToday =
            toDateString(date) === toDateString(new Date());

          const completed = workout?.status === "completed";

          return (
            <button
              key={toDateString(date)}
              type="button"
              disabled={!workout}
              onClick={() => {
                if (workout) {
                  onSelectWorkout(workout);
                }
              }}
              className={[
                "relative h-[145px] w-[145px] overflow-hidden rounded-2xl border p-3.5 text-left transition",
                workout
                  ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-sm"
                  : "cursor-default",
                isToday
                  ? "border-accent bg-accent/5"
                  : "border-border bg-background/60",
              ].join(" ")}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div
                    className={[
                      "text-[10px] font-bold uppercase tracking-[0.18em]",
                      isToday
                        ? "text-accent"
                        : "text-muted-foreground",
                    ].join(" ")}
                  >
                    {date.toLocaleDateString("de-DE", {
                      weekday: "short",
                    })}
                  </div>

                  <div className="mt-1 text-lg font-bold">
                    {date.getDate()}
                  </div>
                </div>

                {completed && (
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                )}
              </div>

              {workout ? (
                <div className="mt-3">
                  <div className="line-clamp-4 break-words text-[13px] font-bold leading-[1.18]">
                    {workout.title}
                  </div>

                  <div className="mt-1 text-[11px] font-medium text-muted-foreground">
                    {workout.discipline}
                  </div>

                  {workout.duration_minutes && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-accent">
                      <Clock3 className="h-3 w-3" />
                      ca. {workout.duration_minutes} min
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4 text-xs font-medium text-muted-foreground">
                  Frei
                </div>
              )}

              {isToday && (
                <div className="absolute bottom-3 left-3 rounded-lg bg-accent/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-accent">
                  Heute
                </div>
              )}
            </button>
          );
        })}
      </div>

      {!hasRealWorkouts && !isLoading && (
        <div className="mt-4 text-xs text-muted-foreground">
          Demo-Vorschau · Noch kein echter Coach-Plan in Supabase.
        </div>
      )}
    </section>
  );
}
