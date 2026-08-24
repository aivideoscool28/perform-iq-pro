import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useServerFn } from "@tanstack/react-start";

import {
  createCoachTrainingSession,
  fetchCoachTrainingSessions,
  updateCoachTrainingSession,
  type CoachTrainingSession,
  type CoachTrainingSessionInput,
} from "@/lib/coach-training.functions";

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function useCoachTodayTraining() {
  const queryClient = useQueryClient();

  const fetchSessions = useServerFn(
    fetchCoachTrainingSessions,
  );

  const createSession = useServerFn(
    createCoachTrainingSession,
  );

  const updateSession = useServerFn(
    updateCoachTrainingSession,
  );

  const today = todayString();

  const query = useQuery({
    queryKey: ["coach-training-today", today],

    queryFn: () =>
      fetchSessions({
        data: {
          startDate: today,
          endDate: today,
        },
      }),
  });

  const session: CoachTrainingSession | null =
    query.data?.[0] ?? null;

  const saveMutation = useMutation({
    mutationFn: async (
      input: CoachTrainingSessionInput,
    ) => {
      if (session) {
        return updateSession({
          data: {
            sessionId: session.id,
            session: input,
          },
        });
      }

      return createSession({
        data: input,
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["coach-training-today", today],
      });
    },
  });

  return {
    session,
    loading: query.isLoading,

    error:
      query.error instanceof Error
        ? query.error.message
        : null,

    saveError:
      saveMutation.error instanceof Error
        ? saveMutation.error.message
        : null,

    saveSession: saveMutation.mutateAsync,
    saving: saveMutation.isPending,
  };
}
