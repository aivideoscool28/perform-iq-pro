import { createFileRoute } from "@tanstack/react-router";

import { AnalysesPage } from "@/components/coach-manager/analyses/AnalysesPage";

const allowedTabs = [
  "overview",
  "checkin",
  "regeneration",
  "training-response",
  "session-comparison",
] as const;

export const Route = createFileRoute(
  "/coach-manager/analyses",
)({
  validateSearch: (
    search: Record<string, unknown>,
  ) => ({
    tab:
      typeof search.tab === "string" &&
      allowedTabs.includes(
        search.tab as (typeof allowedTabs)[number],
      )
        ? (search.tab as (typeof allowedTabs)[number])
        : "overview",
  }),

  component: AnalysesPage,
});
