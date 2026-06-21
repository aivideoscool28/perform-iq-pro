import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const fetchGear = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: logs }] = await Promise.all([
      supabase.from("gear_profile").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("gear_logs").select("*").eq("user_id", userId).order("started_on", { ascending: false }).limit(50),
    ]);
    return { profile, logs: logs ?? [] };
  });

export const upsertGearProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      shoe_size_eu: z.number().min(20).max(60).nullable().optional(),
      foot_width: z.string().max(40).nullable().optional(),
      preferred_brands: z.array(z.string().min(1).max(40)).max(20).optional(),
      notes: z.string().max(1000).nullable().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("gear_profile")
      .upsert({ user_id: userId, ...data }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addGearLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      brand: z.string().min(1).max(40),
      model: z.string().min(1).max(80),
      discipline: z.string().max(40).nullable().optional(),
      started_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      distance_km: z.number().int().min(0).max(20000).nullable().optional(),
      notes: z.string().max(500).nullable().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("gear_logs").insert({ user_id: userId, ...data });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteGearLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("gear_logs").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
