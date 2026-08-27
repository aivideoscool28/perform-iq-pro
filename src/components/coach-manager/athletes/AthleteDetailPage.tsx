import { useEffect, useState } from "react";
import {
  Link,
  useParams,
  useSearch,
} from "@tanstack/react-router";

import {
  Activity,
  ArrowLeft,
  Brain,
  CheckCircle2,
  CircleHelp,
  ClipboardCheck,
  Dumbbell,
  HeartPulse,
  MessageSquareText,
  MoonStar,
  Sparkles,
  UserRound,
  Video,
  Zap,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

import { useAthleteDetailData } from "@/hooks/coach-manager/useAthleteDetailData";
import { canCoachAccessAthlete } from "@/lib/coach-manager/coach-athlete-access";

type AthleteProfile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  age: number | null;
  disciplines: string[] | null;
  current_focus: string[] | null;
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatJsonSummary(
  value: unknown,
  fallback = "No recent analysis",
) {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === "string") {
    return value || fallback;
  }

  if (Array.isArray(value)) {
    const values = value
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (
          item &&
          typeof item === "object"
        ) {
          const object = item as Record<string, unknown>;

          const likelyText =
            object.text ??
            object.title ??
            object.label ??
            object.description ??
            object.point ??
            object.feedback;

          if (typeof likelyText === "string") {
            return likelyText;
          }
        }

        return null;
      })
      .filter(
        (item): item is string =>
          typeof item === "string" &&
          item.length > 0,
      );

    return values.length
      ? values.slice(0, 2).join(" · ")
      : fallback;
  }

  if (typeof value === "object") {
    const object =
      value as Record<string, unknown>;

    const likelyText =
      object.text ??
      object.summary ??
      object.title ??
      object.description ??
      object.feedback;

    if (typeof likelyText === "string") {
      return likelyText;
    }
  }

  return fallback;
}

