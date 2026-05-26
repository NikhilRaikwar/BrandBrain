import { redirect } from "next/navigation";
import { createSupabaseAdminClient, createSupabaseServerClient } from "./supabase/server";

export async function getCurrentUserOrRedirect() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
}

export async function getCurrentUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

export async function getUserBrain(userId: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("brains").select("*").eq("user_id", userId).order("created_at", {
    ascending: false,
  });
  return data?.[0] ?? null;
}

export async function getUserBrainIds(userId: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("brains").select("id").eq("user_id", userId);
  return data?.map((row) => row.id) ?? [];
}

export async function getBrainByToken(token: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("brains").select("*").eq("share_token", token).eq("is_public", true).maybeSingle();
  return data ?? null;
}

export function buildKnowledgeContext(
  cards: Array<{ concept: string; summary: string; client_name: string; tags?: string[]; title?: string }>
) {
  return cards
    .map((card, index) => {
      const tags = card.tags?.length ? ` | Tags: ${card.tags.join(", ")}` : "";
      return `${index + 1}. [${card.client_name}] ${card.concept}: ${card.summary}${tags}`;
    })
    .join("\n");
}
