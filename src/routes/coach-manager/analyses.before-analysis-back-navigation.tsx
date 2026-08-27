import { createFileRoute } from "@tanstack/react-router";
import { AnalysesPage } from "@/components/coach-manager/analyses/AnalysesPage";

export const Route = createFileRoute("/coach-manager/analyses")({
  component: AnalysesPage,
});
