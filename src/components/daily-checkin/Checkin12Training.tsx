import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Grid, RateBar } from "@/components/daily-checkin/CheckinButtons";
import type { PlannedWorkout } from "@/lib/planned-workouts.functions";

type TrainingQuestionPageProps = {
  plannedWorkout: PlannedWorkout | null;
  plannedCompletionStatus: "completed" | "changed" | null;
  discipline: string | null;
  workoutType: string | null;
  rpe: number | null;
  expectedDifficulty: string | null;

  sessionText: string;
  performanceText: string;

  onUsePlannedWorkout: (status: "completed" | "changed") => void;
  notCompletedReason: string | null;
  notCompletedNote: string;
  isSavingNotCompleted: boolean;
  onNotCompletedReasonChange: (value: string) => void;
  onNotCompletedNoteChange: (value: string) => void;
  onNotCompleted: () => void | Promise<void>;
  onSaveRestDay: () => void | Promise<void>;

  onDisciplineChange: (value: string) => void | Promise<void>;
  onWorkoutTypeChange: (value: string) => void;
  onRpeChange: (value: number) => void;
  onExpectedDifficultyChange: (value: string) => void;

  onSessionTextChange: (value: string) => void;
  onPerformanceTextChange: (value: string) => void;

  onContinue: () => void;
};

const disciplines = [
  "Sprint",
  "Hürden",
];

const sprintWorkoutTypes = [
  "Blockstarts",
  "Beschleunigung",
  "Maximalgeschwindigkeit",
  "Schnelligkeitsausdauer",
  "Kraft",
  "Regeneration",
  "Sonstiges",
];

const hurdleWorkoutTypes = [
  "Start bis erste Hürde",
  "Hürdentechnik",
  "Hürdenrhythmus",
  "Beschleunigung",
  "Sprint",
  "Kraft",
  "Regeneration",
  "Sonstiges",
];

const expectedDifficultyOptions = [
  "Leichter als erwartet",
  "Wie erwartet",
  "Schwerer als erwartet",
  "Deutlich schwerer als erwartet",
];

