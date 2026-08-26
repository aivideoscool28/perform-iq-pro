import {
  createFileRoute,
  Outlet,
  redirect,
} from "@tanstack/react-router";

import {
  supabase,
} from "@/integrations/supabase/client";

import {
  CoachAppFrame,
} from "@/components/coach-manager/layout/CoachAppFrame";

export const Route =
  createFileRoute("/coach-manager")({
    beforeLoad:
      async () => {
        const {
          data: sessionData,
          error: sessionError,
        } =
          await supabase.auth.getSession();

        if (
          sessionError ||
          !sessionData.session
        ) {
          throw redirect({
            to: "/auth",
          });
        }

        const user =
          sessionData.session.user;

        const {
          data: profile,
          error: profileError,
        } =
          await supabase
            .from("profiles")
            .select("role")
            .eq(
              "id",
              user.id,
            )
            .single();

        if (
          profileError
        ) {
          console.error(
            "Could not verify coach role:",
            profileError,
          );

          throw redirect({
            to: "/auth",
          });
        }

        if (
          profile.role !==
          "coach"
        ) {
          throw redirect({
            to: "/",
          });
        }

        return {
          user,
          role: profile.role,
        };
      },

    component:
      CoachManagerRoute,
  });

function CoachManagerRoute() {
  return (
    <CoachAppFrame>
      <Outlet />
    </CoachAppFrame>
  );
}
