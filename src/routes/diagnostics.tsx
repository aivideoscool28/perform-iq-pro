import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/athleticiq/AppShell";
import { EditableShell } from "@/components/athleticiq/EditableShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Beaker, FlaskConical, Plus, Wind, Heart, Dumbbell } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/diagnostics")({ component: Page });

const profile = [
  { axis: "Sprint", A: 92, full: 100 },
  { axis: "Kraft", A: 78, full: 100 },
  { axis: "Power", A: 86, full: 100 },
  { axis: "Ausdauer", A: 64, full: 100 },
  { axis: "Mobilität", A: 71, full: 100 },
  { axis: "Reaktivität", A: 88, full: 100 },
];

const labs = [
  { name: "VO₂max", val: "62.4", unit: "ml/kg/min", date: "12. Mai", status: "elite" },
  { name: "Laktatschwelle", val: "14.2", unit: "km/h", date: "12. Mai", status: "high" },
  { name: "1RM Kniebeuge", val: "165", unit: "kg", date: "06. Mai", status: "high" },
  { name: "Sprung CMJ", val: "58.4", unit: "cm", date: "06. Mai", status: "elite" },
  { name: "Ferritin", val: "94", unit: "ng/ml", date: "28. Apr", status: "ok" },
  { name: "Vitamin D", val: "38", unit: "ng/ml", date: "28. Apr", status: "warn" },
];

const statusColor: Record<string, string> = {
  elite: "bg-neon-violet/15 text-neon-violet border-neon-violet/30",
  high: "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30",
  ok: "bg-neon-lime/15 text-neon-lime border-neon-lime/30",
  warn: "bg-neon-amber/15 text-neon-amber border-neon-amber/30",
};

function Page() {
  return (
    <AppShell
      title="Diagnostik"
      subtitle="Leistungsphysiologie · Labordaten · Athletenprofil"
      breadcrumbs={[{ label: "Dashboard", to: "/" }, { label: "Diagnostik" }]}
    >

      <EditableShell storageKey="athleticiq.edit.diagnostics.v1">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-strong rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Athletenprofil</div>
              <h3 className="text-lg font-bold mt-1">Performance Radar</h3>
            </div>
            <Badge className="bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30">Sprint-Profil</Badge>
          </div>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={profile}>
                <PolarGrid stroke="oklch(0.32 0.03 265 / 60%)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: "oklch(0.68 0.03 250)", fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  dataKey="A"
                  stroke="oklch(0.85 0.18 200)"
                  fill="oklch(0.68 0.24 295)"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-strong rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-neon-cyan/20 blur-3xl" />
          <div className="relative">
            <div className="text-xs uppercase tracking-[0.2em] text-neon-cyan">Nächster Test</div>
            <h3 className="text-xl font-bold mt-1">VO₂max Spiroergometrie</h3>
            <p className="text-xs text-muted-foreground mt-2">
              Montag, 09:30 · Performance Lab Zürich
            </p>

            <div className="mt-5 space-y-2.5">
              {[
                { icon: Wind, text: "Atemgas-Analyse" },
                { icon: Heart, text: "12-Kanal EKG" },
                { icon: Dumbbell, text: "Laktat-Stufenprotokoll" },
              ].map((t) => (
                <div key={t.text} className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-violet/20 grid place-items-center">
                    <t.icon className="h-3.5 w-3.5 text-neon-cyan" />
                  </div>
                  {t.text}
                </div>
              ))}
            </div>

            <Button className="w-full mt-5 bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-semibold">
              <Plus className="h-4 w-4 mr-2" /> Test buchen
            </Button>
          </div>
        </div>
      </div>

      <div className="glass-strong rounded-3xl p-6 mt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-neon-violet" />
            <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Letzte Messwerte</h3>
          </div>
          <Button variant="ghost" size="sm" className="text-neon-cyan">
            <Beaker className="h-3.5 w-3.5 mr-1.5" /> Verlauf
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {labs.map((l) => (
            <div
              key={l.name}
              className="rounded-2xl border border-border/50 bg-white/[0.02] p-4 hover:border-neon-cyan/30 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">{l.name}</span>
                <Badge className={statusColor[l.status]}>{l.status}</Badge>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tabular-nums">{l.val}</span>
                <span className="text-xs text-muted-foreground">{l.unit}</span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                <Activity className="h-3 w-3" /> {l.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </EditableShell>
    </AppShell>
  );
}
