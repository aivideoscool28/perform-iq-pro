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

/* ------------------------ DASHBOARD ------------------------ */
export const fetchDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: workouts }, { data: boards }, { data: checkins }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("workouts").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      supabase.from("analysis_boards").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      supabase.from("daily_checkins").select("checkin_date,is_rest_day,discipline,ai_summary").eq("user_id", userId).order("checkin_date", { ascending: false }).limit(180),
    ]);
    const today = new Date().toISOString().slice(0, 10);
    const workedOutToday = (workouts ?? []).some((w) => w.workout_date === today);
    const computedStreak = computeStreakFromCheckins(checkins ?? []);
    return {
      profile,
      workouts: workouts ?? [],
      boards: boards ?? [],
      workedOutToday,
      checkins: checkins ?? [],
      computedStreak,
    };
  });

function computeStreakFromCheckins(
  rows: Array<{ checkin_date: string; is_rest_day: boolean | null }>,
): number {
  const map = new Map<string, boolean>(); // date -> is_rest_day
  for (const r of rows) map.set(r.checkin_date, !!r.is_rest_day);
  let streak = 0;
  let missed = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const iso = d.toISOString().slice(0, 10);
    if (map.has(iso)) {
      if (!map.get(iso)) streak += 1;
      missed = 0;
    } else {
      // Today not yet checked in: don't count as missed
      if (i > 0) {
        missed += 1;
        if (missed > 2) break;
      }
    }
    d.setDate(d.getDate() - 1);
  }
  return streak;
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

/* ------------------------ ANALYSIS UPDATE ------------------------ */
export const updateAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      id: z.string().uuid(),
      positives: z.array(z.string()).max(10),
      negatives: z.array(z.string()).max(10),
      improvements: z.array(z.string()).max(10),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("analysis_boards")
      .update({
        positives: data.positives,
        negatives: data.negatives,
        improvements: data.improvements,
        is_ai_generated: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ------------------------ ONBOARDING ------------------------ */
export const saveOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      display_name: z.string().min(1).max(60),
      age: z.number().int().min(8).max(99).nullable(),
      disciplines: z.array(z.string()).min(1).max(20),
      goal_text: z.string().min(1).max(500),
      experience: z.string().min(1).max(40),
      training_days_per_week: z.number().int().min(1).max(7),
      training_setup: z.string().min(1).max(40),
      injuries: z.string().max(1000).optional().nullable(),
      height_cm: z.number().min(50).max(260).nullable(),
      weight_kg: z.number().min(20).max(300).nullable(),
      avatar_url: z.string().max(500).optional().nullable(),
      favouriteAthlete: z.string().max(100).optional().nullable(),
      receiveNewsAndMotivation: z.boolean().optional().nullable(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: data.display_name,
        age: data.age,
        disciplines: data.disciplines,
        goals: [data.goal_text],
        goal_text: data.goal_text,
        experience: data.experience,
        training_days_per_week: data.training_days_per_week,
        training_setup: data.training_setup,
        injuries: data.injuries ?? null,
        height_cm: data.height_cm,
        weight_kg: data.weight_kg,
        avatar_url: data.avatar_url ?? null,
        favourite_athlete: data.favouriteAthlete?.trim() ? data.favouriteAthlete.trim() : null,
        receive_news_and_motivation: data.receiveNewsAndMotivation ?? true,
        onboarded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateProfilePersonalization = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      favouriteAthlete: z.string().max(100).optional().nullable(),
      receiveNewsAndMotivation: z.boolean().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update({
        favourite_athlete: data.favouriteAthlete?.trim() ? data.favouriteAthlete.trim() : null,
        receive_news_and_motivation: data.receiveNewsAndMotivation ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ------------------------ ONBOARDING: GOAL REPLY ------------------------ */
export const generateGoalReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ goal: z.string().min(2).max(500), name: z.string().max(60).optional() }).parse(input))
  .handler(async ({ data }) => {
    try {
      const ai = await callAi({
        model: "google/gemini-3.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are a warm, motivating athletics coach. The athlete just told you their personal goal. Reply with ONE short, encouraging, personalized sentence in German (max 18 words). Reference their goal specifically. No emojis at start, max one at end.",
          },
          { role: "user", content: `Name: ${data.name ?? "Athlet"}\nZiel: ${data.goal}` },
        ],
      });
      const reply = ai?.choices?.[0]?.message?.content;
      if (typeof reply === "string" && reply.trim()) return { reply: reply.trim() };
    } catch {
      // fall through
    }
    return { reply: "Starkes Ziel — lass uns das gemeinsam angehen! 💪" };
  });

