import { createFileRoute } from "@tanstack/react-router";

import { AthleteDetailPage } from "@/components/coach-manager/athletes/AthleteDetailPage";

export const Route = createFileRoute(
  "/coach-manager/athletes/$athleteId",
)({
  validateSearch: (search: Record<string, unknown>) => ({
    from:
      search.from === "training"
        ? "training"
        : "athletes",
  }),

  component: AthleteDetailPage,
});
