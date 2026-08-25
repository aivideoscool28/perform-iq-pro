import type {
  DailyCheckinForAnalysis,
  GoalPerformanceComparison,
} from "./daily-checkin-data";

import {
  GOAL_ANSWERS,
  PERFORMANCE_QUALITY_ANSWERS,
} from "./daily-checkin-calculations";

/**
 * DAILY CHECK-IN COMPARISONS
 *
 * Compares answers that become more useful when viewed together.
 *
 * Current comparison:
 *
 * Question 5 — Goal Achievement
 * x
 * Question 4 — Performance Quality
 */

function round(value: number, decimals = 1) {
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}

export function calculateGoalPerformanceComparison(
  checkins: DailyCheckinForAnalysis[],
): GoalPerformanceComparison {
  /**
   * Excluded:
   *
   * Q5: "Weiß ich nicht"
   * Q4: "Kann ich nicht beurteilen"
   *
   * They cannot be meaningfully placed into this comparison.
   */
  const validSessions = checkins.filter(
    (checkin) =>
      checkin.is_rest_day !== true &&
      GOAL_ANSWERS.includes(
        checkin.session_goal_achieved as
          (typeof GOAL_ANSWERS)[number],
      ) &&
      PERFORMANCE_QUALITY_ANSWERS.includes(
        checkin.performance_quality as
          (typeof PERFORMANCE_QUALITY_ANSWERS)[number],
      ),
  );

  const totalSessions = validSessions.length;

  const cells = GOAL_ANSWERS.flatMap((goal) =>
    PERFORMANCE_QUALITY_ANSWERS.map(
      (performance) => {
        const count = validSessions.filter(
          (checkin) =>
            checkin.session_goal_achieved === goal &&
            checkin.performance_quality === performance,
        ).length;

        return {
          goal,
          performance,
          count,
          percentage:
            totalSessions === 0
              ? null
              : round(
                  (count / totalSessions) * 100,
                ),
        };
      },
    ),
  );

  return {
    totalSessions,
    cells,
  };
}
