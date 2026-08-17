import { Dumbbell, Flame } from "lucide-react";
import { Sparkline } from "@/components/athleticiq/Sparkline";

type WeeklyProgressCardsProps = {
  currentStreak: number;
  longestStreak: number;
  doneToday: boolean;
  trainings: number;
  weeklyGoal: number;
};

export function WeeklyProgressCards({
  currentStreak,
  longestStreak,
  doneToday,
  trainings,
  weeklyGoal,
}: WeeklyProgressCardsProps) {
  return (
    <section className="mb-6 grid gap-6 lg:grid-cols-2">

      <div
        data-tour="streak"
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm"
      >
        <div className="pointer-events-none absolute -left-12 -top-16 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-accent/15 bg-accent/10">
            <Flame className="h-7 w-7 text-accent" />
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Aktueller Streak
            </div>

            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-bold tabular-nums text-accent">
                {currentStreak}
              </span>

              <span className="text-sm font-semibold text-muted-foreground">
                Tage
              </span>
            </div>

            <p className="mt-1 text-sm font-medium">
              Rekord: {Math.max(longestStreak, currentStreak)}
            </p>
          </div>
        </div>

        <div className="relative mt-5 rounded-xl border border-accent/10 bg-accent/5 px-4 py-3 text-sm font-medium">
          {doneToday
            ? "Heute erledigt — starke Konstanz."
            : "Bleib konsequent bei deinem Trainingsplan."}
        </div>
      </div>

      <div
        data-tour="performance"
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm"
      >
        <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Trainings diese Woche
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold tabular-nums text-accent">
                {trainings}
              </span>

              <span className="text-xl font-semibold text-muted-foreground">
                / {weeklyGoal}
              </span>
            </div>

            <p className="mt-1 text-sm font-medium">
              Dein Wochenziel
            </p>
          </div>

          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-accent/15 bg-accent/10">
            <Dumbbell className="h-5 w-5 text-accent" />
          </div>
        </div>

        <div className="relative mt-5">
          <Sparkline
            data={[0, 0, 1, 1, 2, 2, trainings]}
            color="var(--accent)"
          />
        </div>

        <div className="relative mt-1 grid grid-cols-7 text-center text-[10px] text-muted-foreground">
          <span>Mo</span>
          <span>Di</span>
          <span>Mi</span>
          <span>Do</span>
          <span>Fr</span>
          <span>Sa</span>
          <span>So</span>
        </div>
      </div>

    </section>
  );
}
