"use client";

import { cn } from "@/lib/utils";
import { BarChart2, BrainCircuit, MessageSquare, Upload, Zap } from "lucide-react";
import { useEffect, useState } from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  iconName?: "upload" | "brain" | "message" | "zap" | "bar";
  iconEmoji?: string;
  accentColor?: "green" | "orange" | "purple" | "blue";
  className?: string;
  prefix?: string;
  suffix?: string;
  subText?: string;
};

const accentMap: Record<NonNullable<StatCardProps["accentColor"]>, string> = {
  green: "card-top-green",
  orange: "card-top-orange",
  purple: "card-top-purple",
  blue: "card-top-blue",
};

const iconMap: Record<NonNullable<StatCardProps["accentColor"]>, string> = {
  green: "bg-[var(--green-bg)] text-[var(--green)]",
  orange: "bg-[var(--orange-bg)] text-[var(--orange)]",
  purple: "bg-[var(--purple-bg)] text-[var(--purple)]",
  blue: "bg-[var(--blue-bg)] text-[var(--blue)]",
};

export function StatCard({
  label,
  value,
  iconName,
  iconEmoji,
  accentColor = "green",
  className,
  prefix = "",
  suffix = "",
  subText,
}: StatCardProps) {
  const target = typeof value === "number" ? value : Number(String(value).replace(/[^\d.-]/g, "")) || 0;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const total = 18;
    const tick = () => {
      frame += 1;
      const progress = Math.min(frame / total, 1);
      setDisplay(Number((target * progress).toFixed(Number.isInteger(target) ? 0 : 1)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);

  const renderedValue =
    typeof value === "number" || /^\+?\d/.test(String(value))
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
    <div className={cn("stat-card", accentMap[accentColor], className)}>
      <div className={cn("stat-icon", iconMap[accentColor], "flex items-center justify-center")} aria-hidden="true">
        {iconEmoji ? <span className="text-[17px] leading-none">{iconEmoji}</span> : <Icon className="h-4 w-4" />}
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{renderedValue}</div>
      {subText && <div className="stat-sub">{subText}</div>}
    </div>
  );
}
