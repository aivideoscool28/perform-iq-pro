import { supabase } from "@/integrations/supabase/client";

const DEV_COACH_ID =
  "8702a6f0-8e4b-45cb-88ef-51208375a28f";

/*
=============================================================================
CURRENT COACH
=============================================================================

DEVELOPMENT MODE:

Coach Manager currently uses the dedicated coach.demo profile.

This is intentional while Coach Manager authentication is still being
connected.

Later, when production coach authentication is complete, replace this with
the authenticated coach's user.id.
=============================================================================
*/
export async function getCurrentCoachId() {
  return DEV_COACH_ID;
}

export async function canCoachAccessAthlete(
  athleteId: string,
) {
  const coachId =
    await getCurrentCoachId();

  const { data, error } =
    await supabase
      .from("coach_athletes")
      .select("id")
      .eq("coach_id", coachId)
      .eq("athlete_id", athleteId)
      .maybeSingle();

  if (error) {
    console.error(
      "Could not verify coach-athlete access:",
      error,
    );

    return {
      allowed: false,
      error: error.message,
    };
  }

  return {
    allowed: Boolean(data),
    error: null,
  };
}
