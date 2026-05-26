import { cn } from "@/lib/utils";

type SourceType = "campaign" | "brand_guide" | "brief" | "performance_data";

const styles: Record<SourceType, string> = {
  campaign: "bg-[rgba(0,229,160,0.1)] text-[var(--accent)] border-[rgba(0,229,160,0.22)]",
  brand_guide:
    "bg-[rgba(124,111,255,0.1)] text-[var(--accent3)] border-[rgba(124,111,255,0.22)]",
  brief: "bg-[rgba(255,107,53,0.1)] text-[var(--accent2)] border-[rgba(255,107,53,0.22)]",
  performance_data:
    "bg-[rgba(255,209,102,0.1)] text-[#ffd166] border-[rgba(255,209,102,0.22)]",
};

const labels: Record<SourceType, string> = {
  campaign: "Campaign",
  brand_guide: "Brand Guide",
  brief: "Brief",
  performance_data: "Performance Data",
};

export function SourceBadge({ type }: { type: SourceType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px]",
        styles[type]
      )}
    >
      {labels[type]}
    </span>
  );
}
