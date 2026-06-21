import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  LayoutDashboard,
  User,
  Dumbbell,
  Scan,
  LineChart,
  HeartPulse,
  Video,
  Trophy,
  Sparkles,
  Gamepad2,
  Watch,
  Footprints,
  BarChart3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = { to: string; label: string; icon: LucideIcon; tour?: string };

const nav: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profile", label: "Athletenprofil", icon: User },
  { to: "/training", label: "KI-Training", icon: Dumbbell },
  { to: "/nutrition", label: "Food Scanner", icon: Scan },
  { to: "/diagnostics", label: "Diagnostik", icon: LineChart },
  { to: "/recovery", label: "Regeneration", icon: HeartPulse },
  { to: "/video", label: "Videoanalyse", icon: Video },
  { to: "/workout-analysis", label: "Workout Analysis", icon: BarChart3, tour: "nav-analysis" },
  { to: "/devices", label: "Geräte", icon: Watch },
  { to: "/competition", label: "Wettkampf", icon: Trophy },
  { to: "/coach", label: "KI-Coach", icon: Sparkles },
  { to: "/gear", label: "Schuhe & Spikes", icon: Footprints },
  { to: "/gamification", label: "Freunde & Streaks", icon: Gamepad2, tour: "nav-friends" },
];

// Primary tabs surfaced in floating mobile dock — all sections
const mobileNav = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/profile", label: "Profil", icon: User },
  { to: "/training", label: "Training", icon: Dumbbell },
  { to: "/nutrition", label: "Scan", icon: Scan },
  { to: "/diagnostics", label: "Diag", icon: LineChart },
  { to: "/recovery", label: "Reco", icon: HeartPulse },
  { to: "/video", label: "Video", icon: Video },
  { to: "/workout-analysis", label: "Analyse", icon: BarChart3, tour: "nav-analysis" },
  { to: "/devices", label: "Geräte", icon: Watch },
  { to: "/competition", label: "Wettk.", icon: Trophy },
  { to: "/coach", label: "Coach", icon: Sparkles },
  { to: "/gear", label: "Spikes", icon: Footprints },
  { to: "/gamification", label: "Streaks", icon: Gamepad2, tour: "nav-friends" },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      <aside className="hidden lg:flex w-64 shrink-0 flex-col h-screen sticky top-0 p-4 border-r border-border/60 glass-strong z-10">
        <Link to="/" className="flex items-center gap-2.5 px-2 py-3 mb-6">
          <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-violet glow-cyan flex items-center justify-center">
            <Activity className="h-5 w-5 text-background" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold tracking-tight text-base">
              Athletic<span className="gradient-text">iq</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Performance OS
            </span>
          </div>
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {nav.map(({ to, label, icon: Icon, tour }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                data-tour={tour}
                className={[
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                  active
                    ? "bg-gradient-to-r from-neon-cyan/15 to-neon-violet/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]",
                ].join(" ")}
              >
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-gradient-to-b from-neon-cyan to-neon-violet" />
                )}
                <Icon className={`h-4 w-4 ${active ? "text-neon-cyan" : ""}`} />
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="glass rounded-2xl p-4 mt-4">
          <div className="flex items-center gap-2 text-xs text-neon-cyan mb-1">
            <span className="h-2 w-2 rounded-full bg-neon-cyan pulse-dot" />
            KI-Coach aktiv
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Heute leichtes Training empfohlen. HRV unter Baseline.
          </p>
        </div>
      </aside>

      {/* Floating mobile dock — scrollable, all sections */}
      <nav className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(94vw,520px)]">
        <div className="glass-strong rounded-3xl px-2 py-2 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 min-w-max">
            {mobileNav.map(({ to, label, icon: Icon, tour }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  data-tour={tour}
                  className={[
                    "relative flex flex-col items-center gap-0.5 py-2 px-3 rounded-2xl transition-all min-w-[64px]",
                    active
                      ? "text-neon-cyan bg-neon-cyan/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]",
                  ].join(" ")}
                >
                  {active && (
                    <span className="absolute inset-x-2 top-1 h-[3px] rounded-full bg-gradient-to-r from-neon-cyan to-neon-lime shadow-[0_0_12px_oklch(0.78_0.2_235/0.8)]" />
                  )}
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span className="text-[10px] font-semibold tracking-wide">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
