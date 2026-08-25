import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/*
===============================================================
                  REGENERATION CHECK-IN
===============================================================

Separate from Daily Check-In.

The athlete reports three simple recovery signals:

1. Sleep quality
2. Muscle soreness
3. Energy level

Each value uses a 1–5 scale.

One regeneration check-in is stored per athlete per day.
===============================================================
*/

const regenerationSchema = z.object({
  sleep_quality: z.number().int().min(1).max(5),
  muscle_soreness: z.number().int().min(1).max(5),
  energy_level: z.number().int().min(1).max(5),
});

/*
---------------------------------------------------------------
GET TODAY'S REGENERATION CHECK-IN
---------------------------------------------------------------
*/

export const fetchTodayRegeneration = createServerFn({
  method: "GET",
})
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("regeneration_checkins")
      .select("*")
      .eq("user_id", userId)
      .eq("checkin_date", today)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return {
      regeneration: data ?? null,
    };
  });

/*
---------------------------------------------------------------
SAVE TODAY'S REGENERATION CHECK-IN
---------------------------------------------------------------
*/

export const saveRegeneration = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => regenerationSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const today = new Date().toISOString().slice(0, 10);

    const { data: row, error } = await supabase
      .from("regeneration_checkins")
      .upsert(
        {
          user_id: userId,
          checkin_date: today,

          sleep_quality: data.sleep_quality,
          muscle_soreness: data.muscle_soreness,
          energy_level: data.energy_level,

          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,checkin_date",
        },
      )
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      regeneration: row,
    };
  });

/*
---------------------------------------------------------------
GET REGENERATION HISTORY
---------------------------------------------------------------

Used later for:
- athlete trends
- Coach Manager regeneration analysis
- baselines
- repeated signals
- AI context
---------------------------------------------------------------
*/

export const fetchRegenerationHistory = createServerFn({
  method: "GET",
})
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data, error } = await supabase
      .from("regeneration_checkins")
      .select("*")
      .eq("user_id", userId)
      .order("checkin_date", {
        ascending: false,
      })
      .limit(30);

    if (error) {
      throw new Error(error.message);
    }

    return {
      regeneration: data ?? [],
    };
  });