export function TrainingQuestionPage({
  plannedWorkout,
  plannedCompletionStatus,
  discipline,
  workoutType,
  rpe,
  expectedDifficulty,
  sessionText,
  performanceText,
  onUsePlannedWorkout,
  notCompletedReason,
  notCompletedNote,
  isSavingNotCompleted,
  onNotCompletedReasonChange,
  onNotCompletedNoteChange,
  onNotCompleted,
  onSaveRestDay,
  onDisciplineChange,
  onWorkoutTypeChange,
  onRpeChange,
  onExpectedDifficultyChange,
  onSessionTextChange,
  onPerformanceTextChange,
  onContinue,
}: TrainingQuestionPageProps) {
  const isPlannedRestDay = plannedWorkout?.title.trim().toLowerCase() === "ruhetag";
  const [trainedOnRestDay, setTrainedOnRestDay] = useState(false);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="text-xs font-semibold text-accent mb-1">
          FRAGE 1
        </div>

        {isPlannedRestDay && !trainedOnRestDay ? (
          <>
            <h2 className="text-xl font-semibold">
              Heute ist ein Ruhetag geplant.
            </h2>

            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Hast du den Ruhetag eingehalten oder heute trotzdem trainiert?
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => void onSaveRestDay()}
                className="min-h-[52px] rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold transition hover:border-accent/40 hover:bg-accent/5"
              >
                Ja, Ruhetag eingehalten
              </button>

              <button
                type="button"
                onClick={() => setTrainedOnRestDay(true)}
                className="min-h-[52px] rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold transition hover:border-accent/40"
              >
                Nein, ich habe trainiert
              </button>
            </div>
          </>
        ) : plannedWorkout && !isPlannedRestDay ? (
          <>
            <h2 className="text-xl font-semibold">
              Hast du das heutige Training wie geplant absolviert?
            </h2>

            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Dein Trainingsplan ist bereits hinterlegt — du musst die Session nicht noch einmal eingeben.
            </p>

            <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 mb-4">
              <div className="font-semibold">
                {plannedWorkout.title}
              </div>

              <div className="mt-1 text-sm text-muted-foreground">
                {[
                  plannedWorkout.discipline,
                  plannedWorkout.duration_minutes
                    ? `ca. ${plannedWorkout.duration_minutes} Minuten`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </div>

              {plannedWorkout.session_goal && (
                <div className="mt-3 text-sm">
                  <span className="font-medium">Ziel: </span>
                  {plannedWorkout.session_goal}
                </div>
              )}

              {plannedWorkout.exercises.length > 0 && (
                <div className="mt-3 space-y-2">
                  {plannedWorkout.exercises.map((exercise, index) => (
                    <div
                      key={`${exercise.name}-${index}`}
                      className="text-sm"
                    >
                      <span className="font-medium">
                        {exercise.name}
                      </span>

                      {exercise.details && (
                        <span className="text-muted-foreground">
                          {" · "}
                          {exercise.details}
                        </span>
                      )}

                      {exercise.rest && (
                        <span className="text-muted-foreground">
                          {" · Pause: "}
                          {exercise.rest}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() =>
                  onUsePlannedWorkout("completed")
                }
                className={[
                  "min-h-[52px] rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                  plannedCompletionStatus === "completed"
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-background hover:border-accent/40",
                ].join(" ")}
              >
                Wie geplant
              </button>

              <button
                type="button"
                onClick={() =>
                  onUsePlannedWorkout("changed")
                }
                className={[
                  "min-h-[52px] rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                  plannedCompletionStatus === "changed"
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-background hover:border-accent/40",
                ].join(" ")}
              >
                Geändert
              </button>

              {notCompletedReason === null ? (
                <button
                  type="button"
                  onClick={() => onNotCompletedReasonChange("Auswahl offen")}
                  className="min-h-[52px] rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold transition hover:border-destructive/50 hover:text-destructive"
                >
                  Nicht absolviert
                </button>
              ) : (
                <div className="sm:col-span-3 rounded-2xl border border-border bg-background p-4">
                  <div className="text-sm font-semibold mb-3">
                    Warum hast du das Training nicht absolviert?
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      "Schmerzen / Beschwerden",
                      "Zeit / Schule",
                      "Coach hat geändert / abgesagt",
                      "Erholung / Müdigkeit",
                      "Sonstiges",
                    ].map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => onNotCompletedReasonChange(reason)}
                        className={[
                          "min-h-[46px] rounded-xl border px-3 py-2 text-sm font-medium transition",
                          notCompletedReason === reason
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border bg-background hover:border-accent/40",
                        ].join(" ")}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>

                  {notCompletedReason === "Sonstiges" && (
                    <textarea
                      value={notCompletedNote}
                      onChange={(e) => onNotCompletedNoteChange(e.target.value)}
                      placeholder="Kurz beschreiben..."
                      rows={2}
                      className="w-full mt-3 rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-accent"
                    />
                  )}

                  <Button
                    type="button"
                    className="w-full mt-4 rounded-xl"
                    disabled={
                      notCompletedReason === "Auswahl offen" ||
                      (
                        notCompletedReason === "Sonstiges" &&
                        !notCompletedNote.trim()
                      )
                    }
                    onClick={() => void onNotCompleted()}
                  >
                    {isSavingNotCompleted ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Wird gespeichert...
                      </>
                    ) : (
                      "Check-In speichern"
                    )}
                  </Button>
                </div>
              )}
            </div>

            {plannedCompletionStatus === "changed" && (
              <div className="mt-4">
                <div className="mb-2 text-sm font-medium">
                  Was hast du tatsächlich gemacht?
                </div>

                <textarea
                  value={sessionText}
                  onChange={(e) =>
                    onSessionTextChange(e.target.value)
                  }
                  placeholder="Beschreibe kurz die geänderte Session..."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            )}

            {plannedCompletionStatus && (
              <div className="mt-4">
                <div className="mb-2 text-sm font-medium">
                  Ergebnisse · optional
                </div>

                <textarea
                  value={performanceText}
                  onChange={(e) =>
                    onPerformanceTextChange(e.target.value)
                  }
                  placeholder="z. B. 4,18 · 4,15 · 4,20"
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold">
              Was hast du heute trainiert?
            </h2>

            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Heute ist kein Training im Plan hinterlegt. Gib deine Session kurz manuell ein.
            </p>

            <div className="mb-4">
              <div className="text-sm font-medium mb-2">
                Disziplin
              </div>

              <Grid
                options={disciplines}
                value={discipline}
                onSelect={onDisciplineChange}
              />
            </div>

            {discipline && (
              <>
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">
                    Trainingsart
                  </div>

                  <Grid
                    options={
                      discipline === "Hürden"
                        ? hurdleWorkoutTypes
                        : sprintWorkoutTypes
                    }
                    value={workoutType}
                    onSelect={onWorkoutTypeChange}
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <textarea
                    value={sessionText}
                    onChange={(e) =>
                      onSessionTextChange(e.target.value)
                    }
                    placeholder="Session, z. B. 4 × 30 m + 3 × 60 m"
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-accent"
                  />

                  <textarea
                    value={performanceText}
                    onChange={(e) =>
                      onPerformanceTextChange(e.target.value)
                    }
                    placeholder="Ergebnisse, z. B. 4,18 · 4,15 · 4,20"
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </>
            )}
          </>
        )}
      </section>
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="text-xs font-semibold text-accent mb-1">
          FRAGE 2
        </div>

        <h2 className="text-xl font-semibold mb-1">
          Wie hart hat sich das Training angefühlt?
        </h2>

        <p className="text-sm text-muted-foreground mb-4">
          1 = sehr leicht · 10 = maximal
        </p>

        <RateBar
          max={10}
          value={rpe}
          onSelect={onRpeChange}
        />
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="text-xs font-semibold text-accent mb-1">
          FRAGE 3
        </div>

        <h2 className="text-xl font-semibold mb-1">
          Wie schwer war die Einheit im Vergleich zu deiner Erwartung?
        </h2>

        <p className="text-sm text-muted-foreground mb-4">
          Damit Athletic IQ unterscheiden kann, ob eine hohe Belastung geplant oder überraschend war.
        </p>

        <Grid
          options={expectedDifficultyOptions}
          value={expectedDifficulty}
          onSelect={onExpectedDifficultyChange}
        />
      </section>

      <Button
        size="lg"
        className="w-full bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-white rounded-2xl min-h-[56px] font-semibold"
        disabled={
          (
            plannedWorkout
              ? !plannedCompletionStatus
              : !discipline || !workoutType
          ) ||
          rpe === null ||
          !expectedDifficulty
        }
        onClick={onContinue}
      >
        Weiter
      </Button>
    </div>
  );
}

type PerformanceQuestionPageProps = {
  performanceQuality: string | null;
  sessionGoalAchieved: string | null;
  sessionGoalText: string;

  onPerformanceQualityChange: (value: string) => void;
  onSessionGoalChange: (value: string) => void;
  onSessionGoalTextChange: (value: string) => void;

  onContinue: () => void;
};

const performanceQualityOptions = [
  "Besser geworden",
  "Stabil geblieben",
  "Etwas abgefallen",
  "Stark abgefallen",
  "Kann ich nicht beurteilen",
];

const sessionGoalOptions = [
  "Ja",
  "Teilweise",
  "Nein",
  "Weiß ich nicht",
];

export function PerformanceQuestionPage({
  performanceQuality,
  sessionGoalAchieved,
  sessionGoalText,
  onPerformanceQualityChange,
  onSessionGoalChange,
  onSessionGoalTextChange,
  onContinue,
}: PerformanceQuestionPageProps) {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="text-xs font-semibold text-accent mb-1">
          FRAGE 4
        </div>

        <h2 className="text-xl font-semibold mb-1">
          Wie hat sich deine Leistungsqualität während der Einheit entwickelt?
        </h2>

        <p className="text-sm text-muted-foreground mb-4">
          Nicht wie anstrengend es war, sondern ob deine Leistung über die Session stabil blieb.
        </p>

        <Grid
          options={performanceQualityOptions}
          value={performanceQuality}
          onSelect={onPerformanceQualityChange}
        />
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="text-xs font-semibold text-accent mb-1">
          FRAGE 5
        </div>

        <h2 className="text-xl font-semibold mb-1">
          Hast du das Hauptziel der heutigen Einheit erreicht?
        </h2>

        <p className="text-sm text-muted-foreground mb-4">
          Entscheidend ist nicht nur, wie hart die Session war, sondern ob ihr Trainingsziel erreicht wurde.
        </p>

        <Grid
          options={sessionGoalOptions}
          value={sessionGoalAchieved}
          onSelect={onSessionGoalChange}
        />

        {(sessionGoalAchieved === "Teilweise" ||
          sessionGoalAchieved === "Nein") && (
          <textarea
            value={sessionGoalText}
            onChange={(e) =>
              onSessionGoalTextChange(e.target.value)
            }
            placeholder="Optional: Was hat gefehlt?"
            rows={2}
            className="w-full mt-3 rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-accent"
          />
        )}
      </section>

      <Button
        size="lg"
        className="w-full bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-white rounded-2xl min-h-[56px] font-semibold"
        disabled={
          !performanceQuality ||
          !sessionGoalAchieved
        }
        onClick={onContinue}
      >
        Weiter
      </Button>
    </div>
  );
}










