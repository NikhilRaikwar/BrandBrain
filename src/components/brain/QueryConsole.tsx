"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
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
  readOnly?: boolean;
  hasBrain?: boolean;
};

export function QueryConsole({
  brainId,
  shareToken,
  brainName,
  conceptCount,
  documentCount,
  readOnly = false,
  hasBrain = true,
}: QueryConsoleProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const examples = useMemo(
    () => [
      "What tone works for FMCG clients?",
      "What headline formats performed best?",
      "What are the brand rules for this client?",
    ],
    []
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendQuestion = async (nextQuestion: string) => {
    const trimmed = nextQuestion.trim();
    if (!trimmed || loading || !hasBrain) return;

    setQuestion("");
    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setLoading(true);

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, brainId, shareToken }),
      });
      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload.error ?? "Query failed");
        return;
      }

      setMessages((current) => [...current, { role: "brain", content: payload.answer, sources: payload.sources ?? [] }]);
    } catch {
      toast.error("Query failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid-65-35 mb-6">
      <div className="chat-wrap">
        <div className="chat-header">
          <div className="chat-title">{brainName}</div>
          <div className="chat-status">
            <span className="status-dot" />
            {hasBrain ? `Brain ready · ${conceptCount} concept · ${documentCount} docs` : "No brain yet · Ingest first"}
          </div>
        </div>

        <div ref={scrollRef} className="chat-messages scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex min-h-full items-center justify-center py-8">
              <div className="max-w-2xl text-center">
                <div className="mb-2 text-[28px]">💬</div>
                <h2 className="mb-4 text-[15px] font-semibold text-[var(--ink3)]">
                  {hasBrain ? "Ask your brain anything" : "Ingest a document to start querying"}
                </h2>
                {hasBrain ? (
                  <div className="flex flex-wrap justify-center gap-2">
                    {examples.map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => sendQuestion(example)}
                        className="btn btn-outline btn-sm text-[12px]"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-[var(--ink4)]">
                      Add your first document to create a brain. Then you can ask questions and get cited answers.
                    </p>
                    <Link href="/ingest" className="btn btn-primary btn-sm">
                      📥 Go to Ingest
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div className={message.role === "user" ? "msg msg-user" : "msg msg-brain"}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.role === "brain" && (message.sources?.length ?? 0) > 0 ? (
                      <div className="msg-sources">
                        {message.sources?.map((source) => (
                          <span key={source} className="msg-source">
                            {source}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex justify-start">
              <div className="msg msg-brain text-[var(--ink3)]">
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

        <form
          className="chat-input-bar"
          onSubmit={(event) => {
            event.preventDefault();
            void sendQuestion(question);
          }}
        >
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={hasBrain ? "Ask your brain..." : "Ingest a document to start..."}
            className="chat-input"
            disabled={readOnly || !hasBrain}
          />
          <button type="submit" disabled={loading || readOnly || !hasBrain} className="chat-send">
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </div>

      <div>
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="section-title text-[15px]" style={{ marginBottom: 12 }}>
            Brain Stats
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "var(--ink4)" }}>Concepts</span>
              <strong style={{ fontSize: 13 }}>{conceptCount}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "var(--ink4)" }}>Documents</span>
              <strong style={{ fontSize: 13 }}>{documentCount}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "var(--ink4)" }}>Queries today</span>
              <strong style={{ fontSize: 13 }}>{messages.filter((m) => m.role === "user").length}</strong>
            </div>
          </div>
        </div>

        <div className="card card-sm">
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--ink4)",
              marginBottom: 8,
            }}
          >
            Last query
          </div>
          <div className="text-sm text-[var(--ink3)]">
            {hasBrain ? "Ask a question to start tracking answers." : "No brain yet."}
          </div>
        </div>
      </div>
    </div>
  );
}
