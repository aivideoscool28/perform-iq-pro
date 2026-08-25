import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "@/integrations/supabase/client";

import type {
  Tables,
} from "@/integrations/supabase/types";


export type CoachNoteRow =
  Tables<"coach_notes">;

export type CoachNoteWithRecipients =
  CoachNoteRow & {
    recipientIds: string[];
  };


export type CreateCoachNoteInput = {
  athlete_id:
    string | null;

  recipient_ids:
    string[];

  kind:
    "note" |
    "measurement" |
    "follow-up";

  note_type?:
    string | null;

  content:
    string;

  visibility?:
    "Private" |
    "Athlete" |
    "Staff";

  linked_session?:
    string | null;

  measurement_type?:
    string | null;

  measurement_value?:
    number | null;

  measurement_unit?:
    string | null;

  measurement_method?:
    string | null;

  follow_up_when?:
    string | null;
};


export function useCoachNotes() {
  const [
    notes,
    setNotes,
  ] =
    useState<
      CoachNoteWithRecipients[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );


  const loadNotes =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError(null);

          const {
            data: userData,
            error: userError,
          } =
            await supabase.auth.getUser();

          if (userError) {
            throw userError;
          }

          if (!userData.user) {
            setNotes([]);
            return;
          }

          const {
            data,
            error: notesError,
          } =
            await supabase
              .from("coach_notes")
              .select(`
                *,
                coach_note_recipients (
                  athlete_id
                )
              `)
              .eq(
                "coach_id",
                userData.user.id,
              )
              .order(
                "created_at",
                {
                  ascending: false,
                },
              );

          if (notesError) {
            throw notesError;
          }

          const normalized =
            (data ?? []).map(
              (note) => ({
                ...note,

                recipientIds:
                  (
                    note.coach_note_recipients ??
                    []
                  ).map(
                    (recipient) =>
                      recipient.athlete_id,
                  ),
              }),
            );

          setNotes(normalized);
        } catch (caughtError) {
          console.error(
            "Could not load coach notes:",
            caughtError,
          );

          const message =
            caughtError instanceof Error
              ? caughtError.message
              : typeof caughtError === "object" &&
                  caughtError !== null &&
                  "message" in caughtError
                ? String(
                    (caughtError as { message?: unknown }).message,
                  )
                : JSON.stringify(caughtError);

          setError(message);
        } finally {
          setLoading(false);
        }
      },
      [],
    );


  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);


  const createNote =
    useCallback(
      async (
        input:
          CreateCoachNoteInput,
      ) => {
        const {
          data: userData,
          error: userError,
        } =
          await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!userData.user) {
          throw new Error(
            "You must be signed in.",
          );
        }

        const {
          data: createdNote,
          error: insertError,
        } =
          await supabase
            .from("coach_notes")
            .insert({
              coach_id:
                userData.user.id,

              athlete_id:
                input.athlete_id,

              kind:
                input.kind,

              note_type:
                input.note_type ??
                null,

              content:
                input.content,

              visibility:
                input.visibility ??
                "Private",

              linked_session:
                input.linked_session ??
                null,

              measurement_type:
                input.measurement_type ??
                null,

              measurement_value:
                input.measurement_value ??
                null,

              measurement_unit:
                input.measurement_unit ??
                null,

              measurement_method:
                input.measurement_method ??
                null,

              follow_up_when:
                input.follow_up_when ??
                null,
            })
            .select("id")
            .single();

        if (insertError) {
          throw insertError;
        }

        if (
          input.visibility === "Athlete" &&
          input.recipient_ids.length > 0
        ) {
          const {
            error: recipientError,
          } =
            await supabase
              .from(
                "coach_note_recipients",
              )
              .insert(
                input.recipient_ids.map(
                  (athleteId) => ({
                    note_id:
                      createdNote.id,

                    athlete_id:
                      athleteId,
                  }),
                ),
              );

          if (recipientError) {
            await supabase
              .from("coach_notes")
              .delete()
              .eq(
                "id",
                createdNote.id,
              );

            throw recipientError;
          }
        }

        await loadNotes();
      },
      [loadNotes],
    );


  const togglePin =
    useCallback(
      async (
        note:
          CoachNoteWithRecipients,
      ) => {
        const {
          error: updateError,
        } =
          await supabase
            .from("coach_notes")
            .update({
              pinned:
                !note.pinned,
            })
            .eq(
              "id",
              note.id,
            );

        if (updateError) {
          throw updateError;
        }

        await loadNotes();
      },
      [loadNotes],
    );


  const toggleFollowUp =
    useCallback(
      async (
        note:
          CoachNoteWithRecipients,
      ) => {
        const {
          error: updateError,
        } =
          await supabase
            .from("coach_notes")
            .update({
              follow_up_completed:
                !note.follow_up_completed,
            })
            .eq(
              "id",
              note.id,
            );

        if (updateError) {
          throw updateError;
        }

        await loadNotes();
      },
      [loadNotes],
    );


  const deleteNote =
    useCallback(
      async (
        id: string,
      ) => {
        const {
          error: deleteError,
        } =
          await supabase
            .from("coach_notes")
            .delete()
            .eq(
              "id",
              id,
            );

        if (deleteError) {
          throw deleteError;
        }

        await loadNotes();
      },
      [loadNotes],
    );


  return {
    notes,
    loading,
    error,

    createNote,
    togglePin,
    toggleFollowUp,
    deleteNote,

    reload:
      loadNotes,
  };
}

