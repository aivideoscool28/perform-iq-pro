import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
export class AiAccessError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
  }
}
/** Every provider call is authenticated and charged against one database-backed quota.
 * Fail closed if the reviewed migration has not been installed. No in-memory quota. */
export async function authorizePaidAi(request = getRequest()) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) throw new AiAccessError("Sign in required", 401);
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new AiAccessError("AI service is not configured", 503);
  const supabase = createClient<Database>(url, key, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getClaims(authorization.slice(7));
  if (error || !data?.claims?.sub) throw new AiAccessError("Invalid session", 401);
  const { error: quotaError } = await supabase.rpc("consume_ai_usage");
  if (quotaError) {
    if (quotaError.message.includes("AI_CONSENT_REQUIRED"))
      throw new AiAccessError("Enable AI processing in your profile first", 403);
    if (quotaError.message.includes("AI_RATE_LIMIT"))
      throw new AiAccessError("AI allowance reached. Please try again later.", 429);
    throw new AiAccessError("AI access could not be verified", 503);
  }
  return { supabase, userId: data.claims.sub };
}
