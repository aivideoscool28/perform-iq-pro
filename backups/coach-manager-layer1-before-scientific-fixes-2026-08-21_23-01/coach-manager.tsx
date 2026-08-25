import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CoachAppFrame } from "@/components/coach-manager/layout/CoachAppFrame";

export const Route = createFileRoute("/coach-manager")({
  component: CoachManagerRoute,
});

function CoachManagerRoute() {
  return (
    <CoachAppFrame>
      <Outlet />
    </CoachAppFrame>
  );
}
