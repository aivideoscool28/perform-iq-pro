import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/athleticiq/AppShell";
import { KpiCard } from "@/components/athleticiq/KpiCard";

import { PerformanceChart } from "@/components/athleticiq/PerformanceChart";
import { AiInsights } from "@/components/athleticiq/AiInsights";
import { Sparkline } from "@/components/athleticiq/Sparkline";
import { StreakCard } from "@/components/athleticiq/StreakCard";
import { StreakManager } from "@/components/athleticiq/StreakManager";
import { AnalysisBoard } from "@/components/athleticiq/AnalysisBoard";
import { HeroPerformance } from "@/components/athleticiq/HeroPerformance";
import { fetchDashboard, fetchTodayCheckin, deleteTodayCheckin } from "@/lib/athletic.functions";
import { DailyCheckin } from "@/components/athleticiq/DailyCheckin";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Battery, Flame, HeartPulse, Moon, Loader2, CheckCircle2, Sparkles, RotateCcw,
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

function Dashboard() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const fetchFn = useServerFn(fetchDashboard);
  const fetchCheckin = useServerFn(fetchTodayCheckin);
  const resetCheckinFn = useServerFn(deleteTodayCheckin);
  const qc = useQueryClient();
  const [checkinOpen, setCheckinOpen] = useState(false);

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


  if (loading || !session) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-foreground" />
      </div>
    );
  }

  const profile = data?.profile;
  const boards = data?.boards ?? [];
  const workouts = data?.workouts ?? [];
  const checkins = data?.checkins ?? [];
  const currentStreak = data?.computedStreak ?? 0;
  const name = profile?.display_name ?? "Athlet";
  const today = new Date().toLocaleDateString("de", { weekday: "long", day: "2-digit", month: "long" });

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
          <section className="mb-6">
            <StreakCard
              current={currentStreak}
              longest={Math.max(profile?.longest_streak ?? 0, currentStreak)}
              workedOutToday={doneToday && !checkinData?.checkin?.is_rest_day}
              freezes={profile?.streak_freezes_remaining ?? 0}
            />
          </section>

          <section className="mb-6">
            <StreakManager workouts={workouts} checkins={checkins} />
          </section>

          {/* HERO — Performance Command Center */}
          <HeroPerformance name={name} />



          {/* KPI */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Energielevel" value={87} unit="%" delta="+4" trend="up" icon={Battery}>
              <Sparkline data={[60, 65, 70, 68, 75, 82, 87]} color="var(--accent)" />
            </KpiCard>
            <KpiCard label="HRV" value={74} unit="ms" delta="Baseline 68" trend="up" icon={HeartPulse}>
              <Sparkline data={[62, 68, 65, 70, 72, 74, 74]} color="var(--foreground)" />
            </KpiCard>
            <KpiCard label="Belastung" value="546" unit="TSS" delta="optimal" trend="flat" icon={Flame}>
              <Sparkline data={[400, 450, 500, 480, 520, 540, 546]} color="var(--muted-foreground)" />
            </KpiCard>
            <KpiCard label="Schlaf" value="7.8" unit="h" delta="Tief 1h42m" trend="up" icon={Moon}>
              <Sparkline data={[6.2, 6.8, 7.1, 6.9, 7.4, 7.6, 7.8]} color="var(--foreground)" />
            </KpiCard>
          </section>

          <section className="grid lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="font-semibold">Performance · 7 Tage</h3>
                <p className="text-xs text-muted-foreground">Form, Belastung & HRV</p>
              </div>
              <PerformanceChart />
            </div>
            <AiInsights />
          </section>

          {/* ANALYSIS BOARDS */}
          <section className="mb-6">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight">Workout-Analysen</h2>
              <span className="text-xs text-muted-foreground">{boards.length} Sessions</span>
            </div>
            {boards.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
                Noch keine Analysen. Logge oben dein erstes Workout per Chat — die KI erstellt
                automatisch dein erstes Board.
              </div>
            ) : (
              <div className="space-y-4">
                {boards.slice(0, 5).map((b) => (
                  <AnalysisBoard
                    key={b.id}
                    board={b as never}
                    workout={workouts.find((w) => w.id === b.workout_id) as never}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
      {checkinOpen && (
        <DailyCheckin name={name} onClose={() => setCheckinOpen(false)} />
      )}
    </AppShell>
  );
}
