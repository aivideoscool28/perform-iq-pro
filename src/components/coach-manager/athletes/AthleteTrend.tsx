type TrendTone = "review" | "watch" | "good" | "neutral";

type AthleteTrendProps = {
  points: number[];
  tone: TrendTone;
};

const strokeClasses: Record<TrendTone, string> = {
  review: "stroke-red-500",
  watch: "stroke-orange-500",
  good: "stroke-green-500",
  neutral: "stroke-slate-300",
};

const fillClasses: Record<TrendTone, string> = {
  review: "fill-red-500",
  watch: "fill-orange-500",
  good: "fill-green-500",
  neutral: "fill-slate-300",
};

export function AthleteTrend({ points, tone }: AthleteTrendProps) {
  const width = 86;
  const height = 22;
  const paddingX = 2;
  const paddingY = 3;

  const min = Math.min(...points);
  const max = Math.max(...points);

  const rawRange = Math.max(max - min, 1);
  const visualRange = Math.max(rawRange * 2.2, 5);

  const center = (max + min) / 2;
  const visualMin = center - visualRange / 2;
  const visualMax = center + visualRange / 2;

  const coordinates = points.map((point, index) => {
    const x =
      paddingX +
      (index / Math.max(points.length - 1, 1)) *
        (width - paddingX * 2);

    const y =
      height -
      paddingY -
      ((point - visualMin) / (visualMax - visualMin)) *
        (height - paddingY * 2);

    return { x, y };
  });

  const path = coordinates
    .map(
      ({ x, y }, index) =>
        `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`
    )
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-[22px] w-[86px] overflow-visible"
      aria-hidden="true"
    >
      <path
        d={path}
        fill="none"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={strokeClasses[tone]}
      />

      {coordinates.map(({ x, y }, index) => (
        <circle
          key={index}
          cx={x}
          cy={y}
          r="1.45"
          className={fillClasses[tone]}
        />
      ))}
    </svg>
  );
}