/* ------------------------ PROFILE ------------------------ */
export const fetchMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);

    let avatar_signed_url: string | null = null;
    if (profile?.avatar_url) {
      const { data: signed } = await supabase.storage
        .from("avatars")
        .createSignedUrl(profile.avatar_url, 60 * 60 * 24);
      avatar_signed_url = signed?.signedUrl ?? null;
    }
    return { profile, avatar_signed_url };
  });

export const resetOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update({ onboarded_at: null, updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* Dev helper: reset the account to a "new user" state WITHOUT touching the
   onboarding profile (name, discipline, goals, body data, photo). Wipes
   check-ins, streak and analysis history so the empty dashboard + tour show. */
export const resetToNewUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [checkins, boards, workouts] = await Promise.all([
      supabase.from("daily_checkins").delete().eq("user_id", userId),
      supabase.from("analysis_boards").delete().eq("user_id", userId),
      supabase.from("workouts").delete().eq("user_id", userId),
    ]);
    const delErr = checkins.error || boards.error || workouts.error;
    if (delErr) throw new Error(delErr.message);

    const { error } = await supabase
      .from("profiles")
      .update({
        current_streak: 0,
        longest_streak: 0,
        last_workout_date: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) throw new Error(error.message);

    return { ok: true };
  });

/* ------------------------ FRIENDS ------------------------ */
export const fetchFriends = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: links } = await supabase
      .from("friendships")
      .select("friend_id")
      .eq("user_id", userId)
      .eq("status", "accepted");
    const ids = (links ?? []).map((l) => l.friend_id);
    if (ids.length === 0) return { friends: [] };
    const { data: friends } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, current_streak, longest_streak, last_workout_date")
      .in("id", ids);
    return { friends: friends ?? [] };
  });

