import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  icon: LucideIcon;
  /** Kept for backwards compat — visually ignored in the minimal system. */
  accent?: "cyan" | "violet" | "lime" | "amber" | "magenta";
  children?: ReactNode;
}

export function KpiCard({
  label,
  value,
  unit,
  delta,
  trend = "flat",
  icon: Icon,
  children,
}: Props) {
  const trendClass =
    trend === "up"
      ? "text-accent"
      : trend === "down"
        ? "text-destructive"
        : "text-muted-foreground";
  const trendGlyph = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-semibold tabular-nums text-foreground">
              {value}
            </span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          {delta && (
            <div className={`mt-1 text-xs font-medium ${trendClass}`}>
              {trendGlyph} {delta}
            </div>
          )}
        </div>
        <div className="h-10 w-10 shrink-0 rounded-xl border border-border bg-secondary grid place-items-center">
          <Icon className="h-4 w-4 text-foreground" />
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </motion.div>
  );
}
