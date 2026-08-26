import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calculateVideoSummary,
  createCoachVideos,
} from "../../src/components/coach-manager/video/VideoCalculations";

import type {
  VideoAnalysisRow,
} from "../../src/components/coach-manager/video/VideoData";


function makeVideoAnalysis(
  overrides:
    Partial<VideoAnalysisRow> = {},
): VideoAnalysisRow {
  return {
    id:
      crypto.randomUUID(),

    user_id:
      "athlete-a",

    created_at:
      "2026-08-20T12:00:00Z",

    updated_at:
      "2026-08-20T12:00:00Z",

    storage_path:
      "athlete-a/video.mp4",

    discipline:
      "Sprint",

    detected_movement:
      "Block Start",

    overall_rating:
      7.5,

    overall_reasoning:
      "Solid start.",

    overall_recommendation:
      "Maintain projection.",

    athlete_request:
      null,

    coach_notes:
      null,

    findings: [
      {
        joint:
          "Torso",

        val:
          42,

        unit:
          "°",

        ideal:
          45,

        status:
          "review",

        reasoning:
          "Torso rises slightly early.",

        recommendation:
          "Stay patient through the drive phase.",
      },
    ],

    kpis:
      null,

    score_breakdown: {
      Projection:
        7.8,

      FirstStep: {
        score:
          7.2,
      },
    },

    ai_analysis:
      null,

    ...overrides,
  } as VideoAnalysisRow;
}


describe(
  "Video calculations",
  () => {
    it(
      "creates Coach Manager video objects from Supabase analyses",
      () => {
        const analyses = [
          makeVideoAnalysis({
            id:
              "new-video",

            created_at:
              "2026-08-20T12:00:00Z",

            overall_rating:
              8.1,
          }),

          makeVideoAnalysis({
            id:
              "old-video",

            created_at:
              "2026-08-10T12:00:00Z",

            overall_rating:
              7.2,
          }),
        ];

        const names =
          new Map([
            [
              "athlete-a",
              "Athlete A",
            ],
          ]);

        const videos =
          createCoachVideos(
            analyses,
            names,
          );

        expect(
          videos,
        ).toHaveLength(
          2,
        );

        expect(
          videos[0].id,
        ).toBe(
          "new-video",
        );

        expect(
          videos[0].athlete,
        ).toBe(
          "Athlete A",
        );

        expect(
          videos[0].previousId,
        ).toBe(
          "old-video",
        );

        expect(
          videos[0].previousScore,
        ).toBe(
          7.2,
        );
      },
    );


    it(
      "parses findings and score breakdown correctly",
      () => {
        const videos =
          createCoachVideos(
            [
              makeVideoAnalysis(),
            ],

            new Map([
              [
                "athlete-a",
                "Athlete A",
              ],
            ]),
          );

        expect(
          videos[0].findings,
        ).toHaveLength(
          1,
        );

        expect(
          videos[0].findings[0],
        ).toMatchObject({
          title:
            "Torso",

          value:
            "42°",

          ideal:
            "45°",

          status:
            "review",
        });

        expect(
          videos[0].breakdown,
        ).toEqual(
          expect.arrayContaining([
            {
              label:
                "Projection",

              score:
                7.8,
            },

            {
              label:
                "FirstStep",

              score:
                7.2,
            },
          ]),
        );
      },
    );


    it(
      "only links previous videos with the same athlete, discipline and movement",
      () => {
        const videos =
          createCoachVideos(
            [
              makeVideoAnalysis({
                id:
                  "latest",

                created_at:
                  "2026-08-20T12:00:00Z",
              }),

              makeVideoAnalysis({
                id:
                  "wrong-movement",

                created_at:
                  "2026-08-15T12:00:00Z",

                detected_movement:
                  "Max Velocity",
              }),

              makeVideoAnalysis({
                id:
                  "correct-previous",

                created_at:
                  "2026-08-10T12:00:00Z",

                overall_rating:
                  6.9,
              }),
            ],

            new Map(),
          );

        expect(
          videos[0].previousId,
        ).toBe(
          "correct-previous",
        );

        expect(
          videos[0].previousScore,
        ).toBe(
          6.9,
        );
      },
    );


    it(
      "calculates the video summary",
      () => {
        const videos =
          createCoachVideos(
            [
              makeVideoAnalysis({
                id:
                  "video-1",

                overall_rating:
                  8,

                detected_movement:
                  "Block Start",
              }),

              makeVideoAnalysis({
                id:
                  "video-2",

                user_id:
                  "athlete-b",

                created_at:
                  "2026-08-19T12:00:00Z",

                overall_rating:
                  6,

                detected_movement:
                  "Block Start",
              }),

              makeVideoAnalysis({
                id:
                  "video-3",

                user_id:
                  "athlete-c",

                created_at:
                  "2026-08-18T12:00:00Z",

                overall_rating:
                  7,

                detected_movement:
                  "Max Velocity",

                findings: [],
              }),
            ],

            new Map(),
          );

        const summary =
          calculateVideoSummary(
            videos,
          );

        expect(
          summary.totalAnalyses,
        ).toBe(
          3,
        );

        expect(
          summary.averageRating,
        ).toBe(
          7,
        );

        expect(
          summary.mostCommonMovement,
        ).toBe(
          "Block Start",
        );

        expect(
          summary.totalFindings,
        ).toBe(
          2,
        );
      },
    );
  },
);
