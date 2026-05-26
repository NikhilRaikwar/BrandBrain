"use client";

import { cn } from "@/lib/utils";

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function Switch({ checked, onCheckedChange, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-7 w-12 rounded-full border transition",
        checked
          ? "border-[rgba(0,229,160,0.4)] bg-[rgba(0,229,160,0.15)]"
          : "border-[var(--border)] bg-white/5"
      )}
    >
      <span
        className={cn(
          "absolute top-1 h-5 w-5 rounded-full bg-[var(--white)] transition-all",
          checked ? "left-6 bg-[var(--accent)]" : "left-1 bg-[var(--muted)]"
        )}
      />
    </button>
  );
}
