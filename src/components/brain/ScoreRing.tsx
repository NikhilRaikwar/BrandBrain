"use client";

import { cn } from "@/lib/utils";
import {
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";

type ScoreRingProps = {
  score: number;
  size?: number;
};

function ringColor(score: number) {
  if (score < 50) return "#ef4444";
  if (score < 75) return "#f97316";
  return "#00e5a0";
}

export function ScoreRing({ score, size = 120 }: ScoreRingProps) {
  const color = ringColor(score);

  return (
    <div style={{ width: size, height: size }} className="relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius={`${62 - Math.min(size / 10, 10)}%`}
          outerRadius="100%"
          barSize={Math.max(8, Math.round(size / 14))}
          data={[{ name: "score", value: score }]}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar dataKey="value" cornerRadius={999} fill={color} background />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div
            className={cn("font-display text-4xl font-bold leading-none")}
            style={{ color }}
          >
            {Math.round(score)}
          </div>
          <div className="mt-1 text-[11px] text-[var(--muted)]">/100</div>
        </div>
      </div>
    </div>
  );
}
