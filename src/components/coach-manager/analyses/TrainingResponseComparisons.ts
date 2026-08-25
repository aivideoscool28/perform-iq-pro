import type {
  CoachCheckin,
} from "./check-in/CheckinAnalysisData";

import {
  calculateTrainingTypeResponses,
  type TrainingTypeResponse,
} from "./TrainingResponseCalculations";

export type TrainingTypeComparison = {
  label: string;

  current:
    TrainingTypeResponse;

  previous:
    TrainingTypeResponse | null;

  changes: {
    goalAchievement:
      number | null;

    averageRpe:
      number | null;

    stableOrImproved:
      number | null;

    declined:
      number | null;
  };

  comparisonLabel:
    string;

  comparisonTone:
    | "positive"
    | "negative"
    | "neutral"
    | "insufficient";
};

function difference(
  current: number | null,
  previous: number | null,
  decimals = 0,
) {
  if (
    current === null ||
    previous === null
  ) {
    return null;
  }

  const factor =
    10 ** decimals;

  return (
    Math.round(
      (
        current -
        previous
      ) *
        factor,
    ) / factor
  );
}

function buildComparisonLabel(
  current:
    TrainingTypeResponse,
  previous:
    TrainingTypeResponse | null,
) {
  if (!previous) {
    return {
      label:
        "No recent similar sessions for comparison",
      tone:
        "insufficient" as const,
    };
  }

  const goalChange =
    difference(
      current.goalAchievementPercentage,
      previous.goalAchievementPercentage,
    );

  const rpeChange =
    difference(
      current.averageRpe,
      previous.averageRpe,
      1,
    );

  const declineChange =
    difference(
      current.declinedPercentage,
      previous.declinedPercentage,
    );

  const negativeSignals =
    [
      goalChange !== null &&
        goalChange <= -10,

      rpeChange !== null &&
        rpeChange >= 0.7,

      declineChange !== null &&
        declineChange >= 10,
    ].filter(Boolean).length;

  const positiveSignals =
    [
      goalChange !== null &&
        goalChange >= 10,

      rpeChange !== null &&
        rpeChange <= -0.7,

      declineChange !== null &&
        declineChange <= -10,
    ].filter(Boolean).length;

  if (
    negativeSignals >= 2
  ) {
    return {
      label:
        "↓ different response vs recent similar sessions",
      tone:
        "negative" as const,
    };
  }

  if (
    positiveSignals >= 2
  ) {
    return {
      label:
        "↑ more positive response vs recent similar sessions",
      tone:
        "positive" as const,
    };
  }

  return {
    label:
      "→ broadly similar to recent similar sessions",
    tone:
      "neutral" as const,
  };
}

export function compareTrainingTypes(
  currentCheckins:
    CoachCheckin[],
  previousCheckins:
    CoachCheckin[],
): TrainingTypeComparison[] {
  const current =
    calculateTrainingTypeResponses(
      currentCheckins,
    );

  const previous =
    calculateTrainingTypeResponses(
      previousCheckins,
    );

  const previousByType =
    new Map(
      previous.map(
        (item) => [
          item.label,
          item,
        ],
      ),
    );

  return current
    .map(
      (currentItem) => {
        const previousItem =
          previousByType.get(
            currentItem.label,
          ) ?? null;

        const comparison =
          buildComparisonLabel(
            currentItem,
            previousItem,
          );

        return {
          label:
            currentItem.label,

          current:
            currentItem,

          previous:
            previousItem,

          changes: {
            goalAchievement:
              difference(
                currentItem.goalAchievementPercentage,
                previousItem?.goalAchievementPercentage ??
                  null,
              ),

            averageRpe:
              difference(
                currentItem.averageRpe,
                previousItem?.averageRpe ??
                  null,
                1,
              ),

            stableOrImproved:
              difference(
                currentItem.stableOrImprovedPercentage,
                previousItem?.stableOrImprovedPercentage ??
                  null,
              ),

            declined:
              difference(
                currentItem.declinedPercentage,
                previousItem?.declinedPercentage ??
                  null,
              ),
          },

          comparisonLabel:
            comparison.label,

          comparisonTone:
            comparison.tone,
        };
      },
    )
    .sort(
      (a, b) => {
        const priority = {
          negative: 0,
          positive: 1,
          neutral: 2,
          insufficient: 3,
        };

        return (
          priority[
            a.comparisonTone
          ] -
            priority[
              b.comparisonTone
            ] ||
          b.current.sessions -
            a.current.sessions
        );
      },
    );
}

export type TrainingResponsePeriodComparison = {
  current:
    ReturnType<
      typeof calculateTrainingTypeResponses
    >;

  previous:
    ReturnType<
      typeof calculateTrainingTypeResponses
    >;

  trainingTypes:
    TrainingTypeComparison[];
};

export function compareTrainingResponsePeriods(
  currentCheckins:
    CoachCheckin[],
  previousCheckins:
    CoachCheckin[],
): TrainingResponsePeriodComparison {
  return {
    current:
      calculateTrainingTypeResponses(
        currentCheckins,
      ),

    previous:
      calculateTrainingTypeResponses(
        previousCheckins,
      ),

    trainingTypes:
      compareTrainingTypes(
        currentCheckins,
        previousCheckins,
      ),
  };
}
