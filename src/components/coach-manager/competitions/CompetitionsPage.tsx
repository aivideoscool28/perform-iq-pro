import {
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  ChevronRight,
  Flag,
  MapPin,
  Plus,
  Search,
  Trash2,
  Trophy,
  Users,
  X,
} from "lucide-react";

import {
  useCoachCompetitions,
  type CompetitionWithEntries,
} from "@/hooks/coach-manager/useCoachCompetitions";

import {
  useCoachAthletes,
} from "@/hooks/useCoachAthletes";


function formatCompetitionDate(
  date: string,
) {
  return new Intl.DateTimeFormat(
    "en",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(
    new Date(
      `${date}T12:00:00`,
    ),
  );
}


function getDateParts(
  date: string,
) {
  const parsed =
    new Date(
      `${date}T12:00:00`,
    );

  return {
    month:
      new Intl.DateTimeFormat(
        "en",
        {
          month: "short",
        },
      )
        .format(parsed)
        .toUpperCase(),

    day:
      new Intl.DateTimeFormat(
        "en",
        {
          day: "2-digit",
        },
      ).format(
        parsed,
      ),

    weekday:
      new Intl.DateTimeFormat(
        "en",
        {
          weekday: "short",
        },
      )
        .format(parsed)
        .toUpperCase(),
  };
}


function daysUntil(
  date: string,
) {
  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0,
  );

  const target =
    new Date(
      `${date}T00:00:00`,
    );

  return Math.ceil(
    (
      target.getTime() -
      today.getTime()
    ) /
      (
        1000 *
        60 *
        60 *
        24
      ),
  );
}


function CompetitionRow({
  competition,
  selected,
  onClick,
}: {
  competition:
    CompetitionWithEntries;

  selected:
    boolean;

  onClick:
    () => void;
}) {
  const date =
    getDateParts(
      competition.competition_date,
    );

  const eventCount =
    new Set(
      competition.entries.flatMap(
        (
          entry,
        ) =>
          entry.events,
      ),
    ).size;

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={[
        "grid w-full grid-cols-[54px_1fr_120px_18px] items-center gap-3 border-b border-border/60 px-3 py-3 text-left transition hover:bg-muted/15",
        selected
          ? "bg-violet-50/35"
          : "",
      ].join(
        " ",
      )}
    >
      <div className="rounded-xl bg-violet-50 py-1.5 text-center">
        <p className="text-[6px] font-bold text-violet-600">
          {
            date.month
          }
        </p>

        <p className="text-base font-bold">
          {
            date.day
          }
        </p>

        <p className="text-[6px] text-muted-foreground">
          {
            date.weekday
          }
        </p>
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-[9px] font-bold">
            {
              competition.name
            }
          </p>

          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[6px] font-semibold text-violet-700">
            {
              competition.competition_type
            }
          </span>
        </div>

        <p className="mt-1 text-[7px] text-muted-foreground">
          {competition.venue ??
            "Venue not set"}
          {competition.location
            ? ` · ${competition.location}`
            : ""}
        </p>

        <p className="mt-1 text-[7px] text-muted-foreground">
          {
            competition.entries.length
          }{" "}
          athlete
          {competition.entries.length ===
          1
            ? ""
            : "s"}{" "}
          ·{" "}
          {
            eventCount
          }{" "}
          event
          {eventCount ===
          1
            ? ""
            : "s"}
        </p>
      </div>

      <div>
        {competition.priority && (
          <p className="text-[7px] font-semibold text-orange-600">
            {
              competition.priority
            }
          </p>
        )}

        <p className="mt-1 text-[7px] text-muted-foreground">
          {
            competition.phase
          }
        </p>
      </div>

      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}


