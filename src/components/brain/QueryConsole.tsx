"use client";

import { ChatBubble } from "./ChatBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, MessageSquare } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type Message = {
  role: "user" | "brain";
  content: string;
  sources?: string[];
};

type QueryConsoleProps = {
  brainId?: string;
  shareToken?: string;
  brainName: string;
  conceptCount: number;
  documentCount: number;
  initialTodayCostUsd: number;
  initialLastQueryCostUsd: number;
};

export function QueryConsole({
  brainId,
  shareToken,
  brainName,
  conceptCount,
  documentCount,
  initialTodayCostUsd,
  initialLastQueryCostUsd,
}: QueryConsoleProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [todayCostUsd, setTodayCostUsd] = useState(initialTodayCostUsd);
  const [lastCostUsd, setLastCostUsd] = useState(initialLastQueryCostUsd);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const examples = useMemo(
    () => [
      "What tone works for FMCG clients?",
      "What headline formats performed best?",
      "What are the brand rules for this client?",
    ],
    []
  );

  const sendQuestion = async (value: string) => {
    if (!value.trim() || loading) return;
    const nextQuestion = value.trim();
    setQuestion("");
    setMessages((current) => [...current, { role: "user", content: nextQuestion }]);
    setLoading(true);
    const thinking = toast.loading("Thinking...");

    const response = await fetch("/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: nextQuestion,
        brainId,
        shareToken,
      }),
    });
    const payload = await response.json();
    setLoading(false);
    toast.dismiss(thinking);

    if (!response.ok) {
      toast.error(payload.error ?? "Query failed");
      return;
    }

    setMessages((current) => [
      ...current,
      { role: "brain", content: payload.answer, sources: payload.sources ?? [] },
    ]);
    setLastCostUsd(payload.cost_usd ?? 0);
    setTodayCostUsd((current) => current + (payload.cost_usd ?? 0));
  };

  return (
    <div className="flex h-[calc(100vh-180px)] min-h-[640px] flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-[var(--white)]">{brainName}</h1>
            <span className="flex items-center gap-2 text-xs text-[var(--accent)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
              Brain ready
            </span>
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {conceptCount} concepts · {documentCount} documents
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-xl text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-[var(--accent)]" />
              <h2 className="mt-5 font-display text-3xl font-bold text-[var(--white)]">
                Ask anything about your agency&apos;s creative history
              </h2>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {examples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => sendQuestion(example)}
                    className="rounded-full border border-[var(--border)] bg-white/5 px-4 py-2 text-xs text-[var(--text)] transition hover:border-[rgba(0,229,160,0.3)] hover:text-[var(--white)]"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatBubble
              key={`${message.role}-${index}`}
              role={message.role}
              content={message.content}
              sources={message.sources}
            />
          ))
        )}

        {loading ? (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--muted)]">
              Thinking
              <span className="inline-flex pl-1">
                <span className="animate-pulse">.</span>
                <span className="animate-pulse [animation-delay:120ms]">.</span>
                <span className="animate-pulse [animation-delay:240ms]">.</span>
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-[var(--border)] px-4 py-4">
        <div className="mb-3 text-xs text-[var(--muted)]">
          Last query: ₹{(lastCostUsd * 83).toFixed(2)} · Today: ₹{(todayCostUsd * 83).toFixed(2)}
        </div>
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void sendQuestion(question);
          }}
        >
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your brain..."
            className="h-12"
          />
          <Button type="submit" disabled={loading} className="h-12 w-12 px-0">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
