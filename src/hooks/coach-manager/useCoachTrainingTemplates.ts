import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useServerFn,
} from "@tanstack/react-start";

import {
  createCoachTrainingTemplate,
  fetchCoachTrainingTemplates,
  type CoachTrainingTemplateInput,
} from "@/lib/coach-training-templates.functions";

export function useCoachTrainingTemplates() {
  const queryClient =
    useQueryClient();

  const fetchTemplates =
    useServerFn(
      fetchCoachTrainingTemplates,
    );

  const createTemplateFn =
    useServerFn(
      createCoachTrainingTemplate,
    );

  const query =
    useQuery({
      queryKey: [
        "coach-training-templates",
      ],

      queryFn: () =>
        fetchTemplates(),
    });

  const createMutation =
    useMutation({
      mutationFn: (
        input:
          CoachTrainingTemplateInput,
      ) =>
        createTemplateFn({
          data: input,
        }),

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "coach-training-templates",
          ],
        });
      },
    });

  return {
    templates:
      query.data ?? [],

    loading:
      query.isLoading,

    error:
      query.error instanceof Error
        ? query.error.message
        : null,

    createTemplate:
      createMutation.mutateAsync,

    templateSaving:
      createMutation.isPending,

    templateError:
      createMutation.error instanceof Error
        ? createMutation.error.message
        : null,
  };
}
