import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--border)] bg-white/5 px-3 py-1 text-[11px] text-[var(--text)]",
        className
      )}
      {...props}
    />
  );
}
