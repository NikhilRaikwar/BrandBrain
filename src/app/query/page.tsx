import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { QueryConsole } from "@/components/brain/QueryConsole";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUserOrRedirect, getUserBrain } from "@/lib/brain";

export const dynamic = "force-dynamic";

export default async function QueryPage() {
  const user = await getCurrentUserOrRedirect();
  const brain = await getUserBrain(user.id);
  if (!brain) redirect("/dashboard");

  const admin = createSupabaseAdminClient();
  const [sourceCount, conceptCountRes, queryLogRes] = await Promise.all([
    admin.from("raw_sources").select("id", { count: "exact", head: true }).eq("brain_id", brain.id),
    admin.from("knowledge_cards").select("id", { count: "exact", head: true }).eq("brain_id", brain.id),
    admin.from("query_log").select("cost_usd, created_at").eq("brain_id", brain.id).order("created_at", { ascending: false }),
  ]);

  const today = new Date();
  const todayCostUsd =
    queryLogRes.data?.reduce((total, row) => {
      const rowDate = new Date(row.created_at);
      return rowDate.toDateString() === today.toDateString() ? total + (row.cost_usd ?? 0) : total;
    }, 0) ?? 0;
  const lastQueryCostUsd = queryLogRes.data?.[0]?.cost_usd ?? 0;

  return (
    <AuthLayout userEmail={user.email ?? ""}>
      <QueryConsole
        brainId={brain.id}
        brainName={brain.name}
        conceptCount={conceptCountRes.count ?? 0}
        documentCount={sourceCount.count ?? 0}
        initialTodayCostUsd={todayCostUsd}
        initialLastQueryCostUsd={lastQueryCostUsd}
      />
    </AuthLayout>
  );
}
