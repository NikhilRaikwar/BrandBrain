import OpenAI from "openai";

export const OPENROUTER_MODEL = "openai/gpt-4o-mini";

export function getOpenRouter() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("The OPENROUTER_API_KEY environment variable is missing or empty.");
  }

  return new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      "X-OpenRouter-Title": "BrandBrain",
    },
  });
}
