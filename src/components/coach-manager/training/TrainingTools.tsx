import {
  BookOpen,
  Copy,
  Dumbbell,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useCoachExerciseLibrary,
} from "@/hooks/coach-manager/useCoachExerciseLibrary";

const createOptions = [
  {
    label: "Start from scratch",
    detail: "Build your own session",
    icon: Plus,
    style: "bg-orange-50 text-orange-500",
  },
  {
    label: "Use previous training",
    detail: "Copy and adapt",
    icon: Copy,
    style: "bg-blue-50 text-blue-600",
  },
  {
    label: "Use template",
    detail: "Choose from templates",
    icon: BookOpen,
    style: "bg-violet-50 text-violet-600",
  },
  {
    label: "Create with AI",
    detail: "Let AI help you build",
    icon: Sparkles,
    style: "bg-violet-50 text-violet-600",
  },
];

const categories = [
  "All",
  "Sprint",
  "Hurdles",
  "Strength",
  "Mobility",
];

export function TrainingTools({
  onStartFromScratch,
  onUsePreviousTraining,
}: {
  onStartFromScratch: () => void;
  onUsePreviousTraining: () => void;
}) {
  const {
    exercises,
    loading,
    error,
    mutationError,
    saving,
    createExercise,
  } = useCoachExerciseLibrary();

  const [search, setSearch] =
    useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("All");

  const [
    addExerciseOpen,
    setAddExerciseOpen,
  ] = useState(false);

  const [newName, setNewName] =
    useState("");

  const [newCategory, setNewCategory] =
    useState("Sprint");

  const [newDiscipline, setNewDiscipline] =
    useState("Sprint");

  const [newDetails, setNewDetails] =
    useState("");

  const [newRest, setNewRest] =
    useState("");

  const [newDescription, setNewDescription] =
    useState("");

  async function handleCreateExercise() {
    if (!newName.trim()) {
      return;
    }

    await createExercise({
      name: newName.trim(),
      category: newCategory,
      discipline:
        newDiscipline.trim() || null,
      defaultDetails:
        newDetails.trim() || null,
      defaultRest:
        newRest.trim() || null,
      description:
        newDescription.trim() || null,
    });

    setNewName("");
    setNewCategory("Sprint");
    setNewDiscipline("Sprint");
    setNewDetails("");
    setNewRest("");
    setNewDescription("");
    setAddExerciseOpen(false);
  }

  const filteredExercises =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return exercises.filter(
        (exercise) => {
          const matchesSearch =
            !query ||
            exercise.name
              .toLowerCase()
              .includes(query) ||
            exercise.description
              ?.toLowerCase()
              .includes(query) ||
            exercise.discipline
              ?.toLowerCase()
              .includes(query);

          const matchesCategory =
            selectedCategory === "All" ||
            exercise.category ===
              selectedCategory;

          return (
            matchesSearch &&
            matchesCategory
          );
        },
      );
    }, [
      exercises,
      search,
      selectedCategory,
    ]);

  return (
    <div className="space-y-3">
      <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
        <h3 className="text-xs font-bold">
          Create Training
        </h3>

        <p className="mt-1 text-[9px] text-muted-foreground">
          Build a new training session in a few clicks.
        </p>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {createOptions.map(
            ({
              label,
              detail,
              icon: Icon,
              style,
            }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  if (
                    label ===
                    "Start from scratch"
                  ) {
                    onStartFromScratch();
                    return;
                  }

                  if (
                    label ===
                    "Use previous training"
                  ) {
                    onUsePreviousTraining();
                  }
                }}
                className="flex items-center gap-2 rounded-xl border border-border p-2 text-left transition hover:bg-muted/20"
              >
                <div
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${style}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-[9px] font-semibold">
                    {label}
                  </p>

                  <p className="text-[8px] text-muted-foreground">
                    {detail}
                  </p>
                </div>
              </button>
            ),
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold">
              Exercise Library
            </h3>

            <p className="mt-1 text-[9px] text-muted-foreground">
              Reuse Aether exercises and your own saved exercises.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAddExerciseOpen(true)}
              className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[9px] font-semibold"
            >
              <Plus className="h-3 w-3" />
              Add Exercise
            </button>

            <Dumbbell className="h-4 w-4 text-orange-500" />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-lg border border-border px-2 py-1.5">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search exercises..."
            className="w-full bg-transparent text-[9px] outline-none"
          />
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {categories.map(
            (category) => (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setSelectedCategory(
                    category,
                  )
                }
                className={[
                  "rounded-full px-2.5 py-1 text-[8px] font-semibold transition",
                  selectedCategory === category
                    ? "bg-orange-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                ].join(" ")}
              >
                {category}
              </button>
            ),
          )}
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3">
            <p className="text-[9px] font-semibold text-red-700">
              {error}
            </p>
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-2">
          {loading &&
            Array.from({
              length: 6,
            }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-xl bg-muted/40"
              />
            ))}

          {!loading &&
            filteredExercises.map(
              (exercise) => (
                <article
                  key={exercise.id}
                  className="rounded-xl border border-border p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-bold">
                        {
                          exercise.name
                        }
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[7px] font-semibold text-slate-600">
                          {
                            exercise.category
                          }
                        </span>

                        {exercise.discipline && (
                          <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[7px] font-semibold text-orange-600">
                            {
                              exercise.discipline
                            }
                          </span>
                        )}

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

                    <Dumbbell className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                  </div>

                  {(exercise.default_details ||
                    exercise.default_rest) && (
                    <div className="mt-2 flex flex-wrap gap-2 text-[8px] text-muted-foreground">
                      {exercise.default_details && (
                        <span>
                          {
                            exercise.default_details
                          }
                        </span>
                      )}

                      {exercise.default_rest && (
                        <span>
                          Rest:{" "}
                          {
                            exercise.default_rest
                          }
                        </span>
                      )}
                    </div>
                  )}

                  {exercise.description && (
                    <p className="mt-2 line-clamp-2 text-[8px] leading-relaxed text-muted-foreground">
                      {
                        exercise.description
                      }
                    </p>
                  )}
                </article>
              ),
            )}

          {!loading &&
            filteredExercises.length ===
              0 && (
              <div className="col-span-2 rounded-xl border border-dashed border-border p-6 text-center">
                <p className="text-[9px] font-semibold">
                  No exercises found
                </p>

                <p className="mt-1 text-[8px] text-muted-foreground">
                  Try another search or category.
                </p>
              </div>
            )}
        </div>
      </section>

      {addExerciseOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setAddExerciseOpen(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-xl rounded-2xl border border-border bg-white p-4 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-600">
                  Exercise Library
                </p>

                <h3 className="mt-1 text-lg font-bold">
                  Add Exercise
                </h3>

                <p className="mt-1 text-[9px] text-muted-foreground">
                  Save a reusable exercise to your own library.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAddExerciseOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted/30"
              >
                ×
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-[9px] font-semibold">
                  Exercise name
                </span>

                <input
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  placeholder="e.g. Resisted 20 m Sprint"
                  className="w-full rounded-xl border border-border px-3 py-2 text-xs"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[9px] font-semibold">
                  Category
                </span>

                <select
                  value={newCategory}
                  onChange={(event) => setNewCategory(event.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 text-xs"
                >
                  <option value="Sprint">Sprint</option>
                  <option value="Hurdles">Hurdles</option>
                  <option value="Strength">Strength</option>
                  <option value="Mobility">Mobility</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-[9px] font-semibold">
                  Discipline
                </span>

                <input
                  value={newDiscipline}
                  onChange={(event) => setNewDiscipline(event.target.value)}
                  placeholder="Sprint"
                  className="w-full rounded-xl border border-border px-3 py-2 text-xs"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[9px] font-semibold">
                  Default details
                </span>

                <input
                  value={newDetails}
                  onChange={(event) => setNewDetails(event.target.value)}
                  placeholder="4 × 30 m"
                  className="w-full rounded-xl border border-border px-3 py-2 text-xs"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[9px] font-semibold">
                  Default rest
                </span>

                <input
                  value={newRest}
                  onChange={(event) => setNewRest(event.target.value)}
                  placeholder="4 min"
                  className="w-full rounded-xl border border-border px-3 py-2 text-xs"
                />
              </label>

              <label className="space-y-1 col-span-2">
                <span className="text-[9px] font-semibold">
                  Description
                </span>

                <textarea
                  value={newDescription}
                  onChange={(event) => setNewDescription(event.target.value)}
                  placeholder="What this exercise is for..."
                  className="min-h-[80px] w-full rounded-xl border border-border px-3 py-2 text-xs"
                />
              </label>
            </div>

            {mutationError && (
              <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3">
                <p className="text-[9px] font-semibold text-red-700">
                  {mutationError}
                </p>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setAddExerciseOpen(false)}
                className="rounded-xl border border-border px-3 py-2 text-[9px] font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving || !newName.trim()}
                onClick={handleCreateExercise}
                className="rounded-xl bg-orange-500 px-4 py-2 text-[9px] font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Exercise"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




