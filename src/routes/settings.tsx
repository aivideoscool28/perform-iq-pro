import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/athleticiq/AppShell";
import { Bell, Globe, Lock, Moon, Palette, Shield, Sparkles } from "lucide-react";
import { SignOutButton } from "@/components/athleticiq/SignOutButton";
import { fetchMyProfile, updateProfilePersonalization } from "@/lib/features/profile.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Einstellungen — AthleticIQ" },
      {
        name: "description",
        content: "Persönliche Einstellungen, Benachrichtigungen, Privatsphäre und Darstellung.",
      },
      { property: "og:title", content: "Einstellungen — AthleticIQ" },
      { property: "og:description", content: "Verwalte deine AthleticIQ-Präferenzen." },
    ],
  }),
  component: SettingsPage,
});

const STORAGE_KEY = "athleticiq.settings.v1";

type Settings = {
  pushTraining: boolean;
  pushRecovery: boolean;
  pushFriends: boolean;
  emailWeekly: boolean;
  shareWithCoach: boolean;
  publicProfile: boolean;
  units: "metric" | "imperial";
  language: "de" | "en";
  theme: "dark" | "auto";
};

const DEFAULTS: Settings = {
  pushTraining: true,
  pushRecovery: true,
  pushFriends: false,
  emailWeekly: true,
  shareWithCoach: true,
  publicProfile: false,
  units: "metric",
  language: "de",
  theme: "dark",
};

function SettingsPage() {
  const qc = useQueryClient();
  const fetchProfileFn = useServerFn(fetchMyProfile);
  const updatePersonalizationFn = useServerFn(updateProfilePersonalization);
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [favoriteAthlete, setFavoriteAthlete] = useState("");
  const [receiveNewsAndMotivation, setReceiveNewsAndMotivation] = useState(true);

  const { data: profileData } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfileFn(),
  });

  const profile =
    (profileData?.profile as
      | { favourite_athlete?: string | null; receive_news_and_motivation?: boolean | null }
      | undefined) ?? undefined;

  const savePersonalization = useMutation({
    mutationFn: (vars: { favouriteAthlete: string; receiveNewsAndMotivation: boolean }) =>
      updatePersonalizationFn({ data: vars }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["my-profile"] });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Persönliche Einstellungen gespeichert.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Speichern fehlgeschlagen"),
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* noop */
    }
  }, [settings]);

  useEffect(() => {
    if (profile) {
      setFavoriteAthlete(profile.favourite_athlete ?? "");
      setReceiveNewsAndMotivation(profile.receive_news_and_motivation !== false);
    }
  }, [profile]);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings((s) => ({ ...s, [key]: value }));

  const saveFavoriteAthlete = () => {
    savePersonalization.mutate({
      favouriteAthlete: favoriteAthlete.trim(),
      receiveNewsAndMotivation,
    });
  };

  const toggleNews = (value: boolean) => {
    setReceiveNewsAndMotivation(value);
    savePersonalization.mutate({
      favouriteAthlete: favoriteAthlete.trim(),
      receiveNewsAndMotivation: value,
    });
  };

  return (
    <AppShell
      title="Einstellungen"
      subtitle="Präferenzen · Benachrichtigungen · Privatsphäre"
      breadcrumbs={[
        { label: "Dashboard", to: "/" },
        { label: "Athletenprofil", to: "/profile" },
        { label: "Einstellungen" },
      ]}
    >
      <div className="grid gap-6 max-w-3xl">
        <SettingsCard
          icon={<Sparkles className="h-5 w-5 text-neon-cyan" />}
          title="Personalisierung"
          description="Lieblings-Athlet und Motivation auf dem Dashboard"
        >
          <div className="space-y-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
                Lieblings-Athlet
              </div>
              <input
                value={favoriteAthlete}
                onChange={(e) => setFavoriteAthlete(e.target.value)}
                placeholder="z.B. Mondo Duplantis"
                className="h-11 w-full rounded-2xl border border-border bg-background/70 px-3 text-sm outline-none focus:ring-2 focus:ring-neon-cyan/40"
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Diese Auswahl beeinflusst die Motivation und Inhalte auf dem Dashboard.
                </p>
                <button
                  type="button"
                  onClick={saveFavoriteAthlete}
                  disabled={savePersonalization.isPending}
                  className="rounded-xl border border-border px-3 py-2 text-xs font-medium transition hover:border-neon-cyan/40 disabled:opacity-60"
                >
                  Speichern
                </button>
              </div>
            </div>
            <Toggle
              label="News & Motivation"
              hint="Zeige passende Inhalte rund um deinen Favoriten und deine Disziplin"
              value={receiveNewsAndMotivation}
              onChange={toggleNews}
            />
          </div>
        </SettingsCard>

        <section className="glass-strong rounded-3xl p-6">
          <h2 className="font-semibold">Privatsphäre & Konto</h2>
          <p className="text-sm text-muted-foreground mt-2">
            KI-Verarbeitung, Coach-Freigabe und Zeitzone werden in deinem Profil gespeichert und
            serverseitig berücksichtigt.
          </p>
          <Link to="/profile" className="inline-block mt-4 underline text-accent">
            Profil und Freigaben bearbeiten
          </Link>
          <p className="mt-4 text-xs text-muted-foreground">
            Benachrichtigungen, Einheiten, Sessions und automatischer Datenexport sind noch nicht
            verfügbar.
          </p>
          <SignOutButton className="mt-4" />
        </section>
      </div>
    </AppShell>
  );
}

function SettingsCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-strong rounded-3xl p-6 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 h-48 w-48 bg-[radial-gradient(circle,oklch(0.78_0.2_235/0.12),transparent_70%)] blur-2xl" />
      <header className="relative flex items-start gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl glass grid place-items-center ring-1 ring-white/10">
          {icon}
        </div>
        <div>
          <h2 className="font-semibold tracking-tight">{title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </header>
      <div className="relative flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="group flex items-center justify-between gap-4 rounded-2xl px-4 py-3 glass hover:border-neon-cyan/40 transition text-left"
    >
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
      </div>
      <span
        className={[
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          value
            ? "bg-gradient-to-r from-neon-cyan to-neon-violet shadow-[0_0_14px_oklch(0.78_0.2_235/0.6)]"
            : "bg-white/10",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-all",
            value ? "left-[22px]" : "left-0.5",
          ].join(" ")}
        />
      </span>
    </button>
  );
}

function Segmented({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
        {label}
      </div>
      <div className="inline-flex glass rounded-2xl p-1 gap-1">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              className={[
                "px-3 py-1.5 text-xs rounded-xl transition-all font-medium",
                active
                  ? "bg-gradient-to-r from-neon-cyan/20 to-neon-violet/20 text-foreground ring-1 ring-neon-cyan/40"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="inline-flex items-center gap-2 glass rounded-xl px-3 py-2 text-xs font-medium hover:border-neon-cyan/40 hover:text-foreground text-muted-foreground transition">
      {icon}
      {label}
    </button>
  );
}
