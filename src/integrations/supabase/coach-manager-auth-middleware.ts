import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types";

export const requireCoachManagerAuth =
  createMiddleware({ type: "function" }).server(
    async ({ next }) => {
      const SUPABASE_URL =
        process.env.SUPABASE_URL;

      const SUPABASE_PUBLISHABLE_KEY =
        process.env.SUPABASE_PUBLISHABLE_KEY;

      if (
        !SUPABASE_URL ||
        !SUPABASE_PUBLISHABLE_KEY
      ) {
        throw new Error(
          "Missing Supabase server environment variables.",
        );
      }

      const request =
        getRequest();

      const authHeader =
        request?.headers?.get(
          "authorization",
        );

      if (
        !authHeader?.startsWith(
          "Bearer ",
        )
      ) {
        throw new Error(
          "Unauthorized: Coach login required.",
        );
      }

      const token =
        authHeader.slice(
          "Bearer ".length,
        );

      const supabase =
        createClient<Database>(
          SUPABASE_URL,
          SUPABASE_PUBLISHABLE_KEY,
          {
            global: {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            },

            auth: {
              storage:
                undefined,

              persistSession:
                false,

              autoRefreshToken:
                false,
            },
          },
        );

      const {
        data:
          claimsData,

        error:
          claimsError,
      } =
        await supabase.auth.getClaims(
          token,
        );

      const userId =
        claimsData?.claims?.sub;

      if (
        claimsError ||
        !userId
      ) {
        throw new Error(
          "Unauthorized: Invalid coach session.",
        );
      }

      const {
        data:
          profile,

        error:
          profileError,
      } =
        await supabase
          .from(
            "profiles",
          )
          .select(
            "role",
          )
          .eq(
            "id",
            userId,
          )
          .single();

      if (
        profileError
      ) {
        throw new Error(
          `Could not verify coach role: ${profileError.message}`,
        );
      }

      if (
        profile.role !==
        "coach"
      ) {
        throw new Error(
          "Forbidden: Coach access required.",
        );
      }

      return next({
        context: {
          supabase,
          userId,
          isDevelopmentCoach:
            false,
        },
      });
    },
  );
