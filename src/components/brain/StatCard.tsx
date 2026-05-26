"use client";

import { cn } from "@/lib/utils";
import { BarChart2, BrainCircuit, MessageSquare, Upload, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  iconName: "upload" | "brain" | "message" | "zap" | "bar";
  accentColor?: "green" | "orange" | "purple" | "yellow" | "blue";
  className?: string;
  prefix?: string;
  suffix?: string;
};

const accentMap: Record<NonNullable<StatCardProps["accentColor"]>, string> = {
  green: "border-t-[var(--accent)]",
  orange: "border-t-[var(--accent2)]",
  purple: "border-t-[var(--accent3)]",
  yellow: "border-t-[#ffd166]",
  blue: "border-t-[#4cc9f0]",
};

export function StatCard({
  label,
  value,
  iconName,
  accentColor = "green",
  className,
  prefix = "",
  suffix = "",
}: StatCardProps) {
  const target = useMemo(() => {
    if (typeof value === "number") return value;
    const parsed = Number(String(value).replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }, [value]);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const total = 18;
    const tick = () => {
      frame += 1;
      const progress = Math.min(frame / total, 1);
      const precision = Number.isInteger(target) ? 0 : 1;
      setDisplay(Number((target * progress).toFixed(precision)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);

  const renderedValue =
    typeof value === "number"
      ? `${prefix}${display}${suffix}`
      : /^\+?\d/.test(String(value))
        ? `${prefix}${display}${suffix}`
        : String(value);

  const Icon =
    iconName === "upload"
      ? Upload
      : iconName === "brain"
        ? BrainCircuit
        : iconName === "message"
          ? MessageSquare
          : iconName === "zap"
            ? Zap
            : BarChart2;

  return (
    <div className={cn("card card-green min-w-0 border-t-2", accentMap[accentColor], className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
          <div className="mt-3 font-display text-3xl font-bold text-[var(--white)]">
            {renderedValue}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white/5 p-3 text-[var(--accent)]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
