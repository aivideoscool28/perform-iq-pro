import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/athleticiq/AppShell";
import { AnalysisBoard } from "@/components/athleticiq/AnalysisBoard";
import { fetchDashboard } from "@/lib/features/dashboard.functions";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Flame, Clock } from "lucide-react";

export const Route = createFileRoute("/workout-analysis")({
  head: () => ({
    meta: [
      { title: "Workout Analysis — Athleticiq" },
      { name: "description", content: "KI-generierte Analyse jeder Trainingssession." },
    ],
  }),
  component: WorkoutAnalysisPage,
});

function WorkoutAnalysisPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const fetchFn = useServerFn(fetchDashboard);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchFn(),
    enabled: !!session,
  });

  const sessions = useMemo(() => {
    const boards = data?.boards ?? [];
    const workouts = data?.workouts ?? [];
    return boards
      .map((b) => ({ board: b, workout: workouts.find((w) => w.id === b.workout_id) }))
      .filter((s) => !!s.workout);
  }, [data]);

  const current = sessions[idx];

  if (loading || !session || isLoading) {
    return (
      <AppShell title="Workout Analysis">
        <div className="grid place-items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Workout Analysis" subtitle="KI-Analyse deiner Sessions">
      {sessions.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground shadow-sm">
          Noch keine Analyse vorhanden. Mach einen Daily Check-in mit Training — die KI erstellt
          automatisch dein erstes Analyse-Board.
        </div>
      ) : (
        <>
          {/* Header + nav */}
          <section className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIdx((i) => Math.min(sessions.length - 1, i + 1))}
                disabled={idx >= sessions.length - 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Vorherige
              </Button>
              <span className="text-xs text-muted-foreground">
                {idx + 1} / {sessions.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIdx((i) => Math.max(0, i - 1))}
                disabled={idx === 0}
              >
                Nächste <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {current && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm mb-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-bold tracking-tight mr-auto">
                    {current.workout?.summary ?? "Session"} —{" "}
                    {new Date(current.workout?.workout_date ?? current.board.created_at).toLocaleDateString("de", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </h2>
                  {current.workout?.intensity && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-neon-amber/15 text-neon-amber">
                      <Flame className="h-3 w-3" /> {current.workout.intensity.toUpperCase()}
                    </span>
                  )}
                  {current.workout?.duration_minutes && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-elevated text-foreground">
                      <Clock className="h-3 w-3" /> {current.workout.duration_minutes} min
                    </span>
                  )}
                </div>
              </div>
            )}

            {current && (
              <AnalysisBoard
                board={current.board as never}
                workout={current.workout as never}
              />
            )}
          </section>

          {/* All sessions list */}
          <section className="mt-10">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Alle Sessions
            </h3>
            <div className="rounded-2xl border border-border bg-card divide-y divide-border max-h-[420px] overflow-y-auto">
              {sessions.map((s, i) => {
                const positives = (s.board.positives as unknown as string[] | null) ?? [];
                const summary = positives[0] ?? s.workout?.summary ?? "Session";
                return (
                  <button
                    key={s.board.id}
                    onClick={() => setIdx(i)}
                    className={`w-full text-left px-4 py-3 hover:bg-white/[0.03] transition flex items-center gap-3 ${
                      i === idx ? "bg-white/[0.04]" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {s.workout?.summary ?? "Session"} ·{" "}
                        <span className="text-muted-foreground font-normal">
                          {new Date(s.workout?.workout_date ?? s.board.created_at).toLocaleDateString("de", {
                            day: "2-digit", month: "short",
                          })}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">{summary}</div>
                    </div>
                    {s.workout?.intensity && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-elevated text-muted-foreground shrink-0">
                        {s.workout.intensity}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}
