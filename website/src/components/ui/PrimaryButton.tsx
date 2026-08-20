import type { ReactNode } from "react";

type PrimaryButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
};

export function PrimaryButton({
  children,
  href = "#",
  variant = "primary",
}: PrimaryButtonProps) {
  return (
    <a
      href={href}
      className={`primary-button primary-button--${variant}`}
    >
      {children}
    </a>
  );
}
