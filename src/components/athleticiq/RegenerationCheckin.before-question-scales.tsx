import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  BatteryCharging,
  MoonStar,
  ThermometerSun,
  Loader2,
} from "lucide-react";

import { saveRegeneration } from "@/lib/features/regeneration.functions";

type RegenerationCheckinProps = {
  onComplete: () => void;
};

type QuestionOption = {
  value: number;
  emoji: string;
  label: string;
};

const sleepOptions: QuestionOption[] = [
  {
    value: 1,
    emoji: "😫",
    label: "Terrible, barely slept",
  },
  {
    value: 2,
    emoji: "🥱",
    label: "Poor, woke up a lot",
  },
  {
    value: 3,
    emoji: "😐",
    label: "Okay, feel fine",
  },
  {
    value: 4,
    emoji: "🙂",
    label: "Good, well-rested",
  },
  {
    value: 5,
    emoji: "⚡",
    label: "Perfect, amazing sleep",
  },
];

const sorenessOptions: QuestionOption[] = [
  {
    value: 1,
    emoji: "🛑",
    label: "Severe pain / Injured",
  },
  {
    value: 2,
    emoji: "🥵",
    label: "Very sore / Heavy legs",
  },
  {
    value: 3,
    emoji: "😐",
    label: "Normal tightness",
  },
  {
    value: 4,
    emoji: "🙂",
    label: "Good / Mostly fresh",
  },
  {
    value: 5,
    emoji: "⚡",
    label: "Perfect / Zero soreness",
  },
];

const energyOptions: QuestionOption[] = [
  {
    value: 1,
    emoji: "🪫",
    label: "Exhausted / Drained",
  },
  {
    value: 2,
    emoji: "💤",
    label: "Tired / Sluggish",
  },
  {
    value: 3,
    emoji: "😐",
    label: "Normal energy",
  },
  {
    value: 4,
    emoji: "🔋",
    label: "Energetic / Hyped",
  },
  {
    value: 5,
    emoji: "⚡",
    label: "Peak energy / Personal Record day",
  },
];

export function RegenerationCheckin({
  onComplete,
}: RegenerationCheckinProps) {
  const [sleep, setSleep] = useState<number | null>(null);
  const [soreness, setSoreness] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);

  const saveFn = useServerFn(saveRegeneration);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      saveFn({
        data: {
          sleep_quality: sleep!,
          muscle_soreness: soreness!,
          energy_level: energy!,
        },
      }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["today-regeneration"],
      });

      onComplete();
    },
  });

  const complete =
    sleep !== null &&
    soreness !== null &&
    energy !== null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
          Daily Regeneration
        </p>

        <h2 className="mt-1 text-2xl font-bold">
          How are you feeling today?
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Three quick questions before training.
        </p>

        <div className="mt-6 space-y-6">
          <Question
            title="Sleep Quality"
            question="How did you sleep last night?"
            icon={MoonStar}
            options={sleepOptions}
            value={sleep}
            onChange={setSleep}
          />

          <Question
            title="Muscle Soreness"
            question="Are your muscles sore today?"
            icon={ThermometerSun}
            options={sorenessOptions}
            value={soreness}
            onChange={setSoreness}
          />

          <Question
            title="Energy Levels"
            question="What is your overall energy right now?"
            icon={BatteryCharging}
            options={energyOptions}
            value={energy}
            onChange={setEnergy}
          />
        </div>

        {mutation.isError && (
          <p className="mt-4 text-sm text-red-600">
            Could not save your regeneration check-in.
          </p>
        )}

        <button
          type="button"
          disabled={!complete || mutation.isPending}
          onClick={() => mutation.mutate()}
          className="mt-7 flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Continue to Aether Athlete IQ"
          )}
        </button>
      </div>
    </div>
  );
}

type QuestionProps = {
  title: string;
  question: string;
  icon: React.ComponentType<{ className?: string }>;
  options: QuestionOption[];
  value: number | null;
  onChange: (value: number) => void;
};

function Question({
  title,
  question,
  icon: Icon,
  options,
  value,
  onChange,
}: QuestionProps) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-50">
          <Icon className="h-4 w-4 text-orange-600" />
        </div>

        <div>
          <p className="text-sm font-bold">
            {title}
          </p>

          <p className="text-xs text-muted-foreground">
            {question}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              "min-h-[88px] rounded-xl border p-2 text-center transition",
              value === option.value
                ? "border-orange-400 bg-orange-50 ring-2 ring-orange-100"
                : "border-border bg-white hover:bg-muted/30",
            ].join(" ")}
          >
            <div className="text-2xl">
              {option.emoji}
            </div>

            <div className="mt-1 text-[10px] font-bold">
              {option.value}
            </div>

            <div className="mt-1 text-[8px] leading-tight text-muted-foreground">
              {option.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
