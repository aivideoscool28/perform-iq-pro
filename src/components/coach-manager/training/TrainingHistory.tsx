import {
  Copy,
  History,
} from "lucide-react";

import {
  useCoachTrainingHistory,
} from "@/hooks/coach-manager/useCoachTrainingHistory";

export function TrainingHistory({
  onReuse,
}: {
  onReuse: (
    sessionId: string,
  ) => void;
}) {
  const {
    sessions,
    loading,
    error,
  } =
    useCoachTrainingHistory();

  return (
    <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-violet-600" />

        <div>
          <h2 className="text-sm font-bold">
            Training History
          </h2>

          <p className="text-[13px] text-muted-foreground">
            Review and reuse previous sessions.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3">
          <p className="text-[13px] font-semibold text-red-700">
            {error}
          </p>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {loading &&
          Array.from({
            length: 4,
          }).map(
            (_, index) => (
              <div
                key={
                  index
                }
                className="h-16 animate-pulse rounded-xl bg-muted/40"
              />
            ),
          )}

        {!loading &&
          sessions.map(
            (session) => (
              <div
                key={
                  session.id
                }
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
              >
                <div>
                  <p className="text-[14px] font-bold">
                    {
                      session.title
                    }
                  </p>

                  <p className="mt-1 text-[12px] text-muted-foreground">
                    {
                      session.session_date
                    }
                    {" · "}
                    {
                      session.group_name ??
                      "No group"
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onReuse(
                      session.id,
                    )
                  }
                  className="flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-[12px] font-semibold"
                >
                  <Copy className="h-3 w-3" />
                  Reuse
                </button>
              </div>
            ),
          )}
      </div>
    </section>
  );
}

