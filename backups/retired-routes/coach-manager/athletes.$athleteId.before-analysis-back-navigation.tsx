import { createFileRoute } from "@tanstack/react-router";

import { AthleteDetailPage } from "@/components/coach-manager/athletes/AthleteDetailPage";

export const Route = createFileRoute(
  "/coach-manager/athletes/$athleteId/before-analysis-back-navigation",
)({
  validateSearch: (search: Record<string, unknown>) => ({
    from:
      search.from === "training"
        ? "training"
        : search.from === "training-response"
          ? "training-response"
          : "athletes",
  }),

  component: AthleteDetailPage,
});

