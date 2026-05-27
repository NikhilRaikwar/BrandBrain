import { cn } from "@/lib/utils";

type ScoreRingProps = {
  score: number | null;
  size?: number;
};

function ringColor(score: number | null) {
  if (score === null) return "var(--green)";
  if (score < 50) return "#c0391a";
  if (score < 75) return "#d4541a";
  return "#1a6b3c";
}

export function ScoreRing({ score, size = 130 }: ScoreRingProps) {
  const color = ringColor(score);
  const normalizedScore = score !== null ? Math.max(0, Math.min(score, 100)) : 0;
  const circumference = 339.3;
  const strokeDasharray = `${(normalizedScore / 100) * circumference} ${circumference}`;

  return (
    <div style={{ width: size, height: size }} className="relative">
      <svg width={size} height={size} viewBox="0 0 130 130" className="block">
        <circle cx="65" cy="65" r="54" fill="none" stroke="#ede8d8" strokeWidth="10" />
        <circle
          cx="65"
          cy="65"
          r="54"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          style={{ transition: "stroke-dasharray 0.8s ease, stroke 0.3s ease" }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className={cn("font-display text-4xl font-bold leading-none")} style={{ color }}>
            {score !== null ? Math.round(normalizedScore) : "—"}
          </div>
          <div className="mt-1 text-[11px] text-[var(--ink4)]">/100</div>
        </div>
      </div>
    </div>
  );
}
