import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
