import { z } from "zod";
const short = z.string().max(2000);
const pair = z.object({ label: short, value: short });
export const videoOutputSchema = z.object({
  detected_movement: short,
  overall_score: z.number().min(0).max(10),
  overall_reasoning: short,
  overall_recommendation: short,
  score_breakdown: z.array(pair).min(3).max(8),
  findings: z
    .array(
      z.object({
        joint: short,
        val: z.number(),
        unit: short,
        ideal: short,
        status: z.enum(["ok", "warn"]),
        reasoning: short,
        recommendation: short,
        data: z.array(pair).min(2).max(6),
      }),
    )
    .min(3)
    .max(6),
  kpis: z.array(z.object({ title: short, val: short, note: short })).length(3),
});
const amount = z.number().min(0).max(100000);
export const foodOutputSchema = z.object({
  meal_name: short,
  items: z
    .array(
      z.object({
        name: short,
        portion_g: amount,
        kcal: amount,
        protein_g: amount,
        carbs_g: amount,
        fat_g: amount,
        confidence: z.number().min(0).max(1),
      }),
    )
    .min(1)
    .max(8),
  total_kcal: amount,
  total_protein_g: amount,
  total_carbs_g: amount,
  total_fat_g: amount,
  quality_score: z.number().min(0).max(100),
  tips: z.array(short).min(2).max(4),
});
export const analysisOutputSchema = z.object({
  positives: z.array(short).max(4),
  negatives: z.array(short).max(4),
  improvements: z.array(short).max(4),
});
