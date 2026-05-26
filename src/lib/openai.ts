import OpenAI from "openai";

export function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("The OPENAI_API_KEY environment variable is missing or empty.");
  }
  return new OpenAI({ apiKey });
}
