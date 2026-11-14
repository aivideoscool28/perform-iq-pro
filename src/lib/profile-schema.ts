import { z } from "zod";
import { timeZoneSchema } from "./dates";
export const profileEditSchema = z
  .object({
    display_name: z.string().trim().min(1).max(60),
    age: z.number().int().min(8).max(99).nullable(),
    height_cm: z.number().min(50).max(250).nullable(),
    weight_kg: z.number().min(15).max(350).nullable(),
    disciplines: z.array(z.string().trim().min(1).max(80)).min(1).max(2),
    goal_text: z.string().trim().max(500),
    experience: z.string().max(60).nullable(),
    training_days_per_week: z.number().int().min(1).max(7).nullable(),
    training_setup: z.string().max(80).nullable(),
    goal_motivation: z.array(z.string().max(250)).max(2),
    current_focus: z.array(z.string().max(120)).max(2),
    injuries: z.string().max(1000).nullable(),
    favourite_athlete: z.string().max(100).nullable(),
    timezone: timeZoneSchema,
    ai_consent: z.boolean(),
    share_with_coach: z.boolean(),
  })
  .strict();
export type ProfileEdit = z.infer<typeof profileEditSchema>;
