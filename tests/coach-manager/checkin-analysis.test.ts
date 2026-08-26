import { describe, expect, it } from "vitest";

import {
  calculateCheckinSummary,
  calculateGoalPerformanceMatrix,
  calculateUnexpectedDifficulty,
  calculateCheckinTrend,
} from "../../src/components/coach-manager/analyses/check-in/CheckinAnalysisCalculations";

import type {
  CoachCheckin,
} from "../../src/components/coach-manager/analyses/check-in/CheckinAnalysisData";


function makeCheckin(
  overrides: Partial<CoachCheckin> = {},
): CoachCheckin {
  return {
    id: crypto.randomUUID(),
    user_id: "athlete-a",
    checkin_date: "2026-08-20",

    is_rest_day: false,

    rpe: 7,
    session_goal_achieved: "Ja",
    performance_quality: "Stabil geblieben",
    expected_difficulty: "Wie erwartet",
    workout_type: "Speed Endurance",

    has_pain: false,
    pain_area: null,
    pain_note: null,
    pain_severity: null,

    mental_state: null,
    performance_factors: null,
    physical_feeling: 4,

    ai_summary: null,
    ate_around_training: null,
    context_summary: null,
    created_at: "2026-08-20T12:00:00Z",
    discipline: "Sprint",
    duration_min: 60,
    extra_note: null,
    food_note: null,
    last_meal_before: null,
    overall_feeling: null,
    performance_results: null,
    satisfaction: null,
    session_details: null,
    session_goal_note: null,
    sleep_hours: null,
    sleep_quality: null,
    updated_at: "2026-08-20T12:00:00Z",
    water_intake: null,
    woke_recovered: null,

    ...overrides,
  };
}


describe("Check-In Analysis calculations", () => {
  it("calculates summary metrics correctly", () => {
    const checkins = [
      makeCheckin({
        rpe: 6,
        session_goal_achieved: "Ja",
        performance_quality: "Besser geworden",
      }),

      makeCheckin({
        id: "checkin-2",
        user_id: "athlete-b",
        rpe: 8,
        session_goal_achieved: "Teilweise",
        performance_quality: "Stabil geblieben",
      }),

      makeCheckin({
        id: "checkin-3",
        user_id: "athlete-c",
        rpe: 7,
        session_goal_achieved: "Nein",
        performance_quality: "Stark abgefallen",
      }),
    ];

    const result =
      calculateCheckinSummary(checkins);

    expect(result.totalSessions).toBe(3);

    expect(result.averageRpe).toBe(7);

    expect(
      result.goalAchievedPercentage,
    ).toBe(33);

    expect(
      result.stableOrImprovedPercentage,
    ).toBe(67);

    expect(
      result.sessionsToReview,
    ).toBe(1);
  });


  it("excludes rest days from summary calculations", () => {
    const checkins = [
      makeCheckin({
        rpe: 6,
      }),

      makeCheckin({
        id: "rest-day",
        is_rest_day: true,
        rpe: 10,
      }),
    ];

    const result =
      calculateCheckinSummary(checkins);

    expect(result.totalSessions).toBe(1);
    expect(result.averageRpe).toBe(6);
  });


  it("calculates unexpected difficulty by training type", () => {
    const checkins = [
      makeCheckin({
        id: "speed-1",
        expected_difficulty:
          "Schwerer als erwartet",
      }),

      makeCheckin({
        id: "speed-2",
        user_id: "athlete-b",
        expected_difficulty:
          "Wie erwartet",
      }),

      makeCheckin({
        id: "speed-3",
        user_id: "athlete-c",
        expected_difficulty:
          "Deutlich schwerer als erwartet",
      }),
    ];

    const result =
      calculateUnexpectedDifficulty(
        checkins,
      );

    expect(result).toHaveLength(1);

    expect(result[0]).toMatchObject({
      label: "Speed Endurance",
      percentage: 67,
      athletes: 2,
      sessions: 2,
    });
  });


  it("builds the goal-performance matrix", () => {
    const checkins = [
      makeCheckin({
        session_goal_achieved: "Ja",
        performance_quality:
          "Besser geworden",
      }),

      makeCheckin({
        id: "matrix-2",
        session_goal_achieved: "Nein",
        performance_quality:
          "Stark abgefallen",
      }),
    ];

    const matrix =
      calculateGoalPerformanceMatrix(
        checkins,
      );

    expect(matrix).toHaveLength(3);
    expect(matrix[0]).toHaveLength(4);

    expect(matrix[0][0].count).toBe(1);
    expect(matrix[0][0].percentage).toBe(50);

    expect(matrix[2][2].count).toBe(1);
    expect(matrix[2][2].percentage).toBe(50);
  });


  it("creates chronological RPE trend data", () => {
    const checkins = [
      makeCheckin({
        id: "trend-1",
        checkin_date: "2026-08-18",
        rpe: 6,
      }),

      makeCheckin({
        id: "trend-2",
        checkin_date: "2026-08-19",
        rpe: 8,
      }),

      makeCheckin({
        id: "trend-3",
        checkin_date: "2026-08-20",
        rpe: 7,
      }),
    ];

    const trend =
      calculateCheckinTrend(
        checkins,
        "RPE",
      );

    expect(
      trend.map((point) => point.value),
    ).toEqual([6, 8, 7]);

    expect(trend[0].date).toBe(
      "2026-08-18",
    );

    expect(trend[2].date).toBe(
      "2026-08-20",
    );
  });
});
