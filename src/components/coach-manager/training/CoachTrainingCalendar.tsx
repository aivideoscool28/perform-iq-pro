import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Plus,
  X,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useCoachTrainingCalendar,
} from "@/hooks/coach-manager/useCoachTrainingCalendar";

import type {
  CoachCalendarEvent,
  CoachCalendarEventInput,
  CoachCalendarEventType,
} from "@/lib/coach-calendar.functions";

function startOfMonth(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
  );
}

function endOfMonth(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  );
}

function addDays(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfCalendarGrid(date: Date) {
  const monthStart = startOfMonth(date);
  const weekday =
    (monthStart.getDay() + 6) % 7;

  return addDays(
    monthStart,
    -weekday,
  );
}

function eventLabel(
  type: CoachCalendarEventType,
) {
  switch (type) {
    case "competition":
      return "Competition";
    case "training_camp":
      return "Training Camp";
    case "testing":
      return "Testing";
    case "meeting":
      return "Meeting";
    case "reminder":
      return "Reminder";
    default:
      return "Other";
  }
}

function eventStyle(
  type: CoachCalendarEventType,
) {
  switch (type) {
    case "competition":
      return "border-blue-100 bg-blue-50 text-blue-700";
    case "training_camp":
      return "border-green-100 bg-green-50 text-green-700";
    case "testing":
      return "border-violet-100 bg-violet-50 text-violet-700";
    case "meeting":
      return "border-cyan-100 bg-cyan-50 text-cyan-700";
    case "reminder":
      return "border-slate-200 bg-slate-50 text-slate-700";
    default:
      return "border-slate-200 bg-white text-slate-700";
  }
}

type EditorState = {
  open: boolean;
  editing: CoachCalendarEvent | null;
  date: string;
};

const emptyEditor: EditorState = {
  open: false,
  editing: null,
  date: "",
};

export function CoachTrainingCalendar() {
  const [month, setMonth] =
    useState(() => new Date());

  const [editor, setEditor] =
    useState<EditorState>(emptyEditor);

  const gridStart =
    startOfCalendarGrid(month);

  const gridDays = useMemo(
    () =>
      Array.from(
        { length: 42 },
        (_, index) =>
          addDays(gridStart, index),
      ),
    [gridStart],
  );

  const gridEnd =
    gridDays[gridDays.length - 1];

  const {
    trainingSessions,
    calendarEvents,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    saving,
    mutationError,
  } = useCoachTrainingCalendar(
    toDateString(gridStart),
    toDateString(gridEnd),
  );

  const monthLabel =
    month.toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      },
    );

  function previousMonth() {
    setMonth(
      new Date(
        month.getFullYear(),
        month.getMonth() - 1,
        1,
      ),
    );
  }

  function nextMonth() {
    setMonth(
      new Date(
        month.getFullYear(),
        month.getMonth() + 1,
        1,
      ),
    );
  }

  function today() {
    setMonth(new Date());
  }

  function openCreate(date?: string) {
    setEditor({
      open: true,
      editing: null,
      date:
        date ??
        toDateString(new Date()),
    });
  }

  function openEdit(
    event: CoachCalendarEvent,
  ) {
    setEditor({
      open: true,
      editing: event,
      date: event.event_date,
    });
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-orange-500" />

              <h2 className="text-sm font-bold">
                Training Calendar
              </h2>
            </div>

            <p className="mt-1 text-[9px] text-muted-foreground">
              Training sessions and important coach dates in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => openCreate()}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-orange-600"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Important Date
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={previousMonth}
              className="grid h-8 w-8 place-items-center rounded-lg border border-border transition hover:bg-muted/30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={nextMonth}
              className="grid h-8 w-8 place-items-center rounded-lg border border-border transition hover:bg-muted/30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={today}
              className="rounded-lg border border-border px-3 py-2 text-[9px] font-semibold"
            >
              Today
            </button>
          </div>

          <h3 className="text-sm font-bold">
            {monthLabel}
          </h3>

          <div className="flex items-center gap-3 text-[8px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              Training
            </span>

            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Competition
            </span>

            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              Testing
            </span>
          </div>
        </div>

        {error && (
          <div className="border-b border-red-100 bg-red-50 px-4 py-2">
            <p className="text-[9px] font-semibold text-red-700">
              Could not load calendar: {error}
            </p>
          </div>
        )}

        <div className="grid grid-cols-7 border-b border-border bg-slate-50/60">
          {[
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun",
          ].map((day) => (
            <div
              key={day}
              className="border-r border-border px-2 py-2 text-center text-[8px] font-bold uppercase tracking-[0.12em] text-muted-foreground last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {gridDays.map((date) => {
            const dateString =
              toDateString(date);

            const currentMonth =
              date.getMonth() ===
              month.getMonth();

            const isToday =
              dateString ===
              toDateString(new Date());

            const sessions =
              trainingSessions.filter(
                (session) =>
                  session.session_date ===
                  dateString,
              );

            const events =
              calendarEvents.filter(
                (event) =>
                  event.event_date ===
                  dateString,
              );

            return (
              <div
                key={dateString}
                className={[
                  "group relative min-h-[76px] border-b border-r border-border p-1.5 transition",
                  isToday
                    ? "bg-orange-50/35"
                    : currentMonth
                      ? "bg-white"
                      : "bg-slate-50/40",
                ].join(" ")}
              >
                {isToday && (
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-orange-500" />
                )}
                <div className="flex items-center justify-between">
                  <span
                    className={[
                      "grid h-6 w-6 place-items-center rounded-full text-[9px] font-semibold",
                      isToday
                        ? "bg-orange-500 text-white"
                        : currentMonth
                          ? "text-foreground"
                          : "text-muted-foreground",
                    ].join(" ")}
                  >
                    {date.getDate()}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      openCreate(dateString)
                    }
                    className="grid h-5 w-5 place-items-center rounded-md text-muted-foreground opacity-0 transition hover:bg-muted group-hover:opacity-100"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <div className="mt-1.5 space-y-1">
                  {sessions.map(
                    (session) => (
                      <div
                        key={session.id}
                        className="rounded-md border border-orange-100 bg-orange-50 px-1.5 py-0.5"
                      >
                        <p className="truncate text-[8px] font-bold text-orange-700">
                          {session.title}
                        </p>

                        <p className="mt-0.5 text-[7px] text-orange-700/70">
                          {session.start_time
                            ? session.start_time.slice(
                                0,
                                5,
                              )
                            : "Training"}
                        </p>
                      </div>
                    ),
                  )}

                  {events.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() =>
                        openEdit(event)
                      }
                      className={[
                        "w-full rounded-md border px-1.5 py-0.5 text-left",
                        eventStyle(
                          event.event_type,
                        ),
                      ].join(" ")}
                    >
                      <p className="truncate text-[8px] font-bold">
                        {event.title}
                      </p>

                      <p className="mt-0.5 text-[7px] opacity-70">
                        {eventLabel(
                          event.event_type,
                        )}
                      </p>
                    </button>
                  ))}

                  {loading &&
                    sessions.length === 0 &&
                    events.length === 0 && (
                      <div className="h-5 animate-pulse rounded-md bg-muted/40" />
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {editor.open && (
        <CalendarEventEditor
          date={editor.date}
          event={editor.editing}
          saving={saving}
          error={mutationError}
          onClose={() =>
            setEditor(emptyEditor)
          }
          onCreate={createEvent}
          onUpdate={updateEvent}
          onDelete={deleteEvent}
        />
      )}
    </>
  );
}

