import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/athleticiq/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Footprints, Sparkles, ShieldCheck, Zap, Star, Plus, Trash2, History, LogIn, Search, SlidersHorizontal, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { fetchDashboard } from "@/lib/athletic.functions";
import { fetchGear, upsertGearProfile, addGearLog, deleteGearLog } from "@/lib/gear.functions";
import { DisciplineSelector } from "@/components/athleticiq/DisciplineSelector";
import sprintImg from "@/assets/gear/sprint.jpg";
import mittelstreckeImg from "@/assets/gear/mittelstrecke.jpg";
import langstreckeImg from "@/assets/gear/langstrecke.jpg";
import huerdenImg from "@/assets/gear/huerden.jpg";
import sprungImg from "@/assets/gear/sprung.jpg";
import wurfImg from "@/assets/gear/wurf.jpg";
import trailImg from "@/assets/gear/trail.jpg";
import kraftImg from "@/assets/gear/kraft.jpg";
import allgemeinImg from "@/assets/gear/allgemein.jpg";

export const Route = createFileRoute("/gear")({
  head: () => ({
    meta: [
      { title: "Schuhe & Spikes — Athleticiq" },
      { name: "description", content: "KI-Empfehlung für Schuhe und Spikes je nach Disziplin." },
    ],
  }),
  component: GearPage,
});

type Discipline =
  | "sprint"
  | "mittelstrecke"
  | "langstrecke"
  | "hürden"
  | "sprung"
  | "wurf"
  | "trail"
  | "kraft"
  | "allgemein";

const IMAGES: Record<Discipline, string> = {
  sprint: sprintImg,
  mittelstrecke: mittelstreckeImg,
  langstrecke: langstreckeImg,
  hürden: huerdenImg,
  sprung: sprungImg,
  wurf: wurfImg,
  trail: trailImg,
  kraft: kraftImg,
  allgemein: allgemeinImg,
};

const DISCIPLINES: { id: Discipline; label: string; keywords: string[] }[] = [
  { id: "sprint", label: "Sprint (100–400 m)", keywords: ["sprint", "100m", "200m", "400m", "start"] },
  { id: "mittelstrecke", label: "Mittelstrecke (800–3000 m)", keywords: ["800", "1500", "3000", "mittel"] },
  { id: "langstrecke", label: "Langstrecke / Lauf", keywords: ["5k", "10k", "run", "lauf", "tempo", "easy", "endurance", "marathon"] },
  { id: "hürden", label: "Hürden", keywords: ["hürd", "hurdle"] },
  { id: "sprung", label: "Sprung (Weit / Hoch / Stab)", keywords: ["weit", "hoch", "stab", "jump", "sprung", "plyo"] },
  { id: "wurf", label: "Wurf (Kugel / Diskus / Speer)", keywords: ["kugel", "diskus", "speer", "throw", "wurf", "hammer"] },
  { id: "trail", label: "Trail / Cross", keywords: ["trail", "cross", "berg", "wald"] },
  { id: "kraft", label: "Kraft / Gym", keywords: ["kraft", "gym", "squat", "hip thrust", "bench", "deadlift", "strength"] },
  { id: "allgemein", label: "Allgemein / Warm-Up", keywords: ["mobility", "warm", "core", "yoga", "rest"] },
];

// Map detailed discipline IDs from DisciplineSelector → gear category
const DISCIPLINE_MAP: Record<string, Discipline> = {
  "60m": "sprint", "100m": "sprint", "200m": "sprint", "400m": "sprint",
  "800m": "mittelstrecke", "1500m": "mittelstrecke",
  "3000m": "langstrecke", "5000m": "langstrecke", "10000m": "langstrecke",
  steeple: "langstrecke",
  "60mH": "hürden", "100mH": "hürden", "110mH": "hürden", "400mH": "hürden",
  half: "langstrecke", marathon: "langstrecke",
  xc: "trail",
  lj: "sprung", tj: "sprung", hj: "sprung", pv: "sprung",
  sp: "wurf", dt: "wurf", ht: "wurf", jt: "wurf",
  hept: "allgemein", deca: "allgemein",
};

