import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import type { CoachAthlete } from "@/hooks/useCoachAthletes";
import { useCoachRegeneration } from "@/hooks/coach-manager/useCoachRegeneration";
import { useCoachRegenerationTraining } from "@/hooks/coach-manager/useCoachRegenerationTraining";
import {
  BatteryCharging,
  ChevronRight,
  CircleCheckBig,
  MoonStar,
  Sparkles,
  ThermometerSun,
  Users,
} from "lucide-react";

const createTopMetrics = (
  sleepAverage: number | null,
  sorenessAverage: number | null,
  energyAverage: number | null,
  notableChangesCount: number,
) => [
  {
    label: "Sleep Quality",
    value: sleepAverage?.toFixed(1) ?? "—",
    suffix: "/5",
    detail: "Group average today",
    icon: MoonStar,
    style: "bg-violet-50 text-violet-600",
  },
  {
    label: "Muscle Soreness",
    value: sorenessAverage?.toFixed(1) ?? "—",
    suffix: "/5",
    detail: "Group average today",
    icon: ThermometerSun,
    style: "bg-orange-50 text-orange-600",
  },
  {
    label: "Energy Level",
    value: energyAverage?.toFixed(1) ?? "—",
    suffix: "/5",
    detail: "Group average today",
    icon: BatteryCharging,
    style: "bg-green-50 text-green-600",
  },
  {
    label: "Notable Changes",
    value: notableChangesCount.toString(),
    detail: "Compared with personal recent normal",
    icon: Users,
    style: "bg-blue-50 text-blue-600",
  },
];

