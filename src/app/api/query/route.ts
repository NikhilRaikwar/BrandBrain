import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { estimateCostUsd } from "@/lib/pricing";
import { getOpenAI } from "@/lib/openai";
import { buildKnowledgeContext, getBrainByToken, getCurrentUser, getUserBrainIds } from "@/lib/brain";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = String(body.question ?? "").trim();
    const brainId = body.brainId ? String(body.brainId) : null;
    const shareToken = body.shareToken ? String(body.shareToken) : null;

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    let resolvedBrainId = brainId;
    let isPublicRequest = false;

    if (shareToken) {
      const brain = await getBrainByToken(shareToken);
      if (!brain) {
        return NextResponse.json({ error: "Brain not found or not public" }, { status: 404 });
      }
      resolvedBrainId = brain.id;
      isPublicRequest = true;
    } else {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const validBrainIds = await getUserBrainIds(user.id);
      if (!resolvedBrainId || !validBrainIds.includes(resolvedBrainId)) {
        resolvedBrainId = validBrainIds[0] ?? null;
      }
      if (!resolvedBrainId) {
        return NextResponse.json({ error: "Brain not found" }, { status: 404 });
      }
    }

    const { data: cards } = await admin
      .from("knowledge_cards")
      .select("*")
      .eq("brain_id", resolvedBrainId)
      .order("created_at", { ascending: false })
      .limit(25);

    const tokens = Array.from(
      new Set(
        (question.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter(
          (token) => token.length > 2 && !["what", "when", "where", "why", "how", "the", "and", "for", "with", "this", "that", "from", "into", "about", "your", "what's", "whats", "is", "are", "was", "were"].includes(token)
        )
      )
    );

    const matchingCards =
      cards?.filter((card) => {
        const haystack = [
          card.concept,
          card.summary,
          card.client_name,
          ...(card.tags ?? []),
        ]
          .join(" ")
          .toLowerCase();
        return tokens.length === 0
          ? true
          : tokens.some((token) => haystack.includes(token));
      }) ?? [];

    const usableCards = matchingCards.length > 0 ? matchingCards : cards ?? [];
    const context = buildKnowledgeContext(usableCards);
    const sourceIds = Array.from(
      new Set(usableCards.map((card) => card.source_id).filter(Boolean))
    );
    const { data: rawSources } = sourceIds.length
      ? await admin.from("raw_sources").select("title").in("id", sourceIds)
      : { data: [] as Array<{ title: string }> };
    const sources = (rawSources ?? []).map((source) => source.title);

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are BrandBrain, an AI with access to a marketing agency's institutional knowledge. Answer questions using ONLY the provided knowledge cards. Always cite which documents your answer comes from. Be specific, direct, actionable.",
        },
        {
          role: "user",
          content: `Knowledge cards:\n${context || "No matching knowledge cards were found."}\n\nQuestion: ${question}`,
        },
      ],
    });

    const answer = completion.choices[0]?.message?.content?.trim() ||
      "I could not generate an answer from the provided knowledge cards.";
    const promptTokens = completion.usage?.prompt_tokens ?? 0;
    const completionTokens = completion.usage?.completion_tokens ?? 0;
    const costUsd = estimateCostUsd(promptTokens, completionTokens);

    await admin.from("query_log").insert({
      brain_id: resolvedBrainId,
      question,
      answer,
      sources_used: sources,
      tokens_used: promptTokens + completionTokens,
      cost_usd: costUsd,
    });

    const { data: brainRow } = await admin.from("brains").select("queries_answered").eq("id", resolvedBrainId).maybeSingle();
    await admin
      .from("brains")
      .update({ queries_answered: (brainRow?.queries_answered ?? 0) + 1 })
      .eq("id", resolvedBrainId);

    return NextResponse.json(
      { answer, sources, cost_usd: costUsd, public: isPublicRequest },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Query failed" },
      { status: 500 }
    );
  }
}
