import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { BrainSelector } from "@/components/brain/BrainSelector";
import { AnalyticsCharts } from "@/components/brain/AnalyticsCharts";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAnalyticsData } from "@/lib/analytics";
import { getUserBrains } from "@/lib/brain";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({
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
  const brain = brains.find((item) => item.id === searchParams?.brain) ?? brains[0] ?? null;

  const data = brain
    ? await getAnalyticsData(brain.id)
    : {
        scoreSeries: [],
        querySeries: [],
        costTable: [],
        totalCosts: { usd: 0, inr: 0 },
        overallStats: { docs: 0, concepts: 0, queries: 0, scores: 0 },
      };

  return (
    <AuthLayout userEmail={user.email ?? ""}>
      <div className="page-content">
        <div className="page-header mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="page-title">Analytics</div>
              <div className="page-sub">Usage, activity, and copy quality over time.</div>
            </div>
            <BrainSelector brains={brains} selectedBrainId={brain?.id ?? ""} />
          </div>
        </div>
        <AnalyticsCharts {...data} />
      </div>
    </AuthLayout>
  );
}
