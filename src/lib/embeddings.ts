import { getOpenRouter } from "./openai";

export const OPENROUTER_EMBED_MODEL =
  process.env.OPENROUTER_EMBED_MODEL ?? "openai/text-embedding-3-small";

const BATCH_SIZE = 32;
const MAX_CHARS = 8000;
const MAX_RETRIES = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sanitizeText(text: string): string {
  const trimmed = (text || "").trim();
  if (!trimmed) {
    return "empty";
  }
  return trimmed.slice(0, MAX_CHARS);
}

export function cardText(card: {
  client_name?: string | null;
  concept?: string | null;
  summary?: string | null;
  tags?: string[] | null;
}): string {
  const client = card.client_name ? `[${card.client_name}]` : "";
  const concept = card.concept ?? "";
  const summary = card.summary ?? "";
  const tags = card.tags && card.tags.length > 0 ? `Tags: ${card.tags.join(", ")}` : "";

  return [client, concept, summary, tags].filter(Boolean).join(" ");
}

async function embedBatchWithRetry(
  batch: string[],
  model: string,
  retries = MAX_RETRIES
): Promise<number[][]> {
  const client = getOpenRouter();
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await client.embeddings.create({
        model,
        input: batch,
      });

      // Sort by index in case OpenRouter/OpenAI returns out of order
      const sorted = [...res.data].sort((a, b) => a.index - b.index);
      return sorted.map((item) => item.embedding);
    } catch (err: any) {
      lastError = err;
      const isRateLimit =
        err?.status === 429 ||
        err?.statusCode === 429 ||
        (typeof err?.message === "string" && err.message.toLowerCase().includes("rate limit"));

      if (attempt < retries && (isRateLimit || err?.status >= 500)) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (!texts || texts.length === 0) {
    return [];
  }

  const sanitized = texts.map(sanitizeText);
  const results: number[][] = [];

  for (let i = 0; i < sanitized.length; i += BATCH_SIZE) {
    const batch = sanitized.slice(i, i + BATCH_SIZE);
    const batchEmbeddings = await embedBatchWithRetry(
      batch,
      OPENROUTER_EMBED_MODEL,
      MAX_RETRIES
    );
    results.push(...batchEmbeddings);
  }

  return results;
}
