import fs from "fs";
import path from "path";
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { createSupabaseAdminClient } from "../../src/lib/supabase/server";
import { retrieveCards, RetrievedCard } from "../../src/lib/retrieval";

interface GoldenEntry {
  question: string;
  expected_card_ids: string[];
  should_abstain: boolean;
  brain_id?: string;
}

interface MetricSummary {
  mode: string;
  totalQueries: number;
  recallAt5: number;
  mrr: number;
  citationPrecision: number;
  abstentionAccuracy: number;
  avgLatencyMs: number;
}

async function evaluateDataset(
  entries: GoldenEntry[],
  baselineOnly: boolean,
  defaultBrainId: string
): Promise<MetricSummary> {
  const supabase = createSupabaseAdminClient();
  let totalRecall5 = 0;
  let totalMrr = 0;
  let totalPrecision = 0;
  let nonAbstainCount = 0;
  let correctAbstainDecisions = 0;
  let totalLatency = 0;

  for (const entry of entries) {
    const brainId = entry.brain_id || defaultBrainId;
    const res = await retrieveCards(supabase, brainId, entry.question, {
      limit: 8,
      baselineOnly,
      minSimilarity: 0.25,
    });

    totalLatency += res.latencyMs;

    const retrievedIds = res.cards.map((c) => c.id);
    const top5Ids = retrievedIds.slice(0, 5);
    const expectedSet = new Set(entry.expected_card_ids);

    const isAbstained = res.retrievalMode === "abstain" || retrievedIds.length === 0;

    // Abstention evaluation
    if (entry.should_abstain) {
      if (isAbstained) {
        correctAbstainDecisions++;
      }
    } else {
      if (!isAbstained) {
        correctAbstainDecisions++;
      }

      // Ranking metrics for non-abstain queries
      nonAbstainCount++;

      // Recall@5
      let matchedInTop5 = 0;
      for (const expId of entry.expected_card_ids) {
        if (top5Ids.includes(expId)) {
          matchedInTop5++;
        }
      }
      const recall = entry.expected_card_ids.length > 0
        ? matchedInTop5 / entry.expected_card_ids.length
        : 0;
      totalRecall5 += recall;

      // MRR
      let firstRank = 0;
      for (let i = 0; i < retrievedIds.length; i++) {
        if (expectedSet.has(retrievedIds[i])) {
          firstRank = i + 1;
          break;
        }
      }
      const rr = firstRank > 0 ? 1 / firstRank : 0;
      totalMrr += rr;

      // Citation Precision (Top-8)
      let relevantInTop8 = 0;
      for (const rId of retrievedIds) {
        if (expectedSet.has(rId)) {
          relevantInTop8++;
        }
      }
      const prec = retrievedIds.length > 0 ? relevantInTop8 / retrievedIds.length : 0;
      totalPrecision += prec;
    }
  }

  return {
    mode: baselineOnly ? "Baseline (Keyword Only)" : "Hybrid (pgvector + Keyword + RRF)",
    totalQueries: entries.length,
    recallAt5: nonAbstainCount > 0 ? totalRecall5 / nonAbstainCount : 0,
    mrr: nonAbstainCount > 0 ? totalMrr / nonAbstainCount : 0,
    citationPrecision: nonAbstainCount > 0 ? totalPrecision / nonAbstainCount : 0,
    abstentionAccuracy: entries.length > 0 ? correctAbstainDecisions / entries.length : 0,
    avgLatencyMs: entries.length > 0 ? Math.round(totalLatency / entries.length) : 0,
  };
}

function formatPercent(val: number): string {
  return `${(val * 100).toFixed(1)}%`;
}

function formatDecimal(val: number): string {
  return val.toFixed(3);
}

