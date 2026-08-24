import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useServerFn } from "@tanstack/react-start";

import {
  createCoachCalendarEvent,
  deleteCoachCalendarEvent,
  fetchCoachCalendarEvents,
  updateCoachCalendarEvent,
  type CoachCalendarEvent,
  type CoachCalendarEventInput,
} from "@/lib/coach-calendar.functions";

import {
  fetchCoachTrainingSessions,
  type CoachTrainingSession,
} from "@/lib/coach-training.functions";

export function useCoachTrainingCalendar(
  startDate: string,
  endDate: string,
) {
  const queryClient = useQueryClient();

  const fetchEvents = useServerFn(
    fetchCoachCalendarEvents,
  );

  const fetchTraining = useServerFn(
    fetchCoachTrainingSessions,
  );

  const createEvent = useServerFn(
    createCoachCalendarEvent,
  );

  const updateEvent = useServerFn(
    updateCoachCalendarEvent,
  );

  const deleteEvent = useServerFn(
    deleteCoachCalendarEvent,
  );

  const query = useQuery({
    queryKey: [
      "coach-training-calendar",
      startDate,
      endDate,
    ],

    queryFn: async () => {
      const [trainingSessions, calendarEvents] =
        await Promise.all([
          fetchTraining({
            data: {
              startDate,
              endDate,
            },
          }),

          fetchEvents({
            data: {
              startDate,
              endDate,
            },
          }),
        ]);

      return {
        trainingSessions:
          trainingSessions as CoachTrainingSession[],

        calendarEvents:
          calendarEvents as CoachCalendarEvent[],
      };
    },
  });

  const refreshCalendar = async () => {
    await queryClient.invalidateQueries({
      queryKey: [
        "coach-training-calendar",
        startDate,
        endDate,
      ],
    });
  };

  const createMutation = useMutation({
    mutationFn: (
      input: CoachCalendarEventInput,
    ) =>
      createEvent({
        data: input,
      }),

    onSuccess: refreshCalendar,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      eventId,
      event,
    }: {
      eventId: string;
      event: CoachCalendarEventInput;
    }) =>
      updateEvent({
        data: {
          eventId,
          event,
        },
      }),

    onSuccess: refreshCalendar,
  });

  const deleteMutation = useMutation({
    mutationFn: (eventId: string) =>
      deleteEvent({
        data: {
          eventId,
        },
      }),

    onSuccess: refreshCalendar,
  });

  return {
    trainingSessions:
      query.data?.trainingSessions ?? [],

    calendarEvents:
      query.data?.calendarEvents ?? [],

    loading: query.isLoading,

    error:
      query.error instanceof Error
        ? query.error.message
        : null,

    createEvent:
      createMutation.mutateAsync,

    updateEvent:
      updateMutation.mutateAsync,

    deleteEvent:
      deleteMutation.mutateAsync,

    saving:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,

    mutationError:
      createMutation.error instanceof Error
        ? createMutation.error.message
        : updateMutation.error instanceof Error
          ? updateMutation.error.message
          : deleteMutation.error instanceof Error
            ? deleteMutation.error.message
            : null,
  };
}
