import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/athleticiq/AppShell";
import { WeekNavigation } from "@/components/training/WeekNavigation";
import { WeeklyCalendar } from "@/components/training/WeeklyCalendar";
import { WorkoutDetails } from "@/components/training/WorkoutDetails";
import {
  fetchPlannedWorkouts,
  type PlannedWorkout,
} from "@/lib/planned-workouts.functions";
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

function createDemoWorkouts(weekStart: Date): PlannedWorkout[] {
  const now = new Date().toISOString();

  return [
    {
      id: "demo-monday",
      athlete_id: "demo",
      coach_id: null,
      workout_date: toDateString(addDays(weekStart, 0)),
      title: "Beschleunigung",
      discipline: "Sprint",
      duration_minutes: 60,
      session_goal: "Explosive erste 30 Meter.",
      coach_note: "Qualität vor Quantität.",
      exercises: [],
      status: "completed",
      source: "coach",
      completed_at: now,
      created_at: now,
      updated_at: now,
    },
    {
      id: "demo-tuesday",
      athlete_id: "demo",
      coach_id: null,
      workout_date: toDateString(addDays(weekStart, 1)),
      title: "Kraft",
      discipline: "Sprint",
      duration_minutes: 50,
      session_goal: "Sprintrelevante Kraft.",
      coach_note: "Saubere Technik.",
      exercises: [],
      status: "completed",
      source: "coach",
      completed_at: now,
      created_at: now,
      updated_at: now,
    },
    {
      id: "demo-thursday",
      athlete_id: "demo",
      coach_id: null,
      workout_date: toDateString(addDays(weekStart, 3)),
      title: "Hürden · Rhythmus",
      discipline: "Hürden",
      duration_minutes: 70,
      session_goal: "Konstanter Rhythmus.",
      coach_note: "Fokus auf Hürde 3–5.",
      exercises: [],
      status: "planned",
      source: "coach",
      completed_at: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: "demo-saturday",
      athlete_id: "demo",
      coach_id: null,
      workout_date: toDateString(addDays(weekStart, 5)),
      title: "Speed Endurance",
      discipline: "Sprint",
      duration_minutes: 65,
      session_goal: "Geschwindigkeit länger halten.",
      coach_note: "Volle Pausen nutzen.",
      exercises: [],
      status: "planned",
      source: "coach",
      completed_at: null,
      created_at: now,
      updated_at: now,
    },
  ];
}
function TrainingPage() {
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

  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date()),
  );

  const [selectedWorkout, setSelectedWorkout] =
    useState<PlannedWorkout | null>(null);

  const [whyOpen, setWhyOpen] = useState(false);

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

  const displayWorkouts =
    workouts.length > 0
      ? workouts
      : createDemoWorkouts(weekStart);

  const weekDays =
    Array.from({ length: 7 }, (_, index) =>
      addDays(weekStart, index),
    );

  const workoutForDate = (date: Date) =>
    displayWorkouts.find(
      (workout) =>
        workout.workout_date === toDateString(date),
    );

  return (
    <AppShell
      title="Training"
      subtitle="Dein Trainingsplan vom Coach"
      breadcrumbs={[
        { label: "Dashboard", to: "/" },
        { label: "Training" },
      ]}
    >
      <WeekNavigation
        weekStart={weekStart}
        setWeekStart={setWeekStart}
        hasError={!!error}
        isLoading={isLoading}
        workoutCount={displayWorkouts.length}
        formatWeek={formatWeek}
        startOfWeek={startOfWeek}
        addDays={addDays}
      />
      {/* 7-DAY TRAINING CALENDAR */}
      <WeeklyCalendar
        weekDays={weekDays}
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
          whyOpen={whyOpen}
          setWhyOpen={setWhyOpen}
          onClose={() => setSelectedWorkout(null)}
          explanationMutation={explanationMutation}
        />
      )}


    </AppShell>
  );
}





