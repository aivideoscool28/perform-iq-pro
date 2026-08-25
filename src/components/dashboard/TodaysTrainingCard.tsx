import { Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";

type TodaysTraining = {
  id: string;
  title?: string | null;
  discipline?: string | null;
  duration_minutes?: number | null;
  exercises?: unknown;
  session_goal?: string | null;
  coach_note?: string | null;
};

type TodaysTrainingCardProps = {
  workout: TodaysTraining | null | undefined;
  loading?: boolean;
  onViewTraining: () => void;
};

function getExerciseLabels(exercises: unknown): string[] {
  if (!Array.isArray(exercises)) {
    return [];
  }

  return exercises
    .map((exercise) => {
      if (typeof exercise === "string") {
        return exercise.trim();
      }

      if (
        exercise &&
        typeof exercise === "object"
      ) {
        const item = exercise as Record<string, unknown>;

        const label =
          item.name ??
          item.title ??
          item.exercise ??
          item.description;

        if (typeof label === "string") {
          return label.trim();
        }
      }

      return "";
    })
    .filter(Boolean)
    .slice(0, 3);
}

export function TodaysTrainingCard({
  workout,
  loading = false,
  onViewTraining,
}: TodaysTrainingCardProps) {
  if (loading) {
    return (
      <section className="mb-6">
        <div className="rounded-2xl border border-border bg-card px-6 py-5 shadow-sm">
          <div className="flex min-h-[96px] items-center justify-center">
            <p className="text-sm font-medium text-muted-foreground">
              Heutiges Training wird geladen...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!workout) {
    return (
      <section className="mb-6">
        <div className="rounded-2xl border border-border bg-card px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-accent/10">
                <Dumbbell className="h-7 w-7 text-accent" />
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">
                  Heute
                </div>

                <h2 className="mt-1 text-xl font-bold tracking-tight">
                  Kein Training geplant
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Für heute wurde noch kein Training veröffentlicht.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={onViewTraining}
              className="h-11 rounded-xl border-accent px-5 font-semibold hover:bg-accent/5"
            >
              Trainingsplan ansehen
              <span className="ml-2 text-lg">→</span>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const exercises = getExerciseLabels(workout.exercises);

  const meta = [
    workout.discipline?.trim(),
    workout.duration_minutes
      ? `ca. ${workout.duration_minutes} Minuten`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="mb-6">
      <div className="rounded-2xl border border-border bg-card px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4 lg:w-[32%]">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-accent/10">
              <Dumbbell className="h-7 w-7 text-accent" />
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">
                Heute
              </div>

              <h2 className="mt-1 text-xl font-bold tracking-tight">
                {workout.title?.trim() || "Training"}
              </h2>

              {meta && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {meta}
                </p>
              )}
            </div>
          </div>

          <div className="flex-1 lg:border-l lg:border-border lg:pl-7">
            {exercises.length > 0 ? (
              <div className="grid gap-2.5 text-sm font-semibold">
                {exercises.map((exercise, index) => (
                  <div
                    key={`${exercise}-${index}`}
                    className="flex items-center gap-3"
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full bg-accent/30" />
                    <span>{exercise}</span>
                  </div>
                ))}
              </div>
            ) : workout.session_goal ? (
              <p className="text-sm font-medium text-foreground">
                {workout.session_goal}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Öffne das Training für alle Details.
              </p>
            )}
          </div>

          <div className="shrink-0">
            <Button
              variant="outline"
              onClick={onViewTraining}
              className="h-11 rounded-xl border-accent px-5 font-semibold hover:bg-accent/5"
            >
              Training ansehen
              <span className="ml-2 text-lg">→</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
