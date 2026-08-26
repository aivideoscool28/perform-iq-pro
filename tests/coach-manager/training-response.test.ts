import { describe, expect, it } from "vitest";

import {
  calculatePerformanceQualityDistribution,
  calculateTrainingResponseSummary,
  calculateTrainingSessionsToReview,
  calculateTrainingTypeResponses,
} from "../../src/components/coach-manager/analyses/TrainingResponseCalculations";

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


describe("Training Response calculations", () => {
  it("calculates the main training-response summary", () => {
    const checkins = [
      makeCheckin({
        rpe: 6,
        session_goal_achieved: "Ja",
        performance_quality:
          "Besser geworden",
      }),

      makeCheckin({
        id: "response-2",
        user_id: "athlete-b",
        rpe: 8,
        session_goal_achieved:
          "Teilweise",
        performance_quality:
          "Stabil geblieben",
      }),

      makeCheckin({
        id: "response-3",
        user_id: "athlete-c",
        rpe: 7,
        session_goal_achieved: "Nein",
        performance_quality:
          "Stark abgefallen",
      }),
    ];

    const result =
      calculateTrainingResponseSummary(
        checkins,
      );

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


  it("calculates performance-quality distribution", () => {
    const checkins = [
      makeCheckin({
        performance_quality:
          "Besser geworden",
      }),

      makeCheckin({
        id: "quality-2",
        performance_quality:
          "Stabil geblieben",
      }),

      makeCheckin({
        id: "quality-3",
        performance_quality:
          "Etwas abgefallen",
      }),

      makeCheckin({
        id: "quality-4",
        performance_quality:
          "Kann ich nicht beurteilen",
      }),
    ];

    const result =
      calculatePerformanceQualityDistribution(
        checkins,
      );

    expect(result).toEqual({
      improved: 25,
      stable: 25,
      declined: 25,
      unknown: 25,
    });
  });


  it("finds sessions that deserve review", () => {
    const checkins = [
      makeCheckin({
        id: "good-session",
      }),

      makeCheckin({
        id: "bad-session",
        user_id: "athlete-b",
        session_goal_achieved: "Nein",
        performance_quality:
          "Stark abgefallen",
      }),
    ];

    const result =
      calculateTrainingSessionsToReview(
        checkins,
      );

    expect(result).toHaveLength(1);

    expect(result[0].athleteId).toBe(
      "athlete-b",
    );

    expect(result[0].workoutType).toBe(
      "Speed Endurance",
    );

    expect(
      result[0].reasons.length,
    ).toBeGreaterThan(0);
  });


  it("groups responses by training type", () => {
    const checkins = [
      makeCheckin({
        id: "speed-1",
        workout_type:
          "Speed Endurance",
      }),

      makeCheckin({
        id: "speed-2",
        user_id: "athlete-b",
        workout_type:
          "Speed Endurance",
      }),

      makeCheckin({
        id: "hurdle-1",
        user_id: "athlete-c",
        workout_type:
          "Hurdle Rhythm",
      }),
    ];

    const result =
      calculateTrainingTypeResponses(
        checkins,
      );

    const speed =
      result.find(
        (item) =>
          item.label ===
          "Speed Endurance",
      );

    const hurdles =
      result.find(
        (item) =>
          item.label ===
          "Hurdle Rhythm",
      );

    expect(speed?.sessions).toBe(2);
    expect(speed?.athletes).toBe(2);

    expect(hurdles?.sessions).toBe(1);
    expect(hurdles?.athletes).toBe(1);
  });
});
