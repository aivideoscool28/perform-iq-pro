import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/athleticiq/AppShell";
import { EditableShell } from "@/components/athleticiq/EditableShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, MapPin, Timer, Flag, Calendar, ChevronRight, Medal } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/competition")({ component: Page });

const next = {
  name: "Swiss Athletics Meeting",
  city: "Luzern · Allmend",
  date: "14. Juni 2026",
  discipline: "100 m Sprint",
  goal: "10.65 s",
  days: 23,
};

const upcoming = [
  { date: "28. Juni", name: "Resisprint International", city: "La Chaux-de-Fonds", level: "B-Meeting" },
  { date: "12. Juli", name: "Athletissima", city: "Lausanne", level: "Diamond League" },
  { date: "03. Aug", name: "Schweizer Meisterschaft", city: "Basel", level: "National" },
];

const results = [
  { date: "08. Mai", event: "100 m", time: "10.82 s", place: 2, pb: false },
  { date: "01. Mai", event: "200 m", time: "21.94 s", place: 1, pb: true },
  { date: "22. Apr", event: "100 m", time: "10.91 s", place: 3, pb: false },
  { date: "10. Apr", event: "60 m Indoor", time: "6.71 s", place: 1, pb: true },
];

function Page() {
  return (
    <AppShell
      title="Wettkampf"
      subtitle="Saisonkalender · Ergebnisse · Peak-Planung"
      breadcrumbs={[{ label: "Dashboard", to: "/" }, { label: "Wettkampf" }]}
    >

      <EditableShell storageKey="athleticiq.edit.competition.v1">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-strong rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 grid-bg pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-neon-violet/25 blur-3xl" />
          <div className="relative">
            <Badge className="bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30">A-Wettkampf</Badge>
            <h2 className="text-3xl font-bold mt-3 tracking-tight">{next.name}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {next.city}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {next.date}</span>
              <span className="flex items-center gap-1.5"><Flag className="h-3.5 w-3.5" /> {next.discipline}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="rounded-2xl border border-border/50 bg-white/[0.03] p-4">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Tage bis Start</div>
                <div className="mt-1 text-3xl font-bold gradient-text tabular-nums">{next.days}</div>
              </div>
              <div className="rounded-2xl border border-border/50 bg-white/[0.03] p-4">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Ziel-Zeit</div>
                <div className="mt-1 text-3xl font-bold tabular-nums">{next.goal}</div>
              </div>
              <div className="rounded-2xl border border-border/50 bg-white/[0.03] p-4">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Tapering</div>
                <div className="mt-1 text-sm font-semibold">Start in 14 Tagen</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Load -35%</div>
              </div>
            </div>

            <Button className="mt-6 bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-semibold">
              Peak-Plan ansehen <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        <div className="glass-strong rounded-3xl p-6">
          <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">Kommende Wettkämpfe</h3>
          <div className="space-y-2.5">
            {upcoming.map((u, i) => (
              <motion.div
                key={u.name}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 rounded-2xl border border-border/50 bg-white/[0.02] p-3"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-neon-cyan/15 to-neon-violet/15 grid place-items-center text-center">
                  <div>
                    <div className="text-[9px] uppercase text-neon-cyan">{u.date.split(" ")[1]}</div>
                    <div className="text-sm font-bold">{u.date.split(" ")[0]}</div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{u.name}</div>
                  <div className="text-[11px] text-muted-foreground">{u.city}</div>
                </div>
                <Badge variant="outline" className="text-[10px] border-border/60">{u.level}</Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-strong rounded-3xl p-6 mt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-neon-amber" />
            <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Letzte Ergebnisse</h3>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border/50">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Datum</th>
                <th className="text-left px-4 py-3">Disziplin</th>
                <th className="text-left px-4 py-3">Zeit</th>
                <th className="text-left px-4 py-3">Platz</th>
                <th className="text-right px-4 py-3">PB</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.date + r.event} className="border-t border-border/40 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-muted-foreground">{r.date}</td>
                  <td className="px-4 py-3 font-semibold">{r.event}</td>
                  <td className="px-4 py-3 tabular-nums">{r.time}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <Medal className={r.place === 1 ? "h-3.5 w-3.5 text-neon-amber" : "h-3.5 w-3.5 text-muted-foreground"} />
                      #{r.place}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.pb && (
                      <Badge className="bg-neon-magenta/15 text-neon-magenta border-neon-magenta/30">
                        <Timer className="h-3 w-3 mr-1" /> Personal Best
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </EditableShell>
    </AppShell>
  );
}
