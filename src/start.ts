import { enforceRequestSize } from "@/lib/security/ai-input";
import { createStart, createMiddleware, createCsrfMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    console.error(error);

    return new Response(renderErrorPage(), {
      status: 500,
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });
  }
});

const inputLimitMiddleware = createMiddleware().server(async ({ request, next }) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      await enforceRequestSize(request);
    } catch {
      return new Response("Request too large", { status: 413 });
    }
  }
  return next();
});

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [inputLimitMiddleware, csrfMiddleware, errorMiddleware],
  functionMiddleware: [attachSupabaseAuth],
}));
