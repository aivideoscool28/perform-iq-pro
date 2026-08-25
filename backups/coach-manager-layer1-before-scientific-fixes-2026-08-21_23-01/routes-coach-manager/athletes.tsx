import { createFileRoute } from "@tanstack/react-router";
import { AthletesPage } from "@/components/coach-manager/athletes/AthletesPage";

export const Route = createFileRoute("/coach-manager/athletes")({
  component: AthletesPage,
});
