import {
  useNavigate,
} from "@tanstack/react-router";

import {
  CircleAlert,
  TrendingUp,
} from "lucide-react";

import {
  useCoachAthletes,
} from "@/hooks/useCoachAthletes";

export function LatestDevelopments() {
  const navigate =
    useNavigate();

  const {
    athletes,
    loading,
  } =
    useCoachAthletes();

  const developments =
    athletes
      .slice(0, 4)
      .map(
        (
          athlete,
          index,
        ) => {
          const needsAttention =
            index < 2;

          return {
            athleteId:
              athlete.id,

            athlete:
              athlete.display_name,

            title:
              athlete.current_focus
                ? `Current focus: ${athlete.current_focus}`
                : needsAttention
                  ? "Athlete worth reviewing"
                  : "Recent athlete development",

            detail:
              needsAttention
                ? "Open athlete detail to review recent evidence"
                : "Open athlete detail to review recent progress",

            priority:
              needsAttention
                ? "Needs attention"
                : "Developing",

            icon:
              needsAttention
                ? CircleAlert
                : TrendingUp,

            style:
              needsAttention
                ? "bg-orange-50 border-orange-100"
                : "bg-green-50/60 border-green-100",

            badge:
              needsAttention
                ? "bg-orange-100 text-orange-700"
                : "bg-green-100 text-green-700",

            iconStyle:
              needsAttention
                ? "bg-orange-100 text-orange-600"
                : "bg-green-100 text-green-600",
          };
        },
      );

  function openAthlete(
    athleteId: string,
  ) {
    void navigate({
      to:
        "/coach-manager/athletes/$athleteId",

      params: {
        athleteId,
      },

      search: {
        from:
          "athletes",
      },
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-background p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">
            Latest Developments
          </p>

          <h3 className="mt-1 text-base font-bold">
            What changed
          </h3>
        </div>

        <div className="grid h-8 w-8 place-items-center rounded-xl bg-orange-50">
          <TrendingUp className="h-4 w-4 text-orange-500" />
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {loading && (
          <p className="py-4 text-center text-[9px] text-muted-foreground">
            Loading linked athletes...
          </p>
        )}

        {!loading &&
          developments.length ===
            0 && (
            <p className="py-4 text-center text-[9px] text-muted-foreground">
              No linked athletes found.
            </p>
          )}

        {!loading &&
          developments.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <button
                  key={
                    item.athleteId
                  }
                  type="button"
                  onClick={() =>
                    openAthlete(
                      item.athleteId,
                    )
                  }
                  className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition hover:shadow-sm ${item.style}`}
                >
                  <div
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${item.iconStyle}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold">
                        {
                          item.athlete
                        }
                      </p>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[8px] font-bold ${item.badge}`}
                      >
                        {
                          item.priority
                        }
                      </span>
                    </div>

                    <p className="mt-1 text-xs font-medium">
                      {
                        item.title
                      }
                    </p>

                    <p className="mt-0.5 text-[9px] text-muted-foreground">
                      {
                        item.detail
                      }
                    </p>
                  </div>

                  <span className="text-sm text-muted-foreground">
                    →
                  </span>
                </button>
              );
            },
          )}
      </div>
    </section>
  );
}