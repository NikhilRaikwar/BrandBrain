import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { createSupabaseAdminClient } from "../src/lib/supabase/server";
import { cardText, embedTexts } from "../src/lib/embeddings";

async function main() {
  console.log("Starting knowledge cards embedding backfill...");
  const admin = createSupabaseAdminClient();

  const { data: cards, error } = await admin
    .from("knowledge_cards")
    .select("id, concept, summary, client_name, tags")
    .is("embedding", null);

  if (error) {
    console.error("Error fetching un-embedded cards:", error);
    process.exit(1);
  }

  if (!cards || cards.length === 0) {
    console.log("0 to process. All knowledge cards already have embeddings.");
    process.exit(0);
  }

  console.log(`Found ${cards.length} cards without embeddings.`);

  const BATCH_SIZE = 32;
  let processed = 0;

  for (let i = 0; i < cards.length; i += BATCH_SIZE) {
    const batch = cards.slice(i, i + BATCH_SIZE);
    const texts = batch.map((c) => cardText(c));

    try {
      const embeddings = await embedTexts(texts);
      await Promise.all(
        batch.map((card, idx) => {
          const emb = embeddings[idx];
          if (!emb) return Promise.resolve();
          return admin
            .from("knowledge_cards")
            .update({ embedding: emb })
            .eq("id", card.id);
        })
      );

      processed += batch.length;
      console.log(`Processed batch ${Math.floor(i / BATCH_SIZE) + 1} (${processed}/${cards.length} cards)`);
    } catch (err) {
      console.error(`Error processing batch starting at index ${i}:`, err);
      process.exit(1);
    }
  }

  console.log(`Successfully backfilled ${processed} knowledge cards.`);
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
