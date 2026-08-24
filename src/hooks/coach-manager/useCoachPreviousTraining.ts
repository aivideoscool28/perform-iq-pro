import {
  useQuery,
} from "@tanstack/react-query";

import {
  useServerFn,
} from "@tanstack/react-start";

import {
  fetchCoachTrainingSessions,
} from "@/lib/coach-training.functions";

function toDateString(date: Date) {
  return date
    .toISOString()
    .slice(0, 10);
}

function subtractDays(
  date: Date,
  amount: number,
) {
  const copy =
    new Date(date);

  copy.setDate(
    copy.getDate() -
      amount,
  );

  return copy;
}

export function useCoachPreviousTraining() {
  const fetchSessions =
    useServerFn(
      fetchCoachTrainingSessions,
    );

  const today =
    new Date();

  const startDate =
    toDateString(
      subtractDays(
        today,
        365,
      ),
    );

  const endDate =
    toDateString(today);

  const query =
    useQuery({
      queryKey: [
        "coach-previous-training",
        startDate,
        endDate,
      ],

      queryFn: () =>
        fetchSessions({
          data: {
            startDate,
            endDate,
          },
        }),
    });

  const sessions =
    [
      ...(query.data ?? []),
    ].sort(
      (a, b) =>
        b.session_date.localeCompare(
          a.session_date,
        ),
    );

  return {
    sessions,

    loading:
      query.isLoading,

    error:
      query.error instanceof Error
        ? query.error.message
        : null,
  };
}
