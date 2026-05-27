import { notFound } from "next/navigation";
import { QueryConsole } from "@/components/brain/QueryConsole";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

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

  const [sourceCountRes, conceptCountRes] = await Promise.all([
    admin.from("raw_sources").select("id", { count: "exact", head: true }).eq("brain_id", brain.id),
    admin.from("knowledge_cards").select("id", { count: "exact", head: true }).eq("brain_id", brain.id),
  ]);

  return (
    <main className="min-h-screen bg-[var(--cream)] px-4 py-6 text-[var(--ink)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1100px] space-y-4">
        <div className="inline-flex items-center rounded-full border border-[var(--green-border)] bg-[var(--green-bg)] px-3 py-1 text-[11px] font-semibold text-[var(--green)]">
          Powered by BrandBrain
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold text-[var(--ink)]">{brain.name}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink3)]">{brain.description}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="card">
            <div className="text-3xl font-bold text-[var(--ink)]">{sourceCountRes.count ?? 0}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[var(--ink4)]">Docs</div>
          </div>
          <div className="card">
            <div className="text-3xl font-bold text-[var(--ink)]">{conceptCountRes.count ?? 0}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[var(--ink4)]">Concepts</div>
          </div>
          <div className="card">
            <div className="text-3xl font-bold text-[var(--ink)]">{brain.queries_answered ?? 0}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[var(--ink4)]">Queries</div>
          </div>
        </div>

        <QueryConsole
          shareToken={token}
          brainName={brain.name}
          conceptCount={conceptCountRes.count ?? 0}
          documentCount={sourceCountRes.count ?? 0}
          hasBrain
        />
      </div>
    </main>
  );
}
