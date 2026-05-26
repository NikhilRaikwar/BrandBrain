import Link from "next/link";
import { redirect } from "next/navigation";
import { Edit3, MessageSquare, Upload, Zap } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { StatCard } from "@/components/brain/StatCard";
import { EditableField } from "@/components/brain/EditableField";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import { formatCurrencyInr, firstWord, timeAgo, formatShortDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createSupabaseAdminClient();

  const [brainRes, queryRes, scoreRes] = await Promise.all([
    admin
      .from("brains")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("query_log")
      .select("*")
      .in(
        "brain_id",
        (await admin.from("brains").select("id").eq("user_id", user.id)).data?.map((row) => row.id) ?? []
      )
      .order("created_at", { ascending: false })
      .limit(10),
    admin
      .from("score_log")
      .select("*")
      .in(
        "brain_id",
        (await admin.from("brains").select("id").eq("user_id", user.id)).data?.map((row) => row.id) ?? []
      )
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const brain = brainRes.data;
  if (!brain) return { user, brain: null, activity: [], avgImprovement: 0 };

  const activity = [
    ...(queryRes.data ?? []).map((item) => ({
      type: "query" as const,
      preview: item.question,
      result: item.answer,
      cost_usd: item.cost_usd ?? 0,
      created_at: item.created_at,
    })),
    ...(scoreRes.data ?? []).map((item) => ({
      type: "score" as const,
      preview: item.original_copy,
      result: `${item.score_before} → ${item.score_after}`,
      cost_usd: item.cost_usd ?? 0,
      created_at: item.created_at,
    })),
  ].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 10);

  const avgImprovement =
    scoreRes.data && scoreRes.data.length > 0
      ? scoreRes.data.reduce((acc, item) => acc + (item.score_after - item.score_before), 0) /
        scoreRes.data.length
      : 0;

  return { user, brain, activity, avgImprovement };
}

export default async function DashboardPage() {
  const { user, brain, activity, avgImprovement } = await getDashboardData();
  if (!brain) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <div className="mx-auto flex min-h-screen max-w-[1100px] items-center justify-center px-4">
          <div className="card max-w-lg">
            <h1 className="font-display text-3xl font-bold text-[var(--white)]">Brain not found</h1>
            <p className="mt-3 text-sm text-[var(--muted)]">
              No agency brain was linked to this account.
            </p>
            <Link href="/signup" className={buttonClassName("primary", "md") + " mt-6 inline-flex"}>
              Create brain
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout userEmail={user.email ?? ""}>
      <div className="space-y-6">
        <section className="card card-purple">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm text-[var(--muted)]">
                Good morning, {firstWord(user.email)} 👋
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <EditableField
                  brainId={brain.id}
                  field="name"
                  value={brain.name}
                  className="font-display text-3xl font-bold text-[var(--white)]"
                />
                <Edit3 className="h-4 w-4 text-[var(--muted)]" />
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                {brain.description}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
              <span className="badge-green">{brain.is_public ? "Public brain" : "Private brain"}</span>
              <span>{formatShortDate(brain.created_at)}</span>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Docs ingested" value={brain.docs_ingested} iconName="upload" accentColor="green" />
          <StatCard
            label="Concepts extracted"
            value={brain.concepts_extracted}
            iconName="brain"
            accentColor="purple"
          />
          <StatCard
            label="Queries answered"
            value={brain.queries_answered}
            iconName="message"
            accentColor="blue"
          />
          <StatCard
            label="Avg improvement"
            value={avgImprovement}
            iconName="zap"
            accentColor="orange"
            prefix="+"
            suffix=" pts"
          />
        </section>

        <section className="card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-[var(--white)]">Recent Activity</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Last queries and scores from the agency brain.
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                <tr>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Preview</th>
                  <th className="pb-3">Result</th>
                  <th className="pb-3">Cost</th>
                  <th className="pb-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((item) => (
                  <tr key={`${item.type}-${item.created_at}`} className="border-t border-[var(--border)]">
                    <td className="py-4">
                      <Badge className={item.type === "query" ? "bg-[rgba(0,229,160,0.1)] text-[var(--accent)]" : "bg-[rgba(255,209,102,0.1)] text-[#ffd166]"}>
                        {item.type === "query" ? "💬 Query" : "⚡ Score"}
                      </Badge>
                    </td>
                    <td className="py-4 pr-4 text-[var(--white)]">
                      {item.preview.slice(0, 90)}
                    </td>
                    <td className="py-4 pr-4 text-[var(--text)]">{item.result.slice(0, 90)}</td>
                    <td className="py-4 text-[var(--muted)]">{formatCurrencyInr(item.cost_usd)}</td>
                    <td className="py-4 text-[var(--muted)]">{timeAgo(item.created_at)}</td>
                  </tr>
                ))}
                {activity.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[var(--muted)]">
                      No activity yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Link className={buttonClassName("primary", "lg") + " w-full"} href="/ingest">
            <Upload className="h-4 w-4" />
            Ingest Document
          </Link>
          <Link className={buttonClassName("outline", "lg") + " w-full"} href="/query">
            <MessageSquare className="h-4 w-4" />
            Query Brain
          </Link>
          <Link className={buttonClassName("outline", "lg") + " w-full"} href="/score">
            <Zap className="h-4 w-4" />
            Score Copy
          </Link>
        </section>

        {brain.docs_ingested <= 3 ? (
          <section className="card card-green">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl border border-[var(--border)] bg-white/5 p-3">👋</div>
              <div>
                <h3 className="font-display text-xl font-bold text-[var(--white)]">
                  Welcome! Your brain has demo data.
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                  Try querying it or ingest your own documents.
                </p>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </AuthLayout>
  );
}
