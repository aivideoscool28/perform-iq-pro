import { useEffect, useMemo, useState } from "react";

import {
  ChevronRight,
  CircleCheck,
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
  type VideoAnalysisRow,
  type CoachVideoAthlete,
} from "./VideoData";

type ReviewValue =
  | "accurate"
  | "partly"
  | "incorrect";

type VideoItem = {
  analysis: VideoAnalysisRow;
  athlete: CoachVideoAthlete | null;
  videoUrl: string | null;
};

type BreakdownItem = {
  label: string;
  value: string;
};

type FindingItem = {
  joint?: string;
  val?: number;
  unit?: string;
  ideal?: string;
  status?: string;
  reasoning?: string;
  recommendation?: string;
};

function asArray(
  value: unknown,
): unknown[] {
  return Array.isArray(value)
    ? value
    : [];
}

function getBreakdown(
  value: unknown,
): BreakdownItem[] {
  return asArray(value)
    .map((item) => {
      if (
        !item ||
        typeof item !== "object"
      ) {
        return null;
      }

      const row =
        item as Record<string, unknown>;

      return {
        label:
          typeof row.label === "string"
            ? row.label
            : "Metric",

        value:
          typeof row.value === "string"
            ? row.value
            : String(row.value ?? "—"),
      };
    })
    .filter(
      (
        item,
      ): item is BreakdownItem =>
        item !== null,
    );
}

function getFindings(
  value: unknown,
): FindingItem[] {
  return asArray(value)
    .map((item) => {
      if (
        !item ||
        typeof item !== "object"
      ) {
        return null;
      }

      return item as FindingItem;
    })
    .filter(
      (
        item,
      ): item is FindingItem =>
        item !== null,
    );
}

function initials(
  name: string | null | undefined,
) {
  if (!name) {
    return "A";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase(),
    )
    .join("");
}

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

