import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAi } from "@/lib/ai-gateway.server";

interface ParsedWorkout {
  summary: string;
  exercises: Array<{ name: string; sets?: number; reps?: number; duration_minutes?: number; distance_km?: number; notes?: string }>;
  duration_minutes: number | null;
  intensity: "low" | "moderate" | "high" | null;
}

interface AnalysisOutput {
  positives: string[];
  negatives: string[];
  improvements: string[];
}



/* ------------------------ LOG WORKOUT FROM CHAT ------------------------ */
export const logWorkoutFromText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ text: z.string().min(2).max(2000) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const ai = await callAi({
      model: "google/gemini-3.5-flash",
      messages: [
        {
          role: "system",
          content:
            "You parse natural-language workout descriptions from athletes. Always reply in the same language as the user. Extract structured workout data and a short, motivating summary (max 1 sentence).",
        },
        { role: "user", content: data.text },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "log_workout",
            description: "Log the parsed workout.",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string", description: "Short motivating summary (1 sentence)" },
                duration_minutes: { type: ["integer", "null"] },
                intensity: { type: ["string", "null"], enum: ["low", "moderate", "high", null] },
                exercises: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      sets: { type: ["integer", "null"] },
                      reps: { type: ["integer", "null"] },
                      duration_minutes: { type: ["number", "null"] },
                      distance_km: { type: ["number", "null"] },
                      notes: { type: ["string", "null"] },
                    },
                    required: ["name"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["summary", "exercises", "duration_minutes", "intensity"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "log_workout" } },
    });

    const call = ai?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) throw new Error("AI returned no structured output");
    const parsed: ParsedWorkout = JSON.parse(call.function.arguments);

    const today = new Date().toISOString().slice(0, 10);
    const { data: workout, error } = await supabase
      .from("workouts")
      .insert({
        user_id: userId,
        workout_date: today,
        raw_input: data.text,
        exercises: parsed.exercises,
        duration_minutes: parsed.duration_minutes,
        intensity: parsed.intensity,
        summary: parsed.summary,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Auto-generate analysis
    const analysis = await generateAnalysisInternal(parsed, data.text);
    const { data: board, error: aErr } = await supabase
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
    if (aErr) throw new Error(aErr.message);

    return { workout, board };
  });

async function generateAnalysisInternal(workout: Partial<ParsedWorkout>, raw?: string | null): Promise<AnalysisOutput> {
  const ai = await callAi({
    model: "google/gemini-3.5-flash",
    messages: [
      {
        role: "system",
        content:
          "You are a warm, encouraging strength & conditioning coach for an athlete. Given a workout, produce a SHORT, PERSONAL analysis. Reply in the same language as the input. Each bullet should be a complete, specific sentence (max 14 words). Avoid generic platitudes.",
      },
      {
        role: "user",
        content: `Workout summary: ${workout.summary ?? ""}
Duration: ${workout.duration_minutes ?? "?"} min
Intensity: ${workout.intensity ?? "?"}
Exercises: ${JSON.stringify(workout.exercises ?? [])}
Raw note: ${raw ?? ""}`,
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "post_workout_analysis",
          parameters: {
            type: "object",
            properties: {
              positives: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
              negatives: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 3 },
              improvements: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
            },
            required: ["positives", "negatives", "improvements"],
            additionalProperties: false,
          },
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "post_workout_analysis" } },
  });
  const call = ai?.choices?.[0]?.message?.tool_calls?.[0];
  if (!call) return { positives: [], negatives: [], improvements: [] };
  return JSON.parse(call.function.arguments);
}
