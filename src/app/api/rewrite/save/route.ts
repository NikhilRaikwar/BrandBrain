import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUser, getUserBrainIds } from "@/lib/brain";

export const dynamic = "force-dynamic";

function summarizeRewrite(copy: string) {
  const compact = copy.replace(/\s+/g, " ").trim();
  if (compact.length <= 220) return compact;
  return `${compact.slice(0, 220).trim()}...`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const brainId = String(body.brainId ?? "");
    const clientName = String(body.clientName ?? "").trim();
    const title = String(body.title ?? "").trim() || `Saved rewrite for ${clientName}`;
    const rewrite = String(body.rewrite ?? "").trim();

    if (!brainId || !clientName || !rewrite) {
      return NextResponse.json({ error: "brainId, clientName, and rewrite are required" }, { status: 400 });
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
        content: rewrite,
        source_type: "campaign",
        client_name: clientName,
      })
      .select("id")
      .single();

    if (sourceError || !sourceRow) {
      return NextResponse.json({ error: sourceError?.message ?? "Failed to save rewrite" }, { status: 500 });
    }

    const { error: cardError } = await admin.from("knowledge_cards").insert({
      brain_id: brainId,
      source_id: sourceRow.id,
      concept: `Approved Rewrite for ${clientName}`,
      summary: summarizeRewrite(rewrite),
      client_name: clientName,
      tags: ["rewrite", "campaign", "approved-copy"],
    });

    if (cardError) {
      return NextResponse.json({ error: cardError.message }, { status: 500 });
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
        concepts_extracted: (brainRow?.concepts_extracted ?? 0) + 1,
      })
      .eq("id", brainId);

    return NextResponse.json({ source_id: sourceRow.id, cards_created: 1 }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save rewrite" },
      { status: 500 }
    );
  }
}
