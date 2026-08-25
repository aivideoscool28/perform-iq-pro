import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  Play,
  Search,
  Sparkles,
  Target,
  Video,
  X,
} from "lucide-react";

import {
  getCoachVideoData,
  getCoachVideoUrl,
  updateCoachVideoNotes,
  type CoachVideoData,
} from "./VideoData";

import {
  calculateVideoSummary,
  createCoachVideos,
  type CoachVideo,
} from "./VideoCalculations";


function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(
    new Date(value),
  );
}


function VideoThumbnail() {
  return (
    <div className="relative h-14 w-[92px] shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-slate-800 via-slate-600 to-slate-900">
      <div className="absolute inset-0 grid place-items-center">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-white shadow-sm">
          <Play className="ml-0.5 h-3 w-3 fill-violet-600 text-violet-600" />
        </div>
      </div>
    </div>
  );
}


function EmptyReviewState() {
  return (
    <section className="grid min-h-[475px] place-items-center rounded-2xl border border-border bg-white shadow-sm">
      <div className="max-w-[300px] text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-violet-50">
          <Video className="h-6 w-6 text-violet-600" />
        </div>

        <h3 className="mt-4 text-base font-bold">
          Select a video to review
        </h3>

        <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
          Choose an athlete video to inspect its saved AI analysis,
          findings and coaching recommendations.
        </p>

        <div className="mx-auto mt-4 w-fit space-y-2 text-left">
          {[
            "Review real AI findings",
            "Inspect technical breakdown",
            "Add coach context and notes",
          ].map(
            (item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-[9px] text-muted-foreground"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-violet-600" />
                {item}
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}


function SelectedVideoPanel({
  video,
  onClose,
  onNotesSaved,
}: {
  video: CoachVideo;
  onClose: () => void;
  onNotesSaved: (
    videoId: string,
    notes: string,
  ) => void;
}) {
  const [
    videoUrl,
    setVideoUrl,
  ] =
    useState<string | null>(
      null,
    );

  const [
    notes,
    setNotes,
  ] =
    useState(
      video.coachNotes ??
        "",
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    saved,
    setSaved,
  ] =
    useState(false);

  useEffect(
    () => {
      let cancelled =
        false;

      setVideoUrl(
        null,
      );

      setNotes(
        video.coachNotes ??
          "",
      );

      setSaved(
        false,
      );

      async function loadUrl() {
        const url =
          await getCoachVideoUrl(
            video.storagePath,
          );

        if (
          !cancelled
        ) {
          setVideoUrl(
            url,
          );
        }
      }

      void loadUrl();

      return () => {
        cancelled = true;
      };
    },
    [
      video.id,
      video.storagePath,
      video.coachNotes,
    ],
  );

  async function saveNotes() {
    try {
      setSaving(
        true,
      );

      setSaved(
        false,
      );

      await updateCoachVideoNotes(
        video.id,
        notes,
      );

      onNotesSaved(
        video.id,
        notes,
      );

      setSaved(
        true,
      );
    } catch (
      error
    ) {
      console.error(
        "Could not save coach notes:",
        error,
      );
    } finally {
      setSaving(
        false,
      );
    }
  }

  const scoreDelta =
    video.score !==
      null &&
    video.previousScore !==
      null
      ? Math.round(
          (
            video.score -
            video.previousScore
          ) *
            10,
        ) /
        10
      : null;

  return (
    <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold">
              {
                video.movement
              }
            </h2>

            <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[6px] font-semibold text-violet-700">
              AI analyzed
            </span>
          </div>

          <p className="mt-1 text-[8px] text-muted-foreground">
            {
              video.athlete
            }{" "}
            ·{" "}
            {formatDate(
              video.date,
            )}{" "}
            ·{" "}
            {
              video.discipline
            }
          </p>
        </div>

        <button
          type="button"
          onClick={
            onClose
          }
          className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted/30"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl bg-slate-950">
        {videoUrl ? (
          <video
            src={
              videoUrl
            }
            controls
            className="h-44 w-full object-contain"
          />
        ) : (
          <div className="grid h-44 place-items-center">
            <div className="text-center">
              <Play className="mx-auto h-7 w-7 text-white" />

              <p className="mt-2 text-[8px] text-white/70">
                Loading video...
              </p>
            </div>
          </div>
        )}
      </div>

      <section className="mt-2 rounded-xl border border-violet-100 bg-violet-50/25 px-3 py-2.5">
        <div className="flex items-center gap-5">
          <div className="min-w-[110px]">
            <p className="text-[7px] font-semibold text-muted-foreground">
              Overall Rating
            </p>

            <div className="mt-1 flex items-baseline gap-1">
              <p className="text-xl font-bold text-violet-700">
                {video.score !==
                null
                  ? video.score.toFixed(
                      1,
                    )
                  : "—"}
              </p>

              {video.score !==
                null && (
                <span className="text-[7px] text-muted-foreground">
                  /10
                </span>
              )}
            </div>

            {scoreDelta !==
              null && (
              <p
                className={[
                  "text-[6px] font-semibold",
                  scoreDelta >=
                  0
                    ? "text-green-600"
                    : "text-red-500",
                ].join(
                  " ",
                )}
              >
                {scoreDelta >=
                0
                  ? "↑"
                  : "↓"}{" "}
                {Math.abs(
                  scoreDelta,
                ).toFixed(
                  1,
                )}{" "}
                vs previous comparable
              </p>
            )}
          </div>

          <div className="grid flex-1 grid-cols-4 gap-3">
            {video.breakdown
              .slice(
                0,
                4,
              )
              .map(
                (
                  item,
                ) => (
                  <div
                    key={
                      item.label
                    }
                  >
                    <p className="truncate text-[6px] text-muted-foreground">
                      {
                        item.label
                      }
                    </p>

                    <p className="mt-1 text-[11px] font-bold">
                      {
                        item.score
                      }
                    </p>

                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-violet-100">
                      <div
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(
                              100,
                              item.score *
                                10,
                            ),
                          )}%`,
                        }}
                        className="h-full rounded-full bg-violet-500"
                      />
                    </div>
                  </div>
                ),
              )}
          </div>
        </div>
      </section>

      <div className="mt-2 grid grid-cols-[1.2fr_0.8fr] gap-2">
        <section className="rounded-xl border border-border p-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold">
              AI Findings
            </h3>

            <span className="text-[6px] text-muted-foreground">
              {
                video.findings
                  .length
              }{" "}
              finding
              {video.findings
                .length ===
              1
                ? ""
                : "s"}
            </span>
          </div>

          {video.findings.length ===
          0 ? (
            <p className="mt-3 text-[8px] text-muted-foreground">
              No structured findings were saved for this analysis.
            </p>
          ) : (
            <div className="mt-2 space-y-1.5">
              {video.findings.map(
                (
                  finding,
                  index,
                ) => {
                  const positive =
                    finding.status
                      .toLowerCase()
                      .includes(
                        "good",
                      ) ||
                    finding.status
                      .toLowerCase()
                      .includes(
                        "optimal",
                      ) ||
                    finding.status
                      .toLowerCase()
                      .includes(
                        "strength",
                      );

                  return (
                    <div
                      key={`${finding.title}-${index}`}
                      className={[
                        "rounded-lg border px-2 py-2",
                        positive
                          ? "border-green-100 bg-green-50/30"
                          : "border-border/70",
                      ].join(
                        " ",
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={[
                            "grid h-6 w-6 shrink-0 place-items-center rounded-full",
                            positive
                              ? "bg-green-50"
                              : "bg-violet-50",
                          ].join(
                            " ",
                          )}
                        >
                          {positive ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : (
                            <Target className="h-3 w-3 text-violet-600" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[7px] font-semibold">
                            {
                              finding.title
                            }
                          </p>

                          {finding.value && (
                            <p className="mt-0.5 text-[6px] font-medium text-violet-600">
                              Observed:{" "}
                              {
                                finding.value
                              }
                              {finding.ideal
                                ? ` · Ideal: ${finding.ideal}`
                                : ""}
                            </p>
                          )}

                          {finding.detail && (
                            <p className="mt-1 text-[6px] leading-relaxed text-muted-foreground">
                              {
                                finding.detail
                              }
                            </p>
                          )}

                          {finding.recommendation && (
                            <p className="mt-1 text-[6px] leading-relaxed text-slate-700">
                              {
                                finding.recommendation
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-violet-100 p-2.5">
          <h3 className="text-[10px] font-bold">
            Coach Notes
          </h3>

          <p className="mt-0.5 text-[6px] text-muted-foreground">
            Add coaching context that Athletic IQ cannot observe from the video alone.
          </p>

          <textarea
            value={
              notes
            }
            onChange={(
              event,
            ) => {
              setNotes(
                event.target
                  .value,
              );

              setSaved(
                false,
              );
            }}
            placeholder="Add coach context or notes..."
            className="mt-2 min-h-[110px] w-full resize-none rounded-lg border border-border px-2 py-2 text-[7px] outline-none"
          />

          <div className="mt-2 flex items-center justify-between">
            <span className="text-[6px] text-green-600">
              {saved
                ? "Notes saved"
                : ""}
            </span>

            <button
              type="button"
              disabled={
                saving
              }
              onClick={() =>
                void saveNotes()
              }
              className="rounded-lg bg-violet-600 px-3 py-1.5 text-[7px] font-semibold text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save notes"}
            </button>
          </div>
        </section>
      </div>

      <div className="mt-2 grid grid-cols-[0.8fr_1.2fr] gap-2">
        <section className="rounded-xl border border-border p-2.5">
          <p className="text-[8px] font-bold">
            Comparable History
          </p>

          {video.previousScore !==
          null ? (
            <>
              <p className="mt-0.5 text-[6px] text-muted-foreground">
                Previous analysis for the same athlete, discipline and detected movement
              </p>

              <div className="mt-2 flex items-center gap-3">
                <div>
                  <p className="text-[6px] text-muted-foreground">
                    Previous
                  </p>

                  <p className="text-base font-bold text-violet-600">
                    {video.previousScore.toFixed(
                      1,
                    )}
                  </p>
                </div>

                {scoreDelta !==
                  null && (
                  <div className="rounded-lg bg-violet-50 px-3 py-1.5">
                    <p className="text-[10px] font-bold text-violet-700">
                      {scoreDelta >=
                      0
                        ? "↑"
                        : "↓"}{" "}
                      {Math.abs(
                        scoreDelta,
                      ).toFixed(
                        1,
                      )}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-[6px] text-muted-foreground">
                    Current
                  </p>

                  <p className="text-base font-bold text-violet-600">
                    {video.score !==
                    null
                      ? video.score.toFixed(
                          1,
                        )
                      : "—"}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="mt-2 text-[7px] text-muted-foreground">
              No previous comparable video analysis is available yet.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-violet-100 bg-violet-50/35 p-2.5">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />

            <div>
              <p className="text-[8px] font-bold text-violet-700">
                Athletic IQ Video Insight
              </p>

              <p className="mt-1 text-[7px] leading-relaxed text-muted-foreground">
                {video.reasoning ??
                  "No overall reasoning was saved for this analysis."}
              </p>

              {video.recommendation && (
                <p className="mt-1 text-[7px] font-medium text-slate-700">
                  {
                    video.recommendation
                  }
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}


export function VideoPage() {
  const [
    data,
    setData,
  ] =
    useState<CoachVideoData | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    selectedVideoId,
    setSelectedVideoId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    filter,
    setFilter,
  ] =
    useState<
      "all" |
      "scored" |
      "findings"
    >("all");

  useEffect(() => {
    let cancelled =
      false;

    async function load() {
      try {
        setLoading(
          true,
        );

        setError(
          null,
        );

        const result =
          await getCoachVideoData();

        if (
          !cancelled
        ) {
          setData(
            result,
          );
        }
      } catch (
        loadError
      ) {
        console.error(
          "Could not load Coach Video data:",
          loadError,
        );

        if (
          !cancelled
        ) {
          setError(
            loadError instanceof
              Error
              ? loadError.message
              : "Could not load video analyses.",
          );
        }
      } finally {
        if (
          !cancelled
        ) {
          setLoading(
            false,
          );
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const athleteNameById =
    useMemo(
      () =>
        new Map(
          (
            data?.athletes ??
            []
          ).map(
            (
              athlete,
            ) => [
              athlete.id,
              athlete.display_name ??
                "Unnamed athlete",
            ],
          ),
        ),
      [
        data?.athletes,
      ],
    );

  const videos =
    useMemo(
      () =>
        createCoachVideos(
          data?.analyses ??
            [],
          athleteNameById,
        ),
      [
        data?.analyses,
        athleteNameById,
      ],
    );

  const summary =
    useMemo(
      () =>
        calculateVideoSummary(
          videos,
        ),
      [
        videos,
      ],
    );

  const selectedVideo =
    useMemo(
      () =>
        videos.find(
          (
            video,
          ) =>
            video.id ===
            selectedVideoId,
        ) ??
        null,
      [
        videos,
        selectedVideoId,
      ],
    );

  const filteredVideos =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        return videos.filter(
          (
            video,
          ) => {
            if (
              filter ===
                "scored" &&
              video.score ===
                null
            ) {
              return false;
            }

            if (
              filter ===
                "findings" &&
              video.findings
                .length ===
                0
            ) {
              return false;
            }

            if (
              query.length ===
              0
            ) {
              return true;
            }

            return [
              video.athlete,
              video.discipline,
              video.movement,
            ].some(
              (
                value,
              ) =>
                value
                  .toLowerCase()
                  .includes(
                    query,
                  ),
            );
          },
        );
      },
      [
        videos,
        filter,
        search,
      ],
    );

  function handleNotesSaved(
    videoId: string,
    notes: string,
  ) {
    setData(
      (
        current,
      ) => {
        if (
          !current
        ) {
          return current;
        }

        return {
          ...current,

          analyses:
            current.analyses.map(
              (
                analysis,
              ) =>
                analysis.id ===
                videoId
                  ? {
                      ...analysis,

                      coach_notes:
                        notes.trim()
                          ? notes.trim()
                          : null,
                    }
                  : analysis,
            ),
        };
      },
    );
  }

  if (
    loading
  ) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold">
          Loading Video Analysis...
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Reading athlete video analyses from Supabase.
        </p>
      </div>
    );
  }

  if (
    error
  ) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-bold text-red-700">
          Video Analysis could not be loaded
        </p>

        <p className="mt-1 text-xs text-red-600">
          {
            error
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <section className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600">
            Video
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Video Analysis
          </h1>

          <p className="mt-1 text-xs text-muted-foreground">
            Review saved athlete video analyses, findings and coaching context.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-2">
        {[
          {
            label:
              "Analyzed Videos",

            value:
              String(
                summary.totalAnalyses,
              ),

            detail:
              "Connected athlete analyses",

            icon:
              Video,

            style:
              "bg-violet-50 text-violet-600",
          },

          {
            label:
              "Total Findings",

            value:
              String(
                summary.totalFindings,
              ),

            detail:
              "Structured AI findings",

            icon:
              Clock3,

            style:
              "bg-orange-50 text-orange-600",
          },

          {
            label:
              "Most Common Movement",

            value:
              summary.mostCommonMovement ??
              "—",

            detail:
              "Most frequently analyzed movement",

            icon:
              Target,

            style:
              "bg-green-50 text-green-600",
          },

          {
            label:
              "Average Video Rating",

            value:
              summary.averageRating !==
              null
                ? `${summary.averageRating.toFixed(
                    1,
                  )} /10`
                : "—",

            detail:
              "Across analyses with a saved rating",

            icon:
              Sparkles,

            style:
              "bg-violet-50 text-violet-600",
          },
        ].map(
          ({
            label,
            value,
            detail,
            icon:
              Icon,
            style,
          }) => (
            <article
              key={
                label
              }
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
                    {
                      label
                    }
                  </p>

                  <p
                    className={[
                      "mt-0.5 font-bold tracking-tight",
                      value.length >
                      15
                        ? "text-xs"
                        : "text-xl",
                    ].join(
                      " ",
                    )}
                  >
                    {
                      value
                    }
                  </p>

                  <p className="mt-0.5 text-[7px] text-muted-foreground">
                    {
                      detail
                    }
                  </p>
                </div>
              </div>
            </article>
          ),
        )}
      </section>

      <div className="grid grid-cols-[1fr_1fr] items-start gap-3">
        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="border-b border-border p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold">
                  Analyzed Videos
                </h2>

                <p className="mt-0.5 text-[8px] text-muted-foreground">
                  Real analyses saved by connected athletes.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-border px-2.5 py-1.5">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />

                <input
                  value={
                    search
                  }
                  onChange={(
                    event,
                  ) =>
                    setSearch(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Search videos..."
                  className="w-28 bg-transparent text-[8px] outline-none"
                />
              </div>
            </div>

            <div className="mt-2 flex gap-1">
              {[
                [
                  "all",
                  "All",
                ],
                [
                  "scored",
                  "With rating",
                ],
                [
                  "findings",
                  "With findings",
                ],
              ].map(
                ([
                  id,
                  label,
                ]) => (
                  <button
                    key={
                      id
                    }
                    type="button"
                    onClick={() =>
                      setFilter(
                        id as
                          | "all"
                          | "scored"
                          | "findings",
                      )
                    }
                    className={[
                      "rounded-lg border px-2.5 py-1 text-[7px] font-semibold",
                      filter ===
                      id
                        ? "border-violet-200 bg-violet-50 text-violet-700"
                        : "border-border text-muted-foreground",
                    ].join(
                      " ",
                    )}
                  >
                    {
                      label
                    }
                  </button>
                ),
              )}
            </div>
          </div>

          {filteredVideos.length ===
          0 ? (
            <div className="px-4 py-8 text-center">
              <Video className="mx-auto h-5 w-5 text-muted-foreground" />

              <p className="mt-2 text-[9px] font-semibold">
                No video analyses found
              </p>

              <p className="mt-1 text-[7px] text-muted-foreground">
                Athlete analyses will appear here after they are saved.
              </p>
            </div>
          ) : (
            filteredVideos.map(
              (
                video,
              ) => {
                const delta =
                  video.score !==
                    null &&
                  video.previousScore !==
                    null
                    ? video.score -
                      video.previousScore
                    : null;

                return (
                  <button
                    key={
                      video.id
                    }
                    type="button"
                    onClick={() =>
                      setSelectedVideoId(
                        video.id,
                      )
                    }
                    className={[
                      "grid w-full grid-cols-[92px_1fr_54px_45px_14px] items-center gap-3 border-b border-border/60 px-3 py-2.5 text-left transition last:border-b-0 hover:bg-muted/15",
                      selectedVideoId ===
                      video.id
                        ? "bg-violet-50/35"
                        : "",
                    ].join(
                      " ",
                    )}
                  >
                    <VideoThumbnail />

                    <div className="min-w-0">
                      <p className="text-[9px] font-bold">
                        {
                          video.movement
                        }
                      </p>

                      <p className="mt-0.5 text-[6px] text-muted-foreground">
                        {
                          video.athlete
                        }{" "}
                        ·{" "}
                        {formatDate(
                          video.date,
                        )}
                      </p>

                      <div className="mt-1 flex gap-1">
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-[6px] font-semibold text-green-700">
                          {
                            video.discipline
                          }
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[6px] text-muted-foreground">
                        Rating
                      </p>

                      <p className="text-base font-bold text-violet-700">
                        {video.score !==
                        null
                          ? video.score.toFixed(
                              1,
                            )
                          : "—"}
                      </p>

                      {delta !==
                        null && (
                        <p
                          className={[
                            "text-[6px] font-semibold",
                            delta >=
                            0
                              ? "text-green-600"
                              : "text-red-500",
                          ].join(
                            " ",
                          )}
                        >
                          {delta >=
                          0
                            ? "↑"
                            : "↓"}{" "}
                          {Math.abs(
                            delta,
                          ).toFixed(
                            1,
                          )}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-[6px] text-muted-foreground">
                        Findings
                      </p>

                      <p className="text-base font-bold">
                        {
                          video.findings
                            .length
                        }
                      </p>
                    </div>

                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                );
              },
            )
          )}
        </section>

        {selectedVideo ? (
          <SelectedVideoPanel
            video={
              selectedVideo
            }
            onClose={() =>
              setSelectedVideoId(
                null,
              )
            }
            onNotesSaved={
              handleNotesSaved
            }
          />
        ) : (
          <EmptyReviewState />
        )}
      </div>
    </div>
  );
}
