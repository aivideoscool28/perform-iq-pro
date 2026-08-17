import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type WeekNavigationProps = {
  weekStart: Date;
  setWeekStart: React.Dispatch<React.SetStateAction<Date>>;
  error: unknown;
  isLoading: boolean;
  workoutCount: number;
  formatWeek: (date: Date) => string;
  startOfWeek: (date: Date) => Date;
  addDays: (date: Date, days: number) => Date;
};

export function WeekNavigation({
  weekStart,
  setWeekStart,
  error,
  isLoading,
  workoutCount,
  formatWeek,
  startOfWeek,
  addDays,
}: WeekNavigationProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setWeekStart((current) =>
                addDays(current, -7),
              )
            }
            className="h-10 w-10 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-accent" />

              <h2 className="text-xl font-bold tracking-tight">
                {formatWeek(weekStart)}
              </h2>
            </div>

            {error && (
              <p className="mt-1 text-xs text-destructive">
                Trainingsplan konnte nicht geladen werden.
              </p>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() =>
              setWeekStart(startOfWeek(new Date()))
            }
            className="h-9 rounded-xl border-accent/20 bg-accent/5 px-4 text-sm font-semibold text-accent hover:bg-accent/10"
          >
            Heute
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setWeekStart((current) =>
                addDays(current, 7),
              )
            }
            className="h-10 w-10 rounded-xl"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />

          <span>
            {isLoading
              ? "Trainingsplan wird geladen..."
              : `${workoutCount} Einheiten diese Woche`}
          </span>
        </div>
      </div>
    </section>
  );
}