function DataItem({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[8px] text-muted-foreground">
        {label}
      </span>

      <span
        className={[
          "text-right text-[9px]",
          emphasis
            ? "font-bold text-foreground"
            : "font-medium text-foreground",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

function EmptyData({
  text,
}: {
  text: string;
}) {
  return (
    <p className="text-[9px] leading-relaxed text-muted-foreground">
      {text}
    </p>
  );
}

export function AthleteDetailPage() {
  const { athleteId } = useParams({
    from: "/coach-manager/athletes/$athleteId",
  });

  const { from } = useSearch({
    from: "/coach-manager/athletes/$athleteId",
  });

  const backToTraining = from === "training";
  const backToTrainingResponse =
    from === "training-response";

  const backTarget = backToTraining
    ? "/coach-manager/training"
    : backToTrainingResponse
      ? "/coach-manager/analyses"
      : "/coach-manager/athletes";

  const backLabel = backToTraining
    ? "Back to Training"
    : backToTrainingResponse
      ? "Back to Training Response"
      : "Back to Athletes";
const [athlete, setAthlete] =
    useState<AthleteProfile | null>(null);

  const [profileLoading, setProfileLoading] =
    useState(true);

  const [profileError, setProfileError] =
    useState<string | null>(null);

  const {
    latestCheckin,
    latestWorkout,
    latestAnalysis,
    latestVideoAnalysis,
    loading: dataLoading,
    error: dataError,
    accessDenied,
  } = useAthleteDetailData(athleteId);

  useEffect(() => {
    let cancelled = false;

    async function loadAthlete() {
      setProfileLoading(true);
      setProfileError(null);

      const access =
        await canCoachAccessAthlete(athleteId);

      if (cancelled) {
        return;
      }

      if (!access.allowed) {
        setAthlete(null);
        setProfileError(
          access.error ??
            "This athlete is not linked to the current coach.",
        );
        setProfileLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, display_name, avatar_url, age, disciplines, current_focus",
        )
        .eq("id", athleteId)
        .maybeSingle();

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(
          "Could not load athlete:",
          error,
        );

        setProfileError(error.message);
        setAthlete(null);
        setProfileLoading(false);
        return;
      }

      if (!data) {
        setProfileError(
          "Athlete profile not found.",
        );
        setAthlete(null);
        setProfileLoading(false);
        return;
      }

      setAthlete(data as AthleteProfile);
      setProfileLoading(false);
    }

    void loadAthlete();

    return () => {
      cancelled = true;
    };
  }, [athleteId]);

  if (profileLoading) {
    return (
      <div className="space-y-3">
        <div className="h-6 w-32 animate-pulse rounded-lg bg-muted" />

        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="h-20 animate-pulse rounded-xl bg-muted/40" />
        </section>
      </div>
    );
  }

  if (
    profileError ||
    accessDenied ||
    !athlete
  ) {
    return (
      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <CircleHelp className="h-5 w-5 text-red-500" />

        <p className="mt-2 text-sm font-semibold">
          Could not load athlete
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {profileError ??
            dataError ??
            "Access denied."}
        </p>

        <Link
          to={from === "training-response" || from === "checkin-analysis" || from === "regeneration-analysis" || from === "session-comparison" ? "/coach-manager/analyses" : backTarget}
          search={
            from === "training-response"
              ? { tab: "training-response" }
              : from === "checkin-analysis"
                ? { tab: "checkin" }
                : from === "regeneration-analysis"
                  ? { tab: "regeneration" }
                  : from === "session-comparison"
                    ? { tab: "session-comparison" }
                    : undefined
          }
          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-orange-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>
      </section>
    );
  }

  const discipline =
    athlete.disciplines?.length
      ? athlete.disciplines.join(" / ")
      : "Discipline not set";

  const currentFocus =
    athlete.current_focus?.length
      ? athlete.current_focus.join(" / ")
      : null;

  const checkinEvidence = latestCheckin
    ? [
        latestCheckin.rpe !== null
          ? `RPE ${latestCheckin.rpe}/10`
          : null,

        latestCheckin.overall_feeling !== null
          ? `Overall feeling ${latestCheckin.overall_feeling}`
          : null,

        latestCheckin.has_pain === true
          ? `Pain reported${
              latestCheckin.pain_area
                ? `: ${latestCheckin.pain_area}`
                : ""
            }`
          : latestCheckin.has_pain === false
            ? "No pain reported"
            : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "No recent check-in";

  const regenerationEvidence =
    latestCheckin
      ? [
          latestCheckin.sleep_quality !== null
            ? `Sleep quality ${latestCheckin.sleep_quality}/5`
            : null,

          latestCheckin.sleep_hours
            ? `Sleep ${latestCheckin.sleep_hours}`
            : null,

          latestCheckin.woke_recovered
            ? `Recovered: ${latestCheckin.woke_recovered}`
            : null,
        ]
          .filter(Boolean)
          .join(" · ") ||
        "No regeneration values recorded"
      : "No recent regeneration data";

  const trainingEvidence =
    latestWorkout
      ? [
          latestWorkout.workout_type ??
            "Training session",

          latestWorkout.intensity
            ? `Intensity ${latestWorkout.intensity}`
            : null,

          latestWorkout.duration_minutes !== null
            ? `${latestWorkout.duration_minutes} min`
            : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : "No recent workout";

  const analysisEvidence =
    latestAnalysis
      ? formatJsonSummary(
          latestAnalysis.improvements,
          formatJsonSummary(
            latestAnalysis.negatives,
            "Analysis available",
          ),
        )
      : "No recent Workout Analysis";

  const videoEvidence =
    latestVideoAnalysis
      ? latestVideoAnalysis.overall_reasoning ??
        latestVideoAnalysis.overall_recommendation ??
        formatJsonSummary(
          latestVideoAnalysis.findings,
          "Video Analysis available",
        )
      : "No recent Video Analysis";

  return (
    <div className="mx-auto max-w-[1180px] space-y-3">
      <Link
        to={from === "training-response" || from === "checkin-analysis" || from === "regeneration-analysis" || from === "session-comparison" ? "/coach-manager/analyses" : backTarget}
          search={
            from === "training-response"
              ? { tab: "training-response" }
              : from === "checkin-analysis"
                ? { tab: "checkin" }
                : from === "regeneration-analysis"
                  ? { tab: "regeneration" }
                  : from === "session-comparison"
                    ? { tab: "session-comparison" }
                    : undefined
          }
        className="inline-flex items-center gap-2 text-[10px] font-semibold text-muted-foreground transition hover:text-orange-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {backLabel}
      </Link>

      {/* ATHLETE HEADER */}
      <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-orange-50 text-orange-600">
            {athlete.avatar_url ? (
              <img
                src={athlete.avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">
                {athlete.display_name}
              </h1>

              <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-bold text-slate-600">
                ASSESSMENT PENDING
              </span>
            </div>

            <p className="mt-1 text-[10px] text-muted-foreground">
              {discipline}
              {athlete.age
                ? ` · Age ${athlete.age}`
                : ""}
              {currentFocus
                ? ` · Focus: ${currentFocus}`
                : ""}
            </p>
          </div>
        </div>
      </section>

      {dataError && !accessDenied && (
        <section className="rounded-xl border border-orange-100 bg-orange-50/40 px-3 py-2">
          <p className="text-[9px] font-semibold text-orange-700">
            Some athlete data could not be loaded
          </p>

          <p className="mt-0.5 text-[8px] text-orange-700/80">
            {dataError}
          </p>
        </section>
      )}

      {/* STATUS — INTENTIONALLY NOT CALCULATED YET */}
      <section className="grid grid-cols-[0.72fr_1.28fr] gap-3">
        <article className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100">
              <ClipboardCheck className="h-4 w-4 text-slate-600" />
            </div>

            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Current Status
              </p>

              <p className="mt-0.5 text-sm font-bold">
                Assessment pending
              </p>
            </div>
          </div>

          <p className="mt-3 text-[9px] leading-relaxed text-muted-foreground">
            Real athlete data is connected.
            Needs Review, Worth Watching or On Track
            will be calculated only after we define the
            Layer 2 status rules.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-orange-50">
              <Activity className="h-4 w-4 text-orange-600" />
            </div>

            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Latest Athlete Context
              </p>

              <p className="mt-0.5 text-sm font-bold">
                {latestCheckin
                  ? formatDate(
                      latestCheckin.checkin_date,
                    )
                  : latestWorkout
                    ? formatDate(
                        latestWorkout.workout_date,
                      )
                    : "No recent athlete data"}
              </p>
            </div>
          </div>

          <p className="mt-3 text-[9px] leading-relaxed text-muted-foreground">
            {latestCheckin?.context_summary ??
              latestCheckin?.ai_summary ??
              latestWorkout?.summary ??
              "No recent context summary is available."}
          </p>
        </article>
      </section>

      {/* REAL EVIDENCE */}
      <section className="grid grid-cols-[1.18fr_0.82fr] items-start gap-3">
        <article className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-red-500" />

                <h2 className="text-sm font-bold">
                  Current Evidence
                </h2>
              </div>

              <p className="mt-1 text-[9px] text-muted-foreground">
                Real athlete information currently available
                to the coach.
              </p>
            </div>

            {dataLoading && (
              <span className="text-[8px] text-muted-foreground">
                Loading…
              </span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-3">
              <p className="text-[9px] font-bold">
                Check-In Evidence
              </p>

              <p className="mt-2 text-[9px] leading-relaxed text-muted-foreground">
                {checkinEvidence}
              </p>
            </div>

            <div className="rounded-xl border border-orange-100 bg-orange-50/30 p-3">
              <p className="text-[9px] font-bold">
                Regeneration Evidence
              </p>

              <p className="mt-2 text-[9px] leading-relaxed text-muted-foreground">
                {regenerationEvidence}
              </p>

              <p className="mt-2 text-[7px] text-muted-foreground">
                Soreness and energy are not stored
                in the current schema yet.
              </p>
            </div>

            <div className="rounded-xl border border-green-100 bg-green-50/30 p-3">
              <p className="text-[9px] font-bold">
                Training Evidence
              </p>

              <p className="mt-2 text-[9px] leading-relaxed text-muted-foreground">
                {trainingEvidence}
              </p>
            </div>

            <div className="rounded-xl border border-violet-100 bg-violet-50/30 p-3">
              <p className="text-[9px] font-bold">
                Analysis Evidence
              </p>

              <p className="mt-2 text-[9px] leading-relaxed text-muted-foreground">
                {analysisEvidence}
              </p>
            </div>
          </div>

          {latestVideoAnalysis && (
            <div className="mt-2 rounded-xl border border-border bg-slate-50/40 p-3">
              <div className="flex items-center gap-2">
                <Video className="h-3.5 w-3.5 text-slate-600" />

                <p className="text-[9px] font-bold">
                  Latest Video Analysis
                </p>
              </div>

              <p className="mt-2 text-[9px] leading-relaxed text-muted-foreground">
                {videoEvidence}
              </p>
            </div>
          )}
        </article>

        {/* COACHING CONSIDERATIONS — NOT INVENTED YET */}
        <article className="rounded-2xl border border-violet-100 bg-violet-50/20 p-4 shadow-sm">
          <div className="flex items-start gap-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-violet-100">
              <Sparkles className="h-4 w-4 text-violet-700" />
            </div>

            <div>
              <h2 className="text-sm font-bold">
                Aether Coaching Considerations
              </h2>

              <p className="mt-1 text-[9px] leading-relaxed text-muted-foreground">
                Short coaching options will appear
                after the attention-state logic is defined.
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-dashed border-violet-200 bg-white/70 p-3">
            <p className="text-[9px] font-semibold">
              No recommendation calculated yet
            </p>

            <p className="mt-1 text-[8px] leading-relaxed text-muted-foreground">
              We will not generate a coaching recommendation
              until the evidence rules are connected.
            </p>
          </div>

          <div className="mt-3 rounded-xl border border-violet-100 bg-white/70 px-3 py-2">
            <p className="text-[8px] font-medium text-violet-700">
              Suggestions only — the coach decides.
            </p>
          </div>
        </article>
      </section>

      {/* TODAY AT A GLANCE */}
      <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-sm font-bold">
            Today at a Glance
          </h2>

          <p className="mt-1 text-[9px] text-muted-foreground">
            Latest real athlete information from Supabase.
          </p>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          <article className="rounded-xl border border-blue-100 bg-blue-50/30 p-3">
            <div className="flex items-center gap-2">
              <Brain className="h-3.5 w-3.5 text-blue-600" />

              <p className="text-[9px] font-bold">
                Check-In
              </p>
            </div>

            <div className="mt-3 space-y-1.5">
              {latestCheckin ? (
                <>
                  <DataItem
                    label="Date"
                    value={formatDate(
                      latestCheckin.checkin_date,
                    )}
                  />

                  <DataItem
                    label="RPE"
                    value={
                      latestCheckin.rpe !== null
                        ? `${latestCheckin.rpe}/10`
                        : "—"
                    }
                    emphasis
                  />

                  <DataItem
                    label="Overall feeling"
                    value={
                      latestCheckin.overall_feeling !== null
                        ? String(
                            latestCheckin.overall_feeling,
                          )
                        : "—"
                    }
                  />

                  <DataItem
                    label="Pain"
                    value={
                      latestCheckin.has_pain === true
                        ? latestCheckin.pain_area ??
                          "Reported"
                        : latestCheckin.has_pain === false
                          ? "No"
                          : "—"
                    }
                  />
                </>
              ) : (
                <EmptyData text="No recent check-in." />
              )}
            </div>
          </article>

          <article className="rounded-xl border border-orange-100 bg-orange-50/30 p-3">
            <div className="flex items-center gap-2">
              <MoonStar className="h-3.5 w-3.5 text-orange-600" />

              <p className="text-[9px] font-bold">
                Regeneration
              </p>
            </div>

            <div className="mt-3 space-y-1.5">
              {latestCheckin ? (
                <>
                  <DataItem
                    label="Sleep quality"
                    value={
                      latestCheckin.sleep_quality !== null
                        ? `${latestCheckin.sleep_quality}/5`
                        : "—"
                    }
                    emphasis
                  />

                  <DataItem
                    label="Sleep"
                    value={
                      latestCheckin.sleep_hours ??
                      "—"
                    }
                  />

                  <DataItem
                    label="Woke recovered"
                    value={
                      latestCheckin.woke_recovered ??
                      "—"
                    }
                  />

                  <p className="pt-1 text-[7px] text-muted-foreground">
                    Energy + soreness fields still need
                    schema support.
                  </p>
                </>
              ) : (
                <EmptyData text="No regeneration data." />
              )}
            </div>
          </article>

          <article className="rounded-xl border border-green-100 bg-green-50/30 p-3">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-3.5 w-3.5 text-green-600" />

              <p className="text-[9px] font-bold">
                Training
              </p>
            </div>

            <div className="mt-3 space-y-1.5">
              {latestWorkout ? (
                <>
                  <DataItem
                    label="Date"
                    value={formatDate(
                      latestWorkout.workout_date,
                    )}
                  />

                  <DataItem
                    label="Type"
                    value={
                      latestWorkout.workout_type ??
                      "Training"
                    }
                    emphasis
                  />

                  <DataItem
                    label="Duration"
                    value={
                      latestWorkout.duration_minutes !== null
                        ? `${latestWorkout.duration_minutes} min`
                        : "—"
                    }
                  />

                  <DataItem
                    label="Intensity"
                    value={
                      latestWorkout.intensity ??
                      "—"
                    }
                  />
                </>
              ) : (
                <EmptyData text="No recent workout." />
              )}
            </div>
          </article>

          <article className="rounded-xl border border-violet-100 bg-violet-50/30 p-3">
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-violet-600" />

              <p className="text-[9px] font-bold">
                Workout Analysis
              </p>
            </div>

            <div className="mt-3 space-y-2">
              {latestAnalysis ? (
                <>
                  <div>
                    <p className="text-[7px] text-muted-foreground">
                      Improvement
                    </p>

                    <p className="mt-1 text-[8px] font-medium leading-relaxed">
                      {formatJsonSummary(
                        latestAnalysis.improvements,
                        "No improvement recorded",
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-[7px] text-muted-foreground">
                      Attention
                    </p>

                    <p className="mt-1 text-[8px] font-medium leading-relaxed">
                      {formatJsonSummary(
                        latestAnalysis.negatives,
                        "No negative finding recorded",
                      )}
                    </p>
                  </div>

                  <p className="text-[7px] text-muted-foreground">
                    {latestAnalysis.is_ai_generated
                      ? "AI-generated analysis"
                      : "Coach/manual analysis"}
                  </p>
                </>
              ) : (
                <EmptyData text="No recent Workout Analysis." />
              )}
            </div>
          </article>
        </div>
      </section>

      {/* VALIDATION + HISTORY */}
      <section className="grid grid-cols-[0.95fr_1.05fr] gap-3">
        <article className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-violet-600" />

            <div>
              <h2 className="text-sm font-bold">
                Coach Validation
              </h2>

              <p className="mt-0.5 text-[9px] text-muted-foreground">
                Validation activates after Aether
                creates an attention assessment.
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              "Correct",
              "Partly Correct",
              "Incorrect",
            ].map((label) => (
              <button
                key={label}
                type="button"
                disabled
                className="rounded-xl border border-border bg-slate-50 px-2 py-2 text-[8px] font-semibold text-muted-foreground opacity-60"
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled
            className="mt-3 w-full rounded-xl bg-slate-200 px-3 py-2 text-[9px] font-semibold text-slate-500"
          >
            Mark as Reviewed
          </button>
        </article>

        <article className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />

            <div>
              <h2 className="text-sm font-bold">
                Recent Assessments
              </h2>

              <p className="mt-0.5 text-[9px] text-muted-foreground">
                Reviewed attention signals will remain
                visible here.
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-dashed border-border bg-slate-50/40 px-3 py-3">
            <p className="text-[9px] font-semibold">
              No reviewed assessments yet
            </p>

            <p className="mt-1 text-[8px] text-muted-foreground">
              Assessment history persistence is the next
              validation step.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}





