import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { shouldDropSession, clearAuthFlags } from "@/lib/auth-session";
import type { Session, User } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // Enforce the "Remember me" choice before trusting a stored session.
      if (shouldDropSession()) {
        await supabase.auth.signOut();
        clearAuthFlags();
        if (mounted) {
          setSession(null);
          setLoading(false);
        }
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user as User | undefined, loading };
}
