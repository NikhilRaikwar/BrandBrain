import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AnalyticsCharts } from "@/components/brain/AnalyticsCharts";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAnalyticsData } from "@/lib/analytics";
import { getUserBrain } from "@/lib/brain";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const brain = await getUserBrain(user.id);
  if (!brain) redirect("/dashboard");

  const data = await getAnalyticsData(brain.id);

  return (
    <AuthLayout userEmail={user.email ?? ""}>
      <AnalyticsCharts {...data} />
    </AuthLayout>
  );
}
