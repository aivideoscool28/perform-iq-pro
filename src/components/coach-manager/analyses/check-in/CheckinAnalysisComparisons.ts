import type {
  CoachCheckin,
} from "./CheckinAnalysisData";

import {
  calculateCheckinSummary,
  type CheckinSummary,
} from "./CheckinAnalysisCalculations";

export type CheckinPeriodComparison = {
  current:
    CheckinSummary;

  previous:
    CheckinSummary;

  changes: {
    averageRpe:
      number | null;

    goalAchieved:
      number | null;

    stableOrImproved:
      number | null;

    sessionsToReview:
      number;
  };
};

function startOfToday() {
  const date =
    new Date();

  date.setHours(
    0,
    0,
    0,
    0,
  );

  return date;
}

function subtractDays(
  date: Date,
  days: number,
) {
  const copy =
    new Date(date);

  copy.setDate(
    copy.getDate() -
      days,
  );

  return copy;
}

function dateValue(
  value: string,
) {
  return new Date(
    `${value}T00:00:00`,
  );
}

function difference(
  current:
    number | null,
  previous:
    number | null,
) {
  if (
    current === null ||
    previous === null
  ) {
    return null;
  }

  return Math.round(
    (current - previous) *
      10,
  ) / 10;
}

/*
=============================================================================
DEFAULT ANALYSIS WINDOW
=============================================================================

Current:
latest 28 days

Previous:
the 28 days directly before that

Example:

Current   = days 0–27
Previous  = days 28–55

This gives the UI its:

"Current 4 weeks"
vs
"Previous 4 weeks"

comparison.
=============================================================================
*/

export function compareCheckinPeriods(
  checkins:
    CoachCheckin[],
): CheckinPeriodComparison {
  const today =
    startOfToday();

  const currentStart =
    subtractDays(
      today,
      27,
    );

  const previousStart =
    subtractDays(
      today,
      55,
    );

  const previousEnd =
    subtractDays(
      today,
      28,
    );

  const currentRows =
    checkins.filter(
      (checkin) => {
        const date =
          dateValue(
            checkin.checkin_date,
          );

        return (
          date >= currentStart &&
          date <= today
        );
      },
    );

  const previousRows =
    checkins.filter(
      (checkin) => {
        const date =
          dateValue(
            checkin.checkin_date,
          );

        return (
          date >= previousStart &&
          date <= previousEnd
        );
      },
    );

  const current =
    calculateCheckinSummary(
      currentRows,
    );

  const previous =
    calculateCheckinSummary(
      previousRows,
    );

  return {
    current,
    previous,

    changes: {
      averageRpe:
        difference(
          current.averageRpe,
          previous.averageRpe,
        ),

      goalAchieved:
        difference(
          current.goalAchievedPercentage,
          previous.goalAchievedPercentage,
        ),

      stableOrImproved:
        difference(
          current.stableOrImprovedPercentage,
          previous.stableOrImprovedPercentage,
        ),

      sessionsToReview:
        current.sessionsToReview -
        previous.sessionsToReview,
    },
  };
}
