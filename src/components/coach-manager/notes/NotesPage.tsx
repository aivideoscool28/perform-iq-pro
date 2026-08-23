import {
  type CoachAthlete,
  useCoachAthletes,
} from "@/hooks/useCoachAthletes";
import { useMemo, useRef, useState } from "react";

import {
  Activity,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Lock,
  MoreHorizontal,
  Pin,
  Play,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  UserRound,
  Users,
} from "lucide-react";

import {
  coachNotes as initialNotes,
  measurementTypes,
  pinnedCoachNotes,
  type CoachNoteItem,
  type NoteKind,
} from "@/components/coach-manager/notes/notes.data";

type MainTab = "all" | "measurements" | "follow-ups";
type CreateMode = "note" | "measurement" | "follow-up";

function formatTimer(milliseconds: number) {
  const totalHundredths = Math.floor(milliseconds / 10);
  const minutes = Math.floor(totalHundredths / 6000);
  const seconds = Math.floor((totalHundredths % 6000) / 100);
  const hundredths = totalHundredths % 100;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}.${String(hundredths).padStart(2, "0")}`;
}

function NoteIcon({ kind }: { kind: NoteKind }) {
  if (kind === "measurement") {
    return (
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-violet-50">
        <Clock3 className="h-4 w-4 text-violet-600" />
      </div>
    );
  }

  if (kind === "follow-up") {
    return (
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      </div>
    );
  }

  return (
    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-orange-50">
      <FileText className="h-4 w-4 text-orange-600" />
    </div>
  );
}

function VisibilityIcon({
  visibility,
}: {
  visibility: CoachNoteItem["visibility"];
}) {
  if (visibility === "Athlete") {
    return <UserRound className="h-3 w-3 text-orange-500" />;
  }

  if (visibility === "Staff") {
    return <Users className="h-3 w-3 text-slate-600" />;
  }

  return <Lock className="h-3 w-3 text-slate-500" />;
}

function NoteRow({
  item,
  onTogglePin,
}: {
  item: CoachNoteItem;
  onTogglePin: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-[32px_48px_minmax(0,1fr)_76px_58px] items-center gap-2 border-t border-border/60 px-3 py-2.5">
      <NoteIcon kind={item.kind} />

      <p className="text-[10px] font-semibold">
        {item.time}
      </p>

      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-orange-50 text-[7px] font-bold text-orange-600">
            {item.initials}
          </div>

          <p className="min-w-0 truncate text-[10px] font-semibold">
            {item.athlete}
          </p>

          <span
            className={[
              "shrink-0 rounded-full px-1.5 py-0.5 text-[6px] font-bold uppercase",
              item.kind === "measurement"
                ? "bg-violet-50 text-violet-700"
                : item.kind === "follow-up"
                  ? "bg-green-50 text-green-700"
                  : "bg-blue-50 text-blue-700",
            ].join(" ")}
          >
            {item.kind === "measurement"
              ? "Measurement"
              : item.kind === "follow-up"
                ? "Follow-up"
                : "Coach note"}
          </span>
        </div>

        <p className="mt-1 truncate text-[8px] font-medium">
          {item.text}
        </p>

        <div className="mt-1 flex min-w-0 items-center gap-2 text-[7px] text-muted-foreground">
          <span className="max-w-[120px] truncate rounded-full bg-slate-50 px-2 py-0.5">
            {item.session}
          </span>

          <span className="shrink-0">
            {item.date}
          </span>

          {item.followUp && (
            <span className="min-w-0 truncate font-semibold text-green-700">
              · {item.followUp.when}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[7px] text-muted-foreground">
        <VisibilityIcon visibility={item.visibility} />

        <span className="truncate">
          {item.visibility}
        </span>
      </div>

      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => onTogglePin(item.id)}
          title={item.pinned ? "Unpin note" : "Pin note"}
          className={[
            "grid h-7 w-7 place-items-center rounded-lg transition",
            item.pinned
              ? "bg-violet-50 text-violet-600"
              : "text-muted-foreground hover:bg-muted/30",
          ].join(" ")}
        >
          <Pin
            className={[
              "h-3.5 w-3.5",
              item.pinned ? "fill-current" : "",
            ].join(" ")}
          />
        </button>

        <button
          type="button"
          className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted/30"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function NotesTimeline({
  notes,
  onTogglePin,
}: {
  notes: CoachNoteItem[];
  onTogglePin: (id: string) => void;
}) {
  const sections = ["TODAY", "YESTERDAY", "THIS WEEK"] as const;

  return (
    <div>
      {sections.map((section) => {
        const sectionItems = notes.filter(
          (note) => note.section === section,
        );

        if (sectionItems.length === 0) {
          return null;
        }

        return (
          <div key={section}>
            <div className="bg-slate-50/60 px-3 py-2">
              <p className="text-[8px] font-bold text-muted-foreground">
                {section}
              </p>
            </div>

            {sectionItems.map((item) => (
              <NoteRow
                key={item.id}
                item={item}
                onTogglePin={onTogglePin}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function CreateModeButton({
  active,
  icon: Icon,
  title,
  detail,
  onClick,
}: {
  active: boolean;
  icon: typeof FileText;
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition",
        active
          ? "border-violet-300 bg-violet-50/60"
          : "border-border bg-white hover:bg-muted/20",
      ].join(" ")}
    >
      <div
        className={[
          "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
          active
            ? "bg-violet-100"
            : "bg-slate-50",
        ].join(" ")}
      >
        <Icon
          className={[
            "h-4 w-4",
            active
              ? "text-violet-600"
              : "text-slate-700",
          ].join(" ")}
        />
      </div>

      <div>
        <p
          className={[
            "text-[9px] font-semibold",
            active ? "text-violet-700" : "",
          ].join(" ")}
        >
          {title}
        </p>

        <p className="mt-0.5 text-[7px] text-muted-foreground">
          {detail}
        </p>
      </div>
    </button>
  );
}

function MeasurementEditor({
  athletes,
}: {
  athletes: CoachAthlete[];
}) {
  const [measurementType, setMeasurementType] =
    useState("Flying 30m");

  const [elapsed, setElapsed] = useState(3120);
  const [running, setRunning] = useState(false);

  const startedAt = useRef<number | null>(null);
  const baseElapsed = useRef(3120);
  const intervalRef = useRef<number | null>(null);

  function stopInterval() {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function toggleTimer() {
    if (running) {
      stopInterval();
      baseElapsed.current = elapsed;
      setRunning(false);
      return;
    }

    startedAt.current = Date.now();
    setRunning(true);

    intervalRef.current = window.setInterval(() => {
      if (startedAt.current === null) {
        return;
      }

      setElapsed(
        baseElapsed.current +
          (Date.now() - startedAt.current),
      );
    }, 20);
  }

  function resetTimer() {
    stopInterval();
    setRunning(false);
    startedAt.current = null;
    baseElapsed.current = 0;
    setElapsed(0);
  }

  return (
    <>
      <div className="grid grid-cols-[1fr_1fr] gap-3">
        <div>
          <label className="text-[8px] font-semibold">
            Athlete
          </label>

          <select
            className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[8px] outline-none"
            defaultValue={athletes[0]?.id ?? ""}
          >
            {athletes.length === 0 ? (
              <option value="">No linked athletes</option>
            ) : (
              athletes.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.display_name}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="text-[8px] font-semibold">
            Date & Time
          </label>

          <div className="mt-1.5 grid grid-cols-[1fr_70px] gap-2">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-left text-[8px]"
            >
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              22 Aug 2026
            </button>

            <button
              type="button"
              className="rounded-xl border border-border px-2 text-[8px]"
            >
              10:35
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_1fr] gap-3">
        <div>
          <label className="text-[8px] font-semibold">
            Measurement
          </label>

          <div className="mt-1.5 flex gap-2">
            <select
              value={measurementType}
              onChange={(event) =>
                setMeasurementType(event.target.value)
              }
              className="min-w-0 flex-1 rounded-xl border border-border bg-white px-3 py-2.5 text-[8px] outline-none"
            >
              {measurementTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>

            <button
              type="button"
              className="rounded-xl border border-violet-100 bg-violet-50 px-3 text-[8px] font-semibold text-violet-700"
            >
              + Add new type
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label className="text-[8px] font-semibold">
                Result
              </label>

              <div className="mt-1.5 rounded-xl border border-border px-3 py-2.5">
                <p className="text-base font-bold">
                  {(elapsed / 1000).toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <label className="text-[8px] font-semibold">
                Unit
              </label>

              <select className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[8px] outline-none">
                <option>seconds (s)</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="text-[8px] font-semibold">
            Timer
          </label>

          <div className="mt-1.5 rounded-xl border border-border p-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={resetTimer}
                className="grid h-8 w-8 place-items-center rounded-full border border-border"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              <p className="flex-1 text-center text-xl font-semibold tracking-tight">
                {formatTimer(elapsed)}
              </p>

              <button
                type="button"
                onClick={toggleTimer}
                className="grid h-9 w-9 place-items-center rounded-full bg-violet-600 text-white"
              >
                {running ? (
                  <span className="h-3 w-3 rounded-sm bg-white" />
                ) : (
                  <Play className="ml-0.5 h-4 w-4 fill-white" />
                )}
              </button>
            </div>

            <p className="mt-2 text-center text-[7px] text-muted-foreground">
              {running
                ? "Click again to stop and capture"
                : "Click play to start"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-border bg-slate-50/40 p-2.5">
        <div>
          <p className="text-[7px] text-muted-foreground">
            Previous
          </p>
          <p className="mt-1 text-sm font-bold">3.18 s</p>
          <p className="text-[6px] text-muted-foreground">
            2 days ago
          </p>
        </div>

        <div>
          <p className="text-[7px] text-muted-foreground">
            Change
          </p>
          <p className="mt-1 text-sm font-bold text-green-600">
            ↓ 0.06 s
          </p>
          <p className="text-[6px] text-green-600">
            -1.9%
          </p>
        </div>

        <div>
          <p className="text-[7px] text-muted-foreground">
            Best
          </p>
          <p className="mt-1 text-sm font-bold">3.08 s</p>
          <p className="text-[6px] text-muted-foreground">
            12 Aug 2026
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_0.65fr] gap-3">
        <div>
          <label className="text-[8px] font-semibold">
            Session (linked)
          </label>

          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border px-3 py-2.5">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[8px]">
              Sprint Session — 21 Aug 2026
            </span>
          </div>
        </div>

        <div>
          <label className="text-[8px] font-semibold">
            Method
          </label>

          <select className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[8px] outline-none">
            <option>Hand timed</option>
            <option>Electronic timing</option>
            <option>Video timing</option>
          </select>
        </div>
      </div>

      <div className="mt-3">
        <label className="text-[8px] font-semibold">
          Observation (optional)
        </label>

        <textarea
          defaultValue={
            "Looked strong out of the blocks. Good acceleration into 20 m."
          }
          className="mt-1.5 min-h-[60px] w-full resize-none rounded-xl border border-border p-3 text-[8px] leading-relaxed outline-none"
        />
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <label className="text-[8px] font-semibold">
            Visibility
          </label>

          <select className="mt-1.5 block rounded-xl border border-border bg-white px-3 py-2 text-[8px] outline-none">
            <option>Private (Coach only)</option>
            <option>Athlete</option>
            <option>Staff</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-xl border border-border px-4 py-2 text-[8px] font-semibold"
          >
            Cancel
          </button>

          <button
            type="button"
            className="rounded-xl bg-violet-600 px-4 py-2 text-[8px] font-semibold text-white"
          >
            Save Result
          </button>
        </div>
      </div>
    </>
  );
}

function CoachNoteEditor({
  athletes,
}: {
  athletes: CoachAthlete[];
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[8px] font-semibold">
            Athlete
          </label>

          <select className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[8px]">
            {athletes.length === 0 ? (
              <option value="">No linked athletes</option>
            ) : (
              athletes.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.display_name}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="text-[8px] font-semibold">
            Note type
          </label>

          <select className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[8px]">
            <option>Technical Observation</option>
            <option>Training Observation</option>
            <option>Athlete Context</option>
            <option>Session Modification</option>
            <option>Planning Idea</option>
            <option>General Coach Note</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-[8px] font-semibold">
          Quick Note
        </label>

        <textarea
          placeholder="What did you observe?"
          className="mt-1.5 min-h-[90px] w-full resize-none rounded-xl border border-border p-3 text-[9px] outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[8px] font-semibold">
            Linked session
          </label>

          <select className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[8px]">
            <option>Current Sprint Session</option>
            <option>No linked session</option>
          </select>
        </div>

        <div>
          <label className="text-[8px] font-semibold">
            Visibility
          </label>

          <select className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[8px]">
            <option>Private (Coach only)</option>
            <option>Athlete</option>
            <option>Staff</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button className="rounded-xl border border-border px-4 py-2 text-[8px] font-semibold">
          Cancel
        </button>

        <button className="rounded-xl bg-violet-600 px-4 py-2 text-[8px] font-semibold text-white">
          Save Note
        </button>
      </div>
    </div>
  );
}

function FollowUpEditor({
  athletes,
}: {
  athletes: CoachAthlete[];
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[8px] font-semibold">
            Athlete
          </label>

          <select className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[8px]">
            {athletes.length === 0 ? (
              <option value="">No linked athletes</option>
            ) : (
              athletes.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.display_name}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="text-[8px] font-semibold">
            When?
          </label>

          <select className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[8px]">
            <option>Next training</option>
            <option>Next session of this type</option>
            <option>Before competition</option>
            <option>Specific date</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-[8px] font-semibold">
          Follow-up action
        </label>

        <textarea
          defaultValue="Try 6 min recovery next time."
          className="mt-1.5 min-h-[80px] w-full resize-none rounded-xl border border-border p-3 text-[9px] outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[8px] font-semibold">
            Linked context
          </label>

          <select className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[8px]">
            <option>Speed Session</option>
            <option>No linked session</option>
          </select>
        </div>

        <div>
          <label className="text-[8px] font-semibold">
            Visibility
          </label>

          <select className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[8px]">
            <option>Staff</option>
            <option>Private (Coach only)</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button className="rounded-xl border border-border px-4 py-2 text-[8px] font-semibold">
          Cancel
        </button>

        <button className="rounded-xl bg-violet-600 px-4 py-2 text-[8px] font-semibold text-white">
          Save Follow-up
        </button>
      </div>
    </div>
  );
}

function QuickTypes() {
  return (
    <aside className="rounded-xl border border-border p-3">
      <p className="text-[9px] font-bold">
        Quick Types
      </p>

      <div className="mt-2 grid grid-cols-2 gap-1">
        {measurementTypes.map((type, index) => (
          <button
            key={type}
            type="button"
            className={[
              "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[8px]",
              index === 0
                ? "bg-violet-50 text-violet-700"
                : "hover:bg-muted/20",
            ].join(" ")}
          >
            <Activity className="h-3.5 w-3.5" />
            {type}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-violet-100 py-2 text-[8px] font-semibold text-violet-700"
      >
        <Plus className="h-3 w-3" />
        Create Custom Type
      </button>
    </aside>
  );
}

export function NotesPage() {
  const { athletes } = useCoachAthletes();

  const [mainTab, setMainTab] =
    useState<MainTab>("all");

  const [createMode, setCreateMode] =
    useState<CreateMode>("measurement");

  const [notes, setNotes] =
    useState(initialNotes);

  const filteredNotes = useMemo(() => {
    if (mainTab === "measurements") {
      return notes.filter(
        (note) => note.kind === "measurement",
      );
    }

    if (mainTab === "follow-ups") {
      return notes.filter(
        (note) => note.kind === "follow-up",
      );
    }

    return notes;
  }, [mainTab, notes]);

  function togglePin(id: string) {
    setNotes((current) =>
      current.map((note) =>
        note.id === id
          ? {
              ...note,
              pinned: !note.pinned,
            }
          : note,
      ),
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
            Capture coach knowledge, measurements and actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-[9px] font-semibold"
          >
            <Users className="h-3.5 w-3.5 text-violet-600" />
            All Athletes
            <ChevronDown className="h-3 w-3" />
          </button>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-[9px] font-semibold"
          >
            <Settings2 className="h-3.5 w-3.5" />
            Filters
          </button>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-[9px] font-semibold text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Add New
            <ChevronDown className="h-3 w-3" />
          </button>

          <button
            type="button"
            className="rounded-xl border border-border bg-white px-3 py-2 text-[8px] font-semibold"
          >
            Quick Types
          </button>

          <button
            type="button"
            className="rounded-xl border border-border bg-white px-3 py-2 text-[8px] font-semibold text-violet-700"
          >
            Manage Types
          </button>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-2.5">
        {[
          {
            label: "Coach Notes",
            value: "96",
            detail: "Observations & context",
            icon: FileText,
            style: "bg-violet-50 text-violet-600",
          },
          {
            label: "Measurements",
            value: "23",
            detail: "Test results recorded",
            icon: Clock3,
            style: "bg-orange-50 text-orange-600",
          },
          {
            label: "Open Follow-ups",
            value: "9",
            detail: "Actions to follow up",
            icon: CheckCircle2,
            style: "bg-green-50 text-green-600",
          },
          {
            label: "Pinned Notes",
            value: "6",
            detail: "Important items",
            icon: Pin,
            style: "bg-blue-50 text-blue-600",
          },
        ].map(
          ({
            label,
            value,
            detail,
            icon: Icon,
            style,
          }) => (
            <article
              key={label}
              className="rounded-2xl border border-border bg-white p-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${style}`}
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

                  <p className="text-[7px] text-muted-foreground">
                    {detail}
                  </p>
                </div>
              </div>
            </article>
          ),
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="grid grid-cols-[1.12fr_0.88fr]">
          <div className="border-r border-border">
            <div className="flex items-center gap-6 border-b border-border px-3">
              {[
                ["all", "All Notes", FileText],
                ["measurements", "Measurements", Clock3],
                ["follow-ups", "Follow-ups", CheckCircle2],
              ].map(([id, label, Icon]) => (
                <button
                  key={id as string}
                  type="button"
                  onClick={() =>
                    setMainTab(id as MainTab)
                  }
                  className={[
                    "flex items-center gap-2 border-b-2 px-1 py-3 text-[9px] font-semibold",
                    mainTab === id
                      ? "border-violet-600 text-violet-700"
                      : "border-transparent text-muted-foreground",
                  ].join(" ")}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label as string}
                </button>
              ))}
            </div>

            {mainTab === "all" && (
              <div className="border-b border-border bg-violet-50/20 px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex shrink-0 items-center gap-2">
                    <Pin className="h-3.5 w-3.5 fill-violet-500 text-violet-500" />

                    <p className="text-[8px] font-bold">
                      Pinned
                    </p>
                  </div>

                  <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
                    {pinnedCoachNotes.slice(0, 3).map((note) => (
                      <button
                        key={note.id}
                        type="button"
                        className="min-w-0 max-w-[160px] rounded-lg border border-violet-100 bg-white px-2.5 py-1.5 text-left"
                      >
                        <p className="truncate text-[7px] font-semibold">
                          {note.title}
                        </p>

                        <p className="truncate text-[7px] text-muted-foreground">
                          {note.detail}
                        </p>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="shrink-0 text-[7px] font-semibold text-violet-600"
                  >
                    View all 6 →
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-[1fr_100px_110px_100px] gap-2 border-b border-border p-3">
              <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />

                <input
                  placeholder="Search notes..."
                  className="w-full bg-transparent text-[8px] outline-none"
                />
              </div>

              <button className="rounded-xl border border-border px-2 text-[8px] font-medium">
                All Types
              </button>

              <button className="rounded-xl border border-border px-2 text-[8px] font-medium">
                All Athletes
              </button>

              <button className="rounded-xl border border-border px-2 text-[8px] font-medium">
                Newest First
              </button>
            </div>

            {mainTab === "all" && notes.some((note) => note.pinned) && (
              <div>
                <div className="flex items-center gap-2 border-b border-border bg-violet-50/35 px-3 py-2">
                  <Pin className="h-3.5 w-3.5 fill-violet-500 text-violet-500" />

                  <p className="text-[8px] font-bold text-violet-700">
                    PINNED · {notes.filter((note) => note.pinned).length}
                  </p>
                </div>

                {notes
                  .filter((note) => note.pinned)
                  .map((note) => (
                    <NoteRow
                      key={`pinned-${note.id}`}
                      item={note}
                      onTogglePin={togglePin}
                    />
                  ))}
              </div>
            )}

            <NotesTimeline
              notes={
                mainTab === "all"
                  ? filteredNotes.filter((note) => !note.pinned)
                  : filteredNotes
              }
              onTogglePin={togglePin}
            />

            <div className="border-t border-border p-3 text-center">
              <button className="text-[8px] font-semibold text-violet-600">
                Load more ↓
              </button>
            </div>
          </div>

          <div className="p-3">
            <p className="text-[9px] font-bold">
              Add New
            </p>

            <div className="mt-2 grid grid-cols-3 gap-1.5">
              <CreateModeButton
                active={createMode === "note"}
                icon={FileText}
                title="Coach Note"
                detail="Observation, context, idea"
                onClick={() =>
                  setCreateMode("note")
                }
              />

              <CreateModeButton
                active={createMode === "measurement"}
                icon={Clock3}
                title="Measured Result"
                detail="Time, distance, test"
                onClick={() =>
                  setCreateMode("measurement")
                }
              />

              <CreateModeButton
                active={createMode === "follow-up"}
                icon={CheckCircle2}
                title="Follow-up"
                detail="Action or next step"
                onClick={() =>
                  setCreateMode("follow-up")
                }
              />
            </div>

            <div className="mt-3">
              {createMode === "measurement" ? (
                <div>
                  <div>
                    <MeasurementEditor athletes={athletes} />
                  </div>


                </div>
              ) : createMode === "note" ? (
                <>
                  <p className="mb-2 text-[9px] font-bold">
                    Coach Note
                  </p>

                  <CoachNoteEditor athletes={athletes} />
                </>
              ) : (
                <>
                  <p className="mb-2 text-[9px] font-bold">
                    Follow-up
                  </p>

                  <FollowUpEditor athletes={athletes} />
                </>
              )}
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}






















