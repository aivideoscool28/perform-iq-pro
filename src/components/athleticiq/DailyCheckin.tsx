import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { saveDailyCheckin } from "@/lib/athletic.functions";
import { X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import { TrainingQuestionPage, PerformanceQuestionPage } from "@/components/daily-checkin/Checkin12Training";
import { BodyMindQuestionPage, ContextQuestionPage } from "@/components/daily-checkin/Checkin34BodyContext";
import { CheckinSuccess } from "@/components/daily-checkin/CheckinSuccess";

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
        {/* PAGE 1 — TRAINING */}
        {page === 1 && (
          <TrainingQuestionPage
            discipline={a.discipline}
            workoutType={a.workout_type}
            rpe={a.rpe}
            expectedDifficulty={a.expected_difficulty}
            sessionText={sessionText}
            performanceText={performanceText}
            onDisciplineChange={async (value) => {
              if (value === "Ruhetag") {
                await saveRestDay();
                return;
              }
              update("discipline", value);
              update("is_rest_day", false);
            }}
            onWorkoutTypeChange={(value) => update("workout_type", value)}
            onRpeChange={(value) => update("rpe", value)}
            onExpectedDifficultyChange={(value) => update("expected_difficulty", value)}
            onSessionTextChange={setSessionText}
            onPerformanceTextChange={setPerformanceText}
            onContinue={() => setPage(2)}
          />
        )}
        {/* PAGE 2 — LEISTUNG */}
        {page === 2 && (
          <PerformanceQuestionPage
            performanceQuality={a.performance_quality}
            sessionGoalAchieved={a.session_goal_achieved}
            sessionGoalText={sessionGoalText}
            onPerformanceQualityChange={(value) => update("performance_quality", value)}
            onSessionGoalChange={(value) => {
              update("session_goal_achieved", value);
              if (value === "Ja" || value === "Weiß ich nicht") {
                setSessionGoalText("");
              }
            }}
            onSessionGoalTextChange={setSessionGoalText}
            onContinue={() => setPage(3)}
          />
        )}
        {/* PAGE 3 — BODY & MIND */}
        {page === 3 && (
          <BodyMindQuestionPage
            physicalFeeling={a.physical_feeling}
            mentalState={a.mental_state}
            hasPain={a.has_pain}
            painArea={a.pain_area}
            painSeverity={a.pain_severity}
            mentalOtherText={mentalOtherText}
            painText={painText}
            onPhysicalFeelingChange={(value) => update("physical_feeling", value)}
            onMentalStateChange={(value) => update("mental_state", value)}
            onMentalOtherTextChange={setMentalOtherText}
            onPainChange={(value) => update("has_pain", value)}
            onPainAreaChange={(value) => update("pain_area", value)}
            onPainSeverityChange={(value) => update("pain_severity", value)}
            onPainTextChange={setPainText}
            onContinue={() => setPage(4)}
          />
        )}
        {/* PAGE 4 — CONTEXT */}
        {page === 4 && (
          <ContextQuestionPage
            performanceFactors={a.performance_factors}
            factorOtherText={factorOtherText}
            extraText={extraText}
            isSaving={mutate.isPending}
            onToggleFactor={togglePerformanceFactor}
            onFactorOtherTextChange={setFactorOtherText}
            onExtraTextChange={setExtraText}
            onSave={finishCheckin}
          />
        )}
        {/* SUMMARY */}
        {page === 5 && (
          <CheckinSuccess
            aiSummary={aiSummary}
            onViewWorkoutAnalysis={() => {
              onClose();
              navigate({ to: "/workout-analysis" });
            }}
          />
        )}

      </div>
    </div>
    ),
    document.body,
  );
}



