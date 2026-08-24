import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import type {
  CoachAthlete,
} from "@/hooks/useCoachAthletes";

import {
  useCoachIndividualPlans,
} from "@/hooks/coach-manager/useCoachIndividualPlans";

import type {
  CoachIndividualPlan,
  CoachIndividualPlanInput,
} from "@/lib/coach-individual-plans.functions";

import type {
  CoachTrainingSession,
} from "@/lib/coach-training.functions";

function startOfWeek(date: Date) {
  const copy = new Date(date);

  const day =
    (copy.getDay() + 6) % 7;

  copy.setDate(
    copy.getDate() - day,
  );

  copy.setHours(0, 0, 0, 0);

  return copy;
}

function addDays(
  date: Date,
  amount: number,
) {
  const copy = new Date(date);

  copy.setDate(
    copy.getDate() + amount,
  );

  return copy;
}

function toDateString(date: Date) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(2, "0");

  const day =
    String(
      date.getDate(),
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatWeek(
  start: Date,
) {
  const end =
    addDays(start, 6);

  const startText =
    start.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
      },
    );

  const endText =
    end.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );

  return `${startText} – ${endText}`;
}

export function IndividualTrainingPlans({
  athletes,
  mainSession,
  initialAthleteId = null,
  onBack,
}: {
  athletes: CoachAthlete[];
  mainSession: CoachTrainingSession | null;
  initialAthleteId?: string | null;
  onBack: () => void;
}) {
  const [selectedAthleteId, setSelectedAthleteId] =
    useState<string | null>(
      initialAthleteId ??
        athletes[0]?.id ??
        null,
    );

  const [weekStart, setWeekStart] =
    useState(() =>
      startOfWeek(new Date()),
    );

  const [editorPlan, setEditorPlan] =
    useState<CoachIndividualPlan | null>(
      null,
    );

  const [editorDate, setEditorDate] =
    useState<string | null>(null);

  const selectedAthlete =
    athletes.find(
      (athlete) =>
        athlete.id ===
        selectedAthleteId,
    ) ?? null;

  const weekEnd =
    addDays(
      weekStart,
      6,
    );

  const {
    plans,
    loading,
    error,
    createPlan,
    updatePlan,
    publishPlan,
    deletePlan,
    saving,
    mutationError,
  } = useCoachIndividualPlans({
    athleteId:
      selectedAthleteId,

    startDate:
      toDateString(
        weekStart,
      ),

    endDate:
      toDateString(
        weekEnd,
      ),
  });

  const weekDays =
    useMemo(
      () =>
        Array.from(
          { length: 7 },
          (_, index) =>
            addDays(
              weekStart,
              index,
            ),
        ),
      [weekStart],
    );

  function openCreate(
    date: string,
  ) {
    setEditorPlan(null);
    setEditorDate(date);
  }

  function closeEditor() {
    setEditorPlan(null);
    setEditorDate(null);
  }

  return (
    <>
      <div className="space-y-3">
        <button
          type="button"
          onClick={onBack}
          className="text-[10px] font-semibold text-orange-600"
        >
          ← Back to Training
        </button>

        <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-600">
                Individual Training
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Athlete Training Plans
              </h2>

              <p className="mt-1 text-[10px] text-muted-foreground">
                Build and adjust training for individual athletes.
              </p>
            </div>

            <select
              value={
                selectedAthleteId ?? ""
              }
              onChange={(event) =>
                setSelectedAthleteId(
                  event.target.value ||
                    null,
                )
              }
              className="rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold"
            >
              {athletes.map(
                (athlete) => (
                  <option
                    key={
                      athlete.id
                    }
                    value={
                      athlete.id
                    }
                  >
                    {
                      athlete.display_name
                    }
                  </option>
                ),
              )}
            </select>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-bold">
                {selectedAthlete
                  ? `${selectedAthlete.display_name}'s Plan`
                  : "Select an athlete"}
              </p>

              <p className="mt-1 text-[9px] text-muted-foreground">
                {formatWeek(
                  weekStart,
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setWeekStart(
                    addDays(
                      weekStart,
                      -7,
                    ),
                  )
                }
                className="grid h-8 w-8 place-items-center rounded-lg border border-border"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setWeekStart(
                    startOfWeek(
                      new Date(),
                    ),
                  )
                }
                className="rounded-lg border border-border px-3 py-2 text-[9px] font-semibold"
              >
                Today
              </button>

              <button
                type="button"
                onClick={() =>
                  setWeekStart(
                    addDays(
                      weekStart,
                      7,
                    ),
                  )
                }
                className="grid h-8 w-8 place-items-center rounded-lg border border-border"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {error && (
            <div className="border-b border-red-100 bg-red-50 px-4 py-2">
              <p className="text-[9px] font-semibold text-red-700">
                {error}
              </p>
            </div>
          )}

          <div className="grid grid-cols-7">
            {weekDays.map(
              (date) => {
                const dateString =
                  toDateString(
                    date,
                  );

                const dayPlans =
                  plans.filter(
                    (plan) =>
                      plan.workout_date ===
                      dateString,
                  );

                const today =
                  dateString ===
                  toDateString(
                    new Date(),
                  );

                return (
                  <div
                    key={
                      dateString
                    }
                    className={[
                      "min-h-[190px] border-r border-border p-2 last:border-r-0",
                      today
                        ? "bg-orange-50/30"
                        : "",
                    ].join(
                      " ",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[8px] font-semibold uppercase text-muted-foreground">
                          {date.toLocaleDateString(
                            "en-US",
                            {
                              weekday:
                                "short",
                            },
                          )}
                        </p>

                        <p
                          className={[
                            "mt-1 grid h-6 w-6 place-items-center rounded-full text-[9px] font-bold",
                            today
                              ? "bg-orange-500 text-white"
                              : "",
                          ].join(
                            " ",
                          )}
                        >
                          {
                            date.getDate()
                          }
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          openCreate(
                            dateString,
                          )
                        }
                        disabled={
                          !selectedAthleteId
                        }
                        className="grid h-6 w-6 place-items-center rounded-lg text-orange-600 transition hover:bg-orange-50 disabled:opacity-30"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-2 space-y-1.5">
                      {loading && (
                        <div className="h-10 animate-pulse rounded-lg bg-muted/40" />
                      )}

                      {dayPlans.map(
                        (plan) => (
                          <button
                            key={
                              plan.id
                            }
                            type="button"
                            onClick={() => {
                              setEditorPlan(
                                plan,
                              );

                              setEditorDate(
                                plan.workout_date,
                              );
                            }}
                            className="w-full rounded-xl border border-orange-100 bg-orange-50 p-2 text-left transition hover:bg-orange-100/60"
                          >
                            <p className="truncate text-[9px] font-bold text-orange-700">
                              {
                                plan.title
                              }
                            </p>

                            <p className="mt-1 text-[8px] text-orange-700/70">
                              {plan.duration_minutes
                                ? `${plan.duration_minutes} min`
                                : "Individual plan"}
                            </p>

                            <span
                              className={[
                                "mt-1.5 inline-flex rounded-full px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide",
                                plan.is_published
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-600",
                              ].join(" ")}
                            >
                              {plan.is_published
                                ? "Published"
                                : "Draft"}
                            </span>
                          </button>
                        ),
                      )}

                      {!loading &&
                        dayPlans.length ===
                          0 && (
                          <p className="pt-2 text-center text-[8px] text-muted-foreground">
                            No plan
                          </p>
                        )}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </section>
      </div>

      {selectedAthleteId &&
        editorDate && (
          <IndividualPlanEditor
            athleteId={
              selectedAthleteId
            }
            date={
              editorDate
            }
            plan={
              editorPlan
            }
            mainSession={
              mainSession
            }
            saving={
              saving
            }
            error={
              mutationError
            }
            onClose={
              closeEditor
            }
            onCreate={
              createPlan
            }
            onUpdate={
              updatePlan
            }
            onPublish={
              publishPlan
            }
            onDelete={
              deletePlan
            }
          />
        )}
    </>
  );
}

function IndividualPlanEditor({
  athleteId,
  date,
  plan,
  mainSession,
  saving,
  error,
  onClose,
  onCreate,
  onUpdate,
  onPublish,
  onDelete,
}: {
  athleteId: string;
  date: string;
  plan: CoachIndividualPlan | null;
  mainSession: CoachTrainingSession | null;
  saving: boolean;
  error: string | null;

  onClose: () => void;

  onCreate: (
    input: CoachIndividualPlanInput,
  ) => Promise<unknown>;

  onUpdate: (input: {
    planId: string;
    plan: CoachIndividualPlanInput;
  }) => Promise<unknown>;

  onPublish: (input: {
    planId: string;
    athleteId: string;
  }) => Promise<unknown>;

  onDelete: (input: {
    planId: string;
    athleteId: string;
  }) => Promise<unknown>;
}) {
  const [title, setTitle] =
    useState(
      plan?.title ??
        "",
    );

  const [workoutDate, setWorkoutDate] =
    useState(
      plan?.workout_date ??
        date,
    );

  const [discipline, setDiscipline] =
    useState(
      plan?.discipline ??
        "Sprint",
    );

  const [duration, setDuration] =
    useState(
      plan?.duration_minutes?.toString() ??
        "",
    );

  const [goal, setGoal] =
    useState(
      plan?.session_goal ??
        "",
    );

  const [coachNote, setCoachNote] =
    useState(
      plan?.coach_note ??
        "",
    );

  const [exercises, setExercises] =
    useState(
      plan?.exercises?.length
        ? plan.exercises
        : [
            {
              section: "Main",
              name: "",
              details: "",
              rest: "",
            },
          ],
    );

  function copyMainTraining() {
    if (!mainSession) {
      return;
    }

    setTitle(mainSession.title ?? "");

    setWorkoutDate(date);

    setDiscipline(
      mainSession.discipline ?? "Sprint",
    );

    setDuration(
      mainSession.duration_minutes?.toString() ?? "",
    );

    setGoal(
      mainSession.session_goal ?? "",
    );

    setCoachNote(
      mainSession.coach_note ?? "",
    );

    setExercises(
      mainSession.exercises?.length
        ? mainSession.exercises.map((exercise) => ({
            section: exercise.section ?? "Main",
            name: exercise.name,
            details: exercise.details ?? "",
            rest: exercise.rest ?? "",
          }))
        : [
            {
              section: "Main",
              name: "",
              details: "",
              rest: "",
            },
          ],
    );
  }

  function updateExercise(
    index: number,
    field:
      | "section"
      | "name"
      | "details"
      | "rest",
    value: string,
  ) {
    setExercises(
      (current) =>
        current.map(
          (
            exercise,
            exerciseIndex,
          ) =>
            exerciseIndex ===
            index
              ? {
                  ...exercise,
                  [field]:
                    value,
                }
              : exercise,
        ),
    );
  }

  function addExercise() {
    setExercises(
      (current) => [
        ...current,
        {
          section: "Main",
          name: "",
          details: "",
          rest: "",
        },
      ],
    );
  }

  function removeExercise(
    index: number,
  ) {
    setExercises(
      (current) =>
        current.filter(
          (_, i) =>
            i !== index,
        ),
    );
  }

  function buildInput(): CoachIndividualPlanInput | null {
    if (!title.trim()) {
      return null;
    }

    return {
      athleteId,

      workoutDate,

      title:
        title.trim(),

      discipline:
        discipline.trim() ||
        null,

      durationMinutes:
        duration
          ? Number(duration)
          : null,

      sessionGoal:
        goal.trim() ||
        null,

      coachNote:
        coachNote.trim() ||
        null,

      exercises:
        exercises
          .filter(
            (exercise) =>
              exercise.name.trim(),
          )
          .map(
            (exercise) => ({
              section:
                exercise.section?.trim() ||
                undefined,

              name:
                exercise.name.trim(),

              details:
                exercise.details?.trim() ||
                undefined,

              rest:
                exercise.rest?.trim() ||
                undefined,
            }),
          ),

      status:
        plan?.status ??
        "planned",
    };
  }

  async function saveDraft() {
    const input =
      buildInput();

    if (!input) {
      return;
    }

    if (plan) {
      await onUpdate({
        planId:
          plan.id,
        plan:
          input,
      });
    } else {
      await onCreate(
        input,
      );
    }

    onClose();
  }

  async function publishToAthlete() {
    const input =
      buildInput();

    if (!input) {
      return;
    }

    if (plan) {
      await onUpdate({
        planId:
          plan.id,
        plan:
          input,
      });

      await onPublish({
        planId:
          plan.id,
        athleteId,
      });

      onClose();
      return;
    }

    const created =
      (await onCreate(
        input,
      )) as CoachIndividualPlan;

    await onPublish({
      planId:
        created.id,
      athleteId,
    });

    onClose();
  }

  async function remove() {
    if (!plan) {
      return;
    }

    await onDelete({
      planId:
        plan.id,
      athleteId,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-border bg-white p-4 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-600">
              Individual Training
            </p>

            <h3 className="mt-1 text-lg font-bold">
              {plan
                ? "Edit Athlete Plan"
                : "Create Athlete Plan"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted/30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!plan && (
          <section className="mt-4 rounded-xl border border-orange-100 bg-orange-50/30 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold">
                  Start from today's main training
                </p>

                <p className="mt-0.5 text-[8px] text-muted-foreground">
                  Copy the group session, then change only what this athlete needs.
                </p>
              </div>

              <button
                type="button"
                onClick={copyMainTraining}
                disabled={!mainSession}
                className="rounded-xl bg-orange-500 px-3 py-2 text-[9px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              >
                {mainSession
                  ? "Copy Main Training"
                  : "No Main Training Today"}
              </button>
            </div>
          </section>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="text-[9px] font-semibold">
              Training title
            </label>

            <input
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              placeholder="e.g. Acceleration Technique"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="text-[9px] font-semibold">
              Date
            </label>

            <input
              type="date"
              value={
                workoutDate
              }
              onChange={(event) =>
                setWorkoutDate(
                  event.target.value,
                )
              }
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="text-[9px] font-semibold">
              Discipline
            </label>

            <input
              value={
                discipline
              }
              onChange={(event) =>
                setDiscipline(
                  event.target.value,
                )
              }
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="text-[9px] font-semibold">
              Duration
            </label>

            <input
              type="number"
              value={duration}
              onChange={(event) =>
                setDuration(
                  event.target.value,
                )
              }
              placeholder="60"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-xs"
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="text-[9px] font-semibold">
              Session goal
            </label>

            <textarea
              value={goal}
              onChange={(event) =>
                setGoal(
                  event.target.value,
                )
              }
              className="mt-1 min-h-[80px] w-full rounded-xl border border-border px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="text-[9px] font-semibold">
              Coach note
            </label>

            <textarea
              value={
                coachNote
              }
              onChange={(event) =>
                setCoachNote(
                  event.target.value,
                )
              }
              className="mt-1 min-h-[80px] w-full rounded-xl border border-border px-3 py-2 text-xs"
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-orange-500" />

              <h4 className="text-sm font-bold">
                Exercises
              </h4>
            </div>

            <button
              type="button"
              onClick={
                addExercise
              }
              className="flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-[9px] font-semibold"
            >
              <Plus className="h-3 w-3" />
              Add Exercise
            </button>
          </div>

          <div className="mt-2 space-y-2">
            {exercises.map(
              (
                exercise,
                index,
              ) => (
                <div
                  key={
                    index
                  }
                  className="grid grid-cols-[0.6fr_1fr_1.3fr_0.7fr_auto] gap-2 rounded-xl border border-border p-2"
                >
                  <input
                    value={
                      exercise.section ??
                      ""
                    }
                    onChange={(event) =>
                      updateExercise(
                        index,
                        "section",
                        event.target.value,
                      )
                    }
                    placeholder="Section"
                    className="rounded-lg border border-border px-2 py-2 text-[9px]"
                  />

                  <input
                    value={
                      exercise.name
                    }
                    onChange={(event) =>
                      updateExercise(
                        index,
                        "name",
                        event.target.value,
                      )
                    }
                    placeholder="Exercise"
                    className="rounded-lg border border-border px-2 py-2 text-[9px]"
                  />

                  <input
                    value={
                      exercise.details ??
                      ""
                    }
                    onChange={(event) =>
                      updateExercise(
                        index,
                        "details",
                        event.target.value,
                      )
                    }
                    placeholder="4 × 30 m"
                    className="rounded-lg border border-border px-2 py-2 text-[9px]"
                  />

                  <input
                    value={
                      exercise.rest ??
                      ""
                    }
                    onChange={(event) =>
                      updateExercise(
                        index,
                        "rest",
                        event.target.value,
                      )
                    }
                    placeholder="4 min"
                    className="rounded-lg border border-border px-2 py-2 text-[9px]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeExercise(
                        index,
                      )
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

        {error && (
          <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3">
            <p className="text-[9px] font-semibold text-red-700">
              {error}
            </p>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div>
            {plan && (
              <button
                type="button"
                disabled={
                  saving
                }
                onClick={
                  remove
                }
                className="text-[9px] font-semibold text-red-600"
              >
                Delete Plan
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                saving
              }
              className="rounded-xl border border-border px-3 py-2 text-[9px] font-semibold"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={saveDraft}
              disabled={
                saving ||
                !title.trim()
              }
              className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-[9px] font-semibold text-orange-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Draft"}
            </button>

            <button
              type="button"
              onClick={publishToAthlete}
              disabled={
                saving ||
                !title.trim()
              }
              className="rounded-xl bg-orange-500 px-4 py-2 text-[9px] font-semibold text-white disabled:opacity-50"
            >
              {saving
                ? "Publishing..."
                : plan?.is_published
                  ? "Save & Republish"
                  : "Publish to Athlete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}





