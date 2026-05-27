import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUser, getUserBrainIds, buildKnowledgeContext } from "@/lib/brain";
import { OGILVY_SCORER_PROMPT } from "@/lib/ogilvy-prompt";
import { estimateCostUsd } from "@/lib/pricing";
import { getOpenAI } from "@/lib/openai";

export const dynamic = "force-dynamic";

function safeParseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Invalid JSON returned by model");
  }
}

async function scoreCopy(context: string, copy: string) {
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: OGILVY_SCORER_PROMPT },
      {
        role: "user",
        content: `AGENCY PAST CAMPAIGNS FOR CONTEXT:\n${context}\n\nNEW COPY TO SCORE:\n${copy}`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "{}";
  const parsed = safeParseJson(content);
  return {
    parsed,
    usage: completion.usage ?? { prompt_tokens: 0, completion_tokens: 0 },
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const brainId = String(body.brainId ?? "");
    const clientName = String(body.clientName ?? "").trim();
    const copy = String(body.copy ?? "").trim();

    if (!brainId || !clientName || !copy) {
      return NextResponse.json({ error: "brainId, clientName, and copy are required" }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validBrainIds = await getUserBrainIds(user.id);
    if (!validBrainIds.includes(brainId)) {
      return NextResponse.json({ error: "Brain not found" }, { status: 404 });
    }

    const admin = createSupabaseAdminClient();
    const { data: cards } = await admin
      .from("knowledge_cards")
      .select("*")
      .eq("brain_id", brainId)
      .eq("client_name", clientName)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!cards || cards.length === 0) {
      return NextResponse.json(
        { error: "No past campaigns found for this client" },
        { status: 404 }
      );
    }

    const context = buildKnowledgeContext(
      cards.map((card) => ({
        concept: card.concept,
        summary: card.summary,
        client_name: card.client_name,
        tags: card.tags ?? [],
      }))
    );

    const firstPass = await scoreCopy(context, copy);
    const scoreBefore = Number(firstPass.parsed.overall_score ?? 0);
    const rewrite = String(firstPass.parsed.rewrite ?? "");

    const secondPass = await scoreCopy(context, rewrite || copy);
    const scoreAfter = Number(secondPass.parsed.overall_score ?? 0);

    const promptTokens =
      (firstPass.usage.prompt_tokens ?? 0) + (secondPass.usage.prompt_tokens ?? 0);
    const completionTokens =
      (firstPass.usage.completion_tokens ?? 0) + (secondPass.usage.completion_tokens ?? 0);
    const costUsd = estimateCostUsd(promptTokens, completionTokens);

    const result = {
      overall_score: scoreBefore,
      breakdown: firstPass.parsed.breakdown ?? [],
      top_3_failures: firstPass.parsed.top_3_failures ?? [],
      rewrite: rewrite || copy,
      rewrite_score: scoreAfter,
      cost_usd: costUsd,
    };

    await admin.from("score_log").insert({
      brain_id: brainId,
      client_name: clientName,
      original_copy: copy,
      score_before: scoreBefore,
      score_after: scoreAfter,
      breakdown: result.breakdown,
      top_3_failures: result.top_3_failures,
      rewritten_copy: result.rewrite,
      tokens_used: promptTokens + completionTokens,
      cost_usd: costUsd,
    });

    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Score failed" },
      { status: 500 }
    );
  }
}
