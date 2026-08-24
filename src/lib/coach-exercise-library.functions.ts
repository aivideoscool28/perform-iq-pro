import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireCoachManagerAuth } from "@/integrations/supabase/coach-manager-auth-middleware";
import type { Tables } from "@/integrations/supabase/types";

export type CoachExerciseLibraryItem =
  Tables<"coach_exercise_library">;

const ExerciseInputSchema = z.object({
  name: z.string().min(1).max(120),
  category: z.string().min(1).max(80),

  discipline: z
    .string()
    .max(80)
    .optional()
    .nullable(),

  defaultDetails: z
    .string()
    .max(500)
    .optional()
    .nullable(),

  defaultRest: z
    .string()
    .max(120)
    .optional()
    .nullable(),

  description: z
    .string()
    .max(1000)
    .optional()
    .nullable(),
});

export type CoachExerciseInput =
  z.infer<typeof ExerciseInputSchema>;


/**
 * Load:
 * 1. Aether/system exercises
 * 2. Exercises created by the logged-in coach
 */
export const fetchCoachExerciseLibrary =
  createServerFn({
    method: "GET",
  })
    .middleware([requireCoachManagerAuth])
    .handler(async ({ context }) => {
      const { supabase, userId } =
        context;

      const [
        systemResult,
        coachResult,
      ] = await Promise.all([
        supabase
          .from("coach_exercise_library")
          .select("*")
          .eq("source", "system")
          .order("category", {
            ascending: true,
          })
          .order("name", {
            ascending: true,
          }),

        supabase
          .from("coach_exercise_library")
          .select("*")
          .eq("source", "coach")
          .eq("coach_id", userId)
          .order("category", {
            ascending: true,
          })
          .order("name", {
            ascending: true,
          }),
      ]);

      if (systemResult.error) {
        throw new Error(
          systemResult.error.message,
        );
      }

      if (coachResult.error) {
        throw new Error(
          coachResult.error.message,
        );
      }

      return [
        ...(systemResult.data ?? []),
        ...(coachResult.data ?? []),
      ] as CoachExerciseLibraryItem[];
    });


/**
 * Create one reusable coach-owned exercise.
 */
export const createCoachExercise =
  createServerFn({
    method: "POST",
  })
    .middleware([requireCoachManagerAuth])
    .inputValidator((input) =>
      ExerciseInputSchema.parse(input),
    )
    .handler(async ({ data, context }) => {
      const { supabase, userId } =
        context;

      const {
        data: exercise,
        error,
      } = await supabase
        .from("coach_exercise_library")
        .insert({
          coach_id: userId,

          name:
            data.name.trim(),

          category:
            data.category.trim(),

          discipline:
            data.discipline?.trim() ||
            null,

          default_details:
            data.defaultDetails?.trim() ||
            null,

          default_rest:
            data.defaultRest?.trim() ||
            null,

          description:
            data.description?.trim() ||
            null,

          source: "coach",
        })
        .select("*")
        .single();

      if (error) {
        throw new Error(
          error.message,
        );
      }

      return exercise as CoachExerciseLibraryItem;
    });


/**
 * Edit one coach-owned exercise.
 *
 * System/Aether exercises cannot be edited here.
 */
export const updateCoachExercise =
  createServerFn({
    method: "POST",
  })
    .middleware([requireCoachManagerAuth])
    .inputValidator((input) =>
      z
        .object({
          exerciseId:
            z.string().uuid(),

          exercise:
            ExerciseInputSchema,
        })
        .parse(input),
    )
    .handler(async ({ data, context }) => {
      const { supabase, userId } =
        context;

      const input =
        data.exercise;

      const {
        data: exercise,
        error,
      } = await supabase
        .from("coach_exercise_library")
        .update({
          name:
            input.name.trim(),

          category:
            input.category.trim(),

          discipline:
            input.discipline?.trim() ||
            null,

          default_details:
            input.defaultDetails?.trim() ||
            null,

          default_rest:
            input.defaultRest?.trim() ||
            null,

          description:
            input.description?.trim() ||
            null,

          updated_at:
            new Date().toISOString(),
        })
        .eq("id", data.exerciseId)
        .eq("coach_id", userId)
        .eq("source", "coach")
        .select("*")
        .single();

      if (error) {
        throw new Error(
          error.message,
        );
      }

      return exercise as CoachExerciseLibraryItem;
    });


/**
 * Delete one coach-created exercise.
 *
 * System/Aether exercises are protected.
 */
export const deleteCoachExercise =
  createServerFn({
    method: "POST",
  })
    .middleware([requireCoachManagerAuth])
    .inputValidator((input) =>
      z
        .object({
          exerciseId:
            z.string().uuid(),
        })
        .parse(input),
    )
    .handler(async ({ data, context }) => {
      const { supabase, userId } =
        context;

      const { error } =
        await supabase
          .from("coach_exercise_library")
          .delete()
          .eq(
            "id",
            data.exerciseId,
          )
          .eq(
            "coach_id",
            userId,
          )
          .eq(
            "source",
            "coach",
          );

      if (error) {
        throw new Error(
          error.message,
        );
      }

      return {
        success: true,
        exerciseId:
          data.exerciseId,
      };
    });