type RegenerationAnalysisProps = {
  athletes: CoachAthlete[];
};
export function RegenerationAnalysis({
  athletes,
}: RegenerationAnalysisProps) {
  const navigate = useNavigate();
  const {
    regeneration,
    loading: regenerationLoading,
    error: regenerationError,
  } = useCoachRegeneration(athletes);

  const {
    workouts: regenerationTrainingWorkouts,
  } = useCoachRegenerationTraining();

  const todaysCheckins = regeneration
    .map((item) => item.today)
    .filter((checkin) => checkin !== null);

  function average(values: number[]) {
    if (values.length === 0) return null;

    return (
      values.reduce((sum, value) => sum + value, 0) /
      values.length
    );
  }

  const sleepAverage = average(
    todaysCheckins.map((checkin) => checkin.sleep_quality),
  );

  const sorenessAverage = average(
    todaysCheckins.map((checkin) => checkin.muscle_soreness),
  );

  const energyAverage = average(
    todaysCheckins.map((checkin) => checkin.energy_level),
  );

  /*
  ---------------------------------------------------------
  PERSONAL REGENERATION BASELINES
  ---------------------------------------------------------

  Compare today's regeneration values with each athlete's
  own recent history.

  Today's check-in is excluded from the baseline.
  ---------------------------------------------------------
  */

  const athleteBaselines = regeneration.map((item) => {
    const previousCheckins = item.checkins.filter(
      (checkin) =>
        checkin.checkin_date !== item.today?.checkin_date,
    );

    const baselineSleep = average(
      previousCheckins.map(
        (checkin) => checkin.sleep_quality,
      ),
    );

    const baselineSoreness = average(
      previousCheckins.map(
        (checkin) => checkin.muscle_soreness,
      ),
    );

    const baselineEnergy = average(
      previousCheckins.map(
        (checkin) => checkin.energy_level,
      ),
    );

    return {
      athlete: item.athlete,
      today: item.today,

      baseline: {
        sleep: baselineSleep,
        soreness: baselineSoreness,
        energy: baselineEnergy,
      },

      change: {
        sleep:
          item.today && baselineSleep !== null
            ? item.today.sleep_quality - baselineSleep
            : null,

        soreness:
          item.today && baselineSoreness !== null
            ? item.today.muscle_soreness - baselineSoreness
            : null,

        energy:
          item.today && baselineEnergy !== null
            ? item.today.energy_level - baselineEnergy
            : null,
      },
    };
  });
  const notableThreshold = 1;

  const notableAthletes = athleteBaselines.filter((item) => {
    if (!item.today) return false;

    const sleepChanged =
      item.change.sleep !== null &&
      Math.abs(item.change.sleep) >= notableThreshold;

    const sorenessChanged =
      item.change.soreness !== null &&
      Math.abs(item.change.soreness) >= notableThreshold;

    const energyChanged =
      item.change.energy !== null &&
      Math.abs(item.change.energy) >= notableThreshold;

    return sleepChanged || sorenessChanged || energyChanged;
  });

  const notableChangesCount = notableAthletes.length;

  const topMetrics = createTopMetrics(
    sleepAverage,
    sorenessAverage,
    energyAverage,
    notableChangesCount,
  );
  const validBaselines = athleteBaselines.filter(
    (item) => item.today !== null,
  );

  const baselineSleepAverage = average(
    validBaselines
      .map((item) => item.baseline.sleep)
      .filter((value): value is number => value !== null),
  );

  const baselineSorenessAverage = average(
    validBaselines
      .map((item) => item.baseline.soreness)
      .filter((value): value is number => value !== null),
  );

  const baselineEnergyAverage = average(
    validBaselines
      .map((item) => item.baseline.energy)
      .filter((value): value is number => value !== null),
  );

  function comparisonResult(
    today: number | null,
    baseline: number | null,
  ) {
    if (today === null || baseline === null) {
      return "Not enough data";
    }

    const difference = Math.abs(today - baseline);

    if (difference >= notableThreshold) {
      return "Meaningfully different";
    }

    return "Mostly near normal";
  }

  const comparisonMetrics = [
    {
      label: "Sleep",
      today: sleepAverage?.toFixed(1) ?? "—",
      normal:
        baselineSleepAverage !== null
          ? `Recent normal ${baselineSleepAverage.toFixed(1)}`
          : "No recent baseline",
      result: comparisonResult(
        sleepAverage,
        baselineSleepAverage,
      ),
      icon: MoonStar,
      style: "bg-violet-50 text-violet-600",
    },
    {
      label: "Soreness",
      today: sorenessAverage?.toFixed(1) ?? "—",
      normal:
        baselineSorenessAverage !== null
          ? `Recent normal ${baselineSorenessAverage.toFixed(1)}`
          : "No recent baseline",
      result: comparisonResult(
        sorenessAverage,
        baselineSorenessAverage,
      ),
      icon: ThermometerSun,
      style: "bg-orange-50 text-orange-600",
    },
    {
      label: "Energy",
      today: energyAverage?.toFixed(1) ?? "—",
      normal:
        baselineEnergyAverage !== null
          ? `Recent normal ${baselineEnergyAverage.toFixed(1)}`
          : "No recent baseline",
      result: comparisonResult(
        energyAverage,
        baselineEnergyAverage,
      ),
      icon: BatteryCharging,
      style: "bg-green-50 text-green-600",
    },
  ];
  const athletesToCheck = notableAthletes.map((item) => {
    const signals: string[] = [];

    if (
      item.change.sleep !== null &&
      Math.abs(item.change.sleep) >= notableThreshold
    ) {
      signals.push("sleep");
    }

    if (
      item.change.soreness !== null &&
      Math.abs(item.change.soreness) >= notableThreshold
    ) {
      signals.push("soreness");
    }

    if (
      item.change.energy !== null &&
      Math.abs(item.change.energy) >= notableThreshold
    ) {
      signals.push("energy");
    }

    const changes = [
      item.change.sleep !== null &&
      Math.abs(item.change.sleep) >= notableThreshold
        ? `Sleep ${item.change.sleep > 0 ? "+" : ""}${item.change.sleep.toFixed(1)}`
        : null,

      item.change.soreness !== null &&
      Math.abs(item.change.soreness) >= notableThreshold
        ? `Soreness ${item.change.soreness > 0 ? "+" : ""}${item.change.soreness.toFixed(1)}`
        : null,

      item.change.energy !== null &&
      Math.abs(item.change.energy) >= notableThreshold
        ? `Energy ${item.change.energy > 0 ? "+" : ""}${item.change.energy.toFixed(1)}`
        : null,
    ].filter((change): change is string => change !== null);

    return {
      athleteId: item.athlete.id,

      initials: item.athlete.display_name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join(""),

      name: item.athlete.display_name,

      reason:
        signals.length > 1
          ? `${signals.length} regeneration signals changed`
          : `${signals[0] ?? "Regeneration"} changed`,

      detail: changes.join(" · "),

      context: "Compared with personal recent normal",

      status:
        signals.length > 1
          ? "bg-red-500"
          : "bg-orange-500",

      signals,
    };
  });
  /*
  ---------------------------------------------------------
  REGENERATION SIGNAL COMBINATIONS
  ---------------------------------------------------------

  Classify today's regeneration changes using each athlete's
  own recent baseline.

  V1 rules:
  - Low sleep = sleep is >= 1 point below baseline
  - High soreness = soreness score is >= 1 point below baseline
  - Low energy = energy is >= 1 point below baseline

  Counts are calculated dynamically for all linked athletes.
  ---------------------------------------------------------
  */

  const regenerationCombinationCounts = athleteBaselines.reduce(
    (counts, item) => {
      if (!item.today) {
        return counts;
      }

      const lowSleep =
        item.change.sleep !== null &&
        item.change.sleep <= -notableThreshold;

      const highSoreness =
        item.change.soreness !== null &&
        item.change.soreness <= -notableThreshold;

      const lowEnergy =
        item.change.energy !== null &&
        item.change.energy <= -notableThreshold;

      if (lowSleep && !highSoreness && !lowEnergy) {
        counts.lowSleepOnly += 1;
      }

      if (highSoreness && !lowSleep && !lowEnergy) {
        counts.sorenessOnly += 1;
      }

      if (lowEnergy && highSoreness) {
        counts.lowEnergyAndSoreness += 1;
      }

      return counts;
    },
    {
      lowSleepOnly: 0,
      sorenessOnly: 0,
      lowEnergyAndSoreness: 0,
    },
  );

  const combinations = [
    {
      label: "Low sleep only",
      detail: "Other regeneration signals remain near normal",
      athletes: regenerationCombinationCounts.lowSleepOnly,
      style: "bg-violet-50 text-violet-700",
    },
    {
      label: "Soreness elevated only",
      detail: "Energy and sleep remain near normal",
      athletes: regenerationCombinationCounts.sorenessOnly,
      style: "bg-orange-50 text-orange-700",
    },
    {
      label: "Low energy + soreness",
      detail: "Two signals changed together",
      athletes:
        regenerationCombinationCounts.lowEnergyAndSoreness,
      style: "bg-red-50 text-red-700",
    },
  ];
  /*
  ---------------------------------------------------------
  RECURRING REGENERATION SIGNALS
  ---------------------------------------------------------

  Count athletes who repeatedly report regeneration values
  meaningfully different from their own recent baseline.

  V1 rule:
  - Sleep: 3+ responses at least 1 point below baseline
  - Soreness: 3+ responses at least 1 point below baseline
  - Energy: 3+ responses at least 1 point below baseline
  ---------------------------------------------------------
  */

  const recurringSleepCount = regeneration.filter((item) => {
    const baselineItem = athleteBaselines.find(
      (baseline) => baseline.athlete.id === item.athlete.id,
    );

    const baseline = baselineItem?.baseline.sleep;

    if (baseline === null || baseline === undefined) {
      return false;
    }

    const repeatedLowSleep = item.checkins.filter(
      (checkin) =>
        checkin.sleep_quality <= baseline - notableThreshold,
    );

    return repeatedLowSleep.length >= 3;
  }).length;

  const recurringSorenessCount = regeneration.filter((item) => {
    const baselineItem = athleteBaselines.find(
      (baseline) => baseline.athlete.id === item.athlete.id,
    );

    const baseline = baselineItem?.baseline.soreness;

    if (baseline === null || baseline === undefined) {
      return false;
    }

    const repeatedHighSoreness = item.checkins.filter(
      (checkin) =>
        checkin.muscle_soreness <= baseline - notableThreshold,
    );

    return repeatedHighSoreness.length >= 3;
  }).length;

  const recurringEnergyCount = regeneration.filter((item) => {
    const baselineItem = athleteBaselines.find(
      (baseline) => baseline.athlete.id === item.athlete.id,
    );

    const baseline = baselineItem?.baseline.energy;

    if (baseline === null || baseline === undefined) {
      return false;
    }

    const repeatedLowEnergy = item.checkins.filter(
      (checkin) =>
        checkin.energy_level <= baseline - notableThreshold,
    );

    return repeatedLowEnergy.length >= 3;
  }).length;

  const recurringSignals = [
    {
      label: "Poor sleep repeatedly",
      detail: "3+ below-normal sleep responses",
      athletes: recurringSleepCount,
      icon: MoonStar,
      style: "bg-violet-50 text-violet-600",
    },
    {
      label: "Soreness staying elevated",
      detail: "3+ worse-than-normal soreness responses",
      athletes: recurringSorenessCount,
      icon: ThermometerSun,
      style: "bg-orange-50 text-orange-600",
    },
    {
      label: "Energy declining",
      detail: "3+ below-normal energy responses",
      athletes: recurringEnergyCount,
      icon: BatteryCharging,
      style: "bg-green-50 text-green-600",
    },
  ];
  /*
  ---------------------------------------------------------
  TRAINING ↔ REGENERATION ASSOCIATIONS
  ---------------------------------------------------------

  Regeneration is reported before today's training.

  Therefore, for each regeneration check-in with a
  meaningfully lower signal, we look at the athlete's
  completed or changed training from the PREVIOUS day.

  This is an association only. It does not establish that
  the training caused the regeneration response.
  ---------------------------------------------------------
  */

  function previousDate(date: string) {
    const value = new Date(`${date}T00:00:00Z`);

    value.setUTCDate(
      value.getUTCDate() - 1,
    );

    return value
      .toISOString()
      .slice(0, 10);
  }

  const trainingAssociations = regeneration.flatMap(
    (item) => {
      const baselineItem = athleteBaselines.find(
        (baseline) =>
          baseline.athlete.id === item.athlete.id,
      );

      if (!baselineItem) {
        return [];
      }

      return item.checkins.flatMap((checkin) => {
        const lowSleep =
          baselineItem.baseline.sleep !== null &&
          checkin.sleep_quality <=
            baselineItem.baseline.sleep -
              notableThreshold;

        const lowFreshness =
          baselineItem.baseline.soreness !== null &&
          checkin.muscle_soreness <=
            baselineItem.baseline.soreness -
              notableThreshold;

        const lowEnergy =
          baselineItem.baseline.energy !== null &&
          checkin.energy_level <=
            baselineItem.baseline.energy -
              notableThreshold;

        if (
          !lowSleep &&
          !lowFreshness &&
          !lowEnergy
        ) {
          return [];
        }

        const trainingDate = previousDate(
          checkin.checkin_date,
        );

        const matchingWorkouts =
          regenerationTrainingWorkouts.filter(
            (workout) =>
              workout.athlete_id ===
                item.athlete.id &&
              workout.workout_date ===
                trainingDate,
          );

        return matchingWorkouts.map(
          (workout) => ({
            athleteId:
              item.athlete.id,

            checkinDate:
              checkin.checkin_date,

            trainingDate,

            label:
              workout.title?.trim() ||
              workout.discipline?.trim() ||
              "Training",
          }),
        );
      });
    },
  );

  const groupedTrainingAssociations =
    new Map<
      string,
      {
        athleteIds: Set<string>;
        occurrences: number;
      }
    >();

  trainingAssociations.forEach((association) => {
    const existing =
      groupedTrainingAssociations.get(
        association.label,
      ) ?? {
        athleteIds: new Set<string>(),
        occurrences: 0,
      };

    existing.athleteIds.add(
      association.athleteId,
    );

    existing.occurrences += 1;

    groupedTrainingAssociations.set(
      association.label,
      existing,
    );
  });

  const associationStyles = [
    "bg-orange-500",
    "bg-violet-500",
    "bg-blue-500",
    "bg-green-500",
  ];

  const groupedAssociationRows =
    Array.from(
      groupedTrainingAssociations.entries(),
    )
      .map(([label, values]) => ({
        label,
        athletes:
          values.athleteIds.size,
        occurrences:
          values.occurrences,
      }))
      .sort(
        (a, b) =>
          b.occurrences -
          a.occurrences,
      )
      .slice(0, 4);

  const maxAssociationOccurrences =
    Math.max(
      ...groupedAssociationRows.map(
        (item) => item.occurrences,
      ),
      1,
    );

  const trainingTypes =
    groupedAssociationRows.map(
      (item, index) => ({
        ...item,

        width:
          (item.occurrences /
            maxAssociationOccurrences) *
          100,

        style:
          associationStyles[
            index %
              associationStyles.length
          ],
      }),
    );

  const strongestTrainingAssociation =
    trainingTypes[0] ?? null;

  const regenerationInterpretation =
    notableChangesCount === 0
      ? "No athlete with enough data differs meaningfully from their own recent regeneration pattern today."
      : strongestTrainingAssociation
        ? `${notableChangesCount} ${
            notableChangesCount === 1
              ? "athlete differs"
              : "athletes differ"
          } meaningfully from their own recent pattern today. Across recent check-ins, lower regeneration signals appeared ${strongestTrainingAssociation.occurrences} ${
            strongestTrainingAssociation.occurrences === 1
              ? "time"
              : "times"
          } following ${strongestTrainingAssociation.label}. This is an association for the coach to review, not evidence that the training caused the change.`
        : `${notableChangesCount} ${
            notableChangesCount === 1
              ? "athlete differs"
              : "athletes differ"
          } meaningfully from their own recent regeneration pattern today. No matching completed previous-day training was found for the recent lower regeneration signals.`;
  const [metric, setMetric] =
    useState<"sleep" | "soreness" | "energy">("sleep");

  const [mode, setMode] =
    useState<"average" | "unusual">("average");

  /*
  ---------------------------------------------------------
  REGENERATION GROUP TREND
  ---------------------------------------------------------

  Build one group-average data point for every date that
  contains regeneration check-ins.

  The graph can then switch between sleep, soreness and
  energy without another Supabase request.
  ---------------------------------------------------------
  */

  const checkinsByDate = new Map<
    string,
    {
      sleep: number[];
      soreness: number[];
      energy: number[];
    }
  >();

  regeneration.forEach((item) => {
    item.checkins.forEach((checkin) => {
      const existing = checkinsByDate.get(checkin.checkin_date) ?? {
        sleep: [],
        soreness: [],
        energy: [],
      };

      existing.sleep.push(checkin.sleep_quality);
      existing.soreness.push(checkin.muscle_soreness);
      existing.energy.push(checkin.energy_level);

      checkinsByDate.set(checkin.checkin_date, existing);
    });
  });

  const trendData = Array.from(checkinsByDate.entries())
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, values]) => ({
      date,
      sleep: average(values.sleep) ?? 0,
      soreness: average(values.soreness) ?? 0,
      energy: average(values.energy) ?? 0,
    }));

  const graphPoints = trendData.map((point, index) => {
    const x =
      trendData.length <= 1
        ? 250
        : (index / (trendData.length - 1)) * 500;

    const value = point[metric];

    const y = 105 - ((value - 1) / 4) * 100;

    return {
      x,
      y,
      value,
      date: point.date,
    };
  });

  const polylinePoints = graphPoints
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const graphDateLabels =
    graphPoints.length <= 5
      ? graphPoints
      : [
          graphPoints[0],
          graphPoints[Math.floor((graphPoints.length - 1) * 0.25)],
          graphPoints[Math.floor((graphPoints.length - 1) * 0.5)],
          graphPoints[Math.floor((graphPoints.length - 1) * 0.75)],
          graphPoints[graphPoints.length - 1],
        ];

  function formatTrendDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      },
    );
  }

  return (
    <div className="space-y-3">
      <section className="grid grid-cols-4 gap-2">
        {topMetrics.map(
          ({
            label,
            value,
            suffix,
            detail,
            icon: Icon,
            style,
          }) => (
            <article
              key={label}
              className="rounded-2xl border border-border bg-white px-3 py-2.5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${style}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-[8px] font-semibold text-muted-foreground">
                    {label}
                  </p>

                  <div className="mt-0.5 flex items-baseline gap-1">
                    <p className="text-xl font-bold">
                      {value}
                    </p>

                    {suffix && (
                      <span className="text-[9px] text-muted-foreground">
                        {suffix}
                      </span>
                    )}
                  </div>

                  <p className={`text-[7px] ${style.split(" ")[1]}`}>
                    {detail}
                  </p>
                </div>
              </div>
            </article>
          ),
        )}
      </section>

      <div className="grid grid-cols-[1.05fr_0.95fr] gap-3">
        <section className="rounded-2xl border border-violet-100 bg-white p-3 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-violet-600">
                Most Important
              </p>

              <h3 className="mt-1 text-sm font-bold">
                Today vs each athlete's recent normal
              </h3>

              <p className="mt-1 text-[8px] text-muted-foreground">
                Personal change matters more than a generic group threshold.
              </p>
            </div>

            <div className="grid h-9 w-9 place-items-center rounded-full bg-violet-50">
              <CircleCheckBig className="h-4 w-4 text-violet-600" />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {comparisonMetrics.map(
              ({
                label,
                today,
                normal,
                result,
                icon: Icon,
                style,
              }) => (
                <div
                  key={label}
                  className="rounded-xl border border-border/70 p-3"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`grid h-7 w-7 place-items-center rounded-full ${style}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    <p className="text-[9px] font-semibold">
                      {label}
                    </p>
                  </div>

                  <p className="mt-2 text-lg font-bold">
                    {today}
                    <span className="ml-1 text-[8px] font-normal text-muted-foreground">
                      /5
                    </span>
                  </p>

                  <p className="mt-1 text-[7px] text-muted-foreground">
                    {normal}
                  </p>

                  <p className={`mt-1 text-[7px] font-semibold ${style.split(" ")[1]}`}>
                    {result}
                  </p>
                </div>
              ),
            )}
          </div>

          <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50/40 px-3 py-2">
            <p className="text-[8px] font-semibold text-violet-700">
              {notableChangesCount} athletes differ meaningfully from their own recent pattern.
            </p>

            <p className="mt-0.5 text-[7px] text-muted-foreground">
              A low absolute score alone is not enough to classify an athlete
              as needing attention.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold">
                Athletes to check
              </h3>

              <p className="mt-1 text-[8px] text-muted-foreground">
                Repeated or combined changes worth inspecting.
              </p>
            </div>

            <span className="rounded-full bg-orange-50 px-2 py-1 text-[8px] font-bold text-orange-600">
              {notableChangesCount} athletes
            </span>
          </div>

          <div className="mt-3 divide-y divide-border/60">
            {athletesToCheck.map((athlete) => (
              <button
                key={athlete.name}
                type="button"
                onClick={() =>
                  navigate({
                    to: "/coach-manager/athletes/$athleteId",
                    params: {
                      athleteId: athlete.athleteId,
                    },
                    search: {
                      from: "athletes",
                    },
                  })
                }
                className="flex w-full items-center gap-2 py-2 text-left transition hover:bg-muted/20"
              >
                <div className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-50 text-[8px] font-bold text-orange-600">
                  {athlete.initials}

                  <span
                    className={`absolute right-0 top-0 h-2 w-2 rounded-full border border-white ${athlete.status}`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-semibold">
                    {athlete.name}
                  </p>

                  <p className="text-[8px] text-muted-foreground">
                    {athlete.reason}
                  </p>

                  <p className="text-[7px] text-muted-foreground">
                    {athlete.detail}
                  </p>

                  <p className="mt-0.5 text-[7px] font-medium text-green-700">
                    {athlete.context}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {athlete.signals.includes("sleep") && (
                    <div className="grid h-6 w-6 place-items-center rounded-full bg-violet-50">
                      <MoonStar className="h-3 w-3 text-violet-600" />
                    </div>
                  )}

                  {athlete.signals.includes("soreness") && (
                    <div className="grid h-6 w-6 place-items-center rounded-full bg-orange-50">
                      <ThermometerSun className="h-3 w-3 text-orange-600" />
                    </div>
                  )}

                  {athlete.signals.includes("energy") && (
                    <div className="grid h-6 w-6 place-items-center rounded-full bg-green-50">
                      <BatteryCharging className="h-3 w-3 text-green-600" />
                    </div>
                  )}
                </div>

                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </button>
            ))}
          </div>

          <button
            type="button"
            className="mt-2 text-[8px] font-semibold text-violet-600"
          >
            View all {notableChangesCount} athletes →
          </button>
        </section>
      </div>

      <div className="grid grid-cols-[1.15fr_0.85fr] gap-3">
        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold">
                Regeneration over time
              </h3>

              <p className="mt-1 text-[8px] text-muted-foreground">
                One trend view for the three athlete-reported signals.
              </p>
            </div>

            <div className="flex rounded-lg bg-muted/40 p-0.5">
              <button
                type="button"
                onClick={() => setMode("average")}
                className={[
                  "rounded-md px-2 py-1 text-[7px] font-semibold",
                  mode === "average"
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-muted-foreground",
                ].join(" ")}
              >
                Group Trend
              </button>

              <button
                type="button"
                onClick={() => setMode("unusual")}
                className={[
                  "rounded-md px-2 py-1 text-[7px] font-semibold",
                  mode === "unusual"
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-muted-foreground",
                ].join(" ")}
              >
                Individual Changes
              </button>
            </div>
          </div>

          <div className="mt-3 flex gap-1">
            {[
              ["sleep", "Sleep"],
              ["soreness", "Soreness"],
              ["energy", "Energy"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  setMetric(
                    id as "sleep" | "soreness" | "energy",
                  )
                }
                className={[
                  "rounded-lg border px-2.5 py-1 text-[7px] font-semibold",
                  metric === id
                    ? "border-violet-200 bg-violet-50 text-violet-700"
                    : "border-border text-muted-foreground",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === "average" ? (
            <>
              <div className="relative mt-3 h-36">
                <div className="absolute inset-x-0 top-0 bottom-5 flex flex-col justify-between">
                  {[5, 4, 3, 2, 1].map((value) => (
                    <div key={value} className="flex items-center gap-2">
                      <span className="w-5 text-[7px] text-muted-foreground">
                        {value}
                      </span>

                      <div className="h-px flex-1 bg-border/50" />
                    </div>
                  ))}
                </div>

                <svg
                  viewBox="0 0 500 120"
                  className="absolute left-6 top-1 h-[105px] w-[calc(100%-24px)]"
                  preserveAspectRatio="none"
                >
                  {graphPoints.length > 0 && (
                    <>
                      <polyline
                        points={polylinePoints}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={
                          metric === "soreness"
                            ? "text-orange-500"
                            : metric === "energy"
                              ? "text-green-600"
                              : "text-violet-600"
                        }
                      />

                      {graphPoints.map((point, index) => (
                        <circle
                          key={`${point.date}-${index}`}
                          cx={point.x}
                          cy={point.y}
                          r="2.3"
                          fill="white"
                          stroke="currentColor"
                          strokeWidth="2"
                          className={
                            metric === "soreness"
                              ? "text-orange-500"
                              : metric === "energy"
                                ? "text-green-600"
                                : "text-violet-600"
                          }
                        />
                      ))}
                    </>
                  )}
                </svg>

                <div className="absolute bottom-0 left-6 right-0 flex justify-between text-[7px] text-muted-foreground">
                  {graphDateLabels.map((point, index) => (
                    <span key={`${point.date}-${index}`}>
                      {formatTrendDate(point.date)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-2 rounded-lg bg-violet-50/60 px-2.5 py-2 text-[8px] text-violet-700">
                Group trend is relatively stable. Individual changes are more
                important than this average alone.
              </div>
            </>
          ) : (
            <div className="mt-3 space-y-2">
              {athletesToCheck.slice(0, 3).map((athlete) => (
                <button
                  key={athlete.name}
                  type="button"
                  onClick={() =>
                    navigate({
                      to: "/coach-manager/athletes/$athleteId",
                      params: {
                        athleteId: athlete.athleteId,
                      },
                      search: {
                        from: "athletes",
                      },
                    })
                  }
                  className="flex w-full items-center justify-between rounded-xl border border-border px-3 py-2 text-left"
                >
                  <div>
                    <p className="text-[9px] font-semibold">
                      {athlete.name}
                    </p>

                    <p className="text-[8px] text-muted-foreground">
                      {athlete.reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-orange-50 px-2 py-1 text-[7px] font-semibold text-orange-700">
                      {athlete.detail}
                    </span>

                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                </button>
              ))}

              <p className="text-[7px] text-muted-foreground">
                Layer 2 will calculate these against each athlete's valid
                personal baseline rather than a universal threshold.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">
            Recurring signals
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Repetition matters more than one unusual day.
          </p>

          <div className="mt-3 space-y-2">
            {recurringSignals.map(
              ({
                label,
                detail,
                athletes,
                icon: Icon,
                style,
              }) => (
                <div
                  key={label}
                  className="flex w-full items-center gap-2 rounded-xl border border-border/70 p-2.5 text-left"
                >
                  <div
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${style}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] font-semibold">
                      {label}
                    </p>

                    <p className="text-[7px] text-muted-foreground">
                      {detail}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {athletes}
                    </p>

                    <p className="text-[6px] text-muted-foreground">
                      athletes
                    </p>
                  </div>

                </div>
              ),
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-[0.9fr_1.1fr] gap-3">
        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">
            Signals appearing together
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Useful context — not a diagnosis or readiness score.
          </p>

          <div className="mt-3 space-y-2">
            {combinations.map((item) => (
              <div
                key={item.label}
                className="flex w-full items-center justify-between rounded-xl border border-border/70 px-3 py-2 text-left"
              >
                <div>
                  <p className="text-[8px] font-semibold">
                    {item.label}
                  </p>

                  <p className="mt-0.5 text-[7px] text-muted-foreground">
                    {item.detail}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-[7px] font-semibold ${item.style}`}
                  >
                    {item.athletes} athletes
                  </span>

                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">
            Where were low regeneration signals reported?
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Shown alongside recent training types — association only.
          </p>

          <div className="mt-3 space-y-2.5">
            {trainingTypes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-3 py-4 text-center">
                <p className="text-[8px] font-semibold">
                  No matching training associations yet
                </p>

                <p className="mt-1 text-[7px] text-muted-foreground">
                  Associations appear when athletes have both completed training
                  and following regeneration history.
                </p>
              </div>
            ) : (
              trainingTypes.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[110px_1fr_90px] items-center gap-3"
                >
                  <span className="truncate text-[8px] font-medium">
                    {item.label}
                  </span>

                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      style={{
                        width: `${item.width}%`,
                      }}
                      className={`h-full rounded-full ${item.style}`}
                    />
                  </div>

                  <div className="text-right">
                    <p className="text-[7px] font-semibold">
                      {item.occurrences}×
                    </p>

                    <p className="text-[6px] text-muted-foreground">
                      {item.athletes}{" "}
                      {item.athletes === 1
                        ? "athlete"
                        : "athletes"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2">
            <p className="text-[7px] leading-relaxed text-muted-foreground">
              These lower regeneration responses were reported the morning after these completed training sessions.
              Athletic IQ should not claim the training type caused the
              regeneration change.
            </p>
          </div>
        </section>
      </div>

      <section className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50/70 via-white to-green-50/30 p-3 shadow-sm">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-100">
          <Sparkles className="h-4 w-4 text-violet-600" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-violet-700">
            Athletic IQ Interpretation
          </p>

          <p className="mt-1 text-[8px] leading-relaxed text-muted-foreground">
            {regenerationInterpretation}
          </p>
        </div>

        <button
          type="button"
          className="rounded-xl border border-violet-200 bg-white px-3 py-2 text-[8px] font-semibold text-violet-700"
        >
          View evidence →
        </button>
      </section>
    </div>
  );
}






















