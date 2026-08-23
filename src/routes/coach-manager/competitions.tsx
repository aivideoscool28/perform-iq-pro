import { createFileRoute } from "@tanstack/react-router";

import { CompetitionsPage } from "@/components/coach-manager/competitions/CompetitionsPage";

export const Route = createFileRoute("/coach-manager/competitions")({
  component: CompetitionsPage,
});
