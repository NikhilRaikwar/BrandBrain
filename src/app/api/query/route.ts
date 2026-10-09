import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { estimateCostUsd } from "@/lib/pricing";
import { getOpenRouter, OPENROUTER_MODEL } from "@/lib/openai";
import { buildKnowledgeContext, getBrainByToken, getCurrentUser, getUserBrainIds } from "@/lib/brain";
import { keywordFilter, reciprocalRankFusion, RetrievedCard } from "@/lib/retrieval";
import { embedTexts } from "@/lib/embeddings";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const t0 = Date.now();
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

    // a. Embed question
    let vectorHits: RetrievedCard[] = [];
    try {
      const qEmbs = await embedTexts([question]);
      if (qEmbs.length > 0 && qEmbs[0].length > 0) {
        // b. pgvector match_cards
        const { data: rpcHits, error: rpcError } = await admin.rpc("match_cards", {
          p_brain_id: resolvedBrainId,
          p_embedding: qEmbs[0],
          p_limit: 20,
        });

        if (!rpcError && rpcHits) {
          vectorHits = (rpcHits as RetrievedCard[]).filter(
            (hit) => hit.similarity === undefined || hit.similarity >= 0.25
          );
        } else if (rpcError) {
          console.warn("match_cards RPC error:", rpcError);
        }
      }
    } catch (embErr) {
      console.warn("Question embedding error:", embErr);
    }

    // c. Fetch up to 100 cards for keyword filtering
    const { data: allCards } = await admin
      .from("knowledge_cards")
      .select("id, concept, summary, client_name, tags, source_id")
      .eq("brain_id", resolvedBrainId)
      .order("created_at", { ascending: false })
      .limit(100);

    // d. Keyword filter
    const kwHits = keywordFilter(allCards ?? [], question);

    // e. RRF fuse -> top 8
    const fused = reciprocalRankFusion(vectorHits, kwHits, 60);
    const top8 = fused.slice(0, 8);

    // f. Abstain if no cards found
    if (top8.length === 0) {
      const latencyMs = Date.now() - t0;
      await admin.from("query_log").insert({
        brain_id: resolvedBrainId,
        question,
        answer: "I don't have evidence for this in the ingested documents.",
        sources_used: [],
        tokens_used: 0,
        cost_usd: 0,
        retrieval_mode: "abstain",
        latency_ms: latencyMs,
        cited_card_ids: [],
      });

      return NextResponse.json(
        {
          answer: "I don't have evidence for this in the ingested documents.",
          sources: [],
          abstained: true,
          cost_usd: 0,
          public: isPublicRequest,
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    // g. Build knowledge context and generate completion
    const context = buildKnowledgeContext(top8);
    const sourceIds = Array.from(
      new Set(top8.map((card) => card.source_id).filter(Boolean))
    );
    const { data: rawSources } = sourceIds.length
      ? await admin.from("raw_sources").select("title").in("id", sourceIds)
      : { data: [] as Array<{ title: string }> };
    const sources = (rawSources ?? []).map((source) => source.title);

    const openrouter = getOpenRouter();
    const completion = await openrouter.chat.completions.create({
      model: OPENROUTER_MODEL,
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

    const answer =
      completion.choices[0]?.message?.content?.trim() ||
      "I could not generate an answer from the provided knowledge cards.";
    const promptTokens = completion.usage?.prompt_tokens ?? 0;
    const completionTokens = completion.usage?.completion_tokens ?? 0;
    const costUsd = estimateCostUsd(promptTokens, completionTokens);
    const latencyMs = Date.now() - t0;

    await admin.from("query_log").insert({
      brain_id: resolvedBrainId,
      question,
      answer,
      sources_used: sources,
      tokens_used: promptTokens + completionTokens,
      cost_usd: costUsd,
      retrieval_mode: "hybrid",
      latency_ms: latencyMs,
      cited_card_ids: top8.map((c) => c.id),
    });

    const { data: brainRow } = await admin
      .from("brains")
      .select("queries_answered")
      .eq("id", resolvedBrainId)
      .maybeSingle();

    await admin
      .from("brains")
      .update({ queries_answered: (brainRow?.queries_answered ?? 0) + 1 })
      .eq("id", resolvedBrainId);

    return NextResponse.json(
      {
        answer,
        sources,
        cost_usd: costUsd,
        public: isPublicRequest,
        abstained: false,
      },
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
