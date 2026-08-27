import { createFileRoute } from "@tanstack/react-router";

import { AnalysesPage } from "@/components/coach-manager/analyses/AnalysesPage";

export const Route = createFileRoute("/coach-manager/analyses")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab:
      search.tab === "checkin" ||
      search.tab === "regeneration" ||
      search.tab === "training-response" ||
      search.tab === "session-comparison"
        ? search.tab
        : "overview",
  }),

  component: AnalysesPage,
});
