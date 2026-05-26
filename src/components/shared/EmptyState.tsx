"use client";

import { Button } from "@/components/ui/button";
import { BrainCircuit, BarChart2, MessageSquare, Upload, Zap } from "lucide-react";

type EmptyStateProps = {
  iconName: "brain" | "upload" | "message" | "zap" | "bar";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  iconName,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const Icon =
    iconName === "brain"
      ? BrainCircuit
      : iconName === "upload"
        ? Upload
        : iconName === "message"
          ? MessageSquare
          : iconName === "zap"
            ? Zap
            : BarChart2;

  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-white/[0.02] p-8 text-center">
      <div className="rounded-2xl border border-[var(--border)] bg-white/5 p-4 text-[var(--accent)]">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-4 font-display text-2xl font-bold text-[var(--white)]">{title}</h3>
      <p className="mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
