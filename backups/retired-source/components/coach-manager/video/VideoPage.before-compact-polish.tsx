import { useMemo, useState } from "react";

import {
  Camera,
  Check,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  Clock3,
  Play,
  Search,
  Sparkles,
  Target,
  Upload,
  Users,
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
    <div className="relative h-[64px] w-[104px] shrink-0 overflow-hidden rounded-xl border border-border bg-gradient-to-br from-slate-800 via-slate-600 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_45%,rgba(249,115,22,0.45),transparent_30%)]" />

      <div className="absolute bottom-2 left-3 h-1.5 w-16 rounded-full bg-white/25" />

      <div className="absolute left-5 top-6 h-2 w-9 rotate-[-18deg] rounded-full bg-orange-400" />

      <div className="absolute left-12 top-4 h-4 w-4 rounded-full bg-orange-300" />

      <div className="absolute inset-0 grid place-items-center">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-white shadow-sm">
          <Play className="ml-0.5 h-3 w-3 fill-violet-600 text-violet-600" />
        </div>
      </div>

      <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[6px] font-semibold text-white">
        0:08
      </span>

      <span className="absolute left-1 top-1 rounded bg-black/60 px-1 py-0.5 text-[6px] text-white">
        {video.initials}
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
      active: "border-green-200 bg-green-50 text-green-700",
    },
    {
      id: "partly",
      label: "Partly",
      active: "border-orange-200 bg-orange-50 text-orange-700",
    },
    {
      id: "incorrect",
      label: "Incorrect",
      active: "border-red-200 bg-red-50 text-red-700",
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
            "rounded-lg border px-2 py-1.5 text-[7px] font-semibold transition",
            value === option.id
              ? option.active
              : "border-border bg-white text-muted-foreground hover:bg-muted/20",
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
    <section className="grid min-h-[620px] place-items-center rounded-2xl border border-border bg-white shadow-sm">
      <div className="max-w-sm text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-violet-50">
          <Video className="h-7 w-7 text-violet-600" />
        </div>

        <h3 className="mt-4 text-lg font-bold">
          Select a video to review
        </h3>

        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Choose an analyzed video from the list to inspect the technical
          score, AI findings and coach feedback.
        </p>

        <div className="mx-auto mt-5 w-fit space-y-2 text-left">
          {[
            "Review strengths and focus areas",
            "See technical score breakdown",
            "Provide feedback to evaluate the AI",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 text-[10px] text-muted-foreground"
            >
              <CircleCheck className="h-3.5 w-3.5 text-violet-600" />
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

  return (
    <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold">
              {video.title}
            </h2>

            <span className="rounded-full bg-violet-50 px-2 py-1 text-[7px] font-semibold text-violet-700">
              AI analyzed
            </span>

            <span className="rounded-full bg-orange-50 px-2 py-1 text-[7px] font-semibold text-orange-700">
              Needs review
            </span>
          </div>

          <p className="mt-1 text-[9px] text-muted-foreground">
            {video.athlete} · {video.date} · {video.context}
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

      <div className="relative mt-3 h-52 overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-700 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_40%,rgba(249,115,22,0.32),transparent_26%)]" />

        <div className="absolute left-[28%] top-[45%] h-3 w-28 -rotate-12 rounded-full bg-orange-400" />
        <div className="absolute left-[48%] top-[31%] h-10 w-10 rounded-full bg-orange-300" />

        <div className="absolute inset-0 grid place-items-center">
          <button
            type="button"
            className="grid h-14 w-14 place-items-center rounded-full bg-white/95 shadow-lg"
          >
            <Play className="ml-1 h-6 w-6 fill-violet-600 text-violet-600" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-black/45 px-3 py-2">
          <div className="flex items-center gap-2 text-white">
            <Play className="h-3 w-3 fill-white" />
            <span className="text-[7px]">0:00 / 0:08</span>

            <div className="h-1 flex-1 rounded-full bg-white/25">
              <div className="h-full w-[18%] rounded-full bg-violet-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-[0.9fr_1.1fr] gap-2">
        <section className="rounded-xl border border-violet-100 bg-violet-50/30 p-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[8px] font-semibold text-muted-foreground">
                Technical Score
              </p>

              <div className="mt-1 flex items-baseline gap-1">
                <p className="text-2xl font-bold text-violet-700">
                  {blockStartAnalysis.score}
                </p>

                <span className="text-[8px] text-muted-foreground">
                  /10
                </span>
              </div>
            </div>

            <span className="text-[7px] font-semibold text-green-600">
              ↑ 0.7 vs previous
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {blockStartAnalysis.breakdown.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-violet-100 bg-white p-2"
              >
                <p className="text-[7px] text-muted-foreground">
                  {item.label}
                </p>

                <p className="mt-1 text-sm font-bold">
                  {item.score}
                </p>

                <div className="mt-1 h-1 overflow-hidden rounded-full bg-violet-50">
                  <div
                    style={{ width: `${item.score * 10}%` }}
                    className="h-full rounded-full bg-violet-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border p-3">
          <h3 className="text-xs font-bold">
            Recording setup
          </h3>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-blue-50/50 p-2">
              <Camera className="h-3.5 w-3.5 text-blue-600" />

              <p className="mt-1 text-[7px] text-muted-foreground">
                Camera view
              </p>

              <p className="text-[9px] font-semibold">
                {video.cameraView}
              </p>
            </div>

            <div className="rounded-lg bg-green-50/50 p-2">
              <CircleCheck className="h-3.5 w-3.5 text-green-600" />

              <p className="mt-1 text-[7px] text-muted-foreground">
                Video quality
              </p>

              <p className="text-[9px] font-semibold">
                {video.videoQuality}
              </p>
            </div>
          </div>

          <p className="mt-2 text-[7px] leading-relaxed text-muted-foreground">
            Camera setup is shown as context only. Layer 2 can later use it
            when estimating analysis confidence.
          </p>
        </section>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <section className="rounded-xl border border-green-100 bg-green-50/20 p-3">
          <h3 className="text-xs font-bold text-green-700">
            Strengths
          </h3>

          <div className="mt-2 space-y-2">
            {blockStartAnalysis.strengths.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-green-100 bg-white p-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[8px] font-semibold">
                      {item.title}
                    </p>

                    <p className="mt-1 text-[7px] leading-relaxed text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>

                  <span className="rounded-full bg-green-50 px-2 py-1 text-[6px] font-semibold text-green-700">
                    {item.moment}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-orange-100 bg-orange-50/20 p-3">
          <h3 className="text-xs font-bold text-orange-700">
            Focus areas
          </h3>

          <div className="mt-2 space-y-2">
            {blockStartAnalysis.focusAreas.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-orange-100 bg-white p-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[8px] font-semibold">
                    {item.title}
                  </p>

                  <button
                    type="button"
                    className="rounded-full bg-violet-50 px-2 py-1 text-[6px] font-semibold text-violet-700"
                  >
                    View moment · {item.moment}
                  </button>
                </div>

                <p className="mt-1 text-[7px] leading-relaxed text-muted-foreground">
                  {item.detail}
                </p>

                <div className="mt-2 rounded-lg bg-slate-50 p-2">
                  <p className="text-[7px] font-semibold">
                    Why it may matter
                  </p>

                  <p className="mt-0.5 text-[7px] text-muted-foreground">
                    {item.why}
                  </p>
                </div>

                <div className="mt-1 rounded-lg bg-violet-50/50 p-2">
                  <p className="text-[7px] font-semibold text-violet-700">
                    How to work on it
                  </p>

                  <p className="mt-0.5 text-[7px] text-muted-foreground">
                    {item.how}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-2 rounded-xl border border-violet-100 p-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xs font-bold">
              Coach Review
            </h3>

            <p className="mt-1 text-[7px] text-muted-foreground">
              Does Athletic IQ's analysis match what you observe?
            </p>
          </div>

          <span className="rounded-full bg-violet-50 px-2 py-1 text-[7px] font-semibold text-violet-700">
            Help evaluate AI
          </span>
        </div>

        <div className="mt-3 space-y-2">
          {[
            "Early torso rise during steps 2–3",
            "First-step direction slightly inward",
            "Strong initial projection out of the blocks",
          ].map((finding) => (
            <div
              key={finding}
              className="grid grid-cols-[1fr_220px] items-center gap-3 rounded-lg border border-border/70 p-2"
            >
              <p className="text-[8px] font-medium">
                {finding}
              </p>

              <ReviewButtons
                value={reviews[finding]}
                onChange={(value) =>
                  setReviews((current) => ({
                    ...current,
                    [finding]: value,
                  }))
                }
              />
            </div>
          ))}
        </div>

        <textarea
          placeholder="Optional coach context — what did Athletic IQ miss or misunderstand?"
          className="mt-3 min-h-[64px] w-full resize-none rounded-xl border border-border bg-white p-2.5 text-[8px] outline-none"
        />

        <p className="mt-2 text-[7px] text-muted-foreground">
          Coach feedback is stored separately from athlete-reported data and
          can later be used to evaluate and improve Athletic IQ's analysis.
        </p>
      </section>

      <section className="mt-2 grid grid-cols-[0.75fr_1.25fr] gap-2">
        <div className="rounded-xl border border-border p-3">
          <p className="text-[8px] font-semibold">
            Progress vs previous comparable video
          </p>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-[7px] text-muted-foreground">
                May 4
              </p>

              <p className="text-lg font-bold text-violet-600">
                7.1
              </p>
            </div>

            <div className="rounded-xl bg-green-50 px-3 py-2 text-center">
              <p className="text-sm font-bold text-green-700">
                ↑ 0.7
              </p>

              <p className="text-[6px] text-green-700">
                score change
              </p>
            </div>

            <div className="text-right">
              <p className="text-[7px] text-muted-foreground">
                May 19
              </p>

              <p className="text-lg font-bold text-violet-600">
                7.8
              </p>
            </div>
          </div>

          <button
            type="button"
            className="mt-3 text-[7px] font-semibold text-violet-600"
          >
            View previous analysis →
          </button>
        </div>

        <div className="rounded-xl border border-violet-100 bg-violet-50/35 p-3">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />

            <div>
              <p className="text-[9px] font-bold text-violet-700">
                Athletic IQ Video Insight
              </p>

              <p className="mt-1 text-[8px] leading-relaxed text-muted-foreground">
                Initial projection appears improved compared with the
                previous comparable start. The main point worth reviewing
                remains the earlier torso rise through steps 2–3.
              </p>

              <p className="mt-1 text-[7px] text-muted-foreground">
                This interpretation should be reviewed together with the
                video evidence and coach feedback.
              </p>
            </div>
          </div>
        </div>
      </section>
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
            Review athlete videos, technical scores and AI findings.
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
            detail: "Selected period",
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
            label: "Most Common Focus",
            value: "Start Acceleration",
            detail: "Most frequent area for improvement",
            icon: Target,
            style: "bg-green-50 text-green-600",
          },
          {
            label: "Average Video Score",
            value: "7.1 /10",
            detail: "Across analyzed videos",
            icon: Sparkles,
            style: "bg-violet-50 text-violet-600",
          },
        ].map(({ label, value, detail, icon: Icon, style }) => (
          <article
            key={label}
            className="rounded-2xl border border-border bg-white p-3 shadow-sm"
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
                    "mt-1 font-bold tracking-tight",
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

      <div className="grid grid-cols-[0.95fr_1.05fr] gap-3">
        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="border-b border-border p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold">
                  Analyzed Videos
                </h2>

                <p className="mt-1 text-[8px] text-muted-foreground">
                  Videos that have completed Athletic IQ analysis.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />

                <input
                  placeholder="Search videos..."
                  className="w-32 bg-transparent text-[8px] outline-none"
                />
              </div>
            </div>

            <div className="mt-3 flex gap-1">
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

          <div>
            {filteredVideos.map((video) => {
              const delta =
                video.score - video.previousScore;

              return (
                <button
                  key={video.id}
                  type="button"
                  onClick={() =>
                    setSelectedVideoId(video.id)
                  }
                  className={[
                    "flex w-full items-center gap-3 border-b border-border/60 px-3 py-3 text-left transition last:border-b-0 hover:bg-muted/15",
                    selectedVideoId === video.id
                      ? "bg-violet-50/35"
                      : "",
                  ].join(" ")}
                >
                  <VideoThumbnail video={video} />

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold">
                      {video.title}
                    </p>

                    <p className="mt-1 text-[7px] text-muted-foreground">
                      {video.athlete} · {video.date} ·{" "}
                      {video.context}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-[6px] font-semibold text-green-700">
                        {video.discipline}
                      </span>

                      <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[6px] font-semibold text-violet-700">
                        {video.secondaryTag}
                      </span>
                    </div>
                  </div>

                  <div className="w-14">
                    <p className="text-[7px] text-muted-foreground">
                      Score
                    </p>

                    <p className="text-lg font-bold text-violet-700">
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

                  <div className="w-14">
                    <p className="text-[7px] text-muted-foreground">
                      Findings
                    </p>

                    <p className="text-base font-bold">
                      {video.findings}
                    </p>
                  </div>

                  <div className="w-[74px]">
                    <span className="rounded-full bg-violet-50 px-2 py-1 text-[6px] font-semibold text-violet-700">
                      AI analyzed
                    </span>

                    <div className="mt-1">
                      <span
                        className={[
                          "rounded-full px-2 py-1 text-[6px] font-semibold",
                          video.reviewStatus ===
                          "needs-review"
                            ? "bg-orange-50 text-orange-700"
                            : "bg-green-50 text-green-700",
                        ].join(" ")}
                      >
                        {video.reviewStatus ===
                        "needs-review"
                          ? "Needs review"
                          : "Coach reviewed"}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
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
