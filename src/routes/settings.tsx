import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/athleticiq/AppShell";
import { Bell, Globe, Lock, Moon, Palette, Shield } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Einstellungen — AthleticIQ" },
      { name: "description", content: "Persönliche Einstellungen, Benachrichtigungen, Privatsphäre und Darstellung." },
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
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

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

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings((s) => ({ ...s, [key]: value }));

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
          icon={<Bell className="h-5 w-5 text-neon-cyan" />}
          title="Benachrichtigungen"
          description="Wann darf AthleticIQ dich erreichen?"
        >
          <Toggle
            label="Trainings-Erinnerungen"
            hint="Push-Notifications vor geplanten Einheiten"
            value={settings.pushTraining}
            onChange={(v) => update("pushTraining", v)}
          />
          <Toggle
            label="Regenerations-Alerts"
            hint="Wenn HRV oder Schlaf unter Baseline fallen"
            value={settings.pushRecovery}
            onChange={(v) => update("pushRecovery", v)}
          />
          <Toggle
            label="Freundes-Aktivitäten"
            hint="Streaks, PRs und Wettkämpfe deiner Crew"
            value={settings.pushFriends}
            onChange={(v) => update("pushFriends", v)}
          />
          <Toggle
            label="Wochen-Report (E-Mail)"
            hint="Jeden Montagmorgen, kompakt aufbereitet"
            value={settings.emailWeekly}
            onChange={(v) => update("emailWeekly", v)}
          />
        </SettingsCard>

        <SettingsCard
          icon={<Shield className="h-5 w-5 text-neon-lime" />}
          title="Privatsphäre"
          description="Wer sieht deine Daten?"
        >
          <Toggle
            label="Daten mit KI-Coach teilen"
            hint="Erforderlich für personalisierte Empfehlungen"
            value={settings.shareWithCoach}
            onChange={(v) => update("shareWithCoach", v)}
          />
          <Toggle
            label="Öffentliches Profil"
            hint="Erlaubt Freunden, dein Profil zu finden"
            value={settings.publicProfile}
            onChange={(v) => update("publicProfile", v)}
          />
        </SettingsCard>

        <SettingsCard
          icon={<Palette className="h-5 w-5 text-neon-violet" />}
          title="Darstellung & Region"
          description="Sprache, Einheiten und Theme"
        >
          <Segmented
            label="Einheiten"
            value={settings.units}
            onChange={(v) => update("units", v as Settings["units"])}
            options={[
              { value: "metric", label: "Metrisch (kg/km)" },
              { value: "imperial", label: "Imperial (lb/mi)" },
            ]}
          />
          <Segmented
            label="Sprache"
            value={settings.language}
            onChange={(v) => update("language", v as Settings["language"])}
            options={[
              { value: "de", label: "Deutsch" },
              { value: "en", label: "English" },
            ]}
          />
          <Segmented
            label="Theme"
            value={settings.theme}
            onChange={(v) => update("theme", v as Settings["theme"])}
            options={[
              { value: "dark", label: "Dark (Stadion)" },
              { value: "auto", label: "Auto (Systemwahl)" },
            ]}
          />
        </SettingsCard>

        <SettingsCard
          icon={<Lock className="h-5 w-5 text-neon-red" />}
          title="Konto & Sicherheit"
          description="Passwort, Sessions, Datenexport"
        >
          <div className="flex flex-wrap gap-2">
            <ActionButton icon={<Lock className="h-4 w-4" />} label="Passwort ändern" />
            <ActionButton icon={<Globe className="h-4 w-4" />} label="Sessions anzeigen" />
            <ActionButton icon={<Moon className="h-4 w-4" />} label="Daten exportieren" />
          </div>
        </SettingsCard>
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
