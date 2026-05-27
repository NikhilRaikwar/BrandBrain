import { AuthLayout } from "@/components/layout/AuthLayout";
import { BrainSelector } from "@/components/brain/BrainSelector";
import { ScoreWorkbench } from "@/components/brain/ScoreWorkbench";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUserOrRedirect, getUserBrains } from "@/lib/brain";

export const dynamic = "force-dynamic";

export default async function ScorePage({
  searchParams,
}: {
  searchParams?: { brain?: string };
}) {
  const user = await getCurrentUserOrRedirect();
  const brains = await getUserBrains(user.id);
  const brain = brains.find((item) => item.id === searchParams?.brain) ?? brains[0] ?? null;

  const admin = createSupabaseAdminClient();
  const [clientsRes, scoreRes] = brain
    ? await Promise.all([
        admin.from("knowledge_cards").select("client_name").eq("brain_id", brain.id),
        admin.from("score_log").select("score_after").eq("brain_id", brain.id),
      ])
    : [{ data: [] }, { data: [] }];

  const clientOptions = Array.from(
    new Set((clientsRes.data ?? []).map((row) => row.client_name).filter(Boolean))
  ).sort();
  const agencyAverageScore =
    scoreRes.data && scoreRes.data.length > 0
      ? scoreRes.data.reduce((sum, row) => sum + row.score_after, 0) / scoreRes.data.length
      : 0;

  return (
    <AuthLayout userEmail={user.email ?? ""}>
      <div className="page-content">
        <div className="page-header mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="page-title">Score Your Copy</div>
              <div className="page-sub">
                Rate your copy 0-100 using Ogilvy&apos;s 15 principles against your own best work.
              </div>
            </div>
            <BrainSelector brains={brains} selectedBrainId={brain?.id ?? ""} />
          </div>
        </div>
        <ScoreWorkbench
          brainId={brain?.id ?? null}
          clientOptions={clientOptions}
          agencyAverageScore={agencyAverageScore}
          hasBrain={Boolean(brain)}
        />
      </div>
    </AuthLayout>
  );
}