const REC: Record<Discipline, {
  type: "Spike" | "Schuh";
  models: { brand: string; name: string; why: string; priceEUR: number }[];
  tips: string[];
}> = {
  sprint: {
    type: "Spike",
    models: [
      { brand: "Nike", name: "Air Zoom Maxfly 2", why: "Carbon-Plate + Air Zoom Pod — der schnellste Sprint-Spike auf dem Markt (Weltrekorde 100–200 m).", priceEUR: 279 },
      { brand: "adidas", name: "Adizero Prime SP2 Strung", why: "Energy Rods + Strung-Upper — extrem steife Plate für Top-End-Speed.", priceEUR: 249 },
      { brand: "Puma", name: "evoSPEED Future Faster Nitro Elite+", why: "Nitro-Schaum + Carbon-Plate, ultraleicht — Favorit vieler Profi-Sprinter.", priceEUR: 229 },
      { brand: "Asics", name: "Metaspeed LD", why: "Innovative Carbon-Plate, präzise Energieübertragung — Geheimtipp für 100–400 m.", priceEUR: 219 },
      { brand: "New Balance", name: "FuelCell SuperComp PWR-X", why: "Energy-Arc Plate, aggressive Geometrie — explosiver Start.", priceEUR: 199 },
    ],
    tips: ["7 Pin-Spikes (Nadel oder Pyramide)", "Eng schnüren — Spike soll wie eine 2. Haut sitzen"],
  },
  mittelstrecke: {
    type: "Spike",
    models: [
      { brand: "Nike", name: "ZoomX Dragonfly 2", why: "ZoomX-Schaum + Pebax-Plate — Goldstandard für 800–5000 m.", priceEUR: 259 },
      { brand: "adidas", name: "Adizero Avanti TYO", why: "Energy Rods + Lightstrike Pro, optimale Balance aus Dämpfung und Pop.", priceEUR: 229 },
      { brand: "Puma", name: "evoSPEED Long Distance Nitro Elite+", why: "Nitro Elite Foam, top für lange Intervalle und 1500–3000 m.", priceEUR: 199 },
      { brand: "Asics", name: "Metaspeed MD", why: "Profi-Spike mit Carbon-Plate für 800–1500 m.", priceEUR: 189 },
    ],
    tips: ["6 mm Pyramid-Spikes auf Bahn", "Für Tempo-Workouts auf Bahn — auf Asphalt Trainingsschuh nutzen"],
  },
  langstrecke: {
    type: "Schuh",
    models: [
      { brand: "Nike", name: "Vaporfly 3", why: "Race-Day Carbon-Schuh für 5k–Marathon-Pace — Weltrekord-Plattform.", priceEUR: 269 },
      { brand: "adidas", name: "Adizero Adios Pro 3", why: "Energy Rods 2.0 + Lightstrike Pro — direkte Konkurrenz zum Vaporfly.", priceEUR: 249 },
      { brand: "Hoka", name: "Rocket X 2", why: "Carbon-Plate Race-Schuh, leicht und stabil.", priceEUR: 229 },
      { brand: "Asics", name: "Metaspeed Sky Paris", why: "FF Turbo Plus Foam, ideal für Stride-Runner.", priceEUR: 259 },
      { brand: "Nike", name: "Pegasus 41", why: "Daily-Trainer-Klassiker mit ReactX — perfekt für Easy & Tempo.", priceEUR: 139 },
    ],
    tips: ["Rotation: 1 Race-Schuh + 1 Daily-Trainer", "Wechsel alle 600–800 km"],
  },
  hürden: {
    type: "Spike",
    models: [
      { brand: "Nike", name: "Ja Fly 4", why: "Niedriger Stack, harte Plate — präzise Hürdenüberquerung.", priceEUR: 189 },
      { brand: "adidas", name: "Adizero Prime SP2", why: "Stabilität & Grip für Anlaufrhythmus.", priceEUR: 219 },
      { brand: "Puma", name: "evoSPEED Tokyo Future Faster+", why: "Aggressive Plate, leicht — beliebt im Hürden-Sprint.", priceEUR: 179 },
      { brand: "Asics", name: "Hyper LD 6", why: "Stabiler Mid-Cut für 400m Hürden.", priceEUR: 149 },
    ],
    tips: ["Pin-Spikes 7 mm", "Sehr fester Sitz im Vorfuß"],
  },
  sprung: {
    type: "Spike",
    models: [
      { brand: "Nike", name: "High Jump Elite", why: "Spezial-Spike mit Fersen-Pins für Hochsprung.", priceEUR: 169 },
      { brand: "adidas", name: "Adizero LJ", why: "Klassischer Weitsprung-Spike, harte Plate für Absprung.", priceEUR: 149 },
      { brand: "Nike", name: "Pole Vault Elite", why: "Stab-Spike mit Fersen-Pins und steifer Plate.", priceEUR: 179 },
      { brand: "Puma", name: "evoSPEED Long Jump 10", why: "Leicht und stabil im Anlauf — top für Weit & Dreisprung.", priceEUR: 139 },
    ],
    tips: ["Disziplin-spezifisches Modell wählen (Hoch vs. Weit/Stab)", "Absprungbein-Spike regelmäßig prüfen"],
  },
  wurf: {
    type: "Schuh",
    models: [
      { brand: "Nike", name: "Zoom Rotational 6", why: "Drehfreundliche Sohle für Diskus / Hammer / Kugel.", priceEUR: 119 },
      { brand: "adidas", name: "Adizero Discus/Hammer", why: "Flacher Schuh mit glatter Außensohle für Ring-Disziplinen.", priceEUR: 109 },
      { brand: "Nike", name: "Zoom JA Fly Javelin", why: "Speer-Spike mit Fersen-Pins, aggressiver Grip.", priceEUR: 139 },
      { brand: "Puma", name: "evoSPEED Throw 8", why: "Stabiler Wurfschuh, optimal für Kugel & Diskus.", priceEUR: 99 },
    ],
    tips: ["Speer: spezielle Speer-Spikes mit Fersen-Pins", "Kugel: glatte Sohle, kein Profil"],
  },
  trail: {
    type: "Schuh",
    models: [
      { brand: "Salomon", name: "S/Lab Genesis", why: "Aggressives Profil, Rock-Plate für Trail.", priceEUR: 219 },
      { brand: "Hoka", name: "Speedgoat 6", why: "Maximale Dämpfung für lange Trail-Runs.", priceEUR: 179 },
      { brand: "Nike", name: "Pegasus Trail 5 GTX", why: "Vielseitiger Trail-Schuh mit ReactX-Schaum.", priceEUR: 149 },
      { brand: "adidas", name: "Terrex Speed Ultra", why: "Leichter Race-Trail-Schuh, Continental-Außensohle.", priceEUR: 169 },
    ],
    tips: ["Stollen ≥ 4 mm bei nassem Untergrund", "Gamaschen bei losen Steinen"],
  },
  kraft: {
    type: "Schuh",
    models: [
      { brand: "Nike", name: "Romaleos 4", why: "Erhöhte Ferse + harte TPU-Sohle für Squat / Olympic Lifts.", priceEUR: 219 },
      { brand: "adidas", name: "Adipower 3", why: "Klassischer Lifting-Schuh, ultra-stabile Plattform.", priceEUR: 199 },
      { brand: "Nike", name: "Metcon 9", why: "Flache, stabile Sohle für Cross-Training, Hip Thrust & Up-Downs.", priceEUR: 149 },
      { brand: "adidas", name: "Dropset Trainer 2", why: "Stabiler Trainings-Schuh für Squat, Lunges & Power-Moves.", priceEUR: 119 },
      { brand: "Puma", name: "Fuse 3.0", why: "Flach & stabil — top für Deadlift und Functional.", priceEUR: 99 },
      { brand: "Reebok", name: "Nano X4", why: "Vielseitiger Lifting/CrossFit-Schuh mit stabilem Mittelfuß.", priceEUR: 139 },
    ],
    tips: ["Lifting-Schuh (Romaleos / Adipower) nur für Squat-Pattern", "Deadlift & Hip Thrust: flacher Trainer (Metcon / Nano)"],
  },
  allgemein: {
    type: "Schuh",
    models: [
      { brand: "Nike", name: "Free Metcon 6", why: "Vielseitig für Mobility, Core & leichtes Cross-Training.", priceEUR: 129 },
      { brand: "adidas", name: "Dropset Trainer 2", why: "Stabil & flexibel für Warm-Up und Functional.", priceEUR: 119 },
      { brand: "Puma", name: "Fuse 3.0", why: "Flach, leicht, ideal für Aufwärm-Drills.", priceEUR: 99 },
      { brand: "Reebok", name: "Nano X4", why: "Stabiler Allrounder fürs Athletik-Training.", priceEUR: 139 },
    ],
    tips: ["Flexible Sohle für Mobility-Drills", "Kein Carbon-Schuh fürs Aufwärmen"],
  },
};

