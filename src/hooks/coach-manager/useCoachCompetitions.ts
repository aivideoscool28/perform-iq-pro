import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type CoachCompetition = Tables<"competitions">;

export type CompetitionEntry =
  Tables<"competition_entries">;

export type CompetitionWithEntries =
  CoachCompetition & {
    entries: CompetitionEntry[];
  };

export type CreateCompetitionInput = {
  name: string;
  competition_date: string;
  competition_type?: string;
  location?: string | null;
  venue?: string | null;
  priority?: string | null;
  phase?: string;
  notes?: string | null;
};

export function useCoachCompetitions() {
  const [competitions, setCompetitions] = useState<
    CompetitionWithEntries[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null,
  );

  const loadCompetitions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      const user = userData.user;

      if (!user) {
        setCompetitions([]);
        return;
      }

      const {
        data,
        error: competitionError,
      } = await supabase
        .from("competitions")
        .select(`
          *,
          competition_entries (*)
        `)
        .eq("coach_id", user.id)
        .order("competition_date", {
          ascending: true,
        });

      if (competitionError) {
        throw competitionError;
      }

      const normalized: CompetitionWithEntries[] =
        (data ?? []).map((competition) => ({
          ...competition,
          entries:
            competition.competition_entries ?? [],
        }));

      setCompetitions(normalized);
    } catch (caughtError) {
      console.error(
        "Could not load coach competitions:",
        caughtError,
      );

      setCompetitions([]);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not load competitions.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCompetitions();
  }, [loadCompetitions]);

  const createCompetition = useCallback(
    async (input: CreateCompetitionInput) => {
      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      const user = userData.user;

      if (!user) {
        throw new Error(
          "You must be signed in to create a competition.",
        );
      }

      const {
        data,
        error: insertError,
      } = await supabase
        .from("competitions")
        .insert({
          coach_id: user.id,
          name: input.name,
          competition_date:
            input.competition_date,
          competition_type:
            input.competition_type ?? "MEETING",
          location: input.location ?? null,
          venue: input.venue ?? null,
          priority: input.priority ?? null,
          phase: input.phase ?? "Competition",
          notes: input.notes ?? null,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      await loadCompetitions();

      return data;
    },
    [loadCompetitions],
  );

  const updateCompetition = useCallback(
    async (
      competitionId: string,
      updates: Partial<
        Omit<CoachCompetition, "id" | "coach_id">
      >,
    ) => {
      const { error: updateError } =
        await supabase
          .from("competitions")
          .update(updates)
          .eq("id", competitionId);

      if (updateError) {
        throw updateError;
      }

      await loadCompetitions();
    },
    [loadCompetitions],
  );

  const deleteCompetition = useCallback(
    async (competitionId: string) => {
      const { error: deleteError } =
        await supabase
          .from("competitions")
          .delete()
          .eq("id", competitionId);

      if (deleteError) {
        throw deleteError;
      }

      await loadCompetitions();
    },
    [loadCompetitions],
  );

  const saveEntry = useCallback(
    async ({
      competitionId,
      athleteId,
      events,
      goal,
      notes,
      result,
    }: {
      competitionId: string;
      athleteId: string;
      events: string[];
      goal?: string | null;
      notes?: string | null;
      result?: string | null;
    }) => {
      const { error: entryError } =
        await supabase
          .from("competition_entries")
          .upsert(
            {
              competition_id: competitionId,
              athlete_id: athleteId,
              events,
              goal: goal ?? null,
              notes: notes ?? null,
              result: result ?? null,
            },
            {
              onConflict:
                "competition_id,athlete_id",
            },
          );

      if (entryError) {
        throw entryError;
      }

      await loadCompetitions();
    },
    [loadCompetitions],
  );

  const removeEntry = useCallback(
    async (
      competitionId: string,
      athleteId: string,
    ) => {
      const { error: deleteError } =
        await supabase
          .from("competition_entries")
          .delete()
          .eq(
            "competition_id",
            competitionId,
          )
          .eq("athlete_id", athleteId);

      if (deleteError) {
        throw deleteError;
      }

      await loadCompetitions();
    },
    [loadCompetitions],
  );

  return {
    competitions,
    loading,
    error,
    reload: loadCompetitions,
    createCompetition,
    updateCompetition,
    deleteCompetition,
    saveEntry,
    removeEntry,
  };
}
