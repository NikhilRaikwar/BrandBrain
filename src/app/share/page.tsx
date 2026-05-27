import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { BrainSelector } from "@/components/brain/BrainSelector";
import { ShareWorkspace } from "@/components/brain/ShareWorkspace";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserBrains } from "@/lib/brain";

export const dynamic = "force-dynamic";

export default async function SharePage({
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

  return (
    <AuthLayout userEmail={user.email ?? ""}>
      <div className="page-content">
        <div className="page-header mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="page-title">Share Brain</div>
              <div className="page-sub">
                Generate a public link so clients or teammates can query your brain without logging in.
              </div>
            </div>
            <BrainSelector brains={brains} selectedBrainId={brain?.id ?? ""} />
          </div>
        </div>

        {brain ? (
          <ShareWorkspace brain={brain} />
        ) : (
          <div className="mx-auto w-full max-w-[640px] space-y-4">
            <section className="card card-top-purple">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink4)]">
                Brain Name
              </div>
              <div className="mt-2 font-display text-[28px] font-bold text-[var(--ink)]">No brain yet</div>
              <p className="mt-4 text-[14px] leading-7 text-[var(--ink3)]">
                Add your first document to create a brain. Once you have one, you can rename it, edit the
                description, and generate a public share link.
              </p>
            </section>

            <section className="card card-top-green">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink4)]">
                Public Share URL
              </div>
              <div className="share-url-box">Create a brain to generate a share link.</div>
              <div className="flex flex-wrap gap-2">
                <Link href="/ingest" className="btn btn-primary btn-sm">
                  📥 Go to Ingest
                </Link>
              </div>
            </section>

            <section className="card card-top-orange">
              <div className="toggle-wrap">
                <div>
                  <div className="toggle-label">Public access</div>
                  <div className="toggle-sub">Create a brain first to enable sharing.</div>
                </div>
                <button type="button" className="toggle" disabled aria-disabled="true" />
              </div>
              <div className="border-t border-[var(--border2)] pt-4 text-[13px] leading-7 text-[var(--ink4)]">
                Public links are read-only. They become available after you ingest your first documents.
              </div>
            </section>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
