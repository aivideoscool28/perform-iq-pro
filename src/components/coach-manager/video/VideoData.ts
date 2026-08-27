import { supabase } from "@/integrations/supabase/client";

import {
  getCurrentCoachId,
} from "@/lib/coach-manager/coach-athlete-access";

import type {
  Tables,
} from "@/integrations/supabase/types";

export type VideoAnalysisRow =
  Tables<"video_analyses">;

export type CoachVideoAthlete = {
  id: string;
  display_name: string | null;
};

export type CoachVideoData = {
  athleteIds: string[];
  athletes: CoachVideoAthlete[];
  analyses: VideoAnalysisRow[];
};

export async function getCoachVideoData(): Promise<CoachVideoData> {
  const coachId =
    await getCurrentCoachId();

  const {
    data: relationships,
    error: relationshipError,
  } = await supabase
    .from("coach_athletes")
    .select("athlete_id")
    .eq(
      "coach_id",
      coachId,
    );

  if (
    relationshipError
  ) {
    throw new Error(
      `Could not load coach-athlete relationships: ${relationshipError.message}`,
    );
  }

  const athleteIds =
    (
      relationships ??
      []
    )
      .map(
        (
          relationship,
        ) =>
          relationship.athlete_id,
      )
      .filter(
        (
          id,
        ): id is string =>
          Boolean(id),
      );

  if (
    athleteIds.length ===
    0
  ) {
    return {
      athleteIds: [],
      athletes: [],
      analyses: [],
    };
  }

  const [
    profilesResult,
    analysesResult,
  ] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, display_name",
        )
        .in(
          "id",
          athleteIds,
        ),

      supabase
        .from("video_analyses")
        .select("*")
        .in(
          "user_id",
          athleteIds,
        )
        .eq(
          "shared_with_coach",
          true,
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          },
        ),
    ]);

  if (
    profilesResult.error
  ) {
    throw new Error(
      `Could not load athlete profiles: ${profilesResult.error.message}`,
    );
  }

  if (
    analysesResult.error
  ) {
    throw new Error(
      `Could not load video analyses: ${analysesResult.error.message}`,
    );
  }

  return {
    athleteIds,

    athletes:
      (
        profilesResult.data ??
        []
      ) as CoachVideoAthlete[],

    analyses:
      analysesResult.data ??
      [],
  };
}

export async function getCoachVideoUrl(
  storagePath: string,
): Promise<string | null> {
  const {
    data,
    error,
  } = await supabase.storage
    .from("athlete-videos")
    .createSignedUrl(
      storagePath,
      60 * 60,
    );

  if (error) {
    console.error(
      "Could not create video URL:",
      error,
    );

    return null;
  }

  return (
    data?.signedUrl ??
    null
  );
}

export async function updateCoachVideoNotes(
  analysisId: string,
  coachNotes: string,
) {
  const {
    error,
  } = await supabase
    .from("video_analyses")
    .update({
      coach_notes:
        coachNotes.trim()
          ? coachNotes.trim()
          : null,
    })
    .eq(
      "id",
      analysisId,
    );

  if (error) {
    throw new Error(
      `Could not save coach notes: ${error.message}`,
    );
  }
}

