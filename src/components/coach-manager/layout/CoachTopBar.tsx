import {
  Bell,
  ChevronDown,
  LogOut,
} from "lucide-react";

import {
  useNavigate,
} from "@tanstack/react-router";

import {
  supabase,
} from "@/integrations/supabase/client";

import {
  clearAuthFlags,
} from "@/lib/auth-session";

import {
  toast,
} from "sonner";


export function CoachTopBar() {
  const navigate =
    useNavigate();

  async function handleLogout() {
    try {
      const {
        error,
      } =
        await supabase.auth
          .signOut();

      if (error) {
        throw error;
      }

      clearAuthFlags();

      toast.success(
        "Erfolgreich abgemeldet.",
      );

      await navigate({
        to: "/auth",
      });
    } catch (
      error
    ) {
      console.error(
        "Coach logout failed:",
        error,
      );

      toast.error(
        "Abmelden fehlgeschlagen. Bitte versuche es erneut.",
      );
    }
  }

  return (
    <header className="flex min-h-20 items-center justify-between border-b border-border bg-background px-5 lg:px-8">
      <div>
        <p className="text-sm text-muted-foreground">
          Coach Manager
        </p>

        <h1 className="text-xl font-bold tracking-tight">
          Good morning, Coach
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="hidden items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium sm:flex"
        >
          Sprint / Hurdles

          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-background"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() =>
            void handleLogout()
          }
          className="flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-medium transition hover:bg-muted/40"
        >
          <LogOut className="h-4 w-4" />

          <span className="hidden sm:inline">
            Abmelden
          </span>
        </button>
      </div>
    </header>
  );
}
