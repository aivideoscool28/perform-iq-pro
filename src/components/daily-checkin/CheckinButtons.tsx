type GridProps = {
  options: string[];
  value: string | null;
  onSelect: (value: string) => void;
};

export function Grid({
  options,
  value,
  onSelect,
}: GridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {options.map((option) => {
        const selected = value === option;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            style={{
              backgroundColor: selected ? "#ff6b35" : "#111827",
              color: "#ffffff",
              borderColor: selected ? "#ff6b35" : "#374151",
            }}
            className="min-h-[52px] px-4 py-3 rounded-2xl border text-sm font-semibold transition hover:opacity-90 shadow-sm"
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

type RateBarProps = {
  max: number;
  value: number | null;
  onSelect: (value: number) => void;
};

export function RateBar({
  max,
  value,
  onSelect,
}: RateBarProps) {
  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplateColumns: `repeat(${max}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: max }, (_, index) => index + 1).map((number) => {
        const selected = value === number;

        return (
          <button
            key={number}
            type="button"
            onClick={() => onSelect(number)}
            style={{
              backgroundColor: selected ? "#ff6b35" : "#111827",
              color: "#ffffff",
              borderColor: selected ? "#ff6b35" : "#374151",
            }}
            className="min-h-[48px] rounded-2xl border font-semibold transition hover:opacity-90 shadow-sm"
          >
            {number}
          </button>
        );
      })}
    </div>
  );
}
