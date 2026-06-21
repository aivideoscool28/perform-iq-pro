import { motion } from "framer-motion";

interface Props {
  value: number; // 0-100
  label?: string;
  size?: number;
}

export function RecoveryRing({ value, label = "Recovery", size = 220 }: Props) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c - (pct / 100) * c;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.85 0.18 200)" />
            <stop offset="100%" stopColor="oklch(0.68 0.24 295)" />
          </linearGradient>
          <filter id="ringGlow">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="oklch(0.3 0.03 265)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          filter="url(#ringGlow)"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            {label}
          </div>
          <div className="text-5xl font-bold gradient-text mt-1 tabular-nums">{pct}</div>
          <div className="text-xs text-muted-foreground mt-1">Optimal &gt; 75</div>
        </div>
      </div>
    </div>
  );
}
