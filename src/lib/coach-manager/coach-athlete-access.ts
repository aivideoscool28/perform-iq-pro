import {
  supabase,
} from "@/integrations/supabase/client";


export async function getCurrentCoachId() {
  const {
    data: {
      user,
    },
    error,
  } =
    await supabase.auth
      .getUser();

  if (
    error ||
    !user
  ) {
    throw new Error(
      error?.message ??
        "No authenticated coach.",
    );
  }

  return user.id;
}


export async function canCoachAccessAthlete(
  athleteId: string,
) {
  try {
    const coachId =
      await getCurrentCoachId();

    const {
      data,
      error,
    } =
      await supabase
        .from(
          "coach_athletes",
        )
        .select(
          "id",
        )
        .eq(
          "coach_id",
          coachId,
        )
        .eq(
          "athlete_id",
          athleteId,
        )
        .maybeSingle();

    if (
      error
    ) {
      console.error(
        "Could not verify coach-athlete access:",
        error,
      );

      return {
        allowed:
          false,

        error:
          error.message,
      };
    }

    return {
      allowed:
        Boolean(
          data,
        ),

      error:
        data
          ? null
          : "This athlete is not linked to the current coach.",
    };
  } catch (
    error
  ) {
    console.error(
      "Could not determine current coach:",
      error,
    );

    return {
      allowed:
        false,

      error:
        error instanceof Error
          ? error.message
          : "Could not verify coach access.",
    };
  }
}
