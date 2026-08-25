import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { fetchCoachAthletePlannedWorkouts } from "@/lib/coach-training.functions";

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function subtractDays(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() - amount);
  return copy;
}

export function useCoachRegenerationTraining() {
  const fetchWorkouts = useServerFn(
    fetchCoachAthletePlannedWorkouts,
  );

  const today = new Date();

  const startDate = toDateString(
    subtractDays(today, 30),
  );

  const endDate = toDateString(today);

  const query = useQuery({
    queryKey: [
      "coach-regeneration-training",
      startDate,
      endDate,
    ],

    queryFn: () =>
      fetchWorkouts({
        data: {
          startDate,
          endDate,
        },
      }),
  });

  return {
    workouts: query.data ?? [],
    loading: query.isLoading,
    error:
      query.error instanceof Error
        ? query.error.message
        : null,
  };
}
