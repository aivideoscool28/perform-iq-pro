import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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