function ReviewButtons({
  value,
  onChange,
}: {
  value?: ReviewValue;
  onChange:
    (value: ReviewValue) => void;
}) {
  const options: Array<{
    id: ReviewValue;
    label: string;
    active: string;
  }> = [
    {
      id: "accurate",
      label: "Accurate",
      active:
        "border-green-200 bg-green-50 text-green-700",
    },
    {
      id: "partly",
      label: "Partly",
      active:
        "border-orange-200 bg-orange-50 text-orange-700",
    },
    {
      id: "incorrect",
      label: "Incorrect",
      active:
        "border-red-200 bg-red-50 text-red-700",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-1">
      {options.map(
        (option) => (
          <button
            key={option.id}
            type="button"
            onClick={() =>
              onChange(option.id)
            }
            className={[
              "rounded-lg border px-2 py-1.5 text-[12px] font-semibold transition",
              value === option.id
                ? option.active
                : "border-border bg-white text-muted-foreground hover:bg-muted/20",
            ].join(" ")}
          >
            {option.label}
          </button>
        ),
      )}
    </div>
  );
}

function EmptyReviewState() {
  return (
    <section className="grid min-h-[620px] place-items-center rounded-2xl border border-border bg-white shadow-sm">
      <div className="max-w-sm text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-violet-50">
          <Video className="h-7 w-7 text-violet-600" />
        </div>

        <h3 className="mt-4 text-lg font-bold">
          Select a video to review
        </h3>

        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Choose a shared athlete video to inspect its AI analysis and coach evidence.
        </p>
      </div>
    </section>
  );
}

function SelectedVideoPanel({
  item,
  onClose,
}: {
  item: VideoItem;
  onClose: () => void;
}) {
  const [reviews, setReviews] =
    useState<
      Record<string, ReviewValue>
    >({});

  const analysis =
    item.analysis;

  const findings =
    getFindings(
      analysis.findings,
    );

  const breakdown =
    getBreakdown(
      analysis.score_breakdown,
    );

  const athleteName =
    item.athlete?.display_name ??
    "Unnamed athlete";

  return (
    <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold">
              {analysis.detected_movement ??
                "Video Analysis"}
            </h2>

            <span className="rounded-full bg-violet-50 px-2 py-1 text-[12px] font-semibold text-violet-700">
              AI analyzed
            </span>

            <span className="rounded-full bg-orange-50 px-2 py-1 text-[12px] font-semibold text-orange-700">
              Shared by athlete
            </span>
          </div>

          <p className="mt-1 text-[13px] text-muted-foreground">
            {athleteName}
            {" · "}
            {formatDate(
              analysis.created_at,
            )}
            {" · "}
            {analysis.discipline ??
              "Training"}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl bg-slate-950">
        {item.videoUrl ? (
          <video
            src={item.videoUrl}
            controls
            className="aspect-video w-full object-contain"
          />
        ) : (
          <div className="grid aspect-video place-items-center">
            <div className="text-center text-white/70">
              <Play className="mx-auto h-8 w-8" />

              <p className="mt-2 text-xs">
                Video unavailable
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-[0.9fr_1.1fr] gap-2">
        <section className="rounded-xl border border-violet-100 bg-violet-50/30 p-3">
          <p className="text-[12px] font-semibold text-muted-foreground">
            Technical Score
          </p>

          <div className="mt-1 flex items-baseline gap-1">
            <p className="text-2xl font-bold text-violet-700">
              {analysis.overall_rating !==
              null
                ? analysis.overall_rating.toFixed(
                    1,
                  )
                : "—"}
            </p>

            <span className="text-[12px] text-muted-foreground">
              /10
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {breakdown.length >
            0 ? (
              breakdown.map(
                (entry) => (
                  <div
                    key={
                      entry.label
                    }
                    className="rounded-lg border border-violet-100 bg-white p-2"
                  >
                    <p className="text-[12px] text-muted-foreground">
                      {
                        entry.label
                      }
                    </p>

                    <p className="mt-1 text-sm font-bold">
                      {
                        entry.value
                      }
                    </p>
                  </div>
                ),
              )
            ) : (
              <p className="col-span-2 text-[12px] text-muted-foreground">
                No score breakdown available.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-border p-3">
          <h3 className="text-xs font-bold">
            Aether Analysis
          </h3>

          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
            {analysis.overall_reasoning ??
              "No overall reasoning available."}
          </p>

          {analysis.overall_recommendation && (
            <div className="mt-3 rounded-lg bg-orange-50 p-2">
              <p className="text-[12px] font-bold text-orange-700">
                Recommendation
              </p>

              <p className="mt-1 text-[12px] leading-relaxed text-orange-900">
                {
                  analysis.overall_recommendation
                }
              </p>
            </div>
          )}
        </section>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <section className="rounded-xl border border-green-100 bg-green-50/20 p-3">
          <h3 className="text-xs font-bold text-green-700">
            Strong Findings
          </h3>

          <div className="mt-2 space-y-2">
            {findings
              .filter(
                (finding) =>
                  finding.status ===
                  "ok",
              )
              .map(
                (
                  finding,
                  index,
                ) => (
                  <div
                    key={`${finding.joint}-${index}`}
                    className="rounded-lg border border-green-100 bg-white p-2"
                  >
                    <p className="text-[12px] font-semibold">
                      {finding.joint ??
                        "Finding"}
                    </p>

                    <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                      {finding.reasoning ??
                        "No explanation available."}
                    </p>
                  </div>
                ),
              )}

            {findings.filter(
              (finding) =>
                finding.status ===
                "ok",
            ).length === 0 && (
              <p className="text-[12px] text-muted-foreground">
                No positive finding was separately classified.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-orange-100 bg-orange-50/20 p-3">
          <h3 className="text-xs font-bold text-orange-700">
            Focus Areas
          </h3>

          <div className="mt-2 space-y-2">
            {findings
              .filter(
                (finding) =>
                  finding.status ===
                  "warn",
              )
              .map(
                (
                  finding,
                  index,
                ) => (
                  <div
                    key={`${finding.joint}-${index}`}
                    className="rounded-lg border border-orange-100 bg-white p-2"
                  >
                    <p className="text-[12px] font-semibold">
                      {finding.joint ??
                        "Finding"}
                    </p>

                    <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                      {finding.reasoning ??
                        "No explanation available."}
                    </p>

                    {finding.recommendation && (
                      <div className="mt-2 rounded-lg bg-violet-50/50 p-2">
                        <p className="text-[12px] font-semibold text-violet-700">
                          How to work on it
                        </p>

                        <p className="mt-0.5 text-[12px] text-muted-foreground">
                          {
                            finding.recommendation
                          }
                        </p>
                      </div>
                    )}
                  </div>
                ),
              )}

            {findings.filter(
              (finding) =>
                finding.status ===
                "warn",
            ).length === 0 && (
              <p className="text-[12px] text-muted-foreground">
                No focus area was separately classified.
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="mt-2 rounded-xl border border-violet-100 p-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xs font-bold">
              Coach Review
            </h3>

            <p className="mt-1 text-[12px] text-muted-foreground">
              Does Aether Athlete IQ's analysis match what you observe?
            </p>
          </div>

          <span className="rounded-full bg-violet-50 px-2 py-1 text-[12px] font-semibold text-violet-700">
            Help evaluate AI
          </span>
        </div>

        <div className="mt-3 space-y-2">
          {findings.map(
            (
              finding,
              index,
            ) => {
              const key =
                `${finding.joint ?? "Finding"}-${index}`;

              return (
                <div
                  key={key}
                  className="grid grid-cols-[1fr_220px] items-center gap-3 rounded-lg border border-border/70 p-2"
                >
                  <p className="text-[12px] font-medium">
                    {finding.joint ??
                      "Technical finding"}
                  </p>

                  <ReviewButtons
                    value={
                      reviews[key]
                    }
                    onChange={(
                      value,
                    ) =>
                      setReviews(
                        (
                          current,
                        ) => ({
                          ...current,
                          [key]:
                            value,
                        }),
                      )
                    }
                  />
                </div>
              );
            },
          )}
        </div>

        {findings.length ===
          0 && (
          <p className="mt-3 text-[12px] text-muted-foreground">
            No individual AI findings available for review.
          </p>
        )}

        <textarea
          placeholder="Optional coach context — what did Aether Athlete IQ miss or misunderstand?"
          className="mt-3 min-h-[64px] w-full resize-none rounded-xl border border-border bg-white p-2.5 text-[12px] outline-none"
        />

        <p className="mt-2 text-[12px] text-muted-foreground">
          Coach feedback does not overwrite the athlete's original analysis.
        </p>
      </section>
    </section>
  );
}

export function VideoPage() {
  const [items, setItems] =
    useState<VideoItem[]>(
      [],
    );

  const [
    selectedVideoId,
    setSelectedVideoId,
  ] =
    useState<string | null>(
      null,
    );

  const [filter, setFilter] =
    useState<
      "all" | "needs-review"
    >("all");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getCoachVideoData();

        const athleteById =
          new Map(
            data.athletes.map(
              (athlete) => [
                athlete.id,
                athlete,
              ],
            ),
          );

        const loaded =
          await Promise.all(
            data.analyses.map(
              async (
                analysis,
              ) => ({
                analysis,

                athlete:
                  athleteById.get(
                    analysis.user_id,
                  ) ?? null,

                videoUrl:
                  await getCoachVideoUrl(
                    analysis.storage_path,
                  ),
              }),
            ),
          );

        if (!cancelled) {
          setItems(loaded);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load shared videos.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedVideo =
    useMemo(
      () =>
        items.find(
          (item) =>
            item.analysis.id ===
            selectedVideoId,
        ) ?? null,
      [
        items,
        selectedVideoId,
      ],
    );

  const filteredVideos =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return items.filter(
        (item) => {
          const name =
            item.athlete
              ?.display_name ??
            "";

          const movement =
            item.analysis
              .detected_movement ??
            "";

          const discipline =
            item.analysis
              .discipline ??
            "";

          return (
            !query ||
            name
              .toLowerCase()
              .includes(query) ||
            movement
              .toLowerCase()
              .includes(query) ||
            discipline
              .toLowerCase()
              .includes(query)
          );
        },
      );
    }, [
      items,
      search,
      filter,
    ]);

  const averageScore =
    items.length > 0
      ? items.reduce(
          (
            total,
            item,
          ) =>
            total +
            (item.analysis
              .overall_rating ??
              0),
          0,
        ) / items.length
      : 0;

  const totalFindings =
    items.reduce(
      (
        total,
        item,
      ) =>
        total +
        getFindings(
          item.analysis
            .findings,
        ).length,
      0,
    );

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold">
          Loading shared athlete videos…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
        <p className="text-sm font-bold text-red-700">
          Could not load videos
        </p>

        <p className="mt-1 text-xs text-red-600">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600">
          Video
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Video Analysis
        </h1>

        <p className="mt-1 text-xs text-muted-foreground">
          Review video analyses athletes shared with you.
        </p>
      </section>

      <section className="grid grid-cols-4 gap-2">
        {[
          {
            label:
              "Shared Videos",
            value:
              String(
                items.length,
              ),
            detail:
              "Available for coach review",
            icon: Video,
          },
          {
            label:
              "Awaiting Review",
            value:
              String(
                items.length,
              ),
            detail:
              "Shared athlete analyses",
            icon: Clock3,
          },
          {
            label:
              "AI Findings",
            value:
              String(
                totalFindings,
              ),
            detail:
              "Across shared videos",
            icon: Target,
          },
          {
            label:
              "Average Score",
            value:
              items.length
                ? `${averageScore.toFixed(1)} /10`
                : "—",
            detail:
              "Across shared analyses",
            icon: Sparkles,
          },
        ].map(
          ({
            label,
            value,
            detail,
            icon: Icon,
          }) => (
            <article
              key={label}
              className="rounded-2xl border border-border bg-white p-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-50 text-violet-600">
                  <Icon className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-[12px] font-semibold text-muted-foreground">
                    {label}
                  </p>

                  <p className="mt-1 text-xl font-bold tracking-tight">
                    {value}
                  </p>

                  <p className="text-[12px] text-muted-foreground">
                    {detail}
                  </p>
                </div>
              </div>
            </article>
          ),
        )}
      </section>

      <div className="grid grid-cols-[0.95fr_1.05fr] gap-3">
        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="border-b border-border p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold">
                  Shared Videos
                </h2>

                <p className="mt-1 text-[12px] text-muted-foreground">
                  Athlete videos shared with this coach.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search videos..."
                  className="w-32 bg-transparent text-[12px] outline-none"
                />
              </div>
            </div>
          </div>

          {filteredVideos.length ===
          0 ? (
            <div className="p-8 text-center">
              <Video className="mx-auto h-6 w-6 text-violet-500" />

              <p className="mt-3 text-sm font-bold">
                No shared videos
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Shared athlete analyses will appear here.
              </p>
            </div>
          ) : (
            filteredVideos.map(
              (item) => {
                const analysis =
                  item.analysis;

                const athlete =
                  item.athlete
                    ?.display_name ??
                  "Unnamed athlete";

                return (
                  <button
                    key={
                      analysis.id
                    }
                    type="button"
                    onClick={() =>
                      setSelectedVideoId(
                        analysis.id,
                      )
                    }
                    className={[
                      "flex w-full items-center gap-3 border-b border-border/60 px-3 py-3 text-left transition last:border-b-0 hover:bg-muted/15",
                      selectedVideoId ===
                      analysis.id
                        ? "bg-violet-50/35"
                        : "",
                    ].join(" ")}
                  >
                    <div className="relative grid h-[64px] w-[104px] shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-900">
                      <Play className="h-5 w-5 fill-white text-white" />

                      <span className="absolute left-1 top-1 rounded bg-black/60 px-1 py-0.5 text-[11px] text-white">
                        {initials(
                          athlete,
                        )}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-bold">
                        {analysis.detected_movement ??
                          "Video Analysis"}
                      </p>

                      <p className="mt-1 text-[12px] text-muted-foreground">
                        {athlete}
                        {" · "}
                        {formatDate(
                          analysis.created_at,
                        )}
                      </p>

                      <div className="mt-2 flex gap-1">
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                          {analysis.discipline ??
                            "Training"}
                        </span>

                        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                          Shared
                        </span>
                      </div>
                    </div>

                    <div className="w-14">
                      <p className="text-[12px] text-muted-foreground">
                        Score
                      </p>

                      <p className="text-lg font-bold text-violet-700">
                        {analysis.overall_rating !==
                        null
                          ? analysis.overall_rating.toFixed(
                              1,
                            )
                          : "—"}
                      </p>
                    </div>

                    <div className="w-14">
                      <p className="text-[12px] text-muted-foreground">
                        Findings
                      </p>

                      <p className="text-base font-bold">
                        {
                          getFindings(
                            analysis.findings,
                          ).length
                        }
                      </p>
                    </div>

                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                );
              },
            )
          )}
        </section>

        {selectedVideo ? (
          <SelectedVideoPanel
            item={
              selectedVideo
            }
            onClose={() =>
              setSelectedVideoId(
                null,
              )
            }
          />
        ) : (
          <EmptyReviewState />
        )}
      </div>
    </div>
  );
}

