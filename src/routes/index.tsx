import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/athleticiq/AppShell";
import { Sparkline } from "@/components/athleticiq/Sparkline";
import { StreakCard } from "@/components/athleticiq/StreakCard";
import { AthleteQuoteCard } from "@/components/athleticiq/AthleteQuoteCard";
import { TodaysTrainingCard } from "@/components/dashboard/TodaysTrainingCard";
import { fetchDashboard, fetchTodayCheckin, deleteTodayCheckin } from "@/lib/athletic.functions";
import { DailyCheckin } from "@/components/athleticiq/DailyCheckin";
import { FeatureTour } from "@/components/athleticiq/FeatureTour";
import { isTourPending, clearTourPending } from "@/lib/tour";
import { useAuth } from "@/hooks/use-auth";
import { consumeJustLoggedIn } from "@/lib/auth-session";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Loader2, CheckCircle2, Sparkles, RotateCcw, Dumbbell, TrendingUp, Activity, Flame,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Athleticiq — KI-Performance OS für Leichtathleten" },
      { name: "description", content: "KI-gestützte High-Performance App: Streak, Workout-Chat, Analyse." },
    ],
  }),
  component: Dashboard,
});

/** Count non-rest check-ins within the current calendar week (Mon–Sun). */
function trainingsThisWeek(checkins: Array<{ checkin_date: string; is_rest_day?: boolean | null }>): number {
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - day);
  return checkins.filter((c) => {
    if (c.is_rest_day) return false;
    const d = new Date(c.checkin_date);
    return d >= monday;
  }).length;
}