function detectDiscipline(text: string): Discipline {
  const t = text.toLowerCase();
  for (const d of DISCIPLINES) {
    if (d.keywords.some((k) => t.includes(k))) return d.id;
  }
  return "allgemein";
}

function GearPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const fetchFn = useServerFn(fetchDashboard);
  const gearFn = useServerFn(fetchGear);
  const saveProfile = useServerFn(upsertGearProfile);
  const addLog = useServerFn(addGearLog);
  const delLog = useServerFn(deleteGearLog);

  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: () => fetchFn(), enabled: !!user });
  const { data: gear } = useQuery({ queryKey: ["gear"], queryFn: () => gearFn(), enabled: !!user });
  const workouts = data?.workouts ?? [];
  const profile = gear?.profile;
  const logs = gear?.logs ?? [];

  const autoDiscipline = useMemo<Discipline>(() => {
    const last = workouts[0];
    if (!last) return "allgemein";
    const text = [last.raw_input, last.summary, JSON.stringify(last.exercises ?? [])].join(" ");
    return detectDiscipline(text);
  }, [workouts]);

  const [selected, setSelected] = useState<Discipline | null>(null);
  const active = selected ?? autoDiscipline;
  const rec = REC[active];
  const disciplineLabel = DISCIPLINES.find((d) => d.id === active)?.label ?? active;
  const preferred = profile?.preferred_brands ?? [];

  // Sort models so preferred brands appear first
  const orderedModels = useMemo(() => {
    return [...rec.models].sort((a, b) => {
      const aPref = preferred.includes(a.brand) ? 0 : 1;
      const bPref = preferred.includes(b.brand) ? 0 : 1;
      return aPref - bPref;
    });
  }, [rec.models, preferred]);

  // Profile form state
  const [shoeSize, setShoeSize] = useState("");
  const [footWidth, setFootWidth] = useState("");
  const [brandsText, setBrandsText] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!profile) return;
    setShoeSize(profile.shoe_size_eu?.toString() ?? "");
    setFootWidth(profile.foot_width ?? "");
    setBrandsText((profile.preferred_brands ?? []).join(", "));
    setNotes(profile.notes ?? "");
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      await saveProfile({
        data: {
          shoe_size_eu: shoeSize ? Number(shoeSize) : null,
          foot_width: footWidth || null,
          preferred_brands: brandsText
            .split(",")
            .map((b) => b.trim())
            .filter(Boolean),
          notes: notes || null,
        },
      });
      toast.success("Gear-Profil gespeichert");
      qc.invalidateQueries({ queryKey: ["gear"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Speichern");
    }
  };

  // Log form
  const [logBrand, setLogBrand] = useState("");
  const [logModel, setLogModel] = useState("");
  const [logDistance, setLogDistance] = useState("");

  // Filters for recommendations
  const [brandSearch, setBrandSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const activeBrands = useMemo(() => {
    const brands = new Set(rec.models.map((m) => m.brand));
    return Array.from(brands).sort();
  }, [rec]);

  const filteredModels = useMemo(() => {
    const min = minPrice ? Number(minPrice) : 0;
    const max = maxPrice ? Number(maxPrice) : Infinity;
    const search = brandSearch.toLowerCase().trim();
    return orderedModels.filter((m) => {
      const inRange = m.priceEUR >= min && m.priceEUR <= max;
      const matchesBrand = !search || m.brand.toLowerCase().includes(search);
      return inRange && matchesBrand;
    });
  }, [orderedModels, minPrice, maxPrice, brandSearch]);

  const clearFilters = () => {
    setBrandSearch("");
    setMinPrice("");
    setMaxPrice("");
  };
  const handleAddLog = async (preset?: { brand: string; model: string }) => {
    const brand = preset?.brand ?? logBrand;
    const model = preset?.model ?? logModel;
    if (!brand || !model) {
      toast.error("Marke und Modell angeben");
      return;
    }
    try {
      await addLog({
        data: {
          brand,
          model,
          discipline: active,
          distance_km: logDistance ? Number(logDistance) : null,
        },
      });
      toast.success(`${brand} ${model} eingetragen`);
      setLogBrand("");
      setLogModel("");
      setLogDistance("");
      qc.invalidateQueries({ queryKey: ["gear"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Eintragen");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await delLog({ data: { id } });
      qc.invalidateQueries({ queryKey: ["gear"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler");
    }
  };

  return (
    <AppShell title="Schuhe & Spikes" subtitle="KI-Empfehlung passend zu deiner Disziplin">
      {/* HERO with image */}
      <section className="relative glass rounded-2xl overflow-hidden mb-6">
        <div className="grid md:grid-cols-[1fr_280px] gap-0">
          <div className="p-5">
            <div className="flex items-center gap-2 text-xs text-neon-cyan mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              {user ? "Automatisch erkannt aus deinem letzten Training" : "Wähle deine Disziplin"}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Footprints className="h-6 w-6 text-neon-violet" />
              <h2 className="text-xl font-bold tracking-tight">{disciplineLabel}</h2>
              <Badge variant="secondary">{rec.type}</Badge>
            </div>
            {user && workouts[0]?.raw_input && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                „{workouts[0].raw_input}"
              </p>
            )}
            {user && profile?.shoe_size_eu && (
              <p className="text-xs text-muted-foreground mt-3">
                Empfehlungen abgestimmt auf <span className="text-foreground font-semibold">Gr. EU {profile.shoe_size_eu}</span>
                {preferred.length > 0 && (
                  <> · bevorzugt {preferred.join(", ")}</>
                )}
              </p>
            )}
          </div>
          <img
            src={IMAGES[active]}
            alt={`${disciplineLabel} ${rec.type}`}
            loading="lazy"
            width={560}
            height={560}
            className="w-full h-44 md:h-full object-cover"
          />
        </div>
      </section>

      {/* DISCIPLINE PICKER (searchable, grouped) */}
      <section className="mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Disziplin wählen
        </h3>
        <DisciplineSelector
          hideSpikePanel
          onSelect={(d) => setSelected(DISCIPLINE_MAP[d.id] ?? "allgemein")}
        />
      </section>


      {/* FILTERS */}
      <section className="glass rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal className="h-4 w-4 text-neon-cyan" />
          <h3 className="text-sm font-semibold">Filter</h3>
          {(brandSearch || minPrice || maxPrice) && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <X className="h-3 w-3" /> Zurücksetzen
            </button>
          )}
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Marke suchen …"
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div>
            <Input
              type="number"
              min={0}
              placeholder="Min. Preis (€)"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div>
            <Input
              type="number"
              min={0}
              placeholder="Max. Preis (€)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {activeBrands.map((b) => (
            <button
              key={b}
              onClick={() => setBrandSearch(b)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                brandSearch.toLowerCase() === b.toLowerCase()
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-secondary-foreground border-border hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </section>

      {/* MODEL CARDS WITH IMAGES */}
      <section className="grid md:grid-cols-2 gap-4 mb-6">
        {filteredModels.map((m) => {
          const isPreferred = preferred.includes(m.brand);
          return (
            <div
              key={m.brand + m.name}
              className="glass rounded-2xl overflow-hidden hover:glow-cyan transition-all flex flex-col"
            >
              <div className="relative">
                <img
                  src={IMAGES[active]}
                  alt={`${m.brand} ${m.name}`}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="w-full h-44 object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {isPreferred && (
                    <Badge className="bg-neon-lime/20 text-neon-lime border-neon-lime/40">
                      <Star className="h-3 w-3 mr-1" /> Favorit
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px] backdrop-blur bg-background/60">
                    <Zap className="h-3 w-3 mr-1" /> Top Pick
                  </Badge>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{m.brand}</span>
                  <span className="text-sm font-bold text-neon-cyan">{m.priceEUR} €</span>
                </div>
                <h4 className="text-lg font-bold mb-2">{m.name}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{m.why}</p>
                {user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 self-start"
                    onClick={() => handleAddLog({ brand: m.brand, model: m.name })}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Ich trage dieses Modell
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        {filteredModels.length === 0 && (
          <div className="md:col-span-2 text-center py-10 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Keine Modelle passen zu deinen Filtern.</p>
            <button onClick={clearFilters} className="text-xs text-neon-cyan hover:underline mt-1 cursor-pointer">
              Filter zurücksetzen
            </button>
          </div>
        )}
      </section>

      {/* TIPS */}
      <section className="glass rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-neon-lime" />
          <h3 className="font-semibold">Profi-Tipps</h3>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {rec.tips.map((t) => (
            <li key={t} className="flex gap-2">
              <span className="text-neon-cyan">·</span> {t}
            </li>
          ))}
        </ul>
      </section>

      {user ? (
        <>
          {/* MY GEAR PROFILE */}
          <section className="glass rounded-2xl p-5 mb-6">
            <h3 className="text-lg font-bold mb-1">Mein Gear-Profil</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Wird gespeichert und für deine Empfehlungen genutzt.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="size">Schuhgröße (EU)</Label>
                <Input
                  id="size"
                  type="number"
                  step="0.5"
                  min="20"
                  max="60"
                  placeholder="z.B. 43"
                  value={shoeSize}
                  onChange={(e) => setShoeSize(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="width">Fußbreite</Label>
                <Input
                  id="width"
                  placeholder="schmal / normal / breit"
                  value={footWidth}
                  onChange={(e) => setFootWidth(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="brands">Bevorzugte Marken (komma-getrennt)</Label>
                <Input
                  id="brands"
                  placeholder="Nike, adidas, Hoka"
                  value={brandsText}
                  onChange={(e) => setBrandsText(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes">Notizen</Label>
                <Textarea
                  id="notes"
                  placeholder="Hallux links, brauche breitere Toebox …"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            <Button onClick={handleSaveProfile} className="mt-4">Profil speichern</Button>
          </section>

          {/* GEAR LOGS / SWAPS */}
          <section className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <History className="h-4 w-4 text-neon-cyan" />
              <h3 className="text-lg font-bold">Meine Wechsel</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Trage jeden neuen Schuh ein, damit wir Verschleiß und Rotation tracken.
            </p>

            <div className="grid md:grid-cols-[1fr_1fr_120px_auto] gap-2 mb-4">
              <Input placeholder="Marke" value={logBrand} onChange={(e) => setLogBrand(e.target.value)} />
              <Input placeholder="Modell" value={logModel} onChange={(e) => setLogModel(e.target.value)} />
              <Input
                type="number"
                placeholder="km"
                value={logDistance}
                onChange={(e) => setLogDistance(e.target.value)}
              />
              <Button onClick={() => handleAddLog()}>
                <Plus className="h-4 w-4 mr-1" /> Eintragen
              </Button>
            </div>

            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Noch keine Wechsel eingetragen.
              </p>
            ) : (
              <ul className="space-y-2">
                {logs.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-border/40"
                  >
                    <Footprints className="h-4 w-4 text-neon-violet shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {l.brand} · {l.model}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        seit {new Date(l.started_on).toLocaleDateString("de")}
                        {l.distance_km != null && ` · ${l.distance_km} km`}
                        {l.discipline && ` · ${l.discipline}`}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(l.id)}
                      aria-label="Löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : (
        <section className="glass rounded-2xl p-6 text-center">
          <LogIn className="h-8 w-8 text-neon-cyan mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-1">Personalisierte Empfehlungen</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Melde dich an, um dein Gear-Profil zu speichern, bevorzugte Marken festzulegen und deine Schuh-Wechsel zu tracken.
          </p>
          <Link to="/auth">
            <Button>
              <LogIn className="h-4 w-4 mr-2" /> Anmelden
            </Button>
          </Link>
        </section>
      )}
    </AppShell>
  );
}
