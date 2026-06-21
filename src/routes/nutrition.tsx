import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/athleticiq/AppShell";
import { EditableShell } from "@/components/athleticiq/EditableShell";
import { MacroRings } from "@/components/athleticiq/MacroRings";
import { FoodScanner } from "@/components/athleticiq/FoodScanner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Scan, Plus, Apple, Beef, Wheat, Droplet, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/nutrition")({ component: Page });

const meals = [
  { time: "07:20", name: "Overnight Oats", kcal: 540, p: 28, c: 72, f: 14, tag: "Pre-Workout" },
  { time: "10:00", name: "Whey + Banane", kcal: 280, p: 32, c: 28, f: 4, tag: "Recovery" },
  { time: "13:15", name: "Hähnchen Bowl", kcal: 720, p: 58, c: 64, f: 22, tag: "Lunch" },
  { time: "16:30", name: "Skyr & Beeren", kcal: 220, p: 22, c: 18, f: 4, tag: "Snack" },
];

function Page() {
  const [scannerOpen, setScannerOpen] = useState(false);
  return (
    <AppShell
      title="Food Scanner"
      subtitle="KI-Makro-Erkennung · Live über die Kamera"
      breadcrumbs={[{ label: "Dashboard", to: "/" }, { label: "Food Scanner" }]}
    >

      <EditableShell storageKey="athleticiq.edit.nutrition.v1">
      <FoodScanner open={scannerOpen} onOpenChange={setScannerOpen} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-strong rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 grid-bg pointer-events-none" />
          <div className="relative flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tages-Energie</div>
              <h3 className="text-lg font-bold mt-1">2.140 / 2.800 kcal</h3>
            </div>
            <Badge className="bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30">76% erreicht</Badge>
          </div>
          <MacroRings />
        </div>

        <div className="glass-strong rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-neon-cyan/20 blur-3xl" />
          <div className="relative">
            <div className="text-xs uppercase tracking-[0.2em] text-neon-cyan flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" /> Scanner
            </div>
            <h3 className="text-xl font-bold mt-1">Was hast du gegessen?</h3>

            <button
              onClick={() => setScannerOpen(true)}
              className="mt-4 group block w-full aspect-video rounded-2xl border border-dashed border-neon-cyan/40 bg-black/30 relative overflow-hidden transition hover:border-neon-cyan hover:bg-black/40 cursor-pointer"
            >
              <div className="absolute inset-x-8 h-px bg-neon-cyan/60 shimmer" />
              <div className="absolute inset-y-6 w-px bg-neon-cyan/60 shimmer" />
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <Camera className="h-10 w-10 mx-auto text-neon-cyan group-hover:scale-110 transition" />
                  <div className="text-xs text-muted-foreground mt-2">Tippen zum Starten</div>
                </div>
              </div>
            </button>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button
                onClick={() => setScannerOpen(true)}
                className="bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-semibold hover:opacity-90"
              >
                <Scan className="h-4 w-4 mr-1.5" /> Scannen
              </Button>
              <Button variant="outline" className="border-border/60" onClick={() => setScannerOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" /> Manuell
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2 glass rounded-3xl p-6">
          <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">Mahlzeiten heute</h3>
          <div className="space-y-2.5">
            {meals.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between rounded-2xl border border-border/50 bg-white/[0.02] p-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-violet/20 grid place-items-center">
                    <Apple className="h-4 w-4 text-neon-cyan" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{m.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {m.time} · {m.tag}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs tabular-nums">
                  <div className="text-right">
                    <div className="font-bold text-base">{m.kcal}</div>
                    <div className="text-[10px] text-muted-foreground">kcal</div>
                  </div>
                  <div className="hidden sm:flex gap-3">
                    <span className="text-neon-cyan">P {m.p}</span>
                    <span className="text-neon-amber">C {m.c}</span>
                    <span className="text-neon-magenta">F {m.f}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">Mikronährstoffe</h3>
          {[
            { icon: Beef, label: "Eisen", val: 78, color: "from-neon-magenta to-neon-red" },
            { icon: Wheat, label: "Magnesium", val: 92, color: "from-neon-lime to-neon-cyan" },
            { icon: Droplet, label: "Omega-3", val: 64, color: "from-neon-cyan to-neon-violet" },
            { icon: Apple, label: "Vitamin C", val: 110, color: "from-neon-amber to-neon-lime" },
          ].map((m) => (
            <div key={m.label} className="mb-4 last:mb-0">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <m.icon className="h-3.5 w-3.5" /> {m.label}
                </span>
                <span className="font-semibold tabular-nums">{m.val}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${m.color}`} style={{ width: `${Math.min(m.val, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </EditableShell>
    </AppShell>
  );
}
