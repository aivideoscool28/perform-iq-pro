import { Button } from "@/components/ui/button";
import { Grid, RateBar } from "@/components/daily-checkin/CheckinButtons";

type BodyMindQuestionPageProps = {
  physicalFeeling: number | null;
  mentalState: string | null;
  hasPain: boolean | null;
  painArea: string | null;
  painSeverity: string | null;

  mentalOtherText: string;
  painText: string;

  onPhysicalFeelingChange: (value: number) => void;
  onMentalStateChange: (value: string) => void;
  onMentalOtherTextChange: (value: string) => void;

  onPainChange: (value: boolean) => void;
  onPainAreaChange: (value: string | null) => void;
  onPainSeverityChange: (value: string | null) => void;
  onPainTextChange: (value: string) => void;

  onContinue: () => void;
};

const mentalStates = [
  "Fokussiert & selbstbewusst",
  "Normal",
  "Abgelenkt",
  "Gestresst / unter Druck",
  "Wenig Motivation",
  "Sonstiges",
];

const painAreas = [
  "Oberschenkel vorne",
  "Oberschenkel hinten",
  "Knie",
  "Wade",
  "Achillessehne",
  "Sprunggelenk",
  "Fuß",
  "Hüfte / Leiste",
  "Rücken",
  "Sonstiges",
];

const painSeverities = [
  "Leicht",
  "Mittel",
  "Stark",
];

export function BodyMindQuestionPage({
  physicalFeeling,
  mentalState,
  hasPain,
  painArea,
  painSeverity,
  mentalOtherText,
  painText,
  onPhysicalFeelingChange,
  onMentalStateChange,
  onMentalOtherTextChange,
  onPainChange,
  onPainAreaChange,
  onPainSeverityChange,
  onPainTextChange,
  onContinue,
}: BodyMindQuestionPageProps) {
  return (
    <div className="space-y-5">

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="text-xs font-semibold text-accent mb-1">
          FRAGE 6
        </div>

        <h2 className="text-xl font-semibold mb-1">
          Wie hat sich dein Körper während des Trainings angefühlt?
        </h2>

        <p className="text-sm text-muted-foreground mb-4">
          1 = sehr schlecht · 5 = sehr gut
        </p>

        <RateBar
          max={5}
          value={physicalFeeling}
          onSelect={onPhysicalFeelingChange}
        />
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="text-xs font-semibold text-accent mb-1">
          FRAGE 7
        </div>

        <h2 className="text-xl font-semibold mb-4">
          Wie warst du mental im Training?
        </h2>

        <Grid
          options={mentalStates}
          value={mentalState}
          onSelect={onMentalStateChange}
        />

        {mentalState === "Sonstiges" && (
          <textarea
            value={mentalOtherText}
            onChange={(e) =>
              onMentalOtherTextChange(e.target.value)
            }
            placeholder="Kurz beschreiben..."
            rows={2}
            className="w-full mt-3 rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-accent"
          />
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="text-xs font-semibold text-accent mb-1">
          FRAGE 8
        </div>

        <h2 className="text-xl font-semibold mb-4">
          Schmerzen oder ungewöhnliche Beschwerden?
        </h2>

        <Grid
          options={["Nein", "Ja"]}
          value={
            hasPain === null
              ? null
              : hasPain
                ? "Ja"
                : "Nein"
          }
          onSelect={(value) => {
            const pain = value === "Ja";
            onPainChange(pain);

            if (!pain) {
              onPainAreaChange(null);
              onPainSeverityChange(null);
              onPainTextChange("");
            }
          }}
        />

        {hasPain && (
          <div className="mt-4 space-y-3">

            <div>
              <div className="text-sm font-medium mb-2">
                Wo?
              </div>

              <Grid
                options={painAreas}
                value={painArea}
                onSelect={onPainAreaChange}
              />
            </div>

            <div>
              <div className="text-sm font-medium mb-2">
                Wie stark?
              </div>

              <Grid
                options={painSeverities}
                value={painSeverity}
                onSelect={onPainSeverityChange}
              />
            </div>

            <textarea
              value={painText}
              onChange={(e) =>
                onPainTextChange(e.target.value)
              }
              placeholder="Optional genauer beschreiben..."
              rows={2}
              className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        )}
      </section>

      <Button
        size="lg"
        className="w-full bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-white rounded-2xl min-h-[56px] font-semibold"
        disabled={
          physicalFeeling === null ||
          !mentalState ||
          hasPain === null ||
          (
            hasPain &&
            (
              !painArea ||
              !painSeverity
            )
          )
        }
        onClick={onContinue}
      >
        Weiter
      </Button>

    </div>
  );
}

type ContextQuestionPageProps = {
  performanceFactors: string[];
  factorOtherText: string;
  extraText: string;
  isSaving: boolean;

  onToggleFactor: (value: string) => void;
  onFactorOtherTextChange: (value: string) => void;
  onExtraTextChange: (value: string) => void;
  onSave: () => void;
};

const performanceFactors = [
  "Nichts Besonderes",
  "Schlechter Schlaf",
  "Stress / Druck",
  "Wetter",
  "Schule / Arbeit",
  "Wettkampfnervosität",
  "Trainingsbedingungen",
  "Sonstiges",
];

export function ContextQuestionPage({
  performanceFactors: selectedFactors,
  factorOtherText,
  extraText,
  isSaving,
  onToggleFactor,
  onFactorOtherTextChange,
  onExtraTextChange,
  onSave,
}: ContextQuestionPageProps) {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="text-xs font-semibold text-accent mb-1">
          FRAGE 9
        </div>

        <h2 className="text-xl font-semibold mb-1">
          Hat heute etwas deine Leistung beeinflusst?
        </h2>

        <p className="text-sm text-muted-foreground mb-4">
          Mehrere Antworten sind möglich.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {performanceFactors.map((factor) => {
            const selected =
              selectedFactors.includes(factor);

            return (
              <button
                key={factor}
                type="button"
                onClick={() =>
                  onToggleFactor(factor)
                }
                style={{
                  backgroundColor: selected ? "#ff6b35" : "#111827",
                  color: "#ffffff",
                  borderColor: selected ? "#ff6b35" : "#374151",
                }}
                className="min-h-[52px] px-4 py-3 rounded-2xl border text-sm font-semibold transition hover:opacity-90 shadow-sm"
              >
                {factor}
              </button>
            );
          })}
        </div>

        {selectedFactors.includes("Sonstiges") && (
          <textarea
            value={factorOtherText}
            onChange={(e) =>
              onFactorOtherTextChange(e.target.value)
            }
            placeholder="Was hat deine Leistung beeinflusst?"
            rows={2}
            className="w-full mt-3 rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-accent"
          />
        )}

        <textarea
          value={extraText}
          onChange={(e) =>
            onExtraTextChange(e.target.value)
          }
          placeholder="Optional: Noch etwas Wichtiges zur Session?"
          rows={2}
          className="w-full mt-3 rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-accent"
        />
      </section>

      <Button
        size="lg"
        className="w-full bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-white rounded-2xl min-h-[56px] font-semibold"
        disabled={
          isSaving ||
          selectedFactors.length === 0
        }
        onClick={onSave}
      >
        {isSaving ? "Speichern..." : "Check-In speichern"}
      </Button>
    </div>
  );
}
