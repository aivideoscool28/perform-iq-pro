import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useServerFn,
} from "@tanstack/react-start";

import {
  createCoachExercise,
  deleteCoachExercise,
  fetchCoachExerciseLibrary,
  updateCoachExercise,
  type CoachExerciseInput,
} from "@/lib/coach-exercise-library.functions";

export function useCoachExerciseLibrary() {
  const queryClient =
    useQueryClient();

  const fetchExercises =
    useServerFn(
      fetchCoachExerciseLibrary,
    );

  const createExerciseFn =
    useServerFn(
      createCoachExercise,
    );

  const updateExerciseFn =
    useServerFn(
      updateCoachExercise,
    );

  const deleteExerciseFn =
    useServerFn(
      deleteCoachExercise,
    );

  const query = useQuery({
    queryKey: [
      "coach-exercise-library",
    ],

    queryFn: () =>
      fetchExercises(),
  });

  const createMutation =
    useMutation({
      mutationFn: (
        input: CoachExerciseInput,
      ) =>
        createExerciseFn({
          data: input,
        }),

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "coach-exercise-library",
          ],
        });
      },
    });

  const updateMutation =
    useMutation({
      mutationFn: (input: {
        exerciseId: string;
        exercise: CoachExerciseInput;
      }) =>
        updateExerciseFn({
          data: input,
        }),

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "coach-exercise-library",
          ],
        });
      },
    });

  const deleteMutation =
    useMutation({
      mutationFn: (
        exerciseId: string,
      ) =>
        deleteExerciseFn({
          data: {
            exerciseId,
          },
        }),

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "coach-exercise-library",
          ],
        });
      },
    });

  const mutationError =
    createMutation.error ??
    updateMutation.error ??
    deleteMutation.error;

  return {
    exercises:
      query.data ?? [],

    loading:
      query.isLoading,

    error:
      query.error instanceof Error
        ? query.error.message
        : null,

    mutationError:
      mutationError instanceof Error
        ? mutationError.message
        : null,

    saving:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,

    createExercise:
      createMutation.mutateAsync,

    updateExercise:
      updateMutation.mutateAsync,

    deleteExercise:
      deleteMutation.mutateAsync,
  };
}
