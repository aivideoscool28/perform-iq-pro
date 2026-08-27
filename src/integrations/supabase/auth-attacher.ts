import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "./client";

// Attaches the active Supabase access token to authenticated server functions
// without removing the request headers React Start needs for POST server functions.
export const attachSupabaseAuth = createMiddleware({
  type: "function",
}).client(async ({ next }) => {
  const { data } =
    await supabase.auth.getSession();

  const token =
    data.session?.access_token;

  return next({
    headers: {
      ...(token
        ? {
            Authorization:
              `Bearer ${token}`,
          }
        : {}),
    },
  });
});