export const acceptInviteCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ code: z.string().min(3).max(32) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.rpc("accept_invite", { invite_code: data.code });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ------------------------ FOOD SCANNER (AI VISION) ------------------------ */
export const analyzeFoodImage = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      image: z.string().min(50).max(8_000_000), // data:image/...;base64,...
      note: z.string().max(500).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const ai = await callAi({
      model: "google/gemini-3.5-flash",
      messages: [
        {
          role: "system",
          content:
            "You are a sports nutrition AI. Analyse the food on the photo. Estimate portions (in grams), kcal and macros for an elite athlete. Be specific, friendly and concise. Reply in the user's language (default German). Always call the `report_food` tool.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: data.note ? `Notiz: ${data.note}` : "Was ist auf dem Foto? Schätze Portionen, Kalorien und Makros." },
            { type: "image_url", image_url: { url: data.image } },
          ],
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "report_food",
            description: "Return the recognised food items and a coaching summary.",
            parameters: {
              type: "object",
              properties: {
                meal_name: { type: "string", description: "Short label for the meal, e.g. 'Hähnchen-Bowl'" },
                items: {
                  type: "array",
                  minItems: 1,
                  maxItems: 8,
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      portion_g: { type: "number" },
                      kcal: { type: "number" },
                      protein_g: { type: "number" },
                      carbs_g: { type: "number" },
                      fat_g: { type: "number" },
                      confidence: { type: "number", description: "0..1" },
                    },
                    required: ["name", "portion_g", "kcal", "protein_g", "carbs_g", "fat_g", "confidence"],
                    additionalProperties: false,
                  },
                },
                total_kcal: { type: "number" },
                total_protein_g: { type: "number" },
                total_carbs_g: { type: "number" },
                total_fat_g: { type: "number" },
                quality_score: { type: "number", description: "0..100 nutritional quality for an athlete" },
                tips: {
                  type: "array",
                  minItems: 2,
                  maxItems: 4,
                  items: { type: "string", description: "Short, specific coaching tip" },
                },
              },
              required: [
                "meal_name", "items", "total_kcal", "total_protein_g",
                "total_carbs_g", "total_fat_g", "quality_score", "tips",
              ],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "report_food" } },
    });

    const call = ai?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) throw new Error("AI returned no structured output");
    return JSON.parse(call.function.arguments);
  });

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
  physical_feeling: z.number().int().min(1).max(5).nullable(),
  mental_state: z.string().max(80).nullable(),
  has_pain: z.boolean().nullable(),
  pain_note: z.string().max(500).nullable(),
  pain_area: z.string().max(80).nullable(),
  pain_severity: z.string().max(40).nullable(),
  performance_factors: z.array(z.string().max(80)).max(10),
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
            content: `
You create a compact factual historical summary from ONE Athletic IQ Daily Check-In.

LANGUAGE:
German.

PURPOSE:
This summary will be stored as one historical Daily Check-In log.
Future Workout Analyses may receive up to the latest ${DAILY_CHECKIN_CONTEXT_LIMIT} previous summaries.

LENGTH:
Target: 100–160 characters.
Hard maximum: 200 characters.
Use fewer characters when there is little important information.

WHAT TO INCLUDE:
Do NOT repeat every Daily Check-In answer.

Select only information that may be useful for understanding the athlete later.

Prioritize when relevant:
- workout type and important session details
- measurable performance/results
- RPE
- physical feeling
- meaningful mental-state signals
- pain/discomfort and severity
- important reported performance factors

RULES:
- Use only information explicitly supplied in today's Daily Check-In.
- Be factual and compact.
- Never invent missing information.
- Do not explain WHY something happened.
- Do not claim causation.
- Do not call one session a trend.
- Do not classify something as unusually high, low, improving or worsening based on this check-in alone.
- Omit low-value information when space is limited.
- No coaching advice.
- No motivational filler.
- No emojis.
- Maximum 200 characters.

EXAMPLE:
"4×30m Beschleunigung, RPE 8. Körperlich 3/5 und Stress gemeldet; keine Schmerzen, Zeiten 4,18–4,25 s."
`,
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
          content: `You are Athletic IQ's German post-training analysis assistant for ${name}.

Analyze TODAY'S full Daily Check-In together with the supplied historical Daily Check-In summaries.

You may receive between 0 and ${DAILY_CHECKIN_CONTEXT_LIMIT} previous summaries.

If only a few previous summaries exist, work only with those.
Never assume missing historical data exists.

OUTPUT:
Return:
- positives
- negatives
- improvements

Each bullet must:
- be written in German
- be a complete sentence
- contain maximum 20 words
- be specific to supplied athlete data
- add interpretation or useful direction
- NOT merely repeat what the athlete entered

CARD PURPOSES:

POSITIVES:
Answer:
"What from today's session appears worth keeping or reproducing?"

Do not use a positive merely because the athlete completed the session.
Explain why the positive matters for this specific workout.

NEGATIVES:
Answer:
"What is the most important thing that deserves attention, and why does it matter?"

Do not simply repeat values such as RPE, mental state or pain.
Interpret why the signal may matter for this discipline/workout, while staying cautious.

IMPROVEMENTS:
Answer:
"What exactly should the athlete do, observe or measure next time?"

Give concrete and testable next actions.
Prefer one specific cue, observation, rating, measurement or routine over generic advice.

Examples of good specificity:
- rate hurdle rhythm after each repetition
- record sprint times for each rep
- use the same pre-start cue before every attempt
- note when focus drops during the session

ANALYSIS RULES:

1. TODAY
Use today's full Daily Check-In as the primary source for today's session.

2. PERFORMANCE FIRST
When measurable performance/results are available, prioritize them over generic wellbeing observations.

3. WORKOUT-SPECIFIC REASONING
Connect the analysis to the athlete's discipline and workout type.

For hurdles, relevant concepts may include:
- rhythm
- consistency between repetitions
- start approach
- concentration during technical repetitions

For sprint, relevant concepts may include:
- acceleration
- consistency of times
- performance across repetitions
- perceived effort relative to results

IMPORTANT:
Do NOT claim you observed technical details that were not supplied.
Daily Check-In analysis is not Video Analysis.

4. HISTORY
Use previous summaries to identify repeated patterns, changes and noteworthy developments.

Look especially for:
- changes in measurable performance
- repeated high or low RPE
- changes in physical feeling
- repeated mental-state signals
- recurring pain/discomfort
- repeated performance factors

5. COMPARABLE PERFORMANCE
When comparing specific performance results, compare them primarily with genuinely comparable previous sessions.

Do not directly compare performance measurements from fundamentally different workout types.

6. TRENDS
One check-in is NOT a trend.

Only describe something as improving, worsening, recurring or unusual when supplied historical evidence supports it.

If there is insufficient history, do not invent a trend.

7. CORRELATION IS NOT CAUSATION
Never claim that stress, sleep, pain, motivation, weather or another factor definitely caused a performance change simply because they occurred together.

8. UNCERTAINTY
Clearly distinguish between:
- facts
- observed patterns
- possible interpretations

For uncertain interpretations use cautious language such as:
- "fällt auf"
- "könnte darauf hindeuten"
- "möglicherweise"
- "es lohnt sich zu beobachten"
- "wenn sich dieses Muster wiederholt"

9. PAIN
Never diagnose injuries from Daily Check-In data.

Pain is an athlete-reported signal.
If pain is recurring, increasing or severe, mention that it deserves attention rather than diagnosing its cause.

10. NO INVENTION
Never invent athlete data, technical observations, previous results, trends or explanations unsupported by supplied information.

11. TONE
Be concise, analytical and useful.
Avoid generic praise.
Avoid simply mirroring the athlete's answers.

FINAL QUALITY CHECK BEFORE ANSWERING:
For every bullet ask:
"Does this tell the athlete something useful that they did not already know from entering the check-in?"

If not, improve the bullet.
`,
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
  