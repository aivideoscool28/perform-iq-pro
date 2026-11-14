import { useEffect, useMemo, useState } from "react";

import {
  getCoachVideoData,
  getCoachVideoUrl,
  type VideoAnalysisRow,
  type CoachVideoAthlete,
} from "./VideoData";

type VideoItem = {
  analysis: VideoAnalysisRow;
  athlete: CoachVideoAthlete | null;
  videoUrl: string | null;
};

export function VideoPage() {
  const [items, setItems] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const data = await getCoachVideoData();

        const athleteById = new Map(
          data.athletes.map((athlete) => [
            athlete.id,
            athlete,
          ]),
        );

        const loaded = await Promise.all(
          data.analyses.map(async (analysis) => {
            const videoUrl =
              await getCoachVideoUrl(
                analysis.storage_path,
              );

            return {
              analysis,
              athlete:
                athleteById.get(
                  analysis.user_id,
                ) ?? null,
              videoUrl,
            };
          }),
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

  const sharedCount = useMemo(
    () => items.length,
    [items],
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
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
    <div className="space-y-4">
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600">
          Video
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Shared Video Analyses
        </h1>

        <p className="mt-1 text-xs text-muted-foreground">
          {sharedCount} analysis
          {sharedCount === 1 ? "" : "es"} shared with you
        </p>
      </section>

      {items.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border bg-white p-8 text-center">
          <p className="text-sm font-bold">
            No shared videos yet
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Athlete video analyses will appear here after they share them with their coach.
          </p>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {items.map(
            ({
              analysis,
              athlete,
              videoUrl,
            }) => (
              <article
                key={analysis.id}
                className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
              >
                <div className="aspect-video bg-slate-950">
                  {videoUrl ? (
                    <video
                      src={videoUrl}
                      controls
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-xs text-white/70">
                      Video unavailable
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-bold">
                        {athlete?.display_name ??
                          "Unnamed athlete"}
                      </h2>

                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {analysis.discipline ??
                          "Training video"}
                      </p>
                    </div>

                    {analysis.overall_rating !==
                      null && (
                      <span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700">
                        {analysis.overall_rating.toFixed(
                          1,
                        )}
                        /10
                      </span>
                    )}
                  </div>

                  {analysis.detected_movement && (
                    <p className="mt-3 text-xs font-semibold">
                      {analysis.detected_movement}
                    </p>
                  )}

                  {analysis.overall_reasoning && (
                    <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                      {analysis.overall_reasoning}
                    </p>
                  )}

                  {analysis.overall_recommendation && (
                    <div className="mt-3 rounded-xl bg-orange-50 px-3 py-2">
                      <p className="text-[9px] font-bold text-orange-700">
                        Recommendation
                      </p>

                      <p className="mt-1 text-[10px] leading-relaxed text-orange-900">
                        {
                          analysis.overall_recommendation
                        }
                      </p>
                    </div>
                  )}
                </div>
              </article>
            ),
          )}
        </section>
      )}
    </div>
  );
}
