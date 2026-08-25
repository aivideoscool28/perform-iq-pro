import {
  useQuery,
} from "@tanstack/react-query";

import {
  useServerFn,
} from "@tanstack/react-start";

import { TodaysTrainingCard } from "@/components/coach-manager/dashboard/TodaysTrainingCard";
import { GroupTodayCard } from "@/components/coach-manager/dashboard/GroupTodayCard";
import { LatestDevelopments } from "@/components/coach-manager/dashboard/LatestDevelopments";
import { AthleteQuestions } from "@/components/coach-manager/dashboard/AthleteQuestions";
import { WeeklyTrainingOverview } from "@/components/coach-manager/dashboard/WeeklyTrainingOverview";
import { CoachInsightCard } from "@/components/coach-manager/dashboard/CoachInsightCard";

import {
  useCoachTodayTraining,
} from "@/hooks/coach-manager/useCoachTodayTraining";

import {
  fetchCoachTrainingSessions,
} from "@/lib/coach-training.functions";

function dateString(
  date: Date,
) {
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

function todayString() {
  return dateString(
    new Date(),
  );
}

function endOfCurrentWeek() {
  const today =
    new Date();

  const weekday =
    today.getDay();

  const daysUntilSunday =
    weekday === 0
      ? 0
      : 7 - weekday;

  const sunday =
    new Date(today);

  sunday.setDate(
    today.getDate() +
      daysUntilSunday,
  );

  return dateString(
    sunday,
  );
}

export function CoachDashboard() {
  const {
    session,
    loading: todayTrainingLoading,
  } = useCoachTodayTraining();

  const fetchSessions =
    useServerFn(
      fetchCoachTrainingSessions,
    );

  const today =
    todayString();

  const weekEnd =
    endOfCurrentWeek();

  const {
    data: weekSessions = [],
    isLoading: weekLoading,
  } = useQuery({
    queryKey: [
      "coach-dashboard-training-week",
      today,
      weekEnd,
    ],

    queryFn: () =>
      fetchSessions({
        data: {
          startDate: today,
          endDate: weekEnd,
        },
      }),
  });

  return (
    <div className="space-y-3">
      <section className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600">
            Today
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight">
            Your coaching overview
          </h2>
        </div>
      </section>

      <TodaysTrainingCard
        session={session}
        loading={
          todayTrainingLoading
        }
      />

      <div className="grid grid-cols-[1fr_1fr_0.72fr] gap-3">
        <div className="space-y-3">
          <GroupTodayCard />
          <AthleteQuestions />
        </div>

        <div className="space-y-3">
          <LatestDevelopments />
          <CoachInsightCard />
        </div>

        <WeeklyTrainingOverview
          sessions={
            weekSessions
          }
          loading={
            weekLoading
          }
        />
      </div>
    </div>
  );
}
