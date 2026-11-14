import { athleteToday } from "@/lib/athlete-date.server";
import { z as runtimeSchema } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAi } from "@/lib/ai-gateway.server";
import { buildDailyCheckinSummaryPrompt } from "@/prompts/daily-checkin-summary.prompt";
import { buildDailyCheckinAnalysisPrompt } from "@/prompts/workout-analysis.prompt";
import type { Json } from "@/integrations/supabase/types";

interface AnalysisOutput {
  positives: string[];
  negatives: string[];
  improvements: string[];
}

/* ------------------------ DAILY CHECK-IN ------------------------ */

const DAILY_CHECKIN_CONTEXT_LIMIT = 30;
const checkinSchema = z.object({
  discipline: z.string().max(40).nullable(),
  is_rest_day: z.boolean(),

  // New Athletic IQ Daily Check-In fields
  workout_type: z.string().max(60).nullable(),
  session_details: z.string().max(1500).nullable(),
  performance_results: z.record(z.string(), z.unknown()).nullable(),
  rpe: z.number().int().min(1).max(10).nullable(),

  // Adds expectation context to RPE.
  expected_difficulty: z.string().max(60).nullable(),

  // Tracks whether performance quality improved, stayed stable or declined.
  performance_quality: z.string().max(60).nullable(),

  physical_feeling: z.number().int().min(1).max(5).nullable(),
  mental_state: z.string().max(80).nullable(),
  has_pain: z.boolean().nullable(),
  pain_note: z.string().max(500).nullable(),
  pain_area: z.string().max(80).nullable(),
  pain_severity: z.string().max(40).nullable(),
  performance_factors: z.array(z.string().max(80)).max(10),

  // Whether the main purpose of today's session was achieved.
  session_goal_achieved: z.string().max(40).nullable(),

  // Optional explanation for partially/not achieved session goals.
  session_goal_note: z.string().max(500).nullable(),

  extra_note: z.string().max(1000).nullable(),

  // Temporary legacy fields during migration
  duration_min: z.number().int().min(0).max(1440).nullable(),
  satisfaction: z.number().int().min(1).max(5).nullable(),
  last_meal_before: z.string().max(40).nullable(),
  ate_around_training: z.string().max(40).nullable(),
  food_note: z.string().max(1000).nullable(),
  water_intake: z.string().max(20).nullable(),
  sleep_hours: z.string().max(20).nullable(),
  sleep_quality: z.number().int().min(1).max(10).nullable(),
  woke_recovered: z.string().max(20).nullable(),
  overall_feeling: z.number().int().min(1).max(5).nullable(),
});

export const fetchTodayCheckin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const today = await athleteToday(supabase, userId);
    const { data, error } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", userId)
      .eq("checkin_date", today)
      .maybeSingle();
    if (error) throw new Error("Check-in konnte nicht geladen werden.");
    return { checkin: data ?? null };
  });

export const saveDailyCheckin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => checkinSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const today = await athleteToday(supabase, userId);

    const { data: result, error } = await supabase.rpc("record_checkin", {
      p_payload: data as Json,
      p_date: today,
    });
    if (error) throw new Error(error.message);
    const saved = runtimeSchema
      .object({
        checkin: runtimeSchema
          .object({ id: runtimeSchema.string(), updated_at: runtimeSchema.string() })
          .catchall(runtimeSchema.json()),
        workout: runtimeSchema
          .object({ id: runtimeSchema.string() })
          .catchall(runtimeSchema.json())
          .nullable(),
      })
      .parse(result);
    // Raw records are durable even when AI consent is absent, quota is exhausted,
    // or the provider fails. Analysis is optional enrichment.
    let boardId: string | null = null;
    if (saved.workout && !data.is_rest_day) {
      try {
        const { data: existing, error: existingError } = await supabase
          .from("analysis_boards")
          .select("id")
          .eq("workout_id", saved.workout.id)
          .eq("checkin_revision", saved.checkin.updated_at)
          .maybeSingle();
        if (existingError) throw existingError;
        if (existing) boardId = existing.id;
        else {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", userId)
            .single();
          const { data: history } = await supabase
            .from("daily_checkins")
            .select("checkin_date,context_summary")
            .eq("user_id", userId)
            .lt("checkin_date", today)
            .order("checkin_date", { ascending: false })
            .limit(DAILY_CHECKIN_CONTEXT_LIMIT);
          const analysis = await generateCheckinAnalysis(
            profile?.display_name ?? "Athlet",
            data,
            history ?? [],
          );
          const { data: id, error: analysisError } = await supabase.rpc("save_checkin_analysis", {
            p_checkin_id: saved.checkin.id,
            p_revision: saved.checkin.updated_at,
            p_analysis: analysis as unknown as Json,
          });
          if (analysisError) throw analysisError;
          boardId = id;
        }
      } catch {
        console.error("Check-in saved; AI analysis unavailable");
      }
    }
    return {
      checkin: saved.checkin,
      boardId,
      analysisStatus: boardId ? "completed" : "unavailable",
    };
  });

async function generateCheckinAnalysis(
  name: string,
  c: z.infer<typeof checkinSchema>,

  // Previous Daily Check-In summaries used as historical evidence.
  // There can be 0 to DAILY_CHECKIN_CONTEXT_LIMIT entries.
  previousCheckins: Array<{
    checkin_date: string;
    context_summary: string | null;
  }>,
): Promise<AnalysisOutput> {
  try {
    const ai = await callAi({
      model: "google/gemini-3.5-flash",
      messages: [
        {
          role: "system",
          content: buildDailyCheckinAnalysisPrompt(name, DAILY_CHECKIN_CONTEXT_LIMIT),
        },
        {
          role: "user",

          /*
          Prompt 2 receives TWO separate sources:

          1. today's full raw Daily Check-In
             -> best source for understanding today's session

          2. previous compact Daily Check-In summaries
             -> historical evidence for possible patterns/trends

          We keep them separate so Gemini knows which information
          describes TODAY and which information describes HISTORY.
          */
          content: JSON.stringify({
            today: c,
            previous_daily_checkins: previousCheckins,
          }),
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "post_checkin_analysis",
            parameters: {
              type: "object",
              properties: {
                positives: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 2 },
                negatives: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 2 },
                improvements: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 1,
                  maxItems: 2,
                },
              },
              required: ["positives", "negatives", "improvements"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "post_checkin_analysis" } },
    });
    const call = ai?.choices?.[0]?.message?.tool_calls?.[0];
    if (call)
      return z
        .object({
          positives: z.array(z.string().max(1000)).max(4),
          negatives: z.array(z.string().max(1000)).max(4),
          improvements: z.array(z.string().max(1000)).max(4),
        })
        .parse(JSON.parse(call.function.arguments));
  } catch (error) {
    console.error("Check-in AI analysis failed:", error);
    // fallthrough to fallback
  }
  throw new Error("AI analysis unavailable");
}

/* Dev helper: delete today's check-in so the button is clickable again */
export const deleteTodayCheckin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (process.env.NODE_ENV !== "development") throw new Error("Development only");
    const { supabase, userId } = context;
    const today = await athleteToday(supabase, userId);
    const { error } = await supabase
      .from("daily_checkins")
      .delete()
      .eq("user_id", userId)
      .eq("checkin_date", today);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
