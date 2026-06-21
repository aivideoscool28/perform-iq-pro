import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SpikeInfo = {
  name: string;
  pinCount: string;
  plateStiffness: string;
  heelDrop: string;
  features: readonly string[];
  why: string;
};

export type Discipline = {
  id: string;
  label: string;
  category: CategoryId;
  spike: SpikeInfo;
};

type CategoryId =
  | "sprints"
  | "middle-long"
  | "hurdles"
  | "road-xc"
  | "jumps"
  | "throws"
  | "combined";

const CATEGORIES: { id: CategoryId; label: string; color: string }[] = [
  { id: "sprints", label: "Sprints", color: "bg-rose-500/20 text-rose-300 border-rose-500/40" },
  { id: "middle-long", label: "Mittel & Lang", color: "bg-sky-500/20 text-sky-300 border-sky-500/40" },
  { id: "hurdles", label: "Hürden", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  { id: "road-xc", label: "Straße & XC", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  { id: "jumps", label: "Sprünge", color: "bg-violet-500/20 text-violet-300 border-violet-500/40" },
  { id: "throws", label: "Würfe", color: "bg-orange-500/20 text-orange-300 border-orange-500/40" },
  { id: "combined", label: "Mehrkampf", color: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40" },
];

const SPIKES = {
  sprint: {
    name: "Sprint Spikes",
    pinCount: "6–8 Pins",
    plateStiffness: "Sehr steif (Carbon)",
    heelDrop: "Niedrig (0–4 mm)",
    features: ["Steife Carbon-Plate", "Aggressive Spike-Position", "Minimaler Heel-Drop"],
    why: "Maximale Energie-Rückgabe und Vorfußbetonung für explosive Beschleunigung und Top-Speed.",
  },
  hybrid: {
    name: "Sprint / Mittelstrecke Hybrid",
    pinCount: "6 Pins",
    plateStiffness: "Steif mit leichter Flex",
    heelDrop: "Niedrig (4–6 mm)",
    features: ["Etwas mehr Dämpfung", "Vielseitige Plate", "Für längere Sprints"],
    why: "Balance aus Steifheit und Komfort für 400m und längere Hürden-Distanzen.",
  },
  middle: {
    name: "Middle-Distance Spikes",
    pinCount: "4–6 Pins",
    plateStiffness: "Flexibel",
    heelDrop: "Mittel (4–6 mm)",
    features: ["Flexible Plate", "Leichte Dämpfung", "Geringes Gewicht"],
    why: "Flexibilität für längere Bahnrunden ohne Wadenermüdung.",
  },
  distance: {
    name: "Distance Spikes",
    pinCount: "4 Pins",
    plateStiffness: "Moderat",
    heelDrop: "Mittel (6–8 mm)",
    features: ["Ultraleicht", "Gedämpfte Ferse", "Atmungsaktiv"],
    why: "Leichtigkeit und Dämpfung für 5k–10k auf der Bahn.",
  },
  steeple: {
    name: "Steeplechase Spikes",
    pinCount: "4–6 Pins",
    plateStiffness: "Moderat",
    heelDrop: "Mittel (6 mm)",
    features: ["Wasserabweisend", "Griffige Außensohle", "Drainage-Mesh"],
    why: "Wasserabweisung und Grip für Wassergraben und nasse Bahn.",
  },
  super: {
    name: "Racing Flats / Super Shoes",
    pinCount: "Keine Spikes",
    plateStiffness: "Carbon-Plate",
    heelDrop: "Hoch (8–10 mm)",
    features: ["Carbon-Plate", "Reaktiver Schaum", "Stack-Height max."],
    why: "Energie-Rückgabe und Dämpfung für Straßenrennen und Marathon.",
  },
  xc: {
    name: "XC Spikes",
    pinCount: "6–9 Pins (lang)",
    plateStiffness: "Steif",
    heelDrop: "Niedrig (4–6 mm)",
    features: ["Aggressive Stollen", "6–9 mm Spikes", "Schmutz-resistent"],
    why: "Grip auf Matsch, Gras und unebenem Gelände.",
  },
  jump: {
    name: "Jump Spikes (Weit/Drei)",
    pinCount: "6–8 Pins",
    plateStiffness: "Sehr steif",
    heelDrop: "Niedrig",
    features: ["Steife Toe-Box", "Heel-Spike-Plate", "Stabiler Absprung"],
    why: "Energie-Transfer beim Absprung und Schutz bei Landung.",
  },
  highJump: {
    name: "High Jump Spikes",
    pinCount: "6 Pins (Ferse + Vorfuß)",
    plateStiffness: "Steif",
    heelDrop: "Niedrig",
    features: ["Fersen-Spikes", "Knöchel-Support", "Asymmetrisches Design"],
    why: "Grip beim Absprung von der Ferse und Stabilität in der Kurve.",
  },
  poleVault: {
    name: "Pole Vault Spikes",
    pinCount: "8+ Pins (Voll)",
    plateStiffness: "Sehr steif",
    heelDrop: "Mittel",
    features: ["Voll-Spike-Plate", "Knöchel-Support", "Verstärkte Ferse"],
    why: "Maximaler Grip im Anlauf und Stabilität beim Einstich.",
  },
  throw: {
    name: "Throwing Shoes",
    pinCount: "Keine Spikes",
    plateStiffness: "Glatte Sohle",
    heelDrop: "Flach",
    features: ["Drehfreundliche Sohle", "Glattes Außenmaterial", "Stabile Mittelsohle"],
    why: "Reibungsarme Drehbewegung im Wurfring.",
  },
  javelin: {
    name: "Javelin Spikes",
    pinCount: "7–11 Pins (Ferse + Vorfuß)",
    plateStiffness: "Steif",
    heelDrop: "Niedrig",
    features: ["Fersen-Spikes", "Verstärkte Toe-Box", "Hoher Schaft"],
    why: "Abbremsung im Anlauf und Schutz beim Stemmschritt.",
  },
  combined: {
    name: "All-Around Spikes",
    pinCount: "6 Pins",
    plateStiffness: "Mittel-steif",
    heelDrop: "Niedrig",
    features: ["Vielseitige Plate", "Komfort über Stunden", "Multi-Event"],
    why: "Kompromiss-Spike für 7/10 Disziplinen an einem Tag.",
  },
} as const;

const DISCIPLINES: Discipline[] = [
  // Sprints
  { id: "60m", label: "60 m", category: "sprints", spike: SPIKES.sprint },
  { id: "100m", label: "100 m", category: "sprints", spike: SPIKES.sprint },
  { id: "200m", label: "200 m", category: "sprints", spike: SPIKES.sprint },
  { id: "400m", label: "400 m", category: "sprints", spike: SPIKES.hybrid },
  // Middle / Long
  { id: "800m", label: "800 m", category: "middle-long", spike: SPIKES.middle },
  { id: "1500m", label: "1500 m", category: "middle-long", spike: SPIKES.middle },
  { id: "3000m", label: "3000 m", category: "middle-long", spike: SPIKES.distance },
  { id: "5000m", label: "5000 m", category: "middle-long", spike: SPIKES.distance },
  { id: "10000m", label: "10 000 m", category: "middle-long", spike: SPIKES.distance },
  { id: "steeple", label: "3000 m Hindernis", category: "middle-long", spike: SPIKES.steeple },
  // Hurdles
  { id: "60mH", label: "60 m Hürden", category: "hurdles", spike: SPIKES.sprint },
  { id: "100mH", label: "100 m Hürden", category: "hurdles", spike: SPIKES.sprint },
  { id: "110mH", label: "110 m Hürden", category: "hurdles", spike: SPIKES.sprint },
  { id: "400mH", label: "400 m Hürden", category: "hurdles", spike: SPIKES.hybrid },
  // Road / XC
  { id: "half", label: "Halbmarathon", category: "road-xc", spike: SPIKES.super },
  { id: "marathon", label: "Marathon", category: "road-xc", spike: SPIKES.super },
  { id: "xc", label: "Cross Country", category: "road-xc", spike: SPIKES.xc },
  // Jumps
  { id: "lj", label: "Weitsprung", category: "jumps", spike: SPIKES.jump },
  { id: "tj", label: "Dreisprung", category: "jumps", spike: SPIKES.jump },
  { id: "hj", label: "Hochsprung", category: "jumps", spike: SPIKES.highJump },
  { id: "pv", label: "Stabhochsprung", category: "jumps", spike: SPIKES.poleVault },
  // Throws
  { id: "sp", label: "Kugelstoß", category: "throws", spike: SPIKES.throw },
  { id: "dt", label: "Diskuswurf", category: "throws", spike: SPIKES.throw },
  { id: "ht", label: "Hammerwurf", category: "throws", spike: SPIKES.throw },
  { id: "jt", label: "Speerwurf", category: "throws", spike: SPIKES.javelin },
  // Combined
  { id: "hept", label: "Siebenkampf", category: "combined", spike: SPIKES.combined },
  { id: "deca", label: "Zehnkampf", category: "combined", spike: SPIKES.combined },
];

export function DisciplineSelector({
  onSelect,
  hideSpikePanel = false,
}: {
  onSelect?: (d: Discipline) => void;
  hideSpikePanel?: boolean;
} = {}) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<CategoryId | "all">("all");
  const [selected, setSelected] = useState<Discipline | null>(null);

  const handleSelect = (d: Discipline) => {
    setSelected(d);
    onSelect?.(d);
  };

  const filtered = useMemo(() => {
    return DISCIPLINES.filter((d) => {
      const matchCat = activeCat === "all" || d.category === activeCat;
      const matchQuery = d.label.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [query, activeCat]);

  const grouped = useMemo(() => {
    const map = new Map<CategoryId, Discipline[]>();
    for (const d of filtered) {
      const arr = map.get(d.category) ?? [];
      arr.push(d);
      map.set(d.category, arr);
    }
    return map;
  }, [filtered]);

  const catOf = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Disziplin suchen … (z.B. 100 m, Weitsprung)"
            className="pl-9"
            aria-label="Disziplin suchen"
          />
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeCat === "all" ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setActiveCat("all")}
          >
            Alle
          </Button>
          {CATEGORIES.map((c) => (
            <Button
              key={c.id}
              variant={activeCat === c.id ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setActiveCat(c.id)}
            >
              {c.label}
            </Button>
          ))}
        </div>

        {/* Grouped disciplines */}
        <div className="space-y-4">
          {[...grouped.entries()].map(([catId, items]) => {
            const cat = catOf(catId);
            return (
              <div key={catId}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={cn("border", cat.color)}>
                    {cat.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {items.length} {items.length === 1 ? "Disziplin" : "Disziplinen"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map((d) => {
                    const isSelected = selected?.id === d.id;
                    return (
                      <button
                        key={d.id}
                        onClick={() => handleSelect(d)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm border transition-all",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow"
                            : "bg-card/40 border-border hover:border-primary/60 hover:bg-card",
                        )}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Keine Disziplin gefunden.
            </p>
          )}
        </div>

        {/* Spike info panel */}
        <AnimatePresence mode="wait">
          {selected && !hideSpikePanel && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Card className="border-primary/30 shadow-lg overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        {selected.label}
                      </div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {selected.spike.name}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              aria-label="Warum dieser Spike?"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Info className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-xs leading-relaxed">{selected.spike.why}</p>
                          </TooltipContent>
                        </Tooltip>
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className={cn("border", catOf(selected.category).color)}>
                      {catOf(selected.category).label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Stat label="Pin-Anzahl" value={selected.spike.pinCount} />
                    <Stat label="Plate-Steifheit" value={selected.spike.plateStiffness} />
                    <Stat label="Heel-Drop" value={selected.spike.heelDrop} />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      Key Features
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.spike.features.map((f) => (
                        <Badge key={f} variant="secondary" className="font-normal">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <details className="group rounded-lg border border-border/60 p-3 bg-card/40">
                    <summary className="cursor-pointer text-sm font-medium flex items-center gap-2">
                      <Info className="h-3.5 w-3.5 text-primary" />
                      Warum dieser Spike?
                    </summary>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                      {selected.spike.why}
                    </p>
                  </details>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold mt-1">{value}</div>
    </div>
  );
}
