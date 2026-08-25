import {
  BookOpen,
  Copy,
  Dumbbell,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";

const createOptions = [
  {
    label: "Start from scratch",
    detail: "Build your own session",
    icon: Plus,
    style: "bg-orange-50 text-orange-500",
  },
  {
    label: "Use previous training",
    detail: "Copy and adapt",
    icon: Copy,
    style: "bg-blue-50 text-blue-600",
  },
  {
    label: "Use template",
    detail: "Choose from templates",
    icon: BookOpen,
    style: "bg-violet-50 text-violet-600",
  },
  {
    label: "Create with AI",
    detail: "Let AI help you build",
    icon: Sparkles,
    style: "bg-violet-50 text-violet-600",
  },
];

const categories = [
  { label: "Sprint", style: "bg-orange-50 text-orange-600" },
  { label: "Hurdles", style: "bg-violet-50 text-violet-600" },
  { label: "Strength", style: "bg-green-50 text-green-600" },
  { label: "Mobility", style: "bg-blue-50 text-blue-600" },
];

export function TrainingTools() {
  return (
    <div className="grid grid-cols-[1.2fr_0.8fr] gap-3">
      <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
        <h3 className="text-xs font-bold">Create Training</h3>

        <p className="mt-1 text-[9px] text-muted-foreground">
          Build a new training session in a few clicks.
        </p>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {createOptions.map(({ label, detail, icon: Icon, style }) => (
            <button
              key={label}
              type="button"
              className="flex items-center gap-2 rounded-xl border border-border p-2 text-left transition hover:bg-muted/20"
            >
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${style}`}>
                <Icon className="h-4 w-4" />
              </div>

              <div>
                <p className="text-[9px] font-semibold">{label}</p>
                <p className="text-[8px] text-muted-foreground">{detail}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold">Exercise Library</h3>
            <p className="mt-1 text-[9px] text-muted-foreground">
              Save time using reusable exercises.
            </p>
          </div>

          <Dumbbell className="h-4 w-4 text-orange-500" />
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-lg border border-border px-2 py-1.5">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />

          <input
            placeholder="Search exercises..."
            className="w-full bg-transparent text-[9px] outline-none"
          />
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {categories.map((category) => (
            <button
              key={category.label}
              type="button"
              className={`rounded-full px-2.5 py-1 text-[8px] font-semibold ${category.style}`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="mt-3 text-[9px] font-semibold text-orange-600"
        >
          Browse all exercises →
        </button>
      </section>
    </div>
  );
}