function AddCompetitionPanel({
  onClose,
  onCreate,
}: {
  onClose:
    () => void;

  onCreate:
    (
      values: {
        name: string;
        competition_date: string;
        competition_type:
          string;
        venue: string;
        location: string;
        priority: string;
      },
    ) => Promise<void>;
}) {
  const [
    name,
    setName,
  ] =
    useState("");

  const [
    date,
    setDate,
  ] =
    useState("");

  const [
    type,
    setType,
  ] =
    useState(
      "MEETING",
    );

  const [
    venue,
    setVenue,
  ] =
    useState("");

  const [
    location,
    setLocation,
  ] =
    useState("");

  const [
    priority,
    setPriority,
  ] =
    useState("");

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  async function submit() {
    if (
      !name.trim() ||
      !date
    ) {
      setError(
        "Name and date are required.",
      );

      return;
    }

    try {
      setSaving(
        true,
      );

      setError(
        null,
      );

      await onCreate({
        name:
          name.trim(),

        competition_date:
          date,

        competition_type:
          type,

        venue:
          venue.trim(),

        location:
          location.trim(),

        priority:
          priority.trim(),
      });

      onClose();
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : "Could not create competition.",
      );
    } finally {
      setSaving(
        false,
      );
    }
  }

  return (
    <section className="rounded-2xl border border-violet-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-bold text-violet-700">
            New Competition
          </p>

          <p className="mt-1 text-[7px] text-muted-foreground">
            Create the meet first. Athlete entries can be added afterward.
          </p>
        </div>

        <button
          type="button"
          onClick={
            onClose
          }
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <input
          value={
            name
          }
          onChange={(
            event,
          ) =>
            setName(
              event.target.value,
            )
          }
          placeholder="Competition name"
          className="rounded-xl border border-border px-3 py-2 text-[8px] outline-none"
        />

        <input
          type="date"
          value={
            date
          }
          onChange={(
            event,
          ) =>
            setDate(
              event.target.value,
            )
          }
          className="rounded-xl border border-border px-3 py-2 text-[8px] outline-none"
        />

        <input
          value={
            venue
          }
          onChange={(
            event,
          ) =>
            setVenue(
              event.target.value,
            )
          }
          placeholder="Venue"
          className="rounded-xl border border-border px-3 py-2 text-[8px] outline-none"
        />

        <input
          value={
            location
          }
          onChange={(
            event,
          ) =>
            setLocation(
              event.target.value,
            )
          }
          placeholder="City / location"
          className="rounded-xl border border-border px-3 py-2 text-[8px] outline-none"
        />

        <select
          value={
            type
          }
          onChange={(
            event,
          ) =>
            setType(
              event.target.value,
            )
          }
          className="rounded-xl border border-border px-3 py-2 text-[8px] outline-none"
        >
          <option value="MEETING">
            Meeting
          </option>

          <option value="CHAMPIONSHIP">
            Championship
          </option>
        </select>

        <input
          value={
            priority
          }
          onChange={(
            event,
          ) =>
            setPriority(
              event.target.value,
            )
          }
          placeholder="Priority (e.g. A · Peak)"
          className="rounded-xl border border-border px-3 py-2 text-[8px] outline-none"
        />
      </div>

      {error && (
        <p className="mt-2 text-[7px] text-red-600">
          {
            error
          }
        </p>
      )}

      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={
            onClose
          }
          className="rounded-lg border border-border px-3 py-1.5 text-[7px] font-semibold"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={
            saving
          }
          onClick={() =>
            void submit()
          }
          className="rounded-lg bg-violet-600 px-3 py-1.5 text-[7px] font-semibold text-white disabled:opacity-50"
        >
          {saving
            ? "Creating..."
            : "Create competition"}
        </button>
      </div>
    </section>
  );
}


