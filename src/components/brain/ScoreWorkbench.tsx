"use client";

import { ScoreRing } from "./ScoreRing";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Save, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type BreakdownItem = {
  principle: string;
  score: number;
  comment: string;
};

type FailureItem = {
  principle: string;
  what_went_wrong: string;
  how_to_fix: string;
};

type ScoreResult = {
  overall_score: number;
  breakdown: BreakdownItem[];
  top_3_failures: FailureItem[];
  rewrite: string;
  rewrite_score: number;
  cost_usd: number;
};

type ScoreWorkbenchProps = {
  brainId: string;
  clientOptions: string[];
  agencyAverageScore: number;
};

export function ScoreWorkbench({ brainId, clientOptions, agencyAverageScore }: ScoreWorkbenchProps) {
  const [clientName, setClientName] = useState(clientOptions[0] ?? "");
  const [copy, setCopy] = useState("");
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const canScore = clientOptions.length > 0 && clientName && copy.trim().length > 0;

  const scoreCopy = async (content: string) => {
    if (!clientName || !content.trim()) return;
    setLoading(true);
    setProgress(8);
    const interval = window.setInterval(() => {
      setProgress((current) => Math.min(current + 11, 92));
    }, 250);

    const response = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brainId, clientName, copy: content }),
    });
    const payload = await response.json();
    window.clearInterval(interval);
    setProgress(100);
    setTimeout(() => setProgress(0), 700);
    setLoading(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Score failed");
      return;
    }

    setResult(payload);
    toast.success("Score complete");
  };

  const handleCopy = async () => {
    if (!result?.rewrite) return;
    await navigator.clipboard.writeText(result.rewrite);
    toast.success("Copied to clipboard");
  };

  const scoreRows = useMemo(
    () =>
      result?.breakdown ?? [
        {
          principle: "Product Positioning",
          score: 0,
          comment: "Run a score to see your breakdown.",
        },
      ],
    [result]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="card card-orange">
        <h1 className="font-display text-4xl font-bold text-[var(--white)]">Score Your Copy</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Rate copy against your agency&apos;s best work using Ogilvy&apos;s 15 principles.
        </p>

        <div className="mt-6 space-y-5">
          <label className="block space-y-2 text-sm text-[var(--muted)]">
            <span>Client</span>
            <select
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--white)] outline-none"
            >
              {clientOptions.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2 text-sm text-[var(--muted)]">
            <span>Copy</span>
            <Textarea
              value={copy}
              onChange={(e) => setCopy(e.target.value)}
              placeholder="Paste your new copy here..."
              className="min-h-[250px]"
            />
          </label>

          <Button type="button" className="w-full" disabled={!canScore || loading} onClick={() => scoreCopy(copy)}>
            <Zap className="h-4 w-4" />
            {loading ? "Analyzing against your agency's best work..." : "Score It"}
          </Button>

          {loading ? (
            <div className="space-y-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-[var(--muted)]">Analyzing against your agency&apos;s best work...</div>
            </div>
          ) : null}
        </div>
      </section>

      <section
        className={
          result
            ? "animate-[fadeInUp_0.35s_ease] space-y-6"
            : "space-y-6 opacity-0 pointer-events-none"
        }
      >
        {result ? (
          <>
            <div className="card card-green">
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <ScoreRing score={result.overall_score} size={150} />
                <div className="font-display text-2xl font-bold text-[var(--white)]">
                  vs your agency avg: {agencyAverageScore.toFixed(1)}pts
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="font-display text-2xl font-bold text-[var(--white)]">Breakdown</h2>
              <div className="mt-5 max-h-[420px] overflow-y-auto scrollbar-thin">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-[var(--card)] text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                    <tr>
                      <th className="pb-3">Principle</th>
                      <th className="pb-3">Score</th>
                      <th className="pb-3">Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoreRows.map((row) => {
                      const tone =
                        row.score > 5
                          ? "text-[var(--accent)]"
                          : row.score >= 3
                            ? "text-[var(--accent2)]"
                            : "text-red-400";
                      return (
                        <tr key={row.principle} className="border-t border-[var(--border)]">
                          <td className="py-3 pr-4 text-[var(--white)]">{row.principle}</td>
                          <td className={`py-3 pr-4 font-bold ${tone}`}>{row.score}</td>
                          <td className="py-3 text-[var(--text)]">{row.comment}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-4">
              <h2 className="font-display text-2xl font-bold text-[var(--white)]">Top 3 Failures</h2>
              {result.top_3_failures.map((failure) => (
                <div key={failure.principle} className="card border-l-2 border-l-[var(--accent2)]">
                  <h3 className="font-display text-lg font-bold text-[var(--white)]">{failure.principle}</h3>
                  <p className="mt-2 text-sm text-[var(--text)]">
                    <span className="text-[var(--accent2)]">What went wrong:</span>{" "}
                    {failure.what_went_wrong}
                  </p>
                  <p className="mt-2 text-sm text-[var(--text)]">
                    <span className="text-[var(--accent)]">How to fix:</span> {failure.how_to_fix}
                  </p>
                </div>
              ))}
            </div>

            <div className="card border-l-2 border-l-[var(--accent)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-2xl font-bold text-[var(--white)]">
                  ✨ Rewritten to {result.rewrite_score}/100
                </h2>
                <div className="text-xs text-[var(--muted)]">
                  Cost: ₹{(result.cost_usd * 83).toFixed(2)}
                </div>
              </div>
              <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 font-body text-sm leading-7 text-[var(--text)]">
                {result.rewrite}
              </pre>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button type="button" variant="outline" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button type="button" onClick={() => setCopy(result.rewrite)}>
                  <Zap className="h-4 w-4" />
                  Score this rewrite
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    const response = await fetch("/api/ingest", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        brainId,
                        sourceType: "campaign",
                        clientName,
                        title: `Rewrite for ${clientName}`,
                        content: result.rewrite,
                      }),
                    });
                    const payload = await response.json();
                    if (!response.ok) {
                      toast.error(payload.error ?? "Save failed");
                      return;
                    }
                    toast.success("Rewrite saved to brain");
                  }}
                >
                  <Save className="h-4 w-4" />
                  Save to Brain
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="card border-dashed border-[var(--border)] bg-[var(--surface)] text-center text-[var(--muted)]">
            Score your copy to unlock the judgment layer.
          </div>
        )}
      </section>
    </div>
  );
}
