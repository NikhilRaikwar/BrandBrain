import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUser, getUserBrainIds } from "@/lib/brain";
import { estimateCostUsd } from "@/lib/pricing";
import { getOpenAI } from "@/lib/openai";

export const dynamic = "force-dynamic";

const validSourceTypes = new Set(["campaign", "brand_guide", "brief", "performance_data"]);

function parseConcepts(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Invalid JSON returned by model");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const brainId = String(body.brainId ?? "");
    const sourceType = String(body.sourceType ?? "");
    const clientName = String(body.clientName ?? "").trim();
    const title = String(body.title ?? "").trim();
    const content = String(body.content ?? "").trim();

    if (!brainId || !sourceType || !clientName || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!validSourceTypes.has(sourceType)) {
      return NextResponse.json({ error: "Invalid source type" }, { status: 400 });
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
    const { data: sourceRow, error: sourceError } = await admin
      .from("raw_sources")
      .insert({
        brain_id: brainId,
        title,
        content,
        source_type: sourceType,
        client_name: clientName,
      })
      .select()
      .single();
    if (sourceError || !sourceRow) {
      return NextResponse.json({ error: sourceError?.message ?? "Failed to save source" }, { status: 500 });
    }

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Extract 3-7 key concepts from this marketing document. Return JSON array of objects with fields: concept (string), summary (string, 1-2 sentences), tags (string array of 2-4 keywords). Return ONLY valid JSON, no markdown.",
        },
        { role: "user", content },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "[]";
    const concepts = parseConcepts(raw) as Array<{
      concept: string;
      summary: string;
      tags?: string[];
    }>;

    if (concepts.length > 0) {
      await admin.from("knowledge_cards").insert(
        concepts.map((concept) => ({
          brain_id: brainId,
          source_id: sourceRow.id,
          concept: concept.concept,
          summary: concept.summary,
          client_name: clientName,
          tags: concept.tags ?? [],
        }))
      );
    }

    const { data: brainRow } = await admin
      .from("brains")
      .select("docs_ingested, concepts_extracted")
      .eq("id", brainId)
      .maybeSingle();

    await admin
      .from("brains")
      .update({
        docs_ingested: (brainRow?.docs_ingested ?? 0) + 1,
        concepts_extracted: (brainRow?.concepts_extracted ?? 0) + concepts.length,
      })
      .eq("id", brainId);

    const costUsd = estimateCostUsd(completion.usage?.prompt_tokens ?? 0, completion.usage?.completion_tokens ?? 0);

    return NextResponse.json({
      concepts,
      count: concepts.length,
      cost_usd: costUsd,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process document" },
      { status: 500 }
    );
  }
}
