import { Bell, ChevronDown } from "lucide-react";

export function CoachTopBar() {
  return (
    <header className="flex min-h-20 items-center justify-between border-b border-border bg-background px-5 lg:px-8">
      <div>
        <p className="text-sm text-muted-foreground">Coach Manager</p>
        <h1 className="text-xl font-bold tracking-tight">
          Good morning, Coach
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="hidden sm:flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium"
        >
          Sprint / Hurdles
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-background"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

