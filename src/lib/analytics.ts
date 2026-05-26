import { createSupabaseAdminClient } from "./supabase/server";

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function labelForDay(dateKey: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(new Date(`${dateKey}T00:00:00Z`));
}

export async function getAnalyticsData(brainId: string) {
  const admin = createSupabaseAdminClient();
  const [scoreRes, queryRes, sourceRes, cardsRes] = await Promise.all([
    admin.from("score_log").select("*").eq("brain_id", brainId).order("created_at", { ascending: true }),
    admin.from("query_log").select("*").eq("brain_id", brainId).order("created_at", { ascending: true }),
    admin.from("raw_sources").select("*").eq("brain_id", brainId),
    admin.from("knowledge_cards").select("client_name").eq("brain_id", brainId),
  ]);

  const now = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - index));
    return dayKey(date);
  });

  const scoreSeries = days.map((dateKey) => {
    const rows = (scoreRes.data ?? []).filter((row) => row.created_at.slice(0, 10) === dateKey);
    const avgBefore = rows.length ? rows.reduce((sum, row) => sum + row.score_before, 0) / rows.length : 0;
    const avgAfter = rows.length ? rows.reduce((sum, row) => sum + row.score_after, 0) / rows.length : 0;
    return {
      date: labelForDay(dateKey),
      avg_before: Number(avgBefore.toFixed(1)),
      avg_after: Number(avgAfter.toFixed(1)),
    };
  });

  const querySeries = days.map((dateKey) => ({
    day: labelForDay(dateKey),
    count: (queryRes.data ?? []).filter((row) => row.created_at.slice(0, 10) === dateKey).length,
  }));

  const costTable = days.map((dateKey) => {
    const queries = (queryRes.data ?? []).filter((row) => row.created_at.slice(0, 10) === dateKey);
    const scores = (scoreRes.data ?? []).filter((row) => row.created_at.slice(0, 10) === dateKey);
    const totalTokens =
      queries.reduce((sum, row) => sum + (row.tokens_used ?? 0), 0) +
      scores.reduce((sum, row) => sum + (row.tokens_used ?? 0), 0);
    const totalCost =
      queries.reduce((sum, row) => sum + (row.cost_usd ?? 0), 0) +
      scores.reduce((sum, row) => sum + (row.cost_usd ?? 0), 0);
    return {
      date: dateKey,
      queries: queries.length,
      scores: scores.length,
      tokens: totalTokens,
      cost_usd: Number(totalCost.toFixed(4)),
      cost_inr: Number((totalCost * 83).toFixed(2)),
    };
  });

  const totalUsd =
    (scoreRes.data ?? []).reduce((sum, row) => sum + (row.cost_usd ?? 0), 0) +
    (queryRes.data ?? []).reduce((sum, row) => sum + (row.cost_usd ?? 0), 0);

  const clientCounts = Array.from(
    (cardsRes.data ?? []).reduce((map, card) => {
      map.set(card.client_name, (map.get(card.client_name) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  )
    .map(([client, count]) => ({ client, count }))
    .sort((a, b) => b.count - a.count);

  return {
    scoreSeries,
    querySeries,
    costTable,
    totalCosts: {
      usd: totalUsd,
      inr: totalUsd * 83,
    },
    topClients: clientCounts,
    overallStats: {
      docs: sourceRes.data?.length ?? 0,
      concepts: cardsRes.data?.length ?? 0,
      queries: queryRes.data?.length ?? 0,
      scores: scoreRes.data?.length ?? 0,
    },
  };
}
