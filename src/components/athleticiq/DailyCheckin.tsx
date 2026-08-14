import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { saveDailyCheckin } from "@/lib/athletic.functions";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { createPortal } from "react-dom";

interface Props {
  name: string;
  onClose: () => void;
}

type Answers = {
  discipline: string | null;
  is_rest_day: boolean;

  // New Athletic IQ Daily Check-In fields
  workout_type: string | null;
  session_details: string | null;
  performance_results: Record<string, unknown> | null;
  rpe: number | null;

  // Adds context to RPE:
  // Was today's difficulty actually expected?
  expected_difficulty: string | null;

  // Describes whether performance quality held up across the session.
  performance_quality: string | null;

  physical_feeling: number | null;
  mental_state: string | null;
  has_pain: boolean | null;
  pain_note: string | null;
  pain_area: string | null;
  pain_severity: string | null;
  performance_factors: string[];

  // Did the athlete achieve the main purpose of today's workout?
  session_goal_achieved: string | null;

  // Optional explanation when the goal was only partly or not achieved.
  session_goal_note: string | null;

  extra_note: string | null;

  // Temporary legacy fields.
  // Keep these until the old UI/save logic has been fully replaced.
  duration_min: number | null;
  satisfaction: number | null;
  last_meal_before: string | null;
  ate_around_training: string | null;
  food_note: string | null;
  water_intake: string | null;
  sleep_hours: string | null;
  sleep_quality: number | null;
  woke_recovered: string | null;
  overall_feeling: number | null;
};

