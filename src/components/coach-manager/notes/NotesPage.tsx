import {
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  Clock3,
  FileText,
  Pin,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import {
  useCoachAthletes,
} from "@/hooks/useCoachAthletes";

import {
  useCoachNotes,
  type CoachNoteRow,
} from "@/hooks/coach-manager/useCoachNotes";


type MainTab =
  | "all"
  | "measurements"
  | "follow-ups";

type CreateMode =
  | "note"
  | "measurement"
  | "follow-up";


function formatDate(
  value:
    string,
) {
  return new Intl.DateTimeFormat(
    "en",
    {
      month:
        "short",
      day:
        "numeric",
      year:
        "numeric",
    },
  ).format(
    new Date(
      value,
    ),
  );
}


function formatTime(
  value:
    string,
) {
  return new Intl.DateTimeFormat(
    "en",
    {
      hour:
        "2-digit",
      minute:
        "2-digit",
    },
  ).format(
    new Date(
      value,
    ),
  );
}


function NoteRow({
  note,
  athleteName,
  onTogglePin,
  onToggleFollowUp,
  onDelete,
}: {
  note:
    CoachNoteRow;

  athleteName:
    string;

  onTogglePin:
    () => void;

  onToggleFollowUp:
    () => void;

  onDelete:
    () => void;
}) {
  const Icon =
    note.kind ===
    "measurement"
      ? Clock3
      : note.kind ===
          "follow-up"
        ? CheckCircle2
        : FileText;

  return (
    <div className="border-b border-border/60 px-3 py-3">
      <div className="flex items-start gap-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-violet-50">
          <Icon className="h-4 w-4 text-violet-600" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[9px] font-bold">
              {
                athleteName
              }
            </p>

            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[6px] font-semibold text-slate-600">
              {
                note.kind
              }
            </span>

            {note.visibility !==
              "Private" && (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[6px] font-semibold text-green-700">
                {
                  note.visibility
                }
              </span>
            )}
          </div>

          <p className="mt-1 text-[8px] leading-relaxed">
            {
              note.content
            }
          </p>

          {note.kind ===
            "measurement" && (
            <div className="mt-2 flex gap-3 text-[7px] text-muted-foreground">
              {note.measurement_type && (
                <span>
                  {
                    note.measurement_type
                  }
                </span>
              )}

              {note.measurement_value !==
                null && (
                <span className="font-semibold text-violet-700">
                  {
                    note.measurement_value
                  }{" "}
                  {
                    note.measurement_unit ??
                    ""
                  }
                </span>
              )}

              {note.measurement_method && (
                <span>
                  {
                    note.measurement_method
                  }
                </span>
              )}
            </div>
          )}

          {note.kind ===
            "follow-up" && (
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={
                  onToggleFollowUp
                }
                className={[
                  "rounded-full px-2 py-1 text-[6px] font-semibold",
                  note.follow_up_completed
                    ? "bg-green-50 text-green-700"
                    : "bg-orange-50 text-orange-700",
                ].join(
                  " ",
                )}
              >
                {note.follow_up_completed
                  ? "Completed"
                  : "Open"}
              </button>

              {note.follow_up_when && (
                <span className="text-[7px] text-muted-foreground">
                  {
                    note.follow_up_when
                  }
                </span>
              )}
            </div>
          )}

          <p className="mt-2 text-[6px] text-muted-foreground">
            {formatDate(
              note.created_at,
            )}{" "}
            ·{" "}
            {formatTime(
              note.created_at,
            )}
          </p>
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={
              onTogglePin
            }
            className={[
              "grid h-7 w-7 place-items-center rounded-lg",
              note.pinned
                ? "bg-violet-50 text-violet-600"
                : "text-muted-foreground hover:bg-muted/20",
            ].join(
              " ",
            )}
          >
            <Pin
              className={[
                "h-3.5 w-3.5",
                note.pinned
                  ? "fill-violet-500"
                  : "",
              ].join(
                " ",
              )}
            />
          </button>

          <button
            type="button"
            onClick={
              onDelete
            }
            className="grid h-7 w-7 place-items-center rounded-lg text-red-400 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}


export function NotesPage() {
  const {
    athletes,
  } =
    useCoachAthletes();

  const {
    notes,
    loading,
    error,
    createNote,
    togglePin,
    toggleFollowUp,
    deleteNote,
  } =
    useCoachNotes();

  const [
    mainTab,
    setMainTab,
  ] =
    useState<MainTab>(
      "all",
    );

  const [
    createMode,
    setCreateMode,
  ] =
    useState<CreateMode>(
      "note",
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    athleteId,
    setAthleteId,
  ] =
    useState("");

  const [
    publishMode,
    setPublishMode,
  ] =
    useState<"all" | "selected">("selected");

  const [
    selectedRecipientIds,
    setSelectedRecipientIds,
  ] =
    useState<string[]>([]);

  const [
    content,
    setContent,
  ] =
    useState("");

  const [
    noteType,
    setNoteType,
  ] =
    useState(
      "General Coach Note",
    );

  const [
    visibility,
    setVisibility,
  ] =
    useState<
      "Private" |
      "Athlete" |
      "Staff"
    >("Private");

  const [
    measurementType,
    setMeasurementType,
  ] =
    useState(
      "Flying 30m",
    );

  const [
    measurementValue,
    setMeasurementValue,
  ] =
    useState("");

  const [
    measurementUnit,
    setMeasurementUnit,
  ] =
    useState(
      "seconds",
    );

  const [
    measurementMethod,
    setMeasurementMethod,
  ] =
    useState(
      "Hand timed",
    );

  const [
    followUpWhen,
    setFollowUpWhen,
  ] =
    useState(
      "Next training",
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    saveError,
    setSaveError,
  ] =
    useState<
      string | null
    >(null);


  const athleteNameById =
    useMemo(
      () =>
        new Map(
          athletes.map(
            (
              athlete,
            ) => [
              athlete.id,
              athlete.display_name,
            ],
          ),
        ),
      [
        athletes,
      ],
    );


  const filteredNotes =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        return notes.filter(
          (
            note,
          ) => {
            if (
              mainTab ===
                "measurements" &&
              note.kind !==
                "measurement"
            ) {
              return false;
            }

            if (
              mainTab ===
                "follow-ups" &&
              note.kind !==
                "follow-up"
            ) {
              return false;
            }

            if (
              !query
            ) {
              return true;
            }

            const athleteName =
              note.athlete_id
                ? athleteNameById.get(
                    note.athlete_id,
                  ) ??
                  ""
                : "";

            return [
              note.content,
              note.note_type ??
                "",
              athleteName,
              note.measurement_type ??
                "",
            ].some(
              (
                value,
              ) =>
                value
                  .toLowerCase()
                  .includes(
                    query,
                  ),
            );
          },
        );
      },
      [
        notes,
        mainTab,
        search,
        athleteNameById,
      ],
    );


  const coachNotesCount =
    notes.filter(
      (
        note,
      ) =>
        note.kind ===
        "note",
    ).length;

  const measurementCount =
    notes.filter(
      (
        note,
      ) =>
        note.kind ===
        "measurement",
    ).length;

  const openFollowUps =
    notes.filter(
      (
        note,
      ) =>
        note.kind ===
          "follow-up" &&
        !note.follow_up_completed,
    ).length;

  const pinnedCount =
    notes.filter(
      (
        note,
      ) =>
        note.pinned,
    ).length;


  async function save() {
    if (
      !content.trim()
    ) {
      setSaveError(
        "Add some content first.",
      );

      return;
    }

    const recipientIds =
      visibility === "Athlete"
        ? publishMode === "all"
          ? athletes.map(
              (athlete) => athlete.id,
            )
          : selectedRecipientIds
        : [];

    if (
      visibility === "Athlete" &&
      recipientIds.length === 0
    ) {
      setSaveError(
        "Select at least one athlete to publish this note to.",
      );

      return;
    }

    try {
      setSaving(
        true,
      );

      setSaveError(
        null,
      );

      await createNote({
        athlete_id:
          visibility === "Athlete"
            ? null
            : athleteId || null,

        recipient_ids:
          recipientIds,

        kind:
          createMode,

        note_type:
          createMode ===
          "note"
            ? noteType
            : null,

        content:
          content.trim(),

        visibility,

        measurement_type:
          createMode ===
          "measurement"
            ? measurementType
            : null,

        measurement_value:
          createMode ===
            "measurement" &&
          measurementValue
            ? Number(
                measurementValue,
              )
            : null,

        measurement_unit:
          createMode ===
          "measurement"
            ? measurementUnit
            : null,

        measurement_method:
          createMode ===
          "measurement"
            ? measurementMethod
            : null,

        follow_up_when:
          createMode ===
          "follow-up"
            ? followUpWhen
            : null,
      });

      setContent(
        "",
      );

      setMeasurementValue(
        "",
      );
    } catch (
      caughtError
    ) {
      setSaveError(
        caughtError instanceof
          Error
          ? caughtError.message
          : "Could not save.",
      );
    } finally {
      setSaving(
        false,
      );
    }
  }


  if (
    loading
  ) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold">
          Loading Notes...
        </p>
      </div>
    );
  }


  if (
    error
  ) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-bold text-red-700">
          Notes could not be loaded
        </p>

        <p className="mt-1 text-xs text-red-600">
          {
            error
          }
        </p>
      </div>
    );
  }


  return (
    <div className="space-y-3">
      <section className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600">
            Notes
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Notes
          </h1>

          <p className="mt-1 text-xs text-muted-foreground">
            Capture coach knowledge, measurements and follow-up actions.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-2.5">
        {[
          {
            label: "Coach Notes",
            value: coachNotesCount,
            icon: FileText,
            style: "bg-violet-50 text-violet-600",
          },
          {
            label: "Measurements",
            value: measurementCount,
            icon: Clock3,
            style: "bg-orange-50 text-orange-600",
          },
          {
            label: "Open Follow-ups",
            value: openFollowUps,
            icon: CheckCircle2,
            style: "bg-green-50 text-green-600",
          },
          {
            label: "Pinned Notes",
            value: pinnedCount,
            icon: Pin,
            style: "bg-blue-50 text-blue-600",
          },
        ].map(({ label, value, icon: Icon, style }) => (
          <article
            key={label}
            className="rounded-2xl border border-border bg-white p-3 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className={`grid h-10 w-10 place-items-center rounded-xl ${style}`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[8px] font-semibold text-muted-foreground">
                  {label}
                </p>

                <p className="mt-0.5 text-xl font-bold">
                  {value}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="grid grid-cols-[1.1fr_0.9fr]">
          <div className="border-r border-border">
            <div className="flex items-center gap-6 border-b border-border px-3">
              {[
                [
                  "all",
                  "All Notes",
                ],
                [
                  "measurements",
                  "Measurements",
                ],
                [
                  "follow-ups",
                  "Follow-ups",
                ],
              ].map(
                ([
                  id,
                  label,
                ]) => (
                  <button
                    key={
                      id
                    }
                    type="button"
                    onClick={() =>
                      setMainTab(
                        id as MainTab,
                      )
                    }
                    className={[
                      "border-b-2 px-1 py-3 text-[9px] font-semibold",
                      mainTab ===
                      id
                        ? "border-violet-600 text-violet-700"
                        : "border-transparent text-muted-foreground",
                    ].join(
                      " ",
                    )}
                  >
                    {
                      label
                    }
                  </button>
                ),
              )}
            </div>

            <div className="border-b border-border p-3">
              <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />

                <input
                  value={
                    search
                  }
                  onChange={(
                    event,
                  ) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search notes..."
                  className="w-full bg-transparent text-[8px] outline-none"
                />
              </div>
            </div>

            {filteredNotes.length ===
            0 ? (
              <div className="px-4 py-10 text-center">
                <FileText className="mx-auto h-6 w-6 text-muted-foreground" />

                <p className="mt-2 text-[9px] font-semibold">
                  No notes yet
                </p>

                <p className="mt-1 text-[7px] text-muted-foreground">
                  Add your first coach note, measurement or follow-up.
                </p>
              </div>
            ) : (
              filteredNotes.map(
                (
                  note,
                ) => (
                  <NoteRow
                    key={
                      note.id
                    }
                    note={
                      note
                    }
                    athleteName={
                      note.athlete_id
                        ? athleteNameById.get(
                            note.athlete_id,
                          ) ??
                          "Unknown athlete"
                        : "General"
                    }
                    onTogglePin={() =>
                      void togglePin(
                        note,
                      )
                    }
                    onToggleFollowUp={() =>
                      void toggleFollowUp(
                        note,
                      )
                    }
                    onDelete={() => {
                      if (
                        window.confirm(
                          "Delete this note?",
                        )
                      ) {
                        void deleteNote(
                          note.id,
                        );
                      }
                    }}
                  />
                ),
              )
            )}
          </div>

          <div className="p-3">
            <p className="text-[9px] font-bold">
              Add New
            </p>

            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {[
                [
                  "note",
                  "Coach Note",
                ],
                [
                  "measurement",
                  "Measurement",
                ],
                [
                  "follow-up",
                  "Follow-up",
                ],
              ].map(
                ([
                  id,
                  label,
                ]) => (
                  <button
                    key={
                      id
                    }
                    type="button"
                    onClick={() =>
                      setCreateMode(
                        id as CreateMode,
                      )
                    }
                    className={[
                      "rounded-xl border px-3 py-2 text-[8px] font-semibold",
                      createMode ===
                      id
                        ? "border-violet-200 bg-violet-50 text-violet-700"
                        : "border-border text-muted-foreground",
                    ].join(
                      " ",
                    )}
                  >
                    {
                      label
                    }
                  </button>
                ),
              )}
            </div>

            <div className="mt-3">
              {visibility === "Athlete" ? (
                <>
                  <label className="text-[8px] font-semibold">
                    Publish to
                  </label>

                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPublishMode("all")
                      }
                      className={[
                        "rounded-xl border px-3 py-2 text-[8px] font-semibold",
                        publishMode === "all"
                          ? "border-violet-200 bg-violet-50 text-violet-700"
                          : "border-border text-muted-foreground",
                      ].join(" ")}
                    >
                      All linked athletes
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPublishMode("selected")
                      }
                      className={[
                        "rounded-xl border px-3 py-2 text-[8px] font-semibold",
                        publishMode === "selected"
                          ? "border-violet-200 bg-violet-50 text-violet-700"
                          : "border-border text-muted-foreground",
                      ].join(" ")}
                    >
                      Selected athletes
                    </button>
                  </div>

                  {publishMode === "all" ? (
                    <div className="mt-2 rounded-xl border border-green-100 bg-green-50/40 px-3 py-2">
                      <p className="text-[8px] font-semibold text-green-700">
                        {athletes.length} linked athlete
                        {athletes.length === 1 ? "" : "s"} will receive this note
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-xl border border-border p-2">
                      {athletes.length === 0 ? (
                        <p className="px-2 py-2 text-[8px] text-muted-foreground">
                          No linked athletes
                        </p>
                      ) : (
                        athletes.map((athlete) => {
                          const selected =
                            selectedRecipientIds.includes(
                              athlete.id,
                            );

                          return (
                            <label
                              key={athlete.id}
                              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-muted/20"
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() =>
                                  setSelectedRecipientIds(
                                    (current) =>
                                      selected
                                        ? current.filter(
                                            (id) =>
                                              id !== athlete.id,
                                          )
                                        : [
                                            ...current,
                                            athlete.id,
                                          ],
                                  )
                                }
                              />

                              <span className="text-[8px] font-medium">
                                {athlete.display_name}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <label className="text-[8px] font-semibold">
                    Context athlete
                  </label>

                  <select
                    value={athleteId}
                    onChange={(event) =>
                      setAthleteId(
                        event.target.value,
                      )
                    }
                    className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[8px]"
                  >
                    <option value="">
                      General / no athlete
                    </option>

                    {athletes.map((athlete) => (
                      <option
                        key={athlete.id}
                        value={athlete.id}
                      >
                        {athlete.display_name}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>

            {createMode ===
              "note" && (
              <div className="mt-3">
                <label className="text-[8px] font-semibold">
                  Note type
                </label>

                <select
                  value={
                    noteType
                  }
                  onChange={(
                    event,
                  ) =>
                    setNoteType(
                      event.target.value,
                    )
                  }
                  className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[8px]"
                >
                  <option>
                    Technical Observation
                  </option>

                  <option>
                    Training Observation
                  </option>

                  <option>
                    Athlete Context
                  </option>

                  <option>
                    Session Modification
                  </option>

                  <option>
                    Planning Idea
                  </option>

                  <option>
                    General Coach Note
                  </option>
                </select>
              </div>
            )}

            {createMode ===
              "measurement" && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <input
                  value={
                    measurementType
                  }
                  onChange={(
                    event,
                  ) =>
                    setMeasurementType(
                      event.target.value,
                    )
                  }
                  placeholder="Measurement type"
                  className="rounded-xl border border-border px-3 py-2.5 text-[8px]"
                />

                <input
                  type="number"
                  step="any"
                  value={
                    measurementValue
                  }
                  onChange={(
                    event,
                  ) =>
                    setMeasurementValue(
                      event.target.value,
                    )
                  }
                  placeholder="Result"
                  className="rounded-xl border border-border px-3 py-2.5 text-[8px]"
                />

                <input
                  value={
                    measurementUnit
                  }
                  onChange={(
                    event,
                  ) =>
                    setMeasurementUnit(
                      event.target.value,
                    )
                  }
                  placeholder="Unit"
                  className="rounded-xl border border-border px-3 py-2.5 text-[8px]"
                />

                <select
                  value={
                    measurementMethod
                  }
                  onChange={(
                    event,
                  ) =>
                    setMeasurementMethod(
                      event.target.value,
                    )
                  }
                  className="rounded-xl border border-border bg-white px-3 py-2.5 text-[8px]"
                >
                  <option>
                    Hand timed
                  </option>

                  <option>
                    Electronic timing
                  </option>

                  <option>
                    Video timing
                  </option>
                </select>
              </div>
            )}

            {createMode ===
              "follow-up" && (
              <div className="mt-3">
                <label className="text-[8px] font-semibold">
                  When?
                </label>

                <select
                  value={
                    followUpWhen
                  }
                  onChange={(
                    event,
                  ) =>
                    setFollowUpWhen(
                      event.target.value,
                    )
                  }
                  className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[8px]"
                >
                  <option>
                    Next training
                  </option>

                  <option>
                    Next session of this type
                  </option>

                  <option>
                    Before competition
                  </option>

                  <option>
                    Specific date
                  </option>
                </select>
              </div>
            )}

            <div className="mt-3">
              <label className="text-[8px] font-semibold">
                {createMode ===
                "follow-up"
                  ? "Follow-up action"
                  : createMode ===
                      "measurement"
                    ? "Observation"
                    : "Note"}
              </label>

              <textarea
                value={
                  content
                }
                onChange={(
                  event,
                ) =>
                  setContent(
                    event.target.value,
                  )
                }
                placeholder="Add coaching context..."
                className="mt-1.5 min-h-[100px] w-full resize-none rounded-xl border border-border p-3 text-[8px] outline-none"
              />
            </div>

            <div className="mt-3">
              <label className="text-[8px] font-semibold">
                Visibility
              </label>

              <select
                value={
                  visibility
                }
                onChange={(
                  event,
                ) =>
                  setVisibility(
                    event.target.value as
                      | "Private"
                      | "Athlete"
                      | "Staff",
                  )
                }
                className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[8px]"
              >
                <option value="Private">
                  Private (Coach only)
                </option>

                <option value="Athlete">
                  Athlete
                </option>

                <option value="Staff">
                  Staff
                </option>
              </select>
            </div>

            {saveError && (
              <p className="mt-2 text-[7px] text-red-600">
                {
                  saveError
                }
              </p>
            )}

            <button
              type="button"
              disabled={
                saving
              }
              onClick={() =>
                void save()
              }
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-[8px] font-semibold text-white disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />

              {saving
                ? "Saving..."
                : createMode ===
                    "measurement"
                  ? "Save Measurement"
                  : createMode ===
                      "follow-up"
                    ? "Save Follow-up"
                    : "Save Note"}
            </button>
          </div>
        </div>
      </section>

      <p className="text-center text-[7px] text-muted-foreground">
        Coach notes provide additional human context and remain separate from athlete-reported analysis data.
      </p>
    </div>
  );
}





