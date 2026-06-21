import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/athleticiq/AppShell";
import { EditableShell } from "@/components/athleticiq/EditableShell";
import { KpiCard } from "@/components/athleticiq/KpiCard";
import { Sparkline } from "@/components/athleticiq/Sparkline";
import { HrvChart } from "@/components/athleticiq/HrvChart";
import { RecoveryRing } from "@/components/athleticiq/RecoveryRing";
import { Badge } from "@/components/ui/badge";
import { Moon, HeartPulse, Thermometer, Wind, Droplets, Brain, Bed } from "lucide-react";

export const Route = createFileRoute("/recovery")({ component: Page });

const sleepStages = [
  { label: "Tiefschlaf", pct: 22, ideal: "20–25%", color: "bg-neon-violet" },
  { label: "REM", pct: 24, ideal: "20–25%", color: "bg-neon-cyan" },
  { label: "Leicht", pct: 48, ideal: "45–55%", color: "bg-neon-lime" },
  { label: "Wach", pct: 6, ideal: "<10%", color: "bg-neon-amber" },
];

function Page() {
  return (
    <AppShell
      title="Regeneration"
      subtitle="Schlaf · HRV · Belastung · Bereitschaft"
      breadcrumbs={[{ label: "Dashboard", to: "/" }, { label: "Regeneration" }]}
    >

      <EditableShell storageKey="athleticiq.edit.recovery.v1">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-strong rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 grid-bg pointer-events-none" />
          <RecoveryRing value={78} />
          <div className="mt-4 text-center relative">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Recovery Score</div>
            <div className="text-sm mt-1">Bereit für mittlere Belastung</div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <KpiCard label="HRV (rMSSD)" value="68" unit="ms" icon={HeartPulse} accent="cyan" delta="+4 ms vs. Baseline" trend="up">
            <Sparkline data={[58, 60, 62, 65, 64, 66, 68]} />
          </KpiCard>
          <KpiCard label="Ruhepuls" value="48" unit="bpm" icon={HeartPulse} accent="magenta" delta="−2 bpm" trend="up">
            <Sparkline data={[54, 52, 51, 50, 49, 49, 48]} color="oklch(0.7 0.27 340)" />
          </KpiCard>
          <KpiCard label="Schlafdauer" value="7h 42m" icon={Bed} accent="violet" delta="+18 min" trend="up">
            <Sparkline data={[6.2, 6.8, 7.1, 7.4, 7.0, 7.3, 7.7]} color="oklch(0.68 0.24 295)" />
          </KpiCard>
          <KpiCard label="Atemfrequenz" value="13.4" unit="/min" icon={Wind} accent="lime" delta="stabil" trend="flat">
            <Sparkline data={[13, 13.2, 13.1, 13.4, 13.3, 13.5, 13.4]} color="oklch(0.88 0.22 145)" />
          </KpiCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2 glass-strong rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">HRV Trend</div>
              <h3 className="text-lg font-bold mt-1">Letzte 14 Tage</h3>
            </div>
            <Badge className="bg-neon-lime/15 text-neon-lime border-neon-lime/30">Aufwärtstrend</Badge>
          </div>
          <HrvChart />
        </div>

        <div className="glass-strong rounded-3xl p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Moon className="h-3.5 w-3.5" /> Schlafphasen
          </div>
          <h3 className="text-lg font-bold mt-1 mb-5">Heute Nacht</h3>
          <div className="flex h-3 rounded-full overflow-hidden">
            {sleepStages.map((s) => (
              <div key={s.label} className={s.color} style={{ width: `${s.pct}%` }} />
            ))}
          </div>
          <div className="mt-5 space-y-3">
            {sleepStages.map((s) => (
              <div key={s.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                  <span>{s.label}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold tabular-nums">{s.pct}%</div>
                  <div className="text-[10px] text-muted-foreground">{s.ideal}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {[
          { icon: Thermometer, label: "Hauttemperatur", val: "+0.2 °C", note: "im Normbereich", accent: "amber" as const },
          { icon: Droplets, label: "Hydration", val: "76%", note: "350 ml unter Ziel", accent: "cyan" as const },
          { icon: Brain, label: "Stress (PSS)", val: "Niedrig", note: "12 / 40", accent: "lime" as const },
          { icon: HeartPulse, label: "SpO₂", val: "97%", note: "stabil", accent: "violet" as const },
        ].map((m) => (
          <KpiCard key={m.label} label={m.label} value={m.val} icon={m.icon} accent={m.accent} delta={m.note} />
        ))}
      </div>
    </EditableShell>
    </AppShell>
  );
}
