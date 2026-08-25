import { createFileRoute } from "@tanstack/react-router";
import { CoachDashboard } from "@/components/coach-manager/dashboard/CoachDashboard";

export const Route = createFileRoute("/coach-manager/")({
  component: CoachManagerHome,
});

function CoachManagerHome() {
  return <CoachDashboard />;
}