async function main() {
  const isBaselineFlag = process.argv.includes("--baseline");
  const goldenPath = path.join(__dirname, "golden.jsonl");

  if (!fs.existsSync(goldenPath)) {
    console.error(`Golden set not found at ${goldenPath}`);
    process.exit(1);
  }

  const rawLines = fs.readFileSync(goldenPath, "utf-8").trim().split("\n");
  const entries: GoldenEntry[] = rawLines
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l));

  console.log(`Loaded ${entries.length} queries from golden.jsonl\n`);

  const supabase = createSupabaseAdminClient();
  const { data: brains } = await supabase.from("brains").select("id").limit(1);
  const defaultBrainId = brains?.[0]?.id ?? "";

  if (isBaselineFlag) {
    const baseline = await evaluateDataset(entries, true, defaultBrainId);
    console.log(`| Metric | Baseline |`);
    console.log(`| --- | --- |`);
    console.log(`| Recall@5 | ${formatPercent(baseline.recallAt5)} |`);
    console.log(`| MRR | ${formatDecimal(baseline.mrr)} |`);
    console.log(`| Citation Precision | ${formatPercent(baseline.citationPrecision)} |`);
    console.log(`| Abstention Accuracy | ${formatPercent(baseline.abstentionAccuracy)} |`);
    console.log(`| Avg Latency | ${baseline.avgLatencyMs} ms |`);
    process.exit(0);
  }

  // Run both for comparison
  console.log("Running Baseline evaluation...");
  const baseline = await evaluateDataset(entries, true, defaultBrainId);

  console.log("Running Hybrid RAG evaluation...");
  const hybrid = await evaluateDataset(entries, false, defaultBrainId);

  console.log("\n### Retrieval Evaluation Results (Baseline vs Hybrid)\n");
  console.log("| Metric | Baseline (Keyword Only) | Hybrid RAG (pgvector + RRF) | Delta |");
  console.log("|---|---|---|---|");
  console.log(
    `| **Recall@5** | ${formatPercent(baseline.recallAt5)} | ${formatPercent(hybrid.recallAt5)} | ${hybrid.recallAt5 >= baseline.recallAt5 ? "+" : ""}${formatPercent(hybrid.recallAt5 - baseline.recallAt5)} |`
  );
  console.log(
    `| **MRR (Mean Reciprocal Rank)** | ${formatDecimal(baseline.mrr)} | ${formatDecimal(hybrid.mrr)} | ${hybrid.mrr >= baseline.mrr ? "+" : ""}${formatDecimal(hybrid.mrr - baseline.mrr)} |`
  );
  console.log(
    `| **Citation Precision** | ${formatPercent(baseline.citationPrecision)} | ${formatPercent(hybrid.citationPrecision)} | ${hybrid.citationPrecision >= baseline.citationPrecision ? "+" : ""}${formatPercent(hybrid.citationPrecision - baseline.citationPrecision)} |`
  );
  console.log(
    `| **Abstention Accuracy** | ${formatPercent(baseline.abstentionAccuracy)} | ${formatPercent(hybrid.abstentionAccuracy)} | ${hybrid.abstentionAccuracy >= baseline.abstentionAccuracy ? "+" : ""}${formatPercent(hybrid.abstentionAccuracy - baseline.abstentionAccuracy)} |`
  );
  console.log(
    `| **Avg Latency** | ${baseline.avgLatencyMs} ms | ${hybrid.avgLatencyMs} ms | ${hybrid.avgLatencyMs - baseline.avgLatencyMs > 0 ? "+" : ""}${hybrid.avgLatencyMs - baseline.avgLatencyMs} ms |`
  );
  console.log("\n");

  if (hybrid.recallAt5 < baseline.recallAt5 || hybrid.mrr < baseline.mrr) {
    console.warn("Warning: Hybrid performance was lower than baseline. Check retrieval and ranking.");
  } else {
    console.log("Evaluation complete: Hybrid RAG strictly outperformed baseline keyword retrieval.");
  }
}

main().catch((err) => {
  console.error("Eval run failed:", err);
  process.exit(1);
});
