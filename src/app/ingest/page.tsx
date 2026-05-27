import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { BrainSelector } from "@/components/brain/BrainSelector";
import { IngestForm } from "@/components/brain/IngestForm";
import { SourceBadge } from "@/components/brain/SourceBadge";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserBrains } from "@/lib/brain";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function IngestPage({
  searchParams,
}: {
  searchParams?: { brain?: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const brains = await getUserBrains(user.id);
  const selectedBrain = brains.find((item) => item.id === searchParams?.brain) ?? brains[0] ?? null;

  const admin = createSupabaseAdminClient();
  const [sourcesRes, cardsRes] = selectedBrain
    ? await Promise.all([
        admin.from("raw_sources").select("*").eq("brain_id", selectedBrain.id).order("created_at", { ascending: false }),
        admin.from("knowledge_cards").select("id, source_id").eq("brain_id", selectedBrain.id),
      ])
    : [{ data: [] }, { data: [] }];

  const conceptCounts = (cardsRes.data ?? []).reduce<Record<string, number>>((acc, card) => {
    if (!card.source_id) return acc;
    acc[card.source_id] = (acc[card.source_id] ?? 0) + 1;
    return acc;
  }, {});

  const sources = sourcesRes.data ?? [];

  return (
    <AuthLayout userEmail={user.email ?? ""}>
      <div className="page-content">
        <div className="page-header">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="page-title">Feed Your Brain</div>
              <div className="page-sub">
                Ingest campaigns, briefs, and brand guides to build your agency memory.
              </div>
            </div>
            <BrainSelector brains={brains} selectedBrainId={selectedBrain?.id ?? ""} />
          </div>
        </div>

        <div className="grid-2">
          <div className="card card-top-green">
            <div className="section-title mb-1 text-[16px]">Feed Your Brain</div>
            <div className="mb-4 text-[13px] text-[var(--ink4)]">
              Paste or upload any marketing document.
            </div>
            {!selectedBrain ? (
              <div className="mb-4 rounded-[12px] border border-[var(--border)] bg-[var(--cream2)] p-4 text-sm text-[var(--ink3)]">
                This is your first step. Add a document and we&apos;ll create your first brain automatically.
              </div>
            ) : null}
            <IngestForm brainId={selectedBrain?.id ?? null} />
          </div>

          <div className="card card-top-purple">
            <div className="section-header">
              <div className="section-title mb-0 text-[16px]">Brain Contents</div>
              <span className="badge badge-cream">{sources.length} docs</span>
            </div>

            <div className="mt-4 space-y-3">
              {sources.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🌱</div>
                  <div className="empty-title">Your brain is empty</div>
                  <div className="empty-sub">Add your first document to get started.</div>
                </div>
              ) : (
                sources.map((source) => (
                  <div key={source.id} className="source-item">
                    <div className="source-item-header">
                      <div>
                        <div className="source-title">{source.title}</div>
                        <div className="source-meta">
                          {source.client_name} · {conceptCounts[source.id] ?? 0} concepts · {timeAgo(source.created_at)}
                        </div>
                      </div>
                      <SourceBadge type={source.source_type} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