function CalendarEventEditor({
  date,
  event,
  saving,
  error,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: {
  date: string;
  event: CoachCalendarEvent | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onCreate: (
    input: CoachCalendarEventInput,
  ) => Promise<unknown>;
  onUpdate: (input: {
    eventId: string;
    event: CoachCalendarEventInput;
  }) => Promise<unknown>;
  onDelete: (
    eventId: string,
  ) => Promise<unknown>;
}) {
  const [title, setTitle] =
    useState(event?.title ?? "");

  const [eventDate, setEventDate] =
    useState(event?.event_date ?? date);

  const [eventType, setEventType] =
    useState<CoachCalendarEventType>(
      event?.event_type ?? "competition",
    );

  const [startTime, setStartTime] =
    useState(
      event?.start_time?.slice(0, 5) ??
        "",
    );

  const [endTime, setEndTime] =
    useState(
      event?.end_time?.slice(0, 5) ??
        "",
    );

  const [location, setLocation] =
    useState(event?.location ?? "");

  const [notes, setNotes] =
    useState(event?.notes ?? "");

  async function save() {
    if (!title.trim()) {
      return;
    }

    const input: CoachCalendarEventInput = {
      title: title.trim(),
      eventDate,
      eventType,
      startTime:
        startTime || null,
      endTime:
        endTime || null,
      location:
        location.trim() || null,
      notes:
        notes.trim() || null,
    };

    if (event) {
      await onUpdate({
        eventId: event.id,
        event: input,
      });
    } else {
      await onCreate(input);
    }

    onClose();
  }

  async function remove() {
    if (!event) {
      return;
    }

    await onDelete(event.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-4 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold">
              {event
                ? "Edit Important Date"
                : "Add Important Date"}
            </h3>

            <p className="mt-1 text-[9px] text-muted-foreground">
              Competition, testing, camp, meeting or reminder.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg transition hover:bg-muted/30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-[9px] font-semibold">
              Title
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="e.g. Regional Championships"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-xs outline-none focus:border-orange-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-semibold">
                Date
              </label>

              <input
                type="date"
                value={eventDate}
                onChange={(e) =>
                  setEventDate(
                    e.target.value,
                  )
                }
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="text-[9px] font-semibold">
                Type
              </label>

              <select
                value={eventType}
                onChange={(e) =>
                  setEventType(
                    e.target
                      .value as CoachCalendarEventType,
                  )
                }
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-xs"
              >
                <option value="competition">
                  Competition
                </option>
                <option value="training_camp">
                  Training Camp
                </option>
                <option value="testing">
                  Testing
                </option>
                <option value="meeting">
                  Meeting
                </option>
                <option value="reminder">
                  Reminder
                </option>
                <option value="other">
                  Other
                </option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-semibold">
                Start Time
              </label>

              <input
                type="time"
                value={startTime}
                onChange={(e) =>
                  setStartTime(
                    e.target.value,
                  )
                }
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="text-[9px] font-semibold">
                End Time
              </label>

              <input
                type="time"
                value={endTime}
                onChange={(e) =>
                  setEndTime(
                    e.target.value,
                  )
                }
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-semibold">
              Location
            </label>

            <div className="mt-1 flex items-center gap-2 rounded-xl border border-border px-3 py-2">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />

              <input
                value={location}
                onChange={(e) =>
                  setLocation(
                    e.target.value,
                  )
                }
                placeholder="Optional"
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-semibold">
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              placeholder="Optional coach notes..."
              className="mt-1 min-h-[80px] w-full resize-none rounded-xl border border-border px-3 py-2 text-xs outline-none focus:border-orange-300"
            />
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2">
            <p className="text-[9px] font-semibold text-red-700">
              {error}
            </p>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div>
            {event && (
              <button
                type="button"
                disabled={saving}
                onClick={remove}
                className="text-[9px] font-semibold text-red-600"
              >
                Delete Event
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-border px-3 py-2 text-[9px] font-semibold"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={save}
              disabled={
                saving ||
                !title.trim()
              }
              className="rounded-xl bg-orange-500 px-4 py-2 text-[9px] font-semibold text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : event
                  ? "Save Changes"
                  : "Add Date"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



