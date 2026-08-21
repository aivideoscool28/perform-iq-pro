import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  UserRound,
  CalendarDays,
  ChartNoAxesCombined,
  Video,
  Trophy,
  Bell,
  NotebookPen,
  Sparkles,
  Settings,
} from "lucide-react";

const futureItems = [
  { label: "Groups", icon: Users },
  { label: "Video", icon: Video },
  { label: "Competitions", icon: Trophy },
  { label: "Notifications", icon: Bell },
  { label: "Notes", icon: NotebookPen },
  { label: "AI Assistant", icon: Sparkles },
];

const linkClass =
  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-orange-500/5 hover:text-orange-600 [&.active]:bg-orange-500/10 [&.active]:font-semibold [&.active]:text-orange-600";

export function CoachSideMenu() {
  return (
    <aside className="hidden lg:flex h-screen w-48 shrink-0 flex-col border-r border-border bg-background px-3 py-5">
      <div className="px-3 pb-8">
        <p className="text-lg font-bold tracking-tight">
          Athletic<span className="text-orange-500">IQ</span>
        </p>

        <p className="mt-1 text-xs font-medium text-muted-foreground">
          Coach Manager
        </p>
      </div>

      <nav className="space-y-1">
        <Link
          to="/coach-manager"
          activeOptions={{ exact: true }}
          className={linkClass}
        >
          <LayoutDashboard className="h-4 w-4" />
          Overview
        </Link>

        <Link
          to="/coach-manager/athletes"
          className={linkClass}
        >
          <UserRound className="h-4 w-4" />
          Athletes
        </Link>

        <Link
          to="/coach-manager/training"
          className={linkClass}
        >
          <CalendarDays className="h-4 w-4" />
          Training
        </Link>

        <Link
          to="/coach-manager/analyses"
          className={linkClass}
        >
          <ChartNoAxesCombined className="h-4 w-4" />
          Analyses
        </Link>

        {futureItems.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            disabled
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground opacity-60"
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto border-t border-border pt-4">
        <button
          type="button"
          disabled
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground"
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>
    </aside>
  );
}

