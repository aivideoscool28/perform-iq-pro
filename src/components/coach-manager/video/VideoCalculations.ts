import type {
  VideoAnalysisRow,
} from "./VideoData";

export type VideoFinding = {
  title: string;
  detail: string;
  recommendation: string;
  status: string;
  value: string | null;
  ideal: string | null;
};

export type VideoBreakdownItem = {
  label: string;
  score: number;
};

export type CoachVideo = {
  id: string;

  athleteId: string;
  athlete: string;

  date: string;

  discipline: string;
  movement: string;

  score: number | null;

  reasoning: string | null;
  recommendation: string | null;

  findings:
    VideoFinding[];

  breakdown:
    VideoBreakdownItem[];

  storagePath: string;

  coachNotes:
    string | null;

  previousScore:
    number | null;

  previousId:
    string | null;
};

function isRecord(
  value: unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(
      value,
    )
  );
}

function parseFindings(
  value: unknown,
): VideoFinding[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  return value
    .filter(
      isRecord,
    )
    .map(
      (
        finding,
      ) => {
        const joint =
          typeof finding.joint ===
          "string"
            ? finding.joint
            : "Finding";

        const reasoning =
          typeof finding.reasoning ===
          "string"
            ? finding.reasoning
            : "";

        const recommendation =
          typeof finding.recommendation ===
          "string"
            ? finding.recommendation
            : "";

        const status =
          typeof finding.status ===
          "string"
            ? finding.status
            : "unknown";

        const rawValue =
          finding.val;

        const unit =
          typeof finding.unit ===
          "string"
            ? finding.unit
            : "";

        const rawIdeal =
          finding.ideal;

        return {
          title:
            joint,

          detail:
            reasoning,

          recommendation,

          status,

          value:
            typeof rawValue ===
              "number" ||
            typeof rawValue ===
              "string"
              ? `${rawValue}${unit}`
              : null,

          ideal:
            typeof rawIdeal ===
              "number" ||
            typeof rawIdeal ===
              "string"
              ? `${rawIdeal}${unit}`
              : null,
        };
      },
    );
}

function parseBreakdown(
  value: unknown,
): VideoBreakdownItem[] {
  if (
    !isRecord(
      value,
    )
  ) {
    return [];
  }

  return Object.entries(
    value,
  )
    .map(
      ([
        label,
        rawValue,
      ]) => {
        if (
          typeof rawValue ===
          "number"
        ) {
          return {
            label,
            score:
              rawValue,
          };
        }

        if (
          isRecord(
            rawValue,
          ) &&
          typeof rawValue.score ===
            "number"
        ) {
          return {
            label,
            score:
              rawValue.score,
          };
        }

        return null;
      },
    )
    .filter(
      (
        item,
      ): item is VideoBreakdownItem =>
        item !== null,
    );
}

export function createCoachVideos(
  analyses:
    VideoAnalysisRow[],
  athleteNameById:
    Map<string, string>,
): CoachVideo[] {
  const sorted =
    [...analyses].sort(
      (
        a,
        b,
      ) =>
        new Date(
          b.created_at,
        ).getTime() -
        new Date(
          a.created_at,
        ).getTime(),
    );

  return sorted.map(
    (
      analysis,
      index,
    ) => {
      const previous =
        sorted
          .slice(
            index + 1,
          )
          .find(
            (
              candidate,
            ) =>
              candidate.user_id ===
                analysis.user_id &&
              candidate.discipline ===
                analysis.discipline &&
              candidate.detected_movement ===
                analysis.detected_movement,
          ) ??
        null;

      return {
        id:
          analysis.id,

        athleteId:
          analysis.user_id,

        athlete:
          athleteNameById.get(
            analysis.user_id,
          ) ??
          "Unknown athlete",

        date:
          analysis.created_at,

        discipline:
          analysis.discipline ??
          "Unspecified",

        movement:
          analysis.detected_movement ??
          "Video Analysis",

        score:
          typeof analysis.overall_rating ===
          "number"
            ? analysis.overall_rating
            : null,

        reasoning:
          analysis.overall_reasoning,

        recommendation:
          analysis.overall_recommendation,

        findings:
          parseFindings(
            analysis.findings,
          ),

        breakdown:
          parseBreakdown(
            analysis.score_breakdown,
          ),

        storagePath:
          analysis.storage_path,

        coachNotes:
          analysis.coach_notes,

        previousScore:
          previous &&
          typeof previous.overall_rating ===
            "number"
            ? previous.overall_rating
            : null,

        previousId:
          previous?.id ??
          null,
      };
    },
  );
}

export type VideoSummary = {
  totalAnalyses: number;

  averageRating:
    number | null;

  mostCommonMovement:
    string | null;

  totalFindings: number;
};

export function calculateVideoSummary(
  videos:
    CoachVideo[],
): VideoSummary {
  const ratings =
    videos
      .map(
        (
          video,
        ) =>
          video.score,
      )
      .filter(
        (
          value,
        ): value is number =>
          typeof value ===
          "number",
      );

  const movements =
    new Map<
      string,
      number
    >();

  let totalFindings =
    0;

  for (
    const video of
      videos
  ) {
    totalFindings +=
      video.findings.length;

    movements.set(
      video.movement,
      (
        movements.get(
          video.movement,
        ) ?? 0
      ) + 1,
    );
  }

  const mostCommonMovement =
    [
      ...movements.entries(),
    ].sort(
      (
        a,
        b,
      ) =>
        b[1] -
        a[1],
    )[0]?.[0] ??
    null;

  return {
    totalAnalyses:
      videos.length,

    averageRating:
      ratings.length >
      0
        ? Math.round(
            (
              ratings.reduce(
                (
                  total,
                  value,
                ) =>
                  total +
                  value,
                0,
              ) /
              ratings.length
            ) *
              10,
          ) /
          10
        : null,

    mostCommonMovement,

    totalFindings,
  };
}
