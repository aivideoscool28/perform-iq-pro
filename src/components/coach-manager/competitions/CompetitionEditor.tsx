import {
  useEffect,
  useState,
} from "react";

import {
  CalendarDays,
  MapPin,
  X,
} from "lucide-react";

import type {
  CompetitionWithEntries,
} from "@/hooks/coach-manager/useCoachCompetitions";

type EditValues = {
  name: string;
  competition_date: string;
  competition_type: string;
  venue: string | null;
  location: string | null;
  priority: string | null;
  notes: string | null;
};

type Props = {
  competition: CompetitionWithEntries | null;
  open: boolean;
  saving: boolean;

  onClose: () => void;

  onSave: (
    values: EditValues,
  ) => Promise<void>;
};

export function CompetitionEditor({
  competition,
  open,
  saving,
  onClose,
  onSave,
}: Props) {
  const [name, setName] =
    useState("");

  const [date, setDate] =
    useState("");

  const [type, setType] =
    useState("MEETING");

  const [venue, setVenue] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [priority, setPriority] =
    useState("");

  const [notes, setNotes] =
    useState("");

  useEffect(() => {
    if (
      !open ||
      !competition
    ) {
      return;
    }

    setName(
      competition.name ?? "",
    );

    setDate(
      competition.competition_date ?? "",
    );

    setType(
      competition.competition_type ??
        "MEETING",
    );

    setVenue(
      competition.venue ?? "",
    );

    setLocation(
      competition.location ?? "",
    );

    setPriority(
      competition.priority ?? "",
    );

    setNotes(
      competition.notes ?? "",
    );
  }, [
    open,
    competition,
  ]);

  if (
    !open ||
    !competition
  ) {
    return null;
  }

  async function save() {
    if (
      !name.trim() ||
      !date
    ) {
      return;
    }

    await onSave({
      name:
        name.trim(),

      competition_date:
        date,

      competition_type:
        type,

      venue:
        venue.trim() ||
        null,

      location:
        location.trim() ||
        null,

      priority:
        priority.trim() ||
        null,

      notes:
        notes.trim() ||
        null,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-violet-600">
              Competition
            </p>

            <h2 className="mt-1 text-lg font-bold">
              Edit competition
            </h2>

            <p className="mt-1 text-[12px] text-muted-foreground">
              Update competition details and date.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg border border-border"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <input
            value={name}
            onChange={(event) =>
              setName(
                event.target.value,
              )
            }
            placeholder="Competition name"
            className="w-full rounded-xl border border-border px-3 py-2.5 text-xs outline-none focus:border-violet-300"
          />

          <div className="relative">
            <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />

            <input
              type="date"
              value={date}
              onChange={(event) =>
                setDate(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-border py-2.5 pl-9 pr-3 text-xs outline-none"
            />
          </div>

          <select
            value={type}
            onChange={(event) =>
              setType(
                event.target.value,
              )
            }
            className="w-full rounded-xl border border-border px-3 py-2.5 text-xs outline-none"
          >
            <option value="MEETING">
              Meeting
            </option>

            <option value="CHAMPIONSHIP">
              Championship
            </option>
          </select>

          <input
            value={venue}
            onChange={(event) =>
              setVenue(
                event.target.value,
              )
            }
            placeholder="Venue"
            className="w-full rounded-xl border border-border px-3 py-2.5 text-xs outline-none"
          />

          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />

            <input
              value={location}
              onChange={(event) =>
                setLocation(
                  event.target.value,
                )
              }
              placeholder="City / location"
              className="w-full rounded-xl border border-border py-2.5 pl-9 pr-3 text-xs outline-none"
            />
          </div>

          <input
            value={priority}
            onChange={(event) =>
              setPriority(
                event.target.value,
              )
            }
            placeholder="Priority"
            className="w-full rounded-xl border border-border px-3 py-2.5 text-xs outline-none"
          />

          <textarea
            value={notes}
            onChange={(event) =>
              setNotes(
                event.target.value,
              )
            }
            placeholder="Competition notes"
            className="min-h-[80px] w-full resize-none rounded-xl border border-border px-3 py-2.5 text-xs outline-none"
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-[12px] font-semibold"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              saving ||
              !name.trim() ||
              !date
            }
            onClick={() =>
              void save()
            }
            className="rounded-xl bg-violet-600 px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

