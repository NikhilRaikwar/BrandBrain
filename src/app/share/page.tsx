import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ShareWorkspace } from "@/components/brain/ShareWorkspace";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserBrain } from "@/lib/brain";

export const dynamic = "force-dynamic";

export default async function SharePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const brain = await getUserBrain(user.id);
  if (!brain) redirect("/dashboard");

  return (
    <AuthLayout userEmail={user.email ?? ""}>
      <ShareWorkspace brain={brain} />
    </AuthLayout>
  );
}
