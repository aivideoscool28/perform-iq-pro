import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireCoachManagerAuth } from "@/integrations/supabase/coach-manager-auth-middleware";

const TemplateExerciseSchema = z.object({
  section: z.string().optional(),
  name: z.string().min(1).max(120),
  details: z.string().optional(),
  rest: z.string().optional(),
});

const CreateTemplateSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  category: z.string().min(1).max(80),
  discipline: z.string().max(80).optional().nullable(),
  intensity: z.string().max(40).optional().nullable(),
  durationMinutes: z.number().int().min(0).max(600).optional().nullable(),
  sessionGoal: z.string().max(1000).optional().nullable(),
  coachNote: z.string().max(2000).optional().nullable(),
  exercises: z.array(TemplateExerciseSchema).max(50).default([]),
});

export type CoachTrainingTemplateExercise =
  z.infer<typeof TemplateExerciseSchema>;

export type CoachTrainingTemplateInput =
  z.infer<typeof CreateTemplateSchema>;

export type CoachTrainingTemplate = {
  id: string;
  coach_id: string | null;
  template_type: "aether" | "coach";

  name: string;
  description: string | null;

  category: string;
  discipline: string | null;
  intensity: string | null;
  duration_minutes: number | null;

  session_goal: string | null;
  coach_note: string | null;

  exercises: CoachTrainingTemplateExercise[];

  created_at: string;
  updated_at: string;
};

function normalizeTemplate(
  row: any,
): CoachTrainingTemplate {
  return {
    ...row,
    exercises: Array.isArray(row.exercises)
      ? row.exercises
      : [],
  } as CoachTrainingTemplate;
}


/**
 * Load official Aether templates plus templates
 * created by the logged-in coach.
 */
export const fetchCoachTrainingTemplates =
  createServerFn({
    method: "GET",
  })
    .middleware([
      requireCoachManagerAuth,
    ])
    .handler(async ({ context }) => {
      const { supabase } = context;

      const {
        data,
        error,
      } = await supabase
        .from("coach_training_templates")
        .select("*")
        .order("template_type", {
          ascending: true,
        })
        .order("category", {
          ascending: true,
        })
        .order("name", {
          ascending: true,
        });

      if (error) {
        throw new Error(error.message);
      }

      return (data ?? []).map(
        normalizeTemplate,
      );
    });


/**
 * Save one reusable template owned by the coach.
 */
export const createCoachTrainingTemplate =
  createServerFn({
    method: "POST",
  })
    .middleware([
      requireCoachManagerAuth,
    ])
    .inputValidator((input) =>
      CreateTemplateSchema.parse(input),
    )
    .handler(
      async ({
        data,
        context,
      }) => {
        const {
          supabase,
          userId,
        } = context;

        const {
          data: template,
          error,
        } = await supabase
          .from(
            "coach_training_templates",
          )
          .insert({
            coach_id: userId,
            template_type: "coach",

            name: data.name,
            description:
              data.description ?? null,

            category:
              data.category,

            discipline:
              data.discipline ?? null,

            intensity:
              data.intensity ?? null,

            duration_minutes:
              data.durationMinutes ?? null,

            session_goal:
              data.sessionGoal ?? null,

            coach_note:
              data.coachNote ?? null,

            exercises:
              data.exercises,
          })
          .select("*")
          .single();

        if (error) {
          throw new Error(
            error.message,
          );
        }

        return normalizeTemplate(
          template,
        );
      },
    );
