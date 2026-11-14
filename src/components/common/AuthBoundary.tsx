import type { ReactNode } from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
export function AuthBoundary({ children }: { children: ReactNode }) {
  const { session, loading, error } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isPublic = pathname === "/auth" || pathname === "/reset-password";
  useEffect(() => {
    if (!isPublic && !loading && !session) void navigate({ to: "/auth", replace: true });
  }, [isPublic, loading, session, navigate]);
  if (isPublic) return children;
  if (error) return <p role="alert">{error}</p>;
  if (loading || !session) return <p role="status">Anmeldung wird geprüft…</p>;
  return children;
}
