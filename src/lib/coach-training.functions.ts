import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireCoachManagerAuth } from "@/integrations/supabase/coach-manager-auth-middleware";

const TrainingExerciseSchema = z.object({
  section: z.string().optional(),
  name: z.string().min(1).max(120),
  details: z.string().optional(),
  rest: z.string().optional(),
});

const TrainingSessionInputSchema = z.object({
  title: z.string().min(1).max(120),
  groupName: z.string().max(120).optional().nullable(),

  sessionDate: z.string().min(10).max(10),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),

  location: z.string().max(120).optional().nullable(),
  discipline: z.string().max(80).optional().nullable(),
  intensity: z.string().max(40).optional().nullable(),

  durationMinutes: z.number().int().min(0).max(600).optional().nullable(),

  sessionGoal: z.string().max(1000).optional().nullable(),
  coachNote: z.string().max(2000).optional().nullable(),

  exercises: z.array(TrainingExerciseSchema).max(50).default([]),

  status: z
    .enum(["draft", "published", "completed", "cancelled"])
    .default("draft"),
});

export type CoachTrainingExercise = z.infer<
  typeof TrainingExerciseSchema
>;

export type CoachTrainingSessionInput = z.infer<
  typeof TrainingSessionInputSchema
>;

export type CoachTrainingSession = {
  id: string;
  coach_id: string;

  title: string;
  group_name: string | null;

  session_date: string;
  start_time: string | null;
  end_time: string | null;

  location: string | null;
  discipline: string | null;
  intensity: string | null;

  duration_minutes: number | null;

  session_goal: string | null;
  coach_note: string | null;

  exercises: CoachTrainingExercise[];

  status: "draft" | "published" | "completed" | "cancelled";

  created_at: string;
  updated_at: string;
};

function normalizeSession(row: any): CoachTrainingSession {
  return {
    ...row,
    exercises: Array.isArray(row.exercises)
      ? row.exercises
      : [],
  } as CoachTrainingSession;
}

/**
 * Load the logged-in coach's training sessions
 * between two dates.
 */
export const fetchCoachTrainingSessions = createServerFn({
  method: "GET",
})
  .middleware([requireCoachManagerAuth])
  .inputValidator((input) =>
    z
      .object({
        startDate: z.string(),
        endDate: z.string(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: rows, error } = await supabase
      .from("training_sessions")
      .select("*")
      .eq("coach_id", userId)
      .gte("session_date", data.startDate)
      .lte("session_date", data.endDate)
      .order("session_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (rows ?? []).map(normalizeSession);
  });

/**
 * Load one coach-owned training session.
 */
export const fetchCoachTrainingSession = createServerFn({
  method: "GET",
})
  .middleware([requireCoachManagerAuth])
  .inputValidator((input) =>
    z
      .object({
        sessionId: z.string().uuid(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: session, error } = await supabase
      .from("training_sessions")
      .select("*")
      .eq("id", data.sessionId)
      .eq("coach_id", userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return normalizeSession(session);
  });

/**
 * Create a new coach training session.
 */
export const createCoachTrainingSession = createServerFn({
  method: "POST",
})
  .middleware([requireCoachManagerAuth])
  .inputValidator((input) =>
    TrainingSessionInputSchema.parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: session, error } = await supabase
      .from("training_sessions")
      .insert({
        coach_id: userId,

        title: data.title,
        group_name: data.groupName ?? null,

        session_date: data.sessionDate,
        start_time: data.startTime ?? null,
        end_time: data.endTime ?? null,

        location: data.location ?? null,
        discipline: data.discipline ?? null,
        intensity: data.intensity ?? null,

        duration_minutes: data.durationMinutes ?? null,

        session_goal: data.sessionGoal ?? null,
        coach_note: data.coachNote ?? null,

        exercises: data.exercises,

        status: data.status,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return normalizeSession(session);
  });

/**
 * Edit an existing coach-owned training session.
 */
export const updateCoachTrainingSession = createServerFn({
  method: "POST",
})
  .middleware([requireCoachManagerAuth])
  .inputValidator((input) =>
    z
      .object({
        sessionId: z.string().uuid(),
        session: TrainingSessionInputSchema,
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const input = data.session;

    const { data: session, error } = await supabase
      .from("training_sessions")
      .update({
        title: input.title,
        group_name: input.groupName ?? null,

        session_date: input.sessionDate,
        start_time: input.startTime ?? null,
        end_time: input.endTime ?? null,

        location: input.location ?? null,
        discipline: input.discipline ?? null,
        intensity: input.intensity ?? null,

        duration_minutes: input.durationMinutes ?? null,

        session_goal: input.sessionGoal ?? null,
        coach_note: input.coachNote ?? null,

        exercises: input.exercises,

        status: input.status,
      })
      .eq("id", data.sessionId)
      .eq("coach_id", userId)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return normalizeSession(session);
  });

/**
 * Delete one coach-owned training session.
 */
export const deleteCoachTrainingSession = createServerFn({
  method: "POST",
})
  .middleware([requireCoachManagerAuth])
  .inputValidator((input) =>
    z
      .object({
        sessionId: z.string().uuid(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { error } = await supabase
      .from("training_sessions")
      .delete()
      .eq("id", data.sessionId)
      .eq("coach_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      sessionId: data.sessionId,
    };
  });

