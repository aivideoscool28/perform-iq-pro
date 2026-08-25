import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types";

const DEVELOPMENT_COACH_ID =
  "8702a6f0-8e4b-45cb-88ef-51208375a28f";

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

      /*
       * DEVELOPMENT MODE
       *
       * Coach Manager always uses the fixed demo coach.
       * This prevents an athlete login in the same browser
       * from accidentally becoming the Coach Manager identity.
       */
      if (
        process.env.NODE_ENV !== "production"
      ) {
        const {
          supabaseAdmin,
        } = await import(
          "./client.server"
        );

        return next({
          context: {
            supabase: supabaseAdmin,
            userId: DEVELOPMENT_COACH_ID,
            isDevelopmentCoach: true,
          },
        });
      }

      /*
       * PRODUCTION: REAL AUTHENTICATED COACH
       */
      const request = getRequest();

      const authHeader =
        request?.headers?.get("authorization");

      if (!authHeader?.startsWith("Bearer ")) {
        throw new Error(
          "Unauthorized: Coach login required.",
        );
      }

      const token = authHeader.slice(
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
              storage: undefined,
              persistSession: false,
              autoRefreshToken: false,
            },
          },
        );

      const {
        data: claimsData,
        error: claimsError,
      } = await supabase.auth.getClaims(token);

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

      return next({
        context: {
          supabase,
          userId,
          isDevelopmentCoach: false,
        },
      });
    },
  );
