import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PlannedExerciseSchema = z.object({
  section: z.string().optional(),
  name: z.string(),
  details: z.string().optional(),
  rest: z.string().optional(),
});

export type PlannedExercise = z.infer<typeof PlannedExerciseSchema>;

export type PlannedWorkout = {
  id: string;
  athlete_id: string;
  coach_id: string | null;
  workout_date: string;
  title: string;
  discipline: string | null;
  duration_minutes: number | null;
  session_goal: string | null;
  coach_note: string | null;
  exercises: PlannedExercise[];
  status: "planned" | "completed" | "changed" | "not_completed";
  source: "coach";
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Load the logged-in athlete's planned workouts between two dates.
 * Used by Training calendar and later Dashboard.
 */
export const fetchPlannedWorkouts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      startDate: z.string(),
      endDate: z.string(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: rows, error } = await supabase
      .from("planned_workouts")
      .select("*")
      .eq("athlete_id", userId)
      .gte("workout_date", data.startDate)
      .lte("workout_date", data.endDate)
      .order("workout_date", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (rows ?? []).map((row) => ({
      ...row,
      exercises: Array.isArray(row.exercises) ? row.exercises : [],
    })) as PlannedWorkout[];
  });

/**
 * Load today's planned workout for the logged-in athlete.
 * Later used by Dashboard and Daily Check-In.
 */
export const fetchTodayPlannedWorkout = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const today = new Date().toISOString().slice(0, 10);

    const { data: workout, error } = await supabase
      .from("planned_workouts")
      .select("*")
      .eq("athlete_id", userId)
      .eq("workout_date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!workout) {
      return null;
    }

    return {
      ...workout,
      exercises: Array.isArray(workout.exercises) ? workout.exercises : [],
    } as PlannedWorkout;
  });

/**
 * Update the athlete's completion status.
 * Later Daily Check-In will call this automatically.
 */
export const updatePlannedWorkoutStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      workoutId: z.string().uuid(),
      status: z.enum(["completed", "changed", "not_completed"]),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: workout, error } = await supabase
      .from("planned_workouts")
      .update({
        status: data.status,
        completed_at:
          data.status === "completed" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.workoutId)
      .eq("athlete_id", userId)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      ...workout,
      exercises: Array.isArray(workout.exercises) ? workout.exercises : [],
    } as PlannedWorkout;
  });
