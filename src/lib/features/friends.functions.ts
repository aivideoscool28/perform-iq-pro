import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* ------------------------ FRIENDS ------------------------ */
export const fetchFriends = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("fetch_friend_profiles");
    if (error) throw new Error("Friends could not be loaded");
    return { friends: data ?? [] };
  });

export const acceptInviteCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ code: z.string().min(3).max(32) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.rpc("accept_invite", { invite_code: data.code });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
