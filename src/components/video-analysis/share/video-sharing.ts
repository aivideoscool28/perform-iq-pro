import { supabase } from "@/integrations/supabase/client";

export async function shareVideoWithCoach(
  analysisId: string,
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      userError?.message ?? "Nicht angemeldet.",
    );
  }

  const { error } = await supabase
    .from("video_analyses")
    .update({
      shared_with_coach: true,
      shared_with_coach_at: new Date().toISOString(),
    })
    .eq("id", analysisId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}
