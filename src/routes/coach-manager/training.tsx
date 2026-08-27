import { createFileRoute } from "@tanstack/react-router";
import { TrainingPage } from "@/components/coach-manager/training/TrainingPage";

export const Route = createFileRoute("/coach-manager/training")({
  validateSearch: (search: Record<string, unknown>) => ({
    view:
      search.view === "calendar"
        ? "calendar"
        : undefined,
  }),

  component: TrainingPage,
});
