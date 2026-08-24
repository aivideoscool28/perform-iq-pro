import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useServerFn } from "@tanstack/react-start";

import {
  createCoachIndividualPlan,
  deleteCoachIndividualPlan,
  fetchCoachIndividualPlans,
  publishCoachIndividualPlan,
  updateCoachIndividualPlan,
  type CoachIndividualPlan,
  type CoachIndividualPlanInput,
} from "@/lib/coach-individual-plans.functions";

export function useCoachIndividualPlans({
  athleteId,
  startDate,
  endDate,
}: {
  athleteId: string | null;
  startDate: string;
  endDate: string;
}) {
  const queryClient = useQueryClient();

  const fetchPlans = useServerFn(
    fetchCoachIndividualPlans,
  );

  const createPlanFn = useServerFn(
    createCoachIndividualPlan,
  );

  const updatePlanFn = useServerFn(
    updateCoachIndividualPlan,
  );

  const publishPlanFn = useServerFn(
    publishCoachIndividualPlan,
  );

  const deletePlanFn = useServerFn(
    deleteCoachIndividualPlan,
  );

  const queryKey = [
    "coach-individual-plans",
    athleteId,
    startDate,
    endDate,
  ];

  const query = useQuery({
    queryKey,

    enabled: !!athleteId,

    queryFn: async () => {
      if (!athleteId) {
        return [];
      }

      return fetchPlans({
        data: {
          athleteId,
          startDate,
          endDate,
        },
      });
    },
  });

  async function refresh() {
    await queryClient.invalidateQueries({
      queryKey: [
        "coach-individual-plans",
        athleteId,
      ],
    });
  }

  const createMutation = useMutation({
    mutationFn: (
      input: CoachIndividualPlanInput,
    ) =>
      createPlanFn({
        data: input,
      }),

    onSuccess: refresh,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      planId,
      plan,
    }: {
      planId: string;
      plan: CoachIndividualPlanInput;
    }) =>
      updatePlanFn({
        data: {
          planId,
          plan,
        },
      }),

    onSuccess: refresh,
  });

  const publishMutation = useMutation({
    mutationFn: ({
      planId,
      athleteId,
    }: {
      planId: string;
      athleteId: string;
    }) =>
      publishPlanFn({
        data: {
          planId,
          athleteId,
        },
      }),

    onSuccess: refresh,
  });

  const deleteMutation = useMutation({
    mutationFn: ({
      planId,
      athleteId,
    }: {
      planId: string;
      athleteId: string;
    }) =>
      deletePlanFn({
        data: {
          planId,
          athleteId,
        },
      }),

    onSuccess: refresh,
  });

  return {
    plans:
      (query.data ?? []) as CoachIndividualPlan[],

    loading: query.isLoading,

    error:
      query.error instanceof Error
        ? query.error.message
        : null,

    createPlan:
      createMutation.mutateAsync,

    updatePlan:
      updateMutation.mutateAsync,

    publishPlan:
      publishMutation.mutateAsync,

    deletePlan:
      deleteMutation.mutateAsync,

    saving:
      createMutation.isPending ||
      updateMutation.isPending ||
      publishMutation.isPending ||
      deleteMutation.isPending,

    mutationError:
      createMutation.error instanceof Error
        ? createMutation.error.message
        : updateMutation.error instanceof Error
          ? updateMutation.error.message
          : publishMutation.error instanceof Error
            ? publishMutation.error.message
            : deleteMutation.error instanceof Error
              ? deleteMutation.error.message
              : null,
  };
}
