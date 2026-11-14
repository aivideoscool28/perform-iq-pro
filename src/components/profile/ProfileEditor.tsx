import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { Tables } from "@/integrations/supabase/types";
import { profileEditSchema, type ProfileEdit } from "@/lib/profile-schema";
import { updateAthleteProfile } from "@/lib/features/profile.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
function initialValues(profile: Tables<"profiles">): ProfileEdit {
  return {
    display_name: profile.display_name,
    age: profile.age ?? null,
    height_cm: profile.height_cm ?? null,
    weight_kg: profile.weight_kg ?? null,
    disciplines: profile.disciplines ?? [],
    goal_text: profile.goal_text ?? "",
    experience: profile.experience ?? null,
    training_days_per_week: profile.training_days_per_week ?? null,
    training_setup: profile.training_setup ?? null,
    goal_motivation: profile.goal_motivation ?? [],
    current_focus: profile.current_focus ?? [],
    injuries: profile.injuries ?? null,
    favourite_athlete: profile.favourite_athlete ?? null,
    timezone: profile.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    ai_consent: profile.ai_consent ?? false,
    share_with_coach: profile.share_with_coach ?? true,
  };
}
export function ProfileEditor({ profile }: { profile: Tables<"profiles"> }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(() => initialValues(profile));
  const [error, setError] = useState("");
  const update = useServerFn(updateAthleteProfile);
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: (data: ProfileEdit) => update({ data }),
    onSuccess: async (result) => {
      // Access preferences can invalidate previously visible athlete/coach information.
      await qc.cancelQueries();
      qc.setQueriesData<{ profile: Tables<"profiles">; avatar_signed_url: string | null }>(
        { queryKey: ["my-profile"] },
        (old) => (old ? { ...old, profile: result.profile } : old),
      );
      qc.removeQueries({ predicate: (query) => query.queryKey[0] !== "my-profile" });
      await qc.invalidateQueries({ queryKey: ["my-profile"] });
      setOpen(false);
      toast.success("Profil gespeichert");
    },
    onError: () => setError("Speichern fehlgeschlagen. Deine Eingaben bleiben erhalten."),
  });
  const field = (key: keyof ProfileEdit, value: unknown) =>
    setValues((old) => ({ ...old, [key]: value }));
  if (!open)
    return (
      <Button
        className="mb-4"
        variant="outline"
        onClick={() => {
          setValues(initialValues(profile));
          setError("");
          setOpen(true);
        }}
      >
        Profil bearbeiten
      </Button>
    );
  return (
    <form
      className="glass-strong rounded-3xl p-6 mb-5 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = profileEditSchema.safeParse(values);
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? "Bitte Eingaben prüfen");
          return;
        }
        setError("");
        save.mutate(parsed.data);
      }}
    >
      <h2 className="font-semibold">Athletenprofil bearbeiten</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {(
          [
            ["display_name", "Name"],
            ["goal_text", "Ziel"],
            ["experience", "Erfahrung"],
            ["training_setup", "Trainingsumgebung"],
            ["favourite_athlete", "Lieblingsathlet"],
            ["timezone", "Zeitzone (z. B. Europe/Berlin)"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="text-sm">
            {label}
            <Input value={String(values[key] ?? "")} onChange={(e) => field(key, e.target.value)} />
          </label>
        ))}
        {(
          [
            ["age", "Alter", 8, 99],
            ["height_cm", "Größe (cm)", 50, 250],
            ["weight_kg", "Gewicht (kg)", 15, 350],
            ["training_days_per_week", "Trainingstage pro Woche", 1, 7],
          ] as const
        ).map(([key, label, min, max]) => (
          <label key={key} className="text-sm">
            {label}
            <Input
              type="number"
              min={min}
              max={max}
              step={key === "weight_kg" || key === "height_cm" ? "0.1" : "1"}
              value={values[key] ?? ""}
              onChange={(e) => field(key, e.target.value === "" ? null : Number(e.target.value))}
            />
          </label>
        ))}
        {(
          [
            ["disciplines", "Disziplinen (max. 2, mit Komma trennen)"],
            ["goal_motivation", "Motivation (max. 2)"],
            ["current_focus", "Fokus (max. 2)"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="text-sm">
            {label}
            <Input
              defaultValue={values[key].join(", ")}
              onChange={(e) =>
                field(
                  key,
                  e.target.value
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean),
                )
              }
            />
          </label>
        ))}
        <label className="text-sm">
          Verletzungen / Hinweise
          <textarea
            className="w-full rounded-xl border border-border bg-background p-3"
            maxLength={1000}
            value={values.injuries ?? ""}
            onChange={(e) => field("injuries", e.target.value)}
          />
        </label>
      </div>
      <label className="flex gap-3 text-sm">
        <input
          type="checkbox"
          checked={values.ai_consent}
          onChange={(e) => field("ai_consent", e.target.checked)}
        />
        Ich erlaube, dass meine Trainings- und Gesundheitsangaben für angefragte KI-Analysen an
        Google Gemini gesendet werden. Diese Freigabe kann ich jederzeit widerrufen.
      </label>
      <label className="flex gap-3 text-sm">
        <input
          type="checkbox"
          checked={values.share_with_coach}
          onChange={(e) => field("share_with_coach", e.target.checked)}
        />
        Verknüpfte Coaches dürfen mein Profil und meine Trainingsdaten sehen. Videos benötigen eine
        zusätzliche Freigabe.
      </label>
      <p className="text-xs text-muted-foreground">
        Eine Änderung gilt für zukünftige Zugriffe. Bereits gelesene oder an einen KI-Anbieter
        gesendete Daten werden dadurch nicht zurückgerufen.
      </p>
      {error && (
        <p role="alert" className="text-red-400">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Speichert…" : "Änderungen speichern"}
        </Button>
        <Button
          variant="outline"
          type="button"
          disabled={save.isPending}
          onClick={() => setOpen(false)}
        >
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
