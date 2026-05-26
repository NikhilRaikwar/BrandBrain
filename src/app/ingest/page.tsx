import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { IngestForm } from "@/components/brain/IngestForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { SourceBadge } from "@/components/brain/SourceBadge";
import { Badge } from "@/components/ui/badge";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function IngestPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createSupabaseAdminClient();
  const { data: brain } = await admin
    .from("brains")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!brain) redirect("/dashboard");

  const [sourcesRes, cardsRes] = await Promise.all([
    admin.from("raw_sources").select("*").eq("brain_id", brain.id).order("created_at", { ascending: false }),
    admin.from("knowledge_cards").select("id, source_id").eq("brain_id", brain.id),
  ]);

  const conceptCounts = (cardsRes.data ?? []).reduce<Record<string, number>>((acc, card) => {
    acc[card.source_id] = (acc[card.source_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AuthLayout userEmail={user.email ?? ""}>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="card card-green">
          <h1 className="font-display text-4xl font-bold text-[var(--white)]">Feed Your Brain</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Ingest campaigns, briefs, and brand guides.
          </p>
          <div className="mt-6">
            <IngestForm brainId={brain.id} />
          </div>
        </section>

        <section className="card card-purple">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-bold text-[var(--white)]">Brain Contents</h2>
            <Badge>{sourcesRes.data?.length ?? 0} docs</Badge>
          </div>

          <div className="mt-6 space-y-3">
            {(sourcesRes.data ?? []).length === 0 ? (
              <EmptyState
                iconName="brain"
                title="Your brain is empty"
                description="Add your first document to get started."
              />
            ) : (
              (sourcesRes.data ?? []).map((source) => (
                <div key={source.id} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <SourceBadge type={source.source_type} />
                    <span className="text-xs text-[var(--muted)]">
                      {conceptCounts[source.id] ?? 0} concepts
                    </span>
                    <span className="text-xs text-[var(--muted)]">{timeAgo(source.created_at)}</span>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-bold text-[var(--white)]">
                    {source.title}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">{source.client_name}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AuthLayout>
  );
}
