import { cn } from "@/lib/utils";

type ChatBubbleProps = {
  role: "user" | "brain";
  content: string;
  sources?: string[];
};

export function ChatBubble({ role, content, sources = [] }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl border px-4 py-3 text-sm leading-6",
          isUser
            ? "border-l-2 border-[var(--accent)] bg-[rgba(0,229,160,0.08)] text-[var(--white)]"
            : "border-[var(--border)] bg-[var(--card)] text-[var(--text)]"
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {!isUser && sources.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {sources.map((source) => (
              <span
                key={source}
                className="rounded-full border border-[var(--border)] bg-white/5 px-2.5 py-1 text-[11px] text-[var(--muted)]"
              >
                {source}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
