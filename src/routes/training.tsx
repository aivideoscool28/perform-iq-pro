import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  X,
} from "lucide-react";

import { AppShell } from "@/components/athleticiq/AppShell";
import { Button } from "@/components/ui/button";
import {
  fetchPlannedWorkouts,
  type PlannedWorkout,
} from "@/lib/planned-workouts.functions";
import { explainPlannedWorkout } from "@/lib/training-explanation.functions";

export const Route = createFileRoute("/training")({
  component: TrainingPage,
});

function startOfWeek(date: Date) {
  const copy = new Date(date);

  const day = (copy.getDay() + 6) % 7;

  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);

  return copy;
}

function addDays(date: Date, amount: number) {
  const copy = new Date(date);

  copy.setDate(copy.getDate() + amount);

  return copy;
}

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatWeek(start: Date) {
  const end = addDays(start, 6);

  const startText = start.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
  });

  const endText = end.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return `${startText} – ${endText}`;
}

function createDemoWorkouts(weekStart: Date): PlannedWorkout[] {
  const now = new Date().toISOString();

  return [
    {
      id: "demo-monday",
      athlete_id: "demo",
      coach_id: null,
      workout_date: toDateString(addDays(weekStart, 0)),
      title: "Beschleunigung",
      discipline: "Sprint",
      duration_minutes: 60,
      session_goal: "Explosive erste 30 Meter.",
      coach_note: "Qualität vor Quantität.",
      exercises: [],
      status: "completed",
      source: "coach",
      completed_at: now,
      created_at: now,
      updated_at: now,
    },
    {
      id: "demo-tuesday",
      athlete_id: "demo",
      coach_id: null,
      workout_date: toDateString(addDays(weekStart, 1)),
      title: "Kraft",
      discipline: "Sprint",
      duration_minutes: 50,
      session_goal: "Sprintrelevante Kraft.",
      coach_note: "Saubere Technik.",
      exercises: [],
      status: "completed",
      source: "coach",
      completed_at: now,
      created_at: now,
      updated_at: now,
    },
    {
      id: "demo-thursday",
      athlete_id: "demo",
      coach_id: null,
      workout_date: toDateString(addDays(weekStart, 3)),
      title: "Hürden · Rhythmus",
      discipline: "Hürden",
      duration_minutes: 70,
      session_goal: "Konstanter Rhythmus.",
      coach_note: "Fokus auf Hürde 3–5.",
      exercises: [],
      status: "planned",
      source: "coach",
      completed_at: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: "demo-saturday",
      athlete_id: "demo",
      coach_id: null,
      workout_date: toDateString(addDays(weekStart, 5)),
      title: "Speed Endurance",
      discipline: "Sprint",
      duration_minutes: 65,
      session_goal: "Geschwindigkeit länger halten.",
      coach_note: "Volle Pausen nutzen.",
      exercises: [],
      status: "planned",
      source: "coach",
      completed_at: null,
      created_at: now,
      updated_at: now,
    },
  ];
}
function TrainingPage() {
  const fetchWorkouts = useServerFn(fetchPlannedWorkouts);
  const explainWorkout = useServerFn(explainPlannedWorkout);

  const explanationMutation = useMutation({
    mutationFn: (workoutId: string) =>
      explainWorkout({
        data: {
          workoutId,
        },
      }),
  });

  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date()),
  );

  const [selectedWorkout, setSelectedWorkout] =
    useState<PlannedWorkout | null>(null);

  const [whyOpen, setWhyOpen] = useState(false);

  const weekEnd = addDays(weekStart, 6);

  const startDate = toDateString(weekStart);
  const endDate = toDateString(weekEnd);

  const {
    data: workouts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["planned-workouts", startDate, endDate],

    queryFn: () =>
      fetchWorkouts({
        data: {
          startDate,
          endDate,
        },
      }),
  });

  const displayWorkouts =
    workouts.length > 0
      ? workouts
      : createDemoWorkouts(weekStart);

  const weekDays =
    Array.from({ length: 7 }, (_, index) =>
      addDays(weekStart, index),
    );

  const workoutForDate = (date: Date) =>
    displayWorkouts.find(
      (workout) =>
        workout.workout_date === toDateString(date),
    );

  return (
    <AppShell
      title="Training"
      subtitle="Dein Trainingsplan vom Coach"
      breadcrumbs={[
        { label: "Dashboard", to: "/" },
        { label: "Training" },
      ]}
    >
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="flex items-center gap-2 text-accent">
              <CalendarDays className="h-5 w-5" />

              <span className="font-semibold">
                Wochenplan
              </span>
            </div>

            <h2 className="mt-3 text-2xl font-bold">
              {formatWeek(weekStart)}
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {isLoading
                ? "Trainingsplan wird geladen..."
                : `${displayWorkouts.length} geplante Einheiten in dieser Woche`}
            </p>

            {error && (
              <p className="mt-2 text-sm text-destructive">
                Trainingsplan konnte nicht geladen werden.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">

            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setWeekStart((current) =>
                  addDays(current, -7),
                )
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                setWeekStart(startOfWeek(new Date()))
              }
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
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

          </div>

        </div>

      </section>

      {/* 7-DAY TRAINING CALENDAR */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-sm">

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">

          {weekDays.map((date) => {
            const workout = workoutForDate(date);

            const isToday =
              toDateString(date) ===
              toDateString(new Date());

            const completed =
              workout?.status === "completed";

            return (
              <button
                key={toDateString(date)}
                type="button"
                disabled={!workout}
                onClick={() => {
                  if (workout) {
                    setSelectedWorkout(workout);
                    setWhyOpen(false);
                  }
                }}
                className={[
                  "relative min-h-[150px] rounded-2xl border p-3 text-left transition",
                  workout
                    ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-sm"
                    : "cursor-default",
                  isToday
                    ? "border-accent bg-accent/5"
                    : "border-border bg-background/60",
                ].join(" ")}
              >

                {/* DAY + DATE */}
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
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                  )}

                </div>


                {/* WORKOUT */}
                {workout ? (
                  <div className="mt-5">

                    <div className="text-sm font-bold leading-snug">
                      {workout.title}
                    </div>

                    <div className="mt-1 text-xs text-muted-foreground">
                      {workout.discipline}
                    </div>

                    {workout.duration_minutes && (
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">

                        <Clock3 className="h-3.5 w-3.5" />

                        ca. {workout.duration_minutes} min

                      </div>
                    )}

                  </div>
                ) : (

                  <div className="mt-8 text-xs font-medium text-muted-foreground">
                    Frei
                  </div>

                )}


                {/* TODAY BADGE */}
                {isToday && (
                  <div className="absolute bottom-3 left-3 rounded-lg bg-accent/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-accent">
                    Heute
                  </div>
                )}

              </button>
            );
          })}

        </div>

        {workouts.length === 0 && !isLoading && (
          <div className="mt-4 text-xs text-muted-foreground">
            Demo-Vorschau · Noch kein echter Coach-Plan in Supabase.
          </div>
        )}

      </section>

      {/* SELECTED WORKOUT DETAILS */}
      {selectedWorkout && (
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">

          {/* MAIN WORKOUT DETAILS */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-accent/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
                {selectedWorkout.discipline ?? "Training"}
              </span>

              <span className="rounded-lg border border-border px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                Vom Coach
              </span>

              {selectedWorkout.status === "completed" && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-accent/10 px-2.5 py-1 text-[10px] font-bold text-accent">
                  <CheckCircle2 className="h-3 w-3" />
                  Abgeschlossen
                </span>
              )}
            </div>

            <div className="mt-3 flex items-start justify-between gap-4">

              <h2 className="text-2xl font-bold tracking-tight break-words">
                {selectedWorkout.title}
              </h2>

              <button
                type="button"
                onClick={() => setSelectedWorkout(null)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                aria-label="Trainingsdetails schließen"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="h-4 w-4" />
              ca. {selectedWorkout.duration_minutes ?? "—"} Minuten
            </div>

            {selectedWorkout.session_goal && (
              <div className="mt-6 rounded-xl border border-accent/15 bg-accent/5 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
                  Ziel der Einheit
                </div>

                <p className="mt-2 text-sm leading-relaxed">
                  {selectedWorkout.session_goal}
                </p>
              </div>
            )}

            <div className="mt-6">
              <div className="mb-3 text-sm font-bold">
                Training
              </div>

              {selectedWorkout.exercises.length > 0 ? (
                <div className="space-y-2">
                  {selectedWorkout.exercises.map((exercise, index) => (
                    <div
                      key={`${exercise.name}-${index}`}
                      className="rounded-xl border border-border bg-background px-4 py-3"
                    >
                      {exercise.section && (
                        <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          {exercise.section}
                        </div>
                      )}

                      <div className="mt-1 font-semibold">
                        {exercise.name}
                      </div>

                      {exercise.details && (
                        <div className="mt-1 text-sm text-muted-foreground">
                          {exercise.details}
                        </div>
                      )}

                      {exercise.rest && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Pause: {exercise.rest}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Für diese Demo-Einheit sind noch keine Übungen hinterlegt.
                </div>
              )}
            </div>

            {/* WHY THIS TRAINING */}
            <div className="mt-6 border-t border-border pt-5">

              <button
                type="button"
                onClick={() => {
                  if (whyOpen) {
                    setWhyOpen(false);
                    return;
                  }

                  setWhyOpen(true);

                  if (!selectedWorkout.id.startsWith("demo-")) {
                    explanationMutation.mutate(selectedWorkout.id);
                  }
                }}
                className="
                  flex w-full items-center justify-between gap-4
                  rounded-xl border border-accent/20
                  bg-accent/5 px-4 py-3
                  text-left transition
                  hover:border-accent/40 hover:bg-accent/10
                "
              >
                <div>
                  <div className="text-sm font-bold">
                    ✨ Warum dieses Training?
                  </div>

                  <div className="mt-1 text-xs text-muted-foreground">
                    Verstehe den Zweck hinter der Einheit.
                  </div>
                </div>

                <span className="text-lg font-bold text-accent">
                  {whyOpen ? "−" : "+"}
                </span>
              </button>

              {whyOpen && (
                <div className="mt-3 rounded-2xl border border-accent/15 bg-accent/5 p-5">

                  {selectedWorkout.id.startsWith("demo-") ? (
                    <div>
                      <div className="text-sm font-bold">
                        Demo-Training
                      </div>

                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        Die echte Athletic IQ Erklärung wird mit einem realen
                        Coach-Training aus Supabase getestet.
                      </p>
                    </div>
                  ) : explanationMutation.isPending ? (
                    <div>
                      <div className="text-sm font-bold">
                        Athletic IQ analysiert dein Training…
                      </div>

                      <p className="mt-2 text-sm text-muted-foreground">
                        Trainingsziel, Übungen, Coach-Fokus und relevante
                        vergangene Analysen werden berücksichtigt.
                      </p>
                    </div>
                  ) : explanationMutation.isError ? (
                    <div>
                      <div className="text-sm font-bold text-destructive">
                        Erklärung konnte nicht erstellt werden.
                      </div>

                      <p className="mt-2 text-sm text-muted-foreground">
                        Bitte versuche es erneut.
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          explanationMutation.mutate(selectedWorkout.id)
                        }
                        className="mt-3 text-sm font-semibold text-accent hover:underline"
                      >
                        Erneut versuchen
                      </button>
                    </div>
                  ) : explanationMutation.data?.explanation ? (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                        Athletic IQ Erklärung
                      </div>

                      <div className="mt-3 whitespace-pre-line text-sm leading-relaxed">
                        {explanationMutation.data.explanation}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Klicke erneut auf „Warum dieses Training?“, um die Erklärung zu laden.
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>

          {/* COACH FOCUS */}
          <aside className="rounded-2xl border border-accent/20 bg-accent/5 p-5 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              Coach Fokus
            </div>

            <p className="mt-3 text-base font-semibold leading-relaxed">
              {selectedWorkout.coach_note ??
                "Für diese Einheit wurde noch kein zusätzlicher Coach-Fokus hinterlegt."}
            </p>
          </aside>

        </section>
      )}

    </AppShell>
  );
}
