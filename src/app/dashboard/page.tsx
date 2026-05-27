import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { StatCard } from "@/components/brain/StatCard";
import { WelcomeBanner } from "@/components/brain/WelcomeBanner";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserBrains } from "@/lib/brain";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

type DashboardBrain = {
  id: string | null;
  name: string;
  description: string;
  is_public: boolean;
  share_token: string | null;
  docs_ingested: number;
  concepts_extracted: number;
  queries_answered: number;
};

type DashboardActivityItem = {
  type: "query" | "score" | "ingest";
  label: string;
  preview: string;
  result: string;
  created_at: string;
};

type DashboardData = {
  brain: DashboardBrain;
  activity: DashboardActivityItem[];
  avgImprovement: number | null;
  hasRealBrain: boolean;
};

function emptyDashboardBrain(): DashboardBrain {
  return {
    id: null,
    name: "My Agency Brain",
    description: "A living memory of how this agency thinks and creates.",
    is_public: false,
    share_token: null,
    docs_ingested: 0,
    concepts_extracted: 0,
    queries_answered: 0,
  };
}

async function getDashboardData(brainId: string | null): Promise<DashboardData> {
  if (!brainId) {
    return {
      brain: emptyDashboardBrain(),
      activity: [],
      avgImprovement: null,
      hasRealBrain: false,
    };
  }

  const admin = createSupabaseAdminClient();
  const [brainRes, sourcesRes, queryRes, scoreRes] = await Promise.all([
    admin.from("brains").select("*").eq("id", brainId).maybeSingle(),
    admin.from("raw_sources").select("*").eq("brain_id", brainId).order("created_at", { ascending: false }),
    admin.from("query_log").select("*").eq("brain_id", brainId).order("created_at", { ascending: false }),
    admin.from("score_log").select("*").eq("brain_id", brainId).order("created_at", { ascending: false }),
  ]);

  const brain = brainRes.data;
  if (!brain) {
    return getDashboardData(null);
  }

  const activity = [
    ...(queryRes.data ?? []).map((item) => ({
      type: "query" as const,
      label: "Query",
      preview: item.question,
      result: (item.answer ?? "").replace(/\s+/g, " ").slice(0, 100),
      created_at: item.created_at,
    })),
    ...(scoreRes.data ?? []).map((item) => ({
      type: "score" as const,
      label: "Score",
      preview: item.original_copy,
      result: `${item.score_before} → ${item.score_after}`,
      created_at: item.created_at,
    })),
    ...(sourcesRes.data ?? []).map((item) => ({
      type: "ingest" as const,
      label: "Ingest",
      preview: item.title,
      result: item.client_name,
      created_at: item.created_at,
    })),
  ]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 10);

  const scoreLogs = scoreRes.data ?? [];
  const avgImprovement =
    scoreLogs.length > 0
      ? scoreLogs.reduce((sum, row) => sum + ((row.score_after ?? 0) - (row.score_before ?? 0)), 0) /
        scoreLogs.length
      : null;

  return {
    brain: {
      id: brain.id,
      name: brain.name ?? "My Agency Brain",
      description: brain.description ?? "A living memory of how this agency thinks and creates.",
      is_public: Boolean(brain.is_public),
      share_token: brain.share_token ?? null,
      docs_ingested: brain.docs_ingested ?? 0,
      concepts_extracted: brain.concepts_extracted ?? 0,
      queries_answered: brain.queries_answered ?? 0,
    },
    activity,
    avgImprovement,
    hasRealBrain: true,
  };
}

function greetingNameFromUser(user: { email?: string | null; user_metadata?: Record<string, unknown> }) {
  const metaName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : "";
  if (metaName.trim()) return metaName.trim().split(/\s+/)[0];
  const localPart = (user.email ?? "").split("@")[0] ?? "";
  const normalized = localPart.replace(/[._-]+/g, " ").trim();
  return normalized.split(/\s+/)[0] || "there";
}

function DashboardBannerSection({
  data,
  greetingName,
}: {
  data: DashboardData;
  greetingName: string;
}) {
  const hasContent = data.brain.docs_ingested > 0;

  return (
    <WelcomeBanner
      docsIngested={data.brain.docs_ingested}
      userName={greetingName}
      message={
        hasContent
          ? `Your agency brain is active and ready. ${data.brain.docs_ingested} docs ingested, ${data.brain.concepts_extracted} concept${data.brain.concepts_extracted === 1 ? "" : "s"} extracted.`
          : "Your company brain is empty. Ingest campaigns, briefs, or brand guides to get started."
      }
    />
  );
}

