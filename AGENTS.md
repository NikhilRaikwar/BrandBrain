# BrandBrain — AGENTS.md

## Project
BrandBrain: living Company Brain for marketing agencies.
Three layers: Knowledge (ingest), Judgment (Ogilvy score), Skills (reusable frameworks).

## Rules — always follow
- Query knowledge_cards before generating any copy or answer
- Always show source citations with query answers
- Always pull client's past campaigns before scoring copy
- Log every query and score to database with token costs
- Never import openai on client side — server routes only
- Never expose SUPABASE_SERVICE_ROLE_KEY to browser
- All money values stored as USD float, displayed as INR (×83)
- Score ring color: red <50, orange 50-74, green 75+

## Rules — never do
- Never modify raw_sources after initial insert
- Never delete knowledge_cards without user confirmation
- Never score copy without first fetching client history
- Never hardcode API keys anywhere

## Cost constants (src/lib/pricing.ts)
INPUT_COST_PER_M_TOKENS = 0.15   // USD per million
OUTPUT_COST_PER_M_TOKENS = 0.60   // USD per million
USD_TO_INR = 83

## Stack
Next.js 14 App Router, Supabase, OpenAI gpt-4o-mini,
Tailwind, shadcn/ui, Recharts, Sonner, Lucide
