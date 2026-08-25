import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "@tanstack/react-router";

import {
  Activity,
  ArrowLeft,
  Brain,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Dumbbell,
  HeartPulse,
  MessageSquareText,
  MoonStar,
  Sparkles,
  UserRound,
  Zap,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

type AthleteProfile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  age: number | null;
  disciplines: string[] | null;
  current_focus: string[] | null;
};

function SectionPlaceholder({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-slate-50/40 px-3 py-3">
      <p className="text-[10px] font-semibold text-foreground">
        {title}
      </p>

      <p className="mt-1 text-[9px] leading-relaxed text-muted-foreground">
        {detail}
      </p>
    </div>
  );
}

export function AthleteDetailPage() {
  const { athleteId } = useParams({
    from: "/coach-manager/athletes/$athleteId",
  });

  const [athlete, setAthlete] =
    useState<AthleteProfile | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadAthlete() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, display_name, avatar_url, age, disciplines, current_focus",
        )
        .eq("id", athleteId)
        .maybeSingle();

      if (error) {
        console.error(
          "Could not load athlete:",
          error,
        );

        setError(error.message);
        setAthlete(null);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Athlete profile not found.");
        setAthlete(null);
        setLoading(false);
        return;
      }

      setAthlete(data as AthleteProfile);
      setLoading(false);
    }

    void loadAthlete();
  }, [athleteId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-6 w-32 animate-pulse rounded-lg bg-muted" />

        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="h-20 animate-pulse rounded-xl bg-muted/40" />
        </section>
      </div>
    );
  }

  if (error || !athlete) {
    return (
      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <CircleHelp className="h-5 w-5 text-red-500" />

        <p className="mt-2 text-sm font-semibold">
          Could not load athlete
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {error ?? "Unknown error"}
        </p>

        <Link
          to="/coach-manager/athletes"
          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-orange-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to athletes
        </Link>
      </section>
    );
  }

  const discipline =
    athlete.disciplines?.length
      ? athlete.disciplines.join(" / ")
      : "Discipline not set";

  return (
    <div className="mx-auto max-w-[1180px] space-y-3">
      {/* BACK */}
      <Link
        to="/coach-manager/athletes"
        className="inline-flex items-center gap-2 text-[10px] font-semibold text-muted-foreground transition hover:text-orange-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Athletes
      </Link>

      {/* ATHLETE HEADER */}
      <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
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
                {athlete.current_focus?.length
                  ? ` · Focus: ${athlete.current_focus.join(" / ")}`
                  : ""}
              </p>
            </div>
          </div>


        </div>
      </section>

      {/* CURRENT STATUS */}
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
                Waiting for athlete data
              </p>
            </div>
          </div>

          <p className="mt-3 text-[9px] leading-relaxed text-muted-foreground">
            Aether will assign Needs Review, Watch or On Track
            after the athlete intelligence rules are connected.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-orange-50">
              <Activity className="h-4 w-4 text-orange-600" />
            </div>

            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Primary Reason
              </p>

              <p className="mt-0.5 text-sm font-bold">
                No assessment calculated yet
              </p>
            </div>
          </div>

          <p className="mt-3 text-[9px] leading-relaxed text-muted-foreground">
            This will be derived from check-ins, regeneration,
            training and analyses instead of being hardcoded.
          </p>
        </article>
      </section>

      {/* WHY + CONSIDERATIONS */}
      <section className="grid grid-cols-[1.18fr_0.82fr] items-start gap-3">
        <article className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-red-500" />

                <h2 className="text-sm font-bold">
                  Why this needs attention
                </h2>
              </div>

              <p className="mt-1 text-[9px] text-muted-foreground">
                Only the evidence that explains the current athlete
                status should appear here.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-semibold text-slate-500">
              Data connection next
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <SectionPlaceholder
              title="Check-In evidence"
              detail="RPE, overall feeling, pain and athlete-reported session response."
            />

            <SectionPlaceholder
              title="Regeneration evidence"
              detail="Sleep, soreness and energy values will be shown when connected."
            />

            <SectionPlaceholder
              title="Training evidence"
              detail="Recent training load and comparable-session context."
            />

            <SectionPlaceholder
              title="Analysis evidence"
              detail="Relevant Workout Analysis or Video Analysis evidence."
            />
          </div>

          <button
            type="button"
            disabled
            className="mt-3 inline-flex items-center gap-1 text-[9px] font-semibold text-muted-foreground"
          >
            View full evidence
            <ChevronRight className="h-3 w-3" />
          </button>
        </article>

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
                Short options for the coach — never automatic decisions.
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <SectionPlaceholder
              title="No recommendation yet"
              detail="Recommendations appear only after evidence and status logic are connected."
            />
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
            One compact view of the athlete information that matters today.
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

            <p className="mt-3 text-[9px] text-muted-foreground">
              Latest check-in connects next.
            </p>
          </article>

          <article className="rounded-xl border border-orange-100 bg-orange-50/30 p-3">
            <div className="flex items-center gap-2">
              <MoonStar className="h-3.5 w-3.5 text-orange-600" />
              <p className="text-[9px] font-bold">
                Regeneration
              </p>
            </div>

            <p className="mt-3 text-[9px] text-muted-foreground">
              Sleep, soreness and energy.
            </p>
          </article>

          <article className="rounded-xl border border-green-100 bg-green-50/30 p-3">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-3.5 w-3.5 text-green-600" />
              <p className="text-[9px] font-bold">
                Training
              </p>
            </div>

            <p className="mt-3 text-[9px] text-muted-foreground">
              Latest session connects next.
            </p>
          </article>

          <article className="rounded-xl border border-violet-100 bg-violet-50/30 p-3">
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-violet-600" />
              <p className="text-[9px] font-bold">
                Workout Analysis
              </p>
            </div>

            <p className="mt-3 text-[9px] text-muted-foreground">
              Latest analysis evidence connects next.
            </p>
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
                Validate Aether's assessment after an assessment exists.
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
                Previous reviewed signals will remain visible here.
              </p>
            </div>
          </div>

          <div className="mt-3">
            <SectionPlaceholder
              title="No reviewed assessments yet"
              detail="Reviewed signals will be stored instead of disappearing permanently."
            />
          </div>
        </article>
      </section>
    </div>
  );
}