function Dashboard() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const fetchFn = useServerFn(fetchDashboard);
  const fetchCheckin = useServerFn(fetchTodayCheckin);
  const resetCheckinFn = useServerFn(deleteTodayCheckin);
  const qc = useQueryClient();
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchFn(),
    enabled: !!session,
  });

  const { data: checkinData } = useQuery({
    queryKey: ["today-checkin"],
    queryFn: () => fetchCheckin(),
    enabled: !!session,
  });
  const doneToday = !!checkinData?.checkin;

  const resetCheckin = useMutation({
    mutationFn: () => resetCheckinFn(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["today-checkin"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  useEffect(() => {
    if (data?.profile && !(data.profile as { onboarded_at?: string | null }).onboarded_at) {
      navigate({ to: "/onboarding" });
    }
  }, [data, navigate]);

  // Greet the user once per login: new users get onboarding, returning users a welcome back.
  const [greeted, setGreeted] = useState(false);
  useEffect(() => {
    if (greeted || !data?.profile) return;
    if (!consumeJustLoggedIn()) {
      setGreeted(true);
      return;
    }
    setGreeted(true);
    const p = data.profile as { onboarded_at?: string | null; display_name?: string | null };
    if (p.onboarded_at) {
      toast.success(`Willkommen zurück, ${p.display_name ?? "Athlet"}! 👋`, {
        description: "Schön, dass du wieder da bist – setze deinen Streak fort.",
      });
    } else {
      toast.success("Willkommen bei Athleticiq!", {
        description: "Lass uns kurz dein Athletenprofil einrichten.",
      });
    }
  }, [data, greeted]);

  // Trigger the first-run feature tour after onboarding or a dev reset.
  useEffect(() => {
    if (!loading && session && isTourPending()) setShowTour(true);
  }, [loading, session]);

  const closeTour = () => {
    clearTourPending();
    setShowTour(false);
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-foreground" />
      </div>
    );
  }

  const profile = data?.profile;
  const checkins = data?.checkins ?? [];
  const currentStreak = data?.computedStreak ?? 0;
  const name = profile?.display_name ?? "Athlet";
  const today = new Date().toLocaleDateString("de", { weekday: "long", day: "2-digit", month: "long" });
  const weeklyGoal = (profile as { training_days_per_week?: number | null } | undefined)?.training_days_per_week ?? 4;
  const trainings = trainingsThisWeek(checkins as Array<{ checkin_date: string; is_rest_day?: boolean | null }>);

  // Latest useful Athletic IQ insight.
  // Prefer a real takeaway from the latest saved Workout Analysis.
  const latestBoard = data?.boards?.[0] as
    | {
        positives?: string[] | null;
        negatives?: string[] | null;
        improvements?: string[] | null;
        created_at?: string | null;
      }
    | undefined;

  const latestCheckin = checkins[0] as
    | {
        checkin_date: string;
        is_rest_day?: boolean | null;
        discipline?: string | null;
        ai_summary?: string | null;
      }
    | undefined;

  const latestImprovement =
    latestBoard?.improvements?.find((item) => item?.trim())?.trim() ?? null;

  const latestObservation =
    latestBoard?.negatives?.find((item) => item?.trim())?.trim() ?? null;

  const latestPositive =
    latestBoard?.positives?.find((item) => item?.trim())?.trim() ?? null;

  const latestInsight =
    latestImprovement ||
    latestObservation ||
    latestPositive ||
    latestCheckin?.ai_summary?.trim() ||
    null;

  const latestInsightType =
    latestImprovement
      ? "NÄCHSTER FOKUS"
      : latestObservation
        ? "BEOBACHTUNG"
        : latestPositive
          ? "STÄRKE"
          : latestInsight
            ? "CHECK-IN"
            : "ATHLETIC IQ";

  const latestInsightDiscipline =
    latestCheckin?.discipline?.trim() ||
    (profile?.disciplines?.[0] ?? null);

  return (
    <AppShell title={`Hallo ${name}`} subtitle={today}>
      {isLoading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-foreground" />
        </div>
      ) : (
        <>
          <TodaysTrainingCard />

          {/* CHECK-IN + MOTIVATION */}
          <section className="mb-6 grid gap-6 lg:grid-cols-2">

            {/* DAILY CHECK-IN */}
            {!doneToday ? (

              <button
                data-tour="checkin"
                onClick={() => setCheckinOpen(true)}
                className="
                  group relative min-h-[155px] overflow-hidden
                  rounded-2xl border border-accent/20
                  bg-gradient-to-br from-accent/10 via-card to-accent/5
                  p-6 text-left shadow-sm
                  transition-all duration-200
                  hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md
                "
              >

                <div className="
                  pointer-events-none absolute
                  -left-12 -top-16 h-40 w-40
                  rounded-full bg-accent/15 blur-3xl
                " />

                <div className="relative flex h-full items-center justify-between gap-5">

                  <div className="flex items-center gap-4">

                    <div className="
                      grid h-14 w-14 shrink-0 place-items-center
                      rounded-2xl bg-accent/15
                    ">
                      <Sparkles className="h-6 w-6 text-accent" />
                    </div>

                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
                        Heute
                      </div>

                      <h2 className="mt-1 text-xl font-bold tracking-tight">
                        Daily Check-In
                      </h2>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Training beendet? Kurzes Feedback geben.
                      </p>
                    </div>

                  </div>

                  <div className="
                    shrink-0 rounded-xl
                    bg-accent px-4 py-2
                    text-sm font-bold text-accent-foreground
                  ">
                    Starten →
                  </div>

                </div>
              </button>

            ) : (

              <div className="
                relative min-h-[155px] overflow-hidden
                rounded-2xl border border-accent/20
                bg-gradient-to-br from-accent/10 via-card to-accent/5
                p-6 shadow-sm
              ">

                <div className="
                  pointer-events-none absolute
                  -left-12 -top-16 h-40 w-40
                  rounded-full bg-accent/15 blur-3xl
                " />

                <div className="relative flex items-start justify-between gap-4">

                  <div className="flex items-center gap-4">

                    <div className="
                      grid h-14 w-14 shrink-0 place-items-center
                      rounded-2xl bg-accent/15
                    ">
                      <CheckCircle2 className="h-6 w-6 text-accent" />
                    </div>

                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
                        Heute
                      </div>

                      <h2 className="mt-1 text-xl font-bold tracking-tight">
                        Check-In abgeschlossen
                      </h2>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Dein heutiger Check-In wurde gespeichert.
                      </p>
                    </div>

                  </div>

                  <div className="
                    shrink-0 rounded-xl
                    bg-accent/10 px-3 py-1.5
                    text-xs font-bold text-accent
                  ">
                    ✓ Heute
                  </div>

                </div>

                <div className="relative mt-5">
                  <button
                    onClick={() => resetCheckin.mutate()}
                    disabled={resetCheckin.isPending}
                    className="
                      inline-flex items-center gap-2
                      text-xs font-medium text-muted-foreground
                      transition hover:text-foreground
                    "
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Dev: Check-in zurücksetzen
                  </button>
                </div>

              </div>

            )}


            {/* MOTIVATION QUOTE */}
            <div className="
              relative min-h-[155px] overflow-hidden
              rounded-2xl border border-accent/20
              bg-gradient-to-br from-accent/15 via-accent/5 to-card
              p-6 shadow-sm
            ">

              {/* decorative glow */}
              <div className="
                pointer-events-none absolute
                -right-10 -top-16 h-44 w-44
                rounded-full bg-accent/20 blur-3xl
              " />

              {/* big quotation mark */}
              <div className="
                pointer-events-none absolute
                left-5 top-2
                select-none text-[90px] font-black
                leading-none text-accent/10
              ">
                “
              </div>

              <div className="
                relative flex h-full
                flex-col justify-center
                pl-6 pr-4
              ">

                <div className="
                  mb-3 text-[10px] font-bold
                  uppercase tracking-[0.24em] text-accent
                ">
                  Motivation
                </div>

                <blockquote className="
                  max-w-xl text-lg font-semibold
                  italic leading-relaxed tracking-tight
                  text-foreground
                ">
                  „Grenzen existieren nur in deinem Kopf.“
                </blockquote>

                <div className="
                  mt-3 text-xs font-bold
                  uppercase tracking-[0.18em]
                  text-accent
                ">
                  — Armand Duplantis
                </div>

              </div>

            </div>

          </section>

          {/* STREAK + TRAININGS THIS WEEK */}
          <section className="mb-6 grid gap-6 lg:grid-cols-2">

            {/* STREAK */}
            <div
              data-tour="streak"
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              {/* soft Athletic IQ accent */}
              <div className="pointer-events-none absolute -left-12 -top-16 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

              <div className="relative flex items-start gap-4">

                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-accent/15 bg-accent/10">
                  <Flame className="h-7 w-7 text-accent" />
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    Aktueller Streak
                  </div>

                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-4xl font-bold tabular-nums text-accent">
                      {currentStreak}
                    </span>

                    <span className="text-sm font-semibold text-muted-foreground">
                      Tage
                    </span>
                  </div>

                  <p className="mt-1 text-sm font-medium">
                    Rekord: {Math.max(profile?.longest_streak ?? 0, currentStreak)}
                  </p>
                </div>

              </div>

              <div className="relative mt-5 rounded-xl border border-accent/10 bg-accent/5 px-4 py-3 text-sm font-medium">
                {doneToday
                  ? "Heute erledigt — starke Konstanz."
                  : "Bleib konsequent bei deinem Trainingsplan."}
              </div>
            </div>


            {/* TRAININGS THIS WEEK */}
            <div
              data-tour="performance"
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

              <div className="relative flex items-start justify-between">

                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    Trainings diese Woche
                  </div>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-bold tabular-nums text-accent">
                      {trainings}
                    </span>

                    <span className="text-xl font-semibold text-muted-foreground">
                      / {weeklyGoal}
                    </span>
                  </div>

                  <p className="mt-1 text-sm font-medium">
                    Dein Wochenziel
                  </p>
                </div>

                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-accent/15 bg-accent/10">
                  <Dumbbell className="h-5 w-5 text-accent" />
                </div>

              </div>

              <div className="relative mt-5">
                <Sparkline
                  data={[0, 0, 1, 1, 2, 2, trainings]}
                  color="var(--accent)"
                />
              </div>

              <div className="relative mt-1 grid grid-cols-7 text-center text-[10px] text-muted-foreground">
                <span>Mo</span>
                <span>Di</span>
                <span>Mi</span>
                <span>Do</span>
                <span>Fr</span>
                <span>Sa</span>
                <span>So</span>
              </div>

            </div>

          </section>


          {/* LATEST KI INSIGHT */}
          <section className="mb-6">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">

              <div className="mb-4 flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-accent" />

                <div className="font-bold">
                  Neuestes KI-Insight
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4">

                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-accent/15">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>

                <div className="min-w-0 flex-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <h3 className="font-bold">
                      {latestInsight
                        ? "Fokus aus deinem letzten Training"
                        : "Noch kein KI-Insight"}
                    </h3>

                    <span className="rounded-lg bg-accent/10 px-2 py-1 text-[10px] font-semibold text-accent">
                      {latestInsightDiscipline
                        ? latestInsightDiscipline.toUpperCase()
                        : "ATHLETIC IQ"}
                    </span>

                  </div>

                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {latestInsight ??
                      "Absolviere ein Training und deinen Daily Check-In, damit Athletic IQ dir hier ein persönliches Insight zeigen kann."}
                  </p>

                </div>

                <span className="shrink-0 text-xl text-muted-foreground">
                  →
                </span>

              </div>

            </div>
          </section>


        </>
      )}
      {checkinOpen && (
        <DailyCheckin name={name} onClose={() => setCheckinOpen(false)} />
      )}
      {showTour && <FeatureTour onClose={closeTour} />}
    </AppShell>
  );
}
















