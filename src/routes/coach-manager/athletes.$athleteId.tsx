import { createFileRoute } from "@tanstack/react-router";

import { AthleteDetailPage } from "@/components/coach-manager/athletes/AthleteDetailPage";

export const Route = createFileRoute(
  "/coach-manager/athletes/$athleteId",
)({
  validateSearch: (
    search: Record<string, unknown>,
  ) => ({
    from:
      search.from === "training"
        ? "training"
        : search.from === "training-response"
          ? "training-response"
          : search.from === "checkin-analysis"
            ? "checkin-analysis"
            : search.from === "regeneration-analysis"
              ? "regeneration-analysis"
              : search.from === "session-comparison"
                ? "session-comparison"
                : "athletes",
  }),

  component: AthleteDetailPage,
});
