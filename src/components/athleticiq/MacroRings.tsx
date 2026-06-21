interface Macro {
  label: string;
  value: number;
  target: number;
  color: string;
}

const macros: Macro[] = [
  { label: "Protein", value: 142, target: 180, color: "oklch(0.85 0.18 200)" },
  { label: "Carbs", value: 320, target: 420, color: "oklch(0.68 0.24 295)" },
  { label: "Fett", value: 65, target: 80, color: "oklch(0.82 0.18 75)" },
];

function Ring({ m }: { m: Macro }) {
  const size = 84;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, m.value / m.target);
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="oklch(0.3 0.03 265)" strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={m.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={c - pct * c}
            style={{ filter: `drop-shadow(0 0 6px ${m.color})`, transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-sm font-bold tabular-nums">{m.value}</div>
            <div className="text-[9px] text-muted-foreground">/{m.target}g</div>
          </div>
        </div>
      </div>
      <div className="text-[11px] text-muted-foreground mt-1.5 uppercase tracking-wider">{m.label}</div>
    </div>
  );
}

export function MacroRings() {
  return (
    <div className="flex justify-around items-center">
      {macros.map((m) => (
        <Ring key={m.label} m={m} />
      ))}
    </div>
  );
}
