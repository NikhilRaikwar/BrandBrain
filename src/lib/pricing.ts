export const INPUT_COST_PER_M_TOKENS = 0.15;
export const OUTPUT_COST_PER_M_TOKENS = 0.6;
export const USD_TO_INR = 83;

export function estimateCostUsd(promptTokens: number, completionTokens: number) {
  return (
    (promptTokens / 1_000_000) * INPUT_COST_PER_M_TOKENS +
    (completionTokens / 1_000_000) * OUTPUT_COST_PER_M_TOKENS
  );
}

export function usdToInr(usd: number) {
  return usd * USD_TO_INR;
}
