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
  duration_min: z.number().int().nullable(),
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
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", userId)
      .eq("checkin_date", today)
      .maybeSingle();
    return { checkin: data ?? null };
  });

export const saveDailyCheckin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => checkinSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const today = new Date().toISOString().slice(0, 10);

    // Build compact factual context summary for future Athletic IQ analyses.
    let context_summary: string | null = null;

    try {
      const ai = await callAi({
        model: "google/gemini-3.5-flash",
        messages: [
          {
            role: "system",
            content: buildDailyCheckinSummaryPrompt(DAILY_CHECKIN_CONTEXT_LIMIT),
          },
          {
            role: "user",
            content: JSON.stringify(data),
          },
        ],
      });

      const reply = ai?.choices?.[0]?.message?.content;

      if (typeof reply === "string" && reply.trim()) {
        context_summary = reply.trim().slice(0, 200);
      }
    } catch (error) {
      console.error("Daily Check-In context summary failed:", error);
    }

    const { data: row, error } = await supabase
      .from("daily_checkins")
      .upsert(
        {
          ...data,
          performance_results: data.performance_results as Json | null,
          user_id: userId,
          checkin_date: today,
          context_summary,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,checkin_date" },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Auto-create workout + analysis board for training days
    let boardId: string | null = null;
    if (!data.is_rest_day && data.discipline) {
      try {
        // Resolve athlete name for personal touch
        const { data: profile } = await supabase
          .from("profiles").select("display_name").eq("id", userId).maybeSingle();
        const name = profile?.display_name ?? "Athlet";

        const intensity: "low" | "moderate" | "high" =
          (data.rpe ?? 0) >= 8 ? "high" : (data.rpe ?? 0) >= 5 ? "moderate" : "low";
        const summary = `${data.discipline}-Training`;

        // Keep only one auto check-in workout per day
        await supabase.from("workouts")
          .delete().eq("user_id", userId).eq("workout_date", today)
          .eq("raw_input", `Daily check-in: ${data.discipline}`);

        const { data: workout } = await supabase
          .from("workouts")
          .insert({
            user_id: userId,
            workout_date: today,
            summary,
            duration_minutes: data.duration_min,
            intensity,
            raw_input: `Daily check-in: ${data.discipline}`,
          })
          .select()
          .single();

        if (workout) {
          /*
          ===============================================================
                     LOAD DAILY CHECK-IN HISTORY
          ===============================================================

          Prompt 2 should understand today's training in the context of
          the athlete's recent Daily Check-Ins.

          Rules:
          - Only load check-ins belonging to this athlete.
          - Only load days BEFORE today.
          - Ignore rows without a context_summary.
          - Load newest summaries first.
          - Never load more than DAILY_CHECKIN_CONTEXT_LIMIT.
          - If the athlete has fewer summaries, simply use those available.

          Examples:
          Check-in #1  -> 0 previous summaries
          Check-in #5  -> 4 previous summaries
          Check-in #31 -> 30 previous summaries
          ===============================================================
          */
          const { data: previousCheckins, error: historyError } =
            await supabase
              .from("daily_checkins")
              .select("checkin_date, context_summary")
              .eq("user_id", userId)
              .lt("checkin_date", today)
              .not("context_summary", "is", null)
              .order("checkin_date", { ascending: false })
              .limit(DAILY_CHECKIN_CONTEXT_LIMIT);

          if (historyError) {
            console.error(
              "Could not load previous Daily Check-In summaries:",
              historyError,
            );
          }

          // Always pass an array to Prompt 2.
          // If history loading fails or no previous logs exist, use [].
          const history = previousCheckins ?? [];

          /*
          TEMPORARY HISTORY DEBUG

          Prints exactly what Prompt 2 receives from previous Daily Check-Ins.
          Remove after historical-context testing is finished.
          */
          console.log("DAILY CHECK-IN HISTORY SENT TO PROMPT 2:", {
            count: history.length,
            history,
          });

          const analysis = await generateCheckinAnalysis(
            name,
            data,
            history,
          );
          const { data: b } = await supabase
            .from("analysis_boards")
            .insert({
              workout_id: workout.id,
              user_id: userId,
              positives: analysis.positives,
              negatives: analysis.negatives,
              improvements: analysis.improvements,
              is_ai_generated: true,
            })
            .select()
            .single();
          boardId = b?.id ?? null;
        }
      } catch (error) {
        console.error("generateCheckinAnalysis FAILED:", error);
        // non-fatal: check-in already saved
      }
    }
    return { checkin: row, boardId };
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
    console.log("CHECK-IN DATA SENT TO AI:", c);
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
                positives: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
                negatives: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 3 },
                improvements: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 3 },
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
    if (call) return JSON.parse(call.function.arguments);
  } catch (error) {
    console.error("Check-in AI analysis failed:", error);
    // fallthrough to fallback
  }
  return {
    positives: ["Session sehr komisch dokumentiert — gute Selbstreflexion.", "Du bleibst dran, das zahlt sich aus."],
    negatives: ["Mehr Details würden die Analyse präziser machen."],
    improvements: ["Nächstes Mal RPE direkt nach der Session notieren.", "Hydration über den Tag verteilt tracken."],
  };
}
  

/* Dev helper: delete today's check-in so the button is clickable again */
export const deleteTodayCheckin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase
      .from("daily_checkins")
      .delete()
      .eq("user_id", userId)
      .eq("checkin_date", today);
    if (error) throw new Error(error.message);
    return { ok: true };
  });