function DashboardStatsSection({ data }: { data: DashboardData }) {
  return (
    <section className="stats-grid mb-6">
      <StatCard
        label="Docs Ingested"
        value={data.brain.docs_ingested}
        iconEmoji="📄"
        accentColor="green"
        subText={data.hasRealBrain ? "+1 this week" : "Start by ingesting"}
      />
      <StatCard
        label="Concepts Extracted"
        value={data.brain.concepts_extracted}
        iconEmoji="🧩"
        accentColor="purple"
        subText={data.hasRealBrain ? `From ${data.brain.docs_ingested} documents` : "From your first ingest"}
      />
      <StatCard
        label="Queries Answered"
        value={data.brain.queries_answered}
        iconEmoji="💬"
        accentColor="blue"
        subText={data.brain.queries_answered > 0 ? "Queries from your brain" : "Ask your first question"}
      />
      <StatCard
        label="Avg Improvement"
        value={data.avgImprovement ?? "—"}
        iconEmoji="⚡"
        accentColor="orange"
        prefix="+"
        suffix=" pts"
        subText={data.avgImprovement !== null ? "Average copy improvement" : "Score copy to see"}
      />
    </section>
  );
}

function DashboardActivitySection({
  data,
  selectedBrainId,
}: {
  data: DashboardData;
  selectedBrainId: string | null;
}) {
  const phaseProgress = Math.min(Math.max(data.brain.docs_ingested * 12, 10), 100);
  const phaseDay = `Day ${Math.max(1, Math.min(7, data.brain.docs_ingested || 1))} · ${new Date().toLocaleDateString(
    "en-US",
    { weekday: "short" }
  )}`;

  return (
    <section className="grid-65-35 mb-6">
      <div className="card">
        <div className="section-header">
          <div>
            <div className="section-title">Recent Activity</div>
            <div className="section-sub">Queries and scores from your brain</div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr>
                <th>Type</th>
                <th>Preview</th>
                <th>Result</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {data.activity.length > 0 ? (
                data.activity.map((item, index) => {
                  const badgeClass =
                    item.type === "query" ? "badge-blue" : item.type === "score" ? "badge-green" : "badge-orange";
                  return (
                    <tr key={`${item.type}-${item.created_at}-${index}`}>
                      <td className="py-4">
                        <span className={`badge ${badgeClass}`}>{item.label}</span>
                      </td>
                      <td className="py-4 pr-4 text-[var(--ink)]">{item.preview.slice(0, 88)}</td>
                      <td className="py-4 pr-4 text-[var(--ink3)]">{item.result || "—"}</td>
                      <td className="py-4 text-[var(--ink3)]">{timeAgo(item.created_at)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state py-10">
                      <div className="empty-icon">🌱</div>
                      <div className="empty-title">No activity yet</div>
                      <div className="empty-sub">Ingest a document or ask your first question to get started.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card">
          <div className="section-title mb-4 text-[16px]">Quick Actions</div>
          <div className="flex flex-col gap-2">
            <Link
              href={selectedBrainId ? `/ingest?brain=${selectedBrainId}` : "/ingest"}
              className="btn btn-primary w-full justify-start"
            >
              📥 Feed Your Brain
            </Link>
            <Link
              href={selectedBrainId ? `/query?brain=${selectedBrainId}` : "/query"}
              className="btn btn-outline w-full justify-start"
            >
              💬 Ask a Question
            </Link>
            <Link
              href={selectedBrainId ? `/score?brain=${selectedBrainId}` : "/score"}
              className="btn btn-outline w-full justify-start"
            >
              ⚡ Score Copy
            </Link>
            <Link
              href={selectedBrainId ? `/share?brain=${selectedBrainId}` : "/share"}
              className="btn btn-outline w-full justify-start"
            >
              🔗 Share Brain
            </Link>
          </div>
        </div>


      </div>
    </section>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { brain?: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const brains = await getUserBrains(user.id);
  const selectedBrain = brains.find((brain) => brain.id === searchParams?.brain) ?? brains[0] ?? null;
  const data = await getDashboardData(selectedBrain?.id ?? null);
  const greetingName = greetingNameFromUser(
    user as unknown as { email?: string | null; user_metadata?: Record<string, unknown> }
  );

  return (
    <AuthLayout userEmail={user.email ?? ""}>
      <div className="page-content">
        <Suspense fallback={<LoadingSkeleton lines={5} height="22px" />}>
          <DashboardBannerSection data={data} greetingName={greetingName} />
        </Suspense>
        <Suspense fallback={<LoadingSkeleton lines={4} height="120px" />}>
          <DashboardStatsSection data={data} />
        </Suspense>
        <Suspense fallback={<LoadingSkeleton lines={6} height="180px" />}>
          <DashboardActivitySection data={data} selectedBrainId={selectedBrain?.id ?? null} />
        </Suspense>
      </div>
    </AuthLayout>
  );
}
