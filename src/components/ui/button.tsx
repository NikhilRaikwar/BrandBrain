import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
};

export const buttonVariants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[var(--accent)] text-[#05100b] border-transparent hover:brightness-110 shadow-glow",
  ghost: "bg-transparent text-[var(--white)] border-transparent hover:bg-white/5",
  outline:
    "bg-transparent text-[var(--white)] border-[var(--border)] hover:border-white/15 hover:bg-white/5",
  danger:
    "bg-[rgba(255,107,53,0.14)] text-[var(--accent2)] border-[rgba(255,107,53,0.24)] hover:bg-[rgba(255,107,53,0.2)]",
};

export const buttonSizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-sm",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function buttonClassName(
  variant: NonNullable<ButtonProps["variant"]> = "primary",
  size: NonNullable<ButtonProps["size"]> = "md"
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl border font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
    buttonVariants[variant],
    buttonSizes[size]
  );
}
