import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/athleticiq/AppShell";
import { DisciplineSelector } from "@/components/athleticiq/DisciplineSelector";

export const Route = createFileRoute("/disciplines")({
  head: () => ({
    meta: [
      { title: "Disziplinen & Spikes — Athleticiq" },
      {
        name: "description",
        content:
          "Alle Leichtathletik-Disziplinen mit passender Spike-Empfehlung: Pin-Anzahl, Plate-Steifheit, Heel-Drop.",
      },
    ],
  }),
  component: DisciplinesPage,
});

function DisciplinesPage() {
  return (
    <AppShell
      title="Disziplinen & Spikes"
      subtitle="Wähle deine Disziplin und sieh den empfohlenen Spike-Typ"
    >
      <DisciplineSelector />
    </AppShell>
  );
}
