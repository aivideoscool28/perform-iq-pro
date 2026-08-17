import ReactMarkdown from "react-markdown";
import {
  CheckCircle2,
  Clock3,
  Target,
  Zap,
  Activity,
  History,
  Lightbulb,
  Trophy,
  X,
} from "lucide-react";

import type { PlannedWorkout } from "@/lib/planned-workouts.functions";

const EXERCISE_VISUALS = [
  { icon: Zap, box: "bg-orange-100 text-orange-500" },
  { icon: Target, box: "bg-blue-100 text-blue-500" },
  { icon: Activity, box: "bg-green-100 text-green-600" },
  { icon: Zap, box: "bg-violet-100 text-violet-500" },
] as const;

type WorkoutDetailsProps = {
  selectedWorkout: PlannedWorkout;
  whyOpen: boolean;
  setWhyOpen: (open: boolean) => void;
  onClose: () => void;
  explanationMutation: {
    mutate: (workoutId: string) => void;
    isPending: boolean;
    isError: boolean;
    data?: {
      explanation?: string;
    };
  };
};

export function WorkoutDetails({
  selectedWorkout,
  whyOpen,
  setWhyOpen,
  onClose,
  explanationMutation,
}: WorkoutDetailsProps) {
  return (
    <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.8fr)] lg:items-start">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
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
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="Trainingsdetails schließen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock3 className="h-4 w-4" />
            <span>ca. {selectedWorkout.duration_minutes ?? "—"} Minuten</span>
          </div>

          <span className="text-border">•</span>

          <span>{selectedWorkout.exercises.length} Trainingsblöcke</span>
        </div>

        {selectedWorkout.session_goal && (
          <div className="mt-5 flex gap-4 rounded-xl border border-accent/15 bg-accent/5 p-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-500">
              <Target className="h-5 w-5" />
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
                Ziel der Einheit
              </div>

              <p className="mt-2 text-sm font-medium leading-relaxed">
                {selectedWorkout.session_goal}
              </p>
            </div>
          </div>
        )}

        <div className="mt-5">
          <div className="mb-3 text-sm font-bold">Training</div>

          {selectedWorkout.exercises.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-border bg-background">
              {selectedWorkout.exercises.map((exercise, index) => {
                const visual =
                  EXERCISE_VISUALS[index % EXERCISE_VISUALS.length];

                const ExerciseIcon = visual.icon;

                return (
                  <div
                    key={`${exercise.name}-${index}`}
                    className={[
                      "grid gap-3 px-3 py-3 sm:grid-cols-[44px_92px_minmax(0,1fr)_auto] sm:items-center",
                      index !== selectedWorkout.exercises.length - 1
                        ? "border-b border-border"
                        : "",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "grid h-9 w-9 place-items-center rounded-xl",
                        visual.box,
                      ].join(" ")}
                    >
                      <ExerciseIcon className="h-4 w-4" />
                    </div>

                    <div className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
                      {exercise.section ?? "Training"}
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-bold">{exercise.name}</div>

                      {exercise.details && (
                        <div className="mt-0.5 text-[12px] font-medium text-muted-foreground">
                          {exercise.details}
                        </div>
                      )}
                    </div>

                    {exercise.rest && (
                      <div className="shrink-0 rounded-lg bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {exercise.rest.toLowerCase().includes("pause")
                          ? exercise.rest
                          : `${exercise.rest} Pause`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              Für diese Demo-Einheit sind noch keine Übungen hinterlegt.
            </div>
          )}
        </div>

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
            className="flex w-full items-center justify-between gap-4 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-left transition hover:border-accent/40 hover:bg-accent/10"
          >
            <div>
              <div className="text-sm font-bold">
                ✨ Warum dieses Training?
              </div>

              <div className="mt-1 text-[11px] font-medium text-muted-foreground">
                Verstehe den Zweck hinter der Einheit.
              </div>
            </div>

            <span className="text-lg font-bold text-accent">
              {whyOpen ? "−" : "+"}
            </span>
          </button>
        </div>
      </div>

      <aside className="self-start space-y-4">
        <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3.5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
            ✦ Coach Fokus
          </div>

          <p className="mt-3 text-base font-semibold leading-relaxed">
            {selectedWorkout.coach_note ??
              "Für diese Einheit wurde noch kein zusätzlicher Coach-Fokus hinterlegt."}
          </p>
        </div>

        {whyOpen && (
          <div className="rounded-xl border border-sky-200/70 bg-sky-50/70 p-4 shadow-sm dark:border-sky-900/40 dark:bg-sky-950/20">
            {selectedWorkout.id.startsWith("demo-") ? (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                  Athletic IQ Erklärung
                </div>

                <div className="mt-2 text-sm font-bold">Demo-Training</div>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Die echte Athletic IQ Erklärung wird mit einem realen
                  Coach-Training aus Supabase getestet.
                </p>
              </div>
            ) : explanationMutation.isPending ? (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                  Athletic IQ Erklärung
                </div>

                <div className="mt-2 text-sm font-bold">
                  Athletic IQ analysiert dein Training…
                </div>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Trainingsziel, Übungen, Coach-Fokus und relevante vergangene
                  Analysen werden berücksichtigt.
                </p>
              </div>
            ) : explanationMutation.isError ? (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                  Athletic IQ Erklärung
                </div>

                <div className="mt-2 text-sm font-bold text-destructive">
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
                <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                  Athletic IQ Erklärung
                </div>

                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h3 className="mb-3 text-base font-bold tracking-tight">
                        {children}
                      </h3>
                    ),

                    h2: ({ children }) => (
                      <h2 className="mb-4 text-lg font-extrabold tracking-tight text-foreground">
                        {children}
                      </h2>
                    ),

                    h3: ({ children }) => {
                      const label = String(children);

                      const visual =
                        label.includes("Fokus")
                          ? {
                              icon: Lightbulb,
                              color: "text-green-600",
                              box: "bg-green-100",
                            }
                          : label.includes("gute Einheit")
                            ? {
                                icon: Trophy,
                                color: "text-amber-600",
                                box: "bg-amber-100",
                              }
                            : label.includes("letzten Training")
                              ? {
                                  icon: History,
                                  color: "text-violet-600",
                                  box: "bg-violet-100",
                                }
                              : {
                                  icon: Target,
                                  color: "text-sky-600",
                                  box: "bg-sky-100",
                                };

                      const SectionIcon = visual.icon;

                      return (
                        <div className="mt-4 mb-2 flex items-center gap-2">
                          <div
                            className={[
                              "grid h-6 w-6 shrink-0 place-items-center rounded-lg",
                              visual.box,
                              visual.color,
                            ].join(" ")}
                          >
                            <SectionIcon className="h-3.5 w-3.5" />
                          </div>

                          <h3
                            className={[
                              "text-[11px] font-extrabold uppercase tracking-[0.14em]",
                              visual.color,
                            ].join(" ")}
                          >
                            {children}
                          </h3>
                        </div>
                      );
                    },

                    p: ({ children }) => (
                      <p className="mb-3 text-sm leading-relaxed text-foreground">
                        {children}
                      </p>
                    ),

                    strong: ({ children }) => (
                      <strong className="font-bold text-foreground">
                        {children}
                      </strong>
                    ),

                    ul: ({ children }) => (
                      <ul className="mb-3 space-y-2 pl-1">{children}</ul>
                    ),

                    li: ({ children }) => (
                      <li className="flex gap-2 text-sm leading-relaxed text-foreground">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                        <span>{children}</span>
                      </li>
                    ),
                  }}
                >
                  {explanationMutation.data.explanation}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Klicke erneut auf „Warum dieses Training?“, um die Erklärung
                zu laden.
              </div>
            )}
          </div>
        )}
      </aside>
    </section>
  );
}
