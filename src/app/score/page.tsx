import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ScoreWorkbench } from "@/components/brain/ScoreWorkbench";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUserOrRedirect, getUserBrain } from "@/lib/brain";

export const dynamic = "force-dynamic";

export default async function ScorePage() {
  const user = await getCurrentUserOrRedirect();
  const brain = await getUserBrain(user.id);
  if (!brain) redirect("/dashboard");

  const admin = createSupabaseAdminClient();
  const [clientsRes, scoreRes] = await Promise.all([
    admin.from("knowledge_cards").select("client_name").eq("brain_id", brain.id),
    admin.from("score_log").select("score_after").eq("brain_id", brain.id),
  ]);

  const clientOptions = Array.from(new Set((clientsRes.data ?? []).map((row) => row.client_name))).sort();
  const agencyAverageScore =
    scoreRes.data && scoreRes.data.length > 0
      ? scoreRes.data.reduce((sum, row) => sum + row.score_after, 0) / scoreRes.data.length
      : 0;

  return (
    <AuthLayout userEmail={user.email ?? ""}>
      <ScoreWorkbench
        brainId={brain.id}
        clientOptions={clientOptions}
        agencyAverageScore={agencyAverageScore}
      />
    </AuthLayout>
  );
}
