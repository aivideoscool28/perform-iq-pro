import {
  useQuery,
} from "@tanstack/react-query";

import {
  useServerFn,
} from "@tanstack/react-start";

import {
  fetchCoachTrainingSessions,
  type CoachTrainingSession,
} from "@/lib/coach-training.functions";

function todayString() {
  return new Date()
    .toISOString()
    .slice(0, 10);
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

function toDateString(
  date: Date,
) {
  return date
    .toISOString()
    .slice(0, 10);
}

export function useCoachUpcomingTraining() {
  const fetchSessions =
    useServerFn(
      fetchCoachTrainingSessions,
    );

  const today =
    todayString();

  const endDate =
    toDateString(
      addDays(
        new Date(),
        14,
      ),
    );

  const query =
    useQuery({
      queryKey: [
        "coach-upcoming-training",
        today,
        endDate,
      ],

      queryFn: () =>
        fetchSessions({
          data: {
            startDate:
              today,
            endDate,
          },
        }),
    });

  const sessions =
    (
      query.data ??
      []
    )
      .filter(
        (session) =>
          session.session_date >=
          today,
      )
      .sort(
        (a, b) => {
          const dateCompare =
            a.session_date.localeCompare(
              b.session_date,
            );

          if (
            dateCompare !==
            0
          ) {
            return dateCompare;
          }

          return (
            a.start_time ??
            ""
          ).localeCompare(
            b.start_time ??
            "",
          );
        },
      )
      .slice(
        0,
        5,
      ) as CoachTrainingSession[];

  return {
    sessions,

    loading:
      query.isLoading,

    error:
      query.error instanceof
      Error
        ? query.error.message
        : null,
  };
}
