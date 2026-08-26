import {
  describe,
  expect,
  it,
} from "vitest";

import {
  compareSessionPair,
  selectBestComparablePair,
  type ComparableSession,
} from "../../src/components/coach-manager/analyses/session-comparison/SessionComparisonCalculations";

import type {
  CoachCheckin,
} from "../../src/components/coach-manager/analyses/check-in/CheckinAnalysisData";


function makeCheckin(
  athleteId: string,
  overrides:
    Partial<CoachCheckin> = {},
): CoachCheckin {
  return {
    id:
      crypto.randomUUID(),

    user_id:
      athleteId,

    checkin_date:
      "2026-08-20",

    is_rest_day:
      false,

    rpe:
      7,

    session_goal_achieved:
      "Ja",

    performance_quality:
      "Stabil geblieben",

    expected_difficulty:
      "Wie erwartet",

    workout_type:
      "Speed Endurance",

    has_pain:
      false,

    pain_area:
      null,

    pain_note:
      null,

    pain_severity:
      null,

    mental_state:
      null,

    performance_factors:
      null,

    physical_feeling:
      4,

    ai_summary:
      null,

    ate_around_training:
      null,

    context_summary:
      null,

    created_at:
      "2026-08-20T12:00:00Z",

    discipline:
      "Sprint",

    duration_min:
      60,

    extra_note:
      null,

    food_note:
      null,

    last_meal_before:
      null,

    overall_feeling:
      null,

    performance_results:
      null,

    satisfaction:
      null,

    session_details:
      null,

    session_goal_note:
      null,

    sleep_hours:
      null,

    sleep_quality:
      null,

    updated_at:
      "2026-08-20T12:00:00Z",

    water_intake:
      null,

    woke_recovered:
      null,

    ...overrides,
  };
}


function makeSession(
  overrides:
    Partial<ComparableSession> = {},
): ComparableSession {
  return {
    key:
      crypto.randomUUID(),

    date:
      "2026-08-20",

    workoutType:
      "Speed Endurance",

    checkins: [
      makeCheckin(
        "athlete-a",
      ),
      makeCheckin(
        "athlete-b",
      ),
    ],

    athletes:
      2,

    goalAchievementPercentage:
      50,

    stableOrImprovedPercentage:
      60,

    averageRpe:
      7,

    harderThanExpectedPercentage:
      20,

    contextFactors:
      [],

    ...overrides,
  };
}


describe(
  "Session Comparison calculations",
  () => {
    it(
      "selects the same training type with the strongest athlete overlap",
      () => {
        const olderSpeed =
          makeSession({
            key:
              "speed-old",

            date:
              "2026-08-10",

            checkins: [
              makeCheckin(
                "athlete-a",
              ),
              makeCheckin(
                "athlete-b",
              ),
              makeCheckin(
                "athlete-c",
              ),
            ],

            athletes:
              3,
          });

        const newerSpeed =
          makeSession({
            key:
              "speed-new",

            date:
              "2026-08-20",

            checkins: [
              makeCheckin(
                "athlete-a",
              ),
              makeCheckin(
                "athlete-b",
              ),
              makeCheckin(
                "athlete-c",
              ),
            ],

            athletes:
              3,
          });

        const hurdleA =
          makeSession({
            key:
              "hurdle-a",

            date:
              "2026-08-15",

            workoutType:
              "Hurdle Rhythm",

            checkins: [
              makeCheckin(
                "athlete-a",
              ),
            ],

            athletes:
              1,
          });

        const hurdleB =
          makeSession({
            key:
              "hurdle-b",

            date:
              "2026-08-22",

            workoutType:
              "Hurdle Rhythm",

            checkins: [
              makeCheckin(
                "athlete-a",
              ),
            ],

            athletes:
              1,
          });

        const result =
          selectBestComparablePair(
            [
              olderSpeed,
              newerSpeed,
              hurdleA,
              hurdleB,
            ],
          );

        expect(
          result,
        ).not.toBeNull();

        expect(
          result?.sessionA.key,
        ).toBe(
          "speed-old",
        );

        expect(
          result?.sessionB.key,
        ).toBe(
          "speed-new",
        );
      },
    );


    it(
      "returns null when no workout type has two comparable sessions",
      () => {
        const result =
          selectBestComparablePair(
            [
              makeSession({
                workoutType:
                  "Speed Endurance",
              }),

              makeSession({
                workoutType:
                  "Hurdle Rhythm",
              }),
            ],
          );

        expect(
          result,
        ).toBeNull();
      },
    );


    it(
      "compares two sessions and calculates athlete overlap",
      () => {
        const sessionA =
          makeSession({
            key:
              "session-a",

            date:
              "2026-08-10",

            goalAchievementPercentage:
              50,

            stableOrImprovedPercentage:
              50,

            averageRpe:
              6,

            harderThanExpectedPercentage:
              20,

            checkins: [
              makeCheckin(
                "athlete-a",
                {
                  session_goal_achieved:
                    "Teilweise",

                  performance_quality:
                    "Stabil geblieben",
                },
              ),

              makeCheckin(
                "athlete-b",
                {
                  session_goal_achieved:
                    "Nein",

                  performance_quality:
                    "Etwas abgefallen",
                },
              ),
            ],
          });

        const sessionB =
          makeSession({
            key:
              "session-b",

            date:
              "2026-08-20",

            goalAchievementPercentage:
              75,

            stableOrImprovedPercentage:
              75,

            averageRpe:
              7,

            harderThanExpectedPercentage:
              30,

            checkins: [
              makeCheckin(
                "athlete-a",
                {
                  session_goal_achieved:
                    "Ja",

                  performance_quality:
                    "Besser geworden",
                },
              ),

              makeCheckin(
                "athlete-b",
                {
                  session_goal_achieved:
                    "Teilweise",

                  performance_quality:
                    "Stabil geblieben",
                },
              ),

              makeCheckin(
                "athlete-c",
              ),
            ],

            athletes:
              3,
          });

        const result =
          compareSessionPair(
            sessionA,
            sessionB,
          );

        expect(
          result.athleteOverlap,
        ).toBe(
          2,
        );

        expect(
          result.comparisonSections.length,
        ).toBeGreaterThan(
          0,
        );

        const outcome =
          result.comparisonSections.find(
            (section) =>
              section.title ===
              "OUTCOME",
          );

        expect(
          outcome,
        ).toBeDefined();

        const goalRow =
          outcome?.rows.find(
            (row) =>
              row.metric ===
              "Goal Achievement",
          );

        expect(
          goalRow?.sessionA,
        ).toBe(
          "50%",
        );

        expect(
          goalRow?.sessionB,
        ).toBe(
          "75%",
        );

        expect(
          goalRow?.change,
        ).toBe(
          "↑ 25%",
        );

        expect(
          goalRow?.distribution,
        ).toEqual({
          improved:
            2,

          similar:
            0,

          declined:
            0,
        });
      },
    );
  },
);
