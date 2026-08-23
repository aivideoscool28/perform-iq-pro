import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type UserRole = "athlete" | "coach";

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadRole() {
      if (authLoading) return;

      if (!user) {
        if (mounted) {
          setRole(null);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!mounted) return;

      if (error) {
        console.error("Failed to load user role:", error);
        setRole(null);
        setLoading(false);
        return;
      }

      const profile = data as typeof data & { role?: UserRole };

      setRole(profile.role ?? "athlete");
      setLoading(false);
    }

    loadRole();

    return () => {
      mounted = false;
    };
  }, [user, authLoading]);

  return {
    role,
    loading: authLoading || loading,
    isAthlete: role === "athlete",
    isCoach: role === "coach",
  };
}
