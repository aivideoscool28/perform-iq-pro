import {
  createFileRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";

import { AthletesPage } from "@/components/coach-manager/athletes/AthletesPage";

export const Route = createFileRoute("/coach-manager/athletes")({
  component: AthletesRoute,
});

function AthletesRoute() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const isAthletesOverview =
    pathname === "/coach-manager/athletes" ||
    pathname === "/coach-manager/athletes/";

  if (isAthletesOverview) {
    return <AthletesPage />;
  }

  return <Outlet />;
}
