import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
const AuthContext = createContext<{
  session: Session | null;
  loading: boolean;
  error: string | null;
}>({ session: null, loading: true, error: null });
export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [state, setState] = useState({
    session: null as Session | null,
    loading: true,
    error: null as string | null,
  });
  useEffect(() => {
    let active = true;
    let version = 0;
    let previousId: string | null | undefined;
    const accept = (session: Session | null) => {
      if (!active) return;
      if (previousId !== undefined && previousId !== (session?.user.id ?? null)) qc.clear();
      previousId = session?.user.id ?? null;
      setState({ session, loading: false, error: null });
    };
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      version++;
      accept(session);
    });
    const initialVersion = version;
    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active || initialVersion !== version) return;
        if (error)
          setState({
            session: null,
            loading: false,
            error: "Session could not be loaded. Please sign in again.",
          });
        else accept(data.session);
      })
      .catch(() => {
        if (active) setState({ session: null, loading: false, error: "Session unavailable" });
      });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [qc]);
  return createElement(AuthContext.Provider, { value: state }, children);
}
export function useAuth() {
  const state = useContext(AuthContext);
  return { ...state, user: state.session?.user };
}
