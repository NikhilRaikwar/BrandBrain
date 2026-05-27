"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Save, Zap } from "lucide-react";
import { ScoreRing } from "./ScoreRing";

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
  brainId?: string | null;
  clientOptions: string[];
  agencyAverageScore: number;
  hasBrain?: boolean;
};

export function ScoreWorkbench({
  brainId,
  clientOptions,
  agencyAverageScore,
  hasBrain = true,
}: ScoreWorkbenchProps) {
  const [clientName, setClientName] = useState(clientOptions[0] ?? "");
  const [copy, setCopy] = useState("");
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const scoreRows = useMemo(
    () =>
      result?.breakdown ?? [
        { principle: "Product Positioning", score: 0, comment: "Run a score to see your breakdown." },
      ],
    [result]
  );

  const scoreCopy = async (content: string) => {
    if (!hasBrain || !clientName || !content.trim() || loading || !brainId) return;

    setLoading(true);
    setProgress(0);
    const interval = window.setInterval(() => {
      setProgress((current) => Math.min(current + 12, 92));
    }, 180);

    try {
      const response = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brainId, clientName, copy: content }),
      });
      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload.error ?? "Score failed");
        return;
      }

      setResult(payload);
      toast.success("Score complete");
      setProgress(100);
      window.setTimeout(() => setProgress(0), 700);
    } catch {
      toast.error("Score failed");
    } finally {
      window.clearInterval(interval);
      setLoading(false);
    }
  };

  const copyRewrite = async () => {
    if (!result?.rewrite) return;
    await navigator.clipboard.writeText(result.rewrite);
    toast.success("Copied!");
  };

  const saveRewrite = async () => {
    if (!result?.rewrite || !brainId) return;
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
    toast.success("Saved to Brain");
  };

  const scoreAgain = async () => {
    if (!result?.rewrite) return;
    setCopy(result.rewrite);
    await scoreCopy(result.rewrite);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="card card-top-orange">
        <h1 className="font-display text-4xl font-bold text-[var(--ink)]">New Copy to Score</h1>
        <p className="mt-3 text-sm text-[var(--ink4)]">Paste any ad copy, tagline, or campaign text.</p>

        {!hasBrain ? (
          <div className="mt-6 rounded-[12px] border border-[var(--border)] bg-[var(--cream2)] p-4 text-sm text-[var(--ink3)]">
            Ingest at least one client document first. Scoring uses your past campaigns as the reference point.
            <div className="mt-3">
              <Link href="/ingest" className="btn btn-primary btn-sm">
                📥 Go to Ingest
              </Link>
            </div>
          </div>
        ) : null}

        <div className="mt-6 space-y-5">
          <label className="block space-y-2 text-sm text-[var(--ink4)]">
            <span>Client</span>
            <select
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              className="form-select"
              disabled={clientOptions.length === 0}
            >
              {clientOptions.length > 0 ? (
                clientOptions.map((client) => (
                  <option key={client} value={client}>
                    {client}
                  </option>
                ))
              ) : (
                <option value="">No client history yet</option>
              )}
            </select>
          </label>

          <label className="block space-y-2 text-sm text-[var(--ink4)]">
            <span>Copy to Score</span>
            <textarea
              value={copy}
              onChange={(event) => setCopy(event.target.value)}
              placeholder="Paste your new copy here..."
              className="form-textarea min-h-[240px]"
              disabled={!hasBrain || clientOptions.length === 0}
            />
          </label>

          <button
            type="button"
            className="btn btn-orange w-full justify-center"
            disabled={!hasBrain || !clientName || !copy.trim() || loading || clientOptions.length === 0}
            onClick={() => scoreCopy(copy)}
          >
            <Zap className="h-4 w-4" />
            {loading ? "Scoring..." : "Score It"}
          </button>

          {loading ? (
            <div className="space-y-2">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-xs text-[var(--ink4)]">
                Analyzing against your agency&apos;s best work...
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-6">
        <div className="card mb-[14px]">
          <div className="score-ring-wrap flex flex-col items-center justify-center gap-3 text-center">
            <ScoreRing score={result ? result.overall_score : null} size={130} />
            <div className="score-label text-sm text-[var(--ink3)]">
              {result ? `vs agency avg: ${agencyAverageScore.toFixed(1)}/100` : "Run a score to see results"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }} className="mt-4">
            <div
              style={{ textAlign: "center", padding: "10px 20px", background: "var(--cream2)", borderRadius: 8, flex: 1 }}
            >
              <div style={{ fontSize: 11, color: "var(--ink4)", marginBottom: 3 }}>Before</div>
              <div style={{ fontFamily: "var(--font-display), serif", fontSize: 22, color: "var(--orange)" }}>
                {result ? result.overall_score : "—"}
              </div>
            </div>
            <div
              style={{ textAlign: "center", padding: "10px 20px", background: "var(--cream2)", borderRadius: 8, flex: 1 }}
            >
              <div style={{ fontSize: 11, color: "var(--ink4)", marginBottom: 3 }}>After Rewrite</div>
              <div style={{ fontFamily: "var(--font-display), serif", fontSize: 22, color: "var(--green)" }}>
                {result ? result.rewrite_score : "—"}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-display text-[16px] font-semibold text-[var(--ink)]">Breakdown (Ogilvy 15)</h2>
          <div className="mt-5 max-h-[420px] overflow-y-auto scrollbar-thin">
            {result ? (
              scoreRows.map((row) => {
                const color = row.score > 5 ? "var(--green)" : row.score >= 3 ? "var(--orange)" : "#c0391a";
                const width = Math.max(Math.min((row.score / 6.7) * 100, 100), 8);
                return (
                  <div key={row.principle} className="breakdown-row">
                    <div className="breakdown-name">{row.principle}</div>
                    <div className="breakdown-bar">
                      <div className="breakdown-fill" style={{ width: `${width}%`, background: color }} />
                    </div>
                    <div className="breakdown-score" style={{ color }}>
                      {row.score}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state py-8">
                <div className="empty-sub">Score copy to see the 15-principle breakdown</div>
              </div>
            )}
          </div>
        </div>

        {result ? (
          <>
            <div className="space-y-3">
              <h2 className="font-display text-2xl font-bold text-[var(--ink)]">Top 3 Failures</h2>
              {result.top_3_failures.map((failure) => (
                <div key={failure.principle} className="card border-l-2 border-l-[var(--orange)]">
                  <h3 className="font-display text-lg font-bold text-[var(--ink)]">{failure.principle}</h3>
                  <p className="mt-2 text-sm text-[var(--ink3)]">
                    <span className="text-[var(--orange)]">What went wrong:</span> {failure.what_went_wrong}
                  </p>
                  <p className="mt-2 text-sm text-[var(--ink3)]">
                    <span className="text-[var(--green)]">How to fix:</span> {failure.how_to_fix}
                  </p>
                </div>
              ))}
            </div>

            <div className="card card-top-green">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-2xl font-bold text-[var(--ink)]">
                  ✨ Rewritten to {result.rewrite_score}/100
                </h2>
              </div>
              <div className="mt-4 whitespace-pre-wrap rounded-[9px] bg-[var(--cream2)] p-4 text-sm leading-7 text-[var(--ink3)]">
                {result.rewrite}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={copyRewrite} className="btn btn-outline">
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
                <button type="button" onClick={scoreAgain} className="btn btn-outline">
                  <Zap className="h-4 w-4" />
                  Score this rewrite
                </button>
                <button type="button" onClick={saveRewrite} className="btn btn-outline">
                  <Save className="h-4 w-4" />
                  Save to Brain
                </button>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
