import { notFound } from "next/navigation";
import { QueryConsole } from "@/components/brain/QueryConsole";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function PublicBrainPage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;
  const admin = createSupabaseAdminClient();
  const { data: brain } = await admin
    .from("brains")
    .select("*")
    .eq("share_token", token)
    .eq("is_public", true)
    .maybeSingle();

  if (!brain) notFound();

  const { count: sourceCount } = await admin
    .from("raw_sources")
    .select("id", { count: "exact", head: true })
    .eq("brain_id", brain.id);
  const { count: conceptCount } = await admin
    .from("knowledge_cards")
    .select("id", { count: "exact", head: true })
    .eq("brain_id", brain.id);

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-6 text-[var(--text)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1100px] space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Badge className="badge-green">Powered by BrandBrain</Badge>
            <h1 className="mt-4 font-display text-4xl font-bold text-[var(--white)]">
              {brain.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              {brain.description}
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="card">
            <div className="text-3xl font-bold text-[var(--white)]">{sourceCount ?? 0}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Docs</div>
          </div>
          <div className="card">
            <div className="text-3xl font-bold text-[var(--white)]">{conceptCount ?? 0}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Concepts</div>
          </div>
          <div className="card">
            <div className="text-3xl font-bold text-[var(--white)]">{brain.queries_answered ?? 0}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Queries</div>
          </div>
        </div>

        <QueryConsole
          shareToken={token}
          brainName={brain.name}
          conceptCount={conceptCount ?? 0}
          documentCount={sourceCount ?? 0}
          initialTodayCostUsd={0}
          initialLastQueryCostUsd={0}
        />
      </div>
    </main>
  );
}
