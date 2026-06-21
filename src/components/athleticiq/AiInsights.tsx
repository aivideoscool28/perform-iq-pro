import { Sparkles, AlertTriangle, TrendingUp, Moon } from "lucide-react";
import { motion } from "framer-motion";

const insights = [
  {
    icon: TrendingUp,
    tone: "accent" as const,
    title: "Sprintform im Aufwärtstrend",
    body: "Deine 30m-Splits sind 0.04s schneller als letzte Woche. Peak in ~6 Tagen prognostiziert.",
    tag: "Performance",
  },
  {
    icon: AlertTriangle,
    tone: "destructive" as const,
    title: "Verletzungsrisiko erhöht",
    body: "Asymmetrie in der Belastung der hinteren Kette (+12%). Mobility-Block heute empfohlen.",
    tag: "Risiko",
  },
  {
    icon: Moon,
    tone: "muted" as const,
    title: "Schlaf unter Baseline",
    body: "Nur 6h 12min Tiefschlaf. Deload-Session statt Intervall — automatisch im Plan angepasst.",
    tag: "Recovery",
  },
];

const toneClass = {
  accent: "text-accent",
  destructive: "text-destructive",
  muted: "text-muted-foreground",
} as const;

export function AiInsights() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-foreground grid place-items-center">
            <Sparkles className="h-4 w-4 text-background" />
          </div>
          <div>
            <div className="font-semibold text-sm">KI-Insights</div>
            <div className="text-[11px] text-muted-foreground">In Echtzeit aktualisiert</div>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent pulse-dot" />
          Live
        </span>
      </div>

      <div className="space-y-3">
        {insights.map((it, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="relative rounded-xl border border-border bg-background p-4 transition hover:border-foreground/40"
          >
            <div className="flex gap-3">
              <it.icon className={`h-5 w-5 ${toneClass[it.tone]} shrink-0 mt-0.5`} />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-sm">{it.title}</h4>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border rounded px-1.5 py-0.5">
                    {it.tag}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{it.body}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
