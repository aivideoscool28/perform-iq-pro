import {
  Bell,
  ChevronDown,
  LogOut,
} from "lucide-react";

import {
  useNavigate,
} from "@tanstack/react-router";

import {
  useTranslation,
} from "react-i18next";

import {
  supabase,
} from "@/integrations/supabase/client";

import {
  clearAuthFlags,
} from "@/lib/auth-session";

import {
  LanguageSwitcher,
} from "@/components/common/LanguageSwitcher";

import {
  toast,
} from "sonner";

export function CoachTopBar() {
  const navigate =
    useNavigate();

  const {
    t,
  } =
    useTranslation();

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
        t("coach.logoutSuccess"),
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
        t("coach.logoutError"),
      );
    }
  }

  return (
    <header className="flex min-h-20 items-center justify-between border-b border-border bg-background px-5 lg:px-8">
      <div>
        <p className="text-sm text-muted-foreground">
          {t("coach.manager")}
        </p>

        <h1 className="text-xl font-bold tracking-tight">
          {t("coach.greeting")}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />

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
          aria-label={t("coach.notifications")}
          title={t("coach.notifications")}
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
            {t("coach.logout")}
          </span>
        </button>
      </div>
    </header>
  );
}
