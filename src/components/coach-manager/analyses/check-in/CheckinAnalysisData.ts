import { supabase } from "@/integrations/supabase/client";
import {
  getCurrentCoachId,
} from "@/lib/coach-manager/coach-athlete-access";

import type {
  Tables,
} from "@/integrations/supabase/types";

export type CoachCheckin =
  Tables<"daily_checkins">;

export type CoachAthlete = {
  id: string;
  display_name: string | null;
};

export type CoachCheckinData = {
  athleteIds: string[];
  athletes: CoachAthlete[];
  checkins: CoachCheckin[];
};

export async function getCoachCheckinData(): Promise<CoachCheckinData> {
  const coachId =
    await getCurrentCoachId();

  /*
  ==============================================================
  1. ATHLETES CONNECTED TO THE CURRENT COACH
  ==============================================================
  */
  const {
    data: relationships,
    error: relationshipError,
  } = await supabase
    .from("coach_athletes")
    .select("athlete_id")
    .eq("coach_id", coachId);

  if (relationshipError) {
    throw new Error(
      `Could not load coach-athlete relationships: ${relationshipError.message}`,
    );
  }

  const athleteIds =
    (relationships ?? [])
      .map(
        (relationship) =>
          relationship.athlete_id,
      )
      .filter(
        (id): id is string =>
          Boolean(id),
      );

  if (athleteIds.length === 0) {
    return {
      athleteIds: [],
      athletes: [],
      checkins: [],
    };
  }

  /*
  ==============================================================
  2. ATHLETE NAMES
  ==============================================================
  */
  const {
    data: profiles,
    error: profilesError,
  } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", athleteIds);

  if (profilesError) {
    throw new Error(
      `Could not load athlete profiles: ${profilesError.message}`,
    );
  }

  /*
  ==============================================================
  3. DAILY CHECK-INS
  ==============================================================
  */
  const {
    data: checkins,
    error: checkinsError,
  } = await supabase
    .from("daily_checkins")
    .select("*")
    .in("user_id", athleteIds)
    .eq("is_rest_day", false)
    .order(
      "checkin_date",
      {
        ascending: false,
      },
    );

  if (checkinsError) {
    throw new Error(
      `Could not load Daily Check-Ins: ${checkinsError.message}`,
    );
  }

  return {
    athleteIds,

    athletes:
      (profiles ??
        []) as CoachAthlete[],

    checkins:
      checkins ?? [],
  };
}
