import { SourceBadge } from "./SourceBadge";
import { timeAgo } from "@/lib/utils";

type KnowledgeCardProps = {
  concept: string;
  summary: string;
  clientName: string;
  sourceType: "campaign" | "brand_guide" | "brief" | "performance_data";
  createdAt?: string;
  tags?: string[];
};

export function KnowledgeCard({
  concept,
  summary,
  clientName,
  sourceType,
  createdAt,
  tags = [],
}: KnowledgeCardProps) {
  return (
    <div className="card card-purple border-t-2 border-t-[var(--accent3)]">
      <div className="flex flex-wrap items-center gap-2">
        <SourceBadge type={sourceType} />
        <span className="text-xs text-[var(--muted)]">{clientName}</span>
        {createdAt ? <span className="text-xs text-[var(--muted)]">• {timeAgo(createdAt)}</span> : null}
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-[var(--white)]">{concept}</h3>
      <p className="mt-3 text-sm leading-6 text-[var(--text)]">{summary}</p>
      {tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[var(--border)] bg-white/5 px-2.5 py-1 text-[11px] text-[var(--muted)]"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
