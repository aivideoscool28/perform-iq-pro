import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useServerFn } from "@tanstack/react-start";

import {
  fetchCoachCalendarEvents,
  createCoachCalendarEvent,
  updateCoachCalendarEvent,
  deleteCoachCalendarEvent,
  type CoachCalendarEvent,
  type CoachCalendarEventInput,
} from "@/lib/coach-calendar.functions";

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function useCoachCompetitions() {
  const queryClient = useQueryClient();

  const fetchEvents =
    useServerFn(fetchCoachCalendarEvents);

  const createEvent =
    useServerFn(createCoachCalendarEvent);

  const updateEvent =
    useServerFn(updateCoachCalendarEvent);

  const deleteEvent =
    useServerFn(deleteCoachCalendarEvent);

  const now = new Date();

  const start = new Date(now);
  start.setFullYear(
    start.getFullYear() - 1,
  );

  const end = new Date(now);
  end.setFullYear(
    end.getFullYear() + 2,
  );

  const startDate =
    dateOnly(start);

  const endDate =
    dateOnly(end);

  const query = useQuery({
    queryKey: [
      "coach-competitions",
      startDate,
      endDate,
    ],

    queryFn: async () => {
      const events =
        await fetchEvents({
          data: {
            startDate,
            endDate,
          },
        });

      return (
        events as CoachCalendarEvent[]
      )
        .filter(
          (event) =>
            event.event_type ===
            "competition",
        )
        .sort(
          (a, b) =>
            new Date(
              a.event_date,
            ).getTime() -
            new Date(
              b.event_date,
            ).getTime(),
        );
    },
  });

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [
          "coach-competitions",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "coach-training-calendar",
        ],
      }),
    ]);
  };

  const createMutation =
    useMutation({
      mutationFn: (
        input: CoachCalendarEventInput,
      ) =>
        createEvent({
          data: {
            ...input,
            eventType:
              "competition",
          },
        }),

      onSuccess: refresh,
    });

  const updateMutation =
    useMutation({
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
            event: {
              ...event,
              eventType:
                "competition",
            },
          },
        }),

      onSuccess: refresh,
    });

  const deleteMutation =
    useMutation({
      mutationFn: (
        eventId: string,
      ) =>
        deleteEvent({
          data: {
            eventId,
          },
        }),

      onSuccess: refresh,
    });

  return {
    competitions:
      query.data ?? [],

    loading:
      query.isLoading,

    error:
      query.error instanceof Error
        ? query.error.message
        : null,

    createCompetition:
      createMutation.mutateAsync,

    updateCompetition:
      updateMutation.mutateAsync,

    deleteCompetition:
      deleteMutation.mutateAsync,

    saving:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}