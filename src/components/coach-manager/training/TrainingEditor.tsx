import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";

import type {
  CoachTrainingExercise,
  CoachTrainingSession,
  CoachTrainingSessionInput,
} from "@/lib/coach-training.functions";

import {
  useCoachExerciseLibrary,
} from "@/hooks/coach-manager/useCoachExerciseLibrary";

type TrainingEditorProps = {
  open: boolean;
  session: CoachTrainingSession | null;
  presetSession?: CoachTrainingSession | null;
  saving: boolean;
  onClose: () => void;
  onSave: (
    input: CoachTrainingSessionInput,
  ) => Promise<unknown>;
};

const demoExercises: CoachTrainingExercise[] = [
  {
    section: "Warm-up",
    name: "Dynamic Warm-up",
    details: "Mobility + sprint preparation",
    rest: "",
  },
  {
    section: "Main",
    name: "Block Starts",
    details: "4 × 20 m",
    rest: "3 min",
  },
  {
    section: "Main",
    name: "Acceleration",
    details: "4 × 30 m",
    rest: "4 min",
  },
  {
    section: "Main",
    name: "Flying Sprint",
    details: "3 × Flying 30 m",
    rest: "5 min",
  },
  {
    section: "Cool-down",
    name: "Mobility + Stretch",
    details: "10 min",
    rest: "",
  },
];

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function TrainingEditor({
  open,
  session,
  presetSession = null,
  saving,
  onClose,
  onSave,
}: TrainingEditorProps) {
  const [title, setTitle] = useState("");
  const [groupName, setGroupName] = useState("");
  const [date, setDate] = useState(todayString());
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("19:30");
  const [location, setLocation] = useState("Track");
  const [discipline, setDiscipline] = useState("Sprint");
  const [intensity, setIntensity] = useState("High");
  const [duration, setDuration] = useState("90");
  const [goal, setGoal] = useState("");
  const [coachNote, setCoachNote] = useState("");
  const [exercises, setExercises] =
    useState<CoachTrainingExercise[]>(demoExercises);

  const {
    exercises: libraryExercises,
    loading: libraryLoading,
    error: libraryError,
  } = useCoachExerciseLibrary();

  const [
    libraryOpen,
    setLibraryOpen,
  ] = useState(false);

  const [
    librarySearch,
    setLibrarySearch,
  ] = useState("");

  const [
    libraryCategory,
    setLibraryCategory,
  ] = useState("All");

  const filteredLibraryExercises =
    useMemo(() => {
      const search =
        librarySearch
          .trim()
          .toLowerCase();

      return libraryExercises.filter(
        (exercise) => {
          const matchesCategory =
            libraryCategory === "All" ||
            exercise.category ===
              libraryCategory;

          const matchesSearch =
            !search ||
            exercise.name
              .toLowerCase()
              .includes(search) ||
            exercise.description
              ?.toLowerCase()
              .includes(search) ||
            exercise.discipline
              ?.toLowerCase()
              .includes(search);

          return (
            matchesCategory &&
            matchesSearch
          );
        },
      );
    }, [
      libraryExercises,
      librarySearch,
      libraryCategory,
    ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (session) {
      setTitle(session.title);
      setGroupName(session.group_name ?? "");
      setDate(session.session_date);
      setStartTime(
        session.start_time?.slice(0, 5) ?? "",
      );
      setEndTime(
        session.end_time?.slice(0, 5) ?? "",
      );
      setLocation(session.location ?? "");
      setDiscipline(session.discipline ?? "");
      setIntensity(session.intensity ?? "");
      setDuration(
        session.duration_minutes !== null
          ? String(session.duration_minutes)
          : "",
      );
      setGoal(session.session_goal ?? "");
      setCoachNote(session.coach_note ?? "");
      setExercises(
        session.exercises.length
          ? session.exercises
          : demoExercises,
      );
      return;
    }

    if (presetSession) {
      setTitle(presetSession.title);
      setGroupName(
        presetSession.group_name ?? "",
      );

      setDate(todayString());

      setStartTime(
        presetSession.start_time?.slice(0, 5) ??
          "18:00",
      );

      setEndTime(
        presetSession.end_time?.slice(0, 5) ??
          "19:30",
      );

      setLocation(
        presetSession.location ?? "Track",
      );

      setDiscipline(
        presetSession.discipline ?? "Sprint",
      );

      setIntensity(
        presetSession.intensity ?? "Moderate",
      );

      setDuration(
        presetSession.duration_minutes !== null
          ? String(
              presetSession.duration_minutes,
            )
          : "",
      );

      setGoal(
        presetSession.session_goal ?? "",
      );

      setCoachNote(
        presetSession.coach_note ?? "",
      );

      setExercises(
        presetSession.exercises.length
          ? presetSession.exercises.map(
              (exercise) => ({
                ...exercise,
              }),
            )
          : [],
      );

      return;
    }

    setTitle("");
    setGroupName("");
    setDate(todayString());
    setStartTime("18:00");
    setEndTime("19:30");
    setLocation("Track");
    setDiscipline("Sprint");
    setIntensity("Moderate");
    setDuration("");
    setGoal("");
    setCoachNote("");
    setExercises([]);
  }, [open, session, presetSession]);

  if (!open) {
    return null;
  }

  function updateExercise(
    index: number,
    field: keyof CoachTrainingExercise,
    value: string,
  ) {
    setExercises((current) =>
      current.map((exercise, exerciseIndex) =>
        exerciseIndex === index
          ? {
              ...exercise,
              [field]: value,
            }
          : exercise,
      ),
    );
  }

  function addExerciseFromLibrary(
    libraryExercise:
      (typeof libraryExercises)[number],
  ) {
    setExercises((current) => [
      ...current,
      {
        section: "Main",
        name:
          libraryExercise.name,
        details:
          libraryExercise.default_details ??
          "",
        rest:
          libraryExercise.default_rest ??
          "",
      },
    ]);
  }

  function addExercise() {
    setExercises((current) => [
      ...current,
      {
        section: "Main",
        name: "",
        details: "",
        rest: "",
      },
    ]);
  }

  function removeExercise(index: number) {
    setExercises((current) =>
      current.filter(
        (_, exerciseIndex) =>
          exerciseIndex !== index,
      ),
    );
  }

  async function handleSave() {
    if (!title.trim()) {
      return;
    }

    await onSave({
      title: title.trim(),
      groupName:
        groupName.trim() || null,

      sessionDate: date,

      startTime:
        startTime || null,

      endTime:
        endTime || null,

      location:
        location.trim() || null,

      discipline:
        discipline.trim() || null,

      intensity:
        intensity.trim() || null,

      durationMinutes:
        duration
          ? Number(duration)
          : null,

      sessionGoal:
        goal.trim() || null,

      coachNote:
        coachNote.trim() || null,

      exercises: exercises
        .filter(
          (exercise) =>
            exercise.name.trim(),
        )
        .map((exercise) => ({
          section:
            exercise.section?.trim() || undefined,

          name:
            exercise.name.trim(),

          details:
            exercise.details?.trim() || undefined,

          rest:
            exercise.rest?.trim() || undefined,
        })),

      status:
        session?.status ?? "draft",
    });

    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        onClick={(event) =>
          event.stopPropagation()
        }
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-600">
              Training Session
            </p>

            <h2 className="mt-1 text-xl font-bold">
              {session
                ? "Edit Training"
                : presetSession
                  ? "Reuse Training"
                  : "Create Training"}
            </h2>

            <p className="mt-1 text-[10px] text-muted-foreground">
              Changes are saved to Supabase.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted/30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-[9px] font-semibold">
              Training title
            </span>

            <input
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              className="w-full rounded-xl border border-border px-3 py-2 text-xs outline-none focus:border-orange-300"
            />
          </label>

          <label className="space-y-1">
            <span className="text-[9px] font-semibold">
              Group
            </span>

            <input
              value={groupName}
              onChange={(event) =>
                setGroupName(event.target.value)
              }
              className="w-full rounded-xl border border-border px-3 py-2 text-xs outline-none focus:border-orange-300"
            />
          </label>

          <label className="space-y-1">
            <span className="text-[9px] font-semibold">
              Date
            </span>

            <input
              type="date"
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
              className="w-full rounded-xl border border-border px-3 py-2 text-xs"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1">
              <span className="text-[9px] font-semibold">
                Start
              </span>

              <input
                type="time"
                value={startTime}
                onChange={(event) =>
                  setStartTime(event.target.value)
                }
                className="w-full rounded-xl border border-border px-3 py-2 text-xs"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[9px] font-semibold">
                End
              </span>

              <input
                type="time"
                value={endTime}
                onChange={(event) =>
                  setEndTime(event.target.value)
                }
                className="w-full rounded-xl border border-border px-3 py-2 text-xs"
              />
            </label>
          </div>

          <label className="space-y-1">
            <span className="text-[9px] font-semibold">
              Location
            </span>

            <input
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
              className="w-full rounded-xl border border-border px-3 py-2 text-xs"
            />
          </label>

          <label className="space-y-1">
            <span className="text-[9px] font-semibold">
              Discipline
            </span>

            <input
              value={discipline}
              onChange={(event) =>
                setDiscipline(event.target.value)
              }
              className="w-full rounded-xl border border-border px-3 py-2 text-xs"
            />
          </label>

          <label className="space-y-1">
            <span className="text-[9px] font-semibold">
              Intensity
            </span>

            <select
              value={intensity}
              onChange={(event) =>
                setIntensity(event.target.value)
              }
              className="w-full rounded-xl border border-border px-3 py-2 text-xs"
            >
              <option value="Low">
                Low
              </option>
              <option value="Moderate">
                Moderate
              </option>
              <option value="High">
                High
              </option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-[9px] font-semibold">
              Duration (min)
            </span>

            <input
              type="number"
              min="0"
              max="600"
              value={duration}
              onChange={(event) =>
                setDuration(event.target.value)
              }
              className="w-full rounded-xl border border-border px-3 py-2 text-xs"
            />
          </label>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-[9px] font-semibold">
              Session goal
            </span>

            <textarea
              value={goal}
              onChange={(event) =>
                setGoal(event.target.value)
              }
              className="min-h-[80px] w-full resize-none rounded-xl border border-border p-3 text-xs outline-none focus:border-orange-300"
            />
          </label>

          <label className="space-y-1">
            <span className="text-[9px] font-semibold">
              Coach note
            </span>

            <textarea
              value={coachNote}
              onChange={(event) =>
                setCoachNote(event.target.value)
              }
              className="min-h-[80px] w-full resize-none rounded-xl border border-border p-3 text-xs outline-none focus:border-orange-300"
            />
          </label>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold">
                Exercises
              </h3>

              <p className="text-[9px] text-muted-foreground">
                Edit the structure of the session.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setLibraryOpen(true)
                }
                className="flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-2 py-1.5 text-[9px] font-semibold text-orange-700"
              >
                <BookOpen className="h-3 w-3" />
                Add from Exercise Library
              </button>

              <button
                type="button"
                onClick={addExercise}
                className="flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-[9px] font-semibold"
              >
                <Plus className="h-3 w-3" />
                Add Exercise
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {exercises.map(
              (exercise, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[0.7fr_1fr_1.2fr_0.7fr_auto] gap-2 rounded-xl border border-border p-2"
                >
                  <input
                    placeholder="Section"
                    value={
                      exercise.section ?? ""
                    }
                    onChange={(event) =>
                      updateExercise(
                        index,
                        "section",
                        event.target.value,
                      )
                    }
                    className="rounded-lg border border-border px-2 py-1.5 text-[9px]"
                  />

                  <input
                    placeholder="Exercise"
                    value={exercise.name}
                    onChange={(event) =>
                      updateExercise(
                        index,
                        "name",
                        event.target.value,
                      )
                    }
                    className="rounded-lg border border-border px-2 py-1.5 text-[9px]"
                  />

                  <input
                    placeholder="Sets / reps / distance"
                    value={
                      exercise.details ?? ""
                    }
                    onChange={(event) =>
                      updateExercise(
                        index,
                        "details",
                        event.target.value,
                      )
                    }
                    className="rounded-lg border border-border px-2 py-1.5 text-[9px]"
                  />

                  <input
                    placeholder="Recovery"
                    value={
                      exercise.rest ?? ""
                    }
                    onChange={(event) =>
                      updateExercise(
                        index,
                        "rest",
                        event.target.value,
                      )
                    }
                    className="rounded-lg border border-border px-2 py-1.5 text-[9px]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeExercise(index)
                    }
                    className="grid h-8 w-8 place-items-center rounded-lg text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ),
            )}
          </div>
        </div>

        {libraryOpen && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 p-4"
            onClick={() =>
              setLibraryOpen(false)
            }
          >
            <div
              onClick={(event) =>
                event.stopPropagation()
              }
              className="max-h-[78vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-white p-4 shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-600">
                    Exercise Library
                  </p>

                  <h3 className="mt-1 text-lg font-bold">
                    Add Exercises
                  </h3>

                  <p className="mt-1 text-[9px] text-muted-foreground">
                    Choose an exercise and then adjust it freely inside this training.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setLibraryOpen(false)
                  }
                  className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted/30"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl border border-border px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />

                <input
                  value={librarySearch}
                  onChange={(event) =>
                    setLibrarySearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search exercises..."
                  className="w-full bg-transparent text-xs outline-none"
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  "All",
                  "Sprint",
                  "Hurdles",
                  "Strength",
                  "Mobility",
                ].map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      setLibraryCategory(
                        category,
                      )
                    }
                    className={[
                      "rounded-full px-2.5 py-1 text-[8px] font-semibold transition",
                      libraryCategory ===
                      category
                        ? "bg-orange-500 text-white"
                        : "bg-slate-100 text-slate-600",
                    ].join(" ")}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {libraryError && (
                <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3">
                  <p className="text-[9px] font-semibold text-red-700">
                    {libraryError}
                  </p>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2">
                {libraryLoading &&
                  Array.from({
                    length: 6,
                  }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className="h-20 animate-pulse rounded-xl bg-muted/40"
                      />
                    ),
                  )}

                {!libraryLoading &&
                  filteredLibraryExercises.map(
                    (exercise) => (
                      <button
                        key={
                          exercise.id
                        }
                        type="button"
                        onClick={() =>
                          addExerciseFromLibrary(
                            exercise,
                          )
                        }
                        className="rounded-xl border border-border p-3 text-left transition hover:border-orange-200 hover:bg-orange-50/40"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] font-bold">
                              {
                                exercise.name
                              }
                            </p>

                            <div className="mt-1 flex flex-wrap gap-1">
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[7px] font-semibold text-slate-600">
                                {
                                  exercise.category
                                }
                              </span>

                              <span
                                className={[
                                  "rounded-full px-2 py-0.5 text-[7px] font-semibold",
                                  exercise.source ===
                                  "system"
                                    ? "bg-violet-50 text-violet-700"
                                    : "bg-blue-50 text-blue-700",
                                ].join(" ")}
                              >
                                {exercise.source ===
                                "system"
                                  ? "Aether"
                                  : "My Exercise"}
                              </span>
                            </div>
                          </div>

                          <Plus className="h-3.5 w-3.5 text-orange-500" />
                        </div>

                        {(exercise.default_details ||
                          exercise.default_rest) && (
                          <p className="mt-2 text-[8px] text-muted-foreground">
                            {exercise.default_details ??
                              "No default details"}

                            {exercise.default_rest
                              ? ` · Rest ${exercise.default_rest}`
                              : ""}
                          </p>
                        )}
                      </button>
                    ),
                  )}

                {!libraryLoading &&
                  filteredLibraryExercises.length ===
                    0 && (
                    <div className="col-span-2 rounded-xl border border-dashed border-border p-6 text-center">
                      <p className="text-[9px] font-semibold">
                        No exercises found
                      </p>
                    </div>
                  )}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setLibraryOpen(false)
                  }
                  className="rounded-xl bg-slate-900 px-4 py-2 text-[9px] font-semibold text-white"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-border px-4 py-2 text-xs font-semibold"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() =>
              void handleSave()
            }
            disabled={
              saving || !title.trim()
            }
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saving
              ? "Saving..."
              : "Save Training"}
          </button>
        </div>
      </div>
    </div>
  );
}





