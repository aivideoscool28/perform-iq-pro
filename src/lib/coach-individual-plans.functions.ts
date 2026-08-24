import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireCoachManagerAuth } from "@/integrations/supabase/coach-manager-auth-middleware";

const PlannedExerciseSchema = z.object({
  section: z.string().optional(),
  name: z.string().min(1).max(120),
  details: z.string().optional(),
  rest: z.string().optional(),
});

const IndividualPlanInputSchema = z.object({
  athleteId: z.string().uuid(),

  workoutDate: z.string().min(10).max(10),

  title: z.string().min(1).max(160),

  discipline: z.string().max(80).optional().nullable(),

  durationMinutes: z
    .number()
    .int()
    .min(0)
    .max(600)
    .optional()
    .nullable(),

  sessionGoal: z
    .string()
    .max(1000)
    .optional()
    .nullable(),

  coachNote: z
    .string()
    .max(2000)
    .optional()
    .nullable(),

  exercises: z
    .array(PlannedExerciseSchema)
    .max(50)
    .default([]),

  status: z
    .enum([
      "planned",
      "completed",
      "changed",
      "not_completed",
    ])
    .default("planned"),
});

export type CoachIndividualPlanInput =
  z.infer<typeof IndividualPlanInputSchema>;

export type CoachIndividualPlan = {
  id: string;

  athlete_id: string;
  coach_id: string | null;

  workout_date: string;

  title: string;
  discipline: string | null;

  duration_minutes: number | null;

  session_goal: string | null;
  coach_note: string | null;

  exercises: Array<{
    section?: string;
    name: string;
    details?: string;
    rest?: string;
  }>;

  status:
    | "planned"
    | "completed"
    | "changed"
    | "not_completed";

  source: string;

  is_published: boolean;

  completed_at: string | null;

  created_at: string;
  updated_at: string;
};

function normalizePlan(
  row: any,
): CoachIndividualPlan {
  return {
    ...row,

    exercises:
      Array.isArray(row.exercises)
        ? row.exercises
        : [],

    is_published:
      row.is_published === true,
  } as CoachIndividualPlan;
}

async function assertCoachAthlete(
  supabase: any,
  coachId: string,
  athleteId: string,
) {
  const { data, error } = await supabase
    .from("coach_athletes")
    .select("id")
    .eq("coach_id", coachId)
    .eq("athlete_id", athleteId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error(
      "This athlete is not linked to the current coach.",
    );
  }
}

export const fetchCoachIndividualPlans =
  createServerFn({
    method: "GET",
  })
    .middleware([requireCoachManagerAuth])
    .inputValidator((input) =>
      z
        .object({
          athleteId: z.string().uuid(),
          startDate: z.string(),
          endDate: z.string(),
        })
        .parse(input),
    )
    .handler(async ({ data, context }) => {
      const { supabase, userId } = context;

      await assertCoachAthlete(
        supabase,
        userId,
        data.athleteId,
      );

      const { data: rows, error } =
        await supabase
          .from("planned_workouts")
          .select("*")
          .eq(
            "athlete_id",
            data.athleteId,
          )
          .gte(
            "workout_date",
            data.startDate,
          )
          .lte(
            "workout_date",
            data.endDate,
          )
          .order(
            "workout_date",
            { ascending: true },
          );

      if (error) {
        throw new Error(error.message);
      }

      return (rows ?? []).map(
        normalizePlan,
      );
    });

/**
 * New individual plans start as DRAFTS.
 */
export const createCoachIndividualPlan =
  createServerFn({
    method: "POST",
  })
    .middleware([requireCoachManagerAuth])
    .inputValidator((input) =>
      IndividualPlanInputSchema.parse(input),
    )
    .handler(async ({ data, context }) => {
      const { supabase, userId } =
        context;

      await assertCoachAthlete(
        supabase,
        userId,
        data.athleteId,
      );

      const { data: plan, error } =
        await supabase
          .from("planned_workouts")
          .insert({
            athlete_id:
              data.athleteId,

            coach_id:
              userId,

            workout_date:
              data.workoutDate,

            title:
              data.title,

            discipline:
              data.discipline ?? null,

            duration_minutes:
              data.durationMinutes ?? null,

            session_goal:
              data.sessionGoal ?? null,

            coach_note:
              data.coachNote ?? null,

            exercises:
              data.exercises,

            status:
              data.status,

            source:
              "coach",

            is_published:
              false,
          })
          .select("*")
          .single();

      if (error) {
        throw new Error(error.message);
      }

      return normalizePlan(plan);
    });

/**
 * Saving changes creates/returns a draft.
 *
 * This prevents unfinished changes from silently appearing
 * in the athlete app.
 */
export const updateCoachIndividualPlan =
  createServerFn({
    method: "POST",
  })
    .middleware([requireCoachManagerAuth])
    .inputValidator((input) =>
      z
        .object({
          planId: z.string().uuid(),
          plan:
            IndividualPlanInputSchema,
        })
        .parse(input),
    )
    .handler(async ({ data, context }) => {
      const { supabase, userId } =
        context;

      await assertCoachAthlete(
        supabase,
        userId,
        data.plan.athleteId,
      );

      const input = data.plan;

      const { data: plan, error } =
        await supabase
          .from("planned_workouts")
          .update({
            workout_date:
              input.workoutDate,

            title:
              input.title,

            discipline:
              input.discipline ?? null,

            duration_minutes:
              input.durationMinutes ?? null,

            session_goal:
              input.sessionGoal ?? null,

            coach_note:
              input.coachNote ?? null,

            exercises:
              input.exercises,

            status:
              input.status,

            is_published:
              false,

            updated_at:
              new Date().toISOString(),
          })
          .eq("id", data.planId)
          .eq(
            "athlete_id",
            input.athleteId,
          )
          .eq(
            "coach_id",
            userId,
          )
          .select("*")
          .single();

      if (error) {
        throw new Error(error.message);
      }

      return normalizePlan(plan);
    });

/**
 * Publish a finished plan to the athlete.
 */
export const publishCoachIndividualPlan =
  createServerFn({
    method: "POST",
  })
    .middleware([requireCoachManagerAuth])
    .inputValidator((input) =>
      z
        .object({
          planId: z.string().uuid(),
          athleteId: z.string().uuid(),
        })
        .parse(input),
    )
    .handler(async ({ data, context }) => {
      const { supabase, userId } =
        context;

      await assertCoachAthlete(
        supabase,
        userId,
        data.athleteId,
      );

      const { data: plan, error } =
        await supabase
          .from("planned_workouts")
          .update({
            is_published: true,

            updated_at:
              new Date().toISOString(),
          })
          .eq("id", data.planId)
          .eq(
            "athlete_id",
            data.athleteId,
          )
          .eq(
            "coach_id",
            userId,
          )
          .select("*")
          .single();

      if (error) {
        throw new Error(error.message);
      }

      return normalizePlan(plan);
    });

export const deleteCoachIndividualPlan =
  createServerFn({
    method: "POST",
  })
    .middleware([requireCoachManagerAuth])
    .inputValidator((input) =>
      z
        .object({
          planId: z.string().uuid(),
          athleteId: z.string().uuid(),
        })
        .parse(input),
    )
    .handler(async ({ data, context }) => {
      const { supabase, userId } =
        context;

      await assertCoachAthlete(
        supabase,
        userId,
        data.athleteId,
      );

      const { error } =
        await supabase
          .from("planned_workouts")
          .delete()
          .eq("id", data.planId)
          .eq(
            "athlete_id",
            data.athleteId,
          )
          .eq(
            "coach_id",
            userId,
          );

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        planId: data.planId,
      };
    });
