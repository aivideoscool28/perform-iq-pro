import { useMemo, useState } from "react";

import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  Play,
  Search,
  Sparkles,
  Target,
  Upload,
  Video,
  X,
} from "lucide-react";

import {
  blockStartAnalysis,
  coachVideos,
  type CoachVideo,
} from "@/components/coach-manager/video/video.data";

type ReviewValue = "accurate" | "partly" | "incorrect";

function VideoThumbnail({
  video,
}: {
  video: CoachVideo;
}) {
  return (
    <div className="relative h-14 w-[92px] shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-slate-800 via-slate-600 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_40%,rgba(249,115,22,0.45),transparent_30%)]" />

      <div className="absolute left-6 top-6 h-2 w-10 -rotate-12 rounded-full bg-orange-400" />

      <div className="absolute inset-0 grid place-items-center">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-white shadow-sm">
          <Play className="ml-0.5 h-3 w-3 fill-violet-600 text-violet-600" />
        </div>
      </div>

      <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[6px] font-semibold text-white">
        0:08
      </span>
    </div>
  );
}

function ReviewButtons({
  value,
  onChange,
}: {
  value?: ReviewValue;
  onChange: (value: ReviewValue) => void;
}) {
  const options: {
    id: ReviewValue;
    label: string;
    active: string;
  }[] = [
    {
      id: "accurate",
      label: "Accurate",
      active: "border-green-300 bg-green-100 text-green-700 ring-1 ring-green-200",
    },
    {
      id: "partly",
      label: "Partly",
      active: "border-orange-300 bg-orange-100 text-orange-700 ring-1 ring-orange-200",
    },
    {
      id: "incorrect",
      label: "Incorrect",
      active: "border-red-300 bg-red-100 text-red-700 ring-1 ring-red-200",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={[
            "rounded-md border px-1.5 py-1 text-[6px] font-semibold transition",
            value === option.id
              ? option.active
              : option.id === "accurate"
                ? "border-green-100 bg-green-50/50 text-green-700"
                : option.id === "partly"
                  ? "border-orange-100 bg-orange-50/50 text-orange-700"
                  : "border-red-100 bg-red-50/50 text-red-700",
          ].join(" ")}
        >
          {option.label}
        </button>
      ))}
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
          Choose a video from the list to see its AI analysis,
          technical score and coach feedback.
        </p>

        <div className="mx-auto mt-4 w-fit space-y-2 text-left">
          {[
            "View AI findings and key moments",
            "See technical score breakdown",
            "Provide feedback to improve AI",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 text-[9px] text-muted-foreground"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-violet-600" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SelectedVideoPanel({
  video,
  onClose,
}: {
  video: CoachVideo;
  onClose: () => void;
}) {
  const [reviews, setReviews] = useState<
    Record<string, ReviewValue>
  >({});

  const findings = [
    {
      title: "Early torso rise during steps 2–3",
      moment: "00:02–00:03",
    },
    {
      title: "First-step direction slightly inward",
      moment: "00:01–00:02",
    },
    {
      title: "Strong initial projection out of the blocks",
      moment: "00:01",
    },
  ];

  return (
    <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold">
              {video.title}
            </h2>

            <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[6px] font-semibold text-violet-700">
              AI analyzed
            </span>

            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[6px] font-semibold text-orange-700">
              Needs review
            </span>
          </div>

          <p className="mt-1 text-[8px] text-muted-foreground">
            {video.athlete} · {video.date} · {video.context}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted/30"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="relative mt-3 h-40 overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-700 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_64%_40%,rgba(249,115,22,0.32),transparent_27%)]" />

        <div className="absolute left-[30%] top-[46%] h-3 w-24 -rotate-12 rounded-full bg-orange-400" />

        <div className="absolute inset-0 grid place-items-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-lg">
            <Play className="ml-1 h-5 w-5 fill-violet-600 text-violet-600" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-black/45 px-3 py-2">
          <div className="flex items-center gap-2 text-white">
            <Play className="h-3 w-3 fill-white" />

            <span className="text-[6px]">
              0:00 / 0:08
            </span>

            <div className="h-1 flex-1 rounded-full bg-white/25">
              <div className="h-full w-[18%] rounded-full bg-violet-500" />
            </div>
          </div>
        </div>
      </div>

      <section className="mt-2 rounded-xl border border-violet-100 bg-violet-50/25 px-3 py-2.5">
        <div className="grid grid-cols-[120px_repeat(4,1fr)] items-center gap-3">
          <div>
            <p className="text-[7px] font-semibold text-muted-foreground">
              Technical Score
            </p>

            <div className="mt-1 flex items-baseline gap-1">
              <p className="text-xl font-bold text-violet-700">
                7.8
              </p>

              <span className="text-[7px] text-muted-foreground">
                /10
              </span>
            </div>

            <p className="text-[6px] font-semibold text-green-600">
              ↑ 0.7 vs previous
            </p>
          </div>

          {blockStartAnalysis.breakdown.map((item) => (
            <div key={item.label}>
              <p className="text-[6px] text-muted-foreground">
                {item.label}
              </p>

              <p className="mt-1 text-[11px] font-bold">
                {item.score}
              </p>

              <div className="mt-1 h-1 overflow-hidden rounded-full bg-violet-100">
                <div
                  style={{ width: `${item.score * 10}%` }}
                  className="h-full rounded-full bg-violet-500"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <section className="rounded-xl border border-border p-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold">
              AI Findings
            </h3>

            <span className="text-[6px] text-muted-foreground">
              3 key findings
            </span>
          </div>

          <div className="mt-2 space-y-1.5">
            {findings.map((finding, index) => (
              <div
                key={finding.title}
                className={[
                  "flex items-center gap-2 rounded-lg border px-2 py-2",
                  index === 2
                    ? "border-green-100 bg-green-50/30"
                    : "border-border/70",
                ].join(" ")}
              >
                <div
                  className={[
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full",
                    index === 2
                      ? "bg-green-50"
                      : "bg-violet-50",
                  ].join(" ")}
                >
                  {index === 2 ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : (
                    <Target className="h-3 w-3 text-violet-600" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[7px] font-semibold leading-tight">
                    {finding.title}
                  </p>

                  <p
                    className={[
                      "mt-0.5 text-[6px] font-medium",
                      index === 2
                        ? "text-green-600"
                        : "text-orange-600",
                    ].join(" ")}
                  >
                    {index === 2 ? "Strength" : "Focus area"}
                  </p>
                </div>

                <button
                  type="button"
                  className="shrink-0 rounded-md bg-violet-50 px-2 py-1 text-[6px] font-semibold text-violet-700"
                >
                  View moment
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-2 text-[7px] font-semibold text-violet-600"
          >
            View full analysis →
          </button>
        </section>

        <section className="rounded-xl border border-violet-100 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-bold">
                Coach Review
              </h3>

              <p className="mt-0.5 text-[6px] text-muted-foreground">
                Does Athletic IQ match what you observe?
              </p>
            </div>

            <span className="rounded-full bg-violet-50 px-2 py-1 text-[6px] font-semibold text-violet-700">
              Help evaluate AI
            </span>
          </div>

          <div className="mt-2 space-y-1.5">
            {findings.map((finding) => (
              <div
                key={finding.title}
                className="rounded-lg border border-border/70 p-2"
              >
                <p className="mb-1.5 text-[7px] font-medium">
                  {finding.title}
                </p>

                <ReviewButtons
                  value={reviews[finding.title]}
                  onChange={(value) =>
                    setReviews((current) => ({
                      ...current,
                      [finding.title]: value,
                    }))
                  }
                />
              </div>
            ))}
          </div>

          <input
            placeholder="Add context or notes..."
            className="mt-2 w-full rounded-lg border border-border px-2 py-1.5 text-[7px] outline-none"
          />
        </section>
      </div>

      <div className="mt-2 grid grid-cols-[0.78fr_1.22fr] gap-2">
        <section className="rounded-xl border border-border p-2.5">
          <p className="text-[8px] font-bold">
            Progress
          </p>

          <p className="mt-0.5 text-[6px] text-muted-foreground">
            Previous comparable video
          </p>

          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-[6px] text-muted-foreground">
                May 4
              </p>

              <p className="text-base font-bold text-violet-600">
                7.1
              </p>
            </div>

            <div className="rounded-lg bg-green-50 px-2.5 py-1.5 text-center">
              <p className="text-[11px] font-bold text-green-700">
                ↑ 0.7
              </p>

              <p className="text-[5px] text-green-700">
                improvement
              </p>
            </div>

            <div className="text-right">
              <p className="text-[6px] text-muted-foreground">
                May 19
              </p>

              <p className="text-base font-bold text-violet-600">
                7.8
              </p>
            </div>
          </div>

          <button
            type="button"
            className="mt-2 text-[6px] font-semibold text-violet-600"
          >
            View previous analysis →
          </button>
        </section>

        <section className="rounded-xl border border-violet-100 bg-violet-50/35 p-2.5">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />

            <div>
              <p className="text-[8px] font-bold text-violet-700">
                Athletic IQ Video Insight
              </p>

              <p className="mt-1 text-[7px] leading-relaxed text-muted-foreground">
                Initial projection appears improved compared with the
                previous comparable start. The main point worth reviewing
                remains the earlier torso rise through steps 2–3.
              </p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

export function VideoPage() {
  const [selectedVideoId, setSelectedVideoId] =
    useState<string | null>(null);

  const [filter, setFilter] =
    useState<"all" | "needs-review" | "reviewed">("all");

  const selectedVideo = useMemo(
    () =>
      coachVideos.find(
        (video) => video.id === selectedVideoId,
      ) ?? null,
    [selectedVideoId],
  );

  const filteredVideos = useMemo(() => {
    if (filter === "all") {
      return coachVideos;
    }

    return coachVideos.filter(
      (video) =>
        video.reviewStatus ===
        (filter === "reviewed"
          ? "reviewed"
          : "needs-review"),
    );
  }, [filter]);

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
            Review athlete videos, technical scores and AI insights.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl border border-border bg-white px-3 py-2 text-[9px] font-semibold"
          >
            Sprint / Hurdles U20 ▾
          </button>

          <button
            type="button"
            className="rounded-xl border border-border bg-white px-3 py-2 text-[9px] font-semibold"
          >
            Last 4 weeks ▾
          </button>

          <button
            type="button"
            className="rounded-xl border border-border bg-white px-3 py-2 text-[9px] font-semibold"
          >
            Filters
          </button>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-[9px] font-semibold text-white"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload & Analyze
          </button>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-2">
        {[
          {
            label: "Analyzed Videos",
            value: "24",
            detail: "In selected period",
            icon: Video,
            style: "bg-violet-50 text-violet-600",
          },
          {
            label: "Awaiting Coach Review",
            value: "6",
            detail: "Videos need your feedback",
            icon: Clock3,
            style: "bg-orange-50 text-orange-600",
          },
          {
            label: "Most Common Focus Area",
            value: "Start Acceleration",
            detail: "Most frequent area for improvement",
            icon: Target,
            style: "bg-green-50 text-green-600",
          },
          {
            label: "Average Video Score",
            value: "7.1 /10",
            detail: "Across all analyzed videos",
            icon: Sparkles,
            style: "bg-violet-50 text-violet-600",
          },
        ].map(({ label, value, detail, icon: Icon, style }) => (
          <article
            key={label}
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
                  {label}
                </p>

                <p
                  className={[
                    "mt-0.5 font-bold tracking-tight",
                    value.length > 10
                      ? "text-sm"
                      : "text-xl",
                  ].join(" ")}
                >
                  {value}
                </p>

                <p className="mt-0.5 text-[7px] text-muted-foreground">
                  {detail}
                </p>
              </div>
            </div>
          </article>
        ))}
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
                  Videos analyzed by Athletic IQ.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-border px-2.5 py-1.5">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />

                <input
                  placeholder="Search videos..."
                  className="w-28 bg-transparent text-[8px] outline-none"
                />
              </div>
            </div>

            <div className="mt-2 flex gap-1">
              {[
                ["all", "All"],
                ["needs-review", "Needs review"],
                ["reviewed", "Coach reviewed"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    setFilter(
                      id as
                        | "all"
                        | "needs-review"
                        | "reviewed",
                    )
                  }
                  className={[
                    "rounded-lg border px-2.5 py-1 text-[7px] font-semibold",
                    filter === id
                      ? "border-violet-200 bg-violet-50 text-violet-700"
                      : "border-border text-muted-foreground",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filteredVideos.map((video) => {
            const delta =
              video.score - video.previousScore;

            return (
              <button
                key={video.id}
                type="button"
                onClick={() => setSelectedVideoId(video.id)}
                className={[
                  "grid w-full grid-cols-[92px_1fr_52px_45px_72px_14px] items-center gap-3 border-b border-border/60 px-3 py-2.5 text-left transition last:border-b-0 hover:bg-muted/15",
                  selectedVideoId === video.id
                    ? "bg-violet-50/35"
                    : "",
                ].join(" ")}
              >
                <VideoThumbnail video={video} />

                <div className="min-w-0">
                  <p className="text-[9px] font-bold">
                    {video.title}
                  </p>

                  <p className="mt-0.5 text-[6px] text-muted-foreground">
                    {video.athlete} · {video.date} · {video.context}
                  </p>

                  <div className="mt-1 flex gap-1">
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[6px] font-semibold text-green-700">
                      {video.discipline}
                    </span>

                    <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[6px] font-semibold text-violet-700">
                      {video.secondaryTag}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[6px] text-muted-foreground">
                    Score
                  </p>

                  <p className="text-base font-bold text-violet-700">
                    {video.score}
                  </p>

                  <p
                    className={[
                      "text-[6px] font-semibold",
                      delta >= 0
                        ? "text-green-600"
                        : "text-red-500",
                    ].join(" ")}
                  >
                    {delta >= 0 ? "↑" : "↓"}{" "}
                    {Math.abs(delta).toFixed(1)}
                  </p>
                </div>

                <div>
                  <p className="text-[6px] text-muted-foreground">
                    Findings
                  </p>

                  <p className="text-base font-bold">
                    {video.findings}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="block w-fit rounded-full bg-violet-50 px-2 py-1 text-[6px] font-semibold text-violet-700">
                    AI analyzed
                  </span>

                  <span
                    className={[
                      "block w-fit rounded-full px-2 py-1 text-[6px] font-semibold",
                      video.reviewStatus === "needs-review"
                        ? "bg-orange-50 text-orange-700"
                        : "bg-green-50 text-green-700",
                    ].join(" ")}
                  >
                    {video.reviewStatus === "needs-review"
                      ? "Needs review"
                      : "Coach reviewed"}
                  </span>
                </div>

                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            );
          })}
        </section>

        {selectedVideo ? (
          <SelectedVideoPanel
            video={selectedVideo}
            onClose={() => setSelectedVideoId(null)}
          />
        ) : (
          <EmptyReviewState />
        )}
      </div>
    </div>
  );
}

