import type { MetadataRoute } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createSupabaseAdminClient();
  const staticPages = [
    "/",
    "/login",
    "/signup",
    "/brandbrainslides",
    "/dashboard",
    "/ingest",
    "/query",
    "/score",
    "/analytics",
    "/share",
  ].map((path) => ({
    url: new URL(path, siteUrl).toString(),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));

  const { data: publicBrains } = await admin
    .from("brains")
    .select("share_token, created_at")
    .eq("is_public", true);

  const publicBrainPages = (publicBrains ?? [])
    .filter((brain) => Boolean(brain.share_token))
    .map((brain) => ({
      url: new URL(`/b/${brain.share_token}`, siteUrl).toString(),
      lastModified: brain.created_at ? new Date(brain.created_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...staticPages, ...publicBrainPages];
}
