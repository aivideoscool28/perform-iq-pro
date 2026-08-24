// Server-side Supabase client.
// Uses a server-only secret key and must never be imported into browser code.

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

function createSupabaseAdminClient() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    const missing = [
      ...(!SUPABASE_URL ? ['SUPABASE_URL'] : []),
      ...(!SUPABASE_SECRET_KEY ? ['SUPABASE_SECRET_KEY'] : []),
    ];

    throw new Error(
      `Missing Supabase server environment variable(s): ${missing.join(', ')}`
    );
  }

  return createClient<Database>(
    SUPABASE_URL,
    SUPABASE_SECRET_KEY,
    {
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

let _supabaseAdmin:
  | ReturnType<typeof createSupabaseAdminClient>
  | undefined;

export const supabaseAdmin = new Proxy(
  {} as ReturnType<typeof createSupabaseAdminClient>,
  {
    get(_, prop, receiver) {
      if (!_supabaseAdmin) {
        _supabaseAdmin = createSupabaseAdminClient();
      }

      return Reflect.get(
        _supabaseAdmin,
        prop,
        receiver,
      );
    },
  },
);