function CompetitionDetail({
  competition,
  athletes,
  onSaveEntry,
  onRemoveEntry,
  onDelete,
}: {
  competition:
    CompetitionWithEntries;

  athletes:
    Array<{
      id: string;
      display_name:
        string;
    }>;

  onSaveEntry:
    (
      values: {
        competitionId:
          string;
        athleteId:
          string;
        events:
          string[];
      },
    ) => Promise<void>;

  onRemoveEntry:
    (
      competitionId:
        string,
      athleteId:
        string,
    ) => Promise<void>;

  onDelete:
    (
      competitionId:
        string,
    ) => Promise<void>;
}) {
  const [
    selectedAthlete,
    setSelectedAthlete,
  ] =
    useState("");

  const [
    entryMode,
    setEntryMode,
  ] =
    useState<"all" | "selected">("selected");

  const [
    selectedAthleteIds,
    setSelectedAthleteIds,
  ] =
    useState<string[]>([]);

  const [
    eventsText,
    setEventsText,
  ] =
    useState("");

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const entryByAthlete =
    useMemo(
      () =>
        new Map(
          competition.entries.map(
            (
              entry,
            ) => [
              entry.athlete_id,
              entry,
            ],
          ),
        ),
      [
        competition.entries,
      ],
    );

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

  async function addEntry() {
    const athleteIds =
      entryMode === "all"
        ? athletes
            .filter(
              (athlete) =>
                !entryByAthlete.has(
                  athlete.id,
                ),
            )
            .map(
              (athlete) =>
                athlete.id,
            )
        : selectedAthleteIds;

    if (
      athleteIds.length === 0
    ) {
      return;
    }

    const events =
      eventsText
        .split(",")
        .map(
          (value) =>
            value.trim(),
        )
        .filter(Boolean);

    try {
      setSaving(true);

      for (
        const athleteId of
          athleteIds
      ) {
        await onSaveEntry({
          competitionId:
            competition.id,

          athleteId,

          events,
        });
      }

      setSelectedAthlete("");
      setSelectedAthleteIds([]);
      setEventsText("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
      <div className="border-l-4 border-l-violet-600 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold">
                {
                  competition.name
                }
              </h2>

              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[6px] font-bold text-violet-700">
                {
                  competition.competition_type
                }
              </span>
            </div>

            <div className="mt-1 flex items-center gap-3 text-[8px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />

                {formatCompetitionDate(
                  competition.competition_date,
                )}
              </span>

              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />

                {competition.venue ??
                  "Venue not set"}

                {competition.location
                  ? `, ${competition.location}`
                  : ""}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  `Delete ${competition.name}?`,
                )
              ) {
                void onDelete(
                  competition.id,
                );
              }
            }}
            className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {[
            [
              "Phase",
              competition.phase,
            ],

            [
              "Priority",
              competition.priority ??
                "Not set",
            ],

            [
              "Athletes",
              String(
                competition.entries.length,
              ),
            ],

            [
              "Events",
              String(
                new Set(
                  competition.entries.flatMap(
                    (
                      entry,
                    ) =>
                      entry.events,
                  ),
                ).size,
              ),
            ],
          ].map(
            ([
              label,
              value,
            ]) => (
              <div
                key={
                  label
                }
                className="rounded-xl border border-border p-2.5"
              >
                <p className="text-[7px] text-muted-foreground">
                  {
                    label
                  }
                </p>

                <p className="mt-1 text-[9px] font-semibold">
                  {
                    value
                  }
                </p>
              </div>
            ),
          )}
        </div>
      </div>

      <div className="border-t border-border p-3">
        <p className="text-[9px] font-bold">
          Athlete entries
        </p>

        <p className="mt-1 text-[7px] text-muted-foreground">
          Assign connected athletes and their competition events.
        </p>

        <div className="mt-3 rounded-xl border border-border p-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                setEntryMode("all")
              }
              className={[
                "rounded-lg border px-3 py-2 text-[7px] font-semibold",
                entryMode === "all"
                  ? "border-violet-200 bg-violet-50 text-violet-700"
                  : "border-border text-muted-foreground",
              ].join(" ")}
            >
              All linked athletes
            </button>

            <button
              type="button"
              onClick={() =>
                setEntryMode("selected")
              }
              className={[
                "rounded-lg border px-3 py-2 text-[7px] font-semibold",
                entryMode === "selected"
                  ? "border-violet-200 bg-violet-50 text-violet-700"
                  : "border-border text-muted-foreground",
              ].join(" ")}
            >
              Selected athletes
            </button>
          </div>

          {entryMode === "selected" && (
            <div className="mt-2 max-h-36 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
              {athletes
                .filter(
                  (athlete) =>
                    !entryByAthlete.has(
                      athlete.id,
                    ),
                )
                .map(
                  (athlete) => {
                    const selected =
                      selectedAthleteIds.includes(
                        athlete.id,
                      );

                    return (
                      <label
                        key={athlete.id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/20"
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() =>
                            setSelectedAthleteIds(
                              (current) =>
                                selected
                                  ? current.filter(
                                      (id) =>
                                        id !==
                                        athlete.id,
                                    )
                                  : [
                                      ...current,
                                      athlete.id,
                                    ],
                            )
                          }
                        />

                        <span className="text-[7px] font-medium">
                          {athlete.display_name}
                        </span>
                      </label>
                    );
                  },
                )}
            </div>
          )}

          {entryMode === "all" && (
            <p className="mt-2 text-[7px] text-muted-foreground">
              All linked athletes not already entered will be added.
            </p>
          )}

          <div className="mt-2 flex gap-2">
            <input
              value={eventsText}
              onChange={(event) =>
                setEventsText(
                  event.target.value,
                )
              }
              placeholder="Events: 100m, 200m, hurdles..."
              className="min-w-0 flex-1 rounded-lg border border-border px-2 py-2 text-[7px] outline-none"
            />

            <button
              type="button"
              disabled={
                saving ||
                (
                  entryMode === "selected" &&
                  selectedAthleteIds.length === 0
                )
              }
              onClick={() =>
                void addEntry()
              }
              className="rounded-lg bg-violet-600 px-3 text-[7px] font-semibold text-white disabled:opacity-50"
            >
              {saving
                ? "Adding..."
                : "Add athletes"}
            </button>
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-[1fr_1fr_80px] bg-slate-50/60 px-3 py-2 text-[7px] font-semibold text-muted-foreground">
            <span>
              Athlete
            </span>

            <span>
              Event(s)
            </span>

            <span>
              Action
            </span>
          </div>

          {competition.entries.length ===
          0 ? (
            <div className="px-3 py-5 text-center">
              <p className="text-[8px] font-semibold">
                No athletes entered yet
              </p>

              <p className="mt-1 text-[7px] text-muted-foreground">
                Add connected athletes above.
              </p>
            </div>
          ) : (
            competition.entries.map(
              (
                entry,
              ) => (
                <div
                  key={
                    entry.id
                  }
                  className="grid grid-cols-[1fr_1fr_80px] items-center border-t border-border/60 px-3 py-2"
                >
                  <span className="text-[8px] font-semibold">
                    {athleteNameById.get(
                      entry.athlete_id,
                    ) ??
                      "Unknown athlete"}
                  </span>

                  <span className="text-[8px]">
                    {entry.events.length >
                    0
                      ? entry.events.join(
                          " · ",
                        )
                      : "No events assigned"}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      void onRemoveEntry(
                        competition.id,
                        entry.athlete_id,
                      )
                    }
                    className="text-left text-[7px] font-semibold text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ),
            )
          )}
        </div>
      </div>

      {competition.notes && (
        <div className="border-t border-border px-3 py-2">
          <p className="text-[7px] font-semibold">
            Competition notes
          </p>

          <p className="mt-1 text-[7px] text-muted-foreground">
            {
              competition.notes
            }
          </p>
        </div>
      )}
    </section>
  );
}


