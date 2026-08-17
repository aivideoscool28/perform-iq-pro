import { Button } from "@/components/ui/button";
import { Grid, RateBar } from "@/components/daily-checkin/CheckinButtons";

type TrainingQuestionPageProps = {
  discipline: string | null;
  workoutType: string | null;
  rpe: number | null;
  expectedDifficulty: string | null;

  sessionText: string;
  performanceText: string;

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
  "Ruhetag",
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
  discipline,
  workoutType,
  rpe,
  expectedDifficulty,
  sessionText,
  performanceText,
  onDisciplineChange,
  onWorkoutTypeChange,
  onRpeChange,
  onExpectedDifficultyChange,
  onSessionTextChange,
  onPerformanceTextChange,
  onContinue,
}: TrainingQuestionPageProps) {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="text-xs font-semibold text-accent mb-1">
          FRAGE 1
        </div>

        <h2 className="text-xl font-semibold">
          Was hast du heute trainiert?
        </h2>

        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Damit Athletic IQ ähnliche Sessions später vergleichen kann.
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

        {discipline && discipline !== "Ruhetag" && (
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
          !discipline ||
          !workoutType ||
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
