import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";
import { Bell, Search, Settings, ChevronRight } from "lucide-react";

export type Crumb = { label: string; to?: string };

interface Props {
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  children: ReactNode;
}

export function AppShell({ title, subtitle, breadcrumbs, children }: Props) {
  return (
    <div className="flex min-h-screen relative">
      {/* Cinematic stadium-light + energy-particle backdrop */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Stadium spotlight cones */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[60vh] w-[80vw] bg-[radial-gradient(ellipse_at_top,oklch(0.78_0.2_235/0.28),transparent_70%)] blur-2xl" />
        <div className="absolute -top-20 -left-20 h-[40vh] w-[40vw] bg-[radial-gradient(ellipse,oklch(0.9_0.22_142/0.18),transparent_70%)] blur-3xl drift" />
        <div className="absolute top-1/3 -right-24 h-[50vh] w-[40vw] bg-[radial-gradient(ellipse,oklch(0.72_0.2_25/0.16),transparent_70%)] blur-3xl drift" style={{ animationDelay: "-6s" }} />
        <div className="absolute bottom-0 left-1/4 h-[40vh] w-[50vw] bg-[radial-gradient(ellipse_at_bottom,oklch(0.7_0.24_285/0.18),transparent_70%)] blur-3xl" />

        {/* Holographic horizon line */}
        <div className="absolute top-[42%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />
        <div className="absolute top-[42%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/15 to-transparent blur-md" />

        {/* Energy particles */}
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full drift"
            style={{
              left: `${(i * 73) % 100}%`,
              top: `${(i * 47) % 100}%`,
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              background:
                i % 3 === 0
                  ? "oklch(0.9 0.22 142 / 0.8)"
                  : i % 3 === 1
                  ? "oklch(0.78 0.2 235 / 0.8)"
                  : "oklch(0.72 0.2 25 / 0.7)",
              boxShadow:
                i % 3 === 0
                  ? "0 0 8px oklch(0.9 0.22 142 / 0.9)"
                  : "0 0 8px oklch(0.78 0.2 235 / 0.9)",
              animationDelay: `${-i * 1.2}s`,
              animationDuration: `${10 + (i % 5) * 2}s`,
            }}
          />
        ))}

        {/* Motion-blur streak */}
        <div className="absolute top-[55%] -left-10 h-24 w-[60vw] bg-gradient-to-r from-transparent via-neon-cyan/10 to-transparent blur-2xl rotate-[-6deg]" />
      </div>

      <Sidebar />
      <main className="flex-1 min-w-0 relative z-10">
        <header className="sticky top-0 z-20 glass-strong border-b border-border/60">
          <div className="flex items-center justify-between gap-4 px-5 md:px-6 py-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground font-medium">
                {subtitle ?? "Übersicht"}
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-0.5">{title}</h1>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <button className="glass h-10 w-10 rounded-xl grid place-items-center text-muted-foreground hover:text-foreground hover:border-neon-cyan/40 transition btn-light-sweep">
                <Search className="h-4 w-4" />
              </button>
              <button className="glass h-10 w-10 rounded-xl grid place-items-center text-muted-foreground hover:text-foreground hover:border-neon-cyan/40 transition relative btn-light-sweep">
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-neon-red pulse-dot-red" />
              </button>
              <Link
                to="/settings"
                aria-label="Einstellungen"
                title="Einstellungen"
                className="glass h-10 w-10 rounded-xl grid place-items-center text-muted-foreground hover:text-foreground hover:border-neon-cyan/40 transition btn-light-sweep"
              >
                <Settings className="h-4 w-4" />
              </Link>

              <Link
                to="/profile"
                aria-label="Athletenprofil öffnen"
                title="Athletenprofil"
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-neon-cyan via-neon-violet to-neon-magenta grid place-items-center font-bold text-sm text-background ml-1 glow-cyan ring-1 ring-white/20 hover:ring-neon-cyan/60 transition"
              >
                LM
              </Link>
            </div>
          </div>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav
              aria-label="Breadcrumb"
              className="px-5 md:px-6 pb-3 -mt-1 flex items-center gap-1.5 text-[11px] tracking-wide text-muted-foreground"
            >
              {breadcrumbs.map((c, i) => {
                const last = i === breadcrumbs.length - 1;
                return (
                  <span key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronRight className="h-3 w-3 opacity-60" />}
                    {c.to && !last ? (
                      <Link to={c.to} className="hover:text-foreground transition-colors">
                        {c.label}
                      </Link>
                    ) : (
                      <span className={last ? "text-foreground font-medium" : ""}>{c.label}</span>
                    )}
                  </span>
                );
              })}
            </nav>
          )}
        </header>

        <div className="p-4 md:p-8 max-w-[1600px] mx-auto pb-28 md:pb-8">{children}</div>
      </main>
    </div>
  );
}