export function CompetitionsPage() {
  const {
    competitions,
    loading,
    error,
    createCompetition,
    deleteCompetition,
    saveEntry,
    removeEntry,
  } =
    useCoachCompetitions();

  const {
    athletes,
  } =
    useCoachAthletes();

  const [
    selectedCompetitionId,
    setSelectedCompetitionId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    adding,
    setAdding,
  ] =
    useState(false);

  const filteredCompetitions =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        if (
          !query
        ) {
          return competitions;
        }

        return competitions.filter(
          (
            competition,
          ) =>
            [
              competition.name,
              competition.location ??
                "",
              competition.venue ??
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
            ),
        );
      },
      [
        competitions,
        search,
      ],
    );

  const selectedCompetition =
    useMemo(
      () =>
        filteredCompetitions.find(
          (
            competition,
          ) =>
            competition.id ===
            selectedCompetitionId,
        ) ??
        filteredCompetitions[0] ??
        null,
      [
        filteredCompetitions,
        selectedCompetitionId,
      ],
    );

  const upcoming =
    useMemo(
      () =>
        competitions.filter(
          (
            competition,
          ) =>
            daysUntil(
              competition.competition_date,
            ) >= 0,
        ),
      [
        competitions,
      ],
    );

  const nextCompetition =
    upcoming[0] ??
    null;

  const totalEntries =
    competitions.reduce(
      (
        total,
        competition,
      ) =>
        total +
        competition.entries.length,
      0,
    );

  const totalEvents =
    new Set(
      competitions.flatMap(
        (
          competition,
        ) =>
          competition.entries.flatMap(
            (
              entry,
            ) =>
              entry.events,
          ),
      ),
    ).size;

  if (
    loading
  ) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold">
          Loading competitions...
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
          Competitions could not be loaded
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
            Competitions
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Competitions
          </h1>

          <p className="mt-1 text-xs text-muted-foreground">
            Plan meets and manage athlete entries and events.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setAdding(
              true,
            )
          }
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-[9px] font-semibold text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          Add competition
        </button>
      </section>

      {adding && (
        <AddCompetitionPanel
          onClose={() =>
            setAdding(
              false,
            )
          }
          onCreate={async (values) => {
            await createCompetition(values);
          }}
        />
      )}

      <section className="grid grid-cols-4 gap-2.5">
        {[
          {
            label:
              "Upcoming competitions",

            value:
              String(
                upcoming.length,
              ),

            detail:
              "Future competitions",

            icon:
              CalendarDays,

            style:
              "bg-violet-50 text-violet-600",
          },

          {
            label:
              "Next competition",

            value:
              nextCompetition
                ? `${Math.max(
                    0,
                    daysUntil(
                      nextCompetition.competition_date,
                    ),
                  )} days`
                : "—",

            detail:
              nextCompetition?.name ??
              "No competition scheduled",

            icon:
              Flag,

            style:
              "bg-orange-50 text-orange-600",
          },

          {
            label:
              "Athlete entries",

            value:
              String(
                totalEntries,
              ),

            detail:
              "Across all competitions",

            icon:
              Users,

            style:
              "bg-green-50 text-green-600",
          },

          {
            label:
              "Competition events",

            value:
              String(
                totalEvents,
              ),

            detail:
              "Unique assigned events",

            icon:
              Trophy,

            style:
              "bg-blue-50 text-blue-600",
          },
        ].map(
          ({
            label,
            value,
            detail,
            icon:
              Icon,
            style,
          }) => (
            <article
              key={
                label
              }
              className="rounded-2xl border border-border bg-white p-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`grid h-10 w-10 place-items-center rounded-xl ${style}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-[8px] font-semibold text-muted-foreground">
                    {
                      label
                    }
                  </p>

                  <p
                    className={[
                      "mt-1 font-bold",
                      value.length >
                      12
                        ? "text-xs"
                        : "text-xl",
                    ].join(
                      " ",
                    )}
                  >
                    {
                      value
                    }
                  </p>

                  <p className="truncate text-[7px] text-muted-foreground">
                    {
                      detail
                    }
                  </p>
                </div>
              </div>
            </article>
          ),
        )}
      </section>

      <div className="grid grid-cols-[0.78fr_1.22fr] items-start gap-3">
        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border p-3">
            <h2 className="text-sm font-bold">
              Competitions
            </h2>

            <div className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5">
              <Search className="h-3 w-3 text-muted-foreground" />

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
                placeholder="Search competitions..."
                className="w-28 bg-transparent text-[7px] outline-none"
              />
            </div>
          </div>

          {filteredCompetitions.length ===
          0 ? (
            <div className="px-4 py-8 text-center">
              <Trophy className="mx-auto h-6 w-6 text-muted-foreground" />

              <p className="mt-2 text-[9px] font-semibold">
                No competitions yet
              </p>

              <p className="mt-1 text-[7px] text-muted-foreground">
                Create your first competition to start managing entries.
              </p>
            </div>
          ) : (
            filteredCompetitions.map(
              (
                competition,
              ) => (
                <CompetitionRow
                  key={
                    competition.id
                  }
                  competition={
                    competition
                  }
                  selected={
                    selectedCompetition?.id ===
                    competition.id
                  }
                  onClick={() =>
                    setSelectedCompetitionId(
                      competition.id,
                    )
                  }
                />
              ),
            )
          )}
        </section>

        {selectedCompetition ? (
          <CompetitionDetail
            competition={
              selectedCompetition
            }
            athletes={
              athletes
            }
            onSaveEntry={
              saveEntry
            }
            onRemoveEntry={
              removeEntry
            }
            onDelete={async (
              competitionId,
            ) => {
              await deleteCompetition(
                competitionId,
              );

              setSelectedCompetitionId(
                null,
              );
            }}
          />
        ) : (
          <section className="grid min-h-[350px] place-items-center rounded-2xl border border-border bg-white shadow-sm">
            <div className="text-center">
              <Trophy className="mx-auto h-6 w-6 text-violet-500" />

              <p className="mt-2 text-sm font-bold">
                Select a competition
              </p>

              <p className="mt-1 text-[8px] text-muted-foreground">
                Competition details and athlete entries will appear here.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}




