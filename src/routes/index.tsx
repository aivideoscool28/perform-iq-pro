import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/athleticiq/AppShell";
import { TodaysTrainingCard } from "@/components/dashboard/TodaysTrainingCard";
import { DashboardCheckinCard } from "@/components/dashboard/DashboardCheckinCard";
import { MotivationCard } from "@/components/dashboard/MotivationCard";
import { WeeklyProgressCards } from "@/components/dashboard/WeeklyProgressCards";
import { KIInsightCard } from "@/components/dashboard/KIInsightCard";
import { fetchDashboard } from "@/lib/features/dashboard.functions";
import { fetchTodayPlannedWorkout } from "@/lib/planned-workouts.functions";
import { RegenerationCheckin } from "@/components/athleticiq/RegenerationCheckin";
import { fetchTodayRegeneration } from "@/lib/features/regeneration.functions";
import { fetchTodayCheckin, deleteTodayCheckin } from "@/lib/features/daily-checkin.functions";
import { DailyCheckin } from "@/components/athleticiq/DailyCheckin";
import { FeatureTour } from "@/components/athleticiq/FeatureTour";
import { isTourPending, clearTourPending } from "@/lib/tour";
import { useAuth } from "@/hooks/use-auth";
import { consumeJustLoggedIn } from "@/lib/auth-session";
import { toast } from "sonner";
import {
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Athleticiq — Athletics Meets You" },
      { name: "description", content: "Helping Athletes and Coaches reach their full potential" },
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
  const fetchTodayTraining = useServerFn(fetchTodayPlannedWorkout);
  const fetchRegeneration = useServerFn(fetchTodayRegeneration);
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
  const { data: todayTraining, isLoading: todayTrainingLoading } = useQuery({
    queryKey: ["today-planned-workout"],
    queryFn: () => fetchTodayTraining(),
    enabled: !!session,
  });

  const {
    data: regenerationData,
    isLoading: regenerationLoading,
  } = useQuery({
    queryKey: ["today-regeneration"],
    queryFn: () => fetchRegeneration(),
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
          <TodaysTrainingCard
            workout={todayTraining}
            loading={todayTrainingLoading}
            onViewTraining={() =>
              navigate({ to: "/training" })
            }
          />

          {/* CHECK-IN + MOTIVATION */}
          <section className="mb-6 grid gap-6 lg:grid-cols-2">
            {/* DAILY CHECK-IN */}
            <DashboardCheckinCard
              doneToday={doneToday}
              onStart={() => setCheckinOpen(true)}
              onReset={() => resetCheckin.mutate()}
              resetPending={resetCheckin.isPending}
            />
            {/* MOTIVATION QUOTE */}
            <MotivationCard />
</section>
          {/* STREAK + TRAININGS THIS WEEK */}
          <WeeklyProgressCards
            currentStreak={currentStreak}
            longestStreak={profile?.longest_streak ?? 0}
            doneToday={doneToday}
            trainings={trainings}
            weeklyGoal={weeklyGoal}
          />
          {/* KI INSIGHT */}
          <KIInsightCard
            insight={latestInsight}
            discipline={latestInsightDiscipline}
          />



        </>
      )}
      {checkinOpen && (
        <DailyCheckin name={name} onClose={() => setCheckinOpen(false)} />
      )}
      {!regenerationLoading &&
        !regenerationData?.regeneration &&
        !showTour && (
          <RegenerationCheckin
            onComplete={() => {
              qc.invalidateQueries({
                queryKey: ["today-regeneration"],
              });
            }}
          />
        )}

      {showTour && <FeatureTour onClose={closeTour} />}
    </AppShell>
  );
}







