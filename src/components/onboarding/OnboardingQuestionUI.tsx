import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function QuestionLayout({
  icon,
  eyebrow,
  title,
  description,
  children,
}: {
  icon?: ReactNode;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">
          {icon}
          {eyebrow}
        </div>

        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          {title}
        </h1>

        {description && (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}

export function OptionGrid({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {children}
    </div>
  );
}

export function OptionCard({
  title,
  description,
  active,
  onClick,
}: {
  title: string;
  description?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl border p-4 text-left transition",
        active
          ? "border-accent bg-accent/10 shadow-sm"
          : "border-border bg-card hover:border-accent/30 hover:bg-accent/5",
      ].join(" ")}
    >
      <div className="text-sm font-bold">{title}</div>

      {description && (
        <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {description}
        </div>
      )}
    </button>
  );
}

export function NextButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-8 h-11 w-full rounded-xl sm:w-auto sm:min-w-[150px] sm:self-end"
    >
      Weiter
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}
