import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/athleticiq/AppShell";
import { Sparkline } from "@/components/athleticiq/Sparkline";
import { StreakCard } from "@/components/athleticiq/StreakCard";
import { AthleteQuoteCard } from "@/components/athleticiq/AthleteQuoteCard";
import { fetchDashboard, fetchTodayCheckin, deleteTodayCheckin } from "@/lib/athletic.functions";
import { DailyCheckin } from "@/components/athleticiq/DailyCheckin";
import { FeatureTour } from "@/components/athleticiq/FeatureTour";
import { isTourPending, clearTourPending } from "@/lib/tour";
import { useAuth } from "@/hooks/use-auth";
import { consumeJustLoggedIn } from "@/lib/auth-session";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Loader2, CheckCircle2, Sparkles, RotateCcw, Dumbbell, TrendingUp, Activity,
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

  return (
    <AppShell title={`Hallo ${name}`} subtitle={today}>
      {isLoading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-foreground" />
        </div>
      ) : (
        <>
          {/* Daily check-in button */}
          <section className="mb-6">
            <Button
              data-tour="checkin"
              size="lg"
              disabled={doneToday}
              onClick={() => setCheckinOpen(true)}
              className="w-full h-14 text-base font-semibold rounded-2xl shadow-sm"
            >
              {doneToday ? (
                <><CheckCircle2 className="mr-2 h-5 w-5" /> Check-in erledigt ✓</>
              ) : (
                <><Sparkles className="mr-2 h-5 w-5" /> Daily Check-in starten</>
              )}
            </Button>
            {doneToday && checkinData?.checkin?.ai_summary && (
              <p className="text-sm text-muted-foreground mt-3 text-center">
                {checkinData.checkin.ai_summary}
              </p>
            )}
            {doneToday && (
              <div className="mt-3 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => resetCheckin.mutate()}
                  disabled={resetCheckin.isPending}
                  className="text-xs text-muted-foreground"
                >
                  <RotateCcw className="mr-1.5 h-3 w-3" />
                  Dev: Check-in zurücksetzen
                </Button>
              </div>
            )}
          </section>

          {/* Streak */}
          <section data-tour="streak" className="mb-6">
            <StreakCard
              current={currentStreak}
              longest={Math.max(profile?.longest_streak ?? 0, currentStreak)}
              workedOutToday={doneToday && !checkinData?.checkin?.is_rest_day}
              freezes={profile?.streak_freezes_remaining ?? 0}
            />
          </section>

          {/* Favorite athlete quote / news */}
          <AthleteQuoteCard />

          {/* Trainings diese Woche */}
          <section data-tour="performance" className="mb-6">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    Trainings diese Woche
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-3xl font-semibold tabular-nums">{trainings}</span>
                    <span className="text-sm text-muted-foreground">/ {weeklyGoal}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground/80">
                    {trainings === 0 ? "Start logging!" : "Dein Wochenziel"}
                  </div>
                </div>
                <div className="h-10 w-10 shrink-0 rounded-xl border border-border bg-secondary grid place-items-center">
                  <Dumbbell className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="mt-4 opacity-60">
                <Sparkline data={[0, 1, 1, 2, 2, 3, trainings]} color="var(--accent)" />
              </div>
            </div>
          </section>

          {/* Single latest KI-Insight */}
          <section className="mb-6">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-lg bg-foreground grid place-items-center">
                  <Sparkles className="h-4 w-4 text-background" />
                </div>
                <div>
                  <div className="font-semibold text-sm">KI-Insight</div>
                  <div className="text-[11px] text-muted-foreground">Neuester Tipp</div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex gap-3">
                  {trainings === 0 ? (
                    <Activity className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-sm">
                        {trainings === 0 ? "Leg los" : "Sprintform im Aufwärtstrend"}
                      </h4>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border rounded px-1.5 py-0.5">
                        {trainings === 0 ? "Onboarding" : "Performance"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {trainings === 0
                        ? "Logge dein erstes Workout, damit die KI dein persönliches Profil aufbauen kann."
                        : "Deine Belastung sitzt im optimalen Bereich. Halte Hard-Tage scharf und Easy-Tage wirklich easy."}
                    </p>
                  </div>
                </div>
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
