import { embedTexts } from "./embeddings";
import { SupabaseClient } from "@supabase/supabase-js";

export interface RetrievedCard {
  id: string;
  concept: string;
  summary: string;
  client_name: string;
  tags?: string[] | null;
  source_id?: string | null;
  similarity?: number;
  score?: number;
}

const STOP_WORDS = new Set([
  "what", "when", "where", "why", "how", "the", "and", "for", "with",
  "this", "that", "from", "into", "about", "your", "what's", "whats",
  "is", "are", "was", "were"
]);

export function extractTokens(question: string): string[] {
  return Array.from(
    new Set(
      (question.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter(
        (token) => token.length > 2 && !STOP_WORDS.has(token)
      )
    )
  );
}

export function keywordFilter<T extends { concept: string; summary: string; client_name: string; tags?: string[] | null }>(
  cards: T[],
  question: string
): T[] {
  const tokens = extractTokens(question);

  if (tokens.length === 0) {
    return cards;
  }

  return cards.filter((card) => {
    const haystack = [
      card.concept,
      card.summary,
      card.client_name,
      ...(card.tags ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return tokens.some((token) => haystack.includes(token));
  });
}

export function reciprocalRankFusion(
  vectorHits: RetrievedCard[],
  kwHits: RetrievedCard[],
  k = 60
): RetrievedCard[] {
  const scoreMap = new Map<string, { card: RetrievedCard; score: number }>();

  vectorHits.forEach((card, index) => {
    const rank = index + 1;
    const current = scoreMap.get(card.id);
    const scoreAdd = 1 / (k + rank);
    if (current) {
      current.score += scoreAdd;
      if (card.similarity !== undefined) {
        current.card.similarity = card.similarity;
      }
    } else {
      scoreMap.set(card.id, { card: { ...card }, score: scoreAdd });
    }
  });

  kwHits.forEach((card, index) => {
    const rank = index + 1;
    const current = scoreMap.get(card.id);
    const scoreAdd = 1 / (k + rank);
    if (current) {
      current.score += scoreAdd;
    } else {
      scoreMap.set(card.id, { card: { ...card }, score: scoreAdd });
    }
  });

  const sorted = Array.from(scoreMap.values())
    .sort((a, b) => b.score - a.score)
    .map((item) => ({
      ...item.card,
      score: item.score,
    }));

  return sorted;
}

export async function retrieveCards(
  supabase: SupabaseClient,
  brainId: string,
  question: string,
  options: {
    limit?: number;
    minSimilarity?: number;
    baselineOnly?: boolean;
  } = {}
): Promise<{
  cards: RetrievedCard[];
  retrievalMode: "hybrid" | "keyword" | "abstain";
  latencyMs: number;
}> {
  const t0 = Date.now();
  const limit = options.limit ?? 8;
  const minSimilarity = options.minSimilarity ?? 0.25;

  if (options.baselineOnly) {
    const { data: allCards } = await supabase
      .from("knowledge_cards")
      .select("id, concept, summary, client_name, tags, source_id")
      .eq("brain_id", brainId)
      .order("created_at", { ascending: false })
      .limit(100);

    const kwHits = keywordFilter(allCards ?? [], question);
    const latencyMs = Date.now() - t0;
    const cards = kwHits.slice(0, limit);

    return {
      cards,
      retrievalMode: cards.length === 0 ? "abstain" : "keyword",
      latencyMs,
    };
  }

  // Embed question
  let vectorHits: RetrievedCard[] = [];
  try {
    const qEmbs = await embedTexts([question]);
    if (qEmbs.length > 0 && qEmbs[0].length > 0) {
      const { data: rpcHits, error } = await supabase.rpc("match_cards", {
        p_brain_id: brainId,
        p_embedding: qEmbs[0],
        p_limit: 20,
      });

      if (!error && rpcHits) {
        vectorHits = (rpcHits as RetrievedCard[]).filter(
          (hit) => hit.similarity === undefined || hit.similarity >= minSimilarity
        );
      } else if (error) {
        console.warn("match_cards RPC error, falling back to keyword:", error);
      }
    }
  } catch (err) {
    console.warn("Embedding generation error in retrieval, fallback to keyword:", err);
  }

  // Fetch up to 100 cards for keyword matching
  const { data: allCards } = await supabase
    .from("knowledge_cards")
    .select("id, concept, summary, client_name, tags, source_id")
    .eq("brain_id", brainId)
    .order("created_at", { ascending: false })
    .limit(100);

  const kwHits = keywordFilter(allCards ?? [], question);

  // Fuse with RRF
  const fused = reciprocalRankFusion(vectorHits, kwHits, 60);
  const topCards = fused.slice(0, limit);
  const latencyMs = Date.now() - t0;

  if (topCards.length === 0) {
    return {
      cards: [],
      retrievalMode: "abstain",
      latencyMs,
    };
  }

  return {
    cards: topCards,
    retrievalMode: "hybrid",
    latencyMs,
  };
}
