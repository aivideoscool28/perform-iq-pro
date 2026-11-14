import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { fetchMyProfile } from "@/lib/features/profile.functions";
import { calendarDate } from "@/lib/dates";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/athleticiq/AppShell";
import { WeekNavigation } from "@/components/training/WeekNavigation";
import { WeeklyCalendar } from "@/components/training/WeeklyCalendar";
import { WorkoutDetails } from "@/components/training/WorkoutDetails";
import { fetchPlannedWorkouts, type PlannedWorkout } from "@/lib/planned-workouts.functions";
import { explainPlannedWorkout } from "@/lib/training-explanation.functions";

export const Route = createFileRoute("/training")({
  component: TrainingPage,
});

function startOfWeek(date: Date) {
  const copy = new Date(date);

  const day = (copy.getDay() + 6) % 7;

  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);

  return copy;
}

function addDays(date: Date, amount: number) {
  const copy = new Date(date);

  copy.setDate(copy.getDate() + amount);

  return copy;
}

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatWeek(start: Date) {
  const end = addDays(start, 6);

  const startText = start.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
  });

  const endText = end.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return `${startText} – ${endText}`;
}

function TrainingPage() {
  const { user } = useAuth();
  const getProfile = useServerFn(fetchMyProfile);
  const { data: profileData } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: () => getProfile(),
    enabled: !!user,
  });
  const today = calendarDate(new Date(), profileData?.profile?.timezone ?? "UTC");
  const fetchWorkouts = useServerFn(fetchPlannedWorkouts);
  const explainWorkout = useServerFn(explainPlannedWorkout);

  const explanationMutation = useMutation({
    mutationFn: (workoutId: string) =>
      explainWorkout({
        data: {
          workoutId,
        },
      }),
  });

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  const [selectedWorkout, setSelectedWorkout] = useState<PlannedWorkout | null>(null);

  const [whyOpen, setWhyOpen] = useState(false);

  useEffect(() => {
    setWeekStart(startOfWeek(new Date(today + "T12:00:00")));
  }, [today]);
  const weekEnd = addDays(weekStart, 6);

  const startDate = toDateString(weekStart);
  const endDate = toDateString(weekEnd);

  const {
    data: workouts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["planned-workouts", startDate, endDate],

    queryFn: () =>
      fetchWorkouts({
        data: {
          startDate,
          endDate,
        },
      }),
  });

  const displayWorkouts = workouts;

  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  const workoutForDate = (date: Date) =>
    displayWorkouts.find((workout) => workout.workout_date === toDateString(date));

  return (
    <AppShell
      title="Training"
      subtitle="Dein Trainingsplan vom Coach"
      breadcrumbs={[{ label: "Dashboard", to: "/" }, { label: "Training" }]}
    >
      {error && <p role="alert">Trainingsplan konnte nicht geladen werden. Bitte erneut laden.</p>}
      {!isLoading && !error && workouts.length === 0 && (
        <p role="status">Für diese Woche wurde noch kein Trainingsplan veröffentlicht.</p>
      )}
      <WeekNavigation
        weekStart={weekStart}
        setWeekStart={setWeekStart}
        hasError={!!error}
        isLoading={isLoading}
        workoutCount={displayWorkouts.length}
        formatWeek={formatWeek}
        startOfWeek={() => startOfWeek(new Date(today + "T12:00:00"))}
        addDays={addDays}
      />
      {/* 7-DAY TRAINING CALENDAR */}
      <WeeklyCalendar
        weekDays={weekDays}
        todayDate={today}
        workoutForDate={workoutForDate}
        onSelectWorkout={(workout) => {
          setSelectedWorkout(workout);
          setWhyOpen(false);
        }}
        hasRealWorkouts={workouts.length > 0}
        isLoading={isLoading}
        toDateString={toDateString}
      />
      {/* SELECTED WORKOUT DETAILS */}
      {selectedWorkout && (
        <WorkoutDetails
          selectedWorkout={selectedWorkout}
          onStatusChange={setSelectedWorkout}
          whyOpen={whyOpen}
          setWhyOpen={setWhyOpen}
          onClose={() => setSelectedWorkout(null)}
          explanationMutation={explanationMutation}
        />
      )}
    </AppShell>
  );
}
