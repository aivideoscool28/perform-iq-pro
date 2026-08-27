import { supabase } from "@/integrations/supabase/client";

export async function shareVideoAnalysisWithCoach(
  analysisId: string,
) {
  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  const {
    error,
  } = await supabase
    .from("video_analyses")
    .update({
      shared_with_coach: true,
      shared_with_coach_at:
        new Date().toISOString(),
    })
    .eq("id", analysisId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function unshareVideoAnalysisFromCoach(
  analysisId: string,
) {
  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  const {
    error,
  } = await supabase
    .from("video_analyses")
    .update({
      shared_with_coach: false,
      shared_with_coach_at: null,
    })
    .eq("id", analysisId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}
