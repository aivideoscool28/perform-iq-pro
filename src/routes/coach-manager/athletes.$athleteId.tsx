import { createFileRoute } from "@tanstack/react-router";

import { AthleteDetailPage } from "@/components/coach-manager/athletes/AthleteDetailPage";

export const Route = createFileRoute(
  "/coach-manager/athletes/$athleteId",
)({
  component: AthleteDetailPage,
});
