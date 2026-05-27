import { AuthLayout } from "@/components/layout/AuthLayout";
import { BrainSelector } from "@/components/brain/BrainSelector";
import { QueryConsole } from "@/components/brain/QueryConsole";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserOrRedirect, getUserBrains } from "@/lib/brain";

export const dynamic = "force-dynamic";

export default async function QueryPage({
  searchParams,
}: {
  searchParams?: { brain?: string };
}) {
  const user = await getCurrentUserOrRedirect();
  const brains = await getUserBrains(user.id);
  const brain = brains.find((item) => item.id === searchParams?.brain) ?? brains[0] ?? null;

  const admin = createSupabaseAdminClient();
  const [sourceCount, conceptCountRes] = brain
    ? await Promise.all([
        admin.from("raw_sources").select("id", { count: "exact", head: true }).eq("brain_id", brain.id),
        admin.from("knowledge_cards").select("id", { count: "exact", head: true }).eq("brain_id", brain.id),
      ])
    : [{ count: 0 }, { count: 0 }];

  return (
    <AuthLayout userEmail={user.email ?? ""}>
      <div className="page-content">
        <div className="page-header mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="page-title">Query Brain</div>
              <div className="page-sub">
                Ask anything about your agency&apos;s creative history. Answers cite real documents.
              </div>
            </div>
            <BrainSelector brains={brains} selectedBrainId={brain?.id ?? ""} />
          </div>
        </div>
        <QueryConsole
          brainId={brain?.id}
          brainName={brain?.name ?? "My Agency Brain"}
          conceptCount={conceptCountRes.count ?? 0}
          documentCount={sourceCount.count ?? 0}
          hasBrain={Boolean(brain)}
          readOnly={!brain}
        />
      </div>
    </AuthLayout>
  );
}