const empty: Answers = {
  discipline: null,
  is_rest_day: false,

  workout_type: null,
  session_details: null,
  performance_results: null,
  rpe: null,
  expected_difficulty: null,
  performance_quality: null,
  physical_feeling: null,
  mental_state: null,
  has_pain: null,
  pain_note: null,
  pain_area: null,
  pain_severity: null,
  performance_factors: [],
  session_goal_achieved: null,
  session_goal_note: null,
  extra_note: null,

  // Legacy values kept temporarily during migration.
  duration_min: null,
  satisfaction: null,
  last_meal_before: null,
  ate_around_training: null,
  food_note: null,
  water_intake: null,
  sleep_hours: null,
  sleep_quality: null,
  woke_recovered: null,
  overall_feeling: null,
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

// Adds context to RPE.
// RPE 10 + "Wie erwartet" means something very different from
// RPE 10 + "Deutlich schwerer als erwartet".
const expectedDifficultyOptions = [
  "Leichter als erwartet",
  "Wie erwartet",
  "Schwerer als erwartet",
  "Deutlich schwerer als erwartet",
];

// Describes the direction of performance quality DURING the session.
// This helps distinguish hard-but-stable training from quality breakdown.
const performanceQualityOptions = [
  "Besser geworden",
  "Stabil geblieben",
  "Etwas abgefallen",
  "Stark abgefallen",
  "Kann ich nicht beurteilen",
];

// Determines whether the main purpose of the workout was achieved.
const sessionGoalOptions = [
  "Ja",
  "Teilweise",
  "Nein",
  "Weiß ich nicht",
];

export function DailyCheckin({ name, onClose }: Props) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const saveFn = useServerFn(saveDailyCheckin);

  /*
  ==========================================================================
                         DAILY CHECK-IN PORTAL
  ==========================================================================

  The Daily Check-In is a full-screen modal.

  createPortal() renders it directly inside document.body instead of inside
  the Dashboard component tree. This prevents Dashboard stacking contexts
  from appearing above or through the Daily Check-In.

  Background scrolling is also disabled while the Check-In is open.
  ==========================================================================
  */
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Daily Check-In navigation:
  // 1 = Training
  // 2 = Leistung
  // 3 = K?rper & Kopf
  // 4 = Kontext
  // 5 = saved confirmation screen
  const [page, setPage] = useState(1);

  const [a, setA] = useState<Answers>(empty);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  // Free-text fields that only appear when useful.
  const [sessionText, setSessionText] = useState("");
  const [performanceText, setPerformanceText] = useState("");
  const [painText, setPainText] = useState("");
  const [mentalOtherText, setMentalOtherText] = useState("");
  const [factorOtherText, setFactorOtherText] = useState("");
  const [extraText, setExtraText] = useState("");

  // Only used when the athlete says the session goal was
  // partly achieved or not achieved.
  const [sessionGoalText, setSessionGoalText] = useState("");

  const mutate = useMutation({
    mutationFn: async (payload: Answers) =>
      saveFn({ data: payload }),

    onSuccess: (res) => {
      setAiSummary(
        (res as { checkin: { ai_summary: string | null } })
          .checkin.ai_summary ?? null,
      );

      qc.invalidateQueries({
        queryKey: ["today-checkin"],
      });

      qc.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },

    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  function update<K extends keyof Answers>(
    key: K,
    value: Answers[K],
  ) {
    setA((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function togglePerformanceFactor(value: string) {
    setA((current) => {
      // "Nichts Besonderes" should stand alone.
      if (value === "Nichts Besonderes") {
        return {
          ...current,
          performance_factors: ["Nichts Besonderes"],
        };
      }

      const withoutNothing =
        current.performance_factors.filter(
          (item) => item !== "Nichts Besonderes",
        );

      const alreadySelected =
        withoutNothing.includes(value);

      return {
        ...current,
        performance_factors: alreadySelected
          ? withoutNothing.filter(
              (item) => item !== value,
            )
          : [...withoutNothing, value],
      };
    });
  }

  async function finishCheckin() {
    const payload: Answers = {
      ...a,

      session_details:
        sessionText.trim() || null,

      performance_results:
        performanceText.trim()
          ? {
              raw: performanceText.trim(),
            }
          : null,

      pain_note:
        painText.trim() || null,

      session_goal_note:
        sessionGoalText.trim() || null,

      extra_note: [
        mentalOtherText.trim()
          ? `Mental: ${mentalOtherText.trim()}`
          : null,

        factorOtherText.trim()
          ? `Einflussfaktor: ${factorOtherText.trim()}`
          : null,

        extraText.trim() || null,
      ]
        .filter(Boolean)
        .join("\n") || null,
    };

    setA(payload);

    await mutate.mutateAsync(payload);

    setPage(5);
  }

  async function saveRestDay() {
    const payload: Answers = {
      ...empty,
      discipline: "Ruhetag",
      is_rest_day: true,
    };

    setA(payload);

    await mutate.mutateAsync(payload);

    setPage(5);
  }

  const pageTitle =
    page === 1
      ? "Training"
      : page === 2
        ? "Leistung"
        : page === 3
          ? "K?rper & Kopf"
          : page === 4
            ? "Wichtiger Kontext"
            : "";

  const progress =
    page >= 1 && page <= 4
      ? (page / 4) * 100
      : 0;

  // document.body only exists after mounting in the browser.
  if (!mounted) {
    return null;
  }

  return createPortal(
    (
    <div
      className="fixed inset-0 z-[9999] bg-white text-slate-950 flex flex-col overflow-hidden overscroll-none"
      style={{ isolation: "isolate" }}
    >

      {/* HEADER */}
      <div className="border-b border-border bg-card/70 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto w-full px-5 py-4 flex items-center gap-4">

          {page >= 1 && page <= 4 ? (
            <button
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1)
                )
              }
              className="p-2 rounded-xl hover:bg-muted transition"
              aria-label="Zurück"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="w-9" />
          )}

          <div className="flex-1">
            {page >= 1 && page <= 4 && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">
                    {pageTitle}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {page} / 4
                  </span>
                </div>

                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted transition"
            aria-label="Schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* BODY */}
      <div
        className="flex-1 max-w-3xl w-full mx-auto px-5 py-6 flex flex-col overflow-y-auto overscroll-contain bg-white"
        style={{ WebkitOverflowScrolling: "touch" }}
      >

        {/* GREETING */}
        {page === 0 && (
          <div className="flex-1 flex flex-col justify-center">
            <div className="rounded-3xl border border-border bg-card p-7 shadow-sm">

              <div className="text-sm font-medium text-accent mb-2">
                Athletic IQ Daily Check-In
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                Hey {name} 👋
              </h1>

              <p className="text-muted-foreground mt-3 mb-7">
                Vier kurze Bereiche. Ziel: unter einer Minute.
              </p>

              <Button
                size="lg"
                className="w-full bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-white rounded-2xl font-semibold"
                onClick={() => setPage(1)}
              >
                Check-In starten
              </Button>
            </div>
          </div>
        )}

        {/* =========================================================
            PAGE 1 — TRAINING
        ========================================================== */}
        {page === 1 && (
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
                  value={a.discipline}
                  onSelect={async (value) => {
                    if (value === "Ruhetag") {
                      await saveRestDay();
                      return;
                    }

                    update("discipline", value);
                    update("is_rest_day", false);
                  }}
                />
              </div>

              {a.discipline &&
                a.discipline !== "Ruhetag" && (
                  <>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">
                        Trainingsart
                      </div>

                      <Grid
                        options={
                          a.discipline === "Hürden"
                            ? hurdleWorkoutTypes
                            : sprintWorkoutTypes
                        }
                        value={a.workout_type}
                        onSelect={(value) =>
                          update(
                            "workout_type",
                            value,
                          )
                        }
                      />
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <textarea
                        value={sessionText}
                        onChange={(e) =>
                          setSessionText(
                            e.target.value,
                          )
                        }
                        placeholder="Session, z. B. 4 × 30 m + 3 × 60 m"
                        rows={3}
                        className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-accent"
                      />

                      <textarea
                        value={performanceText}
                        onChange={(e) =>
                          setPerformanceText(
                            e.target.value,
                          )
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
                value={a.rpe}
                onSelect={(value) =>
                  update("rpe", value)
                }
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
                value={a.expected_difficulty}
                onSelect={(value) =>
                  update("expected_difficulty", value)
                }
              />
            </section>

            

            <Button
              size="lg"
              className="w-full bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-white rounded-2xl min-h-[56px] font-semibold"
              disabled={
                !a.discipline ||
                !a.workout_type ||
                a.rpe === null ||
                !a.expected_difficulty
              }
              onClick={() => setPage(2)}
            >
              Weiter
            </Button>
          </div>
        )}

        {/* =========================================================
            PAGE 2 ? LEISTUNG
        ========================================================== */}
        {page === 2 && (
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
                value={a.performance_quality}
                onSelect={(value) =>
                  update("performance_quality", value)
                }
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
                value={a.session_goal_achieved}
                onSelect={(value) => {
                  update("session_goal_achieved", value);

                  if (value === "Ja" || value === "Weiß ich nicht") {
                    setSessionGoalText("");
                  }
                }}
              />

              {(a.session_goal_achieved === "Teilweise" ||
                a.session_goal_achieved === "Nein") && (
                <textarea
                  value={sessionGoalText}
                  onChange={(e) =>
                    setSessionGoalText(e.target.value)
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
                !a.performance_quality ||
                !a.session_goal_achieved
              }
              onClick={() => setPage(3)}
            >
              Weiter
            </Button>
          </div>
        )}

        {/* =========================================================
            PAGE 3 — BODY & MIND
        ========================================================== */}
        {page === 3 && (
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
                value={a.physical_feeling}
                onSelect={(value) =>
                  update(
                    "physical_feeling",
                    value,
                  )
                }
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
                value={a.mental_state}
                onSelect={(value) =>
                  update(
                    "mental_state",
                    value,
                  )
                }
              />

              {a.mental_state ===
                "Sonstiges" && (
                <textarea
                  value={mentalOtherText}
                  onChange={(e) =>
                    setMentalOtherText(
                      e.target.value,
                    )
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
                  a.has_pain === null
                    ? null
                    : a.has_pain
                      ? "Ja"
                      : "Nein"
                }
                onSelect={(value) => {
                  const hasPain =
                    value === "Ja";

                  update(
                    "has_pain",
                    hasPain,
                  );

                  if (!hasPain) {
                    update(
                      "pain_area",
                      null,
                    );

                    update(
                      "pain_severity",
                      null,
                    );

                    setPainText("");
                  }
                }}
              />

              {a.has_pain && (
                <div className="mt-4 space-y-3">

                  <div>
                    <div className="text-sm font-medium mb-2">
                      Wo?
                    </div>

                    <Grid
                      options={painAreas}
                      value={a.pain_area}
                      onSelect={(value) =>
                        update(
                          "pain_area",
                          value,
                        )
                      }
                    />
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">
                      Wie stark?
                    </div>

                    <Grid
                      options={painSeverities}
                      value={a.pain_severity}
                      onSelect={(value) =>
                        update(
                          "pain_severity",
                          value,
                        )
                      }
                    />
                  </div>

                  <textarea
                    value={painText}
                    onChange={(e) =>
                      setPainText(
                        e.target.value,
                      )
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
                a.physical_feeling === null ||
                !a.mental_state ||
                a.has_pain === null ||
                (
                  a.has_pain &&
                  (
                    !a.pain_area ||
                    !a.pain_severity
                  )
                )
              }
              onClick={() => setPage(4)}
            >
              Weiter
            </Button>
          </div>
        )}

        {/* =========================================================
            PAGE 4 — CONTEXT
        ========================================================== */}
        {page === 4 && (
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
                {performanceFactors.map(
                  (factor) => {
                    const selected =
                      a.performance_factors.includes(
                        factor,
                      );

                    return (
                      <button
                        key={factor}
                        type="button"
                        onClick={() =>
                          togglePerformanceFactor(
                            factor,
                          )
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
                  },
                )}
              </div>

              {a.performance_factors.includes(
                "Sonstiges",
              ) && (
                <textarea
                  value={factorOtherText}
                  onChange={(e) =>
                    setFactorOtherText(
                      e.target.value,
                    )
                  }
                  placeholder="Was hat deine Leistung beeinflusst?"
                  rows={2}
                  className="w-full mt-3 rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-accent"
                />
              )}

              <textarea
                value={extraText}
                onChange={(e) =>
                  setExtraText(
                    e.target.value,
                  )
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
                mutate.isPending ||
                a.performance_factors.length === 0
              }
              onClick={finishCheckin}
            >
              {mutate.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Speichern...
                </>
              ) : (
                "Check-In speichern"
              )}
            </Button>
          </div>
        )}

        {/* SUMMARY */}
        {page === 5 && (
          <div className="flex-1 flex flex-col justify-center">
            <div className="rounded-3xl border border-border bg-card p-7 text-center">

              <div className="mx-auto w-16 h-16 rounded-full bg-accent/15 grid place-items-center mb-5">
                <Check className="h-8 w-8 text-accent" />
              </div>

              <h2 className="text-2xl font-bold">
                Check-In gespeichert
              </h2>

              <p className="text-muted-foreground mt-3 mb-7 max-w-md mx-auto">
                {aiSummary ??
                  "Deine Session wurde gespeichert."}
              </p>

              <Button
                size="lg"
                className="w-full bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-white rounded-2xl font-semibold"
                onClick={() => {
                  onClose();

                  navigate({
                    to: "/workout-analysis",
                  });
                }}
              >
                Workout-Analyse ansehen
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
    ),
    document.body,
  );
}

function Step({ question, sub, children }: { question: string; sub?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2 leading-tight">{question}</h2>
      {sub && <p className="text-white/60 mb-6">{sub}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Grid({
  options,
  value,
  onSelect,
}: {
  options: string[];
  value: string | null;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {options.map((opt) => {
        const selected = value === opt;

        return (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            style={{
              backgroundColor: selected ? "#ff6b35" : "#111827",
              color: "#ffffff",
              borderColor: selected ? "#ff6b35" : "#374151",
            }}
            className="min-h-[52px] px-4 py-3 rounded-2xl border text-sm font-semibold transition hover:opacity-90 shadow-sm"
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function RateBar({
  max,
  value,
  onSelect,
}: {
  max: number;
  value: number | null;
  onSelect: (v: number) => void;
}) {
  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplateColumns: `repeat(${max}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
        const selected = value === n;

        return (
          <button
            key={n}
            type="button"
            onClick={() => onSelect(n)}
            style={{
              backgroundColor: selected ? "#ff6b35" : "#111827",
              color: "#ffffff",
              borderColor: selected ? "#ff6b35" : "#374151",
            }}
            className="min-h-[48px] rounded-2xl border font-semibold transition hover:opacity-90 shadow-sm"
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

function EmojiRate({ options, value, onSelect }: { options: string[]; value: number | null; onSelect: (v: number) => void }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {options.map((emo, i) => (
        <button key={emo} onClick={() => onSelect(i + 1)}
          className={`aspect-square rounded-xl border text-3xl transition ${
            value === i + 1
              ? "bg-accent/20 border-accent"
              : "bg-white/5 border-white/10 hover:bg-white/10"
          }`}>
          {emo}
        </button>
      ))}
    </div>
  );
}