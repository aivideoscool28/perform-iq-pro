import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAi } from "@/lib/ai-gateway.server";
import { ONBOARDING_GOAL_REPLY_PROMPT } from "@/prompts/onboarding-goal-reply.prompt";

/* ------------------------ ONBOARDING ------------------------ */
export const saveOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      display_name: z.string().min(1).max(60),
      age: z.number().int().min(8).max(99),
      disciplines: z.array(z.string()).min(1).max(2),
      goal_text: z.string().min(2).max(500),
      goal_motivation: z.array(z.string().min(1).max(250)).min(1).max(2),
      current_focus: z.array(z.string().min(1).max(120)).min(1).max(2),
      experience: z.string().min(1).max(60),
      training_days_per_week: z.number().int().min(1).max(7),
      training_setup: z.string().min(1).max(80),
      injuries: z.string().max(1000).optional().nullable(),
      favouriteAthlete: z.string().max(100).optional().nullable(),
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
        goal_motivation: data.goal_motivation,
        current_focus: data.current_focus,
        experience: data.experience,
        training_days_per_week: data.training_days_per_week,
        training_setup: data.training_setup,
        injuries: data.injuries ?? null,
        favourite_athlete: data.favouriteAthlete?.trim()
          ? data.favouriteAthlete.trim()
          : null,
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
            content: ONBOARDING_GOAL_REPLY_PROMPT,
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








