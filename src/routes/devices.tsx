import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/athleticiq/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Watch,
  Bluetooth,
  HeartPulse,
  Footprints,
  Flame,
  Activity,
  CheckCircle2,
  Loader2,
  Smartphone,
  ShieldCheck,
  Plug,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/devices")({
  head: () => ({
    meta: [
      { title: "Geräte verbinden — Athleticiq" },
      { name: "description", content: "Verbinde Smartwatches via Web Bluetooth mit Athleticiq." },
    ],
  }),
  component: DevicesPage,
});

// Web Bluetooth GATT service UUIDs
const HEART_RATE_SERVICE = 0x180d;
const HEART_RATE_MEASUREMENT = 0x2a37;
const BATTERY_SERVICE = 0x180f;
const BATTERY_LEVEL = 0x2a19;

type BTDevice = {
  id: string;
  name: string;
  device: BluetoothDevice;
  server?: BluetoothRemoteGATTServer;
  hr?: number;
  battery?: number;
  connected: boolean;
};

function DevicesPage() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<BTDevice[]>([]);
  const [permissions, setPermissions] = useState({
    heartRate: true,
    steps: true,
    sleep: true,
    workouts: true,
    hrv: true,
    calories: true,
  });
  const charRefs = useRef<Record<string, BluetoothRemoteGATTCharacteristic>>({});

  useEffect(() => {
    setSupported(typeof navigator !== "undefined" && "bluetooth" in navigator);
  }, []);

  const parseHeartRate = (value: DataView) => {
    const flags = value.getUint8(0);
    const is16 = flags & 0x1;
    return is16 ? value.getUint16(1, true) : value.getUint8(1);
  };

  const requestDevice = async () => {
    if (!("bluetooth" in navigator)) {
      toast.error("Web Bluetooth wird in diesem Browser nicht unterstützt", {
        description: "Nutze Chrome oder Edge auf Desktop/Android. iOS wird nicht unterstützt.",
      });
      return;
    }
    setScanning(true);
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [HEART_RATE_SERVICE] }],
        optionalServices: [BATTERY_SERVICE],
      });

      const id = device.id;
      const name = device.name || "Unbekanntes Gerät";

      const entry: BTDevice = { id, name, device, connected: false };
      setDevices((d) => [...d.filter((x) => x.id !== id), entry]);

      device.addEventListener("gattserverdisconnected", () => {
        setDevices((d) => d.map((x) => (x.id === id ? { ...x, connected: false } : x)));
        toast(`${name} getrennt`);
      });

      const server = await device.gatt!.connect();
      entry.server = server;

      // Heart rate notifications
      try {
        const hrService = await server.getPrimaryService(HEART_RATE_SERVICE);
        const hrChar = await hrService.getCharacteristic(HEART_RATE_MEASUREMENT);
        await hrChar.startNotifications();
        hrChar.addEventListener("characteristicvaluechanged", (e) => {
          const v = (e.target as BluetoothRemoteGATTCharacteristic).value;
          if (!v) return;
          const bpm = parseHeartRate(v);
          setDevices((d) => d.map((x) => (x.id === id ? { ...x, hr: bpm } : x)));
        });
        charRefs.current[id] = hrChar;
      } catch {
        // service missing — ignore
      }

      // Battery (optional)
      try {
        const batService = await server.getPrimaryService(BATTERY_SERVICE);
        const batChar = await batService.getCharacteristic(BATTERY_LEVEL);
        const v = await batChar.readValue();
        setDevices((d) => d.map((x) => (x.id === id ? { ...x, battery: v.getUint8(0) } : x)));
      } catch {
        // ignore
      }

      setDevices((d) => d.map((x) => (x.id === id ? { ...x, connected: true, server } : x)));
      toast.success(`${name} verbunden`, { description: "Live-Herzfrequenz wird gestreamt." });
    } catch (err: any) {
      if (err?.name !== "NotFoundError") {
        toast.error("Verbindung fehlgeschlagen", { description: err?.message ?? String(err) });
      }
    } finally {
      setScanning(false);
    }
  };

  const disconnect = (d: BTDevice) => {
    try {
      d.device.gatt?.disconnect();
    } catch {}
    setDevices((arr) => arr.filter((x) => x.id !== d.id));
  };

  const anyConnected = devices.some((d) => d.connected);

  return (
    <AppShell
      title="Geräte & Wearables"
      subtitle="Smartwatch · Live Bluetooth · Heart Rate"
      breadcrumbs={[
        { label: "Dashboard", to: "/" },
        { label: "Athletenprofil", to: "/profile" },
        { label: "Geräte" },
      ]}
    >
      {/* HERO */}
      <section className="rounded-3xl border border-border bg-card p-6 md:p-8 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative h-20 w-20 shrink-0 rounded-2xl bg-secondary grid place-items-center">
            <Watch className="h-10 w-10 text-foreground" strokeWidth={1.5} />
            <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-accent grid place-items-center text-accent-foreground">
              <Bluetooth className="h-3 w-3" strokeWidth={3} />
            </span>
          </div>
          <div className="flex-1">
            <Badge variant="outline" className="mb-2 border-border text-muted-foreground">
              {supported === false ? "Web Bluetooth nicht verfügbar" : "Web Bluetooth bereit"}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Verbinde deine Smartwatch
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Athleticiq verbindet sich direkt per Bluetooth mit deinem Heart-Rate-fähigen Gerät
              (Polar, Garmin, Wahoo, viele Brustgurte). Daten bleiben lokal in deinem Browser.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="rounded-xl border border-border bg-background px-3 py-2 text-center">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Verbunden</div>
              <div className="text-xl font-bold text-foreground">
                {devices.filter((d) => d.connected).length}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background px-3 py-2 text-center">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Metriken</div>
              <div className="text-xl font-bold">{Object.values(permissions).filter(Boolean).length}/6</div>
            </div>
          </div>
        </div>

        {supported === false && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
            <div>
              <div className="font-medium text-foreground">Browser nicht unterstützt</div>
              <p className="text-muted-foreground text-xs mt-1">
                Web Bluetooth funktioniert in Chrome / Edge auf Desktop und Android.
                Auf iOS (Safari) ist es systemseitig nicht verfügbar — nutze dort die native Companion-App.
              </p>
            </div>
          </div>
        )}
      </section>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* LEFT */}
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-semibold">Bluetooth-Geräte</h3>
            <Button
              size="sm"
              onClick={requestDevice}
              disabled={scanning || supported === false}
              className="gap-1.5"
            >
              {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plug className="h-4 w-4" />}
              {scanning ? "Suche…" : "Gerät hinzufügen"}
            </Button>
          </div>

          {devices.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-secondary grid place-items-center mb-3">
                <Bluetooth className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Noch kein Gerät verbunden. Klick auf „Gerät hinzufügen" und wähle deine Uhr / deinen Brustgurt.
              </p>
            </div>
          )}

          {devices.map((d) => (
            <div
              key={d.id}
              className={`rounded-2xl border bg-card p-4 md:p-5 shadow-sm transition-all ${
                d.connected ? "border-accent/40" : "border-border"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 rounded-2xl bg-secondary grid place-items-center">
                  <Watch className="h-7 w-7 text-foreground" />
                  {d.connected && (
                    <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-accent grid place-items-center text-accent-foreground">
                      <CheckCircle2 className="h-3 w-3" strokeWidth={3} />
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{d.name}</span>
                    {d.connected && (
                      <Badge variant="outline" className="text-[10px] border-accent/40 text-accent">
                        live
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">ID: {d.id.slice(0, 12)}…</p>
                  {d.connected && (
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                      {typeof d.hr === "number" && (
                        <span className="flex items-center gap-1">
                          <HeartPulse className="h-3 w-3 text-accent" /> {d.hr} bpm
                        </span>
                      )}
                      {typeof d.battery === "number" && <span>· 🔋 {d.battery}%</span>}
                    </div>
                  )}
                </div>

                <Button size="sm" variant="ghost" onClick={() => disconnect(d)}>
                  <X className="h-4 w-4 mr-1" />
                  Trennen
                </Button>
              </div>
            </div>
          ))}

          {/* PERMISSIONS */}
          <div className="rounded-2xl border border-border bg-card p-5 mt-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-foreground" />
              <h4 className="font-semibold">Datenzugriff</h4>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Du entscheidest, welche Metriken Athleticiq lesen darf. Änderungen wirken sofort.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "heartRate", label: "Herzfrequenz", icon: HeartPulse },
                { key: "hrv", label: "HRV", icon: Activity },
                { key: "steps", label: "Schritte", icon: Footprints },
                { key: "calories", label: "Kalorien", icon: Flame },
                { key: "sleep", label: "Schlaf", icon: Watch },
                { key: "workouts", label: "Workouts", icon: Watch },
              ].map(({ key, label, icon: Icon }) => {
                const on = permissions[key as keyof typeof permissions];
                return (
                  <button
                    key={key}
                    onClick={() => setPermissions((p) => ({ ...p, [key]: !on }))}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all border ${
                      on
                        ? "bg-secondary border-border text-foreground"
                        : "bg-background border-border text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{label}</span>
                    <span
                      className={`h-4 w-7 rounded-full p-0.5 transition-colors ${
                        on ? "bg-foreground" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`block h-3 w-3 rounded-full bg-background transition-transform ${
                          on ? "translate-x-3" : ""
                        }`}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* RIGHT */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Live-Daten</h4>
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    anyConnected ? "bg-accent" : "bg-muted-foreground"
                  }`}
                />
                {anyConnected ? "Streaming" : "Offline"}
              </span>
            </div>

            {anyConnected ? (
              <div className="space-y-3">
                {devices
                  .filter((d) => d.connected)
                  .map((d) => (
                    <Metric
                      key={d.id}
                      icon={HeartPulse}
                      label={d.name}
                      value={typeof d.hr === "number" ? d.hr : "—"}
                      unit="bpm"
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-secondary grid place-items-center mb-3">
                  <Smartphone className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Verbinde ein Gerät, um Live-Metriken zu sehen.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-foreground" />
              Hinweis
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Web Bluetooth erkennt Geräte, die den Standard-Heart-Rate-Service (0x180D) bereitstellen —
              z. B. Polar H10, Wahoo TICKR, Garmin HRM, viele Sportuhren im Broadcast-Modus.
              Apple Watch sendet HR nicht direkt via BT — dafür ist die Companion-App nötig.
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: typeof HeartPulse;
  label: string;
  value: number | string;
  unit?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background">
      <div className="h-9 w-9 rounded-lg bg-secondary grid place-items-center text-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground truncate">{label}</div>
        <div className="font-semibold">
          {value}
          {unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
        </div>
      </div>
    </div>
  );
}
